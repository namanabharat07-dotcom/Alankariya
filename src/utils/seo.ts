import { Product, Post, FAQItem } from '../types';

/**
 * Updates head metadata and injects JSON-LD schemas for high SEO optimization
 */
export function updateSEOMetadata(options: {
  title: string;
  description: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: 'website' | 'product' | 'article';
  breadcrumbs?: { name: string; url: string }[];
  productSchema?: Product;
  faqSchema?: FAQItem[];
}) {
  if (typeof window === 'undefined') return;

  const {
    title,
    description,
    canonicalUrl = window.location.href,
    imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    type = 'website',
    breadcrumbs,
    productSchema,
    faqSchema
  } = options;

  // 1. Core Meta Tags
  document.title = `${title} | Alankapriya`;

  updateOrCreateMetaTag('description', description);
  updateOrCreateMetaTag('robots', 'index, follow');

  // 2. Open Graph (OG) Tags
  updateOrCreateMetaTag('og:title', `${title} | Alankapriya`, 'property');
  updateOrCreateMetaTag('og:description', description, 'property');
  updateOrCreateMetaTag('og:type', type, 'property');
  updateOrCreateMetaTag('og:url', canonicalUrl, 'property');
  updateOrCreateMetaTag('og:image', imageUrl, 'property');
  updateOrCreateMetaTag('og:site_name', 'Alankapriya', 'property');

  // 3. Twitter Card Tags
  updateOrCreateMetaTag('twitter:card', 'summary_large_image');
  updateOrCreateMetaTag('twitter:title', `${title} | Alankapriya`);
  updateOrCreateMetaTag('twitter:description', description);
  updateOrCreateMetaTag('twitter:image', imageUrl);

  // 4. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 5. Schema Injection (JSON-LD)
  removeExistingSchemas();

  const schemas: any[] = [];

  // Add Breadcrumb Schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': crumb.name,
        'item': crumb.url
      }))
    });
  }

  // Add Product Schema & Review Schema
  if (productSchema) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': productSchema.title,
      'image': productSchema.images,
      'description': productSchema.description,
      'brand': {
        '@type': 'Brand',
        'name': productSchema.brand
      },
      'category': productSchema.category,
      'offers': {
        '@type': 'AggregateOffer',
        'priceCurrency': 'USD',
        'lowPrice': productSchema.price,
        'highPrice': productSchema.originalPrice,
        'offerCount': '3',
        'offers': [
          {
            '@type': 'Offer',
            'url': productSchema.amazonUrl,
            'seller': { '@type': 'Organization', 'name': 'Amazon' },
            'price': productSchema.price,
            'priceCurrency': 'USD',
            'availability': 'https://schema.org/InStock'
          },
          {
            '@type': 'Offer',
            'url': productSchema.flipkartUrl,
            'seller': { '@type': 'Organization', 'name': 'Flipkart' },
            'price': productSchema.price,
            'priceCurrency': 'USD',
            'availability': 'https://schema.org/InStock'
          }
        ]
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': productSchema.rating,
        'reviewCount': productSchema.reviewsCount,
        'bestRating': '5',
        'worstRating': '1'
      },
      'review': {
        '@type': 'Review',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': productSchema.rating,
          'bestRating': '5'
        },
        'author': {
          '@type': 'Person',
          'name': 'Editorial Expert'
        },
        'reviewBody': productSchema.verdict
      }
    });
  }

  // Add FAQ Schema
  if (faqSchema && faqSchema.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqSchema.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    });
  }

  // Inject Schemas
  schemas.forEach((schemaData, idx) => {
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld-json');
    script.setAttribute('id', `seo-jsonld-${idx}`);
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
  });
}

function updateOrCreateMetaTag(name: string, content: string, attributeName: 'name' | 'property' = 'name') {
  let tag = document.querySelector(`meta[${attributeName}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attributeName, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function removeExistingSchemas() {
  const scripts = document.querySelectorAll('script[id^="seo-jsonld-"]');
  scripts.forEach(script => script.remove());
}

/**
 * Builds XML Sitemap content dynamically based on current products and posts
 */
export function generateXMLSitemap(products: Product[], posts: Post[], baseUrl: string): string {
  const dateStr = new Date().toISOString().split('T')[0];
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Home
  sitemap += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Comparisons Page
  sitemap += `  <url>\n    <loc>${baseUrl}/?page=compare</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

  // Products
  products.forEach(p => {
    sitemap += `  <url>\n    <loc>${baseUrl}/?page=product&amp;id=${p.id}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  });

  // Posts / Guides
  posts.forEach(post => {
    sitemap += `  <url>\n    <loc>${baseUrl}/?page=${post.postType}&amp;id=${post.id}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  sitemap += `</urlset>`;
  return sitemap;
}

/**
 * Builds robots.txt content
 */
export function generateRobotsTxt(baseUrl: string): string {
  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /?page=admin

Sitemap: ${baseUrl}/sitemap.xml
`;
}
