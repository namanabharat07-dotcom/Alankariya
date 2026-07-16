import React from 'react';
import { 
  Laptop, Shirt, Sparkles, Smile, Home as HomeIcon, Dumbbell, Car, BookOpen, Gamepad2, Baby
} from 'lucide-react';
import { motion } from 'motion/react';

interface CategoriesSectionProps {
  onSelectCategory: (category: string) => void;
  onNavigate: (page: string) => void;
}

export const CATEGORIES_LIST = [
  {
    name: "Electronics",
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
    description: "Next-gen smartphones, high-performance laptops, smart wearables, and audio gear curated by experts."
  },
  {
    name: "Men's Fashion",
    icon: Shirt,
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80",
    description: "Premium casuals, elegant formals, athletic activewear, and artisanal accessories for the modern man."
  },
  {
    name: "Women's Fashion",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
    description: "Sophisticated designer wear, statement accessories, fine jewelry, and handwoven luxury sarees."
  },
  {
    name: "Kids & Baby",
    icon: Baby,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=600&q=80",
    description: "Organic cotton clothing, ergonomic baby gear, developmental toys, and toddler essentials."
  },
  {
    name: "Beauty & Personal Care",
    icon: Smile,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
    description: "Clean skincare, luxury fragrances, premium hair dryers, and dermatologically approved essentials."
  },
  {
    name: "Home & Kitchen",
    icon: HomeIcon,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    description: "Intelligent air fryers, minimalist kitchen organizers, aesthetic bedding, and smart home appliances."
  },
  {
    name: "Sports & Fitness",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    description: "Ergonomic running shoes, premium workout apparel, durable smartwatches, and training equipment."
  },
  {
    name: "Automotive",
    icon: Car,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    description: "High-grade dashboard accessories, premium car care kits, GPS systems, and detailing gear."
  },
  {
    name: "Books",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
    description: "Curated bestsellers, inspiring biographies, academic references, and premium coffee table journals."
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
    description: "High-refresh displays, ultra-responsive tactile mechanical keyboards, mice, and immersive console gear."
  }
];

export default function CategoriesSection({ onSelectCategory, onNavigate }: CategoriesSectionProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 select-none" id="categories-section-root">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-mono text-[10px] tracking-widest text-amber-700 uppercase font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/30">
          Smart Product Directories
        </span>
        <h1 className="font-display text-4xl font-black tracking-tight text-stone-900 mt-3 sm:text-5xl">
          Browse by Category
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light leading-relaxed">
          Select from our ten premium collections of hand-picked, AI-vetted consumer items. Every category showcases transparent spec evaluations and honest pro-and-con breakdowns.
        </p>
      </div>

      {/* Price Intelligence Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 p-6 rounded-3xl bg-[#1c1917] border border-amber-500/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-left"
        id="categories-price-intelligence-banner"
      >
        <div className="flex items-start space-x-4">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white">AI Price Intelligence Dashboard</h4>
            <p className="text-stone-400 text-xs mt-0.5 font-light leading-relaxed">
              Analyze historical marketplace prices, detect recent drops, and receive real-time purchase recommendations.
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('price-tracker');
          }}
          className="rounded-xl bg-amber-700 hover:bg-amber-800 text-[#faf9f6] text-xs font-mono uppercase font-bold tracking-wider px-4 py-2.5 transition-colors cursor-pointer shrink-0 border border-amber-600/30 shadow-sm"
        >
          Open Dashboard →
        </button>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="categories-grid">
        {CATEGORIES_LIST.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35, ease: 'easeOut' }}
              onClick={() => {
                onSelectCategory(cat.name);
                onNavigate('home');
              }}
              className="group relative h-96 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-xl hover:border-amber-500/30 cursor-pointer flex flex-col justify-end text-left"
              id={`category-card-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              {/* Image backdrop */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 scale-100 group-hover:scale-105" 
                />
                {/* Dark gradient mask */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-85" />
              </div>

              {/* Card Content */}
              <div className="relative z-10 p-6 sm:p-8 space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-stone-950 shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-[#faf9f6] tracking-tight flex items-center">
                    {cat.name}
                  </h3>
                  <p className="text-[#e7e5e4] text-xs mt-2 font-light leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-2 flex items-center text-amber-400 text-xs font-bold font-mono tracking-wider uppercase group-hover:text-amber-300 transition-colors">
                  <span>Browse Curation</span>
                  <motion.span 
                    className="inline-block ml-1"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  >
                    →
                  </motion.span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
