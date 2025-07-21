import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Test Cloudinary configuration
    const testResult = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
      apiKey: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
      apiSecret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Cloudinary configuration test",
      data: testResult,
    });
  } catch (error) {
    console.error("Cloudinary test error:", error);
    return NextResponse.json(
      { error: "Cloudinary test failed" },
      { status: 500 }
    );
  }
}
