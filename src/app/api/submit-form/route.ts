import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Check if the environment variable is set
    if (!process.env.GOOGLE_SHEETS_ENDPOINT) {
      console.error(
        "Missing required environment variable: GOOGLE_SHEETS_ENDPOINT"
      );
      return NextResponse.json(
        {
          message: "Server configuration error: Missing Google Sheets endpoint",
          details: "Please check your environment variables",
        },
        { status: 500 }
      );
    }

    // Forward the request to Google Apps Script
    const response = await fetch(process.env.GOOGLE_SHEETS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `Google Sheets API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in submit-form API route:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to submit form",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
