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
  fallbackVideoUrl?: string; // Add fallback video URL if Cloudinary fails
  cloudinaryVideoUrl?: string; // Store Cloudinary video URL if available
  gridPosition: number;
  timestamp: string;
  userDetails: {
    name: string;
    description: string;
    email: string; // Add email field
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
  let clientConnected = false;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const videoUrlFromForm = formData.get("videoUrl") as string;
    const uploadSource = (formData.get("uploadSource") as string) || "file";
    const userEmail = formData.get("userEmail") as string;
    const muralItemId = formData.get("muralItemId") as string; // Get the mural item ID from client

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

    let imageUrl = "";
    let videoUrl = "";
    let fallbackVideoUrl = "";
    let usedCloudinary = false;

    // Try Cloudinary upload first for image
    try {
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
                  console.log("✅ Cloudinary image upload successful!");
                  console.log("🔗 Image URL:", result?.secure_url);
                  resolve(result as { secure_url: string });
                }
              }
            )
            .end(buffer);
        }
      );
      imageUrl = result.secure_url;
      usedCloudinary = true;
    } catch (cloudinaryError) {
      // If Cloudinary fails, use fallback
      console.error(
        "Cloudinary image upload failed, using fallback.",
        cloudinaryError
      );
      imageUrl = ""; // You may want to set a fallback image URL here if you have one
      usedCloudinary = false;
    }

    // Try to upload video to Cloudinary if we have a video URL
    if (videoUrlFromForm && videoUrlFromForm !== "video-placeholder") {
      try {
        // Check if it's already a Cloudinary URL
        if (videoUrlFromForm.includes("cloudinary.com")) {
          videoUrl = videoUrlFromForm;
          console.log("✅ Video already on Cloudinary:", videoUrl);
        } else {
          // Try to upload the video to Cloudinary
          console.log("🔄 Attempting to upload video to Cloudinary...");

          // For external video URLs, we can use Cloudinary's upload by URL feature
          const videoResult = await new Promise<{ secure_url: string }>(
            (resolve, reject) => {
              cloudinary.uploader.upload(
                videoUrlFromForm,
                {
                  folder: "mural-app/videos",
                  resource_type: "video",
                  transformation: [
                    { width: 800, height: 600, crop: "limit" },
                    { quality: "auto" },
                  ],
                },
                (error, result) => {
                  if (error) {
                    console.error("Cloudinary video upload error:", error);
                    reject(error);
                  } else {
                    console.log("✅ Cloudinary video upload successful!");
                    console.log("🔗 Video URL:", result?.secure_url);
                    resolve(result as { secure_url: string });
                  }
                }
              );
            }
          );
          videoUrl = videoResult.secure_url;
          console.log("✅ Video uploaded to Cloudinary:", videoUrl);
        }
      } catch (videoError) {
        console.error("Failed to upload video to Cloudinary:", videoError);
        // Fallback to original video URL
        videoUrl = videoUrlFromForm;
        fallbackVideoUrl = videoUrlFromForm;
      }
    } else {
      videoUrl = "video-placeholder";
    }

    // Connect to MongoDB with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await client.connect();
        clientConnected = true;
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

    // If we have a muralItemId from the client, use it to find and update the existing item
    let existingItem = null;

    if (muralItemId) {
      console.log("🔍 Looking for existing mural item with ID:", muralItemId);

      try {
        existingItem = await collection.findOne({
          _id: new ObjectId(muralItemId),
        });

        if (existingItem) {
          console.log(
            "✅ Found existing mural item, will update with grid position and user details"
          );
        } else {
          console.log("❌ Mural item with ID not found, will create new item");
        }
      } catch (error) {
        console.log(
          "❌ Invalid mural item ID format:",
          error instanceof Error ? error.message : String(error)
        );
        existingItem = null;
      }
    } else {
      console.log("🆕 No mural item ID provided, will create new item");
    }

    let newItem: MuralItem;
    let isUpdate = false;

    if (existingItem) {
      // Update existing item with grid position and user details
      console.log(
        "🔄 Found existing mural item, updating with grid position and user details"
      );

      // Get next available grid position
      const items = await collection
        .find({}, { projection: { gridPosition: 1 } })
        .toArray();
      const usedPositions = new Set(
        items
          .map((item) => item.gridPosition)
          .filter((pos) => typeof pos === "number" && !isNaN(pos))
      );
      let nextPosition = 0;
      while (usedPositions.has(nextPosition)) {
        nextPosition++;
      }

      // Update the existing item
      const updateResult = await collection.updateOne(
        { _id: existingItem._id },
        {
          $set: {
            gridPosition: nextPosition,
            userDetails: {
              name: name || "Anonymous",
              description: description || "",
              email: userEmail || "",
              sessionId: `session_${Date.now()}`,
              ipAddress: ipAddress,
            },
            metadata: {
              originalFileName: file.name,
              fileSize: file.size,
              uploadSource: uploadSource as "camera" | "file" | "drag-drop",
              browserInfo: userAgent,
            },
            // Update timestamp to reflect when it was added to mural
            timestamp: new Date().toISOString(),
          },
        }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error("Failed to update existing mural item");
      }

      // Get the updated item
      const updatedItem = await collection.findOne({ _id: existingItem._id });
      if (!updatedItem) {
        throw new Error("Failed to retrieve updated mural item");
      }

      newItem = updatedItem as MuralItem;
      isUpdate = true;
      console.log("✅ Successfully updated existing mural item");
    } else {
      // Create new item if no existing item found
      console.log("🆕 No existing mural item found, creating new one");

      // Get next available grid position
      const items = await collection
        .find({}, { projection: { gridPosition: 1 } })
        .toArray();
      const usedPositions = new Set(
        items
          .map((item) => item.gridPosition)
          .filter((pos) => typeof pos === "number" && !isNaN(pos))
      );
      let nextPosition = 0;
      while (usedPositions.has(nextPosition)) {
        nextPosition++;
      }

      // Create new item
      newItem = {
        imageUrl,
        videoUrl,
        fallbackVideoUrl: fallbackVideoUrl || undefined,
        cloudinaryVideoUrl: videoUrl.includes("cloudinary.com")
          ? videoUrl
          : undefined,
        gridPosition: nextPosition,
        timestamp: new Date().toISOString(),
        userDetails: {
          name: name || "Anonymous",
          description: description || "",
          email: userEmail || "",
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
    }

    console.log("💾 Saved to MongoDB:", {
      id: newItem._id,
      name: newItem.userDetails.name,
      uploadSource: newItem.metadata?.uploadSource,
      usedCloudinary,
      isUpdate: isUpdate ? "✅ Updated existing" : "🆕 Created new",
      imageUrl: imageUrl ? "✅ Cloudinary" : "❌ Fallback",
      videoUrl: videoUrl.includes("cloudinary.com")
        ? "✅ Cloudinary"
        : "❌ External",
    });

    if (clientConnected) await client.close();

    return NextResponse.json({
      success: true,
      data: newItem,
      message: isUpdate
        ? `Mural item updated successfully (${
            usedCloudinary ? "Cloudinary" : "Fallback"
          })`
        : `New mural item created successfully (${
            usedCloudinary ? "Cloudinary" : "Fallback"
          })`,
      isUpdate,
      cloudinaryImageUrl: imageUrl,
      cloudinaryVideoUrl: videoUrl.includes("cloudinary.com")
        ? videoUrl
        : undefined,
      fallbackVideoUrl: fallbackVideoUrl || undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    if (clientConnected) await client.close();
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
