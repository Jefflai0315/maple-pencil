import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Please add your Gemini API key to .env as GEMINI_API_KEY");
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Generating image with Gemini for prompt:", prompt);

    // Initialize Google GenAI with the official SDK
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });

    const config = {
      responseModalities: ["IMAGE", "TEXT"],
    };

    const model = "gemini-2.5-flash-image-preview";
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `Generate a high-quality, artistic image based on this description: "${prompt}". The image should have clear lines, good contrast, and be suitable for tracing. Make it artistic and detailed.`,
          },
        ],
      },
    ];

    // Generate content with streaming response
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let generatedImage: string | null = null;
    let generatedText: string = "";

    // Process the streaming response
    for await (const chunk of response) {
      if (
        !chunk.candidates ||
        !chunk.candidates[0].content ||
        !chunk.candidates[0].content.parts
      ) {
        continue;
      }

      const part = chunk.candidates[0].content.parts[0];

      if (part.inlineData) {
        // Extract image data
        const inlineData = part.inlineData;
        const mimeType = inlineData.mimeType || "image/png";
        const base64Data = inlineData.data || "";

        if (base64Data) {
          generatedImage = `data:${mimeType};base64,${base64Data}`;
          console.log("Gemini generated image successfully");
        }
      } else if (part.text) {
        // Extract any text response
        generatedText += part.text;
      }
    }

    if (generatedImage) {
      return NextResponse.json({
        success: true,
        imageUrl: generatedImage,
        source: "gemini",
        textResponse: generatedText || null,
      });
    } else {
      // If no image was generated, trigger fallback
      console.log("Gemini did not generate an image, triggering fallback");
      return NextResponse.json({
        error: "Gemini API did not generate an image",
        fallback: true,
        textResponse: generatedText || null,
      });
    }
  } catch (error) {
    console.error("Gemini API error:", error);

    // Return error to trigger fallback to Wavespeed
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Gemini API failed",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
