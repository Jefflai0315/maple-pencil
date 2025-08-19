import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 }
    );
  }

  let clientConnected = false;
  try {
    await client.connect();
    clientConnected = true;

    const db = client.db("mural-app");
    const collection = db.collection("mural-items");

    // Find mural items by user email
    const userItems = await collection
      .find({ "userDetails.email": email })
      .sort({ timestamp: -1 })
      .toArray();

    console.log(`📊 Found ${userItems.length} mural items for user ${email}`);

    return NextResponse.json({
      success: true,
      data: userItems,
      count: userItems.length,
    });
  } catch (error) {
    console.error("Error fetching user mural items:", error);
    return NextResponse.json(
      { error: "Failed to fetch user mural items" },
      { status: 500 }
    );
  } finally {
    if (clientConnected) {
      await client.close();
    }
  }
}
