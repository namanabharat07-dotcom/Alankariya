import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, Smartphone, Laptop, Watch, ShoppingBag, 
  Home, Sparkle, X 
} from 'lucide-react';

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

// Product universe morphing sequence
const PRODUCT_SEQUENCE = [
  { id: 'phone', label: 'Smartphone', icon: Smartphone, color: 'text-amber-400' },
  { id: 'laptop', label: 'Laptop', icon: Laptop, color: 'text-blue-400' },
  { id: 'shoes', label: 'Running Shoes', icon: ShoppingBag, color: 'text-emerald-400' },
  { id: 'watch', label: 'Smartwatch', icon: Watch, color: 'text-purple-400' },
  { id: 'beauty', label: 'Beauty Product', icon: Sparkle, color: 'text-pink-400' },
  { id: 'appliance', label: 'Home Appliance', icon: Home, color: 'text-rose-400' }
];

// Welcome messages
const WELCOME_MESSAGES = [
  "Millions of products.",
  "Thousands of opinions.",
  "One confident decision."
];

// AI Promises
const AI_PROMISES = [
  "We analyze products.",
  "We compare options.",
  "We explain every recommendation.",
  "You buy with confidence."
];

export default function PremiumWelcome({ onComplete }: PremiumWelcomeProps) {
  const [step, setStep] = useState<number>(0);
  const [productIndex, setProductIndex] = useState<number>(0);
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [visiblePromises, setVisiblePromises] = useState<number[]>([]);
  const [showSkip, setShowSkip] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  const [dissolveParticles, setDissolveParticles] = useState<{ id: number; x: number; y: number; tx: number; ty: number; size: number; delay: number }[]>([]);
  const [isDissolving, setIsDissolving] = useState<boolean>(false);

  // Detect accessibility preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Show skip button after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Main automated animation timeline (Plays only once, total duration 5.5 - 5.8 seconds)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Step 0: Glowing Orb with Sparkle (0s to 1.0s)
    setStep(0);

    // Step 1: Product Universe Morphing (1.0s to 2.2s)
    timers.push(setTimeout(() => {
      setStep(1);
    }, 1000));

    // Step 3: Brand Identity & Welcome Messages (2.2s to 3.8s)
    timers.push(setTimeout(() => {
      setStep(3);
    }, 2200));

    // Step 4: AI Promises Animated Checkmarks (3.8s to 4.9s)
    timers.push(setTimeout(() => {
      setStep(4);
    }, 3800));

    // Trigger Dissolve and Complete (4.9s to 5.8s)
    timers.push(setTimeout(() => {
      triggerAutomaticDissolve();
    }, 4900));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  // Step 1 Product Index cycle (staggered fast and elegantly every 200ms)
  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setProductIndex((prev) => {
          if (prev < PRODUCT_SEQUENCE.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Step 3 Message progression (500ms per message for tight premium readability)
  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => {
          if (prev < WELCOME_MESSAGES.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Step 4 Promise checklist animation (250ms stagger)
  useEffect(() => {
    if (step === 4) {
      const addPromise = (index: number) => {
        if (index < AI_PROMISES.length) {
          setTimeout(() => {
            setVisiblePromises(prev => [...prev, index]);
            addPromise(index + 1);
          }, 250);
        }
      };
      addPromise(0);
    }
  }, [step]);

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

    // Seed beautiful luxury gold & white ambient dust particles
    const particleCount = prefersReducedMotion ? 15 : 40;
    const goldColors = [
      'rgba(212, 175, 55, ',  // Luxury Gold
      'rgba(245, 158, 11, ',  // Warm Amber
      'rgba(255, 255, 255, '  // Diamond Sparkle White
    ];

    const particles: Particle[] = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.25 - 0.1, // Slow majestic upward drift
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.05,
      baseAlpha: Math.random() * 0.3 + 0.1,
      speedMultiplier: Math.random() * 0.4 + 0.8,
      twinkleSpeed: Math.random() * 0.01 + 0.004,
      color: goldColors[Math.floor(Math.random() * goldColors.length)]
    }));

    particlesRef.current = particles;

    let tick = 0;
    const draw = () => {
      tick += 0.01;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // Smooth motion blur trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        // Subtle twinkling opacity
        p.alpha = p.baseAlpha + Math.sin(tick * p.twinkleSpeed * 100) * 0.12;
        p.alpha = Math.max(0.04, Math.min(0.85, p.alpha));

        // Lateral waving drift
        p.x += p.vx + Math.sin(tick + p.y * 0.005) * 0.06;
        p.y += p.vy * p.speedMultiplier;

        // Reset if drifted off screen
        if (p.y < -15) {
          p.y = canvas.height + 15;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -15) p.x = canvas.width + 15;
        if (p.x > canvas.width + 15) p.x = -15;

        // Light luxury glow effect
        if (p.size > 1.1 && !prefersReducedMotion) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.35)';
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

  // Trigger Automatic Dissolve & transition gracefully into homepage
  const triggerAutomaticDissolve = () => {
    if (isDissolving) return;
    setIsDissolving(true);

    // Start coordinates center of screen
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2 - 60;
    
    const searchWrap = document.getElementById('home-hero-search-wrap');
    const searchRect = searchWrap?.getBoundingClientRect() || { 
      left: window.innerWidth / 2 - 250, 
      top: window.innerHeight * 0.45, 
      width: 500, 
      height: 60 
    };

    // Generate 45 beautiful golden flight particles
    const particles = Array.from({ length: 45 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 50;
      const pStartX = startX + Math.cos(angle) * r;
      const pStartY = startY + Math.sin(angle) * r;

      // Target position inside search bar
      const targetX = searchRect.left + searchRect.width / 2 + (Math.random() - 0.5) * (searchRect.width * 0.7);
      const targetY = searchRect.top + searchRect.height / 2 + (Math.random() - 0.5) * 20;

      return {
        id: i,
        x: pStartX,
        y: pStartY,
        tx: targetX,
        ty: targetY,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 0.25
      };
    });

    setDissolveParticles(particles);

    // Complete experience after particle flight ends (900ms)
    setTimeout(() => {
      localStorage.setItem('alankapriya_intro_seen', 'true');
      onComplete();
    }, 900);
  };

  // Skip button fast-forwards directly to complete
  const handleSkip = () => {
    localStorage.setItem('alankapriya_intro_seen', 'true');
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060404] overflow-hidden select-none"
      id="alankapriya-welcome-universe"
    >
      {/* 1. Cinematic Ambient Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none" 
        style={{ mixBlendMode: 'screen' }} 
      />

      {/* 2. Premium Spotlight Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_15%,rgba(0,0,0,0.96)_100%)]" 
      />

      {/* 3. Skip Button (Top Right) */}
      <AnimatePresence>
        {showSkip && !isDissolving && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.02, borderColor: 'rgba(212,175,55,0.4)', backgroundColor: 'rgba(255,255,255,0.06)' }}
            onClick={handleSkip}
            className="absolute top-8 right-8 z-55 flex items-center space-x-1.5 px-4.5 py-2 rounded-full border border-stone-850/80 bg-stone-900/40 text-stone-300 text-[10px] font-bold uppercase tracking-[0.18em] transition-all cursor-pointer backdrop-blur-md shadow-2xl"
            id="brand-welcome-skip"
            aria-label="Skip Intro"
          >
            <span>Skip Intro</span>
            <X className="h-3 w-3 text-amber-500" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Timeline Presentation */}
      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center justify-center text-center">
        
        {/* Step 0 & 1: Glowing AI Orb & Product Universe Morphing */}
        {step <= 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isDissolving ? { opacity: 0, scale: 0.9, y: -20 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex items-center justify-center w-72 h-72"
          >
            {/* Ambient background glow halo */}
            <motion.div 
              animate={{ 
                scale: [1, 1.12, 1],
                opacity: [0.35, 0.55, 0.35]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute w-60 h-60 rounded-full bg-gradient-to-tr from-amber-500/15 to-stone-500/10 blur-2xl pointer-events-none"
            />
            
            {/* Glowing Breathing AI Orb */}
            <motion.div 
              animate={{ 
                scale: [1, 1.04, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 25, ease: "linear" }
              }}
              className="w-48 h-48 rounded-full border border-amber-500/15 bg-gradient-to-tr from-amber-550/[0.08] via-stone-950/50 to-stone-850/15 shadow-[0_0_50px_rgba(245,158,11,0.12)] flex items-center justify-center backdrop-blur-xl relative"
            >
              <div className="absolute inset-1.5 rounded-full border border-white/5 bg-stone-950/50" />
              
              {/* Universe Icons */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {step === 0 ? (
                    <motion.div
                      key="sparkles"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.4 }}
                      className="text-amber-400"
                    >
                      <Sparkles className="h-10 w-10 animate-pulse" />
                    </motion.div>
                  ) : (
                    PRODUCT_SEQUENCE.map((prod, idx) => {
                      if (idx !== productIndex) return null;
                      const Icon = prod.icon;
                      return (
                        <motion.div
                          key={prod.id}
                          initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 1.3, rotate: 12 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="flex flex-col items-center"
                        >
                          <Icon className={`h-11 w-11 ${prod.color} drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]`} />
                          <span className="text-[9px] uppercase font-mono tracking-widest text-stone-500 mt-2 font-semibold">
                            {prod.label}
                          </span>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3 & 4: Brand Identity & Promises with Symmetrical Official Namam Logo */}
        {step >= 3 && (
          <motion.div
            animate={isDissolving ? { opacity: 0, scale: 0.94, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-10"
          >
            {/* Alankapriya Symmetrical Logo with Namam */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)] blur-md pointer-events-none" />
                
                <svg viewBox="0 0 200 200" className="w-32 h-32 relative z-10 drop-shadow-[0_4px_16px_rgba(0,0,0,0.92)]">
                  {/* Symmetrical White Thenkalai "U" Shape */}
                  <path
                    d="M 55,60 L 80,64 C 80,110 84,135 86,145 C 86,152 92,156 100,156 C 108,156 114,152 114,145 C 114,135 118,110 118,64 L 143,60 C 137,100 131,138 123,145 C 117,150 115,144 110,147 C 105,150 103,165 100,165 C 97,165 95,150 90,147 C 85,144 83,150 77,145 C 69,138 63,100 55,60 Z"
                    fill="#FFFFFF"
                  />

                  {/* Symmetrical Central Red Flame / Sri Churnam Namam */}
                  <path
                    d="M 100,45 C 99,68 91,108 91,126 C 91,138 95,144 100,144 C 105,144 109,138 109,126 C 109,108 101,68 100,45 Z"
                    fill="#E31E24"
                  />
                </svg>
              </div>

              {/* Wordmark and Tagline */}
              <div className="text-center space-y-2 select-none">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-[0.25em] text-white">
                  ALANKA<span className="text-amber-500 font-light italic">PRIYA</span>
                </h1>
                
                <h2 className="font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.22em] text-stone-400 uppercase flex items-center justify-center space-x-1.5">
                  <span>Your Smart</span>
                  <span className="h-1 w-1 bg-amber-500 rounded-full inline-block" />
                  <span className="text-amber-400">Shopping Partner</span>
                </h2>
              </div>
            </div>

            {/* Step 3: Welcome Messages Progression block */}
            {step === 3 && (
              <div className="h-14 flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  {WELCOME_MESSAGES.map((msg, idx) => {
                    if (idx !== messageIndex) return null;
                    const isLast = idx === WELCOME_MESSAGES.length - 1;
                    return (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ 
                          opacity: isLast ? 1 : 0.85, 
                          y: 0,
                          scale: isLast ? 1.04 : 1,
                        }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`text-lg sm:text-xl tracking-wide ${
                          isLast 
                            ? "text-amber-300 font-extrabold drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                            : "text-stone-300 font-light"
                        }`}
                      >
                        {msg}
                      </motion.p>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Step 4: AI Promises Animated Checkmarks */}
            {step === 4 && (
              <div className="max-w-xs mx-auto text-left space-y-2.5 pt-5 border-t border-stone-900/50">
                {AI_PROMISES.map((promise, idx) => {
                  const isVisible = visiblePromises.includes(idx);
                  return (
                    <div key={idx} className="h-6 overflow-hidden">
                      <AnimatePresence>
                        {isVisible && (
                          <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center space-x-2.5 text-stone-300 text-xs font-light"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1, type: "spring", stiffness: 350, damping: 22 }}
                              className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-950 border border-emerald-550/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                            >
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </motion.div>
                            <span className={idx === AI_PROMISES.length - 1 ? "font-bold text-stone-100" : ""}>
                              {promise}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

          </motion.div>
        )}

      </div>

      {/* 5. Particle Dissolve Flight Layer */}
      {isDissolving && (
        <div className="absolute inset-0 z-55 pointer-events-none">
          {dissolveParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
              animate={{ 
                x: p.tx, 
                y: p.ty, 
                opacity: [1, 0.85, 0],
                scale: [1, 0.75, 0.1]
              }}
              transition={{ 
                duration: 0.85, 
                delay: p.delay, 
                ease: "easeInOut" 
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #f59e0b 0%, #d97706 70%, transparent 100%)',
                boxShadow: '0 0 6px rgba(245,158,11,0.7)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
