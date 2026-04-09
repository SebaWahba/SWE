import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authApi } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state once on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('loopy_access_token');
        
        if (token) {
          const supaUser = await authApi.getUser();
          if (supaUser) {
            setAccessToken(token);
            setUser({
              id: supaUser.id,
              name: supaUser.name || supaUser.email?.split('@')[0] || 'User',
              email: supaUser.email || '',
              picture: supaUser.picture,
              emailVerified: supaUser.emailVerified !== false,
            });
          } else {
            localStorage.removeItem('loopy_access_token');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('loopy_access_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for storage changes (e.g., token set by OAuth callback in another tab)
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'loopy_access_token') {
        if (e.newValue && !user) {
          const supaUser = await authApi.getUser();
          if (supaUser) {
            setAccessToken(e.newValue);
            setUser({
              id: supaUser.id,
              name: supaUser.name || supaUser.email?.split('@')[0] || 'User',
              email: supaUser.email || '',
              picture: supaUser.picture,
              emailVerified: supaUser.emailVerified !== false,
            });
          }
        } else if (!e.newValue) {
          setUser(null);
          setAccessToken(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    const result = await authApi.signInWithGoogle();
    if (result?.url) {
      return result;
    }
    throw new Error('No OAuth URL received');
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { session, user: supaUser } = await authApi.signIn(email, password);
      
      if (supaUser) {
        setAccessToken(session?.access_token || null);
        setUser({
          id: supaUser.id,
          name: supaUser.name || email.split('@')[0],
          email: supaUser.email || email,
          picture: supaUser.picture,
          emailVerified: supaUser.emailVerified !== false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const data = await authApi.signUp(email, password, name);
      
      if (data?.session && data?.user) {
        setAccessToken(data.session.access_token);
        setUser({
          id: data.user.id,
          name: data.user.name || name,
          email: data.user.email || email,
          picture: data.user.picture,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signInWithEmail, signUp, signOut, isLoading, accessToken }}>
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
