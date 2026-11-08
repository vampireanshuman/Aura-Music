import type { Track } from '../types/music';
import { INITIAL_TRACKS } from '../data/catalog';

export interface MoodCategory {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  gradient: string;
  keywords: string[];
}

export const MOOD_CATEGORIES: MoodCategory[] = [
  {
    id: 'all',
    name: 'All Vibes',
    emoji: '✨',
    tagline: 'Complete Personalized Soundscape',
    gradient: 'from-purple-600 to-indigo-600',
    keywords: [],
  },
  {
    id: 'bollywood',
    name: 'Bollywood & Desi',
    emoji: '🪕',
    tagline: 'Soulful Hindi melodies, romantic acoustic & Bollywood anthems',
    gradient: 'from-amber-500 to-rose-600',
    keywords: ['bollywood', 'hindi', 'arijit', 'pritam', 'shreya', 'atif', 'jubin', 'vishal', 'sachin', 'desi', 'romantic'],
  },
  {
    id: 'punjabi',
    name: 'Punjabi Wave',
    emoji: '🔥',
    tagline: 'Driving bass, high-octane flow & UK Bhangra energy',
    gradient: 'from-orange-500 to-red-600',
    keywords: ['punjabi', 'diljit', 'karan', 'sidhu', 'shubh', 'dhillon', 'bhangra'],
  },
  {
    id: 'chill',
    name: 'Chill & Relax',
    emoji: '☕',
    tagline: 'Warm acoustic, dreamy synth & mellow downtempo',
    gradient: 'from-sky-500 to-teal-500',
    keywords: ['lo-fi', 'chill', 'acoustic', 'ambient', 'dreamy', 'downtempo', 'mellow', 'soft', 'r&b'],
  },
  {
    id: 'energy',
    name: 'High Energy & Workout',
    emoji: '⚡',
    tagline: 'Driving basslines, electronic pulses & high-tempo beats',
    gradient: 'from-rose-500 to-amber-600',
    keywords: ['dance', 'electronic', 'edm', 'synthpop', 'workout', 'bass', 'beat', 'upbeat', 'trap', 'remix'],
  },
  {
    id: 'romance',
    name: 'Acoustic & Romance',
    emoji: '❤️',
    tagline: 'Heartfelt vocals, gentle chords & intimate melodies',
    gradient: 'from-rose-500 to-pink-600',
    keywords: ['romance', 'love', 'acoustic', 'guitar', 'ballad', 'vocal', 'slow'],
  },
];

// Indic scripts: Devanagari, Gurmukhi, Bengali, Tamil, Telugu, Malayalam, Kannada
const INDIC_SCRIPT_REGEX = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0B80-\u0D7F]/;
const GURMUKHI_SCRIPT_REGEX = /[\u0A00-\u0A7F]/;

// High-precision comprehensive regex for Bollywood & Hindi cultural music
const BOLLYWOOD_REGEX = /\b(arijit|pritam|shreya|atif|mohit|jubin|vishal|shekhar|sachin|jigar|amitabh|bhattacharya|kishore|lata|mukesh|alka|udit|kumar\s*sanu|sonu\s*nigam|rahman|badshah|neha|kakkar|armaan|amaal|darshan|anuv|jasleen|sachet|parampara|t-series|bollywood|hindi|filmi|sufi|desi|qawwali|kesariya|channa|tum\s*hi\s*ho|apna\s*bana|pehle\s*bhi|raataan|kabira|shayad|agar\s*tum|tere\s*hawaale|bhediya|aashiqui|brahmastra|jawan|animal|kalank|gehraiyaan|rockstar|sunidhi|mithoon|kk|papon|shaan|himesh|reshamiya|b\s*praak|jasleen\s*royal|shilpa\s*rao|kanika\s*kapoor|mika\s*singh|daler\s*mehndi|ankit\s*tiwari|tulsi\s*kumar|palak\s*muchhal|stebin\s*ben|king|yo\s*yo|honey\s*singh|raftaar|divine|emiway|seedhe\s*maut|krsna|prateek\s*kuhad|when\s*chai\s*met\s*toast|local\s*train|lucky\s*ali|jagjit|pankaj|nusrat|rahat|ali\s*zafar|shafqat|sanam|salim|sulaiman|shankar|ehsaan|loy|anurag\s*saikia|zaeden|tanishk\s*bagchi|rochak\s*kohli|meet\s*bros|zee\s*music|sony\s*music\s*india|yrf|yash\s*raj|tips|saregama|eros|chaleya|satranga|tu\s*hai\s*kahan|saibo|ilahi|hawayein|gerua|kal\s*ho\s*naa|sajni|o\s*maahi|ve\s*kamleya|teri\s*baaton|naina|lut\s*gaye|dilbar|gaddi|dhol|pyaar|ishq|mohobbat|dil|jaan|saajana|humdum|sanam|bewafa|rabba|khuda|duaa|mast|yaara|akhiyaan|chitta)\b/i;

const PUNJABI_REGEX = /\b(diljit|dosanjh|karan\s*aujla|sidhu|moose\s*wala|shubh|dhillon|ap\s*dhillon|amrinder|gurdas|hardy|guru\s*randhawa|jass|punjabi|bhangra|lover|softly|winning\s*speech|born\s*to\s*shine|brown\s*munde|b\s*praak|jaani|mankirt|amrit\s*maan|jordan\s*sandhu|prem\s*dhillon|arjan\s*dhillon|tarsem\s*jassar|babbu\s*maan|garry\s*sandhu|kulwinder|prabh\s*gill|nimrat|sunanda|jasmine\s*sandlas|baani\s*sandhu|hustinder|jatt|pind|yaari|boliyan|kudi|gabbroo)\b/i;

const KPOP_REGEX = /\b(bts|blackpink|newjeans|stray\s*kids|twice|seventeen|exo|txt|ateez|k-pop|kpop|jungkook|jimin)\b/i;
const EDM_REGEX = /\b(alan\s*walker|alok|avicii|marshmello|calvin\s*harris|david\s*guetta|martin\s*garrix|chainsmokers|kygo|edm|electronic|house|techno|dj)\b/i;
const ROCK_REGEX = /\b(coldplay|linkin\s*park|imagine\s*dragons|queen|nirvana|radiohead|green\s*day|metallica|ac\/dc|rock|alternative|indie\s*rock)\b/i;

export type MusicCluster = 'bollywood' | 'punjabi' | 'kpop' | 'edm' | 'rock' | 'western-pop' | 'general';

export function detectMusicCluster(track?: Track | null): MusicCluster {
  if (!track) return 'general';
  const text = `${track.title} ${track.artist} ${track.genre || ''} ${track.album || ''}`.toLowerCase();

  // 1. Script checks
  if (GURMUKHI_SCRIPT_REGEX.test(text)) return 'punjabi';
  if (PUNJABI_REGEX.test(text)) return 'punjabi';
  if (INDIC_SCRIPT_REGEX.test(text)) return 'bollywood';
  if (BOLLYWOOD_REGEX.test(text)) return 'bollywood';

  // 2. Specific Western & Global Genres
  if (KPOP_REGEX.test(text)) return 'kpop';
  if (EDM_REGEX.test(text)) return 'edm';
  if (ROCK_REGEX.test(text)) return 'rock';

  return 'western-pop';
}

/**
 * Calculates a multidimensional acoustic similarity score between two tracks (0.0 to 1.0)
 * Strictly separates musical cultures so Bollywood never gets matched with Hollywood sad tracks.
 */
export function calculateTrackSimilarity(t1: Track, t2: Track): number {
  if (t1.id === t2.id) return 1.0;

  const c1 = detectMusicCluster(t1);
  const c2 = detectMusicCluster(t2);

  // STRICT RULE: If tracks belong to fundamentally incompatible cultures, similarity is 0!
  // e.g. Bollywood / Hindi will NEVER match Western Pop/Sad songs (Billie Eilish, etc.)
  if (c1 !== c2) {
    if ((c1 === 'bollywood' && c2 !== 'bollywood') || (c2 === 'bollywood' && c1 !== 'bollywood')) {
      return 0.0;
    }
    if ((c1 === 'punjabi' && c2 !== 'punjabi') || (c2 === 'punjabi' && c1 !== 'punjabi')) {
      return 0.0;
    }
    if ((c1 === 'kpop' && c2 !== 'kpop') || (c2 === 'kpop' && c1 !== 'kpop')) {
      return 0.0;
    }
  }

  let score = 0.35; // Base affinity for sharing the same musical universe

  // 1. Same Artist match (+0.45 boost)
  const a1 = t1.artist.toLowerCase();
  const a2 = t2.artist.toLowerCase();
  if (a1 === a2) {
    score += 0.45;
  } else if (a1.includes(a2) || a2.includes(a1)) {
    score += 0.30;
  }

  // 2. Genre / Sub-genre Match (+0.20)
  if (t1.genre && t2.genre) {
    const g1 = t1.genre.toLowerCase();
    const g2 = t2.genre.toLowerCase();
    if (g1 === g2) {
      score += 0.20;
    } else {
      const g1Parts = g1.split(/[\/\s,&-]+/).filter(Boolean);
      const g2Parts = g2.split(/[\/\s,&-]+/).filter(Boolean);
      const overlap = g1Parts.some((p) => g2Parts.includes(p));
      if (overlap) score += 0.12;
    }
  }

  // 3. Similar song duration
  if (t1.duration && t2.duration) {
    const diff = Math.abs(t1.duration - t2.duration);
    if (diff < 40) score += 0.08;
  }

  return Math.min(1.0, score);
}

/**
 * Filter tracks by mood keyword
 */
export function filterTracksByMood(tracks: Track[], moodId: string): Track[] {
  if (moodId === 'all') return tracks;
  const category = MOOD_CATEGORIES.find((m) => m.id === moodId);
  if (!category || category.keywords.length === 0) return tracks;

  return tracks.filter((track) => {
    const text = `${track.title} ${track.artist} ${track.genre || ''} ${track.album || ''}`.toLowerCase();
    return category.keywords.some((k) => text.includes(k));
  });
}

/**
 * Generates culturally and musically coherent recommendations
 */
export function generatePersonalizedRecommendations(params: {
  allTracks: Track[];
  recentlyPlayed: Track[];
  favorites: string[];
  currentTrack: Track | null;
  limit?: number;
}): {
  discoverWeekly: Track[];
  becauseYouListened: { seedTrack: Track; recommendations: Track[] } | null;
  dailyMixes: { id: string; title: string; subtitle: string; color: string; tracks: Track[] }[];
} {
  const { allTracks, recentlyPlayed, favorites, currentTrack, limit = 12 } = params;

  if (!allTracks || allTracks.length === 0) {
    return { discoverWeekly: [], becauseYouListened: null, dailyMixes: [] };
  }

  const seedTrack = currentTrack || recentlyPlayed[0] || allTracks[0];
  const seedCluster = detectMusicCluster(seedTrack);

  // 1. "Because You Listened To [Seed]"
  // Strictly filtered to the seed's musical cluster
  let becauseYouListened: { seedTrack: Track; recommendations: Track[] } | null = null;
  if (seedTrack) {
    const similar = allTracks
      .filter((t) => t.id !== seedTrack.id)
      .map((t) => ({ track: t, similarity: calculateTrackSimilarity(seedTrack, t) }))
      .filter((item) => item.similarity > 0.1) // Only culturally compatible tracks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 8)
      .map((item) => item.track);

    if (similar.length > 0) {
      becauseYouListened = {
        seedTrack,
        recommendations: similar,
      };
    }
  }

  // 2. Discover Weekly: Ranked by affinity to user's active cluster
  // Strictly prohibits incompatible cultural cross-pollination
  const scoredTracks = allTracks.map((track) => {
    let score = 0;
    const trackCluster = detectMusicCluster(track);

    // Hard separation rule: incompatible cultures must NEVER cross-pollinate
    if (seedCluster === 'bollywood' && trackCluster !== 'bollywood') {
      return { track, score: -1000 };
    }
    if (seedCluster === 'punjabi' && trackCluster !== 'punjabi') {
      return { track, score: -1000 };
    }
    if (seedCluster === 'western-pop' && (trackCluster === 'bollywood' || trackCluster === 'punjabi')) {
      return { track, score: -1000 };
    }
    if (seedCluster === 'kpop' && trackCluster !== 'kpop') {
      return { track, score: -1000 };
    }

    // Boost if matching the user's active listening cluster
    if (trackCluster === seedCluster) score += 5.0;
    if (track.id !== seedTrack?.id) score += calculateTrackSimilarity(seedTrack, track) * 4.0;
    if (favorites.includes(track.id)) score += 2.0;

    return { track, score };
  });

  const compatibleTracks = scoredTracks.filter((item) => item.score > 0);
  compatibleTracks.sort((a, b) => b.score - a.score);
  const discoverWeekly = compatibleTracks.map((item) => item.track).slice(0, limit);

  // 3. Algorithmic Daily Mixes: Dedicated culturally distinct soundscapes
  const bollywoodTracks = allTracks.filter((t) => detectMusicCluster(t) === 'bollywood');
  const punjabiTracks = allTracks.filter((t) => detectMusicCluster(t) === 'punjabi');
  const popRnbTracks = allTracks.filter((t) => detectMusicCluster(t) === 'western-pop');
  const otherTracks = allTracks.filter((t) => !['bollywood', 'punjabi', 'western-pop'].includes(detectMusicCluster(t)));

  const dailyMixes = [
    {
      id: 'mix-bollywood',
      title: 'Daily Mix 1: Bollywood Romance & Melodies',
      subtitle: 'Arijit Singh, Pritam, Shreya Ghoshal & soulful acoustics',
      color: 'from-amber-600/30 to-rose-600/30',
      tracks: bollywoodTracks.slice(0, 8),
    },
    {
      id: 'mix-punjabi',
      title: 'Daily Mix 2: Punjabi Hits & Bhangra Waves',
      subtitle: 'Diljit Dosanjh, Karan Aujla & high-energy anthems',
      color: 'from-orange-600/30 to-red-600/30',
      tracks: punjabiTracks.slice(0, 8),
    },
    {
      id: 'mix-pop',
      title: 'Daily Mix 3: Global Synth & Chart Toppers',
      subtitle: 'The Weeknd, Sabrina Carpenter, Billie Eilish & modern R&B',
      color: 'from-purple-600/30 to-indigo-600/30',
      tracks: popRnbTracks.slice(0, 8),
    },
    {
      id: 'mix-indie',
      title: 'Daily Mix 4: Alternative & Baroque Classics',
      subtitle: 'Coldplay, orchestral spatial audio & melodic rock',
      color: 'from-cyan-600/30 to-emerald-600/30',
      tracks: otherTracks.slice(0, 8),
    },
  ].filter((m) => m.tracks.length > 0);

  return { discoverWeekly, becauseYouListened, dailyMixes };
}

/**
 * Smart Autoplay helper: picks the next track in the exact same musical universe
 * Supports both (currentTrack, candidates) and ({ currentTrack, allTracks, recentlyPlayed })
 */
export function getSmartAutoplayTrack(
  param1: Track | { currentTrack: Track; allTracks?: Track[]; candidates?: Track[]; recentlyPlayed?: Track[] },
  param2?: Track[]
): Track | null {
  let currentTrack: Track;
  let candidates: Track[];

  if (param1 && typeof param1 === 'object' && 'currentTrack' in param1) {
    currentTrack = param1.currentTrack;
    candidates = param1.allTracks || param1.candidates || [];
  } else {
    currentTrack = param1 as Track;
    candidates = param2 || [];
  }

  if (!candidates || candidates.length === 0) return null;

  const validCandidates = candidates.filter((c) => c.id !== currentTrack.id);
  const currentCluster = detectMusicCluster(currentTrack);

  // Score candidates with cultural coherence
  const scored = validCandidates
    .map((c) => ({
      track: c,
      score: calculateTrackSimilarity(currentTrack, c),
    }))
    .filter((item) => item.score > 0); // Strictly eliminate any incompatible cultures (score 0.0)

  scored.sort((a, b) => b.score - a.score);

  // If best score is > 0.15 (compatible), pick top candidate
  if (scored[0] && scored[0].score > 0.15) {
    return scored[0].track;
  }

  // Filter candidates with the exact same cluster
  const sameCluster = validCandidates.filter((c) => detectMusicCluster(c) === currentCluster);
  if (sameCluster.length > 0) {
    return sameCluster[Math.floor(Math.random() * sameCluster.length)];
  }

  // Cultural Fallback: If no candidate in the current queue matches this culture,
  // consult INITIAL_TRACKS to guarantee we stay in the exact same cultural universe!
  const catalogMatches = INITIAL_TRACKS.filter(
    (c: Track) => c.id !== currentTrack.id && detectMusicCluster(c) === currentCluster
  );
  if (catalogMatches.length > 0) {
    return catalogMatches[Math.floor(Math.random() * catalogMatches.length)];
  }

  // Only if there is zero cultural alternative anywhere, return first valid candidate
  return validCandidates[0] || null;
}
