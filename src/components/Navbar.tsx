import React, { useState } from 'react';
import { 
  Search, Menu, X, ShieldAlert, Layers, Headphones, FileText, ArrowLeftRight, 
  HelpCircle, LogIn, LogOut, User, ShoppingCart, Sparkles, Clock, Bookmark, Settings, ChevronDown 
} from 'lucide-react';
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
  onOpenAuth?: (signUp?: boolean) => void;
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
    { name: 'Categories', page: 'categories', icon: Search },
    { name: 'Compare', page: 'compare', icon: ArrowLeftRight, badge: compareCount > 0 ? compareCount : undefined },
    { name: 'Price Intelligence', page: 'price-tracker', icon: Clock },
    { name: 'Watchlist', page: 'watchlist', icon: Bookmark },
    { name: 'About', page: 'about', icon: HelpCircle },
    { name: 'Contact', page: 'contact', icon: Headphones }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-100/50 bg-[#faf9f6]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" id="nav-container">
        
        {/* Brand Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-1.5 sm:space-x-2.5 shrink-0" 
          onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
          id="nav-logo"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-800 text-[#faf9f6] font-display font-medium text-lg sm:text-xl shadow-sm transition-transform hover:scale-105">
            A
          </div>
          <span className="font-display font-bold text-lg sm:text-2xl tracking-wide text-slate-900 flex items-center">
            Alanka<span className="text-amber-700 font-light italic">riya</span>
            <span className="hidden sm:inline-flex ml-1.5 text-[9px] font-sans font-semibold uppercase text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/40">STORE</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1" id="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.name}
                id={`nav-item-${item.page}`}
                onClick={() => onNavigate(item.page)}
                className={`group relative flex items-center space-x-1.5 px-3 py-2 rounded-lg font-sans text-xs uppercase tracking-wider font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-[#1c1917] bg-amber-50/60' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span>{item.name}</span>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-700 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
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

        {/* Unified Responsive Actions & Auth block (Always Visible) */}
        <div className="flex items-center space-x-2 md:space-x-3.5" id="nav-right-actions-unified">
          {/* Integrated Search Input (only on md and up) */}
          <div className={`relative hidden md:flex items-center rounded-xl border bg-white transition-all duration-300 ${
            isSearchFocused 
              ? 'w-64 border-amber-600 ring-1 ring-amber-100' 
              : 'w-40 lg:w-48 border-stone-200 hover:border-stone-300'
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
              placeholder="Search..."
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
                            <span className="font-bold text-amber-700 font-mono">₹{p.price.toLocaleString()}</span>
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

          {/* Admin Toggle Button (only on md and up) */}
          {isAdmin && (
            <button
              id="nav-btn-admin"
              onClick={() => onNavigate('admin')}
              className="hidden md:flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs uppercase tracking-wider font-semibold transition-all duration-200 shadow-sm bg-white border border-stone-200 text-slate-700 hover:bg-stone-50"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-750 animate-pulse" />
              <span>Admin</span>
            </button>
          )}

          {/* Replay Welcome Intro (only on md and up) */}
          {onReplayWelcome && (
            <button
              onClick={onReplayWelcome}
              id="nav-btn-replay-welcome"
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-500 hover:text-amber-800 hover:border-amber-200 hover:bg-amber-50/20 transition-all duration-200 cursor-pointer shadow-sm"
              title="Replay Welcome Experience"
            >
              <Sparkles className="h-4 w-4 text-amber-700 animate-pulse" />
            </button>
          )}

          {/* Shopping Bag Button (Always Visible) */}
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

          {/* User Auth Section - Premium Sign In & Create Account or Profile avatar menu (Always Visible) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 pl-2 border-l border-stone-200/60" id="nav-auth-wrapper">
            {currentUser ? (
              <div className="relative" id="nav-user-dropdown-container">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-1.5 sm:space-x-2 rounded-full border border-stone-200 bg-white p-1 pr-1.5 sm:pr-3 hover:bg-stone-50 transition-all cursor-pointer"
                  id="nav-user-profile-btn"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-800 text-white font-bold text-xs shadow-inner">
                    {currentUser.email[0].toUpperCase()}
                  </div>
                  <span className="hidden xs:inline-block text-xs font-semibold text-slate-850 max-w-[90px] truncate">
                    {currentUser.email.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl z-50 text-left"
                        id="nav-user-profile-dropdown"
                      >
                        <div className="px-3 py-2 border-b border-stone-100 mb-1">
                          <p className="text-[10px] font-mono font-bold text-stone-450 uppercase tracking-wider">Patron Account</p>
                          <p className="text-xs font-bold text-slate-800 truncate" title={currentUser.email}>{currentUser.email}</p>
                        </div>
                        <button
                          onClick={() => { onNavigate('watchlist'); setProfileMenuOpen(false); }}
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#faf9f6] transition-colors text-left"
                        >
                          <User className="h-3.5 w-3.5 text-amber-700" />
                          <span>My Profile</span>
                        </button>
                        <button
                          onClick={() => { onNavigate('watchlist'); setProfileMenuOpen(false); }}
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#faf9f6] transition-colors text-left"
                        >
                          <Bookmark className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
                          <span>Watchlist</span>
                        </button>
                        <button
                          onClick={() => { onNavigate('history'); setProfileMenuOpen(false); }}
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#faf9f6] transition-colors text-left"
                        >
                          <Clock className="h-3.5 w-3.5 text-amber-700" />
                          <span>Comparison History</span>
                        </button>
                        <button
                          onClick={() => { onNavigate('watchlist'); setProfileMenuOpen(false); }}
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#faf9f6] transition-colors text-left"
                        >
                          <ShoppingCart className="h-3.5 w-3.5 text-amber-700" />
                          <span>Saved Products</span>
                        </button>
                        <button
                          onClick={() => { alert('Premium Settings interface coming soon!'); setProfileMenuOpen(false); }}
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#faf9f6] transition-colors text-left"
                        >
                          <Settings className="h-3.5 w-3.5 text-stone-400" />
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-stone-100 mt-1 pt-1">
                          <button
                            onClick={() => { onSignOut(); setProfileMenuOpen(false); }}
                            className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <button
                  onClick={() => onOpenAuth(false)}
                  id="nav-btn-signin"
                  className="rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-2 sm:px-3.5 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-800 transition-all cursor-pointer shadow-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth(true)}
                  id="nav-btn-signup"
                  className="rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-750 hover:to-amber-950 px-2 sm:px-3.5 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold text-white transition-all scale-100 hover:scale-[1.02] cursor-pointer shadow-md whitespace-nowrap"
                >
                  <span className="sm:hidden">Register</span>
                  <span className="hidden sm:inline">Create Account</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Drawer trigger (Visible on screen < xl) */}
          <button
            id="nav-btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-slate-700 cursor-pointer"
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
            className="xl:hidden absolute top-16 left-0 right-0 border-b border-amber-100 bg-[#faf9f6] shadow-xl px-4 py-6 space-y-4"
            id="mobile-nav-drawer"
          >
            {/* 1. Mobile Drawer Top Auth Section */}
            <div className="border-b border-stone-200/50 pb-4">
              {currentUser ? (
                <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 space-y-3 text-left" id="mobile-drawer-profile-top">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-800 text-white font-bold text-sm shadow-inner">
                      {currentUser.email[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-850 truncate">{currentUser.email}</span>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Patron Member</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-stone-200/50">
                    <button
                      onClick={() => { onNavigate('watchlist'); setMobileMenuOpen(false); }}
                      className="flex items-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-100 text-stone-700 text-[11px] font-bold text-left"
                    >
                      <User className="h-3.5 w-3.5 text-amber-700" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('watchlist'); setMobileMenuOpen(false); }}
                      className="flex items-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-100 text-stone-700 text-[11px] font-bold text-left"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-amber-700" />
                      <span>Watchlist</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('history'); setMobileMenuOpen(false); }}
                      className="flex items-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-100 text-stone-700 text-[11px] font-bold text-left"
                    >
                      <Clock className="h-3.5 w-3.5 text-amber-700" />
                      <span>History</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('watchlist'); setMobileMenuOpen(false); }}
                      className="flex items-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-100 text-stone-700 text-[11px] font-bold text-left"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 text-amber-700" />
                      <span>Saved</span>
                    </button>
                    <button
                      onClick={() => { alert('Premium Settings interface coming soon!'); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-100 text-stone-700 text-[11px] font-bold col-span-2"
                    >
                      <Settings className="h-3.5 w-3.5 text-stone-450" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <button
                    onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 py-2.5 text-xs uppercase tracking-wider font-bold text-red-600 transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3" id="mobile-drawer-auth-top">
                  <button
                    onClick={() => { onOpenAuth(false); setMobileMenuOpen(false); }}
                    className="rounded-xl border border-stone-300 bg-white py-2.5 text-center text-xs uppercase tracking-wider font-bold text-slate-800 cursor-pointer shadow-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onOpenAuth(true); setMobileMenuOpen(false); }}
                    className="rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 py-2.5 text-center text-xs uppercase tracking-wider font-bold text-white cursor-pointer shadow-md"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* 2. Search input on Mobile */}
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

            {/* 3. Navigation List */}
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
                    className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors duration-200 text-left ${
                      isActive 
                        ? 'bg-amber-50 text-amber-900 border border-amber-200/20' 
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

              {/* Replay Welcome on Mobile */}
              {onReplayWelcome && (
                <button
                  id="mobile-nav-btn-replay"
                  onClick={() => {
                    onReplayWelcome();
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 flex items-center justify-center space-x-2 p-3 rounded-xl text-xs uppercase tracking-wider font-semibold bg-amber-50/30 border border-amber-100/30 text-amber-950 hover:bg-amber-50 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-amber-700 animate-pulse" />
                  <span>Replay Welcome Experience</span>
                </button>
              )}
            </div>

            {/* 4. Admin section at bottom of Mobile Drawer */}
            {isAdmin && (
              <button
                id="mobile-drawer-btn-admin"
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900 py-3 text-xs uppercase tracking-wider font-semibold text-white shadow-md cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4 text-amber-400 animate-bounce" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
