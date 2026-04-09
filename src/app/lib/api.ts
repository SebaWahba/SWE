import { projectId, publicAnonKey } from '/utils/supabase/info';

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

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  category: string;
  year: number;
  aiSummary: string;
  tags: string[];
  videoContent?: string;
}

export const videoApi = {
  getAll: async (category?: string, limit = 100, offset = 0): Promise<{ videos: Video[]; total: number }> => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`${API_BASE}/videos?${params}`, {
      headers: getPublicHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch videos: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  search: async (query: string): Promise<{ videos: Video[]; total: number }> => {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_BASE}/videos/search?${params}`, {
      headers: getPublicHeaders(),
    });
    if (!response.ok) throw new Error('Failed to search videos');
    return response.json();
  },

  getById: async (id: string): Promise<Video> => {
    const response = await fetch(`${API_BASE}/videos/${id}`, {
      headers: getPublicHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch video');
    const data = await response.json();
    return data.video;
  },
};

export const authApi = {
  signUp: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: getPublicHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Sign up failed');
    localStorage.setItem('loopy_access_token', data.session.access_token);
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
      body: JSON.stringify({ returnOrigin: window.location.origin }),
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
      return data.recommendations || [];
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
