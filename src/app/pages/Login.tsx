import { motion } from "motion/react";
import { Chrome, Mail, Lock, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageErrorBoundary } from "../components/PageErrorBoundary";
import { getSignUpValidationError } from "../lib/auth-validation";

function LoginContent() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUp, resendVerificationEmail, signOut, user, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/browse");
    }
  }, [user, navigate]);

  // Handle Google OAuth callback (Supabase handles this automatically, redirect to browse if authenticated)
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/browse");
    }
  }, [user, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Supabase will handle the redirect automatically
    } catch (error: any) {
      console.error('[Login] Error during Google sign-in:', error);
      setGoogleLoading(false);
      toast.error(error?.message || "Google sign-in failed");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const normalizedEmail = email.trim();

    if (isSignUp) {
      const validationError = getSignUpValidationError(normalizedEmail, password);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    try {
      if (isSignUp) {
        const result = await signUp(normalizedEmail, password, name);
        console.log('Sign up result:', result);
        console.log('Redirecting to:', result.redirectTo || '/');
        toast.success("Account created successfully!", {
          description: result.message || "Check your email for the verification link before signing in.",
          duration: 7000,
        });

        navigate(result.redirectTo || '/');
      } else {
        await signInWithEmail(normalizedEmail, password);
        toast.success("Signed in successfully!");
        navigate("/browse");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Better error handling for common cases
      if (error.message?.includes('already been registered')) {
        toast.error("Account already exists", {
          description: "This email is already registered. Try signing in instead.",
          duration: 5000
        });
        setIsSignUp(false); // Switch to sign-in mode
      } else if (error.message?.includes('already in use')) {
        toast.error("Account already exists", {
          description: "This email is already registered. Try signing in instead.",
          duration: 5000,
        });
        setIsSignUp(false);
      } else if (error.message?.includes('valid email address')) {
        toast.error("Invalid email", {
          description: "Please enter a valid email address.",
          duration: 5000,
        });
      } else if (error.message?.includes('special character') || error.message?.includes('at least 8 characters')) {
        toast.error("Weak password", {
          description: error.message,
          duration: 6000,
        });
      } else if (error.message?.includes('Invalid login')) {
        toast.error("Invalid credentials", {
          description: "Email or password is incorrect. Make sure your account exists and try again.",
          duration: 5000
        });
      } else if (error.message?.includes('Invalid email or password')) {
        toast.error("Invalid credentials", {
          description: "Email or password is incorrect. Please try again.",
          duration: 5000,
        });
      } else if (error.message?.includes('Email not verified')) {
        toast.error("Email verification required", {
          description: "Please verify your email before signing in. Sending a new verification link now.",
          duration: 7000,
        });

        try {
          await resendVerificationEmail(normalizedEmail);
          toast.success('A fresh verification email has been sent.');
        } catch (resendError: any) {
          toast.error(resendError?.message || 'Could not resend verification email.');
        }
      } else if (error.message?.includes('rate limit exceeded')) {
        toast.error("Too many attempts", {
          description: "Please wait a few minutes before trying again, or use Google Sign-In instead.",
          duration: 7000
        });
      } else if (error.message?.includes('invalid') && error.message?.includes('mail')) {
        toast.error("Email configuration issue", {
          description: "Please try using Google Sign-In, or check your Supabase email settings.",
          duration: 7000
        });
      } else if (error.message?.includes('Supabase email signup is disabled')) {
        toast.error("Supabase email provider is disabled", {
          description: "Enable the Email provider in Supabase Authentication settings.",
          duration: 8000,
        });
      } else if (error.message?.includes('Email confirmation')) {
        toast.error("Email confirmation required", {
          description: "Please disable email confirmation in Supabase settings, or check your email inbox.",
          duration: 7000
        });
      } else {
        toast.error(error.message || `${isSignUp ? 'Sign up' : 'Sign in'} failed`, {
          duration: 5000
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Header />

      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
        
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-8 sm:p-10 border border-gray-700/50 shadow-2xl">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full opacity-75 blur-lg animate-pulse" />
                <svg
                  viewBox="0 0 100 100"
                  className="relative w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M50 20C33.43 20 20 33.43 20 50C20 66.57 33.43 80 50 80C66.57 80 80 66.57 80 50C80 33.43 66.57 20 50 20ZM50 70C38.95 70 30 61.05 30 50C30 38.95 38.95 30 50 30C61.05 30 70 38.95 70 50C70 61.05 61.05 70 50 70Z"
                    fill="url(#loginGradient)"
                    strokeWidth="3"
                    stroke="white"
                  />
                  <defs>
                    <linearGradient id="loginGradient" x1="20" y1="20" x2="80" y2="80">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
              <p className="text-gray-400">{isSignUp ? "Join Loopy today" : "Sign in to continue your journey"}</p>
            </motion.div>

            {/* Email/Password Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4 mb-4"
            >
              {isSignUp && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

               {isSignUp && (
                 <p className="text-xs text-gray-400 px-1">
                   Use 8+ characters and at least one special character.
                 </p>
               )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </motion.form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative my-6"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900/50 text-gray-400">Or continue with</span>
              </div>
            </motion.div>

            {/* Google Sign In Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 rounded-lg font-semibold text-base hover:bg-gray-100 transition-all shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5" />
              Sign in with Google
            </motion.button>

            {/* Google OAuth Setup Note */}
            {/* Toggle Sign Up/Sign In */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </motion.div>

            {/* Terms */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-xs text-gray-500 text-center mt-6"
            >
              By continuing, you agree to Loopy's Terms of Service and Privacy Policy
            </motion.p>
          </div>

          {/* Guest Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="text-center mt-6"
          >
            <button
              onClick={() => navigate("/browse")}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              Continue as guest
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <PageErrorBoundary pageName="Login">
      <LoginContent />
    </PageErrorBoundary>
  );
}
