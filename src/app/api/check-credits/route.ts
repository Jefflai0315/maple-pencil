import { NextRequest, NextResponse } from "next/server";
import { requireSessionEmail } from "@/lib/auth";
import { getCredits, spendCredit } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Body: { deduct?: boolean }. The account is always the signed-in user; any
// email in the body is ignored. A deduct returns a `spendId` that the paid AI
// routes (and a refund) require.
export async function POST(request: NextRequest) {
  const email = await requireSessionEmail();
  if (email instanceof NextResponse) return email;

  try {
    const body = await request.json().catch(() => ({}));
    const deduct = body?.deduct === true;

    if (deduct) {
      const result = await spendCredit(email);
      if (!result.ok) {
        return NextResponse.json(
          {
            error: result.reason === "no_user" ? "User not found" : "Insufficient credits",
            credits: result.credits,
          },
          { status: result.reason === "no_user" ? 404 : 400 }
        );
      }
      return NextResponse.json({
        success: true,
        credits: result.credits,
        spendId: result.spendId,
        message: "Credit deducted successfully",
      });
    }

    const credits = await getCredits(email);
    if (credits === null) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, credits, canGenerate: credits >= 1 });
  } catch (error) {
    console.error("Error checking/deducting credits:", error);
    return NextResponse.json({ error: "Failed to check credits" }, { status: 500 });
  }
}
