import { getProductsFromFirestore, getPostsFromFirestore } from '../src/lib/firebase';
import { DEFAULT_PRODUCTS, DEFAULT_POSTS } from '../src/data/initialData';
import { generateXMLSitemap, generateRobotsTxt } from '../src/utils/seo';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const baseUrl = 'https://alankapriya.in';
  let products = DEFAULT_PRODUCTS;
  let posts = DEFAULT_POSTS;

  try {
    console.log('Fetching products from Firestore for SEO generation...');
    const firestoreProducts = await getProductsFromFirestore();
    if (firestoreProducts && firestoreProducts.length > 0) {
      products = firestoreProducts;
      console.log(`Successfully fetched ${products.length} products from Firestore.`);
    } else {
      console.log('Firestore products collection empty or not available, using defaults.');
    }
  } catch (error) {
    console.warn('Could not fetch products from Firestore, falling back to static DEFAULT_PRODUCTS:', error);
  }

  try {
    console.log('Fetching posts from Firestore for SEO generation...');
    const firestorePosts = await getPostsFromFirestore();
    if (firestorePosts && firestorePosts.length > 0) {
      posts = firestorePosts;
      console.log(`Successfully fetched ${posts.length} posts from Firestore.`);
    } else {
      console.log('Firestore posts collection empty or not available, using defaults.');
    }
  } catch (error) {
    console.warn('Could not fetch posts from Firestore, falling back to static DEFAULT_POSTS:', error);
  }

  const sitemapContent = generateXMLSitemap(products, posts, baseUrl);
  const robotsContent = generateRobotsTxt(baseUrl);

  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.log('Creating dist directory...');
    fs.mkdirSync(distDir, { recursive: true });
  }

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsContent, 'utf-8');

  console.log('Successfully generated sitemap.xml and robots.txt in dist/!');
}

generate().catch(err => {
  console.error('Failed to generate SEO files:', err);
  process.exit(1);
});
