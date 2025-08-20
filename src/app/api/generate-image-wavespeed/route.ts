import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;

if (!WAVESPEED_API_KEY) {
  throw new Error(
    "Please add your Wavespeed API key to .env as WAVESPEED_API_KEY"
  );
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImageToCloudinary(url: string) {
  return await cloudinary.v2.uploader.upload(url, {
    resource_type: "image",
    folder: "mural-app/ai-images",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body || {};
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing 'prompt'" }, { status: 400 });
    }

    // 1) Kick off text-to-image generation via Wavespeed (Luma Photon Flash)
    const startRes = await fetch(
      "https://api.wavespeed.ai/api/v3/luma/photon-flash",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WAVESPEED_API_KEY}`,
        },
        body: JSON.stringify({
          enable_base64_output: false,
          prompt,
        }),
      }
    );

    if (!startRes.ok) {
      const errorText = await startRes.text();
      return NextResponse.json(
        { error: `Wavespeed start error: ${errorText}` },
        { status: 502 }
      );
    }

    const startJson = await startRes.json();
    const requestId: string | undefined = startJson?.data?.id;
    if (!requestId) {
      return NextResponse.json(
        { error: `Invalid Wavespeed response: ${JSON.stringify(startJson)}` },
        { status: 502 }
      );
    }

    // 2) Poll for the result
    let status = "created";
    let imageUrl = "";
    let pollAttempts = 0;
    while (["created", "processing", "queued"].includes(status)) {
      // backoff slightly to be polite
      await new Promise((r) => setTimeout(r, 1000));
      pollAttempts++;

      const pollRes = await fetch(
        `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`,
        { headers: { Authorization: `Bearer ${WAVESPEED_API_KEY}` } }
      );
      type WavespeedPoll = {
        data?: {
          status?: string;
          outputs?: string[];
          error?: string;
        };
      };
      const pollJson: WavespeedPoll = (await pollRes
        .json()
        .catch(() => ({}))) as WavespeedPoll;
      if (!pollRes.ok) {
        return NextResponse.json(
          { error: `Wavespeed poll error: ${JSON.stringify(pollJson)}` },
          { status: 502 }
        );
      }

      status = pollJson?.data?.status as string;
      if (status === "completed") {
        const outputs: string[] | undefined = pollJson?.data?.outputs;
        if (!outputs || outputs.length === 0) {
          return NextResponse.json(
            {
              error: `No outputs in Wavespeed response: ${JSON.stringify(
                pollJson
              )}`,
            },
            { status: 502 }
          );
        }
        imageUrl = outputs[0];
        break;
      }
      if (status === "failed") {
        const errMsg = pollJson?.data?.error || "Wavespeed task failed";
        return NextResponse.json({ error: errMsg }, { status: 502 });
      }

      // Safety: avoid infinite loops
      if (pollAttempts > 90) {
        return NextResponse.json(
          { error: "Wavespeed generation timed out" },
          { status: 504 }
        );
      }
    }

    // 3) Upload the resulting image to Cloudinary for CORS-friendly canvas usage
    let cloudinaryImageUrl = imageUrl;
    try {
      const upload = await uploadImageToCloudinary(imageUrl);
      cloudinaryImageUrl = upload.secure_url;
    } catch (err) {
      console.warn("Cloudinary upload failed, returning original URL", err);
    }

    return NextResponse.json({ success: true, imageUrl: cloudinaryImageUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
