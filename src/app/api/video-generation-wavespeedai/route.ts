import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import cloudinary from "cloudinary";

const uri = process.env.MONGODB_URI;
const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;

if (!uri) throw new Error("Please add your Mongo URI to .env");
if (!WAVESPEED_API_KEY)
  throw new Error("Please add your Wavespeed API key to .env");

const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});

interface VideoGenerationTask {
  taskId: string;
  status: "queuing" | "processing" | "success" | "failed";
  downloadUrl?: string;
  imageUrl: string;
  prompt?: string;
  model: string;
  duration: number;
  resolution: string;
  userDetails: {
    name: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload to Cloudinary
async function uploadToCloudinary(
  url: string,
  resource_type: "image" | "video"
) {
  return await cloudinary.v2.uploader.upload(url, {
    resource_type,
    folder: "mural-app",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, prompt, userDetails } = body;
    if (!imageUrl || !userDetails?.name) {
      return NextResponse.json(
        { error: "Missing imageUrl or userDetails.name" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("mural-app");
    const videoTasksCollection = db.collection("video-generation-tasks");

    // Create initial task in DB
    const now = new Date();
    const initialTask: VideoGenerationTask = {
      taskId: `wavespeedai_${Date.now()}`,
      status: "queuing",
      imageUrl,
      prompt,
      model: "wavespeedai",
      duration: 5,
      resolution: "480P",
      userDetails,
      createdAt: now,
      updatedAt: now,
    };
    await videoTasksCollection.insertOne(initialTask);
    const taskId = initialTask.taskId;

    // Prepare payload for WavespeedAI
    const apiUrl =
      "https://api.wavespeed.ai/api/v3/bytedance/seedance-v1-lite-i2v-480p";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WAVESPEED_API_KEY}`,
    };
    const payload = {
      duration: 5,
      image: imageUrl,
      prompt:
        prompt || "Create a quick artistic video with smooth camera movements",
      seed: -1,
    };

    // Call WavespeedAI
    let requestId = "";
    let downloadUrl = "";
    let errorMessage = "";
    let status: VideoGenerationTask["status"] = "processing";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        errorMessage = await response.text();
        status = "failed";
      } else {
        const result = await response.json();
        requestId = result.data.id;
        status = "processing";
      }
    } catch (err) {
      errorMessage = `WavespeedAI request error: ${
        err instanceof Error ? err.message : String(err)
      }`;
      status = "failed";
    }

    // Update DB with requestId and status
    await videoTasksCollection.updateOne(
      { taskId },
      { $set: { status, updatedAt: new Date(), errorMessage, requestId } }
    );

    // If failed, return
    if (status === "failed") {
      return NextResponse.json(
        { success: false, taskId, error: errorMessage },
        { status: 500 }
      );
    }

    // Poll for result
    let pollStatus = "created";
    let pollCount = 0;
    while (["created", "processing", "queued"].includes(pollStatus)) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      pollCount++;
      const pollRes = await fetch(
        `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`,
        { headers: { Authorization: `Bearer ${WAVESPEED_API_KEY}` } }
      );
      const pollData = await pollRes.json();
      // Log the full poll response for debugging
      console.log("WavespeedAI poll response:", JSON.stringify(pollData));
      if (!pollRes.ok) {
        errorMessage = JSON.stringify(pollData);
        pollStatus = "failed";
        break;
      }
      pollStatus = pollData.data.status;
      if (pollStatus === "completed") {
        // Defensive: log and check outputs
        if (pollData.data.outputs && pollData.data.outputs.length > 0) {
          downloadUrl = pollData.data.outputs[0];
          status = "success";
        } else {
          errorMessage =
            "No outputs found in WavespeedAI response: " +
            JSON.stringify(pollData);
          status = "failed";
        }
        break;
      } else if (pollStatus === "failed") {
        errorMessage = pollData.data.error || "WavespeedAI task failed";
        status = "failed";
        break;
      }
      // Optionally update status in DB every few polls
      if (pollCount % 3 === 0) {
        await videoTasksCollection.updateOne(
          { taskId },
          { $set: { status: pollStatus, updatedAt: new Date() } }
        );
      }
    }

    // Final DB update
    await videoTasksCollection.updateOne(
      { taskId },
      {
        $set: {
          status,
          updatedAt: new Date(),
          downloadUrl,
          errorMessage,
        },
      }
    );

    let cloudinaryVideoUrl = "";
    let cloudinaryImageUrl = "";

    if (status === "success") {
      // Try to upload video to Cloudinary
      try {
        const videoUploadResult = await uploadToCloudinary(
          downloadUrl,
          "video"
        );
        cloudinaryVideoUrl = videoUploadResult.secure_url;
      } catch (err) {
        errorMessage +=
          " | Cloudinary video upload failed: " +
          (err instanceof Error ? err.message : String(err));
        // Fallback: use original downloadUrl
        cloudinaryVideoUrl = downloadUrl;
        console.error(
          "Cloudinary video upload failed, using fallback URL:",
          downloadUrl
        );
      }

      // Upload image to Cloudinary if not already a Cloudinary URL
      if (!imageUrl.includes("cloudinary.com")) {
        try {
          const imageUploadResult = await uploadToCloudinary(imageUrl, "image");
          cloudinaryImageUrl = imageUploadResult.secure_url;
        } catch (err) {
          errorMessage +=
            " | Cloudinary image upload failed: " +
            (err instanceof Error ? err.message : String(err));
          // Fallback: use original imageUrl
          cloudinaryImageUrl = imageUrl;
          console.error(
            "Cloudinary image upload failed, using fallback URL:",
            imageUrl
          );
        }
      } else {
        cloudinaryImageUrl = imageUrl;
      }
    }

    // Update MongoDB with Cloudinary URLs and status
    await videoTasksCollection.updateOne(
      { taskId },
      {
        $set: {
          status,
          updatedAt: new Date(),
          downloadUrl,
          cloudinaryVideoUrl,
          cloudinaryImageUrl,
          errorMessage,
        },
      }
    );

    // If successful, insert into mural-items collection
    if (status === "success") {
      const muralItemsCollection = db.collection("mural-items");
      const muralItem = {
        imageUrl: cloudinaryImageUrl,
        videoUrl: cloudinaryVideoUrl, // will be Cloudinary or fallback
        gridPosition: null, // Set this as needed, or let frontend assign
        timestamp: new Date().toISOString(),
        userDetails,
        metadata: {
          originalTaskId: taskId,
          prompt,
          model: "wavespeedai",
          duration: 5,
          resolution: "480P",
        },
      };
      await muralItemsCollection.insertOne(muralItem);
    }

    await client.close();
    if (status === "success") {
      return NextResponse.json({
        success: true,
        taskId,
        downloadUrl,
        cloudinaryVideoUrl,
        cloudinaryImageUrl,
      });
    } else {
      return NextResponse.json(
        { success: false, taskId, error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    await client.close();
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
