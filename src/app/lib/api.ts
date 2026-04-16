const projectId = 'ydywwijhmjvtkgxkugnx';
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXd3aWpobWp2dGtneGt1Z254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjYyMDUsImV4cCI6MjA4NjY0MjIwNX0.OpIif2nfVN38NGklmlaY6YiOk3dYQ0VZMEThAFOQeGk";
import { videos as Video, playlists, watch_history, profiles } from './table-definitions';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

export { supabase };
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
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,transcript.ilike.%${query}%`);
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

export const authApi = {
  signUp: async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) throw error;
    return {
      user: data.user,
      session: data.session,
      requiresEmailVerification: !data.session,
      message: !data.session ? 'Check your email for verification link.' : 'Account created successfully.',
      redirectTo: '/browse',
    };
  },

  resendVerificationEmail: async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return { message: 'Verification email sent.' };
  },

  getVerificationStatus: async (email: string) => {
    // With Supabase Auth, we can't directly check verification status
    // This would require admin API or checking the user if signed in
    throw new Error('Verification status check not available with standard Supabase Auth');
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // Supabase automatically manages the session
    return data;
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/browse`,
      },
    });
    if (error) throw error;
    // Supabase handles the redirect automatically
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Supabase clears the session automatically
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};

export const recommendationApi = {
  trackWatch: async (videoId: string, watchDuration: number, totalDuration: number) => {
    // Simplified: just return success without tracking
    return { success: true };
  },

  getRecommendations: async (): Promise<Video[]> => {
    // Simplified: return some random videos as recommendations
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .limit(10);
      if (error) throw error;
      return (data || []) as Video[];
    } catch {
      return [];
    }
  },

  getWatchHistory: async () => {
    // Simplified: return empty watch history
    return [];
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

  // Profile related functions
  getProfiles: async (accountId: string): Promise<profiles[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('account_id', accountId);
    if (error) throw error;
    return data || [];
  },

  createProfile: async (profile: Omit<profiles, 'id' | 'created_at'>): Promise<profiles> => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateProfile: async (id: string, updates: Partial<profiles>): Promise<profiles> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteProfile: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const adminApi = {
  uploadVideo: async (
    file: File,
    title: string,
    description?: string,
    genre?: string,
    releaseYear?: number,
    duration?: number,
    status?: 'processing' | 'ready' | 'deleted',
    intro_start?: number,
    intro_end?: number,
    recap_start?: number,
    recap_end?: number,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; video?: any; publicUrl?: string; error?: string }> => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { success: false, error: `Invalid file type. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}` };
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return { success: false, error: 'File too large. Maximum size is 5GB' };
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return { success: false, error: 'Not authenticated' };

      const user = userData.user;
      const path = `${user.id}/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(path, file, {
          upsert: false,
          onUploadProgress: ({ loaded, total }) => {
            onProgress?.((loaded / total) * 100);
          },
        });

      if (uploadError) return { success: false, error: uploadError.message };

      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(path);

      const publicUrl = publicUrlData.publicUrl;

      const videoData = {
        title,
        description: description || '',
        genre: genre || '',
        releaseYear: releaseYear || new Date().getFullYear(),
        duration: duration || 0,
        status: status || 'ready',
        intro_start: intro_start || 0,
        intro_end: intro_end || 0,
        recap_start: recap_start || 0,
        recap_end: recap_end || 0,
        video_file: publicUrl,
        uploaded_by: user.id,
      };

      const { data: insertedVideo, error: insertError } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (insertError) {
        // Clean up storage
        await supabase.storage.from('videos').remove([path]);
        return { success: false, error: insertError.message };
      }

      return { success: true, video: insertedVideo, publicUrl };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  getMyVideos: async (): Promise<{ videos: Video[] }> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('uploaded_by', userData.user.id);

    if (error) throw error;
    return { videos: (data || []) as Video[] };
  },

  deleteVideo: async (videoId: string): Promise<{ success: boolean; error?: string }> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { success: false, error: 'Not authenticated' };

    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('video_file')
      .eq('id', videoId)
      .eq('uploaded_by', userData.user.id)
      .single();

    if (fetchError) return { success: false, error: fetchError.message };
    if (!video) return { success: false, error: 'Video not found' };

    // Extract path from public URL
    const url = new URL(video.video_file);
    const path = url.pathname.replace('/storage/v1/object/public/videos/', '');

    // Delete from storage
    const { error: storageError } = await supabase.storage.from('videos').remove([path]);
    if (storageError) return { success: false, error: storageError.message };

    // Delete from DB
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (deleteError) return { success: false, error: deleteError.message };

    return { success: true };
  },
};
