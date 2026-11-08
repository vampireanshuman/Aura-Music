import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { Heart, Play, Shuffle } from 'lucide-react';
import { formatTime } from '../../utils/formatTime';
import { AnimatedSoundBars } from '../AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../../utils/artworkUtils';
import { TrackActionMenu } from '../TrackActionMenu';
import type { Track } from '../../types/music';

export const FavoritesView: React.FC = () => {
  const { 
    tracks, 
    favorites, 
    trackRegistry, 
    playTrack, 
    currentTrack, 
    isPlaying, 
    toggleFavorite,
    activeThemeColor
  } = useAudio();

  const favoriteTracks: Track[] = favorites
    .map(id => trackRegistry[id] || tracks.find(t => t.id === id))
    .filter((t): t is Track => t !== undefined && t !== null);

  const totalDuration = favoriteTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (favoriteTracks.length > 0) {
      playTrack(favoriteTracks[0], favoriteTracks);
    }
  };

  const handleShuffleAll = () => {
    if (favoriteTracks.length > 0) {
      const shuffled = [...favoriteTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div className="space-y-8" style={{ paddingBottom: 'calc(160px + var(--safe-bottom, 22px))' }}>
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 pt-4">
        <div className="relative group shrink-0">
          {/* Ambient colored shadow behind artwork */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#fa2d48] to-[#ec4899] blur-2xl scale-95 opacity-50 -z-10" />
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-tr from-[#fa2d48] to-[#ec4899] flex items-center justify-center shadow-[0px_16px_40px_rgba(250,45,72,0.35)] shrink-0 ring-1 ring-white/20">
            <Heart className="w-24 h-24 text-white fill-current drop-shadow-xl" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest font-bold text-[#fa2d48]">
            AUTO PLAYLIST
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-title-primary tracking-tight mt-1">
            Favorite Songs
          </h1>
          <p className="text-sm text-meta-secondary mt-2">
            Every song you have loved across your listening journey.
          </p>

          <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs text-subtle-inactive tabular-nums font-mono">
            <span>{favoriteTracks.length} favorite songs</span>
            <span>•</span>
            <span>{formatTime(totalDuration)} total</span>
          </div>

          <div className="mt-5 flex items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handlePlayAll}
              disabled={favoriteTracks.length === 0}
              className="px-6 py-3 rounded-full bg-[#fa2d48] hover:bg-[#fa2d48]/90 text-white font-semibold flex items-center gap-2 shadow-[0_8px_24px_rgba(250,45,72,0.35)] spring-button disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              Play All
            </button>

            <button
              onClick={handleShuffleAll}
              disabled={favoriteTracks.length === 0}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 spring-button disabled:opacity-50 ring-1 ring-white/10"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="glass-sheet rounded-[24px] overflow-hidden p-1 sm:p-2">
        {favoriteTracks.length === 0 ? (
          <div className="py-20 text-center text-subtle-inactive space-y-3">
            <Heart className="w-12 h-12 mx-auto text-white/20 stroke-1" />
            <p className="text-base font-semibold text-meta-secondary">No favorite songs yet</p>
            <p className="text-xs text-subtle-inactive">Tap the heart icon on any song to add it here</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {favoriteTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, favoriteTracks)}
                  className="grid grid-cols-12 gap-4 px-4 sm:px-5 py-3 items-center hover:bg-white/[0.05] rounded-xl transition-all duration-300 cursor-pointer group text-sm"
                >
                  <div className="col-span-1 text-center font-mono text-xs text-subtle-inactive tabular-nums flex items-center justify-center">
                    <span className="group-hover:hidden">
                      {isCurrent ? (
                        <AnimatedSoundBars isPlaying={isPlaying} color={activeThemeColor || "#fa2d48"} size="sm" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <Play className="w-3.5 h-3.5 hidden group-hover:inline-block fill-current text-white mx-auto animate-button-pop" />
                  </div>

                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
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
                      }`} style={{ color: isCurrent ? activeThemeColor : undefined }}>
                        {track.title}
                      </p>
                      <p className="text-xs text-meta-secondary truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-4 text-meta-secondary truncate text-xs">
                    {track.album}
                  </div>

                  <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-2 sm:gap-3 font-mono text-xs text-subtle-inactive tabular-nums">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id, track);
                      }}
                      className="p-1 hover:scale-110 spring-interactive"
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-current" style={{ color: activeThemeColor || '#fa2d48' }} />
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
        )}
      </div>
    </div>
  );
};
