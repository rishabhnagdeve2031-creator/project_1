import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AudioController = ({ progress = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Audio references
  const forestAudioRef = useRef(null);
  const cricketsAudioRef = useRef(null);
  const streamAudioRef = useRef(null);
  const tigerGrowlRef = useRef(null);
  const growlTriggeredRef = useRef(false);

  // Initialize audio files
  useEffect(() => {
    // Nature forest wind
    forestAudioRef.current = new Audio('https://www.soundjay.com/nature/sounds/forest-wind-1.mp3');
    forestAudioRef.current.loop = true;
    
    // Deep forest crickets
    cricketsAudioRef.current = new Audio('https://www.soundjay.com/nature/sounds/crickets-1.mp3');
    cricketsAudioRef.current.loop = true;
    
    // Forest stream / river
    streamAudioRef.current = new Audio('https://www.soundjay.com/nature/sounds/river-1.mp3');
    streamAudioRef.current.loop = true;
    
    // Tiger Growl - Real Panthera tigris growl
    tigerGrowlRef.current = new Audio('https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5e/Panthera_tigris_sumatrae_growling.ogg/Panthera_tigris_sumatrae_growling.ogg.mp3');
    
    // Set low base volume initially
    forestAudioRef.current.volume = 0;
    cricketsAudioRef.current.volume = 0;
    streamAudioRef.current.volume = 0;
    tigerGrowlRef.current.volume = 0.6;

    return () => {
      // Pause all on unmount
      if (forestAudioRef.current) forestAudioRef.current.pause();
      if (cricketsAudioRef.current) cricketsAudioRef.current.pause();
      if (streamAudioRef.current) streamAudioRef.current.pause();
      if (tigerGrowlRef.current) tigerGrowlRef.current.pause();
    };
  }, []);

  // Update volumes based on progress and play state
  useEffect(() => {
    if (!isPlaying) {
      // If muted, fade out
      const fadeInterval = setInterval(() => {
        let allMuted = true;
        [forestAudioRef, cricketsAudioRef, streamAudioRef].forEach((ref) => {
          if (ref.current && ref.current.volume > 0.05) {
            ref.current.volume -= 0.05;
            allMuted = false;
          } else if (ref.current) {
            ref.current.volume = 0;
          }
        });
        if (allMuted) {
          [forestAudioRef, cricketsAudioRef, streamAudioRef].forEach((ref) => {
            if (ref.current && !ref.current.paused) ref.current.pause();
          });
          clearInterval(fadeInterval);
        }
      }, 50);

      return () => clearInterval(fadeInterval);
    }

    // Play if playing and paused
    [forestAudioRef, cricketsAudioRef, streamAudioRef].forEach((ref) => {
      if (ref.current && ref.current.paused) {
        ref.current.play().catch((err) => console.log('Audio playback blocked: ', err));
      }
    });

    // Dynamic Volume Mixing Logic
    // progress: 0 (Canopy/Above) -> 1 (Deep Forest Clearing)
    let windVol = 0;
    let cricketVol = 0;
    let streamVol = 0;

    if (progress < 0.25) {
      // Scene 1 & 2: Forest from above / Canopy
      // Heavy wind, gentle crickets, no stream
      const ratio = progress / 0.25;
      windVol = 0.8 * (1 - ratio * 0.3);
      cricketVol = 0.1 + ratio * 0.2;
      streamVol = 0;
    } else if (progress < 0.5) {
      // Scene 3 & 4: Trail and Deepening forest
      // Decreasing wind, increasing crickets, stream starts
      const ratio = (progress - 0.25) / 0.25;
      windVol = 0.56 * (1 - ratio * 0.6); // 0.56 -> 0.22
      cricketVol = 0.3 + ratio * 0.5; // 0.3 -> 0.8
      streamVol = ratio * 0.3; // 0 -> 0.3
    } else if (progress < 0.75) {
      // Scene 5, 6, 7: Tiger Signs & Reveal
      // Quiet, cricket dominance, stream louder (water body)
      const ratio = (progress - 0.5) / 0.25;
      windVol = 0.22 * (1 - ratio * 0.5); // 0.22 -> 0.11
      cricketVol = 0.8 - ratio * 0.3; // 0.8 -> 0.5
      streamVol = 0.3 + ratio * 0.4; // 0.3 -> 0.7 (reaching stream)

      // Trigger Tiger Growl once on reveal (around progress 0.6)
      if (progress >= 0.58 && progress <= 0.65 && !growlTriggeredRef.current) {
        growlTriggeredRef.current = true;
        if (tigerGrowlRef.current) {
          tigerGrowlRef.current.currentTime = 0;
          tigerGrowlRef.current.play().catch(e => console.log(e));
        }
      } else if (progress < 0.55 || progress > 0.7) {
        // Reset trigger when leaving range to allow re-triggering
        growlTriggeredRef.current = false;
      }
    } else {
      // Scene 8 & 9: Ecosystem & Final clearing
      // Restoring balanced nature soundscape
      const ratio = (progress - 0.75) / 0.25;
      windVol = 0.11 + ratio * 0.39; // 0.11 -> 0.5
      cricketVol = 0.5 - ratio * 0.2; // 0.5 -> 0.3
      streamVol = 0.7 - ratio * 0.3; // 0.7 -> 0.4
    }

    // Apply mixed volumes safely
    if (forestAudioRef.current) forestAudioRef.current.volume = windVol * 0.6;
    if (cricketsAudioRef.current) cricketsAudioRef.current.volume = cricketVol * 0.5;
    if (streamAudioRef.current) streamAudioRef.current.volume = streamVol * 0.5;

  }, [isPlaying, progress]);

  const toggleSound = () => {
    setIsPlaying(!isPlaying);
    setHasInteracted(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Visualizer bars when sound is active */}
      <div className={`flex items-end gap-0.5 h-6 px-1 transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <span className="w-0.5 bg-amber-500 rounded-full animate-bounce" style={{ height: '80%', animationDelay: '0.1s', animationDuration: '0.8s' }} />
        <span className="w-0.5 bg-amber-500 rounded-full animate-bounce" style={{ height: '40%', animationDelay: '0.3s', animationDuration: '0.6s' }} />
        <span className="w-0.5 bg-amber-500 rounded-full animate-bounce" style={{ height: '90%', animationDelay: '0.2s', animationDuration: '1s' }} />
        <span className="w-0.5 bg-amber-500 rounded-full animate-bounce" style={{ height: '60%', animationDelay: '0.4s', animationDuration: '0.7s' }} />
        <span className="w-0.5 bg-amber-500 rounded-full animate-bounce" style={{ height: '30%', animationDelay: '0.5s', animationDuration: '0.5s' }} />
      </div>

      <button
        id="sound-toggle-btn"
        onClick={toggleSound}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 border ${
          isPlaying 
            ? 'bg-amber-950/60 text-amber-400 border-amber-500/40 hover:bg-amber-900/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
            : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:bg-stone-850 hover:text-stone-300'
        } backdrop-blur-md`}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4" />
            <span>SOUND ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4" />
            <span>SOUND OFF</span>
          </>
        )}
      </button>

      {/* Subtle hint on load */}
      {!hasInteracted && (
        <span className="text-[9px] text-stone-500 font-mono tracking-wider mr-2 animate-pulse">
          Click to enable atmospheric audio
        </span>
      )}
    </div>
  );
};

export default AudioController;
