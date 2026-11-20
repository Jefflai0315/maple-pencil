import { ObjectId } from "mongodb";
import { getDb } from "@/app/utils/mongodb";

// Credits are spent and refunded on the server only. Spending 1 credit
// creates a "spend" record; a paid AI route must be given that spend's id and
// claims it before doing any work, so nobody can call the AI routes for free.
// A failed generation can be refunded once, using the same id.

const SPEND_TTL_MS = 30 * 60 * 1000; // a spend must be used within 30 minutes
const MAX_USES = 2; // primary provider + one fallback provider

interface SpendDoc {
  _id: ObjectId;
  email: string;
  at: Date;
  uses: number;
  succeeded: boolean;
  refunded: boolean;
}

function toObjectId(id: unknown): ObjectId | null {
  return typeof id === "string" && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function getCredits(email: string): Promise<number | null> {
  const db = await getDb();
  const user = await db.collection("user").findOne({ email }, { projection: { credits: 1 } });
  return user ? Number(user.credits) || 0 : null;
}

/** Takes 1 credit atomically. Returns the spend id, or why it failed. */
export async function spendCredit(
  email: string
): Promise<
  | { ok: true; spendId: string; credits: number }
  | { ok: false; reason: "no_user" | "no_credits"; credits: number }
> {
  const db = await getDb();
  const updated = await db
    .collection("user")
    .findOneAndUpdate(
      { email, credits: { $gte: 1 } },
      { $inc: { credits: -1 } },
      { returnDocument: "after", projection: { credits: 1 } }
    );
  if (!updated) {
    const credits = await getCredits(email);
    return credits === null
      ? { ok: false, reason: "no_user", credits: 0 }
      : { ok: false, reason: "no_credits", credits };
  }
  const spend: Omit<SpendDoc, "_id"> = {
    email,
    at: new Date(),
    uses: 0,
    succeeded: false,
    refunded: false,
  };
  const { insertedId } = await db.collection("credit_spends").insertOne(spend);
  return { ok: true, spendId: insertedId.toHexString(), credits: Number(updated.credits) || 0 };
}

/** Claims a spend for one paid AI call. False if missing, expired, used up or refunded. */
export async function claimSpend(spendId: unknown, email: string): Promise<boolean> {
  const _id = toObjectId(spendId);
  if (!_id) return false;
  const db = await getDb();
  const claimed = await db.collection<SpendDoc>("credit_spends").findOneAndUpdate(
    {
      _id,
      email,
      refunded: false,
      succeeded: false,
      uses: { $lt: MAX_USES },
      at: { $gt: new Date(Date.now() - SPEND_TTL_MS) },
    },
    { $inc: { uses: 1 } }
  );
  return Boolean(claimed);
}

/** Marks a spend as delivered, so it can no longer be refunded or reused. */
export async function markSpendSucceeded(spendId: unknown): Promise<void> {
  const _id = toObjectId(spendId);
  if (!_id) return;
  const db = await getDb();
  await db.collection<SpendDoc>("credit_spends").updateOne({ _id }, { $set: { succeeded: true } });
}

/** Gives the credit back once, only for the owner's own spend that didn't succeed. */
export async function refundSpend(spendId: unknown, email: string): Promise<number | null> {
  const _id = toObjectId(spendId);
  if (!_id) return null;
  const db = await getDb();
  const spend = await db
    .collection<SpendDoc>("credit_spends")
    .findOneAndUpdate(
      { _id, email, refunded: false, succeeded: false },
      { $set: { refunded: true } }
    );
  if (!spend) return null;
  const user = await db
    .collection("user")
    .findOneAndUpdate(
      { email },
      { $inc: { credits: 1 } },
      { returnDocument: "after", projection: { credits: 1 } }
    );
  return user ? Number(user.credits) || 0 : null;
}
