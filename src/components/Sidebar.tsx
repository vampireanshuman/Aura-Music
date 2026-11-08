import React, { useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  PlayCircle, 
  Compass, 
  Radio, 
  Music2, 
  Heart, 
  FolderPlus, 
  Plus, 
  ListMusic, 
  HardDriveUpload,
  Sparkles,
  Settings
} from 'lucide-react';
import type { ActiveTab } from '../types/music';
import { triggerHaptic } from '../utils/haptics';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { 
    activeTab, 
    setActiveTab, 
    playlists, 
    selectedPlaylistId, 
    setSelectedPlaylistId,
    setIsCreatePlaylistOpen,
    favorites,
    localTracks,
    importLocalFiles,
    dismissIsland
  } = useAudio();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleNavClick = (tab: ActiveTab) => {
    triggerHaptic('heavy');
    dismissIsland();
    setActiveTab(tab);
    setSelectedPlaylistId(null);
    onClose();
  };

  const handlePlaylistClick = (id: string) => {
    dismissIsland();
    setSelectedPlaylistId(id);
    setActiveTab('playlist');
    onClose();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importLocalFiles(e.target.files);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#07080e]/60 backdrop-blur-3xl border-r border-white/[0.06] shadow-[4px_0_30px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div 
            onClick={() => handleNavClick('listen-now')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#fa2d48] to-[#f95f70] flex items-center justify-center shadow-lg shadow-[#fa2d48]/25 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" viewBox="0 0 100 100" fill="currentColor">
                <path d="M68 28v32.5a11.5 11.5 0 1 1-11.5-11.5c2.3 0 4.4.7 6.2 1.9V33.8L38 40.2v26.3a11.5 11.5 0 1 1-11.5-11.5c2.3 0 4.4.7 6.2 1.9V33.2a5.5 5.5 0 0 1 4.3-5.4l24.7-5.5a5.5 5.5 0 0 1 6.3 5.7z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Aura Music
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#fa2d48]/20 text-[#fa2d48] font-bold">
                  Pro
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          
          {/* Main Discovery */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('listen-now')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'listen-now'
                  ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Listen Now
            </button>

            <button
              onClick={() => handleNavClick('browse')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse
            </button>

            <button
              onClick={() => handleNavClick('listen-now')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              Radio & Live
            </button>
            <button
              onClick={() => handleNavClick('room')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'room'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-purple-400" />
                Listening Room
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">
                Jam Live
              </span>
            </button>
            <button
              onClick={() => handleNavClick('plugins')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'plugins'
                  ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Plugins & Sync
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400">
                YT/Spotify
              </span>
            </button>
          </div>

          {/* Library Section */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-3 block mb-1.5">
              Library
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('library')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'library'
                    ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Music2 className="w-4 h-4" />
                All Songs
              </button>

              <button
                onClick={() => handleNavClick('favorites')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-[#fa2d48]" />
                  Favorite Songs
                </span>
                {favorites.length > 0 && (
                  <span className="text-xs font-mono opacity-60">
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('local-files')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'local-files'
                    ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FolderPlus className="w-4 h-4 text-sky-400" />
                  Local Collection
                </span>
                {localTracks.length > 0 && (
                  <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/10 font-mono text-white/70">
                    {localTracks.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Playlists Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                Playlists
              </span>
              <button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="text-white/50 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                title="Create New Playlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {playlists.map((playlist) => {
                const isSelected = activeTab === 'playlist' && selectedPlaylistId === playlist.id;
                return (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors group text-left truncate ${
                      isSelected
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <ListMusic className="w-4 h-4 shrink-0 text-white/40 group-hover:text-white transition-colors" />
                    <span className="truncate">{playlist.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Section */}
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#fa2d48] text-white shadow-md shadow-[#fa2d48]/25'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Settings
            </button>
          </div>

        </div>

        {/* Bottom Local Import Card */}
        <div className="p-4 border-t border-white/10">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all shadow-sm group"
          >
            <HardDriveUpload className="w-4 h-4 text-[#fa2d48] group-hover:scale-110 transition-transform" />
            <span>Import Local Audio</span>
          </button>
        </div>

      </aside>
    </>
  );
};
