# WavespeedAI Video Generation API

This API route handles video generation using the WavespeedAI service, including polling for results, uploading to Cloudinary, and updating MongoDB collections.

## Endpoint

`POST /api/video-generation-wavespeedai`

## Request Body
- `imageUrl` (string, required): URL or base64 of the input image.
- `prompt` (string, optional): Text prompt for video generation.
- `userDetails` (object, required):
  - `name` (string, required)
  - `description` (string, optional)

## Workflow
1. **Create Task**: Stores a new task in the `video-generation-tasks` MongoDB collection with status `queuing`.
2. **Submit to WavespeedAI**: Sends a request to the WavespeedAI API to start video generation.
3. **Polling**: Polls the WavespeedAI API every second for job status (`created`, `processing`, `completed`, `failed`).
4. **On Completion**:
   - If successful, retrieves the video URL from WavespeedAI.
   - Attempts to upload the video to Cloudinary. If Cloudinary upload fails, falls back to the original WavespeedAI URL.
   - Uploads the original image to Cloudinary if not already hosted there.
   - Updates the task in MongoDB with all URLs and final status.
   - Inserts a new mural item in the `mural-items` collection with the Cloudinary (or fallback) URLs and metadata.
5. **Error Handling**: If any step fails, updates the task with an error message and returns a 500 error.

## Response
- On success (`status: 200`):
  ```json
  {
    "success": true,
    "taskId": "wavespeedai_...",
    "downloadUrl": "https://...", // Original or fallback video URL
    "cloudinaryVideoUrl": "https://res.cloudinary.com/...", // Preferred
    "cloudinaryImageUrl": "https://res.cloudinary.com/..."
  }
  ```
- On error (`status: 500`):
  ```json
  {
    "success": false,
    "taskId": "wavespeedai_...",
    "error": "Error message(s)"
  }
  ```

## MongoDB Collections
- `video-generation-tasks`: Tracks all video generation jobs, their status, and URLs.
- `mural-items`: Stores completed mural items for display, including image and video URLs and metadata.

## Notes
- The API will always attempt to use Cloudinary for video and image storage. If Cloudinary upload fails, it will fall back to the original WavespeedAI URL.
- The polling interval is 1 second; status is updated in MongoDB every 3 polls.
- All errors are logged and included in the `errorMessage` field in MongoDB for debugging.

---

**See the implementation in `route.ts` for details.** 