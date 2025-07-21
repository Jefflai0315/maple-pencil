# Mural Upload & Display Features

## Overview
This project now includes two new pages for community art sharing:

1. **Upload Page** (`/upload`) - For users to upload photos and generate videos
2. **Mural Wall** (`/mural`) - A 10x12 grid displaying uploaded artwork with animations

## Features

### Upload Page (`/upload`)
- **Drag & Drop Interface**: Users can drag images or click to browse
- **File Validation**: Supports image files up to 5MB
- **Image Preview**: Shows selected image before upload
- **Progress Tracking**: Real-time upload progress with status updates
- **User Details**: Optional name and description fields
- **Error Handling**: Clear error messages for validation failures
- **Success Feedback**: Confirmation when upload completes

### Mural Wall (`/mural`)
- **10x12 Grid Layout**: 120 total positions for artwork
- **Responsive Design**: Adapts to different screen sizes
- **Video Animations**: Click any artwork to play its generated video
- **Animation Sequence**:
  1. Video plays (animated representation of the image)
  2. Static image shows after video ends
  3. Image animates to its grid position
  4. Image "pastes" into the mural
- **Interactive Controls**: Mute/unmute, refresh to get latest uploads
- **Statistics**: Shows upload count, available spaces, and completion percentage
- **Navigation**: Direct link to upload page

### Technical Implementation

#### Database Storage
- **File Storage**: Images saved to `/public/uploads/` directory
- **Metadata Storage**: JSON file-based database in `/data/mural-items.json`
- **Grid Position Tracking**: Automatic assignment of grid positions (0-119)
- **Persistent Data**: Survives server restarts

#### API Endpoints
- `POST /api/upload` - Handle file uploads and metadata storage
- `GET /api/upload` - Retrieve all mural items

#### Animation System
- **Video Playback**: HTML5 video element with custom controls
- **CSS Transitions**: Smooth animations for image movement
- **State Management**: React state tracks animation phases
- **Responsive Animations**: Adapts to different screen sizes

## File Structure
```
src/app/
├── upload/
│   └── page.tsx          # Upload interface
├── mural/
│   └── page.tsx          # Mural wall display
├── api/
│   └── upload/
│       └── route.ts      # Upload API endpoints
└── utils/
    └── database.ts       # Database utility

public/
└── uploads/              # Uploaded image storage

data/
└── mural-items.json      # Persistent metadata storage
```

## Usage

### For Users
1. Navigate to `/upload` to submit artwork
2. Drag or select an image file
3. Add optional name and description
4. Click "Upload & Generate Video"
5. Visit `/mural` to see your artwork in the community wall
6. Click any artwork to watch its animation

### For Developers
- **Adding Video Generation**: Replace placeholder video URLs in API route
- **Database Migration**: Replace JSON storage with proper database
- **Cloud Storage**: Replace local file storage with cloud service
- **Animation Customization**: Modify CSS transitions and timing

## Future Enhancements
- [ ] Real video generation API integration
- [ ] Cloud storage (Google Drive, AWS S3)
- [ ] User authentication and profiles
- [ ] Social sharing features
- [ ] Advanced animation effects
- [ ] Mobile-optimized upload interface
- [ ] Real-time updates with WebSocket
- [ ] Admin panel for moderation

## Technical Notes
- Images are stored locally in `/public/uploads/`
- Metadata is stored in JSON format for simplicity
- Grid positions are assigned sequentially (0-119)
- Video URLs are currently placeholders
- All animations use CSS transitions for performance
- Database is file-based for easy deployment 