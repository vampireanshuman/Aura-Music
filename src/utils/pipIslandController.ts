import type { Track } from '../types/music';
import { get4kArtworkUrl } from './artworkUtils';

export interface PipState {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  primaryColor: string;
}

export interface PipCallbacks {
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek?: (time: number) => void;
}

class PipIslandController {
  private pipWindow: any = null;
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private currentArtworkImg: HTMLImageElement | null = null;
  private currentArtworkSrc: string | null = null;
  private state: PipState = {
    track: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    primaryColor: '#fa2d48',
  };
  private callbacks: PipCallbacks = {
    onTogglePlay: () => {},
    onNext: () => {},
    onPrev: () => {},
  };
  private autoPipEnabled = true;
  private isPipOpen = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupVisibilityListener();
    }
  }

  public init(callbacks: PipCallbacks) {
    this.callbacks = callbacks;
  }

  public setAutoPip(enabled: boolean) {
    this.autoPipEnabled = enabled;
  }

  public updateState(newState: Partial<PipState>) {
    this.state = { ...this.state, ...newState };

    if (this.state.track) {
      const artSrc = get4kArtworkUrl(this.state.track);
      if (artSrc !== this.currentArtworkSrc) {
        this.currentArtworkSrc = artSrc;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = artSrc;
        img.onload = () => {
          this.currentArtworkImg = img;
        };
      }
    }

    // Warm up the canvas stream when playback starts
    if (this.state.isPlaying && !this.videoEl && typeof document !== 'undefined') {
      this.ensureCanvasVideoElements();
    }

    // Update Document PiP DOM if open
    if (this.pipWindow && !this.pipWindow.closed) {
      this.updateDocumentPipDOM();
    }
  }

  private setupVisibilityListener() {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (this.autoPipEnabled && this.state.isPlaying && !this.isPipActive()) {
          this.requestPipIsland().catch((err) => {
            console.log('[PiP] auto-pip on background hidden:', err);
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleVisibility);
  }

  public isPipActive(): boolean {
    if (this.pipWindow && !this.pipWindow.closed) return true;
    if (typeof document !== 'undefined' && document.pictureInPictureElement) return true;
    return this.isPipOpen;
  }

  /**
   * Request Picture-in-Picture:
   * 1. Try Document Picture-in-Picture API (Chrome/Edge desktop & modern Android)
   * 2. Fallback to Canvas Stream Video PiP (300px × 80px)
   */
  public async requestPipIsland(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if already active
    if (this.isPipActive()) return true;

    // Option 1: Document Picture-in-Picture API (300px × 80px)
    if ('documentPictureInPicture' in window) {
      try {
        const pipWin = await (window as any).documentPictureInPicture.requestWindow({
          width: 300,
          height: 80,
          disallowReturnToOpener: false,
        });

        this.pipWindow = pipWin;
        this.isPipOpen = true;

        this.setupDocumentPipWindow(pipWin);

        pipWin.addEventListener('pagehide', () => {
          this.pipWindow = null;
          this.isPipOpen = false;
        });

        return true;
      } catch (err) {
        console.warn('[PiP] Document PiP failed, falling back to Canvas PiP:', err);
      }
    }

    // Option 2: Canvas Stream Video PiP (300px × 80px)
    try {
      return await this.startCanvasVideoPip();
    } catch (err) {
      console.warn('[PiP] Canvas Video PiP failed:', err);
      return false;
    }
  }

  public async exitPipIsland(): Promise<void> {
    if (this.pipWindow && !this.pipWindow.closed) {
      try {
        this.pipWindow.close();
      } catch {}
      this.pipWindow = null;
    }

    if (typeof document !== 'undefined' && document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch {}
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.videoEl) {
      try {
        this.videoEl.pause();
        this.videoEl.srcObject = null;
      } catch {}
      this.videoEl.remove();
      this.videoEl = null;
    }

    this.isPipOpen = false;
  }

  // =========================================================================
  // Document Picture-in-Picture API (300px × 80px Floating HUD)
  // =========================================================================
  private setupDocumentPipWindow(pipWin: any) {
    const doc = pipWin.document;

    // Inject styles tuned for 300px x 80px
    const style = doc.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: #000000;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        user-select: none;
      }
      .island-pill {
        width: 100%;
        height: 100%;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #000000;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 24px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.9);
      }
      .art-wrap {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        overflow: hidden;
        margin-right: 10px;
        flex-shrink: 0;
        background: #111;
        border: 1px solid rgba(255,255,255,0.12);
      }
      .art-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .meta {
        flex: 1;
        min-width: 0;
        margin-right: 8px;
      }
      .title {
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: -0.01em;
      }
      .artist {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.65);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
      }
      .btn {
        background: rgba(255, 255, 255, 0.12);
        border: none;
        color: #fff;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        outline: none;
        transition: transform 0.1s, background 0.1s;
      }
      .btn:active {
        transform: scale(0.9);
        background: rgba(255, 255, 255, 0.25);
      }
      .play-btn {
        background: #ffffff;
        color: #000000;
        width: 32px;
        height: 32px;
      }
    `;
    doc.head.appendChild(style);

    const container = doc.createElement('div');
    container.className = 'island-pill';
    container.id = 'island-container';
    doc.body.appendChild(container);

    this.updateDocumentPipDOM();
  }

  private updateDocumentPipDOM() {
    if (!this.pipWindow || this.pipWindow.closed) return;
    const doc = this.pipWindow.document;
    const container = doc.getElementById('island-container');
    if (!container) return;

    const track = this.state.track;
    const title = track?.title || 'Aura Music';
    const artist = track?.artist || 'Ready to play';
    const artUrl = track ? get4kArtworkUrl(track) : '';

    container.innerHTML = `
      <div style="display:flex; align-items:center; min-width:0; flex:1;">
        <div class="art-wrap">
          <img src="${artUrl}" alt="" />
        </div>
        <div class="meta">
          <div class="title">${title}</div>
          <div class="artist">${artist}</div>
        </div>
      </div>
      <div class="controls">
        <button id="pip-prev" class="btn" title="Previous">⏮</button>
        <button id="pip-play" class="btn play-btn" title="Play/Pause">${this.state.isPlaying ? '⏸' : '▶'}</button>
        <button id="pip-next" class="btn" title="Next">⏭</button>
      </div>
    `;

    doc.getElementById('pip-prev')?.addEventListener('click', () => this.callbacks.onPrev());
    doc.getElementById('pip-play')?.addEventListener('click', () => this.callbacks.onTogglePlay());
    doc.getElementById('pip-next')?.addEventListener('click', () => this.callbacks.onNext());
  }

  // =========================================================================
  // Canvas Stream Video PiP (300px × 80px Floating Web HUD)
  // =========================================================================
  private ensureCanvasVideoElements() {
    if (typeof document === 'undefined') return;

    // Create 300x80 canvas (or 600x160 for high-DPI clarity)
    if (!this.canvasEl) {
      this.canvasEl = document.createElement('canvas');
      this.canvasEl.width = 300;
      this.canvasEl.height = 80;
      this.canvasCtx = this.canvasEl.getContext('2d');
    }

    // Create offscreen video element with autoPictureInPicture
    if (!this.videoEl) {
      this.videoEl = document.createElement('video');
      this.videoEl.muted = true;
      this.videoEl.playsInline = true;
      this.videoEl.autoplay = true;
      (this.videoEl as any).autoPictureInPicture = true;
      this.videoEl.setAttribute('autopictureinpicture', '');
      this.videoEl.setAttribute('playsinline', '');
      this.videoEl.setAttribute('webkit-playsinline', '');
      this.videoEl.style.position = 'fixed';
      this.videoEl.style.width = '1px';
      this.videoEl.style.height = '1px';
      this.videoEl.style.opacity = '0.001';
      this.videoEl.style.pointerEvents = 'none';
      document.body.appendChild(this.videoEl);

      // Render initial frame and hook up stream
      this.renderCanvasFrame();
      const stream = (this.canvasEl as any).captureStream?.(25);
      if (stream) {
        this.videoEl.srcObject = stream;
        this.videoEl.play().catch(() => {});
      }
    }
  }

  private async startCanvasVideoPip(): Promise<boolean> {
    if (typeof document === 'undefined') return false;

    this.ensureCanvasVideoElements();
    if (!this.videoEl || !this.canvasEl) return false;

    // Draw initial frame
    this.renderCanvasFrame();

    if (!this.videoEl.srcObject) {
      const stream = (this.canvasEl as any).captureStream?.(25);
      if (!stream) return false;
      this.videoEl.srcObject = stream;
    }

    try {
      await this.videoEl.play();
    } catch {}

    // Start continuous animation loop
    this.startCanvasLoop();

    // Enter Picture-in-Picture
    await this.videoEl.requestPictureInPicture();
    this.isPipOpen = true;

    this.videoEl.addEventListener('leavepictureinpicture', () => {
      this.isPipOpen = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }, { once: true });

    return true;
  }

  private startCanvasLoop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    const loop = () => {
      this.renderCanvasFrame();
      if (this.isPipOpen) {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private renderCanvasFrame() {
    if (!this.canvasCtx || !this.canvasEl) return;
    const ctx = this.canvasCtx;
    const w = this.canvasEl.width;
    const h = this.canvasEl.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // 1. Draw pitch black island pill (300px × 80px)
    const radius = 24;
    ctx.fillStyle = '#05060b';
    ctx.beginPath();
    ctx.roundRect(3, 3, w - 6, h - 6, radius);
    ctx.fill();

    // 2. Dynamic colored rim border
    ctx.strokeStyle = this.state.primaryColor || '#fa2d48';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Draw 48x48 Album Artwork
    const artSize = 48;
    const artX = 14;
    const artY = (h - artSize) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(artX, artY, artSize, artSize, 12);
    ctx.clip();

    if (this.currentArtworkImg && this.currentArtworkImg.complete) {
      ctx.drawImage(this.currentArtworkImg, artX, artY, artSize, artSize);
    } else {
      ctx.fillStyle = '#181926';
      ctx.fillRect(artX, artY, artSize, artSize);
    }
    ctx.restore();

    // Draw Artwork border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(artX, artY, artSize, artSize, 12);
    ctx.stroke();

    // 4. Track Details
    const textX = artX + artSize + 12;
    const maxTextWidth = w - textX - 60; // 300 - 74 - 60 = 166px

    // Track Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const titleText = this.state.track?.title || 'Aura Music';
    ctx.fillText(titleText, textX, 32, maxTextWidth);

    // Artist
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const artistText = this.state.track?.artist || 'Ready to play';
    ctx.fillText(artistText, textX, 48, maxTextWidth);

    // 5. Scrubber line at the bottom
    const progressPercent = this.state.duration > 0
      ? Math.min(1, Math.max(0, this.state.currentTime / this.state.duration))
      : 0;

    const scrubberY = 56;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(textX, scrubberY, maxTextWidth, 3, 1.5);
    ctx.fill();

    ctx.fillStyle = this.state.primaryColor || '#fa2d48';
    ctx.beginPath();
    ctx.roundRect(textX, scrubberY, maxTextWidth * progressPercent, 3, 1.5);
    ctx.fill();

    // 6. Live animated 5-bar soundbars on the right (300px HUD)
    const barBaseX = w - 46;
    const barBaseY = h / 2 + 10;
    const now = Date.now() / 1000;

    for (let i = 0; i < 5; i++) {
      const barHeight = this.state.isPlaying
        ? Math.sin(now * 8 + i * 1.2) * 10 + 13
        : 4;

      ctx.fillStyle = this.state.primaryColor || '#fa2d48';
      ctx.beginPath();
      ctx.roundRect(barBaseX + i * 7, barBaseY - barHeight, 4, barHeight, 2);
      ctx.fill();
    }
  }
}

export const pipIslandController = new PipIslandController();
