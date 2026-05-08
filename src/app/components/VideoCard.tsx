import { motion } from "motion/react";
import { Play, Info, Plus } from "lucide-react";
import { Video } from "../lib/api";
import { useNavigate } from "react-router";
import { useState } from "react";

interface VideoCardProps {
  video: Video;
  index: number;
}

export function VideoCard({ video, index }: VideoCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer"
      onClick={() => navigate(`/watch/${video.id}`)}
    >
      <img
        src={video.thumbnail || 'https://via.placeholder.com/400x225?text=Video'}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
              {video.genre}
            </span>
            <span className="text-xs text-gray-300">{video.duration}</span>
          </div>

          <h3 className="font-semibold text-white mb-1 line-clamp-1">
            {video.title}
          </h3>

          <p className="text-xs text-gray-300 line-clamp-2 mb-3">
            {video.description}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/watch/${video.id}`); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-black rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <Play className="w-3 h-3 fill-black" />
              Play
            </button>
          </div>
        </motion.div>

        <motion.h3
          animate={{ opacity: isHovered ? 0 : 1 }}
          className="font-semibold text-white absolute bottom-4"
        >
          {video.title}
        </motion.h3>
      </div>

      <motion.div
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.95,
        }}
        className="absolute inset-0 rounded-lg ring-2 ring-purple-500/50 pointer-events-none"
      />
    </motion.div>
  );
}
