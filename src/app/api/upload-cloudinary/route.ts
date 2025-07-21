import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Simple file-based database for mural items
const DB_PATH = join(process.cwd(), "data", "cloudinary-mural-items.json");

interface MuralItem {
  id: string;
  imageUrl: string;
  videoUrl: string;
  gridPosition: number;
  timestamp: string;
  userDetails: {
    name: string;
    description: string;
    sessionId?: string; // Track user sessions
    userId?: string; // For future user accounts
    ipAddress?: string; // Track upload source
  };
  metadata?: {
    originalFileName: string;
    fileSize: number;
    uploadSource: "camera" | "file" | "drag-drop";
    browserInfo?: string;
  };
}

async function loadMuralItems(): Promise<MuralItem[]> {
  try {
    const dataDir = join(process.cwd(), "data");
    await mkdir(dataDir, { recursive: true });

    const data = await readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.items || [];
  } catch {
    return [];
  }
}

async function saveMuralItems(items: MuralItem[]): Promise<void> {
  try {
    const data = { items, nextGridPosition: items.length };
    await writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to save mural items:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const uploadSource = (formData.get("uploadSource") as string) || "file";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get client information
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Upload to Cloudinary
    console.log("Starting Cloudinary upload...");
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "mural-app",
              resource_type: "auto",
              transformation: [
                { width: 800, height: 600, crop: "limit" }, // Resize for web
                { quality: "auto" }, // Auto-optimize
              ],
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                console.log("✅ Cloudinary upload successful!");
                console.log("📁 Folder: mural-app");
                console.log("🔗 URL:", result?.secure_url);
                console.log("📊 Size:", result?.bytes, "bytes");
                resolve(result as { secure_url: string });
              }
            }
          )
          .end(buffer);
      }
    );

    console.log("🎉 Image uploaded to Cloudinary:", result.secure_url);
    console.log(
      "📊 Check your Cloudinary dashboard: https://cloudinary.com/console"
    );
    console.log("📁 Look in the 'mural-app' folder");

    // Load existing items and add new one
    const existingItems = await loadMuralItems();
    const newItem: MuralItem = {
      id: Date.now().toString(),
      imageUrl: result.secure_url,
      videoUrl: videoUrl || "video-placeholder",
      gridPosition: existingItems.length, // Simple sequential positioning
      timestamp: new Date().toISOString(),
      userDetails: {
        name: name || "Anonymous",
        description: description || "",
        sessionId: `session_${Date.now()}`, // Simple session tracking
        ipAddress: ipAddress,
      },
      metadata: {
        originalFileName: file.name,
        fileSize: file.size,
        uploadSource: uploadSource as "camera" | "file" | "drag-drop",
        browserInfo: userAgent,
      },
    };

    // Add to database
    existingItems.push(newItem);
    await saveMuralItems(existingItems);

    console.log("💾 Saved to database with user details:", {
      name: newItem.userDetails.name,
      sessionId: newItem.userDetails.sessionId,
      uploadSource: newItem.metadata?.uploadSource,
      fileSize: newItem.metadata?.fileSize,
    });

    return NextResponse.json({
      success: true,
      data: newItem,
      message: "Upload successful",
      cloudinaryUrl: result.secure_url,
      dashboardUrl: "https://cloudinary.com/console",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Load real mural items from database
    const items = await loadMuralItems();

    console.log("Fetched mural items:", items);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mural items" },
      { status: 500 }
    );
  }
}
