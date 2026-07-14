import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getPriceHistoryFromFirestore, getWatchlistFromFirestore } from '../lib/firebase';
import { 
  TrendingDown, Search, ArrowUpRight, ArrowDownRight, Tag, Bookmark, 
  ShoppingCart, Calendar, Sparkles, AlertCircle, ShoppingBag, BellRing
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface PriceTrackerSectionProps {
  currentUser: any;
  allProducts: Product[];
  onOpenAuth: () => void;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export default function PriceTrackerSection({
  currentUser,
  allProducts,
  onOpenAuth,
  onNavigate
}: PriceTrackerSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [priceHistoryData, setPriceHistoryData] = useState<any[]>([]);

  // Fetch watchlist to know what's actively tracked and loaded prices
  useEffect(() => {
    async function loadTrackerData() {
      setLoading(true);
      try {
        let watchedIds: string[] = [];
        if (currentUser) {
          const wl = await getWatchlistFromFirestore();
          watchedIds = wl.filter(x => x.userId === currentUser.uid).map(x => x.productId);
        } else {
          const local = localStorage.getItem('alankapriya_watchlist') || '[]';
          watchedIds = JSON.parse(local).map((x: any) => x.productId);
        }
        setWatchlistIds(watchedIds);

        // Pre-select the first product or first watched product
        if (watchedIds.length > 0) {
          const firstWatched = allProducts.find(p => watchedIds.includes(p.id));
          if (firstWatched) {
            setSelectedProduct(firstWatched);
          } else {
            setSelectedProduct(allProducts[0] || null);
          }
        } else {
          setSelectedProduct(allProducts[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTrackerData();
  }, [currentUser, allProducts]);

  // Generate mock price history based on original price to populate recharts AreaChart
  useEffect(() => {
    if (!selectedProduct) return;

    // Simulate 6-month price timeline
    const basePrice = selectedProduct.price;
    const history = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    
    // Deterministic price swings based on product ID characters to keep it consistent
    const seed = selectedProduct.id.charCodeAt(0) || 10;
    
    for (let i = 0; i < months.length; i++) {
      let variance = 0;
      if (i === 1) variance = -0.05; // 5% drop
      if (i === 3) variance = -0.12; // 12% drop (Deals!)
      if (i === 4) variance = +0.02; // slight raise
      if (i === 5) variance = -0.08; // drop
      if (i === 6) variance = 0; // current
      
      // Let's add a minor deterministic fluctuation
      const fluctuation = ((seed + i) % 5 - 2) * 0.01;
      const calculatedPrice = Math.round(basePrice * (1 + variance + fluctuation));

      history.push({
        month: months[i],
        Price: calculatedPrice,
        Original: basePrice
      });
    }

    setPriceHistoryData(history);
  }, [selectedProduct]);

  // Calculate highest, lowest, average price
  const prices = priceHistoryData.map(d => d.Price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const currentPrice = selectedProduct?.price || 0;
  const totalDropAmount = maxPrice - currentPrice;
  const dropPercent = maxPrice ? Math.round((totalDropAmount / maxPrice) * 100) : 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
          <p className="text-stone-500 font-mono text-xs uppercase tracking-wider">Compiling price history indexes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 select-none" id="price-tracker-section-root">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-200/50 gap-4 mb-8">
        <div>
          <span className="font-mono text-[10px] tracking-widest text-amber-700 uppercase font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/30">
            Market Analytics
          </span>
          <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 mt-2">
            AI Price Tracker
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">
            Monitor product market variations, view 6-month historical trends, and see optimal buying windows.
          </p>
        </div>
        <button
          onClick={() => onNavigate('watchlist')}
          className="rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors shadow-sm cursor-pointer"
        >
          Manage Alerts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Product Selector list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-400">Products Catalog</h3>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {allProducts.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              const isTracked = watchlistIds.includes(p.id);

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center space-x-3.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500/[0.04] border-amber-500/35 shadow-sm' 
                      : 'bg-white border-stone-200 hover:bg-stone-50/50'
                  }`}
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="h-11 w-11 rounded-xl object-cover border border-stone-100 bg-white p-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-stone-400 font-bold block">{p.brand}</span>
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-stone-900' : 'text-stone-700'}`}>{p.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-bold text-xs text-stone-900">₹{p.price.toLocaleString()}</span>
                      {isTracked && (
                        <span className="text-[8px] font-bold font-mono uppercase text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/30">
                          Active alert
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Chart & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProduct ? (
            <div className="space-y-6">
              {/* Product header & metrics cards */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-2xl object-cover border border-stone-100 p-1 bg-white shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest">{selectedProduct.brand}</span>
                    <h2 className="font-display font-black text-lg text-stone-900 mt-0.5">{selectedProduct.title}</h2>
                    <p className="text-stone-400 text-xs font-light mt-0.5 font-mono">{selectedProduct.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 justify-end shrink-0">
                  <a
                    href={selectedProduct.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono uppercase font-bold tracking-wider py-2.5 px-4 shadow-sm cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Buy Now</span>
                  </a>
                </div>
              </div>

              {/* Price Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200 rounded-2xl p-4 text-left shadow-sm">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">Current Price</span>
                  <p className="text-xl font-black text-stone-900 mt-1 font-sans">₹{currentPrice.toLocaleString()}</p>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-4 text-left shadow-sm">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">Historical Low</span>
                  <p className="text-xl font-black text-emerald-700 mt-1 font-sans flex items-baseline gap-1">
                    ₹{minPrice.toLocaleString()}
                    <ArrowDownRight className="h-3.5 w-3.5 stroke-[3] text-emerald-600 shrink-0 self-center" />
                  </p>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-4 text-left shadow-sm">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">Historical High</span>
                  <p className="text-xl font-black text-rose-700 mt-1 font-sans flex items-baseline gap-1">
                    ₹{maxPrice.toLocaleString()}
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[3] text-rose-600 shrink-0 self-center" />
                  </p>
                </div>

                <div className="bg-[#1c1917] text-[#faf9f6] rounded-2xl p-4 text-left shadow-md flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">Max Discount</span>
                  <p className="text-2xl font-black mt-1 text-amber-500">{dropPercent}% OFF</p>
                </div>
              </div>

              {/* Chart container */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm text-left">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                  <div>
                    <h3 className="font-display font-black text-sm text-stone-900">Price Variation Chart</h3>
                    <p className="text-[11px] text-stone-400 font-light mt-0.5">Showing 6-month product marketplace timeline</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
                    Best buying window: April
                  </span>
                </div>

                {/* Area Chart */}
                <div className="h-64 w-full" id="price-history-chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={priceHistoryData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#78716c" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#78716c" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1c1917', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#faf9f6',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Price" 
                        stroke="#d97706" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#priceGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center shadow-sm">
              <TrendingDown className="h-10 w-10 text-stone-300 mx-auto animate-pulse mb-4" />
              <h3 className="font-display font-bold text-stone-900">No Product Selected</h3>
              <p className="text-stone-500 text-xs mt-1.5 font-light">Select a product from the catalog on the left to review price timeline variations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
