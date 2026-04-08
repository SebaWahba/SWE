# Google OAuth Troubleshooting Guide

## "No Preview" Error When Clicking Google Sign-In

If you see a "no preview" message or blank page when clicking "Sign in with Google", this means Google OAuth is **not yet configured** in your Supabase project.

### Quick Solution

**Option 1: Use Email/Password Sign-In (Works Immediately)**
- Email/password authentication works without any setup
- Click "Don't have an account? Sign Up" 
- Enter your email, password, and name
- Sign in immediately!

**Option 2: Configure Google OAuth**
Follow the complete setup guide in `/GOOGLE_OAUTH_SETUP.md`

---

## Understanding the "No Preview" Error

When Google OAuth is not configured, Supabase cannot generate a valid OAuth URL to redirect you to Google's login page. This results in:
- "No preview" message
- Blank redirect page
- Console errors about missing provider

### What's Happening Behind the Scenes

1. You click "Sign in with Google"
2. The app calls Supabase's `signInWithOAuth()` function
3. Supabase checks if Google provider is enabled
4. **If NOT enabled**: No OAuth URL is generated → "No preview" error
5. **If enabled**: You get redirected to Google's account selection page

---

## How to Fix: Enable Google OAuth

### Step 1: Check Browser Console
Open your browser's developer console (F12) and look for errors when clicking Google Sign-In:
```
Google OAuth error details: {message: "Provider is not enabled"}
```

This confirms Google OAuth needs to be configured.

### Step 2: Quick Configuration Checklist

Go to your [Supabase Dashboard](https://supabase.com/dashboard):

1. ✅ **Enable Google Provider**
   - Navigate to: Authentication → Providers
   - Find "Google" and toggle it ON

2. ✅ **Add Google Credentials**
   - You need Client ID and Client Secret from Google Cloud Console
   - See `/GOOGLE_OAUTH_SETUP.md` Step 1 for getting these

3. ✅ **Set Redirect URLs**
   - In Supabase: Authentication → URL Configuration
   - Add: `http://localhost:5173/browse` (for development)

### Step 3: Test the Fix

After configuration:
1. Refresh the Loopy login page
2. Click "Sign in with Google"
3. You should now be redirected to Google's account selection page
4. Select your Google account
5. Authorize the app
6. You'll be redirected back to `/browse` signed in!

---

## Common Issues & Solutions

### Issue: "Provider is not enabled"
**Solution**: Enable Google in Supabase Dashboard → Authentication → Providers

### Issue: "redirect_uri_mismatch"
**Solution**: Make sure your Google Cloud Console redirect URI exactly matches:
```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

### Issue: Still seeing "no preview" after enabling
**Solution**: 
1. Clear browser cache
2. Try in incognito/private window
3. Check that you saved the Client ID and Secret in Supabase
4. Verify the Google provider toggle is ON (not just gray)

### Issue: Button does nothing when clicked
**Solution**: 
1. Check browser console for errors
2. Make sure you're not blocking pop-ups (though OAuth uses redirect, not pop-up)
3. Try email/password sign-in as fallback

---

## Debugging Steps

### 1. Check Console Logs
When you click "Sign in with Google", you should see:
```
Starting Google OAuth flow...
Current origin: http://localhost:5173
Initiating Google OAuth sign-in...
OAuth response: { url: "https://accounts.google.com/..." }
Redirecting to Google OAuth URL: https://accounts.google.com/...
```

If you see an error instead, that's your clue.

### 2. Verify Supabase Configuration
Check that the Google provider shows as "Enabled" with a green indicator in your Supabase dashboard.

### 3. Test Email/Password First
To confirm your Supabase connection works:
1. Create an account with email/password
2. Sign out
3. Sign back in with email/password
4. If this works, the issue is specifically with Google OAuth configuration

---

## Why Email/Password Works But Google Doesn't

- **Email/Password**: Built into Supabase by default, no external setup needed
- **Google OAuth**: Requires:
  - Google Cloud project
  - OAuth credentials
  - Configuration in both Google Cloud Console AND Supabase
  - Matching redirect URLs

This is why we recommend using email/password for quick testing!

---

## Complete Setup Guide

For detailed step-by-step instructions to enable Google Sign-In, see:
📄 **`/GOOGLE_OAUTH_SETUP.md`**

This guide covers:
- Creating Google Cloud project
- Generating OAuth credentials  
- Configuring Supabase authentication
- Setting up redirect URLs
- Testing the complete flow

---

## Quick Start Without Google OAuth

Don't want to set up Google OAuth right now? No problem!

1. Go to Login page
2. Click "Don't have an account? Sign Up"
3. Enter:
   - Name: Your Name
   - Email: your.email@example.com
   - Password: YourSecurePassword123
4. Click "Create Account"
5. You're in! Start watching videos immediately

---

## Getting Help

If you're still experiencing issues:

1. **Check the browser console** for detailed error messages
2. **Review** `/GOOGLE_OAUTH_SETUP.md` for configuration steps
3. **Try email/password** as an alternative
4. **Verify** your Supabase project is active
5. **Test in incognito mode** to rule out browser cache issues

---

## Summary

**"No preview" = Google OAuth not configured**

**Quick Fix**: Use email/password authentication (works instantly)

**Permanent Fix**: Follow `/GOOGLE_OAUTH_SETUP.md` to configure Google OAuth

**After Setup**: Google Sign-In will redirect you to select your Google account and authorize the app
