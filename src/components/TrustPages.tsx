import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Mail, Send, Check, Info, Lock, Scale, 
  Cookie, FileText, Award, Building2, Clock, Eye, AlertTriangle 
} from 'lucide-react';

// ============================================================================
// AD SENSE COMPLIANT AD SLOT
// Prevents Cumulative Layout Shift (CLS) when AdSense loads.
// ============================================================================
export function AdSenseAdSlot({ className = '', id }: { className?: string; id: string }) {
  return (
    <div 
      className={`my-8 flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200/60 rounded-2xl max-w-full overflow-hidden transition-all duration-300 ${className}`}
      id={`adsense-slot-${id}`}
    >
      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-mono mb-2">Advertisement</span>
      <div 
        className="w-full min-h-[90px] sm:min-h-[120px] md:min-h-[250px] flex items-center justify-center text-stone-300 border border-dashed border-stone-200 rounded-xl"
        style={{ contentVisibility: 'auto' }}
      >
        <span className="text-xs font-light italic">AdSense Space Reserved</span>
      </div>
    </div>
  );
}

// ============================================================================
// ABOUT US COMPONENT
// ============================================================================
export function AboutPage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto" id="about-page-view">
      {/* Header */}
      <div className="space-y-4 text-center">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-800 uppercase tracking-widest">
          <Award className="h-3 w-3" />
          <span>Our Vision</span>
        </span>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-stone-900 leading-tight">
          About Alankapriya
        </h1>
        <p className="text-sm sm:text-base text-stone-500 max-w-2xl mx-auto leading-relaxed font-light">
          Redefining consumer transparency through unbiased curation, mathematical audits, and intelligent comparison analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-stone-950">What is Alankapriya?</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Established in 2026, <strong>Alankapriya</strong> is a premier, independent digital evaluation collective and consumer guide. We curate the finest products across fashion, home, beauty, and consumer technology, delivering exhaustive comparison analytics to discerning buyers worldwide.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Unlike traditional blogs, we integrate rigorous technical matrices and specification tracking with beautiful aesthetic curation to respect your taste, time, and hard-earned resources.
            </p>
          </div>
          <div className="pt-4 border-t border-stone-100 flex items-center space-x-2 text-amber-800 font-mono text-[10px] uppercase font-bold tracking-wider">
            <span>ESTABLISHED 2026</span>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-stone-950">Our Mission</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Our mission is to return integrity and objectivity to online product research. In an era saturated with paid corporate sponsorships, non-disclosed placements, and superficial affiliate lists, we aim to be an oasis of uncorrupted consumer advocacy.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              We empower you with structured comparison indices, giving you absolute clarity before making buying decisions.
            </p>
          </div>
          <div className="pt-4 border-t border-stone-100 flex items-center space-x-2 text-amber-800 font-mono text-[10px] uppercase font-bold tracking-wider">
            <span>100% INDEPENDENT ADVOCACY</span>
          </div>
        </div>
      </div>

      {/* AI Comparison Explanation */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 space-y-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-stone-950">How AI Helps You Compare</h2>
            <p className="text-xs text-stone-400 font-light">Advanced specification indexing & sentiment compilation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-amber-800">01 / SPECIFICATION AUDITING</span>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Our AI analysis parses complex engineering specs, ingredient compositions, and hardware details to establish normalized quality benchmarks.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-amber-800">02 / UNBIASED DATA COMPILATION</span>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              By collecting hundreds of verified user reviews, expert benchmarks, and actual long-term durability reports, we synthesize true objective scores.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-amber-800">03 / COMPREHENSIVE CONTRAST</span>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              We explicitly map out product weaknesses—clearly detailing who should buy and who should pass on every item, without sugarcoating.
            </p>
          </div>
        </div>
      </div>

      {/* Ad slot for layout balancing */}
      <AdSenseAdSlot id="about-middle" />

      {/* Commitment to Unbiased Guidance */}
      <div className="rounded-3xl border border-amber-900/10 bg-amber-500/[0.02] p-8 space-y-4">
        <h3 className="font-display text-lg font-bold text-stone-900">Commitment to Informed Purchasing</h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          Every buying comparison index on Alankapriya is created with absolute editorial freedom. We buy products directly from retail channels, perform thorough data evaluation, and maintain robust verification procedures. If a highly-advertised product underperforms, we state it clearly. 
        </p>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          Our financial model relies exclusively on transparent, disclosed affiliate referral commissions and minimal Google AdSense ad slots—never on paid scores, brand overrides, or opaque advertising arrangements.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// CONTACT US COMPONENT
// ============================================================================
interface ContactPageProps {
  contactForm: { name: string; email: string; message: string };
  setContactForm: (val: { name: string; email: string; message: string }) => void;
  contactSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ContactPage({ contactForm, setContactForm, contactSuccess, onSubmit }: ContactPageProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto items-start" id="contact-page-view">
      
      {/* Editorial Desk Information */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-3">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-[10px] font-bold text-stone-600 uppercase tracking-widest">
            <Building2 className="h-3 w-3" />
            <span>Alankapriya HQ</span>
          </span>
          <h1 className="font-display text-3xl font-black tracking-tight text-stone-900">
            Contact Us
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-light">
            Have a technical correction, feedback on our comparison engine, or a specific product suggestions you want us to index? Get in touch with our editorial support team.
          </p>
        </div>

        <div className="space-y-4 border-t border-stone-200 pt-6">
          <div className="flex items-start space-x-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h5 className="font-sans font-bold text-xs text-stone-800">Direct Email Desk</h5>
              <p className="text-xs text-amber-800 font-mono mt-0.5">support@alankapriya.com</p>
              <p className="text-[10px] text-stone-400 font-light">For partnerships, legal, and standard inquiries</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h5 className="font-sans font-bold text-xs text-stone-800">Expected Response Window</h5>
              <p className="text-xs text-stone-600 font-light mt-0.5">Within 24 to 48 business hours</p>
              <p className="text-[10px] text-stone-400 font-light">Excludes weekend cycles and public holidays</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h5 className="font-sans font-bold text-xs text-stone-800">Business Information</h5>
              <p className="text-xs text-stone-600 font-light mt-0.5">Alankapriya Collective Group</p>
              <p className="text-[10px] text-stone-400 font-light">Bangalore, Karnataka, India</p>
            </div>
          </div>
        </div>

        {/* Ad slot */}
        <AdSenseAdSlot id="contact-sidebar" />
      </div>

      {/* Form Submission Block */}
      <div className="lg:col-span-7 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {contactSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-emerald-50 border border-emerald-100 p-8 text-center text-emerald-800 space-y-3"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-base">Message Dispatched Successfully</h4>
            <p className="text-xs text-emerald-700/90 leading-relaxed font-light">
              Thank you for contacting Alankapriya! Your query has been logged. An editorial associate will analyze your request and follow up if needed within our business response timeframe.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5" id="compliance-contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1.5" htmlFor="contact-name">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text" required
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs outline-none focus:border-amber-700 focus:bg-white focus:ring-1 focus:ring-amber-200 transition-all font-light"
                  placeholder="e.g. David Miller"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1.5" htmlFor="contact-email">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email" required
                  value={contactForm.email}
                  onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs outline-none focus:border-amber-700 focus:bg-white focus:ring-1 focus:ring-amber-200 transition-all font-light"
                  placeholder="david@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1.5" htmlFor="contact-message">
                Message Description
              </label>
              <textarea
                id="contact-message"
                rows={5} required
                value={contactForm.message}
                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs outline-none focus:border-amber-700 focus:bg-white focus:ring-1 focus:ring-amber-200 transition-all font-light leading-relaxed"
                placeholder="Provide details about your correction, feedback, or suggestion..."
              />
            </div>

            <div className="text-[10px] text-stone-400 font-light flex items-start space-x-1.5">
              <input type="checkbox" required id="contact-consent" className="mt-0.5" />
              <label htmlFor="contact-consent">
                I consent to having this website store my submitted form details so they can respond to my inquiry. See our <a href="#privacy" className="text-amber-800 hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-amber-700 hover:bg-amber-800 py-3 text-xs font-bold uppercase tracking-wider text-white shadow transition-colors cursor-pointer"
            >
              <span>Dispatch Message</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PRIVACY POLICY COMPONENT
// ============================================================================
export function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto text-sm text-stone-600 leading-relaxed font-light" id="privacy-page-view">
      <div className="space-y-3 text-center pb-6 border-b border-stone-200">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-stone-100 border border-stone-200 px-3.5 py-1 text-xs font-bold text-stone-600 uppercase tracking-widest">
          <Lock className="h-3 w-3" />
          <span>User Security</span>
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900">Privacy Policy</h1>
        <p className="text-xs text-stone-400 font-mono">Last Updated: July 20, 2026</p>
      </div>

      <p className="pt-4">
        At <strong>Alankapriya</strong>, we value the trust of our visitors above all else. This Privacy Policy documents the specific categories of data we collect, how it is stored and managed via cloud databases, our transparent integration with advertising partner networks (such as Google AdSense), and cookie-level transparency.
      </p>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">1. Google AdSense & Third-Party Advertising</h2>
        <p>
          Google, as a third-party advertising vendor, uses tracking cookies to serve relevant, personalized advertisements on this website. Google&apos;s use of advertising cookies (such as the DoubleClick cookie) enables it and its partner networks to serve advertisements to users based on prior visits to Alankapriya and/or other online portals.
        </p>
        <p>
          Users can opt-out of personalized advertising schemas by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-800 underline">Google Ads Settings</a>. Alternatively, you can disable third-party advertising cookie configurations by navigating to the Network Advertising Initiative opt-out portal.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">2. Cookies & Dynamic Tracking Technologies</h2>
        <p>
          We employ cookies, local cache mechanisms, and browser database storage to improve page render performance, persist comparison watchlists across user cycles, track newsletter registration statuses, and coordinate security measures.
        </p>
        <p>
          Additionally, standard affiliate partner networks (including Amazon Associates, Flipkart, and other marketing exchanges) deploy tracking cookies upon link traversal. These cookies record transactional referrers to authorize affiliate commissions. See our <a href="#cookies" className="text-amber-800 underline">Cookie Policy</a> for detailed preferences.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">3. Google Analytics & Telemetry Tracking</h2>
        <p>
          We use Google Analytics to track user interaction matrices (including page views, search keywords entered inside our AI compare bar, approximate stay durations, and click coordinates on outbound links). This data is completely anonymized, masking user IP addresses, and is processed solely for statistical purposes to refine user interface flows and maintain layout health.
        </p>
      </div>

      {/* Ad Slot */}
      <AdSenseAdSlot id="privacy-middle" />

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">4. Firebase & Authentication Services</h2>
        <p>
          For user profiles, saved watchlists, and price-tracking subscription queues, we use Firebase Firestore and Firebase Authentication. When you create an account, register your email for price drop monitors, or subscribe to our newsletters, your data is cryptographically isolated and stored inside secure cloud-hosted Firebase instances. We do not sell, rent, or lease our database catalogs to corporate entities.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">5. CCPA & GDPR Compliance Rights</h2>
        <p>
          Depending on your geographical jurisdiction, you possess explicit rights regarding your personal records:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-500">
          <li><strong>Right to Disclosure:</strong> Request to review what categories of data we have archived.</li>
          <li><strong>Right to Deletion:</strong> Direct our database administrators to wipe your personal account, saved watchlist nodes, and newsletter subscriptions permanently.</li>
          <li><strong>Opt-Out of Data Traversal:</strong> Opt-out of any analytical and marketing tracking by adjusting browser settings or submitting a request.</li>
        </ul>
        <p>
          To exercise any of these privileges, please log a formal request via support@alankapriya.com. All verification and execution procedures complete within 30 business days.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// TERMS & CONDITIONS COMPONENT
// ============================================================================
export function TermsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto text-sm text-stone-600 leading-relaxed font-light" id="terms-page-view">
      <div className="space-y-3 text-center pb-6 border-b border-stone-200">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-stone-100 border border-stone-200 px-3.5 py-1 text-xs font-bold text-stone-600 uppercase tracking-widest">
          <Scale className="h-3 w-3" />
          <span>Terms & Guidelines</span>
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900">Terms & Conditions</h1>
        <p className="text-xs text-stone-400 font-mono">Last Updated: July 20, 2026</p>
      </div>

      <p className="pt-4">
        By visiting, querying, or interacting with <strong>Alankapriya</strong> and its integrated product databases, you accept these Terms & Conditions. If you do not agree to be bound by these legal rules, please discontinue your access immediately.
      </p>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">1. Website Usage & Permitted Parameters</h2>
        <p>
          This platform is provided solely for personal, non-commercial use. Users may browse our reviews, coordinate specification contrasts, subscribe to newsletter alerts, and use our AI indexing tools. 
        </p>
        <p>
          You are strictly forbidden from executing scraping algorithms, automated crawling loops, database intrusion sequences, or denial-of-service maneuvers to compromise the integrity of our systems. Unauthorized commercial redistribution of our scoring assets or proprietary indices is a material violation of these terms.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">2. Proprietary Intellectual Property</h2>
        <p>
          All textual summaries, editorial comparison scores, design structures, responsive layout configurations, logo animations, custom iconography assets, and proprietary algorithm definitions are the exclusive property of the Alankapriya Collective Group. These materials are protected under international copyright, trademark, and intellectual property conventions.
        </p>
      </div>

      {/* Ad slot */}
      <AdSenseAdSlot id="terms-middle" />

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">3. Affiliate Disclosures & Merchant Responsibility</h2>
        <p>
          Alankapriya operates as an independent review portal and incorporates affiliate referral pathways (Amazon Associates, Flipkart Network, and EarnKaro). Outbound tracking codes are appended to redirect buttons. Clicking these links may generate commissions. This setup has absolutely zero bearing on our editorial scores.
        </p>
        <p>
          Crucially, we do not handle inventory, fulfillment, payment collections, or delivery of products. All transaction-level issues, warranty inquiries, and customer service requests must be routed directly to the merchant from whom you purchase the product.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">4. Limitation of General Liability</h2>
        <p>
          While we make every possible effort to maintain accurate pricing models, specification attributes, and user feedback records, all data is published strictly &quot;as is&quot; for educational and comparison reference. 
        </p>
        <p>
          Alankapriya, its parent collective, and editorial employees will not be held liable for pricing discrepancies, sudden merchant out-of-stock events, technical malfunctions, or any negative outcomes resulting from purchasing decisions made based on our review files.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// DISCLAIMER COMPONENT
// ============================================================================
export function DisclaimerPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto text-sm text-stone-600 leading-relaxed font-light" id="disclaimer-page-view">
      <div className="space-y-3 text-center pb-6 border-b border-stone-200">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-stone-100 border border-stone-200 px-3.5 py-1 text-xs font-bold text-stone-600 uppercase tracking-widest">
          <AlertTriangle className="h-3 w-3" />
          <span>Legal Disclosures</span>
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900">Disclaimer</h1>
        <p className="text-xs text-stone-400 font-mono">Last Updated: July 20, 2026</p>
      </div>

      <div className="rounded-2xl border border-amber-900/10 bg-amber-500/[0.02] p-6 space-y-4 pt-4">
        <p className="font-medium text-stone-800">
          Important Notice Regarding Affiliate Relationships, Specifications, and Dynamic Pricing
        </p>
        <p>
          The content displayed across <strong>Alankapriya</strong> (including specification tables, AI summary boards, and comparison indices) is intended strictly for product contrast, educational analysis, and general consumer assistance. 
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">1. Product Pricing May Fluctuating</h2>
        <p>
          Product pricing on external merchant portals (such as Amazon and Flipkart) changes dynamically due to algorithm refreshes, discount campaigns, inventory levels, and location variables. While our price trackers attempt to pull updated metrics, the price displayed on our platform is a historical referent. You must verify the final cost on the checkout page of the merchant prior to confirming any transaction.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">2. Technical Specification Changes</h2>
        <p>
          Manufacturers reserve the right to alter product specifications, update firmware, re-bundle software, or change component suppliers without updating model numbers. While we perform deep audits, you should double-check specific critical details (such as physical measurements, deep water resistance, or ingredient lists) directly against official brand specifications.
        </p>
      </div>

      {/* Ad slot */}
      <AdSenseAdSlot id="disclaimer-middle" />

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">3. Affiliate Relationship Disclosure</h2>
        <p>
          In full compliance with international advertising standards, we disclose that several outbound link paths on this website incorporate tracking tokens. We may earn a commission from qualifying purchases made through affiliate links at no additional cost to you. This assists us in preserving editorial independence and maintaining our high-precision servers.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">4. Safety and Professional Advice</h2>
        <p>
          Alankapriya does not provide professional medical, mechanical, electrical, or legal advice:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-500">
          <li><strong>Acoustic ANC & Audio:</strong> Continuous operation of headphones above safe decibel thresholds (85 dB) poses risk of hearing damage. Always monitor sound pressure outputs.</li>
          <li><strong>Wearable Biometrics:</strong> Smartwatch data (such as ECG, heartrate, or blood oxygen estimation) is for general guidance and must not replace clinical medical diagnostics.</li>
          <li><strong>Beauty & Ingredients:</strong> Verify active chemical compounds in beauty lists against individual skin allergy profiles before applying new products.</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// COOKIE POLICY COMPONENT
// ============================================================================
export function CookiePolicyPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto text-sm text-stone-600 leading-relaxed font-light" id="cookies-page-view">
      <div className="space-y-3 text-center pb-6 border-b border-stone-200">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-stone-100 border border-stone-200 px-3.5 py-1 text-xs font-bold text-stone-600 uppercase tracking-widest">
          <Cookie className="h-3 w-3" />
          <span>Tracking Disclosures</span>
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900">Cookie Policy</h1>
        <p className="text-xs text-stone-400 font-mono">Last Updated: July 20, 2026</p>
      </div>

      <p className="pt-4">
        At <strong>Alankapriya</strong>, we use cookies, local storage nodes, and similar tracking technologies to ensure optimal platform delivery. This Cookie Policy explains what these tracking files are, how we apply them, and your individual rights to manage them.
      </p>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">1. What Are Tracking Cookies?</h2>
        <p>
          Cookies are small text documents containing a string of alphanumeric characters deposited onto your physical hard drive or mobile memory card when you visit web portals. They help us recognize your browser across active sessions and deliver specialized features.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">2. Categories of Cookies We Use</h2>
        <p>
          Our web servers distribute cookies across three primary operational classes:
        </p>
        <ul className="list-none space-y-3 pl-0 pt-1">
          <li className="border-l-2 border-amber-800 pl-4 py-0.5">
            <strong className="text-stone-950 font-bold block text-xs uppercase tracking-wider font-sans mb-1">Essential & System Cookies (Strictly Necessary)</strong>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              Required for basic platform operations. These manage database sessions, coordinate secure logins, save local search settings, and prevent fraudulent interactions.
            </p>
          </li>
          <li className="border-l-2 border-amber-800 pl-4 py-0.5">
            <strong className="text-stone-950 font-bold block text-xs uppercase tracking-wider font-sans mb-1">Analytical & Telemetry Cookies (Performance Tracking)</strong>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              Administered through Google Analytics to compile performance charts, gauge user engagement indices on comparison guides, and isolate slow-loading templates.
            </p>
          </li>
          <li className="border-l-2 border-amber-800 pl-4 py-0.5">
            <strong className="text-stone-950 font-bold block text-xs uppercase tracking-wider font-sans mb-1">Advertising & Affiliate Cookies (Revenue & AdSense)</strong>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              Google AdSense utilizes advertising cookies to serve personalized commercial placements. Concurrently, affiliate partner tracking cookies (Amazon, Flipkart) are set when product links are clicked, enabling secure transaction attribution.
            </p>
          </li>
        </ul>
      </div>

      {/* Ad slot */}
      <AdSenseAdSlot id="cookie-middle" />

      <div className="space-y-4">
        <h2 className="font-display font-bold text-stone-900 text-base mt-6">3. Your Individual Tracking Choices</h2>
        <p>
          You have absolute authority regarding the acceptance and storage of cookies:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-500">
          <li><strong>Browser Preferences:</strong> You can adjust browser options to reject cookies or notify you when a cookie is placed. Check your browser&apos;s Help menu.</li>
          <li><strong>AdSense Opt-Out:</strong> Personalize your advertising experience or block dynamic AdSense trackers directly via <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-800 underline">Google Ads Settings</a>.</li>
          <li><strong>Outbound Partner Disabling:</strong> Opting out of cookies will not impact your reading experience, but may disrupt comparison watchlists and saved profiles.</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// AFFILIATE DISCLOSURE COMPONENT
// ============================================================================
export function AffiliateDisclosurePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto text-sm text-stone-600 leading-relaxed font-light" id="disclosure-page-view">
      <div className="space-y-3 text-center pb-6 border-b border-stone-200">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-stone-100 border border-stone-200 px-3.5 py-1 text-xs font-bold text-stone-600 uppercase tracking-widest">
          <Info className="h-3 w-3" />
          <span>Affiliate Compliance</span>
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-stone-900">Affiliate Disclosure</h1>
        <p className="text-xs text-stone-400 font-mono">Last Updated: July 20, 2026</p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm mt-6">
        <p className="font-medium text-stone-900 text-base">
          We may earn a commission from qualifying purchases made through affiliate links at no additional cost to you.
        </p>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          Transparency and complete honesty are the core principles that support our connection with readers. In strict compliance with the Federal Trade Commission (FTC) guidelines, please understand that several buy buttons, pricing cards, and deep compare links on <strong>Alankapriya</strong> contain custom affiliate tracking code.
        </p>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          When you click these tracking buttons and complete transactions on merchant sites (such as Amazon, Flipkart, or partner stores), our platform is credited a minor referral commission.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="font-display font-bold text-stone-900 text-base">How This Financial Setup Impacts Our Reviews</h2>
        <p>
          In a word: <strong>None</strong>. We prioritize editorial independence above everything. We do not accept sponsored blog overrides, corporate branding bribes, or paid score alterations. If a premium gadget underperforms or lists structural flaws during analysis, those defects are clearly mapped in our product comparison charts. Our financial model relies on these passive tracking fees solely to fund hardware verification equipment and keep our index databases online.
        </p>
        <p>
          Thank you for supporting our uncorrupted review efforts! If you have any inquiries regarding our affiliate relationships, please reach out to us at support@alankapriya.com.
        </p>
      </div>

      {/* Ad slot */}
      <AdSenseAdSlot id="disclosure-middle" />
    </div>
  );
}
