import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection with SSL options
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

const client = new MongoClient(uri, {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  retryWrites: true,
  w: "majority",
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
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

async function loadMuralItems(): Promise<MuralItem[]> {
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

    const items = (await collection
      .find({})
      .sort({ timestamp: -1 })
      .toArray()) as MuralItem[];

    await client.close();
    return items;
  } catch (error) {
    console.error("Error loading mural items from MongoDB:", error);
    await client.close();
    return [];
  }
}

export async function GET() {
  try {
    const items = await loadMuralItems();

    // Analyze user relationships
    const analytics = {
      totalUploads: items.length,
      uniqueUsers: new Set(items.map((item) => item.userDetails.name)).size,
      uploadSources: {
        camera: items.filter((item) => item.metadata?.uploadSource === "camera")
          .length,
        file: items.filter((item) => item.metadata?.uploadSource === "file")
          .length,
        dragDrop: items.filter(
          (item) => item.metadata?.uploadSource === "drag-drop"
        ).length,
      },
      userStats: items.reduce(
        (acc, item) => {
          const userName = item.userDetails.name;
          if (!acc[userName]) {
            acc[userName] = {
              uploads: 0,
              totalFileSize: 0,
              sources: new Set<string>(),
              lastUpload: null as string | null,
            };
          }
          acc[userName].uploads++;
          acc[userName].totalFileSize += item.metadata?.fileSize || 0;
          acc[userName].sources.add(item.metadata?.uploadSource || "unknown");
          if (
            !acc[userName].lastUpload ||
            item.timestamp > acc[userName].lastUpload
          ) {
            acc[userName].lastUpload = item.timestamp;
          }
          return acc;
        },
        {} as Record<
          string,
          {
            uploads: number;
            totalFileSize: number;
            sources: Set<string>;
            lastUpload: string | null;
          }
        >
      ),
      recentUploads: items
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5)
        .map((item) => ({
          id: item._id?.toString() || "unknown",
          name: item.userDetails.name,
          timestamp: item.timestamp,
          uploadSource: item.metadata?.uploadSource,
          fileSize: item.metadata?.fileSize,
        })),
    };

    console.log("📊 Analytics generated:", {
      totalUploads: analytics.totalUploads,
      uniqueUsers: analytics.uniqueUsers,
      uploadSources: analytics.uploadSources,
    });

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}
