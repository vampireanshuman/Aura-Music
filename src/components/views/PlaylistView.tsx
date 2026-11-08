import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Shuffle, ListMusic } from 'lucide-react';
import { formatTime } from '../../utils/formatTime';
import { SwipeableTrackRow } from '../SwipeableTrackRow';

export const PlaylistView: React.FC = () => {
  const { 
    playlists, 
    selectedPlaylistId, 
    tracks, 
    trackRegistry,
    playTrack, 
    playNext,
    activeThemeColor,
    currentTrack, 
    isPlaying, 
    toggleFavorite, 
    isFavorite
  } = useAudio();

  const playlist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];

  if (!playlist) {
    return (
      <div className="py-20 text-center text-subtle-inactive">
        <p>No playlist selected</p>
      </div>
    );
  }

  const playlistTracks = playlist.trackIds
    .map(id => trackRegistry[id] || tracks.find(t => t.id === id))
    .filter((t): t is typeof tracks[0] => t !== undefined && t !== null);

  const totalDuration = playlistTracks.reduce((acc, t) => acc + t.duration, 0);

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  const handleShuffleAll = () => {
    if (playlistTracks.length > 0) {
      const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div className="space-y-8" style={{ paddingBottom: '170px' }}>
      {/* Playlist Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 pt-4">
        <div className="relative group shrink-0">
          {/* Ambient blurred glow behind cover */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden blur-2xl scale-95 opacity-50 -z-10">
            <img
              src={playlist.coverUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-[0px_16px_40px_rgba(0,0,0,0.5)] shrink-0 ring-1 ring-white/20">
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest font-bold text-[#fa2d48]">
            PLAYLIST
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-title-primary tracking-tight mt-1">
            {playlist.name}
          </h1>
          <p className="text-sm text-meta-secondary mt-2 max-w-xl">
            {playlist.description}
          </p>

          <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs text-subtle-inactive tabular-nums font-mono">
            <span>{playlistTracks.length} tracks</span>
            <span>•</span>
            <span>{formatTime(totalDuration)} total playtime</span>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handlePlayAll}
              disabled={playlistTracks.length === 0}
              className="px-6 py-3 rounded-full bg-[#fa2d48] hover:bg-[#fa2d48]/90 text-white font-semibold flex items-center gap-2 shadow-[0_8px_24px_rgba(250,45,72,0.35)] spring-button disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              Play
            </button>

            <button
              onClick={handleShuffleAll}
              disabled={playlistTracks.length === 0}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-2 spring-button disabled:opacity-50 ring-1 ring-white/10"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Tracks List */}
      <div className="glass-sheet rounded-[24px] overflow-hidden p-1 sm:p-2">
        {playlistTracks.length === 0 ? (
          <div className="py-16 text-center text-subtle-inactive space-y-2">
            <ListMusic className="w-8 h-8 mx-auto text-white/20" />
            <p className="text-sm text-meta-secondary">This playlist is empty</p>
            <p className="text-xs text-subtle-inactive">Browse songs and add them to this playlist</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlistTracks.map((track, idx) => (
              <SwipeableTrackRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                primaryColor={activeThemeColor || currentTrack?.dominantColor || '#fa2d48'}
                isLiked={isFavorite(track.id)}
                onPlay={() => playTrack(track, playlistTracks)}
                onPlayNext={playNext}
                onToggleFavorite={(_, t) => toggleFavorite(t.id, t)}
                showAlbum={true}
                showGenre={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
