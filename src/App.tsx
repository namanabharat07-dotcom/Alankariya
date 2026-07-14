import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  getStoredData, saveProducts, savePosts, saveFaqs, 
  getStoredAnalyticsEvents, saveAnalyticsEvents,
  getStoredCategories, saveCategories
} from './data/initialData';
import { 
  seedInitialDataIfEmpty,
  saveProductToFirestore,
  deleteProductFromFirestore,
  savePostToFirestore,
  deletePostFromFirestore,
  saveFaqToFirestore,
  deleteFaqFromFirestore,
  saveAnalyticsEventToFirestore,
  getAnalyticsEventsFromFirestore,
  auth,
  saveClickingToFirestore,
  getStarProductsFromFirestore,
  saveStarProductToFirestore,
  deleteStarProductFromFirestore,
  getCategoriesFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore
} from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import AuthModal from './components/AuthModal';
import { Product, Post, FAQItem, AnalyticsEvent, StarProduct, ProductCategory } from './types';
import { updateSEOMetadata } from './utils/seo';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ProductComparison from './components/ProductComparison';
import ComparisonHistory from './components/ComparisonHistory';
import WatchlistSection from './components/WatchlistSection';
import PriceTrackerSection from './components/PriceTrackerSection';
import CategoriesSection from './components/CategoriesSection';
import FAQSection from './components/FAQSection';
import ProductDetail from './components/ProductDetail';
import BlogSection from './components/BlogSection';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import StarProductsCarousel from './components/StarProductsCarousel';
import AIFinder from './components/AIFinder';
import PremiumWelcome from './components/PremiumWelcome';
import { LargeNewsletterSection, CompactScrollBanner, ExitIntentPopup } from './components/NewsletterSection';
import { 
  Sparkles, Award, ShieldCheck, ShoppingBag, ArrowRight, Star, 
  Filter, Check, Info, Mail, Send, MapPin, MessageSquare, HelpCircle, Layers, Flame, ShoppingCart, CloudLightning, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- Core State Loader ---
  const [data, setData] = useState(() => getStoredData());
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(() => getStoredCategories());
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => getStoredAnalyticsEvents());
  const [compareList, setCompareList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDbSyncing, setIsDbSyncing] = useState(false);
  const [starProducts, setStarProducts] = useState<StarProduct[]>([]);

  // --- Premium Welcome Experience State ---
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      const viewed = localStorage.getItem('alankapriya_welcome_viewed');
      return viewed !== 'true';
    } catch (e) {
      return true;
    }
  });

  const placeholders = [
    "What are you looking to buy today?",
    "Gaming phone under ₹25,000",
    "Laptop for coding",
    "Running shoes",
    "Hair dryer",
    "Smartwatch",
    "Saree",
    "Air fryer"
  ];
  const [currentPlaceholderIdx, setCurrentPlaceholderIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setTimeout(() => {
      const searchInput = document.getElementById('home-hero-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 150);
  };

  const handleReplayWelcome = () => {
    localStorage.removeItem('alankapriya_welcome_viewed');
    setShowWelcome(true);
  };

  // --- Firebase Authentication state & listeners ---
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalSignUp, setAuthModalSignUp] = useState(false);
  const [pendingClickAction, setPendingClickAction] = useState<{ productId: string; network: string; url: string } | null>(null);

  const isAdmin = currentUser?.email?.toLowerCase() === 'namanabharat07@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  // --- Dynamic Routing ---
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [postTypeFilter, setPostTypeFilter] = useState<'all' | 'blog' | 'guide'>('all');
  const [aiFinderPreQuery, setAiFinderPreQuery] = useState('');

  // --- Marketing and Push Notification Automation states ---
  const [marketingBanner, setMarketingBanner] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  // URL parameters parser for Verification and Unsubscribe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyEmailParam = params.get('verify_email');
    const tokenParam = params.get('token');
    const unsubscribeParam = params.get('unsubscribe');
    const pageParam = params.get('page');
    const idsParam = params.get('ids');

    if (verifyEmailParam && tokenParam) {
      import('./lib/marketing').then(async (m) => {
        const success = await m.verifyEmail(verifyEmailParam, tokenParam);
        if (success) {
          setMarketingBanner({
            message: `🎉 Email address "${verifyEmailParam}" has been successfully verified! Premium notifications unlocked.`,
            type: 'success'
          });
        } else {
          setMarketingBanner({
            message: `❌ Verification failed. Invalid or expired confirmation token.`,
            type: 'info'
          });
        }
        // Clean URL params cleanly
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    } else if (unsubscribeParam) {
      import('./lib/marketing').then(async (m) => {
        await m.unsubscribeEmail(unsubscribeParam);
        setMarketingBanner({
          message: `👋 You have been successfully unsubscribed from ${unsubscribeParam}. We will miss you!`,
          type: 'success'
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    } else if (pageParam === 'compare' && idsParam) {
      const ids = idsParam.split(',');
      setCompareList(ids);
      setCurrentPage('compare');
    }
  }, []);

  // Secure Route Guard & Direct URL Access Protection
  useEffect(() => {
    if (isAuthLoading) return;

    const checkAdminRoute = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');

      if (hash === '#admin' || pageParam === 'admin') {
        if (!isAdmin) {
          setCurrentPage('home');
          if (hash === '#admin') {
            window.location.hash = '';
          }
          if (pageParam === 'admin') {
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('page');
            const newSearch = newParams.toString();
            const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
            window.history.replaceState({}, document.title, newUrl);
          }
          if (!currentUser) {
            setIsAuthModalOpen(true);
          }
        } else {
          setCurrentPage('admin');
        }
      }
    };

    checkAdminRoute();

    if (currentPage === 'admin' && !isAdmin) {
      setCurrentPage('home');
      if (!currentUser) {
        setIsAuthModalOpen(true);
      }
    }

    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, [currentPage, isAdmin, isAuthLoading, currentUser]);

  // Show push notification prompt on first visit after 3.5 seconds
  useEffect(() => {
    const promptSeen = localStorage.getItem('alankariya_push_prompt_seen');
    if (!promptSeen) {
      const timer = setTimeout(() => {
        setShowPushPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptPush = async () => {
    setShowPushPrompt(false);
    localStorage.setItem('alankariya_push_prompt_seen', 'true');
    try {
      const { requestBrowserNotification } = await import('./lib/marketing');
      const { permission } = await requestBrowserNotification();
      if (permission === 'granted') {
        setMarketingBanner({
          message: '🔔 Browser push notifications enabled! You will now receive alerts for new deals and flash price drops.',
          type: 'success'
        });
        // Trigger local test welcome push notification
        const { triggerLocalBrowserPushNotification } = await import('./lib/marketing');
        triggerLocalBrowserPushNotification('🌸 Welcome to Alankariya Alerts!', 'You will now receive automatic price drop notifications and new curated product arrivals!');
      }
    } catch (e) {
      console.warn('Browser Notification prompt failed inside iframe context', e);
    }
  };

  const handleDeclinePush = () => {
    setShowPushPrompt(false);
    localStorage.setItem('alankariya_push_prompt_seen', 'true');
  };

  // --- Catalog Filters state ---
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(1500);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');

  // --- Smart Budget Matcher State ---
  const [budgetCategory, setBudgetCategory] = useState<string>('Audio');
  const [budgetMax, setBudgetMax] = useState<number>(300);

  // --- Session tracking ---
  const sessionId = useMemo(() => `sess-${Math.random().toString(36).substring(2, 11)}`, []);
  const sessionStartTime = useRef(Date.now());
  const lastSearchTermLogged = useRef('');

  // --- Trust Forms State ---
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // --- Cart State (E-commerce Amazon/Myntra Style) ---
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number; selectedSize?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('alankariya_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('alankariya_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product: Product, size?: string) => {
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIdx > -1) {
        const newItems = [...prevItems];
        newItems[existingIdx].quantity += 1;
        return newItems;
      } else {
        return [...prevItems, { product, quantity: 1, selectedSize: size }];
      }
    });
    setIsCartOpen(true);

    // Automatically trigger abandoned deal marketing email reminder
    if (currentUser && currentUser.email) {
      import('./lib/marketing').then(m => {
        m.triggerAbandonedDealCampaign(currentUser.email!, product).catch(err => console.error("Error triggering abandoned deal:", err));
      });
    }
  };

  const handleRemoveFromCart = (productId: string, size?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  const handleUpdateQuantity = (productId: string, size: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId, size);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // --- Load and Sync Remote Firestore Database on Mount ---
  useEffect(() => {
    async function initFirebaseData() {
      setIsDbSyncing(true);
      try {
        const { DEFAULT_PRODUCTS, DEFAULT_POSTS, DEFAULT_FAQS, DEFAULT_CATEGORIES } = await import('./data/initialData');
        const seeded = await seedInitialDataIfEmpty(DEFAULT_PRODUCTS, DEFAULT_POSTS, DEFAULT_FAQS, DEFAULT_CATEGORIES);
        
        setData({
          products: seeded.products,
          posts: seeded.posts,
          faqs: seeded.faqs
        });

        if (seeded.categories && seeded.categories.length > 0) {
          setProductCategories(seeded.categories);
          saveCategories(seeded.categories);
        }
        
        // Fetch and load star products
        const stars = await getStarProductsFromFirestore();
        setStarProducts(stars);
        
        // Cache to local storage as offline cache
        saveProducts(seeded.products);
        savePosts(seeded.posts);
        saveFaqs(seeded.faqs);
      } catch (e) {
        console.error("Failed to initialize database from Firestore:", e);
      } finally {
        setIsDbSyncing(false);
      }
    }
    initFirebaseData();
  }, []);

  // --- Load Analytics Events only for Authorized Admins ---
  useEffect(() => {
    if (isAdmin) {
      async function fetchAnalytics() {
        try {
          const events = await getAnalyticsEventsFromFirestore();
          if (events && events.length > 0) {
            setAnalyticsEvents(events);
            saveAnalyticsEvents(events);
          }
        } catch (err) {
          console.warn("Unable to fetch analytics events (authorized admin check failed or empty):", err);
        }
      }
      fetchAnalytics();
    }
  }, [isAdmin]);

  // --- Extract distinct brand and category lists for filter drops ---
  const categories = useMemo(() => {
    const list = productCategories.map(c => c.name);
    // Add any category that exists in products but not in master list
    data.products.forEach(p => {
      if (p.category && !list.includes(p.category)) {
        list.push(p.category);
      }
    });
    return ['All', ...list];
  }, [productCategories, data.products]);

  const brands = useMemo(() => {
    return ['All', ...Array.from(new Set(data.products.map(p => p.brand)))];
  }, [data.products]);

  // --- Premium Shopping Assistant Selections ---
  const dailyStarProduct = useMemo(() => {
    return data.products.find(p => p.isDailyStar) || data.products[0];
  }, [data.products]);

  const budgetMatcherResults = useMemo(() => {
    const categoryProducts = data.products.filter(p => p.category === budgetCategory);
    if (categoryProducts.length === 0) return { bestMatch: null, alternative: null };

    const matches = categoryProducts
      .filter(p => p.price <= budgetMax)
      .sort((a, b) => b.rating - a.rating || b.price - a.price);
    const bestMatch = matches[0] || null;

    const alts = categoryProducts
      .filter(p => p.price > budgetMax)
      .sort((a, b) => b.rating - a.rating || a.price - b.price);
    const alternative = alts[0] || null;

    return { bestMatch, alternative };
  }, [data.products, budgetCategory, budgetMax]);

  // --- Auto Sync Data State & Persistence ---
  const handleUpdateProducts = async (newProducts: Product[]) => {
    if (!isAdmin) {
      alert("Access Denied: You do not have permission to perform this operation.");
      return;
    }
    const prevProducts = data.products;
    setData(prev => ({ ...prev, products: newProducts }));
    saveProducts(newProducts);
    
    setIsDbSyncing(true);
    try {
      // Find deleted products
      const deleted = prevProducts.filter(p => !newProducts.some(np => np.id === p.id));
      for (const p of deleted) {
        await deleteProductFromFirestore(p.id);
      }
      // Find added or changed products
      const changed = newProducts.filter(np => {
        const op = prevProducts.find(p => p.id === np.id);
        return !op || JSON.stringify(op) !== JSON.stringify(np);
      });
      for (const p of changed) {
        await saveProductToFirestore(p);

        // Hook up automated marketing campaign triggers
        const op = prevProducts.find(oldP => oldP.id === p.id);
        if (!op) {
          // Newly created product!
          import('./lib/marketing').then(m => {
            m.triggerNewProductCampaign(p).catch(err => console.error("Error triggering product campaign:", err));
          });
        } else if (p.price < op.price) {
          // Price drop!
          import('./lib/marketing').then(m => {
            m.triggerPriceDropCampaign(p, op.price, p.price).catch(err => console.error("Error triggering price drop:", err));
          });
        }
      }
    } catch (err) {
      console.error('Error syncing products with Firestore:', err);
    } finally {
      setIsDbSyncing(false);
    }
  };

  const handleUpdatePosts = async (newPosts: Post[]) => {
    if (!isAdmin) {
      alert("Access Denied: You do not have permission to perform this operation.");
      return;
    }
    const prevPosts = data.posts;
    setData(prev => ({ ...prev, posts: newPosts }));
    savePosts(newPosts);
    
    setIsDbSyncing(true);
    try {
      // Find deleted posts
      const deleted = prevPosts.filter(p => !newPosts.some(np => np.id === p.id));
      for (const p of deleted) {
        await deletePostFromFirestore(p.id);
      }
      // Find added or changed posts
      const changed = newPosts.filter(np => {
        const op = prevPosts.find(p => p.id === np.id);
        return !op || JSON.stringify(op) !== JSON.stringify(np);
      });
      for (const p of changed) {
        await savePostToFirestore(p);

        // Hook up automated marketing campaign triggers
        const op = prevPosts.find(oldP => oldP.id === p.id);
        if (!op) {
          // Newly created post!
          import('./lib/marketing').then(m => {
            m.triggerNewPostCampaign(p).catch(err => console.error("Error triggering post campaign:", err));
          });
        }
      }
    } catch (err) {
      console.error('Error syncing posts with Firestore:', err);
    } finally {
      setIsDbSyncing(false);
    }
  };

  const handleUpdateFaqs = async (newFaqs: FAQItem[]) => {
    if (!isAdmin) {
      alert("Access Denied: You do not have permission to perform this operation.");
      return;
    }
    const prevFaqs = data.faqs;
    setData(prev => ({ ...prev, faqs: newFaqs }));
    saveFaqs(newFaqs);
    
    setIsDbSyncing(true);
    try {
      // Find deleted FAQs
      const deleted = prevFaqs.filter(p => !newFaqs.some(nf => nf.id === p.id));
      for (const p of deleted) {
        await deleteFaqFromFirestore(p.id);
      }
      // Find added or changed FAQs
      const changed = newFaqs.filter(nf => {
        const op = prevFaqs.find(p => p.id === nf.id);
        return !op || JSON.stringify(op) !== JSON.stringify(nf);
      });
      for (const p of changed) {
        await saveFaqToFirestore(p);
      }
    } catch (err) {
      console.error('Error syncing FAQs with Firestore:', err);
    } finally {
      setIsDbSyncing(false);
    }
  };

  const handleUpdateStarProducts = async (newStars: StarProduct[]) => {
    if (!isAdmin) {
      alert("Access Denied: You do not have permission to perform this operation.");
      return;
    }
    const prevStars = starProducts;
    setStarProducts(newStars);

    setIsDbSyncing(true);
    try {
      // Find deleted star products
      const deleted = prevStars.filter(p => !newStars.some(np => np.id === p.id));
      for (const p of deleted) {
        await deleteStarProductFromFirestore(p.id);
      }
      // Find added or changed star products
      const changed = newStars.filter(np => {
        const op = prevStars.find(p => p.id === np.id);
        return !op || JSON.stringify(op) !== JSON.stringify(np);
      });
      for (const p of changed) {
        await saveStarProductToFirestore(p);
      }
    } catch (err) {
      console.error('Error syncing star products with Firestore:', err);
    } finally {
      setIsDbSyncing(false);
    }
  };

  const handleUpdateCategories = async (newCategories: ProductCategory[]) => {
    if (!isAdmin) {
      alert("Access Denied: You do not have permission to perform this operation.");
      return;
    }
    const prevCategories = productCategories;
    setProductCategories(newCategories);
    saveCategories(newCategories);

    setIsDbSyncing(true);
    try {
      // Find deleted categories
      const deleted = prevCategories.filter(p => !newCategories.some(nc => nc.id === p.id));
      for (const p of deleted) {
        await deleteCategoryFromFirestore(p.id);
      }
      // Find added or changed categories
      const changed = newCategories.filter(nc => {
        const op = prevCategories.find(p => p.id === nc.id);
        return !op || JSON.stringify(op) !== JSON.stringify(nc);
      });
      for (const p of changed) {
        await saveCategoryToFirestore(p);
      }
    } catch (err) {
      console.error('Error syncing categories with Firestore:', err);
    } finally {
      setIsDbSyncing(false);
    }
  };

  // --- Analytics Click & View Trigger Hooks ---
  const logEvent = (type: any, targetId?: string, targetName?: string, network?: any) => {
    const newEvt: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      eventType: type,
      targetId,
      targetName,
      network,
      timestamp: new Date().toISOString(),
      sessionId
    };
    
    const updated = [...analyticsEvents, newEvt];
    setAnalyticsEvents(updated);
    // Persist event in storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('aff_portal_analytics_events', JSON.stringify(updated));
    }
    // Record asynchronously to Firestore database
    saveAnalyticsEventToFirestore(newEvt);
  };


  // Log page view when current route details switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let title = 'Premium Tech Affiliate Reviews';
    let desc = 'Honest, independent specs and comparison sitemaps to find the absolute best daily desk setup gadgets.';

    if (currentPage === 'product' && activeProductId) {
      const prod = data.products.find(p => p.id === activeProductId);
      if (prod) {
        title = `${prod.title} In-Depth Review`;
        desc = prod.shortDescription;
        logEvent('page_view', prod.id, prod.title);
      }
    } else if ((currentPage === 'blog' || currentPage === 'guide') && activePostId) {
      const post = data.posts.find(p => p.id === activePostId);
      if (post) {
        title = post.title;
        desc = post.summary;
        logEvent('page_view', post.id, post.title);
      }
    } else if (currentPage === 'admin') {
      title = 'Admin Command Center';
      desc = 'Manage affiliate products, sitemaps, and real-time tracking dashboard.';
    } else {
      logEvent('page_view', undefined, currentPage);
    }

    // Dynamic SEO update in `<head>`
    updateSEOMetadata({
      title,
      description: desc,
      faqSchema: currentPage === 'faqs' ? data.faqs : undefined,
      productSchema: (currentPage === 'product' && activeProductId) 
        ? data.products.find(p => p.id === activeProductId) 
        : undefined
    });

  }, [currentPage, activeProductId, activePostId, data.products, data.posts, data.faqs]);

  // Log search parameters after query stops changing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery === lastSearchTermLogged.current) return;
    
    const timer = setTimeout(() => {
      logEvent('search', undefined, searchQuery);
      lastSearchTermLogged.current = searchQuery;
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Track session duration ping regularly (every 10 seconds to compute bounce metrics)
  useEffect(() => {
    const pingInterval = setInterval(() => {
      const durationSec = Math.round((Date.now() - sessionStartTime.current) / 1000);
      logEvent('duration_ping', undefined, `${durationSec}s`);
    }, 12000);

    return () => clearInterval(pingInterval);
  }, []);

  // --- Nav Helpers ---
  const handleNavigate = (page: string, params?: Record<string, any>) => {
    setSearchQuery(''); // clear query on navigation
    if (page === 'admin' && !isAdmin) {
      alert('Access Denied: You do not have administrator permissions.');
      setCurrentPage('home');
      return;
    }
    setCurrentPage(page);
    if (page === 'product' && params?.id) {
      setActiveProductId(params.id);
    } else if (page === 'blog' && params?.id) {
      setActivePostId(params.id);
    } else if (page === 'guide' && params?.id) {
      setActivePostId(params.id);
    } else if (page === 'guides_list') {
      setPostTypeFilter('guide');
      setCurrentPage('guides_list');
    } else if (page === 'blogs_list') {
      setPostTypeFilter('blog');
      setCurrentPage('blogs_list');
    }
  };

  // --- Comparison List Manager ---
  const handleToggleCompare = (productId: string) => {
    setCompareList(prev => {
      let next;
      if (prev.includes(productId)) {
        next = prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 products side-by-side.');
          return prev;
        }
        next = [...prev, productId];
      }
      
      // Log compare list state change
      if (next.length >= 2) {
        const itemNames = next.map(id => data.products.find(p => p.id === id)?.title || id).join(' VS ');
        logEvent('compare', undefined, itemNames);
      }
      return next;
    });
  };

  const handleClearCompare = () => setCompareList([]);

  const handleAffiliateClick = (productId: string, network: string, url: string, e?: React.MouseEvent) => {
    const prod = data.products.find(p => p.id === productId);

    // If user is not authenticated, block click redirect and show Auth modal
    if (!currentUser) {
      if (e) {
        e.preventDefault();
      }
      setPendingClickAction({ productId, network, url });
      setIsAuthModalOpen(true);
      return;
    }

    // Automatically trigger abandoned deal marketing email reminder
    if (currentUser.email && prod) {
      import('./lib/marketing').then(m => {
        m.triggerAbandonedDealCampaign(currentUser.email!, prod).catch(err => console.error("Error triggering abandoned deal:", err));
      });
    }

    // Log standard analytics event
    logEvent('click_affiliate', productId, prod?.title || productId, network);
    
    // Save clicking details to user's database records in Firestore
    const clickId = `click-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    saveClickingToFirestore({
      id: clickId,
      userId: currentUser.uid,
      userEmail: currentUser.email || 'anonymous@user.com',
      productId: productId,
      productTitle: prod?.title || productId,
      network: network,
      url: url,
      timestamp: new Date().toISOString()
    });
  };

  const handleStarProductClick = (star: StarProduct, e: React.MouseEvent) => {
    if (!currentUser) {
      if (e) {
        e.preventDefault();
      }
      setPendingClickAction({ productId: star.id, network: 'star_deal', url: star.affiliateUrl });
      setIsAuthModalOpen(true);
      return;
    }

    logEvent('click_affiliate', star.id, star.title, 'star_deal');

    const clickId = `click-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    saveClickingToFirestore({
      id: clickId,
      userId: currentUser.uid,
      userEmail: currentUser.email || 'anonymous@user.com',
      productId: star.id,
      productTitle: star.title,
      network: 'star_deal',
      url: star.affiliateUrl,
      timestamp: new Date().toISOString()
    });
  };

  const handleAuthSuccess = () => {
    // If we have a pending click action, execute it now that user is signed in
    if (pendingClickAction) {
      const { productId, network, url } = pendingClickAction;
      const prod = data.products.find(p => p.id === productId);
      const starProd = starProducts.find(s => s.id === productId);
      const title = prod?.title || starProd?.title || productId;
      
      // Log event
      logEvent('click_affiliate', productId, title, network);
      
      // Fetch latest user from firebase auth instance instantly
      const user = auth.currentUser;
      const clickId = `click-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      if (user) {
        saveClickingToFirestore({
          id: clickId,
          userId: user.uid,
          userEmail: user.email || 'anonymous@user.com',
          productId: productId,
          productTitle: title,
          network: network,
          url: url,
          timestamp: new Date().toISOString()
        });
      }

      // Proceed to open destination URL in a new window/tab
      window.open(url, '_blank', 'noopener,noreferrer');
      setPendingClickAction(null);
    }
  };

  // --- Dynamic Filtering Engine ---
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...data.products];

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand !== 'All') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // Filter by maximum price
    result = result.filter(p => p.price <= priceRange);

    // Filter by rating
    result = result.filter(p => p.rating >= minRating);

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) || 
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort matching
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // featured default (Bestsellers and Editors Choice top)
      result.sort((a, b) => {
        const scoreA = (a.isEditorsChoice ? 2 : 0) + (a.isBestSeller ? 1 : 0);
        const scoreB = (b.isEditorsChoice ? 2 : 0) + (b.isBestSeller ? 1 : 0);
        return scoreB - scoreA;
      });
    }

    return result;
  }, [data.products, selectedCategory, selectedBrand, priceRange, minRating, sortBy, searchQuery]);

  // Featured Deals (products where originalPrice is larger than current price)
  const bestDeals = useMemo(() => {
    return data.products
      .filter(p => p.originalPrice > p.price)
      .slice(0, 3);
  }, [data.products]);

  // Contact handler
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email) {
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] text-stone-800 antialiased font-sans">
      
      {/* Sticky Top Header Navigation */}
      <Navbar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        compareCount={compareList.length}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        isSyncing={isDbSyncing}
        currentUser={currentUser}
        onOpenAuth={(signUp?: boolean) => {
          setAuthModalSignUp(!!signUp);
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        onReplayWelcome={handleReplayWelcome}
        products={data.products}
      />

      {/* Main Content Sections viewport */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* ==========================================================
              CATEGORIES DIRECTORY VIEW
              ========================================================== */}
          {currentPage === 'categories' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="pb-16"
              id="categories-page-view"
            >
              <CategoriesSection
                onSelectCategory={(category) => setSelectedCategory(category)}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {/* ==========================================================
              HOMEPAGE
              ========================================================== */}
          {currentPage === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-16 pb-16"
              id="home-page-view"
            >
              {/* 1. Premium Hero Section at the absolute top */}
              <section className="relative overflow-hidden bg-[#1c1917] py-20 text-white" id="home-hero">
                {/* Decorative glowing back-blobs with elegant amber tones */}
                <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-stone-500/10 blur-3xl animate-pulse" />

                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative text-center space-y-8">
                  <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-900/40 border border-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 fill-amber-300" />
                    <span>Next-Gen Shopping</span>
                  </span>
                  
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#faf9f6] leading-tight max-w-3xl mx-auto">
                    Buy Smarter with <span className="bg-gradient-to-r from-amber-200 via-amber-350 to-amber-100 bg-clip-text text-transparent">AI</span>
                  </h1>
                  
                  <p className="text-sm sm:text-base md:text-lg text-stone-350 max-w-2xl mx-auto leading-relaxed font-light">
                    An independent hardware analysis collective. Describe your requirements in plain language, find your budget match, or compare side-by-side with 100% evidence-based audits.
                  </p>

                  {/* PREMIUM AI SEARCH BAR */}
                  <div className="max-w-2xl mx-auto pt-4" id="home-hero-search-wrap">
                    <div className="flex items-center rounded-2xl border-2 border-stone-800 bg-[#292524] px-4 py-1.5 shadow-2xl transition-all duration-300 hover:border-amber-900/60 group">
                      <span className="text-amber-400">
                        <Sparkles className="h-5 w-5 fill-amber-900/20" />
                      </span>
                      <input
                        type="text"
                        id="home-hero-search-input"
                        placeholder={placeholders[currentPlaceholderIdx]}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            if (val.trim()) {
                              setAiFinderPreQuery(val);
                              setCurrentPage('ai-finder');
                            }
                          }
                        }}
                        className="w-full bg-transparent py-3 pl-3 text-sm sm:text-base text-stone-200 outline-none placeholder:text-stone-500 font-light transition-all duration-300"
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const val = input.value;
                          if (val.trim()) {
                            setAiFinderPreQuery(val);
                            setCurrentPage('ai-finder');
                          } else {
                            setAiFinderPreQuery('');
                            setCurrentPage('ai-finder');
                          }
                        }}
                        className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-800 hover:bg-amber-950 text-[#faf9f6] text-xs font-bold uppercase tracking-wider px-5 py-3 transition-colors shadow-sm cursor-pointer shrink-0"
                      >
                        <span>Ask AI</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Example Chip Links */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                      <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">Examples:</span>
                      {[
                        'Gaming phone under ₹25,000',
                        'Best laptop for coding',
                        'Running shoes',
                        'Hair dryer',
                        'Refrigerator',
                        'Smartwatch'
                      ].map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setAiFinderPreQuery(item);
                            setCurrentPage('ai-finder');
                          }}
                          className="py-1.5 px-3 rounded-full border border-stone-800 bg-[#242120] hover:border-amber-800 hover:bg-[#1c1917] hover:text-[#faf9f6] text-stone-400 text-xs transition-colors cursor-pointer font-medium"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trust metrics */}
                  <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-stone-800 pt-8 text-center text-xs text-stone-400 font-medium">
                    <div>
                      <span className="block font-display text-xl font-bold text-[#faf9f6] uppercase tracking-wider">100%</span> Handpicked
                    </div>
                    <div>
                      <span className="block font-display text-xl font-bold text-[#faf9f6] uppercase tracking-wider">Honest</span> Reviews
                    </div>
                    <div>
                      <span className="block font-display text-xl font-bold text-[#faf9f6] uppercase tracking-wider">Direct</span> Store Links
                    </div>
                    <div>
                      <span className="block font-display text-xl font-bold text-[#faf9f6] uppercase tracking-wider">Best</span> Prices
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Core Features Section: Guides users to AI Finder, Smart Comparison, Price Tracker */}
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-core-features">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="font-mono text-[9px] tracking-widest text-amber-700 uppercase font-extrabold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/30">
                    AI Shopping Engine
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-3">
                    Explore Our Core Capabilities
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light leading-relaxed">
                    Alankapriya replaces standard retail noise with intelligent, unbiased matching and beautiful physical spec comparisons.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card A: AI Product Finder */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all"
                    id="feature-card-finder"
                  >
                    <div className="space-y-4">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/40">
                        <Sparkles className="h-5 w-5 fill-amber-50" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-stone-950 tracking-tight">
                        AI Product Finder
                      </h3>
                      <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed">
                        Say goodbye to endless filtering. Simply write what you need (e.g. "a water-resistant running watch with long battery life under ₹15k") and get immediate suggestions.
                      </p>
                    </div>
                    <button
                      onClick={() => { setAiFinderPreQuery(''); setCurrentPage('ai-finder'); }}
                      className="mt-6 inline-flex items-center space-x-1.5 font-sans text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-950 transition-colors cursor-pointer text-left self-start"
                    >
                      <span>Ask AI Finder</span>
                      <span>→</span>
                    </button>
                  </motion.div>

                  {/* Card B: Smart Comparison */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all"
                    id="feature-card-compare"
                  >
                    <div className="space-y-4">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/40">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-stone-950 tracking-tight">
                        Smart Comparison
                  </h3>
                      <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed">
                        Compare hardware specifications, pro/con audits, and neutral suitability ratings side-by-side. The decision engine recommends suitable users instead of universal winners.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentPage('compare')}
                      className="mt-6 inline-flex items-center space-x-1.5 font-sans text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-950 transition-colors cursor-pointer text-left self-start"
                    >
                      <span>Compare Products</span>
                      <span>→</span>
                    </button>
                  </motion.div>

                  {/* Card C: Price Tracker */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all"
                    id="feature-card-tracker"
                  >
                    <div className="space-y-4">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/40">
                        <Clock className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-stone-950 tracking-tight">
                        Aesthetic Price Tracker
                      </h3>
                      <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed">
                        Visualize complete history charts of price movements. Log in to configure custom price drop target notifications and save money systematically.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentPage('price-tracker')}
                      className="mt-6 inline-flex items-center space-x-1.5 font-sans text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-950 transition-colors cursor-pointer text-left self-start"
                    >
                      <span>Track Prices</span>
                      <span>→</span>
                    </button>
                  </motion.div>
                </div>
              </section>

              {/* 3. Star Products of the Day Carousel */}
              <div id="home-star-products-carousel-wrap">
                <StarProductsCarousel starProducts={starProducts} onStarClick={handleStarProductClick} />
              </div>

              {/* 4. Beautiful Categories Preview segment */}
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-categories-preview">
                <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
                    <div>
                      <span className="font-mono text-[9px] tracking-widest text-amber-800 bg-amber-150/40 px-2.5 py-0.5 rounded-full border border-amber-200/20 uppercase font-bold">
                        Browse Directories
                      </span>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-stone-950 tracking-tight mt-1.5">
                        Shop Curated Collections
                      </h3>
                    </div>
                    <button
                      onClick={() => setCurrentPage('categories')}
                      className="rounded-xl border border-stone-200 bg-[#faf9f6] px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 hover:bg-[#f5f3ef] transition-colors cursor-pointer shrink-0"
                    >
                      View All 10 Categories →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                    {[
                      { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80', desc: 'Expertly vetted smartphones, laptops, audio gear, and wearables.' },
                      { name: "Men's Fashion", img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80', desc: 'Premium athletic wear, elegant formals, and casuals.' },
                      { name: "Women's Fashion", img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=400&q=80', desc: 'Designer casuals, sarees, statement accessories, and jewelry.' },
                      { name: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80', desc: 'Minimalist organizers, cookware, and smart home appliances.' }
                    ].map(cat => (
                      <div
                        key={cat.name}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setCurrentPage('home');
                        }}
                        className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-stone-150 bg-stone-100 flex flex-col justify-end text-left"
                      >
                        <img src={cat.img} alt={cat.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent opacity-85" />
                        <div className="relative z-10 p-5 space-y-1.5">
                          <h4 className="font-display font-extrabold text-base text-white tracking-tight">{cat.name}</h4>
                          <p className="text-stone-300 text-[10px] font-light leading-relaxed line-clamp-2">{cat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 5. Why Choose Alankapriya Trust Banner */}
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 shadow-sm" id="home-why-us">
                <div className="bg-[#fafaf6] border border-amber-100/60 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -z-10" />
                  <div className="max-w-3xl">
                    <span className="text-[10px] uppercase font-sans font-extrabold tracking-widest text-amber-800 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200/30">
                      Why Us?
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-4 leading-tight">
                      Your Personal Shopping Guide
                    </h2>
                    <p className="mt-3 text-slate-600 text-sm sm:text-base font-light leading-relaxed">
                      We love finding high-quality products that fit your style and budget. Our reviews are simple, honest, and straightforward so you can shop with confidence and find exactly what you need without the confusion.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 border-t border-amber-100/40 pt-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/30">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900 font-sans">Honest & Unbiased</h4>
                        <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">
                          We do not accept paid placements. Every product is recommended based on real quality, customer ratings, and actual value.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/30">
                        <Award className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900 font-sans">Find by Budget</h4>
                        <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">
                          Set your budget and pick a category. We will show you the best, highest-rated options available within your price range.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/30">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900 font-sans">Easy Comparisons</h4>
                        <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">
                          We compare products side-by-side using real-world details and simple ratings, so you know exactly what is worth your money.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Daily Star Product Section */}
              {dailyStarProduct && (
                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-daily-star">
                  <div className="flex items-center space-x-2.5 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                      <Award className="h-5 w-5 text-amber-700" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center">
                      Daily Star Highlight
                      <span className="ml-2.5 text-[10px] font-sans font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">Editor’s Choice Pick</span>
                    </h2>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-stone-200/60 bg-white p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-center relative">
                    <div className="absolute top-4 right-4 bg-amber-700 text-white font-display font-extrabold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                      <Sparkles className="h-3 w-3 fill-white text-white mr-1" />
                      <span>STAR OF THE DAY</span>
                    </div>

                    {/* Product Image Panel */}
                    <div className="w-full lg:w-2/5 aspect-square lg:aspect-auto lg:h-72 overflow-hidden rounded-2xl bg-stone-50 border border-stone-100 relative shrink-0">
                      <img 
                        src={dailyStarProduct.images[0]} 
                        alt={dailyStarProduct.title} 
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                    </div>

                    {/* Product Info Panel */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-amber-800 uppercase tracking-widest font-sans mb-1.5">
                          <span>{dailyStarProduct.brand}</span>
                          <span>•</span>
                          <span>{dailyStarProduct.category}</span>
                        </div>
                        <h3 
                          onClick={() => handleNavigate('product', { id: dailyStarProduct.id })}
                          className="font-display text-2xl sm:text-3xl font-bold text-slate-900 hover:text-amber-800 transition-colors cursor-pointer leading-tight line-clamp-2"
                        >
                          {dailyStarProduct.title}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="font-display text-2xl font-bold text-slate-950">${dailyStarProduct.price}</span>
                        {dailyStarProduct.originalPrice > dailyStarProduct.price && (
                          <span className="text-slate-400 line-through text-sm font-light">${dailyStarProduct.originalPrice}</span>
                        )}
                        <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-150">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" />
                          <span className="text-sm">{dailyStarProduct.rating}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm font-light leading-relaxed line-clamp-3">
                        {dailyStarProduct.description}
                      </p>

                      {/* Best For block */}
                      {dailyStarProduct.tags && dailyStarProduct.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {dailyStarProduct.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                          onClick={() => handleNavigate('product', { id: dailyStarProduct.id })}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-700 hover:bg-amber-800 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors cursor-pointer"
                        >
                          <span>View Full Review</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(dailyStarProduct)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm transition-colors cursor-pointer"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Smart Budget Matcher Widget Section */}
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-budget-matcher">
                <div className="flex items-center space-x-2.5 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                    <CloudLightning className="h-5 w-5 text-amber-700" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center">
                    Budget Finder
                    <span className="ml-2.5 text-[10px] font-sans font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">Find the best product for your price</span>
                  </h2>
                </div>

                <div className="overflow-hidden rounded-3xl border border-stone-200/60 bg-[#1c1917] text-white p-6 sm:p-8 shadow-md">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Input Controls Column */}
                    <div className="lg:col-span-5 space-y-5 lg:pr-6 lg:border-r lg:border-stone-800">
                      <div>
                        <h4 className="font-display font-bold text-lg text-amber-200">Find the Best Option</h4>
                        <p className="text-stone-400 text-xs font-light mt-1">Tell us how much you want to spend, and we'll show you the highest-rated product within that budget.</p>
                      </div>

                      {/* Select Category */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest">1. Choose a Category</label>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.filter(c => c !== 'All').map(cat => (
                            <button
                              key={cat}
                              onClick={() => setBudgetCategory(cat)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                                budgetCategory === cat 
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-900/20' 
                                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-750'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Select Maximum Spend */}
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                          <span>2. Set Your Maximum Budget</span>
                          <span className="font-mono text-xs font-extrabold text-amber-300">${budgetMax}</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="1200"
                          step="10"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                        />
                        <div className="flex justify-between gap-1.5">
                          {[150, 300, 500, 1000].map(val => (
                            <button
                              key={val}
                              onClick={() => setBudgetMax(val)}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold font-mono transition-colors text-center border ${
                                budgetMax === val 
                                  ? 'bg-amber-600 border-amber-600 text-white' 
                                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                              }`}
                            >
                              ${val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Matches Output Column */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      {budgetMatcherResults.bestMatch ? (
                        <div className="space-y-6 animate-fade-in">
                          {/* Ideal Choice Card */}
                          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center">
                            <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                              <img 
                                src={budgetMatcherResults.bestMatch.images[0]} 
                                alt={budgetMatcherResults.bestMatch.title} 
                                className="h-full w-full object-cover" 
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-center sm:text-left">
                              <span className="text-[9px] font-extrabold text-amber-300 bg-amber-950/60 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                Best Match for You
                              </span>
                              <h5 className="font-display font-bold text-sm text-white mt-1.5 truncate">
                                {budgetMatcherResults.bestMatch.title}
                              </h5>
                              <div className="mt-2 flex items-center justify-center sm:justify-start space-x-3 text-xs">
                                <span className="font-mono font-extrabold text-[#faf9f6]">${budgetMatcherResults.bestMatch.price}</span>
                                <span className="text-stone-500">|</span>
                                <span className="flex items-center text-amber-500 font-bold">
                                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                                  {budgetMatcherResults.bestMatch.rating}
                                </span>
                                <span className="text-stone-500">|</span>
                                <span className="text-[10px] font-sans text-stone-400 font-medium">
                                  {budgetMatcherResults.bestMatch.brand}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleNavigate('product', { id: budgetMatcherResults.bestMatch!.id })}
                              className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-xs font-bold text-white uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                            >
                              <span>View</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Premium Alternative Segment */}
                          {budgetMatcherResults.alternative && (
                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5">
                              <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider mb-2">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                <span>Worth considering: A slightly better option</span>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="min-w-0 flex-1 text-center sm:text-left">
                                  <h6 className="font-display font-bold text-xs text-stone-200 truncate">
                                    {budgetMatcherResults.alternative.title}
                                  </h6>
                                  <p className="text-stone-400 text-[11px] font-light mt-1">
                                    For just <strong className="text-amber-200 font-mono font-bold">${budgetMatcherResults.alternative.price}</strong>, this has even better customer reviews and a rating of {budgetMatcherResults.alternative.rating}/5.
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleNavigate('product', { id: budgetMatcherResults.alternative!.id })}
                                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-xs font-bold text-stone-200 uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  <span>View Option</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-stone-900/20 rounded-2xl border border-stone-800/40 h-full">
                          <Info className="h-8 w-8 text-stone-500 mb-2" />
                          <p className="text-xs text-stone-400 font-light">
                            We couldn't find a product under <strong className="text-white">${budgetMax}</strong> in this category. <br /> Try raising your budget or selecting a different category!
                          </p>
                        </div>
                      )}

                      {/* Explainer note */}
                      <div className="text-[10px] text-stone-500 font-light mt-4 text-center lg:text-left border-t border-stone-800/50 pt-3">
                        *All recommendations are handpicked by our experts and are 100% honest.
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* Special Best Deals Section */}
              {bestDeals.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-deals">
                  <div className="flex items-center space-x-2.5 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <Flame className="h-5 w-5 fill-red-500 text-red-500" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                      Hot Direct Deals & Discounts
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {bestDeals.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => handleNavigate('product', { id: p.id })}
                        className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/10 to-amber-50/10 p-5 flex items-center space-x-4 cursor-pointer hover:border-red-300 hover:shadow transition-all"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
                          <img src={p.images[0]} alt={p.title} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-red-600 bg-red-100/80 px-1.5 py-0.5 rounded-full">
                            SAVE ${p.originalPrice - p.price}
                          </span>
                          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 mt-1 hover:text-blue-600">
                            {p.title}
                          </h4>
                          <p className="font-mono text-xs font-bold text-slate-700 mt-0.5">
                            ${p.price} <span className="text-slate-400 font-medium line-through text-[10px]">${p.originalPrice}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Unified Product Catalog + Smart Filters Grid */}
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-catalog">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  
                  {/* Filters Sidebar Segment */}
                  <aside className="lg:col-span-1 space-y-6" id="catalog-filters-sidebar">
                    <div className="rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <span className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                          <Filter className="h-4 w-4 text-amber-700" />
                          <span>Filters</span>
                        </span>
                        {(selectedCategory !== 'All' || selectedBrand !== 'All' || priceRange < 1500 || minRating > 0) && (
                          <button
                            onClick={() => {
                              setSelectedCategory('All');
                              setSelectedBrand('All');
                              setPriceRange(1500);
                              setMinRating(0);
                            }}
                            className="text-[10px] text-amber-700 hover:underline cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Dropdown 1: Category */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs font-medium text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      {/* Dropdown 2: Brand */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          Brand
                        </label>
                        <select
                          value={selectedBrand}
                          onChange={(e) => setSelectedBrand(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs font-medium text-slate-700 outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {brands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>

                      {/* Slider: Price limit */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          <span>Max Price</span>
                          <span className="text-amber-700 font-mono font-bold">${priceRange}</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="1500"
                          step="50"
                          value={priceRange}
                          onChange={(e) => setPriceRange(Number(e.target.value))}
                          className="w-full accent-amber-700 cursor-pointer h-1 rounded bg-stone-100"
                        />
                      </div>

                      {/* Selector: Min rating */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          Rating
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {[0, 4.6, 4.7, 4.8].map(score => (
                            <button
                              key={score}
                              onClick={() => setMinRating(score)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                minRating === score
                                  ? 'bg-amber-850 border-amber-850 text-white shadow-sm'
                                  : 'bg-white border-stone-200 text-slate-600 hover:bg-stone-50'
                              }`}
                            >
                              {score === 0 ? 'All' : `${score}+ ★`}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </aside>

                  {/* Main Catalog listing view */}
                  <div className="lg:col-span-3 space-y-6" id="catalog-listing-segment">
                    
                    {/* Header bar controls: Search terms match and Sorting */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b border-stone-100 pb-3 gap-3">
                      <span className="text-xs text-slate-500 font-light">
                        Showing <strong className="text-slate-900 font-bold">{filteredAndSortedProducts.length}</strong> products
                      </span>

                      {/* Sort Dropdown */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Sort By</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="rounded-xl border border-stone-200 bg-white p-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="featured">Recommended</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="rating">Top Rated</option>
                          <option value="newest">New Arrivals</option>
                        </select>
                      </div>
                    </div>

                    {/* Products Grid */}
                    {filteredAndSortedProducts.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                        <p className="text-slate-500 text-sm">No products found matching your search. Try resetting filters.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="catalog-items-grid">
                        {filteredAndSortedProducts.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onNavigateToProduct={(id) => handleNavigate('product', { id })}
                            isComparing={compareList.includes(prod.id)}
                            onToggleCompare={handleToggleCompare}
                            onAffiliateClick={handleAffiliateClick}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              </section>

              {/* Buying guides & Blog quick previews */}
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-16">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                      Expert Buying Guides & Style Tips
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Read our latest articles to help you choose the right products and style your home.
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigate('guides_list')}
                    className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    <span>Read All Articles</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {data.posts.slice(0, 3).map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => handleNavigate('blog', { id: post.id })}
                      className="cursor-pointer group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 hover:shadow-md transition-all"
                    >
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-50 mb-4">
                        <img src={post.image} alt={post.title} referrerPolicy="no-referrer" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded shadow">
                          {post.postType}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{post.category}</span>
                      <h4 className="font-display font-bold text-sm text-slate-900 line-clamp-2 mt-1 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 font-semibold font-sans">Read More →</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Dynamic Accordion FAQ Component */}
              <section className="bg-slate-50/50 border-t border-b border-slate-100 py-8">
                <FAQSection faqs={data.faqs} />
              </section>

            </motion.div>
          )}

          {/* ==========================================================
              AI PRODUCT FINDER PAGE
              ========================================================== */}
          {currentPage === 'ai-finder' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="pb-16"
            >
              <AIFinder
                products={data.products}
                initialQuery={aiFinderPreQuery}
                onClearInitialQuery={() => setAiFinderPreQuery('')}
                onBackToHome={() => setCurrentPage('home')}
                onAddToCart={handleAddToCart}
                onNavigateToProduct={(id) => handleNavigate('product', { id })}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
              />
            </motion.div>
          )}

          {/* ==========================================================
              PRODUCT REVIEW DETAILED VIEW PAGE
              ========================================================== */}
          {currentPage === 'product' && activeProductId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              {(() => {
                const prod = data.products.find(p => p.id === activeProductId);
                if (!prod) return <div className="text-center p-12">Product not found.</div>;
                return (
                  <ProductDetail
                    product={prod}
                    allProducts={data.products}
                    onBack={() => setCurrentPage('home')}
                    isComparing={compareList.includes(prod.id)}
                    onToggleCompare={handleToggleCompare}
                    onNavigateToProduct={(id) => handleNavigate('product', { id })}
                    onAffiliateClick={handleAffiliateClick}
                    onAddToCart={handleAddToCart}
                  />
                );
              })()}
            </motion.div>
          )}

          {/* ==========================================================
              COMPARISON matrix VIEW HUB
              ========================================================== */}
          {currentPage === 'compare' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              <ProductComparison
                selectedProducts={data.products.filter(p => compareList.includes(p.id))}
                allProducts={data.products}
                onRemoveFromCompare={handleToggleCompare}
                onClearCompare={handleClearCompare}
                onNavigateToProduct={(id) => handleNavigate('product', { id })}
                onAffiliateClick={handleAffiliateClick}
                onNavigate={handleNavigate}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {/* ==========================================================
              WATCHLIST VIEW
              ========================================================== */}
          {currentPage === 'watchlist' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              <WatchlistSection
                currentUser={currentUser}
                allProducts={data.products}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {/* ==========================================================
              PRICE TRACKER VIEW
              ========================================================== */}
          {currentPage === 'price-tracker' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              <PriceTrackerSection
                currentUser={currentUser}
                allProducts={data.products}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {/* ==========================================================
              COMPARISON HISTORY VIEW
              ========================================================== */}
          {currentPage === 'history' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              <ComparisonHistory
                currentUser={currentUser}
                allProducts={data.products}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onReopenComparison={(productIds) => {
                  setCompareList(productIds);
                  handleNavigate('compare');
                }}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {/* ==========================================================
              EDITORIAL BLOGS/GUIDES VIEW LISTS / DETAILED PAGE
              ========================================================== */}
          {(currentPage === 'guides_list' || currentPage === 'blogs_list' || currentPage === 'blog' || currentPage === 'guide') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              <BlogSection
                posts={data.posts}
                allProducts={data.products}
                currentPostId={activePostId}
                postTypeFilter={postTypeFilter}
                onNavigateToPost={(id) => handleNavigate('blog', { id })}
                onNavigateToProduct={(id) => handleNavigate('product', { id })}
                onBackToList={() => {
                  setActivePostId(null);
                  setCurrentPage(postTypeFilter === 'guide' ? 'guides_list' : 'blogs_list');
                }}
              />
            </motion.div>
          )}

          {/* ==========================================================
              EXPERT FAQS PAGE VIEW
              ========================================================== */}
          {currentPage === 'faqs' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              <FAQSection faqs={data.faqs} />
            </motion.div>
          )}

          {/* ==========================================================
              ADMIN DASHBOARD HUB VIEW
              ========================================================== */}
          {currentPage === 'admin' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              {isAuthLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4" id="admin-auth-loading">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-amber-750" />
                  <p className="text-slate-500 text-sm font-medium">Verifying credentials...</p>
                </div>
              ) : isAdmin ? (
                <AdminDashboard
                  products={data.products}
                  posts={data.posts}
                  faqs={data.faqs}
                  analyticsEvents={analyticsEvents}
                  starProducts={starProducts}
                  categories={productCategories}
                  onUpdateProducts={handleUpdateProducts}
                  onUpdatePosts={handleUpdatePosts}
                  onUpdateFaqs={handleUpdateFaqs}
                  onUpdateStarProducts={handleUpdateStarProducts}
                  onUpdateCategories={handleUpdateCategories}
                />
              ) : null}
            </motion.div>
          )}

          {/* ==========================================================
              TRUST ELEMENT VIEW: ABOUT US
              ========================================================== */}
          {currentPage === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-6"
            >
              <h1 className="font-display text-3xl font-extrabold text-slate-900">About Our Editorial Team</h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Welcome to <strong className="text-slate-950 font-bold">TechAffiliate Premium</strong>, a completely independent hardware analysis collective established in 2026. 
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We believe that the consumer electronics review ecosystem has been severely broken by paid corporate sponsorships, undisclosed brand placements, and marketing buzzwords. Our goal is simple: to provide objective, mathematical specification audits, honest physical testing benchmarks, and explicit "who should avoid" guides so that you can make the absolute best choices for your budget and workflow.
              </p>
              <div className="rounded-2xl bg-blue-50/50 p-6 border border-blue-100">
                <h3 className="font-display font-bold text-blue-900 text-base mb-2">Our Testing Philosophy</h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  We buy most of the products we review ourselves, or borrow them from retail partners without accepting alterations to our editorial scoring. If a headphone leaks sound, we say so. If a premium adventure smartwatch has bulk issues on slender wrists, we highlight it. We value the trust of our readers above all else.
                </p>
              </div>
            </motion.div>
          )}

          {/* ==========================================================
              TRUST ELEMENT VIEW: CONTACT US
              ========================================================== */}
          {currentPage === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8"
              id="contact-page-view"
            >
              <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  Contact Our Editorial Desk
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mb-6">
                  Have a correction, feedback on our comparison charts, or a specific gadget suggestion you want us to audit next? Get in touch below.
                </p>

                {contactSuccess ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-center text-emerald-800 space-y-2">
                    <Check className="h-8 w-8 mx-auto text-emerald-500" />
                    <h4 className="font-bold">Message Dispatched Successfully</h4>
                    <p className="text-xs">
                      Thank you for contacting us! An editorial support staff member will respond to your inquiry within 24 business hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4" id="contact-form">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Name</label>
                      <input
                        type="text" required
                        value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                        placeholder="e.g. David Miller"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Professional Email</label>
                      <input
                        type="email" required
                        value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                        placeholder="david@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Message Description</label>
                      <textarea
                        rows={4} required
                        value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                        placeholder="Provide deep details about your feedback or product suggestion..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow"
                    >
                      <span>Send Message</span>
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {/* ==========================================================
              TRUST ELEMENT VIEW: PRIVACY POLICY
              ========================================================== */}
          {currentPage === 'privacy' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-6 text-sm text-slate-600 leading-relaxed"
            >
              <h1 className="font-display text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
              <p>
                <strong>Last Updated: July 10, 2026</strong>
              </p>
              <p>
                At TechAffiliate Premium, we respect your privacy and are committed to safeguarding any personal data you share with us. This Privacy Policy outlines what information we track, why we collect it, and how we handle cookies, browser cache, and affiliate referral sessions safely.
              </p>
              <h3 className="font-display font-bold text-slate-900 text-base mt-6">1. Information We Collect</h3>
              <p>
                We collect non-personal analytics telemetry including page views, click behaviors on affiliate links, specific search queries inside our database, and estimated reading durations. This data is used strictly to optimize page performance and compute accurate Conversion Rate Optimization (CRO) reports shown in our transparent administrator dashboards. We do not sell or lease user information to third-party advertisers.
              </p>
              <h3 className="font-display font-bold text-slate-900 text-base mt-6">2. Affiliate Partner Cookies</h3>
              <p>
                When you click on purchase referral buttons (such as "Check Price on Amazon" or "Flipkart Deal"), our partner advertising networks deploy a standard, cryptographically safe tracking cookie. This cookie tracks whether you complete a purchase so that we may receive a small commission, at absolutely zero additional charge to you. You may disable cookies inside your browser settings if preferred.
              </p>
            </motion.div>
          )}

          {/* ==========================================================
              TRUST ELEMENT VIEW: TERMS & CONDITIONS
              ========================================================== */}
          {currentPage === 'terms' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-6 text-sm text-slate-600 leading-relaxed"
            >
              <h1 className="font-display text-3xl font-extrabold text-slate-900">Terms of Service</h1>
              <p>
                <strong>Effective Date: July 10, 2026</strong>
              </p>
              <p>
                By accessing, searching, or interacting with the TechAffiliate Premium platform, you agree to comply with and be bound by the following Terms of Service. If you do not accept these guidelines, please stop using our review and comparison tools immediately.
              </p>
              <h3 className="font-display font-bold text-slate-900 text-base mt-6">1. Intellectual Property</h3>
              <p>
                All review summaries, technical specification matrices, in-depth pros/cons essays, custom sitemap configurations, and graphics are the exclusive property of TechAffiliate Premium. You are strictly forbidden from scraping, redistributing, or copy-pasting our reviews into other online commercial projects without prior written permission.
              </p>
              <h3 className="font-display font-bold text-slate-900 text-base mt-6">2. Limitation of Liability</h3>
              <p>
                While we make every effort to verify specification details, pricing models, and coupon validity, all content is published "as is". We are not responsible for pricing shifts on Amazon or Flipkart, product out-of-stock events, or technical failures occurring during your checkout sessions on respective merchant channels.
              </p>
            </motion.div>
          )}

          {/* ==========================================================
              TRUST ELEMENT VIEW: AFFILIATE DISCLOSURE
              ========================================================== */}
          {currentPage === 'disclosure' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-6 text-sm text-slate-600 leading-relaxed"
              id="disclosure-page-view"
            >
              <h1 className="font-display text-3xl font-extrabold text-slate-900">Affiliate Advertising Disclosure</h1>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/10 p-6 space-y-4">
                <p className="font-medium text-slate-800">
                  Transparency and honesty are the foundation of our connection with our readers.
                </p>
                <p>
                  We are a professional, independent tech evaluation platform. In compliance with Federal Trade Commission (FTC) guidelines, please be advised that several of the product listings, buying comparisons, and sitemap reference links on this website contain custom affiliate tracking URLs (including Amazon Associates, Flipkart Affiliate Network, and EarnKaro).
                </p>
                <p>
                  This means that if you click on one of our recommendation buttons and complete a transaction on the merchant page, we receive a small referral bounty from that company. This transaction occurs at <strong className="text-slate-900 font-bold">no extra cost to you</strong>.
                </p>
                <p>
                  Crucially, this financial setup does not alter our editorial integrity. We do not accept bribes, sponsored content overrides, or paid ratings boost proposals. If a product fails to deliver on its specifications during our testing, we highlight those defects clearly in the "Cons" and "Who should avoid" tables.
                </p>
              </div>
            </motion.div>
          )}

          {/* ==========================================================
              TRUST ELEMENT VIEW: LEGAL DISCLAIMER
              ========================================================== */}
          {currentPage === 'disclaimer' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-6 text-sm text-slate-600 leading-relaxed"
            >
              <h1 className="font-display text-3xl font-extrabold text-slate-900">Legal & Technical Disclaimer</h1>
              <p>
                The information, technical specifications, and purchase recommendations displayed on TechAffiliate Premium are for informational and educational purposes only.
              </p>
              <p>
                <strong>Battery & Audio Decibel Safety:</strong> Our evaluations of active noise-cancelling (ANC) headphones and wireless earpieces measure acoustics based on standard consumer equipment. Listeners must refrain from operating headphones at maximum volume levels to avoid permanent ear canal strain.
              </p>
              <p>
                <strong>Rugged Wearables Disclaimer:</strong> Smartwatch depth limits (such as water-resistance to 100 meters on the Apple Watch Ultra 2) are verified in laboratory environments. Recreational diving or alpine mountaineering must always be accompanied by certified equipment and physical backup devices; do not rely solely on consumer smartwatches during hazardous operations.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Large Premium Newsletter Section before the footer */}
      <LargeNewsletterSection />

      {/* Footer component */}
      <Footer onNavigate={handleNavigate} onReplayWelcome={handleReplayWelcome} />

      {/* Compact Scroll Banner (at 60% scroll) & Exit Intent Popup */}
      <CompactScrollBanner />
      <ExitIntentPopup />

      {/* Sticky Mobile CTA button (CRO Optimized for mobile) */}
      <AnimatePresence>
        {currentPage === 'product' && activeProductId && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="sm:hidden fixed bottom-4 left-4 right-4 z-40"
          >
            {(() => {
              const prod = data.products.find(p => p.id === activeProductId);
              if (!prod) return null;
              return (
                <div className="rounded-2xl bg-white p-3.5 shadow-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <img src={prod.images[0]} alt={prod.brand} className="h-9 w-9 rounded-lg object-cover bg-slate-50 shrink-0" />
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-slate-900 line-clamp-1">{prod.title}</h4>
                      <p className="font-mono text-[10px] font-bold text-blue-600">${prod.price}</p>
                    </div>
                  </div>
                  <a
                    href={prod.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleAffiliateClick(prod.id, 'amazon', prod.amazonUrl || '', e)}
                    className="rounded-xl bg-amber-400 hover:bg-amber-500 px-4 py-2 text-center text-xs font-bold text-slate-950 flex items-center space-x-1 shrink-0 shadow-sm"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Buy Now</span>
                  </a>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess}
        initialIsSignUp={authModalSignUp}
      />

      {/* Shopping Bag Drawer (Amazon/Myntra style) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onAffiliateClick={handleAffiliateClick}
      />

      {/* Premium Welcome Experience */}
      <AnimatePresence>
        {showWelcome && (
          <PremiumWelcome onComplete={handleWelcomeComplete} />
        )}
      </AnimatePresence>

    </div>
  );
}
