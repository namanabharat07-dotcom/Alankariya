import React, { useState } from 'react';
import { Mail, ArrowRight, Github, ExternalLink, Heart } from 'lucide-react';
import { motion } from 'motion/react';

import { subscribeUser, requestBrowserNotification } from '../lib/marketing';
import { subscribeToNewsletterInFirestore, checkNewsletterSubscriptionStatus } from '../lib/firebase';
import { NewsletterSubscriber } from '../types';

interface FooterProps {
  onNavigate: (page: string) => void;
  onReplayWelcome?: () => void;
}

export default function Footer({ onNavigate, onReplayWelcome }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeError(null);
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      setSubscribeError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Check duplicate subscription in newsletterSubscribers
      const existingStatus = await checkNewsletterSubscriptionStatus(cleanEmail);
      if (existingStatus === 'active') {
        setIsSubscribed(true);
        setEmail('');
        setTimeout(() => setIsSubscribed(false), 6000);
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
        console.warn('Silent geolocation retrieval fallback in footer:', e);
      }

      // 3. Detect device
      const isMobile = window.innerWidth < 768;
      const device = isMobile ? 'mobile' : 'desktop';

      // 4. Construct subscriber object
      const subscriber: NewsletterSubscriber = {
        email: cleanEmail,
        createdAt: new Date().toISOString(),
        status: 'active',
        source: 'footer',
        device,
        country,
        lastUpdated: new Date().toISOString()
      };

      // 5. Save in Firebase collections
      await subscribeToNewsletterInFirestore(subscriber);
      await subscribeUser(cleanEmail);
      
      setIsSubscribed(true);
      setEmail('');
      
      // 6. Automatically prompt for browser push permissions on subscription!
      try {
        const { permission } = await requestBrowserNotification();
        if (permission === 'granted') {
          console.log('Browser notifications permission granted during subscription');
        }
      } catch (pushErr) {
        console.warn('Silent fallback for browser push notification prompt inside frame:', pushErr);
      }

      setTimeout(() => setIsSubscribed(false), 6000);
    } catch (err: any) {
      console.error('Subscription error:', err);
      setSubscribeError(err.message || 'Subscription failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = {
    platform: [
      { name: 'Featured Products', page: 'home' },
      { name: 'Compare Products', page: 'compare' },
      { name: 'FAQs', page: 'faqs' }
    ],
    resources: [
      { name: 'Style Guides', page: 'guides_list' },
      { name: 'Articles', page: 'blogs_list' }
    ],
    trust: [
      { name: 'About Us', page: 'about' },
      { name: 'Contact', page: 'contact' },
      { name: 'Affiliate Disclosure', page: 'disclosure' },
      { name: 'Legal Disclaimer', page: 'disclaimer' },
      { name: 'Privacy Policy', page: 'privacy' },
      { name: 'Terms & Conditions', page: 'terms' },
      { name: 'Cookie Policy', page: 'cookies' }
    ]
  };

  return (
    <footer className="border-t border-white/5 bg-[#050505] pt-24 pb-8" id="app-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment: Newsletter and Intro */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 pb-12 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-700 text-white font-display font-medium text-lg tracking-wide">
                A
              </div>
              <span className="font-display font-bold text-2xl tracking-wide text-[#F5F5F0]">
                Alanka<span className="text-amber-500 font-medium italic">priya</span>
              </span>
            </div>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed font-light">
              Your guide to the best fashion, home, and beauty products. We review and compare products so you can buy with confidence.
            </p>
          </div>
 
          {/* Newsletter Box */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display text-lg font-bold text-amber-400 tracking-wide">
              Stay in the loop
            </h4>
            <p className="text-sm text-slate-500 font-light">
              Sign up for our newsletter to get style tips, product reviews, and deal updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg" id="newsletter-form">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  disabled={isSubmitting || isSubscribed}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200 transition-all font-light disabled:bg-stone-50 disabled:text-stone-400"
                />
              </div>
              <button
                type="submit"
                id="footer-subscribe-btn"
                disabled={isSubmitting || isSubscribed}
                className="inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-amber-800/60 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer"
              >
                {isSubscribed ? (
                  <span>Thank you for subscribing!</span>
                ) : isSubmitting ? (
                  <span>Subscribing...</span>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            {subscribeError && (
              <p className="text-xs text-red-500 font-medium mt-1.5" id="subscribe-error-msg">
                {subscribeError}
              </p>
            )}
          </div>
        </div>
 
        {/* Middle Segment: Nav Columns */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-2 gap-8 py-12 md:grid-cols-3 lg:grid-cols-4"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
          >
            <h5 className="font-sans font-bold text-[11px] uppercase tracking-wider text-amber-800/80 mb-4">
              Platform
            </h5>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-sm text-slate-500 hover:text-amber-800 transition-colors text-left font-light hover:translate-x-1 duration-200 transform"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
 
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
          >
            <h5 className="font-sans font-bold text-[11px] uppercase tracking-wider text-amber-800/80 mb-4">
              Resources
            </h5>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-sm text-slate-500 hover:text-amber-800 transition-colors text-left font-light hover:translate-x-1 duration-200 transform"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              {onReplayWelcome && (
                <li>
                  <button
                    onClick={onReplayWelcome}
                    id="footer-btn-replay-welcome"
                    className="text-sm text-amber-700 hover:text-amber-800 hover:underline transition-all text-left font-medium flex items-center space-x-1"
                  >
                    <span className="animate-pulse">✨</span>
                    <span>Replay Welcome Experience</span>
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
 
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="col-span-2 md:col-span-1 lg:col-span-2"
          >
            <h5 className="font-sans font-bold text-[11px] uppercase tracking-wider text-amber-800/80 mb-4">
              Trust & Legal
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {footerLinks.trust.map((link) => (
                <div key={link.name}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-sm text-slate-500 hover:text-amber-800 transition-colors text-left font-light hover:translate-x-1 duration-200 transform"
                  >
                    {link.name}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* LARGE CLOSING HEADLINE */}
        <div className="py-14 border-t border-b border-white/5 my-12 text-center overflow-hidden">
          <h2 className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9rem font-black tracking-tighter text-white/90 line-reveal leading-none uppercase">
            Alankapriya Collective
          </h2>
        </div>

        {/* CONTINUOUS MARQUEE RIBBON */}
        <div className="w-full overflow-hidden py-6 border-b border-white/5 relative z-10 select-none bg-stone-950/20 my-8" id="footer-marquee">
          <div className="animate-marquee flex whitespace-nowrap gap-12 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/80">
            {Array(5).fill([
              "• 100% EVIDENCE-BASED AUDITS",
              "• ZERO COMMERCIAL BRAND PLACEMENTS",
              "• SECURE PRICE TRACKING ENGINE",
              "• INDEPENDENT TESTING LABS",
              "• CURATED LUXURY HARDWARE MATRICES"
            ]).flat().map((text, idx) => (
              <span key={idx} className="shrink-0 font-semibold">{text}</span>
            ))}
          </div>
        </div>
 
        {/* Bottom Segment: Affiliate disclaimer note & Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4" id="footer-copyright-container">
          <div className="text-center md:text-left space-y-2 max-w-2xl">
            <p className="font-light">
              Copyright © 2026 Alankapriya. All Rights Reserved.
            </p>
            <p className="leading-relaxed text-[11px] text-slate-400 font-light">
              <strong className="text-slate-500 font-medium">Affiliate Disclosure:</strong> We may earn a small commission when you buy through our links, at no extra cost to you. This helps us continue reviewing products independently.
            </p>
          </div>
          <div className="flex items-center space-x-1 font-sans text-[11px] text-slate-400/80 font-light">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-amber-600 fill-amber-600" />
            <span>for timeless style</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
