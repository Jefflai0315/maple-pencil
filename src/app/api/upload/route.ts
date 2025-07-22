import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { db } from "../../utils/database";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const videoUrl = formData.get("videoUrl") as string;

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = join(uploadsDir, fileName);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate image URL
    const imageUrl = `/uploads/${fileName}`;

    // Use provided video URL or generate placeholder
    const finalVideoUrl = videoUrl || `/uploads/${timestamp}_video.mp4`;

    // Create upload data and store in database
    const uploadData = await db.addItem({
      imageUrl,
      videoUrl: finalVideoUrl,
      timestamp: new Date().toISOString(),
      userDetails: {
        name: name || "Anonymous",
        description: description || "",
      },
    });

    return NextResponse.json({
      success: true,
      data: uploadData,
      message: "Upload successful",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return all mural items from database
    const items = await db.getAllItems();
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
