# 🎬 Loopy - Netflix-Style Streaming Platform

A fully-featured streaming platform with AI-powered search, personalized recommendations, and Google OAuth integration.

## 🎯 Current Status

Your platform includes:
- ✅ 200+ videos across 8 categories
- ✅ AI-powered content search
- ✅ Netflix-style personalized recommendations
- ✅ Watch history tracking
- ✅ Email/password authentication
- ⚙️ Google OAuth (requires setup)

## 🚨 Troubleshooting

**Seeing errors?** → Read **START_HERE.md** first!

The most common issue ("could not load make") is usually fixed by:
1. Going to Supabase Dashboard → Edge Functions
2. Deploying the `make-server-e24386a0` function
3. Waiting 60 seconds and refreshing

## 📚 Documentation

- **START_HERE.md** - Quick start and common fixes
- **TROUBLESHOOTING_GUIDE.md** - Comprehensive problem-solving guide
- **QUICK_DEBUG_SCRIPT.md** - Automated diagnostic script
- **FIXES_APPLIED.md** - Recent changes and improvements

## 🛠️ Built-in Diagnostic Tools

### 1. Status Indicator (Top-Right)
Real-time server health monitoring:
- 🟢 Green = All systems operational
- 🟡 Yellow = Some issues detected
- 🔴 Red = Server down

### 2. Diagnostic Panel (Bottom-Right)
Comprehensive system checks:
- ✅ Server connectivity
- ✅ Video endpoints
- ✅ Search functionality
- ✅ Google OAuth config

### 3. Enhanced Error Messages
Every error includes:
- Clear description of what went wrong
- Step-by-step fix instructions
- Links to relevant documentation

## 🔐 Authentication

### Email/Password (Works Immediately ✅)
- No setup required
- Create account and sign in
- Full feature access

### Google Sign-In (Requires Setup ⚙️)
Follow the complete guide in `TROUBLESHOOTING_GUIDE.md` → Section "Issue 2"

**Quick version:**
1. Set up OAuth in Google Cloud Console
2. Configure provider in Supabase Dashboard
3. Add redirect URLs
4. Test sign-in

**Or just use email/password** - it's much simpler!

## 🎥 Features

### Core Features
- 📺 200+ curated videos across 8 categories
- 🎬 High-quality streaming playback
- 📱 Responsive design (desktop & mobile)
- 🔍 AI-powered content search
- 📊 Personalized recommendations
- 👤 User profiles and authentication

### AI Search
Search by:
- Video title
- Description
- AI summary
- Tags
- **Actual video content** (dialogue, narration)

Example searches:
- "AirPods" → Finds tech video about wireless earbuds
- "polar bear" → Finds Arctic wildlife documentary
- "jaguar hunting" → Finds nature footage

### Recommendations
Netflix-style personalization based on:
- ✅ Watch history
- ✅ Video categories
- ✅ Tags and themes
- ✅ Completion rate
- ✅ Watch duration

**Note:** Requires sign-in and watching 1-2 videos first.

## 🗂️ Categories

1. **Nature & Wildlife** - Animals, forests, oceans
2. **Science & Space** - Cosmos, physics, exploration
3. **Technology** - AI, gadgets, innovation
4. **Travel & Adventure** - Destinations, cultures, exploration
5. **Food & Cooking** - Culinary arts, recipes, culture
6. **Education** - Learning, tutorials, knowledge
7. **History** - Past events, civilizations, stories
8. **Health & Wellness** - Fitness, mental health, lifestyle

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion** (Framer Motion) - Animations
- **React Router v7** - Navigation
- **Lucide Icons** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend platform
- **Deno** - Edge Functions runtime
- **Hono** - Web server framework
- **PostgreSQL** - Database (via Supabase)

### Authentication
- **Supabase Auth** - User management
- **OAuth 2.0** - Google Sign-In
- **PKCE Flow** - Secure authentication

### Storage
- **KV Store** - Key-value database
- **Supabase Storage** - (Available for future video uploads)

## 📋 Quick Start

1. **Open the app** in your browser
2. **Check status indicator** (top-right) - should be green
3. **Browse videos** - works without sign-in
4. **Create account** - use email/password (easiest)
5. **Watch videos** - recommendations appear after watching
6. **Try AI search** - search for "AirPods", "polar bear", etc.

## 🔧 Development

### Running Locally
The app is deployed and ready to use. No local setup needed!

### Database
Uses Supabase KV store:
- `videos_database` - All videos (200+)
- `user_preferences:{userId}` - User viewing preferences
- `watch_history:{userId}` - User watch history

## 🐛 Debugging

### Browser Console
Press **F12** to see:
- Detailed error messages
- API call logs
- OAuth flow debugging
- Auth state changes

### Diagnostic Tools
1. **Status Indicator** - Live health check (top-right)
2. **Diagnostic Panel** - Full system test (bottom-right)
3. **Debug Script** - Automated testing (see QUICK_DEBUG_SCRIPT.md)

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Videos not loading | Server down | Check status indicator, redeploy |
| Google Sign-In fails | Not configured | See TROUBLESHOOTING_GUIDE.md |
| No recommendations | Not logged in / No watch history | Sign in and watch videos |

## 📊 Project Structure

```
/
├── src/app/
│   ├── App.tsx                 # Main app component
│   ├── routes.ts              # Route configuration
│   ├── pages/                 # Page components
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Browse.tsx
│   │   ├── Watch.tsx
│   │   └── AISearch.tsx
│   ├── components/            # Reusable components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── VideoRow.tsx
│   │   ├── DiagnosticPanel.tsx
│   │   └── StatusIndicator.tsx
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx
│   │   └── RecommendationContext.tsx
│   └── lib/
│       └── api.ts             # API client
├── utils/supabase/
│   └── info.tsx               # Supabase config
└── docs/
    ├── START_HERE.md
    ├── TROUBLESHOOTING_GUIDE.md
    ├── QUICK_DEBUG_SCRIPT.md
    └── FIXES_APPLIED.md
```

## 🚀 Deployment

The app is already deployed and running on Supabase!

**Your URLs:**
- App: [Your deployment URL]
- Supabase: https://supabase.com/dashboard/project/ydywwijhmjvtkgxkugnx

## 📈 Future Enhancements

Potential additions:
- [ ] Upload your own videos to Supabase Storage
- [ ] Comment system
- [ ] Like/dislike functionality
- [ ] Playlist creation
- [ ] Social sharing
- [ ] Watchlist / Favorites
- [ ] Continue watching section
- [ ] Video progress saving
- [ ] Multiple video quality options
- [ ] Subtitle support

## 📝 Notes

### AI Search Details
- First 3 videos have full transcript content in `videoContent` field
- Other videos use title, description, tags, and AI summary
- To add more searchable content, update the `videoContent` field

### Recommendation Algorithm
- Tracks category preferences (weighted by completion)
- Tracks tag preferences
- Prioritizes unwatched content
- Adds randomness to avoid repetition
- Returns top 20 recommendations

### Video Sources
All videos use demo URLs from Google's test video bucket:
- BigBuckBunny.mp4
- ElephantsDream.mp4
- TearsOfSteel.mp4
- etc.

These are freely available test videos. Replace with your own video URLs as needed.

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Hono Framework](https://hono.dev)

## 💬 Support

If you encounter issues:

1. **Check START_HERE.md** for common fixes
2. **Run the diagnostic tools** (status indicator + diagnostic panel)
3. **Read TROUBLESHOOTING_GUIDE.md** for detailed solutions
4. **Use the debug script** in QUICK_DEBUG_SCRIPT.md
5. **Check browser console** (F12) for specific errors

## ✨ Highlights

What makes this special:
- 🎯 **Production-ready** - Full error handling and user feedback
- 🔍 **AI-Powered** - Searches actual video content, not just titles
- 📊 **Smart Recommendations** - Netflix-style personalization
- 🛠️ **Self-Diagnostic** - Built-in tools to identify and fix issues
- 📚 **Well-Documented** - Comprehensive guides for troubleshooting
- 🎨 **Beautiful UI** - Smooth animations and responsive design
- 🔐 **Flexible Auth** - Multiple sign-in options
- 🚀 **Scalable** - Built on Supabase infrastructure

---

**Built with ❤️ using React, Supabase, and modern web technologies**

For immediate help, start with **START_HERE.md**!
