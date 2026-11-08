import React from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  PlayCircle,
  Compass,
  Search, 
  Radio, 
  Music2 
} from 'lucide-react';
import type { ActiveTab } from '../types/music';
import { triggerHaptic } from '../utils/haptics';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'listen-now', label: 'Listen Now', icon: PlayCircle },
  { id: 'browse', label: 'Browse', icon: Compass },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'room', label: 'Jam', icon: Radio },
  { id: 'library', label: 'Library', icon: Music2 },
];

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab, setSelectedPlaylistId, dismissIsland } = useAudio();

  const handleTabClick = (tab: ActiveTab) => {
    triggerHaptic('heavy');
    dismissIsland();
    setActiveTab(tab);
    if (tab !== 'playlist') {
      setSelectedPlaylistId(null);
    }
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#07080e]/92 backdrop-blur-3xl border-t border-white/[0.08] px-2 shadow-[0_-12px_36px_rgba(0,0,0,0.65)] pointer-events-auto"
      style={{
        height: 'calc(56px + var(--safe-bottom, 22px))',
        paddingBottom: 'var(--safe-bottom, 22px)'
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-[56px]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl spring-button transition-all duration-200 select-none active:scale-[1.08] ${
                isActive ? 'opacity-100 text-white' : 'opacity-45 text-white/45 hover:opacity-80'
              }`}
              style={{
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, color 0.2s ease'
              }}
            >
              <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span 
                className="font-semibold block truncate leading-tight select-none"
                style={{ 
                  fontSize: '10px', 
                  whiteSpace: 'nowrap', 
                  letterSpacing: '-0.02em' 
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
