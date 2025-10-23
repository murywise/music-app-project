import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AudioContext } from '../context/AudioContext';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaStepForward, FaStepBackward, 
         FaHeart, FaEllipsisH } from 'react-icons/fa';

// Some fixed values I'm setting based on my previous audio player projects
// My personal settings that I always end up using - not sure why audio devs always use these values
// but they seem to work well across devices
const DEFAULT_VOLUME = 0.7;  // 70% volume default
const VOLUME_STEP = 0.05;    // 5% increments for keyboard controls
const SEEK_STEP = 5;         // 5 second increments for keyboard seeking

// My little EQ/audio helper I've copied between a few of my projects
// Not used yet but keeping here for when I add visualizations
const calculateLoudness = (audioEl) => {
  if (!audioEl || !audioEl.currentTime) return 0;
  
  // This is a simplified approximation based on current volume + a random factor
  // In a real app, I'd use the Web Audio API analyzer node to get actual loudness
  // but this is good enough for the visualization effect I'm going for
  const currentVolume = audioEl.volume || 0;
  const randomFactor = (Math.sin(Date.now() / 200) + 1) / 2; // oscillates between 0-1
  return currentVolume * 0.7 + randomFactor * 0.3; // weighted blend
};

// TODO: Move all this to Web Audio API instead of basic HTML5 Audio
// Too much work for today but needed for proper visualizations & effects
const AudioPlayer = () => {
  // Extract everything we need from the context
  // I'm not a fan of the context pattern but it works well enough for now
  // Redux would be cleaner but this app isn't complex enough to justify it yet
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause, 
    progress, 
    volume, 
    currentTime, 
    duration,
    seekToPosition,
    setAudioVolume
  } = useContext(AudioContext);
  
  // UI state management - I prefer to keep these local to the component
  // Makes refactoring easier later and keeps the context focused on core audio
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showOptions, setShowOptions] = useState(false);  // For the menu that I'll add later
  const previousVolume = useRef(volume);  // For restoring volume after mute
  
  // Keep local copies of important values for keyboard controls
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;
  
  // Listen for keyboard controls - common feature in streaming players
  // Left/Right arrows seek, Space toggles play/pause, Up/Down adjust volume
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only if we have a song and aren't in an input field
      if (!currentSong || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          seekToPosition(((currentTimeRef.current + SEEK_STEP) / duration) * 100);
          break;
        case 'ArrowLeft':
          seekToPosition(((currentTimeRef.current - SEEK_STEP) / duration) * 100);
          break;
        case 'ArrowUp':
          setAudioVolume(Math.min(1, volume + VOLUME_STEP));
          break;
        case 'ArrowDown':
          setAudioVolume(Math.max(0, volume - VOLUME_STEP));
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong, duration, togglePlayPause, seekToPosition, volume, setAudioVolume]);
  
  // My custom time formatter for audio - displays MM:SS format
  // Did this on my last project too and copy-pasted it over
  const formatTime = (timeInSeconds) => {
    // Added more error handling because the audio API sometimes gives weird values
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds) || timeInSeconds < 0) return '0:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  // Estimate time remaining - useful for playlists
  // I like this feature from my vinyl player days - knowing how long until the side ends
  const timeRemaining = useMemo(() => {
    if (!duration || !currentTime) return 0;
    return Math.max(0, duration - currentTime);
  }, [duration, currentTime]);
  
  // This is where we'd integrate with the Deezer time sync API if we had access
  // For now just doing basic seeking via the HTML5 audio element
  const handleProgressChange = (e) => {
    // Always use parseFloat for ranges to avoid string concatenation bugs
    // Burned me once, never again!
    const newPosition = parseFloat(e.target.value);
    seekToPosition(newPosition);
    
    // Sometimes the audio context doesn't update fast enough
    // This helps avoid the "stuck progress bar" issue on older browsers
    // Might need to convert this to use requestAnimationFrame instead
  };
  
  const toggleMute = () => {
    if (isMuted) {
      setAudioVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setAudioVolume(0);
    }
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setAudioVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  // Quick function to check if song preview is about to end
  // Useful for showing a "preview ending" indicator
  const isNearingEnd = useMemo(() => {
    if (!duration || !currentTime) return false;
    return duration - currentTime < 5; // Less than 5 seconds left
  }, [duration, currentTime]);

  // Empty state - no song playing yet
  // I'd improve this with some animated equalizer bars in the final version
  // like the ones on my old Winamp skin design
  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 text-gray-400 p-4 z-50">
        <div className="container mx-auto text-center">
          <p className="text-sm">Select a track to start listening</p>
          <div className="flex justify-center mt-1 gap-1">
            {/* These empty divs would be the equalizer bars */}
            <div className="w-1 h-3 bg-gray-700 rounded-full"></div>
            <div className="w-1 h-2 bg-gray-700 rounded-full"></div>
            <div className="w-1 h-4 bg-gray-700 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
            <div className="w-1 h-3 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // My favorite part of the app - the audio player interface
  // Spent way too long making this look right
  // Inspired by a mix of Spotify, Apple Music, and my old Winamp days
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md text-white border-t ${isNearingEnd ? 'border-red-800/40 animate-pulse' : 'border-gray-800'} p-4 shadow-2xl z-50`}>
      <div className="container mx-auto flex items-center gap-4">
        {/* Album Art */}
        <Link to={`/song/${currentSong.id}`} className="hidden sm:block">
          <img 
            src={currentSong.album?.cover_medium || currentSong.album?.cover_small} 
            alt={currentSong.title} 
            className="w-14 h-14 rounded-md shadow-lg hover:scale-105 transition"
          />
        </Link>
        
        {/* Song Info */}
        <div className="flex-1 min-w-0 sm:max-w-[180px]">
          <Link to={`/song/${currentSong.id}`}>
            <h4 className="font-medium truncate hover:text-purple-400 transition">
              {currentSong.title}
            </h4>
          </Link>
          <Link to={`/artist/${currentSong.artist?.id}`}>
            <p className="text-sm text-gray-400 truncate hover:text-purple-400 transition">
              {currentSong.artist?.name}
            </p>
          </Link>
        </div>
        
        {/* Controls */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-1">
            <button 
              className="text-gray-400 hover:text-white transition" 
              title="Previous" 
              aria-label="Previous song"
              onClick={() => {/* Previous song logic would go here */}}
            >
              <FaStepBackward />
            </button>
            
            <button 
              onClick={togglePlayPause} 
              className={`bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full transition shadow-lg hover:shadow-xl transform hover:scale-105`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
            </button>
            
            <button 
              className="text-gray-400 hover:text-white transition" 
              title="Next" 
              aria-label="Next song"
              onClick={() => {/* Next song logic would go here */}}
            >
              <FaStepForward />
            </button>
          </div>
          
          {/* Progress bar - the most important part of any audio player */}
          {/* Always add aria labels for screenreaders - accessibility is key! */}
          <div className="w-full flex items-center gap-2 px-4">
            <span className="text-xs text-gray-400 w-8 text-right" title="Current position">{formatTime(currentTime)}</span>
            <div className="relative w-full">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-1 accent-purple-500 cursor-pointer z-10 relative"
                aria-label="Song progress"
              />
              {/* This would be where I'd add waveform visualization */}
              {/* But that requires full audio processing which is a lot more work */}
              
              {/* Show preview warning indicator - Deezer limits previews to 30 seconds */}
              {isNearingEnd && (
                <div className="absolute right-0 -top-6 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Preview ending soon
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 w-8" title="Total duration">{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Volume control */}
        <div 
          className="hidden sm:flex items-center relative"
          onMouseEnter={() => setShowVolumeControl(true)}
          onMouseLeave={() => setShowVolumeControl(false)}
        >
          <button 
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition p-2"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          
          <div className={`absolute bottom-full mb-2 bg-gray-800 p-2 rounded-lg transition-opacity ${showVolumeControl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-purple-500"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
