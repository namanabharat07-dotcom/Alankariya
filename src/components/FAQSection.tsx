import React, { useState } from 'react';
import { FAQItem } from '../types';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', 'Affiliate', 'Editorial', 'Features', 'General'];

  // Filter FAQs based on search and selected category
  const filteredFaqs = faqs.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8" id="faq-section-wrapper">
      {/* Title Segment */}
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-sm text-stone-500 max-w-2xl mx-auto leading-relaxed font-light">
          Find quick answers to common questions about our reviews, partners, and shopping guides.
        </p>
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center" id="faq-controls">
        {/* Custom Category Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-stone-100">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setExpandedId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-stone-950 shadow-sm'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Local FAQ Search Input */}
        <div className="relative flex w-full sm:w-64 items-center rounded-xl border border-stone-200 bg-white">
          <span className="pl-3.5 text-stone-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setExpandedId(null);
            }}
            placeholder="Search FAQs..."
            className="w-full bg-transparent py-2 pl-2 pr-3.5 text-xs text-stone-850 outline-none placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Accordion List */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-stone-200 rounded-2xl bg-[#faf9f6]">
          <p className="text-slate-500 text-sm">No FAQs match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-3.5" id="faq-accordions-container">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? 'border-amber-100 bg-amber-50/10 shadow-sm'
                    : 'border-stone-100 hover:border-stone-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(faq.id)}
                  className="flex w-full items-center justify-between p-5 text-left outline-none cursor-pointer"
                >
                  <span className="flex items-center space-x-3 pr-4">
                    <HelpCircle className={`h-4.5 w-4.5 shrink-0 ${isExpanded ? 'text-amber-800' : 'text-slate-400'}`} />
                    <span className="font-display font-bold text-sm sm:text-base text-stone-900">
                      {faq.question}
                    </span>
                  </span>
                  <span className="shrink-0 text-slate-400 hover:text-slate-700">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-amber-800" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-stone-100/50 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
