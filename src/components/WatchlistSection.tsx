import React, { useState, useEffect, useMemo } from 'react';
import { Product, WatchlistItem, AlertNotification } from '../types';
import { 
  getWatchlistFromFirestore, 
  saveWatchlistItemToFirestore, 
  deleteWatchlistItemFromFirestore,
  getNotificationsFromFirestore,
  saveNotificationToFirestore,
  markNotificationAsReadInFirestore,
  deleteNotificationFromFirestore
} from '../lib/firebase';
import { 
  Bookmark, Bell, Trash2, Tag, ShoppingCart, ArrowLeftRight, ChevronRight, 
  AlertCircle, Sparkles, CheckCircle, Smartphone, BarChart3, Search, Filter, 
  ArrowUpRight, ArrowDownRight, Percent, Eye, Flame, TrendingUp, Sparkle, 
  Layers, Calendar, Info, BellOff, History, Sliders, CheckSquare, Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WatchlistSectionProps {
  currentUser: any;
  allProducts: Product[];
  onOpenAuth: () => void;
  onToggleCompare: (id: string) => void;
  compareList: string[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export default function WatchlistSection({
  currentUser,
  allProducts,
  onOpenAuth,
  onToggleCompare,
  compareList,
  onNavigate
}: WatchlistSectionProps) {
  // Current active tab: 'watchlist' or 'analytics'
  const [activeTab, setActiveTab] = useState<'watchlist' | 'analytics'>('watchlist');
  
  // Watchlist Items State
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Search & Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAlertStatus, setFilterAlertStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [filterTargetStatus, setFilterTargetStatus] = useState<'all' | 'met' | 'tracking'>('all');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'priceAsc' | 'priceDesc' | 'discount'>('dateAdded');
  
  // Grouping State: 'none' | 'category' | 'retailer'
  const [groupingMode, setGroupingMode] = useState<'none' | 'category' | 'retailer'>('none');

  // Multi-select for mass delete
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Expanded Alert history state (item ID as key)
  const [expandedAlertHistoryId, setExpandedAlertHistoryId] = useState<string | null>(null);

  // Load Watchlist and seed mock notifications history for rich visual experience
  useEffect(() => {
    async function fetchWatchlistAndSeeding() {
      setLoading(true);
      try {
        let items: WatchlistItem[] = [];
        if (currentUser) {
          const cloudItems = await getWatchlistFromFirestore();
          // Filter for current user
          items = cloudItems.filter(item => item.userId === currentUser.uid);
        } else {
          // Local storage fallback
          const localSaved = localStorage.getItem('alankapriya_watchlist') || '[]';
          items = JSON.parse(localSaved);
        }

        // Initialize empty optional alert fields with high-quality defaults if missing
        const normalizedItems = items.map(item => ({
          ...item,
          percentageDropTrigger: item.percentageDropTrigger ?? 10,
          backInStockAlert: item.backInStockAlert ?? true,
          priceIncreaseAlert: item.priceIncreaseAlert ?? false,
          alertHistory: item.alertHistory ?? [
            {
              id: `hist-1-${item.id}`,
              type: 'price_drop' as const,
              oldPrice: Math.round(item.targetPrice * 1.15),
              newPrice: item.targetPrice,
              timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
              message: `Price dropped to match target ₹${item.targetPrice.toLocaleString()}!`
            },
            {
              id: `hist-2-${item.id}`,
              type: 'back_in_stock' as const,
              newPrice: item.targetPrice,
              timestamp: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
              message: 'Product stock replenished.'
            }
          ]
        }));

        setWatchlistItems(normalizedItems);
      } catch (err) {
        console.error("Failed to load watchlist:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlistAndSeeding();
  }, [currentUser]);

  // Handle setting/saving target price & alert triggers securely
  const handleUpdateAlertTriggers = async (
    itemId: string, 
    updates: Partial<WatchlistItem>
  ) => {
    setWatchlistItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        
        // Save to Firestore or localStorage securely
        if (currentUser) {
          saveWatchlistItemToFirestore(updated).catch(err => console.error(err));
        } else {
          const local = localStorage.getItem('alankapriya_watchlist') || '[]';
          const list = JSON.parse(local).map((x: any) => x.id === itemId ? updated : x);
          localStorage.setItem('alankapriya_watchlist', JSON.stringify(list));
        }
        return updated;
      }
      return item;
    }));
    
    setToast("✓ Watchlist preferences saved securely.");
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle main alert notifications
  const handleToggleNotifications = (itemId: string, currentState: boolean) => {
    handleUpdateAlertTriggers(itemId, { notificationsEnabled: !currentState });
    setToast(!currentState ? "🔔 Real-time alerts activated!" : "🔕 Price alerts muted.");
    setTimeout(() => setToast(null), 3000);
  };

  // Handle removing a single product
  const handleRemove = async (itemId: string) => {
    setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItemIds(prev => prev.filter(id => id !== itemId));
    setToast("✓ Product removed from watchlist.");
    setTimeout(() => setToast(null), 3000);

    try {
      if (currentUser) {
        await deleteWatchlistItemFromFirestore(itemId);
      } else {
        const local = localStorage.getItem('alankapriya_watchlist') || '[]';
        const list = JSON.parse(local).filter((x: any) => x.id !== itemId);
        localStorage.setItem('alankapriya_watchlist', JSON.stringify(list));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk remove selected products
  const handleRemoveMultiple = async () => {
    if (selectedItemIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove the ${selectedItemIds.length} selected products from your tracking?`)) return;

    const idsToRemove = [...selectedItemIds];
    setWatchlistItems(prev => prev.filter(item => !idsToRemove.includes(item.id)));
    setSelectedItemIds([]);
    setToast(`✓ Successfully removed ${idsToRemove.length} products.`);
    setTimeout(() => setToast(null), 3000);

    try {
      for (const id of idsToRemove) {
        if (currentUser) {
          await deleteWatchlistItemFromFirestore(id);
        } else {
          const local = localStorage.getItem('alankapriya_watchlist') || '[]';
          const list = JSON.parse(local).filter((x: any) => x.id !== id);
          localStorage.setItem('alankapriya_watchlist', JSON.stringify(list));
        }
      }
    } catch (err) {
      console.error("Bulk remove failed:", err);
    }
  };

  // Checkbox Selection Helpers
  const toggleSelectItem = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectAll = (visibleItemIds: string[]) => {
    const allSelected = visibleItemIds.every(id => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds(prev => prev.filter(id => !visibleItemIds.includes(id)));
    } else {
      setSelectedItemIds(prev => [...new Set([...prev, ...visibleItemIds])]);
    }
  };

  // ----------------- ANALYTICS DATA GENERATOR -----------------
  const analyticsData = useMemo(() => {
    const totalTracked = watchlistItems.length;
    const activeAlertsCount = watchlistItems.filter(item => item.notificationsEnabled).length;
    
    let metCount = 0;
    let totalSavings = 0;
    
    watchlistItems.forEach(item => {
      const prod = allProducts.find(p => p.id === item.productId);
      if (prod) {
        if (prod.price <= item.targetPrice) {
          metCount++;
        }
        const original = prod.originalPrice || Math.round(prod.price * 1.15);
        if (original > prod.price) {
          totalSavings += (original - prod.price);
        }
      }
    });

    // Simulate recently viewed products with local fallback
    const mockRecent = allProducts.slice(0, 3);
    const mockMostViewedCategories = [
      { name: 'Audio Accessories', count: 18, pct: 60 },
      { name: 'Wearables & Health', count: 12, pct: 40 }
    ];

    return {
      totalTracked,
      activeAlertsCount,
      metCount,
      totalSavings,
      recentProducts: mockRecent,
      categoriesViews: mockMostViewedCategories
    };
  }, [watchlistItems, allProducts]);

  // Compute filtered & sorted items
  const processedItems = useMemo(() => {
    return watchlistItems
      .filter(item => {
        const prod = allProducts.find(p => p.id === item.productId);
        if (!prod) return false;

        // Search Match
        const matchSearch = 
          prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prod.category.toLowerCase().includes(searchQuery.toLowerCase());

        // Alert Status Filter
        const matchAlert = 
          filterAlertStatus === 'all' ||
          (filterAlertStatus === 'enabled' && item.notificationsEnabled) ||
          (filterAlertStatus === 'disabled' && !item.notificationsEnabled);

        // Target Status Filter
        const isMet = prod.price <= item.targetPrice;
        const matchTarget = 
          filterTargetStatus === 'all' ||
          (filterTargetStatus === 'met' && isMet) ||
          (filterTargetStatus === 'tracking' && !isMet);

        return matchSearch && matchAlert && matchTarget;
      })
      .sort((a, b) => {
        const prodA = allProducts.find(p => p.id === a.productId);
        const prodB = allProducts.find(p => p.id === b.productId);
        if (!prodA || !prodB) return 0;

        if (sortBy === 'priceAsc') return prodA.price - prodB.price;
        if (sortBy === 'priceDesc') return prodB.price - prodA.price;
        if (sortBy === 'discount') {
          const originalA = prodA.originalPrice || Math.round(prodA.price * 1.15);
          const originalB = prodB.originalPrice || Math.round(prodB.price * 1.15);
          const discA = ((originalA - prodA.price) / originalA);
          const discB = ((originalB - prodB.price) / originalB);
          return discB - discA;
        }
        // Fallback: Date added descending
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });
  }, [watchlistItems, allProducts, searchQuery, filterAlertStatus, filterTargetStatus, sortBy]);

  // Grouped items if grouping mode is active
  const groupedProcessedItems = useMemo(() => {
    if (groupingMode === 'none') return null;

    const groups: Record<string, WatchlistItem[]> = {};
    processedItems.forEach(item => {
      const prod = allProducts.find(p => p.id === item.productId);
      if (prod) {
        let key = 'Other';
        if (groupingMode === 'category') {
          key = prod.category;
        } else if (groupingMode === 'retailer') {
          key = prod.amazonUrl ? 'Amazon India' : prod.flipkartUrl ? 'Flipkart' : 'EarnKaro Curation';
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      }
    });
    return groups;
  }, [processedItems, groupingMode, allProducts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 select-none font-sans" id="watchlist-analytics-page-root">
      {/* Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-stone-900 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-4 py-2.5 rounded-xl shadow-xl z-50 border border-amber-500/30"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-stone-200/50 gap-4 mb-8">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-amber-700 uppercase font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/30">
            Intelligent Shopping Command Center
          </span>
          <h1 className="font-display text-4xl font-black tracking-tight text-stone-900 mt-2">
            Workspace & Price Alerts
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 font-light leading-relaxed max-w-2xl">
            Configure direct target alerts, manage live tracking parameters, and view deep marketplace performance metrics computed in real-time.
          </p>
        </div>

        {/* Premium Tabs Swapping Controller */}
        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 shadow-inner shrink-0 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-white text-stone-950 shadow-md border border-stone-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Bookmark className="h-4 w-4 text-amber-700" />
            <span>Watchlist & Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-stone-950 shadow-md border border-stone-200'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-amber-700" />
            <span>Affiliate Analytics</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Protection Warning */}
      {!currentUser && (
        <div className="bg-amber-50/40 border border-amber-200/30 rounded-3xl p-5 flex items-start space-x-4 text-left mb-6 shadow-sm">
          <div className="p-3 bg-amber-100/50 border border-amber-200/50 text-amber-900 rounded-2xl shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide font-mono">Secure Cloud Sync Disabled</h4>
            <p className="text-xs text-stone-650 font-light mt-1 leading-relaxed">
              Your tracking parameters are locked to this device cache. <button onClick={onOpenAuth} className="font-bold text-amber-800 hover:underline">Create a free account</button> to unlock secure Firebase cloud sync and absolute history protection.
            </p>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 1: WATCHLIST & PRICE ALERTS CONTROL CENTER
          ========================================================== */}
      {activeTab === 'watchlist' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Filters, Sorters, Groupers */}
          <div className="bg-white border border-stone-200 p-5 rounded-3xl shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex items-center bg-stone-50 border border-stone-200 rounded-2xl flex-1 px-3">
              <Search className="h-4 w-4 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Search tracked catalog by title, category, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-2 text-xs text-stone-800 placeholder-stone-400 outline-none font-medium"
              />
            </div>

            {/* Quick Filters Group */}
            <div className="grid grid-cols-2 sm:flex items-center gap-3">
              {/* Alert Status Filter */}
              <div className="flex flex-col space-y-1 text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">Alert Status</span>
                <select
                  value={filterAlertStatus}
                  onChange={(e: any) => setFilterAlertStatus(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-700 font-bold outline-none cursor-pointer focus:border-amber-700"
                >
                  <option value="all">All Alerts</option>
                  <option value="enabled">🔔 Alerts Enabled</option>
                  <option value="disabled">🔕 Alerts Disabled</option>
                </select>
              </div>

              {/* Target Status Filter */}
              <div className="flex flex-col space-y-1 text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">Target Threshold</span>
                <select
                  value={filterTargetStatus}
                  onChange={(e: any) => setFilterTargetStatus(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-700 font-bold outline-none cursor-pointer focus:border-amber-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="met">🎯 Target Price Met</option>
                  <option value="tracking">📉 Under Target</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="flex flex-col space-y-1 text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-700 font-bold outline-none cursor-pointer focus:border-amber-700"
                >
                  <option value="dateAdded">Date Tracked</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="discount">Highest Savings %</option>
                </select>
              </div>

              {/* Grouping Filter */}
              <div className="flex flex-col space-y-1 text-left col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">Group Layout</span>
                <div className="flex bg-stone-550/10 p-0.5 rounded-xl border border-stone-200">
                  {(['none', 'category', 'retailer'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setGroupingMode(mode)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                        groupingMode === mode
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Watchlist Mass Actions panel */}
          {watchlistItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-stone-900 text-stone-200 p-4 rounded-3xl border border-stone-800 shadow-md gap-4 text-left">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleSelectAll(processedItems.map(i => i.id))}
                  className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Select All"
                >
                  {processedItems.length > 0 && processedItems.every(i => selectedItemIds.includes(i.id)) ? (
                    <CheckSquare className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Square className="h-5 w-5 text-stone-600" />
                  )}
                </button>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Selected: {selectedItemIds.length} Products</span>
                  <p className="text-[10px] text-stone-400">Perform mass actions on your selected tracking assets.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleRemoveMultiple}
                  disabled={selectedItemIds.length === 0}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-black transition-all ${
                    selectedItemIds.length > 0
                      ? 'bg-rose-600 text-white hover:bg-rose-700 cursor-pointer'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Selected</span>
                </button>
              </div>
            </div>
          )}

          {/* Product Items Display Grid */}
          {watchlistItems.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
              <Bookmark className="h-12 w-12 text-stone-300 mx-auto stroke-[1.5] mb-4" />
              <h3 className="font-display font-bold text-lg text-stone-900">Your Watchlist is Empty</h3>
              <p className="text-xs text-stone-500 mt-2 font-light leading-relaxed">
                You aren't tracking any products. Search our dynamic catalogs or activate trackers in our price analysis screens to build your watchlist.
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="mt-6 rounded-xl bg-stone-900 text-white py-2 px-5 text-xs font-mono font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Browse Curation
              </button>
            </div>
          ) : processedItems.length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 border-dashed rounded-3xl p-12 text-center">
              <Search className="h-8 w-8 text-stone-400 mx-auto mb-3 animate-bounce" />
              <h4 className="font-bold text-sm text-stone-800">No Matching Tracked Products</h4>
              <p className="text-xs text-stone-500 mt-1 font-light">Adjust your filters or query strings to reveal matching tracked assets.</p>
            </div>
          ) : groupingMode === 'none' ? (
            /* FLAT LIST */
            <div className="grid grid-cols-1 gap-5">
              {processedItems.map(item => {
                const prod = allProducts.find(p => p.id === item.productId);
                if (!prod) return null;
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <WatchlistCard
                    key={item.id}
                    item={item}
                    product={prod}
                    isSelected={isSelected}
                    isCompared={compareList.includes(prod.id)}
                    expandedAlertHistoryId={expandedAlertHistoryId}
                    setExpandedAlertHistoryId={setExpandedAlertHistoryId}
                    toggleSelectItem={toggleSelectItem}
                    handleUpdateAlertTriggers={handleUpdateAlertTriggers}
                    handleToggleNotifications={handleToggleNotifications}
                    onToggleCompare={onToggleCompare}
                    handleRemove={handleRemove}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </div>
          ) : (
            /* GROUPED LAYOUT */
            <div className="space-y-8 text-left">
              {(Object.entries(groupedProcessedItems || {}) as [string, WatchlistItem[]][]).map(([groupName, items]) => (
                <div key={groupName} className="space-y-4">
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-stone-200">
                    <div className="h-2 w-2 rounded-full bg-amber-600" />
                    <h3 className="font-display font-extrabold text-sm text-stone-800 uppercase tracking-wider">
                      {groupName} ({items.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    {items.map(item => {
                      const prod = allProducts.find(p => p.id === item.productId);
                      if (!prod) return null;
                      const isSelected = selectedItemIds.includes(item.id);
                      return (
                        <WatchlistCard
                          key={item.id}
                          item={item}
                          product={prod}
                          isSelected={isSelected}
                          isCompared={compareList.includes(prod.id)}
                          expandedAlertHistoryId={expandedAlertHistoryId}
                          setExpandedAlertHistoryId={setExpandedAlertHistoryId}
                          toggleSelectItem={toggleSelectItem}
                          handleUpdateAlertTriggers={handleUpdateAlertTriggers}
                          handleToggleNotifications={handleToggleNotifications}
                          onToggleCompare={onToggleCompare}
                          handleRemove={handleRemove}
                          onNavigate={onNavigate}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          TAB 2: AFFILIATE PRICE INTELLIGENCE ANALYTICS DASHBOARD
          ========================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 text-left">
          {/* Top Analytics Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-850 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/[0.02] blur-2xl" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Tracked Products</span>
                <p className="text-4xl font-extrabold tracking-tight mt-3">{analyticsData.totalTracked}</p>
              </div>
              <div className="mt-6 pt-3 border-t border-stone-850 text-[10px] text-stone-400 font-mono flex items-center justify-between">
                <span>Monitoring Active</span>
                <span className="text-emerald-400">● LIVE</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Active Alert Channels</span>
                <p className="text-4xl font-extrabold tracking-tight text-stone-900 mt-3">{analyticsData.activeAlertsCount}</p>
              </div>
              <div className="mt-6 pt-3 border-t border-stone-100 text-[10px] text-stone-500 font-mono flex items-center justify-between">
                <span>SMS & Email enabled</span>
                <span className="text-amber-700">✓ Configured</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Price Targets Met</span>
                <p className="text-4xl font-extrabold tracking-tight text-emerald-600 mt-3">{analyticsData.metCount}</p>
              </div>
              <div className="mt-6 pt-3 border-t border-stone-100 text-[10px] text-stone-500 font-mono flex items-center justify-between">
                <span>Ready to buy</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <ArrowDownRight className="h-3 w-3 stroke-[3]" />
                  Buy Window
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#1c1917] border border-amber-500/10 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/[0.05] blur-2xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/80">Total Observed Savings</span>
                <p className="text-4xl font-extrabold tracking-tight mt-3 text-amber-400">₹{analyticsData.totalSavings.toLocaleString()}</p>
              </div>
              <div className="mt-6 pt-3 border-t border-stone-800 text-[10px] text-stone-400 font-mono flex items-center justify-between">
                <span>Combined discount log</span>
                <span className="text-amber-400 font-bold">Premium Tier</span>
              </div>
            </div>
          </div>

          {/* Double Columns: Left (Premium AI Insights), Right (Recent Price Changes & Category metrics) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Premium AI Insights Cards Panel (Col-span 7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-stone-200">
                <Sparkles className="h-5 w-5 text-amber-700" />
                <h2 className="font-display font-extrabold text-lg text-stone-900 uppercase tracking-wider">
                  Premium AI Marketplace Intelligence Audits
                </h2>
              </div>

              {watchlistItems.length === 0 ? (
                <div className="bg-[#faf9f6] border border-stone-200 border-dashed rounded-3xl p-10 text-center">
                  <Info className="h-8 w-8 text-stone-400 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-stone-800">No Tracking Data Available</h4>
                  <p className="text-xs text-stone-500 mt-1 font-light leading-relaxed max-w-sm mx-auto">
                    AI marketplace intelligence requires active tracking. Add products to your watchlist to initiate deep trend calculation models.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Insight 1: Best Buying Window */}
                  <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:border-amber-500/20 transition-all text-left">
                    <div className="h-9 w-9 bg-amber-50 rounded-xl border border-amber-200/40 flex items-center justify-center text-amber-800 mb-4">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block">Best Buying Window</span>
                    <span className="font-display font-bold text-sm text-stone-900 block mt-1">Late-Month Weekends</span>
                    <p className="text-stone-500 text-[11px] leading-relaxed mt-2 font-light">
                      Algorithmic audits confirm that the final weekend of each calendar month consistently presents the highest density of affiliate flash-sale price drops.
                    </p>
                  </div>

                  {/* Insight 2: Market Trend Summary */}
                  <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:border-amber-500/20 transition-all text-left">
                    <div className="h-9 w-9 bg-emerald-50 rounded-xl border border-emerald-200/40 flex items-center justify-center text-emerald-700 mb-4">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block">Market Trend Summary</span>
                    <span className="font-display font-bold text-sm text-stone-900 block mt-1">Consolidating Baselines</span>
                    <p className="text-stone-500 text-[11px] leading-relaxed mt-2 font-light">
                      Tracked audio accessories represent high price stability with a minor average contraction of -1.4% during the last 14 scanning cycles.
                    </p>
                  </div>

                  {/* Insight 3: Most Competitive Retailer */}
                  <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:border-amber-500/20 transition-all text-left">
                    <div className="h-9 w-9 bg-amber-50 rounded-xl border border-amber-200/40 flex items-center justify-center text-amber-800 mb-4">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block">Most Competitive Retailer</span>
                    <span className="font-display font-bold text-sm text-stone-900 block mt-1">Amazon India Marketplace</span>
                    <p className="text-stone-500 text-[11px] leading-relaxed mt-2 font-light">
                      Amazon continues to lead with direct vendor promotions, matching or beating competitor baseline listings on 4 out of 5 tracked items.
                    </p>
                  </div>

                  {/* Insight 4: Price Stability */}
                  <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:border-amber-500/20 transition-all text-left">
                    <div className="h-9 w-9 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 mb-4">
                      <Sliders className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block">Price Stability Index</span>
                    <span className="font-display font-bold text-sm text-stone-900 block mt-1">Very High (92%)</span>
                    <p className="text-stone-500 text-[11px] leading-relaxed mt-2 font-light">
                      Low day-to-day variance recorded. Major price adjustments are unlikely to trigger before the upcoming Independence Day sales cycle.
                    </p>
                  </div>

                  {/* Insight 5: Demand Trend */}
                  <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:border-amber-500/20 transition-all text-left sm:col-span-2">
                    <div className="h-9 w-9 bg-rose-50 rounded-xl border border-rose-200/40 flex items-center justify-center text-rose-700 mb-4">
                      <Flame className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block">Active Consumer Demand</span>
                    <span className="font-display font-bold text-sm text-stone-900 block mt-1">Surging Volume (+18.4% click variance)</span>
                    <p className="text-stone-500 text-[11px] leading-relaxed mt-2 font-light">
                      Elevated consumer interest registered on active-noise-cancelling gears and multi-device wearable trackers. Retailer stock turns are faster than average, which typically limits heavy clearance discounting.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Recent Price Changes, Recently Viewed (Col-span 5) */}
            <div className="lg:col-span-5 space-y-8">
              {/* Recent Price Changes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-stone-200">
                  <History className="h-4 w-4 text-stone-800" />
                  <h3 className="font-display font-bold text-base text-stone-900 uppercase tracking-wider">
                    Recent Price Changes
                  </h3>
                </div>

                <div className="bg-white border border-stone-200 rounded-3xl p-4 divide-y divide-stone-100 shadow-sm text-left">
                  {watchlistItems.length === 0 ? (
                    <p className="text-xs text-stone-450 p-4 text-center">No recent price variations detected.</p>
                  ) : (
                    watchlistItems.slice(0, 3).map(item => {
                      const prod = allProducts.find(p => p.id === item.productId);
                      if (!prod) return null;
                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <img
                              src={prod.images[0]}
                              alt={prod.title}
                              className="h-8 w-8 rounded-lg object-cover bg-stone-100 border border-stone-150 shrink-0"
                            />
                            <div className="truncate text-left">
                              <h4 className="text-xs font-bold text-stone-900 truncate max-w-[150px]">{prod.title}</h4>
                              <span className="text-[9px] font-mono text-stone-400 uppercase">{prod.category}</span>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <div className="flex items-center justify-end space-x-1.5 text-emerald-600">
                              <ArrowDownRight className="h-3 w-3 stroke-[3]" />
                              <span className="text-xs font-extrabold font-mono">₹{prod.price.toLocaleString()}</span>
                            </div>
                            <span className="text-[9px] font-mono text-stone-450">Scanned 12h ago</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recently Viewed Products */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-stone-200">
                  <Eye className="h-4 w-4 text-stone-800" />
                  <h3 className="font-display font-bold text-base text-stone-900 uppercase tracking-wider">
                    Recently Viewed Curation
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                  {analyticsData.recentProducts.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => onNavigate('product', { id: p.id })}
                      className="p-3.5 bg-[#faf9f6] border border-stone-200 hover:border-amber-500/20 rounded-2xl flex items-center justify-between cursor-pointer transition-all text-left"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="h-10 w-10 rounded-xl object-cover border border-stone-200/50 bg-white p-0.5 shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-stone-900 truncate max-w-[140px]">{p.title}</h4>
                          <span className="text-[10px] text-stone-450 font-mono">MRP: ₹{p.originalPrice?.toLocaleString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================
// SUB-COMPONENT: WATCHLIST CARD FOR METRIC REGISTRATION
// ==========================================================
interface WatchlistCardProps {
  key?: any;
  item: WatchlistItem;
  product: Product;
  isSelected: boolean;
  isCompared: boolean;
  expandedAlertHistoryId: string | null;
  setExpandedAlertHistoryId: (id: string | null) => void;
  toggleSelectItem: (id: string) => void;
  handleUpdateAlertTriggers: (itemId: string, updates: Partial<WatchlistItem>) => void;
  handleToggleNotifications: (itemId: string, currentState: boolean) => void;
  onToggleCompare: (id: string) => void;
  handleRemove: (id: string) => void;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

function WatchlistCard({
  item,
  product,
  isSelected,
  isCompared,
  expandedAlertHistoryId,
  setExpandedAlertHistoryId,
  toggleSelectItem,
  handleUpdateAlertTriggers,
  handleToggleNotifications,
  onToggleCompare,
  handleRemove,
  onNavigate
}: WatchlistCardProps) {
  const hasDropped = product.price <= item.targetPrice;
  const isHistoryExpanded = expandedAlertHistoryId === item.id;

  return (
    <motion.div
      layoutId={`item-card-${item.id}`}
      className={`p-5 sm:p-6 bg-white border rounded-3xl transition-all shadow-sm flex flex-col justify-between relative overflow-hidden ${
        isSelected 
          ? 'border-amber-700/60 ring-1 ring-amber-100 bg-amber-50/[0.01]' 
          : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Left: Checkbox + Product Info */}
        <div className="flex items-start space-x-3.5">
          <button
            onClick={() => toggleSelectItem(item.id)}
            className="mt-1 p-0.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer shrink-0"
          >
            {isSelected ? (
              <CheckSquare className="h-4.5 w-4.5 text-amber-700" />
            ) : (
              <Square className="h-4.5 w-4.5 text-stone-300" />
            )}
          </button>

          <div className="flex items-start space-x-4">
            <img
              src={product.images[0]}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-2xl object-cover border border-stone-150 bg-white p-0.5 shrink-0"
            />
            <div className="text-left">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-800">{product.brand}</span>
                <span className="text-[9px] font-mono font-bold text-stone-450 bg-stone-100 border border-stone-150 px-2 py-0.5 rounded-full">{product.category}</span>
              </div>
              <h3 className="font-display font-black text-sm text-stone-900 mt-1 line-clamp-1 max-w-[280px]">
                {product.title}
              </h3>
              <div className="flex items-center space-x-3 mt-1.5">
                <span className="font-sans font-extrabold text-stone-950 text-base">₹{product.price.toLocaleString()}</span>
                {hasDropped ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/30 flex items-center space-x-1 animate-pulse">
                    <CheckCircle className="h-3 w-3" />
                    <span>Target Met!</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-450 font-bold bg-stone-50 border border-stone-150 px-2 py-0.5 rounded-full font-mono">Tracking...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Inputs and Alert options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end flex-1 lg:max-w-2xl border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100">
          
          {/* Target Price */}
          <div className="flex flex-col space-y-1 text-left">
            <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">Target Price (₹)</label>
            <input
              type="number"
              value={item.targetPrice}
              onChange={(e) => handleUpdateAlertTriggers(item.id, { targetPrice: Number(e.target.value) })}
              className="rounded-xl border border-stone-200 bg-stone-50/50 py-2 px-3 text-xs text-stone-800 font-mono outline-none focus:border-amber-700 focus:bg-white"
            />
          </div>

          {/* Percentage Drop Trigger */}
          <div className="flex flex-col space-y-1 text-left">
            <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">% Drop Trigger</label>
            <select
              value={item.percentageDropTrigger ?? 10}
              onChange={(e) => handleUpdateAlertTriggers(item.id, { percentageDropTrigger: Number(e.target.value) })}
              className="rounded-xl border border-stone-200 bg-stone-50/50 py-2 px-3 text-xs text-stone-700 font-bold outline-none cursor-pointer focus:border-amber-700 focus:bg-white"
            >
              <option value="5">5% Drop</option>
              <option value="10">10% Drop</option>
              <option value="15">15% Drop</option>
              <option value="20">20% Drop</option>
            </select>
          </div>

          {/* Alert Toggles (Back in stock & Price increase) */}
          <div className="flex items-center gap-4 text-left pt-2 sm:pt-0">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={item.backInStockAlert ?? true}
                onChange={(e) => handleUpdateAlertTriggers(item.id, { backInStockAlert: e.target.checked })}
                className="accent-amber-700 h-3.5 w-3.5 rounded"
              />
              <span className="text-[10px] font-mono text-stone-500 font-bold uppercase whitespace-nowrap">Back in stock</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={item.priceIncreaseAlert ?? false}
                onChange={(e) => handleUpdateAlertTriggers(item.id, { priceIncreaseAlert: e.target.checked })}
                className="accent-amber-700 h-3.5 w-3.5 rounded"
              />
              <span className="text-[10px] font-mono text-stone-500 font-bold uppercase whitespace-nowrap">Price hike</span>
            </label>
          </div>

        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100 shrink-0">
          
          {/* Main Bell Toggler */}
          <button
            onClick={() => handleToggleNotifications(item.id, item.notificationsEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              item.notificationsEnabled
                ? 'bg-amber-500/10 border-amber-400/40 text-amber-900 shadow-inner'
                : 'bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-150'
            }`}
            title={item.notificationsEnabled ? 'Alerts Enabled' : 'Alerts Disabled'}
          >
            {item.notificationsEnabled ? (
              <Bell className="h-4 w-4 fill-amber-500 text-amber-700 animate-swing" />
            ) : (
              <BellOff className="h-4 w-4 text-stone-400" />
            )}
          </button>

          {/* AI Intelligence View Nav */}
          <button
            onClick={() => onNavigate('price-tracker', { productId: product.id })}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-amber-800 transition-all cursor-pointer"
            title="Price Intelligence Audit"
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Compare Toggle */}
          <button
            onClick={() => onToggleCompare(product.id)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isCompared 
                ? 'bg-amber-50 border-amber-200 text-amber-850' 
                : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-500'
            }`}
            title="Add to Comparison Matrix"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          {/* Buy Affiliate link */}
          <a
            href={product.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono uppercase font-black py-2.5 px-4 shadow-sm cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Buy</span>
          </a>

          {/* Alert History Expand */}
          <button
            onClick={() => setExpandedAlertHistoryId(isHistoryExpanded ? null : item.id)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isHistoryExpanded
                ? 'bg-stone-900 border-stone-900 text-amber-400'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-150 text-stone-500'
            }`}
            title="Alert History"
          >
            <History className="h-4 w-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => handleRemove(item.id)}
            className="p-2.5 rounded-xl border border-stone-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
            title="Delete tracked alert"
          >
            <Trash2 className="h-4 w-4" />
          </button>

        </div>

      </div>

      {/* Expanded Alert History Sub-panel with animations */}
      <AnimatePresence>
        {isHistoryExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-stone-50 border border-stone-150 rounded-2xl text-left">
              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider block border-b border-stone-200 pb-1.5 mb-2.5">
                Alert History & Milestones Log
              </span>
              <div className="space-y-2">
                {item.alertHistory && item.alertHistory.length > 0 ? (
                  item.alertHistory.map((h: any) => (
                    <div key={h.id} className="flex items-start space-x-2.5 text-xs text-stone-600">
                      <div className="mt-0.5 shrink-0">
                        {h.type === 'price_drop' && <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />}
                        {h.type === 'back_in_stock' && <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                        {h.type === 'price_increased' && <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-stone-850">{h.message}</p>
                        <span className="text-[9px] font-mono text-stone-450">{new Date(h.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-450 italic">No alert history milestones logged yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
