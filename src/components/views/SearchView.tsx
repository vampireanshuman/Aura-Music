import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { 
  Search, 
  Play, 
  Pause, 
  Heart, 
  Plus, 
  Check, 
  Sparkles, 
  Loader2, 
  Music,
  TrendingUp,
  Radio
} from 'lucide-react';
import { formatTime } from '../../utils/formatTime';
import type { Track } from '../../types/music';
import { AnimatedSoundBars } from '../AnimatedSoundBars';
import { get4kArtworkUrl, handleArtworkError } from '../../utils/artworkUtils';

const QUICK_TRENDING_CHIPS = [
  'Starboy The Weeknd',
  'Arijit Singh Kesariya',
  'Billie Eilish Birds of a Feather',
  'Sabrina Carpenter Espresso',
  'Coldplay Viva La Vida',
  'Taylor Swift Cruel Summer',
  'Kendrick Lamar Not Like Us',
  'Diljit Dosanjh Lover',
  'Dua Lipa Houdini'
];

export const SearchView: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchOnline, 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    toggleFavorite, 
    isFavorite,
    addToQueue 
  } = useAudio();

  const [onlineResults, setOnlineResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedTrackId, setAddedTrackId] = useState<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Debounced search whenever searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setOnlineResults([]);
      setIsSearching(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSearching(true);
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        const results = await searchOnline(searchQuery.trim());
        setOnlineResults(results);
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, searchOnline]);

  const handleAddQueue = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
    setAddedTrackId(track.id);
    setTimeout(() => setAddedTrackId(null), 1500);
  };

  const topResult = onlineResults[0];
  const otherResults = onlineResults.slice(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300" style={{ paddingBottom: 'calc(160px + var(--safe-bottom, 22px))' }}>
      
      {/* Search Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fa2d48]">
          <Radio className="w-4 h-4 animate-pulse" /> Live Global Music Search
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-title-primary tracking-tight mt-1">
          Search Any Song
        </h1>
        <p className="text-xs sm:text-sm text-meta-secondary mt-1">
          Stream any song, 320kbps master, or artist in the world powered by JioSaavn & iTunes engine
        </p>
      </div>

      {/* Modern Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle-inactive" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by song name, artist, or album (e.g. Starboy, Arijit Singh, Taylor Swift...)"
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl glass-sheet focus:bg-white/10 border border-white/10 focus:border-[#fa2d48]/50 text-sm text-title-primary placeholder-white/40 focus:outline-none transition-all shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          autoFocus
        />
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#fa2d48] animate-spin" />
        )}
      </div>

      {/* Quick Trending Suggestions Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-subtle-inactive uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Trending Searches</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_TRENDING_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setSearchQuery(chip)}
              className="px-3 py-1.5 rounded-xl glass-pill hover:bg-white/[0.08] text-xs text-meta-secondary hover:text-white whitespace-nowrap spring-interactive cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* State 1: Active Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-6">
          {isSearching && onlineResults.length === 0 ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-2 text-xs text-meta-secondary mb-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#fa2d48]" />
                <span>Searching JioSaavn 320kbps & Global catalog...</span>
              </div>
              {/* Skeleton Hero Card */}
              <div className="glass-sheet rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-white/5">
                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 shrink-0 animate-pulse" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="w-20 h-4 rounded-full bg-white/10" />
                    <div className="w-48 sm:w-64 h-6 rounded-lg bg-white/15" />
                    <div className="w-32 h-4 rounded-md bg-white/10" />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/15 shrink-0 self-end sm:self-center" />
              </div>
              {/* Skeleton List Items */}
              <div className="glass-sheet rounded-[24px] divide-y divide-white/5 overflow-hidden p-2 space-y-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3.5 flex-1">
                      <div className="w-5 h-4 bg-white/10 rounded" />
                      <div className="w-11 h-11 rounded-xl bg-white/10 shrink-0" />
                      <div className="space-y-1.5 flex-1 max-w-xs">
                        <div className="w-3/4 h-4 bg-white/15 rounded" />
                        <div className="w-1/2 h-3 bg-white/10 rounded" />
                      </div>
                    </div>
                    <div className="w-12 h-4 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : onlineResults.length === 0 ? (
            <div className="glass-sheet rounded-[24px] p-12 text-center text-subtle-inactive space-y-2">
              <Music className="w-10 h-10 mx-auto text-white/20 stroke-1" />
              <p className="text-base font-semibold text-meta-secondary">No matching tracks found</p>
              <p className="text-xs text-subtle-inactive">Try searching with artist name and song title</p>
            </div>
          ) : (
            <>
              {/* Top Result Hero Card */}
              {topResult && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-subtle-inactive block">
                    Top Result
                  </span>

                  <div 
                    onClick={() => playTrack(topResult, onlineResults)}
                    className="group relative cursor-pointer glass-sheet rounded-[24px] p-5 sm:p-6 transition-all duration-300 shadow-[0px_16px_40px_rgba(0,0,0,0.45)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 overflow-hidden"
                  >
                    {/* Background glow from top result art */}
                    <div 
                      className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none transition-all"
                      style={{ backgroundColor: topResult.dominantColor || '#fa2d48' }}
                    />

                    <div className="flex items-center gap-4 min-w-0 relative z-10">
                      <div className="relative group shrink-0">
                        {/* Duplicate backlight glow */}
                        <img 
                          src={get4kArtworkUrl(topResult)} 
                          onError={handleArtworkError}
                          alt=""
                          className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover blur-xl scale-95 opacity-65 -z-10 pointer-events-none"
                        />
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-[0px_12px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={get4kArtworkUrl(topResult)} 
                            onError={handleArtworkError}
                            alt={topResult.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-8 h-8 text-white fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fa2d48]/20 text-[#fa2d48] border border-[#fa2d48]/30 inline-block mb-1">
                          {topResult.genre || 'Studio Master'}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-title-primary tracking-tight truncate group-hover:text-[#fa2d48] transition-colors">
                          {topResult.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-meta-secondary font-medium truncate mt-0.5">
                          {topResult.artist}
                        </p>
                        <p className="text-xs text-subtle-inactive mt-1 font-mono tabular-nums">
                          {topResult.album} • {formatTime(topResult.duration)}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons on Top Result */}
                    <div className="flex items-center gap-3 relative z-10 self-end sm:self-center">
                      <button
                        onClick={(e) => handleAddQueue(topResult, e)}
                        className="px-3.5 py-2 rounded-xl glass-pill hover:bg-white/20 text-xs font-semibold text-meta-secondary hover:text-white flex items-center gap-1.5 spring-button"
                        title="Add to Up Next Queue"
                      >
                        {addedTrackId === topResult.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Queued</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Queue</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(topResult.id, topResult);
                        }}
                        className="p-2.5 rounded-xl glass-pill hover:bg-white/20 text-white spring-button"
                        title={isFavorite(topResult.id) ? 'Favorited' : 'Add to Favorites'}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(topResult.id) ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
                      </button>

                      <div className="relative flex items-center justify-center">
                        {currentTrack?.id === topResult.id && isPlaying && (
                          <span className="absolute inset-0 rounded-full animate-ripple pointer-events-none bg-[#fa2d48]/40" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentTrack?.id === topResult.id) togglePlay();
                            else playTrack(topResult, onlineResults);
                          }}
                          className="relative z-10 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center spring-button shadow-xl"
                          title="Play Now"
                        >
                          {currentTrack?.id === topResult.id && isPlaying ? (
                            <Pause className="w-5 h-5 fill-current animate-button-pop" />
                          ) : (
                            <Play className="w-5 h-5 fill-current translate-x-0.5 animate-button-pop" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Songs List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-subtle-inactive block">
                  Songs & Music Videos (<span className="tabular-nums font-mono">{onlineResults.length}</span>)
                </span>

                <div className="glass-sheet rounded-[24px] divide-y divide-white/5 overflow-hidden p-1 sm:p-2">
                  {otherResults.map((track, idx) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const isLiked = isFavorite(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track, onlineResults)}
                        className={`flex items-center justify-between p-3 sm:p-3.5 hover:bg-white/[0.05] rounded-xl transition-all duration-300 cursor-pointer group ${
                          isCurrent ? 'bg-white/[0.06] border-l-2 border-[#fa2d48]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Play index indicator / Soundbars */}
                          <div className="w-6 text-center text-xs font-mono text-subtle-inactive tabular-nums shrink-0 flex items-center justify-center">
                            <span className="group-hover:hidden">
                              {isCurrent ? (
                                <AnimatedSoundBars isPlaying={isPlaying} color="#fa2d48" size="sm" />
                              ) : (
                                idx + 2
                              )}
                            </span>
                            <Play className="w-3.5 h-3.5 hidden group-hover:inline-block fill-current text-white mx-auto animate-button-pop" />
                          </div>

                          <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12">
                            <img
                              src={get4kArtworkUrl(track)}
                              onError={handleArtworkError}
                              alt=""
                              className="absolute inset-0 w-full h-full rounded-xl object-cover blur-md scale-95 opacity-60 -z-10 pointer-events-none"
                            />
                            <img
                              src={get4kArtworkUrl(track)}
                              onError={handleArtworkError}
                              alt={track.title}
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shadow-[0px_4px_16px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                            />
                          </div>

                          <div className="min-w-0 pr-4">
                            <p className={`text-sm font-bold truncate tracking-tight ${isCurrent ? 'text-[#fa2d48]' : 'text-title-primary'}`}>
                              {track.title}
                            </p>
                            <p className="text-xs text-meta-secondary truncate mt-0.5">
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons on row */}
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0 font-mono text-xs text-subtle-inactive tabular-nums">
                          <span className="hidden sm:inline">
                            {formatTime(track.duration)}
                          </span>

                          <button
                            onClick={(e) => handleAddQueue(track, e)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white spring-interactive"
                            title="Add to queue"
                          >
                            {addedTrackId === track.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(track.id, track);
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white spring-interactive"
                            title={isLiked ? 'Favorited' : 'Favorite'}
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* State 2: When search is empty, show Recommended Charts & Trending Artists */}
      {!searchQuery.trim() && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-title-primary tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fa2d48]" />
              Popular & Trending Hits
            </h2>
            <span className="text-xs text-subtle-inactive">Click any card to start streaming</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: 'Starboy', artist: 'The Weeknd', id: '3_g2un5M350', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', genre: 'R&B / Synth' },
              { title: 'Birds of a Feather', artist: 'Billie Eilish', id: 'd5gf9dXbPi0', cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', genre: 'Alternative' },
              { title: 'Espresso', artist: 'Sabrina Carpenter', id: 'eVli-tstM5E', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80', genre: 'Nu-Disco' },
              { title: 'Kesariya', artist: 'Arijit Singh', id: 'BddP6PYo2gs', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80', genre: 'Bollywood' },
              { title: 'Blinding Lights', artist: 'The Weeknd', id: '4NRXx6U8ABQ', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80', genre: 'Synthwave' },
              { title: 'Viva La Vida', artist: 'Coldplay', id: 'dvgZkm1xWPE', cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80', genre: 'Rock' },
              { title: 'Cruel Summer', artist: 'Taylor Swift', id: 'ic8j13piAhQ', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80', genre: 'Pop' },
              { title: 'Lofi Girl Coffee Session', artist: 'Lofi Girl', id: 'jfKfPfyJRdk', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80', genre: 'Lo-Fi' }
            ].map(hit => (
              <div
                key={hit.id}
                onClick={() => {
                  const track: Track = {
                    id: `hit-${hit.id}`,
                    title: hit.title,
                    artist: hit.artist,
                    album: 'Global Hits',
                    duration: 210,
                    audioUrl: '',
                    youtubeId: hit.id,
                    coverUrl: hit.cover,
                    dominantColor: '#fa2d48',
                    genre: hit.genre,
                    year: 2026,
                    lyrics: []
                  };
                  playTrack(track);
                }}
                className="group cursor-pointer glass-sheet rounded-2xl p-3 border border-white/5 hover:border-white/20 spring-card"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/10 mb-2.5">
                  <img
                    src={hit.cover}
                    alt={hit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg spring-button">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-title-primary truncate group-hover:text-[#fa2d48] transition-colors">
                  {hit.title}
                </h4>
                <p className="text-[11px] text-meta-secondary truncate mt-0.5">
                  {hit.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
