import { projectId, publicAnonKey } from '/utils/supabase/info';
import { videos as Video, playlists, watch_history } from './table-definitions';
import { createClient } from '@supabase/supabase-js';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e24386a0`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('loopy_access_token');
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const getPublicHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

const getReturnOrigin = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.origin;
};

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);



export const videoApi = {
  getAll: async (category?: string, limit = 100, offset = 0): Promise<{ videos: Video[]; total: number }> => {
    let query = supabase.from('videos').select('*', { count: 'exact' });
    if (category && category !== 'All') {
      query = query.eq('genre', category);
    }
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;
    return { videos: (data || []) as Video[], total: count || 0 };
  },

  search: async (query: string): Promise<{ videos: Video[]; total: number }> => {
    const { data, error, count } = await supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    if (error) throw error;
    return { videos: (data || []) as Video[], total: count || 0 };
  },

  getById: async (id: string): Promise<Video> => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Video;
  },
};

export const authApi = {
  signUp: async (email: string, password: string, name?: string) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ email, password, name, returnOrigin: getReturnOrigin() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Sign up failed');
    return data;
  },

  resendVerificationEmail: async (email: string) => {
    const response = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ email, returnOrigin: getReturnOrigin() }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to resend verification email');
    return data;
  },

  getVerificationStatus: async (email: string) => {
    const response = await fetch(`${API_BASE}/auth/verification-status`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get verification status');
    return data;
  },

  signIn: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Sign in failed');
    localStorage.setItem('loopy_access_token', data.session.access_token);
    return data;
  },

  signInWithGoogle: async () => {
    const response = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ returnOrigin: getReturnOrigin() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Google sign-in failed');
    if (!data?.url) throw new Error('Failed to get Google sign-in URL');
    return data;
  },

  signOut: async () => {
    localStorage.removeItem('loopy_access_token');
  },

  getSession: async () => {
    const token = localStorage.getItem('loopy_access_token');
    if (!token) return null;
    return { access_token: token, token_type: 'bearer' };
  },

  getUser: async () => {
    try {
      const token = localStorage.getItem('loopy_access_token');
      if (!token) return null;

      const response = await fetch(`${API_BASE}/auth/user`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('loopy_access_token');
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  },
};

export const recommendationApi = {
  trackWatch: async (videoId: string, watchDuration: number, totalDuration: number) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return null;
      
      const response = await fetch(`${API_BASE}/watch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ videoId, watchDuration, totalDuration }),
      });

      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  },

  getRecommendations: async (): Promise<Video[]> => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return [];
      
      const response = await fetch(`${API_BASE}/recommendations`, { headers });
      if (!response.ok) return [];

      const data = await response.json();
      return (data.recommendations || []) as Video[];
    } catch {
      return [];
    }
  },

  getWatchHistory: async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return [];
      
      const response = await fetch(`${API_BASE}/watch-history`, { headers });
      if (!response.ok) return [];

      const data = await response.json();
      return data.history || [];
    } catch {
      return [];
    }
  },
};

export const dbApi = {
  getVideos: async (): Promise<Video[]> => {
    const { data, error } = await supabase
      .from('videos')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  getPlaylists: async (): Promise<playlists[]> => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  getWatchHistory: async (profileId: string): Promise<watch_history[]> => {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('profile_id', profileId);
    if (error) throw error;
    return data || [];
  },
};
