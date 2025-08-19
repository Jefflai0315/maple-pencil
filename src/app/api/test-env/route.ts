import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = !!process.env.MINIMAX_API_KEY;
  const apiKeyLength = process.env.MINIMAX_API_KEY?.length || 0;

  // Check NextAuth environment variables
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasMongoDBUri = !!process.env.MONGODB_URI;
  const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;

  return NextResponse.json({
    message: "Environment variables check",
    minimax: {
      hasApiKey,
      apiKeyLength,
    },
    nextauth: {
      hasNextAuthSecret,
      hasGoogleClientId,
      hasGoogleClientSecret,
      hasMongoDBUri,
      hasNextAuthUrl,
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
    },
  });
}
