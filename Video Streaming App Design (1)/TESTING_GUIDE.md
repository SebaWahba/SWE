# Loopy Platform Testing Guide

## Quick Start: Test Everything in 5 Minutes

### 1️⃣ Test Email Authentication (Works Immediately!)

**Sign Up**:
1. Go to `/login` page
2. Click "Don't have an account? Sign Up"
3. Fill in:
   - Name: `Test User`
   - Email: `test@loopy.com`
   - Password: `Test123456`
4. Click "Create Account"
5. ✅ You should be redirected to `/browse` signed in

**Sign Out & Sign In**:
1. Click your profile in header → Sign Out
2. Go back to `/login`
3. Enter the same email/password
4. Click "Sign In"
5. ✅ You should be signed in successfully

---

### 2️⃣ Test Video Playback

**Watch a Video**:
1. From Browse page, click any video thumbnail
2. ✅ Video player loads with poster image
3. ✅ Video plays when you click play (or autoplays)
4. ✅ Controls work: play, pause, volume, fullscreen
5. ✅ Watch for 30+ seconds
6. ✅ See toast: "🎯 Loopy is learning your preferences!"

**Try Multiple Videos**:
- Click different category tabs at top
- Watch videos from different categories
- AI will learn your preferences

---

### 3️⃣ Test AI Content Search

**Search for Technology Content**:
1. Click search icon (magnifying glass) in header
2. Type: **"H1 chip"**
3. Click Search or press Enter
4. ✅ Should find "The AI Revolution: Tech of Today" video
5. ✅ Result shows because video mentions H1 chip in AirPods

**Search for Wildlife Content**:
1. In search box, type: **"400 pounds"**
2. ✅ Should find "African Safari: Big Five Adventure"
3. ✅ Result appears because video mentions 400-pound lion

**Search for Scientific Terms**:
1. Search: **"machine learning algorithms"**
2. ✅ Finds AI and tech videos
3. Search: **"noise cancellation"**
4. ✅ Finds AirPods technology video

**Search for Expert Names**:
1. Search: **"Dr. Sarah Martinez"**
2. ✅ Finds conservation/wildlife videos

**Search for Climate Content**:
1. Search: **"Arctic ice melting"**
2. ✅ Finds polar bear/climate videos

---

### 4️⃣ Test Google Sign-In (Configuration Required)

**Expected Behavior WITHOUT Setup**:
1. Go to `/login`
2. Click "Sign in with Google"
3. ❌ Error appears: "Google Sign-In Not Configured"
4. ✅ Error message points to `/GOOGLE_OAUTH_SETUP.md`
5. Check browser console (F12)
6. ✅ See detailed error logs

**This is EXPECTED** - Google OAuth requires setup!

**Expected Behavior WITH Setup**:
1. After following `/GOOGLE_OAUTH_SETUP.md`:
2. Click "Sign in with Google"
3. ✅ Redirects to Google account selection page
4. ✅ Choose your Google account
5. ✅ Authorize the app
6. ✅ Redirected back to `/browse` signed in

---

### 5️⃣ Test Recommendation Engine

**Build Your Profile**:
1. Watch 3-4 videos from "Science & Space" category
2. Let each play for 30+ seconds
3. Watch 2-3 videos from "Technology" category

**Check Recommendations**:
1. Go back to Browse page
2. Scroll to "Recommended For You" section
3. ✅ Should see Science & Technology videos recommended
4. ✅ Videos you already watched are excluded

**View Watch History**:
1. Click "Watch History" button (if available)
2. ✅ See list of videos you've watched
3. ✅ Most recent videos appear first

---

## Advanced Search Tests

### Test Content Understanding:

| Search Term | Expected Result |
|------------|----------------|
| `spatial audio` | AirPods tech video |
| `convolutional neural networks` | AI/tech videos |
| `polar bears 400 miles` | Arctic wildlife |
| `Big Five refers to` | African Safari |
| `old growth forests` | Forest conservation |
| `infrared cameras` | Night wildlife footage |
| `Dr. Emma Thompson` | Arctic/climate videos |

### Test Multi-Word Searches:
- `artificial intelligence machine learning` → Multiple tech videos
- `climate change conservation` → Environmental videos
- `deep learning neural networks` → AI content

---

## Browser Console Debugging

### Open Console (F12) and Check:

**On Login Page**:
```
When clicking Google Sign-In, you should see:
✓ "Starting Google OAuth flow..."
✓ "Current origin: http://localhost:5173"
✓ "OAuth response: { url: '...' }" OR error message
```

**When Watching Videos**:
```
✓ "Video loaded successfully"
✓ Watch tracking messages
```

**When Searching**:
```
✓ Search query being processed
✓ Number of results found
```

---

## Testing Checklist

### Authentication ✅
- [ ] Email sign up works
- [ ] Email sign in works
- [ ] Sign out works
- [ ] User profile displays correctly
- [ ] Session persists on page refresh
- [ ] Google OAuth shows proper error (without setup)

### Video Playback ✅
- [ ] Videos load and display
- [ ] Play/pause controls work
- [ ] Volume controls work
- [ ] Fullscreen works
- [ ] Videos play smoothly
- [ ] Watch tracking activates after 30s

### AI Search ✅
- [ ] Search finds videos by title
- [ ] Search finds videos by description
- [ ] Search finds videos by content/dialogue
- [ ] Search finds videos by tags
- [ ] Multiple results displayed
- [ ] No results message when appropriate

### Recommendations ✅
- [ ] Recommendations appear after watching videos
- [ ] Recommendations match watched categories
- [ ] Previously watched videos excluded
- [ ] Recommendations update as you watch more

### UI/UX ✅
- [ ] All pages load properly
- [ ] Navigation works
- [ ] Responsive on mobile/desktop
- [ ] Animations smooth
- [ ] No console errors (except expected OAuth)

---

## Common Test Scenarios

### Scenario 1: New User Journey
1. Land on login page
2. Sign up with email
3. Browse videos
4. Watch 2-3 videos
5. Try search feature
6. See personalized recommendations
7. Sign out
8. Sign back in
9. ✅ Watch history and preferences preserved

### Scenario 2: Power User Journey
1. Sign in
2. Watch 10+ videos across multiple categories
3. Search for specific content
4. Check recommendations update
5. Use different search terms
6. ✅ AI adapts to viewing patterns

### Scenario 3: Guest User
1. Click "Continue as guest" on login
2. Browse videos
3. Watch videos
4. Search content
5. ✅ Everything works except personalized recommendations

---

## Performance Checks

### Expected Load Times:
- **Page Load**: < 2 seconds
- **Video Start**: 1-3 seconds (buffering)
- **Search Results**: < 1 second
- **Recommendations**: < 2 seconds

### Monitor:
- Browser console for errors
- Network tab for failed requests
- Video buffering/stuttering
- UI responsiveness

---

## Known Expected Behaviors

### ✅ Expected & Normal:
- Google OAuth "not configured" error without setup
- Videos buffering for 1-2 seconds
- Search returns ALL matches (not limited to 10)
- First video watch doesn't show recommendations yet
- Guest users can watch but don't get personalized recommendations

### ❌ Not Expected (Report if Occurs):
- Videos never loading
- Search returning no results for "polar bears"
- Authentication not working with email/password
- Page crashes or white screens
- Console filled with red errors (other than OAuth)

---

## Test Data Reference

### Sample Search Queries:
```
Technology: "H1 chip", "AI", "machine learning", "neural networks"
Wildlife: "polar bears", "400 pounds", "Big Five", "conservation"  
Science: "black holes", "quantum", "Mars", "ISS"
Climate: "Arctic ice", "climate change", "greenhouse"
```

### Sample Login Credentials:
```
Email: test@loopy.com
Password: Test123456
Name: Test User
```

---

## Troubleshooting During Testing

### Video Won't Play?
1. Check browser console for errors
2. Try different browser
3. Check internet connection
4. Try a different video

### Search Not Working?
1. Make sure you're typing in search box
2. Press Enter or click Search
3. Try simpler terms first
4. Check console for errors

### Google OAuth Issues?
1. This is expected without configuration
2. See `/GOOGLE_OAUTH_TROUBLESHOOTING.md`
3. Use email/password instead

### Recommendations Not Showing?
1. You need to watch 2+ videos first
2. Wait for 30+ seconds per video
3. Make sure you're signed in (not guest)
4. Refresh the page

---

## Success Criteria

Your Loopy platform is working correctly if:

✅ Email authentication fully functional  
✅ Videos play smoothly with controls  
✅ Search finds videos by content (try "H1 chip")  
✅ Recommendations appear after watching videos  
✅ Google OAuth shows helpful error (before config)  
✅ UI is responsive and smooth  
✅ No critical console errors  

---

## Next Steps After Testing

### If Everything Works:
1. ✅ Platform is ready to use!
2. Optional: Configure Google OAuth
3. Optional: Add more video content
4. Optional: Customize UI/branding

### If Issues Found:
1. Check `/GOOGLE_OAUTH_TROUBLESHOOTING.md` for OAuth
2. Check browser console for error details
3. Try different browsers
4. Review `/RECENT_UPDATES.md` for known behaviors

---

**Happy Testing! 🎉**

Remember: Google OAuth requiring setup is NORMAL. Everything else should work out of the box!
