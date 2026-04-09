import { forwardRef } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, poster, onTimeUpdate, onEnded, onError }, ref) => {
    return (
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain bg-black"
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
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';