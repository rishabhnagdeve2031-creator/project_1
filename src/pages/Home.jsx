import React, { useState } from 'react';
import ForestJourney from '../components/forest/ForestJourney';
import ForestAtmosphere from '../components/forest/ForestAtmosphere';
import AudioController from '../components/ui/AudioController';
import './Home.css';

export default function Home({ onNavigate }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollerEl, setScrollerEl] = useState(null);

  return (
    <div 
      ref={setScrollerEl} 
      className="home-container relative w-full h-screen overflow-y-auto overflow-x-hidden bg-forest-950 text-stone-100"
    >
      {/* Immersive background ambient elements */}
      <ForestAtmosphere progress={scrollProgress} />
      
      {/* Background mixer for natural sounds */}
      <AudioController progress={scrollProgress} />

      {/* The main scroll engine */}
      <ForestJourney 
        scrollerEl={scrollerEl} 
        onProgressChange={setScrollProgress} 
        onNavigate={onNavigate} 
      />
    </div>
  );
}
