import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Email and name are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection("user").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 }
      );
    }

    console.log("Creating new user:", email, name, db);

    // Create new user with default values
    const newUser = {
      email,
      name,
      level: "user", // Default level
      credits: 0, // Starting credits is 0
      boards: ["Sembawang-west"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("user").insertOne(newUser);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        ...newUser,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
