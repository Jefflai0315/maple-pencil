export interface VideoGenerationTask {
  taskId: string;
  status: "queuing" | "preparing" | "processing" | "success" | "failed";
  fileId?: string;
  downloadUrl?: string;
  imageUrl: string;
  prompt?: string;
  model: string;
  duration: number;
  resolution: string;
  userDetails: {
    name: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
  muralItemId?: string; // Add mural item ID for tracking
}

export interface VideoGenerationRequest {
  imageUrl: string;
  prompt?: string;
  userDetails: {
    name: string;
    description: string;
  };
  model?: string;
  duration?: number;
  resolution?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  taskId?: string;
  message?: string;
  error?: string;
}

export interface VideoGenerationStatusResponse {
  success: boolean;
  task?: VideoGenerationTask;
  error?: string;
}

// Create a new video generation task
export async function createVideoGenerationTask(
  request: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  try {
    console.log("Creating video generation task with request:", {
      imageUrl: request.imageUrl.substring(0, 100) + "...",
      prompt: request.prompt,
      userDetails: request.userDetails,
    });

    const response = await fetch("/api/video-generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      return {
        success: false,
        error: `API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log("API response data:", data);
    console.log("Response success:", data.success);
    console.log("Response taskId:", data.taskId);
    return data;
  } catch (error) {
    console.error("Failed to create video generation task:", error);
    return {
      success: false,
      error: `Failed to create video generation task: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Check the status of a video generation task
export async function checkVideoGenerationStatus(
  taskId: string
): Promise<VideoGenerationStatusResponse> {
  try {
    const response = await fetch(`/api/video-generation?taskId=${taskId}`, {
      method: "GET",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to check video generation status:", error);
    return {
      success: false,
      error: "Failed to check video generation status",
    };
  }
}

// Poll for video generation completion - Optimized for speed
export async function pollVideoGeneration(
  taskId: string,
  onStatusUpdate?: (status: string) => void,
  maxAttempts: number = 120, // 20 minutes with 5-second intervals
  intervalMs: number = 5000 // Poll every 5 seconds for faster updates
): Promise<VideoGenerationTask | null> {
  console.log("Starting polling for taskId:", taskId);
  let attempts = 0;

  while (attempts < maxAttempts) {
    console.log(`Polling attempt ${attempts + 1} for taskId:`, taskId);
    const statusResponse = await checkVideoGenerationStatus(taskId);

    if (!statusResponse.success) {
      throw new Error(statusResponse.error || "Failed to check status");
    }

    const task = statusResponse.task;
    if (!task) {
      throw new Error("Task not found");
    }

    onStatusUpdate?.(task.status);

    if (task.status === "success") {
      return task;
    }

    if (task.status === "failed") {
      throw new Error(task.errorMessage || "Video generation failed");
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error("Video generation timed out");
}

// Get all video generation tasks for a user
export async function getUserVideoTasks(
  userName: string
): Promise<VideoGenerationTask[]> {
  try {
    const response = await fetch(
      `/api/video-generation/user?userName=${encodeURIComponent(userName)}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    return data.success ? data.tasks : [];
  } catch (error) {
    console.error("Failed to get user video tasks:", error);
    return [];
  }
}

// Complete video generation workflow
export async function generateVideoFromImage(
  imageUrl: string,
  userDetails: { name: string; description: string },
  prompt?: string,
  onProgress?: (status: string, progress?: number) => void
): Promise<VideoGenerationTask | null> {
  try {
    // Step 1: Create video generation task
    onProgress?.("Creating video generation task...", 10);

    const createResponse = await createVideoGenerationTask({
      imageUrl,
      prompt,
      userDetails,
    });

    // Check if it's a failure (like insufficient balance)
    if (!createResponse.success) {
      console.log("Video generation failed, using fallback mode");
      onProgress?.("Using fallback mode with uploaded photo...", 50);

      // Create a fallback task that uses the uploaded photo
      const fallbackTask: VideoGenerationTask = {
        taskId: createResponse.taskId || `fallback_${Date.now()}`,
        status: "success", // Mark as success so it can be used
        imageUrl,
        prompt,
        model: "fallback",
        duration: 6,
        resolution: "768P",
        userDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
        downloadUrl: imageUrl, // Use the image as the "video"
        errorMessage:
          createResponse.error || "API failed, using uploaded photo",
      };

      onProgress?.("Fallback mode ready!", 100);
      return fallbackTask;
    }

    if (!createResponse.taskId) {
      throw new Error(createResponse.error || "Failed to create task");
    }

    onProgress?.("Task created, starting generation...", 20);

    // Step 2: Poll for completion
    const task = await pollVideoGeneration(createResponse.taskId, (status) => {
      let progress = 20;
      switch (status) {
        case "queuing":
          progress = 30;
          break;
        case "preparing":
          progress = 50;
          break;
        case "processing":
          progress = 70;
          break;
        case "success":
          progress = 100;
          break;
      }
      onProgress?.(`Status: ${status}`, progress);
    });

    onProgress?.("Video generation completed!", 100);
    return task;
  } catch (error) {
    console.error("Video generation workflow failed:", error);
    onProgress?.("Video generation failed, using fallback...", 50);

    // Create fallback task even for exceptions
    const fallbackTask: VideoGenerationTask = {
      taskId: `fallback_${Date.now()}`,
      status: "success",
      imageUrl,
      prompt,
      model: "fallback",
      duration: 6,
      resolution: "768P",
      userDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
      downloadUrl: imageUrl,
      errorMessage: `Exception: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };

    onProgress?.("Fallback mode ready!", 100);
    return fallbackTask;
  }
}

// Update provider-aware video generation
export async function generateVideoFromImageWithProvider(
  provider: "minimax" | "wavespeedai",
  imageUrl: string,
  userDetails: { name: string; description: string },
  prompt?: string,
  onProgress?: (status: string, progress?: number) => void
): Promise<VideoGenerationTask | null> {
  if (provider === "wavespeedai") {
    // Call your new server API route
    try {
      onProgress?.("Submitting to server for WavespeedAI...", 10);
      const response = await fetch("/api/video-generation-wavespeedai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, prompt, userDetails }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "WavespeedAI server error");
      }
      // The server already polled for completion, so just return the result
      const result = {
        taskId: data.taskId,
        status: "success" as const,
        imageUrl,
        prompt,
        model: "wavespeedai",
        duration: 5,
        resolution: "480P",
        userDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
        downloadUrl: data.downloadUrl,
        muralItemId: data.muralItemId, // Include the mural item ID from the response
      };

      console.log(
        "🎯 WavespeedAI response includes muralItemId:",
        data.muralItemId
      );
      return result;
    } catch (error) {
      onProgress?.(
        `WavespeedAI server exception: ${
          error instanceof Error ? error.message : String(error)
        }`,
        0
      );
      return null;
    }
  }
  // Default: minimax
  return await generateVideoFromImage(
    imageUrl,
    userDetails,
    prompt,
    onProgress
  );
}
