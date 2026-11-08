<div align="center">

<img src="docs/banner.png" alt="Aura Music Banner" width="100%" style="border-radius: 16px;" />

<h1>Aura Music</h1>

**Ultra-modern, glassmorphic music streaming client with Liquid Glass UI, ALAC 24-Bit / 192kHz audiophile pipeline, multi-mode real-time audio visualizers, and collaborative Jam Rooms.**

<br/>

<p align="center">
  <a href="https://github.com/vampireanshuman/aura-music/releases"><img src="https://img.shields.io/github/v/release/vampireanshuman/aura-music?style=for-the-badge&color=fa2d48&label=Release" alt="Release Version" /></a>
  &nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue.svg?style=for-the-badge" alt="License GPL-3.0" /></a>
  &nbsp;
  <a href="https://github.com/vampireanshuman/aura-music/releases"><img src="https://img.shields.io/badge/Platform-Android%20APK-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android APK" /></a>
  &nbsp;
  <a href="https://charity-myers-connectivity-fifth.trycloudflare.com"><img src="https://img.shields.io/badge/Live-Web%20App%20(PWA)-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Live Web App" /></a>
</p>

</div>

---

## Overview

**Aura Music** is a high-fidelity, open-source streaming audio player crafted with an Apple Music & Spotify-inspired **Liquid Glass UI**, an **ALAC 24-Bit / 192kHz** audiophile playback pipeline, and hardware-accelerated **Web Audio DSP**. 

Engineered for music enthusiasts who demand uncompromising visual aesthetics and studio-grade sound quality, Aura Music combines real-time frequency-reactive visualizers (Wave, Bars, Radial Mandala, VU Meter), curated atmospheric mood soundscapes, collaborative synchronized **Jam Rooms**, and millisecond-accurate time-synced karaoke lyrics powered by LRCLIB.

---

## Features

<table>
  <tr>
    <td width="50%" valign="top">

#### Playback
- **Infinite Catalog Streaming:** High-performance streaming of songs, albums, and video masters via YouTube Music and Spotify URL resolver.
- **Background & Native Controls:** Full integration with the OS Media Session API (`navigator.mediaSession`) and Android foreground audio service.
- **Smart Queue & History:** Dynamic Up Next drawer with drag-and-drop reordering, history caching, and auto-queue creation.
- **Offline & Local Audio:** In-browser ID3 tag parser for local `.flac`, `.mp3`, `.wav`, and `.m4a` files with zero server uploading.
- **Skip Silence & Sleep Timer:** Intelligent pause triggers and seamless gapless playback transitions.

</td>
    <td width="50%" valign="top">

#### Audio & Visualizers
- **ALAC 24-Bit / 192kHz Pipeline:** Hardware-accelerated studio master audio reproduction with wide dynamic range.
- **4 Real-Time Visualizer Modes:** Tap-to-cycle between:
  - *Smooth Neon Waveform:* Anti-aliased fluid Bézier oscillo-waves.
  - *Frequency Spectrum Bars:* Reactive rhythmic spectrum analysis.
  - *Radial Pulse Mandala:* 360° circular reactive aura.
  - *Studio VU Peak Meter:* Calibrated dual-channel dB indicators.
- **5-Band Parametric Hardware EQ:** Studio presets (`Flat`, `Bass Booster`, `Electronic`, `Acoustic`, `Vocal Booster`, `Rock`).
- **AutoEq Headphone Profiles:** Calibrated compensation curves for hundreds of audiophile headphones.
- **Analog Tube Warmth & Spatializer:** Analog valve harmonic saturation and 3D room impulse convolution.
- **Vocal Reduction (Karaoke Mode):** Center-channel vocal suppression for instrumental accompaniment.

</td>
  </tr>
  <tr>
    <td width="50%" valign="top">

#### Discovery & Moods
- **Curated Mood Soundscapes:** Instant ambient audio stations across Lo-Fi, Synthwave, Chillstep, French House, and Neoclassical.
- **Cultural Separation Engine:** Intelligent Unicode script and regex clustering (`Devanagari`, `Gurmukhi`, etc.) guarantees Indian/Bollywood tracks and Western songs never cross-contaminate auto-recommendations.
- **Smart Autoplay:** Contextual track chaining maintaining harmonic key, era, and tempo when the queue concludes.
- **Instant Search:** Instant responsive queries across tracks, artists, and live radio stations.

</td>
    <td width="50%" valign="top">

#### Social (Jam Room)
- **Live Jam Rooms:** Collaborative synchronized listening rooms with synchronized playback queues and shared playheads.
- **Synchronized Karaoke Lyrics:** Millisecond-accurate synced lyrics via LRCLIB with auto-scrolling and click-to-seek playback jump.
- **Interactive Confetti & Reactions:** Celebrate musical drops and mark favorites with spring physics and mobile haptic feedback.
- **Lyric Quote Cards:** Generate aesthetic, shareable lyric snippet cards with artist attribution and album cover backdrop.

</td>
  </tr>
  <tr>
    <td colspan="2" valign="top">

#### Interface
- **Liquid Glass UI:** Semi-translucent frosted glass sheets (`backdrop-filter: blur(28px) saturate(180%)`) with specular inner rim lights (`1px solid rgba(255, 255, 255, 0.08)`).
- **Atmospheric Evolving Mesh:** Multi-node fluid gradient canvas utilizing deep indigo, violet, and dynamic track accent hues blurred to 120px.
- **True 1:1 Record Sleeves:** Center-crop artwork scaling (`scale(1.08)`) with color-matching ambient shadow backlights, completely eliminating 16:9 YouTube video letterboxing.
- **Hovering Floating Dock:** Dynamic Island-style bottom player hovering smoothly above content with a 4px razor-thin glowing progress scrubber.

</td>
  </tr>
</table>

---

## Getting Started

### Installation

| Channel | Source | Compatibility |
| :--- | :--- | :--- |
| **Stable APK Release** | [GitHub Releases](https://github.com/vampireanshuman/aura-music/releases) | Recommended for Android 8.0+ (API 26+) |
| **Nightly Builds** | [GitHub Actions](https://github.com/vampireanshuman/aura-music/actions) | Latest automated builds with bleeding-edge features |
| **Web App (PWA)** | [Launch Web App](https://charity-myers-connectivity-fifth.trycloudflare.com) | Instant browser & iOS/Desktop access |

### Quick Setup

1. **Install the APK** on your Android device (or launch the Web App directly in Chrome/Safari/Firefox).
2. *(Optional)* Navigate to **Settings → Audio & Equalizer** to:
   - Select your headphone model under **AutoEq Presets** for calibrated frequency tuning.
   - Adjust **Spatial Audio Room** and **Analog Tube Warmth** levels.
3. Tap on any curated track or search for an artist, sit back, and enjoy the visualizer and synced lyrics!

---

## Building from Source

### Prerequisites
- **Node.js:** v20.0.0 or higher
- **JDK:** OpenJDK 17 or higher
- **Android SDK:** API Level 34+ with Android Build Tools (for native APK builds)

### Build Instructions

```bash
# 1. Clone the repository
git clone https://github.com/vampireanshuman/aura-music.git
cd aura-music

# 2. Install dependencies
npm install

# 3. Configure local environment
cp .env.example .env

# 4. Build the Web production bundle
npm run build

# 5. Sync web bundle into native Capacitor Android layer
npx cap sync android

# 6. Build the Android Release APK
cd android
./gradlew assembleRelease

# The generated APK will be located at:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

> [!TIP]
> For live development with Hot Module Replacement (HMR), run `npm run dev` and open `http://localhost:5173`.

---

## Support the Project

If Aura Music has enriched your daily music listening, consider supporting ongoing development:

<div align="center">
  <table style="margin: 0 auto; border-collapse: collapse; border: none;">
    <tr>
      <td align="center" style="padding: 12px; border: none;">
        <a href="https://buymeacoffee.com/vampireanshuman" target="_blank" style="text-decoration:none;">
          <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
        </a>
      </td>
      <td align="center" style="padding: 12px; border: none;">
        <a href="https://buymeachai.ezee.li/vampireanshuman" target="_blank" style="text-decoration:none;">
          <img src="https://img.shields.io/badge/UPI-Buy_Me_A_Chai-FFA500?style=for-the-badge&logo=coffeescript&logoColor=white" alt="UPI (Buy Me A Chai)" />
        </a>
      </td>
      <td align="center" style="padding: 12px; border: none;">
        <a href="https://github.com/sponsors/vampireanshuman" target="_blank" style="text-decoration:none;">
          <img src="https://img.shields.io/badge/GitHub_Sponsors-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white" alt="GitHub Sponsors" />
        </a>
      </td>
    </tr>
  </table>
</div>

---

## Acknowledgements

Aura Music is proudly powered and inspired by these incredible open-source projects:

- **[LastWave-native](https://github.com/Clash-Projects/LastWave-native) & [SimpMusic](https://github.com/maxrave-dev/SimpMusic)** — Liquid Glass UI design, audiophile audio pipeline, and community layout inspiration
- **[InnerTube / Metrolist](https://github.com/MetrolistGroup/Metrolist)** — YouTube Music stream resolving and media catalog extraction
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** — Hardware `BiquadFilterNode`, `AnalyserNode`, and `ConvolverNode` audio processing
- **[Capacitor](https://capacitorjs.com/)** — Cross-platform native Android runtime and bridge
- **[AutoEQ](https://github.com/jaakkopasanen/AutoEq)** — Headphone and IEM frequency calibration targets
- **[LRCLIB](https://lrclib.net/)** — Real-time millisecond-synchronized lyrics database
- **[Lucide Icons](https://lucide.dev/)** — Clean, consistent vector iconography

---

## Disclaimer

Aura Music is an open-source, non-commercial application developed strictly for educational and research purposes.

- **No Affiliation:** This project is not affiliated with, funded, authorized, endorsed by, or in any way associated with Google LLC, YouTube, YouTube Music, Spotify, Apple Inc., or any of their subsidiaries.
- **Content Delivery:** Aura Music does not host, store on private servers, or distribute copyrighted media. All playback streams and metadata are resolved directly from public endpoints.
- **Trademarks:** All product names, logos, trademarks, and registered trademarks belong to their respective owners.
