import React from 'react';
import { Post, Product } from '../types';
import { Clock, User, Calendar, Tag, ArrowRight, ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogSectionProps {
  posts: Post[];
  allProducts: Product[];
  currentPostId: string | null;
  postTypeFilter: 'all' | 'blog' | 'guide';
  onNavigateToPost: (postId: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onBackToList: () => void;
}

// Lightweight, bullet-proof parser to render markdown into styled JSX elements safely
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
      {lines.map((line, idx) => {
        // H1 Heading
        if (line.startsWith('# ')) {
          return (
            <h1 key={idx} className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-8 mb-4">
              {line.replace('# ', '')}
            </h1>
          );
        }
        // H2 Heading
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3">
              {line.replace('## ', '')}
            </h2>
          );
        }
        // Bullet List Items
        if (line.startsWith('* ') || line.startsWith('- ')) {
          const rawText = line.replace(/^[\*\-]\s/, '');
          // Handle bold subsegments inside lists
          const parts = rawText.split('**');
          return (
            <ul key={idx} className="list-disc pl-5 my-2 space-y-1">
              <li className="text-slate-600">
                {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-900 font-bold">{p}</strong> : p)}
              </li>
            </ul>
          );
        }
        // Divider
        if (line.trim() === '---') {
          return <hr key={idx} className="border-slate-100 my-6" />;
        }
        // Blockquote
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-blue-500 bg-slate-50 p-4 rounded-r-xl my-4 text-slate-600 italic">
              {line.replace('> ', '')}
            </blockquote>
          );
        }
        // Empty lines
        if (!line.trim()) {
          return null;
        }

        // Standard Paragraph with potential bold items or links
        const parts = line.split('**');
        return (
          <p key={idx} className="text-slate-600">
            {parts.map((p, pIdx) => {
              if (pIdx % 2 === 1) {
                return <strong key={pIdx} className="text-slate-950 font-bold">{p}</strong>;
              }
              // Basic render for link patterns like [Sony]
              return p;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function BlogSection({
  posts,
  allProducts,
  currentPostId,
  postTypeFilter,
  onNavigateToPost,
  onNavigateToProduct,
  onBackToList
}: BlogSectionProps) {
  const currentPost = posts.find((p) => p.id === currentPostId);

  // Render detail view if currentPostId is selected
  if (currentPost) {
    // Gather related products reviewed in this post
    const relatedProducts = allProducts.filter((p) =>
      currentPost.relatedProductIds.includes(p.id)
    );

    // Dynamic internal linking: Suggest other articles / buying guides (excluding current)
    const suggestedArticles = posts
      .filter((p) => p.id !== currentPost.id)
      .slice(0, 2);

    return (
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" id={`post-detail-${currentPost.id}`}>
        {/* Back navigation */}
        <button
          onClick={onBackToList}
          id="btn-back-to-posts"
          className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors shadow-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Articles</span>
        </button>

        {/* Hero Banner */}
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-100 border border-stone-100 mb-8">
          <img
            src={currentPost.image}
            alt={currentPost.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex rounded-full bg-amber-850 px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wider shadow">
              {currentPost.postType === 'guide' ? 'Style Guide' : 'Curator Editorial'}
            </span>
          </div>
        </div>

        {/* Metadata section */}
        <div className="space-y-4 mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {currentPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-400">
            <span className="flex items-center space-x-1">
              <User className="h-3.5 w-3.5" />
              <span className="text-slate-600">{currentPost.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{currentPost.readTime}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(currentPost.publishedAt).toLocaleDateString()}</span>
            </span>
          </div>
        </div>

        {/* Custom Article Body Content */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-8" id="article-editorial-body">
          <MarkdownRenderer content={currentPost.content} />
        </div>

        {/* SEO Schema & Affiliate CRO: Mention/Promote products mentioned in this post */}
        {relatedProducts.length > 0 && (
          <div className="bg-[#1c1917] text-[#faf9f6] rounded-3xl p-6 sm:p-8 mb-8 shadow-lg" id="post-featured-product-cta">
            <span className="font-sans text-[10px] font-bold text-amber-300 uppercase tracking-widest">
              Top Choice
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 mb-6 text-white">
              Featured Products in this Article
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProducts.map((p) => (
                <div 
                  key={p.id}
                  className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 flex flex-col justify-between"
                >
                  <div className="flex items-start space-x-3.5">
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-xl object-cover shrink-0 bg-stone-800"
                    />
                    <div>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-white line-clamp-1">{p.title}</h4>
                      <p className="font-mono text-xs text-amber-300 mt-1">${p.price}</p>
                      <div className="flex items-center text-amber-500 text-xs mt-1">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                        <span className="font-bold">{p.rating}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToProduct(p.id)}
                    className="mt-4 flex w-full items-center justify-center space-x-1 bg-amber-850 hover:bg-amber-900 py-2.5 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    <span>View Product</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Internal linking section */}
        {suggestedArticles.length > 0 && (
          <div className="border-t border-stone-200/60 pt-8 mb-4" id="post-internal-linking">
            <h3 className="font-display text-xl font-bold text-stone-900 mb-4">
              Recommended Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestedArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => onNavigateToPost(art.id)}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-700 cursor-pointer transition-all"
                >
                  <span className="text-[10px] font-sans font-bold text-amber-800 uppercase">
                    {art.postType === 'guide' ? 'Style Guide' : 'Article'}
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-1 mt-1 hover:text-amber-800">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{art.readTime}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    );
  }

  // Otherwise, render list view
  const displayPosts = posts.filter(
    (p) => postTypeFilter === 'all' || p.postType === postTypeFilter
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="articles-hub">
      <div className="mb-8 border-b border-stone-200 pb-5 text-center sm:text-left">
        <h1 className="font-display text-3xl font-extrabold text-stone-900">
          {postTypeFilter === 'guide'
            ? 'Style Guides'
            : postTypeFilter === 'blog'
            ? 'Latest Articles'
            : 'Guides & Articles'}
        </h1>
        <p className="mt-2 text-sm text-slate-500 font-light">
          Read our latest style tips, product reviews, and shopping guides.
        </p>
      </div>

      {displayPosts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
          <p className="text-slate-500 text-sm">No articles available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="posts-list-grid">
          {displayPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigateToPost(post.id)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-50">
                <img
                  src={post.image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-amber-850 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                  {post.postType === 'guide' ? 'Style Guide' : 'Editorial'}
                </span>
              </div>
              <div className="p-5 flex flex-1 flex-col justify-between">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase text-stone-400">{post.category}</span>
                  <h3 className="font-display font-bold text-base text-stone-950 line-clamp-2 mt-1.5 group-hover:text-amber-800 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-4 border-t border-slate-50">
                  <span className="flex items-center space-x-1 text-slate-600">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
