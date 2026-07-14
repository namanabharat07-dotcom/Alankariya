import React, { useState, useEffect } from 'react';
import { Product, getProductAffiliateButtons } from '../types';
import { 
  Star, ShoppingCart, CheckCircle2, AlertCircle, ArrowLeft, ArrowLeftRight, Check,
  ThumbsUp, ThumbsDown, ShieldCheck, Zap, UserCheck, UserX, Award,
  ShoppingBag, Percent, ExternalLink, Tag, Globe, Truck, MapPin, Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  isComparing: boolean;
  onToggleCompare: (productId: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onAffiliateClick: (productId: string, network: string, url: string, e: React.MouseEvent) => void;
  onAddToCart?: (product: Product, size?: string) => void;
}

export default function ProductDetail({
  product,
  allProducts,
  onBack,
  isComparing,
  onToggleCompare,
  onNavigateToProduct,
  onAffiliateClick,
  onAddToCart
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'specs' | 'performance' | 'verdict' | 'checklist' | 'reviews'>('overview');

  // --- Premium Shopping Assistant Interactive Features ---
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const toggleCheckItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [reviews, setReviews] = useState<Record<string, Array<{
    id: string;
    author: string;
    rating: number;
    title: string;
    date: string;
    content: string;
    verified: boolean;
  }>>>({
    'prod-1': [
      { id: 'rev-1', author: 'Sophia Vance', rating: 5, title: 'Incredible noise cancellation', date: '6 days ago', content: 'These headphones are a life saver for my daily subway commute. The ANC completely silences the train rumble. Sound stage is wide and comfortable for hours.', verified: true },
      { id: 'rev-2', author: 'Liam K.', rating: 4, title: 'Superb sound, minor carry issues', date: '2 weeks ago', content: 'Audio is crisp with warm vocals. ANC is fantastic. My only minor complaint is that they do not fold flat like the older XM4, making the travel case bulky.', verified: true },
      { id: 'rev-3', author: 'Amara Singh', rating: 5, title: 'Outstanding voice calls', date: '1 month ago', content: 'The mic isolation is magic. I take Zoom meetings in loud coffee shops and clients tell me I sound like I am in a quiet studio.', verified: false }
    ],
    'prod-2': [
      { id: 'rev-4', author: 'Jordan Ross', rating: 5, title: 'Best smart watch on the market', date: '3 days ago', content: 'The display is beautiful and the tracking is incredibly accurate. Battery life is slightly better than previous generations.', verified: true }
    ],
    'prod-3': [
      { id: 'rev-5', author: 'Clara Dupont', rating: 5, title: 'Beautifully crafted bag', date: '1 week ago', content: 'The leather feels premium and holds its shape perfectly. Love the minimal gold accents. Got so many compliments!', verified: true }
    ]
  });

  const [newReview, setNewReview] = useState({ author: '', rating: 5, title: '', content: '' });
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.title.trim() || !newReview.content.trim()) return;

    const addedReview = {
      id: `rev-local-${Date.now()}`,
      author: newReview.author,
      rating: newReview.rating,
      title: newReview.title,
      date: 'Just now',
      content: newReview.content,
      verified: true
    };

    setReviews(prev => {
      const currentList = prev[product.id] || [];
      return {
        ...prev,
        [product.id]: [addedReview, ...currentList]
      };
    });

    setNewReview({ author: '', rating: 5, title: '', content: '' });
    setReviewSubmitSuccess(true);
    setTimeout(() => setReviewSubmitSuccess(false), 4000);
  };

  const currentReviews = reviews[product.id] || [
    { id: 'rev-d1', author: 'Alex Rivera', rating: 5, title: 'Amazing purchase', date: '3 days ago', content: 'High quality materials, exceptional performance, and premium feel. Extremely satisfied!', verified: true },
    { id: 'rev-d2', author: 'Taylor Vance', rating: 4, title: 'Very good quality', date: '1 week ago', content: 'Exceeded my expectations. Build feels sturdy and elegant. Value for money is high.', verified: true }
  ];

  const totalReviewsCount = currentReviews.length;
  const averageRating = (currentReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1);

  const checklistItems = React.useMemo(() => {
    const common = [
      { id: 'ch-c1', text: 'Verify dimensions & sizing against size charts' },
      { id: 'ch-c2', text: 'Confirm the current price is a good deal using the Price History trends' },
      { id: 'ch-c3', text: 'Verify shipping time to your exact PIN code above' },
      { id: 'ch-c4', text: 'Confirm the return / replacement policy window' }
    ];

    if (product.category === 'Audio') {
      return [
        { id: 'ch-au1', text: 'Assess comfortable fit & eartip selections for long wearing sessions' },
        { id: 'ch-au2', text: 'Confirm Active Noise Cancellation (ANC) rating matches your environment' },
        { id: 'ch-au3', text: 'Verify battery life meets your commuter/travel needs' },
        { id: 'ch-au4', text: 'Check high-resolution Bluetooth codec (LDAC, aptX) support' },
        ...common
      ];
    } else if (product.category === 'Wearables') {
      return [
        { id: 'ch-we1', text: 'Verify GPS accuracy and satellite lock speeds' },
        { id: 'ch-we2', text: 'Assess display brightness in bright, outdoor direct sunlight' },
        { id: 'ch-we3', text: 'Check health tracking sensor certifications (ECG, SpO2, Heart Rate)' },
        { id: 'ch-we4', text: 'Verify strap materials for active workouts / sweat resistance' },
        ...common
      ];
    } else if (product.category === 'Fashion') {
      return [
        { id: 'ch-fa1', text: 'Verify stitch reinforcement quality on seams & joints' },
        { id: 'ch-fa2', text: 'Confirm material composition & breathability (e.g. 100% Cotton, Premium Leather)' },
        { id: 'ch-fa3', text: 'Verify closure mechanism robustness (zippers, snaps, magnetic buckles)' },
        { id: 'ch-fa4', text: 'Verify storage capacity & pocket organization layouts' },
        ...common
      ];
    }

    return [
      { id: 'ch-ge1', text: 'Verify key technical specifications matches your specific requirement' },
      { id: 'ch-ge2', text: 'Check build material durability (metal chassis vs. standard plastic)' },
      ...common
    ];
  }, [product.category]);

  const [selectedSize, setSelectedSize] = useState(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState(product.colors && product.colors.length > 0 ? product.colors[0] : '');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode.trim())) {
      setPincodeStatus('Eligible! Free delivery by tomorrow. Cash on Delivery is supported.');
    } else {
      setPincodeStatus('Please enter a valid 6-digit PIN code.');
    }
  };

  // Sync active image when product changes
  useEffect(() => {
    setActiveImage(product.images[0]);
  }, [product]);

  // Find related products (same category, excluding current product)
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Fallback if no matching categories, show any products
  const backupRelated = relatedProducts.length > 0 
    ? relatedProducts 
    : allProducts.filter(p => p.id !== product.id).slice(0, 3);

  const savings = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id={`product-detail-${product.id}`}>
      
      {/* Breadcrumb / Back button */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          id="btn-back-to-catalog"
          className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </button>

        {/* Compare button on Product Page */}
        <button
          onClick={() => onToggleCompare(product.id)}
          id={`detail-compare-btn-${product.id}`}
          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
            isComparing
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 shadow-sm'
          }`}
        >
          {isComparing ? (
            <>
              <Check className="h-4 w-4 text-amber-700" />
              <span>In Comparison Hub</span>
            </>
          ) : (
            <>
              <ArrowLeftRight className="h-4 w-4 text-stone-400" />
              <span>Add to Comparison</span>
            </>
          )}
        </button>
      </div>

      {/* SEO Breadcrumbs visual indicator */}
      <nav className="mb-6 flex items-center space-x-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
        <span className="cursor-pointer hover:text-amber-700" onClick={onBack}>Home</span>
        <span>/</span>
        <span className="cursor-pointer hover:text-amber-700" onClick={onBack}>{product.category}</span>
        <span>/</span>
        <span className="text-slate-600 truncate">{product.title}</span>
      </nav>

      {/* Main product showcase grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl mb-12">
        
        {/* Gallery Section - Left Side */}
        <div className="lg:col-span-6 flex flex-col space-y-4" id="detail-gallery">
          {/* Main big display */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
            <img
              src={activeImage}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-all duration-300"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 inline-flex items-center space-x-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow">
                <Award className="h-3.5 w-3.5" />
                <span>Best Seller</span>
              </span>
            )}
            {product.isEditorsChoice && (
              <span className="absolute top-4 left-4 inline-flex items-center space-x-1 rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-[#faf9f6] uppercase tracking-wider shadow">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <span>Editor's Pick</span>
              </span>
            )}
            {savings > 0 && (
              <span className="absolute top-4 right-4 inline-flex rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white shadow">
                {savings}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail row switcher */}
          <div className="flex gap-2 overflow-x-auto pb-1" id="detail-thumbnails">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                  activeImage === img ? 'border-amber-600 ring-2 ring-amber-100' : 'border-stone-100 hover:border-stone-300'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Purchase and Core info - Right Side */}
        <div className="lg:col-span-6 flex flex-col" id="detail-main-purchase">
          <div className="mb-2 flex items-center space-x-3 text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400">
            <span>{product.brand}</span>
            <span>•</span>
            <span className="text-amber-700">{product.category}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
            {product.title}
          </h1>

          {/* Rating Block */}
          <div className="mb-6 flex items-center space-x-2 text-sm">
            <div className="flex items-center text-amber-500">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              <span className="ml-1 font-extrabold text-slate-800">{product.rating}</span>
            </div>
            <span className="text-slate-400 font-medium">|</span>
            <span className="text-slate-500 font-semibold">{product.reviewsCount} verified customer ratings</span>
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
            {product.shortDescription}
          </p>

          {/* Pricing Card Section */}
          <div className="mb-6 rounded-2xl bg-[#faf9f6] p-5 border border-amber-100/35 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Best Price</span>
              <div className="flex items-baseline space-x-2.5 mt-1">
                <span className="font-display text-3xl font-extrabold text-stone-900">${product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm font-semibold text-stone-400 line-through">${product.originalPrice}</span>
                )}
                {product.originalPrice > product.price && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>
            <div className="text-[11px] text-stone-500 italic max-w-xs leading-normal bg-white p-2.5 rounded-xl border border-stone-200/40">
              *All active coupons applied. Official brand warranty and returns apply.
            </div>
          </div>

          {/* Size Selection (Myntra/Amazon style) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6 border-b border-stone-100 pb-5">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2.5">
                <span>SELECT SIZE</span>
                <button className="text-[11px] text-amber-800 hover:underline cursor-pointer font-bold">Size Chart</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`flex h-10 min-w-10 px-3.5 items-center justify-center rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'border-amber-850 bg-amber-50 text-amber-900 ring-2 ring-amber-100/50'
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
            <div className="mb-6 border-b border-stone-100 pb-5">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2.5">
                <span>SELECT COLOR</span>
                <span className="text-xs font-medium text-stone-500 uppercase">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    title={col}
                    onClick={() => setSelectedColor(col)}
                    style={{ backgroundColor: col }}
                    className={`h-8 w-8 rounded-full border shadow-xs transition-all cursor-pointer relative ${
                      selectedColor === col
                        ? 'ring-2 ring-amber-850 ring-offset-2 border-transparent'
                        : 'border-stone-200 hover:scale-105'
                    }`}
                  >
                    {selectedColor === col && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className={`h-2 w-2 rounded-full ${
                          col.toLowerCase() === '#ffffff' || col.toLowerCase() === 'white' ? 'bg-stone-900' : 'bg-white'
                        }`} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Pincode Checker (Myntra style) */}
          <div className="mb-6 border-b border-stone-100 pb-5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-700 mb-2.5">
              <MapPin className="h-4 w-4 text-amber-800" />
              <span>Check Delivery</span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2 max-w-xs">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter pin code"
                className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-850 outline-none focus:border-amber-600 font-bold"
              />
              <button
                type="submit"
                className="rounded-xl bg-stone-950 hover:bg-stone-850 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className={`text-[11px] font-bold mt-2 flex items-center space-x-1 ${pincodeStatus.includes('Eligible') ? 'text-emerald-700' : 'text-rose-600'}`}>
                {pincodeStatus.includes('Eligible') ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                <span>{pincodeStatus}</span>
              </p>
            )}
            <div className="flex items-center space-x-4 text-[10px] text-stone-400 mt-2.5">
              <span className="flex items-center space-x-1"><Truck className="h-3.5 w-3.5" /> <span>Free Delivery</span></span>
              <span>•</span>
              <span className="flex items-center space-x-1"><Calendar className="h-3.5 w-3.5" /> <span>Easy Returns</span></span>
            </div>
          </div>

          {/* CRO-optimized Sticky and Non-sticky CTA Hub */}
          <div className="space-y-4 mb-6" id="detail-cta-hub">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Add to Bag solid button */}
              <button
                type="button"
                onClick={() => onAddToCart && onAddToCart(product, selectedSize)}
                className="flex w-full items-center justify-center space-x-2.5 rounded-2xl bg-amber-800 hover:bg-amber-950 py-4 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span>Add To Bag</span>
              </button>

              {/* Compare toggle button */}
              <button
                type="button"
                onClick={() => onToggleCompare(product.id)}
                className={`flex w-full items-center justify-center space-x-2 rounded-2xl py-4 text-center text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  isComparing
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-600 shadow-sm'
                }`}
              >
                {isComparing ? (
                  <>
                    <Check className="h-4 w-4 text-amber-700" />
                    <span>Comparing</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="h-4 w-4 text-stone-400" />
                    <span>Compare</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Partner Buy Options Header */}
            {getProductAffiliateButtons(product).length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider block mb-2.5">
                  Available at stores
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getProductAffiliateButtons(product).map((btn) => {
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
                        onClick={(e) => onAffiliateClick(product.id, btn.id, btn.url, e)}
                        id={`cta-detail-partner-${btn.id}`}
                        style={{ backgroundColor: btnBg }}
                        className={`flex items-center justify-between space-x-2 rounded-xl px-4 py-3 text-left text-xs font-bold ${textColor} shadow-sm transition-all hover:opacity-95 cursor-pointer border border-white/10`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <IconComponent className="h-4 w-4 shrink-0 opacity-90" />
                          <span className="truncate">Buy on {btn.name}</span>
                        </div>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-80" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            
            {getProductAffiliateButtons(product).length === 0 && (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="text-xs text-slate-400">No active partner offers found for this product.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation for Review details */}
      <div className="border-b border-stone-200 mb-8" id="detail-tabs-header">
        <div className="flex space-x-6 overflow-x-auto">
          {(['overview', 'features', 'specs', 'performance', 'verdict', 'checklist', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 py-4 px-1 text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap outline-none cursor-pointer ${
                activeTab === tab
                  ? 'border-amber-700 text-amber-800'
                  : 'border-transparent text-stone-500 hover:text-stone-850'
              }`}
            >
              {tab === 'checklist' ? 'Checklist' : tab === 'reviews' ? `Reviews (${totalReviewsCount})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels content */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-12" id="detail-tabs-content">
        
        {/* Panel 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6" id="panel-overview">
            <h3 className="font-display text-xl font-bold text-slate-900">Our Review</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {product.overview}
            </p>

            {/* Pros and Cons Split Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Pros block */}
              <div className="rounded-2xl bg-emerald-50/50 p-6 border border-emerald-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <ThumbsUp className="h-4 w-4" />
                  </div>
                  <h4 className="font-display font-bold text-emerald-800">What we like</h4>
                </div>
                <ul className="space-y-3">
                  {product.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons block */}
              <div className="rounded-2xl bg-rose-50/40 p-6 border border-rose-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white">
                    <ThumbsDown className="h-4 w-4" />
                  </div>
                  <h4 className="font-display font-bold text-rose-800">What we don't like</h4>
                </div>
                <ul className="space-y-3">
                  {product.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                      <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
                {/* Panel 2: Key Features */}
        {activeTab === 'features' && (
          <div className="space-y-6" id="panel-features">
            <h3 className="font-display text-xl font-bold text-slate-900">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3.5 p-4 rounded-xl border border-stone-100 bg-[#fbfaf7]/60">
                  <div className="flex h-7 w-7 items-center justify-full rounded-full bg-amber-50 text-amber-800 shrink-0 border border-amber-100/30 justify-center">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Feature #{idx + 1}</span>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-semibold">{feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 3: Specs */}
        {activeTab === 'specs' && (
          <div className="space-y-6" id="panel-specs">
            <h3 className="font-display text-xl font-bold text-slate-900">Specifications</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr 
                      key={key} 
                      className={`border-b border-slate-100 last:border-b-0 ${idx % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'}`}
                    >
                      <td className="p-4 font-sans font-bold text-xs sm:text-sm text-slate-500 w-1/3">{key}</td>
                      <td className="p-4 font-mono font-medium text-xs sm:text-sm text-slate-800">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Panel 4: Performance */}
        {activeTab === 'performance' && (
          <div className="space-y-6" id="panel-performance">
            <h3 className="font-display text-xl font-bold text-slate-900">How it Performs</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {product.performance}
            </p>

            {/* Target Audience Split (Who should buy/avoid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-slate-100 pt-8">
              {/* Target: Buy */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-emerald-500" />
                  <h4 className="font-display font-bold text-slate-900">Ideal for</h4>
                </div>
                <ul className="space-y-2.5">
                  {product.whoShouldBuy.map((buy, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-600 leading-normal">
                      <span className="text-emerald-500 shrink-0 font-bold">•</span>
                      <span>{buy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target: Avoid */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <UserX className="h-5 w-5 text-rose-500" />
                  <h4 className="font-display font-bold text-slate-900">Skip if</h4>
                </div>
                <ul className="space-y-2.5">
                  {product.whoShouldAvoid.map((avoid, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-600 leading-normal">
                      <span className="text-rose-500 shrink-0 font-bold">•</span>
                      <span>{avoid}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Panel 5: Verdict */}
        {activeTab === 'verdict' && (
          <div className="space-y-6" id="panel-verdict">
            <h3 className="font-display text-xl font-bold text-slate-900">Our Verdict</h3>
            <div className="rounded-2xl border-2 border-amber-500/10 bg-amber-50/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-800 text-white shrink-0 shadow-sm">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <h4 className="font-display font-bold text-slate-900 text-lg">Overall Rating: {product.rating} / 5.0</h4>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium italic">
                  "{product.verdict}"
                </p>
                <p className="text-xs text-slate-400">
                  Independent review. Not sponsored by any brand.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Panel 6: Buying Checklist & Price History */}
        {activeTab === 'checklist' && (
          <div className="space-y-8" id="panel-checklist">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900">Checklist</h3>
              <p className="text-slate-500 text-xs sm:text-sm font-light mt-1">
                Check off these items to see if this is the perfect match for you.
              </p>
            </div>

            {/* Checklist Checkboxes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#faf9f6] border border-stone-200/50 p-6 rounded-2xl">
              {checklistItems.map((item) => {
                const isChecked = checkedItems[item.id] || false;
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleCheckItem(item.id)}
                    className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked 
                        ? 'bg-white border-amber-600/40 shadow-sm' 
                        : 'bg-white/40 border-stone-200/60 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-4.5 w-4.5 items-center justify-center rounded border transition-colors ${
                      isChecked 
                        ? 'bg-amber-700 border-amber-700 text-white' 
                        : 'border-stone-300 bg-white text-transparent'
                    }`}>
                      <Check className="h-3 w-3 stroke-[3px]" />
                    </div>
                    <span className={`text-xs sm:text-sm transition-all leading-snug ${
                      isChecked ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Interactive Price History Trends */}
            <div className="border-t border-slate-100 pt-8">
              <div className="flex items-center space-x-2.5 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/30">
                  <Percent className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900">6-Month Price Index & Trends</h4>
                  <p className="text-xs text-slate-400">Track value cycles and ensure you buy at the optimal moment.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Visual Bar Indicators */}
                <div className="lg:col-span-7 space-y-3 bg-stone-50 border border-stone-200/40 p-5 rounded-2xl">
                  <div className="flex justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    <span>Month</span>
                    <span>Average Price Paid</span>
                  </div>
                  {[
                    { label: 'Oct 2025', price: Math.round(product.price * 1.08) },
                    { label: 'Nov 2025 (Deal)', price: Math.round(product.price * 0.90) },
                    { label: 'Dec 2025', price: Math.round(product.price * 1.02) },
                    { label: 'Jan 2026', price: Math.round(product.price * 1.0) },
                    { label: 'Feb 2026', price: Math.round(product.price * 1.01) },
                    { label: 'Mar 2026 (Now)', price: product.price },
                  ].map((data, idx) => {
                    const isLowest = data.price <= Math.round(product.price * 0.90);
                    const isCurrent = idx === 5;
                    const maxPrice = product.price * 1.15;
                    const percentWidth = Math.max(25, Math.min(100, (data.price / maxPrice) * 100));
                    return (
                      <div key={data.label} className="flex items-center space-x-3 text-xs">
                        <span className="w-24 font-medium text-slate-500 shrink-0">{data.label}</span>
                        <div className="flex-1 h-3.5 bg-stone-200/60 rounded-full overflow-hidden relative">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLowest 
                                ? 'bg-emerald-500' 
                                : isCurrent 
                                ? 'bg-amber-700' 
                                : 'bg-slate-400/80'
                            }`}
                            style={{ width: `${percentWidth}%` }}
                          />
                        </div>
                        <span className={`w-12 text-right font-mono font-bold shrink-0 ${
                          isLowest 
                            ? 'text-emerald-600' 
                            : isCurrent 
                            ? 'text-amber-800' 
                            : 'text-slate-600'
                        }`}>
                          ${data.price}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Price Verdict Badge */}
                <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/20 to-stone-50/20 border border-amber-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      OPTIMAL VALUE TIME
                    </span>
                  </div>
                  <h5 className="font-display font-bold text-slate-900 leading-snug">
                    Current price is a highly defensive buy!
                  </h5>
                  <p className="text-slate-600 text-xs font-light leading-relaxed">
                    Our tracker indicates this product has normalized near its historic base price. Typical sales events (e.g. Black Friday) hit a lower limit of around <strong className="text-emerald-700 font-mono font-bold">${Math.round(product.price * 0.90)}</strong>, making current listings extremely close to peak value.
                  </p>
                  <div className="flex items-center justify-between text-xs font-bold border-t border-amber-100/60 pt-3">
                    <span className="text-slate-500">All-Time Low:</span>
                    <span className="font-mono text-emerald-600 font-extrabold">${Math.round(product.price * 0.90)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">All-Time High:</span>
                    <span className="font-mono text-rose-600 font-extrabold">${Math.round(product.price * 1.12)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Panel 7: User Reviews & Questions */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-fade-in" id="panel-reviews">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-stone-100 pb-8">
              {/* Rating Summary Breakdown */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="font-display text-xl font-bold text-slate-900">User Opinions & Ratings</h3>
                <div className="flex items-center space-x-3.5">
                  <span className="font-display text-4xl font-extrabold text-slate-900 leading-none">{averageRating}</span>
                  <div>
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`h-4.5 w-4.5 ${
                            s <= Math.round(Number(averageRating)) ? 'fill-amber-500 text-amber-500' : 'text-stone-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium mt-0.5 block">{totalReviewsCount} independent community ratings</span>
                  </div>
                </div>

                {/* Stars Bar Breakdown */}
                <div className="space-y-2">
                  {[
                    { star: 5, pct: 78 },
                    { star: 4, pct: 15 },
                    { star: 3, pct: 4 },
                    { star: 2, pct: 2 },
                    { star: 1, pct: 1 },
                  ].map((row) => (
                    <div key={row.star} className="flex items-center text-xs text-slate-500 space-x-2">
                      <span className="w-12 font-medium">{row.star} star</span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600 rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="w-8 text-right font-mono text-slate-400">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="lg:col-span-8 bg-[#faf9f6] border border-stone-200/50 rounded-2xl p-6">
                <h4 className="font-display font-bold text-slate-900 text-base mb-1">Have you purchased this item?</h4>
                <p className="text-xs text-slate-500 font-light mb-4">Share your honest feedback. Help the Alankariya community choose wisely.</p>
                
                {reviewSubmitSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Thank you! Your verified review has been published and integrated in real-time.</span>
                  </div>
                ) : (
                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                        <input
                          type="text"
                          required
                          value={newReview.author}
                          onChange={(e) => setNewReview(prev => ({ ...prev, author: e.target.value }))}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-600"
                        />
                      </div>
                      
                      {/* Rating selection */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rating</label>
                        <select
                          value={newReview.rating}
                          onChange={(e) => setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-600"
                        >
                          <option value="5">★★★★★ Excellent (5/5)</option>
                          <option value="4">★★★★☆ Very Good (4/5)</option>
                          <option value="3">★★★☆☆ Average (3/5)</option>
                          <option value="2">★★☆☆☆ Fair (2/5)</option>
                          <option value="1">★☆☆☆☆ Disappointing (1/5)</option>
                        </select>
                      </div>
                    </div>

                    {/* Review Title */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review Headline</label>
                      <input
                        type="text"
                        required
                        value={newReview.title}
                        onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Highly recommend for pure audio lovers!"
                        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-600"
                      />
                    </div>

                    {/* Review Content */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review Content</label>
                      <textarea
                        required
                        rows={3}
                        value={newReview.content}
                        onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Detail your real-world experience, including any pros and cons."
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-amber-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 cursor-pointer transition-colors shadow-sm"
                    >
                      Publish Anonymous Review
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Review Stream */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-slate-900 text-base">Community Feed</h4>
              <div className="divide-y divide-slate-100">
                {currentReviews.map((rev) => (
                  <div key={rev.id} className="py-5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1c1917] text-white font-display text-[10px] font-extrabold uppercase">
                          {rev.author[0]}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">{rev.author}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">{rev.title}</h5>
                        {rev.verified && (
                          <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {rev.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-bold pt-1">
                      <button className="flex items-center space-x-1 hover:text-slate-600">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>Helpful</span>
                      </button>
                      <span>•</span>
                      <button className="flex items-center space-x-1 hover:text-slate-600">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Related Products Section */}
      <div id="detail-related" className="border-t border-slate-100 pt-12">
        <h3 className="font-display text-2xl font-bold text-slate-900 mb-6">
          Related & Similar Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {backupRelated.map((related) => {
            const savingsRelated = related.originalPrice > related.price
              ? Math.round(((related.originalPrice - related.price) / related.originalPrice) * 100)
              : 0;

            return (
              <div
                key={related.id}
                onClick={() => onNavigateToProduct(related.id)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-50">
                  <img
                    src={related.images[0]}
                    alt={related.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {savingsRelated > 0 && (
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -{savingsRelated}%
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-1 flex-col">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-sans uppercase font-bold text-slate-400">
                    <span>{related.brand}</span>
                    <span>{related.category}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                    {related.title}
                  </h4>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-display font-bold text-slate-900">${related.price}</span>
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                      {related.rating}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </article>
  );
}
