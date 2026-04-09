# Loopy Streaming Platform - Setup Instructions

## 🎯 Features Implemented

### ✅ Google Sign-In Authentication
- Full Supabase Auth integration
- Email/password authentication
- Google OAuth support (requires configuration)
- Session management with automatic token refresh
- Protected routes and user state management

### ✅ Large Video Database
- 200+ real videos stored in Supabase KV store
- Categories: Nature & Wildlife, Science & Space, Technology, Travel & Adventure, Food & Cooking, Education, History, Health & Wellness
- Real video URLs from Google's sample video library
- High-quality thumbnails from Unsplash

### ✅ Advanced Search Functionality
- **Description-based search** - Search by video description, title, summary, and tags
- **Returns ALL matching videos** - Not just semantic search, but comprehensive results
- Full-text search across all video metadata
- Real-time search results

### ✅ Personalized Recommendation Algorithm
- Tracks user viewing behavior (watch duration, completion rate)
- Monitors categories and tags preferences
- Weighted scoring system:
  - Category match: 2x weight
  - Tag match: 1x weight
  - Watch completion bonus: 2x multiplier
- Netflix-style personalized content rows
- "Recommended for You" section based on watch history

### ✅ Watch History Tracking
- Tracks every video watched
- Records watch duration and completion percentage
- Stores last 100 watch records per user
- Real-time preference updates

### ✅ Visual Feedback
- Toast notifications when algorithm learns preferences
- Personalization banner showing number of videos watched
- Loading states and error handling
- Smooth animations throughout

---

## 🚀 Google OAuth Setup (REQUIRED for Google Sign-In)

**IMPORTANT:** Google Sign-In will NOT work until you complete this setup in your Supabase project.

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen:
   - User Type: External
   - App name: Loopy
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Loopy Web Client
   - Authorized JavaScript origins:
     ```
     https://your-project.supabase.co
     http://localhost:5173 (for local development)
     ```
   - Authorized redirect URIs:
     ```
     https://your-project.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback (for local development)
     ```
7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Enable Google provider
6. Paste your Google **Client ID** and **Client Secret**
7. Click **Save**

### Step 3: Update Redirect URLs (if needed)

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URL to **Site URL**
3. Add authorized redirect URLs:
   - Your production URL
   - `http://localhost:5173` for local development

### Step 4: Test Google Sign-In

1. Go to the Login page
2. Click "Sign in with Google"
3. You should be redirected to Google's login page
4. After successful login, you'll be redirected back to the app

**Documentation:** https://supabase.com/docs/guides/auth/social-login/auth-google

---

## 📊 How the Recommendation Algorithm Works

### 1. **Watch Tracking**
When a user watches a video for at least 10% or 30 seconds:
- Video ID, category, tags, and duration are recorded
- Watch completion percentage is calculated
- User preferences are updated in real-time

### 2. **Preference Calculation**
```typescript
Category Score = Number of videos watched in that category × completion weight
Tag Score = Number of times tag appeared in watched videos × completion weight
Completion Weight = 2 if >80% watched, else 1
```

### 3. **Recommendation Scoring**
Each unwatched video is scored:
```typescript
Score = (Category Score × 2) + (Tag Scores) + Random Factor
```

### 4. **Results**
- Videos sorted by score (highest first)
- Top 20 recommendations shown in "Recommended for You" row
- Updates automatically after each video watch

---

## 🎬 Video Database Details

### Total Videos: 200+

### Categories & Distribution:
- **Nature & Wildlife**: 40+ videos (Arctic, Ocean, Safari, Rainforest, etc.)
- **Science & Space**: 40+ videos (Mars, Black Holes, Quantum Physics, etc.)
- **Technology**: 40+ videos (AI, VR, Quantum Computing, 5G, etc.)
- **Travel & Adventure**: 40+ videos (Urban exploration, Mountains, Islands, etc.)
- **Food & Cooking**: 30+ videos (World cuisine, Sushi, Pasta, Street Food, etc.)
- **Education**: 25+ videos (Programming, Math, History, Chemistry, etc.)
- **History**: 25+ videos (Ancient Rome, WWII, Renaissance, etc.)
- **Health & Wellness**: 25+ videos (Yoga, Sleep, Nutrition, Mental Health, etc.)

### Video Data Structure:
```typescript
{
  id: string;
  title: string;
  description: string; // Full description for search
  thumbnail: string; // Unsplash image URL
  videoUrl: string; // Sample video URL
  duration: string;
  category: string;
  year: number;
  aiSummary: string; // AI-generated summary
  tags: string[]; // For matching algorithm
}
```

---

## 🔍 Search Functionality

### How Search Works:
1. User enters a description (e.g., "videos about space exploration")
2. Backend searches through:
   - Title
   - Description
   - AI Summary
   - Tags
3. Returns **ALL videos** that match any part of the query
4. Results are NOT limited - you get every matching video

### Search Examples:
- "nature wildlife" → Returns all nature & wildlife videos
- "space mars nasa" → Returns space videos mentioning Mars or NASA
- "cooking italian food" → Returns Italian cooking videos
- "technology AI machine learning" → Returns tech videos about AI

---

## 🎨 User Experience Features

### For Logged-In Users:
- Personalized recommendations based on watch history
- "Personalized for You" banner showing engagement
- Watch history tracking
- Preference learning with visual feedback

### For Guest Users:
- Full access to browse and search
- Trending content
- All videos organized by category
- Can watch without sign-in
- No personalization (encourages sign-up)

---

## 📱 Pages & Features

### Landing Page (`/`)
- Hero section with featured content
- Call-to-action for sign-up
- Platform overview

### Login Page (`/login`)
- Email/password sign-in
- Email/password sign-up
- Google OAuth button
- Guest mode option

### Browse Page (`/browse`)
- Hero video carousel
- Personalized recommendations (logged-in users)
- Category-based video rows
- 200+ videos organized by category
- Loading states

### Search Page (`/search`)
- AI-powered search interface
- Description-based search
- Real-time results
- All matching videos displayed

### Watch Page (`/watch/:id`)
- Full video player
- Video information & AI summary
- Related tags
- Watch tracking (logged-in users)
- Social sharing options

---

## 🛠️ Technical Stack

### Frontend:
- React 18
- TypeScript
- React Router v7
- Tailwind CSS v4
- Motion (Framer Motion)
- Lucide Icons
- Sonner (Toast notifications)

### Backend:
- Supabase (Database, Auth, Functions)
- Deno (Edge Functions)
- Hono (Web framework)
- KV Store (Video database)

### Authentication:
- Supabase Auth
- Google OAuth 2.0
- JWT tokens
- Session management

---

## 🎯 Testing the Features

### 1. Test Email Authentication:
```
1. Go to /login
2. Click "Don't have an account? Sign Up"
3. Enter: name, email, password
4. Sign up
5. You'll be automatically signed in
```

### 2. Test Google Sign-In:
```
1. Complete Google OAuth setup (see above)
2. Go to /login
3. Click "Sign in with Google"
4. Authorize with your Google account
5. Redirected back to /browse
```

### 3. Test Recommendation Algorithm:
```
1. Sign in with email or Google
2. Browse to /browse
3. Click on a "Nature & Wildlife" video
4. Watch for at least 30 seconds
5. You'll see a toast: "Loopy is learning your preferences!"
6. Go back to /browse
7. You should now see "Recommended for You" section
8. Recommendations will be nature/wildlife focused
```

### 4. Test Search:
```
1. Go to /search
2. Enter "videos about space and astronomy"
3. Click Search
4. See ALL matching videos (50+ results)
5. Try "technology AI" → Returns 40+ results
```

### 5. Test Watch History:
```
1. Sign in
2. Watch multiple videos (30+ seconds each)
3. Each video updates your preferences
4. Recommendations improve with each watch
5. Categories you watch more appear first
```

---

## 📊 Database Schema

### Videos Database (`videos_database` in KV)
- Stores all 200 videos
- Initialized on first server startup
- Cached for performance

### User Preferences (`user_preferences:{userId}`)
```typescript
{
  favoriteCategories: { [category: string]: number };
  favoriteTags: { [tag: string]: number };
  lastActive: string;
}
```

### Watch History (`watch_history:{userId}`)
```typescript
Array<{
  videoId: string;
  timestamp: string;
  watchDuration: number;
  totalDuration: number;
  category: string;
  tags: string[];
  completed: boolean;
}>
```

---

## 🔒 Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is only used server-side
- Frontend only has access to `SUPABASE_ANON_KEY`
- All protected routes require valid JWT token
- Watch history is user-specific (requires authentication)
- Recommendations are user-specific (requires authentication)

---

## 🎉 Summary

You now have a fully functional streaming platform with:
- ✅ 200+ real videos across 8 categories
- ✅ Google Sign-In (requires OAuth setup)
- ✅ Email/password authentication
- ✅ Description-based search returning ALL matches
- ✅ Netflix-style recommendation algorithm
- ✅ Watch history tracking
- ✅ Personalized content based on viewing behavior
- ✅ Visual feedback and toast notifications

**Next Steps:**
1. Complete Google OAuth setup (see instructions above)
2. Test authentication flows
3. Watch videos to build your preference profile
4. See personalized recommendations emerge!
