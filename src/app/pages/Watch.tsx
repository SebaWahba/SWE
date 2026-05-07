import { useParams, useNavigate, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { videoApi, watchHistoryApi, supabase } from "../lib/api"; 
import { useProfile } from "../contexts/ProfileContext"; 
import { Header } from "../components/Header";
import { VideoPlayer } from "../components/VideoPlayer";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Clock, X, Plus, Share2, Search, PlayCircle, Download } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { downloadVideo, getDownloadedVideo, isDownloadSupported } from "../lib/downloads";


function WatchContent() {
  const { id } = useParams();
  const { currentProfile } = useProfile();  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [video, setVideo] = useState<any | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Memory Banks to survive component destruction
  const latestTimeRef = useRef<number>(0);
  const latestDurationRef = useRef<number>(0);

  // Video logic
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState("0:00");
  const [durationDisplay, setDurationDisplay] = useState("0:00");

  // Continue Watching Logic State
  const [savedTimestamp, setSavedTimestamp] = useState<number>(0);
  const [hasResumed, setHasResumed] = useState(false);

  // 1. Fetch the saved timestamp when the page loads
  useEffect(() => {
    const fetchHistory = async () => {
      if (!id || !currentProfile?.id) return;
      const { data } = await supabase
        .from('watch_history')
        .select('progress_timestamp, completed') 
        .eq('profile_id', currentProfile.id)
        .eq('video_id', id)
        .single();
      
      // Only resume IF there is a timestamp AND the video is NOT completed.
      // If it is completed, we just let it naturally start at 0:00.
      if (data && data.progress_timestamp && !data.completed) {
        setSavedTimestamp(data.progress_timestamp);
      }
    };
    fetchHistory();
  }, [id, currentProfile]);

  // 2. Safely resume the video ONLY after the browser loads its metadata
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || savedTimestamp === 0 || hasResumed) return;

    const handleLoadedMetadata = () => {
      videoElement.currentTime = savedTimestamp;
      setHasResumed(true);
      toast.success(`Resumed from ${formatTime(savedTimestamp)}`);
    };

    if (videoElement.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [savedTimestamp, hasResumed, isLoading]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (newProgress: number) => {
    if (videoRef.current && videoRef.current.duration) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleTimeUpdate = (current: number, duration: number) => {
    if (duration > 0) {
      // Continuously update the memory bank
      latestTimeRef.current = current;
      latestDurationRef.current = duration;
      
      setProgress((current / duration) * 100);
      setDurationDisplay(formatTime(duration));

      const currentSecond = Math.floor(current);

      // Save at exactly 3 seconds to register it, then every 10 seconds
      if ((currentSecond === 3 || currentSecond % 10 === 0) && currentSecond !== 0 && currentProfile?.id) {
        watchHistoryApi.saveProgress(currentProfile.id, id as string, current, duration);
      }
    }
    setCurrentTimeDisplay(formatTime(current));
  };


 const handleDownload = async () => {
    const sourceUrl = video?.video_file || video?.src || video?.videoUrl;
    if (!sourceUrl) {
      toast.error("This video does not have a downloadable source.");
      return;
    }
    if (!isDownloadSupported()) {
      toast.error("Downloads are not supported on this device.");
      return;
    }
    if (isDownloaded) {
      toast.success("This title is already downloaded.");
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      await downloadVideo({
        video: {
          id: video.id,
          title: video.title,
          description: video.description,
          genre: video.genre,
          duration: video.duration,
          video_file: sourceUrl,
        },
        onProgress: (progressPercent) => {
          setDownloadProgress(progressPercent);
        },
        onLowStorageWarning: (message) => {
          toast.warning(message);
        },
      });
      setIsDownloaded(true);
      toast.success("Download complete. Available in Downloads.");
    } catch (error: any) {
      toast.error(error?.message || "Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };
  
// const handleDownload = async () => {
//   if (!video?.video_file) return;
//   const isSupabase = video.video_file.includes('supabase.co');
//   if (isSupabase) {
//     const a = document.createElement('a');
//     a.href = `${video.video_file}?download=${video.title || 'video'}.mp4`;
//     a.download = `${video.title || 'video'}.mp4`;
//     a.click();
//   } else {
//     const response = await fetch(video.video_file);
//     const blob = await response.blob();
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(blob);
//     a.download = `${video.title || 'video'}.mp4`;
//     a.click();
//     URL.revokeObjectURL(a.href);
//   }
// };

  const keyMoments = (video?.timestamps || []) as { time: string; label: string }[];
  
  const transcriptRows = video?.transcript 
    ? (video.transcript as string).split('. ').map((text, i) => ({
        time: `0:${(i * 8).toString().padStart(2, '0')}`, 
        text: text.trim() + (text.endsWith('.') ? '' : '.')
      }))
    : [];

  const filteredTranscript = transcriptSearch 
    ? transcriptRows.filter(row => row.text.toLowerCase().includes(transcriptSearch.toLowerCase()))
    : transcriptRows;

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await videoApi.getById(id);
        setVideo(data);
      } catch (err) {
        toast.error("Video not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!", {
          description: "You can now share this title with your friends.",
        });
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to view this content");
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`);
    }
  }, [user, authLoading, navigate, location.pathname]);
  useEffect(() => {
    const checkDownloadStatus = async () => {
      if (!id || !isDownloadSupported()) return;
      try {
        const downloaded = await getDownloadedVideo(id);
        setIsDownloaded(Boolean(downloaded));
      } catch {
        setIsDownloaded(false);
      }
    };
    checkDownloadStatus();
  }, [id]);

  const jumpToTime = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];

    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      toast.success(`Jumped to ${timeStr}`);
  // EXACT SAVE 1: When the user clicks pause
  useEffect(() => {
    if (!isPlaying && videoRef.current && currentProfile?.id && id) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      // Save exact timestamp (e.g., 14.732 seconds)
      if (duration > 0 && current >= 3) {
        watchHistoryApi.saveProgress(currentProfile.id, id, current, duration);
      }
    }
  }, [isPlaying, currentProfile, id]);

  // EXACT SAVE 2: When navigating away, closing the tab, or refreshing
  useEffect(() => {
    const saveExactProgress = () => {
      const current = latestTimeRef.current;
      const duration = latestDurationRef.current;
      
      // Read directly from the Memory Bank
      if (currentProfile?.id && id && duration > 0 && current >= 3) {
        watchHistoryApi.saveProgress(currentProfile.id, id, current, duration);
      }
    };

    // Catch browser tab closes
    window.addEventListener('beforeunload', saveExactProgress);

    return () => {
      // Catch React Router navigation (e.g., clicking Home)
      saveExactProgress();
      window.removeEventListener('beforeunload', saveExactProgress);
    };
  }, [currentProfile, id]); 

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-bold text-purple-500 animate-pulse">Analyzing Video Data...</div>;
  if (!video) return <div className="p-20 text-center text-white">Video not found</div>;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <Header />
      
      <main className="container mx-auto px-4 py-24 flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          
          {/* Video Player Section with Wired Up Logic */}
          <div className="aspect-video bg-gray-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group">
            <VideoPlayer 
              key={video.id} 
              ref={videoRef}
              src={video.video_file || video.src} 
              
              // Dynamic UI State
              isPlaying={isPlaying}
              progress={progress}
              currentTimeDisplay={currentTimeDisplay}
              durationDisplay={durationDisplay}
              
              // Attached Logic Functions
              onPlayPauseClick={handlePlayPause}
              onSeek={handleSeek}
              onTimeUpdate={handleTimeUpdate}
              onPlayStatusChange={(playing) => setIsPlaying(playing)}
            />
          </div>

          {/* Metadata Section */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              {video.genre && (
                <span className="bg-purple-600 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black">
                  {video.genre}
                </span>
              )}
              <span className="text-gray-500 text-sm">{video.duration || '0:00'}</span>
            </div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              {video.title}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
              {video.description}
            </p>
          </div>

          {/* Key Moments */}
          <section className="mt-16 border-t border-white/5 pt-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Clock size={24} />
              </div>
              <h3 className="text-2xl font-bold">Key Chapters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {keyMoments.map((moment, idx) => (
                <button 
                  key={idx}
                  onClick={() => jumpToTime(moment.time)}
                  className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-left group"
                >
                  <span className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors">{moment.label}</span>
                  <span className="font-mono text-sm text-purple-500 bg-purple-500/10 px-3 py-1 rounded-lg">
                    {moment.time}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Transcript Search */}
          <section className="mt-16 border-t border-white/5 pt-10 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-bold mb-2">Full Transcript</h3>
                <p className="text-sm text-gray-500">Search sentences and click to jump.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search video content..." 
                  className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-purple-500 outline-none transition-all"
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredTranscript.map((row, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={idx} 
                    onClick={() => jumpToTime(row.time)}
                    className="flex gap-6 p-4 rounded-2xl hover:bg-purple-500/5 transition-all cursor-pointer group border border-transparent hover:border-purple-500/20"
                  >
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-purple-500 font-mono text-xs font-bold">{row.time}</span>
                       <PlayCircle size={14} className="opacity-0 group-hover:opacity-100 text-purple-500 transition-opacity" />
                    </div>
                    <p className="text-gray-400 group-hover:text-gray-200 leading-relaxed">
                      {row.text}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Action Sidebar */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl sticky top-24">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8">Video Actions</h3>
            <div className="space-y-4">
              <button className="w-full py-5 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                <Plus size={20} /> Add to Collection
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              >
                <Download size={20} />
                {isDownloaded ? "Downloaded" : isDownloading ? `Downloading ${Math.round(downloadProgress)}%` : "Download Video"}
              </button>
              {isDownloading && (
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${Math.max(2, downloadProgress)}%` }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleShare}
                  className="py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <Share2 size={18} /> Share
                </button>
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className={`py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${showChat ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <MessageSquare size={18} /> AI Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


  }}