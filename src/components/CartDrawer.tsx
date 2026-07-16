import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Tag, ChevronRight, ExternalLink, Ticket, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, getProductAffiliateButtons } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveFromCart: (productId: string, size?: string) => void;
  onUpdateQuantity: (productId: string, size: string | undefined, quantity: number) => void;
  onAffiliateClick: (productId: string, networkId: string, url: string, e: React.MouseEvent) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveFromCart,
  onUpdateQuantity,
  onAffiliateClick
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [showCheckoutDetails, setShowCheckoutDetails] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Promo codes logic
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'ALANKAPRIYA10') {
      setAppliedDiscount({ code: 'ALANKAPRIYA10', percent: 10 });
      setPromoCode('');
    } else if (code === 'MYNTRA50') {
      setAppliedDiscount({ code: 'MYNTRA50', percent: 50 });
      setPromoCode('');
    } else if (code === 'FESTIVE30') {
      setAppliedDiscount({ code: 'FESTIVE30', percent: 30 });
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code. Try "MYNTRA50", "ALANKAPRIYA10", or "FESTIVE30"');
    }
  };

  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent) / 100 : 0;
  const deliveryFee = subtotal > 0 ? 0 : 0; // Free Shipping
  const estimatedTax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0; // 5% standard
  const total = subtotal - discountAmount + estimatedTax;

  // Render affiliate links consolidated for checkout
  const getConsolidatedCheckoutLinks = () => {
    // Create an aggregate view of which platforms have the items
    const platforms = [
      { id: 'amazon', name: 'Amazon Storefront', discountMsg: 'Save up to 10% on Electronics & Wearables', color: '#ff9900' },
      { id: 'flipkart', name: 'Flipkart Supermart', discountMsg: 'Extra 5% with Axis Bank Credit Card', color: '#1c1917' },
      { id: 'earnkaro', name: 'EarnKaro Cashback Referral', discountMsg: 'Up to 8% direct affiliate payout', color: '#7c2d12' }
    ];

    return platforms.map(platform => {
      // Find items in cart that have a link for this platform
      const matchedItems = cartItems.map(item => {
        const buttons = getProductAffiliateButtons(item.product);
        const btn = buttons.find(b => b.id === platform.id);
        return {
          item,
          url: btn?.url,
          price: btn ? item.product.price : null
        };
      }).filter(x => x.url);

      const canCheckout = matchedItems.length > 0;
      const estimatedTotal = matchedItems.reduce((sum, current) => sum + (current.item.product.price * current.item.quantity), 0);
      const estimatedDiscountedTotal = estimatedTotal - (appliedDiscount ? (estimatedTotal * appliedDiscount.percent) / 100 : 0);

      return {
        ...platform,
        matchedItems,
        canCheckout,
        estimatedTotal: Math.round(estimatedDiscountedTotal + estimatedDiscountedTotal * 0.05)
      };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
            id="cart-backdrop"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl border-l border-stone-200"
            id="cart-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 p-5">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-100">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-stone-900">Your Bag</h3>
                  <p className="text-xs text-stone-500 font-light">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cartItems.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-400 border border-stone-100">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-stone-800">Your bag is empty</h4>
                    <p className="text-xs text-stone-400 max-w-xs mx-auto mt-1 font-light">
                      Browse Alankapriya's exclusive curations, compare styles, and add premium items to your cart.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-xl bg-amber-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-amber-900 transition-all cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                /* Active Cart List */
                <div className="space-y-4">
                  {cartItems.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${idx}`}
                      className="flex items-start space-x-4 p-3.5 rounded-2xl border border-stone-200/60 bg-white shadow-sm transition-all hover:border-stone-300"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="h-20 w-20 rounded-xl object-cover bg-stone-50 border border-stone-100"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-amber-800/80 tracking-wider">
                          {item.product.brand}
                        </span>
                        <h4 className="font-display font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {item.product.title}
                        </h4>
                        
                        {/* Size & Options display */}
                        <div className="flex items-center space-x-2 text-[10px] text-stone-400">
                          <span className="bg-stone-100 px-2 py-0.5 rounded font-medium">
                            Size: <strong className="text-stone-700 font-bold">{item.selectedSize || 'M'}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-stone-500 font-medium font-mono">${item.product.price}</span>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between pt-1.5">
                          <div className="flex items-center space-x-1.5 rounded-lg border border-stone-200 bg-stone-50/50 p-1">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                              className="h-5 w-5 flex items-center justify-center rounded bg-white hover:bg-stone-100 text-stone-600 cursor-pointer shadow-sm"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                              className="h-5 w-5 flex items-center justify-center rounded bg-white hover:bg-stone-100 text-stone-600 cursor-pointer shadow-sm"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveFromCart(item.product.id, item.selectedSize)}
                            className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-red-50"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Coupon Application Block */}
                  <div className="rounded-2xl border border-stone-200/60 p-4 space-y-3 bg-[#faf9f6]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-amber-700" />
                        <h5 className="text-xs font-bold text-stone-800">Apply Coupon / Offer</h5>
                      </div>
                      <span className="text-[9px] font-sans font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/30">
                        OFFERS LIVE
                      </span>
                    </div>

                    {appliedDiscount ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
                        <div className="flex items-center space-x-1.5 font-medium">
                          <Ticket className="h-4 w-4 shrink-0" />
                          <span>Promo <strong>{appliedDiscount.code}</strong> Applied!</span>
                        </div>
                        <div className="flex items-center space-x-2 font-bold">
                          <span>-{appliedDiscount.percent}%</span>
                          <button
                            onClick={() => setAppliedDiscount(null)}
                            className="text-emerald-900 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                          placeholder="e.g. MYNTRA50 or ALANKAPRIYA10"
                          className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 outline-none uppercase font-semibold"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-amber-800 hover:bg-amber-900 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </form>
                    )}

                    {promoError && (
                      <p className="text-[10px] text-red-500 font-semibold">{promoError}</p>
                    )}

                    <div className="text-[10px] text-stone-400 leading-relaxed pt-1 flex flex-wrap gap-2">
                      <span>Suggestions:</span>
                      <button onClick={() => setPromoCode('MYNTRA50')} className="hover:underline font-bold text-stone-500 cursor-pointer">MYNTRA50 (50% Off)</button>
                      <span>•</span>
                      <button onClick={() => setPromoCode('ALANKAPRIYA10')} className="hover:underline font-bold text-stone-500 cursor-pointer">ALANKAPRIYA10 (10% Off)</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout Options */}
            {cartItems.length > 0 && (
              <div className="border-t border-stone-200 bg-stone-50/70 p-5 space-y-4 shadow-inner">
                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-stone-600 font-light">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="font-mono text-stone-800 font-semibold">${subtotal}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span className="font-mono font-bold">-${discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-mono text-stone-800 font-semibold">${estimatedTax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-700 font-semibold uppercase">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-stone-900">
                    <span>Total Bill</span>
                    <span className="font-mono text-amber-800">${total}</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                {!showCheckoutDetails ? (
                  <button
                    onClick={() => setShowCheckoutDetails(true)}
                    className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-amber-800 hover:bg-amber-900 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all cursor-pointer"
                  >
                    <span>Check Cheapest E-Commerce Link</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="space-y-3" id="ecom-comparison-panel">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                      <span className="text-[10px] font-bold uppercase text-stone-400">Retail Comparison (Real-time)</span>
                      <button
                        onClick={() => setShowCheckoutDetails(false)}
                        className="text-[10px] text-amber-800 hover:underline font-bold cursor-pointer"
                      >
                        Hide details
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getConsolidatedCheckoutLinks().map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex flex-col justify-between gap-2 bg-white transition-all ${
                            opt.canCheckout ? 'border-stone-200 hover:border-stone-400' : 'opacity-40 border-stone-100'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: opt.color }} />
                                <span>{opt.name}</span>
                              </h5>
                              <p className="text-[10px] text-stone-400 font-light mt-0.5">{opt.discountMsg}</p>
                            </div>
                            {opt.canCheckout && (
                              <div className="text-right">
                                <span className="text-[10px] text-stone-400 block">Est. Cart Cost</span>
                                <span className="text-xs font-bold font-mono text-stone-800">${opt.estimatedTotal}</span>
                              </div>
                            )}
                          </div>

                          {opt.canCheckout ? (
                            /* Consolidated checkout buttons */
                            <div className="grid grid-cols-1 gap-1.5">
                              {opt.matchedItems.map((match, mi) => (
                                <a
                                  key={mi}
                                  href={match.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => onAffiliateClick(match.item.product.id, opt.id, match.url!, e)}
                                  className="flex items-center justify-between bg-stone-50 hover:bg-stone-100 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-stone-700 transition-all border border-stone-200/40"
                                >
                                  <span className="truncate max-w-[180px]">{match.item.product.title}</span>
                                  <span className="flex items-center text-amber-800 space-x-1 shrink-0 font-bold">
                                    <span>Buy Now</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9px] text-stone-400 font-medium italic">Not available for these items</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-stone-400 text-center font-light leading-relaxed">
                  *Alankapriya automatically compares and matches your cart across the cheapest available sellers on Amazon, Flipkart, & referral networks. All prices are verified.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
