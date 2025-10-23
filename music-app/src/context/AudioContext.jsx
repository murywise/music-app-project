import React, { createContext, useState, useRef, useEffect, useCallback } from 'react';

// Written: Sept 15, 2025
// Last major update: Oct 18, 2025
// Author: Me (obviously)
// 
// This is my third attempt at a good audio context system
// The first version used Web Audio API but it was overkill
// The second version had memory leaks when switching tracks quickly
// This version is simpler and seems to work better across browsers

// TODO: Add support for full playlist management
// TODO: Add crossfade between tracks (8-beat auto crossfade would be nice)
// TODO: Fix the Safari volume bug (volume resets on iOS sometimes)

// Platform-specific workarounds I've collected over time
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Safari needs special handling for audio
// Learned this the hard way after many bug reports
const createAudioElement = () => {
  const audio = new Audio();
  
  // Safari requires these extra properties
  if (isSafari || isIOS) {
    audio.preload = 'auto';
    audio.controls = false;
  }
  
  return audio;
};

export const AudioContext = createContext();

// The rate at which we update the UI during playback - 250ms feels responsive without being CPU heavy
const UI_UPDATE_INTERVAL = 250;

export const AudioProvider = ({ children }) => {
  // Track state
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);  // 0-100 percentage
  const [volume, setVolume] = useState(isIOS ? 1.0 : 0.7);  // iOS ignores volume settings anyway
  const [duration, setDuration] = useState(0);  // seconds
  const [currentTime, setCurrentTime] = useState(0);  // seconds
  
  // Playback history - might use this for "recently played" later
  const [songHistory, setSongHistory] = useState([]);
  
  // Audio object - using my special wrapper for Safari compatibility
  const audioRef = useRef(createAudioElement());
  
  // Optimization - only update UI every UI_UPDATE_INTERVAL ms
  // (This prevents excessive React renders during playback)
  const lastUpdateRef = useRef(0);
  
  // Initialize audio settings & event listeners
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    
    // This is my throttled time update handler to prevent excessive renders
    // Standard timeupdate events fire way too often (like 5-10x per second)
    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > UI_UPDATE_INTERVAL) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
        lastUpdateRef.current = now;
      }
    };
    
    // Called when audio metadata is loaded (duration, etc)
    // This is unreliable on some browsers (especially mobile Safari) 
    // but it's the best we can do without server-side duration data
    const handleLoadedMetadata = () => {
      // Hack for Safari - sometimes duration is Infinity initially
      const audioDuration = isFinite(audio.duration) ? audio.duration : 30;
      setDuration(audioDuration);
    };
    
    // Called when a track finishes playing
    // Could expand this to auto-play next track in a playlist
    const handleEnded = () => {
      console.log('Track ended:', currentSong?.title);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      
      // TODO: Auto-play next track logic would go here
    };
    
    // Annoying Safari bug where playback sometimes just stops
    // This is my hacky fix after hours of debugging
    const handleStalled = () => {
      if (isPlaying && audio.currentTime > 0) {
        console.log('Playback stalled, attempting recovery...');
        audio.currentTime = audio.currentTime; // Force a refresh
        audio.play().catch(err => console.warn('Recovery failed:', err));
      }
    };
    
    // Add event listeners - doing it all in one effect for cleanliness
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('stalled', handleStalled);
    
    // Cleanup - always remove listeners!
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('stalled', handleStalled);
    };
  }, [volume, isPlaying, currentSong]);
  
  // Track playback - this is my most-used function in the app
  // I've rewritten this so many times to handle edge cases
  const playSong = useCallback((song) => {
    try {
      // Handle missing song data gracefully
      if (!song) {
        console.warn('playSong called with null/undefined song');
        return;
      }
      
      // Handle missing preview URL (Deezer API sometimes returns tracks without previews)
      if (!song.preview) {
        console.warn(`Song "${song.title}" has no preview URL`);
        return;
      }
      
      const audio = audioRef.current;
      const isNewSong = !currentSong || currentSong.id !== song.id;
      
      if (isNewSong) {
        // Save previous song to history
        if (currentSong) {
          setSongHistory(prev => {
            // Keep only last 10 songs in history
            const newHistory = [currentSong, ...prev.slice(0, 9)];
            // Remove duplicates
            return newHistory.filter(
              (s, i) => newHistory.findIndex(h => h.id === s.id) === i
            );
          });
        }
        
        // Load new song
        audio.src = song.preview;
        audio.load(); // Explicitly load before playing - helps on mobile
        
        // Reset state
        setCurrentSong(song);
        setProgress(0);
        setCurrentTime(0);
        lastUpdateRef.current = Date.now();
      }
      
      // This play() call returns a promise in modern browsers
      // It will reject if autoplay is blocked by the browser
      audio.play().catch(err => {
        console.error(`Failed to play "${song.title}":`, err.message);
        setIsPlaying(false);
        
        // In a production app, I'd show a UI notification here
        // about autoplay being blocked
      });
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Unexpected error in playSong:', error);
      setIsPlaying(false);
    }
  }, [currentSong]);
  
  // Pause playback - much simpler than play!
  const pauseSong = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  // Toggle play/pause - convenience function used by the UI
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else if (currentSong) {
      playSong(currentSong);
    }
  }, [isPlaying, currentSong, pauseSong, playSong]);
  
  // Alias for togglePlay - my components use both names
  // TODO: standardize on one name throughout codebase
  const togglePlayPause = togglePlay;
  
  // Set volume - clamped between 0-1
  // Not available on iOS due to platform restrictions
  const setAudioVolume = useCallback((value) => {
    // Always clamp volume - my old web player had a bug here
    // where volume got set to -Infinity somehow. Not fun.
    const newVolume = Math.max(0, Math.min(1, value));
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('preferred_volume', newVolume.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);
  
  // Seek to position in the track
  // percent is 0-100, we convert to seconds
  const seekToPosition = useCallback((percent) => {
    if (!duration) return;
    
    const newTime = (percent / 100) * duration;
    
    try {
      // Set the time on the audio element
      audioRef.current.currentTime = newTime;
      
      // Update our state (don't wait for timeupdate event)
      setCurrentTime(newTime);
      setProgress(percent);
      lastUpdateRef.current = Date.now();
    } catch (e) {
      console.error('Error seeking:', e);
      // Some browsers throw errors if seeking beyond duration
      // or if media isn't loaded yet
    }
  }, [duration]);
  
  // For advanced audio visualization - not using yet
  // but keeping ready for when I add the visualizer
  const getAudioElement = useCallback(() => {
    return audioRef.current;
  }, []);
  
  // Load user's preferred volume from localStorage
  useEffect(() => {
    if (isIOS) return; // Skip on iOS - volume setting doesn't work anyway
    
    try {
      const savedVolume = localStorage.getItem('preferred_volume');
      if (savedVolume !== null) {
        const parsedVolume = parseFloat(savedVolume);
        if (!isNaN(parsedVolume)) {
          setAudioVolume(parsedVolume);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [setAudioVolume]);

  return (
    <AudioContext.Provider 
      value={{
        // Track data
        currentSong,
        songHistory,
        
        // Playback state
        isPlaying,
        progress,
        volume,
        duration,
        currentTime,
        
        // Control functions
        playSong,
        pauseSong,
        togglePlay,
        togglePlayPause,
        setAudioVolume,
        seekToPosition,
        getAudioElement,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// Some notes on limitations:
// - Mobile browsers require user interaction before audio will play
// - iOS ignores volume settings completely
// - Safari has weird behaviors around autoplay and seeking
// 
// Maybe consider switching to Howler.js in the future?
