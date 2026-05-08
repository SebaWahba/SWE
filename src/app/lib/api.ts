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
    // #region agent log
    fetch('http://127.0.0.1:7261/ingest/fa3a52be-dbfb-4934-82fa-dd35d4226e2e',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e74e94'},body:JSON.stringify({sessionId:'e74e94',runId:'run1',hypothesisId:'H4',location:'src/app/lib/api.ts:22',message:'videoApi.getAll entered',data:{category:category ?? 'All',limit,offset},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    let query = supabase.from('videos').select('*', { count: 'exact' });
    if (category && category !== 'All') {
      query = query.eq('genre', category);
    }
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    // #region agent log
    fetch('http://127.0.0.1:7261/ingest/fa3a52be-dbfb-4934-82fa-dd35d4226e2e',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e74e94'},body:JSON.stringify({sessionId:'e74e94',runId:'run1',hypothesisId:'H5',location:'src/app/lib/api.ts:27',message:'videoApi.getAll query resolved',data:{hasError:Boolean(error),errorName:error?.name,errorMessage:error?.message,count:data?.length ?? 0,total:count ?? 0},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
    checkIsAdmin: async (userId: string): Promise<boolean> => {
      const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle()
    if(error){ 
      console.log('Error checking admin status:', error);
      return false
    }
    return data?.is_admin || false;

  }
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
        status: 'processing',
        intro_start: intro_start || 0,
        intro_end: intro_end || 0,
        recap_start: recap_start || 0,
        recap_end: recap_end || 0,
        video_file: publicUrl,
        raw_video_file: null, // Will be populated by MediaConvert callback
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

  updateVideoStatusAndUrl: async (videoId: string, status: 'processing' | 'ready' | 'deleted' | 'failed', videoFileUrl?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const updateData: { status: 'processing' | 'ready' | 'deleted' | 'failed'; video_file?: string | null } = { status };
      if (videoFileUrl) {
        updateData.video_file = videoFileUrl;
      }

      const { error } = await supabase
        .from('videos')
        .update(updateData)
        .eq('id', videoId);

      if (error) {
        console.error(`Error updating video ${videoId} status:`, error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update video status' };
    }
  },

  getAllVideos: async (): Promise<{ videos: Video[] }> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('Not authenticated');

    // Check if user is admin
    const isAdmin = await authApi.checkIsAdmin(userData.user.id);
    if (!isAdmin) throw new Error('Not authorized');

    const { data, error } = await supabase
      .from('videos')
      .select('*');

    if (error) throw error;
    return { videos: (data || []) as Video[] };
  },

  deleteVideo: async (videoId: string): Promise<{ success: boolean; error?: string }> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { success: false, error: 'Not authenticated' };

    // Check if user is admin
    const isAdmin = await authApi.checkIsAdmin(userData.user.id);

    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('video_file')
      .eq('id', videoId)
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
    const query = supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    // If not admin, only allow deleting own videos
    if (!isAdmin) {
      query.eq('uploaded_by', userData.user.id);
    }

    const { error: deleteError } = await query;

    if (deleteError) return { success: false, error: deleteError.message };

    return { success: true };
  },
  editVideo: async (
    videoId: string, 
    updates: Partial<Video>
  ): Promise<{ success: boolean; video?: Video; error?: string }> => {
    
    // 1. Authenticate user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user is admin
    const isAdmin = await authApi.checkIsAdmin(userData.user.id);

    // 2. Perform the update
    const query = supabase
      .from('videos')
      .update(updates)     // This dynamically updates whatever you passed in!
      .eq('id', videoId)
      .select()
      .single();

    // If not admin, only allow editing own videos
    if (!isAdmin) {
      query.eq('uploaded_by', userData.user.id);
    }
    
    const { data, error } = await query;
    
    // 3. Handle responses
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Video not found' };

    return { success: true, video: data };
  }
};



export const watchHistoryApi = {
  /**
   * Saves the user's progress based on FR1 and FR3 rules.
   */
  saveProgress: async (profileId: string, videoId: string, currentTime: number, duration: number) => {
    if (!profileId || !videoId || duration <= 0) return;

    const isCompleted = (currentTime / duration) >= 0.95; // 95% completion rule
    
    // Only save to DB if watched at least 3 seconds OR if it's marked completed
    if (currentTime < 3 && !isCompleted) return;

    const { error } = await supabase
      .from('watch_history')
      .upsert({
        profile_id: profileId,
        video_id: videoId,
        progress_timestamp: Math.floor(currentTime),
        completed: isCompleted,
        watched_at: new Date().toISOString(),
      }, { onConflict: 'profile_id, video_id' });

    if (error) console.error("Error saving watch history:", error);
  },

  /**
   * Fetches the "Continue Watching" list for the homepage.
   */
  getContinueWatching: async (profileId: string) => {
    if (!profileId) return [];

    // 1. Fetch only the watch_history data 
    const { data: historyData, error: historyError } = await supabase
      .from('watch_history')
      .select('video_id, progress_timestamp')
      .eq('profile_id', profileId)
      .eq('completed', false)
      .gte('progress_timestamp', 3)
      .order('watched_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error("Error fetching watch history:", historyError);
      return [];
    }

    if (!historyData || historyData.length === 0) return [];

    // 2. Extract the video IDs from the history
    const videoIds = historyData.map(record => record.video_id);

    // 3. Fetch the actual video metadata for those specific IDs
    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .in('id', videoIds);

    if (videosError) {
      console.error("Error fetching continue watching videos:", videosError);
      return [];
    }

    // 4. Manually merge them together to simulate a database join
    const joinedData = historyData.map(historyItem => {
      const matchingVideo = videosData?.find(v => v.id === historyItem.video_id);
      return {
        progress_timestamp: historyItem.progress_timestamp,
        videos: matchingVideo || null 
      };
    }).filter(item => item.videos !== null); // Filter out any orphaned history records

    return joinedData;
  }
}