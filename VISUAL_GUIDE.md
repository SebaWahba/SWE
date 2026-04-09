# 📊 Visual Guide - Quick Reference

## 🔐 Google Sign-In Flow

### What SHOULD Happen:
```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APP (/login)                        │
│                                                             │
│  [Email/Password]    [Sign in with Google]  ← User clicks  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE AUTH                             │
│                                                             │
│  ✓ Google provider: ON                                     │
│  ✓ Client ID: 123...apps.googleusercontent.com            │
│  ✓ Client Secret: GOCSPX-...                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE OAUTH (accounts.google.com)             │
│                                                             │
│  Select your Google account                                │
│  Grant permissions to Loopy                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            REDIRECT BACK TO YOUR APP                        │
│                                                             │
│  URL: https://yourapp.com/browse                           │
│  User is now signed in! ✓                                  │
└─────────────────────────────────────────────────────────────┘
```

### What's Happening If It FAILS:

#### Error: "Provider not enabled"
```
YOUR APP (/login)
     │
     ▼
SUPABASE AUTH
     │
     ✗ Google provider: OFF  ← PROBLEM!
     │
     ▼
ERROR: Provider is not enabled
```

**Fix:** Supabase Dashboard → Auth → Providers → Toggle Google ON

---

#### Error: "redirect_uri_mismatch"
```
YOUR APP (/login)
     │
     ▼
SUPABASE AUTH (sends request to Google)
     │
     ▼
GOOGLE OAUTH
     │
     ✗ Redirect URI doesn't match  ← PROBLEM!
     │   Expected: https://abc123.supabase.co/auth/v1/callback
     │   Got: https://wrong-url.com/callback
     │
     ▼
ERROR: redirect_uri_mismatch
```

**Fix:** Google Cloud Console → Credentials → Update redirect URI to match Supabase

---

#### Error: No OAuth URL / Can't load make
```
YOUR APP (/login)
     │
     ▼
SUPABASE AUTH
     │
     ✗ No Client ID or Secret  ← PROBLEM!
     │
     ▼
ERROR: Can't generate OAuth URL
```

**Fix:** Add Client ID and Secret to Supabase from Google Cloud Console

---

## 🎥 Video Upload & Playback Flow

### Current Setup (Using Google Demo Videos):
```
┌─────────────────────────────────────────────────────────────┐
│                YOUR APP (/watch/1)                          │
│                                                             │
│  <video src="https://storage.googleapis.com/...">          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           GOOGLE CLOUD STORAGE (External)                   │
│                                                             │
│  ⚠️  May have CORS issues                                  │
│  ⚠️  May be blocked by network                             │
│  ⚠️  No control over availability                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
          ✓ Works (if not blocked)
          ✗ Error (if CORS/network issues)
```

---

### NEW Setup (Using Supabase Storage):
```
┌─────────────────────────────────────────────────────────────┐
│                YOUR APP (/watch/1)                          │
│                                                             │
│  <video src="https://YOUR-PROJECT.supabase.co/storage..."> │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE STORAGE (Your Storage)                │
│                                                             │
│  ✓ No CORS issues (same domain)                           │
│  ✓ Fast CDN delivery                                       │
│  ✓ You control everything                                  │
│  ✓ Reliable playback                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
               ✓ Always works!
```

---

## 📦 Supabase Storage Structure

### What You'll Create:
```
📁 Supabase Project (abc123xyz.supabase.co)
│
├── 📂 Storage
│   │
│   ├── 📦 loopy-videos (bucket)
│   │   ├── 🎬 nature-wildlife.mp4
│   │   ├── 🎬 space-documentary.mp4
│   │   ├── 🎬 cooking-show.mp4
│   │   └── 🎬 travel-adventure.mp4
│   │
│   └── 📦 loopy-thumbnails (bucket)
│       ├── 🖼️  nature-wildlife.jpg
│       ├── 🖼️  space-documentary.jpg
│       ├── 🖼️  cooking-show.jpg
│       └── 🖼️  travel-adventure.jpg
│
└── 📝 Database
    └── videos_database (in KV store)
        ├── Video 1: videoUrl → points to loopy-videos/nature-wildlife.mp4
        ├── Video 2: videoUrl → points to loopy-videos/space-documentary.mp4
        └── ...
```

---

## 🔄 Upload Process Visualization

### Step-by-Step:
```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Create Bucket                                      │
│                                                             │
│ Supabase Dashboard → Storage → New bucket                  │
│ Name: loopy-videos                                         │
│ Public: ✓ YES                                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Upload Video File                                  │
│                                                             │
│ Click bucket → Upload file → Select video.mp4             │
│                                                             │
│ 💾 test-video.mp4 (25 MB)                                 │
│ ⏳ Uploading... [████████░░] 80%                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Get Public URL                                     │
│                                                             │
│ Click video → Copy URL                                     │
│                                                             │
│ 🔗 https://abc123xyz.supabase.co/storage/v1/object/       │
│    public/loopy-videos/test-video.mp4                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Update Database                                    │
│                                                             │
│ Edit: /supabase/functions/server/index.tsx                │
│                                                             │
│ Find: { id: "1", videoUrl: "https://old-url..." }         │
│ Replace with: "https://abc123xyz.supabase.co/storage...   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Test                                               │
│                                                             │
│ Refresh app → Go to /browse → Click video                 │
│ Video plays from Supabase! ✓                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting Decision Tree

### Video Not Playing?
```
Video won't play?
    │
    ├─→ Check console (F12)
    │       │
    │       ├─→ "CORS error" 
    │       │       └─→ Using Google demo URLs? Upload to Supabase!
    │       │
    │       ├─→ "404 Not Found"
    │       │       └─→ Check video URL is correct
    │       │
    │       └─→ "Network error"
    │               └─→ Check internet connection / firewall
    │
    └─→ Click "Retry Video" button
            │
            ├─→ Works now? ✓
            └─→ Still broken? Upload to Supabase
```

---

### Google Sign-In Not Working?
```
Click "Sign in with Google"
    │
    ├─→ Error: "Provider not enabled"
    │       └─→ Fix: Supabase → Auth → Providers → Toggle ON
    │
    ├─→ Error: "redirect_uri_mismatch"
    │       └─→ Fix: Google Cloud Console → Update redirect URI
    │
    ├─→ Error: "Can't load make" / No OAuth URL
    │       └─→ Fix: Add Client ID & Secret to Supabase
    │
    └─→ Redirects but doesn't sign in
            └─→ Fix: Check Supabase redirect URLs include /browse
```

---

## 📋 Quick Checklist Format

### Google Sign-In Setup:
```
☐ Google Cloud Console
  ☐ OAuth 2.0 Client ID created
  ☐ Client ID copied
  ☐ Client Secret copied
  ☐ Redirect URI = https://YOUR-PROJECT.supabase.co/auth/v1/callback
  
☐ Supabase Dashboard
  ☐ Authentication → Providers
  ☐ Google toggled ON
  ☐ Client ID pasted
  ☐ Client Secret pasted
  ☐ Redirect URLs include /browse
  
☐ Testing
  ☐ Click "Sign in with Google"
  ☐ Redirects to Google ✓
  ☐ Select account ✓
  ☐ Redirects back ✓
  ☐ Signed in ✓
```

---

### Video Upload Setup:
```
☐ Supabase Storage
  ☐ Create bucket: loopy-videos
  ☐ Make bucket PUBLIC
  ☐ Upload test video
  ☐ Copy video URL
  
☐ Update Database
  ☐ Open /supabase/functions/server/index.tsx
  ☐ Find video entry (e.g., id: "1")
  ☐ Replace videoUrl with Supabase URL
  ☐ Save file
  
☐ Testing
  ☐ Hard refresh app (Ctrl+Shift+R)
  ☐ Go to /browse
  ☐ Click updated video
  ☐ Video plays ✓
```

---

## 🎯 URLs Reference

### Your Supabase URLs:
```
Project Dashboard:
https://supabase.com/dashboard/project/YOUR-PROJECT-REF

Storage URL:
https://YOUR-PROJECT-REF.supabase.co/storage/v1/object/public/BUCKET/FILE

Example Video URL:
https://abc123xyz.supabase.co/storage/v1/object/public/loopy-videos/nature.mp4

Example Thumbnail URL:
https://abc123xyz.supabase.co/storage/v1/object/public/loopy-thumbnails/nature.jpg
```

---

### Google OAuth URLs:
```
Google Cloud Console:
https://console.cloud.google.com

Required Redirect URI:
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback

Example:
https://abc123xyz.supabase.co/auth/v1/callback
```

---

## 📞 What to Share If You Need Help

### For Google Sign-In Issues:
```
1. Your Supabase project reference (abc123xyz)
2. Screenshot: Supabase → Auth → Providers → Google settings
3. Screenshot: Google Cloud Console → Redirect URIs
4. Console errors (F12 → Console tab)
```

---

### For Video Upload Issues:
```
1. Screenshot: Supabase → Storage → Buckets list
2. Screenshot: Files in loopy-videos bucket
3. The video URL you copied
4. Browser console errors (F12)
```

---

## ⚡ Quick Win Path

### Fastest way to see results (15 minutes):

```
1. Upload ONE video to Supabase        [5 min]
   └─→ See /UPLOAD_VIDEOS_TO_SUPABASE.md Step 1-3
   
2. Update ONE video in database        [2 min]
   └─→ Replace videoUrl for id: "1"
   
3. Test it works                       [1 min]
   └─→ Refresh app, click video, it plays!
   
4. Fix Google Sign-In redirect URL     [5 min]
   └─→ See /GOOGLE_SIGNIN_DEBUG.md Section A
   
5. Test Google Sign-In                 [2 min]
   └─→ Should redirect to Google now!
   
✓ Both issues fixed!
```

---

**Start with the Quick Win Path above - you'll see results fast!** 🚀
