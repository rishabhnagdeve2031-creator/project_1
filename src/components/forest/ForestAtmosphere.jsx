import React, { useEffect, useRef } from 'react';

const ForestAtmosphere = ({ progress = 0 }) => {
  const canvasRef = useRef(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Lightweight particle pools for high 60-120fps performance
    const dustCount = 30;
    const dustMotes = [];
    for (let i = 0; i < dustCount; i++) {
      dustMotes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: -Math.random() * 0.2 - 0.05,
        alpha: Math.random() * 0.4 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const leavesCount = 8;
    const leaves = [];
    for (let i = 0; i < leavesCount; i++) {
      leaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 5 + 4,
        speedY: Math.random() * 0.8 + 0.4,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayRange: Math.random() * 20 + 10,
        swayOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.35 + 0.1,
      });
    }

    let frame = 0;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const p = progressRef.current;

      // 1. Light Shafts (Only in canopy and clearings)
      if (p < 0.35 || p > 0.8) {
        const intensity = p < 0.35 ? (1 - p * 2.5) * 0.15 : 0.08;
        if (intensity > 0.01) {
          ctx.fillStyle = `rgba(253, 230, 138, ${intensity})`;
          ctx.beginPath();
          ctx.moveTo(width * 0.15, 0);
          ctx.lineTo(width * 0.35, 0);
          ctx.lineTo(width * 0.75, height);
          ctx.lineTo(width * 0.45, height);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 2. Fast Dust Motes
      for (let i = 0; i < dustCount; i++) {
        const d = dustMotes[i];
        d.x += d.speedX;
        d.y += d.speedY;

        if (d.y < 0) d.y = height;
        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;

        const pulse = Math.sin(frame * d.pulseSpeed + d.phase);
        const currentAlpha = Math.max(0.05, d.alpha + pulse * 0.1);

        ctx.fillStyle = `rgba(253, 230, 138, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Falling Leaves
      ctx.fillStyle = 'rgba(62, 127, 91, 0.35)';
      for (let i = 0; i < leavesCount; i++) {
        const leaf = leaves[i];
        leaf.y += leaf.speedY;
        const sway = Math.sin(frame * leaf.swaySpeed + leaf.swayOffset) * leaf.swayRange;

        if (leaf.y > height + 20) {
          leaf.y = -20;
          leaf.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(leaf.x + sway, leaf.y, leaf.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-20"
      style={{ opacity: 0.85 }}
    />
  );
};

export default ForestAtmosphere;
