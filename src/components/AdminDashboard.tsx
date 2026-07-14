import React, { useState, useEffect } from 'react';
import { Product, Post, FAQItem, AnalyticsEvent, AffiliateButton, StarProduct, ProductCategory, NewsletterSubscriber } from '../types';
import { 
  Plus, Edit, Trash, BarChart3, Tag, HelpCircle, Layers, FileText, CheckCircle2,
  TrendingUp, Download, Eye, Link, Star, Sparkles, Image, Check, AlertCircle, ShoppingBag, Search,
  ChevronUp, ChevronDown, Calendar, ToggleLeft, ToggleRight, Mail, Filter, Globe, Smartphone, Laptop, RefreshCw, CheckCircle, ShieldAlert
} from 'lucide-react';
import { generateXMLSitemap, generateRobotsTxt } from '../utils/seo';
import { 
  getNewsletterSubscribersFromFirestore, 
  deleteNewsletterSubscriberFromFirestore, 
  updateNewsletterSubscriberStatusInFirestore 
} from '../lib/firebase';

interface AdminDashboardProps {
  products: Product[];
  posts: Post[];
  faqs: FAQItem[];
  analyticsEvents: AnalyticsEvent[];
  starProducts: StarProduct[];
  categories?: ProductCategory[];
  onUpdateProducts: (newProducts: Product[]) => void;
  onUpdatePosts: (newPosts: Post[]) => void;
  onUpdateFaqs: (newFaqs: FAQItem[]) => void;
  onUpdateStarProducts: (newStars: StarProduct[]) => void;
  onUpdateCategories?: (newCategories: ProductCategory[]) => void;
}

export default function AdminDashboard({
  products,
  posts,
  faqs,
  analyticsEvents,
  starProducts = [],
  categories = [],
  onUpdateProducts,
  onUpdatePosts,
  onUpdateFaqs,
  onUpdateStarProducts,
  onUpdateCategories
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'articles' | 'seo' | 'star_products' | 'categories' | 'newsletter'>('analytics');
  
  // Newsletter Subscriptions States
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isSubscribersLoading, setIsSubscribersLoading] = useState(true);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberSourceFilter, setSubscriberSourceFilter] = useState<'all' | 'homepage' | 'footer' | 'popup' | 'banner'>('all');
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [subscriberSortField, setSubscriberSortField] = useState<'createdAt' | 'email'>('createdAt');
  const [subscriberSortOrder, setSubscriberSortOrder] = useState<'asc' | 'desc'>('desc');
  const [subscriberPage, setSubscriberPage] = useState(1);
  const subscribersPerPage = 10;

  useEffect(() => {
    if (activeTab === 'newsletter') {
      loadSubscribers();
    }
  }, [activeTab]);

  const loadSubscribers = async () => {
    setIsSubscribersLoading(true);
    try {
      const list = await getNewsletterSubscribersFromFirestore();
      setSubscribers(list);
    } catch (e) {
      console.error('Error loading subscribers in admin:', e);
    } finally {
      setIsSubscribersLoading(false);
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete subscriber: ${email}?`)) {
      return;
    }
    try {
      await deleteNewsletterSubscriberFromFirestore(email);
      setSubscribers((prev) => prev.filter((s) => s.email !== email));
    } catch (e) {
      alert('Error deleting subscriber: ' + e);
    }
  };

  const handleToggleSubscriberStatus = async (email: string, currentStatus: 'active' | 'disabled') => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await updateNewsletterSubscriberStatusInFirestore(email, newStatus);
      setSubscribers((prev) =>
        prev.map((s) => (s.email === email ? { ...s, status: newStatus, lastUpdated: new Date().toISOString() } : s))
      );
    } catch (e) {
      alert('Error updating subscriber status: ' + e);
    }
  };
  
  // States for Product Edit Form
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [pForm, setPForm] = useState({
    title: '', brand: '', category: '', description: '', shortDescription: '',
    rating: 4.5, price: 0, originalPrice: 0, isBestSeller: false, isEditorsChoice: false, isDailyStar: false,
    amazonUrl: '', flipkartUrl: '',
    overview: '', performance: '', verdict: '',
    imagesInput: '', keyFeaturesInput: '', prosInput: '', consInput: '',
    tagsInput: '', whoBuyInput: '', whoAvoidInput: '',
    specifications: [] as { key: string; value: string }[],
    affiliateButtons: [] as AffiliateButton[],
    sizesInput: '',
    colorsInput: '',
    subcategory: '',
    aiTagsInput: '',
    communityExpertSummary: '',
    recommendationNotes: '',
    amazonPrice: 0,
    amazonUrlInput: '',
    flipkartPrice: 0,
    flipkartUrlInput: '',
    myntraPrice: 0,
    myntraUrlInput: ''
  });

  // States for Article Edit Form
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '', postType: 'blog' as 'blog' | 'guide', summary: '', content: '',
    image: '', category: '', author: '', readTime: '5 min read',
    tagsInput: '', relatedProductIdsInput: ''
  });

  // States for Star Product Form
  const [editingStar, setEditingStar] = useState<StarProduct | null>(null);
  const [isStarFormOpen, setIsStarFormOpen] = useState(false);
  const [starForm, setStarForm] = useState({
    title: '',
    image: '',
    originalPrice: 0,
    discountedPrice: 0,
    affiliateUrl: '',
    startDate: '',
    endDate: '',
    badgeType: 'biggest_deal' as 'biggest_deal' | 'limited_time' | 'best_discount',
    badgeText: "🔥 Today's Biggest Deal",
    enabled: true
  });

  // States for Category Management Form
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [cForm, setCForm] = useState({
    name: '',
    description: '',
    order: 0
  });
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // --- Compute Analytics Metrics ---
  const views = analyticsEvents.filter(e => e.eventType === 'page_view');
  const clicks = analyticsEvents.filter(e => e.eventType === 'click_affiliate');
  const uniqueSessions = new Set(analyticsEvents.map(e => e.sessionId)).size;

  const totalViews = views.length;
  const totalClicks = clicks.length;
  const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  // Network Click Breakdown
  const clickBreakdown = clicks.reduce((acc, curr) => {
    const net = curr.network || 'other';
    acc[net] = (acc[net] || 0) + 1;
    return acc;
  }, { amazon: 0, flipkart: 0, earnkaro: 0, other: 0 });

  // Popular products tracked
  const productViewCounts = views.reduce((acc, e) => {
    if (e.targetId) acc[e.targetId] = (acc[e.targetId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const productClickCounts = clicks.reduce((acc, e) => {
    if (e.targetId) acc[e.targetId] = (acc[e.targetId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popularProductMetrics = products.map(p => {
    const pViews = productViewCounts[p.id] || 0;
    const pClicks = productClickCounts[p.id] || 0;
    const ctr = pViews > 0 ? ((pClicks / pViews) * 100).toFixed(1) : '0.0';
    return { id: p.id, title: p.title, views: pViews, clicks: pClicks, ctr };
  }).sort((a, b) => b.clicks - a.clicks);

  // Search term trends
  const searchTerms = analyticsEvents
    .filter(e => e.eventType === 'search' && e.targetName)
    .reduce((acc, e) => {
      const term = (e.targetName || '').trim().toLowerCase();
      if (term) acc[term] = (acc[term] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedSearchTerms = Object.entries(searchTerms)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // --- CRUD Handlers for Products ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPForm({
      title: '', brand: '', category: categories[0]?.name || 'Audio', description: '', shortDescription: '',
      rating: 4.8, price: 99, originalPrice: 129, isBestSeller: false, isEditorsChoice: false, isDailyStar: false,
      amazonUrl: '', flipkartUrl: '',
      overview: '', performance: '', verdict: '',
      imagesInput: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      keyFeaturesInput: 'Industry-leading noise cancellation\nLong battery life\nHigh fidelity sound',
      prosInput: 'Comfortable fit\nExcellent ANC\nDeep bass',
      consInput: 'Expensive price\nNo fold-flat design',
      tagsInput: 'Audio, ANC, Premium',
      whoBuyInput: 'Frequent travelers\nMusic lovers',
      whoAvoidInput: 'Active runners',
      specifications: [
        { key: 'Connectivity', value: 'Bluetooth 5.2' },
        { key: 'Battery Life', value: '30 Hours' }
      ],
      affiliateButtons: [],
      sizesInput: '',
      colorsInput: '',
      subcategory: '',
      aiTagsInput: '',
      communityExpertSummary: '',
      recommendationNotes: '',
      amazonPrice: 0,
      amazonUrlInput: '',
      flipkartPrice: 0,
      flipkartUrlInput: '',
      myntraPrice: 0,
      myntraUrlInput: ''
    });
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setPForm({
      title: p.title, brand: p.brand, category: p.category, description: p.description, shortDescription: p.shortDescription,
      rating: p.rating, price: p.price, originalPrice: p.originalPrice, isBestSeller: p.isBestSeller, isEditorsChoice: p.isEditorsChoice, isDailyStar: !!p.isDailyStar,
      amazonUrl: p.amazonUrl, flipkartUrl: p.flipkartUrl,
      overview: p.overview, performance: p.performance, verdict: p.verdict,
      imagesInput: p.images.join('\n'),
      keyFeaturesInput: p.keyFeatures.join('\n'),
      prosInput: p.pros.join('\n'),
      consInput: p.cons.join('\n'),
      tagsInput: p.tags.join(', '),
      whoBuyInput: p.whoShouldBuy.join('\n'),
      whoAvoidInput: p.whoShouldAvoid.join('\n'),
      specifications: Object.entries(p.specifications).map(([key, value]) => ({ key, value })),
      affiliateButtons: p.affiliateButtons || [],
      sizesInput: p.sizes ? p.sizes.join(', ') : '',
      colorsInput: p.colors ? p.colors.join(', ') : '',
      subcategory: p.subcategory || '',
      aiTagsInput: p.aiTags ? p.aiTags.join(', ') : '',
      communityExpertSummary: p.communityExpertSummary || '',
      recommendationNotes: p.recommendationNotes || '',
      amazonPrice: p.retailers?.find(r => r.name === 'Amazon')?.price || p.price || 0,
      amazonUrlInput: p.retailers?.find(r => r.name === 'Amazon')?.url || p.amazonUrl || '',
      flipkartPrice: p.retailers?.find(r => r.name === 'Flipkart')?.price || p.price || 0,
      flipkartUrlInput: p.retailers?.find(r => r.name === 'Flipkart')?.url || p.flipkartUrl || '',
      myntraPrice: p.retailers?.find(r => r.name === 'Myntra')?.price || 0,
      myntraUrlInput: p.retailers?.find(r => r.name === 'Myntra')?.url || ''
    });
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedImages = pForm.imagesInput.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedFeatures = pForm.keyFeaturesInput.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedPros = pForm.prosInput.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedCons = pForm.consInput.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedWhoBuy = pForm.whoBuyInput.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedWhoAvoid = pForm.whoAvoidInput.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedTags = pForm.tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsedSizes = pForm.sizesInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsedColors = pForm.colorsInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsedAiTags = pForm.aiTagsInput.split(',').map(s => s.trim()).filter(Boolean);

    const parsedSpecs: Record<string, string> = {};
    pForm.specifications.forEach(item => {
      if (item.key.trim()) parsedSpecs[item.key.trim()] = item.value.trim();
    });

    const constructedRetailers = [];
    if (pForm.amazonPrice > 0 || pForm.amazonUrlInput.trim()) {
      constructedRetailers.push({
        name: 'Amazon',
        price: Number(pForm.amazonPrice),
        url: pForm.amazonUrlInput.trim(),
        lastUpdated: new Date().toISOString()
      });
    }
    if (pForm.flipkartPrice > 0 || pForm.flipkartUrlInput.trim()) {
      constructedRetailers.push({
        name: 'Flipkart',
        price: Number(pForm.flipkartPrice),
        url: pForm.flipkartUrlInput.trim(),
        lastUpdated: new Date().toISOString()
      });
    }
    if (pForm.myntraPrice > 0 || pForm.myntraUrlInput.trim()) {
      constructedRetailers.push({
        name: 'Myntra',
        price: Number(pForm.myntraPrice),
        url: pForm.myntraUrlInput.trim(),
        lastUpdated: new Date().toISOString()
      });
    }

    const finalProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: pForm.title,
      brand: pForm.brand,
      category: pForm.category,
      subcategory: pForm.subcategory,
      description: pForm.description,
      shortDescription: pForm.shortDescription,
      images: parsedImages.length > 0 ? parsedImages : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      rating: Number(pForm.rating),
      price: Number(pForm.price),
      originalPrice: Number(pForm.originalPrice),
      isBestSeller: pForm.isBestSeller,
      isEditorsChoice: pForm.isEditorsChoice,
      isDailyStar: pForm.isDailyStar,
      amazonUrl: pForm.amazonUrlInput.trim() || pForm.amazonUrl,
      flipkartUrl: pForm.flipkartUrlInput.trim() || pForm.flipkartUrl,
      earnkaroUrl: '',
      otherUrl: '',
      overview: pForm.overview || pForm.description,
      keyFeatures: parsedFeatures,
      pros: parsedPros,
      cons: parsedCons,
      specifications: parsedSpecs,
      performance: pForm.performance || 'Highly optimized for daily operations.',
      whoShouldBuy: parsedWhoBuy,
      whoShouldAvoid: parsedWhoAvoid,
      verdict: pForm.verdict || 'A great product that checks all the right boxes.',
      tags: parsedTags,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      affiliateButtons: pForm.affiliateButtons,
      sizes: parsedSizes,
      colors: parsedColors,
      aiTags: parsedAiTags,
      communityExpertSummary: pForm.communityExpertSummary,
      recommendationNotes: pForm.recommendationNotes,
      retailers: constructedRetailers
    };

    let updatedList;
    if (editingProduct) {
      updatedList = products.map(p => p.id === editingProduct.id ? finalProduct : p);
    } else {
      updatedList = [finalProduct, ...products];
    }

    onUpdateProducts(updatedList);
    setIsProductFormOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== productId);
      onUpdateProducts(updated);
    }
  };

  const handleAddSpecRow = () => {
    setPForm({
      ...pForm,
      specifications: [...pForm.specifications, { key: '', value: '' }]
    });
  };

  const handleRemoveSpecRow = (idx: number) => {
    const updated = [...pForm.specifications];
    updated.splice(idx, 1);
    setPForm({ ...pForm, specifications: updated });
  };

  const handleSpecChange = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = [...pForm.specifications];
    updated[idx][field] = val;
    setPForm({ ...pForm, specifications: updated });
  };

  // --- CRUD Handlers for Blog/Guides ---
  const handleOpenAddPost = () => {
    setEditingPost(null);
    setPostForm({
      title: '', postType: 'blog', summary: '', content: '',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
      category: categories[0]?.name || 'Fashion', author: 'Alankariya Curator', readTime: '5 min read',
      tagsInput: 'Style, Curation', relatedProductIdsInput: ''
    });
    setIsPostFormOpen(true);
  };

  const handleOpenEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title, postType: post.postType, summary: post.summary, content: post.content,
      image: post.image, category: post.category, author: post.author, readTime: post.readTime,
      tagsInput: post.tags.join(', '),
      relatedProductIdsInput: post.relatedProductIds.join(', ')
    });
    setIsPostFormOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedTags = postForm.tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsedRelated = postForm.relatedProductIdsInput.split(',').map(s => s.trim()).filter(Boolean);

    const finalPost: Post = {
      id: editingPost ? editingPost.id : `post-${Date.now()}`,
      title: postForm.title,
      slug: postForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      postType: postForm.postType,
      summary: postForm.summary,
      content: postForm.content,
      image: postForm.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      category: postForm.category,
      author: postForm.author,
      readTime: postForm.readTime,
      publishedAt: editingPost ? editingPost.publishedAt : new Date().toISOString(),
      relatedProductIds: parsedRelated,
      tags: parsedTags
    };

    let updatedList;
    if (editingPost) {
      updatedList = posts.map(p => p.id === editingPost.id ? finalPost : p);
    } else {
      updatedList = [finalPost, ...posts];
    }

    onUpdatePosts(updatedList);
    setIsPostFormOpen(false);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      const updated = posts.filter(p => p.id !== postId);
      onUpdatePosts(updated);
    }
  };

  // --- CRUD Handlers for Star Products ---
  const handleOpenAddStarProduct = () => {
    setEditingStar(null);
    setStarForm({
      title: '',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      originalPrice: 449,
      discountedPrice: 349,
      affiliateUrl: 'https://amazon.com/dp/B09XS7JLH3?tag=myaffiliate-20',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      badgeType: 'biggest_deal',
      badgeText: "🔥 Today's Biggest Deal",
      enabled: true
    });
    setIsStarFormOpen(true);
  };

  const handleOpenEditStarProduct = (star: StarProduct) => {
    setEditingStar(star);
    setStarForm({
      title: star.title,
      image: star.image,
      originalPrice: star.originalPrice,
      discountedPrice: star.discountedPrice,
      affiliateUrl: star.affiliateUrl,
      startDate: star.startDate || '',
      endDate: star.endDate || '',
      badgeType: star.badgeType,
      badgeText: star.badgeText,
      enabled: star.enabled
    });
    setIsStarFormOpen(true);
  };

  const calculateDiscountPercent = (original: number, discounted: number) => {
    if (!original || original <= 0 || !discounted || discounted <= 0) return 0;
    if (discounted >= original) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  const handleSaveStarProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const pct = calculateDiscountPercent(Number(starForm.originalPrice), Number(starForm.discountedPrice));
    
    const finalStar: StarProduct = {
      id: editingStar ? editingStar.id : `star-${Date.now()}`,
      title: starForm.title,
      image: starForm.image,
      originalPrice: Number(starForm.originalPrice),
      discountedPrice: Number(starForm.discountedPrice),
      discountPercentage: pct,
      affiliateUrl: starForm.affiliateUrl,
      startDate: starForm.startDate,
      endDate: starForm.endDate,
      order: editingStar ? editingStar.order : starProducts.length,
      enabled: starForm.enabled,
      badgeType: starForm.badgeType,
      badgeText: starForm.badgeText,
      createdAt: editingStar ? editingStar.createdAt : new Date().toISOString()
    };

    let updatedList;
    if (editingStar) {
      updatedList = starProducts.map(s => s.id === editingStar.id ? finalStar : s);
    } else {
      updatedList = [...starProducts, finalStar];
    }
    
    // Sort and map correct index positions for order safety
    updatedList = updatedList.map((item, index) => ({
      ...item,
      order: index
    }));

    onUpdateStarProducts(updatedList);
    setIsStarFormOpen(false);
  };

  const handleDeleteStarProduct = (starId: string) => {
    if (window.confirm('Are you sure you want to delete this star product?')) {
      const updated = starProducts.filter(s => s.id !== starId).map((item, index) => ({
        ...item,
        order: index
      }));
      onUpdateStarProducts(updated);
    }
  };

  const handleToggleStarProduct = (starId: string) => {
    const updated = starProducts.map(s => s.id === starId ? { ...s, enabled: !s.enabled } : s);
    onUpdateStarProducts(updated);
  };

  const handleMoveStarProduct = (idx: number, direction: 'up' | 'down') => {
    const updated = [...starProducts];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    
    // Swap positions
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    
    // Reindex order values
    const finalOrdered = updated.map((item, index) => ({
      ...item,
      order: index
    }));

    onUpdateStarProducts(finalOrdered);
  };

  // --- Category Management Event Handlers ---
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCForm({
      name: '',
      description: '',
      order: categories.length
    });
    setIsCategoryFormOpen(true);
  };

  const handleOpenEditCategory = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setCForm({
      name: cat.name,
      description: cat.description || '',
      order: cat.order ?? 0
    });
    setIsCategoryFormOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cForm.name.trim()) return;

    const finalCategory: ProductCategory = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: cForm.name.trim(),
      description: cForm.description.trim(),
      order: editingCategory ? (editingCategory.order ?? 0) : categories.length
    };

    let updatedList: ProductCategory[];
    if (editingCategory) {
      updatedList = categories.map(c => c.id === editingCategory.id ? finalCategory : c);
    } else {
      updatedList = [...categories, finalCategory];
    }

    // Reindex order values
    updatedList = updatedList.map((item, index) => ({
      ...item,
      order: index
    }));

    if (onUpdateCategories) {
      onUpdateCategories(updatedList);
    }
    setIsCategoryFormOpen(false);
  };

  const handleDeleteCategory = (catId: string) => {
    setDeletingCategoryId(catId);
  };

  const handleMoveCategory = (idx: number, direction: 'up' | 'down') => {
    const updated = [...categories];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap positions
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Reindex order values
    const finalOrdered = updated.map((item, index) => ({
      ...item,
      order: index
    }));

    if (onUpdateCategories) {
      onUpdateCategories(finalOrdered);
    }
  };

  // --- Dynamic XML / SEO download files ---
  const handleDownloadSitemap = () => {
    const baseUrl = window.location.origin;
    const xml = generateXMLSitemap(products, posts, baseUrl);
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadRobots = () => {
    const baseUrl = window.location.origin;
    const txt = generateRobotsTxt(baseUrl);
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="admin-dashboard-container">
      
      {/* Upper Brand Intro */}
      <div className="mb-8 border-b border-stone-100 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-[10px] font-extrabold uppercase text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
            Alankariya Affiliate Center
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-stone-900 mt-1">
            Admin Management Console
          </h1>
          <p className="text-sm text-stone-500">
            Control sitemaps, catalog metrics, product records, articles, and affiliate advertising tags instantly.
          </p>
        </div>
        
        {/* Dynamic File Export Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadSitemap}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-600 transition-all shadow-sm cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-amber-700" />
            <span>Sitemap.xml</span>
          </button>
          <button
            onClick={handleDownloadRobots}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-600 transition-all shadow-sm cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Robots.txt</span>
          </button>
        </div>
      </div>

      {/* Admin Panel Tabs */}
      <div className="flex space-x-2 border-b border-stone-200 pb-3 mb-8 overflow-x-auto" id="admin-tabs">
        {[
          { id: 'analytics', label: 'Analytics Reports', icon: BarChart3 },
          { id: 'products', label: 'Products Inventory', icon: ShoppingBag },
          { id: 'categories', label: 'Product Categories', icon: Layers },
          { id: 'star_products', label: '⭐ Star Products', icon: Star },
          { id: 'articles', label: 'Editorial Guides', icon: FileText },
          { id: 'seo', label: 'Sitemap & SEO', icon: Sparkles },
          { id: 'newsletter', label: 'Newsletter Console', icon: Mail }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap outline-none ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: ANALYTICS REPORTS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8" id="admin-tab-analytics">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Page Views', value: totalViews, color: 'text-blue-600', bg: 'bg-blue-50/50' },
              { label: 'Affiliate Clicks', value: totalClicks, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
              { label: 'Average CTR', value: `${overallCtr}%`, color: 'text-amber-600', bg: 'bg-amber-50/50' },
              { label: 'Unique Visitors', value: uniqueSessions, color: 'text-purple-600', bg: 'bg-purple-50/50' }
            ].map((card, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`mt-2 font-display text-2xl sm:text-3xl font-extrabold ${card.color}`}>{card.value}</div>
                <div className="mt-1 flex items-center space-x-1 text-[10px] text-slate-400">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>Real-time local tracking</span>
                </div>
              </div>
            ))}
          </div>

          {/* Clicks Breakdown and Search terms */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Click breakdown by partner */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-5">
                Clicks Per Partner Network
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Amazon Web Store', count: clickBreakdown.amazon, pct: totalClicks > 0 ? (clickBreakdown.amazon / totalClicks * 100).toFixed(0) : 0, color: 'bg-amber-400' },
                  { name: 'Flipkart Online', count: clickBreakdown.flipkart, pct: totalClicks > 0 ? (clickBreakdown.flipkart / totalClicks * 100).toFixed(0) : 0, color: 'bg-blue-500' },
                  { name: 'EarnKaro Network', count: clickBreakdown.earnkaro, pct: totalClicks > 0 ? (clickBreakdown.earnkaro / totalClicks * 100).toFixed(0) : 0, color: 'bg-emerald-500' },
                  { name: 'Direct Alternatives', count: clickBreakdown.other, pct: totalClicks > 0 ? (clickBreakdown.other / totalClicks * 100).toFixed(0) : 0, color: 'bg-slate-500' }
                ].map((net, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{net.name}</span>
                      <span className="font-mono text-slate-500 font-bold">{net.count} clicks ({net.pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${net.color}`} style={{ width: `${net.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Search Terms */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-5">
                Top User Search Queries
              </h3>
              {sortedSearchTerms.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No search keywords tracked yet. Try typing inside the header search bar.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {sortedSearchTerms.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <span className="font-sans font-bold text-xs text-slate-700 truncate capitalize pr-2">
                        {idx + 1}. "{item.term}"
                      </span>
                      <span className="font-mono text-[10px] font-bold text-blue-600 shrink-0">
                        {item.count} queries
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular Products Click-Through Table */}
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">
                CTR Dashboard Per Product
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Total Views</th>
                    <th className="p-4">Affiliate Clicks</th>
                    <th className="p-4">Click-Through (CTR)</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-50">
                  {popularProductMetrics.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800 max-w-sm truncate">{p.title}</td>
                      <td className="p-4 font-mono font-bold text-slate-500">{p.views}</td>
                      <td className="p-4 font-mono font-bold text-emerald-600">{p.clicks}</td>
                      <td className="p-4">
                        <span className={`inline-flex rounded px-1.5 py-0.5 font-mono font-extrabold ${
                          Number(p.ctr) > 20 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.ctr}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: PRODUCTS CRUD INVENTORY --- */}
      {activeTab === 'products' && (
        <div className="space-y-6" id="admin-tab-products">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Total Catalog items: {products.length}
            </span>
            <button
              onClick={handleOpenAddProduct}
              id="admin-add-product-btn"
              className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Product Items Table list */}
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm" id="admin-products-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-4">Item</th>
                  <th className="p-4">Brand / Cat</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Prices</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="max-w-xs sm:max-w-md">
                          <p className="font-bold text-slate-900 truncate">{p.title}</p>
                          <div className="flex space-x-2 mt-0.5">
                            {p.isBestSeller && <span className="text-[9px] bg-amber-500 text-white font-bold px-1 rounded uppercase">Best</span>}
                            {p.isEditorsChoice && <span className="text-[9px] bg-blue-600 text-white font-bold px-1 rounded uppercase">Editor</span>}
                            {p.isDailyStar && <span className="text-[9px] bg-amber-800 text-white font-bold px-1.5 py-0.5 rounded uppercase">★ Star</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-700">{p.brand}</p>
                      <p className="text-slate-400 text-[10px]">{p.category}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                        <span>{p.rating}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-slate-900">${p.price}</p>
                      {p.originalPrice > p.price && <p className="text-slate-400 text-[10px] line-through">${p.originalPrice}</p>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:border-blue-500 hover:text-blue-600 bg-white text-slate-500 transition-colors"
                          title="Edit product"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:border-red-500 hover:text-red-600 bg-white text-slate-500 transition-colors"
                          title="Delete product"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: CATEGORY SETTINGS --- */}
      {activeTab === 'categories' && (
        <div className="space-y-6" id="admin-tab-categories">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <h2 className="font-display text-xl font-extrabold text-stone-950">
                🏷️ Product Categories
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Configure classification categories for your catalog. Changes are propagated in real-time to filters and menus.
              </p>
            </div>
            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-slate-900/10 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-150 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/70 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-center">Listed Products</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400 font-medium">
                      No categories found. Click "Add Category" to get started.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => {
                    const productCount = products.filter(p => p.category === cat.name).length;
                    if (deletingCategoryId === cat.id) {
                      return (
                        <tr key={cat.id} className="bg-rose-50/50 transition-colors">
                          <td colSpan={5} className="py-4 px-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center space-x-2 text-rose-800">
                                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 animate-pulse" />
                                <span className="text-xs font-semibold">
                                  {productCount > 0 
                                    ? `Delete "${cat.name}"? Caution: ${productCount} products are listed under this category.` 
                                    : `Are you sure you want to delete "${cat.name}"?`}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = categories.filter(c => c.id !== cat.id).map((item, index) => ({
                                      ...item,
                                      order: index
                                    }));
                                    if (onUpdateCategories) {
                                      onUpdateCategories(updated);
                                    }
                                    setDeletingCategoryId(null);
                                  }}
                                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingCategoryId(null)}
                                  className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 px-3 py-1.5 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono font-medium text-stone-400">
                          <div className="flex items-center space-x-1.5">
                            <span className="min-w-4 text-center">#{index + 1}</span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveCategory(index, 'up')}
                                disabled={index === 0}
                                className="text-stone-400 hover:text-slate-950 disabled:opacity-30 disabled:hover:text-stone-400 cursor-pointer"
                                title="Move up"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleMoveCategory(index, 'down')}
                                disabled={index === categories.length - 1}
                                className="text-stone-400 hover:text-slate-950 disabled:opacity-30 disabled:hover:text-stone-400 cursor-pointer"
                                title="Move down"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-stone-900">{cat.name}</div>
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate text-stone-500">
                          {cat.description || <span className="italic text-stone-300">No description provided</span>}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            productCount > 0 ? 'bg-slate-100 text-slate-800' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {productCount} {productCount === 1 ? 'product' : 'products'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 hover:border-slate-400 hover:text-slate-950 bg-white text-stone-500 transition-colors cursor-pointer"
                              title="Edit category"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 hover:border-red-500 hover:text-red-600 bg-white text-stone-500 transition-colors cursor-pointer"
                              title="Delete category"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: ARTICLES / TECH EDITORIAL --- */}
      {activeTab === 'articles' && (
        <div className="space-y-6" id="admin-tab-articles">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Total Editorial Articles: {posts.length}
            </span>
            <button
              onClick={handleOpenAddPost}
              id="admin-add-post-btn"
              className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin-articles-list">
            {posts.map((post) => (
              <div 
                key={post.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 uppercase">
                      {post.postType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{post.readTime}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{post.summary}</p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-50">
                  <span className="text-[10px] font-mono text-slate-400">By {post.author}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenEditPost(post)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-500 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:border-red-500 hover:text-red-600 text-slate-500 transition-colors"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: SEO XML PREVIEWS --- */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="admin-tab-seo">
          {/* Sitemap preview */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">
                Live Sitemap.xml Preview
              </h4>
              <button
                onClick={handleDownloadSitemap}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>Download file</span>
              </button>
            </div>
            <textarea
              readOnly
              className="w-full h-80 font-mono text-[10px] text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 outline-none select-all"
              value={generateXMLSitemap(products, posts, window.location.origin)}
            />
          </div>

          {/* Robots preview */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">
                Live Robots.txt Preview
              </h4>
              <button
                onClick={handleDownloadRobots}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>Download file</span>
              </button>
            </div>
            <textarea
              readOnly
              className="w-full h-80 font-mono text-[11px] text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 outline-none select-all"
              value={generateRobotsTxt(window.location.origin)}
            />
          </div>
        </div>
      )}

      {/* --- TAB 5: STAR PRODUCTS MANAGEMENT --- */}
      {activeTab === 'star_products' && (
        <div className="space-y-6" id="admin-tab-star-products">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <h2 className="font-display text-xl font-extrabold text-stone-950">
                ⭐ Star Products of the Day
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Featured products showcasing spectacular discounts. Items are immediately promoted at the very top of the homepage in chronological active dates.
              </p>
            </div>
            
            <button
              onClick={handleOpenAddStarProduct}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-slate-900/10 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Star Product</span>
            </button>
          </div>

          {starProducts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl">
              <Star className="h-10 w-10 text-stone-300 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-stone-600">No Star Products created yet.</p>
              <p className="text-xs text-stone-400 mt-1">Click the "Add Star Product" button to create your first featured offer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 font-sans text-[10px] font-extrabold uppercase tracking-widest border-b border-stone-200">
                    <th className="px-6 py-4">Item details</th>
                    <th className="px-6 py-4">Badge type</th>
                    <th className="px-6 py-4">Original / Deal Price</th>
                    <th className="px-6 py-4">Promotion window</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Sorting</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                  {starProducts.map((star, idx) => {
                    const discount = star.discountPercentage || calculateDiscountPercent(star.originalPrice, star.discountedPrice);
                    return (
                      <tr key={star.id} className="hover:bg-stone-50/50 transition-colors">
                        {/* Title & Image */}
                        <td className="px-6 py-4 font-medium text-stone-900 max-w-[280px]">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={star.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'} 
                              alt={star.title}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-lg object-cover border border-stone-100 bg-stone-50 flex-shrink-0"
                            />
                            <div className="truncate font-display font-bold">
                              {star.title}
                            </div>
                          </div>
                        </td>

                        {/* Badge Type */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            star.badgeType === 'biggest_deal' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                            star.badgeType === 'limited_time' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                            'bg-emerald-50 border-emerald-100 text-emerald-700'
                          }`}>
                            {star.badgeText}
                          </span>
                        </td>

                        {/* Prices */}
                        <td className="px-6 py-4 font-mono font-medium">
                          <div className="flex flex-col">
                            <span className="text-rose-600 font-bold">${star.discountedPrice}</span>
                            <span className="text-stone-400 line-through text-[10px]">${star.originalPrice}</span>
                            <span className="text-emerald-600 text-[10px] font-black">{discount}% OFF</span>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-4 whitespace-nowrap text-stone-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <div className="flex flex-col text-[10px]">
                              <span>Start: {star.startDate || 'N/A'}</span>
                              <span>End: {star.endDate || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStarProduct(star.id)}
                            className="inline-flex items-center justify-center focus:outline-none cursor-pointer"
                          >
                            {star.enabled ? (
                              <div className="flex items-center text-emerald-600 space-x-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                                <ToggleRight className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase">Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-stone-400 space-x-1 bg-stone-100 border border-stone-200/50 px-2.5 py-1 rounded-xl">
                                <ToggleLeft className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase">Paused</span>
                              </div>
                            )}
                          </button>
                        </td>

                        {/* Sorting Buttons */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveStarProduct(idx, 'up')}
                              className={`p-1 rounded-md border border-stone-150 ${idx === 0 ? 'text-stone-300 bg-stone-50 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-100 cursor-pointer'}`}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              disabled={idx === starProducts.length - 1}
                              onClick={() => handleMoveStarProduct(idx, 'down')}
                              className={`p-1 rounded-md border border-stone-150 ${idx === starProducts.length - 1 ? 'text-stone-300 bg-stone-50 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-100 cursor-pointer'}`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEditStarProduct(star)}
                              className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 shadow-xs cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStarProduct(star.id)}
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-xs cursor-pointer"
                              title="Delete Star Product"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 6: NEWSLETTER SUBSCRIBER MANAGEMENT --- */}
      {activeTab === 'newsletter' && (
        <div className="space-y-6" id="admin-tab-newsletter">
          {/* Header segment */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <h2 className="font-display text-xl font-extrabold text-stone-950 flex items-center space-x-2">
                <Mail className="h-5.5 w-5.5 text-amber-600" />
                <span>Newsletter Curation Console</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Monitor and manage subscribers, subscription sources, conversion dynamics, and device statistics.
              </p>
            </div>
            
            <button
              onClick={() => {
                const headers = ['Email', 'Created At', 'Status', 'Source', 'Device', 'Country'];
                const rows = subscribers.map(s => [
                  s.email,
                  s.createdAt,
                  s.status || 'active',
                  s.source,
                  s.device || 'N/A',
                  s.country || 'N/A'
                ]);
                const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-4 py-2.5 text-xs font-bold text-stone-700 transition-all cursor-pointer shadow-sm"
            >
              <Download className="h-4 w-4 text-amber-700" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Key subscriber stats & analytics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Subscribers</span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-stone-900">{subscribers.length}</div>
              <p className="text-[10px] text-stone-400 mt-1">Lifetime subscription leads</p>
            </div>
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Active Audience</span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {subscribers.filter(s => s.status !== 'disabled').length}
              </div>
              <p className="text-[10px] text-emerald-600/80 mt-1">Subscribers active currently</p>
            </div>
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Footer conversions</span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-amber-700">
                {subscribers.filter(s => s.source === 'footer').length}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Subscriptions via Footer widget</p>
            </div>
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Smart Overlays (Popup/Banner)</span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-purple-700">
                {subscribers.filter(s => s.source === 'popup' || s.source === 'banner').length}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Subscriptions via interactive triggers</p>
            </div>
          </div>

          {/* Source and Device Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Conversion Dynamics */}
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
              <h3 className="font-display font-extrabold text-sm text-stone-900 mb-4 uppercase tracking-wider">
                Source Impressions vs Conversion Rates
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Homepage Box', count: subscribers.filter(s => s.source === 'homepage').length, impressions: 4500, color: 'bg-amber-500' },
                  { name: 'Footer Widget', count: subscribers.filter(s => s.source === 'footer').length, impressions: 8500, color: 'bg-emerald-500' },
                  { name: 'Exit Intent Popup', count: subscribers.filter(s => s.source === 'popup').length, impressions: 1800, color: 'bg-purple-500' },
                  { name: 'Scroll Banner', count: subscribers.filter(s => s.source === 'banner').length, impressions: 3200, color: 'bg-blue-500' }
                ].map((src, idx) => {
                  const rate = src.impressions > 0 ? ((src.count / src.impressions) * 100).toFixed(2) : '0.00';
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-700">{src.name}</span>
                        <span className="font-mono text-stone-500 font-bold">
                          {src.count} subs / {src.impressions} views ({rate}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                        <div className={`h-full ${src.color}`} style={{ width: `${Math.min(100, (Number(rate) * 10))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Device & Country Stats */}
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
              <h3 className="font-display font-extrabold text-sm text-stone-900 mb-4 uppercase tracking-wider">
                Audience Device & Geographical Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-150">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Device breakdown</span>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center text-stone-600 gap-1.5"><Laptop className="h-3.5 w-3.5 text-stone-500" /> Desktop</span>
                      <span className="font-bold text-stone-800">{subscribers.filter(s => s.device === 'desktop').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center text-stone-600 gap-1.5"><Smartphone className="h-3.5 w-3.5 text-stone-500" /> Mobile</span>
                      <span className="font-bold text-stone-800">{subscribers.filter(s => s.device === 'mobile').length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-150">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Geographical Origin</span>
                  <div className="mt-3 space-y-2 max-h-[100px] overflow-y-auto">
                    {(() => {
                      const geoMap: { [key: string]: number } = {};
                      subscribers.forEach(s => {
                        const country = s.country || 'India';
                        geoMap[country] = (geoMap[country] || 0) + 1;
                      });
                      const entries = Object.entries(geoMap);
                      if (entries.length === 0) {
                        return <div className="text-[11px] text-stone-400">Waiting for subscriber data...</div>;
                      }
                      return entries.map(([country, count], i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="flex items-center text-stone-600 gap-1.5 truncate max-w-[100px]"><Globe className="h-3.5 w-3.5 text-amber-600 shrink-0" /> {country}</span>
                          <span className="font-bold text-stone-800">{count}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtering and Search section */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-stone-400" />
              <input
                type="text"
                value={subscriberSearch}
                onChange={e => { setSubscriberSearch(e.target.value); setSubscriberPage(1); }}
                placeholder="Search subscribers by email..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5">
                <Filter className="h-3.5 w-3.5 text-stone-500" />
                <span className="text-xs font-semibold text-stone-500">Source:</span>
                <select
                  value={subscriberSourceFilter}
                  onChange={e => { setSubscriberSourceFilter(e.target.value as any); setSubscriberPage(1); }}
                  className="rounded-xl border border-stone-200 bg-white py-1.5 px-3 text-xs text-stone-700 outline-none"
                >
                  <option value="all">All Sources</option>
                  <option value="homepage">Homepage Section</option>
                  <option value="footer">Footer Form</option>
                  <option value="popup">Exit Intent Popup</option>
                  <option value="banner">Scroll Banner</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold text-stone-500">Status:</span>
                <select
                  value={subscriberStatusFilter}
                  onChange={e => { setSubscriberStatusFilter(e.target.value as any); setSubscriberPage(1); }}
                  className="rounded-xl border border-stone-200 bg-white py-1.5 px-3 text-xs text-stone-700 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <button
                onClick={loadSubscribers}
                className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-950 transition-all shadow-sm"
                title="Refresh List"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          {isSubscribersLoading ? (
            <div className="text-center py-24 bg-white border border-stone-200 rounded-2xl shadow-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-900 border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-stone-500">Retrieving subscriber registry securely...</p>
            </div>
          ) : (() => {
            let filtered = [...subscribers];
            
            if (subscriberSearch.trim()) {
              const queryStr = subscriberSearch.toLowerCase().trim();
              filtered = filtered.filter(s => s.email.toLowerCase().includes(queryStr));
            }

            if (subscriberSourceFilter !== 'all') {
              filtered = filtered.filter(s => s.source === subscriberSourceFilter);
            }

            if (subscriberStatusFilter !== 'all') {
              filtered = filtered.filter(s => (s.status || 'active') === subscriberStatusFilter);
            }

            // Apply Sort
            filtered.sort((a, b) => {
              const valA = subscriberSortField === 'createdAt' ? a.createdAt : a.email;
              const valB = subscriberSortField === 'createdAt' ? b.createdAt : b.email;
              if (subscriberSortOrder === 'asc') {
                return valA > valB ? 1 : -1;
              } else {
                return valA < valB ? 1 : -1;
              }
            });

            // Apply Pagination
            const totalItems = filtered.length;
            const totalPages = Math.ceil(totalItems / subscribersPerPage);
            const startIndex = (subscriberPage - 1) * subscribersPerPage;
            const paginatedSubscribers = filtered.slice(startIndex, startIndex + subscribersPerPage);

            if (totalItems === 0) {
              return (
                <div className="text-center py-16 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl">
                  <Mail className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-stone-600">No subscribers matched your filters.</p>
                  <p className="text-xs text-stone-400 mt-1">Try modifying search tags or clearing options.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 font-sans text-[10px] font-extrabold uppercase tracking-widest border-b border-stone-200 select-none">
                        <th className="px-6 py-4 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => {
                          if (subscriberSortField === 'email') {
                            setSubscriberSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSubscriberSortField('email');
                            setSubscriberSortOrder('asc');
                          }
                        }}>
                          Subscriber Email {subscriberSortField === 'email' ? (subscriberSortOrder === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className="px-6 py-4 cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => {
                          if (subscriberSortField === 'createdAt') {
                            setSubscriberSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSubscriberSortField('createdAt');
                            setSubscriberSortOrder('asc');
                          }
                        }}>
                          Joined Date {subscriberSortField === 'createdAt' ? (subscriberSortOrder === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className="px-6 py-4">Source</th>
                        <th className="px-6 py-4">Device</th>
                        <th className="px-6 py-4">Country</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                      {paginatedSubscribers.map((sub, sidx) => (
                        <tr key={sidx} className="hover:bg-stone-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-stone-900">{sub.email}</td>
                          <td className="px-6 py-4 font-mono text-stone-400">
                            {new Date(sub.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              sub.source === 'footer' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                              sub.source === 'homepage' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                              sub.source === 'popup' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                              'bg-blue-50 border-blue-100 text-blue-700'
                            }`}>
                              {sub.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 capitalize whitespace-nowrap">{sub.device || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{sub.country || 'N/A'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              (sub.status || 'active') === 'active' ? 'bg-emerald-100/50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-100/60 text-red-600'
                            }`}>
                              {sub.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleToggleSubscriberStatus(sub.email, sub.status || 'active')}
                                className={`p-1 rounded-lg border shadow-xs transition-colors cursor-pointer ${
                                  sub.status === 'disabled' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' 
                                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                                }`}
                                title={sub.status === 'disabled' ? "Enable Subscription" : "Disable Subscription"}
                              >
                                {sub.status === 'disabled' ? <CheckCircle className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteSubscriber(sub.email)}
                                className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-xs cursor-pointer"
                                title="Delete Subscriber Permanently"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-500">
                      Showing <strong className="font-bold text-stone-700">{startIndex + 1}</strong> to <strong className="font-bold text-stone-700">{Math.min(totalItems, startIndex + subscribersPerPage)}</strong> of <strong className="font-bold text-stone-700">{totalItems}</strong> subscribers
                    </span>

                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => setSubscriberPage(p => Math.max(1, p - 1))}
                        disabled={subscriberPage === 1}
                        className="rounded-xl border border-stone-250 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-stone-600 cursor-pointer"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSubscriberPage(i + 1)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            subscriberPage === i + 1
                              ? 'bg-stone-900 text-white'
                              : 'border border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setSubscriberPage(p => Math.min(totalPages, p + 1))}
                        disabled={subscriberPage === totalPages}
                        className="rounded-xl border border-stone-250 bg-white hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-stone-600 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ==============================================================================
          PRODUCT FORM DRAWER / MODAL OVERLAY
          ============================================================================== */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-display text-xl font-bold text-slate-900">
                {editingProduct ? `Edit Record: ${editingProduct.brand}` : 'Add New Affiliate Product'}
              </h3>
              <button
                onClick={() => setIsProductFormOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Core Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Product Title</label>
                  <input
                    type="text" required
                    value={pForm.title} onChange={e => setPForm({ ...pForm, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                    placeholder="e.g. Sony Headphone Ultra"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Brand Name</label>
                  <input
                    type="text" required
                    value={pForm.brand} onChange={e => setPForm({ ...pForm, brand: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                    placeholder="e.g. Sony"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category</label>
                  <select
                    value={pForm.category} onChange={e => setPForm({ ...pForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {pForm.category && !categories.some(c => c.name === pForm.category) && (
                      <option value={pForm.category}>{pForm.category}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={pForm.subcategory} onChange={e => setPForm({ ...pForm, subcategory: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                    placeholder="e.g. Over-Ear, Flagship"
                  />
                </div>
              </div>

              {/* Pricing & Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Affiliate Price ($)</label>
                  <input
                    type="number" required
                    value={pForm.price} onChange={e => setPForm({ ...pForm, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Original Price ($)</label>
                  <input
                    type="number" required
                    value={pForm.originalPrice} onChange={e => setPForm({ ...pForm, originalPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Editor Rating (1-5)</label>
                  <input
                    type="number" step="0.1" max="5" min="1" required
                    value={pForm.rating} onChange={e => setPForm({ ...pForm, rating: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-4 items-center pt-5">
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={pForm.isBestSeller}
                      onChange={e => setPForm({ ...pForm, isBestSeller: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <span>Best Seller</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={pForm.isEditorsChoice}
                      onChange={e => setPForm({ ...pForm, isEditorsChoice: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <span>Editor's Choice</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={pForm.isDailyStar}
                      onChange={e => setPForm({ ...pForm, isDailyStar: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <span className="text-amber-800">★ Daily Star Product</span>
                  </label>
                </div>
              </div>

              {/* Multi-Retailer Pricing Support (Amazon, Flipkart, Myntra) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                <h4 className="font-display font-bold text-xs text-slate-600 uppercase tracking-wider">
                  Multi-Retailer Pricing (Multiple Stores)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Amazon */}
                  <div className="p-3 bg-white rounded-xl border border-slate-150 space-y-2">
                    <span className="text-xs font-bold text-orange-600">Amazon Storefront</span>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400">Price (₹ / $)</label>
                      <input
                        type="number"
                        value={pForm.amazonPrice || ''}
                        onChange={e => setPForm({ ...pForm, amazonPrice: Number(e.target.value) })}
                        className="w-full rounded border border-slate-200 p-1 text-xs outline-none"
                        placeholder="e.g. 119999"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400">Affiliate / Product Link</label>
                      <input
                        type="text"
                        value={pForm.amazonUrlInput}
                        onChange={e => setPForm({ ...pForm, amazonUrlInput: e.target.value })}
                        className="w-full rounded border border-slate-200 p-1 text-[10px] outline-none"
                        placeholder="https://amazon.in/dp/..."
                      />
                    </div>
                  </div>

                  {/* Flipkart */}
                  <div className="p-3 bg-white rounded-xl border border-slate-150 space-y-2">
                    <span className="text-xs font-bold text-blue-600">Flipkart Storefront</span>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400">Price (₹ / $)</label>
                      <input
                        type="number"
                        value={pForm.flipkartPrice || ''}
                        onChange={e => setPForm({ ...pForm, flipkartPrice: Number(e.target.value) })}
                        className="w-full rounded border border-slate-200 p-1 text-xs outline-none"
                        placeholder="e.g. 118500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400">Affiliate / Product Link</label>
                      <input
                        type="text"
                        value={pForm.flipkartUrlInput}
                        onChange={e => setPForm({ ...pForm, flipkartUrlInput: e.target.value })}
                        className="w-full rounded border border-slate-200 p-1 text-[10px] outline-none"
                        placeholder="https://flipkart.com/..."
                      />
                    </div>
                  </div>

                  {/* Myntra */}
                  <div className="p-3 bg-white rounded-xl border border-slate-150 space-y-2">
                    <span className="text-xs font-bold text-pink-600">Myntra Storefront</span>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400">Price (₹ / $)</label>
                      <input
                        type="number"
                        value={pForm.myntraPrice || ''}
                        onChange={e => setPForm({ ...pForm, myntraPrice: Number(e.target.value) })}
                        className="w-full rounded border border-slate-200 p-1 text-xs outline-none"
                        placeholder="e.g. 4500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400">Affiliate / Product Link</label>
                      <input
                        type="text"
                        value={pForm.myntraUrlInput}
                        onChange={e => setPForm({ ...pForm, myntraUrlInput: e.target.value })}
                        className="w-full rounded border border-slate-200 p-1 text-[10px] outline-none"
                        placeholder="https://myntra.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Short Preview Summary</label>
                  <textarea
                    rows={2} required
                    value={pForm.shortDescription} onChange={e => setPForm({ ...pForm, shortDescription: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                    placeholder="Describe main marketing highlights..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Long Overview Essay</label>
                  <textarea
                    rows={2} required
                    value={pForm.overview} onChange={e => setPForm({ ...pForm, overview: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                    placeholder="Full product editorial story..."
                  />
                </div>
              </div>

              {/* Affiliate Destination Links */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h4 className="font-display font-bold text-xs text-slate-600 uppercase tracking-wider mb-3">
                  Affiliate Networks Integration Link Hooks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Amazon Affiliate Link URL</label>
                    <input
                      type="url"
                      value={pForm.amazonUrl} onChange={e => setPForm({ ...pForm, amazonUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none"
                      placeholder="https://amazon.com/dp/...&tag=YOUR_TAG"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Flipkart Affiliate Link URL</label>
                    <input
                      type="url"
                      value={pForm.flipkartUrl} onChange={e => setPForm({ ...pForm, flipkartUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none"
                      placeholder="https://flipkart.com/...&affid=YOUR_ID"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Affiliate Button System */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-600 uppercase tracking-wider">
                      Dynamic Affiliate Buttons System
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Add unlimited, fully dynamic affiliate buttons with custom colors and icons. Leave empty to fallback to legacy inputs above.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newBtn: AffiliateButton = {
                        id: `btn-${Date.now()}`,
                        name: 'Ajio',
                        url: '',
                        color: '#312E81',
                        icon: 'ShoppingCart',
                        displayOrder: pForm.affiliateButtons.length + 1,
                        enabled: true
                      };
                      setPForm({
                        ...pForm,
                        affiliateButtons: [...pForm.affiliateButtons, newBtn]
                      });
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white transition-all shadow-sm shadow-blue-500/10"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Affiliate Button</span>
                  </button>
                </div>

                {pForm.affiliateButtons.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200">
                    <span className="text-xs text-slate-400 font-medium">No dynamic affiliate buttons configured. The product will default to the standard affiliate links above.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pForm.affiliateButtons.map((btn, index) => (
                      <div key={btn.id} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col space-y-2.5 shadow-sm transition-all hover:border-slate-300">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Button Brand Name</label>
                            <input
                              type="text" required
                              value={btn.name}
                              onChange={e => {
                                const list = [...pForm.affiliateButtons];
                                list[index].name = e.target.value;
                                setPForm({ ...pForm, affiliateButtons: list });
                              }}
                              className="w-full rounded-lg border border-slate-200 p-1.5 text-xs outline-none focus:border-blue-500"
                              placeholder="e.g. Amazon, Ajio, Nykaa"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Affiliate Destination URL</label>
                            <input
                              type="url" required
                              value={btn.url}
                              onChange={e => {
                                const list = [...pForm.affiliateButtons];
                                list[index].url = e.target.value;
                                setPForm({ ...pForm, affiliateButtons: list });
                              }}
                              className="w-full rounded-lg border border-slate-200 p-1.5 text-xs outline-none focus:border-blue-500"
                              placeholder="https://ajio.com/... or affiliate link"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Display Order</label>
                            <input
                              type="number" required
                              value={btn.displayOrder}
                              onChange={e => {
                                const list = [...pForm.affiliateButtons];
                                list[index].displayOrder = Number(e.target.value);
                                setPForm({ ...pForm, affiliateButtons: list });
                              }}
                              className="w-full rounded-lg border border-slate-200 p-1.5 text-xs outline-none focus:border-blue-500"
                              placeholder="1"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-mono uppercase text-slate-400">Color:</span>
                              <input
                                type="color"
                                value={btn.color}
                                onChange={e => {
                                  const list = [...pForm.affiliateButtons];
                                  list[index].color = e.target.value;
                                  setPForm({ ...pForm, affiliateButtons: list });
                                }}
                                className="w-8 h-6 rounded cursor-pointer border border-slate-200"
                              />
                              <input
                                type="text"
                                value={btn.color}
                                onChange={e => {
                                  const list = [...pForm.affiliateButtons];
                                  list[index].color = e.target.value;
                                  setPForm({ ...pForm, affiliateButtons: list });
                                }}
                                className="w-16 text-[10px] font-mono rounded border border-slate-200 p-0.5"
                              />
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-mono uppercase text-slate-400">Icon:</span>
                              <select
                                value={btn.icon || 'ExternalLink'}
                                onChange={e => {
                                  const list = [...pForm.affiliateButtons];
                                  list[index].icon = e.target.value;
                                  setPForm({ ...pForm, affiliateButtons: list });
                                }}
                                className="rounded border border-slate-200 p-1 text-[10px] bg-white outline-none"
                              >
                                <option value="ShoppingCart">Shopping Cart</option>
                                <option value="ShoppingBag">Shopping Bag</option>
                                <option value="Percent">Percent Badge</option>
                                <option value="Tag">Price Tag</option>
                                <option value="Globe">Globe Icon</option>
                                <option value="Award">Award Star</option>
                                <option value="ExternalLink">External Link</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={btn.enabled}
                                onChange={e => {
                                  const list = [...pForm.affiliateButtons];
                                  list[index].enabled = e.target.checked;
                                  setPForm({ ...pForm, affiliateButtons: list });
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-300"
                              />
                              <span className="text-[10px] font-bold uppercase text-slate-500">Enabled</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                const list = pForm.affiliateButtons.filter(b => b.id !== btn.id);
                                setPForm({ ...pForm, affiliateButtons: list });
                              }}
                              className="text-red-500 hover:text-red-600 p-1"
                              title="Delete Button"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Variations (Owner Dashboard Control) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h4 className="font-display font-bold text-xs text-slate-600 uppercase tracking-wider mb-3">
                  Product Variations (Leave empty to hide)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Available Sizes (comma-separated, e.g., S, M, L, XL or 13-inch, 15-inch)
                    </label>
                    <input
                      type="text"
                      value={pForm.sizesInput} onChange={e => setPForm({ ...pForm, sizesInput: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none focus:border-blue-500"
                      placeholder="e.g. S, M, L, XL"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Available Colors (comma-separated solid colors, e.g., Black, White, Red or #000000, #FFFFFF)
                    </label>
                    <input
                      type="text"
                      value={pForm.colorsInput} onChange={e => setPForm({ ...pForm, colorsInput: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none focus:border-blue-500"
                      placeholder="e.g. Black, White, Blue, Silver"
                    />
                  </div>
                </div>
              </div>

              {/* AI Recommendation Engine Data */}
              <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-100/60 space-y-4">
                <h4 className="font-display font-bold text-xs text-amber-900 uppercase tracking-wider">
                  AI Recommendation Engine Attributes
                </h4>
                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-amber-700 mb-1">
                      AI Tags (comma-separated, e.g., High-End, Travel-Friendly, Value-King)
                    </label>
                    <input
                      type="text"
                      value={pForm.aiTagsInput} onChange={e => setPForm({ ...pForm, aiTagsInput: e.target.value })}
                      className="w-full rounded-lg border border-amber-200 bg-white p-2 text-xs outline-none focus:border-amber-500 text-stone-800"
                      placeholder="e.g. Professional-Choice, Battery-King, Value-Pick"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-amber-700 mb-1">
                        Community & Expert Summary
                      </label>
                      <textarea
                        rows={3}
                        value={pForm.communityExpertSummary} onChange={e => setPForm({ ...pForm, communityExpertSummary: e.target.value })}
                        className="w-full rounded-lg border border-amber-200 bg-white p-2 text-xs outline-none focus:border-amber-500 text-stone-800"
                        placeholder="Vetted summary of reviews from trustable expert sites..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-amber-700 mb-1">
                        Recommendation Notes / Advice
                      </label>
                      <textarea
                        rows={3}
                        value={pForm.recommendationNotes} onChange={e => setPForm({ ...pForm, recommendationNotes: e.target.value })}
                        className="w-full rounded-lg border border-amber-200 bg-white p-2 text-xs outline-none focus:border-amber-500 text-stone-800"
                        placeholder="Transparent notes about why this product fits or where it has compromises..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Specifications Add Key-Value List */}
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-display font-bold text-xs text-slate-600 uppercase tracking-wider">
                    Technical Specifications Grid
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="text-xs text-blue-600 hover:underline inline-flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Row</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {pForm.specifications.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={row.key}
                        onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs outline-none flex-1"
                        placeholder="e.g. Frequency Response"
                      />
                      <input
                        type="text"
                        required
                        value={row.value}
                        onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs outline-none flex-1"
                        placeholder="e.g. 4 Hz - 40,000 Hz"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="text-red-500 hover:text-red-700 text-xs px-2"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-line textareas for Lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Image Gallery URLs (one per line)</label>
                  <textarea
                    rows={3}
                    value={pForm.imagesInput} onChange={e => setPForm({ ...pForm, imagesInput: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    placeholder="Enter image URLs..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Key Selling Features (one per line)</label>
                  <textarea
                    rows={3}
                    value={pForm.keyFeaturesInput} onChange={e => setPForm({ ...pForm, keyFeaturesInput: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    placeholder="Features..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Pros Points (one per line)</label>
                  <textarea
                    rows={3}
                    value={pForm.prosInput} onChange={e => setPForm({ ...pForm, prosInput: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    placeholder="Pros..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Cons Points (one per line)</label>
                  <textarea
                    rows={3}
                    value={pForm.consInput} onChange={e => setPForm({ ...pForm, consInput: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    placeholder="Cons..."
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProductFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          ARTICLE / BLOG POST FORM MODAL OVERLAY
          ============================================================================== */}
      {isPostFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-display text-xl font-bold text-slate-900">
                {editingPost ? `Edit Article: ${editingPost.title.slice(0, 20)}...` : 'Compose Tech Article'}
              </h3>
              <button
                onClick={() => setIsPostFormOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Article Title</label>
                  <input
                    type="text" required
                    value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                    placeholder="e.g. Best Mechanical Keyboards under $200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Post Type</label>
                  <select
                    value={postForm.postType} onChange={e => setPostForm({ ...postForm, postType: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white"
                  >
                    <option value="blog">Tech Blog / News</option>
                    <option value="guide">Buying Guide Comparison</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category</label>
                  <select
                    value={postForm.category} onChange={e => setPostForm({ ...postForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {postForm.category && !categories.some(c => c.name === postForm.category) && (
                      <option value={postForm.category}>{postForm.category}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Author Name</label>
                  <input
                    type="text" required
                    value={postForm.author} onChange={e => setPostForm({ ...postForm, author: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                    placeholder="Editorial team"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Read Time Estimate</label>
                  <input
                    type="text" required
                    value={postForm.readTime} onChange={e => setPostForm({ ...postForm, readTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                    placeholder="e.g. 5 min read"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={postForm.image} onChange={e => setPostForm({ ...postForm, image: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Brief SEO Summary</label>
                <textarea
                  rows={2} required
                  value={postForm.summary} onChange={e => setPostForm({ ...postForm, summary: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                  placeholder="Short excerpt for lists and search engines..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Article Body Content (Markdown supported)</label>
                <textarea
                  rows={8} required
                  value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono outline-none"
                  placeholder="Write in clean Markdown. Heading-1, Heading-2, Lists, and Dividers are formatted automatically."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Related Product IDs (comma-separated)</label>
                  <input
                    type="text"
                    value={postForm.relatedProductIdsInput} onChange={e => setPostForm({ ...postForm, relatedProductIdsInput: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    placeholder="e.g. prod-1, prod-5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Meta Tags / Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={postForm.tagsInput} onChange={e => setPostForm({ ...postForm, tagsInput: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                    placeholder="e.g. Audio, Keyboards"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPostFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-colors"
                >
                  Save Editorial Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          STAR PRODUCT FORM MODAL OVERLAY
          ============================================================================== */}
      {isStarFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative border border-stone-100">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-6">
              <h3 className="font-display text-xl font-bold text-slate-900">
                {editingStar ? `Edit Star Product: ${editingStar.title.slice(0, 20)}...` : 'Add Star Product of the Day'}
              </h3>
              <button
                onClick={() => setIsStarFormOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveStarProduct} className="space-y-5">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Product Name</label>
                <input
                  type="text" required
                  value={starForm.title} onChange={e => setStarForm({ ...starForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                />
              </div>

              {/* Product Image & Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Product Image URL</label>
                  <input
                    type="url" required
                    value={starForm.image} onChange={e => setStarForm({ ...starForm, image: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Image Preview</span>
                  <div className="h-14 w-14 rounded-xl border border-stone-100 bg-stone-50 overflow-hidden shadow-xs flex items-center justify-center">
                    {starForm.image ? (
                      <img src={starForm.image} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Image className="h-5 w-5 text-stone-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Prices & Dynamically calculated Discount % */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-150">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Original Price ($)</label>
                  <input
                    type="number" min="1" required
                    value={starForm.originalPrice || ''} 
                    onChange={e => setStarForm({ ...starForm, originalPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white outline-none"
                    placeholder="449"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Discounted Price ($)</label>
                  <input
                    type="number" min="1" required
                    value={starForm.discountedPrice || ''} 
                    onChange={e => setStarForm({ ...starForm, discountedPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white outline-none"
                    placeholder="349"
                  />
                </div>
                <div className="flex flex-col justify-center items-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Computed discount</span>
                  <div className="text-sm font-mono font-black text-rose-600 mt-1">
                    {calculateDiscountPercent(Number(starForm.originalPrice), Number(starForm.discountedPrice))}% OFF
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    Save ${Math.max(0, Number(starForm.originalPrice) - Number(starForm.discountedPrice))}
                  </div>
                </div>
              </div>

              {/* Badge Selection & custom Badge Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Badge Style</label>
                  <select
                    value={starForm.badgeType} 
                    onChange={e => {
                      const type = e.target.value as any;
                      let txt = starForm.badgeText;
                      if (type === 'biggest_deal') txt = "🔥 Today's Biggest Deal";
                      else if (type === 'limited_time') txt = "⚡ Limited Time Offer";
                      else if (type === 'best_discount') txt = "💰 Best Discount Today";
                      setStarForm({ ...starForm, badgeType: type, badgeText: txt });
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none bg-white"
                  >
                    <option value="biggest_deal">🔥 Biggest Deal</option>
                    <option value="limited_time">⚡ Limited Time Offer</option>
                    <option value="best_discount">💰 Best Discount Today</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Badge Label Text</label>
                  <input
                    type="text" required
                    value={starForm.badgeText} onChange={e => setStarForm({ ...starForm, badgeText: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                    placeholder="🔥 Today's Biggest Deal"
                  />
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Start Date (Promotion Begins)</label>
                  <input
                    type="date"
                    value={starForm.startDate} onChange={e => setStarForm({ ...starForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">End Date (Promotion Expires)</label>
                  <input
                    type="date"
                    value={starForm.endDate} onChange={e => setStarForm({ ...starForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Affiliate link URL */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Affiliate Link / CTA URL</label>
                <input
                  type="url" required
                  value={starForm.affiliateUrl} onChange={e => setStarForm({ ...starForm, affiliateUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                  placeholder="https://amazon.com/dp/... or referral link"
                />
              </div>

              {/* Active Toggle state inside form */}
              <div className="flex items-center space-x-3 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                <button
                  type="button"
                  onClick={() => setStarForm({ ...starForm, enabled: !starForm.enabled })}
                  className="text-slate-600 focus:outline-none cursor-pointer"
                >
                  {starForm.enabled ? (
                    <ToggleRight className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-stone-400" />
                  )}
                </button>
                <span className="text-xs font-bold text-stone-700">
                  Enable Star Product instantly upon saving
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsStarFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 hover:bg-slate-850 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-slate-900/10 transition-colors cursor-pointer"
                >
                  Save Star Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          CATEGORY FORM MODAL OVERLAY
          ============================================================================== */}
      {isCategoryFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 relative border border-stone-100">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-6">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsCategoryFormOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Category Name</label>
                <input
                  type="text" required
                  value={cForm.name}
                  onChange={e => setCForm({ ...cForm, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs bg-white outline-none"
                  placeholder="e.g. Mechanical Keyboards"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={cForm.description}
                  onChange={e => setCForm({ ...cForm, description: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs bg-white outline-none"
                  placeholder="Provide a brief description of the types of products listed here..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-stone-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 hover:bg-slate-850 px-5 py-2 text-xs font-bold text-white shadow-md shadow-slate-900/10 transition-colors cursor-pointer"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
