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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state once on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Initial session:', session);
        console.log('Initial session error:', error);
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (session?.user) {
          console.log('Setting user from initial session');
          setAccessToken(session.access_token);
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || 
                  session.user.user_metadata?.name || 
                  session.user.email?.split('@')[0] || 'User',
            email: session.user.email || session.user.user_metadata?.email || '',
            picture: session.user.user_metadata?.avatar_url || 
                    session.user.user_metadata?.picture,
            emailVerified: session.user.email_confirmed_at ? true : false,
            isAdmin: false, // TODO: check from database
          });
        } else {
          console.log('No initial session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    let subscription: any = null;
    
    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, session);
          console.log('Session user:', session?.user);
          console.log('Session user metadata:', session?.user?.user_metadata);
          
          if (session?.user) {
            setAccessToken(session.access_token);
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email?.split('@')[0] || 'User',
              email: session.user.email || session.user.user_metadata?.email || '',
              picture: session.user.user_metadata?.avatar_url || 
                      session.user.user_metadata?.picture,
              emailVerified: session.user.email_confirmed_at ? true : false,
              isAdmin: false, // TODO: check from database
            });
          } else {
            setUser(null);
            setAccessToken(null);
          }
          
          setIsLoading(false);
        }
      );
      subscription = sub;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setIsLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await authApi.signInWithGoogle();
    // Supabase handles the OAuth flow automatically
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
          isAdmin: supaUser.isAdmin === true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      const data = await authApi.signUp(email, password, name);

      return data as SignUpResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    return await authApi.resendVerificationEmail(email);
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signInWithEmail, signUp, resendVerificationEmail, signOut, isLoading, accessToken }}>
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
