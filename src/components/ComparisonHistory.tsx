import React, { useState, useEffect } from 'react';
import { Comparison, Product } from '../types';
import { getComparisonsFromFirestore, deleteComparisonFromFirestore } from '../lib/firebase';
import { 
  Clock, ArrowLeftRight, Trash2, Calendar, Award, Sparkles, 
  ExternalLink, LogIn, ChevronRight, AlertCircle, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ComparisonHistoryProps {
  currentUser: any;
  allProducts: Product[];
  onOpenAuth: () => void;
  onReopenComparison: (productIds: string[]) => void;
  onNavigate: (page: string) => void;
}

export default function ComparisonHistory({
  currentUser,
  allProducts,
  onOpenAuth,
  onReopenComparison,
  onNavigate
}: ComparisonHistoryProps) {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  // Load user comparisons
  useEffect(() => {
    async function loadHistory() {
      if (!currentUser) {
        // Try to load from localStorage for guest backup
        try {
          const localSaved = localStorage.getItem('alankapriya_saved_comparisons') || '[]';
          setComparisons(JSON.parse(localSaved));
        } catch (e) {
          setComparisons([]);
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const cloudComps = await getComparisonsFromFirestore(currentUser.uid);
        setComparisons(cloudComps);
      } catch (err) {
        console.error("Failed to load comparisons:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [currentUser]);

  // Handle deleting a comparison
  const handleDelete = async (compId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic UI update
    setComparisons(prev => prev.filter(c => c.id !== compId));
    setToast("✓ Comparison removed from history.");
    setTimeout(() => setToast(null), 3000);

    try {
      if (currentUser) {
        await deleteComparisonFromFirestore(compId);
      } else {
        const localSaved = localStorage.getItem('alankapriya_saved_comparisons') || '[]';
        const list = JSON.parse(localSaved).filter((c: any) => c.id !== compId);
        localStorage.setItem('alankapriya_saved_comparisons', JSON.stringify(list));
      }
    } catch (err) {
      console.error("Failed to delete comparison:", err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
          <p className="text-stone-500 font-mono text-xs uppercase tracking-wider">Syncing historical comparison archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 select-none" id="comparison-history-root">
      
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
            Research Archives
          </span>
          <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 mt-2">
            Comparison History
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">
            Reopen or manage previous smart comparisons that you have locked-in during your research.
          </p>
        </div>
        <button
          onClick={() => onNavigate('compare')}
          className="rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors shadow-sm cursor-pointer"
        >
          New Arena Comparison
        </button>
      </div>

      {/* Main Container */}
      {!currentUser && comparisons.length === 0 ? (
        // Non-logged in state with empty results
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-800 mb-6 border border-amber-100 shadow-inner">
            <Clock className="h-5 w-5 text-amber-700 stroke-[1.5]" />
          </div>
          <h2 className="font-display text-xl font-black text-stone-900 tracking-tight">
            Cloud Sync Suspended
          </h2>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed font-light">
            Guest users do not preserve comparison histories. Sign in to Alankapriya to save your comparative hardware evaluations in secure cloud archives across all your devices.
          </p>
          <div className="pt-8">
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-2 rounded-xl bg-amber-750 hover:bg-amber-800 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-6 py-3 shadow-md cursor-pointer transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In to Unlock History</span>
            </button>
          </div>
        </div>
      ) : comparisons.length === 0 ? (
        // Logged-in user has no comparisons saved
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-600 mb-6 border border-stone-100">
            <ArrowLeftRight className="h-5 w-5 text-stone-400 stroke-[1.5]" />
          </div>
          <h2 className="font-display text-lg font-bold text-stone-900 tracking-tight">
            No Saved Research Found
          </h2>
          <p className="text-stone-500 text-xs mt-1.5 leading-relaxed font-light">
            You haven't preserved any comparisons yet. Set up a multi-product specs matchup and click <strong className="font-semibold text-stone-800">Save Comparison</strong> to record your decisions.
          </p>
          <div className="pt-6">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline"
            >
              <span>Explore Curation & Compare Products</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        // Render historical comparison grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="history-comparisons-grid">
          {comparisons.map((comp) => {
            const dateStr = new Date(comp.timestamp).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            // Map product IDs back to actual Product objects
            const matchedProducts = comp.comparedProductIds
              .map(id => allProducts.find(p => p.id === id))
              .filter((p): p is Product => !!p);

            // Find winner product
            const winnerProduct = allProducts.find(p => p.id === comp.aiRecommendation);

            return (
              <motion.div
                key={comp.id}
                layoutId={`history-card-${comp.id}`}
                className="bg-white border border-stone-200 hover:border-stone-300 rounded-3xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md text-left flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top line metadata */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-2 text-stone-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider">{dateStr}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(comp.id, e)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete comparison record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Compared products display */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">Products Compared</span>
                    <div className="flex flex-wrap gap-2.5">
                      {matchedProducts.map((p) => (
                        <div key={p.id} className="flex items-center space-x-1.5 bg-stone-50 border border-stone-200/50 rounded-xl py-1 px-2.5">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="h-5 w-5 rounded object-cover border border-stone-200 bg-white"
                          />
                          <span className="text-[11px] font-medium text-stone-800 line-clamp-1 max-w-[120px]">{p.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Winner Indicator */}
                  {winnerProduct && (
                    <div className="p-3 bg-amber-50/20 border border-amber-200/30 rounded-2xl flex items-start space-x-2.5">
                      <div className="p-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/40 mt-0.5">
                        <Award className="h-4 w-4 text-amber-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-mono font-bold text-amber-800 tracking-wider block">Best Match for Priorities</span>
                        <h4 className="font-display font-black text-xs text-stone-900 truncate">
                          {winnerProduct.brand} {winnerProduct.title}
                        </h4>
                        <p className="text-[10px] text-stone-500 font-light mt-0.5 line-clamp-2">
                          Winner recommendation with an optimal user match rating of {comp.aiMatchScores[winnerProduct.id] || '94'}%.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Priorities weights summary */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">Priority Focus</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(comp.userPriorities)
                        .filter(([_, weight]) => (weight as number) >= 2)
                        .map(([priority, weight]) => {
                          const w = weight as number;
                          return (
                            <span 
                              key={priority} 
                              className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                w === 3 
                                  ? 'bg-amber-100/60 text-amber-900 border border-amber-200/50' 
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {priority} {w === 3 ? '★' : ''}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Reopen Action button */}
                <button
                  onClick={() => onReopenComparison(comp.comparedProductIds)}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>Reopen This Arena</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
