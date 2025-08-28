import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, deduct = false } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find the user
    const user = await db.collection("user").findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCredits = user.credits || 0;

    if (deduct) {
      if (currentCredits < 1) {
        return NextResponse.json(
          { error: "Insufficient credits", credits: currentCredits },
          { status: 400 }
        );
      }

      // Deduct 1 credit
      const result = await db
        .collection("user")
        .updateOne({ email }, { $inc: { credits: -1 } });

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: "Failed to deduct credits" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        credits: currentCredits - 1,
        message: "Credit deducted successfully",
      });
    }

    // Just return current credits
    return NextResponse.json({
      success: true,
      credits: currentCredits,
      canGenerate: currentCredits >= 1,
    });
  } catch (error) {
    console.error("Error checking/deducting credits:", error);
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
}
