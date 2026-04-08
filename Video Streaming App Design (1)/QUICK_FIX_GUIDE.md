# Quick Fix Guide - Video Playback & Google Sign-In Issues

## 🎥 Issue 1: Videos Not Playing

### Problem
Only one video works when pressing play, the rest don't play.

### Root Cause
The videos are using third-party URLs from Google Cloud Storage demo videos. These may have:
- CORS (Cross-Origin Resource Sharing) restrictions
- Rate limiting
- Browser compatibility issues

### Current Implementation
All videos in the database use the same set of sample videos from `https://storage.googleapis.com/gtv-videos-bucket/sample/`:
- BigBuckBunny.mp4
- ElephantsDream.mp4
- TearsOfSteel.mp4
- Sintel.mp4
- ForBiggerBlazes.mp4
- ForBiggerEscapes.mp4
- ForBiggerFun.mp4
- ForBiggerJoyrides.mp4

### What We've Fixed
✅ Removed `autoPlay` attribute (can cause browser blocking)
✅ Added `crossOrigin="anonymous"` for better CORS handling
✅ Improved error detection with specific error codes
✅ Added retry functionality
✅ Better error messages showing what went wrong
✅ Changed `preload` from "metadata" to "auto" for better loading

### How to Test
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click on a video to watch
4. Look for error messages:
   - `MEDIA_ERR_NETWORK` = Network/CORS issue
   - `MEDIA_ERR_DECODE` = Video format not supported
   - `MEDIA_ERR_SRC_NOT_SUPPORTED` = Video URL is blocked

### Expected Behavior
✅ **These videos SHOULD work** (they're official Google demo videos):
   - Video ID 1: "Wild Kingdom" (BigBuckBunny.mp4)
   - Video ID 2: "African Safari" (ElephantsDream.mp4)
   - Video ID 6: "Cosmos Unveiled" (Sintel.mp4)

❌ **If videos still don't work**, it may be due to:
   - Browser security settings
   - Network firewall blocking Google Cloud Storage
   - ISP restrictions

### Solutions

#### Solution 1: Use Different Video Sources
If the current videos don't work, the database can be updated to use different video hosting:
- **Self-hosted**: Upload videos to Supabase Storage
- **Other CDNs**: Use videos from other sources like Cloudinary, Vimeo, etc.

#### Solution 2: Try in Different Browser
Test in:
- Chrome (incognito mode)
- Firefox
- Safari
Different browsers have different CORS policies.

#### Solution 3: Check Browser Console
Look for specific errors:
```
Access to video at 'https://...' from origin '...' has been blocked by CORS policy
```
This confirms it's a CORS issue with the video source.

---

## 🔐 Issue 2: Google Sign-In "Can't Load Make" Error

### Problem
Google Sign-In button gives "can't load make" error and doesn't redirect.

### Root Cause
Google OAuth is **NOT configured** in Supabase. This feature requires manual setup in both:
1. Google Cloud Console
2. Supabase Dashboard

### Why It Happens
The error occurs because:
1. Google provider is **not enabled** in Supabase
2. No OAuth credentials (Client ID & Secret) are configured
3. Redirect URLs don't match between Google and Supabase

### What We've Fixed
✅ Changed OAuth prompt from `consent` to `select_account` (Google account picker)
✅ Improved error messages with specific instructions
✅ Added proper error handling for different failure scenarios
✅ Toast notifications now show setup instructions

### How to Enable Google Sign-In

**⚠️ IMPORTANT**: Google Sign-In requires manual configuration. Follow these steps:

#### Step 1: Check if Google Provider is Enabled
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Authentication** → **Providers**
4. Check if **Google** is toggled ON
5. If OFF or missing credentials → **You must configure it**

#### Step 2: Full Setup Instructions
📖 **See `/GOOGLE_OAUTH_SETUP.md`** for complete step-by-step instructions including:
- Creating Google Cloud project
- Enabling Google+ API
- Setting up OAuth consent screen
- Creating OAuth credentials
- Configuring Supabase

### Quick Workaround: Use Email/Password Instead

✅ **Email/password authentication works WITHOUT any setup!**

To use it:
1. Go to `/login`
2. Enter email and password
3. Click "Create Account" (if new user)
4. Sign in

### Expected Behavior

**Before Google OAuth Setup:**
```
Click "Sign in with Google"
  → Error: "Provider is not enabled"
  → Toast: "Google Sign-In Setup Required"
  → User sees setup instructions
```

**After Google OAuth Setup:**
```
Click "Sign in with Google"
  → Redirects to Google account selection
  → User selects Google account
  → Google asks for permission
  → Redirects back to /browse
  → User is signed in
```

---

## 🛠️ Testing Checklist

### Video Playback Tests
- [ ] Open browser console (F12)
- [ ] Navigate to `/watch/1` (Wild Kingdom video)
- [ ] Click play
- [ ] Video should load and play
- [ ] Check console for errors
- [ ] Try videos 2, 3, 6, 11
- [ ] If error appears, click "Retry Video" button

### Google Sign-In Tests

**If NOT configured (expected to fail):**
- [ ] Click "Sign in with Google"
- [ ] See error toast with setup instructions
- [ ] Error message mentions `/GOOGLE_OAUTH_SETUP.md`

**If configured (should work):**
- [ ] Click "Sign in with Google"
- [ ] See "Redirecting to Google Sign-In..." toast
- [ ] Browser redirects to Google account selection
- [ ] Select account
- [ ] Grant permissions
- [ ] Redirect back to `/browse`
- [ ] User info appears in header

---

## 📊 Debugging Tips

### For Video Issues
1. **Check Console**: Open DevTools → Console tab
2. **Network Tab**: Check if video file loads (DevTools → Network)
3. **Look for**: 
   - Red errors starting with "Video playback error"
   - CORS errors
   - 403/404 errors on video URLs
4. **Try**: Different browser or incognito mode

### For Google Sign-In Issues
1. **Check Console**: Look for OAuth errors
2. **Common Errors**:
   - "provider is not enabled" → Google not enabled in Supabase
   - "redirect_uri_mismatch" → URLs don't match in Google Cloud
   - "No OAuth URL" → Credentials missing in Supabase
3. **Verify**: 
   - Supabase → Authentication → Providers → Google = ON
   - Client ID and Secret are filled in

---

## ✅ What's Working Now

### Video Player Improvements
- ✅ Better error detection
- ✅ Retry functionality
- ✅ Detailed error messages
- ✅ Shows video URL in error overlay
- ✅ "Back to Browse" button on error
- ✅ Removed autoplay to prevent browser blocking

### Google Sign-In Improvements
- ✅ Account selection prompt (`select_account`)
- ✅ Detailed error messages
- ✅ Setup instructions in error toasts
- ✅ Longer toast duration (12 seconds) to read instructions
- ✅ Multiple error scenarios handled

---

## 🔧 Next Steps

### If Videos Still Don't Work
Consider updating the video database with different sources:
1. Upload videos to **Supabase Storage**
2. Use **public video CDNs** that allow embedding
3. Host videos on **YouTube/Vimeo** and use their embed players

### To Enable Google Sign-In
1. Follow `/GOOGLE_OAUTH_SETUP.md` completely
2. Takes about 15-20 minutes
3. Once set up, works automatically
4. Alternative: Use email/password (works immediately)

---

## 📞 Support

If issues persist:
1. Check all error messages in browser console
2. Verify network connection
3. Try incognito/private browsing mode
4. Test on different device/browser
5. Review `/GOOGLE_OAUTH_SETUP.md` for Google OAuth
6. Check Supabase logs: Dashboard → Logs → Auth

---

**Remember**: 
- 🎥 Video playback depends on external Google Cloud Storage URLs
- 🔐 Google Sign-In requires manual OAuth setup
- ✅ Email/password authentication works without any configuration
