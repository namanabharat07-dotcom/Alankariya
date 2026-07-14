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
  // Animating steps 1 to 6
  const [step, setStep] = useState<number>(1);
  const [showSkip, setShowSkip] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Skip button appears after 2 seconds (per implementation instructions)
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);
    return () => clearTimeout(skipTimer);
  }, []);

  // Precise timing sequence aligned with the official 6-step flow (approx 6.5s total runtime)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // STEP 1: IGNITION (0:00 - 0:01) -> Golden beam descends, forming droplet & ripple.
    setStep(1);

    // STEP 2: FORMATION (0:01 - 0:02) -> White "U" shape emerges & red drop appears.
    timers.push(setTimeout(() => setStep(2), 1000));

    // STEP 3: REVEAL (0:02 - 0:03) -> Golden energy ring locks, bright flare shines.
    timers.push(setTimeout(() => {
      setStep(3);
      triggerRevealBurst();
    }, 2000));

    // STEP 4: ASCEND (0:03 - 0:04) -> Logo rises above a golden sunrise horizon.
    timers.push(setTimeout(() => setStep(4), 3100));

    // STEP 5: IDENTITY (0:04 - 0:05) -> ALANKAPRIYA and tagline fade in with ground light glow.
    timers.push(setTimeout(() => setStep(5), 4200));

    // STEP 6: WELCOME (0:05 - 0:06+) -> "WELCOME TO ALANKAPRIYA" + golden progress bar animation.
    timers.push(setTimeout(() => setStep(6), 5200));

    // TRANSITION: Fades into the homepage seamlessly
    timers.push(setTimeout(() => {
      localStorage.setItem('alankapriya_welcome_viewed', 'true');
      onComplete();
    }, 6900));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  // High-performance canvas particle system mimicking high-end luxury graphics (60 FPS)
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

    const goldColors = [
      'rgba(212, 175, 55, ',  // Metallic Gold
      'rgba(245, 158, 11, ',  // Amber Gold
      'rgba(251, 191, 36, ',  // Warm Yellow
      'rgba(255, 255, 255, '  // Diamond Sparkle White
    ];

    // Seed ambient dust particles
    const particles: Particle[] = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.5 - 0.15, // Drift upwards slowly like dust
      size: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.5 + 0.1,
      baseAlpha: Math.random() * 0.4 + 0.15,
      speedMultiplier: Math.random() * 0.4 + 0.8,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      color: goldColors[Math.floor(Math.random() * goldColors.length)]
    }));

    particlesRef.current = particles;

    let tick = 0;
    const draw = () => {
      tick += 0.012;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // Tail trailing effect for motion blur
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        // Subtle twinkling opacity
        p.alpha = p.baseAlpha + Math.sin(tick * p.twinkleSpeed * 110) * 0.12;
        p.alpha = Math.max(0.04, Math.min(0.9, p.alpha));

        // Lateral wavy movement
        p.x += p.vx + Math.sin(tick + p.y * 0.008) * 0.08;
        p.y += p.vy * p.speedMultiplier;

        // Reset if drifted off screen
        if (p.y < -15) {
          p.y = canvas.height + 15;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -15) p.x = canvas.width + 15;
        if (p.x > canvas.width + 15) p.x = -15;

        // Custom glow effect for high-end feel
        if (p.size > 1.5) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
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
  }, []);

  // Step 3 Energy Flare / Burst Particles
  const triggerRevealBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const burstCount = 50;
    const burstSparks: Particle[] = Array.from({ length: burstCount }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.5;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 1.0,
        alpha: 1,
        baseAlpha: 0.8,
        speedMultiplier: 1.05,
        twinkleSpeed: 0.03,
        color: 'rgba(245, 158, 11, ' // Gold sparks
      };
    });

    particlesRef.current = [...particlesRef.current, ...burstSparks];

    // Cull burst particles to prevent memory overhead
    setTimeout(() => {
      particlesRef.current = particlesRef.current.slice(0, 60);
    }, 2000);
  };

  const handleSkip = () => {
    localStorage.setItem('alankapriya_welcome_viewed', 'true');
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden select-none"
      id="brand-opening-wrapper"
    >
      {/* 1. Cinematic Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none" 
        style={{ mixBlendMode: 'screen' }} 
      />

      {/* 2. Premium Spotlight Radial Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_10%,rgba(0,0,0,0.92)_100%)]" 
      />

      {/* 3. Small Luxurious "Skip Intro" Button (Bottom Right) */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.6, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.03, borderColor: 'rgba(212,175,55,0.45)', backgroundColor: 'rgba(10,10,10,0.7)' }}
            onClick={handleSkip}
            className="absolute bottom-8 right-8 z-55 flex items-center space-x-1.5 px-4.5 py-2.5 rounded-full border border-stone-900 bg-stone-950/50 text-stone-300 text-[10px] font-extrabold uppercase tracking-[0.2em] transition-all cursor-pointer backdrop-blur-md shadow-2xl"
            id="brand-opening-skip"
          >
            <span>Skip Intro</span>
            <X className="h-3 w-3 text-amber-500" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Sequential Core Stage */}
      <div className="relative z-10 flex flex-col items-center max-w-xl w-full px-6 text-center select-none">
        
        {/* STEP 1: IGNITION */}
        <AnimatePresence>
          {step === 1 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" id="welcome-step-ignition">
              {/* Thin Golden Beam descending */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "45vh", opacity: [0, 1, 1, 0.8] }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="w-[2px] bg-gradient-to-b from-amber-400/10 via-amber-300 to-amber-500 shadow-[0_0_15px_#f59e0b] relative"
              />
              
              {/* Droplet & Golden Ripple at the collision point */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
                className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] mt-[-6px]"
              />

              <motion.div
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: [0.1, 2.8, 4.5], opacity: [0, 0.8, 0] }}
                transition={{ duration: 1.0, repeat: Infinity, repeatDelay: 0.2 }}
                className="absolute w-12 h-12 rounded-full border border-amber-500/40 mt-[34vh] pointer-events-none"
              />
            </div>
          )}
        </AnimatePresence>

        {/* LOGO CONTAINER: Animating through FORMATION, REVEAL and ASCEND */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              layoutId="luxury-brand-logo-id"
              initial={{ scale: 0.75, opacity: 0, y: 0 }}
              animate={{ 
                scale: step >= 3 ? 1 : 0.9, 
                opacity: 1,
                y: step >= 4 ? -45 : 0 // Rising upward in STEP 4 (ASCEND)
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="relative w-48 h-48 flex items-center justify-center mb-6"
            >
              {/* STEP 3 REVEAL: Symmetrical golden rotating ring */}
              <AnimatePresence>
                {step >= 3 && (
                  <motion.div
                    initial={{ rotate: -180, scale: 0.3, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute w-44 h-44 rounded-full border border-amber-500/25 shadow-[0_0_25px_rgba(245,158,11,0.12)] pointer-events-none"
                    style={{ borderStyle: 'double', borderWidth: '3px' }}
                  />
                )}
              </AnimatePresence>

              {/* Halo radial backing */}
              <div 
                className="absolute w-36 h-36 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.065)_0%,transparent_75%)] pointer-events-none" 
              />

              {/* Symmetrical High-Fidelity Official Namam Vector */}
              <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {/* Glowing Background white path */}
                <motion.path
                  d="M 55,60 L 80,64 C 80,110 84,135 86,145 C 86,152 92,156 100,156 C 108,156 114,152 114,145 C 114,135 118,110 118,64 L 143,60 C 137,100 131,138 123,145 C 117,150 115,144 110,147 C 105,150 103,165 100,165 C 97,165 95,150 90,147 C 85,144 83,150 77,145 C 69,138 63,100 55,60 Z"
                  fill="#FFFFFF"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />

                {/* Symmetrical Central Red Droplet (Sri Churnam) */}
                <motion.path
                  d="M 100,45 C 99,68 91,108 91,126 C 91,138 95,144 100,144 C 105,144 109,138 109,126 C 109,108 101,68 100,45 Z"
                  fill="#E31E24"
                  initial={{ scaleY: 0, originY: 1, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 4: ASCEND -> Sunrise/Golden Horizon at the bottom of the logo */}
        <AnimatePresence>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 0.85, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute bottom-[20vh] left-1/2 -translate-x-1/2 w-80 h-10 pointer-events-none select-none"
              id="welcome-step-ascend-horizon"
            >
              {/* Symmetrical Curved golden Horizon line representing smart shopping over Earth */}
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.8)] relative rounded-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent blur-md" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 5: IDENTITY -> ALANKAPRIYA Title and Tagline */}
        <div className="h-32 flex flex-col items-center justify-start overflow-hidden relative select-none">
          <AnimatePresence>
            {step >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {/* Brand Name: Serif typography styling */}
                <h1 className="font-serif text-3xl sm:text-4.5xl font-extrabold tracking-[0.25em] text-white">
                  ALANKA<span className="text-amber-500 font-light italic">PRIYA</span>
                </h1>
                
                {/* Tagline: Modern uppercase sans-serif with spacing */}
                <h2 className="font-sans text-[10px] sm:text-[11px] font-extrabold tracking-[0.22em] text-stone-400 uppercase flex items-center justify-center space-x-2">
                  <span>Your Smart</span>
                  <span className="h-1 w-1 bg-amber-500 rounded-full inline-block" />
                  <span className="text-amber-400">Shopping Partner</span>
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STEP 6: WELCOME -> Preparing your shopping experience with a gold bar progress indicator */}
        <div className="h-24 flex flex-col items-center justify-center relative mt-2">
          <AnimatePresence>
            {step >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-72 space-y-3 text-center"
              >
                {/* Welcome Heading */}
                <span className="font-sans text-[10px] font-black tracking-[0.38em] text-amber-500 uppercase block">
                  WELCOME
                </span>
                
                {/* Status caption */}
                <p className="text-[11px] text-stone-500 font-light tracking-wide">
                  Preparing your intelligent shopping experience...
                </p>

                {/* Symmetrical Thin Gold Progress Loader (animates left-to-right smoothly) */}
                <div className="w-56 h-[1.5px] bg-stone-900 rounded-full overflow-hidden mx-auto relative mt-2.5">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.3, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.9)]"
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
