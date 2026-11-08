import React, { useRef, useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { UploadCloud, Play, Heart, HardDrive, FileAudio } from 'lucide-react';
import { formatTime } from '../../utils/formatTime';

export const LocalFilesView: React.FC = () => {
  const { localTracks, playTrack, currentTrack, isPlaying, toggleFavorite, isFavorite, importLocalFiles } = useAudio();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsProcessing(true);
      await importLocalFiles(e.dataTransfer.files);
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      await importLocalFiles(e.target.files);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8" style={{ paddingBottom: 'calc(160px + var(--safe-bottom, 22px))' }}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-title-primary tracking-tight flex items-center gap-3">
          <HardDrive className="w-8 h-8 text-sky-400" /> Local Audio Collection
        </h1>
        <p className="text-sm text-meta-secondary mt-1">
          Play MP3, FLAC, AAC, WAV & OGG files directly from your computer with ID3 tag parsing
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-[24px] border-2 border-dashed p-8 sm:p-12 text-center spring-interactive ${
          isDragging
            ? 'border-[#fa2d48] bg-[#fa2d48]/10 scale-[1.01]'
            : 'border-white/15 glass-sheet hover:border-white/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl glass-pill flex items-center justify-center text-[#fa2d48] shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-title-primary">
              {isProcessing ? 'Reading ID3 tags & Artwork...' : 'Drop audio files here'}
            </h3>
            <p className="text-xs text-meta-secondary mt-1">
              Supports MP3, FLAC, WAV, AAC, and Apple Lossless. ID3 tags and album covers are automatically extracted in-browser!
            </p>
          </div>

          <button
            type="button"
            className="px-5 py-2.5 rounded-full glass-pill hover:bg-white/20 text-xs font-semibold text-title-primary spring-button shadow"
          >
            Browse Computer Files
          </button>
        </div>
      </div>

      {/* Local Tracks List */}
      <div className="glass-sheet rounded-[24px] overflow-hidden p-1 sm:p-2">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-subtle-inactive">
            Imported Local Files (<span className="tabular-nums font-mono">{localTracks.length}</span>)
          </span>
        </div>

        {localTracks.length === 0 ? (
          <div className="py-16 text-center text-subtle-inactive space-y-2">
            <FileAudio className="w-8 h-8 mx-auto text-white/20" />
            <p className="text-sm text-meta-secondary">No local tracks imported yet</p>
            <p className="text-xs text-subtle-inactive">Drag and drop audio files onto the box above</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {localTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isLiked = isFavorite(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, localTracks)}
                  className="grid grid-cols-12 gap-4 px-4 sm:px-5 py-3 items-center hover:bg-white/[0.05] rounded-xl transition-all duration-300 cursor-pointer group text-sm"
                >
                  <div className="col-span-1 text-center font-mono text-xs text-subtle-inactive tabular-nums">
                    <span className="group-hover:hidden">
                      {isCurrent && isPlaying ? (
                        <span className="text-[#fa2d48] font-bold">▶</span>
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <Play className="w-3.5 h-3.5 hidden group-hover:inline-block fill-current text-white mx-auto" />
                  </div>

                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0 w-10 h-10">
                      <img
                        src={track.coverUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full rounded-lg object-cover blur-md scale-95 opacity-60 -z-10 pointer-events-none"
                      />
                      <img
                        src={track.coverUrl}
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
                      <p className="text-xs text-meta-secondary truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-4 text-meta-secondary truncate text-xs">
                    {track.album}
                  </div>

                  <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-3 font-mono text-xs text-subtle-inactive tabular-nums">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="p-1 text-white/30 hover:text-white spring-interactive"
                      title="Like"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#fa2d48] text-[#fa2d48]' : ''}`} />
                    </button>
                    <span>{formatTime(track.duration)}</span>
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
