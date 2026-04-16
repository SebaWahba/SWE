import { Link, useLocation, useNavigate } from "react-router";
import { Search, Sparkles, LogOut, User, History, Plus, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { WatchHistoryPanel } from "./WatchHistoryPanel";
import { toast } from "sonner";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profiles, currentProfile, setCurrentProfile, addProfile, deleteProfile, updateProfile, loading: profileLoading } = useProfile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<{id: string; name: string} | null>(null);
  const [profileToEdit, setProfileToEdit] = useState<{id: string; name: string} | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileLanguage, setNewProfileLanguage] = useState('en');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showUserMenu]);

  const isOnApp = location.pathname !== "/" && location.pathname !== "/login";

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      try {
        await addProfile(newProfileName, newProfileLanguage);
        setShowAddProfile(false);
        setNewProfileName('');
      } catch (error) {
        console.error('Error adding profile:', error);
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/95 backdrop-blur-lg" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to={user ? "/browse" : "/"} className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="relative w-8 h-8 sm:w-10 sm:h-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
              <svg viewBox="0 0 40 40" className="relative w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8ZM20 28C15.582 28 12 24.418 12 20C12 15.582 15.582 12 20 12C24.418 12 28 15.582 28 20C28 24.418 24.418 28 20 28Z"
                  fill="url(#headerGrad)"
                  strokeWidth="1.5"
                  stroke="white"
                />
                <defs>
                  <linearGradient id="headerGrad" x1="8" y1="8" x2="32" y2="32">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Loopy
            </span>
          </Link>

          {isOnApp && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/browse"
                className={`text-sm font-medium transition-colors hover:text-white ${
                  location.pathname === "/browse" ? "text-white" : "text-gray-300"
                }`}
              >
                Home
              </Link>
              <Link
                to="/search"
                className={`text-sm font-medium transition-colors hover:text-white ${
                  location.pathname === "/search" ? "text-white" : "text-gray-300"
                }`}
              >
                AI Search
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3 sm:gap-4">
            {isOnApp && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/search")}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/search")}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                  aria-label="AI Search"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI</span>
                </motion.button>

                {user ? (
                  <div className="relative" ref={menuRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2"
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-purple-500"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-700">
                            <div className="flex items-center gap-3">
                              {currentProfile?.picture ? (
                                <img
                                  src={currentProfile.picture}
                                  alt={currentProfile.name}
                                  className="w-10 h-10 rounded-full border-2 border-purple-500"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-white truncate max-w-[150px]">{currentProfile?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-sm font-medium text-gray-300 mb-2">Profiles</p>
                            <div className="space-y-2">
                              {profiles.map(profile => (
                                <div key={profile.id} className={`flex items-center gap-3 px-3 py-2 text-sm ${
                                  currentProfile?.id === profile.id 
                                    ? 'bg-gray-800 text-white' 
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                } rounded`}>
                                  <button
                                    onClick={() => setCurrentProfile(profile)}
                                    className="flex items-center gap-3 flex-1 text-left"
                                  >
                                    {profile.picture ? (
                                      <img
                                        src={profile.picture}
                                        alt={profile.name}
                                        className="w-8 h-8 rounded-full border-2 border-purple-500"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                      </div>
                                    )}
                                    <span className="flex-1 truncate">{profile.name}</span>
                                    {currentProfile?.id === profile.id && (
                                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                  <div className="flex items-center gap-1">
                                    {profiles.length > 1 && (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setProfileToDelete({ id: profile.id, name: profile.name });
                                            setShowDeleteProfile(true);
                                          }}
                                          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                          title="Delete profile"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setProfileToEdit({ id: profile.id, name: profile.name });
                                            setNewProfileName(profile.name);
                                            setShowEditProfile(true);
                                          }}
                                          className="p-2 text-gray-500 hover:text-purple-400 transition-colors"
                                          title="Edit profile"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <button
                                onClick={() => setShowAddProfile(true)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-purple-400 hover:bg-gray-800/50 rounded"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="flex-1">Add Profile</span>
                              </button>
                            </div>
                          </div>

                          <div className="px-4 py-3">
                            <button
                              onClick={() => { setShowHistoryModal(true); setShowUserMenu(false); }}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                            >
                              <History className="w-4 h-4" /> Watch History
                            </button>
                            <button
                              onClick={() => { signOut(); setShowUserMenu(false); navigate("/"); }}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHistoryModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[80vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 overflow-y-auto max-h-[80vh]">
                <WatchHistoryPanel />
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddProfile(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl z-50 max-w-md w-full p-6"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white">Add Profile</h3>
                  <button
                    onClick={() => setShowAddProfile(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleAddProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Profile Name</label>
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Enter profile name"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default Language</label>
                    <select
                      value={newProfileLanguage}
                      onChange={(e) => setNewProfileLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading || !newProfileName.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileLoading ? 'Adding...' : 'Add Profile'}
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center">
                  Profiles help keep your viewing history and recommendations separate
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteProfile && profileToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDeleteProfile(false); setProfileToDelete(null); }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl z-50 max-w-md w-full p-6"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Delete Profile</h3>
                    <p className="text-sm text-gray-400">This action cannot be undone</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-300">
                    Are you sure you want to delete <span className="font-semibold text-white">{profileToDelete.name}</span>? 
                    All watch history and recommendations for this profile will be permanently deleted.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteProfile(false); setProfileToDelete(null); }}
                    className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await deleteProfile(profileToDelete.id);
                        toast.success('Profile deleted successfully');
                        setShowDeleteProfile(false);
                        setProfileToDelete(null);
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to delete profile');
                      }
                    }}
                    disabled={profileLoading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditProfile && profileToEdit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEditProfile(false); setProfileToEdit(null); setNewProfileName(''); }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl z-50 max-w-md w-full p-6"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
                  <button
                    onClick={() => { setShowEditProfile(false); setProfileToEdit(null); setNewProfileName(''); }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (newProfileName.trim() && newProfileName !== profileToEdit.name) {
                    try {
                      await updateProfile(profileToEdit.id, { name: newProfileName });
                      toast.success('Profile updated');
                      setShowEditProfile(false);
                      setProfileToEdit(null);
                      setNewProfileName('');
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to update profile');
                    }
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Profile Name</label>
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Enter profile name"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading || !newProfileName.trim() || newProfileName === profileToEdit.name}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-base hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
