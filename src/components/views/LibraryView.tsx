import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Heart, Clock, ArrowUpDown, Music2 } from 'lucide-react';
import { formatTime } from '../../utils/formatTime';
import { AnimatedSoundBars } from '../AnimatedSoundBars';
import { TrackActionMenu } from '../TrackActionMenu';
import { get4kArtworkUrl, handleArtworkError } from '../../utils/artworkUtils';

type SortField = 'title' | 'artist' | 'album' | 'duration';

export const LibraryView: React.FC = () => {
  const { tracks, currentTrack, isPlaying, playTrack, toggleFavorite, isFavorite } = useAudio();
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
    <div className="space-y-6 pb-36">
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

        {/* Table Rows */}
        <div className="divide-y divide-white/5">
          {sortedTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isLiked = isFavorite(track.id);

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, sortedTracks)}
                className="grid grid-cols-12 gap-4 px-4 sm:px-5 py-3 items-center hover:bg-white/[0.05] rounded-xl transition-all duration-300 cursor-pointer group text-sm"
              >
                {/* Index / Play action */}
                <div className="col-span-1 text-center font-mono text-xs text-subtle-inactive tabular-nums flex items-center justify-center">
                  <span className="group-hover:hidden">
                    {isCurrent ? (
                      <AnimatedSoundBars isPlaying={isPlaying} color="#fa2d48" size="sm" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <Play className="w-3.5 h-3.5 hidden group-hover:inline-block fill-current text-white mx-auto animate-button-pop" />
                </div>

                {/* Title & Cover */}
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0 w-10 h-10">
                    <img
                      src={get4kArtworkUrl(track)}
                      onError={handleArtworkError}
                      alt=""
                      className="absolute inset-0 w-full h-full rounded-lg object-cover blur-md scale-95 opacity-60 -z-10 pointer-events-none"
                    />
                    <img
                      src={get4kArtworkUrl(track)}
                      onError={handleArtworkError}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shadow-[0px_4px_16px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold truncate tracking-tight ${
                      isCurrent ? 'text-[#fa2d48]' : 'text-title-primary'
                    }`}>
                      {track.title}
                    </p>
                    <p className="sm:hidden text-xs text-meta-secondary truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Artist */}
                <div className="hidden sm:block sm:col-span-3 text-meta-secondary truncate">
                  {track.artist}
                </div>

                {/* Album */}
                <div className="hidden md:block md:col-span-3 text-subtle-inactive truncate">
                  {track.album}
                </div>

                {/* Duration & Like & Action Menu */}
                <div className="col-span-6 sm:col-span-1 flex items-center justify-end gap-2 sm:gap-3 font-mono text-xs text-subtle-inactive tabular-nums">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id, track);
                    }}
                    className="p-1 text-white/30 hover:text-white spring-interactive"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
                  </button>
                  <span>{formatTime(track.duration)}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <TrackActionMenu track={track} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
