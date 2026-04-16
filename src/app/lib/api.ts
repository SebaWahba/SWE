const projectId = 'ydywwijhmjvtkgxkugnx';
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXd3aWpobWp2dGtneGt1Z254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjYyMDUsImV4cCI6MjA4NjY0MjIwNX0.OpIif2nfVN38NGklmlaY6YiOk3dYQ0VZMEThAFOQeGk";
import { videos as Video, playlists, watch_history } from './table-definitions';
import { createClient } from '@supabase/supabase-js';

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
