import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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

interface CallbackData {
  challenge?: string;
  task_id?: string;
  status?: string;
  file_id?: string;
  base_resp?: {
    status_code: number;
    status_msg: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CallbackData = await request.json();

    // Handle verification request
    if (body.challenge) {
      return NextResponse.json({ challenge: body.challenge });
    }

    // Handle status update callback
    if (body.task_id && body.status) {
      await client.connect();
      const db = client.db("mural-app");
      const videoTasksCollection = db.collection("video-generation-tasks");

      const updateData: {
        status: string;
        updatedAt: Date;
        fileId?: string;
        downloadUrl?: string;
        errorMessage?: string;
      } = {
        status: body.status.toLowerCase(),
        updatedAt: new Date(),
      };

      if (body.status === "Success" && body.file_id) {
        updateData.fileId = body.file_id;

        // Get download URL
        try {
          const downloadResponse = await fetch(
            `https://api.minimax.io/v1/files/retrieve?file_id=${body.file_id}`,
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
      } else if (body.status === "Fail") {
        updateData.errorMessage = "Video generation failed";
      }

      await videoTasksCollection.updateOne(
        { taskId: body.task_id },
        { $set: updateData }
      );

      await client.close();
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}
