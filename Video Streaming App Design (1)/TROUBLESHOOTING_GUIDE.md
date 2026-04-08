# Loopy Streaming Platform - Troubleshooting Guide

## Quick Diagnostics

1. **Open your browser console** (Press F12)
2. **Click the "Run Diagnostics" button** at the bottom right of the Browse page
3. **Check the diagnostic results** - green checkmarks = working, red X = needs fixing

## Common Issues and Solutions

### Issue 1: "Could Not Load Make" Error

**Symptoms:**
- Error message at the bottom of the page
- "Load previous failed" message
- Videos not loading

**Solutions:**

#### Step 1: Check the Browser Console
1. Press F12 to open Developer Tools
2. Look for red error messages
3. Take note of any errors mentioning:
   - "fetch failed"
   - "CORS"
   - "404" or "500" errors
   - Module import errors

#### Step 2: Verify Supabase Edge Function is Running
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Edge Functions** in the left sidebar
4. Check if `make-server-e24386a0` is deployed
5. Look for any error logs

#### Step 3: Test the Server Manually
Open your browser console and run:
```javascript
fetch('https://ydywwijhmjvtkgxkugnx.supabase.co/functions/v1/make-server-e24386a0/health', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXd3aWpobWp2dGtneGt1Z254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjYyMDUsImV4cCI6MjA4NjY0MjIwNX0.OpIif2nfVN38NGklmlaY6YiOk3dYQ0VZMEThAFOQeGk'
  }
}).then(r => r.json()).then(console.log)
```

**Expected Response:** `{status: "ok"}`

If you get an error:
- **Network Error**: Edge function is not deployed or not running
- **401/403 Error**: Authentication issue
- **500 Error**: Server code has an error

#### Step 4: Redeploy the Edge Function
If the health check fails:
1. Go to Supabase Dashboard → Edge Functions
2. Click on `make-server-e24386a0`
3. Click **Deploy** to redeploy the function
4. Wait 30-60 seconds for deployment
5. Refresh your app

---

### Issue 2: Google Sign-In Not Working

**Symptoms:**
- Clicking "Sign in with Google" shows an error
- No redirect to Google's login page
- Error messages about OAuth configuration

**Root Cause:**
Google OAuth requires manual setup in both Google Cloud Console and Supabase Dashboard.

**Complete Setup Steps:**

#### Part A: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Create a new project or select an existing one
   - Name it something like "Loopy Streaming"

3. **Enable Google+ API**
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click it and click **Enable**

4. **Create OAuth Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - If prompted, configure the OAuth consent screen first:
     - User Type: External
     - App name: Loopy
     - User support email: Your email
     - Developer contact: Your email
     - Save and continue through the steps

5. **Configure OAuth Client**
   - Application type: **Web application**
   - Name: Loopy Web Client
   
   - **Authorized JavaScript origins:**
     ```
     https://ydywwijhmjvtkgxkugnx.supabase.co
     http://localhost:5173
     ```
   
   - **Authorized redirect URIs:**
     ```
     https://ydywwijhmjvtkgxkugnx.supabase.co/auth/v1/callback
     ```

6. **Save Your Credentials**
   - Copy the **Client ID** (looks like: 123456789-abcdefg.apps.googleusercontent.com)
   - Copy the **Client Secret** (looks like: GOCSPX-xxxxxxxxxxxxx)
   - Keep these safe!

#### Part B: Supabase Dashboard Setup

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - Click **Authentication** in the left sidebar
   - Click **Providers**

3. **Configure Google Provider**
   - Find **Google** in the list
   - Toggle it to **Enabled**
   - Paste your **Client ID** from Google Cloud Console
   - Paste your **Client Secret** from Google Cloud Console
   - Click **Save**

4. **Add Site URL**
   - Go to **Authentication** → **URL Configuration**
   - Add your site URLs:
     - `http://localhost:5173` (for local development)
     - Your production URL (if deployed)

5. **Add Redirect URLs**
   - In the same URL Configuration page
   - Add redirect URLs:
     - `http://localhost:5173/browse`
     - Your production URL + `/browse` (if deployed)

#### Part C: Test Google Sign-In

1. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear cookies and cached data
   - Or use Incognito/Private mode

2. **Test Sign-In**
   - Go to your Login page
   - Click "Sign in with Google"
   - You should be redirected to Google's login page
   - After selecting an account, you should be redirected back to /browse

**If it still doesn't work:**
- Check the browser console for error messages
- Run the Diagnostic Panel
- Verify all URLs match exactly (no trailing slashes)
- Wait 5-10 minutes after configuration changes

---

### Issue 3: Videos Not Loading

**Symptoms:**
- Empty Browse page
- "Failed to load videos" error
- Spinning loader that never finishes

**Solutions:**

#### Check 1: Verify Server is Running
Run the diagnostic panel or manually check the `/videos` endpoint:

```javascript
fetch('https://ydywwijhmjvtkgxkugnx.supabase.co/functions/v1/make-server-e24386a0/videos?limit=5', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXd3aWpobWp2dGtneGt1Z254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjYyMDUsImV4cCI6MjA4NjY0MjIwNX0.OpIif2nfVN38NGklmlaY6YiOk3dYQ0VZMEThAFOQeGk'
  }
}).then(r => r.json()).then(console.log)
```

**Expected Response:** Object with `videos` array and `total` count

#### Check 2: Initialize Video Database
The server automatically initializes the video database on first request. If videos aren't loading:

1. Check Supabase Dashboard → Edge Functions → Logs
2. Look for errors during initialization
3. The server should create 200+ videos automatically

#### Check 3: Check CORS Issues
If you see CORS errors in console:
1. The server is configured with `origin: "*"`
2. This should allow all origins
3. If still blocked, check browser extensions (ad blockers, privacy tools)

---

### Issue 4: Search Not Finding Videos

**Symptoms:**
- AI Search returns no results
- Search works but misses obvious matches

**This is Expected Behavior Initially:**
- Only the first few videos have detailed `videoContent` fields
- Most videos only have title, description, tags, and aiSummary
- The AI search is working correctly - it just needs you to add more detailed content

**To Test AI Search:**
Try searching for:
- "AirPods" - should find the AI Revolution video
- "polar bear" - should find Arctic Wildlife
- "jaguar hunting" - should find Wild Kingdom
- "Big Five" - should find African Safari

These videos have detailed transcript content in the `videoContent` field.

---

### Issue 5: Recommendations Not Appearing

**Symptoms:**
- No "Recommended for You" section
- Personalization banner not showing

**This is Normal if:**
- You're not logged in (use email/password to sign in)
- You haven't watched any videos yet
- You're using Guest mode

**To Enable Recommendations:**
1. Sign in with email/password
2. Watch at least 1-2 videos for more than 30 seconds
3. Return to the Browse page
4. You should see personalized recommendations

---

## Advanced Debugging

### Enable Verbose Logging

The app already has extensive console logging. To see all logs:
1. Open browser console (F12)
2. Make sure "Verbose" or "All levels" is selected
3. Refresh the page
4. Look for logs starting with:
   - "Initializing..."
   - "Auth state changed:"
   - "Fetching videos..."
   - "OAuth response:"

### Check Network Tab

1. Open Developer Tools (F12)
2. Click **Network** tab
3. Refresh the page
4. Look for failed requests (red)
5. Click on failed requests to see:
   - Request headers
   - Response body
   - Status code

Common issues:
- **404**: Endpoint doesn't exist (check URL)
- **500**: Server error (check Edge Function logs)
- **401/403**: Authentication error (check API key)
- **CORS Error**: Cross-origin issue (shouldn't happen with current setup)

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **Edge Functions**
3. Click on `make-server-e24386a0`
4. View **Logs** tab
5. Look for error messages

---

## Still Having Issues?

### Collect Debug Information

1. **Browser Console Output**
   - Press F12 → Console tab
   - Screenshot or copy all errors

2. **Diagnostic Panel Results**
   - Click "Run Diagnostics" button
   - Screenshot the results

3. **Network Errors**
   - F12 → Network tab
   - Filter by "Fetch/XHR"
   - Screenshot failed requests

4. **Supabase Edge Function Logs**
   - Dashboard → Edge Functions → Logs
   - Copy recent error messages

### Quick Reset Steps

If everything is broken, try this:

1. **Clear Browser Data**
   ```
   Press Ctrl+Shift+Delete
   Clear "Cookies and site data"
   Clear "Cached images and files"
   ```

2. **Sign Out and Back In**
   - Click your profile → Sign Out
   - Refresh the page
   - Sign in again

3. **Redeploy Edge Function**
   - Supabase Dashboard → Edge Functions
   - Click `make-server-e24386a0`
   - Click **Deploy**
   - Wait 60 seconds

4. **Hard Refresh**
   ```
   Windows/Linux: Ctrl+Shift+R
   Mac: Cmd+Shift+R
   ```

---

## Reference Information

### Your Project Details
- **Project ID**: `ydywwijhmjvtkgxkugnx`
- **Server URL**: `https://ydywwijhmjvtkgxkugnx.supabase.co/functions/v1/make-server-e24386a0`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ydywwijhmjvtkgxkugnx

### Health Check Endpoints
- Server Health: `/health`
- Videos List: `/videos?limit=5`
- Video Search: `/videos/search?q=test`

### Common Error Messages

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "Could not load make" | Build or import error | Check console for module errors |
| "Failed to fetch videos" | API call failed | Check server health endpoint |
| "Google OAuth error" | OAuth not configured | Follow Google Sign-In setup |
| "No active session" | Not logged in | Sign in with email/password |
| "Provider is not enabled" | Google not enabled in Supabase | Enable in Dashboard |

---

## Contact & Support

If you're still stuck:
1. Check the browser console for specific error messages
2. Use the Diagnostic Panel to identify issues
3. Review the Supabase Edge Function logs
4. Verify all configuration steps were completed

Remember: Email/password authentication works without any additional setup! Use that while troubleshooting Google OAuth.
