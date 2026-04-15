import { projectId, publicAnonKey } from '/utils/supabase/info';
import { videos as Video, playlists, watch_history } from './table-definitions';
import { createClient } from '@supabase/supabase-js';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e24386a0`;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

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

export const adminApi = {
  uploadVideo: async (
    file: File,
    title: string,
    description?: string,
    genre?: string,
    category?: string,
    tags?: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; video?: any; publicUrl?: string; error?: string }> => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { success: false, error: `Invalid file type. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}` };
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return { success: false, error: 'File too large. Maximum size is 5GB' };
    }

    try {
      const token = localStorage.getItem('loopy_access_token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('genre', genre || '');
      formData.append('category', category || '');
      formData.append('tags', tags || '');

      const result = await new Promise<{ success: boolean; video?: any; publicUrl?: string; error?: string }>((resolve) => {
        const xhr = new XMLHttpRequest();

        if (onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              onProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
        }

        xhr.onload = () => {
          let data: any = {};
          try {
            data = JSON.parse(xhr.responseText || '{}');
          } catch {
            data = {};
          }

          if (xhr.status < 200 || xhr.status >= 300) {
            resolve({ success: false, error: data?.error || `Upload failed: ${xhr.status}` });
            return;
          }

          resolve({
            success: Boolean(data?.success),
            video: data?.video,
            publicUrl: data?.publicUrl,
            error: data?.error,
          });
        };

        xhr.onerror = () => resolve({ success: false, error: 'Network error' });
        xhr.open('POST', `${API_BASE}/admin/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  getMyVideos: async (): Promise<{ videos: any[] }> => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/admin/videos`, { headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch videos');
    return { videos: data.videos || [] };
  },

  deleteVideo: async (videoId: string): Promise<{ success: boolean; error?: string }> => {
    const headers = getAuthHeaders();
    if (!headers) return { success: false, error: 'Not authenticated' };

    const response = await fetch(`${API_BASE}/admin/videos/${videoId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Delete failed' };
    return { success: true };
  },
};
