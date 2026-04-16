import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { VideoRow } from "../components/VideoRow";
import { motion } from "motion/react";
import { useRecommendations } from "../contexts/RecommendationContext";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { Sparkles, TrendingUp } from "lucide-react";
import { RecommendationTutorial } from "../components/RecommendationTutorial";
import { useState, useEffect } from "react";
import { videoApi } from "../lib/api";
import { videos as Video } from "../lib/table-definitions";
import { PageErrorBoundary } from "../components/PageErrorBoundary";
import { toast } from "sonner";

const GENRES = [
  "Nature & Wildlife",
  "Science & Space",
  "Technology",
  "Travel & Adventure",
  "Food & Cooking",
  "Education",
  "History",
  "Health & Wellness"
];

function BrowseContent() {
  const { recommendations, watchHistory, isLoading: recsLoading } = useRecommendations();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const { videos: fetchedVideos } = await videoApi.getAll('All', 200, 0);
        setVideos(fetchedVideos);
      } catch (error: any) {
        console.error('[Browse] Error fetching videos:', error);
        toast.error('Failed to load videos. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Group videos by genre
  const videosByGenre: Record<string, Video[]> = {};
  for (const genre of GENRES) {
    const genreVideos = videos.filter(v => v.genre === genre);
    if (genreVideos.length > 0) {
      videosByGenre[genre] = genreVideos;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <Hero videos={videos} />

      {user && <RecommendationTutorial />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="-mt-32 relative z-10 pb-20"
      >
        {/* Personalized Recommendations */}
        {user && watchHistory.length > 0 && recommendations.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 sm:mx-6 lg:mx-8 mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-300">Personalized for You</h3>
                  <p className="text-sm text-gray-400">
                    Based on {watchHistory.length} video{watchHistory.length !== 1 ? 's' : ''} you've watched
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </motion.div>

            <VideoRow title="Recommended for You" videos={recommendations} />
          </>
        )}

        {/* Trending Now */}
        <VideoRow title="Trending Now" videos={videos.slice(0, 20)} />

        {/* Genre Rows */}
        {GENRES.map((genre) => {
          const genreVideos = videosByGenre[genre];
          if (!genreVideos || genreVideos.length === 0) return null;
          
          return (
            <VideoRow
              key={genre}
              title={genre}
              videos={genreVideos}
            />
          );
        })}
      </motion.div>
    </div>
  );
}

export default function Browse() {
  return (
    <PageErrorBoundary pageName="Browse">
      <BrowseContent />
    </PageErrorBoundary>
  );
}
