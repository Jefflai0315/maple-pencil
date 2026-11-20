import { NextRequest, NextResponse } from "next/server";
import { requireSessionEmail } from "@/lib/auth";
import { refundSpend } from "@/lib/credits";

export const dynamic = "force-dynamic";

// Body: { spendId }. Gives back the credit taken for a generation that failed,
// once, and only for the signed-in user's own spend.
export async function POST(request: NextRequest) {
  const email = await requireSessionEmail();
  if (email instanceof NextResponse) return email;

  try {
    const body = await request.json().catch(() => ({}));
    const credits = await refundSpend(body?.spendId, email);
    if (credits === null) {
      return NextResponse.json(
        { error: "Nothing to refund for this request" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, credits, message: "Credit restored" });
  } catch (error) {
    console.error("Error restoring credits:", error);
    return NextResponse.json({ error: "Failed to restore credits" }, { status: 500 });
  }
}
