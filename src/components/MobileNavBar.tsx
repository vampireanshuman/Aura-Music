import React from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  Home, 
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
  { id: 'listen-now', label: 'Home', icon: Home },
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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#07080e]/85 backdrop-blur-3xl border-t border-white/[0.07] px-3 py-2 safe-area-pb shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'listen-now' && activeTab === 'browse');

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl spring-button transition-opacity duration-200 select-none ${
                isActive ? 'opacity-100 text-white' : 'opacity-45 text-white hover:opacity-80'
              }`}
              style={{
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'
              }}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span 
                className="font-medium tracking-tight whitespace-nowrap"
                style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
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
