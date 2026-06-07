'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  alpha: number;
  decay: number;
  wobble: number;
  wobbleSpeed: number;
}

export default function SparkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false, px: 0, py: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    
    // Resize observer is more reliable for dynamic layouts
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Performance setting: max particles based on screen size
    const isMobile = width < 768;
    const maxParticles = isMobile ? 30 : 80;
    const particles: Particle[] = [];

    // Spark creation helper
    const createSpark = (x: number, y: number, isMouseSpurt = false) => {
      if (particles.length >= maxParticles && !isMouseSpurt) return;
      
      const angle = isMouseSpurt 
        ? Math.random() * Math.PI * 2 
        : Math.PI * 1.5 + (Math.random() - 0.5) * 0.8; // Drift upwards
      
      const speed = isMouseSpurt 
        ? Math.random() * 3 + 1
        : Math.random() * 2 + 0.5;

      // Welding colors: intense white-blue, bright gold, vibrant orange
      const r = Math.random();
      let hue = 30; // Orange default
      if (r < 0.2) {
        hue = 190; // Welding electric blue/white
      } else if (r < 0.5) {
        hue = 45; // Golden yellow
      }

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isMouseSpurt ? 0 : 0.5), // upwards drift
        size: Math.random() * 2.5 + 0.8,
        hue,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 - 0.025,
      });
    };

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;
      mouseRef.current.x = newX;
      mouseRef.current.y = newY;
      mouseRef.current.active = true;

      // Create spark on movement based on speed
      const dx = newX - mouseRef.current.px;
      const dy = newY - mouseRef.current.py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 2) {
        const sparksToCreate = Math.min(Math.floor(dist / 3), 5);
        for (let i = 0; i < sparksToCreate; i++) {
          const t = i / sparksToCreate;
          const interpX = mouseRef.current.px + dx * t;
          const interpY = mouseRef.current.py + dy * t;
          createSpark(interpX, interpY, true);
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    // Animation variables for background welding flare/arc glow
    let arcGlowX = width * 0.8;
    let arcGlowY = height * 0.9;
    let arcGlowIntensity = 0.5;
    let arcGlowTargetIntensity = 0.5;
    let pulseTimer = 0;

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw a subtle cyber-grid background
      ctx.strokeStyle = 'rgba(230, 92, 0, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Ambient Electric Welding Arc Glow (simulates welding nearby)
      pulseTimer += 0.05;
      if (Math.random() < 0.02) {
        // Flickering target intensity like a real welding arc
        arcGlowTargetIntensity = Math.random() < 0.3 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3;
        if (Math.random() < 0.1) {
          // Relocate arc glow randomly along the bottom
          arcGlowX = Math.random() * width;
          arcGlowY = height - Math.random() * 40;
        }
      }
      arcGlowIntensity += (arcGlowTargetIntensity - arcGlowIntensity) * 0.2;

      if (arcGlowIntensity > 0.05) {
        // Draw double glow: blue/white center, orange outer ring
        const outerRadius = isMobile ? 150 : 300;
        const innerRadius = outerRadius * 0.3;

        // Outer Orange-Yellow Glow
        const orangeGlow = ctx.createRadialGradient(
          arcGlowX, arcGlowY, 0,
          arcGlowX, arcGlowY, outerRadius
        );
        orangeGlow.addColorStop(0, `rgba(230, 92, 0, ${arcGlowIntensity * 0.12})`);
        orangeGlow.addColorStop(0.5, `rgba(229, 169, 0, ${arcGlowIntensity * 0.04})`);
        orangeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = orangeGlow;
        ctx.beginPath();
        ctx.arc(arcGlowX, arcGlowY, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner Blue-White Arc Glow (The high-intensity spark)
        const blueGlow = ctx.createRadialGradient(
          arcGlowX, arcGlowY, 0,
          arcGlowX, arcGlowY, innerRadius
        );
        blueGlow.addColorStop(0, `rgba(240, 248, 255, ${arcGlowIntensity * 0.2})`);
        blueGlow.addColorStop(0.4, `rgba(0, 191, 255, ${arcGlowIntensity * 0.1})`);
        blueGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = blueGlow;
        ctx.beginPath();
        ctx.arc(arcGlowX, arcGlowY, innerRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Spawn sparks from the active welding arc
        if (Math.random() < 0.3 * arcGlowIntensity) {
          createSpark(arcGlowX, arcGlowY - 5);
        }
      }

      // 3. Mouse-follow dynamic aura (interactive welding torch)
      if (mouseRef.current.active) {
        const mouseGlow = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 100
        );
        mouseGlow.addColorStop(0, 'rgba(230, 92, 0, 0.06)');
        mouseGlow.addColorStop(0.6, 'rgba(229, 169, 0, 0.02)');
        mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 100, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Random ambient sparks rising from bottom
      if (Math.random() < (isMobile ? 0.05 : 0.15)) {
        createSpark(Math.random() * width, height - 10);
      }

      // 5. Update and Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Apply wind/wobble
        p.wobble += p.wobbleSpeed;
        const wind = Math.sin(p.wobble) * 0.25;

        // Apply friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Move
        p.x += p.vx + wind;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Intensified color at high alpha (white center), fading to colored glow
        if (p.alpha > 0.8) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        } else {
          ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.hue === 190 ? '70%' : '55%'}, ${p.alpha})`;
        }
        
        ctx.fill();

        // High-DPI glowing spark tails (aesthetic velocity vectors)
        if (p.alpha > 0.3) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha * 0.4})`;
          ctx.lineWidth = p.size * 0.7;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Check prefers-reduced-motion to save resources and respect settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches) {
      animate();
    } else {
      // Just draw the cyber-grid statically
      ctx.strokeStyle = 'rgba(230, 92, 0, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        display: 'block',
      }}
    />
  );
}
