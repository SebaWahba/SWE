# Quick Reference Card

## 🚨 Error? Start Here!

### "Could not load make" or "Load previous failed"
```
1. Go to: https://supabase.com/dashboard/project/ydywwijhmjvtkgxkugnx
2. Click: Edge Functions (left sidebar)
3. Click: make-server-e24386a0
4. Click: Deploy button
5. Wait: 60 seconds
6. Refresh your app
```
**This fixes 80% of errors!**

---

## 🛠️ Diagnostic Tools (Use These!)

### 1. Status Indicator
- **Location**: Top-right corner
- **What it shows**: Real-time server health
- **Colors**:
  - 🟢 Green = All good
  - 🟡 Yellow = Issues detected
  - 🔴 Red = Server down
- **Click it** for fix instructions

### 2. Diagnostic Panel  
- **Location**: Bottom-right corner
- **Button says**: "Run Diagnostics"
- **What it does**: Tests all systems
- **Results**:
  - ✅ = Working
  - ❌ = Broken
  - ⚠️ = Warning

### 3. Browser Console
- **How to open**: Press F12
- **What to look for**: Red error messages
- **Most helpful**: Copy errors and search in guides

---

## 📚 Documentation Quick Links

| Guide | When to Use |
|-------|-------------|
| **START_HERE.md** | First time or confused |
| **TROUBLESHOOTING_GUIDE.md** | Specific error to fix |
| **QUICK_DEBUG_SCRIPT.md** | Want automated testing |
| **FIXES_APPLIED.md** | Want to know what changed |
| **README.md** | General project info |

---

## 🔐 Authentication

### Email/Password ✅ (Easiest)
1. Click "Sign Up"
2. Enter email, password, name
3. Click "Create Account"
4. Done! No setup needed.

### Google Sign-In ⚙️ (Requires Setup)
**Don't use this unless you want to spend 15-20 minutes on setup!**

If you really want it:
→ See TROUBLESHOOTING_GUIDE.md → Section "Issue 2"

**Alternative**: Just use email/password - same features!

---

## 🎯 Feature Checklist

### Works Without Login:
- ✅ Browse videos
- ✅ Search videos  
- ✅ Play videos
- ✅ View all categories

### Requires Login:
- 🔐 Watch history
- 🔐 Personalized recommendations
- 🔐 Continue watching

**How to get recommendations:**
1. Sign in (email/password)
2. Watch 1-2 videos (at least 30 seconds each)
3. Go back to Browse page
4. See "Recommended for You" section

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **F12** | Open browser console / dev tools |
| **Ctrl+Shift+R** (Win) | Hard refresh / clear cache |
| **Cmd+Shift+R** (Mac) | Hard refresh / clear cache |
| **Ctrl+Shift+Delete** | Clear browser cache/cookies |

---

## 🔍 AI Search Examples

Try searching for these to test AI search:

| Search Term | What It Finds |
|-------------|---------------|
| **AirPods** | Technology video about wireless earbuds |
| **polar bear** | Arctic wildlife documentary |
| **jaguar hunting** | Wild Kingdom nature footage |
| **Big Five** | African Safari video |
| **black holes** | Science & Space documentary |

**Note**: Only first few videos have detailed content. Most use title/description/tags.

---

## 🐛 Common Errors & Instant Fixes

### Error: Server Not Responding
**Quick Fix**: Redeploy Edge Function (see top of this page)

### Error: Google Sign-In Failed  
**Quick Fix**: Use email/password instead OR follow full setup guide

### Error: Videos Not Loading
**Quick Fix**: 
1. Check status indicator (top-right)
2. If red, redeploy Edge Function
3. If green, check browser console

### Error: No Recommendations Showing
**This is normal if:**
- You're not logged in → Sign in
- You haven't watched videos → Watch 1-2 videos
- You just logged in → Watch more videos

---

## 📊 Video Categories

1. Nature & Wildlife
2. Science & Space
3. Technology
4. Travel & Adventure
5. Food & Cooking
6. Education
7. History
8. Health & Wellness

**Total**: 200+ videos across 8 categories

---

## 🔗 Important URLs

| What | URL |
|------|-----|
| **Supabase Dashboard** | https://supabase.com/dashboard/project/ydywwijhmjvtkgxkugnx |
| **Edge Functions** | Dashboard → Edge Functions |
| **Project ID** | ydywwijhmjvtkgxkugnx |

---

## 🎨 UI Elements

### Status Colors
- 🟢 Green = Success / Working / Healthy
- 🟡 Yellow = Warning / Needs attention
- 🔴 Red = Error / Critical / Down
- ⚪ Gray = Loading / Checking

### Icons
- ✅ Checkmark = Test passed
- ❌ X = Test failed  
- ⚠️ Warning triangle = Info/warning
- 🔄 Refresh = Loading/checking

---

## 💡 Pro Tips

1. **Always check status indicator first** (top-right)
   - Tells you instantly if backend is working

2. **Use diagnostic panel for deep checks** (bottom-right)
   - Tests every system component

3. **Browser console shows everything** (F12)
   - Most detailed error information

4. **Email/password is easier than Google**
   - No setup, works immediately

5. **Hard refresh fixes cache issues**
   - Ctrl+Shift+R (or Cmd+Shift+R)

6. **Redeploy fixes most server errors**
   - Supabase Dashboard → Edge Functions → Deploy

---

## 🚀 Quick Start

**First time using the app:**

1. Open app in browser
2. Check status (top-right) → Should be green
3. Browse videos (works without login)
4. Sign up with email/password
5. Watch 1-2 videos  
6. Check recommendations on Browse page

**That's it!**

---

## ⚡ Emergency Reset

**If everything is broken:**

```
1. Ctrl+Shift+Delete → Clear ALL cache/cookies
2. Close browser completely
3. Go to Supabase Dashboard
4. Edge Functions → make-server-e24386a0 → Deploy
5. Wait 60 seconds
6. Open app in new browser tab
7. Hard refresh: Ctrl+Shift+R
```

This fixes 95% of issues.

---

## 📞 Help Priority

**When you see an error:**

1. ✅ Check status indicator (10 seconds)
2. ✅ Run diagnostic panel (30 seconds)  
3. ✅ Try quick fix from this guide (2 minutes)
4. ✅ Check TROUBLESHOOTING_GUIDE.md (5-10 minutes)
5. ✅ Run debug script in console (2 minutes)

**Most issues fixed within 5 minutes!**

---

## 🎯 Success Indicators

**You'll know it's working when:**

- ✅ Status indicator shows green
- ✅ Browse page shows videos
- ✅ Videos play when clicked
- ✅ Search finds results
- ✅ Can create account
- ✅ Can sign in
- ✅ Recommendations appear (after watching videos)

**All green? You're good to go!**

---

## 📋 Troubleshooting Decision Tree

```
Is status indicator GREEN?
├─ YES → Backend is working
│  ├─ Videos loading? → All good!
│  └─ Videos NOT loading? → Check browser console
└─ NO (Red/Yellow) → Backend issue
   └─ FIX: Redeploy Edge Function

Can you sign in with email/password?
├─ YES → Auth is working
└─ NO → Check browser console for error

Do recommendations appear?
├─ YES → Personalization working
└─ NO → Did you:
   ├─ Sign in? (Required)
   ├─ Watch videos? (Required)
   └─ Return to Browse page? (Required)
```

---

## 🎁 Bonus: Console Test Command

**Quick health check** - Paste in console (F12):

```javascript
fetch('https://ydywwijhmjvtkgxkugnx.supabase.co/functions/v1/make-server-e24386a0/health', {
  headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXd3aWpobWp2dGtneGt1Z254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjYyMDUsImV4cCI6MjA4NjY0MjIwNX0.OpIif2nfVN38NGklmlaY6YiOk3dYQ0VZMEThAFOQeGk'}
}).then(r=>r.json()).then(console.log)
```

**Should print**: `{status: "ok"}`

If not → Redeploy Edge Function

---

**Keep this card handy for quick reference!**

For detailed help, see the full guides in the project root.
