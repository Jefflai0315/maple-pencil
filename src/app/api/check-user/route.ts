import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if user exists in the "user" collection
    const existingUser = await db.collection("user").findOne({
      email: email,
    });

    return NextResponse.json({
      exists: !!existingUser,
      user: existingUser || null,
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 }
    );
  }
}
