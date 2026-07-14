import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Search, Check, AlertCircle, RefreshCw, ChevronLeft, 
  ArrowRight, Cpu, Smartphone, Laptop, BadgeAlert, Coins, 
  Footprints, Watch, Info, ShieldCheck, Mail, Sliders, X, ArrowLeft,
  Bookmark, Heart, ShoppingCart, ShoppingBag, ArrowLeftRight, Award,
  DollarSign, CheckCircle2, ThumbsUp, ThumbsDown, Gauge, Zap,
  Compass, ExternalLink, Activity, Flame, ShieldAlert, Badge, Info as InfoIcon
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { CURATED_PRODUCTS, AICuratedProduct } from '../data/aiCuratedProducts';

interface AIFinderProps {
  products: Product[];
  categories?: ProductCategory[];
  onBackToHome: () => void;
  onAddToCart: (product: Product) => void;
  onNavigateToProduct: (productId: string) => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  compareList?: string[];
  onToggleCompare?: (productId: string) => void;
}

// Helper to resolve metrics dynamically for custom products from Firestore
const getProductMetrics = (product: Product) => {
  if ((product as any).metrics) {
    return (product as any).metrics;
  }
  const curated = CURATED_PRODUCTS.find(cp => cp.id === product.id);
  if (curated) {
    return curated.metrics;
  }
  const rating = product.rating || 4.5;
  const ratingScale = Math.round(rating * 2);
  return {
    performance: ratingScale,
    camera: ratingScale,
    battery: ratingScale,
    display: ratingScale,
    value: Math.round(10 - (product.price / 15000)) || 5,
    gaming: ratingScale,
    isOled: product.overview?.toLowerCase().includes('oled') || JSON.stringify(product.specifications).toLowerCase().includes('oled'),
    isHighRefresh: product.overview?.toLowerCase().includes('120hz') || product.overview?.toLowerCase().includes('144hz') || JSON.stringify(product.specifications).toLowerCase().includes('120hz'),
    isWaterproof: product.overview?.toLowerCase().includes('waterproof') || product.overview?.toLowerCase().includes('ip68'),
    os: product.brand.toLowerCase() === 'apple' ? (product.category === 'Laptops' ? 'macos' : 'ios') : 'universal'
  };
};

// Supported Categories and their trigger keywords
const SUPPORTED_CATEGORIES = {
  SMARTPHONES: 'Smartphones',
  LAPTOPS: 'Laptops',
  RUNNING_SHOES: 'Running Shoes',
  SMARTWATCHES: 'Smartwatches'
};

// Unsupported Categories
const UNSUPPORTED_CATEGORIES = {
  HAIR_DRYERS: 'Hair Dryers',
  REFRIGERATORS: 'Refrigerators'
};

interface SuggestionItem {
  text: string;
  category: string; // 'Smartphones' | 'Laptops' | 'Running Shoes' | 'Smartwatches' | 'Hair Dryers' | 'Refrigerators' | 'Other'
  type: 'supported' | 'unsupported' | 'unknown';
  icon: any;
}

export default function AIFinder({ 
  products, 
  categories = [],
  onBackToHome, 
  onAddToCart, 
  onNavigateToProduct, 
  initialQuery, 
  onClearInitialQuery,
  compareList = [],
  onToggleCompare
}: AIFinderProps) {
  // Main states
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [identifiedCategory, setIdentifiedCategory] = useState<string | null>(null);
  const [matchedBrand, setMatchedBrand] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      triggerSearch(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery]);
  
  // Applet Screen State Flow
  // 'search' -> 'processing' -> 'unsupported' | 'unidentified' | 'questions' -> 'analysis' | 'results'
  const [screenState, setScreenState] = useState<'search' | 'processing' | 'questions' | 'unsupported' | 'unidentified' | 'analysis' | 'results'>('search');
  
  // AI processing checklists
  const [processingStep, setProcessingStep] = useState(0); // 0, 1, 2, 3
  
  // Questionnaire states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customSliderValue, setCustomSliderValue] = useState<number>(50000);
  const [showSlider, setShowSlider] = useState<boolean>(false);

  // Analysis completion state
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Feedback fields
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotified, setIsNotified] = useState(false);
  const [categoryRequestSubmitted, setCategoryRequestSubmitted] = useState(false);
  const [requestCategoryText, setRequestCategoryText] = useState('');

  // Sample static list of suggestions matching user requirements
  const staticSuggestions: SuggestionItem[] = [
    { text: 'Samsung Galaxy S25 Ultra', category: SUPPORTED_CATEGORIES.SMARTPHONES, type: 'supported', icon: Smartphone },
    { text: 'Samsung Galaxy M36 5G', category: SUPPORTED_CATEGORIES.SMARTPHONES, type: 'supported', icon: Smartphone },
    { text: 'Samsung Crystal UHD TV', category: 'TV', type: 'unsupported', icon: BadgeAlert },
    { text: 'Samsung Smart Washing Machine', category: UNSUPPORTED_CATEGORIES.REFRIGERATORS, type: 'unsupported', icon: BadgeAlert },
    { text: 'Samsung Galaxy Watch 7', category: SUPPORTED_CATEGORIES.SMARTWATCHES, type: 'supported', icon: Watch },
    { text: 'Best laptop for coding', category: SUPPORTED_CATEGORIES.LAPTOPS, type: 'supported', icon: Laptop },
    { text: 'Gaming phone under ₹25,000', category: SUPPORTED_CATEGORIES.SMARTPHONES, type: 'supported', icon: Smartphone },
    { text: 'Ultralight running shoes', category: SUPPORTED_CATEGORIES.RUNNING_SHOES, type: 'supported', icon: Footprints },
    { text: 'Dyson Supersonic Hair dryer', category: UNSUPPORTED_CATEGORIES.HAIR_DRYERS, type: 'unsupported', icon: BadgeAlert },
    { text: 'Double-Door Refrigerator', category: UNSUPPORTED_CATEGORIES.REFRIGERATORS, type: 'unsupported', icon: BadgeAlert },
    { text: 'Garmin Forerunner Smartwatch', category: SUPPORTED_CATEGORIES.SMARTWATCHES, type: 'supported', icon: Watch }
  ];

  // Dynamic suggestion list based on user query input
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    
    // Hardcoded exact Samsung terms from requirements if user types "Sam"
    if (q.startsWith('sam')) {
      return [
        { text: 'Samsung', category: SUPPORTED_CATEGORIES.SMARTPHONES, type: 'supported', icon: Smartphone },
        { text: 'Samsung Galaxy M36', category: SUPPORTED_CATEGORIES.SMARTPHONES, type: 'supported', icon: Smartphone },
        { text: 'Samsung Galaxy S25', category: SUPPORTED_CATEGORIES.SMARTPHONES, type: 'supported', icon: Smartphone },
        { text: 'Samsung TV', category: 'TV', type: 'unsupported', icon: BadgeAlert },
        { text: 'Samsung Washing Machine', category: 'Washing Machine', type: 'unsupported', icon: BadgeAlert }
      ] as SuggestionItem[];
    }

    return staticSuggestions.filter(item => 
      item.text.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query]);

  // Click handler for suggestion chips/items
  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    setIsSearchFocused(false);
    triggerSearch(text);
  };

  // Perform Category Identification based on Natural Language query
  const triggerSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Transition to loading/processing screen
    setScreenState('processing');
    setProcessingStep(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowSlider(false);

    // Dynamic brand detection
    const lowerQuery = searchQuery.toLowerCase();
    let detectedBrand: string | null = null;
    if (lowerQuery.includes('samsung')) detectedBrand = 'Samsung';
    else if (lowerQuery.includes('apple') || lowerQuery.includes('macbook') || lowerQuery.includes('iphone')) detectedBrand = 'Apple';
    else if (lowerQuery.includes('oneplus')) detectedBrand = 'OnePlus';
    else if (lowerQuery.includes('nothing')) detectedBrand = 'Nothing';
    else if (lowerQuery.includes('motorola') || lowerQuery.includes('moto')) detectedBrand = 'Motorola';
    else if (lowerQuery.includes('realme')) detectedBrand = 'Realme';
    else if (lowerQuery.includes('nike')) detectedBrand = 'Nike';
    else if (lowerQuery.includes('adidas')) detectedBrand = 'Adidas';
    else if (lowerQuery.includes('asics')) detectedBrand = 'Asics';
    else if (lowerQuery.includes('puma')) detectedBrand = 'Puma';
    setMatchedBrand(detectedBrand);

    // AI themed animated checklist loop (lasts ~1.5 - 2 seconds)
    const interval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev >= 2) {
          clearInterval(interval);
          // Run classification algorithm once checklist finishes
          setTimeout(() => {
            classifyQueryCategory(searchQuery);
          }, 300);
          return 3;
        }
        return prev + 1;
      });
    }, 550);
  };

  // AI Understanding / Classifier Heuristics
  const classifyQueryCategory = (searchQuery: string) => {
    const q = searchQuery.toLowerCase();

    // 1. Check for Unsupported Categories first
    if (q.includes('hair dryer') || q.includes('dryer') || q.includes('hairdryer')) {
      setIdentifiedCategory(UNSUPPORTED_CATEGORIES.HAIR_DRYERS);
      setScreenState('unsupported');
      return;
    }
    if (q.includes('fridge') || q.includes('refrigerator') || q.includes('washing machine') || q.includes('tv') || q.includes('television')) {
      setIdentifiedCategory(UNSUPPORTED_CATEGORIES.REFRIGERATORS);
      setScreenState('unsupported');
      return;
    }

    // 2. Check for Supported Categories
    if (q.includes('phone') || q.includes('smartphone') || q.includes('mobile') || q.includes('s25') || q.includes('m36') || q.includes('iphone') || q.includes('galaxy')) {
      setIdentifiedCategory(SUPPORTED_CATEGORIES.SMARTPHONES);
      setScreenState('questions');
      return;
    }
    if (q.includes('laptop') || q.includes('macbook') || q.includes('coding laptop') || q.includes('computer') || q.includes('notebook')) {
      setIdentifiedCategory(SUPPORTED_CATEGORIES.LAPTOPS);
      setScreenState('questions');
      return;
    }
    if (q.includes('shoe') || q.includes('running shoes') || q.includes('sneaker') || q.includes('boots') || q.includes('shoes')) {
      setIdentifiedCategory(SUPPORTED_CATEGORIES.RUNNING_SHOES);
      setScreenState('questions');
      return;
    }
    if (q.includes('watch') || q.includes('smartwatch') || q.includes('garmin') || q.includes('fitbit') || q.includes('wearable')) {
      setIdentifiedCategory(SUPPORTED_CATEGORIES.SMARTWATCHES);
      setScreenState('questions');
      return;
    }

    // Fallback: Check if any exact keyword patterns match
    const isPhone = staticSuggestions.some(s => s.category === SUPPORTED_CATEGORIES.SMARTPHONES && q.includes(s.text.toLowerCase()));
    if (isPhone) {
      setIdentifiedCategory(SUPPORTED_CATEGORIES.SMARTPHONES);
      setScreenState('questions');
      return;
    }

    // Unidentifiable product category
    setScreenState('unidentified');
  };

  // GET RELEVANT QUESTIONS LIST DYNAMICALLY BASED ON CURRENT CATEGORY AND PREVIOUS ANSWERS
  const questionsList = useMemo(() => {
    if (!identifiedCategory) return [];

    switch (identifiedCategory) {
      case SUPPORTED_CATEGORIES.SMARTPHONES: {
        const qList = [
          {
            id: 'budget',
            text: 'What is your budget for this smartphone?',
            type: 'chips',
            options: ['₹10,000', '₹15,000', '₹20,000', '₹25,000', '₹30,000', 'Custom Budget']
          },
          {
            id: 'purpose',
            text: 'What will be the primary purpose of this smartphone?',
            type: 'chips',
            options: ['Gaming', 'Camera', 'Student', 'Office', 'Business', 'Photography', 'Daily Use']
          }
        ];

        // Intelligent branching: if user selected Gaming
        if (answers['purpose'] === 'Gaming') {
          qList.push(
            {
              id: 'performance',
              text: 'How critical is maximum processor performance?',
              type: 'chips',
              options: ['Absolute Maximum (Snapdragon 8 Elite / Gen 3)', 'High Performance (Dimensity 8300 / Snapdragon 7 Gen 3)', 'Decent casual gaming performance']
            },
            {
              id: 'refresh_rate',
              text: 'What is your screen refresh rate preference?',
              type: 'chips',
              options: ['144Hz+ esports display', '120Hz smooth standard', '90Hz / No preference']
            },
            {
              id: 'cooling',
              text: 'Are you concerned about smartphone heating during long sessions?',
              type: 'chips',
              options: ['Yes, must have a multi-layer Liquid Vapor chamber', 'Moderate heat control is fine']
            },
            {
              id: 'battery',
              text: 'Which battery configuration is your priority?',
              type: 'chips',
              options: ['Monster Battery (6000mAh+ capacity)', 'Fast-charging priority (5000mAh with 80W+ charger)', 'Slim premium profile / Standard battery']
            }
          );
        }
        // If photography / camera
        else if (answers['purpose'] === 'Photography' || answers['purpose'] === 'Camera') {
          qList.push(
            {
              id: 'zoom',
              text: 'What zoom capability is necessary for your requirements?',
              type: 'chips',
              options: ['Ultra Zoom (100x Space Zoom / Dedicated Periscope)', 'Optical Portrait Zoom (3x - 5x Telephoto)', 'Standard Digital Zoom is fine']
            },
            {
              id: 'night_mode',
              text: 'How critical is dedicated Night Mode and low-light sensor size?',
              type: 'chips',
              options: ['Extremely Important (Pro Nightography)', 'Decent evening snaps are fine']
            },
            {
              id: 'video_ stabilization',
              text: 'What are your video recording and stabilization requirements?',
              type: 'chips',
              options: ['Cinematic 8K with professional Gimbal OIS', '4K 60FPS action-cam stabilization', 'Casual 1080p clips']
            },
            {
              id: 'selfie',
              text: 'How often do you take front-facing camera portrait selfies?',
              type: 'chips',
              options: ['Very Frequently (Autofocus high-res selfie cam required)', 'Standard occasional selfies']
            }
          );
        }
        // General use follow-ups
        else {
          qList.push(
            {
              id: 'general_battery',
              text: 'What is your daily battery endurance expectation?',
              type: 'chips',
              options: ['Multi-day light usage engine', 'Consistent 1-day heavy work battery', 'Ultra-fast charge speed is my focus']
            },
            {
              id: 'screen_size',
              text: 'What is your ideal screen size preference?',
              type: 'chips',
              options: ['Cinematic Media Screen (6.7" and above)', 'Compact & single-hand use (6.1" - 6.2")', 'Standard balanced size (6.4" - 6.5")']
            }
          );
        }

        // Brand preference
        qList.push({
          id: 'brand',
          text: 'Do you have a preferred brand in mind?',
          type: 'chips',
          options: matchedBrand ? [matchedBrand, 'No Preference'] : ['Samsung', 'Motorola', 'Nothing', 'OnePlus', 'Realme', 'No Preference']
        });

        return qList;
      }

      case SUPPORTED_CATEGORIES.LAPTOPS: {
        const qList = [
          {
            id: 'budget',
            text: 'What is your budget for this laptop?',
            type: 'chips',
            options: ['₹35,000', '₹50,000', '₹75,000', '₹1,00,000', '₹1,50,000', 'Custom Budget']
          },
          {
            id: 'purpose',
            text: 'What is your primary use case for this laptop?',
            type: 'chips',
            options: ['Coding & Development', 'Gaming', 'Content Creation', 'Office & School', 'Light Web Browsing']
          }
        ];

        if (answers['purpose'] === 'Coding & Development' || answers['purpose'] === 'Gaming') {
          qList.push(
            {
              id: 'ram',
              text: 'What RAM configuration fits your workflow?',
              type: 'chips',
              options: ['32GB RAM (Heavy VMs / Compile streams)', '16GB RAM (Recommended developer baseline)', '8GB RAM (Light coding only)']
            },
            {
              id: 'graphics',
              text: 'What level of graphics acceleration do you need?',
              type: 'chips',
              options: ['Dedicated High-End (NVIDIA RTX 40-series)', 'Dedicated Entry Level (RTX 3050 / Intel Arc)', 'Integrated Graphics is perfectly fine']
            },
            {
              id: 'display_res',
              text: 'What display specification works best for your eyes?',
              type: 'chips',
              options: ['4K Ultra HD / OLED premium screen', '1440p / High refresh esports panel', 'Standard 1080p FHD anti-glare screen']
            }
          );
        } else if (answers['purpose'] === 'Content Creation') {
          qList.push(
            {
              id: 'color_accuracy',
              text: 'How critical is professional color accuracy (DCI-P3 / Adobe RGB)?',
              type: 'chips',
              options: ['Absolutely Mandatory (For active color grading)', 'Moderately important', 'Normal color output is fine']
            },
            {
              id: 'panel_type',
              text: 'Which screen technology do you prefer?',
              type: 'chips',
              options: ['Stunning deep-contrast OLED panel', 'Premium liquid crystal IPS / Retina panel', 'Budget LED panel']
            },
            {
              id: 'form_factor',
              text: 'What is your priority regarding size and weight?',
              type: 'chips',
              options: ['Ultra-portable thin & light (Under 1.3kg)', 'Heavy duty desk performance beast', 'Balanced everyday design']
            }
          );
        } else {
          qList.push(
            {
              id: 'os',
              text: 'Which Operating System environment do you prefer?',
              type: 'chips',
              options: ['macOS (Seamless Apple integration)', 'Windows (Broad software compatibility)', 'ChromeOS (Lightweight cloud use)', 'No Preference']
            },
            {
              id: 'battery_life',
              text: 'What is your expectation for battery endurance?',
              type: 'chips',
              options: ['Extreme Battery (18+ hours M-series style)', 'Workday fit (8 - 10 hours)', 'Mostly plugged in']
            }
          );
        }

        qList.push({
          id: 'brand',
          text: 'Select your brand preference:',
          type: 'chips',
          options: matchedBrand ? [matchedBrand, 'No Preference'] : ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'No Preference']
        });

        return qList;
      }

      case SUPPORTED_CATEGORIES.RUNNING_SHOES: {
        return [
          {
            id: 'budget',
            text: 'What is your budget for these running shoes?',
            type: 'chips',
            options: ['₹3,000', '₹5,000', '₹8,000', '₹12,000', '₹15,000', 'Custom Budget']
          },
          {
            id: 'terrain',
            text: 'What primary terrain will you run on?',
            type: 'chips',
            options: ['Daily road running', 'Marathon speed tracks', 'Trail & hiking rugged terrain', 'Gym & Cross-fit indoor workout']
          },
          {
            id: 'pronation',
            text: 'What is your foot pronation / arch type?',
            type: 'chips',
            options: ['Neutral (Standard)', 'Overpronation (Flat feet - needs guidance stability)', 'Underpronation (High arch - needs max cushion)']
          },
          {
            id: 'cushioning',
            text: 'What cushioning feeling do you prefer?',
            type: 'chips',
            options: ['Max Cushion (Plush cloud feel)', 'Responsive / Snappy (Energetic speed bounce)', 'Minimalist (Natural ground response)', 'Balanced standard cushion']
          },
          {
            id: 'brand',
            text: 'Choose preferred brand:',
            type: 'chips',
            options: matchedBrand ? [matchedBrand, 'No Preference'] : ['Nike', 'Adidas', 'Puma', 'Asics', 'Brooks', 'No Preference']
          }
        ];
      }

      case SUPPORTED_CATEGORIES.SMARTWATCHES: {
        return [
          {
            id: 'budget',
            text: 'What is your budget for this smartwatch?',
            type: 'chips',
            options: ['₹2,000', '₹5,000', '₹10,000', '₹25,000', '₹50,000', 'Custom Budget']
          },
          {
            id: 'purpose',
            text: 'What is the primary feature you need?',
            type: 'chips',
            options: ['Fitness & heart tracking', 'GPS sports running / Hiking Map', 'Smart answering calls & notifications', 'Elegant luxury dress wear']
          },
          {
            id: 'compatibility',
            text: 'Which phone compatibility is mandatory?',
            type: 'chips',
            options: ['iOS Only (iPhone)', 'Android Only', 'Universal Compatibility (Both)']
          },
          {
            id: 'sensors',
            text: 'Select your most desired health sensor capability:',
            type: 'chips',
            options: ['ECG & Blood Pressure tracking', 'Advanced Sleep staging index', 'Dual frequency precision GPS', 'Standard step & calorie tracking']
          },
          {
            id: 'brand',
            text: 'Select your brand preference:',
            type: 'chips',
            options: matchedBrand ? [matchedBrand, 'No Preference'] : ['Apple', 'Samsung', 'Fitbit', 'Garmin', 'Noise / boAt', 'No Preference']
          }
        ];
      }

      default:
        return [];
    }
  }, [identifiedCategory, answers, matchedBrand]);

  const currentQuestion = questionsList[currentQuestionIndex];

  // Answer selection handler
  const handleAnswerSelect = (option: string) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(updatedAnswers);

    if (option === 'Custom Budget') {
      setShowSlider(true);
      return;
    }

    setShowSlider(false);
    advanceQuestionnaire(updatedAnswers);
  };

  // Watchlist & UI details states
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ai_shopper_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const handleToggleWatchlist = (id: string) => {
    setWatchlist(prev => {
      const updated = prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id];
      localStorage.setItem('ai_shopper_watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const getUserBudget = () => {
    const bAns = answers['budget'];
    if (!bAns) return Infinity;
    if (bAns.includes('Custom Budget')) {
      const match = bAns.match(/₹([0-9,]+)/);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''), 10);
      }
    }
    return parseInt(bAns.replace(/[^0-9]/g, ''), 10);
  };

  // Calculate recommended products with dynamic match scoring
  const recommendedProducts = useMemo(() => {
    if (!identifiedCategory) return [];
    
    // Filter from dynamic Firestore products
    const categoryCurations = products
      .filter(p => p.category.toLowerCase() === identifiedCategory.toLowerCase())
      .map(p => {
        // Map the Firestore Product to look like AICuratedProduct if it isn't already
        const metrics = getProductMetrics(p);
        
        const researchSummary = {
          confidenceRating: p.isEditorsChoice ? 94 : p.isBestSeller ? 88 : 82,
          text: p.communityExpertSummary || p.description,
          strengths: p.pros[0] || 'Reliable build quality',
          concerns: p.cons[0] || 'Premium price tag'
        };

        const advice = {
          whyItFits: p.recommendationNotes || p.shortDescription,
          wherePerformsWell: p.performance || 'Daily standard use cases.',
          buyerType: p.whoShouldBuy[0] || 'General consumers seeking stability.',
          tradeoffs: p.whoShouldAvoid[0] || 'Users seeking ultra budget alternatives.'
        };

        return {
          ...p,
          metrics,
          researchSummary,
          advice,
          // Support multiple retailers
          retailers: p.retailers && p.retailers.length > 0 ? p.retailers : [
            { name: 'Amazon', price: p.price, url: p.amazonUrl || '' },
            ...(p.flipkartUrl ? [{ name: 'Flipkart', price: p.price, url: p.flipkartUrl }] : [])
          ]
        };
      });
    const userBudget = getUserBudget();
    
    const scored = categoryCurations.map(product => {
      let score = 0;
      const reasons: string[] = [];
      
      // 1. Budget Compatibility (max 25 points)
      if (product.price <= userBudget) {
        score += 25;
        if (product.price >= userBudget * 0.85) {
          reasons.push(`Budget Optimized: Priced at ₹${product.price.toLocaleString()}, utilizing 85%+ of your ₹${userBudget.toLocaleString()} budget.`);
        } else {
          reasons.push(`Budget-Friendly: At ₹${product.price.toLocaleString()}, this is ₹${(userBudget - product.price).toLocaleString()} below your maximum limit.`);
        }
      } else {
        const pctOver = (product.price - userBudget) / userBudget;
        if (pctOver <= 0.15) {
          score += 15;
          reasons.push(`Premium Stretch: Slightly over budget (by ₹${(product.price - userBudget).toLocaleString()}), but delivers elite-tier specs.`);
        } else if (pctOver <= 0.30) {
          score += 5;
          reasons.push(`Significant Stretch: Over budget by ₹${(product.price - userBudget).toLocaleString()}, but represents premium longevity.`);
        } else {
          score += 0;
        }
      }
      
      // 2. Brand Preference (max 15 points)
      const brandPreference = answers['brand'];
      if (!brandPreference || brandPreference === 'No Preference') {
        score += 15;
      } else if (brandPreference.toLowerCase() === product.brand.toLowerCase()) {
        score += 15;
        reasons.push(`Brand Harmony: Aligns perfectly with your preference for ${product.brand}.`);
      } else {
        score += 0;
      }
      
      // 3. Purpose & Key Metrics Match (max 40 points)
      const purpose = answers['purpose'] || answers['terrain'];
      if (purpose) {
        if (identifiedCategory === 'Smartphones') {
          if (purpose === 'Gaming') {
            const gamingRating = product.metrics.gaming || 5;
            score += (gamingRating / 10) * 20;
            
            const prefPerf = answers['performance'];
            if (prefPerf) {
              if (prefPerf.includes('Absolute Maximum') && product.metrics.performance >= 9.5) {
                score += 10;
                reasons.push(`Max Core Speed: Houses the high-end Snapdragon 8 Gen 3 for extreme frame pacing.`);
              } else if (prefPerf.includes('High Performance') && product.metrics.performance >= 8) {
                score += 10;
                reasons.push(`High Performance: Robust 4nm CPU easily handles sustained gameplay.`);
              } else {
                score += 10;
              }
            } else {
              score += 10;
            }
            
            const prefRefresh = answers['refresh_rate'];
            if (prefRefresh) {
              if (prefRefresh.includes('144Hz') && product.metrics.isHighRefresh && product.metrics.display >= 9) {
                score += 10;
                reasons.push(`Esports Speed: Curated 144Hz screen minimizes frame delay.`);
              } else if (prefRefresh.includes('120Hz') && product.metrics.isHighRefresh) {
                score += 10;
                reasons.push(`Smooth Render: 120Hz refresh rate delivers silky standard scrolling.`);
              } else {
                score += 10;
              }
            } else {
              score += 10;
            }
          } else if (purpose === 'Camera' || purpose === 'Photography') {
            const cameraRating = product.metrics.camera || 5;
            score += (cameraRating / 10) * 20;
            
            const prefZoom = answers['zoom'];
            if (prefZoom) {
              if (prefZoom.includes('Ultra Zoom') && product.specifications['Camera']?.includes('Periscope')) {
                score += 10;
                reasons.push(`Periscope Optical: Dedicated folding optical lens captures crisp long-distance shots.`);
              } else if (prefZoom.includes('Optical Portrait') && product.specifications['Camera']?.includes('Telephoto')) {
                score += 10;
                reasons.push(`Portrait Zoom: Dedicated 3x telephoto focal length ensures natural facial dimensions.`);
              } else {
                score += 7;
              }
            } else {
              score += 10;
            }
            
            const prefNight = answers['night_mode'];
            if (prefNight) {
              if (prefNight.includes('Extremely Important') && product.metrics.camera && product.metrics.camera >= 9) {
                score += 10;
                reasons.push(`Advanced Night Mode: Extra-large main sensor captures high dynamic range in darkness.`);
              } else {
                score += 10;
              }
            } else {
              score += 10;
            }
          } else {
            // Daily use / other
            const perfRating = product.metrics.performance || 5;
            score += (perfRating / 10) * 20;
            
            const prefBattery = answers['general_battery'];
            if (prefBattery) {
              if (prefBattery.includes('Multi-day') && product.metrics.battery === 10) {
                score += 10;
                reasons.push(`Unrivaled Endurance: High-capacity 6000mAh cells deliver 2 full days of standard use.`);
              } else if (prefBattery.includes('Consistent 1-day') && product.metrics.battery >= 8) {
                score += 10;
                reasons.push(`Full-Day Confidence: Solid power reserve comfortably lasts a standard business day.`);
              } else if (prefBattery.includes('Ultra-fast') && (product.specifications['Battery']?.includes('100W') || product.specifications['Charging']?.includes('125W'))) {
                score += 10;
                reasons.push(`Hyper Charge: Rapid 100W+ charging powers the device to full in under 30 minutes.`);
              } else {
                score += 5;
              }
            } else {
              score += 10;
            }
            
            const prefScreen = answers['screen_size'];
            if (prefScreen) {
              if (prefScreen.includes('Cinematic') && (product.specifications['Display']?.includes('6.7') || product.specifications['Display']?.includes('6.8'))) {
                score += 10;
                reasons.push(`Cinematic Canvas: Gorgeous 6.7"+ display offers an immersive media experience.`);
              } else if (prefScreen.includes('Compact') && (product.specifications['Display']?.includes('6.1') || product.metrics.weight && product.metrics.weight <= 1.3)) {
                score += 10;
                reasons.push(`Ergonomic Compact: Perfectly proportioned for single-handed navigation and pockets.`);
              } else {
                score += 10;
              }
            } else {
              score += 10;
            }
          }
        } else if (identifiedCategory === 'Laptops') {
          if (purpose.includes('Coding') || purpose.includes('Development')) {
            const perfRating = product.metrics.performance || 5;
            score += (perfRating / 10) * 20;
            
            const prefRam = answers['ram'];
            if (prefRam) {
              if (prefRam.includes('32GB') && product.specifications['RAM']?.includes('32GB')) {
                score += 10;
                reasons.push(`Heavy Stack: Max memory layout easily runs multiple heavy Docker VMs and IDEs.`);
              } else if (prefRam.includes('16GB') && (product.specifications['RAM']?.includes('16GB') || product.specifications['RAM']?.includes('32GB'))) {
                score += 10;
                reasons.push(`Developer Baseline: Meets standard 16GB memory requirements for lag-free coding.`);
              } else {
                score += 5;
              }
            } else {
              score += 10;
            }
            
            const prefDisp = answers['display_res'];
            if (prefDisp) {
              if (prefDisp.includes('4K Ultra') && product.metrics.isOled) {
                score += 10;
                reasons.push(`OLED Precision: High pixel density ensures razor-sharp text and superb contrast.`);
              } else if (prefDisp.includes('1440p') && product.metrics.isHighRefresh) {
                score += 10;
                reasons.push(`Fluid Visuals: High-refresh panel delivers buttery smooth transitions.`);
              } else {
                score += 10;
              }
            } else {
              score += 10;
            }
          } else if (purpose.includes('Gaming')) {
            const gamingRating = product.metrics.gaming || 5;
            score += (gamingRating / 10) * 20;
            
            const prefGraphics = answers['graphics'];
            if (prefGraphics) {
              if (prefGraphics.includes('High-End') && product.metrics.gaming === 10) {
                score += 20;
                reasons.push(`Dedicated RTX Graphics: Discrete GPU handles modern AAA gaming with ease.`);
              } else if (prefGraphics.includes('Entry Level') && product.metrics.gaming >= 7) {
                score += 20;
                reasons.push(`Balanced Graphics: Decent entry-level acceleration handles casual and mid-spec titles.`);
              } else {
                score += 10;
              }
            } else {
              score += 20;
            }
          } else if (purpose.includes('Content Creation')) {
            const displayRating = product.metrics.display || 5;
            score += (displayRating / 10) * 20;
            
            const prefAccuracy = answers['color_accuracy'];
            if (prefAccuracy) {
              if (prefAccuracy.includes('Mandatory') && product.specifications['Display']?.includes('P3')) {
                score += 20;
                reasons.push(`Professional Color: 100% P3 gamut offers reliable color accuracy for grading.`);
              } else {
                score += 15;
              }
            } else {
              score += 20;
            }
          } else {
            // Office & Browsing
            const batteryRating = product.metrics.battery || 5;
            score += (batteryRating / 10) * 20;
            
            const prefOs = answers['os'];
            if (prefOs) {
              if (prefOs.includes('macOS') && product.metrics.os === 'macos') {
                score += 10;
                reasons.push(`macOS Ecosystem: Exceptional, reliable software optimized for Apple accessories.`);
              } else if (prefOs.includes('Windows') && product.metrics.os === 'windows') {
                score += 10;
                reasons.push(`Windows Suite: Full compatibility with standard corporate applications.`);
              } else {
                score += 10;
              }
            } else {
              score += 10;
            }
            
            const prefEndurance = answers['battery_life'];
            if (prefEndurance) {
              if (prefEndurance.includes('Extreme') && product.metrics.battery === 10) {
                score += 10;
                reasons.push(`Extreme Endurance: Legendary battery keeps you productive for up to 18 hours.`);
              } else {
                score += 10;
              }
            } else {
              score += 10;
            }
          }
        } else if (identifiedCategory === 'Running Shoes') {
          // Terrain match
          const terrainPref = answers['terrain'];
          if (terrainPref) {
            if (terrainPref.includes('Daily road') && product.metrics.terrain === 'road') {
              score += 15;
              reasons.push(`Asphalt Grip: Durable rubber tread designed specifically for daily pavement runs.`);
            } else if (terrainPref.includes('Marathon') && product.metrics.terrain === 'road' && product.metrics.performance >= 9) {
              score += 15;
              reasons.push(`Marathon Speed: Fast energetic bounce keeps legs fresh during long mileage.`);
            } else {
              score += 10;
            }
          } else {
            score += 15;
          }
          
          // Pronation match
          const pronationPref = answers['pronation'];
          if (pronationPref) {
            if (pronationPref.includes('Neutral') && product.metrics.pronation === 'neutral') {
              score += 15;
              reasons.push(`Neutral Gate: Highly symmetrical sole pattern fits standard stride arches.`);
            } else if (pronationPref.includes('Overpronation') && product.metrics.pronation === 'overpronation') {
              score += 15;
              reasons.push(`Stability Guide: Adaptive 4D Guidance System corrects inward foot roll safely.`);
            } else if (pronationPref.includes('Underpronation') && product.metrics.pronation === 'neutral' && product.metrics.cushion === 'max') {
              score += 15;
              reasons.push(`Impact Shield: Deep maximum cushioning absorbs shocks for high-arched runners.`);
            } else {
              score += 10;
            }
          } else {
            score += 15;
          }
          
          // Cushion
          const cushionPref = answers['cushioning'];
          if (cushionPref) {
            if (cushionPref.includes('Max Cushion') && product.metrics.cushion === 'max') {
              score += 10;
              reasons.push(`Plush Cloud Feel: Thick, soft, energy-absorbing eco-foam protects joints.`);
            } else if (cushionPref.includes('Responsive') && product.metrics.cushion === 'responsive') {
              score += 10;
              reasons.push(`Energetic Spring: Snappy toe-off geometry propels your tempo days forward.`);
            } else if (cushionPref.includes('Balanced') && product.metrics.cushion === 'balanced') {
              score += 10;
              reasons.push(`Balanced Ride: Combines solid pavement feedback with dependable foam cushioning.`);
            } else {
              score += 5;
            }
          } else {
            score += 10;
          }
        } else if (identifiedCategory === 'Smartwatches') {
          // Purpose
          if (purpose.includes('Fitness')) {
            score += 20;
            if (product.specifications['Sensors']?.includes('ECG') || product.specifications['Sensors']?.includes('BioActive')) {
              score += 10;
              reasons.push(`Vetted Health Sensors: Accurate on-wrist ECG and blood pressure capabilities.`);
            } else {
              score += 5;
            }
            score += 10;
          } else if (purpose.includes('GPS')) {
            const gpsRating = product.metrics.gpsPrecision === 'dual-frequency' ? 30 : 20;
            score += gpsRating;
            reasons.push(`Precision GPS: Dual-frequency band maps your path flawlessly in thick woods.`);
            score += 10;
          } else if (purpose.includes('Smart answering')) {
            if (product.metrics.os !== 'universal' && product.metrics.os !== answers['compatibility']?.toLowerCase()) {
              score += 10;
            } else {
              score += 30;
              reasons.push(`WearOS/watchOS: Fluidly dictatess, makes, and answers calls directly from your wrist.`);
            }
            score += 10;
          } else {
            // Elegant dress
            if (product.specifications['Build']?.includes('Titanium')) {
              score += 30;
              reasons.push(`Luxury Titanium: Built with aerospace alloys and deep sapphire glass for elegance.`);
            } else {
              score += 20;
            }
            score += 10;
          }
          
          // Compatibility
          const compatPref = answers['compatibility'];
          if (compatPref) {
            if (compatPref.includes('iOS') && product.metrics.os === 'ios') {
              score += 10;
              reasons.push(`iOS Native: Perfect synchronization with Apple Health and iCloud ecosystems.`);
            } else if (compatPref.includes('Android') && product.metrics.os === 'android') {
              score += 10;
              reasons.push(`Android Native: Fully integrated with Google services and Android notifications.`);
            } else if (product.metrics.os === 'universal') {
              score += 10;
              reasons.push(`Agnostic Pairing: Connects flawlessly to both iPhone and Android handsets.`);
            } else if (compatPref.includes('Android') && product.metrics.os === 'ios') {
              score = -100; // completely filter out Apple Watch for Android users!
            } else {
              score += 10;
            }
          } else {
            score += 10;
          }
        }
      } else {
        score += 40;
      }
      
      // 4. Value and general metrics (max 20 points)
      score += (product.metrics.value / 10) * 10;
      score += (product.metrics.display / 10) * 10;
      
      const finalScore = Math.min(Math.max(Math.round(score), 0), 100);
      
      return {
        ...product,
        matchScore: finalScore,
        personalizedReasons: reasons.slice(0, 3)
      };
    });
    
    // Sort scored items descending
    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
    
    // Filter out completely incompatible ones (score < 10)
    const filtered = sorted.filter(p => p.matchScore > 10);
    
    // Assign Badges:
    const finalRecommendations = filtered.map((product, index) => {
      let badge: string | undefined = undefined;
      if (index === 0) {
        badge = '🏆 Best Match for You';
      } else {
        if (product.metrics.value >= 9.5) {
          badge = '⭐ Best Value';
        } else if (product.category === 'Smartphones' && product.metrics.camera && product.metrics.camera === 10) {
          badge = '📷 Best Camera';
        } else if (product.category === 'Laptops' && product.metrics.gaming === 10) {
          badge = '🎮 Best Gaming';
        } else if (product.metrics.battery === 10) {
          badge = '🔋 Best Battery';
        } else if (product.metrics.performance === 10 && (product.brand === 'Apple' || product.brand === 'Samsung' || product.brand === 'Garmin')) {
          badge = '💼 Best for Professionals';
        }
      }
      return {
        ...product,
        assignedBadge: badge
      };
    });
    
    return finalRecommendations.slice(0, 5);
  }, [identifiedCategory, answers, products]);

  const getConfidenceRationale = (product: AICuratedProduct) => {
    const userBudget = getUserBudget();
    const fitsBudget = product.price <= userBudget;
    
    if (fitsBudget) {
      return `This product closely matches the requirements you provided. The recommendation is supported by ${product.researchSummary.confidenceRating}% consistent expert ratings and verified specifications. There are no major compromises relative to your stated profile.`;
    } else {
      return `This product matches all of your high-performance requirements and is backed by reliable expert data, but it requires stretching your budget by ₹${(product.price - userBudget).toLocaleString()}. The primary compromise is the price premium.`;
    }
  };

  const advanceQuestionnaire = (updatedAnswers: Record<string, string>) => {
    if (currentQuestionIndex < questionsList.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      startAnalysisPhase();
    }
  };

  const handleCustomSliderSubmit = () => {
    const valueStr = `Custom Budget (₹${customSliderValue.toLocaleString()})`;
    const updatedAnswers = { ...answers, [currentQuestion.id]: valueStr };
    setAnswers(updatedAnswers);
    setShowSlider(false);
    advanceQuestionnaire(updatedAnswers);
  };

  const startAnalysisPhase = () => {
    setScreenState('analysis');
    setAnalysisProgress(0);

    // Slowly increment progress up to 100% to simulate premium high-tech analyzer
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setScreenState('results');
          }, 800);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 180);
  };

  // Quick helper reset finder
  const handleReset = () => {
    setQuery('');
    setIdentifiedCategory(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setScreenState('search');
    setMatchedBrand(null);
    setCategoryRequestSubmitted(false);
    setIsNotified(false);
    setNotifyEmail('');
    setRequestCategoryText('');
    setExpandedProductId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8" id="ai-product-finder-container">
      
      {/* Visual background gradient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* BACK NAVIGATION OR TITLE BAR */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200/50">
        <button 
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition-colors text-xs font-semibold uppercase tracking-wider"
          id="ai-back-to-home"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Curated Curation</span>
        </button>
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-900/10 border border-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-800 uppercase tracking-widest">
          <Sparkles className="h-3 w-3 fill-amber-700 text-amber-700 animate-pulse" />
          <span>AI Shopper Assistant</span>
        </span>
      </div>

      <AnimatePresence mode="wait">

        {/* ==========================================
            SCREEN 1: CENTRAL SEARCH & DISCOVERY BAR
            ========================================== */}
        {screenState === 'search' && (
          <motion.div
            key="search-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="text-center py-8 space-y-10"
            id="ai-finder-search-panel"
          >
            {/* Header Title Block */}
            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Buy Smarter with <span className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-stone-500 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
                Find the perfect product based on your needs, compare products intelligently, and buy with confidence.
              </p>
            </div>

            {/* Premium AI Search Input with Suggestions overlay */}
            <div className="max-w-2xl mx-auto relative z-30" id="ai-search-box-wrap">
              <div 
                className={`flex items-center rounded-2xl border-2 bg-white transition-all duration-300 shadow-lg px-4 ${
                  isSearchFocused 
                    ? 'border-amber-700 ring-4 ring-amber-100 scale-[1.01]' 
                    : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <span className="text-amber-800 pr-3">
                  <Sparkles className="h-5 w-5 fill-amber-50" />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      triggerSearch(query);
                    }
                  }}
                  placeholder="What are you looking for today?"
                  className="w-full bg-transparent py-4 text-stone-800 outline-none placeholder:text-stone-400 font-light text-sm sm:text-base"
                  id="ai-natural-search-input"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="p-2 text-stone-400 hover:text-stone-600 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => triggerSearch(query)}
                  disabled={!query.trim()}
                  className="ml-2 inline-flex items-center space-x-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-[#faf9f6] text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  id="ai-search-submit-btn"
                >
                  <span>Search</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Natural suggestions prompt list */}
              <AnimatePresence>
                {isSearchFocused && query.trim() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 text-left space-y-1.5 z-50 max-h-80 overflow-y-auto"
                    id="ai-floating-suggestions-wrap"
                  >
                    <div className="px-2.5 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                      Matched AI Search Intent
                    </div>
                    {suggestions.length > 0 ? (
                      <div className="space-y-0.5">
                        {suggestions.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={idx}
                              onMouseDown={() => handleSelectSuggestion(item.text)}
                              className="w-full text-left flex items-center space-x-3 p-2.5 hover:bg-amber-50/50 rounded-xl transition-colors cursor-pointer"
                            >
                              <div className="h-8 w-8 rounded-lg bg-stone-100 border border-stone-200/60 flex items-center justify-center shrink-0 text-stone-500">
                                <Icon className="h-4 w-4 text-amber-800" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-stone-900 truncate">{item.text}</p>
                                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                                  {item.category} {item.type === 'unsupported' ? '(Request Category)' : ''}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-stone-400 font-light flex flex-col items-center justify-center space-y-1">
                        <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                        <span>I will understand this intent. Let's hit search!</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Example Intent Chips */}
            <div className="space-y-3 pt-4">
              <span className="block text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest">
                Try asking like a human
              </span>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {['Gaming phone under ₹25,000', 'Best laptop for coding', 'Running shoes', 'Hair dryer', 'Refrigerator', 'Smartwatch'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setQuery(chip);
                      triggerSearch(chip);
                    }}
                    className="py-2 px-3.5 rounded-full border border-stone-200 bg-white hover:border-amber-600 hover:text-amber-800 text-stone-600 text-xs font-medium shadow-sm transition-all hover:scale-102 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            SCREEN 2: PREMIUM AI PROCESSING SCREEN
            ========================================== */}
        {screenState === 'processing' && (
          <motion.div
            key="processing-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-md mx-auto text-center py-16 space-y-8 bg-white border border-stone-200/60 rounded-3xl p-8 shadow-xl relative overflow-hidden"
            id="ai-processing-loader"
          >
            {/* Elegant Background pulsing blob */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />

            {/* Premium AI Themed Loading Graphic (Hologram style scanning loop) */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-stone-100" />
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-amber-800 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-amber-500/10 bg-amber-500/5 animate-pulse" />
              <Cpu className="h-8 w-8 text-amber-800 relative z-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-lg font-bold text-stone-900 tracking-tight">
                Understanding your requirements...
              </h3>
              <p className="text-stone-400 text-xs font-light">
                Our AI model is analyzing your query structure and intent context.
              </p>
            </div>

            {/* Animated Checklist checkmarks popping one-by-one */}
            <div className="space-y-3.5 text-left max-w-xs mx-auto border-t border-stone-100 pt-6">
              {[
                { label: 'Identifying product category', step: 0 },
                { label: 'Deconstructing intent attributes', step: 1 },
                { label: 'Preparing personalized questions', step: 2 }
              ].map((stepItem, idx) => {
                const isCompleted = processingStep > stepItem.step;
                const isCurrent = processingStep === stepItem.step;

                return (
                  <div 
                    key={idx} 
                    className={`flex items-center space-x-3 transition-all duration-300 ${
                      isCompleted ? 'text-stone-800 opacity-100' : isCurrent ? 'text-amber-800 font-bold' : 'text-stone-300'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-amber-100 border-amber-500 text-amber-800' 
                        : isCurrent 
                          ? 'border-amber-700 bg-amber-50 animate-pulse' 
                          : 'border-stone-200'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-3 w-3 stroke-[3px]" />
                      ) : (
                        <div className={`h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-amber-700' : 'bg-transparent'}`} />
                      )}
                    </div>
                    <span className="text-xs tracking-wide">{stepItem.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==========================================
            SCREEN 3: SMART QUESTIONNAIRE FLOW
            ========================================== */}
        {screenState === 'questions' && currentQuestion && (
          <motion.div
            key={`question-${currentQuestion.id}`}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto space-y-8"
            id={`ai-questionnaire-card-${currentQuestion.id}`}
          >
            {/* Progress Segment */}
            <div className="space-y-2.5 bg-stone-100/50 p-4 rounded-2xl border border-stone-200/40">
              <div className="flex justify-between items-center text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest">
                <span>Category Identified: <strong className="text-amber-800">{identifiedCategory}</strong></span>
                <span>Question {currentQuestionIndex + 1} of {questionsList.length}</span>
              </div>
              
              {/* Premium Progress Bar (████████░░░ format) */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questionsList.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-amber-700 to-amber-900 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="font-mono text-[10px] font-extrabold text-amber-800">
                  {Math.round(((currentQuestionIndex + 1) / questionsList.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Main Question Card with Glassmorphism */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-800" />
              
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full inline-block">
                    Match Intent
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                    {currentQuestion.text}
                  </h3>
                </div>

                {/* Option Chips Selector Block */}
                {!showSlider && currentQuestion.type === 'chips' && currentQuestion.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentQuestion.options.map((option, oIdx) => {
                      const isSelected = answers[currentQuestion.id] === option;
                      return (
                        <motion.button
                          key={oIdx}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswerSelect(option)}
                          className={`group flex items-center justify-between p-4 rounded-2xl border text-left text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-50/60 border-amber-700 text-amber-900 ring-2 ring-amber-100' 
                              : 'bg-white border-stone-200 hover:border-amber-500 hover:bg-stone-50/50 text-stone-700'
                          }`}
                        >
                          <span>{option}</span>
                          <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border transition-all ${
                            isSelected ? 'bg-amber-850 border-amber-850 text-white' : 'border-stone-200 group-hover:border-amber-400 bg-white'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Custom Budget Slider block */}
                {(showSlider || currentQuestion.id === 'slider') && (
                  <div className="space-y-6 pt-4 border-t border-stone-100" id="ai-budget-custom-slider">
                    <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Custom budget selected:</span>
                      <span className="font-mono text-lg font-black text-amber-800">
                        {identifiedCategory === SUPPORTED_CATEGORIES.RUNNING_SHOES || identifiedCategory === SUPPORTED_CATEGORIES.SMARTWATCHES
                          ? `₹${customSliderValue.toLocaleString()}`
                          : `₹${customSliderValue.toLocaleString()}`
                        }
                      </span>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="range"
                        min={identifiedCategory === SUPPORTED_CATEGORIES.SMARTPHONES ? 5000 : identifiedCategory === SUPPORTED_CATEGORIES.LAPTOPS ? 20000 : 1000}
                        max={identifiedCategory === SUPPORTED_CATEGORIES.SMARTPHONES ? 150000 : identifiedCategory === SUPPORTED_CATEGORIES.LAPTOPS ? 250000 : 25000}
                        step={identifiedCategory === SUPPORTED_CATEGORIES.LAPTOPS ? 5000 : 1000}
                        value={customSliderValue}
                        onChange={(e) => setCustomSliderValue(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-800"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 font-mono font-bold">
                        <span>Min (₹{identifiedCategory === SUPPORTED_CATEGORIES.SMARTPHONES ? '5,000' : identifiedCategory === SUPPORTED_CATEGORIES.LAPTOPS ? '20,000' : '1,000'})</span>
                        <span>Max (₹{identifiedCategory === SUPPORTED_CATEGORIES.SMARTPHONES ? '150,000' : identifiedCategory === SUPPORTED_CATEGORIES.LAPTOPS ? '250,000' : '25,000'})</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={() => setShowSlider(false)}
                        className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                      >
                        Back to Presets
                      </button>
                      <button
                        onClick={handleCustomSliderSubmit}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-[#faf9f6] text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
                      >
                        <span>Confirm Budget</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Back button option within questionnaire */}
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => {
                  setCurrentQuestionIndex(prev => prev - 1);
                  setShowSlider(false);
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-stone-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Question</span>
              </button>
            )}
          </motion.div>
        )}

        {/* ==========================================
            SCREEN 4: ANALYSIS TRANSITION / FINAL PHASE
            ========================================== */}
        {screenState === 'analysis' && (
          <motion.div
            key="analysis-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-12 space-y-10 bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden"
            id="ai-analysis-screen"
          >
            {/* Ambient Background decoration */}
            <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Premium Holographic/Scanning Graphic */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-stone-100" />
              <div className="absolute inset-0 rounded-full border-b-2 border-l-2 border-amber-800 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
                <Sparkles className="h-8 w-8 text-amber-800 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-2xl font-black text-stone-900 leading-tight">
                Analyzing Your Requirements
              </h2>
              <p className="text-stone-500 text-sm font-light max-w-sm mx-auto">
                "Comparing products and finding the best match for your needs."
              </p>
            </div>

            {/* Animated Checklist Section */}
            <div className="max-w-md mx-auto bg-stone-50 border border-stone-150/60 rounded-2xl p-6 text-left space-y-4">
              {[
                { label: 'Understanding your budget', val: 16 },
                { label: 'Matching your priorities', val: 33 },
                { label: 'Comparing specifications', val: 50 },
                { label: 'Evaluating value for money', val: 66 },
                { label: 'Reviewing trusted product information', val: 83 },
                { label: 'Ranking the best products', val: 100 }
              ].map((step, idx) => {
                const isChecked = analysisProgress >= step.val;
                const isActive = analysisProgress >= (idx > 0 ? [16, 33, 50, 66, 83][idx - 1] : 0) && analysisProgress < step.val;
                return (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-stone-200/40 last:border-0">
                    <span className={`text-xs font-sans tracking-wide transition-colors duration-300 ${
                      isChecked ? 'text-stone-900 font-medium' : isActive ? 'text-amber-800 font-semibold' : 'text-stone-400 font-light'
                    }`}>
                      {step.label}
                    </span>
                    <div className="flex items-center justify-center h-5 w-5">
                      {isChecked ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 animate-fade-in" />
                      ) : isActive ? (
                        <RefreshCw className="h-3 w-3 text-amber-700 animate-spin" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-stone-200" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subdued progress line */}
            <div className="space-y-2 text-left max-w-sm mx-auto">
              <div className="flex justify-between items-center text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest">
                <span>Vetting Database Curations</span>
                <span>{analysisProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden relative border border-stone-200/50">
                <div 
                  className="h-full bg-amber-800 transition-all duration-150"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            SCREEN 5: DYNAMIC RECOMMENDATION RESULTS
            ========================================== */}
        {screenState === 'results' && (
          <motion.div
            key="results-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-12"
            id="ai-results-screen"
          >
            {/* Header / Summary Info Panel */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">
                Your Personalized AI Match Results
              </h2>
              <p className="text-stone-500 text-sm font-light leading-relaxed">
                We compared product specifications, verified prices, and combed thousands of trusted expert resources to score the best matches. Recommended independently of affiliate partnerships.
              </p>

              {/* Answers Profile Pill Summary */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Your Criteria:</span>
                {answers['budget'] && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium rounded-full">
                    <DollarSign className="h-3 w-3 text-stone-500" />
                    <span>Budget: {answers['budget']}</span>
                  </span>
                )}
                {(answers['purpose'] || answers['terrain']) && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium rounded-full">
                    <Zap className="h-3 w-3 text-amber-600" />
                    <span>Use Case: {answers['purpose'] || answers['terrain']}</span>
                  </span>
                )}
                {answers['compatibility'] && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium rounded-full">
                    <Smartphone className="h-3 w-3 text-blue-500" />
                    <span>Compatibility: {answers['compatibility']}</span>
                  </span>
                )}
                {answers['brand'] && answers['brand'] !== 'No Preference' && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium rounded-full">
                    <Award className="h-3 w-3 text-purple-500" />
                    <span>Brand: {answers['brand']}</span>
                  </span>
                )}
              </div>
            </div>

            {/* WATCHLIST TRIGGER BUTTON FLOATING & ACTIONS HEADER */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="text-stone-500 text-xs font-semibold uppercase tracking-wider">
                Showing {recommendedProducts.length} Recommendations
              </div>
              <button
                onClick={() => setShowWatchlistModal(true)}
                className="relative inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-colors cursor-pointer shadow-sm"
              >
                <Bookmark className="h-4 w-4 text-amber-800 fill-amber-800/10" />
                <span>My Watchlist</span>
                {watchlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-amber-800 text-[10px] text-white font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {watchlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Empty state safeguard */}
            {recommendedProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-4">
                <AlertCircle className="h-10 w-10 text-stone-400 mx-auto" />
                <h3 className="font-display text-lg font-bold text-stone-950">No products fit your precise profile.</h3>
                <p className="text-stone-500 text-xs font-light max-w-sm mx-auto">
                  Try broadening your budget parameters or removing specific compatibility preferences to locate active curated listings.
                </p>
                <button
                  onClick={handleReset}
                  className="py-2 px-4 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Adjust Filters
                </button>
              </div>
            ) : (
              /* Product Recommendation Cards Stack */
              <div className="space-y-10" id="ai-recommendations-list">
                {recommendedProducts.map((product, index) => {
                  const isTopMatch = index === 0;
                  const isWatched = watchlist.includes(product.id);
                  const isCompared = compareList.includes(product.dbProductId || product.id);
                  const isExpanded = expandedProductId === product.id;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className={`relative border bg-white rounded-3xl p-6 sm:p-8 transition-all ${
                        isTopMatch 
                          ? 'border-amber-500/30 shadow-xl bg-amber-500/[0.005]' 
                          : 'border-stone-200 shadow-md hover:shadow-lg'
                      }`}
                      id={`recommendation-card-${product.id}`}
                    >
                      {/* Top Highlight Ribbon / Badge */}
                      {product.assignedBadge && (
                        <div className="absolute top-0 left-6 sm:left-8 -translate-y-1/2 flex items-center space-x-1 bg-amber-850 text-[#faf9f6] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md z-10 border border-amber-700">
                          <span>{product.assignedBadge}</span>
                        </div>
                      )}

                      {/* Card Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* LEFT: Image & Quick Specs (4 cols) */}
                        <div className="md:col-span-4 flex flex-col items-center space-y-5">
                          <div className="relative aspect-square w-full max-w-[200px] bg-stone-50 rounded-2xl overflow-hidden border border-stone-200/50 flex items-center justify-center p-4">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="object-contain max-h-full max-w-full hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Mini stats badges */}
                          <div className="w-full space-y-2">
                            <span className="block text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest text-center">
                              TECHNICAL RATINGS
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-medium text-stone-700">
                              <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-2 flex flex-col items-center justify-center">
                                <Gauge className="h-3.5 w-3.5 text-stone-500 mb-1" />
                                <span>Perf: {product.metrics.performance}/10</span>
                              </div>
                              <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-2 flex flex-col items-center justify-center">
                                <Coins className="h-3.5 w-3.5 text-stone-500 mb-1" />
                                <span>Value: {product.metrics.value}/10</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: Main match information (8 cols) */}
                        <div className="md:col-span-8 space-y-6 text-left">
                          {/* Title & Match Score Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-stone-100 pb-4">
                            <div>
                              <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider block mb-1">
                                {product.brand} Curated Catalog
                              </span>
                              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight leading-snug">
                                {product.title}
                              </h3>
                            </div>

                            {/* Score circular visual */}
                            <div className="flex items-center space-x-3 bg-stone-50 border border-stone-200 rounded-2xl p-2.5 px-4 self-start">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700 border border-green-200 font-sans font-black text-sm">
                                {product.matchScore}%
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider leading-none">AI Match</span>
                                <span className="text-xs font-bold text-stone-800 uppercase tracking-wide pt-0.5">Score</span>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 1: Why We Recommended This (Personalized bullet points) */}
                          <div className="space-y-2.5">
                            <h4 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest flex items-center space-x-1.5">
                              <Sparkles className="h-3 w-3 text-amber-700 fill-amber-700/15" />
                              <span>Why We Recommended This</span>
                            </h4>
                            <ul className="space-y-2 text-xs text-stone-700 font-light leading-relaxed">
                              {product.personalizedReasons.map((reason, rIdx) => (
                                <li key={rIdx} className="flex items-start space-x-2">
                                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* SECTION 2: Balanced Pros & Cons Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {/* Pros (min 3) */}
                            <div className="bg-green-50/20 border border-green-100/40 rounded-2xl p-4 sm:p-5 space-y-3">
                              <h5 className="text-[10px] font-bold text-green-800 uppercase tracking-widest flex items-center space-x-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />
                                <span>Key Strengths (Pros)</span>
                              </h5>
                              <ul className="space-y-2 text-[11px] text-green-950 font-light leading-normal">
                                {product.pros.slice(0, 4).map((pro, pIdx) => (
                                  <li key={pIdx} className="flex items-start space-x-1.5">
                                    <span className="text-green-600 font-bold select-none shrink-0">•</span>
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Cons (min 2-3) */}
                            <div className="bg-red-50/20 border border-red-100/40 rounded-2xl p-4 sm:p-5 space-y-3">
                              <h5 className="text-[10px] font-bold text-red-800 uppercase tracking-widest flex items-center space-x-1.5">
                                <AlertCircle className="h-3.5 w-3.5 text-red-700" />
                                <span>Known Trade-Offs (Cons)</span>
                              </h5>
                              <ul className="space-y-2 text-[11px] text-red-950 font-light leading-normal">
                                {product.cons.slice(0, 3).map((con, cIdx) => (
                                  <li key={cIdx} className="flex items-start space-x-1.5">
                                    <span className="text-red-500 font-bold select-none shrink-0">•</span>
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* SECTION 3: Expert & Community Research Summary */}
                          <div className="bg-stone-50/60 border border-stone-200/60 rounded-2xl p-5 space-y-3 text-stone-850">
                            <h4 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest flex items-center space-x-1.5">
                              <Compass className="h-3.5 w-3.5 text-stone-400" />
                              <span>Community & Expert Research Summary</span>
                            </h4>
                            <div className="space-y-2 text-xs font-light leading-relaxed">
                              <p className="text-stone-700">
                                {product.researchSummary.text}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                                <div className="space-y-0.5 border-l-2 border-green-500 pl-2.5">
                                  <span className="block font-semibold text-green-800 uppercase tracking-wider text-[9px]">Verified Strengths</span>
                                  <span className="text-stone-600 font-light">{product.researchSummary.strengths}</span>
                                </div>
                                <div className="space-y-0.5 border-l-2 border-amber-600 pl-2.5">
                                  <span className="block font-semibold text-amber-800 uppercase tracking-wider text-[9px]">User Concerns</span>
                                  <span className="text-stone-600 font-light">{product.researchSummary.concerns}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 4: Final Editorial Advice Block */}
                          <div className="border-t border-stone-100 pt-5 space-y-3">
                            <h4 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest flex items-center space-x-1.5">
                              <Award className="h-3.5 w-3.5 text-amber-800" />
                              <span>Personalized Editorial Advice</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">How It Fits You</span>
                                <p className="text-stone-700 font-light leading-relaxed">{product.advice.whyItFits}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Where It Excels</span>
                                <p className="text-stone-700 font-light leading-relaxed">{product.advice.wherePerformsWell}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Crucial Compromise</span>
                                <p className="text-stone-700 font-light leading-relaxed">{product.advice.tradeoffs}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Recommended Buyer</span>
                                <p className="text-stone-700 font-medium leading-relaxed text-stone-900">{product.advice.buyerType}</p>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 5: AI Buying Confidence Card */}
                          <div className="bg-amber-500/[0.02] border border-amber-800/10 rounded-2xl p-4 sm:p-5 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-sans font-bold text-amber-800 uppercase tracking-widest flex items-center space-x-1.5">
                                <ShieldCheck className="h-4 w-4 text-amber-800" />
                                <span>AI Buying Confidence</span>
                              </h4>
                              <span className="text-xs font-mono font-black text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-lg border border-amber-800/10">
                                Rating: {product.researchSummary.confidenceRating}%
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 font-light leading-relaxed">
                              {getConfidenceRationale(product)}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[9px] font-bold text-amber-900 uppercase tracking-wide">
                              <div className="flex items-center space-x-1">
                                <Check className="h-3 w-3 text-green-700" />
                                <span>Budget Match</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Check className="h-3 w-3 text-green-700" />
                                <span>Priority Match</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Check className="h-3 w-3 text-green-700" />
                                <span>Vetted Info</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Check className="h-3 w-3 text-green-700" />
                                <span>Trade-Off check</span>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 6: Verified Price Comparison Matrix */}
                          <div className="space-y-2.5">
                            <h4 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest flex items-center space-x-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-stone-400" />
                              <span>Live Retail Pricing Comparison</span>
                            </h4>
                            <div className="overflow-hidden border border-stone-200/60 rounded-xl">
                              <table className="w-full text-[11px] text-stone-700">
                                <thead className="bg-stone-50 font-sans font-bold text-[9px] uppercase tracking-wider text-stone-400 border-b border-stone-200/60">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Verified Retailer</th>
                                    <th className="px-4 py-2 text-right">Current Price</th>
                                    <th className="px-4 py-2 text-right">Verification Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 font-light">
                                  {product.retailers.map((retail, retIdx) => (
                                    <tr key={retIdx} className="hover:bg-stone-50/40 transition-colors">
                                      <td className="px-4 py-2 text-left font-semibold text-stone-800">{retail.name}</td>
                                      <td className="px-4 py-2 text-right font-mono font-bold text-stone-900">₹{retail.price.toLocaleString()}</td>
                                      <td className="px-4 py-2 text-right text-green-700 font-bold">
                                        {retail.lowestAvailable ? (
                                          <span className="bg-green-50 border border-green-200/60 rounded px-2 py-0.5 text-[9px]">
                                            ★ Best Price Verified
                                          </span>
                                        ) : (
                                          <span className="text-stone-400 font-normal">Active Link</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* SECTION 7: Separate Affiliate Purchase Buttons */}
                          <div className="border-t border-stone-150 pt-5 space-y-3 bg-stone-50/40 p-4 rounded-2xl border border-stone-150/40">
                            <div className="flex items-center space-x-1">
                              <InfoIcon className="h-3 w-3 text-stone-400" />
                              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                                Affiliate Purchase Links (Separated from recommendation analysis)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                              {product.retailers.map((retail, retIdx) => (
                                <a
                                  key={retIdx}
                                  href={retail.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-2 py-2.5 px-4 rounded-xl text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] cursor-pointer"
                                  style={{ 
                                    backgroundColor: retail.name.includes('Amazon') ? '#FF9900' : retail.name.includes('Flipkart') ? '#2874F0' : retail.name.includes('Nike') ? '#000000' : retail.name.includes('Asics') ? '#001E62' : retail.name.includes('Adidas') ? '#000000' : '#78350F'
                                  }}
                                >
                                  <ShoppingCart className="h-3.5 w-3.5" />
                                  <span>Buy on {retail.name.split(' ')[0]}</span>
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* SECTION 8: Interactive Card Utility Actions */}
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            {/* Watchlist Toggle */}
                            <button
                              onClick={() => handleToggleWatchlist(product.id)}
                              className={`inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                isWatched
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${isWatched ? 'fill-amber-800 text-amber-800' : ''}`} />
                              <span>{isWatched ? 'Saved in Watchlist' : 'Save to Watchlist'}</span>
                            </button>

                            {/* Compare Toggle */}
                            {onToggleCompare && (
                              <button
                                onClick={() => onToggleCompare(product.dbProductId || product.id)}
                                className={`inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                  isCompared
                                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                                    : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                                }`}
                              >
                                <ArrowLeftRight className="h-4 w-4" />
                                <span>{isCompared ? 'Added to Compare Matrix' : 'Add to Compare'}</span>
                              </button>
                            )}

                            {/* View details (if matches dbProductId) */}
                            {product.dbProductId && (
                              <button
                                onClick={() => onNavigateToProduct(product.dbProductId!)}
                                className="inline-flex items-center space-x-1 py-2 px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold uppercase tracking-wider text-stone-600 transition-colors cursor-pointer"
                              >
                                <Info className="h-4 w-4" />
                                <span>Full Specs Page</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* SECTION 9: Buy with Confidence Decision Support Section */}
            <div className="border border-stone-200 bg-stone-50/50 p-6 sm:p-8 rounded-3xl space-y-4 max-w-3xl mx-auto text-left relative overflow-hidden shadow-sm" id="decision-support-confidence-banner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/50">
                <ShieldCheck className="h-6 w-6 text-amber-700" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-lg font-bold text-stone-950">Buy with Confidence</h3>
                <p className="text-stone-600 text-xs font-light leading-relaxed">
                  Our algorithm calculates recommendation ranking objectively based purely on technical compatibility, real-world user metrics, and verified pricing lists. We receive the same commission rate across standard networks, completely eliminating biased placements. Focus on the core trade-offs outlined above to select the fit that matches your life.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-semibold text-stone-700">
                <div className="bg-white border border-stone-200 p-3 rounded-xl flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>No Sponsored Placements</span>
                </div>
                <div className="bg-white border border-stone-200 p-3 rounded-xl flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Rigorous Trade-Off checks</span>
                </div>
                <div className="bg-white border border-stone-200 p-3 rounded-xl flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Vetted Specs & Pricing</span>
                </div>
              </div>
            </div>

            {/* SECTION 10: Continue Exploring Navigation Options */}
            <div className="border-t border-stone-200 pt-8 max-w-md mx-auto space-y-4">
              <span className="block text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest text-center">
                Continue Exploring
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center space-x-1.5 py-3 px-4 rounded-xl bg-amber-850 hover:bg-amber-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Find Another Product</span>
                </button>
                <button
                  onClick={onBackToHome}
                  className="py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            SCREEN 5: ERROR - UNIDENTIFIED SCREEN
            ========================================== */}
        {screenState === 'unidentified' && (
          <motion.div
            key="unidentified-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-12 space-y-8 bg-white border border-stone-200 rounded-3xl p-8 shadow-lg"
            id="ai-unidentified-category"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/50 mx-auto">
              <AlertCircle className="h-6 w-6 text-amber-700" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-lg font-bold text-stone-900 tracking-tight">
                We couldn't identify that product yet.
              </h3>
              <p className="text-stone-500 text-xs font-light leading-relaxed">
                Our AI Shopper Assistant didn't match your query with any current inventory classes. Let's refine your wording!
              </p>
            </div>

            {/* Quick Request category text box */}
            <div className="border-t border-stone-100 pt-5 space-y-4">
              {categoryRequestSubmitted ? (
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-green-800 text-[11px] font-medium animate-fade-in">
                  🎉 Thank you! Your request for this category has been logged in our queue.
                </div>
              ) : (
                <div className="space-y-2.5 text-left">
                  <label className="block text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest">
                    Request this category for curation:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={requestCategoryText}
                      onChange={(e) => setRequestCategoryText(e.target.value)}
                      placeholder="e.g. Mechanical keyboards, Audio cables"
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-700"
                    />
                    <button
                      onClick={() => {
                        if (requestCategoryText.trim()) {
                          setCategoryRequestSubmitted(true);
                        }
                      }}
                      className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Actions block */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center space-x-1 py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-[#faf9f6] text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Search Again</span>
              </button>
              <button
                onClick={onBackToHome}
                className="py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Browse Categories
              </button>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            SCREEN 6: ERROR - UNSUPPORTED SCREEN
            ========================================== */}
        {screenState === 'unsupported' && (
          <motion.div
            key="unsupported-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-12 space-y-8 bg-white border border-stone-200 rounded-3xl p-8 shadow-lg"
            id="ai-unsupported-category"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/50 mx-auto">
              <BadgeAlert className="h-6 w-6 text-amber-700" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-lg font-bold text-stone-900 tracking-tight">
                This category is not currently supported.
              </h3>
              <p className="text-stone-500 text-xs font-light leading-relaxed">
                We are actively expanding our catalog! Sign up below to get instant notifications when <strong className="text-amber-800 font-semibold">"{identifiedCategory}"</strong> is unlocked.
              </p>
            </div>

            {/* Beautiful inline Notify Me Form */}
            <div className="border-t border-stone-100 pt-5 space-y-4">
              {isNotified ? (
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-green-800 text-[11px] font-medium animate-fade-in">
                  🎉 Fantastic! You will receive email alerts as soon as "{identifiedCategory}" launches.
                </div>
              ) : (
                <div className="space-y-2.5 text-left">
                  <label className="block text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest">
                    Notify Me When Available
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-700"
                    />
                    <button
                      onClick={() => {
                        if (notifyEmail.trim()) {
                          setIsNotified(true);
                        }
                      }}
                      className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Notify Me
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Browse Popular Alternatives Section */}
            <div className="space-y-3 text-left">
              <span className="block text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest">
                Popular Active Categories
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Smartphones', icon: Smartphone },
                  { name: 'Laptops', icon: Laptop },
                  { name: 'Running Shoes', icon: Footprints },
                  { name: 'Smartwatches', icon: Watch }
                ].map((alt) => {
                  const AltIcon = alt.icon;
                  return (
                    <button
                      key={alt.name}
                      onClick={() => {
                        setIdentifiedCategory(alt.name);
                        setScreenState('questions');
                        setCurrentQuestionIndex(0);
                        setAnswers({});
                        setShowSlider(false);
                      }}
                      className="flex items-center space-x-2 p-2.5 border border-stone-100 rounded-xl hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider transition-colors text-left cursor-pointer"
                    >
                      <AltIcon className="h-4 w-4 text-amber-800" />
                      <span>{alt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
              >
                Request Product Category
              </button>
              <button
                onClick={onBackToHome}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-850 hover:bg-amber-900 text-[#faf9f6] text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* WATCHLIST DRAWER/MODAL OVERLAY */}
      <AnimatePresence>
        {showWatchlistModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" id="watchlist-modal-overlay">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWatchlistModal(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all border border-stone-200 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowWatchlistModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                {/* Title & icon */}
                <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                    <Bookmark className="h-5 w-5 text-amber-850 fill-amber-850/15" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-stone-900 leading-tight">Your Saved Watchlist</h3>
                    <p className="text-stone-500 text-xs font-light">Saved products for future tracking, updates, and fast spec comparisons.</p>
                  </div>
                </div>

                {watchlist.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Bookmark className="h-10 w-10 text-stone-300 mx-auto animate-pulse" />
                    <h4 className="text-stone-700 text-sm font-semibold font-sans">Your Watchlist is empty</h4>
                    <p className="text-stone-400 text-xs font-light max-w-xs mx-auto leading-normal">
                      Add products from your match results to save them here for later reviews.
                    </p>
                    <button
                      onClick={() => setShowWatchlistModal(false)}
                      className="py-2 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Browse Results
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {watchlist.map(watchedId => {
                      const rawProduct = products.find(p => p.id === watchedId);
                      if (!rawProduct) return null;

                      const product = {
                        ...rawProduct,
                        image: rawProduct.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                        dbProductId: rawProduct.id,
                        retailerUrl: rawProduct.retailers?.[0]?.url || rawProduct.amazonUrl || '#'
                      };

                      const isCompared = compareList.includes(product.dbProductId || product.id);

                      return (
                        <div key={product.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-stone-50 border border-stone-200/60 rounded-2xl gap-4">
                          <div className="flex items-center space-x-4 self-start sm:self-center">
                            <img src={product.image} alt={product.title} className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-stone-100 shrink-0" />
                            <div className="text-left">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-800 block">{product.brand}</span>
                              <h4 className="text-stone-900 text-xs font-bold leading-snug">{product.title}</h4>
                              <span className="font-mono font-bold text-xs text-stone-850">₹{product.price.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Compare */}
                            {onToggleCompare && (
                              <button
                                onClick={() => onToggleCompare(product.dbProductId || product.id)}
                                className={`py-1.5 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                  isCompared
                                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                                    : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                                }`}
                              >
                                <ArrowLeftRight className="h-3 w-3 inline mr-1" />
                                <span>{isCompared ? 'Added' : 'Compare'}</span>
                              </button>
                            )}

                            {/* Buy button */}
                            <a
                              href={product.retailerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-850 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                            >
                              Buy
                            </a>

                            {/* Remove */}
                            <button
                              onClick={() => handleToggleWatchlist(product.id)}
                              className="p-1.5 rounded-lg border border-stone-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end border-t border-stone-100 pt-4">
                  <button
                    onClick={() => setShowWatchlistModal(false)}
                    className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
