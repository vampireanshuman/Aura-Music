import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  ExternalLink, 
  Calendar, 
  HardDrive,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { type UpdateInfo, formatFileSize } from '../utils/updater';
import { triggerHaptic } from '../utils/haptics';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, updateInfo }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !updateInfo) return null;

  const handleDownload = () => {
    triggerHaptic('success');
    if (!updateInfo.apkDownloadUrl) {
      window.open(updateInfo.htmlUrl, '_blank');
      return;
    }

    setIsDownloading(true);
    // Trigger direct APK download
    const link = document.createElement('a');
    link.href = updateInfo.apkDownloadUrl;
    link.download = `Aura-Music-v${updateInfo.latestVersion}.apk`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 4000);
  };

  const publishDate = updateInfo.publishedAt 
    ? new Date(updateInfo.publishedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Latest';

  return (
    <div 
      style={{ paddingTop: 'calc(var(--safe-top, 0px) + 12px)' }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
      />

      {/* Modal Dialog Sheet */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col bg-[#12141f]/95 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-[40px] saturate-[220%] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#fa2d48] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[#fa2d48]/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Software Update</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  NEW v{updateInfo.latestVersion}
                </span>
              </div>
              <p className="text-xs text-white/50">OTA Release from Official GitHub Repository</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors spring-button"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          
          {/* Version Comparison Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-white/40 block font-bold">Installed Version</span>
              <span className="text-sm font-mono font-bold text-white/70">v{updateInfo.currentVersion}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-white/30" />

            <div className="space-y-0.5 text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#fa2d48] block font-bold">Target Version</span>
              <span className="text-sm font-mono font-bold text-white">v{updateInfo.latestVersion}</span>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <div>
                <span className="text-[9.5px] text-white/40 block uppercase">Release Date</span>
                <span className="text-white font-semibold">{publishDate}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <span className="text-[9.5px] text-white/40 block uppercase">Download Size</span>
                <span className="text-white font-semibold">{formatFileSize(updateInfo.apkSize)}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Keystore Security Note */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-white/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-300 block">Seamless In-Place Android Upgrade</span>
              <p className="text-white/60 leading-relaxed text-[11px]">
                This update is signed with Aura Music's persistent release keystore. It installs directly over your current APK without package signature conflict, preserving your playlists, favorites, and settings.
              </p>
            </div>
          </div>

          {/* Changelog / Release Notes */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
              What's New in v{updateInfo.latestVersion}
            </span>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/80 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-line font-sans">
              {updateInfo.releaseNotes}
            </div>
          </div>

        </div>

        {/* Action Buttons Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#fa2d48] hover:bg-[#e0243e] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#fa2d48]/30 transition-all spring-button cursor-pointer disabled:opacity-75"
          >
            {isDownloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Downloading APK...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download & Install Update (.APK)</span>
              </>
            )}
          </button>

          <a
            href={updateInfo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic('light')}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors spring-button text-center"
          >
            <span>GitHub Notes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
