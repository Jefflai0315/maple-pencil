import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});

interface VideoGenerationTask {
  _id?: ObjectId;
  taskId: string;
  status: "queuing" | "preparing" | "processing" | "success" | "failed";
  fileId?: string;
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

export async function POST(request: NextRequest) {
  try {
    console.log("Video generation API called");

    // Check if API key is configured
    if (!process.env.MINIMAX_API_KEY) {
      console.error("MINIMAX_API_KEY not configured");
      return NextResponse.json(
        { error: "MiniMax API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      imageUrl,
      prompt,
      userDetails,
      model = "MiniMax-Hailuo-02",
      duration = 6,
      resolution = "1080P",
    } = body;

    console.log("Request body:", {
      hasImageUrl: !!imageUrl,
      imageUrlLength: imageUrl?.length,
      prompt,
      userDetails,
    });

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!userDetails?.name) {
      return NextResponse.json(
        { error: "User name is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db("mural-app");
    const videoTasksCollection = db.collection("video-generation-tasks");

    // Convert image URL to base64 if it's a data URL
    let base64Image = imageUrl;
    if (imageUrl.startsWith("data:")) {
      base64Image = imageUrl.split(",")[1];
    } else if (imageUrl.startsWith("http")) {
      // Fetch image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      base64Image = Buffer.from(imageBuffer).toString("base64");
    }

    // Prepare payload for MiniMax API - Optimized for speed and 768P
    const payload = {
      model: "MiniMax-Hailuo-02", // Fastest model
      prompt:
        prompt || "Create a quick artistic video with smooth camera movements",
      first_frame_image: `data:image/jpeg;base64,${base64Image}`,
      duration: 6, // Shortest duration for speed
      resolution: "768P", // 768P for speed
      prompt_optimizer: false, // Disable for faster processing
    };

    // Call MiniMax API - No webhook needed for Vercel free tier
    const minimaxResponse = await fetch(
      "https://api.minimax.io/v1/video_generation",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log(
      "Calling MiniMax API with payload size:",
      JSON.stringify(payload).length
    );

    if (!minimaxResponse.ok) {
      const errorData = await minimaxResponse.text();
      console.error("MiniMax API error:", errorData);
      console.error("MiniMax API status:", minimaxResponse.status);

      // Create a failed task record for API errors
      const failedTask: VideoGenerationTask = {
        taskId: `failed_${Date.now()}`,
        status: "failed",
        imageUrl,
        prompt,
        model,
        duration,
        resolution,
        userDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
        errorMessage: `MiniMax API error: ${minimaxResponse.status} - ${errorData}`,
      };

      await videoTasksCollection.insertOne(failedTask);
      console.log(
        "Failed task stored in database for API error:",
        failedTask.taskId
      );

      return NextResponse.json(
        {
          success: false,
          taskId: failedTask.taskId,
          error: `MiniMax API error: ${minimaxResponse.status} - ${errorData}`,
        },
        { status: 500 }
      );
    }

    const minimaxData = await minimaxResponse.json();
    console.log("MiniMax API response:", minimaxData);

    const taskId = minimaxData.task_id;
    console.log("Extracted taskId:", taskId);

    if (!taskId) {
      console.error("No taskId received from MiniMax API");

      // Create a failed task record in database
      const failedTask: VideoGenerationTask = {
        taskId: `failed_${Date.now()}`, // Generate a unique ID for failed tasks
        status: "failed",
        imageUrl,
        prompt,
        model,
        duration,
        resolution,
        userDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
        errorMessage:
          minimaxData.base_resp?.status_msg ||
          "No task ID received from MiniMax API",
      };

      await videoTasksCollection.insertOne(failedTask);
      console.log("Failed task stored in database with ID:", failedTask.taskId);

      // Check if it's a balance issue
      if (minimaxData.base_resp?.status_code === 1008) {
        return NextResponse.json(
          {
            success: false,
            taskId: failedTask.taskId,
            error:
              "Insufficient MiniMax account balance. Please add credits to your MiniMax account.",
          },
          { status: 402 } // Payment Required
        );
      }

      return NextResponse.json(
        {
          success: false,
          taskId: failedTask.taskId,
          error: "No task ID received from MiniMax API",
        },
        { status: 500 }
      );
    }

    // Store task in database
    const videoTask: VideoGenerationTask = {
      taskId,
      status: "queuing",
      imageUrl,
      prompt,
      model,
      duration,
      resolution,
      userDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await videoTasksCollection.insertOne(videoTask);
    console.log("Task stored in database with ID:", taskId);

    return NextResponse.json({
      success: true,
      taskId,
      message: "Video generation task created successfully",
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: "Failed to create video generation task" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    console.log("Status check requested for taskId:", taskId);

    if (!taskId) {
      console.error("No taskId provided in status check");
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db("mural-app");
    const videoTasksCollection = db.collection("video-generation-tasks");

    // Get task from database
    const task = await videoTasksCollection.findOne({ taskId });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // If task is still processing, check with MiniMax API
    if (
      task.status === "queuing" ||
      task.status === "preparing" ||
      task.status === "processing"
    ) {
      try {
        const minimaxResponse = await fetch(
          `https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
            },
          }
        );

        if (minimaxResponse.ok) {
          const minimaxData = await minimaxResponse.json();
          const newStatus = minimaxData.status.toLowerCase();

          // Update status in database
          const updateData: Partial<VideoGenerationTask> = {
            status: newStatus as VideoGenerationTask["status"],
            updatedAt: new Date(),
          };

          if (newStatus === "success" && minimaxData.file_id) {
            updateData.fileId = minimaxData.file_id;

            // Get download URL
            try {
              const downloadResponse = await fetch(
                `https://api.minimax.io/v1/files/retrieve?file_id=${minimaxData.file_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
                  },
                }
              );

              if (downloadResponse.ok) {
                const downloadData = await downloadResponse.json();
                updateData.downloadUrl = downloadData.file.download_url;
              }
            } catch (downloadError) {
              console.error("Failed to get download URL:", downloadError);
            }
          } else if (newStatus === "fail") {
            updateData.errorMessage = "Video generation failed";
          }

          await videoTasksCollection.updateOne(
            { taskId },
            { $set: updateData }
          );

          return NextResponse.json({
            success: true,
            task: { ...task, ...updateData },
          });
        }
      } catch (apiError) {
        console.error("Failed to check MiniMax API status:", apiError);
      }
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get video generation status error:", error);
    return NextResponse.json(
      { error: "Failed to get video generation status" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
