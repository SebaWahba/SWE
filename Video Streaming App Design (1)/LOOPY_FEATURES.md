# Loopy - AI-Powered Streaming Platform

## 🎯 Features Overview

### 1. **Google Sign-In Authentication**
- Click "Sign in with Google" on the login page
- Currently in **demo mode** - simulates Google OAuth flow
- User session persists in localStorage
- Profile picture and user info displayed in header

**To Enable Real Google Sign-In:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins (your domain)
6. Replace `YOUR_GOOGLE_CLIENT_ID` in `/src/app/contexts/AuthContext.tsx`
7. The OAuth flow will automatically work with real Google authentication

### 2. **AI-Powered Matching Algorithm**
The recommendation system tracks your viewing behavior and personalizes content:

#### How It Works:
- **Watch Tracking**: Every video you watch is tracked with category, tags, and watch duration
- **Category Scoring**: Categories you watch more frequently get higher scores
- **Tag Matching**: Videos with tags similar to your watch history rank higher
- **Recency Boost**: Recent viewing patterns have stronger influence
- **Smart Ordering**: Categories reorder based on your preferences

#### Algorithm Components:
```typescript
Score = (Category Match × 10) + 
        (Tag Matches × 5) + 
        (Recency × 2) + 
        (Recent Pattern Match × 15)
```

#### Features:
- **Personalized Row**: "Recommended for You" appears after watching videos
- **Category Reordering**: Your favorite categories move to the top
- **Watch History**: View all watched content with progress tracking
- **Continuous Learning**: Algorithm improves as you watch more

### 3. **AI Search Integration**
Search within video content with precise timestamps:
- Semantic search across all documentaries
- AI-generated summaries of search results
- Jump directly to relevant moments in videos
- Relevance scoring for each result
- Trending searches to explore

### 4. **User Interface**
Netflix-quality design with:
- Smooth animations using Motion (Framer Motion)
- Responsive design for all devices
- Hero section with featured content
- Scrollable video rows by category
- Video cards with hover effects
- Custom Loopy loop logo

### 5. **Video Player**
- Full-screen video experience
- AI Insights panel with content summaries
- Like/dislike, share, download actions
- Related video suggestions (personalized)
- Tag-based exploration

## 📊 How the Recommendation System Works

### Initial State (No Watch History):
- Shows all categories in default order
- Trending content displayed first
- No personalized recommendations

### After Watching Videos:
1. **Immediate Tracking**: Video watched at 25% → tracked
2. **Progress Updates**: Automatically tracks at 50%, 75%, 100%
3. **Score Calculation**: Algorithm calculates relevance scores
4. **Content Reordering**: 
   - "Recommended for You" row appears
   - Favorite categories move up
   - Related content ranked higher

### Example Flow:
```
User watches "Cosmos Unveiled" (Science & Space)
  ↓
Algorithm records: 
  - Category: "Science & Space" +1 point
  - Tags: ["space", "astronomy"] +1 point each
  ↓
Next browse shows:
  - "Science & Space" category moved higher
  - Videos with "astronomy" tag ranked higher
  - "Recommended for You" includes related content
```

## 🎨 Key Components

### Authentication Context (`/src/app/contexts/AuthContext.tsx`)
- Manages user login state
- Google OAuth integration
- Session persistence

### Recommendation Context (`/src/app/contexts/RecommendationContext.tsx`)
- Tracks viewing behavior
- Calculates recommendation scores
- Manages watch history
- Provides personalized suggestions

### Pages:
- **Landing** - Marketing page with features
- **Login** - Google authentication
- **Browse** - Main content discovery (with recommendations)
- **AI Search** - Semantic search interface
- **Watch** - Video player with tracking

## 🚀 Testing the Recommendation System

1. **Sign In**: Click "Sign in with Google" (demo mode)
2. **Browse Content**: Explore the browse page
3. **Watch Videos**: Click on any video
4. **Wait**: System tracks viewing automatically
5. **Go Back**: Return to browse page
6. **See Changes**: 
   - "Personalized for You" banner appears
   - "Recommended for You" row shows
   - Categories reorder based on preferences
7. **View History**: Click user avatar → Watch History

## 💡 Tips

- Watch multiple videos in the same category for stronger recommendations
- The more you watch, the better the recommendations become
- Clear history from user menu to reset recommendations
- Check console logs for OAuth setup instructions

## 🔧 Technical Stack

- **React 18** - UI framework
- **React Router 7** - Navigation
- **Motion** - Animations
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **LocalStorage** - Client-side persistence

## 📝 Notes

This is a **client-side implementation** using localStorage for demo purposes. For production:
- Connect to Supabase for real database
- Implement server-side recommendation engine
- Add proper Google OAuth flow
- Store watch history in database
- Implement real video streaming
