import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Percent, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StarProduct } from '../types';

interface StarProductsCarouselProps {
  starProducts: StarProduct[];
  onStarClick: (star: StarProduct, e: React.MouseEvent) => void;
}

export default function StarProductsCarousel({ starProducts, onStarClick }: StarProductsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter active products by today's date and enabled status
  const activeStars = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return starProducts.filter(sp => {
      if (!sp.enabled) return false;
      if (sp.startDate && todayStr < sp.startDate) return false;
      if (sp.endDate && todayStr > sp.endDate) return false;
      return true;
    });
  }, [starProducts]);

  // Handle auto sliding
  useEffect(() => {
    if (activeStars.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeStars.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStars.length, isHovered]);

  if (activeStars.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? activeStars.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % activeStars.length);
  };

  const currentStar = activeStars[activeIndex];

  // Helper to get badge style
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'biggest_deal':
        return 'bg-rose-600 border-rose-500 text-white shadow-rose-600/20';
      case 'limited_time':
        return 'bg-amber-600 border-amber-500 text-white shadow-amber-600/20';
      case 'best_discount':
        return 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20';
      default:
        return 'bg-slate-800 border-slate-700 text-white shadow-slate-900/20';
    }
  };

  return (
    <section 
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8"
      id="star-products-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-br from-stone-50 via-white to-amber-50/20 p-6 md:p-8 shadow-sm">
        {/* Glow effect */}
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-stone-500/5 blur-3xl pointer-events-none" />

        {/* Carousel Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
            <h2 className="font-display text-xs font-black uppercase tracking-widest text-slate-900">
              ⭐ Star Products of the Day
            </h2>
          </div>
          
          {activeStars.length > 1 && (
            <div className="flex items-center space-x-1.5">
              <button 
                onClick={handlePrev}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 shadow-xs transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNext}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 shadow-xs transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Carousel Slide Container */}
        <div className="relative min-h-[300px] md:min-h-[260px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStar.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center w-full"
            >
              {/* Product Image Section */}
              <div className="md:col-span-4 flex justify-center relative">
                <div className="relative aspect-square w-full max-w-[220px] rounded-2xl overflow-hidden bg-white border border-stone-100 shadow-xs group">
                  <img 
                    src={currentStar.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
                    alt={currentStar.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Floating Discount Badge */}
                  <div className="absolute top-2 left-2 bg-rose-600 text-white font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                    -{currentStar.discountPercentage}%
                  </div>
                </div>
              </div>

              {/* Product Info Section */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-4 md:space-y-5">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`inline-flex items-center border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs ${getBadgeStyle(currentStar.badgeType)}`}>
                      {currentStar.badgeText}
                    </span>
                    {currentStar.endDate && (
                      <span className="inline-flex items-center text-[10px] font-bold text-stone-400 bg-stone-100 border border-stone-200/50 px-2.5 py-0.5 rounded-full">
                        <Calendar className="mr-1 h-3 w-3" />
                        Ends {new Date(currentStar.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
                    {currentStar.title}
                  </h3>

                  {/* Pricing Comparison */}
                  <div className="flex items-baseline space-x-3 pt-1">
                    <span className="font-mono text-2xl md:text-3xl font-black text-rose-600">
                      ${currentStar.discountedPrice}
                    </span>
                    <span className="font-mono text-sm text-stone-400 line-through">
                      ${currentStar.originalPrice}
                    </span>
                    <span className="inline-flex items-center text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                      <Percent className="h-3 w-3 mr-0.5" />
                      Save ${currentStar.originalPrice - currentStar.discountedPrice}
                    </span>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="pt-2">
                  <a
                    href={currentStar.affiliateUrl}
                    onClick={(e) => onStarClick(currentStar, e)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 shadow-md shadow-slate-900/10 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Buy Now</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Indicators */}
        {activeStars.length > 1 && (
          <div className="flex justify-center space-x-1.5 mt-6 relative z-10">
            {activeStars.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeIndex === idx ? 'w-6 bg-slate-900' : 'w-1.5 bg-stone-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
