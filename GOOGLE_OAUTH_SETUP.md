# Google OAuth Setup for Loopy

## ⚠️ IMPORTANT: Google Sign-In Setup Required

Google Sign-In will **NOT** work until you complete this setup. Follow these steps carefully.

---

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown (top left)
3. Click "New Project" or select an existing project
4. Name it "Loopy" and click "Create"

### 1.2 Enable Required APIs
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **"Enable"**

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Loopy
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **Save and Continue**
6. On Scopes page, click **Save and Continue** (default scopes are fine)
7. On Test users page, click **Save and Continue**
8. Click **Back to Dashboard**

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application**
4. Name it "Loopy Web Client"
5. Under **Authorized JavaScript origins**, add:
   ```
   https://YOUR-PROJECT-REF.supabase.co
   http://localhost:5173
   ```
   (Replace `YOUR-PROJECT-REF` with your actual Supabase project reference)

6. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```
   (Replace `YOUR-PROJECT-REF` with your actual Supabase project reference)

7. Click **Create**
8. A popup will show your credentials:
   - **Client ID**: Save this (starts with something like `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret**: Save this (looks like `GOCSPX-...`)

---

## Step 2: Supabase Configuration

### 2.1 Find Your Supabase Project Reference
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. In the URL, you'll see something like: `https://supabase.com/dashboard/project/YOUR-PROJECT-REF`
4. Copy `YOUR-PROJECT-REF` - this is your project reference ID

Your Supabase URL will be: `https://YOUR-PROJECT-REF.supabase.co`

### 2.2 Enable Google Provider in Supabase
1. In Supabase Dashboard, go to **Authentication** (left sidebar)
2. Click on **Providers**
3. Find **Google** in the list
4. Toggle it **ON** (enabled)
5. Paste your **Client ID** from Google Cloud Console
6. Paste your **Client Secret** from Google Cloud Console
7. Click **Save**

### 2.3 Configure Redirect URLs
1. Still in **Authentication**, click on **URL Configuration**
2. Under **Site URL**, enter your production URL (if you have one)
3. Under **Redirect URLs**, add:
   ```
   http://localhost:5173/browse
   https://your-production-domain.com/browse
   ```
4. Click **Save**

---

## Step 3: Update Google Cloud Console with Correct URLs

⚠️ **IMPORTANT**: Go back to Google Cloud Console and update the redirect URIs with your **actual Supabase project reference**:

1. Go back to [Google Cloud Console](https://console.cloud.google.com)
2. Go to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, make sure you have:
   ```
   https://YOUR-ACTUAL-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR-ACTUAL-PROJECT-REF` with the reference ID from Step 2.1)
5. Click **Save**

---

## Step 4: Test Google Sign-In

### 4.1 Local Development Test
1. Start your development server: `npm run dev` (or `pnpm dev`)
2. Go to `http://localhost:5173/login`
3. Click **"Sign in with Google"**
4. You should see a Google login popup/redirect
5. Sign in with your Google account
6. You should be redirected back to `/browse` and see your user info

### 4.2 Troubleshooting

#### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI doesn't match what's configured in Google Cloud Console
- **Fix**: Make sure the redirect URI in Google Cloud Console exactly matches:
  ```
  https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
  ```

#### Error: "Access blocked: This app's request is invalid"
- **Cause**: OAuth consent screen not properly configured
- **Fix**: Go back to Step 1.3 and complete the OAuth consent screen setup

#### Error: "Provider is not enabled"
- **Cause**: Google provider not enabled in Supabase
- **Fix**: Go to Supabase Dashboard → Authentication → Providers → Enable Google

#### User redirected but not signed in
- **Cause**: Redirect URL mismatch in Supabase
- **Fix**: Make sure `/browse` is in the Redirect URLs list in Supabase

---

## Step 5: Production Deployment

When deploying to production:

1. Update **Google Cloud Console**:
   - Add your production domain to **Authorized JavaScript origins**
   - Add `https://your-domain.com/auth/callback` to **Authorized redirect URIs**

2. Update **Supabase**:
   - Set your production URL as the **Site URL**
   - Add `https://your-domain.com/browse` to **Redirect URLs**

---

## Quick Reference

### What You Need:
- ✅ Google Cloud Project
- ✅ Google+ API enabled
- ✅ OAuth consent screen configured
- ✅ OAuth 2.0 Client ID and Secret
- ✅ Supabase project reference ID
- ✅ Google provider enabled in Supabase
- ✅ Redirect URLs configured in both Google and Supabase

### Key URLs Format:
```
Supabase URL: https://YOUR-PROJECT-REF.supabase.co
Google Redirect: https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
App Redirect: http://localhost:5173/browse (dev) or https://your-domain.com/browse (prod)
```

### Test Checklist:
- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs match exactly in Google Cloud
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Redirect URLs configured in Supabase
- [ ] Tested Google Sign-In flow

---

## Additional Resources

- [Supabase Google OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## Support

If you encounter issues:

1. Check browser console for error messages
2. Check Supabase logs in Dashboard → Logs → Auth
3. Verify all URLs match exactly (no trailing slashes, correct protocol)
4. Make sure you're using the correct Supabase project reference
5. Try in an incognito/private browser window to rule out cached credentials

---

**Important**: Email/password authentication works immediately without any additional setup. Google OAuth requires this configuration to work.
