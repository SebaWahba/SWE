import { forwardRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  
  // UI State Props
  isPlaying?: boolean;
  progress?: number; // Timeline percentage: 0 to 100
  currentTimeDisplay?: string; // e.g., "1:23"
  durationDisplay?: string; // e.g., "5:00"
  
  // Action Hooks
  onPlayPauseClick?: () => void;
  onSeek?: (newProgressPercentage: number) => void;
  onPlayStatusChange?: (playing: boolean) => void; 
  
  // Original Props
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ 
    src, 
    poster, 
    isPlaying = false, 
    progress = 0, 
    currentTimeDisplay = "0:00", 
    durationDisplay = "0:00",
    onPlayPauseClick,
    onSeek,
    onPlayStatusChange,
    onTimeUpdate, 
    onEnded, 
    onError 
  }, ref) => {
    
    return (
      <div className="relative w-full h-full group bg-black overflow-hidden rounded-lg">
        <video
          ref={ref}
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          className="w-full h-full object-contain"
          onPlay={() => onPlayStatusChange && onPlayStatusChange(true)}
          onPause={() => onPlayStatusChange && onPlayStatusChange(false)}
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            if (onTimeUpdate) {
              onTimeUpdate(video.currentTime, video.duration);
            }
          }}
          onEnded={onEnded}
          onError={onError}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* CUSTOM GRAPHICAL UI OVERLAY */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3 z-10">
          
          {/* Timeline / Progress Bar */}
          <div 
            className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer relative hover:h-2 transition-all"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newProgress = (clickX / rect.width) * 100;
              if (onSeek) onSeek(newProgress);
            }}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-purple-600 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full shadow-md transition-transform hover:scale-125"
              style={{ left: `calc(${progress}% - 6px)` }}
            ></div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onPlayPauseClick}
                className="text-white hover:text-purple-500 transition-colors focus:outline-none"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>

              <span className="text-white text-sm font-medium tracking-wide font-mono">
                {currentTimeDisplay} <span className="text-gray-400 mx-1">/</span> {durationDisplay}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';