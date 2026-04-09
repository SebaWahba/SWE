# 🎥 How to Upload Videos to Supabase Storage - Complete Guide

## Why Upload to Supabase?

✅ **Your own videos** - Full control over content  
✅ **No CORS issues** - Videos work reliably  
✅ **Fast loading** - Optimized CDN delivery  
✅ **Secure** - Control who can access  

---

## Part 1: Upload Videos via Supabase Dashboard (Easy Way)

### Step 1: Go to Supabase Storage

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Loopy project
3. Click **Storage** in the left sidebar
4. You'll see the Storage page

---

### Step 2: Create a Storage Bucket

A bucket is like a folder for your videos.

#### Create the Bucket:
1. Click **New bucket** (green button, top right)
2. Enter bucket name: **`loopy-videos`**
3. **Public bucket**: ✅ **Check this** (videos need to be publicly accessible)
4. Click **Create bucket**

**Result**: You now have a `loopy-videos` bucket

---

### Step 3: Upload Your First Video

#### Get a Test Video:
If you don't have videos yet, download a free test video:
- [Pexels](https://www.pexels.com/videos/) - Free stock videos
- [Pixabay](https://pixabay.com/videos/) - Free videos
- Just download 1-2 videos to test (MP4 format)

#### Upload It:
1. Click on **loopy-videos** bucket (opens the bucket)
2. Click **Upload file** button
3. Select your video file (e.g., `nature-video.mp4`)
4. Wait for upload to complete
5. You'll see the video in the list

**Example**: If you uploaded `nature-video.mp4`, you'll see it listed.

---

### Step 4: Get the Public URL

#### Copy the Video URL:
1. Click on your uploaded video (`nature-video.mp4`)
2. Click **Get URL** or **Copy URL** button
3. You'll get something like:
   ```
   https://YOUR-PROJECT-REF.supabase.co/storage/v1/object/public/loopy-videos/nature-video.mp4
   ```

**Save this URL** - you'll need it for the database!

---

## Part 2: Update the Database to Use Your Videos

Now we'll update one video in the database to use your uploaded video.

### Step 5: Test With One Video First

We'll update video ID "1" to use your uploaded video.

#### Open the Server Code:
The video database is in `/supabase/functions/server/index.tsx`

#### Find Video ID "1":
Look for this section (around line 318):
```typescript
{
  id: "1",
  title: "Wild Kingdom: The Last Frontiers",
  description: "...",
  thumbnail: "https://images.unsplash.com/...",
  videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  ...
}
```

#### Replace the videoUrl:
Change this line:
```typescript
videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
```

To your Supabase URL:
```typescript
videoUrl: "https://YOUR-PROJECT-REF.supabase.co/storage/v1/object/public/loopy-videos/nature-video.mp4",
```

**Save the file!**

---

### Step 6: Test Your Video

1. Refresh your app (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Go to `/browse`
3. Click on "Wild Kingdom: The Last Frontiers" (video ID 1)
4. The video should now load from Supabase!
5. It should play perfectly without errors

**✅ Success!** You've uploaded and used your first Supabase video!

---

## Part 3: Upload More Videos (Bulk Upload)

### Step 7: Upload Multiple Videos

#### Option A: Upload via Dashboard (Good for 5-10 videos)
1. Go to Storage → loopy-videos bucket
2. Click **Upload file**
3. Select multiple videos at once (Ctrl+Click or Cmd+Click)
4. Wait for all to upload

#### Option B: Upload via Code (Good for 20+ videos)
We can create a simple upload script. See Part 4 below.

---

### Step 8: Organize Your Videos

#### Create Folders (Optional):
1. In the `loopy-videos` bucket, click **New folder**
2. Create folders like:
   - `nature/`
   - `science/`
   - `technology/`
   - `travel/`
3. Upload videos into relevant folders

**Example URL with folders:**
```
https://YOUR-PROJECT.supabase.co/storage/v1/object/public/loopy-videos/nature/wildlife.mp4
https://YOUR-PROJECT.supabase.co/storage/v1/object/public/loopy-videos/science/space.mp4
```

---

### Step 9: Update Multiple Videos in Database

Let's update 5 videos as examples.

#### Edit `/supabase/functions/server/index.tsx`:

Find these videos and update their `videoUrl`:

**Video 1 (Nature):**
```typescript
{
  id: "1",
  videoUrl: "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/loopy-videos/nature/wildlife.mp4",
}
```

**Video 2 (Nature):**
```typescript
{
  id: "2",
  videoUrl: "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/loopy-videos/nature/safari.mp4",
}
```

**Video 6 (Science):**
```typescript
{
  id: "6",
  videoUrl: "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/loopy-videos/science/cosmos.mp4",
}
```

...and so on for your uploaded videos.

---

## Part 4: Bulk Upload Script (Advanced)

If you have many videos, here's a script to upload them all.

### Step 10: Create Upload Script

Create a new file: `/upload-videos.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import { readdir } from 'fs/promises';
import { readFileSync } from 'fs';
import { join } from 'path';

// Get from /utils/supabase/info.tsx
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_KEY = 'YOUR-ANON-KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadVideos() {
  const videosFolder = './videos'; // Put your videos in this folder
  const files = await readdir(videosFolder);
  
  for (const file of files) {
    if (!file.endsWith('.mp4')) continue;
    
    console.log(`Uploading ${file}...`);
    const filePath = join(videosFolder, file);
    const fileBuffer = readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from('loopy-videos')
      .upload(file, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading ${file}:`, error);
    } else {
      console.log(`✅ Uploaded ${file}`);
      const publicURL = `${SUPABASE_URL}/storage/v1/object/public/loopy-videos/${file}`;
      console.log(`   URL: ${publicURL}`);
    }
  }
}

uploadVideos();
```

### Step 11: Run Upload Script

1. Create a folder called `videos` in your project root
2. Put all your MP4 videos in that folder
3. Update `SUPABASE_URL` and `SUPABASE_KEY` in the script
4. Run: `node upload-videos.js`
5. All videos upload automatically!

---

## Part 5: Update Thumbnails (Optional)

You can also upload thumbnail images to Supabase.

### Step 12: Create Thumbnails Bucket

1. Supabase → Storage → New bucket
2. Name: **`loopy-thumbnails`**
3. Public: ✅ **Checked**
4. Create

### Step 13: Upload Thumbnail Images

1. Click on `loopy-thumbnails` bucket
2. Upload JPG/PNG images
3. Get URLs like:
   ```
   https://YOUR-PROJECT.supabase.co/storage/v1/object/public/loopy-thumbnails/nature-wildlife.jpg
   ```

### Step 14: Update Database Thumbnails

In `/supabase/functions/server/index.tsx`:

```typescript
{
  id: "1",
  thumbnail: "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/loopy-thumbnails/wildlife-thumb.jpg",
  videoUrl: "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/loopy-videos/wildlife.mp4",
}
```

---

## Quick Reference: Full Example Video Entry

Here's what a complete video entry looks like with Supabase URLs:

```typescript
{
  id: "1",
  title: "Wild Kingdom: The Last Frontiers",
  description: "An epic journey through Earth's most remote wilderness areas.",
  thumbnail: "https://abc123xyz.supabase.co/storage/v1/object/public/loopy-thumbnails/wildlife.jpg",
  videoUrl: "https://abc123xyz.supabase.co/storage/v1/object/public/loopy-videos/wildlife.mp4",
  duration: "58:42",
  category: "Nature & Wildlife",
  year: 2024,
  aiSummary: "Features detailed footage of wildlife behavior...",
  tags: ["wildlife", "animals", "nature", "forest"],
  videoContent: "Narrator begins: Welcome to the last great wilderness..."
}
```

---

## Troubleshooting

### Video Won't Upload
**Error: File too large**
- Supabase free tier has a 50MB upload limit per file
- Compress your video using HandBrake or similar
- Or upgrade Supabase plan

**Error: Unauthorized**
- Check bucket is PUBLIC
- Check you're logged into Supabase Dashboard

### Video URL Doesn't Work
**404 Error**
- Check bucket name is correct (`loopy-videos`)
- Check file name matches exactly
- Check bucket is set to PUBLIC

**CORS Error**
- Bucket must be PUBLIC
- If still issues, go to Storage → Configuration → CORS

### Video Uploaded But Not Showing
**In the app:**
- Hard refresh (Ctrl+Shift+R)
- Check videoUrl in database is EXACT URL from Supabase
- Check browser console for errors

---

## Storage Limits & Costs

### Supabase Free Tier:
- ✅ **1 GB storage** - Good for ~10-20 short videos
- ✅ **2 GB bandwidth/month** - Fine for testing
- ✅ **50 MB max file size** - Compress large videos

### If You Need More:
Upgrade to Supabase Pro ($25/month):
- 100 GB storage
- 200 GB bandwidth
- Unlimited file size

---

## Video Format Recommendations

### Best Format:
- **Container**: MP4
- **Video codec**: H.264
- **Audio codec**: AAC
- **Resolution**: 1080p or 720p
- **Bitrate**: 2-5 Mbps

### How to Convert:
Use [HandBrake](https://handbrake.fr/) (free):
1. Open your video
2. Preset: "Web" → "Gmail Large 3 Minutes 720p30"
3. Export
4. Upload to Supabase

---

## Summary Steps (TL;DR)

1. ✅ **Create bucket**: `loopy-videos` (public)
2. ✅ **Upload video**: Click "Upload file" in dashboard
3. ✅ **Copy URL**: Click video → "Get URL"
4. ✅ **Update database**: Paste URL into `videoUrl` field in `/supabase/functions/server/index.tsx`
5. ✅ **Test**: Refresh app, play video

**That's it!** Your video now loads from Supabase Storage.

---

## Need Help?

**Show me:**
1. Screenshot of your Storage buckets
2. Screenshot of files in `loopy-videos` bucket
3. The video URL you copied
4. Any error messages

I'll help you debug!

---

## Video Ideas to Get Started

If you don't have videos yet, here are free sources:

1. **[Pexels Videos](https://www.pexels.com/videos/)** - Free HD videos
2. **[Pixabay Videos](https://pixabay.com/videos/)** - Free videos
3. **[Coverr](https://coverr.co/)** - Free stock footage
4. **[Mixkit](https://mixkit.co/free-stock-video/)** - Free video clips

Download 5-10 videos to test with!

---

**You've got this!** Start with just ONE video to test, then expand from there. 🎬
