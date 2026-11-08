/**
 * YouTube Audio & Video Engine using official YouTube IFrame API.
 * Provides 100% reliable streaming of any song/video in YouTube Music catalog.
 */

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: any;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

export interface YouTubePlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  videoId: string | null;
}

type StateListener = (state: YouTubePlayerState) => void;
type EndListener = () => void;

class YouTubeAudioEngine {
  private player: any = null;
  private isReady = false;
  private currentVideoId: string | null = null;
  private stateListeners: Set<StateListener> = new Set();
  private endListeners: Set<EndListener> = new Set();
  private timeSyncInterval: number | null = null;
  private pendingVideoId: string | null = null;
  private pendingVolume: number = 0.85;
  private pendingSpeed: number = 1.0;

  constructor() {
    this.setupApiCallback();
  }

  private setupApiCallback() {
    if (typeof window === 'undefined') return;

    const initExisting = () => {
      if (window.YT && window.YT.Player) {
        this.createPlayer();
      }
    };

    if (window.YT && window.YT.Player) {
      setTimeout(initExisting, 100);
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        this.createPlayer();
      };
    }
  }

  public bindToElement(elementId: string) {
    if (this.player) return;
    this.createPlayer(elementId);
  }

  private createPlayer(elementId: string = 'aura-youtube-player-host') {
    if (typeof window === 'undefined' || !window.YT || !window.YT.Player) return;

    const el = document.getElementById(elementId);
    if (!el) {
      setTimeout(() => this.createPlayer(elementId), 200);
      return;
    }

    try {
      this.player = new window.YT.Player(elementId, {
        height: '100%',
        width: '100%',
        videoId: this.pendingVideoId || '3_g2un5M350', // Starboy as warm default
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            this.isReady = true;
            this.setVolume(this.pendingVolume);
            this.setPlaybackRate(this.pendingSpeed);

            if (this.pendingVideoId) {
              this.loadAndPlay(this.pendingVideoId);
              this.pendingVideoId = null;
            }
          },
          onStateChange: (event: any) => {
            this.handleStateChange(event.data);
          },
          onError: (err: any) => {
            console.warn('YouTube Player error:', err);
          }
        }
      });
    } catch (e) {
      console.warn('Failed to initialize YouTube Player:', e);
    }
  }

  private handleStateChange(stateCode: number) {
    const isPlaying = stateCode === 1; // YT.PlayerState.PLAYING
    const isBuffering = stateCode === 3; // YT.PlayerState.BUFFERING
    const isEnded = stateCode === 0; // YT.PlayerState.ENDED

    if (isPlaying) {
      this.startTimeSync();
    } else {
      this.stopTimeSync();
    }

    this.notifyState(isPlaying, isBuffering);

    if (isEnded) {
      this.endListeners.forEach(fn => fn());
    }
  }

  private startTimeSync() {
    this.stopTimeSync();
    this.timeSyncInterval = window.setInterval(() => {
      if (this.player && typeof this.player.getCurrentTime === 'function') {
        const cur = this.player.getCurrentTime() || 0;
        const dur = this.player.getDuration() || 0;
        this.notifyState(true, false, cur, dur);
      }
    }, 250);
  }

  private stopTimeSync() {
    if (this.timeSyncInterval) {
      clearInterval(this.timeSyncInterval);
      this.timeSyncInterval = null;
    }
  }

  private notifyState(isPlaying: boolean, isBuffering: boolean, timeOverride?: number, durOverride?: number) {
    const cur = timeOverride !== undefined ? timeOverride : (this.player?.getCurrentTime?.() || 0);
    const dur = durOverride !== undefined ? durOverride : (this.player?.getDuration?.() || 0);

    const state: YouTubePlayerState = {
      isPlaying,
      isBuffering,
      currentTime: cur,
      duration: dur,
      videoId: this.currentVideoId
    };

    this.stateListeners.forEach(listener => listener(state));
  }

  public loadAndPlay(videoId: string) {
    this.currentVideoId = videoId;
    if (!this.isReady || !this.player || typeof this.player.loadVideoById !== 'function') {
      this.pendingVideoId = videoId;
      return;
    }

    try {
      this.player.loadVideoById(videoId);
      this.player.playVideo();
    } catch (e) {
      console.warn('Error loading video in YT Player:', e);
    }
  }

  public play() {
    if (this.player && typeof this.player.playVideo === 'function') {
      this.player.playVideo();
    }
  }

  public pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
    }
  }

  public stop() {
    this.stopTimeSync();
    if (this.player && typeof this.player.stopVideo === 'function') {
      try {
        this.player.stopVideo();
      } catch {
        // ignore
      }
    }
  }

  public seekTo(seconds: number) {
    if (this.player && typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
    }
  }

  public setVolume(vol: number) {
    this.pendingVolume = vol;
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(Math.round(vol * 100));
    }
  }

  public setPlaybackRate(rate: number) {
    this.pendingSpeed = rate;
    if (this.player && typeof this.player.setPlaybackRate === 'function') {
      this.player.setPlaybackRate(rate);
    }
  }

  public getCurrentTime(): number {
    return this.player?.getCurrentTime?.() || 0;
  }

  public getDuration(): number {
    return this.player?.getDuration?.() || 0;
  }

  public onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onEnded(listener: EndListener): () => void {
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }
}

export const youtubeEngine = new YouTubeAudioEngine();
