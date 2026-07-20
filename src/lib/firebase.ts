import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Product, Post, FAQItem, AnalyticsEvent, StarProduct, ProductCategory, WatchlistItem, PriceHistoryItem, UserProfile, Comparison, NewsletterSubscriber, AlertNotification } from '../types';

import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);

// Save User Profile
export async function saveUserProfile(uid: string, email: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, cleanData({
      uid,
      email,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }), { merge: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

// Save User Clicking Event
export interface ClickingLog {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  network: string;
  url: string;
  timestamp: string;
}

export async function saveClickingToFirestore(clicking: ClickingLog): Promise<void> {
  try {
    const docRef = doc(db, 'clicks', clicking.id);
    await setDoc(docRef, cleanData(clicking));
  } catch (error) {
    console.error('Error saving clicking details:', error);
  }
}

// Collection References
const PRODUCTS_COLLECTION = 'products';
const POSTS_COLLECTION = 'posts';
const FAQS_COLLECTION = 'faqs';
const ANALYTICS_COLLECTION = 'analytics_events';
const STAR_PRODUCTS_COLLECTION = 'star_products';
const CATEGORIES_COLLECTION = 'categories';

/**
 * Sanitizes an object recursively to remove all undefined values so Firestore does not throw an error.
 */
function cleanData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanData(item)) as any;
  }
  if (typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj;
    }
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = cleanData(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Fetch all products from Firestore
 */
export async function getProductsFromFirestore(): Promise<Product[]> {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    throw error;
  }
}

/**
 * Save or update a single product in Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, cleanData(product));
  } catch (error) {
    console.error(`Error saving product ${product.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting product ${id} from Firestore:`, error);
    throw error;
  }
}

/**
 * Fetch all posts from Firestore
 */
export async function getPostsFromFirestore(): Promise<Post[]> {
  try {
    const colRef = collection(db, POSTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const posts: Post[] = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts from Firestore:', error);
    throw error;
  }
}

/**
 * Save or update a post in Firestore
 */
export async function savePostToFirestore(post: Post): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, post.id);
    await setDoc(docRef, cleanData(post));
  } catch (error) {
    console.error(`Error saving post ${post.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Delete a post from Firestore
 */
export async function deletePostFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting post ${id} from Firestore:`, error);
    throw error;
  }
}

/**
 * Fetch all FAQs from Firestore
 */
export async function getFaqsFromFirestore(): Promise<FAQItem[]> {
  try {
    const colRef = collection(db, FAQS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const faqs: FAQItem[] = [];
    snapshot.forEach((doc) => {
      faqs.push({ id: doc.id, ...doc.data() } as FAQItem);
    });
    return faqs;
  } catch (error) {
    console.error('Error fetching FAQs from Firestore:', error);
    throw error;
  }
}

/**
 * Save or update an FAQ in Firestore
 */
export async function saveFaqToFirestore(faq: FAQItem): Promise<void> {
  try {
    const docRef = doc(db, FAQS_COLLECTION, faq.id);
    await setDoc(docRef, cleanData(faq));
  } catch (error) {
    console.error(`Error saving FAQ ${faq.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Delete an FAQ from Firestore
 */
export async function deleteFaqFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, FAQS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting FAQ ${id} from Firestore:`, error);
    throw error;
  }
}

/**
 * Fetch all analytics events from Firestore
 */
export async function getAnalyticsEventsFromFirestore(): Promise<AnalyticsEvent[]> {
  try {
    const colRef = collection(db, ANALYTICS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const events: AnalyticsEvent[] = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as AnalyticsEvent);
    });
    // Sort by timestamp
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return events;
  } catch (error) {
    console.warn('Error fetching analytics events from Firestore (unauthorized or empty):', error);
    return [];
  }
}

/**
 * Add an analytics event to Firestore
 */
export async function saveAnalyticsEventToFirestore(event: AnalyticsEvent): Promise<void> {
  try {
    const docRef = doc(db, ANALYTICS_COLLECTION, event.id);
    await setDoc(docRef, cleanData(event));
  } catch (error) {
    console.error(`Error saving analytics event ${event.id} to Firestore:`, error);
  }
}

/**
 * Seeds default data into Firestore if it doesn't already exist
 */
export async function seedInitialDataIfEmpty(
  defaultProducts: Product[],
  defaultPosts: Post[],
  defaultFaqs: FAQItem[],
  defaultCategories: ProductCategory[]
): Promise<{ products: Product[]; posts: Post[]; faqs: FAQItem[]; categories: ProductCategory[] }> {
  const systemMetaRef = doc(db, 'system', 'metadata');
  let isAlreadySeeded = false;

  try {
    const metaSnap = await getDoc(systemMetaRef);
    if (metaSnap.exists() && metaSnap.data()?.seeded === true) {
      isAlreadySeeded = true;
    }
  } catch (err) {
    console.warn('Unable to check system metadata:', err);
  }

  if (isAlreadySeeded) {
    // Database has already been initialized. Fetch and return current Firestore data directly.
    // If any fetch fails, it will correctly propagate the error to avoid corrupting client caches.
    const products = await getProductsFromFirestore();
    const posts = await getPostsFromFirestore();
    const faqs = await getFaqsFromFirestore();
    const categories = await getCategoriesFromFirestore();
    return { products, posts, faqs, categories };
  }

  // Not seeded yet. Proceed with seeding.
  let products = await getProductsFromFirestore();
  if (products.length === 0 && defaultProducts.length > 0) {
    console.log('Seeding products collection in Firestore...');
    const batch = writeBatch(db);
    defaultProducts.forEach((p) => {
      const docRef = doc(db, PRODUCTS_COLLECTION, p.id);
      batch.set(docRef, cleanData(p));
    });
    await batch.commit();
    products = [...defaultProducts];
  }

  let posts = await getPostsFromFirestore();
  if (posts.length === 0 && defaultPosts.length > 0) {
    console.log('Seeding posts collection in Firestore...');
    const batch = writeBatch(db);
    defaultPosts.forEach((p) => {
      const docRef = doc(db, POSTS_COLLECTION, p.id);
      batch.set(docRef, cleanData(p));
    });
    await batch.commit();
    posts = [...defaultPosts];
  }

  let faqs = await getFaqsFromFirestore();
  if (faqs.length === 0 && defaultFaqs.length > 0) {
    console.log('Seeding FAQs collection in Firestore...');
    const batch = writeBatch(db);
    defaultFaqs.forEach((f) => {
      const docRef = doc(db, FAQS_COLLECTION, f.id);
      batch.set(docRef, cleanData(f));
    });
    await batch.commit();
    faqs = [...defaultFaqs];
  }

  // 4. Star Products
  let starProducts = await getStarProductsFromFirestore();
  if (starProducts.length === 0) {
    console.log('Seeding star_products collection in Firestore...');
    const defaultStarProducts: StarProduct[] = [
      {
        id: 'star-1',
        title: 'Sony WH-1000XM5 Wireless Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        originalPrice: 449,
        discountedPrice: 349,
        discountPercentage: 22,
        affiliateUrl: 'https://amazon.com/dp/B09XS7JLH3?tag=myaffiliate-20',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        order: 0,
        enabled: true,
        badgeType: 'biggest_deal',
        badgeText: "🔥 Today's Biggest Deal",
        createdAt: new Date().toISOString()
      },
      {
        id: 'star-2',
        title: 'Apple iPad Air M1 (5th Gen, 64GB)',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
        originalPrice: 599,
        discountedPrice: 499,
        discountPercentage: 17,
        affiliateUrl: 'https://amazon.com/dp/B09V3K4CH4?tag=myaffiliate-20',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        order: 1,
        enabled: true,
        badgeType: 'limited_time',
        badgeText: '⚡ Limited Time Offer',
        createdAt: new Date().toISOString()
      },
      {
        id: 'star-3',
        title: 'Anker Magnetic Portable Charger 5K',
        image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&w=800&q=80',
        originalPrice: 45,
        discountedPrice: 29,
        discountPercentage: 35,
        affiliateUrl: 'https://amazon.com/dp/B09923N1DS?tag=myaffiliate-20',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        order: 2,
        enabled: true,
        badgeType: 'best_discount',
        badgeText: '💰 Best Discount Today',
        createdAt: new Date().toISOString()
      }
    ];
    try {
      const batch = writeBatch(db);
      defaultStarProducts.forEach((sp) => {
        const docRef = doc(db, STAR_PRODUCTS_COLLECTION, sp.id);
        batch.set(docRef, cleanData(sp));
      });
      await batch.commit();
    } catch (err) {
      console.warn('Unable to write seed star products to Firestore (visitor permissions), falling back to local defaults:', err);
    }
  }

  // Categories
  let categories = await getCategoriesFromFirestore();
  if (categories.length === 0 && defaultCategories.length > 0) {
    console.log('Seeding categories collection in Firestore...');
    const batch = writeBatch(db);
    defaultCategories.forEach((cat) => {
      const docRef = doc(db, CATEGORIES_COLLECTION, cat.id);
      batch.set(docRef, cleanData(cat));
    });
    await batch.commit();
    categories = [...defaultCategories];
  }

  // Price History Seeding
  try {
    const priceHistoryRef = collection(db, 'price_history');
    const priceHistorySnapshot = await getDocs(priceHistoryRef);
    if (priceHistorySnapshot.empty) {
      console.log('Seeding price_history collection in Firestore...');
      const defaultHistory: PriceHistoryItem[] = [];
      const now = new Date();
      
      const seedHistoryForProduct = (productId: string, basePrice: number) => {
        const historyData = [
          { monthsAgo: 5, multiplier: 1.12 },
          { monthsAgo: 4, multiplier: 1.08 },
          { monthsAgo: 3, multiplier: 1.03 },
          { monthsAgo: 2, multiplier: 0.92 }, // lowest
          { monthsAgo: 1, multiplier: 0.98 },
          { monthsAgo: 0, multiplier: 1.00 } // current
        ];
        
        historyData.forEach((h, idx) => {
          const date = new Date(now);
          date.setMonth(now.getMonth() - h.monthsAgo);
          defaultHistory.push({
            id: `history-${productId}-${idx}`,
            productId,
            retailer: 'Amazon Marketplace',
            price: Math.round(basePrice * h.multiplier),
            timestamp: date.toISOString()
          });
        });
      };

      seedHistoryForProduct('prod-1', 398);
      seedHistoryForProduct('prod-2', 799);
      seedHistoryForProduct('prod-3', 1299);
      
      const batch = writeBatch(db);
      defaultHistory.forEach((hist) => {
        const docRef = doc(db, 'price_history', hist.id);
        batch.set(docRef, cleanData(hist));
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Unable to read or write seed price history to Firestore (visitor permissions):', err);
  }

  // Write system metadata to mark database as seeded!
  try {
    await setDoc(systemMetaRef, { seeded: true, seededAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Unable to write system metadata (visitor permissions):', err);
  }

  return { products, posts, faqs, categories };
}

/**
 * Fetch all star products from Firestore
 */
export async function getStarProductsFromFirestore(): Promise<StarProduct[]> {
  try {
    const colRef = collection(db, STAR_PRODUCTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const stars: StarProduct[] = [];
    snapshot.forEach((doc) => {
      stars.push({ id: doc.id, ...doc.data() } as StarProduct);
    });
    // Sort by order ascending
    stars.sort((a, b) => a.order - b.order);
    return stars;
  } catch (error) {
    console.error('Error fetching star products from Firestore:', error);
    throw error;
  }
}

/**
 * Save or update a star product in Firestore
 */
export async function saveStarProductToFirestore(star: StarProduct): Promise<void> {
  try {
    const docRef = doc(db, STAR_PRODUCTS_COLLECTION, star.id);
    await setDoc(docRef, cleanData(star));
  } catch (error) {
    console.error(`Error saving star product ${star.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Delete a star product from Firestore
 */
export async function deleteStarProductFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, STAR_PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting star product ${id} from Firestore:`, error);
    throw error;
  }
}

/**
 * Fetch all product categories from Firestore
 */
export async function getCategoriesFromFirestore(): Promise<ProductCategory[]> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(colRef);
    const list: ProductCategory[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as ProductCategory);
    });
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list;
  } catch (error) {
    console.error('Error fetching categories from Firestore:', error);
    throw error;
  }
}

/**
 * Save or update a product category in Firestore
 */
export async function saveCategoryToFirestore(category: ProductCategory): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, category.id);
    await setDoc(docRef, cleanData(category));
  } catch (error) {
    console.error(`Error saving category ${category.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Delete a product category from Firestore
 */
export async function deleteCategoryFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting category ${id} from Firestore:`, error);
    throw error;
  }
}

/**
 * Fetch all watchlist entries from Firestore
 */
export async function getWatchlistFromFirestore(): Promise<WatchlistItem[]> {
  try {
    const colRef = collection(db, 'watchlist');
    const snapshot = await getDocs(colRef);
    const watchlist: WatchlistItem[] = [];
    snapshot.forEach((doc) => {
      watchlist.push({ id: doc.id, ...doc.data() } as WatchlistItem);
    });
    return watchlist;
  } catch (error) {
    console.error('Error fetching watchlist from Firestore:', error);
    return [];
  }
}

/**
 * Save or update a watchlist entry in Firestore
 */
export async function saveWatchlistItemToFirestore(item: WatchlistItem): Promise<void> {
  try {
    const docRef = doc(db, 'watchlist', item.id);
    await setDoc(docRef, cleanData(item));
  } catch (error) {
    console.error(`Error saving watchlist item ${item.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Delete a watchlist entry from Firestore
 */
export async function deleteWatchlistItemFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'watchlist', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting watchlist item ${id} from Firestore:`, error);
    throw error;
  }
}

/**
 * Fetch all price history logs from Firestore
 */
export async function getPriceHistoryFromFirestore(): Promise<PriceHistoryItem[]> {
  try {
    const colRef = collection(db, 'price_history');
    const snapshot = await getDocs(colRef);
    const history: PriceHistoryItem[] = [];
    snapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() } as PriceHistoryItem);
    });
    // Sort by timestamp descending
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return history;
  } catch (error) {
    console.error('Error fetching price history from Firestore:', error);
    return [];
  }
}

/**
 * Save a new price history record to Firestore
 */
export async function savePriceHistoryToFirestore(item: PriceHistoryItem): Promise<void> {
  try {
    const docRef = doc(db, 'price_history', item.id);
    await setDoc(docRef, cleanData(item));
  } catch (error) {
    console.error(`Error saving price history ${item.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error(`Error getting user profile ${uid}:`, error);
    return null;
  }
}

/**
 * Fetch all comparison records from Firestore (optionally filtered by userId)
 */
export async function getComparisonsFromFirestore(userId?: string): Promise<Comparison[]> {
  try {
    const colRef = collection(db, 'comparisons');
    const snapshot = await getDocs(colRef);
    const comparisons: Comparison[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Comparison;
      if (!userId || data.userId === userId) {
        comparisons.push({ id: doc.id, ...data });
      }
    });
    // Sort by timestamp descending
    comparisons.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return comparisons;
  } catch (error) {
    console.error('Error fetching comparisons from Firestore:', error);
    return [];
  }
}

/**
 * Save a comparison record to Firestore
 */
export async function saveComparisonToFirestore(item: Comparison): Promise<void> {
  try {
    const docRef = doc(db, 'comparisons', item.id);
    await setDoc(docRef, cleanData(item));
  } catch (error) {
    console.error(`Error saving comparison ${item.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Delete a comparison record from Firestore
 */
export async function deleteComparisonFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'comparisons', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting comparison ${id} from Firestore:`, error);
    throw error;
  }
}

/**
 * Subscribe a user to the newsletter
 */
export async function subscribeToNewsletterInFirestore(subscriber: NewsletterSubscriber): Promise<void> {
  try {
    const docRef = doc(db, 'newsletterSubscribers', subscriber.email.trim().toLowerCase());
    await setDoc(docRef, cleanData(subscriber));
  } catch (error) {
    console.error('Error in subscribeToNewsletterInFirestore:', error);
    throw error;
  }
}

/**
 * Check if an email is already subscribed
 */
export async function checkNewsletterSubscriptionStatus(email: string): Promise<'active' | 'disabled' | 'not_found'> {
  try {
    const docRef = doc(db, 'newsletterSubscribers', email.trim().toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().status || 'active';
    }
    return 'not_found';
  } catch (error) {
    console.error('Error in checkNewsletterSubscriptionStatus:', error);
    return 'not_found';
  }
}

/**
 * Get all newsletter subscribers
 */
export async function getNewsletterSubscribersFromFirestore(): Promise<NewsletterSubscriber[]> {
  try {
    const colRef = collection(db, 'newsletterSubscribers');
    const snapshot = await getDocs(colRef);
    const subscribers: NewsletterSubscriber[] = [];
    snapshot.forEach((docSnap) => {
      subscribers.push(docSnap.data() as NewsletterSubscriber);
    });
    // Sort by createdAt descending
    subscribers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return subscribers;
  } catch (error) {
    console.warn('Error fetching newsletter subscribers (usually permission-denied for guest):', error);
    return [];
  }
}

/**
 * Delete a newsletter subscriber
 */
export async function deleteNewsletterSubscriberFromFirestore(email: string): Promise<void> {
  try {
    const docRef = doc(db, 'newsletterSubscribers', email.trim().toLowerCase());
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting newsletter subscriber ${email} from Firestore:`, error);
    throw error;
  }
}

/**
 * Disable or Enable subscriber status
 */
export async function updateNewsletterSubscriberStatusInFirestore(email: string, status: 'active' | 'disabled'): Promise<void> {
  try {
    const docRef = doc(db, 'newsletterSubscribers', email.trim().toLowerCase());
    await setDoc(docRef, { status, lastUpdated: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error(`Error updating subscriber status for ${email}:`, error);
    throw error;
  }
}

/**
 * Fetch all notifications for a specific user from Firestore
 */
export async function getNotificationsFromFirestore(userId: string): Promise<AlertNotification[]> {
  try {
    const colRef = collection(db, 'notifications');
    const snapshot = await getDocs(colRef);
    const notifications: AlertNotification[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.userId === userId) {
        notifications.push({ id: docSnap.id, ...data } as AlertNotification);
      }
    });
    // Sort chronological descending
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications from Firestore:', error);
    return [];
  }
}

/**
 * Save an alert notification to Firestore
 */
export async function saveNotificationToFirestore(notification: AlertNotification): Promise<void> {
  try {
    const docRef = doc(db, 'notifications', notification.id);
    await setDoc(docRef, cleanData(notification));
  } catch (error) {
    console.error(`Error saving notification ${notification.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Mark a notification as read in Firestore
 */
export async function markNotificationAsReadInFirestore(notificationId: string): Promise<void> {
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await setDoc(docRef, { read: true }, { merge: true });
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
}

/**
 * Mark all user notifications as read in Firestore
 */
export async function markAllNotificationsAsReadInFirestore(userId: string): Promise<void> {
  try {
    const notifications = await getNotificationsFromFirestore(userId);
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      if (!n.read) {
        const docRef = doc(db, 'notifications', n.id);
        batch.set(docRef, { read: true }, { merge: true });
      }
    });
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Delete a notification from Firestore
 */
export async function deleteNotificationFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'notifications', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting notification ${id} from Firestore:`, error);
    throw error;
  }
}



