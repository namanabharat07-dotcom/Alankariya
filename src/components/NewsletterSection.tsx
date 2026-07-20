import React, { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, ArrowRight, X, Sparkles, Bell, Percent, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToNewsletterInFirestore, checkNewsletterSubscriptionStatus } from '../lib/firebase';
import { subscribeUser } from '../lib/marketing';
import { NewsletterSubscriber } from '../types';

interface SubscriptionFormProps {
  source: 'homepage' | 'footer' | 'popup' | 'banner';
  onSuccess?: () => void;
  compact?: boolean;
}

// Reusable elegant subscription form component with premium validation & states
export function SubscriptionForm({ source, onSuccess, compact = false }: SubscriptionFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (emailStr: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailStr.trim()) {
      return 'Email address is required.';
    }
    if (!regex.test(emailStr)) {
      return 'Please enter a valid email address.';
    }
    const domain = emailStr.split('@')[1]?.toLowerCase();
    const disposableDomains = ['mailinator.com', 'yopmail.com', '10minutemail.com', 'trashmail.com', 'tempmail.com'];
    if (domain && disposableDomains.includes(domain)) {
      return 'Disposable emails are blocked for security.';
    }
    return null;
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const validationError = validateEmail(email);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      
      // 1. Check duplicate subscription in newsletterSubscribers
      const existingStatus = await checkNewsletterSubscriptionStatus(cleanEmail);
      if (existingStatus === 'active') {
        setStatus('success');
        setEmail('');
        if (onSuccess) onSuccess();
        return;
      }

      // 2. Fetch country metadata (fail-safe)
      let country = 'India';
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.country_name) {
            country = geoData.country_name;
          }
        }
      } catch (e) {
        console.warn('Silent geolocation retrieval fallback:', e);
      }

      // 3. Detect device
      const isMobile = window.innerWidth < 768;
      const device = isMobile ? 'mobile' : 'desktop';

      // 4. Construct subscriber object
      const subscriber: NewsletterSubscriber = {
        email: cleanEmail,
        createdAt: new Date().toISOString(),
        status: 'active',
        source,
        device,
        country,
        lastUpdated: new Date().toISOString()
      };

      // 5. Store in Firebase collections (Legacy subscribers + New newsletterSubscribers)
      await subscribeToNewsletterInFirestore(subscriber);
      
      try {
        await subscribeUser(cleanEmail);
      } catch (legacyErr) {
        console.warn('Legacy subscription synch completed silently:', legacyErr);
      }

      setStatus('success');
      setEmail('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Subscription system error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Subscription failed. Please check your network connection.');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubscribe} className="relative flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
            <Mail className="h-4.5 w-4.5" />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            placeholder="Enter your premium email address"
            className={`w-full rounded-2xl border bg-stone-900/40 text-stone-100 placeholder:text-stone-500 py-3.5 pl-11 pr-4 text-sm outline-none transition-all duration-300 backdrop-blur-md ${
              status === 'error'
                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-900/30'
                : 'border-stone-850 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20'
            } disabled:opacity-50`}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`relative overflow-hidden inline-flex items-center justify-center space-x-2 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 shadow-lg shadow-amber-500/10 transition-all duration-300 cursor-pointer ${
            compact ? 'sm:px-5' : 'sm:px-7'
          } disabled:opacity-80 disabled:cursor-not-allowed`}
        >
          {status === 'loading' ? (
            <span className="flex items-center space-x-1.5">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-950 border-t-transparent" />
              <span>Securing...</span>
            </span>
          ) : status === 'success' ? (
            <span className="flex items-center space-x-1">
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Joined Newsletter</span>
            </span>
          ) : (
            <>
              <span>Subscribe</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-start space-x-1.5 text-xs text-red-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
        
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-start space-x-1.5 text-xs text-amber-400 font-medium"
          >
            <Check className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Success! Welcome to Alankapriya. A curated welcome guide has been sent to your inbox.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 1. Large Newsletter Section before the footer
export function LargeNewsletterSection() {
  const benefits = [
    { icon: Sparkles, title: "AI Recommendations", desc: "Tailored fashion, beauty & home recommendations powered by our curation algorithms." },
    { icon: Bell, title: "Price Drop Alerts", desc: "Instant notifications when prices fall on products saved to your watchlist." },
    { icon: Percent, title: "Weekly Best Deals", desc: "Curated shopping digests highlighting verified discounts up to 60% off." },
    { icon: BookOpen, title: "Premium Buying Guides", desc: "Editorial blueprints helping you buy smart, buy once, and enjoy forever." },
    { icon: ShieldCheck, title: "Honest Product Reviews", desc: "Unbiased, real-world testing and comparison summaries from domain experts." },
    { icon: Zap, title: "Early Feature Access", desc: "First-look access to advanced AI tracking consoles and comparison tools." }
  ];

  return (
    <section className="relative overflow-hidden bg-stone-950 py-20 px-4 sm:px-6 lg:px-8 border-t border-stone-900" id="large-newsletter">
      {/* Decorative premium radial gradients */}
      <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-amber-600/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text and Form Content */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Alankapriya Inner Circle
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Never Miss the <span className="text-amber-400 italic font-light">Best Deal</span>
              </h2>
              <p className="text-stone-300 text-sm leading-relaxed font-normal">
                Get AI-powered buying guides, price-drop alerts, expert comparisons, product launches, exclusive shopping tips, and weekly curated recommendations.
              </p>
            </div>

            {/* Newsletter Subscription Form */}
            <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-3xl backdrop-blur-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 mb-4 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Join Now for Instant Verification</span>
              </h4>
              <SubscriptionForm source="homepage" />
              <p className="text-[10px] text-stone-400 mt-3 text-center leading-relaxed font-normal">
                We respect your inbox. Unsubscribe anytime in one single click. No spam. Secure SSL encryption.
              </p>
            </div>
          </div>

          {/* Core Perks Bento Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="group relative overflow-hidden bg-stone-900/40 hover:bg-stone-900/60 border border-stone-800/80 hover:border-amber-500/30 p-5 rounded-2xl transition-all duration-300 backdrop-blur-xs"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-[#0a0a0a] text-amber-400 transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors duration-300">
                        {benefit.title}
                      </h4>
                      <p className="text-stone-300/90 text-xs leading-relaxed font-normal">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

// 2. Compact Newsletter Banner (after 60% scroll)
export function CompactScrollBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user dismissed it in this session
    const dismissed = sessionStorage.getItem('newsletter_banner_dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      if (isDismissed) return;

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalHeight > 0 && (currentScroll / totalHeight) >= 0.6) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('newsletter_banner_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[480px] z-50"
          id="compact-scroll-banner"
        >
          <div className="relative overflow-hidden bg-stone-950/95 border border-stone-800/80 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 text-stone-500 hover:text-stone-300 transition-colors p-1 rounded-full hover:bg-stone-900"
              title="Close notification"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start space-x-3.5 pr-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-stone-950 font-black">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 font-sans">
                  Exclusive Invitation
                </span>
                <h3 className="font-display text-base font-extrabold text-amber-400 tracking-tight leading-tight">
                  Get our exclusive curated deal guides
                </h3>
                <p className="text-stone-200 text-xs leading-relaxed font-normal">
                  Join our weekly newsletter to obtain premium buying shortcuts, handpicked coupons, and direct AI recommendation scorecards.
                </p>
                
                <div className="mt-4 pt-1">
                  <SubscriptionForm source="banner" onSuccess={handleDismiss} compact />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 3. Exit-intent Popup (desktop only)
export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Exit-intent popups are strictly desktop-only
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const dismissed = sessionStorage.getItem('newsletter_popup_dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (isDismissed) return;
      
      // Trigger if the cursor leaves the viewport from the top edge
      if (e.clientY < 15) {
        setIsOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isDismissed]);

  const handleClose = () => {
    setIsOpen(false);
    setIsDismissed(true);
    sessionStorage.setItem('newsletter_popup_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && !isDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm" id="exit-intent-popup">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-stone-950 border border-stone-850 p-8 shadow-2xl"
          >
            {/* Background luxury gradient light */}
            <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-amber-500/10 blur-[60px]" />
            <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-amber-600/10 blur-[60px]" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors p-1.5 rounded-full hover:bg-stone-900"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Sparkles className="h-7 w-7" />
              </div>

              <div className="space-y-2.5">
                <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  Before you leave Alankapriya...
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Unlock our curated <span className="text-amber-400 italic font-light">VIP Shopping list</span>
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed font-light max-w-md mx-auto">
                  Subscribe to receive immediate access to price-drop alerts, premium style guides, and exclusive weekly product comparisons.
                </p>
              </div>

              <div className="bg-stone-900/50 p-5 rounded-2xl border border-stone-900">
                <SubscriptionForm source="popup" onSuccess={handleClose} />
              </div>

              <div className="flex justify-center space-x-6 text-[11px] text-stone-500 font-light">
                <span>✓ 100% Free VIP access</span>
                <span>✓ No duplicate spam</span>
                <span>✓ Opt-out anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
