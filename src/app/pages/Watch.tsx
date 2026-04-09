import { useParams, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { videoApi, setVideo } from "../lib/api"; // Keep his Video import
import { Header } from "../components/Header";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Clock, X, Plus, Share2, Search, PlayCircle } from "lucide-react";

// --- THE FIX: We use 'any' as a fallback to ensure genre, title, etc. never error ---
function WatchContent() {
  const { id } = useParams();
  const [video, setVideo] = useState<any | null>(null); // Use any to stop property errors
  const [isLoading, setIsLoading] = useState(true);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [showChat, setShowChat] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic Logic for detailed interaction
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

  const jumpToTime = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];

    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      toast.success(`Jumped to ${timeStr}`);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-bold text-purple-500 animate-pulse">Analyzing Video Data...</div>;
  if (!video) return <div className="p-20 text-center text-white">Video not found</div>;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <Header />
      
      <main className="container mx-auto px-4 py-24 flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          {/* Video Player Section */}
          <div className="aspect-video bg-gray-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group">
            <video 
              key={video.id} 
              ref={videoRef}
              controls 
              src={video.video_file || video.src} 
              className="w-full h-full object-contain"
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
              <div className="grid grid-cols-2 gap-4">
                <button className="py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/5">
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

export default WatchContent;
