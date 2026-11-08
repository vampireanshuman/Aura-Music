import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { 
  Disc3, 
  Link2, 
  ArrowRight, 
  Play, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Plus,
  ListMusic,
  Layers
} from 'lucide-react';
import { formatTime } from '../../utils/formatTime';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const PluginsView: React.FC = () => {
  const { 
    youtubeTracks, 
    playlists, 
    playTrack, 
    importFromYouTube, 
    importFromSpotify, 
    importFullPlaylist,
    setSelectedPlaylistId, 
    setActiveTab 
  } = useAudio();

  const [activePluginTab, setActivePluginTab] = useState<'bulk-playlist' | 'youtube' | 'spotify'>('bulk-playlist');
  const [bulkInput, setBulkInput] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Bulk Playlist Importer
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);
    const success = await importFullPlaylist(bulkInput.trim());
    setIsLoading(false);

    if (success) {
      setStatusMessage({ text: 'Entire playlist successfully imported and playing now!' });
      setBulkInput('');
    } else {
      setStatusMessage({ 
        text: 'Unable to parse playlist. Please ensure you entered a valid Spotify link, YouTube playlist link, or a list of songs.', 
        error: true 
      });
    }
  };

  const handleYouTubeImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);
    const success = await importFromYouTube(youtubeUrl.trim());
    setIsLoading(false);

    if (success) {
      setStatusMessage({ text: 'Successfully imported and playing YouTube track!' });
      setYoutubeUrl('');
    } else {
      setStatusMessage({ text: 'Invalid YouTube URL. Please check the link and try again.', error: true });
    }
  };

  const handleSpotifyImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyUrl.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);
    const success = await importFromSpotify(spotifyUrl.trim());
    setIsLoading(false);

    if (success) {
      setStatusMessage({ text: 'Successfully synced Spotify track to your library!' });
      setSpotifyUrl('');
    } else {
      setStatusMessage({ text: 'Unable to parse Spotify link. Ensure it is a valid open.spotify.com link.', error: true });
    }
  };

  const spotifyPlaylists = playlists.filter(p => p.source === 'spotify');

  return (
    <div className="space-y-8" style={{ paddingBottom: 'calc(160px + var(--safe-bottom, 22px))' }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fa2d48]">
          <Sparkles className="w-4 h-4" /> Connected Services & Plugins
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
          Music Plugins Hub
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Copy and paste entire playlists from Spotify or YouTube, or stream individual tracks directly
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel max-w-xl">
        <button
          onClick={() => {
            setActivePluginTab('bulk-playlist');
            setStatusMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activePluginTab === 'bulk-playlist'
              ? 'bg-[#fa2d48] text-white shadow-lg shadow-[#fa2d48]/25'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> Import Entire Playlist
        </button>

        <button
          onClick={() => {
            setActivePluginTab('youtube');
            setStatusMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activePluginTab === 'youtube'
              ? 'bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/25'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <YoutubeIcon className="w-4 h-4" /> YouTube Music
        </button>

        <button
          onClick={() => {
            setActivePluginTab('spotify');
            setStatusMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activePluginTab === 'spotify'
              ? 'bg-[#1db954] text-white shadow-lg shadow-[#1db954]/25'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Disc3 className="w-4 h-4" /> Spotify Sync
        </button>
      </div>

      {/* Feedback Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-2.5 border animate-in fade-in ${
          statusMessage.error
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          {statusMessage.error ? '⚠️' : <Check className="w-4 h-4 text-emerald-400" />}
          {statusMessage.text}
        </div>
      )}

      {/* TAB 0: ENTIRE PLAYLIST IMPORTER (BULK) */}
      {activePluginTab === 'bulk-playlist' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#fa2d48] to-[#8b5cf6] flex items-center justify-center text-white shadow-lg">
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Full Playlist & Tracklist Importer</h3>
                <p className="text-xs text-white/50">
                  Copy your entire Spotify playlist link, YouTube playlist link, or a copied list of songs and paste it here
                </p>
              </div>
            </div>

            <form onSubmit={handleBulkImport} className="mt-5 space-y-4">
              <div>
                <textarea
                  rows={4}
                  placeholder={`Paste any of the following:
• Spotify Playlist: https://open.spotify.com/playlist/...
• YouTube Playlist: https://www.youtube.com/playlist?list=...
• Or a copied list of songs:
  1. The Weeknd - Blinding Lights
  2. Billie Eilish - Birds of a Feather
  3. Sabrina Carpenter - Espresso`}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm font-mono focus:outline-none focus:border-[#fa2d48] transition-all resize-y"
                />
              </div>

              {/* Quick sample insertion presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mr-1">
                  Try Sample:
                </span>
                <button
                  type="button"
                  onClick={() => setBulkInput('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')}
                  className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
                >
                  🟢 Spotify Global Top Hits
                </button>
                <button
                  type="button"
                  onClick={() => setBulkInput('https://www.youtube.com/playlist?list=PLrAlG_V3691vCjZ6Q4U8q8')}
                  className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
                >
                  🔴 YouTube Lofi & Chill
                </button>
                <button
                  type="button"
                  onClick={() => setBulkInput(`1. The Weeknd - Blinding Lights\n2. Billie Eilish - Birds of a Feather\n3. Taylor Swift - Cruel Summer\n4. Kendrick Lamar - Not Like Us\n5. Harry Styles - As It Was\n6. Dua Lipa - Levitating`)}
                  className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
                >
                  📝 6-Song Tracklist
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !bulkInput.trim()}
                  className="px-8 py-3.5 rounded-2xl bg-[#fa2d48] hover:bg-[#fa2d48]/90 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#fa2d48]/25 hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Parsing & Importing Playlist...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Import & Listen Entire Playlist
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: YOUTUBE MUSIC PLUGIN */}
      {activePluginTab === 'youtube' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-red-500/20 bg-gradient-to-br from-red-500/[0.04] to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#ef4444] flex items-center justify-center text-white shadow-lg">
                <YoutubeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Import from YouTube Music</h3>
                <p className="text-xs text-white/50">Paste any YouTube video or audio link to stream instantly</p>
              </div>
            </div>

            <form onSubmit={handleYouTubeImport} className="mt-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.08] border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#ef4444] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !youtubeUrl.trim()}
                className="px-6 py-3 rounded-2xl bg-[#ef4444] hover:bg-[#ef4444]/90 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Resolving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Import Track
                  </>
                )}
              </button>
            </form>
          </div>

          {/* YouTube Curated Streams */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Curated YouTube Music Streams</h2>
                <p className="text-xs text-white/50">High-fidelity live streams & lo-fi essentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {youtubeTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className="group cursor-pointer glass-panel rounded-2xl p-4 hover:bg-white/[0.08] transition-all flex items-center gap-4 border border-white/10"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-md">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                      <YoutubeIcon className="w-3 h-3" /> YouTube Audio
                    </div>
                    <h4 className="text-sm font-semibold text-white truncate mt-0.5 group-hover:text-red-400 transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-xs text-white/50 truncate mt-0.5">
                      {track.artist}
                    </p>
                    <span className="text-[11px] font-mono text-white/40 mt-1 block">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPOTIFY SYNC PLUGIN */}
      {activePluginTab === 'spotify' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#1db954] flex items-center justify-center text-white shadow-lg">
                <Disc3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sync from Spotify</h3>
                <p className="text-xs text-white/50">Paste any Spotify song, album, or playlist URL to sync directly</p>
              </div>
            </div>

            <form onSubmit={handleSpotifyImport} className="mt-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Paste Spotify link (e.g. https://open.spotify.com/track/...)"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.08] border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#1db954] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !spotifyUrl.trim()}
                className="px-6 py-3 rounded-2xl bg-[#1db954] hover:bg-[#1db954]/90 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Syncing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Sync Song
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Synced Spotify Playlists */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Preset Spotify Curations</h2>
                <p className="text-xs text-white/50">One-click synchronized Spotify global charts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {spotifyPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    setSelectedPlaylistId(pl.id);
                    setActiveTab('playlist');
                  }}
                  className="group cursor-pointer glass-panel rounded-2xl p-5 hover:bg-white/[0.08] transition-all flex flex-col justify-between border border-white/10"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={pl.coverUrl}
                      alt={pl.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Disc3 className="w-3 h-3" /> Spotify Playlist
                      </span>
                      <h4 className="text-base font-bold text-white truncate mt-0.5 group-hover:text-emerald-400 transition-colors">
                        {pl.name}
                      </h4>
                      <p className="text-xs text-white/50 line-clamp-2 mt-1">
                        {pl.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                    <span>{pl.trackIds.length} tracks</span>
                    <span className="group-hover:text-white flex items-center gap-1 font-semibold text-emerald-400">
                      Open Playlist <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
