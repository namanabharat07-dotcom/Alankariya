import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

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
  // Scene timeline index: 1 through 8
  const [scene, setScene] = useState<number>(1);
  const [showSkip, setShowSkip] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Detect accessibility preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Precise timing sequence aligned with the official 8-scene brand manual flow
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Scene 1 — Silence (0.0s - 0.8s)
    setScene(1);

    // Scene 2 — Light Arrival (0.8s - 1.6s)
    timers.push(setTimeout(() => {
      setScene(2);
    }, 800));

    // Scene 3 — The Namam (1.6s - 2.4s)
    timers.push(setTimeout(() => {
      setScene(3);
    }, 1600));

    // Scene 4 — Logo Reveal (2.4s - 3.3s)
    timers.push(setTimeout(() => {
      setScene(4);
    }, 2400));

    // Scene 5 — Premium Energy (3.3s - 4.3s)
    timers.push(setTimeout(() => {
      setScene(5);
    }, 3300));

    // Scene 6 — Brand Reveal (4.3s - 5.0s)
    timers.push(setTimeout(() => {
      setScene(6);
    }, 4300));

    // Scene 7 — Intelligent Transition (5.0s - 5.8s)
    timers.push(setTimeout(() => {
      setScene(7);
    }, 5000));

    // Scene 8 — Homepage Transition (5.8s - 6.0s)
    timers.push(setTimeout(() => {
      setScene(8);
    }, 5800));

    // Complete & Save view state in localStorage at 6.0s
    timers.push(setTimeout(() => {
      localStorage.setItem('alankapriya_intro_seen', 'true');
      onComplete();
    }, 6000));

    // Skip button appears after exactly 2 seconds
    timers.push(setTimeout(() => {
      setShowSkip(true);
    }, 2000));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  // High-performance canvas ambient particle system (60 FPS, GPU accelerated)
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

    // Seed ultra-minimal elegant gold dust particles
    const particleCount = prefersReducedMotion ? 15 : 35;
    const goldColors = [
      'rgba(212, 175, 55, ',  // Luxury Gold
      'rgba(245, 158, 11, ',  // Warm Amber
      'rgba(255, 255, 255, '  // Pure white spark
    ];

    const particles: Particle[] = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -Math.random() * 0.22 - 0.08, // Slow majestic upward drift
      size: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.35 + 0.05,
      baseAlpha: Math.random() * 0.25 + 0.1,
      speedMultiplier: Math.random() * 0.4 + 0.8,
      twinkleSpeed: Math.random() * 0.008 + 0.003,
      color: goldColors[Math.floor(Math.random() * goldColors.length)]
    }));

    particlesRef.current = particles;

    let tick = 0;
    const draw = () => {
      tick += 0.01;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // Smooth tail trailing effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        // Subtle twinkling opacity
        p.alpha = p.baseAlpha + Math.sin(tick * p.twinkleSpeed * 100) * 0.1;
        p.alpha = Math.max(0.03, Math.min(0.85, p.alpha));

        // Lateral waving drift
        p.x += p.vx + Math.sin(tick + p.y * 0.005) * 0.05;
        p.y += p.vy * p.speedMultiplier;

        // Reset if drifted off screen
        if (p.y < -15) {
          p.y = canvas.height + 15;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -15) p.x = canvas.width + 15;
        if (p.x > canvas.width + 15) p.x = -15;

        // Light luxury glow effect
        if (p.size > 1.0 && !prefersReducedMotion) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [prefersReducedMotion]);

  // Skip button fast-forwards directly to scene 8 and completes gracefully
  const handleSkip = () => {
    setScene(8);
    setTimeout(() => {
      localStorage.setItem('alankapriya_intro_seen', 'true');
      onComplete();
    }, 250);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden select-none"
      id="alankapriya-luxury-welcome-stage"
      aria-live="polite"
    >
      {/* 1. Cinematic Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none" 
        style={{ mixBlendMode: 'screen' }} 
      />

      {/* 2. Premium Spotlight Radial Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_15%,rgba(0,0,0,0.95)_100%)]" 
      />

      {/* 3. Small Luxurious "Skip Intro" Glass Button (Top Right) */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.02, borderColor: 'rgba(212,175,55,0.4)', backgroundColor: 'rgba(255,255,255,0.06)' }}
            onClick={handleSkip}
            className="absolute top-8 right-8 z-55 flex items-center space-x-1.5 px-4.5 py-2 rounded-full border border-stone-800/80 bg-stone-900/40 text-stone-300 text-[10px] font-bold uppercase tracking-[0.18em] transition-all cursor-pointer backdrop-blur-md shadow-2xl"
            id="brand-welcome-skip"
            aria-label="Skip Intro"
          >
            <span>Skip Intro</span>
            <X className="h-3 w-3 text-amber-500/90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Sequential Core Stage Container with Cinematic Slow Camera Zoom */}
      <motion.div
        animate={prefersReducedMotion ? {} : { scale: [1, 1.02] }}
        transition={{ duration: 6, ease: "linear" }}
        className="relative z-10 flex flex-col items-center max-w-xl w-full px-6 text-center select-none"
      >
        
        {/* SCENE 2 — Light Arrival (Descending golden light beam + circular ripple) */}
        <AnimatePresence>
          {scene === 2 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" id="welcome-scene-light">
              {/* Thin vertical elegant golden beam descending */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "120px", opacity: [0, 1, 1, 0] }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-[1.5px] bg-gradient-to-b from-transparent via-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] relative"
                style={{ top: 'calc(50% - 130px)' }}
              />
              
              {/* Expanding soft golden circular ripple */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
                className="absolute w-28 h-28 rounded-full border border-amber-500/30 pointer-events-none"
                style={{ top: 'calc(50% - 56px)' }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* LOGO CONTAINER: Animating through Scenes 3, 4, 5 */}
        <AnimatePresence>
          {scene >= 3 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1.0, opacity: scene === 8 ? 0 : 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="relative w-48 h-48 flex items-center justify-center mb-5"
            >
              {/* Scene 3 Soft Volumetric Gold Bloom Behind the Logo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: scene >= 3 ? 0.28 : 0 }}
                transition={{ duration: 1.0 }}
                className="absolute w-36 h-36 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,transparent_75%)] blur-md pointer-events-none"
              />

              {/* Scene 5 Rotating Gold Ring Behind the Logo */}
              <AnimatePresence>
                {scene >= 5 && (
                  <motion.div
                    initial={{ rotate: 0, opacity: 0, scale: 0.92 }}
                    animate={{ rotate: 360, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.0, ease: "easeInOut" }}
                    className="absolute w-40 h-40 rounded-full border border-amber-500/15 pointer-events-none"
                    style={{ borderStyle: 'solid', borderWidth: '1px' }}
                  />
                )}
              </AnimatePresence>

              {/* Symmetrical Pixel-Perfect Official Logo Vector */}
              <svg viewBox="0 0 200 200" className="w-40 h-40 relative z-10 drop-shadow-[0_4px_16px_rgba(0,0,0,0.92)]">
                {/* Scene 4: Original White Logo Symmetrical Thenkalai "U" Shape */}
                <motion.path
                  d="M 55,60 L 80,64 C 80,110 84,135 86,145 C 86,152 92,156 100,156 C 108,156 114,152 114,145 C 114,135 118,110 118,64 L 143,60 C 137,100 131,138 123,145 C 117,150 115,144 110,147 C 105,150 103,165 100,165 C 97,165 95,150 90,147 C 85,144 83,150 77,145 C 69,138 63,100 55,60 Z"
                  fill="#FFFFFF"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: scene >= 4 ? 1 : 0 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />

                {/* Scene 3: Original Red Namam Central Droplet / Flame (Fades in FIRST) */}
                <motion.path
                  d="M 100,45 C 99,68 91,108 91,126 C 91,138 95,144 100,144 C 105,144 109,138 109,126 C 109,108 101,68 100,45 Z"
                  fill="#E31E24"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: scene >= 3 ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCENE 6: BRAND REVEAL (Typography Fades in + Gold Underline Animates Out) */}
        <div className="h-32 flex flex-col items-center justify-start overflow-hidden relative select-none">
          <AnimatePresence>
            {scene >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: scene === 8 ? 0 : 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center space-y-3.5"
              >
                {/* Brand Name: Elegant luxury Serif Typography */}
                <h1 className="font-serif text-3xl sm:text-4.5xl font-bold tracking-[0.25em] text-white">
                  ALANKA<span className="text-amber-500 font-light italic">PRIYA</span>
                </h1>
                
                {/* Symmetrical Animated thin gold line below title */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 150 }}
                  transition={{ duration: 0.7, ease: "easeInOut", delay: 0.1 }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                />

                {/* Slogan: Modern uppercase sans-serif with space-grotesk tracking */}
                <h2 className="font-sans text-[10px] sm:text-[11px] font-extrabold tracking-[0.24em] text-stone-400 uppercase flex items-center justify-center space-x-2">
                  <span>Your Smart</span>
                  <span className="h-1 w-1 bg-amber-500 rounded-full inline-block" />
                  <span className="text-amber-400">Shopping Partner</span>
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SCENE 7: INTELLIGENT TRANSITION (Status label & thin gold loading bar completes once) */}
        <div className="h-24 flex flex-col items-center justify-center relative mt-3">
          <AnimatePresence>
            {scene >= 7 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: scene === 8 ? 0 : 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-72 space-y-3.5 text-center"
              >
                {/* Status caption */}
                <p className="text-[11.5px] text-stone-500 font-light tracking-wide">
                  Preparing your intelligent shopping experience...
                </p>

                {/* Symmetrical Thin Gold Progress Loader (animates left-to-right smoothly) */}
                <div className="w-56 h-[1px] bg-stone-900 rounded-full overflow-hidden mx-auto relative mt-2">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
