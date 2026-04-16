import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { dbApi } from "../lib/api";
import { useAuth } from "./AuthContext";

interface Profile {
  id: string;
  account_id: string;
  name: string;
  recommender_profile: any[];
  default_language: string;
  created_at: string;
}

interface ProfileContextType {
  profiles: Profile[];
  currentProfile: Profile | null;
  loading: boolean;
  error: string | null;
  setCurrentProfile: (profile: Profile | null) => void;
  addProfile: (name: string, defaultLanguage?: string) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  initializeProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load profiles for the current user
  const initializeProfiles = useCallback(async () => {
    if (!user) {
      setProfiles([]);
      setCurrentProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userProfiles = await dbApi.getProfiles(user.id);
      setProfiles(userProfiles);
      
      // If no current profile is set, use the first one or null if none exist
      if (!currentProfile && userProfiles.length > 0) {
        setCurrentProfile(userProfiles[0]);
      } else if (currentProfile && !userProfiles.some(p => p.id === currentProfile.id)) {
        // If current profile no longer exists, set to first available or null
        setCurrentProfile(userProfiles.length > 0 ? userProfiles[0] : null);
      }
    } catch (err) {
      console.error('[ProfileContext] Error loading profiles:', err);
      setError('Failed to load profiles');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentProfile]);

  // Set current profile
  const setCurrentProfileHandler = useCallback((profile: Profile | null) => {
    setCurrentProfile(profile);
  }, []);

  // Add new profile
  const addProfile = useCallback(async (name: string, defaultLanguage: string = 'en') => {
    if (!user) {
      throw new Error('User must be logged in to add a profile');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newProfile = await dbApi.createProfile({
        account_id: user.id,
        name,
        default_language: defaultLanguage,
        recommender_profile: []
      });
      
      setProfiles(prev => [...prev, newProfile]);
      
      // Set as current profile if it's the first one
      if (profiles.length === 0) {
        setCurrentProfile(newProfile);
      }
      
      return newProfile;
    } catch (err) {
      console.error('[ProfileContext] Error adding profile:', err);
      setError('Failed to add profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, profiles.length]);

  // Update profile
  const updateProfile = useCallback(async (id: string, updates: Partial<Profile>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await dbApi.updateProfile(id, updates);
      
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === id ? { ...profile, ...updatedProfile } : profile
        )
      );
      
      // Update current profile if it's the one being updated
      if (currentProfile?.id === id) {
        setCurrentProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      }
      
      return updatedProfile;
    } catch (err) {
      console.error('[ProfileContext] Error updating profile:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProfile]);

  // Delete profile
  const deleteProfile = useCallback(async (id: string) => {
    // Prevent deleting the last profile
    if (profiles.length <= 1) {
      throw new Error('Cannot delete the last profile');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await dbApi.deleteProfile(id);
      
      setProfiles(prev => prev.filter(profile => profile.id !== id));
      
      // If deleting current profile, switch to another one
      if (currentProfile?.id === id) {
        const newCurrentProfile = profiles.find(profile => profile.id !== id);
        setCurrentProfile(newCurrentProfile || null);
      }
    } catch (err) {
      console.error('[ProfileContext] Error deleting profile:', err);
      setError('Failed to delete profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProfile, profiles.length]);

  // Initialize profiles when user changes
  useEffect(() => {
    initializeProfiles();
  }, [user, initializeProfiles]);

  // Reinitialize profiles when they might have changed externally
  useEffect(() => {
    if (user) {
      initializeProfiles();
    }
  }, [user, initializeProfiles]);

  const value = {
    profiles,
    currentProfile,
    loading,
    error,
    setCurrentProfile: setCurrentProfileHandler,
    addProfile,
    updateProfile,
    deleteProfile,
    initializeProfiles
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}