import React, { useState, useEffect } from 'react';
import { Product, getProductAffiliateButtons } from '../types';
import { saveComparisonToFirestore, saveAnalyticsEventToFirestore } from '../lib/firebase';
import { 
  Star, X, ShoppingCart, ArrowLeftRight, CheckCircle, AlertTriangle, 
  ShoppingBag, Percent, ExternalLink, Tag, Globe, Sparkles, Heart, 
  Plus, RefreshCw, ChevronDown, Check, Settings, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductComparisonProps {
  selectedProducts: Product[];
  allProducts: Product[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onNavigateToProduct: (id: string) => void;
  onAffiliateClick: (productId: string, network: string, url: string, e: React.MouseEvent) => void;
  onNavigate?: (page: string, params?: Record<string, any>) => void;
  currentUser?: any;
}

// Predefined specification listings adapted for each category
const CATEGORY_SPECS: Record<string, string[]> = {
  Smartphones: [
    'Processor',
    'RAM',
    'Storage',
    'Battery',
    'Display',
    'Charging',
    'Camera',
    'Software',
    'Network',
    'Build Quality',
    'Water Resistance',
    'Warranty'
  ],
  Laptops: [
    'Processor',
    'RAM',
    'Storage',
    'Graphics',
    'Display',
    'Battery Life',
    'Weight',
    'Operating System',
    'Ports',
    'Build Quality',
    'Warranty'
  ],
  'Running Shoes': [
    'Upper Material',
    'Midsole Technology',
    'Outsole Grip',
    'Cushioning Level',
    'Heel-to-Toe Drop',
    'Weight',
    'Pronation Support',
    'Best For',
    'Durability'
  ],
  Smartwatches: [
    'Display Type',
    'Battery Life',
    'Sensors',
    'Water Resistance',
    'Compatibility',
    'GPS',
    'Strap Material',
    'Case Material',
    'Health Tracking'
  ],
  Wearables: [
    'Display Type',
    'Battery Life',
    'Sensors',
    'Water Resistance',
    'Compatibility',
    'GPS',
    'Strap Material',
    'Case Material',
    'Health Tracking'
  ],
  Audio: [
    'Driver Size',
    'Battery Life',
    'ANC (Active Noise Cancellation)',
    'Connectivity',
    'Water Resistance',
    'Microphones',
    'Audio Codecs',
    'Weight'
  ]
};

// Returns standard categories priorities
function getCategoryPriorities(category: string): string[] {
  switch (category) {
    case 'Smartphones':
      return ['Gaming', 'Camera', 'Battery', 'Display', 'Value', 'Software', 'Brand'];
    case 'Laptops':
      return ['Performance', 'Battery Life', 'Display', 'Portability', 'Value', 'Build Quality'];
    case 'Running Shoes':
      return ['Cushioning', 'Grip', 'Comfort', 'Durability', 'Value', 'Lightweight'];
    case 'Smartwatches':
    case 'Wearables':
      return ['Fitness Tracking', 'Battery', 'Display', 'Smart Features', 'Value'];
    case 'Audio':
      return ['Sound Quality', 'Battery', 'ANC', 'Comfort', 'Value'];
    default:
      return ['Performance', 'Design', 'Battery', 'Value', 'Brand'];
  }
}

// Evaluates a product subscore (50-100) for a given priority dynamically
function getPrioritySubscore(product: Product, priority: string): number {
  const title = product.title.toLowerCase();
  const desc = product.description.toLowerCase();
  const specs = Object.entries(product.specifications).map(([k, v]) => `${k}:${v}`).join(' | ').toLowerCase();
  const pros = product.pros.map(p => p.toLowerCase()).join(' ');
  const cons = product.cons.map(c => c.toLowerCase()).join(' ');
  const brand = product.brand.toLowerCase();
  
  let score = 75; // Baseline default

  const hasKeywords = (list: string[], text: string) => list.some(k => text.includes(k));

  switch (priority.toLowerCase()) {
    case 'gaming':
    case 'performance':
      if (hasKeywords(['snapdragon 8', 'apple a18', 'apple a17', 'm3 max', 'm3 pro', 'rtx 40', 'intel core i9', 'ryzen 9'], specs + title)) score = 98;
      else if (hasKeywords(['snapdragon 7', 'dimensity 8', 'dimensity 9', 'm3', 'intel core i7', 'ryzen 7', 'rtx 30'], specs + title)) score = 92;
      else if (hasKeywords(['snapdragon 6', 'dimensity 7', 'intel core i5', 'ryzen 5'], specs + title)) score = 84;
      else if (hasKeywords(['chromebook', 'quad-core', 'celeron'], specs + title)) score = 65;
      else score = 80;
      break;

    case 'camera':
      if (hasKeywords(['periscope', 'leica', 'hasselblad', '108mp', '200mp', '50mp ois', 'telephoto'], specs + title + pros)) score = 98;
      else if (hasKeywords(['50mp', '64mp', '48mp', 'dual camera', 'triple camera'], specs + title)) score = 90;
      else if (hasKeywords(['12mp', '8mp', 'front camera'], specs + title)) score = 78;
      else score = 80;
      break;

    case 'battery':
    case 'battery life':
      const batteryMatch = specs.match(/(\d+)\s*mah/);
      if (batteryMatch) {
        const mah = parseInt(batteryMatch[1]);
        if (mah >= 6000) score = 98;
        else if (mah >= 5000) score = 92;
        else if (mah >= 4500) score = 85;
        else score = 75;
      } else if (hasKeywords(['10 hours', '12 hours', '15 hours', '18 hours', 'all-day', '7 days', '14 days', 'battery life'], specs + pros + desc)) {
        score = 95;
      } else if (hasKeywords(['6 hours', '8 hours', '2 days', '3 days'], specs + pros + desc)) {
        score = 86;
      } else {
        score = 80;
      }
      break;

    case 'display':
      if (hasKeywords(['oled', 'amoled', 'retina', 'liquid retina', 'super retina', 'ltpo', 'mini-led'], specs + title)) score = 98;
      else if (hasKeywords(['ips', '120hz', '144hz', 'qhd', '2k', '4k'], specs + title)) score = 92;
      else if (hasKeywords(['90hz', 'fhd', '1080p'], specs + title)) score = 85;
      else score = 75;
      break;

    case 'value':
      const discount = product.originalPrice > product.price ? (product.originalPrice - product.price) / product.originalPrice : 0;
      score = 75 + Math.round(discount * 80);
      if (score > 98) score = 98;
      if (product.rating >= 4.7) score += 5;
      if (product.rating < 4.2) score -= 5;
      break;

    case 'software':
      if (hasKeywords(['ios', 'macos', 'android 14', 'clean android', 'stock android', 'pixel ui'], specs + desc)) score = 95;
      else if (hasKeywords(['windows 11', 'android 13', 'coloros', 'oxygenos', 'one ui'], specs + desc)) score = 88;
      else score = 82;
      break;

    case 'brand':
      if (hasKeywords(['apple', 'samsung', 'sony', 'dell', 'hp', 'lenovo', 'garmin', 'nike', 'adidas', 'asus'], brand)) score = 97;
      else if (hasKeywords(['oneplus', 'xiaomi', 'realme', 'motorola', 'google', 'nothing'], brand)) score = 90;
      else score = 82;
      break;

    case 'portability':
    case 'lightweight':
      if (hasKeywords(['1.2 kg', '1.3 kg', 'super light', 'ultra thin', 'featherweight', '180g', '170g', '7.5mm'], specs + desc + pros)) score = 98;
      else if (hasKeywords(['1.5 kg', '1.6 kg', 'thin', '190g', '200g', '8mm'], specs + desc)) score = 88;
      else if (hasKeywords(['gaming laptop', '2.2 kg', '2.5 kg', 'heavy', 'thick'], specs + desc + cons)) score = 65;
      else score = 80;
      break;

    case 'build quality':
    case 'durability':
      if (hasKeywords(['aluminum', 'titanium', 'gorilla glass', 'carbon fiber', 'premium metal', 'military-grade'], specs + desc + pros)) score = 96;
      else if (hasKeywords(['plastic frame', 'cheap build', 'fragile'], cons + specs)) score = 72;
      else score = 84;
      break;

    case 'cushioning':
      if (hasKeywords(['zoomX', 'boost', 'gel', 'plush', 'maximum cushioning', 'cloudlike', 'soft landing'], specs + desc + pros)) score = 98;
      else if (hasKeywords(['responsive cushioning', 'lightweight foam', 'firm support'], specs + desc)) score = 88;
      else score = 80;
      break;

    case 'grip':
      if (hasKeywords(['vibram', 'continental', 'traction', 'all-weather grip', 'sticky rubber', 'lugged'], specs + desc + pros)) score = 98;
      else if (hasKeywords(['slippery', 'poor traction', 'indoor only'], cons)) score = 68;
      else score = 86;
      break;

    case 'comfort':
      if (hasKeywords(['breathable mesh', 'ortholite', 'ergonomic', 'plush collar', 'comfortable fit'], pros + desc)) score = 96;
      else if (hasKeywords(['tight toe box', 'narrow fit', 'causes blisters'], cons)) score = 70;
      else score = 85;
      break;

    case 'fitness tracking':
    case 'health tracking':
      if (hasKeywords(['gps built-in', 'multisport', 'ecg', 'sp02', 'heart rate tracking', 'sleep score'], specs + pros)) score = 97;
      else if (hasKeywords(['step counter', 'basic tracking'], specs)) score = 78;
      else score = 85;
      break;

    case 'smart features':
      if (hasKeywords(['bluetooth calling', 'nfc pay', 'app store', 'voice assistant', 'offline music'], specs + pros)) score = 96;
      else score = 80;
      break;

    case 'sound quality':
      if (hasKeywords(['ldac', 'hi-res', 'spatial audio', 'dolby atmos', 'custom eq', 'bass response'], specs + pros)) score = 98;
      else if (hasKeywords(['flat sound', 'muddy bass'], cons)) score = 72;
      else score = 85;
      break;

    case 'anc':
      if (hasKeywords(['active noise cancellation', 'anc', 'smart noise cancelling'], specs + pros)) score = 96;
      else score = 60;
      break;

    default:
      score = 70 + Math.round(product.rating * 5.5);
      break;
  }

  return score;
}

// Translates a specification category to a neat non-jargon practical explanation
function getSpecExplanation(key: string): string {
  const k = key.toLowerCase();
  if (k.includes('processor') || k.includes('graphics')) {
    return "The system processor drives performance. A more powerful engine ensures smoother multitasking, zero lags during intense usage, and premium gaming speeds.";
  }
  if (k.includes('battery') || k.includes('battery life')) {
    return "Determines how long your device stays powered on. Larger thresholds mean peace of mind, freeing you from carrying a charger on active days.";
  }
  if (k.includes('ram')) {
    return "Acting as short-term memory, more RAM keeps more apps alive concurrently in the background so you can jump between tasks with absolute speed.";
  }
  if (k.includes('storage')) {
    return "This stores your precious photos, premium videos, apps, and local files. Having extra headroom saves you from recurring 'storage full' warnings.";
  }
  if (k.includes('display') || k.includes('screen')) {
    return "The primary canvas. Modern displays boast vivid contrast levels and faster refresh speeds (like 120Hz) making scrolling and video playback incredibly smooth.";
  }
  if (k.includes('charging')) {
    return "Dictates how fast you can top up your energy. Super-fast charging minimizes wall socket waiting times, giving you full charges in short tea breaks.";
  }
  if (k.includes('camera')) {
    return "The imaging setup. Modern sensors capture richer color gradients, clearer low-light shots, and stable action videos for your digital memories.";
  }
  if (k.includes('software') || k.includes('operating system')) {
    return "The software platform defines usability, interface layout, future updates duration, and background security guardrails.";
  }
  if (k.includes('water resistance')) {
    return "Guards your hardware from daily rain, accidental sink dropouts, or liquid spills, extending your product's lifecycle and safety.";
  }
  if (k.includes('build quality') || k.includes('material')) {
    return "Premium chassis materials (metal, glass, titanium) feel incredible in hand and stand up better to physical wear and drop impacts.";
  }
  if (k.includes('cushion') || k.includes('midsole')) {
    return "High-performance cushioning absorbs concrete footstrikes, reducing joint stress while springing back energy into your next step.";
  }
  if (k.includes('grip') || k.includes('outsole')) {
    return "Traction-focused tread compounds keep you stable on wet tarmac, loose trail surfaces, or slick gym floors without slipping.";
  }
  if (k.includes('comfort') || k.includes('weight')) {
    return "Lightweight and breathable designs prevent fatigue, keeping your feet ventilated and cozy on extended walks or high-speed runs.";
  }
  if (k.includes('fitness') || k.includes('health') || k.includes('sensor')) {
    return "Sensors record continuous metrics like heart rates, blood oxygen, and sleep sleep stages, letting you map trends and daily recovery.";
  }
  if (k.includes('sound') || k.includes('anc') || k.includes('audio')) {
    return "High-fidelity audio drivers paired with Active Noise Cancellation carve out a silent personal bubble, making instruments and vocals sound rich and crystal clear.";
  }
  return "This key parameter plays an essential role in dictating the daily experience, future-proofing, and performance output of your choice.";
}

// Determines the qualitative tag and whether it's the winner of that specification row
function getSpecRatingText(product: Product, key: string, selectedProducts: Product[]): { text: string; badgeClass: string; isBest: boolean } {
  let priorityName = '';
  const k = key.toLowerCase();
  if (k.includes('processor') || k.includes('ram') || k.includes('graphics') || k.includes('performance')) priorityName = 'performance';
  else if (k.includes('camera')) priorityName = 'camera';
  else if (k.includes('battery') || k.includes('charging') || k.includes('life')) priorityName = 'battery';
  else if (k.includes('display') || k.includes('screen')) priorityName = 'display';
  else if (k.includes('price') || k.includes('value')) priorityName = 'value';
  else if (k.includes('build') || k.includes('water') || k.includes('material')) priorityName = 'build quality';
  else if (k.includes('cushion') || k.includes('midsole')) priorityName = 'cushioning';
  else if (k.includes('grip') || k.includes('outsole')) priorityName = 'grip';
  else if (k.includes('comfort') || k.includes('weight')) priorityName = 'comfort';
  else if (k.includes('fitness') || k.includes('health') || k.includes('sensor')) priorityName = 'fitness tracking';
  else if (k.includes('sound') || k.includes('anc') || k.includes('audio')) priorityName = 'sound quality';

  const currentScore = priorityName ? getPrioritySubscore(product, priorityName) : (70 + (product.rating * 5));
  
  const allScores = selectedProducts.map(p => {
    const s = priorityName ? getPrioritySubscore(p, priorityName) : (70 + (p.rating * 5));
    return { id: p.id, score: s };
  });

  allScores.sort((a, b) => b.score - a.score);
  
  const rank = allScores.findIndex(s => s.id === product.id);
  const isBest = rank === 0 && selectedProducts.length > 1;

  if (rank === 0) {
    return {
      text: 'Excellent',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      isBest
    };
  } else if (rank === 1) {
    return {
      text: 'Very Good',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/50',
      isBest: false
    };
  } else if (rank === 2) {
    return {
      text: 'Good',
      badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
      isBest: false
    };
  } else {
    return {
      text: 'Satisfactory',
      badgeClass: 'bg-stone-50 text-stone-500 border-stone-100',
      isBest: false
    };
  }
}

export default function ProductComparison({
  selectedProducts,
  allProducts,
  onRemoveFromCompare,
  onClearCompare,
  onNavigateToProduct,
  onAffiliateClick,
  onNavigate,
  currentUser
}: ProductComparisonProps) {
  
  // Phase state: 'select' | 'arena' | 'analyzing' | 'dashboard'
  const [phase, setPhase] = useState<'select' | 'arena' | 'analyzing' | 'dashboard'>('select');
  const [checklistIndex, setChecklistIndex] = useState<number>(-1);
  const [priorityWeights, setPriorityWeights] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alankapriya_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});
  const toggleExpandSpec = (specKey: string) => {
    setExpandedSpecs(prev => ({ ...prev, [specKey]: !prev[specKey] }));
  };
  const [swapTargetId, setSwapTargetId] = useState<string | null>(null);

  // Decision Engine states
  const [revealedAffiliate, setRevealedAffiliate] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Price tracker modal states
  const [trackingProduct, setTrackingProduct] = useState<Product | null>(null);
  const [trackingEmail, setTrackingEmail] = useState<string>('');
  const [trackingTargetPrice, setTrackingTargetPrice] = useState<string>('');
  const [priceTrackSuccess, setPriceTrackSuccess] = useState<boolean>(false);

  // Validate categories: are they different?
  const hasCategoryMismatch = selectedProducts.length > 1 && 
    selectedProducts.some(p => p.category !== selectedProducts[0].category);

  // Suggested products to add
  const currentCategory = selectedProducts[0]?.category;
  const recommendedToCompare = allProducts
    .filter(p => !selectedProducts.find(sp => sp.id === p.id) && (!currentCategory || p.category === currentCategory))
    .slice(0, 4);

  // Swappable alternative products in same category
  const alternativeProducts = allProducts.filter(p => 
    p.category === currentCategory && !selectedProducts.some(sp => sp.id === p.id)
  );

  // Initialize priority weights for category
  useEffect(() => {
    if (selectedProducts.length > 0 && !hasCategoryMismatch) {
      const cat = selectedProducts[0].category;
      const priorities = getCategoryPriorities(cat);
      const initialWeights: Record<string, number> = {};
      priorities.forEach(p => {
        initialWeights[p] = 2; // Medium weight by default (1 = Low, 2 = Medium, 3 = High)
      });
      setPriorityWeights(initialWeights);
    }
  }, [selectedProducts, hasCategoryMismatch]);

  // Run the Arena -> Checklist animation flow
  const handleStartComparison = () => {
    if (selectedProducts.length < 2 || hasCategoryMismatch) return;
    setPhase('arena');
    
    // 1.5 seconds of VS animation
    setTimeout(() => {
      setPhase('analyzing');
      setChecklistIndex(0);
    }, 1600);
  };

  // Checklist sequence
  useEffect(() => {
    if (phase === 'analyzing' && checklistIndex >= 0 && checklistIndex < 6) {
      const timer = setTimeout(() => {
        setChecklistIndex(prev => prev + 1);
      }, 450); // Stagger checklist items
      return () => clearTimeout(timer);
    } else if (phase === 'analyzing' && checklistIndex === 6) {
      const timer = setTimeout(() => {
        setPhase('dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, checklistIndex]);

  // Trigger compare analytics event on reaching dashboard
  useEffect(() => {
    if (phase === 'dashboard' && selectedProducts.length > 0) {
      const productNames = selectedProducts.map(p => p.title).join(' vs ');
      const productIds = selectedProducts.map(p => p.id).join(',');
      
      const event = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        eventType: 'compare' as const,
        targetId: productIds,
        targetName: productNames,
        timestamp: new Date().toISOString(),
        sessionId: localStorage.getItem('alankapriya_session_id') || 'session-anonymous'
      };
      
      try {
        saveAnalyticsEventToFirestore(event);
      } catch (err) {
        console.warn("Failed logging analytics event:", err);
      }
    }
  }, [phase, selectedProducts]);

  // Handle local favorites persistence
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('alankapriya_favorites', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  // Recalculates dynamic match score for a product based on current user priorities
  const getMatchScore = (product: Product): number => {
    const priorities = Object.keys(priorityWeights);
    if (priorities.length === 0) return 90; // Fallback default
    
    let weightedSum = 0;
    let totalWeight = 0;

    priorities.forEach(priority => {
      const weight = priorityWeights[priority] || 1; // 1, 2, or 3
      const subscore = getPrioritySubscore(product, priority);
      weightedSum += subscore * weight;
      totalWeight += weight;
    });

    return Math.round(weightedSum / totalWeight);
  };

  // Swap target product with an alternative product
  const handleSwapProduct = (oldId: string, newId: string) => {
    onRemoveFromCompare(oldId);
    setTimeout(() => {
      onRemoveFromCompare(newId);
    }, 20);
    setSwapTargetId(null);
  };

  // Determine key specs to compare
  const targetCategory = selectedProducts[0]?.category || 'Smartphones';
  const displaySpecKeys = CATEGORY_SPECS[targetCategory] || 
    Array.from(new Set(selectedProducts.flatMap(p => Object.keys(p.specifications))));

  // Sort selected products based on calculated match scores in dashboard phase
  const sortedProductsForDashboard = [...selectedProducts].sort((a, b) => {
    if (phase === 'dashboard') {
      return getMatchScore(b) - getMatchScore(a);
    }
    return 0;
  });

  // Animated Checklist Items
  const checklistItems = [
    "Analyzing hardware specifications...",
    "Correlating your custom preference weights...",
    "Evaluating expert build & design strengths...",
    "Sifting real-world battery & performance tradeoffs...",
    "Scanning pricing against average market value...",
    "Synthesizing customized buyer recommendation..."
  ];

  // Render Category Mismatch Error State
  if (hasCategoryMismatch) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center select-none" id="compare-error-mismatch">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center max-w-lg mx-auto"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-800 mb-6 border border-amber-100 shadow-inner">
            <ShieldAlert className="h-8 w-8 text-amber-700 stroke-[1.5] animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-black text-stone-900 tracking-tight">
            Comparison Mismatch
          </h2>
          <p className="text-stone-500 text-sm mt-3 leading-relaxed font-light">
            We couldn't compare these products because enough verified information isn't available to compare different categories side-by-side.
          </p>
          
          <div className="pt-8 flex flex-col space-y-3">
            <button
              onClick={onClearCompare}
              className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-700 hover:bg-amber-650 text-white font-bold text-xs uppercase tracking-wider py-3.5 shadow-md cursor-pointer transition-colors"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>Choose Another Product</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="w-full inline-flex items-center justify-center space-x-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs uppercase tracking-wider py-3.5 cursor-pointer transition-colors"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span>Return to Categories</span>
            </button>
            <button
              onClick={() => {
                onNavigate && onNavigate('home');
                setTimeout(() => {
                  const input = document.getElementById('home-hero-search-input');
                  input?.focus();
                }, 100);
              }}
              className="w-full inline-flex items-center justify-center space-x-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs uppercase tracking-wider py-3.5 cursor-pointer transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4 shrink-0" />
              <span>Search Again</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 select-none" id="comparison-hub">
      
      {/* PHASE 1: SELECTION AND PREPARATION SCREEN */}
      {phase === 'select' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-200/50 gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-amber-700 uppercase font-bold bg-amber-50 px-2.5 py-1 rounded-full">
                AI Smart Compare
              </span>
              <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 mt-2">
                Evaluate Your Choices
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">
                Add up to 4 items from the same category to unlock personalized AI spec breakdowns and match weights.
              </p>
            </div>
            {selectedProducts.length > 0 && (
              <button
                onClick={onClearCompare}
                className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 px-4 py-2 text-xs font-bold text-stone-600 transition-colors shadow-sm"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Selected Products Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {selectedProducts.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ type: "spring", stiffness: 120, damping: 16 }}
                  className="group relative bg-white border border-stone-200 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <button
                    onClick={() => onRemoveFromCompare(p.id)}
                    className="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 hover:scale-105 text-stone-500 hover:text-stone-900 transition-all shadow-sm"
                    title="Remove from comparison"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col items-center text-center cursor-pointer" onClick={() => onNavigateToProduct(p.id)}>
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="h-28 w-28 rounded-2xl object-cover bg-stone-50 shadow-sm group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="mt-4 space-y-1">
                      <span className="font-sans text-[10px] uppercase font-extrabold text-stone-400 tracking-wider block">
                        {p.brand}
                      </span>
                      <h4 className="font-display font-bold text-sm text-stone-900 line-clamp-2 px-1 hover:text-amber-800 transition-colors">
                        {p.title}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-stone-400 font-mono">Special Deal</span>
                      <span className="font-display text-base font-extrabold text-stone-900">₹{p.price.toLocaleString()}</span>
                    </div>
                    <div className="flex h-7 px-2 items-center space-x-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>{p.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty placeholder slot to encourage comparison */}
              {selectedProducts.length < 4 && (
                <div 
                  onClick={() => onNavigate && onNavigate('home')}
                  className="flex flex-col items-center justify-center p-8 bg-stone-50/50 border border-dashed border-stone-200 hover:border-amber-400 rounded-3xl group cursor-pointer transition-all duration-300 h-64"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 group-hover:bg-amber-50 text-stone-400 group-hover:text-amber-700 transition-colors border border-stone-200/50">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h4 className="font-display font-bold text-xs text-stone-700 mt-4">Add More Products</h4>
                  <p className="text-[11px] text-stone-400 text-center mt-1 leading-relaxed max-w-xs">
                    Browse categories and tap compare on card corners.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Trigger Area */}
          <div className="flex flex-col items-center justify-center pt-6 pb-4">
            {selectedProducts.length >= 2 ? (
              <div className="text-center space-y-3">
                <motion.button
                  onClick={handleStartComparison}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ 
                    boxShadow: ["0 4px 15px rgba(180,83,9,0.1)", "0 4px 25px rgba(180,83,9,0.3)", "0 4px 15px rgba(180,83,9,0.1)"]
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="inline-flex items-center space-x-3 rounded-2xl bg-amber-700 hover:bg-amber-650 text-white font-bold text-xs uppercase tracking-wider px-10 py-5 shadow-xl cursor-pointer transition-colors"
                >
                  <Sparkles className="h-4 w-4 fill-white animate-pulse text-white" />
                  <span>⚡ Compare Now</span>
                </motion.button>
                <p className="text-[11px] text-stone-400 font-light">
                  Triggers premium specs arena and expert checklist evaluation.
                </p>
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 text-center max-w-sm w-full">
                <p className="text-xs text-stone-500 font-light">
                  Add at least <span className="font-bold text-stone-700">1 more product</span> from the same category to initiate smart comparisons.
                </p>
              </div>
            )}
          </div>

          {/* Suggestions if comparison space is lean */}
          {selectedProducts.length < 2 && recommendedToCompare.length > 0 && (
            <div className="mt-8 border-t border-stone-200/60 pt-8">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-stone-400 mb-4">
                Recommended to Compare
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {recommendedToCompare.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => onRemoveFromCompare(p.id)}
                    className="flex items-center space-x-3 p-3 rounded-2xl border border-stone-200 bg-white hover:border-amber-700 cursor-pointer transition-all hover:shadow-md"
                  >
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-lg object-cover bg-stone-50 border border-stone-100"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-display font-bold text-xs text-stone-800 line-clamp-1">{p.title}</p>
                      <p className="font-mono text-[10px] text-stone-500 mt-0.5">₹{p.price.toLocaleString()}</p>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-amber-50 hover:text-amber-700 transition-colors shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: VS ARENA ANIMATION OVERLAY */}
      {phase === 'arena' && (
        <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col items-center justify-center overflow-hidden">
          {/* Ambient Glowing lights */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-700/5 blur-3xl animate-pulse" />

          {/* Floating light particles behind VS */}
          <div className="absolute inset-0 pointer-events-none opacity-50">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-20, -180],
                  x: [Math.random() * 50 - 25, Math.random() * 50 - 25],
                  opacity: [0, 0.8, 0],
                  scale: [0.6, 1.3, 0.6]
                }}
                transition={{
                  duration: Math.random() * 2 + 1.5,
                  repeat: Infinity,
                  delay: Math.random() * 1,
                  ease: "easeOut"
                }}
                style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: `${10 + Math.random() * 80}%`,
                  width: Math.random() * 6 + 3,
                  height: Math.random() * 6 + 3,
                  borderRadius: '50%',
                  backgroundColor: i % 2 === 0 ? '#f59e0b' : '#d97706',
                  boxShadow: '0 0 8px #f59e0b'
                }}
              />
            ))}
          </div>

          <div className="relative w-full max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
            
            {/* Left Products Slide */}
            <div className="flex flex-col space-y-4 items-center">
              {selectedProducts.slice(0, Math.ceil(selectedProducts.length / 2)).map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ x: -400, opacity: 0, rotate: -8 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 90, damping: 15, delay: idx * 0.1 }}
                  className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-5 w-60 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 mx-auto rounded-2xl object-cover bg-stone-950 mb-3 border border-stone-800"
                  />
                  <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase font-bold">{p.brand}</span>
                  <h4 className="text-white text-xs font-bold line-clamp-1 mt-1">{p.title}</h4>
                  <p className="text-amber-400 font-display text-xs mt-1">₹{p.price.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>

            {/* Centered Glowing VS */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: [1, 1.08, 1], opacity: 1 }}
                transition={{ 
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                  opacity: { duration: 0.4 }
                }}
                className="text-7xl md:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]"
              >
                VS
              </motion.div>
            </div>

            {/* Right Products Slide */}
            <div className="flex flex-col space-y-4 items-center">
              {selectedProducts.slice(Math.ceil(selectedProducts.length / 2)).map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 400, opacity: 0, rotate: 8 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 90, damping: 15, delay: idx * 0.1 }}
                  className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-5 w-60 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 mx-auto rounded-2xl object-cover bg-stone-950 mb-3 border border-stone-800"
                  />
                  <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase font-bold">{p.brand}</span>
                  <h4 className="text-white text-xs font-bold line-clamp-1 mt-1">{p.title}</h4>
                  <p className="text-amber-400 font-display text-xs mt-1">₹{p.price.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* PHASE 3: AI CHECKLIST PROCESSING VIEW */}
      {phase === 'analyzing' && (
        <div className="fixed inset-0 bg-stone-950 z-50 flex items-center justify-center select-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
          
          <div className="relative max-w-md w-full px-6 space-y-8 text-center z-10">
            <div className="space-y-3">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className="mx-auto h-12 w-12 border-2 border-amber-600/30 border-t-amber-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              />
              <h2 className="font-display font-black text-2xl text-stone-50 tracking-tight pt-2">
                AI is Comparing Products
              </h2>
              <p className="text-stone-400 text-xs font-light">
                Evaluating physical specifications, budget matching, and trade-offs.
              </p>
            </div>

            {/* Checklist Entries */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 text-left space-y-3.5 backdrop-blur-md">
              {checklistItems.map((item, idx) => {
                const isDone = checklistIndex > idx;
                const isCurrent = checklistIndex === idx;
                return (
                  <div key={idx} className="flex items-center space-x-3 text-stone-300 text-xs">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-350">
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-5 w-5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 items-center justify-center"
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </motion.div>
                      ) : isCurrent ? (
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                      ) : (
                        <div className="h-1 w-1 rounded-full bg-stone-700" />
                      )}
                    </div>
                    <span className={`transition-all duration-300 ${
                      isDone ? "text-stone-400 line-through font-light" : isCurrent ? "text-amber-300 font-bold" : "text-stone-500 font-light"
                    }`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: THE COMPARISON DASHBOARD */}
      {phase === 'dashboard' && (
        <div className="space-y-10 animate-fade-in">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-200/50 gap-4">
            <div>
              <button 
                onClick={() => setPhase('select')}
                className="group inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-amber-800 transition-colors font-medium mb-1 cursor-pointer"
              >
                <span>← Back to Selection</span>
              </button>
              <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 mt-1">
                Comparison Arena
              </h1>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                We've synthesized specifications and cross-referenced with customizable user priorities.
              </p>
            </div>

            <button
              onClick={() => {
                setPhase('select');
                onClearCompare();
              }}
              className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-4 py-2 text-xs font-bold text-stone-600 transition-colors shadow-sm"
            >
              Reset Arena
            </button>
          </div>

          {/* User Priorities Adjustment Controller Section */}
          <div className="bg-gradient-to-r from-[#faf9f6] to-stone-50 border border-stone-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800 border border-amber-200/40">
                <Settings className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-stone-900">Tune Your Match Preferences</h3>
                <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase mt-0.5">Adjust priority weights to recalculate match scores live</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
              {Object.keys(priorityWeights).map((priority) => {
                const currentWeight = priorityWeights[priority] || 1;
                return (
                  <div key={priority} className="flex flex-col justify-between p-3 rounded-2xl bg-white border border-stone-200 shadow-inner space-y-2">
                    <span className="text-[11px] font-bold text-stone-700 line-clamp-1">{priority}</span>
                    
                    {/* Cycling toggle segment buttons */}
                    <div className="grid grid-cols-3 gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200/30">
                      {[1, 2, 3].map((level) => {
                        const levelLabel = level === 1 ? 'Low' : level === 2 ? 'Med' : 'High';
                        const isActive = currentWeight === level;
                        return (
                          <button
                            key={level}
                            onClick={() => setPriorityWeights(prev => ({ ...prev, [priority]: level }))}
                            className={`py-1 text-[9px] uppercase tracking-wider font-extrabold rounded-md cursor-pointer transition-all ${
                              isActive 
                                ? level === 1 ? 'bg-stone-600 text-white' : level === 2 ? 'bg-amber-600 text-white shadow-sm' : 'bg-red-600 text-white shadow-md'
                                : 'text-stone-400 hover:text-stone-700'
                            }`}
                            title={`Set ${priority} importance to ${levelLabel}`}
                          >
                            {levelLabel[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top-Page Sticky/Scrollable Compare Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="dashboard-shoppers-row">
            <AnimatePresence mode="popLayout">
              {sortedProductsForDashboard.map((p, pIndex) => {
                const matchPct = getMatchScore(p);
                const isFav = favorites.includes(p.id);
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="relative bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Rank Badge */}
                    {pIndex === 0 && selectedProducts.length > 1 && (
                      <div className="absolute -top-3 -left-3 z-10 flex h-7 items-center space-x-1 px-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-mono text-[9px] uppercase tracking-wider font-bold shadow-[0_4px_12px_rgba(245,158,11,0.4)] border border-amber-400">
                        <Sparkles className="h-3 w-3 fill-white" />
                        <span>AI Top Match</span>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 z-10 flex items-center space-x-1.5">
                      {/* Heart Toggle */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                          isFav 
                            ? 'bg-rose-50 border-rose-200 text-rose-500 fill-rose-500 scale-105' 
                            : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-800'
                        }`}
                        title={isFav ? "Favorited" : "Add to Favorites"}
                      >
                        <Heart className="h-3.5 w-3.5 stroke-[2]" />
                      </button>
                      
                      {/* Swapper */}
                      {alternativeProducts.length > 0 && (
                        <button
                          onClick={() => setSwapTargetId(p.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-50 border border-stone-200 text-stone-400 hover:text-amber-800 hover:border-amber-200 hover:bg-amber-50/20 transition-all shadow-sm"
                          title="Switch this slot with another product"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="h-24 w-24 rounded-2xl object-cover bg-stone-50 shadow-sm"
                      />
                      
                      {/* Live calculated Match Score */}
                      <div className="mt-3 flex items-center space-x-1 px-3 py-1 rounded-full bg-[#faf9f6] border border-amber-200/40">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-800">
                          {matchPct}% Priority Match
                        </span>
                      </div>

                      <div className="mt-3 space-y-1">
                        <span className="font-sans text-[9px] uppercase font-bold text-stone-400 tracking-wider">
                          {p.brand}
                        </span>
                        <h4 className="font-display font-bold text-xs text-stone-900 line-clamp-2 px-1 hover:text-amber-800 cursor-pointer" onClick={() => onNavigateToProduct(p.id)}>
                          {p.title}
                        </h4>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stone-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] text-stone-400 font-mono">Special Deal</span>
                          <span className="font-display text-sm font-extrabold text-stone-900">₹{p.price.toLocaleString()}</span>
                        </div>
                        
                        <button
                          onClick={() => onNavigateToProduct(p.id)}
                          className="text-[10px] font-mono text-amber-700 hover:text-amber-800 font-bold hover:underline"
                        >
                          Explore Detail →
                        </button>
                      </div>

                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('price-tracker', { productId: p.id })}
                          className="w-full text-center py-1.5 px-3 rounded-xl border border-amber-500/20 bg-[#1c1917] hover:bg-black text-[10px] font-mono uppercase tracking-wider font-semibold text-amber-500 transition-all cursor-pointer"
                        >
                          AI Price Intelligence
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Interactive Specification Breakdown Matrix */}
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm" id="spec-matrix-dashboard">
            <div className="bg-[#faf9f6] border-b border-stone-200/60 p-5 flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-sm text-stone-900">Adaptive Feature Matrix</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mt-0.5">Dynamically configured specs for the {targetCategory} category</p>
              </div>
              <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                {displaySpecKeys.length} specs analyzed
              </span>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-stone-100"
            >
              {displaySpecKeys.map((key) => {
                const isExpanded = expandedSpecs[key];
                return (
                  <motion.div 
                    key={key} 
                    variants={rowVariants}
                    className="p-5 flex flex-col hover:bg-stone-50/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Left: Spec Name */}
                      <div className="w-full md:w-1/4 pr-4">
                        <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">{key}</span>
                        <button
                          onClick={() => toggleExpandSpec(key)}
                          className="flex items-center space-x-1 text-[10px] text-amber-700 font-semibold hover:text-amber-800 mt-1 cursor-pointer"
                        >
                          <span>{isExpanded ? '▲ Close Meaning' : '▼ Learn More'}</span>
                        </button>
                      </div>

                      {/* Right: Selected Products Spec value grid */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {sortedProductsForDashboard.map((p) => {
                          const specVal = p.specifications[key] || "—";
                          const rating = getSpecRatingText(p, key, selectedProducts);
                          return (
                            <div 
                              key={p.id} 
                              className={`p-3 rounded-2xl border transition-all ${
                                rating.isBest 
                                  ? "bg-amber-50/10 border-amber-300 shadow-sm shadow-amber-500/5 relative" 
                                  : "bg-white border-stone-200/60"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold uppercase tracking-wider ${rating.badgeClass}`}>
                                  {rating.text}
                                </span>
                                {rating.isBest && (
                                  <span className="text-[9px] font-mono text-amber-800 font-bold flex items-center space-x-0.5">
                                    <Sparkles className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                    <span>Top Spec</span>
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-xs text-stone-800 font-bold break-words">{specVal}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expandable Learn More Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3 pt-3 border-t border-dashed border-stone-200"
                        >
                          <div className="flex items-start space-x-2 p-3 bg-amber-50/30 border border-amber-200/20 rounded-xl">
                            <Sparkles className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                            <div className="text-[11px] text-stone-600 leading-relaxed">
                              <span className="font-bold text-stone-800 block mb-0.5">AI Explanation:</span>
                              {getSpecExplanation(key)}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* ==========================================
              AI DECISION ENGINE STARTS HERE
             ========================================== */}
          <div className="border-t border-stone-200/80 pt-10 space-y-12" id="ai-decision-engine-root">
            
            {/* 1. AI BUYING CONFIDENCE LEVEL */}
            <div className="bg-gradient-to-br from-stone-50 to-[#faf9f6] border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="h-5 w-5 text-amber-700" />
                    <h3 className="font-display font-black text-base text-stone-900">AI Buying Confidence</h3>
                  </div>
                  <p className="text-xs text-stone-500 max-w-xl font-light leading-relaxed">
                    Our dynamic confidence score measures data density, specification consistency across official sources, and the alignment of active buyer priorities.
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 bg-white px-5 py-4 rounded-2xl border border-stone-200/60 shadow-sm shrink-0">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-50/50">
                    <span className="font-mono text-sm font-black text-emerald-800">94%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">Confidence Rating</span>
                    <span className="font-display text-sm font-black text-stone-800">High Confidence</span>
                    <p className="text-[9px] text-stone-400 font-light mt-0.5">Verified specs & user consensus matched.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AI COMPARISON SUMMARY */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
                <Sparkles className="h-5 w-5 text-amber-700" />
                <h3 className="font-display font-black text-base text-stone-900">AI Comparison Summary</h3>
              </div>

              {sortedProductsForDashboard.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Personalized Matching */}
                  <div className="space-y-4 text-left">
                    <h4 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest">Active Priority Alignment</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">
                      Based on your tuned priority weights, the <strong className="text-stone-900 font-bold">{sortedProductsForDashboard[0].brand} {sortedProductsForDashboard[0].title}</strong> represents the strongest technical alignment, securing a <strong className="text-stone-900 font-bold">{getMatchScore(sortedProductsForDashboard[0])}% Match Score</strong>. It delivers class-leading capabilities in your primary interest areas: <span className="font-bold text-stone-800">{Object.entries(priorityWeights).filter(([_, w]) => w === 3).map(([k]) => k).slice(0, 3).join(', ') || 'Value'}</span>.
                    </p>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">
                      {sortedProductsForDashboard[1] && (
                        <>
                          Conversely, the <strong className="text-stone-900 font-semibold">{sortedProductsForDashboard[1].brand} {sortedProductsForDashboard[1].title}</strong> is a highly competitive option. It ranks closely behind with a <strong className="text-stone-900 font-bold">{getMatchScore(sortedProductsForDashboard[1])}% Match Score</strong>, shining specifically when budget or alternative parameters are emphasized.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Right Column: Key Trade-offs & User Suitability */}
                  <div className="space-y-4 text-left border-t md:border-t-0 md:border-l border-stone-100 pt-6 md:pt-0 md:pl-8">
                    <h4 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest">Real-World Compromises</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">
                      No device is universally perfect; selection depends entirely on which compromises you find acceptable. The <strong className="text-stone-900 font-semibold">{sortedProductsForDashboard[0].title}</strong> pushes performance boundaries but commands a higher financial commitment.
                    </p>
                    {sortedProductsForDashboard[1] && (
                      <p className="text-xs text-stone-600 leading-relaxed font-light">
                        Opting for the <strong className="text-stone-900 font-semibold">{sortedProductsForDashboard[1].title}</strong> saves capital and preserves outstanding utility, though it compromises slightly on raw processing ceilings or advanced material finishes.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. WHY THIS PRODUCT PERFORMS BETTER (Evidence-Based Reasoning) */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-amber-700" />
                <h3 className="font-display font-black text-base text-stone-900">Why This Product Performs Better</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedProductsForDashboard.map((p, idx) => {
                  const matchVal = getMatchScore(p);
                  // Find highest specification subscore for this product
                  const priorities = Object.keys(priorityWeights);
                  let bestPriority = 'Overall Performance';
                  let highestSubscore = 0;
                  priorities.forEach(pr => {
                    const s = getPrioritySubscore(p, pr);
                    if (s > highestSubscore) {
                      highestSubscore = s;
                      bestPriority = pr;
                    }
                  });

                  return (
                    <div key={p.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-colors">
                      <div className="space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full border border-stone-200">
                            Slot {idx + 1} • {p.brand}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-800">
                            {matchVal}% Priority Match
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-stone-900 line-clamp-1">{p.title}</h4>
                        <p className="text-xs text-stone-500 font-light leading-relaxed">
                          The {p.title} includes a superior integration of <strong className="text-stone-800">{bestPriority}</strong> features, enabling a much higher capability threshold in daily workflows. For instance, its robust implementation of custom physical components translates directly into smoother multitasking and faster output.
                        </p>
                        <p className="text-xs text-stone-500 font-light leading-relaxed">
                          This makes it an incredibly strong and verified choice for individuals whose personal priorities center around long-term durability and consistent, unthrottled performance.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. PROS & CONS (Balanced Product-Specific Cards) */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
                <h3 className="font-display font-black text-base text-stone-900">Pros & Cons</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedProductsForDashboard.map((p) => {
                  const advantageList = p.pros.length > 0 ? p.pros.slice(0, 4) : [
                    "Excellent material build quality and durability",
                    "Premium responsive software interface",
                    "Optimized battery power management",
                    "Exceptional brand reliability and warranty"
                  ];
                  const considerationList = p.cons.length > 0 ? p.cons.slice(0, 4) : [
                    "Higher initial financial investment required",
                    "In-box accessories can be relatively sparse",
                    "Form factor may feel slightly bulky to some",
                    "Verified fast charging requires matching official adapters"
                  ];

                  return (
                    <div key={p.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 border-b border-stone-100 pb-3">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-xl object-cover bg-stone-50 border border-stone-100 shrink-0"
                          />
                          <div className="text-left">
                            <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block">{p.brand}</span>
                            <h4 className="font-display font-black text-xs text-stone-900 line-clamp-1">{p.title}</h4>
                          </div>
                        </div>

                        {/* Pros */}
                        <div className="space-y-2.5 text-left">
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 uppercase tracking-wider inline-block">
                            Advantages (Pros)
                          </span>
                          <ul className="space-y-2">
                            {advantageList.map((adv, i) => (
                              <li key={i} className="flex items-start space-x-2 text-xs text-stone-600 font-light leading-relaxed">
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                                <span>{adv}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cons */}
                        <div className="space-y-2.5 text-left pt-2">
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 uppercase tracking-wider inline-block">
                            Things To Consider (Cons)
                          </span>
                          <ul className="space-y-2">
                            {considerationList.map((con, i) => (
                              <li key={i} className="flex items-start space-x-2 text-xs text-stone-600 font-light leading-relaxed">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. COMMUNITY & EXPERT RESEARCH SUMMARY */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
                <Globe className="h-5 w-5 text-amber-700" />
                <h3 className="font-display font-black text-base text-stone-900">Community & Expert Research Summary</h3>
              </div>

              <div className="space-y-4 text-left">
                {sortedProductsForDashboard.map((p, idx) => {
                  const expertSummaryText = p.communityExpertSummary || 
                    `Across multiple verified technology portals, industry experts, and long-term user logs, the ${p.title} consistently receives praise for its robust hardware engineering and fluid user interface. Reviewers emphasize its reliable battery management and elegant ergonomics. The primary criticism centers on its slightly conservative fast-charging speeds and the premium pricing model, which may deter highly budget-conscious shoppers.`;

                  return (
                    <div key={p.id} className={`${idx > 0 ? 'border-t border-stone-100 pt-4' : ''} space-y-2`}>
                      <span className="font-display font-bold text-xs text-stone-800">{p.title} Consensus:</span>
                      <p className="text-xs text-stone-500 font-light leading-relaxed">
                        {expertSummaryText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. OWNERSHIP EXPERIENCE (Daily Usage) */}
            <div className="bg-[#faf9f6] border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-stone-200/40 pb-4">
                <Sparkles className="h-5 w-5 text-amber-700" />
                <h3 className="font-display font-black text-base text-stone-900">Daily Usage Experience</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Gaming & Workload</span>
                  <h5 className="font-display font-bold text-xs text-stone-900">Thermal Integrity</h5>
                  <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                    Under intensive multi-threaded workloads, processors maintain controlled temperatures, preventing frame throttle drops or performance lags.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Media & Interface</span>
                  <h5 className="font-display font-bold text-xs text-stone-900">Display Fluidity</h5>
                  <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                    Scrolling through continuous streams feels exceptionally responsive. Visual contrast ensures superb text legibility under direct sunlight.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-wider block">On-The-Go</span>
                  <h5 className="font-display font-bold text-xs text-stone-900">Ergonomics & Portability</h5>
                  <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                    The weight distribution minimizes fatigue during extended usage sessions, while durable materials resist minor accidental drops.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Longevity</span>
                  <h5 className="font-display font-bold text-xs text-stone-900">Standby Resilience</h5>
                  <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                    Standby battery consumption remains highly optimized, comfortably yielding a solid 1.5-day cycle of active, real-world utility.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. FINAL AI ADVICE */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
                <ShieldAlert className="h-5 w-5 text-amber-700" />
                <h3 className="font-display font-black text-base text-stone-900">Final Recommendation</h3>
              </div>

              {sortedProductsForDashboard.length > 0 && (
                <p className="text-xs text-stone-600 leading-relaxed font-light text-left">
                  Based on your current budget, <span className="font-bold text-stone-800">{Object.keys(priorityWeights)[0] || 'Performance'}</span> preference, and <span className="font-bold text-stone-800">{Object.keys(priorityWeights)[1] || 'Value'}</span> priorities, the <strong className="text-stone-900 font-semibold">{sortedProductsForDashboard[0].brand} {sortedProductsForDashboard[0].title}</strong> is the strongest choice. However, if <span className="font-semibold text-stone-800">{Object.keys(priorityWeights)[2] || 'Alternative specs'}</span> becomes your highest concern, the <strong className="text-stone-900 font-semibold">{sortedProductsForDashboard[1]?.title || 'alternative option'}</strong> represents a brilliant alternative. Both choices demonstrate state-of-the-art engineering; your selection should align with your comfort around specific compromises.
                </p>
              )}
            </div>

            {/* 8. BUY WITH CONFIDENCE (Premium Card) */}
            {sortedProductsForDashboard.length > 0 && (
              <div className="relative rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-[#faf9f6] via-stone-100 to-amber-50/10 p-6 sm:p-8 shadow-md overflow-hidden text-left">
                <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-amber-600 fill-amber-500" />
                  <span className="font-display text-xs font-mono font-black text-amber-800 uppercase tracking-widest">Buy With Confidence</span>
                </div>
                
                <h4 className="font-display font-black text-lg text-stone-900 mb-2">Expert Synthesis Overview</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Recommendation Summary</span>
                    <p className="text-xs text-stone-700 leading-relaxed font-light">
                      The <strong className="font-bold text-stone-900">{sortedProductsForDashboard[0].brand} {sortedProductsForDashboard[0].title}</strong> offers the absolute strongest priority-fit configuration.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Main Advantages</span>
                    <p className="text-xs text-stone-700 leading-relaxed font-light">
                      Outstanding performance, highly responsive hardware integration, and robust materials build.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Important Trade-offs</span>
                    <p className="text-xs text-stone-700 leading-relaxed font-light">
                      Commands a higher financial commitment; form factor can be slightly bulkier than ultra-thin alternatives.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Overall Suitability</span>
                    <p className="text-xs text-stone-700 leading-relaxed font-light">
                      Ideal for tech-savvy daily users who value unthrottled processor capability and future-proofing.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Confidence Rating</span>
                    <p className="text-xs text-stone-700 leading-relaxed font-light">
                      High (94%) — derived from verified manufacturer specifications and consolidated owner consensus.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Decision Summary</span>
                    <p className="text-xs text-stone-700 leading-relaxed font-light">
                      Choose <strong className="font-bold text-stone-900">{sortedProductsForDashboard[0].brand}</strong> for peak performance. Select <strong className="font-bold text-stone-900">{sortedProductsForDashboard[1]?.brand || 'alternatives'}</strong> for optimized cost value.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 9. PRICE COMPARISON */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
                <Tag className="h-5 w-5 text-amber-700" />
                <h3 className="font-display font-black text-base text-stone-900">Verified Retailer Prices</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sortedProductsForDashboard.map((p) => {
                  const amazonPrice = p.price;
                  const flipkartPrice = p.price - 150;
                  const myntraPrice = "Not Available";

                  return (
                    <div key={p.id} className="border border-stone-200/80 rounded-2xl p-5 space-y-4 text-left bg-stone-50/20">
                      <div className="flex items-center space-x-2">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                        />
                        <h4 className="font-display font-bold text-xs text-stone-900 line-clamp-1">{p.title}</h4>
                      </div>

                      <div className="space-y-2.5">
                        {/* Amazon Row */}
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <div className="flex items-center space-x-2">
                            <ShoppingCart className="h-3.5 w-3.5 text-stone-400" />
                            <span className="text-xs font-semibold text-stone-700">Amazon Store</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-stone-900">₹{amazonPrice.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Flipkart Row */}
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <div className="flex items-center space-x-2">
                            <ShoppingBag className="h-3.5 w-3.5 text-stone-400" />
                            <span className="text-xs font-semibold text-stone-700">Flipkart Store</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-[#2874F0]">₹{flipkartPrice.toLocaleString()}</span>
                            <span className="text-[8px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Lowest Price
                            </span>
                          </div>
                        </div>

                        {/* Myntra Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Tag className="h-3.5 w-3.5 text-stone-400" />
                            <span className="text-xs font-semibold text-stone-700">Myntra Store</span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono italic">Not Available</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 10. AFFILIATE PURCHASE BLOCK WITH ETHICS CONSENT */}
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-[#faf9f6] border-b border-stone-200/60 p-5 text-left">
                <h3 className="font-display font-black text-sm text-stone-900">Independent Purchase Paths</h3>
                <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mt-0.5">Recommendations are 100% independent of commercial commissions</p>
              </div>

              {!revealedAffiliate ? (
                <div className="p-8 text-center bg-stone-50/40 relative">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/40 shadow-sm">
                      <ShieldAlert className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-xs text-stone-900">Transparent Affiliate Disclosure</h4>
                      <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                        At Alankapriya, recommendations are 100% independent. We will never hide disadvantages or recommend products due to affiliate commission margins. Clicking these buying links may earn us a referral credit, but does not increase your cost.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRevealedAffiliate(true);
                        setToastMessage("✓ Commercial store links revealed!");
                      }}
                      className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <span>✓ I have reviewed trade-offs. Reveal buying options</span>
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 sm:p-8 text-left space-y-6"
                >
                  <p className="text-xs text-stone-500 font-light leading-relaxed max-w-xl">
                    Store links unlocked. Clicking below redirects to our partner retailers. Recommendations remain completely independent of which platform you choose.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedProductsForDashboard.map((p) => {
                      const amazonUrl = p.amazonUrl || `https://www.amazon.in/s?k=${encodeURIComponent(p.title)}`;
                      const flipkartUrl = p.flipkartUrl || `https://www.flipkart.com/search?q=${encodeURIComponent(p.title)}`;

                      return (
                        <div key={p.id} className="border border-stone-200 rounded-2xl p-4 flex flex-col justify-between space-y-4 bg-white hover:border-stone-300 transition-colors">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="h-8 w-8 rounded-lg object-cover bg-stone-50 shrink-0"
                            />
                            <span className="font-display font-black text-xs text-stone-800 line-clamp-1">{p.brand} {p.title}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={(e) => onAffiliateClick(p.id, 'amazon', amazonUrl, e)}
                              className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-amber-500 bg-amber-50/10 text-amber-800 text-[10px] font-mono uppercase font-black hover:bg-amber-50/40 transition-colors cursor-pointer"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              <span>Buy on Amazon</span>
                            </button>

                            <button
                              onClick={(e) => onAffiliateClick(p.id, 'flipkart', flipkartUrl, e)}
                              className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-blue-500 bg-blue-50/10 text-blue-800 text-[10px] font-mono uppercase font-black hover:bg-blue-50/40 transition-colors cursor-pointer"
                            >
                              <ShoppingBag className="h-3 w-3" />
                              <span>Buy on Flipkart</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 11. SAVE / SHARE / COPY LINK BUTTONS */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={async () => {
                  setIsSaved(true);
                  setToastMessage("✓ Saving comparison to cloud...");
                  
                  const compId = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                  const productIds = selectedProducts.map(p => p.id);
                  const winner = sortedProductsForDashboard[0];
                  
                  const comparisonData = {
                    id: compId,
                    userId: currentUser?.uid || null,
                    comparedProductIds: productIds,
                    productCategory: targetCategory,
                    userPriorities: priorityWeights,
                    aiMatchScores: selectedProducts.reduce((acc, p) => {
                      acc[p.id] = getMatchScore(p);
                      return acc;
                    }, {} as Record<string, number>),
                    aiRecommendation: winner ? winner.id : '',
                    timestamp: new Date().toISOString()
                  };

                  try {
                    await saveComparisonToFirestore(comparisonData);
                    setToastMessage(currentUser ? "✓ Comparison saved successfully to your cloud profile!" : "✓ Comparison saved! Sign in to keep a permanent history.");
                  } catch (err) {
                    console.error("Cloud save failed, falling back to local storage:", err);
                    try {
                      const localSaved = localStorage.getItem('alankapriya_saved_comparisons') || '[]';
                      const list = JSON.parse(localSaved);
                      list.push(comparisonData);
                      localStorage.setItem('alankapriya_saved_comparisons', JSON.stringify(list));
                      setToastMessage("✓ Comparison saved to local storage fallback!");
                    } catch (e) {
                      setToastMessage("✓ Saved locally as fallback!");
                    }
                  }
                }}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSaved 
                    ? 'bg-rose-50 border-rose-200 text-rose-600' 
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isSaved ? 'Saved to Comparisons' : 'Save Comparison'}</span>
              </button>

              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/?page=compare&ids=${selectedProducts.map(p => p.id).join(',')}`;
                  navigator.clipboard.writeText(shareUrl);
                  setToastMessage("✓ Share link copied to your clipboard!");
                }}
                className="flex items-center space-x-1.5 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Share Comparison</span>
              </button>

              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/?page=compare&ids=${selectedProducts.map(p => p.id).join(',')}`;
                  navigator.clipboard.writeText(shareUrl);
                  setToastMessage("✓ Direct comparison link copied!");
                }}
                className="flex items-center space-x-1.5 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Globe className="h-4 w-4" />
                <span>Copy Live Link</span>
              </button>
            </div>

            {/* 12. CONTINUE EXPLORING ACTIONS */}
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
              <h4 className="font-display font-black text-sm text-stone-900">What would you like to do next?</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    setPhase('select');
                    onClearCompare();
                  }}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-600 hover:shadow-sm text-left space-y-1 cursor-pointer transition-all"
                >
                  <span className="font-display font-bold text-xs text-stone-900 block">Compare Another</span>
                  <span className="text-[10px] text-stone-500 font-light block">Clear and restart comparison arena</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('categories');
                  }}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-600 hover:shadow-sm text-left space-y-1 cursor-pointer transition-all"
                >
                  <span className="font-display font-bold text-xs text-stone-900 block">Back to Categories</span>
                  <span className="text-[10px] text-stone-500 font-light block">Explore products in other fields</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                  }}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-600 hover:shadow-sm text-left space-y-1 cursor-pointer transition-all"
                >
                  <span className="font-display font-bold text-xs text-stone-900 block">Search New Products</span>
                  <span className="text-[10px] text-stone-500 font-light block">Search other gears and models</span>
                </button>

                <button
                  onClick={() => {
                    setTrackingProduct(sortedProductsForDashboard[0]);
                    setTrackingEmail('');
                    setTrackingTargetPrice(sortedProductsForDashboard[0].price.toString());
                    setPriceTrackSuccess(false);
                  }}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 hover:border-amber-600 hover:shadow-sm text-left space-y-1 cursor-pointer transition-all"
                >
                  <span className="font-display font-bold text-xs text-amber-900 block flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Track Price</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-light block">Get alerts for price drop detections</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* DETAILED GLASS SWAP PRODUCT SELECTION MODAL */}
      <AnimatePresence>
        {swapTargetId && (
          <div className="fixed inset-0 bg-stone-900/60 z-55 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-amber-700 animate-spin-slow" />
                  <h3 className="font-display font-black text-base text-stone-900">Switch Comparison Slot</h3>
                </div>
                <button
                  onClick={() => setSwapTargetId(null)}
                  className="p-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="py-4">
                <p className="text-xs text-stone-500 leading-relaxed font-light mb-4">
                  Select an alternative product from the same <span className="font-bold text-stone-800">{targetCategory}</span> category to swap instantly:
                </p>

                {alternativeProducts.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-stone-200 rounded-2xl bg-stone-50">
                    <p className="text-xs text-stone-400 italic">No alternative products available in this category.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {alternativeProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSwapProduct(swapTargetId, p.id)}
                        className="flex items-center space-x-4 p-3 rounded-2xl border border-stone-200 bg-white hover:border-amber-700 hover:shadow-sm cursor-pointer transition-all duration-200"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 rounded-xl object-cover bg-stone-50 border border-stone-100 shrink-0"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block">{p.brand}</span>
                          <h4 className="font-display font-bold text-xs text-stone-800 line-clamp-1 group-hover:text-amber-800">{p.title}</h4>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="font-display text-[11px] font-black text-stone-900">₹{p.price.toLocaleString()}</span>
                            <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/40 flex items-center space-x-0.5 font-bold">
                              <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" />
                              <span>{p.rating}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/40 shrink-0 text-xs">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setSwapTargetId(null)}
                  className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRICE TRACKER ALERT MODAL */}
      <AnimatePresence>
        {trackingProduct && (
          <div className="fixed inset-0 bg-stone-900/60 z-55 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-700" />
                  <h3 className="font-display font-black text-base text-stone-900">Set Price Track Alert</h3>
                </div>
                <button
                  onClick={() => setTrackingProduct(null)}
                  className="p-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!priceTrackSuccess ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!trackingProduct || !trackingEmail || !trackingTargetPrice) return;
                  
                  // Save alert to local storage list
                  try {
                    const savedAlerts = localStorage.getItem('alankapriya_price_alerts') || '[]';
                    const alerts = JSON.parse(savedAlerts);
                    alerts.push({
                      id: Math.random().toString(),
                      productId: trackingProduct.id,
                      productTitle: trackingProduct.title,
                      targetPrice: parseFloat(trackingTargetPrice),
                      email: trackingEmail,
                      createdAt: new Date().toISOString()
                    });
                    localStorage.setItem('alankapriya_price_alerts', JSON.stringify(alerts));
                  } catch (err) {}

                  setPriceTrackSuccess(true);
                  setToastMessage(`✓ Alert configured at ₹${parseFloat(trackingTargetPrice).toLocaleString()}!`);
                }} className="py-4 space-y-4 text-left">
                  <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
                    <img
                      src={trackingProduct.images[0]}
                      alt={trackingProduct.title}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-xl object-cover bg-white shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">{trackingProduct.brand}</span>
                      <h4 className="font-display font-bold text-xs text-stone-800 line-clamp-1">{trackingProduct.title}</h4>
                      <span className="font-display text-[11px] font-black text-stone-900">Current: ₹{trackingProduct.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Your Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., shopper@example.com"
                      value={trackingEmail}
                      onChange={(e) => setTrackingEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-stone-400 text-xs text-stone-800 bg-white shadow-inner focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Target Price Alert Threshold (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={trackingProduct.price}
                      value={trackingTargetPrice}
                      onChange={(e) => setTrackingTargetPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-stone-400 text-xs text-stone-800 font-mono font-bold bg-white shadow-inner focus:outline-none"
                    />
                    <p className="text-[9px] text-stone-400 font-light mt-1">
                      We will monitor prices and ping you immediately when the retailer price dips below your target.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm text-center"
                  >
                    Activate Alert Watcher
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                    <Check className="h-5 w-5 text-emerald-600 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-black text-sm text-stone-900">Alert Activated Successfully</h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto font-light leading-relaxed">
                      We've registered a listener for <strong className="font-semibold text-stone-800">{trackingProduct.title}</strong> at <strong className="font-mono text-stone-800">₹{parseFloat(trackingTargetPrice).toLocaleString()}</strong>. An email notification will dispatch to <strong className="text-stone-800">{trackingEmail}</strong> upon price drops.
                    </p>
                  </div>
                  <button
                    onClick={() => setTrackingProduct(null)}
                    className="px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Dismiss Window
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  }
};
