import React, { useState, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';
import { GENRES } from '../../data/catalog';
import { 
  Play, 
  Compass, 
  TrendingUp, 
  Globe2, 
  Sparkles, 
  Radio, 
  Flame, 
  Music2, 
  ChevronRight, 
  ChevronLeft, 
  Headphones, 
  Mic2 
} from 'lucide-react';
import { get4kArtworkUrl, handleArtworkError } from '../../utils/artworkUtils';
import { MOOD_CATEGORIES, filterTracksByMood } from '../../utils/recommendationEngine';
import { TrackActionMenu } from '../TrackActionMenu';

export const BrowseView: React.FC = () => {
  const { tracks, playTrack, setActiveTab, setSearchQuery, currentTrack, isPlaying } = useAudio();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const filteredTracks = filterTracksByMood(tracks, activeCategory);

  const heroSlides = [
    {
      badge: 'SPATIAL AUDIO SPOTLIGHT',
      title: 'Dolby Atmos Master Series',
      subtitle: 'Experience 360° binaural acoustic immersion with calibrated HRTF soundstage.',
      gradient: 'from-purple-900/90 via-[#181135]/80 to-black',
      tagColor: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
      track: tracks[0] || null,
      icon: <Sparkles className="w-4 h-4 text-purple-400" />
    },
    {
      badge: 'STUDIO AUDIOPHILE',
      title: 'Hi-Res Lossless 24-Bit / 192kHz',
      subtitle: 'Bit-for-bit uncompressed audio masters with vacuum tube warmth saturation.',
      gradient: 'from-amber-950/90 via-[#22150a]/80 to-black',
      tagColor: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
      track: tracks[1] || tracks[0] || null,
      icon: <Headphones className="w-4 h-4 text-amber-400" />
    },
    {
      badge: 'APPLE MUSIC SING',
      title: 'Real-Time Karaoke Attenuation',
      subtitle: 'Sing along with time-synced lyrics with live vocal frequency isolation.',
      gradient: 'from-emerald-950/90 via-[#0a2016]/80 to-black',
      tagColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
      track: tracks[2] || tracks[0] || null,
      icon: <Mic2 className="w-4 h-4 text-emerald-400" />
    }
  ];

  // Auto cycle carousel every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleGenreClick = (genreName: string) => {
    setSearchQuery(genreName);
    setActiveTab('search');
  };

  const topCharts = [
    {
      id: 'chart-global-50',
      title: 'Top 50 • Global Hits',
      desc: 'The most-streamed tracks worldwide right now',
      color: 'from-purple-600/30 via-indigo-900/20 to-[#0e101a]',
      tag: 'DAILY UPDATE',
      badge: '★ #1 WORLDWIDE',
      tracks: tracks.slice(0, 4)
    },
    {
      id: 'chart-spatial-audio',
      title: 'Spatial Audio Masters',
      desc: 'Pure 24-bit / 192kHz ALAC acoustic recordings',
      color: 'from-rose-600/30 via-amber-900/20 to-[#0e101a]',
      tag: 'DOLBY ATMOS',
      badge: '▲ 98.4 AUDIOPHILE',
      tracks: tracks.slice(1, 5)
    },
    {
      id: 'chart-viral',
      title: 'Trending Viral Sound',
      desc: 'Top social media trending tracks and breakout anthems',
      color: 'from-emerald-600/30 via-cyan-900/20 to-[#0e101a]',
      tag: 'TRENDING',
      badge: '🔥 HOT ROTATION',
      tracks: tracks.slice(2, 6)
    }
  ];

  const currentSlide = heroSlides[carouselIndex];

  return (
    <div className="space-y-10 pb-36">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fa2d48]">
            <Compass className="w-4 h-4" /> Aura Global Music Explorer
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Browse
          </h1>
          <p className="text-sm text-white/65 font-medium mt-1">
            Explore spatial audio studio masters, global top charts, and acoustic mood stations
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl glass-pill text-xs font-semibold text-white/70 self-start sm:self-center">
          <Globe2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Worldwide Catalog • 4K Master</span>
        </div>
      </div>

      {/* Editorial Hero Spotlight Carousel */}
      <div className="relative rounded-[28px] overflow-hidden shadow-2xl border border-white/10 group spring-interactive">
        <div className={`p-7 sm:p-10 bg-gradient-to-r ${currentSlide.gradient} flex flex-col md:flex-row items-center justify-between gap-8 min-h-[300px] transition-all duration-700`}>
          <div className="max-w-xl space-y-3 z-10 text-center md:text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${currentSlide.tagColor}`}>
              {currentSlide.icon}
              <span>{currentSlide.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {currentSlide.title}
            </h2>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed font-medium">
              {currentSlide.subtitle}
            </p>
            {currentSlide.track && (
              <div className="pt-3 flex items-center justify-center md:justify-start gap-4">
                <button
                  onClick={() => playTrack(currentSlide.track!, tracks)}
                  className="px-6 py-3 rounded-full bg-white text-black font-extrabold flex items-center gap-2 shadow-xl spring-button text-xs uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  <span>Listen Now: {currentSlide.track.title}</span>
                </button>
              </div>
            )}
          </div>

          {currentSlide.track && (
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 group">
              <img
                src={get4kArtworkUrl(currentSlide.track)}
                onError={handleArtworkError}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover rounded-3xl blur-xl scale-95 opacity-70 -z-10 pointer-events-none"
              />
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)] border-2 border-white/20 transition-transform duration-500 group-hover:scale-105">
                <img
                  src={get4kArtworkUrl(currentSlide.track)}
                  onError={handleArtworkError}
                  alt={currentSlide.track.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="text-xs font-bold text-white tracking-tight truncate">{currentSlide.track.title}</span>
                  <span className="text-[11px] text-white/65 font-medium truncate">{currentSlide.track.artist}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Carousel Dots & Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCarouselIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                carouselIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCarouselIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/60 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20 spring-button"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCarouselIndex((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/60 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20 spring-button"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mood & Atmosphere Filter Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
        {MOOD_CATEGORIES.map((m) => {
          const isSelected = activeCategory === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveCategory(m.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 spring-button ${
                isSelected
                  ? 'bg-white text-black font-extrabold shadow-xl scale-105'
                  : 'glass-pill text-white/65 hover:text-white'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Top Charts Showcase Shelves */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#fa2d48]" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Official Charts & Master Stations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topCharts.map((chart) => (
            <div
              key={chart.id}
              onClick={() => playTrack(chart.tracks[0], chart.tracks)}
              className={`group cursor-pointer rounded-3xl p-5 bg-gradient-to-b ${chart.color} border border-white/10 shadow-2xl spring-card flex flex-col justify-between min-h-[230px] relative overflow-hidden backdrop-blur-xl`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tabular-nums font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                    {chart.tag}
                  </span>
                  <span className="text-[10px] font-mono tabular-nums font-bold text-amber-300/90">
                    {chart.badge}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-3 group-hover:text-purple-300 transition-colors tracking-tight">
                  {chart.title}
                </h3>
                <p className="text-xs text-white/65 font-medium mt-1">
                  {chart.desc}
                </p>
              </div>

              {/* Stacked 4K Thumbnail Previews & Play Trigger */}
              <div className="relative z-10 pt-6 flex items-center justify-between">
                <div className="flex items-center -space-x-3 overflow-hidden">
                  {chart.tracks.slice(0, 3).map((t, i) => (
                    <div key={t.id || i} className="relative w-10 h-10 shrink-0">
                      <img
                        src={get4kArtworkUrl(t)}
                        onError={handleArtworkError}
                        alt={t.title}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-black shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15 pointer-events-none" />
                    </div>
                  ))}
                </div>

                <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Decorative radial sheen */}
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* Curated Categories & Genres Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Explore by Genre & Category
            </h2>
          </div>
          <span className="text-xs text-white/40">Tap any card to search</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {GENRES.map((g, idx) => (
            <div
              key={idx}
              onClick={() => handleGenreClick(g.name)}
              className={`cursor-pointer relative h-32 rounded-2xl p-4 bg-gradient-to-br ${g.color} shadow-lg spring-card flex flex-col justify-between overflow-hidden group border border-white/10`}
            >
              <span className="text-sm font-extrabold text-white tracking-tight drop-shadow-md">
                {g.name}
              </span>

              <div className="self-end p-2 rounded-xl bg-white/15 backdrop-blur-md text-white group-hover:scale-110 transition-transform">
                <Music2 className="w-4 h-4" />
              </div>

              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Master Recordings with TrackActionMenu */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Essential Studio Master Recordings
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTracks.slice(0, 6).map((track) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, filteredTracks)}
                className={`group cursor-pointer glass-sheet rounded-3xl p-4 flex items-center gap-4 spring-card relative ${
                  isCurrent ? 'ring-1 ring-[#fa2d48]/50 bg-white/[0.08]' : ''
                }`}
              >
                {/* Step 3: Artwork with Duplicate Blurred Glow Shadow */}
                <div className="relative w-20 h-20 shrink-0">
                  <img
                    src={get4kArtworkUrl(track)}
                    onError={handleArtworkError}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl blur-md scale-95 opacity-65 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500 -z-10 pointer-events-none"
                  />
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex items-center justify-center bg-black/60">
                    <img
                      src={get4kArtworkUrl(track)}
                      onError={handleArtworkError}
                      alt={track.album}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />

                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="w-9 h-9 rounded-full bg-[#fa2d48] text-white flex items-center justify-center shadow-xl spring-button">
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: High Contrast Visual Weight Hierarchy */}
                <div className="flex-1 min-w-0 pr-8">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#fa2d48] flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {track.genre}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate mt-0.5 group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-white/65 font-medium truncate mt-0.5">
                    {track.artist}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono tabular-nums text-white/40">
                    <span>{track.album || 'Single'}</span>
                    <span>•</span>
                    <span className="text-emerald-400">24-bit Hi-Res</span>
                  </div>
                </div>

                {/* 3-Dots Quick Action Menu */}
                <div className="absolute top-4 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                  <TrackActionMenu track={track} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
