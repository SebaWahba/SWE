import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Video, recommendationApi } from "../lib/api";
import { useAuth } from "./AuthContext";

interface WatchHistory {
  videoId: string;
  timestamp: string;
  watchDuration: number;
  totalDuration: number;
  category: string;
  tags: string[];
  completed: boolean;
  video?: Video;
}

interface RecommendationContextType {
  trackVideoWatch: (videoId: string, watchDuration: number, totalDuration: number) => Promise<void>;
  watchHistory: WatchHistory[];
  recommendations: Video[];
  isLoading: boolean;
  refreshRecommendations: () => Promise<void>;
  refreshWatchHistory: () => Promise<void>;
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, isLoading: authIsLoading } = useAuth();
  
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWatchHistory = useCallback(async () => {
    if (!user || !accessToken) return;
    try {
      const history = await recommendationApi.getWatchHistory();
      setWatchHistory(history);
    } catch (error) {
      console.error('Error fetching watch history:', error);
    }
  }, [user, accessToken]);

  const refreshRecommendations = useCallback(async () => {
    if (!user || !accessToken) return;
    try {
      setIsLoading(true);
      const recs = await recommendationApi.getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, accessToken]);

  // Fetch data when auth is ready
  useEffect(() => {
    if (authIsLoading) return;
    
    if (user && accessToken) {
      const timer = setTimeout(() => {
        refreshWatchHistory();
        refreshRecommendations();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setWatchHistory([]);
      setRecommendations([]);
    }
  }, [user, accessToken, authIsLoading, refreshWatchHistory, refreshRecommendations]);

  const trackVideoWatch = useCallback(async (videoId: string, watchDuration: number, totalDuration: number) => {
    if (!user) return;
    try {
      await recommendationApi.trackWatch(videoId, watchDuration, totalDuration);
      await refreshRecommendations();
      await refreshWatchHistory();
    } catch (error) {
      console.error('Error tracking video watch:', error);
    }
  }, [user, refreshRecommendations, refreshWatchHistory]);

  return (
    <RecommendationContext.Provider
      value={{
        trackVideoWatch,
        watchHistory,
        recommendations,
        isLoading,
        refreshRecommendations,
        refreshWatchHistory,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendations() {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  return context;
}
