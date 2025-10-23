// musicHelpers.js
// My collection of music-related utility functions built over several projects
// Last updated: Oct 19, 2025 - Added new genre detection logic

/**
 * Analyzes audio features to detect the musical key
 * Basic implementation - would need a proper DSP library for accuracy
 * Based on techniques I learned in my audio engineering courses
 */
export const detectMusicalKey = (features) => {
  // This is a simplified version - real key detection uses FFT analysis
  if (!features) return 'Unknown';
  
  const keys = [
    'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 
    'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'
  ];
  
  // Deezer actually provides key data on some tracks
  if (features.key !== undefined) {
    return keys[features.key];
  }
  
  // Fallback if no key info provided
  return 'Unknown';
};

/**
 * Format milliseconds into a human-readable track time
 * Different from other formatters because it handles longer durations correctly
 */
export const formatTrackTime = (ms, showHours = false) => {
  if (!ms || isNaN(ms)) return '0:00';
  
  // Convert to seconds
  const totalSeconds = Math.floor(ms / 1000);
  
  // Extract hours, minutes and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Format based on duration
  if (showHours || hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Helper to categorize music by energy level
 * Useful for workout playlists and DJ sets
 * This is based on my own categorization system I use when DJing
 */
export const getEnergyLevel = (bpm, loudness) => {
  if (!bpm) return 'medium';
  
  // BPM is the main factor
  if (bpm < 80) return 'low';
  if (bpm > 130) return 'high';
  
  // Loudness affects perceived energy
  if (loudness && loudness < -12) return 'low';
  if (loudness && loudness > -8) return 'high';
  
  return 'medium';
};

/**
 * Check if a track is radio-friendly (no explicit content, reasonable length)
 * This is from my time helping college radio DJs find FCC-compliant tracks
 */
export const isRadioFriendly = (track) => {
  if (!track) return false;
  
  // Explicit content check (most important for radio)
  if (track.explicit) return false;
  
  // Track length check (most radio stations prefer 2-5 minute tracks)
  const durationInMin = (track.duration || 0) / 60;
  if (durationInMin < 1 || durationInMin > 5.5) return false;
  
  return true;
};

/**
 * Basic music theory helper - get related keys
 * These are the ones I always forget when mixing
 */
export const getRelatedKeys = (key) => {
  const keyMap = {
    'C': ['Am', 'F', 'G'],
    'G': ['Em', 'C', 'D'],
    'D': ['Bm', 'G', 'A'],
    'A': ['F#m', 'D', 'E'],
    'E': ['C#m', 'A', 'B'],
    'B': ['G#m', 'E', 'F#'],
    'F#': ['D#m', 'B', 'C#'],
    'C#': ['A#m', 'F#', 'G#'],
    'F': ['Dm', 'Bb', 'C'],
    'Bb': ['Gm', 'Eb', 'F'],
    'Eb': ['Cm', 'Ab', 'Bb'],
    'Ab': ['Fm', 'Db', 'Eb'],
    // Could add minor keys too but this covers the basics
  };
  
  return keyMap[key] || [];
};

// There's a bug in browsers that causes audio to stutter when too many
// events fire at once. This debounce function helps prevent that.
// Had to debug this for 2 days on my last project - not fun!
export const debounceAudioEvent = (func, wait) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

// TODO: Add support for camelot wheel mixing notation
// Will need to map standard keys to the 12 positions & 2 modes

// I want to add beat detection next for auto DJ transitions
// Need to research how to do this efficiently in JavaScript

/**
 * Matches songs that would mix well together
 * Basic version of what I'm building for my DJ app
 */
export const findCompatibleTracks = (sourceTracks, targetTrack) => {
  if (!targetTrack || !sourceTracks?.length) return [];
  
  const targetBpm = targetTrack.bpm || 0;
  const targetKey = targetTrack.key || -1;
  
  // Songs within 5% BPM range and same/related key are good candidates
  return sourceTracks.filter(track => {
    const bpmMatch = Math.abs(track.bpm - targetBpm) / targetBpm < 0.05;
    const keyMatch = track.key === targetKey || 
                    track.key === (targetKey + 7) % 12 || // Fifth
                    track.key === (targetKey + 5) % 12;   // Fourth
    
    return bpmMatch && keyMatch;
  });
};

export default {
  detectMusicalKey,
  formatTrackTime,
  getEnergyLevel,
  isRadioFriendly,
  getRelatedKeys,
  debounceAudioEvent,
  findCompatibleTracks
};
