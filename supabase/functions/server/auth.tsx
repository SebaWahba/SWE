import { create, verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import * as kv from "./kv_store.tsx";

// JWT secret key (in production, use a secure random key stored in environment variables)
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'loopy-secret-key-change-in-production';

// Simple password hashing using Web Crypto API (no Worker needed!)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET); // Use JWT_SECRET as salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

// Helper: Generate JWT token
export async function generateToken(userId: string, email: string, name: string, picture?: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const payload = {
    userId,
    email,
    name,
    picture,
    exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
  };
  
  return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

// Helper: Verify JWT token
export async function verifyToken(token: string) {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const payload = await verify(token, key);
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

// Helper: Get user from authorization header
export async function getUserFromAuth(authHeader: string | undefined) {
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  return {
    id: payload.userId as string,
    email: payload.email as string,
    name: payload.name as string,
    picture: payload.picture as string | undefined
  };
}

// Sign up with email/password
export async function signUp(email: string, password: string, name: string) {
  // Check if user already exists
  const existingUser = await kv.get(`user:${email}`);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate user ID
  const userId = crypto.randomUUID();

  // Create user
  const user = {
    id: userId,
    email,
    name,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    provider: 'email'
  };

  // Save user
  await kv.set(`user:${email}`, user);
  await kv.set(`user:id:${userId}`, user);

  // Initialize user preferences
  await kv.set(`user_preferences:${userId}`, {
    favoriteCategories: {},
    favoriteTags: {},
    lastActive: new Date().toISOString()
  });

  // Generate JWT token
  const accessToken = await generateToken(userId, email, name);

  return {
    user: { id: userId, email, name },
    session: { access_token: accessToken }
  };
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  // Get user
  const user = await kv.get(`user:${email}`);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if this is a Google user trying to sign in with email
  if (user.provider === 'google') {
    throw new Error("This account uses Google Sign-In. Please sign in with Google.");
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const accessToken = await generateToken(user.id, user.email, user.name);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    session: { access_token: accessToken }
  };
}

// Get or create user from Google OAuth
export async function getOrCreateGoogleUser(googleUser: any) {
  // Check if user exists
  let user = await kv.get(`user:${googleUser.email}`);
  
  if (!user) {
    // Create new user
    const userId = crypto.randomUUID();
    user = {
      id: userId,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      createdAt: new Date().toISOString(),
      provider: 'google',
      googleId: googleUser.id
    };

    await kv.set(`user:${googleUser.email}`, user);
    await kv.set(`user:id:${userId}`, user);

    // Initialize user preferences
    await kv.set(`user_preferences:${userId}`, {
      favoriteCategories: {},
      favoriteTags: {},
      lastActive: new Date().toISOString()
    });
  } else {
    // Update picture if changed
    if (user.provider === 'google' && user.picture !== googleUser.picture) {
      user.picture = googleUser.picture;
      await kv.set(`user:${googleUser.email}`, user);
      await kv.set(`user:id:${user.id}`, user);
    }
  }

  // Generate JWT token
  const accessToken = await generateToken(user.id, user.email, user.name, user.picture);

  return {
    user: { id: user.id, email: user.email, name: user.name, picture: user.picture },
    session: { access_token: accessToken }
  };
}

// Get user by ID
export async function getUserById(userId: string) {
  const user = await kv.get(`user:id:${userId}`);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture
  };
}