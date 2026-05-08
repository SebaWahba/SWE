import { Header } from "../components/Header";
import { Search, Sparkles, Bot, User, Send, TrendingUp, Play, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PageErrorBoundary } from "../components/PageErrorBoundary";
// import { projectId, publicAnonKey } from '/utils/supabase/info';

// const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e24386a0`;

interface VideoResult {
  videoId: string;
  relevance: number;
  reason: string;
  suggestedTimestamp: string | null;
  video: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: string;
    duration: string;
    year: number;
    tags: string[];
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  results?: VideoResult[];
  isLoading?: boolean;
}

function AISearchContent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query.trim();
    if (!q) return;

    setQuery("");
    setIsSearching(true);

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: q };
    const loadingMsg: ChatMessage = { role: 'assistant', content: '', isLoading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);

    // Simulate delay and show disabled message
    setTimeout(() => {
      setMessages(prev => {
        const updated = prev.filter(m => !m.isLoading);
        return [...updated, {
          role: 'assistant',
          content: "AI search functionality has been disabled. Supabase functions are no longer available.",
        }];
      });
      setIsSearching(false);
    }, 1000);
  };
  const suggestedQueries = [
    "Show me videos where they talk about polar bears hunting seals",
    "What videos mention AirPods noise cancellation technology?",
    "Find something relaxing about meditation and mindfulness",
    "Which video has Dr. Sarah Martinez talking about forests?",
    "Cooking videos about Italian pasta making",
    "Short science videos about black holes from 2023",
  ];

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col pt-20">
        {/* Empty state - centered hero */}
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl"
            >
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-8">
                <Bot className="text-purple-400" size={24} />
                <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  Loopy AI Search
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Ask me anything about<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                  our video library
                </span>
              </h1>

              <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
                I understand natural language. Ask about specific topics, dialogue, scenes, 
                or even moods — I'll find exactly what you're looking for.
              </p>

              {/* Suggested queries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQueries.map((sq) => (
                  <button
                    key={sq}
                    onClick={() => handleSearch(sq)}
                    className="text-left px-4 py-3 bg-gray-900/60 border border-gray-800 rounded-xl text-sm text-gray-300 hover:border-purple-500/50 hover:bg-gray-900 transition-all group flex items-start gap-3"
                  >
                    <Sparkles size={14} className="text-purple-500 mt-0.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span className="line-clamp-2">{sq}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Chat messages */}
        {hasMessages && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="max-w-4xl mx-auto space-y-6 pt-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="flex items-start gap-3 max-w-2xl">
                        <div className="bg-purple-600 rounded-2xl rounded-tr-sm px-5 py-3">
                          <p className="text-white">{msg.content}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                          <User size={16} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 max-w-4xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {msg.isLoading ? (
                          <div className="bg-gray-900 rounded-2xl rounded-tl-sm px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                              <span className="text-gray-400 text-sm">Searching across all videos...</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-gray-900 rounded-2xl rounded-tl-sm px-5 py-4">
                              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>

                            {/* Video results */}
                            {msg.results && msg.results.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {msg.results.map((result, ri) => (
                                  <motion.div
                                    key={result.videoId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: ri * 0.1 }}
                                    onClick={() => navigate(`/watch/${result.video.id}`)}
                                    className="flex gap-4 p-4 bg-gray-900/60 border border-gray-800 rounded-xl cursor-pointer hover:border-purple-500/40 hover:bg-gray-900 transition-all group"
                                  >
                                    <div className="relative w-40 h-24 shrink-0 rounded-lg overflow-hidden">
                                      <img
                                        src={result.video.thumbnail}
                                        alt={result.video.title}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play size={28} className="text-white" fill="white" />
                                      </div>
                                      {result.suggestedTimestamp && (
                                        <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                          <Clock size={10} />
                                          {result.suggestedTimestamp}
                                        </div>
                                      )}
                                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                        {result.video.duration}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                                        {result.video.title}
                                      </h4>
                                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">{result.reason}</p>
                                      <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-600/30">
                                          {result.video.category}
                                        </span>
                                        <span className="text-xs text-gray-500">{result.video.year}</span>
                                        <div className="flex items-center gap-1">
                                          <div className="h-1.5 w-12 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                              style={{ width: `${result.relevance}%` }}
                                            />
                                          </div>
                                          <span className="text-xs text-gray-500">{result.relevance}%</span>
                                        </div>
                                      </div>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-600 group-hover:text-purple-400 transition-colors self-center shrink-0" />
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Input bar - fixed at bottom */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-6 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center bg-gray-900 rounded-2xl border border-gray-700 focus-within:border-purple-500/50 transition-colors shadow-2xl">
              <Search className="ml-5 text-gray-400 shrink-0" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isSearching && handleSearch()}
                placeholder={hasMessages ? "Ask a follow-up question..." : "Describe what you're looking for in natural language..."}
                className="flex-1 bg-transparent px-4 py-5 outline-none text-white placeholder-gray-500"
                disabled={isSearching}
              />
              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !query.trim()}
                className="m-2 p-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-xs text-gray-600 mt-3">
              Powered by AI — understands content, dialogue, topics, and context across 200+ videos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AISearch() {
  return (
    <PageErrorBoundary pageName="AISearch">
      <AISearchContent />
    </PageErrorBoundary>
  );
}
