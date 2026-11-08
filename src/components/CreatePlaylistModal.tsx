import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Plus, Sparkles, Link as LinkIcon, Loader2, ArrowRight } from 'lucide-react';

export const CreatePlaylistModal: React.FC = () => {
  const { 
    isCreatePlaylistOpen, 
    setIsCreatePlaylistOpen, 
    createPlaylist, 
    importFullPlaylist,
    setSelectedPlaylistId, 
    setActiveTab,
    currentTrack 
  } = useAudio();

  const [activeMode, setActiveMode] = useState<'import' | 'manual'>('manual');
  const [importInput, setImportInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isCreatePlaylistOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = createPlaylist(name.trim(), description.trim());
    setSelectedPlaylistId(newId);
    setActiveTab('playlist');
    setName('');
    setDescription('');
    setIsCreatePlaylistOpen(false);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importInput.trim() || isImporting) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const success = await importFullPlaylist(importInput.trim());
      if (success) {
        setImportInput('');
        setIsCreatePlaylistOpen(false);
      } else {
        setImportError('Could not import playlist. Please check the URL or song list and try again.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const setSampleInput = (sample: string) => {
    setImportInput(sample);
    setImportError(null);
  };

  return (
    <div 
      style={{ paddingTop: 'calc(var(--safe-top, 0px) + 12px)' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
    >
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => !isImporting && setIsCreatePlaylistOpen(false)}
      />

      <div className="relative z-10 w-full max-w-lg bg-[#12141f]/95 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: currentTrack?.dominantColor || '#fa2d48' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Add Playlist</h3>
              <p className="text-xs text-white/50">Import from YouTube & Spotify, or curate your own</p>
            </div>
          </div>

          <button
            onClick={() => !isImporting && setIsCreatePlaylistOpen(false)}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1 bg-white/[0.04] rounded-2xl border border-white/5 mt-4">
          <button
            type="button"
            onClick={() => setActiveMode('import')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'import'
                ? 'bg-[#fa2d48] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Import from URL / Text
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'manual'
                ? 'bg-[#fa2d48] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Plus className="w-4 h-4" />
            Create Blank
          </button>
        </div>

        {/* MODE 1: IMPORT FROM URL OR TEXT */}
        {activeMode === 'import' && (
          <form onSubmit={handleImportSubmit} className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  YouTube / Spotify URL or Song List
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                    YouTube
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Spotify
                  </span>
                </div>
              </div>

              <textarea
                rows={4}
                required
                disabled={isImporting}
                placeholder="Paste any Spotify playlist link, YouTube playlist link, or lines of songs:&#10;e.g. https://open.spotify.com/playlist/...&#10;or:&#10;Starboy - The Weeknd&#10;Espresso - Sabrina Carpenter&#10;Kesariya - Arijit Singh"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#fa2d48] transition-colors resize-none leading-relaxed font-mono"
              />
            </div>

            {/* Quick Presets / Examples */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-white/40 block">Quick Examples:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => setSampleInput('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-white/70 hover:text-white border border-white/5 transition-all cursor-pointer"
                >
                  Spotify Today's Top Hits
                </button>
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => setSampleInput("Starboy - The Weeknd\nBirds of a Feather - Billie Eilish\nEspresso - Sabrina Carpenter\nKesariya - Arijit Singh\nBlinding Lights - The Weeknd")}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-white/70 hover:text-white border border-white/5 transition-all cursor-pointer"
                >
                  Pasted 5 Songs
                </button>
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => setSampleInput('https://www.youtube.com/watch?v=3_g2un5M350')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-white/70 hover:text-white border border-white/5 transition-all cursor-pointer"
                >
                  YouTube Track
                </button>
              </div>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {importError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setIsCreatePlaylistOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!importInput.trim() || isImporting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#fa2d48] text-white hover:bg-[#fa2d48]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resolving Audio Streams...</span>
                  </>
                ) : (
                  <>
                    <span>Import & Play</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: CREATE BLANK PLAYLIST */}
        {activeMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                Playlist Name
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Midnight Drives, Focus Flow..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#fa2d48] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Give your playlist a mood or description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#fa2d48] transition-colors resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreatePlaylistOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#fa2d48] text-white hover:bg-[#fa2d48]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
