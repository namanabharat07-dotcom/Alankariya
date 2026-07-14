import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface PremiumWelcomeProps {
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  speedMultiplier: number;
  twinkleSpeed: number;
  color: string;
}

export default function PremiumWelcome({ onComplete }: PremiumWelcomeProps) {
  const [phase, setPhase] = useState<number>(1);
  const [showSkip, setShowSkip] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Skip button appears after 1.5 seconds for accessibility and smooth exit
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 1500);
    return () => clearTimeout(skipTimer);
  }, []);

  // Timed Phase Sequence for Timeline precision
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Silence (0.0s - 0.5s)
    // Phase 2: Divine Light (0.5s)
    timers.push(setTimeout(() => setPhase(2), 500));

    // Phase 3: Namam Formation (1.5s)
    timers.push(setTimeout(() => setPhase(3), 1500));

    // Phase 4: Energy Reveal Ring (3.0s)
    timers.push(setTimeout(() => {
      setPhase(4);
      triggerEnergyBurst();
    }, 3000));

    // Phase 5: Brand Identity Text (4.0s)
    timers.push(setTimeout(() => setPhase(5), 4000));

    // Phase 6: Welcome & Loading Progress (4.8s)
    timers.push(setTimeout(() => setPhase(6), 4800));

    // Final Transition (6.0s - Fades smoothly and finishes)
    timers.push(setTimeout(() => {
      // Persist welcome viewed status
      localStorage.setItem('alankapriya_welcome_viewed', 'true');
      onComplete();
    }, 6200));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  // High-performance HTML5 Canvas Golden Dust Particle Engine (60 FPS, GPU accelerated)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize 70 premium gold & bronze ambient dust particles
    const particleColors = [
      'rgba(212, 175, 55, ', // Metallic Gold
      'rgba(245, 158, 11, ', // Amber
      'rgba(251, 191, 36, ', // Soft Warm Yellow
      'rgba(255, 255, 255, ' // Pure Soft White
    ];

    const particles: Particle[] = Array.from({ length: 70 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.2, // Drift upward slowly
      size: Math.random() * 2.2 + 0.6,
      alpha: Math.random() * 0.6 + 0.1,
      baseAlpha: Math.random() * 0.5 + 0.2,
      speedMultiplier: Math.random() * 0.5 + 0.75,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      color: particleColors[Math.floor(Math.random() * particleColors.length)]
    }));

    particlesRef.current = particles;

    let time = 0;
    const render = () => {
      time += 0.01;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)'; // Slight trail for cinematic smoothness
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        // Twinkle effect (sine oscillation on opacity)
        p.alpha = p.baseAlpha + Math.sin(time * p.twinkleSpeed * 100) * 0.15;
        p.alpha = Math.max(0.05, Math.min(1, p.alpha));

        // Slow side-drift wave
        const drift = Math.sin(time + p.x * 0.01) * 0.1;
        p.x += p.vx + drift;
        p.y += p.vy * p.speedMultiplier;

        // Boundaries recycle
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Render shadow blur for luxury glow on larger particles
        if (p.size > 1.8) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0; // Reset shadow for canvas performance
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Trigger high-end gold shockwave/burst particles on Phase 4 (Energy Reveal)
  const triggerEnergyBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 35; // Position aligned near Namam center
    
    // Spawn 45 radial speed particles
    const burstParticles: Particle[] = Array.from({ length: 45 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1.5;
      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.8 + 1.2,
        alpha: 1,
        baseAlpha: 0.8,
        speedMultiplier: 1.1,
        twinkleSpeed: 0.05,
        color: 'rgba(245, 158, 11, ' // Pure Amber Sparks
      };
    });

    // Add burst particles to main registry and prune them slowly as they leave screen
    particlesRef.current = [...particlesRef.current, ...burstParticles];
    
    // Cleanup burst particles after 2.5 seconds to conserve GPU
    setTimeout(() => {
      particlesRef.current = particlesRef.current.slice(0, 70);
    }, 2500);
  };

  const handleSkip = () => {
    localStorage.setItem('alankapriya_welcome_viewed', 'true');
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none"
      id="brand-opening-wrapper"
    >
      {/* Cinematic 60 FPS Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none" 
        style={{ mixBlendMode: 'screen' }} 
      />

      {/* Luxury Cinematic Spotlight & Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_15%,rgba(0,0,0,0.85)_100%)]" 
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.055)_0%,transparent_72%)] pointer-events-none transition-opacity duration-1000" 
        style={{ opacity: phase >= 3 ? 1 : 0 }}
      />

      {/* Accessible Premium Skip Button */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.65, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1, borderColor: 'rgba(212,175,55,0.4)', backgroundColor: 'rgba(10,10,10,0.6)' }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-55 flex items-center space-x-1.5 px-4.5 py-2 rounded-full border border-stone-900 bg-stone-950/40 text-stone-300 text-[10px] font-extrabold uppercase tracking-[0.18em] transition-all cursor-pointer shadow-xl backdrop-blur-md"
            id="brand-opening-skip"
          >
            <span>Skip Intro</span>
            <X className="h-3 w-3 text-amber-500" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Timeline Core Orchestration Container */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-6 text-center select-none">
        
        {/* PHASE 2: Descending Divine Golden Light Beam */}
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "35vh", opacity: [0, 1, 0.75, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400 via-amber-300 to-transparent shadow-[0_0_20px_#f59e0b] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* PHASES 3 & 4: Symmetrical Thenkalai Divine Namam Emblem */}
        <div className="relative flex items-center justify-center w-52 h-56 mb-12 select-none">
          
          {/* Concentric Energy Circles Shockwaves (Phase 4) */}
          <AnimatePresence>
            {phase >= 4 && (
              <>
                {/* Shockwave Ring 1 */}
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.3, 1.4, 1.7], opacity: [0, 0.95, 0.4, 0] }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                  className="absolute rounded-full border border-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.25)] pointer-events-none"
                  style={{ width: '280px', height: '280px' }}
                />
                {/* Shockwave Ring 2 */}
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [0.3, 1.2, 1.45], opacity: [0, 0.75, 0.25, 0] }}
                  transition={{ delay: 0.25, duration: 1.8, ease: "easeOut" }}
                  className="absolute rounded-full border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] pointer-events-none"
                  style={{ width: '280px', height: '280px' }}
                />
                {/* Steady Subtle Halo */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1.0, opacity: 0.15 }}
                  transition={{ duration: 2 }}
                  className="absolute rounded-full border border-amber-500/10 pointer-events-none"
                  style={{ width: '230px', height: '230px' }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Symmetrical High-Fidelity Namam Vector Art (Glow and Fill Dual-rendering) */}
          <AnimatePresence>
            {phase >= 3 && (
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Soft volumetric glow layers under SVGs */}
                <svg viewBox="0 0 200 200" className="absolute w-44 h-44 pointer-events-none" style={{ filter: 'blur(11px)', mixBlendMode: 'screen' }}>
                  {/* Glowing White U-Shape Background */}
                  <motion.path
                    d="M 55,60 L 80,64 C 80,110 84,135 86,145 C 86,152 92,156 100,156 C 108,156 114,152 114,145 C 114,135 118,110 118,64 L 143,60 C 137,100 131,138 123,145 C 117,150 115,144 110,147 C 105,150 103,165 100,165 C 97,165 95,150 90,147 C 85,144 83,150 77,145 C 69,138 63,100 55,60 Z"
                    fill="#ffffff"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 0.1, duration: 1.2 }}
                  />
                  {/* Glowing Red Tilak Background */}
                  <motion.path
                    d="M 100,45 C 99,68 91,108 91,126 C 91,138 95,144 100,144 C 105,144 109,138 109,126 C 109,108 101,68 100,45 Z"
                    fill="#E31E24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.65 }}
                    transition={{ delay: 0.4, duration: 1.2 }}
                  />
                </svg>

                {/* Sharp high-contrast premium layers */}
                <svg viewBox="0 0 200 200" className="relative w-44 h-44 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                  {/* Symmetrical White Thenkalai "U" Shape */}
                  <motion.path
                    d="M 55,60 L 80,64 C 80,110 84,135 86,145 C 86,152 92,156 100,156 C 108,156 114,152 114,145 C 114,135 118,110 118,64 L 143,60 C 137,100 131,138 123,145 C 117,150 115,144 110,147 C 105,150 103,165 100,165 C 97,165 95,150 90,147 C 85,144 83,150 77,145 C 69,138 63,100 55,60 Z"
                    fill="#FFFFFF"
                    stroke="rgba(212,175,55,0.2)"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0, fillOpacity: 0 }}
                    animate={{ pathLength: 1, fillOpacity: 1 }}
                    transition={{ 
                      pathLength: { duration: 1.5, ease: "easeInOut" },
                      fillOpacity: { delay: 0.5, duration: 1.2, ease: "easeOut" }
                    }}
                  />

                  {/* Symmetrical Central Red Flame / Sri Churnam */}
                  <motion.path
                    d="M 100,45 C 99,68 91,108 91,126 C 91,138 95,144 100,144 C 105,144 109,138 109,126 C 109,108 101,68 100,45 Z"
                    fill="#E31E24"
                    initial={{ scaleY: 0, originY: 1, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>

              </div>
            )}
          </AnimatePresence>
        </div>

        {/* PHASE 5: Brand Identity (Luxury serif & modern sans-serif) */}
        <div className="h-28 flex flex-col items-center justify-start overflow-hidden relative">
          <AnimatePresence>
            {phase >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3.5"
              >
                {/* Brand Title: Elegant serif font with broad premium tracking */}
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-[0.25em] text-white">
                  ALANKA<span className="text-amber-500 font-light italic">PRIYA</span>
                </h1>
                
                {/* Slogan: Minimal modern gold/white sub-identity */}
                <h2 className="font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.22em] text-stone-400 uppercase flex items-center justify-center space-x-1.5">
                  <span>Your Smart</span>
                  <span className="h-1 w-1 bg-amber-500 rounded-full inline-block" />
                  <span className="text-amber-400">Shopping Partner</span>
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PHASE 6: Smooth Gold Loading Progress & Welcome */}
        <div className="h-24 mt-4 flex flex-col items-center justify-center">
          <AnimatePresence>
            {phase >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-64 space-y-3 text-center"
              >
                {/* Welcome Heading */}
                <span className="font-sans text-[10px] font-black tracking-[0.35em] text-amber-500 uppercase block">
                  WELCOME
                </span>
                
                {/* Status message */}
                <p className="text-[10.5px] text-stone-500 font-light tracking-wide">
                  Preparing your intelligent shopping experience...
                </p>

                {/* Smooth Custom Gold Progress Loader */}
                <div className="w-48 h-[1.5px] bg-stone-900 rounded-full overflow-hidden mx-auto relative mt-2">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.85)]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
