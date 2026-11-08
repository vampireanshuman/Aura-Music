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
    triggerHaptic('selection');
    dismissIsland();
    setActiveTab(tab);
    if (tab !== 'playlist') {
      setSelectedPlaylistId(null);
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#07080e]/90 backdrop-blur-3xl border-t border-white/[0.08] px-2 py-1.5 safe-area-pb shadow-[0_-12px_36px_rgba(0,0,0,0.65)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl spring-button transition-all duration-200 select-none ${
                isActive ? 'opacity-100 text-white scale-105' : 'opacity-45 text-white hover:opacity-80'
              }`}
              style={{
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'
              }}
            >
              <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span 
                className="font-semibold block truncate leading-tight"
                style={{ 
                  whiteSpace: 'nowrap', 
                  fontSize: '10.5px', 
                  letterSpacing: '-0.01em' 
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
