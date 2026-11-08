# Contributing to Aura Music

Thank you for your interest in contributing to **Aura Music**! This document outlines our development workflow, coding standards, and submission guidelines.

---

## Code of Conduct

All contributors and community members are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to project maintainers.

---

## Getting Started

### Prerequisites
* **Node.js:** v20.0.0 or higher
* **npm** or **pnpm**
* **Git**
* *(Optional for Android APK development)* **JDK 17** & **Android Studio** with Android SDK (API 34+)

### Cloning & Setup

```bash
# Clone the repository
git clone https://github.com/vampireanshuman/aura-music.git
cd aura-music

# Install dependencies
npm install

# Setup local environment
cp .env.example .env

# Run local development server
npm run dev
```

The dev server will spin up at `http://localhost:5173`.

---

## Architecture Overview

Aura Music combines a reactive, glassmorphic React frontend with a high-performance Web Audio DSP pipeline and native Android packaging:

* **UI Layer:** React 19, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
* **Audio Engine (`src/utils/audioDSP.ts`):** Web Audio API (`AudioContext`, `BiquadFilterNode`, `AnalyserNode`, `ConvolverNode`) powering the 5-band EQ, AutoEq headphone presets, tube warmth, and vocal reducer.
* **Visualizers (`src/components/AudioVisualizer.tsx`):** 60fps real-time audio canvas visualizers (Smooth Waveform, Frequency Bars, Radial Mandala, VU Peak Meter).
* **Native Mobile (`android/`):** Capacitor Android wrapper delivering native APK builds with background audio and media controls.
* **Recommendation Engine (`src/utils/recommendationEngine.ts`):** Cultural isolation algorithm separating Bollywood/Indian and Western catalog autoplay.

---

## Development Guidelines

### Branching Strategy
* `main` contains the latest stable development code.
* Create feature or bugfix branches from `main` using descriptive naming:
  * `feat/your-feature-name`
  * `fix/issue-description`

### Code Style & Quality
* Write clean, type-safe TypeScript.
* Use semi-translucent glassmorphic backdrops (`backdrop-blur-2xl`) and tight typography tracking (`-0.02em`).
* Never embed hardcoded API keys, tokens, or temporary tunnel URLs in committed code; use `src/utils/apiConfig.ts` and `import.meta.env`.
* Keep components modular and reusable under `src/components/`.

### Verifying Builds Locally

Before submitting code, always ensure the TypeScript build passes cleanly:

```bash
# Production web build
npm run build

# Android synchronization
npm run cap:sync
```

---

## Submitting a Pull Request

1. Fork the repository and create your branch from `main`.
2. Commit your changes with clear, descriptive commit messages.
3. Open a Pull Request targeting the `main` branch.
4. Provide a summary of changes, motivation, and verification steps in the PR description.
5. Participate constructively in code reviews.
