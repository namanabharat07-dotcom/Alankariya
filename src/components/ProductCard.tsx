import React, { useState } from 'react';
import { Star, CheckCircle, Award, ShoppingCart, ArrowLeftRight, Check, Eye, ShoppingBag, Percent, ExternalLink, Tag, Globe, Truck } from 'lucide-react';
import { Product, getProductAffiliateButtons } from '../types';
import { motion } from 'motion/react';

const getColorName = (col: string): string => {
  if (!col) return '';
  if (col.startsWith('http') || col.startsWith('/') || col.includes('.')) {
    try {
      const parts = col.split('/');
      const last = parts[parts.length - 1];
      const nameWithExt = last.split('?')[0];
      const name = nameWithExt.split('.')[0];
      return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    } catch (e) {
      return 'Swatch Photo';
    }
  }
  return col;
};

interface ProductCardProps {
  key?: string;
  product: Product;
  onNavigateToProduct: (productId: string) => void;
  isComparing: boolean;
  onToggleCompare: (productId: string) => void;
  onAffiliateClick: (productId: string, network: string, url: string, e: React.MouseEvent) => void;
  onAddToCart?: (product: Product, size?: string) => void;
}

export default function ProductCard({
  product,
  onNavigateToProduct,
  isComparing,
  onToggleCompare,
  onAffiliateClick,
  onAddToCart
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState(product.colors && product.colors.length > 0 ? product.colors[0] : '');

  // Compute savings discount percentage if possible
  const savings = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.25, ease: "easeOut" } }}
      className="relative flex flex-col overflow-hidden rounded-3xl border border-amber-100/30 bg-white shadow-sm hover:shadow-lg hover:border-amber-200/50 transition-all duration-300"
      id={`product-card-${product.id}`}
    >
      {/* Upper Badges Area */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1">
        {product.isBestSeller && (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-800 px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold text-[#faf9f6] shadow-sm">
            <CheckCircle className="h-3 w-3" />
            <span>Best Seller</span>
          </span>
        )}
        {product.isEditorsChoice && (
          <span className="inline-flex items-center space-x-1 rounded-full bg-stone-900 px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold text-[#faf9f6] shadow-sm">
            <Award className="h-3 w-3 text-amber-500" />
            <span>Editor's Pick</span>
          </span>
        )}
      </div>

      {savings > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex rounded-full bg-amber-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
            {savings}% Off
          </span>
        </div>
      )}

      {/* Image Gallery Container */}
      <div 
        className="relative aspect-video w-full overflow-hidden bg-stone-50 cursor-pointer group"
        onClick={() => onNavigateToProduct(product.id)}
      >
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Soft overlay on hover */}
        <div className="absolute inset-0 bg-[#2c2a25]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="inline-flex items-center space-x-1.5 bg-[#faf9f6] px-4 py-2 rounded-full text-xs font-semibold text-slate-800 shadow-md">
            <Eye className="h-3.5 w-3.5 text-amber-700" />
            <span>View Details</span>
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-sans font-bold uppercase tracking-wider text-amber-800/80">
          <span>{product.brand}</span>
          <span className="bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-100/30">{product.category}</span>
        </div>

        {/* Product Title */}
        <h3 
          className="mb-2 line-clamp-2 font-display text-lg font-bold text-slate-900 cursor-pointer hover:text-amber-800 transition-colors"
          onClick={() => onNavigateToProduct(product.id)}
        >
          {product.title}
        </h3>

        {/* Rating and Reviews */}
        <div className="mb-3.5 flex items-center space-x-1 text-xs">
          <div className="flex items-center text-amber-500">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="ml-1 font-bold text-slate-800">{product.rating}</span>
          </div>
          <span className="text-slate-400 font-medium font-light">({product.reviewsCount} reviews)</span>
        </div>

        {/* Mini Specs Highlight */}
        <div className="mb-4 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-b border-stone-100 py-3 text-[11px] font-sans text-slate-500 font-light">
          {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
            <div key={key} className="line-clamp-1">
              <span className="font-semibold text-slate-700">{key}:</span> {value}
            </div>
          ))}
        </div>

        {/* Size Selection (Myntra style) */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5 font-medium">
              <span>Select Size</span>
              <span className="font-bold text-stone-700">{selectedSize}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`flex h-7 w-auto min-w-7 px-2 items-center justify-center rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    selectedSize === sz
                      ? 'border-amber-800 bg-amber-50 text-amber-900 ring-1 ring-amber-100'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5 font-medium">
              <span>Select Color</span>
              <span className="font-bold text-stone-700">{getColorName(selectedColor)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((col) => {
                const isImg = col.startsWith('http') || col.startsWith('/') || col.includes('.') || col.includes('data:image');
                return (
                  <button
                    key={col}
                    type="button"
                    title={getColorName(col)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(col);
                    }}
                    style={isImg ? undefined : { backgroundColor: col }}
                    className={`h-6 w-6 rounded-full border shadow-xs transition-all cursor-pointer relative overflow-hidden flex items-center justify-center bg-slate-50 ${
                      selectedColor === col
                        ? 'ring-2 ring-amber-800 ring-offset-1 border-transparent'
                        : 'border-stone-200 hover:scale-105'
                    }`}
                  >
                    {isImg ? (
                      <img src={col} alt={getColorName(col)} className="h-full w-full object-cover rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      selectedColor === col && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            col.toLowerCase() === '#ffffff' || col.toLowerCase() === 'white' ? 'bg-stone-900' : 'bg-white'
                          }`} />
                        </span>
                      )
                    )}
                    {isImg && selectedColor === col && (
                      <span className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white stroke-[3px]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Tag & Comparison Checkbox */}
        <div className="mt-auto mb-4 flex items-baseline justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-2">
              <span className="font-display text-2xl font-bold text-slate-900">${product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs font-light text-slate-400 line-through">${product.originalPrice}</span>
              )}
            </div>
            {/* Delivery Estimation Badge */}
            <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-semibold mt-1">
              <Truck className="h-3 w-3" />
              <span>Free Delivery Tomorrow</span>
            </div>
            {/* Stock / Inventory Status */}
            <div className="mt-1 flex items-center space-x-1 text-[10px]">
              {product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0) ? (
                <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                  ⚠️ Out of Stock
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold">
                  ✓ In Stock ({product.stockCount !== undefined ? `${product.stockCount} available` : '10 available'})
                </span>
              )}
            </div>
          </div>
          
          {/* Compare Toggle Button */}
          <button
            type="button"
            id={`btn-toggle-compare-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product.id);
            }}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
              isComparing
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-white hover:bg-[#fbfaf7] border-stone-200 text-stone-600'
            }`}
          >
            {isComparing ? (
              <>
                <Check className="h-3 w-3 text-amber-700" />
                <span>Comparing</span>
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-3 w-3 text-stone-400" />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>

        {/* High CTR Affiliate Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2" id={`ctr-actions-${product.id}`}>
          {/* Add to Bag Button (Myntra/Flipkart style) */}
          <button
            type="button"
            disabled={product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0)}
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) {
                onAddToCart(product, selectedSize);
              }
            }}
            className={`flex items-center justify-center space-x-1.5 rounded-xl border px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${
              product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0)
                ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'border-amber-800 bg-white text-amber-800 hover:bg-amber-50 cursor-pointer'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
            <span>{product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0) ? 'Sold Out' : 'Add To Bag'}</span>
          </button>

          {getProductAffiliateButtons(product).slice(0, 1).map((btn) => {
            const IconComponent = (() => {
              switch (btn.icon) {
                case 'ShoppingCart': return ShoppingCart;
                case 'ShoppingBag': return ShoppingBag;
                case 'Percent': return Percent;
                case 'Tag': return Tag;
                case 'Globe': return Globe;
                case 'Award': return Award;
                default: return ExternalLink;
              }
            })();
            
            const isLightColor = btn.color.toLowerCase() === '#ff9900' || btn.color.toLowerCase() === '#f9a825' || btn.color.toLowerCase() === '#yellow';
            const textColor = isLightColor ? 'text-slate-950' : 'text-white';
            
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
                id={`btn-aff-${btn.id}-${product.id}`}
                onClick={(e) => onAffiliateClick(product.id, btn.id, btn.url, e)}
                style={{ backgroundColor: btnBg }}
                className={`flex items-center justify-center space-x-1.5 rounded-xl px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider ${textColor} hover:opacity-95 shadow-sm transition-all cursor-pointer`}
              >
                <IconComponent className="h-3.5 w-3.5 shrink-0" />
                <span>Buy</span>
              </a>
            );
          })}
          {getProductAffiliateButtons(product).length === 0 && (
            <button
              onClick={() => onNavigateToProduct(product.id)}
              className="flex items-center justify-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-all cursor-pointer"
            >
              <span>Review Details</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
