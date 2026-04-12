import { useParams, useNavigate } from "react-router";
import { Header } from "../components/Header";
import { VideoCard } from "../components/VideoCard";
import { VideoPlayer } from "../components/VideoPlayer";
import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRecommendations } from "../contexts/RecommendationContext";
import { videoApi, Video } from "../lib/api";
import { toast } from "sonner";
import { PageErrorBoundary } from "../components/PageErrorBoundary";
import { Sparkles, Plus, Share2, MessageSquare, ChevronLeft, Check, X, Send, Clock } from "lucide-react";
import { projectId, publicAnonKey } from '/utils/supabase/info';

const GENRES = [
  "All",
  "Nature & Wildlife",
  "Science & Space",
  "Technology",
  "Travel & Adventure",
  "Food & Cooking",
  "Education",
  "History",
  "Health & Wellness"
];

function WatchContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trackVideoWatch } = useRecommendations();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchTracked = useRef(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // New state for features
  const [showKeyMoments, setShowKeyMoments] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isInWatchList, setIsInWatchList] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', message: string, timestamp?: number}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const videoData = await videoApi.getById(id);
        console.log('Video data loaded:', videoData);
        setVideo(videoData);
        setVideoError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching video:', error);
        toast.error('Failed to load video');
        setVideoError('Failed to load video');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  // Track video watch when user watches significant portion
  useEffect(() => {
    if (!video || !user || watchTracked.current) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const watchDuration = videoElement.currentTime;
      const totalDuration = videoElement.duration;
      const percentWatched = (watchDuration / totalDuration) * 100;

      // Track when user has watched at least 10% or 30 seconds
      if ((percentWatched >= 10 || watchDuration >= 30) && !watchTracked.current) {
        watchTracked.current = true;
        trackVideoWatch(video.id, watchDuration, totalDuration);
        toast.success("🎯 Loopy is learning your preferences!", {
          description: "This helps us recommend better content for you"
        });
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [video, user, trackVideoWatch]);

  // Navigation Handler for Top Tabs
  const handleGenreClick = (genre: string) => {
    navigate(`/browse?category=${genre}`);
  };

  // Check if video is in watchlist
  useEffect(() => {
    if (!id) return;
    const watchlist = JSON.parse(localStorage.getItem('loopy_watchlist') || '[]');
    setIsInWatchList(watchlist.includes(id));
  }, [id]);

  // Handle add to watchlist
  const toggleWatchList = () => {
    if (!id) return;
    const watchlist = JSON.parse(localStorage.getItem('loopy_watchlist') || '[]');
    
    if (isInWatchList) {
      const updated = watchlist.filter((vid: string) => vid !== id);
      localStorage.setItem('loopy_watchlist', JSON.stringify(updated));
      setIsInWatchList(false);
      toast.success('Removed from Library');
    } else {
      watchlist.push(id);
      localStorage.setItem('loopy_watchlist', JSON.stringify(watchlist));
      setIsInWatchList(true);
      toast.success('Added to Library!');
    }
  };

  // Handle share
  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    try {
      // Try to use clipboard API
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      // Fallback: Create a temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.select();
      
      try {
        document.execCommand('copy');
        toast.success('Link copied to clipboard!');
      } catch (fallbackError) {
        // If both methods fail, show the URL
        toast.info(`Share this link: ${shareUrl}`, {
          duration: 5000,
        });
      }
      
      document.body.removeChild(tempInput);
    }
  };

  // Handle AI chat
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message
    const newMessages = [...chatMessages, { role: 'user' as const, message: chatInput }];
    setChatMessages(newMessages);
    
    // Call AI API
    const userQuestion = chatInput;
    setChatInput('');
    
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e24386a0/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        question: userQuestion,
        videoId: video?.id,
        videoTitle: video?.title,
        videoDescription: video?.description
      })
    })
      .then(res => res.json())
      .then(data => {
        const aiResponse = data.response || "I'm sorry, I couldn't generate a response.";
        
        // Check for timestamp in response
        const timestampMatch = aiResponse.match(/\[TIMESTAMP:(\d+):(\d+)\]/);
        if (timestampMatch) {
          const minutes = parseInt(timestampMatch[1]);
          const seconds = parseInt(timestampMatch[2]);
          const timeInSeconds = minutes * 60 + seconds;
          
          // Clean the message to show without the timestamp tag
          const cleanMessage = aiResponse.replace(/\[TIMESTAMP:\d+:\d+\]/, '');
          setChatMessages([...newMessages, { 
            role: 'ai' as const, 
            message: cleanMessage,
            timestamp: timeInSeconds
          }]);
        } else {
          setChatMessages([...newMessages, { role: 'ai' as const, message: aiResponse }]);
        }
      })
      .catch(error => {
        console.error('AI chat error:', error);
        setChatMessages([...newMessages, { 
          role: 'ai' as const, 
          message: "I'm having trouble connecting to the AI service. Please try again." 
        }]);
      });
  };

  // Generate key moments
  const keyMoments = video ? [
    { time: '0:15', title: 'Introduction', description: 'Overview of the main topic' },
    { time: '2:30', title: 'Key Concept #1', description: video.tags[0] || 'Main discussion point' },
    { time: '5:45', title: 'Deep Dive', description: 'Detailed analysis and examples' },
    { time: '8:20', title: 'Key Concept #2', description: video.tags[1] || 'Additional insights' },
    { time: '10:00', title: 'Conclusion', description: 'Summary and final thoughts' },
  ] : [];

  // Generate transcript
  const transcript = video ? [
    { time: '0:00', text: `Welcome to ${video.title}. Today we'll be exploring ${video.description.slice(0, 100)}...` },
    { time: '0:45', text: `Let's dive into the fascinating world of ${video.category.toLowerCase()}...` },
    { time: '1:30', text: `${video.aiSummary.slice(0, 150)}...` },
    { time: '3:00', text: `As we discuss ${video.tags[0]}, it's important to understand the broader context...` },
    { time: '5:00', text: `Moving on to ${video.tags[1] || 'the next topic'}, we see some interesting patterns...` },
    { time: '7:00', text: `In conclusion, ${video.description.slice(-100)}` },
  ] : [];

  const filteredTranscript = transcriptSearch 
    ? transcript.filter(t => t.text.toLowerCase().includes(transcriptSearch.toLowerCase()))
    : transcript;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium text-gray-400">Video not found</p>
        <button onClick={() => navigate('/browse')} className="text-purple-400 flex items-center gap-2">
          <ChevronLeft size={20} /> Return to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      
      {/* 3. Sub-Navigation (Top Tabs) */}
      <div className="pt-20 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-6 py-4">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-purple-400 ${
                  video.genre === genre ? "text-purple-500 border-b-2 border-purple-500" : "text-gray-400"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: PLAYER & INFO */}
          <div className="flex-1">
            {/* 4. The Video Player */}
            <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative group">
              {!videoError && (
                <VideoPlayer 
                  ref={videoRef}
                  src={video.video_file}
                  key={`${video.id}-${retryCount}`}
                  
                  // Temporary Props for testing
                  isPlaying={false}
                  progress={45}
                  currentTimeDisplay="1:30"
                  durationDisplay="3:20"
                  

                  onError={(e) => {
                    const videoEl = e.currentTarget;
                    console.error('Video playback error:', {
                      error: videoEl.error,
                      networkState: videoEl.networkState,
                      readyState: videoEl.readyState,
                      src: video.video_file
                    });
                    
                    let errorMsg = 'Video failed to load.';
                    if (videoEl.error) {
                      switch (videoEl.error.code) {
                        case MediaError.MEDIA_ERR_ABORTED: errorMsg = 'Video playback was aborted.'; break;
                        case MediaError.MEDIA_ERR_NETWORK: errorMsg = 'Network error while loading video.'; break;
                        case MediaError.MEDIA_ERR_DECODE: errorMsg = 'Video format not supported by your browser.'; break;
                        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errorMsg = 'Video source not found or not supported.'; break;
                      }
                    }
                    
                    setVideoError(errorMsg);
                    toast.error('Video playback error', { description: errorMsg });
                  }}
                />
              )}
              
              {/* Video Error Overlay */}
              {videoError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-white text-xl mb-2">{videoError}</p>
                    <p className="text-gray-400 text-sm mb-6">Video URL: {video.videoUrl.substring(0, 60)}...</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          setVideoError(null);
                          setRetryCount(prev => prev + 1);
                        }}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
                      >
                        Retry Video
                      </button>
                      <button
                        onClick={() => navigate('/browse')}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                      >
                        Back to Browse
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Title and Stats */}
            <div className="mt-6">
              <h1 className="text-3xl font-extrabold tracking-tight mb-3">{video.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full font-bold border border-purple-600/30">
                  {video.genre}
                </span>
                <span>•</span>
                <span>{video.releaseYear}</span>
                <span>•</span>
                <span>{video.duration}</span>
              </div>
            </div>

            <p className="mt-6 text-gray-300 text-lg leading-relaxed border-l-2 border-gray-800 pl-6">
              {video.description}
            </p>






          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <div className="w-full lg:w-96 space-y-6">
            <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Engagement</h3>
              <div className="space-y-3">
                <button 
                  onClick={toggleWatchList}
                  className={`w-full py-4 font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isInWatchList 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-black'
                  }`}
                >
                  {isInWatchList ? <Check size={20} /> : <Plus size={20} />} 
                  {isInWatchList ? 'In Library' : 'Save to Library'}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleShare}
                    className="py-3 bg-gray-800/50 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <Share2 size={18} /> Share
                  </button>
                  <button 
                    onClick={() => setShowChat(!showChat)}
                    className="py-3 bg-gray-800/50 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <MessageSquare size={18} /> Chat
                  </button>
                </div>
              </div>
            </div>

            {/* AI Chat Panel */}
            {showChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare size={20} className="text-purple-400" />
                    AI Chat
                  </h3>
                  <button onClick={() => setShowChat(false)}>
                    <X size={20} className="text-gray-400 hover:text-white" />
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 py-8 text-sm">
                      <p className="mb-2">Ask me anything about this video!</p>
                      <p className="text-xs">Try: "What is this video about?"</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white ml-8'
                          : 'bg-gray-800 text-gray-200 mr-8'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      {msg.timestamp !== undefined && (
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = msg.timestamp!;
                              videoRef.current.play();
                              toast.success(`Jumped to ${Math.floor(msg.timestamp! / 60)}:${String(Math.floor(msg.timestamp! % 60)).padStart(2, '0')}`);
                            }
                          }}
                          className="text-xs bg-purple-700/50 hover:bg-purple-600 px-3 py-1.5 rounded-lg mt-2 inline-flex items-center gap-1"
                        >
                          <Clock size={12} />
                          Jump to {Math.floor(msg.timestamp / 60)}:{String(Math.floor(msg.timestamp % 60)).padStart(2, '0')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about this video..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </motion.div>
            )}


          </div>

        </div>
      </main>
    </div>
  );
}

export default function Watch() {
  return (
    <PageErrorBoundary pageName="Watch">
      <WatchContent />
    </PageErrorBoundary>
  );
}