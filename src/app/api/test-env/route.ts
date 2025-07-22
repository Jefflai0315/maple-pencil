import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = !!process.env.MINIMAX_API_KEY;
  const apiKeyLength = process.env.MINIMAX_API_KEY?.length || 0;

  return NextResponse.json({
    hasApiKey,
    apiKeyLength,
    message: hasApiKey
      ? "MiniMax API key is configured"
      : "MiniMax API key is NOT configured",
  });
}
