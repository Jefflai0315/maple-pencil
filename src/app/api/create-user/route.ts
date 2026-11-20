import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "../../utils/mongodb";

export const dynamic = "force-dynamic";

// Creates the account for the signed-in Google user (never for an email sent
// in the body).
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, error: "Please sign in first" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const name =
      (typeof body?.name === "string" && body.name.trim().slice(0, 100)) ||
      session?.user?.name ||
      email.split("@")[0];

    const db = await getDb();
    const existingUser = await db.collection("user").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists" }, { status: 409 });
    }

    const newUser = {
      email,
      name,
      level: "user",
      credits: 0,
      boards: ["Sembawang-west"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("user").insertOne(newUser);

    return NextResponse.json({ success: true, data: { id: result.insertedId, ...newUser } });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}
