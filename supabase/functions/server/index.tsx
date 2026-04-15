import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as auth from "./auth.tsx";

const app = new Hono();

// Create Supabase clients
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
};

const getSupabaseAnonClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
};

const sanitizeReturnOrigin = (value: string | undefined): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }

    return parsed.origin;
  } catch {
    return '';
  }
};

const getDefaultAppOrigin = (): string => {
  const configuredOrigin = sanitizeReturnOrigin(
    Deno.env.get('APP_URL') || Deno.env.get('FRONTEND_URL') || Deno.env.get('SITE_URL') || '',
  );

  return configuredOrigin || 'http://localhost:5173';
};

const buildLoginRedirectUrl = (
  returnOrigin: string,
  params: Record<string, string>,
): string => {
  const resolvedOrigin = returnOrigin || getDefaultAppOrigin();
  const redirectUrl = new URL('/login', resolvedOrigin);

  Object.entries(params).forEach(([key, value]) => {
    redirectUrl.searchParams.set(key, value);
  });

  return redirectUrl.toString();
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e24386a0/health", (c) => {
  return c.json({ 
    status: "ok",
    env_check: {
      GOOGLE_CLIENT_ID: Deno.env.get('GOOGLE_CLIENT_ID') ? '✅ SET' : '❌ MISSING',
      GOOGLE_CLIENT_SECRET: Deno.env.get('GOOGLE_CLIENT_SECRET') ? '✅ SET' : '❌ MISSING',
      OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY') ? '✅ SET' : '❌ MISSING',
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? '✅ SET' : '❌ MISSING',
      SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') ? '✅ SET' : '❌ MISSING',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✅ SET' : '❌ MISSING'
    }
  });
});

// Reset videos database endpoint (for debugging)
app.post("/make-server-e24386a0/reset-videos", async (c) => {
  try {
    await kv.del('videos_database');
    const newVideos = await initializeVideosDatabase();
    return c.json({ success: true, message: "Videos database reset", count: newVideos.length });
  } catch (error) {
    console.log(`Error resetting videos: ${error}`);
    return c.json({ error: "Failed to reset videos" }, 500);
  }
});

// ===== CUSTOM AUTH ENDPOINTS (No Supabase Auth!) =====

// Sign up with email/password
app.post("/make-server-e24386a0/auth/signup", async (c) => {
  try {
    const { email, password, name, returnOrigin } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const safeReturnOrigin = sanitizeReturnOrigin(returnOrigin);
    const result = await auth.signUp(email, password, name, safeReturnOrigin);
    console.log(`✅ User registered: ${email}`);
    
    return c.json(result, 201);
  } catch (error: any) {
    console.log(`❌ Sign up error: ${error.message}`);
    return c.json({ error: error.message || "Sign up failed" }, 400);
  }
});

app.post("/make-server-e24386a0/auth/resend-verification", async (c) => {
  try {
    const { email, returnOrigin } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const safeReturnOrigin = sanitizeReturnOrigin(returnOrigin);
    const result = await auth.resendVerificationEmail(email, safeReturnOrigin);
    return c.json(result);
  } catch (error: any) {
    console.log(`❌ Resend verification error: ${error.message}`);
    return c.json({ error: error.message || 'Failed to resend verification email' }, 400);
  }
});

app.post('/make-server-e24386a0/auth/verification-status', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const status = await auth.getVerificationStatus(email);
    return c.json(status);
  } catch (error: any) {
    console.log(`❌ Verification status error: ${error.message}`);
    return c.json({ error: error.message || 'Failed to get verification status' }, 400);
  }
});

// Sign in with email/password
app.post("/make-server-e24386a0/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const result = await auth.signIn(email, password);
    console.log(`✅ User signed in: ${email}`);
    
    return c.json(result);
  } catch (error: any) {
    console.log(`❌ Sign in error: ${error.message}`);
    return c.json({ error: error.message || "Sign in failed" }, 401);
  }
});

app.get('/make-server-e24386a0/auth/verify-email', async (c) => {
  const token = c.req.query('token') || '';
  const safeReturnOrigin = sanitizeReturnOrigin(c.req.query('returnOrigin') || '');

  if (!token) {
    const missingTokenRedirect = buildLoginRedirectUrl(safeReturnOrigin, {
      verified: 'failed',
      reason: 'missing_token',
    });
    return c.redirect(missingTokenRedirect);
  }

  try {
    const user = await auth.verifyEmailToken(token);
    const successRedirect = buildLoginRedirectUrl(safeReturnOrigin, {
      verified: 'success',
      email: user.email,
    });

    return c.redirect(successRedirect);
  } catch (error: any) {
    console.log(`❌ Email verification error: ${error.message}`);
    const reason = String(error?.message || '').toLowerCase().includes('expired')
      ? 'expired'
      : 'invalid';

    const failureRedirect = buildLoginRedirectUrl(safeReturnOrigin, {
      verified: 'failed',
      reason,
    });

    return c.redirect(failureRedirect);
  }
});

// Google OAuth - Get authorization URL
app.post("/make-server-e24386a0/auth/google", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const returnOrigin = sanitizeReturnOrigin(body.returnOrigin || '');
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-e24386a0/auth/google/callback`;

    console.log(`🔍 GOOGLE_CLIENT_ID: ${googleClientId ? `${googleClientId.substring(0, 20)}...` : 'MISSING'}`);
    console.log(`🔍 GOOGLE_CLIENT_SECRET: ${googleClientSecret ? 'SET (hidden)' : 'MISSING'}`);
    console.log(`🔍 Redirect URI: ${redirectUri}`);
    console.log(`🔍 Return Origin: ${returnOrigin}`);

    if (!googleClientId || !googleClientSecret) {
      return c.json({ 
        error: "Google OAuth not configured",
        setupInstructions: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Supabase environment variables"
      }, 500);
    }

    // Generate state for CSRF protection - also store returnOrigin
    const state = crypto.randomUUID();
    await kv.set(`oauth_state:${state}`, { timestamp: Date.now(), returnOrigin });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state
    })}`;

    console.log(`🔗 Google OAuth URL generated`);
    return c.json({ url: authUrl });
  } catch (error: any) {
    console.log(`❌ Google OAuth error: ${error.message}`);
    return c.json({ error: "Failed to initiate Google sign-in" }, 500);
  }
});

// Google OAuth - Callback handler
app.get("/make-server-e24386a0/auth/google/callback", async (c) => {
  try {
    const code = c.req.query('code');
    const state = c.req.query('state');
    const error = c.req.query('error');

    if (error) {
      console.log(`❌ Google OAuth error: ${error}`);
      return c.redirect(buildLoginRedirectUrl('', { error }));
    }

    if (!code || !state) {
      return c.redirect(buildLoginRedirectUrl('', { error: 'missing_code' }));
    }

    // Verify state and get returnOrigin
    const storedState = await kv.get(`oauth_state:${state}`);
    if (!storedState) {
      return c.redirect(buildLoginRedirectUrl('', { error: 'invalid_state' }));
    }
    const returnOrigin = sanitizeReturnOrigin(storedState.returnOrigin || '');
    await kv.del(`oauth_state:${state}`);

    // Exchange code for tokens
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-e24386a0/auth/google/callback`;

    console.log(`🔄 Exchanging code for tokens with Client ID: ${googleClientId?.substring(0, 20)}...`);
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.log(`❌ Token exchange failed (${tokenResponse.status}): ${JSON.stringify(tokens)}`);
      return c.redirect(buildLoginRedirectUrl(returnOrigin, { error: 'token_failed' }));
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });

    const googleUser = await userInfoResponse.json();

    // Create or get existing user
    const result = await auth.getOrCreateGoogleUser(googleUser);
    
    console.log(`✅ Google OAuth successful: ${googleUser.email}`);
    const loginRedirect = buildLoginRedirectUrl(returnOrigin, {
      success: 'true',
      token: result.session.access_token,
    });

    console.log(`🔗 Redirecting to: ${loginRedirect}`);
    return c.redirect(loginRedirect);
  } catch (error: any) {
    console.log(`❌ Google OAuth callback error: ${error.message}`);
    return c.redirect(buildLoginRedirectUrl('', { error: 'auth_failed' }));
  }
});

// Get current user (session check)
app.get("/make-server-e24386a0/auth/user", async (c) => {
  try {
    const user = await auth.getUserFromAuth(c.req.header('Authorization'));
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ user });
  } catch (error: any) {
    console.log(`❌ Get user error: ${error.message}`);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// Sign out
app.post("/make-server-e24386a0/auth/signout", async (c) => {
  // With JWT, sign-out is handled client-side by deleting the token
  return c.json({ success: true });
});

// ===== VIDEO ENDPOINTS =====

// Get all videos (with optional pagination and category filter)
app.get("/make-server-e24386a0/videos", async (c) => {
  try {
    const category = c.req.query('category');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    // Get videos from KV store
    const allVideos = await kv.get('videos_database') || await initializeVideosDatabase();
    
    let filteredVideos = allVideos;
    if (category && category !== 'All') {
      filteredVideos = allVideos.filter((v: any) => v.category === category);
    }

    const paginatedVideos = filteredVideos.slice(offset, offset + limit);
    
    return c.json({ 
      videos: paginatedVideos,
      total: filteredVideos.length,
      limit,
      offset
    });
  } catch (error) {
    console.log(`Error fetching videos: ${error}`);
    return c.json({ error: "Failed to fetch videos" }, 500);
  }
});

// Search videos by description (basic keyword search)
app.get("/make-server-e24386a0/videos/search", async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase();
    
    if (!query) {
      return c.json({ videos: [] });
    }

    const allVideos = await kv.get('videos_database') || await initializeVideosDatabase();
    
    // Enhanced search in title, description, aiSummary, tags, AND videoContent
    const results = allVideos.filter((video: any) => {
      const searchableText = `${video.title} ${video.description} ${video.aiSummary} ${video.tags.join(' ')} ${video.videoContent || ''}`.toLowerCase();
      return searchableText.includes(query);
    });

    return c.json({ videos: results, total: results.length });
  } catch (error) {
    console.log(`Error searching videos: ${error}`);
    return c.json({ error: "Search failed" }, 500);
  }
});

// AI-powered natural language search across all videos
app.post("/make-server-e24386a0/ai-search", async (c) => {
  try {
    const { query, conversationHistory } = await c.req.json();
    
    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const allVideos = await kv.get('videos_database') || await initializeVideosDatabase();

    // Build a compact catalog of all videos for the AI
    const videoCatalog = allVideos.map((v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      category: v.category,
      tags: v.tags.join(', '),
      aiSummary: v.aiSummary,
      content: v.videoContent ? v.videoContent.substring(0, 300) : '',
      year: v.year,
      duration: v.duration,
    }));

    const systemPrompt = `You are Loopy AI, an intelligent video search assistant for a streaming platform called Loopy. You have access to a library of ${allVideos.length} videos.

Your job is to understand what the user is looking for using natural language and find the most relevant videos. You can understand:
- Content descriptions ("show me videos about polar bears hunting")
- Dialogue/transcript searches ("where does someone talk about AirPods noise cancellation")
- Category browsing ("what cooking videos do you have")
- Mood/vibe requests ("something relaxing to watch")
- Specific facts ("which video mentions Dr. Sarah Martinez")
- Multi-criteria ("a short technology video from 2024")

IMPORTANT: You must respond in valid JSON format with this structure:
{
  "message": "Your conversational response explaining what you found and why these videos are relevant. Be helpful, specific, and mention key details about the content.",
  "results": [
    {
      "videoId": "the video id",
      "relevance": 95,
      "reason": "Brief reason why this matches",
      "suggestedTimestamp": "MM:SS or null if not applicable"
    }
  ]
}

Always return results sorted by relevance (highest first). Return up to 10 results maximum. If nothing matches, return an empty results array with a helpful message suggesting alternatives.

Here is the complete video catalog:
${JSON.stringify(videoCatalog, null, 0)}`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history for multi-turn chat
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-6)) { // Last 6 messages for context
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: query });

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.log(`OpenAI API error in AI search: ${openaiResponse.status} - ${errorData}`);
      return c.json({ error: "AI service error" }, 500);
    }

    const data = await openaiResponse.json();
    const aiContent = data.choices[0]?.message?.content || '{}';
    
    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch {
      parsed = { message: aiContent, results: [] };
    }

    // Enrich results with full video data
    const enrichedResults = (parsed.results || []).map((r: any) => {
      const video = allVideos.find((v: any) => v.id === String(r.videoId));
      if (!video) return null;
      return {
        ...r,
        video: {
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          category: video.category,
          duration: video.duration,
          year: video.year,
          tags: video.tags,
        }
      };
    }).filter(Boolean);

    return c.json({
      message: parsed.message || "Here are your results.",
      results: enrichedResults,
    });
  } catch (error) {
    console.log(`Error in AI search: ${error}`);
    return c.json({ error: "AI search failed" }, 500);
  }
});

// Get single video
app.get("/make-server-e24386a0/videos/:id", async (c) => {
  try {
    const videoId = c.req.param('id');
    const allVideos = await kv.get('videos_database') || await initializeVideosDatabase();
    const video = allVideos.find((v: any) => v.id === videoId);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }

    return c.json({ video });
  } catch (error) {
    console.log(`Error fetching video: ${error}`);
    return c.json({ error: "Failed to fetch video" }, 500);
  }
});

// ===== WATCH HISTORY & RECOMMENDATIONS =====

// Track video watch
app.post("/make-server-e24386a0/watch", async (c) => {
  try {
    const user = await auth.getUserFromAuth(c.req.header('Authorization'));
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { videoId, watchDuration, totalDuration } = await c.req.json();
    
    if (!videoId) {
      return c.json({ error: "Video ID is required" }, 400);
    }

    // Get current watch history
    const historyKey = `watch_history:${user.id}`;
    const history = await kv.get(historyKey) || [];
    
    // Get video details
    const allVideos = await kv.get('videos_database') || await initializeVideosDatabase();
    const video = allVideos.find((v: any) => v.id === videoId);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }

    // Add to watch history
    const watchRecord = {
      videoId,
      timestamp: new Date().toISOString(),
      watchDuration,
      totalDuration,
      category: video.category,
      tags: video.tags,
      completed: watchDuration && totalDuration ? (watchDuration / totalDuration) > 0.8 : false
    };

    // Keep last 100 watch records
    const updatedHistory = [watchRecord, ...history].slice(0, 100);
    await kv.set(historyKey, updatedHistory);

    // Update user preferences based on watch behavior
    await updateUserPreferences(user.id, video, watchRecord);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error tracking watch: ${error}`);
    return c.json({ error: "Failed to track watch" }, 500);
  }
});

// Get personalized recommendations
app.get("/make-server-e24386a0/recommendations", async (c) => {
  try {
    const user = await auth.getUserFromAuth(c.req.header('Authorization'));
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allVideos = await kv.get('videos_database') || await initializeVideosDatabase();
    const watchHistory = await kv.get(`watch_history:${user.id}`) || [];
    const userPreferences = await kv.get(`user_preferences:${user.id}`) || { favoriteCategories: [], favoriteTags: [] };

    // Calculate recommendations based on watch history
    const recommendations = calculateRecommendations(allVideos, watchHistory, userPreferences);

    return c.json({ recommendations });
  } catch (error) {
    console.log(`Error getting recommendations: ${error}`);
    return c.json({ error: "Failed to get recommendations" }, 500);
  }
});

// Get watch history
app.get("/make-server-e24386a0/watch-history", async (c) => {
  try {
    const user = await auth.getUserFromAuth(c.req.header('Authorization'));
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const history = await kv.get(`watch_history:${user.id}`) || [];
    const allVideos = await kv.get('videos_database') || await initializeVideosDatabase();
    
    // Enrich history with video details
    const enrichedHistory = history.map((record: any) => {
      const video = allVideos.find((v: any) => v.id === record.videoId);
      return { ...record, video };
    }).filter((record: any) => record.video);

    return c.json({ history: enrichedHistory });
  } catch (error) {
    console.log(`Error fetching watch history: ${error}`);
    return c.json({ error: "Failed to fetch watch history" }, 500);
  }
});

// AI Chat endpoint for video assistant
app.post("/make-server-e24386a0/ai-chat", async (c) => {
  try {
    const { question, videoId, videoTitle, videoDescription, aiSummary, tags, videoContent } = await c.req.json();
    
    if (!question) {
      return c.json({ error: "Question is required" }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    // Prepare context about the video for the AI
    const videoContext = `
Video Title: ${videoTitle}
Description: ${videoDescription}
Category: ${tags.join(', ')}
AI Summary: ${aiSummary}
${videoContent ? `Detailed Content/Transcript: ${videoContent}` : ''}
    `.trim();

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful video assistant for a streaming platform called Loopy. You help users understand video content and can suggest specific timestamps to jump to. When a user asks about a specific topic or moment in the video, provide helpful information and when relevant, suggest a timestamp in the format [TIMESTAMP:MM:SS] where they should skip to. For example, if they ask "where do they talk about polar bears", you might respond "The polar bear segment begins around [TIMESTAMP:02:30] where the narrator discusses..." Always be concise, friendly, and helpful. Here's the video information you're helping with:\n\n${videoContext}`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.log(`OpenAI API error: ${openaiResponse.status} - ${errorData}`);
      return c.json({ error: "AI service error" }, 500);
    }

    const data = await openaiResponse.json();
    const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return c.json({ response: aiResponse });
  } catch (error) {
    console.log(`Error in AI chat: ${error}`);
    return c.json({ error: "Failed to process AI chat" }, 500);
  }
});

// Helper function to update user preferences
async function updateUserPreferences(userId: string, video: any, watchRecord: any) {
  const prefsKey = `user_preferences:${userId}`;
  const prefs = await kv.get(prefsKey) || { favoriteCategories: {}, favoriteTags: {}, lastActive: null };
  
  // Update category preferences (weighted by watch completion)
  if (!prefs.favoriteCategories) prefs.favoriteCategories = {};
  const weight = watchRecord.completed ? 2 : 1;
  prefs.favoriteCategories[video.category] = (prefs.favoriteCategories[video.category] || 0) + weight;
  
  // Update tag preferences
  if (!prefs.favoriteTags) prefs.favoriteTags = {};
  video.tags.forEach((tag: string) => {
    prefs.favoriteTags[tag] = (prefs.favoriteTags[tag] || 0) + weight;
  });
  
  prefs.lastActive = new Date().toISOString();
  
  await kv.set(prefsKey, prefs);
}

// Helper function to calculate recommendations
function calculateRecommendations(allVideos: any[], watchHistory: any[], userPreferences: any) {
  const watchedVideoIds = new Set(watchHistory.map((h: any) => h.videoId));
  
  // Score each unwatched video based on user preferences
  const scoredVideos = allVideos
    .filter(video => !watchedVideoIds.has(video.id))
    .map(video => {
      let score = 0;
      
      // Category match score
      const categoryScore = userPreferences.favoriteCategories?.[video.category] || 0;
      score += categoryScore * 2;
      
      // Tag match score
      video.tags.forEach((tag: string) => {
        const tagScore = userPreferences.favoriteTags?.[tag] || 0;
        score += tagScore;
      });
      
      // Add some randomness to avoid always showing the same content
      score += Math.random() * 2;
      
      return { ...video, score };
    })
    .sort((a, b) => b.score - a.score);
  
  return scoredVideos.slice(0, 20);
}

// Initialize videos database with hundreds of videos
async function initializeVideosDatabase() {
  const videos = [
    // Nature & Wildlife (50 videos)
    {
      id: "1",
      title: "Wild Kingdom: The Last Frontiers",
      description: "An epic journey through Earth's most remote wilderness areas, documenting rare species and forest animals in their natural habitats.",
      thumbnail: "https://images.unsplash.com/photo-1719743441581-632023e3d2ff?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "58:42",
      category: "Nature & Wildlife",
      year: 2024,
      aiSummary: "Features detailed footage of wildlife behavior and conservation efforts in the deep forest.",
      tags: ["wildlife", "animals", "nature", "forest"],
      videoContent: "Narrator begins: Welcome to the last great wilderness frontiers on Earth. Today we journey deep into pristine forests where endangered species still roam free. Watch as a mother bear teaches her cubs to fish in crystal clear streams. The forest canopy above provides shelter to countless bird species. Conservation biologists explain how protecting these habitats is crucial for biodiversity. Dr. Sarah Martinez states: These old growth forests are irreplaceable ecosystems that took thousands of years to develop. We see rare footage of a jaguar hunting at night using infrared cameras. The documentary explores how deforestation threatens these animals. Indigenous guides share their knowledge of medicinal plants found only in these remote areas. Climate change impacts are visible in shifting migration patterns of caribou herds."
    },
    {
      id: "2",
      title: "African Safari: Big Five Adventure",
      description: "Experience the thrill of tracking lions, elephants, rhinos, leopards, and buffalo across the African savanna.",
      thumbnail: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "52:30",
      category: "Nature & Wildlife",
      year: 2024,
      aiSummary: "Documentary showcasing Africa's most iconic animals in stunning 4K detail.",
      tags: ["africa", "safari", "big five", "wildlife"],
      videoContent: "Our safari adventure begins at dawn on the Serengeti plains. Expert tracker John explains: The Big Five refers to the five most difficult animals to hunt on foot - lion, elephant, rhino, leopard, and buffalo. We encounter a pride of lions resting under acacia trees after a successful hunt. The alpha male weighs over 400 pounds and has a magnificent mane. Elephants march in a matriarchal herd led by the oldest female who remembers water sources across hundreds of miles. Baby elephants play and learn survival skills from their mothers. A rare black rhinoceros appears near a waterhole - critically endangered with only 5000 left in the wild. Poaching remains the biggest threat despite conservation efforts. Leopards are the most elusive, we spot one dragging prey up a tree to protect from scavengers. Cape buffalo travel in massive herds providing safety in numbers."
    },
    {
      id: "3",
      title: "Arctic Wildlife: Survival in the Ice",
      description: "Polar bears, arctic foxes, and seals navigate the harsh frozen landscape of the Arctic Circle.",
      thumbnail: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      duration: "47:15",
      category: "Nature & Wildlife",
      year: 2023,
      aiSummary: "Explores adaptation strategies of animals living in extreme cold environments.",
      tags: ["arctic", "polar bears", "cold climate", "survival"],
      videoContent: "Life in the Arctic requires incredible adaptations to survive. Polar bears are the apex predators perfectly designed for this frozen world. Their white fur provides camouflage while hunting seals on sea ice. We follow a mother polar bear and her two cubs as they hunt for ringed seals. Climate scientist Dr. Emma Thompson warns: Arctic ice is melting at alarming rates forcing polar bears to travel greater distances to find food. Some bears now swim over 400 miles looking for ice platforms. Arctic foxes change their coat color from brown in summer to pure white in winter for camouflage. They have the warmest fur of any mammal allowing them to withstand temperatures of minus 70 degrees Fahrenheit. Seals give birth to pups on the ice and must protect them from polar bear attacks. Walruses gather in massive groups on ice floes, their tusks can grow up to 3 feet long."
    },
    {
      id: "4",
      title: "Amazon Rainforest: Lost World",
      description: "Journey deep into the Amazon to discover colorful birds, jaguars, monkeys, and countless insect species.",
      thumbnail: "https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "61:20",
      category: "Nature & Wildlife",
      year: 2024,
      aiSummary: "Reveals the incredible biodiversity of the world's largest rainforest.",
      tags: ["amazon", "rainforest", "biodiversity", "jungle"],
      videoContent: "The Amazon Rainforest spans nine countries and produces 20% of the world's oxygen. We descend into the understory where poisonous dart frogs display brilliant warning colors. Harpy eagles the most powerful raptors in the world hunt monkeys through the canopy. River dolphins swim through flooded forests during rainy season. A jaguar stalks peccaries along a riverbank at dusk. Entomologist Dr. Raul Vega discovers new insect species: We estimate there are still millions of unknown species in the Amazon. Indigenous Yanomami tribes share their knowledge of over 500 medicinal plants. Deforestation threatens to turn the Amazon from a carbon sink to a carbon source."
    },
    {
      id: "5",
      title: "Ocean Giants: Whales and Dolphins",
      description: "Witness the majestic beauty of humpback whales, orcas, and playful dolphin pods in crystal-clear waters.",
      thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "55:00",
      category: "Nature & Wildlife",
      year: 2024,
      aiSummary: "Captures intimate moments of marine mammals in their ocean habitats.",
      tags: ["whales", "dolphins", "ocean", "marine life"],
      videoContent: "Humpback whales sing complex songs that travel hundreds of miles underwater. Marine biologist Dr. Luna Park explains: Each whale population has its own distinct song that evolves over time. We film a mother humpback teaching her calf bubble-net feeding techniques in Alaska. Orcas hunt in coordinated pods using wave-washing strategies to knock seals off ice floes. Bottlenose dolphins use echolocation to find fish buried in sand. A pod of spinner dolphins performs acrobatic leaps at sunset. Blue whales the largest animals ever to live on Earth filter four tons of krill daily through their baleen plates."
    },

    // Science & Space (50 videos)
    {
      id: "6",
      title: "Cosmos Unveiled: Journey to Infinity",
      description: "A breathtaking exploration of our universe and deep space, from black holes to distant galaxies and nebulae.",
      thumbnail: "https://images.unsplash.com/photo-1650365449083-b3113ff48337?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: "62:15",
      category: "Science & Space",
      year: 2024,
      aiSummary: "A cinematic space odyssey exploring the birth of stars and the mechanics of black holes.",
      tags: ["space", "astronomy", "cosmos", "universe"],
      videoContent: "The observable universe contains over 200 billion galaxies each with hundreds of billions of stars. Astrophysicist Dr. Neil Patel explains how stars are born in giant molecular clouds called nebulae. Gravity pulls hydrogen gas together until nuclear fusion ignites creating a new star. We visualize how black holes form when massive stars collapse creating singularities with infinite density. The event horizon is the point of no return where not even light can escape. Recent images from the Event Horizon Telescope show the shadow of the supermassive black hole at the center of M87. Dark energy is accelerating the expansion of the universe pushing galaxies apart. The cosmic microwave background radiation is the oldest light in the universe dating back 13.8 billion years."
    },
    {
      id: "7",
      title: "Mars: The Red Planet Mystery",
      description: "Exploring Mars through NASA rover footage, ancient riverbeds, and the search for past microbial life.",
      thumbnail: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: "48:30",
      category: "Science & Space",
      year: 2025,
      aiSummary: "Chronicles the latest discoveries from Mars missions and future colonization plans.",
      tags: ["mars", "nasa", "rovers", "planets"],
      videoContent: "NASA's Perseverance rover landed in Jezero Crater in February 2021 searching for signs of ancient microbial life. The rover's SHERLOC instrument analyzes minerals that may have preserved biosignatures. Ingenuity the first helicopter on another planet has completed over 70 flights. Ancient riverbeds and delta formations prove Mars once had flowing water. SpaceX's Starship is designed to carry humans to Mars by the late 2020s. Elon Musk envisions a self-sustaining city on Mars within our lifetime. The thin Martian atmosphere is 95% carbon dioxide with temperatures dropping to minus 80 degrees Fahrenheit. MOXIE successfully produced oxygen from the Martian atmosphere proving in-situ resource utilization is possible."
    },
    {
      id: "8",
      title: "The Quantum World: Physics Explained",
      description: "Delving into quantum mechanics, particle physics, and the strange behavior of matter at the smallest scales.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      duration: "51:45",
      category: "Science & Space",
      year: 2024,
      aiSummary: "Makes complex quantum physics concepts accessible through visual demonstrations.",
      tags: ["quantum", "physics", "science", "particles"]
    },
    {
      id: "9",
      title: "Black Holes: Cosmic Monsters",
      description: "Understanding the formation, properties, and incredible power of black holes that warp space and time.",
      thumbnail: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "44:00",
      category: "Science & Space",
      year: 2023,
      aiSummary: "Explains event horizons, gravitational waves, and recent black hole imaging breakthroughs.",
      tags: ["black holes", "gravity", "space", "astrophysics"]
    },
    {
      id: "10",
      title: "The International Space Station: Life in Orbit",
      description: "Daily life aboard the ISS, scientific experiments in microgravity, and breathtaking Earth views from space.",
      thumbnail: "https://images.unsplash.com/photo-1541873676-a18131494184?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "39:20",
      category: "Science & Space",
      year: 2024,
      aiSummary: "Shows astronaut routines, scientific research, and the challenges of living in space.",
      tags: ["ISS", "astronauts", "space station", "orbit"]
    },

    // Technology (50 videos)
    {
      id: "11",
      title: "The AI Revolution: Tech of Today",
      description: "Understanding artificial intelligence, machine learning, neural networks, and gadgets we use daily, including wireless AirPods.",
      thumbnail: "https://images.unsplash.com/photo-1614651462377-4f3fe3e2c262?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      duration: "55:40",
      category: "Technology",
      year: 2025,
      aiSummary: "Visual breakdown of neural networks and the hardware engineering behind modern tech devices like AirPods.",
      tags: ["tech", "technology", "airpods", "ai", "machine learning"],
      videoContent: "Welcome to the AI Revolution. Today we explore how artificial intelligence powers the technology we use every day. Our first topic: Apple AirPods and how they use AI for noise cancellation. Tech expert Dr. James Chen explains: Modern wireless earbuds like AirPods Pro use machine learning algorithms to analyze ambient sound 200 times per second. The H1 chip inside each AirPod processes audio in real-time creating inverse sound waves for active noise cancellation. When you speak, transparency mode uses computational audio to blend external sounds naturally. The spatial audio feature uses accelerometers and gyroscopes to create a 3D soundstage that follows your head movement. Battery management systems use AI to predict charging patterns and optimize battery health. We also explore how recommendation algorithms on streaming platforms learn your music preferences. Neural networks power voice assistants like Siri which understand natural language through deep learning models trained on millions of voice samples. Computer vision AI enables Face ID and photo organization. Self-driving car technology relies on convolutional neural networks to identify pedestrians, traffic signs, and road conditions."
    },
    {
      id: "12",
      title: "Quantum Computing: The Next Frontier",
      description: "Exploring quantum computers, qubits, superposition, and how they'll revolutionize computing power.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "49:15",
      category: "Technology",
      year: 2025,
      aiSummary: "Demystifies quantum computing and its potential applications in cryptography and drug discovery.",
      tags: ["quantum computing", "technology", "innovation", "computers"]
    },
    {
      id: "13",
      title: "Self-Driving Cars: Autonomous Future",
      description: "Inside look at Tesla, Waymo, and other autonomous vehicle technology using sensors, cameras, and AI.",
      thumbnail: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "42:30",
      category: "Technology",
      year: 2024,
      aiSummary: "Examines the technology stack behind autonomous driving and safety challenges.",
      tags: ["autonomous vehicles", "self-driving", "tesla", "AI"]
    },
    {
      id: "14",
      title: "5G Networks: Connectivity Revolution",
      description: "How 5G technology works, its impact on internet speeds, IoT devices, and smart cities of the future.",
      thumbnail: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: "36:45",
      category: "Technology",
      year: 2023,
      aiSummary: "Explains 5G infrastructure, bandwidth improvements, and future applications.",
      tags: ["5G", "networks", "connectivity", "internet"]
    },
    {
      id: "15",
      title: "Virtual Reality: The Metaverse Arrives",
      description: "Exploring VR headsets, metaverse platforms, virtual worlds, and the future of digital interaction.",
      thumbnail: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      duration: "53:00",
      category: "Technology",
      year: 2024,
      aiSummary: "Showcases VR applications in gaming, education, training, and social experiences.",
      tags: ["VR", "virtual reality", "metaverse", "technology"]
    },

    // Travel & Adventure (50 videos)
    {
      id: "16",
      title: "Urban Explorers: Hidden City Gems",
      description: "A journey through forgotten urban landscapes and secret spots within bustling cities around the world.",
      thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: "45:10",
      category: "Travel & Adventure",
      year: 2023,
      aiSummary: "Discovering the untold stories and hidden beauty of urban environments.",
      tags: ["urban", "exploration", "city", "adventure"],
      videoContent: "Beneath every city lies a hidden world of abandoned subway tunnels forgotten basements and secret passages. Urban explorer Maya Chen takes us through a disused railway station in London that was sealed during World War II. Original posters from the 1940s still line the walls perfectly preserved. In New York City we discover the abandoned City Hall subway station with its ornate tile work and Guastavino arches. Tokyo's underground extends seven stories deep with an entire city of shops restaurants and walkways. Urban archaeologists find artifacts from centuries past embedded in construction sites. The catacombs of Paris hold the remains of six million people in an underground ossuary stretching miles beneath the streets."
    },
    {
      id: "17",
      title: "Himalayan Trek: To Everest Base Camp",
      description: "Following trekkers on their challenging journey to Mount Everest Base Camp through stunning mountain landscapes.",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "58:00",
      category: "Travel & Adventure",
      year: 2024,
      aiSummary: "Documents the physical and mental challenges of high-altitude trekking.",
      tags: ["hiking", "mountains", "everest", "nepal", "adventure"]
    },
    {
      id: "18",
      title: "Island Hopping: Greek Paradise",
      description: "Exploring the beautiful Greek islands of Santorini, Mykonos, Crete, and hidden gems with white buildings and blue domes.",
      thumbnail: "https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "41:25",
      category: "Travel & Adventure",
      year: 2023,
      aiSummary: "Showcases Mediterranean culture, food, and stunning coastal scenery.",
      tags: ["greece", "islands", "travel", "mediterranean"]
    },
    {
      id: "19",
      title: "Desert Safari: Arabian Adventures",
      description: "Crossing vast sand dunes, visiting Bedouin camps, and experiencing desert life in the Middle East.",
      thumbnail: "https://images.unsplash.com/photo-1509514026798-53fafa1f5487?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      duration: "37:50",
      category: "Travel & Adventure",
      year: 2024,
      aiSummary: "Captures the beauty and harshness of desert landscapes and traditional nomadic culture.",
      tags: ["desert", "arabia", "safari", "adventure"]
    },
    {
      id: "20",
      title: "Tokyo Streets: Modern Japan",
      description: "Navigating the neon-lit streets of Tokyo, from ancient temples to futuristic technology districts.",
      thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "44:30",
      category: "Travel & Adventure",
      year: 2024,
      aiSummary: "Contrasts traditional Japanese culture with cutting-edge modern technology.",
      tags: ["japan", "tokyo", "culture", "urban"]
    },

    // Food & Cooking (40 videos)
    {
      id: "21",
      title: "Culinary Journeys: Flavors of the World",
      description: "Exploring diverse cuisines and culinary traditions from Italy, France, Thailand, Mexico, and India.",
      thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "38:25",
      category: "Food & Cooking",
      year: 2022,
      aiSummary: "A gastronomic adventure showcasing unique ingredients and cooking techniques.",
      tags: ["food", "cooking", "cuisine", "travel"]
    },
    {
      id: "22",
      title: "Sushi Mastery: Japanese Culinary Art",
      description: "Learning the ancient art of sushi making from master chefs in Tokyo, from rice preparation to fish selection.",
      thumbnail: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: "42:15",
      category: "Food & Cooking",
      year: 2023,
      aiSummary: "Details the precision and skill required in traditional Japanese sushi preparation.",
      tags: ["sushi", "japanese food", "cooking", "cuisine"],
      videoContent: "Master sushi chef Takeshi Yamamoto has trained for 30 years and begins every morning at Tsukiji fish market selecting the freshest tuna. He explains: The rice is more important than the fish. Perfect sushi rice requires exact water ratios vinegar seasoning and hand-fanning to the right temperature. Knife skills take a decade to master. The yanagiba knife slices fish in a single pulling motion to preserve cell structure and texture. Omakase meaning I leave it to you is the highest form of sushi dining where the chef selects each course. Bluefin tuna otoro is the most prized cut with its rich marbling. Wasabi should be freshly grated from the stem not from powder."
    },
    {
      id: "23",
      title: "Italian Pasta: From Scratch",
      description: "Traditional Italian pasta making techniques, from hand-rolling dough to creating authentic sauces like carbonara and bolognese.",
      thumbnail: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      duration: "35:00",
      category: "Food & Cooking",
      year: 2024,
      aiSummary: "Teaches authentic Italian pasta-making methods passed down through generations.",
      tags: ["italian food", "pasta", "cooking", "traditional"]
    },
    {
      id: "24",
      title: "Street Food Asia: Night Markets",
      description: "Exploring vibrant night markets in Bangkok, Taipei, and Singapore, sampling authentic street food delicacies.",
      thumbnail: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: "40:30",
      category: "Food & Cooking",
      year: 2023,
      aiSummary: "Showcases the diversity and flavors of Asian street food culture.",
      tags: ["street food", "asia", "markets", "cuisine"]
    },
    {
      id: "25",
      title: "French Patisserie: Dessert Magic",
      description: "Creating elaborate French desserts, macarons, croissants, and pastries with professional pastry chefs in Paris.",
      thumbnail: "https://images.unsplash.com/photo-1587241321921-91a834d82ffc?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "46:20",
      category: "Food & Cooking",
      year: 2024,
      aiSummary: "Reveals the techniques behind France's most iconic pastries and desserts.",
      tags: ["french food", "desserts", "patisserie", "baking"]
    },

    // Education (30 videos)
    {
      id: "26",
      title: "The Art of Code: Programming for Beginners",
      description: "An introductory guide to the fundamentals of programming, algorithms, data structures, and software development.",
      thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "60:00",
      category: "Education",
      year: 2023,
      aiSummary: "Demystifying coding concepts and helping aspiring developers start their journey.",
      tags: ["programming", "coding", "education", "software"]
    },
    {
      id: "27",
      title: "Mathematics Made Simple: Calculus Basics",
      description: "Breaking down complex calculus concepts including derivatives, integrals, and limits into easy-to-understand lessons.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      duration: "52:00",
      category: "Education",
      year: 2024,
      aiSummary: "Makes advanced mathematics accessible through visual explanations and real-world examples.",
      tags: ["mathematics", "calculus", "education", "learning"]
    },
    {
      id: "28",
      title: "World History: Ancient Rome",
      description: "The rise and fall of the Roman Empire, from Julius Caesar to the collapse, covering politics, warfare, and culture.",
      thumbnail: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "58:30",
      category: "Education",
      year: 2023,
      aiSummary: "Comprehensive overview of Roman civilization and its lasting impact on the world.",
      tags: ["history", "rome", "ancient civilization", "education"]
    },
    {
      id: "29",
      title: "Chemistry 101: Understanding Atoms",
      description: "Introduction to atomic structure, chemical bonds, periodic table, and basic chemical reactions.",
      thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "45:15",
      category: "Education",
      year: 2024,
      aiSummary: "Explains fundamental chemistry principles through interactive demonstrations.",
      tags: ["chemistry", "science", "atoms", "education"]
    },
    {
      id: "30",
      title: "Language Learning: Spanish for Beginners",
      description: "Complete beginner's guide to learning Spanish, covering pronunciation, basic grammar, and common phrases.",
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: "55:00",
      category: "Education",
      year: 2023,
      aiSummary: "Interactive lessons that make Spanish learning engaging and practical.",
      tags: ["language", "spanish", "education", "learning"]
    },

    // History (30 videos)
    {
      id: "31",
      title: "Historic Battles: Turning Points in History",
      description: "Detailed accounts of pivotal battles that shaped the course of human history, from ancient to modern warfare.",
      thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      duration: "50:00",
      category: "History",
      year: 2021,
      aiSummary: "Analyzing military strategies and the impact of key historical conflicts.",
      tags: ["history", "war", "battles", "military"]
    },
    {
      id: "32",
      title: "The Renaissance: Rebirth of Art and Science",
      description: "Exploring the cultural revolution of 14th-17th century Europe, featuring Da Vinci, Michelangelo, and Galileo.",
      thumbnail: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: "54:30",
      category: "History",
      year: 2022,
      aiSummary: "Chronicles the artistic, scientific, and philosophical achievements of the Renaissance.",
      tags: ["renaissance", "art", "history", "culture"]
    },
    {
      id: "33",
      title: "World War II: The Complete Story",
      description: "Comprehensive documentary covering all major events, battles, and consequences of the Second World War.",
      thumbnail: "https://images.unsplash.com/photo-1554050857-c84a8abdb5e2?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "120:00",
      category: "History",
      year: 2023,
      aiSummary: "In-depth analysis of WWII from multiple perspectives with rare archival footage.",
      tags: ["WWII", "war", "history", "20th century"]
    },
    {
      id: "34",
      title: "Ancient Egypt: Secrets of the Pharaohs",
      description: "Uncovering the mysteries of ancient Egyptian civilization, pyramids, mummies, and hieroglyphics.",
      thumbnail: "https://images.unsplash.com/photo-1523059623039-a75b39920f19?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "62:00",
      category: "History",
      year: 2024,
      aiSummary: "Archaeological discoveries reveal the advanced society of ancient Egypt.",
      tags: ["egypt", "ancient history", "pharaohs", "archaeology"],
      videoContent: "The Great Pyramid of Giza was built around 2560 BC using 2.3 million stone blocks each weighing 2.5 tons on average. Egyptologist Dr. Amira Hassan reveals: Recent thermal scanning has detected a previously unknown void inside the Great Pyramid. The Rosetta Stone discovered in 1799 allowed scholars to decode hieroglyphics for the first time. Tutankhamun's tomb discovered by Howard Carter in 1922 contained over 5000 artifacts including the famous gold death mask weighing 24 pounds. The ancient Egyptians practiced mummification removing organs and storing them in canopic jars. Cleopatra the last active ruler of the Ptolemaic Kingdom was closer in time to the Moon landing than to the building of the Great Pyramid."
    },
    {
      id: "35",
      title: "The Industrial Revolution: Changing the World",
      description: "How steam power, factories, and innovation transformed society from agrarian to industrial economies.",
      thumbnail: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      duration: "48:45",
      category: "History",
      year: 2023,
      aiSummary: "Examines the technological and social impacts of industrialization.",
      tags: ["industrial revolution", "history", "technology", "economy"]
    },

    // Health & Wellness (30 videos)
    {
      id: "36",
      title: "Mindful Living: Paths to Inner Peace",
      description: "Exploring practices and philosophies for a more balanced and peaceful life through meditation and mindfulness.",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "30:45",
      category: "Health & Wellness",
      year: 2024,
      aiSummary: "Guidance on meditation, mindfulness, and stress reduction techniques.",
      tags: ["mindfulness", "wellness", "meditation", "health"]
    },
    {
      id: "37",
      title: "Yoga for Everyone: Complete Beginner's Guide",
      description: "Introduction to yoga poses, breathing techniques, and building a daily practice for flexibility and strength.",
      thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "40:00",
      category: "Health & Wellness",
      year: 2024,
      aiSummary: "Step-by-step yoga instruction suitable for all fitness levels.",
      tags: ["yoga", "fitness", "health", "exercise"]
    },
    {
      id: "38",
      title: "The Science of Sleep: Rest for Success",
      description: "Understanding the importance of sleep cycles, REM, deep sleep, and how to improve sleep quality for better health.",
      thumbnail: "https://images.unsplash.com/photo-1535914254981-b50129596489?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: "22:00",
      category: "Health & Wellness",
      year: 2024,
      aiSummary: "Insights into sleep cycles, disorders, and practical tips for restful sleep.",
      tags: ["sleep", "health", "wellness", "science"]
    },
    {
      id: "39",
      title: "Nutrition Essentials: Eating for Energy",
      description: "Guide to balanced nutrition, macronutrients, vitamins, minerals, and meal planning for optimal health.",
      thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      duration: "35:30",
      category: "Health & Wellness",
      year: 2023,
      aiSummary: "Science-based nutrition advice for improving energy and overall wellbeing.",
      tags: ["nutrition", "health", "diet", "food"]
    },
    {
      id: "40",
      title: "Mental Health Matters: Breaking the Stigma",
      description: "Understanding anxiety, depression, and mental health resources to support emotional wellbeing.",
      thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: "42:20",
      category: "Health & Wellness",
      year: 2024,
      aiSummary: "Open discussion about mental health challenges and treatment options.",
      tags: ["mental health", "wellness", "psychology", "support"]
    },

    // Additional videos to reach 200+
    {
      id: "41",
      title: "Deep Sea Exploration: Unknown Depths",
      description: "Submersible expeditions reveal bizarre creatures and ecosystems in the darkest parts of the ocean.",
      thumbnail: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "51:00",
      category: "Nature & Wildlife",
      year: 2024,
      aiSummary: "Discovers bioluminescent fish, giant squids, and hydrothermal vent ecosystems.",
      tags: ["ocean", "deep sea", "marine biology", "exploration"]
    },
    {
      id: "42",
      title: "Coral Reefs: Underwater Rainforests",
      description: "Exploring the biodiversity of coral reefs, from colorful fish to sea turtles and the threats they face.",
      thumbnail: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "46:30",
      category: "Nature & Wildlife",
      year: 2023,
      aiSummary: "Highlights coral reef ecosystems and conservation efforts to protect them.",
      tags: ["coral reefs", "ocean", "conservation", "marine life"]
    },
    {
      id: "43",
      title: "Wolves: Pack Hunters of the North",
      description: "Following wolf packs through wilderness areas, observing hunting strategies and social dynamics.",
      thumbnail: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      duration: "43:15",
      category: "Nature & Wildlife",
      year: 2024,
      aiSummary: "Intimate look at wolf behavior, communication, and pack hierarchy.",
      tags: ["wolves", "predators", "wildlife", "nature"]
    },
    {
      id: "44",
      title: "Butterfly Migration: Monarch's Journey",
      description: "Tracking the incredible 3,000-mile migration of monarch butterflies from Canada to Mexico.",
      thumbnail: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "38:00",
      category: "Nature & Wildlife",
      year: 2023,
      aiSummary: "Documents the navigational abilities and lifecycle of monarch butterflies.",
      tags: ["butterflies", "migration", "insects", "nature"]
    },
    {
      id: "45",
      title: "Bears of Alaska: Salmon Season",
      description: "Grizzly and brown bears gather at rivers during salmon runs, showcasing their fishing techniques.",
      thumbnail: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "49:00",
      category: "Nature & Wildlife",
      year: 2024,
      aiSummary: "Captures bears feeding, playing, and preparing for hibernation in Alaska.",
      tags: ["bears", "alaska", "wildlife", "fishing"]
    },
    {
      id: "46",
      title: "Galaxies Beyond: Hubble's Greatest Hits",
      description: "Stunning images from the Hubble Space Telescope revealing distant galaxies, nebulae, and star formations.",
      thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: "44:45",
      category: "Science & Space",
      year: 2024,
      aiSummary: "Showcases Hubble's most iconic astronomical photography and discoveries.",
      tags: ["hubble", "galaxies", "astronomy", "space"]
    },
    {
      id: "47",
      title: "The Sun: Our Nearest Star",
      description: "Understanding solar flares, sunspots, solar wind, and how the Sun powers life on Earth.",
      thumbnail: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      duration: "41:30",
      category: "Science & Space",
      year: 2023,
      aiSummary: "Explains solar physics and the Sun's impact on Earth's climate and technology.",
      tags: ["sun", "solar", "astronomy", "physics"]
    },
    {
      id: "48",
      title: "Exoplanets: Worlds Beyond Our Solar System",
      description: "Discovering planets orbiting distant stars, searching for potentially habitable worlds.",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      duration: "50:15",
      category: "Science & Space",
      year: 2025,
      aiSummary: "Explores methods for detecting exoplanets and their potential for life.",
      tags: ["exoplanets", "astronomy", "space", "aliens"]
    },
    {
      id: "49",
      title: "Supernovas: Stellar Explosions",
      description: "When massive stars explode, they create supernovas, seeding the universe with heavy elements.",
      thumbnail: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "39:00",
      category: "Science & Space",
      year: 2024,
      aiSummary: "Explains the lifecycle of stars and the violent deaths of massive stars.",
      tags: ["supernovas", "stars", "astronomy", "explosions"]
    },
    {
      id: "50",
      title: "Gravitational Waves: Ripples in Spacetime",
      description: "Detecting gravitational waves from colliding black holes confirms Einstein's predictions.",
      thumbnail: "https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=1080",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "46:00",
      category: "Science & Space",
      year: 2023,
      aiSummary: "Chronicles the scientific achievement of detecting gravitational waves.",
      tags: ["gravitational waves", "physics", "einstein", "space"]
    }

    // Continue pattern for remaining 150 videos...
    // For brevity, I'll add a representative sample across all categories
  ];

  // Add 150 more videos programmatically to reach 200+
  const additionalVideos = [];
  const categories = ["Nature & Wildlife", "Science & Space", "Technology", "Travel & Adventure", "Food & Cooking", "Education", "History", "Health & Wellness"];
  const thumbnails = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1080",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80&w=1080",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1080",
    "https://images.unsplash.com/photo-1504297050568-910d24c426d3?auto=format&fit=crop&q=80&w=1080",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1080"
  ];
  const videoUrls = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4"
  ];

  const titleTemplates: Record<string, string[]> = {
    "Nature & Wildlife": ["Untamed Wilderness", "Wings of Freedom", "Predator Instincts", "The Great Migration", "Rainforest Secrets", "Desert Survivors", "Mountain Spirits", "River Giants", "Night Creatures", "Animal Intelligence", "Primate World", "Reef Guardians", "Frozen Wild", "Savanna Stories", "Insect Kingdom", "Jungle Canopy", "Bird Paradise", "Wetland Wonders", "Volcanic Wildlife", "Forest Twilight"],
    "Science & Space": ["Dark Matter Mysteries", "Particle Physics", "Ocean Currents Science", "DNA Revolution", "Climate Systems", "Asteroid Impact", "Neutron Stars", "Earth's Core", "Cosmic Origins", "Future Telescopes", "Chemical Reactions", "Plate Tectonics", "Solar System Tour", "Space Debris", "Magnetic Fields", "Light Speed", "String Theory", "Atomic World", "Fusion Energy", "Alien Signals"],
    "Technology": ["Drone Innovation", "Wearable Tech", "Cyber Security", "Cloud Computing", "Robotics Lab", "Smart Home", "Green Energy Tech", "Biotech Future", "Digital Twins", "Nanotech Frontier", "Space Tech", "EV Revolution", "Chip Design", "Internet of Things", "3D Printing", "AR Glasses", "Brain Interface", "Solar Tech", "Quantum Sensors", "Data Centers"],
    "Travel & Adventure": ["Patagonia Wild", "Iceland Ring Road", "Vietnam Backpacking", "Morocco Medinas", "New Zealand Trek", "Scottish Highlands", "Peru Inca Trail", "Norwegian Fjords", "Thailand Islands", "Costa Rica Jungle", "Kenya Safari Drive", "Swiss Alps Trail", "Bali Discovery", "Chile Atacama", "Japan Countryside", "Portugal Coast", "Canada Rockies", "Australia Outback", "Croatia Sailing", "Nepal Annapurna"],
    "Food & Cooking": ["Farm to Table", "BBQ Masters", "Vegan Delights", "Chocolate Craft", "Bread Baking", "Korean Kitchen", "Wine Making", "Spice Routes", "Mexican Flavors", "Indian Curry Art", "Coffee Journey", "Cheese Artisans", "Greek Taverna", "Fermentation Lab", "Middle East Feast", "Nordic Cuisine", "Seafood Coast", "Dim Sum Secrets", "Pastry School", "Comfort Food"],
    "Education": ["Philosophy 101", "Psychology Basics", "Economics Explained", "Art History", "Music Theory", "Creative Writing", "Public Speaking", "Data Science", "Astronomy 101", "Geology Basics", "Sociology Studies", "Political Science", "Marine Biology", "Environmental Science", "Anthropology", "Logic & Reasoning", "Statistics", "Architecture Design", "Film Making", "Digital Literacy"],
    "History": ["Viking Age", "Silk Road", "Cold War Era", "Mayan Empire", "French Revolution", "Ming Dynasty", "Greek Philosophy", "Civil Rights", "Space Race", "Medieval Knights", "Ottoman Empire", "Samurai Japan", "British Empire", "Gold Rush", "Aztec Civilization", "Byzantine Era", "Mongol Conquests", "Age of Sail", "Roman Roads", "Ancient India"],
    "Health & Wellness": ["HIIT Training", "Plant Medicine", "Gut Health", "Stress Relief", "Breathing Techniques", "Posture Fix", "Cold Therapy", "Sleep Science", "Hormone Balance", "Brain Health", "Flexibility Flow", "Heart Health", "Immune System", "Eye Care", "Joint Health", "Energy Boost", "Detox Myths", "Aging Well", "Mindset Shift", "Recovery Science"],
  };

  for (let i = 51; i <= 200; i++) {
    const category = categories[i % categories.length];
    const thumbnail = thumbnails[i % thumbnails.length];
    const videoUrl = videoUrls[i % videoUrls.length];
    const duration = `${Math.floor(20 + (i * 7 % 50))}:${String(i * 3 % 60).padStart(2, '0')}`;
    const year = 2022 + (i % 4);
    const titles = titleTemplates[category] || [`Exploring ${category}`];
    const title = titles[(i - 51) % titles.length];
    
    const videoData = {
      id: String(i),
      title,
      description: `A deep dive into ${title.toLowerCase()} covering the latest research, expert interviews, and stunning visuals in the field of ${category.toLowerCase()}.`,
      thumbnail,
      videoUrl,
      duration,
      category,
      year,
      aiSummary: `Expert-led documentary on ${title.toLowerCase()} with in-depth analysis and real-world applications in ${category.toLowerCase()}.`,
      tags: [title.toLowerCase().split(' ')[0], ...category.toLowerCase().split(' & '), 'documentary']
    };
    
    additionalVideos.push(videoData);
  }

  const allVideos = [...videos, ...additionalVideos];
  
  // Fix any broken storage URLs by replacing with working commondatastorage URLs
  const fixedVideos = allVideos.map(video => ({
    id: video.id,
    title: video.title,
    description: video.description,
    genre: video.category,
    releaseYear: video.year,
    duration: parseInt(video.duration) || 0,
    video_file: video.videoUrl.replace('https://storage.googleapis.com/', 'https://commondatastorage.googleapis.com/'),
    status: 'ready',
    intro_start: 0,
    intro_end: 0,
    recap_start: 0,
    recap_end: 0,
    uploaded_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  
  await kv.set('videos_database', fixedVideos);
  console.log(`Initialized ${fixedVideos.length} videos in database`);
  return fixedVideos;
}

Deno.serve(app.fetch);
