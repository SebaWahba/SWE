import * as React from "react";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authApi, supabase } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  emailVerified: boolean;
  isAdmin?: boolean;
}

interface SignUpResult {
  user: User;
  requiresEmailVerification: boolean;
  message: string;
  redirectTo?: string;
  verificationExpiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<SignUpResult>;
  resendVerificationEmail: (email: string) => Promise<any>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // Default to true so child components wait until initial auth finishes
  const [isLoading, setIsLoading] = useState(true);

  // 1. Handle Auth State Changes Only
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);

        if (session?.user) {
          setAccessToken(session.access_token);
          
          setUser((prevUser) => {
            // If the user is the same, preserve their isAdmin status to prevent UI flickering
            const isAdmin = prevUser?.id === session.user.id ? prevUser.isAdmin : undefined;
            
            return {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email?.split('@')[0] || 'User',
              email: session.user.email || session.user.user_metadata?.email || '',
              picture: session.user.user_metadata?.avatar_url || 
                       session.user.user_metadata?.picture,
              emailVerified: !!session.user.email_confirmed_at,
              isAdmin: isAdmin, 
            };
          });
        } else {
          setUser(null);
          setAccessToken(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch Admin Status in a Separate Effect
  useEffect(() => {
    let mounted = true;

    const fetchAdminStatus = async () => {
      // Only fetch if we have a user and we haven't checked their admin status yet
      if (user?.id && user.isAdmin === undefined) {
        try {
          const isAdmin = await authApi.checkIsAdmin(user.id);
          if (mounted) {
            setUser((prev) => (prev ? { ...prev, isAdmin } : null));
          }
        } catch (error) {
          console.error("Failed to fetch admin status", error);
          if (mounted) {
            setUser((prev) => (prev ? { ...prev, isAdmin: false } : null));
          }
        }
      }
    };

    fetchAdminStatus();

    return () => {
      mounted = false;
    };
  }, [user?.id, user?.isAdmin]);

  const signInWithGoogle = useCallback(async () => {
    await authApi.signInWithGoogle();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authApi.signIn(email, password);
    } finally {
      // We don't set loading to false here because onAuthStateChange will catch the event
      // and handle the loading state properly.
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      return (await authApi.signUp(email, password, name)) as SignUpResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    return await authApi.resendVerificationEmail(email);
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    // Clearing user here is fine, but onAuthStateChange ('SIGNED_OUT') will also catch it
    setUser(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, signInWithGoogle, signInWithEmail, signUp, 
      resendVerificationEmail, signOut, isLoading, accessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}