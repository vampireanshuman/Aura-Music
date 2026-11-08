import React, { useState, useEffect } from 'react';
import { AudioProvider, useAudio } from './context/AudioContext';
import { AmbientBackground } from './components/AmbientBackground';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PlayerBar } from './components/PlayerBar';
import { SyncedLyricsModal } from './components/SyncedLyricsModal';
import { QueueDrawer } from './components/QueueDrawer';
import { EqualizerModal } from './components/EqualizerModal';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { AudioQualityModal } from './components/AudioQualityModal';
import { MobileNavBar } from './components/MobileNavBar';
import { VideoModal } from './components/VideoModal';
import { DynamicIsland } from './components/DynamicIsland';

import { ListenNowView } from './components/views/ListenNowView';
import { BrowseView } from './components/views/BrowseView';
import { LibraryView } from './components/views/LibraryView';
import { PlaylistView } from './components/views/PlaylistView';
import { FavoritesView } from './components/views/FavoritesView';
import { LocalFilesView } from './components/views/LocalFilesView';
import { SearchView } from './components/views/SearchView';
import { PluginsView } from './components/views/PluginsView';
import { SettingsView } from './components/views/SettingsView';
import { RoomView } from './components/views/RoomView';
import { ArrowUpRight, Music2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, isIslandActive, dismissIsland, currentTrack } = useAudio();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Clock updates for iOS simulated standby/minimized home screen
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  // When user returns or focuses the window, automatically restore full in-app view
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isIslandActive) {
        dismissIsland();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [isIslandActive, dismissIsland]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'listen-now':
        return <ListenNowView />;
      case 'browse':
        return <BrowseView />;
      case 'library':
        return <LibraryView />;
      case 'playlist':
        return <PlaylistView />;
      case 'favorites':
        return <FavoritesView />;
      case 'local-files':
        return <LocalFilesView />;
      case 'search':
        return <SearchView />;
      case 'plugins':
        return <PluginsView />;
      case 'room':
        return <RoomView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ListenNowView />;
    }
  };

  // =========================================================================
  // STATE 1: APP MINIMIZED (Dynamic Island Mode)
  // While minimized, the full app is collapsed and ONLY the Dynamic Island is active!
  // =========================================================================
  if (isIslandActive) {
    return (
      <div 
        onClick={dismissIsland}
        className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-[#fa2d48]/40 selection:text-white cursor-pointer select-none overflow-hidden"
      >
        <AmbientBackground />

        {/* Apple Dynamic Island Floating at the very top */}
        <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto">
          <DynamicIsland />
        </div>

        {/* Minimalist Apple Standby / Home screen clock */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <span className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-2">
            {currentDateStr}
          </span>
          <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-white/90 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            {currentTimeStr}
          </h1>

          {currentTrack && (
            <div className="mt-6 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl flex items-center gap-2 text-xs text-white/80 shadow-lg">
              <Music2 className="w-3.5 h-3.5 text-[#fa2d48] animate-pulse" />
              <span className="font-semibold">{currentTrack.title}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">{currentTrack.artist}</span>
            </div>
          )}
        </div>

        {/* Bottom iOS Home Indicator Pill: tap to return to app */}
        <div className="pb-8 pt-4 flex flex-col items-center gap-2 text-white/40 hover:text-white/80 transition-colors">
          <div className="w-36 h-1 rounded-full bg-white/30 hover:bg-white/60 transition-all" />
          <span className="text-[11px] font-semibold tracking-wide flex items-center gap-1">
            Tap anywhere to return to Aura Music
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        {/* Background modals & audio continue uninterrupted */}
        <SyncedLyricsModal />
        <QueueDrawer />
        <EqualizerModal />
        <FullscreenPlayer />
        <CreatePlaylistModal />
        <AudioQualityModal />
        <VideoModal />
      </div>
    );
  }

  // =========================================================================
  // STATE 2: ACTIVE IN-APP BROWSING
  // While using the app normally, Dynamic Island is 100% HIDDEN!
  // =========================================================================
  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-[#fa2d48]/40 selection:text-white">
      {/* Dynamic Ambient Background */}
      <AmbientBackground />

      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-44 lg:pb-32 animate-in fade-in duration-300">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Player Dock & Modals */}
      <PlayerBar />
      <MobileNavBar />
      <SyncedLyricsModal />
      <QueueDrawer />
      <EqualizerModal />
      <FullscreenPlayer />
      <CreatePlaylistModal />
      <AudioQualityModal />
      <VideoModal />
    </div>
  );
};

export default function App() {
  return (
    <AudioProvider>
      <MainLayout />
    </AudioProvider>
  );
}
