import React, { useState, useMemo } from 'react';
import { useAudio } from '../../context/AudioContext';
import { 
  Play, 
  Sparkles, 
  Heart, 
  History, 
  RotateCcw, 
  Radio, 
  Flame, 
  Disc3, 
  Compass,
  Headphones
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatTime } from '../../utils/formatTime';
import { AnimatedSoundBars } from '../AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../../utils/artworkUtils';
import { TrackActionMenu } from '../TrackActionMenu';
import { 
  MOOD_CATEGORIES, 
  generatePersonalizedRecommendations, 
  filterTracksByMood 
} from '../../utils/recommendationEngine';

export const ListenNowView: React.FC = () => {
  const { 
    tracks, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    toggleFavorite, 
    isFavorite,
    playlists,
    setSelectedPlaylistId,
    setActiveTab,
    recentlyPlayed,
    clearRecentlyPlayed,
    favorites,
    trackRegistry
  } = useAudio();

  const [selectedMood, setSelectedMood] = useState<string>('all');

  // Combine static and dynamically cached registry tracks for recommendation breadth
  const allKnownTracks = useMemo(() => {
    const registryList = Object.values(trackRegistry || {});
    const map = new Map<string, typeof tracks[0]>();
    [...tracks, ...registryList].forEach(t => {
      if (t && t.id) map.set(t.id, t);
    });
    return Array.from(map.values());
  }, [tracks, trackRegistry]);

  // Compute personalized recommendations via recommendation engine
  const { discoverWeekly, becauseYouListened, dailyMixes } = useMemo(() => {
    return generatePersonalizedRecommendations({
      allTracks: allKnownTracks,
      recentlyPlayed,
      favorites,
      currentTrack,
      limit: 12
    });
  }, [allKnownTracks, recentlyPlayed, favorites, currentTrack]);

  // Filtered tracks based on selected mood
  const filteredFeaturedTracks = useMemo(() => {
    return filterTracksByMood(tracks, selectedMood);
  }, [tracks, selectedMood]);

  const featuredTrack = filteredFeaturedTracks[0] || tracks[0];

  const handlePlaylistClick = (id: string) => {
    setSelectedPlaylistId(id);
    setActiveTab('playlist');
  };

  const handleLikeClick = (e: React.MouseEvent, track: typeof tracks[0]) => {
    e.stopPropagation();
    toggleFavorite(track.id, track);
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#fa2d48', '#ec4899', '#f43f5e']
    });
  };

  // Helper to strip and move movie/soundtrack suffixes out of main hero heading
  const parseHeroTitle = (fullTitle: string) => {
    const match = fullTitle.match(/^(.*?)\s*(\((?:from|From|feat\.|feat|FT\.)\s*.*?\))/i);
    if (match) {
      return {
        title: match[1].trim(),
        suffix: match[2].trim()
      };
    }
    return { title: fullTitle, suffix: null };
  };

  return (
    <div className="space-y-10" style={{ paddingBottom: '170px' }}>
      {/* 1. Algorithmic Mood & Vibe Chips Filter Bar (Unified Frosted Glass Accent) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
          <Compass className="w-4 h-4 text-white/60" />
          <span>Curated Mood Soundscape</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
          {MOOD_CATEGORIES.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 spring-button transition-all ${
                  isSelected
                    ? 'bg-white/[0.12] border border-white/[0.22] text-white shadow-lg backdrop-blur-xl scale-105'
                    : 'glass-pill text-white/65 hover:text-white'
                }`}
              >
                <span>{mood.emoji}</span>
                <span>{mood.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Editorial Hero Feature Banner with Glass Sheet & Dark Scrim */}
      {featuredTrack && (() => {
        const { title: heroTitle, suffix: heroSuffix } = parseHeroTitle(featuredTrack.title);
        return (
          <section className="relative rounded-[28px] overflow-hidden shadow-2xl border border-white/10 group spring-interactive animate-card-cascade">
            {/* Ambient blurred backdrop sheen */}
            <img
              src={get4kArtworkUrl(featuredTrack)}
              onError={handleArtworkError}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30 -z-0 pointer-events-none"
            />

            {/* Background image lightly blurred and scaled to mute YouTube thumbnail graphics */}
            <img
              src={get4kArtworkUrl(featuredTrack)}
              onError={handleArtworkError}
              alt={featuredTrack.title}
              className="absolute inset-0 w-full h-full object-cover object-center select-none filter blur-[2px] scale-105 opacity-60 transition-transform duration-700"
            />

            {/* Multi-stop dark glass gradient scrim */}
            <div 
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(8,8,12,0.2) 0%, rgba(8,8,12,0.75) 55%, rgba(8,8,12,0.96) 100%)'
              }}
            />

            <div className="relative z-20 p-6 sm:p-10 max-w-xl flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.12] border border-white/[0.22] backdrop-blur-xl text-xs font-semibold text-white mb-3 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  <span className="tracking-wide">FEATURED SPOTLIGHT • 4K MASTER</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-white/60 font-bold">
                  {featuredTrack.genre} • Studio Master
                </p>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
                  {heroTitle}
                </h1>
                {heroSuffix && (
                  <p className="text-xs sm:text-sm font-semibold text-white/70 mt-1">
                    {heroSuffix}
                  </p>
                )}
                <p className="text-sm sm:text-base text-white/65 font-medium mt-2 line-clamp-2">
                  Immerse yourself in spatial sound, vibrant acoustic depth, and studio audio fidelity by {featuredTrack.artist}.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => playTrack(featuredTrack, tracks)}
                  className="px-6 py-3 rounded-full bg-white/[0.12] hover:bg-white/[0.22] border border-white/[0.22] backdrop-blur-xl text-white font-bold flex items-center gap-2.5 shadow-xl spring-button"
                >
                  {currentTrack?.id === featuredTrack.id && isPlaying ? (
                    <>
                      <AnimatedSoundBars isPlaying={true} color="#ffffff" size="sm" />
                      <span>Playing Now</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      <span>Listen Now</span>
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => handleLikeClick(e, featuredTrack)}
                  className="p-3 rounded-full glass-pill text-white/65 hover:text-white spring-button"
                  title="Like"
                >
                  <Heart className={`w-5 h-5 ${isFavorite(featuredTrack.id) ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
                </button>

                <div onClick={(e) => e.stopPropagation()} className="p-1 rounded-full glass-pill">
                  <TrackActionMenu track={featuredTrack} />
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* 3. "Made For You: Discover Weekly" (AI Recommendation Engine) */}
      {discoverWeekly.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Discover Weekly</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Aura AI
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-white/65">Personalized algorithmic recommendations matching your acoustic taste</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {discoverWeekly.slice(0, 6).map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && isPlaying;
              const isLiked = isFavorite(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, discoverWeekly)}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className={`group relative flex flex-col p-3 rounded-2xl glass-sheet spring-card cursor-pointer animate-card-cascade ${
                    isCurrent ? 'ring-1 ring-amber-400/50 bg-white/[0.08]' : ''
                  }`}
                >
                  {/* Step 3: Artwork with Duplicate Blurred Shadow & Inner Rim */}
                  <div className="relative aspect-square w-full mb-3 shrink-0">
                    <img
                      src={get4kArtworkUrl(track)}
                      onError={handleArtworkError}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover rounded-xl blur-lg scale-95 opacity-65 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 -z-10 pointer-events-none"
                    />

                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex items-center justify-center bg-black/60">
                      <img
                        src={get4kArtworkUrl(track)}
                        onError={handleArtworkError}
                        alt={track.title}
                        className="w-full h-full object-cover object-center scale-[1.08] group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />

                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isPlayingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <div className="w-11 h-11 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xl spring-button">
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: High-Contrast Typography Hierarchy */}
                  <h4 className="font-bold text-xs text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-white/65 font-medium truncate mt-0.5">
                    {track.artist}
                  </p>

                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                    <TrackActionMenu track={track} />
                  </div>

                  <button
                    onClick={(e) => handleLikeClick(e, track)}
                    className="absolute bottom-2.5 right-2.5 p-1.5 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity spring-button"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. "Daily Mixes" (Sub-Genre Clustered Radios) */}
      {dailyMixes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Daily Mix Radios
              </h2>
              <p className="text-xs sm:text-sm text-white/65">Endless algorithmic stations grouped by sub-genre and tempo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dailyMixes.map((mix, idx) => (
              <div
                key={mix.id}
                onClick={() => {
                  if (mix.tracks.length > 0) {
                    playTrack(mix.tracks[0], mix.tracks);
                  }
                }}
                style={{ animationDelay: `${idx * 60}ms` }}
                className={`group cursor-pointer rounded-3xl p-5 bg-gradient-to-br ${mix.color} border border-white/10 shadow-xl spring-card flex flex-col justify-between min-h-[160px] relative overflow-hidden backdrop-blur-xl animate-card-cascade`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/65">
                      Algorithmic Mix
                    </span>
                    <Headphones className="w-4 h-4 text-white/65 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1 group-hover:text-purple-300 transition-colors tracking-tight">
                    {mix.title}
                  </h3>
                  <p className="text-xs text-white/65 mt-1 line-clamp-2">
                    {mix.subtitle}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-mono tabular-nums font-semibold text-white/50">
                    {mix.tracks.length} tracks • Autoplay
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. "Because You Listened To..." Shelf */}
      {becauseYouListened && becauseYouListened.recommendations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Because You Listened to <span className="text-rose-400">"{becauseYouListened.seedTrack.title}"</span>
              </h2>
              <p className="text-xs sm:text-sm text-white/65">Recommended tracks sharing similar acoustic energy, melody & genre</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {becauseYouListened.recommendations.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, becauseYouListened?.recommendations)}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="group relative flex flex-col p-3 rounded-2xl glass-sheet spring-card cursor-pointer animate-card-cascade"
              >
                <div className="relative aspect-square w-full mb-3 shrink-0">
                  <img
                    src={get4kArtworkUrl(track)}
                    onError={handleArtworkError}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl blur-lg scale-95 opacity-65 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 -z-10 pointer-events-none"
                  />
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex items-center justify-center bg-black/60">
                    <img
                      src={get4kArtworkUrl(track)}
                      onError={handleArtworkError}
                      alt={track.title}
                      className="w-full h-full object-cover object-center scale-[1.08] group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl spring-button">
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                    <TrackActionMenu track={track} />
                  </div>
                </div>

                <h4 className="font-bold text-xs text-white tracking-tight truncate group-hover:text-rose-300 transition-colors">
                  {track.title}
                </h4>
                <p className="text-[11px] text-white/65 font-medium truncate mt-0.5">
                  {track.artist}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Recently Played Shelf */}
      {recentlyPlayed && recentlyPlayed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Recently Played
                </h2>
                <p className="text-xs sm:text-sm text-white/65">Jump back into your recent tracks</p>
              </div>
            </div>

            <button
              onClick={clearRecentlyPlayed}
              className="text-xs px-3 py-1 rounded-xl glass-pill text-white/50 hover:text-white flex items-center gap-1.5 transition-colors spring-button"
            >
              <RotateCcw className="w-3 h-3" /> Clear History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyPlayed.slice(0, 6).map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, recentlyPlayed)}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className={`group relative flex flex-col p-3 rounded-2xl glass-sheet spring-card cursor-pointer animate-card-cascade ${
                    isCurrent ? 'ring-1 ring-[#fa2d48]/50 bg-white/[0.08]' : ''
                  }`}
                >
                  <div className="relative aspect-square w-full mb-3 shrink-0">
                    <img
                      src={get4kArtworkUrl(track)}
                      onError={handleArtworkError}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover rounded-xl blur-lg scale-95 opacity-65 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 -z-10 pointer-events-none"
                    />
                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex items-center justify-center bg-black/60">
                      <img
                        src={get4kArtworkUrl(track)}
                        onError={handleArtworkError}
                        alt={track.title}
                        className="w-full h-full object-cover object-center scale-[1.08] group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl spring-button">
                          <Play className="w-4 h-4 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                      <TrackActionMenu track={track} />
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-white tracking-tight truncate group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-white/65 font-medium truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. Heavy Rotation Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Heavy Rotation
            </h2>
            <p className="text-xs sm:text-sm text-white/65">Top songs on repeat this week</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tracks.slice(0, 6).map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isPlayingThis = isCurrent && isPlaying;
            const isLiked = isFavorite(track.id);

            return (
              <div
                key={track.id}
                className="group relative flex flex-col p-3 rounded-2xl glass-sheet spring-card cursor-pointer"
                onClick={() => playTrack(track, tracks)}
              >
                {/* Artwork with Duplicate Blurred Shadow */}
                <div className="relative aspect-square w-full mb-3 shrink-0">
                  <img
                    src={get4kArtworkUrl(track)}
                    onError={handleArtworkError}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl blur-lg scale-95 opacity-65 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 -z-10 pointer-events-none"
                  />
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex items-center justify-center bg-black/60">
                    <img
                      src={get4kArtworkUrl(track)}
                      onError={handleArtworkError}
                      alt={track.title}
                      className="w-full h-full object-cover object-center scale-[1.08] group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                    
                    {/* Play Button Overlay */}
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isPlayingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="w-11 h-11 rounded-full bg-[#fa2d48] text-white flex items-center justify-center shadow-xl spring-button">
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      </div>
                    </div>

                    {/* Active playing indicator with dancing soundbars */}
                    {isCurrent && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5 shadow-md">
                        <AnimatedSoundBars isPlaying={isPlaying} color="#fa2d48" size="sm" />
                        <span className="text-[#fa2d48] font-mono tabular-nums text-[9px]">
                          {isPlaying ? 'PLAYING' : 'PAUSED'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-bold tracking-tight truncate ${
                    isCurrent ? 'text-[#fa2d48]' : 'text-white'
                  }`}>
                    {track.title}
                  </h3>
                  <p className="text-xs text-white/65 font-medium truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                {/* Like Button */}
                <button
                  onClick={(e) => handleLikeClick(e, track)}
                  className="absolute bottom-3 right-3 p-1.5 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity spring-button"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Curated Editorial Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Curated Stations & Playlists
            </h2>
            <p className="text-xs sm:text-sm text-white/65">Handcrafted audio selections for every mood</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handlePlaylistClick(playlist.id)}
              className="group relative rounded-2xl overflow-hidden glass-sheet hover:bg-white/[0.08] transition-all p-4 cursor-pointer flex flex-col justify-between min-h-[180px] spring-card"
            >
              <div className="flex items-start justify-between">
                <div className="relative w-16 h-16 shrink-0">
                  <img
                    src={playlist.coverUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl blur-md scale-95 opacity-60 -z-10 pointer-events-none"
                  />
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-[0_12px_32px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>

                <span className="text-xs font-mono tabular-nums text-white/40">
                  {playlist.trackIds.length} tracks
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#fa2d48] transition-colors mt-3">
                  {playlist.name}
                </h3>
                <p className="text-xs text-white/65 font-medium mt-1 line-clamp-2">
                  {playlist.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Top Tracks List with Tabular Numbers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-[#fa2d48]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Top Tracks Right Now
            </h2>
          </div>
        </div>

        <div className="glass-sheet rounded-2xl overflow-hidden p-2 divide-y divide-white/5">
          {tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isLiked = isFavorite(track.id);

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, tracks)}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer spring-button"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-6 text-center text-xs font-mono tabular-nums text-white/40 group-hover:hidden">
                    {idx + 1}
                  </span>
                  <button className="w-6 hidden group-hover:flex items-center justify-center text-white">
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  <div className="relative w-10 h-10 shrink-0">
                    <img
                      src={get4kArtworkUrl(track)}
                      onError={handleArtworkError}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover object-center scale-[1.08] shadow-md"
                    />
                    <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 pointer-events-none" />
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold tracking-tight truncate ${
                      isCurrent ? 'text-[#fa2d48]' : 'text-white'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-xs text-white/65 font-medium truncate">
                      {track.artist} • {track.album}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden sm:block text-xs font-medium text-white/40">
                    {track.genre}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-white/40">
                    {formatTime(track.duration)}
                  </span>
                  <button
                    onClick={(e) => handleLikeClick(e, track)}
                    className="p-1.5 text-white/40 hover:text-white spring-button"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
