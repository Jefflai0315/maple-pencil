# MongoDB Setup for Vercel Deployment

## 🚨 Why JSON Files Don't Work on Vercel

### **Problems with JSON Files:**
- ❌ **Serverless functions** can't write to filesystem permanently
- ❌ **File changes** are lost after deployment
- ❌ **No persistence** between function calls
- ❌ **Read-only** filesystem in production

### **What Happens:**
- ✅ **Local development**: Works fine
- ❌ **Vercel deployment**: Uploads will fail, data will be lost

## ✅ MongoDB Atlas Solution

### **Step 1: Create MongoDB Atlas Account**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up for free account
3. Create a new cluster (free tier)

### **Step 2: Get Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

### **Step 3: Add Environment Variables**
Add to `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mural-app?retryWrites=true&w=majority
```

### **Step 4: Update Frontend**
Change the API endpoint in your upload page:
```typescript
// In upload page, change to MongoDB endpoint
const response = await fetch("/api/upload-mongodb", {
  method: "POST",
  body: formData,
});
```

### **Step 5: Update Mural Page**
Change the fetch endpoint:
```typescript
// In mural page, change to MongoDB endpoint
const response = await fetch("/api/upload-mongodb");
```

## 🔧 MongoDB Features

### **What's Stored:**
- ✅ **User information** (name, description, session)
- ✅ **Upload metadata** (file size, source, browser info)
- ✅ **Cloudinary URLs** (image links)
- ✅ **Grid positions** (mural layout)
- ✅ **Timestamps** (upload dates)

### **Database Structure:**
```json
{
  "_id": "ObjectId",
  "imageUrl": "https://res.cloudinary.com/...",
  "videoUrl": "video-placeholder",
  "gridPosition": 0,
  "timestamp": "2024-01-15T10:30:00Z",
  "userDetails": {
    "name": "John Doe",
    "description": "My artwork",
    "sessionId": "session_1234567890",
    "ipAddress": "192.168.1.1"
  },
  "metadata": {
    "originalFileName": "art.jpg",
    "fileSize": 123456,
    "uploadSource": "camera",
    "browserInfo": "Mozilla/5.0..."
  }
}
```

## 📊 MongoDB Atlas Benefits

### **Free Tier:**
- ✅ **512MB storage** (plenty for mural app)
- ✅ **Shared clusters** (good performance)
- ✅ **Global deployment** (fast worldwide)
- ✅ **Automatic backups** (data safety)

### **Cost:**
- ✅ **Free forever** for small apps
- ✅ **Pay as you grow** for larger apps

## 🚀 Deployment Steps

### **1. Set Up MongoDB Atlas**
- Create account and cluster
- Get connection string
- Add to environment variables

### **2. Update Code**
- Use `/api/upload-mongodb` endpoint
- Test locally first

### **3. Deploy to Vercel**
```bash
vercel --prod
```

### **4. Add Environment Variables to Vercel**
- Go to Vercel dashboard
- Add `MONGODB_URI` environment variable
- Redeploy

## 🧪 Testing

### **Local Test:**
1. Add MongoDB URI to `.env.local`
2. Upload an image
3. Check MongoDB Atlas dashboard
4. Verify data is saved

### **Vercel Test:**
1. Deploy to Vercel
2. Add environment variables
3. Upload an image
4. Check MongoDB Atlas dashboard

## 💡 Pro Tips

- **Use MongoDB Compass** for database management
- **Set up alerts** for storage usage
- **Monitor performance** in Atlas dashboard
- **Backup regularly** (automatic with Atlas)

## 🎯 Ready for Production

With MongoDB Atlas:
- ✅ **Works on Vercel** - No file system issues
- ✅ **Persistent data** - Survives deployments
- ✅ **Scalable** - Grows with your app
- ✅ **Reliable** - MongoDB's infrastructure

Your app will work perfectly on Vercel with MongoDB! 🚀 