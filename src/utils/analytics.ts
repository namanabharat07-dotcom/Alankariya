declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Global utility to safely interact with Google Analytics 4 (gtag.js)
 */

// Safe wrapper around window.gtag
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  // Console logging for verification/debugging
  console.log(`📊 [GA4 Track Event] ${eventName}`, params);

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...params,
      send_to: 'G-9991VP9TL7' // Target specifically the user's measurement ID
    });
  } else {
    console.warn(`⚠️ [GA4 Track Event] window.gtag is not initialized or was blocked. event: ${eventName}`);
  }
}

/**
 * Tracks virtual page views for the React single page application
 */
export function trackPageView(pageName: string, path?: string) {
  trackEvent('page_view', {
    page_title: pageName,
    page_path: path || `/${pageName}`,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
}

/**
 * Tracks product detail page views (view_item)
 */
export function trackProductView(productId: string, productTitle: string, category: string, price: number) {
  trackEvent('view_item', {
    currency: 'USD',
    value: price,
    items: [{
      item_id: productId,
      item_name: productTitle,
      item_category: category,
      price: price
    }]
  });
}

/**
 * Tracks product searches with query parameter (search)
 */
export function trackSearch(query: string) {
  trackEvent('search', {
    search_term: query
  });
}

/**
 * Tracks usage of the comparison matrix (compare_products)
 */
export function trackComparison(productNames: string) {
  trackEvent('compare_products', {
    compared_items: productNames
  });
}

/**
 * Tracks when a user adds a product to their watchlist or activates a price alert (add_to_watchlist)
 */
export function trackWatchlistAdd(productId: string, productTitle: string) {
  trackEvent('add_to_watchlist', {
    item_id: productId,
    item_name: productTitle
  });
}

/**
 * Tracks AI Product Finder questionnaire completion and generated recommendations (ai_product_finder_use)
 */
export function trackAIFinder(query: string, category: string, resultsCount: number) {
  trackEvent('ai_product_finder_use', {
    user_query: query,
    identified_category: category,
    recommendations_count: resultsCount
  });
}

/**
 * Tracks click on an affiliate partner button (click_affiliate_button)
 */
export function trackAffiliateClick(productId: string, productTitle: string, network: string, url: string) {
  trackEvent('click_affiliate_button', {
    product_id: productId,
    product_name: productTitle,
    retailer: network,
    url: url
  });
}

/**
 * Tracks outbound external click redirects to retail affiliate destinations (outbound_affiliate_click)
 */
export function trackOutboundClick(productId: string, productTitle: string, network: string, url: string) {
  trackEvent('outbound_affiliate_click', {
    product_id: productId,
    product_name: productTitle,
    retailer: network,
    destination_url: url
  });
}
