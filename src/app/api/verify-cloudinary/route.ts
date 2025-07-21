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
    const config = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
      apiSecret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
    };

    // Test folder access
    let folderTest = "❌ Failed";
    try {
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: "mural-app/",
        max_results: 1,
      });
      folderTest = `✅ Found ${result.resources.length} items in mural-app folder`;
    } catch (folderError) {
      folderTest = `⚠️ Folder test failed: ${folderError}`;
    }

    const verification = {
      config,
      folderTest,
      timestamp: new Date().toISOString(),
      dashboardUrl: "https://cloudinary.com/console",
      instructions: [
        "1. Check console logs during upload",
        "2. Visit Cloudinary dashboard",
        "3. Look in 'mural-app' folder",
        "4. Verify image URLs work in browser",
      ],
    };

    return NextResponse.json({
      success: true,
      message: "Cloudinary verification",
      data: verification,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
