# Quick Debug Script for Loopy

## How to Use This Script

1. Open your browser (while on the Loopy app)
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Copy and paste the script below
5. Press **Enter**
6. Wait for results

## The Debug Script

```javascript
// ============================================
// LOOPY STREAMING PLATFORM - DEBUG SCRIPT
// ============================================

console.log('🔍 Starting Loopy Diagnostics...\n');

const projectId = 'ydywwijhmjvtkgxkugnx';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXd3aWpobWp2dGtneGt1Z254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjYyMDUsImV4cCI6MjA4NjY0MjIwNX0.OpIif2nfVN38NGklmlaY6YiOk3dYQ0VZMEThAFOQeGk';
const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e24386a0`;

async function runDiagnostics() {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Test 1: Server Health
  console.log('1️⃣ Testing server health...');
  try {
    const response = await fetch(`${baseUrl}/health`, {
      headers: { 'Authorization': `Bearer ${anonKey}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is healthy:', data);
      results.passed.push('Server Health');
    } else {
      console.error('❌ Server health check failed:', response.status);
      results.failed.push(`Server Health (${response.status})`);
    }
  } catch (error) {
    console.error('❌ Server is unreachable:', error.message);
    results.failed.push('Server Health (Network Error)');
  }

  // Test 2: Videos Endpoint
  console.log('\n2️⃣ Testing videos endpoint...');
  try {
    const response = await fetch(`${baseUrl}/videos?limit=3`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Videos endpoint working. Found ${data.total} total videos`);
      console.log('Sample videos:', data.videos.map(v => v.title));
      results.passed.push(`Videos Endpoint (${data.total} videos)`);
    } else {
      const errorText = await response.text();
      console.error('❌ Videos endpoint failed:', response.status, errorText);
      results.failed.push(`Videos Endpoint (${response.status})`);
    }
  } catch (error) {
    console.error('❌ Videos endpoint error:', error.message);
    results.failed.push('Videos Endpoint (Error)');
  }

  // Test 3: Search Endpoint
  console.log('\n3️⃣ Testing search endpoint...');
  try {
    const response = await fetch(`${baseUrl}/videos/search?q=wildlife`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Search working. Found ${data.total || data.videos.length} results for "wildlife"`);
      results.passed.push('Search Endpoint');
    } else {
      console.error('❌ Search endpoint failed:', response.status);
      results.failed.push(`Search Endpoint (${response.status})`);
    }
  } catch (error) {
    console.error('❌ Search endpoint error:', error.message);
    results.failed.push('Search Endpoint (Error)');
  }

  // Test 4: Google OAuth Configuration
  console.log('\n4️⃣ Testing Google OAuth configuration...');
  try {
    // This is a client-side test - just check if Supabase client exists
    if (window.supabase || document.querySelector('[data-supabase]')) {
      console.log('⚠️ Supabase client detected. Google OAuth requires manual setup.');
      console.log('📖 See /TROUBLESHOOTING_GUIDE.md for Google OAuth setup instructions');
      results.warnings.push('Google OAuth (Requires manual setup in Supabase Dashboard)');
    } else {
      console.log('⚠️ Cannot test OAuth automatically');
      results.warnings.push('Google OAuth (Test manually via Login page)');
    }
  } catch (error) {
    results.warnings.push('Google OAuth (Test manually)');
  }

  // Test 5: Local Storage / Session
  console.log('\n5️⃣ Checking browser storage...');
  try {
    const hasLocalStorage = typeof localStorage !== 'undefined';
    const hasSessionStorage = typeof sessionStorage !== 'undefined';
    
    if (hasLocalStorage && hasSessionStorage) {
      console.log('✅ Browser storage available');
      
      // Check for auth session
      const authKeys = Object.keys(localStorage).filter(k => 
        k.includes('supabase') || k.includes('auth')
      );
      
      if (authKeys.length > 0) {
        console.log('✅ Auth session found in localStorage');
        results.passed.push('User Session (Logged in)');
      } else {
        console.log('ℹ️ No auth session found (not logged in)');
        results.warnings.push('User Session (Not logged in - Guest mode)');
      }
    } else {
      console.error('❌ Browser storage not available');
      results.failed.push('Browser Storage');
    }
  } catch (error) {
    console.error('❌ Storage check failed:', error.message);
    results.failed.push('Browser Storage');
  }

  // Test 6: CORS Check
  console.log('\n6️⃣ Checking CORS configuration...');
  // CORS is automatically checked by the fetch requests above
  if (results.passed.length >= 2) {
    console.log('✅ CORS is properly configured');
    results.passed.push('CORS Configuration');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(50));
  
  if (results.passed.length > 0) {
    console.log('\n✅ PASSED (' + results.passed.length + '):');
    results.passed.forEach(test => console.log('  ✓', test));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS (' + results.warnings.length + '):');
    results.warnings.forEach(test => console.log('  ⚠', test));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED (' + results.failed.length + '):');
    results.failed.forEach(test => console.log('  ✗', test));
  }

  // Recommendations
  console.log('\n' + '='.repeat(50));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(50));

  if (results.failed.length === 0) {
    console.log('\n🎉 All critical systems operational!');
    
    if (results.warnings.some(w => w.includes('Google OAuth'))) {
      console.log('\nℹ️ Google Sign-In requires manual setup:');
      console.log('   1. See /TROUBLESHOOTING_GUIDE.md');
      console.log('   2. Email/password sign-in works without setup');
    }
    
    if (results.warnings.some(w => w.includes('Not logged in'))) {
      console.log('\nℹ️ You are in Guest mode:');
      console.log('   - Videos will load and play');
      console.log('   - Recommendations require sign-in');
      console.log('   - Use email/password to create an account');
    }
  } else {
    console.log('\n🔧 ACTION REQUIRED:');
    
    if (results.failed.some(f => f.includes('Server Health'))) {
      console.log('\n❗ Server not responding:');
      console.log('   1. Go to Supabase Dashboard → Edge Functions');
      console.log('   2. Check if make-server-e24386a0 is deployed');
      console.log('   3. Click Deploy to redeploy');
      console.log('   4. Wait 60 seconds and refresh this page');
    }
    
    if (results.failed.some(f => f.includes('Videos Endpoint'))) {
      console.log('\n❗ Videos endpoint failing:');
      console.log('   1. Check Supabase Edge Function logs');
      console.log('   2. Verify the function has no errors');
      console.log('   3. Redeploy if needed');
    }

    if (results.failed.some(f => f.includes('Browser Storage'))) {
      console.log('\n❗ Browser storage blocked:');
      console.log('   1. Check browser privacy settings');
      console.log('   2. Disable "Block all cookies"');
      console.log('   3. Try incognito/private mode');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('For detailed troubleshooting, see /TROUBLESHOOTING_GUIDE.md');
  console.log('='.repeat(50) + '\n');

  return results;
}

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostic script failed:', error);
  console.log('Please report this error with the message above');
});
```

## What This Script Does

1. ✅ **Tests Server Health** - Verifies the backend is running
2. ✅ **Tests Videos Endpoint** - Checks if videos can be loaded
3. ✅ **Tests Search** - Verifies AI search functionality
4. ⚠️ **Checks OAuth** - Reminds about Google Sign-In setup
5. ✅ **Checks Session** - See if you're logged in
6. ✅ **Checks CORS** - Verifies cross-origin requests work

## Understanding the Results

### ✅ Green Checkmarks
Everything is working! No action needed.

### ⚠️ Yellow Warnings
Not critical, but informational:
- **Google OAuth warning**: Normal, requires manual setup
- **Not logged in**: Expected if you haven't signed in yet

### ❌ Red X's
Something is broken and needs fixing:
- **Server Health Failed**: Backend not running → Redeploy Edge Function
- **Videos Endpoint Failed**: Database issue → Check logs
- **Browser Storage Failed**: Privacy settings → Allow cookies

## Quick Fixes

### If Server Tests Fail:
1. Go to https://supabase.com/dashboard
2. Navigate to Edge Functions
3. Find `make-server-e24386a0`
4. Click **Deploy**
5. Wait 60 seconds
6. Run this script again

### If Storage Tests Fail:
1. Check if cookies are blocked
2. Try incognito/private mode
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try a different browser

### If Everything Passes:
🎉 Your app is working correctly! The "could not load make" error might be:
- A temporary glitch (try refreshing)
- A build issue (check the browser console for import errors)
- A network issue (check your internet connection)

## Next Steps

After running this script:

1. **If tests pass**: Your backend is working!
   - The issue might be frontend-related
   - Check browser console for React/import errors
   - Try hard refresh (Ctrl+Shift+R)

2. **If tests fail**: Follow the recommendations printed by the script
   - Usually requires redeploying the Edge Function
   - Or checking Supabase configuration

3. **For Google Sign-In**: Manual setup required
   - See `/TROUBLESHOOTING_GUIDE.md`
   - Or use email/password authentication instead
