import { NextRequest, NextResponse } from "next/server";
import { sharedClient as client } from "@/app/utils/mongodb";
import { getSessionEmail } from "@/lib/auth";



export async function GET(request: NextRequest) {
  // A user may only list their own items.
  const sessionEmail = await getSessionEmail();
  if (!sessionEmail) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") || sessionEmail).trim().toLowerCase();

  if (email !== sessionEmail) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  let clientConnected = false;
  try {
    await client.connect();
    clientConnected = true;

    const db = client.db("mural-app");
    const collection = db.collection("mural-items");

    // Find mural items by user email
    const userItems = await collection
      .find(
        { "userDetails.email": email },
        { projection: { "userDetails.ipAddress": 0, "metadata.browserInfo": 0 } }
      )
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
