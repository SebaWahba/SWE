import { useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';

export function GoogleOAuthSetupGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const callbackUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e24386a0/auth/google/callback`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text)
      .then(() => toast.success(`${label} copied!`))
      .catch(() => toast.info(`Copy this: ${text}`, { duration: 8000 }));
  };

  const toggleStep = (step: number) => {
    setCompletedSteps(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-purple-400 hover:text-purple-300 underline"
      >
        Need help setting up Google Sign-In?
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-purple-500/30 rounded-2xl p-8 z-50 shadow-2xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Google OAuth Setup
              </h2>
              <p className="text-gray-400 mb-8">3 steps to enable Google Sign-In</p>

              {/* Step 1 */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <button
                    onClick={() => toggleStep(1)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                      completedSteps.includes(1) ? 'bg-green-500 border-green-500' : 'border-purple-500'
                    }`}
                  >
                    {completedSteps.includes(1) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                      Step 1: Create Google OAuth Credentials
                    </h3>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>1. Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></p>
                      <p>2. Create or select a project</p>
                      <p>3. Click "Create Credentials" → "OAuth client ID" → "Web application"</p>
                      <p>4. Add this <strong className="text-purple-300">Authorized redirect URI</strong>:</p>
                    </div>
                    <div className="mt-3 bg-black/50 border border-purple-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-xs text-purple-300 break-all flex-1">{callbackUrl}</code>
                        <button
                          onClick={() => copyToClipboard(callbackUrl, 'Callback URL')}
                          className="flex-shrink-0 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(2)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                      completedSteps.includes(2) ? 'bg-green-500 border-green-500' : 'border-purple-500'
                    }`}
                  >
                    {completedSteps.includes(2) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                      Step 2: Copy Client ID & Secret
                    </h3>
                    <p className="text-sm text-gray-400">
                      After creating the OAuth client, copy the <strong className="text-purple-300">Client ID</strong> and <strong className="text-purple-300">Client Secret</strong> from Google Cloud Console.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(3)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                      completedSteps.includes(3) ? 'bg-green-500 border-green-500' : 'border-purple-500'
                    }`}
                  >
                    {completedSteps.includes(3) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                      Step 3: Add to Supabase Secrets
                    </h3>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>Add these as Supabase Edge Function secrets:</p>
                      <div className="bg-black/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                        <p><span className="text-purple-400">GOOGLE_CLIENT_ID</span> = your-client-id</p>
                        <p><span className="text-purple-400">GOOGLE_CLIENT_SECRET</span> = your-client-secret</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-center font-semibold flex items-center justify-center gap-2"
                >
                  Open Google Console <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
