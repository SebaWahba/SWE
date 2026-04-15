import { create, verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// JWT secret key (in production, use a secure random key stored in environment variables)
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'loopy-secret-key-change-in-production';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_SPECIAL_CHAR_PATTERN = /[^A-Za-z0-9]/;
const PASSWORD_HASH_ITERATIONS = 120_000;

interface StoredUser {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google';
  createdAt: string;
  picture?: string;
  googleId?: string;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  supabaseAuthUserId?: string;
}

interface PublicUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

interface VerificationStatus {
  email: string;
  exists: boolean;
  provider?: 'email' | 'google';
  emailVerified?: boolean;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

function getPasswordValidationError(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "Password must be at least 8 characters long.";
  }

  if (!PASSWORD_SPECIAL_CHAR_PATTERN.test(password)) {
    return "Password must include at least one special character.";
  }

  return null;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function generateSalt(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diff === 0;
}

async function hashLegacyPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(hashBuffer));
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

async function verifyPassword(password: string, user: StoredUser): Promise<boolean> {
  if (user.passwordHash && user.passwordSalt) {
    const computedHash = await hashPassword(password, user.passwordSalt);
    return timingSafeEqual(computedHash, user.passwordHash);
  }

  if (user.password) {
    const legacyHash = await hashLegacyPassword(password);
    return timingSafeEqual(legacyHash, user.password);
  }

  return false;
}

async function persistUser(user: StoredUser): Promise<void> {
  await kv.set(`user:${user.email}`, user);
  await kv.set(`user:id:${user.id}`, user);
}

function getSupabaseUrl(): string {
  const value = Deno.env.get('SUPABASE_URL') || '';
  if (!value) {
    throw new Error('SUPABASE_URL is missing from function environment variables.');
  }
  return value;
}

function getSupabaseAnonKey(): string {
  const value = Deno.env.get('SUPABASE_ANON_KEY') || '';
  if (!value) {
    throw new Error('SUPABASE_ANON_KEY is missing from function environment variables.');
  }
  return value;
}

function getSupabaseServiceRoleKey(): string {
  const value = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!value) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing from function environment variables.');
  }
  return value;
}

function getSupabaseAnonClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}

function getSupabaseServiceClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
}

function buildEmailRedirectUrl(returnOrigin?: string, email?: string): string | undefined {
  if (!returnOrigin) {
    return undefined;
  }

  const redirectUrl = new URL('/login', returnOrigin);
  redirectUrl.searchParams.set('verified', 'success');

  if (email) {
    redirectUrl.searchParams.set('email', email);
  }

  return redirectUrl.toString();
}

function normalizeSupabaseAuthError(errorMessage: string): string {
  const lower = errorMessage.toLowerCase();

  if (lower.includes('already') && lower.includes('registered')) {
    return 'This email address is already in use.';
  }

  if (lower.includes('email provider is not enabled') || lower.includes('email signups are disabled')) {
    return 'Supabase email signup is disabled. Enable Email provider in Supabase Auth settings.';
  }

  return errorMessage;
}

async function supabaseSignUpAndSendVerification(
  email: string,
  password: string,
  returnOrigin?: string,
): Promise<{ authUserId: string; emailVerified: boolean }> {
  const anonClient = getSupabaseAnonClient();
  const emailRedirectTo = buildEmailRedirectUrl(returnOrigin, email);

  const signUpPayload: {
    email: string;
    password: string;
    options?: { emailRedirectTo: string };
  } = {
    email,
    password,
  };

  if (emailRedirectTo) {
    signUpPayload.options = { emailRedirectTo };
  }

  const { data, error } = await anonClient.auth.signUp(signUpPayload);

  if (error) {
    throw new Error(normalizeSupabaseAuthError(error.message || 'Could not create authentication user.'));
  }

  if (!data.user) {
    throw new Error('Could not create authentication user. Please try again.');
  }

  return {
    authUserId: data.user.id,
    emailVerified: Boolean(data.user.email_confirmed_at),
  };
}

async function supabaseResendVerification(email: string, returnOrigin?: string): Promise<void> {
  const anonClient = getSupabaseAnonClient();
  const emailRedirectTo = buildEmailRedirectUrl(returnOrigin, email);

  const resendPayload: {
    type: 'signup';
    email: string;
    options?: { emailRedirectTo: string };
  } = {
    type: 'signup',
    email,
  };

  if (emailRedirectTo) {
    resendPayload.options = { emailRedirectTo };
  }

  const { error } = await anonClient.auth.resend(resendPayload);

  if (error) {
    throw new Error(normalizeSupabaseAuthError(error.message || 'Failed to resend verification email.'));
  }
}

async function isSupabaseEmailVerified(authUserId: string): Promise<boolean> {
  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient.auth.admin.getUserById(authUserId);

  if (error) {
    throw new Error(`Could not confirm verification status from Supabase Auth: ${error.message}`);
  }

  return Boolean(data.user?.email_confirmed_at);
}

async function syncEmailVerificationState(user: StoredUser): Promise<boolean> {
  if (user.provider !== 'email') {
    return true;
  }

  if (user.emailVerified !== false) {
    return true;
  }

  if (!user.supabaseAuthUserId) {
    return false;
  }

  const verified = await isSupabaseEmailVerified(user.supabaseAuthUserId);
  if (verified) {
    user.emailVerified = true;
    user.emailVerifiedAt = new Date().toISOString();
    await persistUser(user);
  }

  return verified;
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    emailVerified: user.emailVerified !== false,
  };
}

// Helper: Generate JWT token
export async function generateToken(
  userId: string,
  email: string,
  name: string,
  picture?: string,
  emailVerified = true,
) {
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
    emailVerified,
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
    picture: payload.picture as string | undefined,
    emailVerified: payload.emailVerified !== false,
  };
}

// Sign up with email/password
export async function signUp(email: string, password: string, name?: string, returnOrigin?: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  const passwordValidationError = getPasswordValidationError(password);
  if (passwordValidationError) {
    throw new Error(passwordValidationError);
  }

  // Check if user already exists
  const existingUser = await kv.get(`user:${normalizedEmail}`);
  if (existingUser) {
    throw new Error('This email address is already in use.');
  }

  const supabaseSignUpResult = await supabaseSignUpAndSendVerification(
    normalizedEmail,
    password,
    returnOrigin,
  );

  const passwordSalt = generateSalt();
  const passwordHash = await hashPassword(password, passwordSalt);

  // Generate user ID
  const userId = crypto.randomUUID();
  const resolvedName = (name?.trim() || normalizedEmail.split('@')[0] || 'Viewer').trim();

  // Create user
  const user: StoredUser = {
    id: userId,
    email: normalizedEmail,
    name: resolvedName,
    passwordHash,
    passwordSalt,
    emailVerified: supabaseSignUpResult.emailVerified,
    emailVerifiedAt: supabaseSignUpResult.emailVerified ? new Date().toISOString() : undefined,
    supabaseAuthUserId: supabaseSignUpResult.authUserId,
    createdAt: new Date().toISOString(),
    provider: 'email'
  };

  // Save user
  await persistUser(user);

  // Initialize user preferences
  await kv.set(`user_preferences:${userId}`, {
    favoriteCategories: {},
    favoriteTags: {},
    lastActive: new Date().toISOString()
  });

  const requiresEmailVerification = user.emailVerified === false;

  return {
    user: toPublicUser(user),
    requiresEmailVerification,
    message: requiresEmailVerification
      ? 'Account created. Check your email for a verification link before signing in.'
      : 'Account created. You can sign in now.',
    redirectTo: '/',
  };
}

export async function resendVerificationEmail(email: string, returnOrigin?: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  const user = await kv.get(`user:${normalizedEmail}`) as StoredUser | null;
  if (!user || user.provider !== 'email') {
    throw new Error('No email/password account exists for this address.');
  }

  if (user.emailVerified !== false) {
    return {
      message: 'This email is already verified. You can sign in now.',
      alreadyVerified: true,
    };
  }

  await supabaseResendVerification(user.email, returnOrigin);

  return {
    message: 'A new verification link has been sent.',
    alreadyVerified: false,
  };
}

export async function getVerificationStatus(email: string): Promise<VerificationStatus> {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  const user = await kv.get(`user:${normalizedEmail}`) as StoredUser | null;
  if (!user) {
    return {
      email: normalizedEmail,
      exists: false,
    };
  }

  let emailVerified = user.provider === 'google' ? true : user.emailVerified !== false;
  if (user.provider === 'email' && !emailVerified && user.supabaseAuthUserId) {
    emailVerified = await syncEmailVerificationState(user);
  }

  return {
    email: user.email,
    exists: true,
    provider: user.provider,
    emailVerified,
  };
}

export async function verifyEmailToken(_token: string) {
  throw new Error('Legacy verification links are no longer supported. Please use the verification email sent by Supabase Auth.');
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  // Get user
  let user = await kv.get(`user:${normalizedEmail}`) as StoredUser | null;
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if this is a Google user trying to sign in with email
  if (user.provider === 'google') {
    throw new Error("This account uses Google Sign-In. Please sign in with Google.");
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  if (user.provider === 'email' && user.password && (!user.passwordHash || !user.passwordSalt)) {
    user.passwordSalt = generateSalt();
    user.passwordHash = await hashPassword(password, user.passwordSalt);
    delete user.password;
    await persistUser(user);
  }

  const verified = await syncEmailVerificationState(user);
  if (user.provider === 'email' && !verified) {
    throw new Error('Email not verified. Please check your inbox for the verification link before signing in.');
  }

  // Generate JWT token
  const accessToken = await generateToken(
    user.id,
    user.email,
    user.name,
    user.picture,
    user.emailVerified !== false,
  );

  return {
    user: toPublicUser(user),
    session: { access_token: accessToken }
  };
}

// Get or create user from Google OAuth
export async function getOrCreateGoogleUser(googleUser: any) {
  const normalizedEmail = normalizeEmail(googleUser.email);

  // Check if user exists
  let user = await kv.get(`user:${normalizedEmail}`);
  
  if (!user) {
    // Create new user
    const userId = crypto.randomUUID();
    user = {
      id: userId,
      email: normalizedEmail,
      name: googleUser.name,
      picture: googleUser.picture,
      createdAt: new Date().toISOString(),
      provider: 'google',
      googleId: googleUser.id,
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    };

    await persistUser(user as StoredUser);

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
      await persistUser(user as StoredUser);
    }

    if (user.emailVerified === false) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date().toISOString();
      await persistUser(user as StoredUser);
    }
  }

  // Generate JWT token
  const accessToken = await generateToken(
    user.id,
    user.email,
    user.name,
    user.picture,
    user.emailVerified !== false,
  );

  return {
    user: toPublicUser(user as StoredUser),
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
    picture: user.picture,
    emailVerified: user.emailVerified !== false,
  };
}
