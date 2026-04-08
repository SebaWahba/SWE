# 🔍 Google Sign-In Debugging - Already Set Up But Not Working

## Let's Fix Your Google Sign-In Step by Step

Since you already did the setup, let's debug what's going wrong.

---

## Step 1: Check Supabase Google Provider Status

### Go to Supabase Dashboard
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your Loopy project
3. Click **Authentication** (left sidebar)
4. Click **Providers**
5. Find **Google** in the list

### What to Check:
- [ ] Is Google **toggled ON** (enabled)?
- [ ] Is there a **Client ID** filled in?
- [ ] Is there a **Client Secret** filled in?

**If ANY are missing:**
→ Go to Section 2 below to get them from Google Cloud Console

---

## Step 2: Get Your Google OAuth Credentials

### Open Google Cloud Console
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Select your Loopy project (top dropdown)
3. Click hamburger menu (☰) → **APIs & Services** → **Credentials**

### Find Your OAuth 2.0 Client ID
You should see something like:
```
Name: Loopy Web Client (or similar)
Type: OAuth 2.0 Client ID
Client ID: 123456789-abc123xyz.apps.googleusercontent.com
```

### Click on it to see details

### Get Your Credentials:
1. **Client ID**: Copy this (ends with `.apps.googleusercontent.com`)
2. **Client Secret**: Click "Download JSON" or reveal secret

---

## Step 3: Verify Redirect URLs in Google Cloud Console

**CRITICAL**: This is the most common issue!

### In Google Cloud Console (same page as above):
Under **Authorized redirect URIs**, you MUST have EXACTLY:

```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

### How to Find YOUR-PROJECT-REF:
1. Open Supabase Dashboard
2. Look at the URL bar
3. You'll see: `https://supabase.com/dashboard/project/YOUR-PROJECT-REF`
4. Copy that `YOUR-PROJECT-REF` part

### Example:
If your Supabase URL is:
```
https://abc123xyz.supabase.co
```

Then your redirect URI should be:
```
https://abc123xyz.supabase.co/auth/v1/callback
```

### ⚠️ Common Mistakes:
❌ `http://` instead of `https://`
❌ Missing `/auth/v1/callback` at the end
❌ Extra trailing slash `/`
❌ Wrong project reference ID
❌ Using `localhost` instead of actual Supabase URL

---

## Step 4: Verify Redirect URLs in Supabase

### In Supabase Dashboard:
1. Click **Authentication** → **URL Configuration**
2. Scroll to **Redirect URLs**

### Add These URLs:
```
http://localhost:5173/browse
https://YOUR-PROJECT-REF.supabase.co/browse
```

Replace `YOUR-PROJECT-REF` with your actual Supabase project reference.

---

## Step 5: Test The OAuth Flow

### Open Browser DevTools FIRST:
1. Press **F12** (opens DevTools)
2. Go to **Console** tab
3. Keep it open during testing

### Try Google Sign-In:
1. Go to `/login` in your app
2. Click "Sign in with Google"
3. **Watch the console** for messages

### What Should Happen:
```
✅ Console: "Initiating Google OAuth sign-in..."
✅ Console: "Current origin: http://localhost:5173"
✅ Console: "Redirecting to Google OAuth URL: https://..."
✅ Browser redirects to Google account selection
✅ You select your Google account
✅ Google shows permission screen
✅ Redirects back to your app at /browse
✅ You're logged in
```

### What Might Go Wrong:

#### Error 1: "Provider is not enabled"
**Console shows:**
```
Error: provider is not enabled
```

**Fix:**
→ Google provider is OFF in Supabase
→ Go to Supabase → Authentication → Providers → Toggle Google ON

---

#### Error 2: "redirect_uri_mismatch"
**Browser shows:**
```
Error 400: redirect_uri_mismatch
```

**Fix:**
→ Redirect URI in Google Cloud doesn't match Supabase
→ Go back to Step 3 above
→ Make sure it's EXACTLY: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

---

#### Error 3: No redirect, stays on login page
**Console shows:**
```
Error: No OAuth URL received from Supabase
```

**Fix:**
→ Client ID or Secret missing in Supabase
→ Go to Supabase → Authentication → Providers → Google
→ Fill in Client ID and Client Secret from Step 2

---

#### Error 4: Redirects but doesn't sign in
**Browser redirects back but you're not logged in**

**Fix:**
→ Check Supabase Redirect URLs (Step 4)
→ Make sure `/browse` is in the list
→ Check Supabase Logs: Dashboard → Logs → Auth

---

## Step 6: Quick Verification Checklist

Copy this and check each item:

### Google Cloud Console:
- [ ] OAuth 2.0 Client ID exists
- [ ] Client ID ends with `.apps.googleusercontent.com`
- [ ] Client Secret exists
- [ ] Authorized redirect URIs includes: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
- [ ] No typos in the redirect URI
- [ ] Using `https://` not `http://`

### Supabase Dashboard:
- [ ] Google provider is toggled ON
- [ ] Client ID is filled in (paste from Google)
- [ ] Client Secret is filled in (paste from Google)
- [ ] Redirect URLs includes: `/browse`
- [ ] Site URL is set (can be localhost for now)

### Testing:
- [ ] Browser console is open (F12)
- [ ] No ad blockers interfering
- [ ] Testing in incognito mode (clears cached credentials)

---

## Step 7: Still Not Working? Get Detailed Error Info

### Test With Console Open:
1. Open **F12** → **Console** tab
2. Go to `/login`
3. Click "Sign in with Google"
4. **Copy the ENTIRE console output**
5. Look for red error messages

### Check Supabase Logs:
1. Supabase Dashboard → **Logs**
2. Click **Auth** (on the left)
3. Look for recent errors
4. Take a screenshot

### Common Error Messages & Fixes:

#### "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not configured
**Fix**: 
1. Google Cloud Console → APIs & Services → OAuth consent screen
2. Fill in App name, User support email, Developer contact
3. Save

#### "Invalid client"
**Cause**: Wrong Client ID or Secret
**Fix**:
1. Re-copy Client ID from Google Cloud Console
2. Re-copy Client Secret
3. Paste EXACTLY into Supabase (no extra spaces)
4. Click Save in Supabase

#### "Cookies are disabled"
**Cause**: Browser blocking third-party cookies
**Fix**:
1. Enable cookies in browser settings
2. Try incognito mode
3. Whitelist Supabase domain

---

## Step 8: Nuclear Option - Start Fresh

If nothing works, let's rebuild the OAuth credentials:

### Delete Old Credentials:
1. Google Cloud Console → Credentials
2. Find your OAuth 2.0 Client ID
3. Click trash icon to delete
4. Confirm deletion

### Create New Credentials:
1. Click **+ Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Name: **Loopy Web Client**
4. Authorized redirect URIs:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Update Supabase:
1. Supabase → Authentication → Providers → Google
2. Paste new **Client ID**
3. Paste new **Client Secret**
4. Click **Save**

### Test Again:
1. Clear browser cache
2. Test in incognito mode
3. Try Google Sign-In

---

## What to Send Me If Still Broken:

If you're still stuck, get me this info:

1. **Console errors:**
   - Open F12 → Console
   - Try Google Sign-In
   - Screenshot ALL red errors

2. **Your Supabase project reference:**
   - From URL bar when on Supabase Dashboard
   - Example: `abc123xyz`

3. **Your redirect URI in Google:**
   - Google Cloud Console → Credentials → Your OAuth Client
   - Screenshot the "Authorized redirect URIs" section

4. **Google provider status in Supabase:**
   - Screenshot of Supabase → Authentication → Providers → Google

---

## Meanwhile: Use Email/Password

While debugging Google OAuth, you can use email/password:

1. Go to `/login`
2. Click "Don't have an account? Sign Up"
3. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"
5. You're logged in!

This works 100% without any setup needed.

---

## Expected Timeline:

- ✅ **Steps 1-6**: 5-10 minutes
- ✅ **Step 7** (if debugging): 10-15 minutes
- ✅ **Step 8** (nuclear option): 10 minutes

**Total**: Should be fixed within 30 minutes max

---

## Need More Help?

Share with me:
1. Screenshot of console errors
2. Screenshot of Google Cloud redirect URIs
3. Screenshot of Supabase Google provider settings
4. Your Supabase project reference ID

I'll tell you exactly what's wrong!
