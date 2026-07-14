import React from 'react';
import { Product, getProductAffiliateButtons } from '../types';
import { Star, X, ShoppingCart, ArrowLeftRight, CheckCircle, AlertTriangle, ShoppingBag, Percent, ExternalLink, Tag, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductComparisonProps {
  selectedProducts: Product[];
  allProducts: Product[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onNavigateToProduct: (id: string) => void;
  onAffiliateClick: (productId: string, network: string, url: string, e: React.MouseEvent) => void;
}

export default function ProductComparison({
  selectedProducts,
  allProducts,
  onRemoveFromCompare,
  onClearCompare,
  onNavigateToProduct,
  onAffiliateClick
}: ProductComparisonProps) {
  // Extract all unique specification keys across all selected products to display them line-by-line
  const uniqueSpecKeys = Array.from(
    new Set(
      selectedProducts.flatMap(p => Object.keys(p.specifications))
    )
  );

  // Recommendations if comparison is empty
  const recommendedToCompare = allProducts
    .filter(p => !selectedProducts.find(sp => sp.id === p.id))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="comparison-hub">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Compare Products
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Compare specifications, ratings, pros, and cons side-by-side to choose the right product.
          </p>
        </div>
        {selectedProducts.length > 0 && (
          <button
            onClick={onClearCompare}
            id="btn-clear-comparison"
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {selectedProducts.length === 0 ? (
        // Empty State
        <div className="text-center py-16 bg-[#faf9f6] border border-dashed border-stone-200 rounded-3xl p-8" id="compare-empty-state">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-800 mb-4 border border-amber-100">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-800">No products selected</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Select products from our catalog to compare them side-by-side.
          </p>

          {/* Quick Suggestions to add */}
          {recommendedToCompare.length > 0 && (
            <div className="mt-8 max-w-2xl mx-auto">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">
                Recommended Products
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendedToCompare.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => onRemoveFromCompare(p.id)} // This acts as a toggle (adds it in our parent toggle logic)
                    className="flex items-center space-x-3 p-3 rounded-xl border border-stone-200 bg-white hover:border-amber-700 cursor-pointer transition-all"
                  >
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-lg object-cover bg-slate-50"
                    />
                    <div className="text-left">
                      <p className="font-sans font-bold text-xs text-slate-800 line-clamp-1">{p.title}</p>
                      <p className="font-mono text-[10px] text-slate-500">${p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Side-by-Side Table Layout
        <div className="overflow-x-auto rounded-3xl border border-amber-100/30 bg-white shadow-xl" id="compare-matrix-wrapper">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="w-1/4 p-6 font-display font-bold text-xs uppercase tracking-wider text-slate-400">
                  Feature Matrix
                </th>
                {selectedProducts.map((p) => (
                  <th key={p.id} className="p-6 relative">
                    {/* Delete Toggle */}
                    <button
                      onClick={() => onRemoveFromCompare(p.id)}
                      className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-slate-500 hover:text-slate-900 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    
                    {/* Compact Image and title */}
                    <div className="flex flex-col items-center text-center space-y-3 cursor-pointer mt-2" onClick={() => onNavigateToProduct(p.id)}>
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="h-24 w-24 rounded-2xl object-cover bg-slate-50 shadow-md"
                      />
                      <div>
                        <span className="font-sans text-[10px] uppercase font-bold text-slate-400">{p.brand}</span>
                        <h4 className="font-display font-bold text-sm text-slate-900 line-clamp-2 hover:text-amber-800 mt-1">
                          {p.title}
                        </h4>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Ratings Segment */}
              <tr className="border-b border-slate-100">
                <td className="p-5 font-sans font-semibold text-sm text-slate-800 bg-slate-50/30">
                  Editor Rating
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.id} className="p-5">
                    <div className="flex items-center space-x-1.5">
                      <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                      <span className="font-display text-base font-bold text-slate-900">{p.rating}</span>
                      <span className="text-xs text-slate-400">/ 5.0</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price Segment */}
              <tr className="border-b border-slate-100">
                <td className="p-5 font-sans font-semibold text-sm text-slate-800 bg-slate-50/30">
                  Affiliate Price
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.id} className="p-5">
                    <div className="flex flex-col">
                      <span className="font-display text-xl font-extrabold text-slate-900">${p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-xs text-slate-400 line-through">${p.originalPrice}</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Pros Comparison */}
              <tr className="border-b border-slate-100">
                <td className="p-5 font-sans font-semibold text-sm text-slate-800 bg-slate-50/30">
                  Pros & Key Selling Points
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.id} className="p-5 text-xs text-slate-600 align-top">
                    <ul className="space-y-2">
                      {p.pros.slice(0, 3).map((pro, index) => (
                        <li key={index} className="flex items-start space-x-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Cons Comparison */}
              <tr className="border-b border-slate-100">
                <td className="p-5 font-sans font-semibold text-sm text-slate-800 bg-slate-50/30">
                  Cons & Drawbacks
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.id} className="p-5 text-xs text-slate-600 align-top">
                    <ul className="space-y-2">
                      {p.cons.slice(0, 3).map((con, index) => (
                        <li key={index} className="flex items-start space-x-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Editorial Verdict */}
              <tr className="border-b border-slate-100">
                <td className="p-5 font-sans font-semibold text-sm text-slate-800 bg-slate-50/30">
                  Final Verdict Summary
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.id} className="p-5 text-xs text-slate-600 leading-relaxed italic align-top">
                    "{p.verdict}"
                  </td>
                ))}
              </tr>

              {/* Specifications Subheading */}
              <tr className="bg-slate-50">
                <td colSpan={selectedProducts.length + 1} className="p-3 text-center font-display font-bold text-xs uppercase tracking-wider text-slate-500">
                  Technical Specifications Comparison
                </td>
              </tr>

              {/* Dynamic Spec Rows */}
              {uniqueSpecKeys.map((key) => (
                <tr key={key} className="border-b border-slate-100 hover:bg-slate-50/40">
                  <td className="p-5 font-sans font-medium text-xs text-slate-500 bg-slate-50/10">
                    {key}
                  </td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-5 text-xs font-semibold text-slate-700 font-mono">
                      {p.specifications[key] || <span className="text-slate-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Affiliate CTA Matrix row (CRO optimized) */}
              <tr className="bg-[#faf9f6]">
                <td className="p-5 font-sans font-semibold text-sm text-slate-800">
                  Direct Buy / Referrals
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.id} className="p-5">
                    <div className="flex flex-col space-y-2">
                      {getProductAffiliateButtons(p).slice(0, 3).map((btn) => {
                        const IconComponent = (() => {
                          switch (btn.icon) {
                            case 'ShoppingCart': return ShoppingCart;
                            case 'ShoppingBag': return ShoppingBag;
                            case 'Percent': return Percent;
                            case 'Tag': return Tag;
                            case 'Globe': return Globe;
                            default: return ExternalLink;
                          }
                        })();

                        const isLightColor = btn.color.toLowerCase() === '#ff9900' || btn.color.toLowerCase() === '#f9a825' || btn.color.toLowerCase() === '#yellow';
                        const textColor = isLightColor ? 'text-slate-950' : 'text-white';

                        // Adjust button background slightly for luxury look
                        let btnBg = btn.color;
                        if (btn.id === 'amazon') btnBg = '#d97706'; // Muted premium gold-amber
                        if (btn.id === 'flipkart') btnBg = '#1c1917'; // Dark charcoal
                        if (btn.id === 'earnkaro') btnBg = '#7c2d12'; // Rich mahogany/espresso

                        return (
                          <a
                            key={btn.id}
                            href={btn.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => onAffiliateClick(p.id, btn.id, btn.url, e)}
                            style={{ backgroundColor: btnBg }}
                            className={`flex items-center justify-center space-x-1.5 rounded-xl px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider ${textColor} shadow-sm transition-all hover:opacity-95 cursor-pointer`}
                          >
                            <IconComponent className="h-3.5 w-3.5 shrink-0" />
                            <span>Check on {btn.name}</span>
                          </a>
                        );
                      })}
                      {getProductAffiliateButtons(p).length === 0 && (
                        <span className="text-xs text-slate-400 italic text-center block py-1">No links configured</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
