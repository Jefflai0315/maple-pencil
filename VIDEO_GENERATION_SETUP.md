# Video Generation Feature Setup

This document explains how to set up and use the video generation feature using the MiniMax API.

## Overview

The video generation feature allows users to create AI-generated videos from uploaded images. The system includes:

- Real-time video generation using MiniMax API
- Persistent task tracking in MongoDB
- Status polling and webhook callbacks
- User-friendly status tracking interface
- Automatic video download upon completion

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# MiniMax API Configuration
MINIMAX_API_KEY=your_minimax_api_key_here

# MongoDB Configuration (already existing)
MONGODB_URI=your_mongodb_connection_string

# Cloudinary Configuration (already existing)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## MiniMax API Setup

1. **Get API Key**: Sign up at [MiniMax](https://www.minimax.chat/) and obtain your API key
2. **Webhook Configuration**: 
   - **Vercel Free Tier**: Webhooks are not supported due to no public domain
   - **Solution**: The system uses efficient polling (every 5 seconds) for real-time updates
   - **Production**: If you upgrade to Vercel Pro, you can enable webhooks for instant updates

## Database Schema

The system creates a new collection `video-generation-tasks` in MongoDB with the following structure:

```typescript
interface VideoGenerationTask {
  _id?: ObjectId;
  taskId: string;           // MiniMax task ID
  status: "queuing" | "preparing" | "processing" | "success" | "failed";
  fileId?: string;          // MiniMax file ID (when completed)
  downloadUrl?: string;     // Direct download URL
  imageUrl: string;         // Original image URL
  prompt?: string;          // Generation prompt
  model: string;            // MiniMax model used
  duration: number;         // Video duration in seconds
  resolution: string;       // Video resolution
  userDetails: {
    name: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}
```

## API Endpoints

### 1. Create Video Generation Task
- **POST** `/api/video-generation`
- **Body**: 
  ```json
  {
    "imageUrl": "data:image/jpeg;base64,...",
    "prompt": "Create a beautiful artistic video",
    "userDetails": {
      "name": "John Doe",
      "description": "My artwork"
    },
    "model": "MiniMax-Hailuo-02",
    "duration": 6,
    "resolution": "1080P"
  }
  ```

### 2. Check Task Status
- **GET** `/api/video-generation?taskId={taskId}`
- Returns current task status and updates from MiniMax API

### 3. Get User Tasks
- **GET** `/api/video-generation/user?userName={userName}`
- Returns all video generation tasks for a specific user

### 4. Webhook Callback
- **POST** `/api/video-generation/callback`
- Handles MiniMax webhook notifications for status updates

## Frontend Integration

### Upload Page Integration

The upload page now includes real video generation:

```typescript
// In src/app/upload/page.tsx
const generateVideo = async (): Promise<string> => {
  const { generateVideoFromImage } = await import("../utils/videoGeneration");
  
  const task = await generateVideoFromImage(
    previewUrl,
    userDetails,
    "Create a beautiful artistic video based on this image",
    (status, progress) => {
      setUploadProgress(progress || 0);
    }
  );

  return task?.downloadUrl || "";
};
```

### Video Status Page

Users can track their video generation tasks at `/video-status`:

- View all tasks with real-time status updates
- Download completed videos
- Monitor progress with live polling
- Access task history and statistics

## Usage Flow

1. **User Uploads Image**: User uploads an image on the upload page
2. **Generate Video**: Click "Generate Video & Preview" button
3. **Task Creation**: System creates a MiniMax video generation task
4. **Status Tracking**: Real-time status updates via polling
5. **Video Download**: Automatic download URL retrieval upon completion
6. **Mural Integration**: Completed videos are added to the mural wall

## Error Handling

The system handles various error scenarios:

- **API Failures**: Graceful fallback with user-friendly error messages
- **Network Issues**: Automatic retry with exponential backoff
- **Invalid Images**: Validation and error reporting
- **Timeout Handling**: Configurable timeouts for long-running tasks

## Configuration Options

### Video Generation Parameters

```typescript
interface VideoGenerationRequest {
  imageUrl: string;
  prompt?: string;
  userDetails: {
    name: string;
    description: string;
  };
  model?: string;        // Default: "MiniMax-Hailuo-02" (fastest)
  duration?: number;     // Default: 6 (seconds) - optimized for speed
  resolution?: string;   // Default: "768P" - optimized for speed
}
```

### Polling Configuration

```typescript
// In src/app/utils/videoGeneration.ts
const pollVideoGeneration = (
  taskId: string,
  onStatusUpdate?: (status: string) => void,
  maxAttempts: number = 120,   // 20 minutes
  intervalMs: number = 5000    // 5 seconds for faster updates
)
```

## Security Considerations

1. **API Key Protection**: Store MiniMax API key in environment variables
2. **Input Validation**: Validate all user inputs before API calls
3. **Rate Limiting**: Consider implementing rate limiting for video generation
4. **File Size Limits**: Enforce reasonable limits on image uploads
5. **User Authentication**: Consider adding user authentication for production

## Monitoring and Logging

The system includes comprehensive logging:

- API request/response logging
- Error tracking and reporting
- Task status monitoring
- Performance metrics

## Troubleshooting

### Common Issues

1. **MiniMax API Errors**
   - Check API key validity
   - Verify account has sufficient credits
   - Check image format and size requirements

2. **MongoDB Connection Issues**
   - Verify connection string
   - Check network connectivity
   - Ensure database permissions

3. **Video Generation Failures**
   - Check image quality and format
   - Verify prompt length and content
   - Monitor API rate limits

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Performance Optimization

1. **Image Optimization**: Automatically resize and compress images before API calls
2. **Caching**: Implement caching for frequently accessed tasks
3. **CDN Integration**: Use CDN for video file delivery
4. **Database Indexing**: Add indexes for efficient task queries

## Future Enhancements

1. **Batch Processing**: Support for multiple video generation tasks
2. **Advanced Prompts**: Template-based prompt generation
3. **Video Editing**: Post-processing options for generated videos
4. **Analytics**: Detailed usage analytics and reporting
5. **Mobile Optimization**: Enhanced mobile experience for video status tracking 