import { motion } from "motion/react";
import { useRecommendations } from "../contexts/RecommendationContext";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router";

export function WatchHistoryPanel() {
  const { watchHistory } = useRecommendations();
  const navigate = useNavigate();

  if (watchHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Watch History Yet</h3>
        <p className="text-gray-400">Start watching videos to build your personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold">Watch History</h2>
      </div>

      <div className="space-y-3">
        {watchHistory.slice(0, 20).map((item: any, index: number) => {
          const video = item.video;
          if (!video) return null;

          const percentWatched = item.totalDuration > 0 
            ? Math.round((item.watchDuration / item.totalDuration) * 100) 
            : 0;

          return (
            <motion.div
              key={`${item.videoId}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/watch/${video.id}`)}
              className="flex items-center gap-4 p-4 bg-gray-800/60 hover:bg-gray-800 rounded-lg cursor-pointer transition-all"
            >
              <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${Math.min(percentWatched, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 truncate">{video.title}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                    {item.category || video.category}
                  </span>
                  {item.completed && (
                    <span className="text-green-400 text-xs">Completed</span>
                  )}
                  {!item.completed && percentWatched > 0 && (
                    <span>{percentWatched}% watched</span>
                  )}
                  {item.timestamp && (
                    <>
                      <span>·</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {watchHistory.length > 20 && (
        <p className="text-center text-gray-500 mt-4">
          Showing 20 of {watchHistory.length} videos
        </p>
      )}
    </div>
  );
}
