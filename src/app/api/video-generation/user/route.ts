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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("userName");

    if (!userName) {
      return NextResponse.json(
        { error: "User name is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db("mural-app");
    const videoTasksCollection = db.collection("video-generation-tasks");

    // Get all tasks for the user, sorted by creation date (newest first)
    const tasks = await videoTasksCollection
      .find({ "userDetails.name": userName })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      tasks: tasks,
    });
  } catch (error) {
    console.error("Get user video tasks error:", error);
    return NextResponse.json(
      { error: "Failed to get user video tasks" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
