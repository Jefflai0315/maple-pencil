import { NextResponse } from "next/server";
import { requireSessionEmail } from "@/lib/auth";
import { getDb } from "../../utils/mongodb";

export const dynamic = "force-dynamic";

// Whether the signed-in user has an account. Only ever answers for the
// signed-in user, and only returns non-sensitive fields.
export async function POST() {
  const email = await requireSessionEmail();
  if (email instanceof NextResponse) return email;

  try {
    const db = await getDb();
    const user = await db
      .collection("user")
      .findOne({ email }, { projection: { _id: 0, name: 1, credits: 1, level: 1 } });

    return NextResponse.json({ exists: !!user, user: user || null });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ error: "Failed to check user" }, { status: 500 });
  }
}
