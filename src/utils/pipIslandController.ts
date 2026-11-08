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

    // Update Document PiP DOM if open
    if (this.pipWindow && !this.pipWindow.closed) {
      this.updateDocumentPipDOM();
    }
  }

  private setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (this.autoPipEnabled && this.state.isPlaying && !this.isPipOpen) {
          this.requestPipIsland().catch(() => {});
        }
      }
    });
  }

  public isPipActive(): boolean {
    if (this.pipWindow && !this.pipWindow.closed) return true;
    if (document.pictureInPictureElement) return true;
    return this.isPipOpen;
  }

  /**
   * Request Picture-in-Picture:
   * 1. Try Document Picture-in-Picture API (Chrome/Edge desktop & modern Android)
   * 2. Fallback to Canvas Stream Video PiP (Safari/Firefox/Mobile Chrome)
   */
  public async requestPipIsland(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if already active
    if (this.isPipActive()) return true;

    // Option 1: Document Picture-in-Picture API
    if ('documentPictureInPicture' in window) {
      try {
        const pipWin = await (window as any).documentPictureInPicture.requestWindow({
          width: 360,
          height: 105,
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

    // Option 2: Canvas Stream Video PiP fallback
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

    if (document.pictureInPictureElement) {
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
  // Document Picture-in-Picture API Rendering
  // =========================================================================
  private setupDocumentPipWindow(pipWin: any) {
    const doc = pipWin.document;

    // Inject styles
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
        height: 100vh;
        overflow: hidden;
        user-select: none;
      }
      .island-pill {
        width: 100%;
        height: 100%;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #000000;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 28px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.9);
      }
      .art-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        overflow: hidden;
        margin-right: 10px;
        flex-shrink: 0;
        background: #111;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .art-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .meta {
        flex: 1;
        min-width: 0;
        margin-right: 10px;
      }
      .title {
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
        gap: 6px;
        flex-shrink: 0;
      }
      .btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #fff;
        width: 32px;
        height: 32px;
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
  // Canvas Stream Video PiP (Universal Browser Fallback)
  // =========================================================================
  private async startCanvasVideoPip(): Promise<boolean> {
    if (typeof document === 'undefined') return false;

    // Create offscreen canvas
    if (!this.canvasEl) {
      this.canvasEl = document.createElement('canvas');
      this.canvasEl.width = 480;
      this.canvasEl.height = 120;
      this.canvasCtx = this.canvasEl.getContext('2d');
    }

    // Create offscreen video element
    if (!this.videoEl) {
      this.videoEl = document.createElement('video');
      this.videoEl.muted = true;
      this.videoEl.playsInline = true;
      this.videoEl.autoplay = true;
      this.videoEl.style.position = 'fixed';
      this.videoEl.style.width = '1px';
      this.videoEl.style.height = '1px';
      this.videoEl.style.opacity = '0.001';
      this.videoEl.style.pointerEvents = 'none';
      document.body.appendChild(this.videoEl);
    }

    // Draw initial frame
    this.renderCanvasFrame();

    // Capture canvas stream
    const stream = (this.canvasEl as any).captureStream?.(25);
    if (!stream) return false;

    this.videoEl.srcObject = stream;
    await this.videoEl.play();

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

    // Draw pitch black island pill
    const radius = 34;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(8, 8, w - 16, h - 16, radius);
    ctx.fill();

    // Dynamic colored rim border
    ctx.strokeStyle = this.state.primaryColor || '#fa2d48';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Album Artwork
    const artSize = 64;
    const artX = 24;
    const artY = (h - artSize) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(artX, artY, artSize, artSize, 14);
    ctx.clip();

    if (this.currentArtworkImg && this.currentArtworkImg.complete) {
      ctx.drawImage(this.currentArtworkImg, artX, artY, artSize, artSize);
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(artX, artY, artSize, artSize);
    }
    ctx.restore();

    // Draw Artwork border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(artX, artY, artSize, artSize, 14);
    ctx.stroke();

    // Text details
    const textX = artX + artSize + 16;
    const maxTextWidth = w - textX - 110;

    // Track Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const titleText = this.state.track?.title || 'Aura Music';
    ctx.fillText(titleText, textX, 50, maxTextWidth);

    // Artist
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const artistText = this.state.track?.artist || 'Audiophile Studio Master';
    ctx.fillText(artistText, textX, 74, maxTextWidth);

    // Scrubber line at the bottom
    const progressPercent = this.state.duration > 0
      ? Math.min(1, Math.max(0, this.state.currentTime / this.state.duration))
      : 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(textX, 86, maxTextWidth, 4, 2);
    ctx.fill();

    ctx.fillStyle = this.state.primaryColor || '#fa2d48';
    ctx.beginPath();
    ctx.roundRect(textX, 86, maxTextWidth * progressPercent, 4, 2);
    ctx.fill();

    // Live animated 5-bar soundbars on the right
    const barBaseX = w - 85;
    const barBaseY = h / 2 + 10;
    const now = Date.now() / 1000;

    for (let i = 0; i < 5; i++) {
      const barHeight = this.state.isPlaying
        ? Math.sin(now * 8 + i * 1.2) * 14 + 18
        : 6;

      ctx.fillStyle = this.state.primaryColor || '#fa2d48';
      ctx.beginPath();
      ctx.roundRect(barBaseX + i * 9, barBaseY - barHeight, 5, barHeight, 2.5);
      ctx.fill();
    }
  }
}

export const pipIslandController = new PipIslandController();
