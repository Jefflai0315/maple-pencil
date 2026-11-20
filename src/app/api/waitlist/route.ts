import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const existing = await db.collection("waitlist").findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You're already on the list!",
        alreadyJoined: true,
      });
    }

    await db.collection("waitlist").insertOne({
      email: normalizedEmail,
      source: source || "app-landing",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "You're on the list! We'll email you when Pro launches.",
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
