import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getWatchlistFromFirestore, saveWatchlistItemToFirestore, deleteWatchlistItemFromFirestore } from '../lib/firebase';
import { 
  Bookmark, Bell, Trash2, Tag, ShoppingCart, ArrowLeftRight, ChevronRight, AlertCircle, Sparkles, CheckCircle, Smartphone
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
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Load watchlist items
  useEffect(() => {
    async function fetchWatchlist() {
      setLoading(true);
      try {
        let items: any[] = [];
        if (currentUser) {
          const cloudItems = await getWatchlistFromFirestore();
          // Filter for current user
          items = cloudItems.filter(item => item.userId === currentUser.uid);
        } else {
          // Fallback to local storage
          const localSaved = localStorage.getItem('alankapriya_watchlist') || '[]';
          items = JSON.parse(localSaved);
        }
        setWatchlistItems(items);
      } catch (err) {
        console.error("Failed to load watchlist:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlist();
  }, [currentUser]);

  // Handle setting/saving target price
  const handleUpdateTargetPrice = async (itemId: string, newPrice: number) => {
    setWatchlistItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, targetPrice: newPrice };
        // Save to Firestore / local storage asynchronously
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
    
    setToast("✓ Target Price updated successfully.");
    setTimeout(() => setToast(null), 3000);
  };

  // Handle toggling notifications
  const handleToggleNotifications = async (itemId: string) => {
    setWatchlistItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, notificationsEnabled: !item.notificationsEnabled };
        // Save to Firestore / local storage asynchronously
        if (currentUser) {
          saveWatchlistItemToFirestore(updated).catch(err => console.error(err));
        } else {
          const local = localStorage.getItem('alankapriya_watchlist') || '[]';
          const list = JSON.parse(local).map((x: any) => x.id === itemId ? updated : x);
          localStorage.setItem('alankapriya_watchlist', JSON.stringify(list));
        }
        setToast(updated.notificationsEnabled ? "🔔 Alerts activated for this product!" : "🔕 Alerts muted.");
        setTimeout(() => setToast(null), 3000);
        return updated;
      }
      return item;
    }));
  };

  // Handle removing a watched item
  const handleRemove = async (itemId: string) => {
    setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
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

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
          <p className="text-stone-500 font-mono text-xs uppercase tracking-wider">Syncing your personal watchlist archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 select-none" id="watchlist-section-root">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-stone-900 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-4 py-2.5 rounded-xl shadow-xl z-50 border border-stone-800"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-200/50 gap-4 mb-8">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-amber-700 uppercase font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/30">
            Real-time Smart Alerts
          </span>
          <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 mt-2">
            My Product Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">
            Set custom target purchase prices, configure direct price drop alerts, and track historical discounts.
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors shadow-sm cursor-pointer"
        >
          Explore Curation
        </button>
      </div>

      {/* Main Container */}
      {watchlistItems.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-600 mb-6 border border-stone-100">
            <Bookmark className="h-5 w-5 text-stone-400 stroke-[1.5]" />
          </div>
          <h2 className="font-display text-lg font-bold text-stone-900 tracking-tight">
            Watchlist is Empty
          </h2>
          <p className="text-stone-500 text-xs mt-1.5 leading-relaxed font-light">
            You are not tracking any products yet. Browse through our curation or use the AI Finder to add items to your watchlist.
          </p>
          <div className="pt-6">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline"
            >
              <span>Explore Products</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!currentUser && (
            <div className="bg-amber-50/40 border border-amber-200/40 rounded-2xl p-4 flex items-start space-x-3 text-left">
              <AlertCircle className="h-5 w-5 text-amber-850 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide font-mono">Guest Watchlist Enabled</h4>
                <p className="text-[11px] text-stone-600 font-light mt-0.5 leading-relaxed">
                  Your tracked targets are saved locally. <button onClick={onOpenAuth} className="font-bold text-amber-800 hover:underline">Create a permanent free account</button> to enable secure cloud sync and receive direct price notification updates.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4" id="watchlist-items-grid">
            {watchlistItems.map((item) => {
              const prod = allProducts.find(p => p.id === item.productId);
              if (!prod) return null;

              const isCompared = compareList.includes(prod.id);
              const hasDropped = prod.price <= item.targetPrice;

              return (
                <motion.div
                  key={item.id}
                  layoutId={`watchlist-card-${item.id}`}
                  className="bg-white border border-stone-200 hover:border-stone-300 rounded-3xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-2xl object-cover border border-stone-100 bg-white p-1 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-800">{prod.brand}</span>
                        <span className="text-[10px] font-mono font-medium text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full">{prod.category}</span>
                      </div>
                      <h3 className="font-display font-black text-sm text-stone-900 mt-1 line-clamp-1 max-w-[320px]">
                        {prod.title}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="font-sans font-extrabold text-stone-900 text-sm">₹{prod.price.toLocaleString()}</span>
                        {hasDropped ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/30 flex items-center space-x-1 animate-pulse">
                            <CheckCircle className="h-3 w-3" />
                            <span>Price Target Met!</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-light font-mono">Current Market Price</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto shrink-0 border-t border-stone-100 md:border-t-0 pt-4 md:pt-0">
                    <div className="flex flex-col space-y-1.5 w-full sm:w-36">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">Target Price (₹)</label>
                      <input
                        type="number"
                        value={item.targetPrice}
                        onChange={(e) => handleUpdateTargetPrice(item.id, Number(e.target.value))}
                        className="rounded-xl border border-stone-200 bg-stone-50/50 py-1.5 px-3 text-xs text-stone-800 outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-100 font-mono"
                        placeholder="Target Price"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5 shrink-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono">Alert Status</span>
                      <button
                        onClick={() => handleToggleNotifications(item.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                          item.notificationsEnabled
                            ? 'bg-amber-500/10 border-amber-400/40 text-amber-900 shadow-inner'
                            : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        <Bell className={`h-3.5 w-3.5 ${item.notificationsEnabled ? 'fill-amber-500 text-amber-600 animate-swing' : ''}`} />
                        <span>{item.notificationsEnabled ? 'Alerts On' : 'Alerts Off'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                      <button
                        onClick={() => onToggleCompare(prod.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isCompared 
                            ? 'bg-amber-50 border-amber-200 text-amber-800' 
                            : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                        }`}
                        title="Compare Product"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </button>

                      <a
                        href={prod.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono uppercase font-bold tracking-wider py-2.5 px-4 shadow-sm cursor-pointer"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Buy</span>
                      </a>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2.5 rounded-xl border border-stone-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                        title="Remove tracking"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
