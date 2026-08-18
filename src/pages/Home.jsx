import React, { useState, useRef, useCallback, useEffect } from 'react';
import ForestJourney from '../components/forest/ForestJourney';
import ForestAtmosphere from '../components/forest/ForestAtmosphere';
import AudioController from '../components/ui/AudioController';
import './Home.css';

export default function Home({ onNavigate }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useCallback((e) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      const p = Math.min(1, Math.max(0, el.scrollTop / maxScroll));
      setScrollProgress(p);
    }
  }, []);

  const handleScrollDown = useCallback(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      const step = el.clientHeight * 1.6;
      el.scrollBy({ top: step, behavior: 'smooth' });
    }
  }, []);

  // Keyboard navigation support (ArrowDown, PageDown, Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        handleScrollDown();
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        if (containerRef.current) {
          containerRef.current.scrollBy({ top: -containerRef.current.clientHeight * 1.6, behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScrollDown]);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="home-container relative w-full h-screen overflow-y-auto overflow-x-hidden bg-forest-950 text-stone-100"
    >
      {/* Minimalist Vertical Scroll Tracker */}
      <div className="scroll-indicator-rail">
        <span className="scroll-percent">{Math.round(scrollProgress * 100)}%</span>
        <div className="scroll-track-line">
          <div 
            className="scroll-thumb-fill" 
            style={{ height: `${Math.max(6, scrollProgress * 100)}%` }} 
          />
        </div>
        <span className="scroll-indicator-text">SCROLL</span>
      </div>

      {/* Immersive background ambient elements */}
      <ForestAtmosphere progress={scrollProgress} />
      
      {/* Background mixer for natural sounds */}
      <AudioController progress={scrollProgress} />

      {/* The main scroll engine */}
      <ForestJourney 
        scrollProgress={scrollProgress}
        onProgressChange={setScrollProgress} 
        onNavigate={onNavigate}
        onScrollDown={handleScrollDown}
      />
    </div>
  );
}
