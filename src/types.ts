export interface AffiliateButton {
  id: string;
  name: string;
  url: string;
  color: string;
  icon?: string;
  displayOrder: number;
  enabled: boolean;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  images: string[]; // First image is main, others are gallery
  rating: number;
  price: number;
  originalPrice: number;
  isBestSeller: boolean;
  isEditorsChoice: boolean;
  isDailyStar?: boolean;
  amazonUrl: string;
  flipkartUrl: string;
  earnkaroUrl: string;
  otherUrl: string;
  overview: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  specifications: Record<string, string>;
  performance: string;
  whoShouldBuy: string[];
  whoShouldAvoid: string[];
  verdict: string;
  tags: string[];
  reviewsCount: number;
  createdAt: string;
  affiliateButtons?: AffiliateButton[];
  sizes?: string[];
  colors?: string[];
  aiTags?: string[];
  communityExpertSummary?: string;
  recommendationNotes?: string;
  retailers?: { name: string; price: number; url: string; lastUpdated?: string }[];
}

export type PostType = 'blog' | 'guide';

export interface Post {
  id: string;
  title: string;
  slug: string;
  postType: PostType;
  summary: string;
  content: string; // Markdown text
  image: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt: string;
  relatedProductIds: string[];
  tags: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface StarProduct {
  id: string;
  title: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  affiliateUrl: string;
  startDate: string;
  endDate: string;
  order: number;
  enabled: boolean;
  badgeType: 'biggest_deal' | 'limited_time' | 'best_discount' | 'other';
  badgeText: string;
  createdAt: string;
}

export type EventType = 'page_view' | 'click_affiliate' | 'search' | 'compare' | 'duration_ping';

export interface AnalyticsEvent {
  id: string;
  eventType: EventType;
  targetId?: string; // Product ID, Post ID
  targetName?: string; // Product title, Post title, Search term, compared items
  network?: 'amazon' | 'flipkart' | 'earnkaro' | 'other';
  timestamp: string; // ISO String
  sessionId: string;
}

export interface SessionData {
  id: string;
  startTime: number;
  lastPingTime: number;
  pageViews: number;
  clicks: number;
  maxScrollDepth: number; // percentage
  hasInteracted: boolean;
}

export function getProductAffiliateButtons(product: Product): AffiliateButton[] {
  if (product.affiliateButtons && product.affiliateButtons.length > 0) {
    return product.affiliateButtons
      .filter(b => b.enabled)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }
  
  // Fallback to legacy fields converted to dynamic buttons
  const buttons: AffiliateButton[] = [];
  if (product.amazonUrl) {
    buttons.push({
      id: 'amazon',
      name: 'Amazon',
      url: product.amazonUrl,
      color: '#FF9900', // Amazon Orange
      icon: 'ShoppingCart',
      displayOrder: 1,
      enabled: true
    });
  }
  if (product.flipkartUrl) {
    buttons.push({
      id: 'flipkart',
      name: 'Flipkart',
      url: product.flipkartUrl,
      color: '#2874F0', // Flipkart Blue
      icon: 'ShoppingBag',
      displayOrder: 2,
      enabled: true
    });
  }
  return buttons;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  icon?: string;
  bannerImage?: string;
  isActive?: boolean;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  notificationsEnabled: boolean;
  dateAdded: string;
}

export interface PriceHistoryItem {
  id: string;
  productId: string;
  retailer: string;
  price: number;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  profile?: Record<string, any>;
  savedProducts?: string[];
  watchlist?: string[];
  priceAlerts?: { productId: string; targetPrice: number; active: boolean }[];
  searchHistory?: string[];
  lastLogin?: string;
  updatedAt?: string;
}

export interface Comparison {
  id: string;
  userId?: string;
  comparedProductIds: string[];
  productCategory: string;
  userPriorities: Record<string, number>;
  aiMatchScores: Record<string, number>;
  aiRecommendation: string;
  timestamp: string;
}

