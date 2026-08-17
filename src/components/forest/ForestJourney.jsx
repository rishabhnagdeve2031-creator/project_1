import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { Compass, ArrowDown, ArrowRight, Activity } from 'lucide-react';

// Import assets
import canopyImg from '../../assets/canopy.png';
import trailImg from '../../assets/trail.png';
import tigerImg from '../../assets/tiger.png';
import familyImg from '../../assets/family.png';

// Import subcomponents
import WildlifeMap from '../map/WildlifeMap';

const ForestJourney = ({ scrollerEl, onProgressChange, onNavigate }) => {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Set up Lenis smooth scrolling and reverse scroll on mount
  useEffect(() => {
    if (!scrollerEl) return;

    // Disable automatic browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const spacerEl = triggerRef.current; // fallback to the trigger ref element

    const lenis = new Lenis({
      wrapper: scrollerEl,
      content: spacerEl || undefined,
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.0,
      smoothTouch: false,
    });

    // Synchronize ScrollTrigger with Lenis scroll updates
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initial position: Scroll to top, then fade in
    const timer = setTimeout(() => {
      if (scrollerEl) {
        scrollerEl.scrollTo(0, 0);
      } else {
        window.scrollTo(0, 0);
      }
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    }, 100);

    return () => {
      lenis.destroy();
      clearTimeout(timer);
    };
  }, [scrollerEl]);

  // GSAP animation triggers
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Timeline with smooth callbacks for updating React state dynamically
    const tl = gsap.timeline({ 
      paused: true,
      onUpdate: () => {
        const currentP = tl.progress();
        setCurrentProgress(currentP);
        onProgressChange(currentP);
      }
    });

    // Initialize Scene settings
    gsap.set('.scene', { opacity: 0, visibility: 'hidden' });
    gsap.set('.scene-1', { opacity: 1, visibility: 'visible' });

    // Define timeline steps (0 to 1 duration matches scroll progress)
    tl
      // --- SCENE 1 to 2 TRANSITION (0.0 to 0.18) ---
      .to('.scene-1-bg', { scale: 2.2, filter: 'blur(15px)', duration: 0.15, ease: 'power1.inOut' }, 0)
      .to('.scene-1-content', { y: -150, opacity: 0, duration: 0.12, ease: 'power1.inOut' }, 0)
      .to('.scene-1-guide', { opacity: 0, duration: 0.08 }, 0)
      .to('.scene-1', { opacity: 0, visibility: 'hidden', duration: 0.03 }, 0.15)
      
      .to('.scene-2', { opacity: 1, visibility: 'visible', duration: 0.05 }, 0.12)
      .fromTo('.scene-2-bg', { scale: 0.7, filter: 'blur(10px)' }, { scale: 1.05, filter: 'blur(0px)', duration: 0.15, ease: 'power1.out' }, 0.12)
      .fromTo('.scene-2-foliage-left', { scale: 0.6, x: -100, y: 100 }, { scale: 2.2, x: -350, y: -200, opacity: 0, duration: 0.18, ease: 'power1.in' }, 0.12)
      .fromTo('.scene-2-foliage-right', { scale: 0.6, x: 100, y: 100 }, { scale: 2.2, x: 350, y: -200, opacity: 0, duration: 0.18, ease: 'power1.in' }, 0.12)
      .fromTo('.scene-2-text-1', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.06 }, 0.14)
      .to('.scene-2-text-1', { opacity: 0, y: -50, duration: 0.06 }, 0.22)
      .fromTo('.scene-2-text-2', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.06 }, 0.22)
      .to('.scene-2-text-2', { opacity: 0, y: -50, duration: 0.06 }, 0.30)
      .to('.scene-2', { opacity: 0, visibility: 'hidden', duration: 0.05 }, 0.32)

      // --- SCENE 3: DEEPER INTO PENCH (0.32 to 0.46) ---
      .to('.scene-3', { opacity: 1, visibility: 'visible', duration: 0.05 }, 0.30)
      .fromTo('.scene-3-bg', { scale: 0.8, filter: 'blur(8px)' }, { scale: 1.05, filter: 'blur(0px)', duration: 0.14, ease: 'power1.out' }, 0.30)
      .fromTo('.scene-3-vignette', { opacity: 0 }, { opacity: 0.88, duration: 0.14 }, 0.30)
      .fromTo('.scene-3-text', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(1.2)' }, 0.34)
      .to('.scene-3-text', { opacity: 0, y: -30, duration: 0.06 }, 0.42)
      .to('.scene-3', { opacity: 0, visibility: 'hidden', duration: 0.04 }, 0.46)

      // --- SCENE 4: SIGNS OF THE TIGER (0.46 to 0.58) ---
      .to('.scene-4', { opacity: 1, visibility: 'visible', duration: 0.05 }, 0.44)
      .fromTo('.scene-4-bg', { scale: 0.85, filter: 'blur(8px)' }, { scale: 1.05, filter: 'blur(0px)', duration: 0.12, ease: 'power1.out' }, 0.44)
      .fromTo('.scene-4-scratches', { opacity: 0, scale: 1.2 }, { opacity: 0.7, scale: 1.0, duration: 0.08 }, 0.46)
      .fromTo('.print-1', { opacity: 0, scale: 0.6 }, { opacity: 0.65, scale: 1, duration: 0.04 }, 0.47)
      .fromTo('.print-2', { opacity: 0, scale: 0.6 }, { opacity: 0.65, scale: 1, duration: 0.04 }, 0.49)
      .fromTo('.print-3', { opacity: 0, scale: 0.6 }, { opacity: 0.65, scale: 1, duration: 0.04 }, 0.51)
      .fromTo('.scene-4-shadow', { opacity: 0, x: -80 }, { opacity: 0.25, x: 20, duration: 0.10, ease: 'power1.inOut' }, 0.48)
      .fromTo('.scene-4-text-1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.06 }, 0.47)
      .to('.scene-4-text-1', { opacity: 0, y: -30, duration: 0.05 }, 0.52)
      .fromTo('.scene-4-text-2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.06 }, 0.52)
      .to('.scene-4-text-2', { opacity: 0, y: -30, duration: 0.05 }, 0.56)
      .to('.scene-4', { opacity: 0, visibility: 'hidden', duration: 0.04 }, 0.58)

      // --- SCENE 5: THE TIGER REVEAL (0.58 to 0.74) ---
      .to('.scene-5', { opacity: 1, visibility: 'visible', duration: 0.04 }, 0.56)
      .fromTo('.scene-5-bg', { scale: 1.3, filter: 'blur(12px)' }, { scale: 1.02, filter: 'blur(0px)', duration: 0.14, ease: 'power2.out' }, 0.56)
      .fromTo('.scene-5-vignette', { opacity: 0.8 }, { opacity: 0.4, duration: 0.1 }, 0.58)
      .fromTo('.scene-5-foliage', { scale: 1.0, filter: 'blur(0px)' }, { scale: 2.2, filter: 'blur(10px)', opacity: 0, duration: 0.12 }, 0.57)
      .fromTo('.scene-5-eyes-glow', { opacity: 0 }, { opacity: 0.95, duration: 0.06 }, 0.61)
      .to('.scene-5-eyes-glow', { opacity: 0, duration: 0.04 }, 0.68)
      .fromTo('.scene-5-hud', { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.63)
      .fromTo('.scene-5-text', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.08 }, 0.64)
      .to('.scene-5', { opacity: 0, scale: 1.12, filter: 'blur(10px)', visibility: 'hidden', duration: 0.05 }, 0.74)

      // --- SCENE 6: TIGER FAMILY (0.74 to 0.84) ---
      .to('.scene-6', { opacity: 1, visibility: 'visible', duration: 0.04 }, 0.73)
      .fromTo('.scene-6-bg', { scale: 0.9, filter: 'blur(8px)' }, { scale: 1.02, filter: 'blur(0px)', duration: 0.10, ease: 'power1.out' }, 0.73)
      .fromTo('.marker-group', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.06, stagger: 0.02 }, 0.76)
      .to('.scene-6', { opacity: 0, scale: 1.1, filter: 'blur(8px)', visibility: 'hidden', duration: 0.04 }, 0.84)

      // --- SCENE 7: ECOSYSTEM CARDS (0.84 to 0.92) ---
      .to('.scene-7', { opacity: 1, visibility: 'visible', duration: 0.04 }, 0.83)
      .fromTo('.scene-7-bg', { scale: 0.9, filter: 'blur(8px)' }, { scale: 1.05, filter: 'blur(2px)', duration: 0.08 }, 0.83)
      .fromTo('.eco-card', { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 0.08, stagger: 0.02, ease: 'power2.out' }, 0.84)
      .to('.scene-7', { opacity: 0, visibility: 'hidden', duration: 0.04 }, 0.92)

      // --- SCENE 8: TELEMETRY MAP (0.92 to 0.97) ---
      .to('.scene-8', { opacity: 1, visibility: 'visible', duration: 0.03 }, 0.91)
      .fromTo('.scene-8-content', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.05, ease: 'power2.out' }, 0.91)
      .to('.scene-8', { opacity: 0, visibility: 'hidden', duration: 0.03 }, 0.97)

      // --- SCENE 9: FINAL CLEARING (0.97 to 1.0) ---
      .to('.scene-9', { opacity: 1, visibility: 'visible', duration: 0.03 }, 0.96)
      .fromTo('.scene-9-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.04, ease: 'power2.out' }, 0.965);

    // ScrollTrigger creation
    if (!scrollerEl) return;
    const st = ScrollTrigger.create({
      trigger: triggerRef.current,
      scroller: scrollerEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        // Map scroll top -> bottom to timeline progression
        const p = self.progress;
        // Smoothly animate timeline progress to target scroll position
        gsap.to(tl, {
          progress: p,
          duration: 0.4,
          ease: 'sine.out',
          overwrite: 'auto'
        });
      },
    });

    return () => {
      st.kill();
      tl.kill();
    };
  }, [onProgressChange, scrollerEl]);

  // Ecosystem dynamic card contents
  const ecoData = [
    { title: 'FOREST', label: 'Habitat core', desc: 'Pench hosts 758 sq km of tropical dry deciduous teak forests, featuring rolling hills and critical wildlife shelter.' },
    { title: 'WATER', label: 'River system', desc: 'The Pench River runs north to south through the reserve, forming vital pools and waterholes sustaining life in hot summers.' },
    { title: 'WILDLIFE CORRIDORS', label: 'Migration paths', desc: 'Important forest corridors link Pench with Kanha and Satpura reserves, ensuring genetic exchange for dispersing tigers.' },
    { title: 'PROTECTED HABITAT', label: 'Core monitoring', desc: 'Designated core areas are heavily protected. Anti-poaching patrols and electronic eyes safeguard the forest boundary.' },
  ];

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full min-h-screen transition-opacity duration-700 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 
        Scroll Spacer
        We use this tall element in the DOM flow to produce native scrollbar height.
        The user starts at the very bottom (scrollTop = max), and scrolling up takes them to the top (scrollTop = 0).
      */}
      <div id="scroll-spacer" ref={triggerRef} className="relative w-full h-[900vh] pointer-events-none" />

      {/* Fixed Viewport Container where the cinematic scenes are projected */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-10 select-none">
        
        {/* ========================================================
            SCENE 1: THE FOREST FROM ABOVE (0.00 - 0.15)
            ======================================================== */}
        <div className="scene scene-1 absolute inset-0 w-full h-full flex flex-col justify-between p-8 md:p-16">
          <div
            className="scene-1-bg absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${canopyImg})` }}
          />
          {/* Subtle mist overlay to separate content */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/30 via-transparent to-forest-950/80 pointer-events-none" />
          
          <div /> {/* Spacer */}
          
          <div className="scene-1-content relative z-10 text-center flex flex-col items-center">
            <span className="text-[11px] md:text-xs tracking-[0.4em] text-amber-500 font-bold uppercase mb-3 drop-shadow">
              PENCH TIGER RESERVE
            </span>
            <h1 className="text-6xl md:text-9xl font-serif text-stone-100 tracking-wider font-bold drop-shadow-2xl">
              TIGER MARG
            </h1>
            <p className="text-xs md:text-sm tracking-[0.25em] text-stone-300 font-medium italic mt-4 max-w-md drop-shadow">
              “Follow the trail. Enter the wild.”
            </p>
          </div>

          <div className="scene-1-guide relative z-10 flex flex-col items-center gap-2 animate-bounce">
            <span className="font-mono text-[10px] text-stone-400 tracking-[0.3em] uppercase">
              Scroll Down to Enter
            </span>
            <ArrowDown className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* ========================================================
            SCENE 2: FOREST TRAIL (0.12 - 0.32)
            ======================================================== */}
        <div className="scene scene-2 absolute inset-0 w-full h-full flex items-center justify-center p-8">
          <div
            className="scene-2-bg absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${trailImg})` }}
          />
          <div className="absolute inset-0 bg-forest-950/20 mix-blend-overlay pointer-events-none" />

          {/* Foreground leaf silhouettes passing by to create depth */}
          <svg className="scene-2-foliage-left absolute left-0 bottom-0 w-[40%] h-[60%] text-forest-950/90 fill-current pointer-events-none z-10 origin-bottom-left" viewBox="0 0 200 300">
            <path d="M0,300 C50,250 80,180 50,110 C40,90 20,70 0,60 C20,100 30,160 10,220 C5,230 0,250 0,300" />
            <path d="M0,280 C60,200 100,120 70,50 C60,30 30,10 0,0 C30,50 40,110 20,180 C10,210 0,230 0,280" />
          </svg>
          <svg className="scene-2-foliage-right absolute right-0 bottom-0 w-[40%] h-[60%] text-forest-950/90 fill-current pointer-events-none z-10 origin-bottom-right" viewBox="0 0 200 300">
            <path d="M200,300 C150,250 120,180 150,110 C160,90 180,70 200,60 C180,100 170,160 190,220 C195,230 200,250 200,300" />
            <path d="M200,280 C140,200 100,120 130,50 C140,30 170,10 200,0 C170,50 160,110 180,180 C190,210 200,230 200,280" />
          </svg>

          {/* Scene Texts fading sequentially */}
          <div className="scene-2-text-1 absolute text-center">
            <span className="text-[10px] tracking-[0.35em] text-stone-400 font-mono uppercase">LOCATION</span>
            <h2 className="text-4xl md:text-6xl text-stone-100 font-serif font-bold tracking-wide mt-2">MADHYA PRADESH</h2>
            <p className="text-xs md:text-sm tracking-[0.2em] text-amber-500 font-semibold uppercase mt-3">INDIA</p>
          </div>
          
          <div className="scene-2-text-2 absolute text-center">
            <span className="text-[10px] tracking-[0.35em] text-stone-400 font-mono uppercase">ELEVATION TRAIL</span>
            <h2 className="text-4xl md:text-6xl text-stone-100 font-serif font-bold tracking-wide mt-2">FOREST ZONE</h2>
            <p className="text-xs md:text-sm tracking-[0.2em] text-stone-300 font-mono mt-3">CORE SECTOR SIGHTINGS</p>
          </div>
        </div>

        {/* ========================================================
            SCENE 3: DEEPER INTO PENCH (0.30 - 0.46)
            ======================================================== */}
        <div className="scene scene-3 absolute inset-0 w-full h-full flex items-center justify-center p-8">
          {/* Reuse trail image but apply dark vignette to look deeper and darker */}
          <div
            className="scene-3-bg absolute inset-0 w-full h-full bg-cover bg-center filter brightness-[0.4]"
            style={{ backgroundImage: `url(${trailImg})` }}
          />
          <div className="scene-3-vignette absolute inset-0 dark-forest-overlay opacity-80" />

          <div className="scene-3-text relative z-10 text-center max-w-xl">
            <span className="text-[10px] tracking-[0.4em] text-amber-500/80 font-mono uppercase mb-4 block">
              ATMOSPHERIC SCAN
            </span>
            <h2 className="text-3xl md:text-5xl text-stone-200 font-serif leading-snug font-bold">
              SOMETHING MOVES THROUGH THESE WOODS.
            </h2>
            <div className="w-12 h-[1px] bg-amber-500/30 mx-auto mt-6" />
          </div>
        </div>

        {/* ========================================================
            SCENE 4: SIGNS OF THE TIGER (0.44 - 0.58)
            ======================================================== */}
        <div className="scene scene-4 absolute inset-0 w-full h-full flex flex-col justify-between p-8 md:p-16">
          <div
            className="scene-4-bg absolute inset-0 w-full h-full bg-cover bg-center filter brightness-[0.25] contrast-[1.1]"
            style={{ backgroundImage: `url(${trailImg})` }}
          />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-forest-950/90 pointer-events-none" />

          {/* Scratched Bark graphic overlay on trees (left edge) */}
          <svg className="scene-4-scratches absolute left-4 top-1/4 w-32 h-64 text-amber-900/40 opacity-70 pointer-events-none stroke-current" viewBox="0 0 100 200" fill="none">
            <path d="M10,20 Q25,80 30,140" strokeWidth="4" strokeLinecap="round" />
            <path d="M25,15 Q40,70 45,130" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M40,30 Q50,90 52,150" strokeWidth="3" strokeLinecap="round" />
          </svg>

          {/* Sequential Paw Prints appearing on bottom trail */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 h-32 flex items-center justify-around pointer-events-none">
            {/* SVG Tiger Paw Prints */}
            <svg className="print-1 w-10 h-10 text-stone-800 fill-current opacity-0 rotate-12" viewBox="0 0 100 100">
              <circle cx="50" cy="55" r="22" /> {/* Pad */}
              <circle cx="25" cy="25" r="9" />  {/* Toe 1 */}
              <circle cx="42" cy="18" r="9" />  {/* Toe 2 */}
              <circle cx="58" cy="18" r="9" />  {/* Toe 3 */}
              <circle cx="75" cy="25" r="9" />  {/* Toe 4 */}
            </svg>
            <svg className="print-2 w-10 h-10 text-stone-800 fill-current opacity-0 -rotate-12 translate-y-4" viewBox="0 0 100 100">
              <circle cx="50" cy="55" r="22" />
              <circle cx="25" cy="25" r="9" />
              <circle cx="42" cy="18" r="9" />
              <circle cx="58" cy="18" r="9" />
              <circle cx="75" cy="25" r="9" />
            </svg>
            <svg className="print-3 w-10 h-10 text-stone-800 fill-current opacity-0 rotate-6" viewBox="0 0 100 100">
              <circle cx="50" cy="55" r="22" />
              <circle cx="25" cy="25" r="9" />
              <circle cx="42" cy="18" r="9" />
              <circle cx="58" cy="18" r="9" />
              <circle cx="75" cy="25" r="9" />
            </svg>
          </div>

          {/* Distant tiger shadow silhouette */}
          <div className="scene-4-shadow absolute left-1/3 top-1/3 w-40 h-28 opacity-0 pointer-events-none filter blur-sm">
            <svg viewBox="0 0 200 100" className="w-full h-full fill-stone-900">
              {/* Abstract tiger body shape */}
              <ellipse cx="100" cy="50" rx="60" ry="25" />
              <circle cx="160" cy="40" r="18" />
              <rect x="70" y="55" width="10" height="40" rx="3" />
              <rect x="120" y="55" width="10" height="40" rx="3" />
              <path d="M40,50 Q10,70 20,90" fill="none" stroke="black" strokeWidth="6" />
            </svg>
          </div>

          <div /> {/* Spacer */}
          
          <div className="text-center relative z-10">
            <div className="scene-4-text-1 absolute w-full left-0 bottom-0">
              <h2 className="text-2xl md:text-3xl text-amber-500 font-mono tracking-wider font-bold uppercase">
                YOU ARE ENTERING TIGER COUNTRY.
              </h2>
            </div>
            <div className="scene-4-text-2 absolute w-full left-0 bottom-0 opacity-0">
              <span className="text-[9px] tracking-[0.4em] text-stone-400 font-mono uppercase block">SENSORS DETECT MOVEMENT</span>
              <h2 className="text-3xl md:text-4xl text-stone-200 font-serif font-bold tracking-wide mt-2">
                BE STILL.
              </h2>
            </div>
          </div>

          <div /> {/* Spacer */}
        </div>

        {/* ========================================================
            SCENE 5: THE TIGER REVEAL (0.58 - 0.74)
            ======================================================== */}
        <div className="scene scene-5 absolute inset-0 w-full h-full flex items-center justify-center p-6 md:p-12">
          <div
            className="scene-5-bg absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${tigerImg})` }}
          />
          <div className="scene-5-vignette absolute inset-0 bg-forest-950/70" />

          {/* Volumetric sunshaft focus */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-forest-950/20 to-forest-950/80 pointer-events-none" />

          {/* Leaf foreground covering screen that slides open */}
          <svg className="scene-5-foliage absolute left-0 top-0 w-full h-full text-forest-900 fill-current opacity-90 z-25 origin-center" viewBox="0 0 800 600">
            {/* Organic leafy shapes */}
            <path d="M 0,0 C 150,100 250,50 300,0 C 250,150 150,120 0,150 Z" />
            <path d="M 800,0 C 650,120 550,70 500,0 C 550,150 650,180 800,200 Z" />
            <path d="M 0,600 C 120,500 220,550 350,600 C 200,450 100,500 0,550 Z" />
          </svg>

          {/* Glowing Eyes Effect - aligned perfectly with the Tiger image face */}
          <div className="scene-5-eyes-glow absolute left-[54.2%] top-[42%] -translate-x-1/2 -translate-y-1/2 flex gap-[1.35rem] pointer-events-none z-20">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-95 blur-[2px] shadow-[0_0_12px_#fbbf24]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-95 blur-[2px] shadow-[0_0_12px_#fbbf24]" />
          </div>

          {/* Cinematic tracking interface overlay */}
          <div className="scene-5-hud absolute inset-0 w-full h-full pointer-events-none z-15 flex flex-col justify-between p-6 font-mono text-[9px] md:text-xs text-cyan-400">
            {/* Tracking crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-500/20 rounded-full flex items-center justify-center">
              <span className="w-2.5 h-2.5 border-t border-l border-cyan-400 absolute top-0 left-0" />
              <span className="w-2.5 h-2.5 border-t border-r border-cyan-400 absolute top-0 right-0" />
              <span className="w-2.5 h-2.5 border-b border-l border-cyan-400 absolute bottom-0 left-0" />
              <span className="w-2.5 h-2.5 border-b border-r border-cyan-400 absolute bottom-0 right-0" />
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            </div>

            {/* Top metrics bar */}
            <div className="flex justify-between items-start border-t border-cyan-500/20 pt-2 bg-gradient-to-b from-forest-950/40 to-transparent">
              <div>TELEMETRY COMPASS AUTO: 290° N</div>
              <div className="text-right">SENSORS ONLINE: CAM_B23</div>
            </div>

            {/* Side meters */}
            <div className="flex justify-between items-center h-full px-4">
              <div className="flex flex-col gap-1 items-start">
                <span className="text-cyan-400 font-bold">Z-DEPTH</span>
                <span className="h-20 w-1 bg-cyan-950 border border-cyan-500/20 relative rounded overflow-hidden">
                  <span className="absolute bottom-0 left-0 w-full bg-cyan-400 animate-pulse" style={{ height: '78%' }} />
                </span>
                <span>7.8m</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-cyan-400 font-bold">THERMAL</span>
                <span className="h-20 w-1 bg-cyan-950 border border-cyan-500/20 relative rounded overflow-hidden">
                  <span className="absolute bottom-0 left-0 w-full bg-amber-500 animate-pulse" style={{ height: '94%' }} />
                </span>
                <span className="text-amber-500">38.4°C</span>
              </div>
            </div>

            {/* Bottom telemetry card */}
            <div className="scene-5-text flex flex-col md:flex-row justify-between items-end border-b border-cyan-500/20 pb-3 bg-gradient-to-t from-forest-950/40 to-transparent">
              <div>
                <span className="text-stone-400 text-[10px]">SPECIES TELEMETRY LOG</span>
                <h3 className="text-2xl md:text-3xl font-serif text-stone-100 font-bold mt-1 tracking-wider uppercase">
                  TIGER DETECTED
                </h3>
                <p className="text-[10px] text-cyan-400 italic">Panthera tigris tigris — Bengal Tiger</p>
              </div>
              <div className="glass-panel-cyan p-3 rounded-lg border border-cyan-500/30 text-left w-56 mt-3 md:mt-0">
                <div className="flex justify-between mb-1.5 border-b border-cyan-500/10 pb-1">
                  <span className="text-stone-400 text-[9px] uppercase font-bold">Parameter</span>
                  <span className="text-stone-400 text-[9px] uppercase font-bold">Value</span>
                </div>
                <div className="flex justify-between text-stone-200">
                  <span>HABITAT:</span>
                  <span className="text-cyan-300">DECIDUOUS CORE</span>
                </div>
                <div className="flex justify-between text-stone-200 mt-0.5">
                  <span>SIG SENS:</span>
                  <span className="text-emerald-400 font-bold uppercase animate-pulse">ACTIVE</span>
                </div>
                <div className="flex justify-between text-stone-200 mt-0.5">
                  <span>ZONE ID:</span>
                  <span className="text-cyan-300">CORE FOREST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            SCENE 6: TIGER FAMILY (0.73 - 0.85)
            ======================================================== */}
        <div className="scene scene-6 absolute inset-0 w-full h-full flex flex-col justify-between p-6 md:p-12">
          <div
            className="scene-6-bg absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${familyImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/30 via-transparent to-forest-950/80 pointer-events-none" />

          {/* Heading overlay */}
          <div className="relative z-10 text-center mt-6">
            <span className="text-[10px] tracking-[0.35em] text-amber-500 font-mono uppercase block">SIGHTINGS GROUP</span>
            <h2 className="text-3xl md:text-5xl text-stone-100 font-serif font-bold tracking-wide mt-1">THE TIGER FAMILY</h2>
          </div>

          {/* Hover Markers on the tigers */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Marker 1: Adult */}
            <div className="marker-group absolute left-[35%] top-[58%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <div className="mt-2 glass-panel px-2.5 py-1 rounded border border-amber-500/30 text-[9px] font-mono text-stone-200 tracking-wider">
                ADULT FEMALE (T-33)
              </div>
            </div>

            {/* Marker 2: Cub */}
            <div className="marker-group absolute left-[52%] top-[62%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" style={{ animationDelay: '0.4s' }} />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
              </span>
              <div className="mt-2 glass-panel px-2.5 py-1 rounded border border-cyan-500/30 text-[9px] font-mono text-stone-200 tracking-wider">
                CUB 1 (MALE - 9 MO)
              </div>
            </div>

            {/* Marker 3: Cub */}
            <div className="marker-group absolute left-[72%] top-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" style={{ animationDelay: '0.8s' }} />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
              </span>
              <div className="mt-2 glass-panel px-2.5 py-1 rounded border border-cyan-500/30 text-[9px] font-mono text-stone-200 tracking-wider">
                CUB 2 (FEMALE - 9 MO)
              </div>
            </div>
          </div>

          <div /> {/* Spacer */}
        </div>

        {/* ========================================================
            SCENE 7: THE PENCH ECOSYSTEM CARDS (0.83 - 0.92)
            ================================================        */}
        <div
          className="scene scene-7 absolute inset-0 w-full h-full flex flex-col justify-center items-center p-6 md:p-12 z-25"
          style={{ pointerEvents: currentProgress >= 0.82 && currentProgress <= 0.92 ? 'auto' : 'none' }}
        >
          {/* Blurred trail background */}
          <div
            className="scene-7-bg absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${trailImg})` }}
          />
          <div className="absolute inset-0 bg-forest-950/80 pointer-events-none" />

          <div className="relative z-10 w-full max-w-5xl">
            <div className="text-center mb-8">
              <span className="text-[10px] tracking-[0.4em] text-amber-500 font-mono uppercase">CONSERVATION GRID</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-100 mt-2 tracking-wide">
                THE PENCH ECOSYSTEM
              </h2>
              <p className="text-stone-400 text-xs md:text-sm max-w-md mx-auto mt-3">
                Understanding the ecological elements that sustain India's majestic Bengal tigers in the core forests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {ecoData.map((eco, idx) => (
                <div
                  key={idx}
                  className="eco-card glass-panel p-5 rounded-xl hover:border-amber-500/40 hover:bg-forest-900/60 transition-[border-color,background-color] duration-300 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3 border-b border-stone-850 pb-2">
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-amber-500">{eco.label}</span>
                    <span className="text-stone-600 font-mono text-[9px] group-hover:text-amber-500 transition-colors">0{idx + 1}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                    {eco.title}
                  </h3>
                  <p className="text-stone-300 text-xs mt-2 leading-relaxed">
                    {eco.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            SCENE 8: TELEMETRY MAP (0.91 - 0.97)
            ======================================================== */}
        <div
          className="scene scene-8 absolute inset-0 w-full h-full flex items-center justify-center p-4 md:p-8 z-30"
          style={{ pointerEvents: currentProgress >= 0.90 && currentProgress <= 0.97 ? 'auto' : 'none' }}
        >
          {/* Deep dark backing */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950 via-[#070f0b] to-stone-950 pointer-events-none" />
          
          <div className="scene-8-content w-full max-w-4xl">
            <WildlifeMap />
          </div>
        </div>

        {/* ========================================================
            SCENE 9: FINAL CLEARING & CTAs (0.96 - 1.0)
            ======================================================== */}
        <div
          className="scene scene-9 absolute inset-0 w-full h-full flex flex-col justify-between p-8 md:p-16 z-35"
          style={{ pointerEvents: currentProgress >= 0.96 ? 'auto' : 'none' }}
        >
          {/* Deep dark green clearing backdrop */}
          <div className="absolute inset-0 bg-[#040806]" />
          
          {/* Distant faint forest trees silhouettes overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-bottom opacity-10 filter blur-[1px] pointer-events-none"
            style={{ backgroundImage: `url(${trailImg})` }}
          />
          {/* Warm center radial spot */}
          <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none" />

          <div /> {/* Top spacer */}

          <div className="scene-9-content relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
            <span className="text-[10px] md:text-xs tracking-[0.45em] text-amber-500 font-bold uppercase mb-4">
              CONGLOMERATION COMPLETION
            </span>
            <h2 className="text-4xl md:text-6xl text-stone-200 font-serif leading-tight font-bold">
              YOU ARE NOW INSIDE THE WILD.
            </h2>
            <div className="w-16 h-[2px] bg-amber-500/50 my-6" />
            
            <h3 className="text-xl md:text-2xl font-serif text-stone-100 font-semibold tracking-wide">
              TIGER MARG
            </h3>
            <p className="text-[10px] md:text-xs tracking-[0.2em] text-stone-400 font-mono uppercase mt-1">
              Pench Tiger Reserve
            </p>
            
            <p className="text-xs md:text-sm text-stone-300 mt-4 leading-relaxed max-w-lg">
              Protect the forest. Protect its stories. The trail you have walked is home to 80+ wild tigers. Ensure their footprints continue to imprint the earth.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <button
                id="explore-pench-btn"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-forest-950 font-sans text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all duration-300 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:scale-105"
                onClick={() => onNavigate('dashboard')}
              >
                <span>LAUNCH SYSTEM</span>
                <Compass className="w-4 h-4" />
              </button>
              
              <button
                id="wildlife-monitor-btn"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-cyan-500/40 text-cyan-400 font-sans text-xs font-bold uppercase tracking-wider hover:bg-cyan-950/40 hover:text-cyan-300 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105"
                onClick={() => onNavigate('movement-map')}
              >
                <span>WILDLIFE MONITORING</span>
                <Activity className="w-4 h-4" />
              </button>
              
              <button
                id="discover-tiger-btn"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-stone-800 text-stone-300 font-sans text-xs font-bold uppercase tracking-wider hover:bg-stone-900/60 hover:text-stone-100 hover:border-stone-700 transition-all duration-300 hover:scale-105"
                onClick={() => onNavigate('tiger-intelligence')}
              >
                <span>DISCOVER THE TIGER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer branding */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center border-t border-stone-900 pt-6 text-[9px] text-stone-500 font-mono tracking-widest gap-2">
            <div>© 2026 TIGER MARG CONSERVATION PROJECT</div>
            <div>COORDINATES: 21.7000° N, 79.2500° E</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForestJourney;
