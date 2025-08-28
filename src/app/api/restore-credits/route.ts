import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, amount = 1 } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Restore specified amount of credits
    const result = await db
      .collection("user")
      .updateOne({ email }, { $inc: { credits: amount } });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to restore credits" },
        { status: 500 }
      );
    }

    // Get updated user data
    const user = await db.collection("user").findOne({ email });
    const currentCredits = user?.credits || 0;

    return NextResponse.json({
      success: true,
      credits: currentCredits,
      message: `Credits restored successfully`,
    });
  } catch (error) {
    console.error("Error restoring credits:", error);
    return NextResponse.json(
      { error: "Failed to restore credits" },
      { status: 500 }
    );
  }
}
