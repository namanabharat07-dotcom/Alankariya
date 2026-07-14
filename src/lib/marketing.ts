import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Post } from '../types';

export interface Subscriber {
  email: string;
  status: 'active' | 'unsubscribed' | 'pending';
  verified: boolean;
  verificationToken: string;
  createdAt: string;
  pushPermission: boolean;
  fcmToken?: string;
  clicksCount: number;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  type: 'welcome' | 'new_product' | 'new_post' | 'price_drop' | 'coupon' | 'newsletter' | 'abandoned_deal';
  targetId?: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
}

export interface MarketingLog {
  id: string;
  campaignId: string;
  email: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'retrying';
  retryCount: number;
  error?: string;
  opened: boolean;
  clicked: boolean;
  type: string;
  targetId?: string;
}

const SUBSCRIBERS_COL = 'subscribers';
const CAMPAIGNS_COL = 'marketing_campaigns';
const LOGS_COL = 'marketing_logs';

/**
 * Validates email with standard regex and spam protection (checks for common disposable domains)
 */
export function validateSubscriberEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim() || !emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  // Spam protection - block common temporary/disposable email domains
  const disposableDomains = ['mailinator.com', 'yopmail.com', '10minutemail.com', 'trashmail.com', 'tempmail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return { isValid: false, error: 'Disposable email addresses are not allowed for security reasons.' };
  }

  return { isValid: true };
}

/**
 * Subscribe a new user, saves in Firestore, and auto-sends welcome campaign
 */
export async function subscribeUser(email: string, options?: { pushPermission?: boolean; fcmToken?: string }): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const { isValid, error } = validateSubscriberEmail(cleanEmail);
  if (!isValid) throw new Error(error);

  const docRef = doc(db, SUBSCRIBERS_COL, cleanEmail);
  const existingDoc = await getDoc(docRef);

  const verificationToken = `tok-${Math.random().toString(36).substr(2, 9)}`;

  const subscriberData: Subscriber = {
    email: cleanEmail,
    status: 'active',
    verified: false, // Default to pending verification
    verificationToken,
    createdAt: new Date().toISOString(),
    pushPermission: options?.pushPermission || false,
    fcmToken: options?.fcmToken || '',
    clicksCount: 0
  };

  // If already active, don't overwrite subscription date
  if (existingDoc.exists()) {
    const data = existingDoc.data() as Subscriber;
    if (data.status === 'active') {
      // Just update push permission if changed
      await updateDoc(docRef, {
        pushPermission: options?.pushPermission ?? data.pushPermission,
        fcmToken: options?.fcmToken ?? data.fcmToken ?? ''
      });
      return;
    }
  }

  await setDoc(docRef, subscriberData);

  // Auto-trigger welcome email campaign
  await triggerWelcomeCampaign(cleanEmail, verificationToken);
}

/**
 * Verifies email using verification token
 */
export async function verifyEmail(email: string, token: string): Promise<boolean> {
  const docRef = doc(db, SUBSCRIBERS_COL, email.trim().toLowerCase());
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const subscriber = docSnap.data() as Subscriber;
    if (subscriber.verificationToken === token) {
      await updateDoc(docRef, { verified: true });
      return true;
    }
  }
  return false;
}

/**
 * Unsubscribes email from mailing list
 */
export async function unsubscribeEmail(email: string): Promise<void> {
  const docRef = doc(db, SUBSCRIBERS_COL, email.trim().toLowerCase());
  await updateDoc(docRef, { status: 'unsubscribed' });
}

/**
 * Request real browser notification permission and save token / preferences
 */
export async function requestBrowserNotification(): Promise<{ permission: NotificationPermission; token?: string }> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return { permission: 'denied' };
  }

  const permission = await Notification.requestPermission();
  let fakeToken = '';
  if (permission === 'granted') {
    fakeToken = `fcm-token-${Math.random().toString(36).substr(2, 15)}`;
  }
  return { permission, token: fakeToken };
}

/**
 * Triggers Welcome Email and saves it to automated marketing logs
 */
async function triggerWelcomeCampaign(email: string, token: string): Promise<void> {
  const campaignId = `camp-welcome-${Date.now()}`;
  const verificationLink = `${window.location.origin}?verify_email=${encodeURIComponent(email)}&token=${token}`;
  
  const campaign: MarketingCampaign = {
    id: campaignId,
    title: 'Welcome New Subscriber',
    subject: '🌸 Welcome to Alankariya – Timeless Style Awaits!',
    content: `Thank you for subscribing to Alankariya! Discover the finest curated tech, home gadgets, and lifestyle recommendations. We compare options so you buy with total confidence. Please click here to verify your email and unlock premium deal updates: ${verificationLink}`,
    type: 'welcome',
    sentCount: 1,
    openCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };

  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0e6d2; border-radius: 12px; background-color: #fbfaf7;">
      <h2 style="color: #8c6239; font-size: 24px; font-weight: bold; margin-bottom: 10px;">Welcome to Alankariya</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">Thank you for subscribing! We curate the absolute best tech gadgets, laptop gear, keyboard setups, and lifestyle accessories so you can make informed decisions.</p>
      
      <div style="margin: 25px 0; text-align: center;">
        <a href="${verificationLink}" style="background-color: #8c6239; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">Verify Your Email Address</a>
      </div>
      
      <p style="color: #718096; font-size: 12px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        If you didn't sign up for this, you can safely ignore this email or <a href="${window.location.origin}?unsubscribe=${encodeURIComponent(email)}" style="color: #8c6239;">unsubscribe here</a>.
      </p>
    </div>
  `;

  const log: MarketingLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    campaignId,
    email,
    subject: campaign.subject,
    body: bodyHtml,
    sentAt: new Date().toISOString(),
    status: 'sent',
    retryCount: 0,
    opened: false,
    clicked: false,
    type: 'welcome'
  };

  await setDoc(doc(db, CAMPAIGNS_COL, campaignId), campaign);
  await setDoc(doc(db, LOGS_COL, log.id), log);

  // Send real email via Resend API if API Key is configured
  await sendRealEmailViaResend(email, campaign.subject, bodyHtml);
}

/**
 * Triggers automated campaign on new Product publication
 */
export async function triggerNewProductCampaign(product: Product): Promise<void> {
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return;

  const campaignId = `camp-prod-${product.id}-${Date.now()}`;
  const productLink = `${window.location.origin}?product=${product.id}`;

  const campaign: MarketingCampaign = {
    id: campaignId,
    title: `New Product: ${product.title}`,
    subject: `🛍️ New Arrival: ${product.title} curated under ${product.category}!`,
    content: `Check out our newly featured tech gadget: ${product.title}. Rating: ${product.rating}⭐. Get detailed specifications, reviews, and best discount links here: ${productLink}`,
    type: 'new_product',
    targetId: product.id,
    sentCount: subscribers.length,
    openCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };

  await setDoc(doc(db, CAMPAIGNS_COL, campaignId), campaign);

  const batch = writeBatch(db);
  for (const sub of subscribers) {
    const unsubLink = `${window.location.origin}?unsubscribe=${encodeURIComponent(sub.email)}`;
    const bodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <span style="font-size: 11px; font-weight: bold; color: #8c6239; background-color: #fef8f2; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">New Review & Deal Alert</span>
        <h2 style="color: #1a202c; font-size: 20px; font-weight: bold; margin: 12px 0 6px 0;">${product.title}</h2>
        <p style="color: #718096; font-size: 13px; margin: 0 0 16px 0;">Brand: <strong>${product.brand}</strong> | Category: <strong>${product.category}</strong></p>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${product.images[0]}" alt="${product.title}" style="max-width: 100%; max-height: 250px; border-radius: 8px; object-fit: contain; background-color: #f7fafc; border: 1px solid #edf2f7; padding: 10px;" />
        </div>

        <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">${product.shortDescription || product.description}</p>
        
        <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
          <span style="font-size: 13px; color: #4a5568;">Curator Rating: <strong style="color: #d69e2e;">${product.rating} ★★★★★</strong></span>
          <div style="font-size: 24px; font-weight: bold; color: #2d3748; margin-top: 5px;">$${product.price} <span style="font-size: 14px; text-decoration: line-through; color: #a0aec0; font-weight: normal;">$${product.originalPrice}</span></div>
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${productLink}" style="background-color: #1a202c; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">View Detailed Review & Buy</a>
        </div>

        <p style="color: #a0aec0; font-size: 11px; text-align: center; border-top: 1px solid #edf2f7; padding-top: 15px; margin: 0;">
          Sent automatically by Alankariya. You can <a href="${unsubLink}" style="color: #8c6239; text-decoration: underline;">unsubscribe</a> at any time.
        </p>
      </div>
    `;

    const logId = `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const log: MarketingLog = {
      id: logId,
      campaignId,
      email: sub.email,
      subject: campaign.subject,
      body: bodyHtml,
      sentAt: new Date().toISOString(),
      status: 'sent',
      retryCount: 0,
      opened: false,
      clicked: false,
      type: 'new_product',
      targetId: product.id
    };

    batch.set(doc(db, LOGS_COL, logId), log);
    // Send background Resend API request
    sendRealEmailViaResend(sub.email, campaign.subject, bodyHtml);
  }
  await batch.commit();

  // Send Browser Native Push Notification
  triggerLocalBrowserPushNotification(`🛍️ CURATED ITEM: ${product.title}`, `A new, hand-selected deal is available now! Click to check pricing and availability.`);
}

/**
 * Triggers campaign automatically when a price drop is detected
 */
export async function triggerPriceDropCampaign(product: Product, oldPrice: number, newPrice: number): Promise<void> {
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return;

  const campaignId = `camp-price-${product.id}-${Date.now()}`;
  const productLink = `${window.location.origin}?product=${product.id}`;
  const savings = oldPrice - newPrice;

  const campaign: MarketingCampaign = {
    id: campaignId,
    title: `Price Drop: ${product.title}`,
    subject: `🚨 PRICE DROP ALERT: Save $${savings} on ${product.title}!`,
    content: `Great news! The price of ${product.title} has dropped from $${oldPrice} down to $${newPrice}. Buy it now before prices change again! Details here: ${productLink}`,
    type: 'price_drop',
    targetId: product.id,
    sentCount: subscribers.length,
    openCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };

  await setDoc(doc(db, CAMPAIGNS_COL, campaignId), campaign);

  const batch = writeBatch(db);
  for (const sub of subscribers) {
    const unsubLink = `${window.location.origin}?unsubscribe=${encodeURIComponent(sub.email)}`;
    const bodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fecaca; border-radius: 12px; background-color: #fffafb;">
        <span style="font-size: 11px; font-weight: bold; color: #dc2626; background-color: #fee2e2; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">Big Savings Alert</span>
        <h2 style="color: #111827; font-size: 20px; font-weight: bold; margin: 12px 0 6px 0;">🚨 Price Drop on Curated Gear!</h2>
        <p style="color: #4b5563; font-size: 14px; margin-bottom: 15px;">The pricing of <strong>${product.title}</strong> has just decreased, making this the absolute best time to pick it up.</p>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${product.images[0]}" alt="${product.title}" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: contain;" />
        </div>

        <div style="background-color: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
          <span style="font-size: 13px; color: #dc2626; font-weight: bold;">You Save: $${savings.toFixed(2)} (${Math.round((savings/oldPrice)*100)}% OFF!)</span>
          <div style="font-size: 26px; font-weight: bold; color: #dc2626; margin-top: 5px;">$${newPrice} <span style="font-size: 16px; text-decoration: line-through; color: #9ca3af; font-weight: normal;">$${oldPrice}</span></div>
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${productLink}" style="background-color: #dc2626; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(220,38,38,0.2);">Secure the Price Drop Now</a>
        </div>

        <p style="color: #9ca3af; font-size: 11px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 15px; margin: 0;">
          Sent automatically. Don't want these price drops? <a href="${unsubLink}" style="color: #dc2626;">Unsubscribe</a>.
        </p>
      </div>
    `;

    const logId = `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const log: MarketingLog = {
      id: logId,
      campaignId,
      email: sub.email,
      subject: campaign.subject,
      body: bodyHtml,
      sentAt: new Date().toISOString(),
      status: 'sent',
      retryCount: 0,
      opened: false,
      clicked: false,
      type: 'price_drop',
      targetId: product.id
    };

    batch.set(doc(db, LOGS_COL, logId), log);
    sendRealEmailViaResend(sub.email, campaign.subject, bodyHtml);
  }
  await batch.commit();

  triggerLocalBrowserPushNotification(`🚨 PRICE DROP: ${product.title}`, `Save $${savings}! Price fell from $${oldPrice} down to $${newPrice}.`);
}

/**
 * Triggers automated campaign on new Editorial / Article / Post publication
 */
export async function triggerNewPostCampaign(post: Post): Promise<void> {
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return;

  const campaignId = `camp-post-${post.id}-${Date.now()}`;
  const postLink = `${window.location.origin}?post=${post.id}`;

  const campaign: MarketingCampaign = {
    id: campaignId,
    title: `New Post: ${post.title}`,
    subject: `✍️ Guide: ${post.title} – Curated tips just published!`,
    content: `Read our latest editorial guide "${post.title}". Learn curated tips on finding the best setups. Read here: ${postLink}`,
    type: 'new_post',
    targetId: post.id,
    sentCount: subscribers.length,
    openCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };

  await setDoc(doc(db, CAMPAIGNS_COL, campaignId), campaign);

  const batch = writeBatch(db);
  for (const sub of subscribers) {
    const unsubLink = `${window.location.origin}?unsubscribe=${encodeURIComponent(sub.email)}`;
    const bodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <span style="font-size: 11px; font-weight: bold; color: #b45309; background-color: #fef3c7; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">Latest Editorial Post</span>
        <h2 style="color: #111827; font-size: 20px; font-weight: bold; margin: 12px 0 6px 0;">${post.title}</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 16px 0;">Category: <strong>${post.category}</strong> | Read time: <strong>${post.readTime}</strong></p>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${post.image}" alt="${post.title}" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;" />
        </div>

        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">${post.summary}</p>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${postLink}" style="background-color: #b45309; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">Read Curated Article</a>
        </div>

        <p style="color: #9ca3af; font-size: 11px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 15px; margin: 0;">
          Sent automatically by Alankariya. You can <a href="${unsubLink}" style="color: #b45309;">unsubscribe</a>.
        </p>
      </div>
    `;

    const logId = `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const log: MarketingLog = {
      id: logId,
      campaignId,
      email: sub.email,
      subject: campaign.subject,
      body: bodyHtml,
      sentAt: new Date().toISOString(),
      status: 'sent',
      retryCount: 0,
      opened: false,
      clicked: false,
      type: 'new_post',
      targetId: post.id
    };

    batch.set(doc(db, LOGS_COL, logId), log);
    sendRealEmailViaResend(sub.email, campaign.subject, bodyHtml);
  }
  await batch.commit();

  triggerLocalBrowserPushNotification(`✍️ NEW GUIDE: ${post.title}`, `Get professional tips, styling secrets, and curations. Read on the blog!`);
}

/**
 * Triggers automated coupon or discount code campaign
 */
export async function triggerCouponCampaign(title: string, discount: string, code: string, description: string): Promise<void> {
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return;

  const campaignId = `camp-coupon-${Date.now()}`;
  const promoLink = window.location.origin;

  const campaign: MarketingCampaign = {
    id: campaignId,
    title: `Coupon: ${title}`,
    subject: `🔥 EXCLUSIVE DEAL: Get ${discount} off using code ${code}!`,
    content: `${description}. Use promo code "${code}" at checkout to save ${discount}. Visit the store now: ${promoLink}`,
    type: 'coupon',
    sentCount: subscribers.length,
    openCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };

  await setDoc(doc(db, CAMPAIGNS_COL, campaignId), campaign);

  const batch = writeBatch(db);
  for (const sub of subscribers) {
    const unsubLink = `${window.location.origin}?unsubscribe=${encodeURIComponent(sub.email)}`;
    const bodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px dashed #b45309; border-radius: 12px; background-color: #fffbeb;">
        <span style="font-size: 11px; font-weight: bold; color: #b45309; background-color: #fef3c7; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">Exclusive Promo Code</span>
        <h2 style="color: #111827; font-size: 20px; font-weight: bold; margin: 12px 0 6px 0;">🎉 ${title}</h2>
        <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">${description}</p>
        
        <div style="background-color: #ffffff; border: 2px dashed #b45309; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Your Promo Code</div>
          <div style="font-size: 32px; font-weight: 800; color: #b45309; margin: 8px 0; font-family: monospace; letter-spacing: 2px;">${code}</div>
          <div style="font-size: 14px; font-weight: bold; color: #047857;">Saves ${discount} instantly at checkout!</div>
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${promoLink}" style="background-color: #b45309; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">Browse and Apply Coupon</a>
        </div>

        <p style="color: #9ca3af; font-size: 11px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 15px; margin: 0;">
          Sent automatically by Alankariya. Don't want exclusive discounts? <a href="${unsubLink}" style="color: #b45309;">Unsubscribe</a>.
        </p>
      </div>
    `;

    const logId = `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const log: MarketingLog = {
      id: logId,
      campaignId,
      email: sub.email,
      subject: campaign.subject,
      body: bodyHtml,
      sentAt: new Date().toISOString(),
      status: 'sent',
      retryCount: 0,
      opened: false,
      clicked: false,
      type: 'coupon'
    };

    batch.set(doc(db, LOGS_COL, logId), log);
    sendRealEmailViaResend(sub.email, campaign.subject, bodyHtml);
  }
  await batch.commit();

  triggerLocalBrowserPushNotification(`🔥 PROMO CODE: ${code}`, `Use code ${code} to claim ${discount} off on selected items! Click to shop.`);
}

/**
 * Triggers abandoned deal email reminder automatically if they don't buy (e.g. simulation delayed trigger)
 */
export async function triggerAbandonedDealCampaign(email: string, product: Product): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const campaignId = `camp-abandon-${product.id}-${Date.now()}`;
  const productLink = `${window.location.origin}?product=${product.id}`;

  const campaign: MarketingCampaign = {
    id: campaignId,
    title: `Abandoned Deal: ${product.title}`,
    subject: `🛒 Forget Something? Your ${product.title} is still available!`,
    content: `You were browsing the ${product.title}. Don't miss out on these exclusive affiliate rates and professional reviews! View product details here: ${productLink}`,
    type: 'abandoned_deal',
    targetId: product.id,
    sentCount: 1,
    openCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };

  await setDoc(doc(db, CAMPAIGNS_COL, campaignId), campaign);

  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff;">
      <span style="font-size: 11px; font-weight: bold; color: #475569; background-color: #f1f5f9; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">Shopping Cart / Deal Reminder</span>
      <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin: 12px 0 6px 0;">Don't miss out on your curated items!</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">We noticed you were reviewing <strong>${product.title}</strong>, but haven't secured the best affiliate rate yet. Quantities at this price point are limited!</p>
      
      <div style="display: flex; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f8fafc; align-items: center;">
        <img src="${product.images[0]}" alt="${product.title}" style="width: 80px; height: 80px; border-radius: 6px; object-fit: contain; margin-right: 15px; background: white;" />
        <div>
          <h4 style="margin: 0; color: #0f172a; font-size: 14px;">${product.title}</h4>
          <div style="font-size: 16px; font-weight: bold; color: #8c6239; margin-top: 5px;">$${product.price}</div>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 25px;">
        <a href="${productLink}" style="background-color: #0f172a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">Return and Complete Purchase</a>
      </div>

      <p style="color: #94a3b8; font-size: 11px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; margin: 0;">
        Sent automatically because you visited this product. Click <a href="${window.location.origin}?unsubscribe=${encodeURIComponent(cleanEmail)}" style="color: #475569;">here to unsubscribe</a>.
      </p>
    </div>
  `;

  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const log: MarketingLog = {
    id: logId,
    campaignId,
    email: cleanEmail,
    subject: campaign.subject,
    body: bodyHtml,
    sentAt: new Date().toISOString(),
    status: 'sent',
    retryCount: 0,
    opened: false,
    clicked: false,
    type: 'abandoned_deal',
    targetId: product.id
  };

  await setDoc(doc(db, LOGS_COL, logId), log);
  await sendRealEmailViaResend(cleanEmail, campaign.subject, bodyHtml);
}

/**
 * Triggers manual test email sending to list
 */
export async function sendManualNewsletter(subject: string, content: string): Promise<number> {
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return 0;

  const campaignId = `camp-news-${Date.now()}`;
  const campaign: MarketingCampaign = {
    id: campaignId,
    title: subject,
    subject,
    content,
    type: 'newsletter',
    sentCount: subscribers.length,
    openCount: 0,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };

  await setDoc(doc(db, CAMPAIGNS_COL, campaignId), campaign);

  const batch = writeBatch(db);
  for (const sub of subscribers) {
    const unsubLink = `${window.location.origin}?unsubscribe=${encodeURIComponent(sub.email)}`;
    const bodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1a202c; font-size: 22px; font-weight: bold; margin-bottom: 15px;">Curator Newsletter</h2>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 25px;">${content}</p>
        <p style="color: #a0aec0; font-size: 11px; text-align: center; border-top: 1px solid #edf2f7; padding-top: 15px; margin: 0;">
          Sent by Alankariya. You can <a href="${unsubLink}" style="color: #8c6239;">unsubscribe</a> at any time.
        </p>
      </div>
    `;

    const logId = `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const log: MarketingLog = {
      id: logId,
      campaignId,
      email: sub.email,
      subject,
      body: bodyHtml,
      sentAt: new Date().toISOString(),
      status: 'sent',
      retryCount: 0,
      opened: false,
      clicked: false,
      type: 'newsletter'
    };

    batch.set(doc(db, LOGS_COL, logId), log);
    sendRealEmailViaResend(sub.email, subject, bodyHtml);
  }

  await batch.commit();
  return subscribers.length;
}

/**
 * Triggers local browser notification (with safety checks)
 */
export function triggerLocalBrowserPushNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=128&q=80',
        badge: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=128&q=80'
      });
    } catch (e) {
      console.warn('Error displaying native browser notification inside iframe:', e);
    }
  }
}

/**
 * Real API call: Sends real email via Resend API if VITE_RESEND_API_KEY is defined
 */
export async function sendRealEmailViaResend(to: string, subject: string, htmlContent: string): Promise<boolean> {
  const apiKey = (import.meta as any).env?.VITE_RESEND_API_KEY || localStorage.getItem('owner_resend_api_key');
  if (!apiKey) {
    console.log(`[Marketing Email Simulation] Sent to: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Alankariya Curation <newsletter@alankariya.com>',
        to: [to],
        subject,
        html: htmlContent
      })
    });

    if (response.ok) {
      console.log(`[Real Resend API] Successfully sent email to: ${to}`);
      return true;
    } else {
      const errText = await response.text();
      console.error(`[Real Resend API Error] Failed to send email:`, errText);
      return false;
    }
  } catch (err) {
    console.error(`[Real Resend API Exception] Network/CORS block:`, err);
    return false;
  }
}

/**
 * Fetches all active subscribers from Firestore
 */
export async function getActiveSubscribers(): Promise<Subscriber[]> {
  try {
    const colRef = collection(db, SUBSCRIBERS_COL);
    const q = query(colRef, where('status', '==', 'active'));
    const snap = await getDocs(q);
    const result: Subscriber[] = [];
    snap.forEach(doc => {
      result.push(doc.data() as Subscriber);
    });
    return result;
  } catch (error) {
    console.error('Error fetching active subscribers:', error);
    return [];
  }
}

/**
 * Fetches subscriber by email
 */
export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  try {
    const docSnap = await getDoc(doc(db, SUBSCRIBERS_COL, email.trim().toLowerCase()));
    if (docSnap.exists()) {
      return docSnap.data() as Subscriber;
    }
    return null;
  } catch (error) {
    console.error('Error fetching subscriber:', error);
    return null;
  }
}

/**
 * Fetches all newsletter campaigns
 */
export async function getCampaigns(): Promise<MarketingCampaign[]> {
  try {
    const colRef = collection(db, CAMPAIGNS_COL);
    const snap = await getDocs(colRef);
    const result: MarketingCampaign[] = [];
    snap.forEach(doc => {
      result.push(doc.data() as MarketingCampaign);
    });
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

/**
 * Fetches all sent log records
 */
export async function getMarketingLogs(): Promise<MarketingLog[]> {
  try {
    const colRef = collection(db, LOGS_COL);
    const snap = await getDocs(colRef);
    const result: MarketingLog[] = [];
    snap.forEach(doc => {
      result.push(doc.data() as MarketingLog);
    });
    return result.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

/**
 * Track simulated open / click events inside the Subscriber testing client
 */
export async function trackEmailAction(logId: string, action: 'open' | 'click'): Promise<void> {
  const logRef = doc(db, LOGS_COL, logId);
  const logSnap = await getDoc(logRef);

  if (logSnap.exists()) {
    const log = logSnap.data() as MarketingLog;
    const updates: Partial<MarketingLog> = {};

    if (action === 'open' && !log.opened) {
      updates.opened = true;
      await updateDoc(logRef, updates);
      
      // Update Campaign stats
      const campRef = doc(db, CAMPAIGNS_COL, log.campaignId);
      await updateDoc(campRef, { openCount: increment(1) });
    } else if (action === 'click' && !log.clicked) {
      updates.clicked = true;
      await updateDoc(logRef, updates);

      // Update Campaign stats
      const campRef = doc(db, CAMPAIGNS_COL, log.campaignId);
      await updateDoc(campRef, { clickCount: increment(1) });

      // Increment subscriber clicks
      const subRef = doc(db, SUBSCRIBERS_COL, log.email);
      await updateDoc(subRef, { clicksCount: increment(1) });
    }
  }
}

/**
 * Retry failed deliveries (logs queue status)
 */
export async function retryFailedDeliveries(): Promise<number> {
  try {
    const colRef = collection(db, LOGS_COL);
    const q = query(colRef, where('status', '==', 'failed'));
    const snap = await getDocs(q);
    let count = 0;

    for (const docSnap of snap.docs) {
      const log = docSnap.data() as MarketingLog;
      if (log.retryCount < 3) {
        const success = await sendRealEmailViaResend(log.email, log.subject, log.body);
        await updateDoc(doc(db, LOGS_COL, log.id), {
          status: success ? 'sent' : 'failed',
          retryCount: increment(1),
          sentAt: new Date().toISOString()
        });
        if (success) count++;
      }
    }
    return count;
  } catch (error) {
    console.error('Error retrying deliveries:', error);
    return 0;
  }
}
