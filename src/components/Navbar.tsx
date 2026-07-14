import React, { useState } from 'react';
import { Search, Menu, X, ShieldAlert, Layers, Headphones, FileText, ArrowLeftRight, HelpCircle, Cloud, LogIn, LogOut, User, ShoppingCart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Product } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  compareCount: number;
  cartCount?: number;
  onOpenCart?: () => void;
  isSyncing?: boolean;
  currentUser?: any;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  products?: Product[];
  onReplayWelcome?: () => void;
}

export default function Navbar({
  currentPage,
  onNavigate,
  searchQuery,
  onSearchChange,
  compareCount,
  cartCount = 0,
  onOpenCart = () => {},
  isSyncing = false,
  currentUser = null,
  onOpenAuth = () => {},
  onSignOut = () => {},
  products = [],
  onReplayWelcome
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isAdmin = currentUser?.email?.toLowerCase() === 'namanabharat07@gmail.com';

  const suggestions = React.useMemo(() => {
    if (!searchQuery.trim() || !products) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.tags.some(tag => tag.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchQuery, products]);

  const navItems = [
    { name: 'Home', page: 'home', icon: Layers },
    { name: 'AI Finder', page: 'ai-finder', icon: Sparkles },
    { name: 'Compare', page: 'compare', icon: ArrowLeftRight, badge: compareCount > 0 ? compareCount : undefined },
    { name: 'Guides', page: 'guides_list', icon: FileText },
    { name: 'Blog', page: 'blogs_list', icon: FileText },
    { name: 'FAQs', page: 'faqs', icon: HelpCircle }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-100/50 bg-[#faf9f6]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" id="nav-container">
        
        {/* Brand Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-2.5" 
          onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
          id="nav-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-800 text-[#faf9f6] font-display font-medium text-xl shadow-sm transition-transform hover:scale-105">
            A
          </div>
          <span className="font-display font-bold text-2xl tracking-wide text-slate-900 flex items-center">
            Alanka<span className="text-amber-700 font-light italic">riya</span>
            <span className="ml-1.5 text-[9px] font-sans font-semibold uppercase text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/40">STORE</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1" id="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page || 
                             (item.page === 'guides_list' && currentPage === 'guide') ||
                             (item.page === 'blogs_list' && currentPage === 'blog');
            return (
              <button
                key={item.name}
                id={`nav-item-${item.page}`}
                onClick={() => onNavigate(item.page)}
                className={`group relative flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-sans text-xs uppercase tracking-wider font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-amber-850 bg-amber-50/60' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span>{item.name}</span>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-700 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator" 
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-700 rounded-full" 
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Search and Admin CTA */}
        <div className="hidden md:flex items-center space-x-4" id="nav-right-actions">
          {/* Integrated Search Input */}
          <div className={`relative flex items-center rounded-xl border bg-white transition-all duration-300 ${
            isSearchFocused 
              ? 'w-72 border-amber-600 ring-1 ring-amber-100' 
              : 'w-48 border-stone-200 hover:border-stone-350'
          }`} id="global-search-container">
            <span className="pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              id="nav-search-input"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentPage !== 'home' && currentPage !== 'compare') {
                  onNavigate('home');
                }
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search curation..."
              className="w-full bg-transparent py-1.5 pl-2 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 font-light"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="pr-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}

            {/* Smart Suggestions Floating Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div 
                onMouseDown={(e) => e.preventDefault()}
                className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-xl z-50 p-2 text-left"
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                  Matched Products
                </div>
                {suggestions.length > 0 ? (
                  <div className="divide-y divide-stone-100">
                    {suggestions.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('product', { id: p.id });
                          onSearchChange('');
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center space-x-2.5 p-2 hover:bg-[#faf9f6] rounded-lg cursor-pointer transition-colors"
                      >
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 object-cover rounded bg-stone-50 border border-stone-100 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{p.brand}</span>
                            <span className="font-bold text-amber-700 font-mono">${p.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 font-light">
                    No matching products found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Toggle Button */}
          {isAdmin && (
            <button
              id="nav-btn-admin"
              onClick={() => onNavigate('admin')}
              className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all duration-200 shadow-sm ${
                currentPage === 'admin'
                  ? 'bg-slate-900 text-white shadow-slate-900/10'
                  : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
              <span>Admin Control</span>
            </button>
          )}

          {/* Replay Welcome Intro */}
          {onReplayWelcome && (
            <button
              onClick={onReplayWelcome}
              id="nav-btn-replay-welcome"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-500 hover:text-amber-800 hover:border-amber-200 hover:bg-amber-50/20 transition-all duration-200 cursor-pointer shadow-sm"
              title="Replay Welcome Experience"
            >
              <Sparkles className="h-4 w-4 text-amber-700 animate-pulse" />
            </button>
          )}

          {/* Shopping Bag Button (Myntra/Flipkart style) */}
          <button
            onClick={onOpenCart}
            id="nav-btn-cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-700 hover:bg-stone-50 transition-all duration-200 cursor-pointer shadow-sm"
            title="Shopping Bag"
          >
            <ShoppingCart className="h-4 w-4 text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce-short">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="flex items-center space-x-2 border-l border-stone-200 pl-4 animate-fade-in" id="nav-user-controls">
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Patron</span>
                <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate" title={currentUser.email}>
                  {currentUser.email.split('@')[0]}
                </span>
              </div>
              <button
                onClick={onSignOut}
                id="nav-btn-signout"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-sm"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              id="nav-btn-signin"
              className="flex items-center space-x-1.5 rounded-xl bg-amber-750 hover:bg-amber-800 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-white shadow-sm transition-all duration-200 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden items-center space-x-3" id="mobile-nav-actions">
          {currentPage === 'home' && (
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-slate-600">
              <Search className="h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder=""
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
          )}

          {/* Admin Button on Mobile Header */}
          {isAdmin && (
            <button
              id="nav-btn-admin-mobile"
              onClick={() => onNavigate('admin')}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                currentPage === 'admin' ? 'bg-slate-900 text-white' : 'bg-stone-100 text-slate-700'
              }`}
            >
              <ShieldAlert className="h-4 w-4 text-amber-750" />
            </button>
          )}

          {/* Mobile Shopping Bag Button */}
          <button
            onClick={onOpenCart}
            id="nav-btn-cart-mobile"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-slate-700"
            title="Shopping Bag"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            id="nav-btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-slate-700"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute top-16 left-0 right-0 border-b border-amber-100 bg-[#faf9f6] shadow-xl px-4 py-6 space-y-4"
            id="mobile-nav-drawer"
          >
            {/* Search input on Mobile */}
            <div className="relative flex items-center rounded-xl border border-stone-200 bg-white">
              <span className="pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                id="mobile-search-input"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentPage !== 'home') onNavigate('home');
                }}
                placeholder="Search products..."
                className="w-full bg-transparent py-2.5 pl-2 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 font-light"
              />
            </div>

            {/* Nav List */}
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.name}
                    id={`mobile-nav-item-${item.page}`}
                    onClick={() => {
                      onNavigate(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 p-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors duration-200 ${
                      isActive 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-white border border-stone-100 text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span>{item.name}</span>
                    {item.badge !== undefined && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-700 px-1 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Replay Welcome Experience on Mobile */}
              {onReplayWelcome && (
                <button
                  id="mobile-nav-btn-replay"
                  onClick={() => {
                    onReplayWelcome();
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 flex items-center justify-center space-x-2 p-3 rounded-xl text-xs uppercase tracking-wider font-semibold bg-amber-50/40 border border-amber-100/40 text-amber-900 hover:bg-amber-50 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-amber-700 animate-pulse" />
                  <span>Replay Welcome Experience</span>
                </button>
              )}
            </div>

            {/* User Auth Section on Mobile */}
            <div className="border-t border-stone-100 pt-4" id="mobile-drawer-user-section">
              {currentUser ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3 px-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
                      {currentUser.email[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate" title={currentUser.email}>
                        {currentUser.email}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        My Profile
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    id="mobile-drawer-btn-signout"
                    className="flex w-full items-center justify-center space-x-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 py-3 text-xs uppercase tracking-wider font-semibold text-red-600 transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  id="mobile-drawer-btn-signin"
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-amber-700 py-3 text-xs uppercase tracking-wider font-semibold text-white shadow-sm cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Admin CTA at Bottom of Drawer */}
            {isAdmin && (
              <button
                id="mobile-drawer-btn-admin"
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900 py-3 text-xs uppercase tracking-wider font-semibold text-white shadow-md cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
