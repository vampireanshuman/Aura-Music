import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { Clock, ArrowUpDown, Music2 } from 'lucide-react';
import { SwipeableTrackRow } from '../SwipeableTrackRow';

type SortField = 'title' | 'artist' | 'album' | 'duration';

export const LibraryView: React.FC = () => {
  const { 
    tracks, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    playNext, 
    activeThemeColor, 
    toggleFavorite, 
    isFavorite 
  } = useAudio();
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTracks = [...tracks].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortField === 'artist') cmp = a.artist.localeCompare(b.artist);
    else if (sortField === 'album') cmp = a.album.localeCompare(b.album);
    else if (sortField === 'duration') cmp = a.duration - b.duration;
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="space-y-6" style={{ paddingBottom: 'calc(160px + var(--safe-bottom, 22px))' }}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-title-primary tracking-tight flex items-center gap-3">
          <Music2 className="w-8 h-8 text-[#fa2d48]" /> Songs Library
        </h1>
        <p className="text-sm text-meta-secondary mt-1">
          <span className="tabular-nums font-mono">{tracks.length}</span> songs in your catalog & collection
        </p>
      </div>

      {/* Songs Table */}
      <div className="glass-sheet rounded-[24px] overflow-hidden p-1 sm:p-2">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 sm:px-5 py-3 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-subtle-inactive select-none">
          <div className="col-span-1 text-center">#</div>
          <div 
            onClick={() => handleSort('title')}
            className="col-span-5 sm:col-span-4 flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
          >
            Title <ArrowUpDown className="w-3 h-3" />
          </div>
          <div 
            onClick={() => handleSort('artist')}
            className="hidden sm:block sm:col-span-3 cursor-pointer hover:text-white transition-colors"
          >
            Artist
          </div>
          <div 
            onClick={() => handleSort('album')}
            className="hidden md:block md:col-span-3 cursor-pointer hover:text-white transition-colors"
          >
            Album
          </div>
          <div 
            onClick={() => handleSort('duration')}
            className="col-span-6 sm:col-span-1 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-white transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Table Rows with Swipe-to-Queue */}
        <div className="space-y-1">
          {sortedTracks.map((track, idx) => (
            <SwipeableTrackRow
              key={track.id}
              track={track}
              index={idx}
              isCurrent={currentTrack?.id === track.id}
              isPlaying={isPlaying}
              primaryColor={activeThemeColor || currentTrack?.dominantColor || '#fa2d48'}
              isLiked={isFavorite(track.id)}
              onPlay={() => playTrack(track, sortedTracks)}
              onPlayNext={playNext}
              onToggleFavorite={(_, t) => toggleFavorite(t.id, t)}
              showAlbum={true}
              showGenre={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
