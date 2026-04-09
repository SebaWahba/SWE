import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Check } from "lucide-react";
import { useState, useEffect } from "react";

export function RecommendationTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem("loopy_seen_tutorial");
    if (!hasSeenTutorial) {
      // Show tutorial after a short delay
      setTimeout(() => setShowTutorial(true), 2000);
    }
  }, []);

  const handleClose = () => {
    setShowTutorial(false);
    localStorage.setItem("loopy_seen_tutorial", "true");
  };

  return (
    <AnimatePresence>
      {showTutorial && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-8 right-8 max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    AI-Powered Recommendations
                  </h3>
                  <p className="text-sm text-gray-400">
                    Loopy learns what you love
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Watch videos</strong> to help us understand your interests
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Get personalized rows</strong> ordered by your favorite categories
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">See smarter suggestions</strong> based on what you've enjoyed
                  </p>
                </div>
              </div>

              {/* Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Got it, let's explore!
              </motion.button>
            </div>

            {/* Animated gradient border */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-50 blur-xl" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
