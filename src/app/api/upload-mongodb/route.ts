import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { MongoClient, ObjectId } from "mongodb";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connection with simplified options
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});

interface MuralItem {
  _id?: ObjectId;
  imageUrl: string;
  videoUrl: string;
  gridPosition: number;
  timestamp: string;
  userDetails: {
    name: string;
    description: string;
    sessionId?: string;
    userId?: string;
    ipAddress?: string;
  };
  metadata?: {
    originalFileName: string;
    fileSize: number;
    uploadSource: "camera" | "file" | "drag-drop";
    browserInfo?: string;
  };
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
                { width: 800, height: 600, crop: "limit" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                console.log("✅ Cloudinary upload successful!");
                console.log("🔗 URL:", result?.secure_url);
                resolve(result as { secure_url: string });
              }
            }
          )
          .end(buffer);
      }
    );

    // Connect to MongoDB with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
        break;
      } catch (error) {
        retries--;
        console.log(
          `❌ MongoDB connection attempt failed, retries left: ${retries}`
        );
        if (retries === 0) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const db = client.db("mural-app");
    const collection = db.collection("mural-items");

    // Get next grid position
    const count = await collection.countDocuments();

    // Create new item
    const newItem: MuralItem = {
      imageUrl: result.secure_url,
      videoUrl: videoUrl || "video-placeholder",
      gridPosition: count, // Sequential positioning
      timestamp: new Date().toISOString(),
      userDetails: {
        name: name || "Anonymous",
        description: description || "",
        sessionId: `session_${Date.now()}`,
        ipAddress: ipAddress,
      },
      metadata: {
        originalFileName: file.name,
        fileSize: file.size,
        uploadSource: uploadSource as "camera" | "file" | "drag-drop",
        browserInfo: userAgent,
      },
    };

    // Save to MongoDB
    const insertResult = await collection.insertOne(newItem);
    newItem._id = insertResult.insertedId;

    console.log("💾 Saved to MongoDB:", {
      id: insertResult.insertedId,
      name: newItem.userDetails.name,
      uploadSource: newItem.metadata?.uploadSource,
    });

    await client.close();

    return NextResponse.json({
      success: true,
      data: newItem,
      message: "Upload successful",
      cloudinaryUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    await client.close();
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Connect to MongoDB with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
        break;
      } catch (error) {
        retries--;
        console.log(
          `❌ MongoDB connection attempt failed, retries left: ${retries}`
        );
        if (retries === 0) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const db = client.db("mural-app");
    const collection = db.collection("mural-items");

    // Get all items
    const items = await collection.find({}).sort({ timestamp: -1 }).toArray();

    console.log("📊 Fetched", items.length, "items from MongoDB");

    await client.close();

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    await client.close();
    return NextResponse.json(
      { error: "Failed to fetch mural items" },
      { status: 500 }
    );
  }
}
