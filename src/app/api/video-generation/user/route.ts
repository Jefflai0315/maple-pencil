import { NextRequest, NextResponse } from "next/server";
import { sharedClient as client } from "@/app/utils/mongodb";
import { getSessionEmail } from "@/lib/auth";



export async function GET(request: NextRequest) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }
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
