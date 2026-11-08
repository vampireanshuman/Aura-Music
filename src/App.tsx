import React, { useState } from 'react';
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

const MainLayout: React.FC = () => {
  const { activeTab } = useAudio();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-[#fa2d48]/40 selection:text-white">
      {/* Global SVG Gooey Filter Engine for Dynamic Island Liquid Mercury Morphing */}
      <svg 
        width="0" 
        height="0" 
        className="absolute pointer-events-none opacity-0 invisible" 
        aria-hidden="true"
        style={{ position: 'fixed', top: -9999, left: -9999 }}
      >
        <defs>
          <filter id="aura-goo" colorInterpolationFilters="sRGB" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo" />
          </filter>
        </defs>
      </svg>

      {/* Dynamic Ambient Background */}
      <AmbientBackground />

      {/* Apple-grade Liquid Morphing Dynamic Island Floating at top (z-index: 9999) */}
      <DynamicIsland />

      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-[170px] lg:pb-32 animate-in fade-in duration-300">
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
