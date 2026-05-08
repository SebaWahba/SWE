import { motion } from "motion/react";
import { Play, Info } from "lucide-react";
import { useNavigate } from "react-router";
import { Video } from "../lib/api";

interface HeroProps {
  videos?: Video[];
}

export function Hero({ videos = [] }: HeroProps) {
  const navigate = useNavigate();
  
  // Pick a featured video - first video or fallback
  const featuredVideo = videos[0];

  if (!featuredVideo) {
    return (
      <div className="relative h-[70vh] sm:h-[85vh] w-full bg-gradient-to-br from-purple-900/40 via-black to-pink-900/40 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Loopy</h1>
          <p className="text-gray-400">Loading featured content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] sm:h-[85vh] w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={featuredVideo.thumbnail}
          alt={featuredVideo.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl lg:max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">
                FEATURED
              </span>
              <span className="text-gray-300 text-sm">{featuredVideo.category}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
            >
              {featuredVideo.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-base sm:text-lg text-gray-200 mb-6 line-clamp-3"
            >
              {featuredVideo.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-4 text-sm text-gray-300 mb-8"
            >
              <span className="font-semibold text-green-400">98% Match</span>
              <span>{featuredVideo.year}</span>
              <span>{featuredVideo.duration}</span>
              <span className="px-2 py-0.5 border border-gray-400 text-xs">HD</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/watch/${featuredVideo.id}`)}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-white text-black rounded-md font-bold text-base sm:text-lg hover:bg-gray-200 transition-colors shadow-lg"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
                Play
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/watch/${featuredVideo.id}`)}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-gray-500/70 backdrop-blur-sm text-white rounded-md font-bold text-base sm:text-lg hover:bg-gray-500/90 transition-colors"
              >
                <Info className="w-5 h-5 sm:w-6 sm:h-6" />
                More Info
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
