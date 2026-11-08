import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Search, Menu, X, Sparkles, SlidersHorizontal, Settings } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab, 
    setIsEqualizerOpen,
    equalizerPreset
  } = useAudio();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && activeTab !== 'search') {
      setActiveTab('search');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (activeTab === 'search') {
      setActiveTab('listen-now');
    }
  };

  return (
    <header 
      style={{
        paddingTop: 'var(--safe-top, 0px)',
        minHeight: 'calc(4rem + var(--safe-top, 0px))',
        background: 'rgba(8, 8, 12, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)'
      }}
      className="sticky top-0 z-50 px-4 lg:px-8 flex items-center justify-between border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
    >
      {/* Left: Mobile Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-white/65 hover:text-white hover:bg-white/10 spring-button"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Spatial Audio Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-white/80">
          <Sparkles className="w-3.5 h-3.5 text-[#fa2d48]" />
          <span>Spatial Audio & Lossless</span>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search artists, songs, lyrics, albums..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2 rounded-full bg-white/[0.05] border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/[0.09] focus:border-white/20 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 p-1 rounded-full text-white/40 hover:text-white spring-button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick actions & profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setIsEqualizerOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-medium text-white/65 hover:text-white spring-button"
          title="Open Audio Equalizer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#fa2d48]" />
          <span className="capitalize">{equalizerPreset}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2 rounded-full border transition-all spring-button ${
            activeTab === 'settings'
              ? 'bg-white/20 border-white/40 text-white shadow-md'
              : 'glass-pill text-white/65 hover:text-white'
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Avatar */}
        <div 
          onClick={() => setActiveTab('settings')}
          className="w-8 h-8 rounded-full ring-2 ring-white/20 overflow-hidden cursor-pointer hover:ring-white/50 transition-all bg-gradient-to-tr from-[#fa2d48] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shadow-md"
        >
          A
        </div>
      </div>
    </header>
  );
};
