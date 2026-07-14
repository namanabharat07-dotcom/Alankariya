import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, Smartphone, Laptop, Watch, ShoppingBag, 
  Home, Sparkle, Eye, Volume2, X 
} from 'lucide-react';

interface PremiumWelcomeProps {
  onComplete: () => void;
}

// Product sequence configuration for Step 1
const PRODUCT_SEQUENCE = [
  { id: 'phone', label: 'Smartphone', icon: Smartphone, color: 'text-amber-400' },
  { id: 'laptop', label: 'Laptop', icon: Laptop, color: 'text-blue-400' },
  { id: 'shoes', label: 'Running Shoes', icon: ShoppingBag, color: 'text-emerald-400' },
  { id: 'watch', label: 'Smartwatch', icon: Watch, color: 'text-purple-400' },
  { id: 'beauty', label: 'Beauty Product', icon: Sparkle, color: 'text-pink-400' },
  { id: 'appliance', label: 'Home Appliance', icon: Home, color: 'text-rose-400' }
];

// Messages for Step 3
const WELCOME_MESSAGES = [
  "Millions of products.",
  "Thousands of opinions.",
  "One confident decision."
];

// Promises for Step 4
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
  
  // Ref for the "Let's Begin" button to get its coordinates for particle dissolve
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dissolveParticles, setDissolveParticles] = useState<{ id: number; x: number; y: number; tx: number; ty: number; size: number; delay: number }[]>([]);
  const [isDissolving, setIsDissolving] = useState<boolean>(false);

  // Skip button appears after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Main animation timeline
  useEffect(() => {
    // Timeline timeouts
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let productInterval: NodeJS.Timeout;

    // Step 0: Glowing Orb (0 to 2.5s) -> Move to Step 1
    timer1 = setTimeout(() => {
      setStep(1);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(productInterval);
    };
  }, []);

  // Step 1: Product Universe sequence (2.5s to 8.5s)
  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setProductIndex((prev) => {
          if (prev < PRODUCT_SEQUENCE.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            // Move to Step 2: AI Intelligence Transition
            setStep(2);
            return prev;
          }
        });
      }, 1000); // 1s per product

      return () => clearInterval(interval);
    }
  }, [step]);

  // Step 2: Transition from universe to Logo (8.5s to 10s)
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => {
        setStep(3);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Step 3: Welcome Messages (one sentence at a time, fade in & rise)
  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => {
          if (prev < WELCOME_MESSAGES.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            // Transition to Step 4: AI Promise after brief delay
            setTimeout(() => {
              setStep(4);
            }, 1800);
            return prev;
          }
        });
      }, 2000); // 2s per message

      return () => clearInterval(interval);
    }
  }, [step]);

  // Step 4: AI Promise Animated Checkmarks
  useEffect(() => {
    if (step === 4) {
      const addPromise = (index: number) => {
        if (index < AI_PROMISES.length) {
          setTimeout(() => {
            setVisiblePromises(prev => [...prev, index]);
            addPromise(index + 1);
          }, 1000); // 1s stagger
        } else {
          // Transition to Step 5: Floating welcome card
          setTimeout(() => {
            setStep(5);
          }, 1500);
        }
      };
      addPromise(0);
    }
  }, [step]);

  // Trigger skip
  const handleSkip = () => {
    // Skip goes straight to the final glass card step
    setStep(5);
  };

  // Trigger Let's Begin & Dissolve animation
  const handleLetsBegin = () => {
    if (isDissolving) return;
    setIsDissolving(true);

    // Get position of Let's Begin button and search bar target
    const btnRect = buttonRef.current?.getBoundingClientRect() || { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 200, height: 50 };
    const searchWrap = document.getElementById('home-hero-search-wrap');
    const searchRect = searchWrap?.getBoundingClientRect() || { left: window.innerWidth / 2, top: window.innerHeight * 0.4, width: 500, height: 60 };

    // Generate 40 beautiful golden particles flowing from the button to the search bar
    const particles = Array.from({ length: 45 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 40;
      const startX = btnRect.left + btnRect.width / 2 + Math.cos(angle) * r;
      const startY = btnRect.top + btnRect.height / 2 + Math.sin(angle) * r;

      // Target position inside search bar
      const targetX = searchRect.left + searchRect.width / 2 + (Math.random() - 0.5) * (searchRect.width * 0.6);
      const targetY = searchRect.top + searchRect.height / 2 + (Math.random() - 0.5) * 15;

      return {
        id: i,
        x: startX,
        y: startY,
        tx: targetX,
        ty: targetY,
        size: Math.random() * 5 + 3,
        delay: Math.random() * 0.3
      };
    });

    setDissolveParticles(particles);

    // Complete experience after particle flight ends
    setTimeout(() => {
      // Store viewed flag
      localStorage.setItem('alankapriya_welcome_viewed', 'true');
      onComplete();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950 text-white overflow-hidden select-none">
      {/* Subtle Futuristic Ambient Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-stone-600/10 blur-3xl animate-pulse" />

      {/* Skip Button */}
      <AnimatePresence>
        {showSkip && step < 5 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-50 flex items-center space-x-1.5 px-4 py-2 rounded-full border border-stone-800 bg-stone-900/60 hover:bg-stone-850 hover:border-amber-900/40 text-stone-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg backdrop-blur-md"
            id="welcome-skip-btn"
          >
            <span>Skip Intro</span>
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* STEP-BASED SCENE PRESENTATIONS */}
      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center justify-center text-center">
        
        {/* Step 0 & 1 & 2: Glowing AI Orb & Product Universe Morphing */}
        {step <= 2 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1 }}
            className="relative flex items-center justify-center w-72 h-72"
          >
            {/* Soft background glow halo */}
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-amber-500/20 to-stone-400/20 blur-2xl"
            />
            
            {/* Pulsing breathing AI Orb */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 25, ease: "linear" }
              }}
              className="w-48 h-48 rounded-full border border-amber-500/20 bg-gradient-to-tr from-amber-550/10 via-stone-900/40 to-stone-800/20 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex items-center justify-center backdrop-blur-xl relative"
            >
              <div className="absolute inset-2 rounded-full border border-white/5 bg-stone-950/40" />
              
              {/* Product Morph Space */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {step === 0 ? (
                    <motion.div
                      key="sparkles"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5 }}
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
                          initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 1.4, rotate: 15 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="flex flex-col items-center"
                        >
                          <Icon className={`h-12 w-12 ${prod.color} drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]`} />
                          <motion.span 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 0.8, y: 0 }}
                            className="text-[10px] uppercase font-mono tracking-widest text-stone-400 mt-2 font-semibold"
                          >
                            {prod.label}
                          </motion.span>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3 & 4: Welcome Messages & Promises with Checkmarks */}
        {step >= 3 && step <= 4 && (
          <div className="w-full space-y-12">
            
            {/* Alankapriya Glowing Logo */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-850 border border-amber-600/30 text-stone-50 font-display font-medium text-3xl shadow-[0_0_30px_rgba(146,64,14,0.3)]">
                A
              </div>
              <span className="font-display font-bold text-3xl tracking-wide text-[#faf9f6]">
                Alanka<span className="text-amber-500 font-light italic">riya</span>
              </span>
            </motion.div>

            {/* Welcome messages block */}
            <div className="h-16 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {step === 3 && WELCOME_MESSAGES.map((msg, idx) => {
                  if (idx !== messageIndex) return null;
                  const isLast = idx === WELCOME_MESSAGES.length - 1;
                  return (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ 
                        opacity: isLast ? 1 : 0.85, 
                        y: 0,
                        scale: isLast ? 1.05 : 1,
                      }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`text-xl sm:text-2xl font-display tracking-wide ${
                        isLast 
                          ? "text-amber-300 font-extrabold drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]" 
                          : "text-stone-300 font-light"
                      }`}
                    >
                      {msg}
                    </motion.p>
                  );
                })}

                {step === 4 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl sm:text-2xl font-display font-extrabold text-amber-300 tracking-wide drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                  >
                    One confident decision.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* AI Promises Animated Checkmarks */}
            {step === 4 && (
              <div className="max-w-xs mx-auto text-left space-y-3 pt-6 border-t border-stone-900">
                {AI_PROMISES.map((promise, idx) => {
                  const isVisible = visiblePromises.includes(idx);
                  return (
                    <div key={idx} className="h-6 overflow-hidden">
                      <AnimatePresence>
                        {isVisible && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex items-center space-x-3 text-stone-300 text-xs sm:text-sm font-light"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            >
                              <Check className="h-3 w-3 stroke-[3]" />
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
          </div>
        )}

        {/* Step 5: Floating Glass Welcome Card & Let's Begin Button */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: isDissolving ? 0 : 1, 
              scale: isDissolving ? 0.95 : 1, 
              y: isDissolving ? -15 : 0 
            }}
            transition={{ duration: 0.5 }}
            className="w-full relative"
          >
            {/* Glowing background behind card */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-600/20 via-yellow-600/10 to-stone-600/20 blur-xl opacity-70" />
            
            {/* Premium glassmorphism card */}
            <div className="relative bg-stone-900/70 border border-stone-800 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl text-center space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-850/50 border border-amber-600/30 text-stone-50 font-display font-medium text-3xl shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                A
              </motion.div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#faf9f6] tracking-tight">
                  Welcome to Alankapriya
                </h2>
                <div className="h-0.5 w-12 bg-amber-500/30 mx-auto rounded" />
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light max-w-sm mx-auto">
                Every recommendation you'll see is designed to explain why it fits your needs—not just tell you what to buy.
              </p>

              <div className="pt-4">
                <motion.button
                  ref={buttonRef}
                  onClick={handleLetsBegin}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ 
                    boxShadow: ["0 0 10px rgba(180,83,9,0.3)", "0 0 20px rgba(180,83,9,0.6)", "0 0 10px rgba(180,83,9,0.3)"]
                  }}
                  transition={{ 
                    boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                  }}
                  className="w-full inline-flex items-center justify-center space-x-2.5 rounded-xl bg-amber-700 hover:bg-amber-650 text-white font-bold text-xs uppercase tracking-wider py-4 px-6 shadow-xl cursor-pointer transition-colors"
                  id="welcome-lets-begin-btn"
                >
                  <Sparkles className="h-4 w-4 fill-white text-white animate-pulse" />
                  <span>✨ Let's Begin</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Particle dissolve flight layer */}
      {isDissolving && (
        <div className="absolute inset-0 z-55 pointer-events-none">
          {dissolveParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
              animate={{ 
                x: p.tx, 
                y: p.ty, 
                opacity: [1, 0.9, 0],
                scale: [1, 0.8, 0.1]
              }}
              transition={{ 
                duration: 0.9, 
                delay: p.delay, 
                ease: "easeInOut" 
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #f59e0b 0%, #d97706 70%, transparent 100%)',
                boxShadow: '0 0 8px rgba(245,158,11,0.8)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
