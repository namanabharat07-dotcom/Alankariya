import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children, route }: { children: React.ReactNode; route?: string }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  
  // Custom cursor states
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Monitor prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    // If reduced motion is preferred, do not initialize Lenis
    if (prefersReducedMotion) {
      ScrollTrigger.refresh();
      return () => {};
    }

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard expo-out easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Synchronize ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP ticker with Lenis raf
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Initial ScrollTrigger refresh
    ScrollTrigger.refresh();

    // Cleanup function
    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tick);
    };
  }, [prefersReducedMotion]);

  // Custom Cursor mouse tracking with Lerp (smooth lag)
  useEffect(() => {
    if (isTouchDevice || typeof window === 'undefined') return;

    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;
    if (!cursorDot || !cursorRing) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Instantly position the small dot
      gsap.set(cursorDot, { x: mouseX, y: mouseY });
    };

    // Keep custom cursor hidden when outside the window
    const onMouseLeaveWindow = () => {
      gsap.to([cursorDot, cursorRing], { opacity: 0, duration: 0.3 });
    };

    const onMouseEnterWindow = () => {
      gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeaveWindow);
    document.addEventListener('mouseenter', onMouseEnterWindow);

    // Lerp logic for the circular ring (interpolation lag)
    const render = () => {
      const lerpFactor = 0.15; // smooth lag factor
      ringX += (mouseX - ringX) * lerpFactor;
      ringY += (mouseY - ringY) * lerpFactor;

      gsap.set(cursorRing, { x: ringX, y: ringY });
      requestAnimationFrame(render);
    };
    
    const animationFrameId = requestAnimationFrame(render);

    // Interactive hover triggers for links, buttons, and custom cursor text
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('button, a, [role="button"], input, select, .clickable, img');
      
      if (interactiveEl) {
        setIsHovered(true);
        const label = interactiveEl.getAttribute('data-cursor-label');
        if (label) {
          setCursorText(label);
        } else {
          setCursorText('');
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('button, a, [role="button"], input, select, .clickable, img');
      
      if (interactiveEl) {
        setIsHovered(false);
        setCursorText('');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeaveWindow);
      document.removeEventListener('mouseenter', onMouseEnterWindow);
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isTouchDevice]);

  // Main GSAP ScrollTrigger animation sets
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. SPLIT-TYPE STAGGER REVEAL FOR HEADINGS
      const lineReveals = document.querySelectorAll('.line-reveal');
      lineReveals.forEach((el) => {
        if (prefersReducedMotion) {
          // Keep a simple clean opacity fade-in
          gsap.fromTo(
            el,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.8,
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        } else {
          const text = el.textContent || '';
          const words = text.split(/\s+/);
          
          // Clear original text and wrap each word in nested structures for premium overflow-masked slide up
          el.innerHTML = words
            .map(word => `<span class="inline-block overflow-hidden mr-[0.25em]"><span class="line-word-inner inline-block translate-y-[110%] opacity-0 transform transition-transform duration-75">${word}</span></span>`)
            .join(' ');

          const innerSpans = el.querySelectorAll('.line-word-inner');
          gsap.fromTo(
            innerSpans,
            { y: '110%', opacity: 0 },
            {
              y: '0%',
              opacity: 1,
              duration: 1.1,
              stagger: 0.05,
              ease: 'power4.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });

      // 2. PARAGRAPHS REVEAL NATURALLY
      const paragraphReveals = document.querySelectorAll('.p-reveal');
      paragraphReveals.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: prefersReducedMotion ? 0 : 15 },
          {
            opacity: 1,
            y: 0,
            duration: prefersReducedMotion ? 0.6 : 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      });

      // 3. CURTAIN CLIP-PATH REVEAL ON MEDIA/IMAGES
      const curtainReveals = document.querySelectorAll('.curtain-reveal');
      curtainReveals.forEach((el) => {
        const img = el.querySelector('img');
        if (prefersReducedMotion) {
          // Simple clean fade-in
          gsap.fromTo(el,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.8,
              scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none none',
              }
            }
          );
        } else {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none none',
            }
          });

          tl.fromTo(el,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut' }
          );

          if (img) {
            tl.fromTo(img,
              { scale: 1.15 },
              { scale: 1, duration: 1.6, ease: 'power3.out' },
              0
            );
          }
        }
      });

      // 4. PARALLAX COLUMN GRID (3D SCROLL FEELING) - Bypassed entirely for prefersReducedMotion
      if (!prefersReducedMotion) {
        const colSlow = document.querySelectorAll('.parallax-col-slow');
        colSlow.forEach((col) => {
          gsap.fromTo(col,
            { y: '30px' },
            {
              y: '-30px',
              ease: 'none',
              scrollTrigger: {
                trigger: col,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              }
            }
          );
        });

        const colFast = document.querySelectorAll('.parallax-col-fast');
        colFast.forEach((col) => {
          gsap.fromTo(col,
            { y: '-30px' },
            {
              y: '30px',
              ease: 'none',
              scrollTrigger: {
                trigger: col,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              }
            }
          );
        });
      }

      // 5. MAGNETIC BUTTONS (MICRO INTERACTION) - Bypassed entirely for prefersReducedMotion
      if (!prefersReducedMotion) {
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach((el) => {
          const element = el as HTMLElement;
          const xTo = gsap.quickTo(element, 'x', { duration: 0.3, ease: 'power3.out' });
          const yTo = gsap.quickTo(element, 'y', { duration: 0.3, ease: 'power3.out' });

          const onMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = element.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;
            const deltaX = clientX - centerX;
            const deltaY = clientY - centerY;

            // Soft elastic translation multiplier
            xTo(deltaX * 0.38);
            yTo(deltaY * 0.38);
          };

          const onMouseLeave = () => {
            xTo(0);
            yTo(0);
          };

          element.addEventListener('mousemove', onMouseMove);
          element.addEventListener('mouseleave', onMouseLeave);
        });
      }

      // 6. STICKY PINNED SCROLL WITH CROSSFADE
      const stickySection = document.getElementById('home-sticky-pinned-gallery');
      const stickyLeftCol = document.querySelector('.sticky-pinned-left-col');
      
      if (stickySection && stickyLeftCol) {
        // Only pin and scrub if prefersReducedMotion is false
        if (!prefersReducedMotion && window.innerWidth >= 1024) {
          ScrollTrigger.create({
            trigger: stickySection,
            start: "top 12%",
            end: "bottom 88%",
            pin: stickyLeftCol,
            pinSpacing: false,
            scrub: true,
          });
        }

        const textBlocks = document.querySelectorAll('.sticky-pinned-text-block');
        textBlocks.forEach((block, index) => {
          ScrollTrigger.create({
            trigger: block,
            start: prefersReducedMotion ? "top 80%" : "top 50%",
            end: prefersReducedMotion ? "bottom 20%" : "bottom 50%",
            onEnter: () => {
              textBlocks.forEach((tb, i) => {
                const imgEl = document.querySelector(`.active-pinned-image-${i}`);
                if (imgEl) {
                  if (i === index) {
                    imgEl.classList.add('opacity-100', 'z-20');
                    imgEl.classList.remove('opacity-0', 'z-10');
                  } else {
                    imgEl.classList.add('opacity-0', 'z-10');
                    imgEl.classList.remove('opacity-100', 'z-20');
                  }
                }
              });
            },
            onEnterBack: () => {
              textBlocks.forEach((tb, i) => {
                const imgEl = document.querySelector(`.active-pinned-image-${i}`);
                if (imgEl) {
                  if (i === index) {
                    imgEl.classList.add('opacity-100', 'z-20');
                    imgEl.classList.remove('opacity-0', 'z-10');
                  } else {
                    imgEl.classList.add('opacity-0', 'z-10');
                    imgEl.classList.remove('opacity-100', 'z-20');
                  }
                }
              });
            }
          });
        });
      }
    }, scrollContainerRef);

    // Initial ScrollTrigger refresh
    ScrollTrigger.refresh();

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      }, 250);
    };
    window.addEventListener('resize', handleResize);

    // Font loading handler
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      });
    }

    // Image loading handler to prevent layout shifts from breaking scroll positions
    const handleImageLoad = () => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    };

    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', handleImageLoad);
    });

    return () => {
      ctx.revert(); // Kills all ScrollTrigger and GSAP animations cleanly on change/unmount!
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      imgs.forEach((img) => {
        img.removeEventListener('load', handleImageLoad);
      });
    };
  }, [children, prefersReducedMotion]);

  // Handle route change transitions cleanly
  useEffect(() => {
    if (!lenisRef.current) return;

    // Reset scroll to top on route change
    lenisRef.current.scrollTo(0, { immediate: true });

    // Recalculate dimensions after route change completes
    const timer = setTimeout(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    }, 150);

    return () => clearTimeout(timer);
  }, [route]);

  return (
    <div ref={scrollContainerRef} className="smooth-scroll-wrapper w-full relative">
      {/* Dynamic Custom Cursor (Difference blend effect for cinematic feel) */}
      {!isTouchDevice && (
        <>
          <div
            ref={cursorDotRef}
            className="fixed top-0 left-0 w-1.5 h-1.5 bg-amber-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
          />
          <div
            ref={cursorRingRef}
            style={{ mixBlendMode: 'difference' }}
            className={`fixed top-0 left-0 rounded-full border border-amber-400 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out ${
              isHovered 
                ? 'w-16 h-16 bg-[#F5F5F0]/10 border-white/60 scale-110' 
                : 'w-8 h-8 scale-100 bg-transparent'
            }`}
          >
            {cursorText && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5F5F0] font-bold select-none animate-fade-in">
                {cursorText}
              </span>
            )}
          </div>
        </>
      )}

      {/* Background Noise layer for organic filmic analog style */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9997] opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Floating Animated Radial Gradients for premium depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-600/5 blur-[120px] animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute bottom-[10%] right-[15%] w-[700px] h-[700px] rounded-full bg-stone-500/5 blur-[150px] animate-pulse" style={{ animationDuration: '14s' }} />
      </div>

      {children}
    </div>
  );
}
