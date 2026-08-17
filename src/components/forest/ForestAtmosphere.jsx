import React, { useEffect, useRef } from 'react';

const ForestAtmosphere = ({ progress = 0 }) => {
  const canvasRef = useRef(null);
  const progressRef = useRef(progress);

  // Keep progress updated in a reference to avoid resetting the animation loop on every scroll event
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic environmental parameters based on scroll progress
    // progress: 0 (canopy) -> 1 (clearing)
    const getEnvironmentParams = (p) => {
      let fogDensity = 0.15; // default light fog
      let lightShaftIntensity = 0.6; // bright sun rays
      let leafDensity = 15;
      let dustDensity = 60;
      let leafColor = 'rgba(62, 127, 91, 0.4)'; // forest green leaves

      if (p < 0.25) {
        // Scene 1-2: Morning sun canopy
        fogDensity = 0.12 + p * 0.2;
        lightShaftIntensity = 0.7 * (1 - p);
        dustDensity = 50 + p * 50;
      } else if (p < 0.5) {
        // Scene 3-4: Going deeper, darker
        fogDensity = 0.17 + (p - 0.25) * 1.2; // fog increases rapidly
        lightShaftIntensity = 0.5 * (1 - (p - 0.25) * 2); // sun dims
        dustDensity = 100 + (p - 0.25) * 80;
        leafDensity = 25;
        leafColor = 'rgba(42, 60, 48, 0.35)'; // darker leaves
      } else if (p < 0.75) {
        // Scene 5-7: Tiger reveal, deep forest
        fogDensity = 0.45 - (p - 0.5) * 0.4; // fog stays dense, then lifts slightly
        lightShaftIntensity = 0.1 + (p - 0.5) * 0.4; // moody volumetric light
        dustDensity = 130 - (p - 0.5) * 80;
        leafDensity = 15;
        leafColor = 'rgba(111, 125, 71, 0.3)'; // moss green leaves
      } else {
        // Scene 8-9: Ecosystem, map, final clearing
        fogDensity = 0.25;
        lightShaftIntensity = 0.3;
        dustDensity = 60;
        leafDensity = 12;
      }

      return { fogDensity, lightShaftIntensity, leafDensity, dustDensity, leafColor };
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Fixed particle pools to prevent GC thrashing and jarring resets
    const maxDustCount = 200;
    const maxLeavesCount = 50;

    const dustMotes = [];
    const leaves = [];
    const fogCircles = [];

    // Create dust motes once
    const initDust = (count) => {
      dustMotes.length = 0;
      for (let i = 0; i < count; i++) {
        dustMotes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: -Math.random() * 0.12 - 0.03,
          alpha: Math.random() * 0.6 + 0.1,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Create falling leaves once
    const initLeaves = (count) => {
      leaves.length = 0;
      for (let i = 0; i < count; i++) {
        leaves.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          size: Math.random() * 8 + 6,
          speedY: Math.random() * 1 + 0.6,
          swaySpeed: Math.random() * 0.02 + 0.01,
          swayRange: Math.random() * 25 + 15,
          swayOffset: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    };

    // Create fog particles (drifting blobs) once
    const initFog = () => {
      fogCircles.length = 0;
      for (let i = 0; i < 8; i++) {
        fogCircles.push({
          x: Math.random() * width,
          y: height * 0.75 + Math.random() * height * 0.3,
          radius: Math.random() * 250 + 150,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.1,
          alpha: Math.random() * 0.2 + 0.05,
        });
      }
    };

    // Populate particle pools
    initDust(maxDustCount);
    initLeaves(maxLeavesCount);
    initFog();

    // Light shaft state
    let lightShaftAngle = 0;

    // The continuous animation loop
    const animate = () => {
      // Get params dynamically based on current scroll progress ref
      const currentProgress = progressRef.current;
      const params = getEnvironmentParams(currentProgress);

      ctx.clearRect(0, 0, width, height);

      // --- 1. RENDER VOLUMETRIC LIGHT SHAFTS (Morning sun rays) ---
      if (params.lightShaftIntensity > 0.02) {
        lightShaftAngle += 0.001;
        ctx.save();
        const baseIntensity = params.lightShaftIntensity;

        // Draw 3 primary light beams starting from top-left area
        const beams = [
          { startX: width * 0.1, width: width * 0.15, alpha: 0.18, osc: 0.05 },
          { startX: width * 0.25, width: width * 0.25, alpha: 0.12, osc: 0.03 },
          { startX: width * 0.5, width: width * 0.2, alpha: 0.15, osc: 0.04 },
        ];

        beams.forEach((beam, idx) => {
          const drift = Math.sin(lightShaftAngle + idx * 2) * 40;
          const oscAlpha = Math.sin(lightShaftAngle * 3 + idx) * beam.osc;
          const finalAlpha = Math.max(0.01, (beam.alpha + oscAlpha) * baseIntensity);

          const gradient = ctx.createLinearGradient(
            beam.startX + drift, 0, 
            beam.startX + drift + width * 0.3, height
          );
          gradient.addColorStop(0, `rgba(253, 230, 138, ${finalAlpha})`); // warm amber-yellow
          gradient.addColorStop(0.3, `rgba(253, 230, 138, ${finalAlpha * 0.6})`);
          gradient.addColorStop(1, 'rgba(4, 8, 6, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(beam.startX + drift - beam.width / 2, 0);
          ctx.lineTo(beam.startX + drift + beam.width / 2, 0);
          ctx.lineTo(beam.startX + drift + beam.width * 2 + width * 0.2, height);
          ctx.lineTo(beam.startX + drift - beam.width + width * 0.2, height);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();
      }

      // --- 2. RENDER DUST MOTES (Micro-particles floating in rays) ---
      const activeDustDensity = Math.min(maxDustCount, Math.round(params.dustDensity));
      dustMotes.forEach((mote, i) => {
        // Update position regardless of active state to maintain continuous trajectory
        mote.y += mote.speedY;
        mote.x += mote.speedX + Math.sin(mote.phase) * 0.1;
        mote.phase += mote.pulseSpeed;

        // Wrap around borders
        if (mote.y < 0) {
          mote.y = height;
          mote.x = Math.random() * width;
        }
        if (mote.x < 0) mote.x = width;
        if (mote.x > width) mote.x = 0;

        // Only draw up to active density
        if (i < activeDustDensity) {
          const currentAlpha = mote.alpha * (0.6 + Math.sin(mote.phase) * 0.4);
          ctx.fillStyle = `rgba(251, 191, 36, ${currentAlpha})`; // subtle amber/gold
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
          ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
          ctx.shadowBlur = mote.size * 2;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // --- 3. RENDER FOG / MIST BLOBS (Drifting deep atmosphere) ---
      if (params.fogDensity > 0.05) {
        fogCircles.forEach((fog) => {
          fog.x += fog.speedX;
          fog.y += fog.speedY + Math.sin(fog.x * 0.001) * 0.05;

          // Boundaries wrap
          if (fog.x - fog.radius > width) fog.x = -fog.radius;
          if (fog.x + fog.radius < 0) fog.x = width + fog.radius;
          if (fog.y - fog.radius > height + 100) fog.y = height * 0.6;
          if (fog.y + fog.radius < height * 0.4) fog.y = height + fog.radius;

          const grad = ctx.createRadialGradient(
            fog.x, fog.y, 0,
            fog.x, fog.y, fog.radius
          );
          
          const maxFogAlpha = fog.alpha * params.fogDensity * 2.5;
          grad.addColorStop(0, `rgba(34, 70, 50, ${maxFogAlpha})`); // soft moss-greenish fog
          grad.addColorStop(0.5, `rgba(15, 32, 23, ${maxFogAlpha * 0.4})`);
          grad.addColorStop(1, 'rgba(4, 8, 6, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // --- 4. RENDER FALLING LEAVES (Forest breeze) ---
      const activeLeafDensity = Math.min(maxLeavesCount, Math.round(params.leafDensity));
      leaves.forEach((leaf, i) => {
        // Update positions continuously
        leaf.y += leaf.speedY;
        leaf.swayOffset += leaf.swaySpeed;
        const currentX = leaf.x + Math.sin(leaf.swayOffset) * leaf.swayRange;
        leaf.rotation += leaf.rotationSpeed;

        // Wrap leaves around viewport
        if (leaf.y > height) {
          leaf.y = -20;
          leaf.x = Math.random() * width;
          leaf.speedY = Math.random() * 1 + 0.6;
        }

        // Only draw up to active density
        if (i < activeLeafDensity) {
          ctx.save();
          ctx.translate(currentX, leaf.y);
          ctx.rotate(leaf.rotation);
          
          ctx.fillStyle = params.leafColor;
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size / 2);
          ctx.quadraticCurveTo(leaf.size / 3, 0, 0, leaf.size / 2);
          ctx.quadraticCurveTo(-leaf.size / 3, 0, 0, -leaf.size / 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-20 mix-blend-screen"
      style={{ opacity: 0.9 }}
    />
  );
};

export default ForestAtmosphere;
