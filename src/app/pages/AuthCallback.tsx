import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // The Google OAuth callback is handled server-side at /auth/google/callback
    // which stores the token in localStorage and redirects to /browse.
    // This page is a fallback in case something goes wrong.
    const token = localStorage.getItem('loopy_access_token');
    if (token) {
      navigate('/browse');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xl">Completing sign in...</p>
      </div>
    </div>
  );
}
