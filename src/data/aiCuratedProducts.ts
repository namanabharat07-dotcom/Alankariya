export interface AICuratedProduct {
  id: string; // matches DB product id if available, or unique cur- prefix
  dbProductId?: string; // links to actual DB product if available
  title: string;
  brand: string;
  category: 'Smartphones' | 'Laptops' | 'Running Shoes' | 'Smartwatches';
  price: number;
  originalPrice: number;
  image: string;
  specifications: Record<string, string>;
  pros: string[];
  cons: string[];
  
  // Scoring / Matching metrics
  metrics: {
    performance: number; // 1 to 10
    camera?: number; // 1 to 10
    battery: number; // 1 to 10 (or battery life hours)
    display: number; // 1 to 10
    value: number; // 1 to 10
    gaming: number; // 1 to 10
    weight?: number; // grams or kg
    isOled?: boolean;
    isHighRefresh?: boolean;
    isWaterproof?: boolean;
    gpsPrecision?: 'standard' | 'high' | 'dual-frequency';
    terrain?: 'road' | 'marathon' | 'trail' | 'gym';
    pronation?: 'neutral' | 'overpronation' | 'underpronation';
    cushion?: 'max' | 'responsive' | 'minimal' | 'balanced';
    os?: 'ios' | 'android' | 'macos' | 'windows' | 'chromeos' | 'universal';
  };

  // Expert & Community summaries
  researchSummary: {
    strengths: string;
    concerns: string;
    confidenceRating: number; // e.g. 92
    reliableData: boolean;
    text: string;
  };

  // Pricing & Retailers
  retailers: {
    name: string;
    price: number;
    url: string;
    lowestAvailable?: boolean;
  }[];

  // AI Advice structure
  advice: {
    whyItFits: string;
    wherePerformsWell: string;
    tradeoffs: string;
    buyerType: string;
  };
}

export const CURATED_PRODUCTS: AICuratedProduct[] = [
  // ---------------- SMARTPHONES ----------------
  {
    id: 'cur-phone-1',
    dbProductId: 'prod-3', // Links to S24 Ultra (or S25 Ultra)
    title: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 124999,
    originalPrice: 134999,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'Snapdragon 8 Gen 3 for Galaxy',
      RAM: '12GB LPDDR5X',
      Storage: '512GB UFS 4.0',
      Display: '6.8" Dynamic AMOLED 2X, 120Hz, 2600 nits',
      Camera: '200MP Main + 50MP Periscope (5x optical) + 12MP Ultrawide + 10MP Telephoto (3x)',
      Battery: '5000mAh with 45W Fast Charging',
      Build: 'Titanium Frame, IP68 Water/Dust Resistant',
      S_Pen: 'Built-in S Pen Stylus included'
    },
    pros: [
      'Incredible 200MP camera with dedicated 5x/10x optical zoom capability',
      'Extremely bright 2600-nit anti-reflective flat AMOLED screen',
      'Integrated S Pen stylus with versatile note-taking and remote controls',
      'Outstanding performance with custom-tuned Snapdragon 8 Gen 3'
    ],
    cons: [
      'Relatively bulky and heavy in hand (232g)',
      '45W charging speed is slower compared to Chinese competitors (80W+)',
      'High premium price entry point'
    ],
    metrics: {
      performance: 10,
      camera: 10,
      battery: 9,
      display: 10,
      value: 8,
      gaming: 10,
      isOled: true,
      isHighRefresh: true,
      isWaterproof: true,
      os: 'android'
    },
    researchSummary: {
      strengths: 'Industry-leading 5x and 10x telephoto photographic versatility, class-leading screen anti-reflection coating, and guaranteed 7 years of OS updates.',
      concerns: 'Considerable bulk and weight can make single-handed use fatiguing, and slow charging relative to competitors.',
      confidenceRating: 95,
      reliableData: true,
      text: 'Vetted by dozens of expert lab evaluations and consistent customer ratings, confirming it is an absolute power-user powerhouse.'
    },
    retailers: [
      { name: 'Amazon India', price: 124999, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Flipkart', price: 126500, url: 'https://flipkart.com' }
    ],
    advice: {
      whyItFits: 'Matches your professional/photography needs perfectly with the integrated stylus and state-of-the-art camera array.',
      wherePerformsWell: 'Excels in extreme productivity, long-range zoom photography, outdoor display visibility under direct sunlight, and multi-tasking.',
      tradeoffs: 'It is a large, heavy titanium block that takes longer to charge than average flagship devices.',
      buyerType: 'Designed for professionals, power-users, mobile photographers, and people who plan to keep their phone for 5+ years.'
    }
  },
  {
    id: 'cur-phone-2',
    title: 'Apple iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Smartphones',
    price: 139900,
    originalPrice: 159900,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'Apple A17 Pro (3nm)',
      RAM: '8GB Unified',
      Storage: '256GB NVMe',
      Display: '6.7" Super Retina XDR OLED, 120Hz ProMotion',
      Camera: '48MP Main + 12MP Periscope (5x optical) + 12MP Ultrawide',
      Battery: '4441mAh with 25W charging',
      Build: 'Titanium Frame, IP68, Action Button',
      OS: 'iOS with Apple Intelligence'
    },
    pros: [
      'Peerless cinematic video recording quality with ProRes Log support',
      'Highly lightweight titanium chassis compared to previous steel models',
      'A17 Pro chip offers console-level gaming with hardware ray-tracing',
      'Unmatched battery efficiency and standby times'
    ],
    cons: [
      'Very expensive entry point',
      'Standard charging takes nearly 2 hours to complete',
      'Action button supports only one action mapping out of the box'
    ],
    metrics: {
      performance: 10,
      camera: 10,
      battery: 10,
      display: 10,
      value: 7,
      gaming: 10,
      isOled: true,
      isHighRefresh: true,
      isWaterproof: true,
      os: 'ios'
    },
    researchSummary: {
      strengths: 'Uncontested video recording quality, industry-leading battery efficiency, lightweight premium titanium build, and incredible gaming processor performance.',
      concerns: 'Slightly slow charging speed, restrictive out-of-box ecosystem features, and high replacement/repair costs.',
      confidenceRating: 94,
      reliableData: true,
      text: 'Backed by robust consumer index reports and professional camera benchmarking reviews.'
    },
    retailers: [
      { name: 'Amazon India', price: 139900, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Flipkart', price: 141200, url: 'https://flipkart.com' }
    ],
    advice: {
      whyItFits: 'Aligns perfectly with your requirement for iOS operating ecosystem and top-tier photography / video creation.',
      wherePerformsWell: 'Excels in stable video stabilization, natural skin-tone portrait capture, premium 3D mobile gaming, and holding resale value.',
      tradeoffs: 'Premium pricing, slow proprietary charging, and restriction to Apple accessories for full features.',
      buyerType: 'Perfect for content creators, vloggers, existing Apple users, and premium mobile enthusiasts.'
    }
  },
  {
    id: 'cur-phone-3',
    title: 'OnePlus 12 5G',
    brand: 'OnePlus',
    category: 'Smartphones',
    price: 64999,
    originalPrice: 69999,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'Snapdragon 8 Gen 3',
      RAM: '16GB LPDDR5X',
      Storage: '512GB UFS 4.0',
      Display: '6.82" 2K Curved AMOLED, 120Hz LTPO, 4500 nits peak',
      Camera: '50MP Sony LYT-808 + 64MP Periscope (3x optical) + 48MP Ultrawide',
      Battery: '5400mAh with 100W SUPERVOOC charging (charger in box)',
      Cooling: 'Dual Cryo-velocity Vapor Chamber',
      Build: 'Gorilla Glass Victus 2, IP65 protection'
    },
    pros: [
      'Blazing fast 100W wired and 50W wireless charging (full charge in 26 mins)',
      'Extremely powerful cooling vapor chamber - stays cool under sustained gaming loads',
      'Stunning 2K curved display with 4500 nits peak local brightness',
      'Massive 5400mAh dual-cell battery offers outstanding battery endurance'
    ],
    cons: [
      'IP65 rating is splashproof but not fully submersible like IP68 rivals',
      'Curved screen edges are prone to accidental palm touches',
      'Zoom is limited to 3x optical (higher zoom relies heavily on digital crop)'
    ],
    metrics: {
      performance: 10,
      camera: 8.5,
      battery: 10,
      display: 9.5,
      value: 10,
      gaming: 10,
      isOled: true,
      isHighRefresh: true,
      isWaterproof: false, // only IP65
      os: 'android'
    },
    researchSummary: {
      strengths: 'Exceptional value-for-money, blistering charging speed, beautiful display quality, and stellar thermal management under continuous high loads.',
      concerns: 'Slightly compromised water resistance rating and curved screen reflection.',
      confidenceRating: 92,
      reliableData: true,
      text: 'Highly rated by tech critics as the absolute "Flagship Killer" value deal of the current generation.'
    },
    retailers: [
      { name: 'Amazon India', price: 64999, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Flipkart', price: 65499, url: 'https://flipkart.com' }
    ],
    advice: {
      whyItFits: 'Matches your need for a high-performance gaming beast within a sensible mid-to-high budget.',
      wherePerformsWell: 'Excels in rapid charging recovery, smooth sustain gaming framerates, eye-strain protection in low light, and premium system speed.',
      tradeoffs: 'Avoid drops in deep water (it is only splash resistant) and some minor glare on the curved edges.',
      buyerType: 'Ideal for gamers, heavy power-users who hate waiting for charging, and value-conscious premium buyers.'
    }
  },
  {
    id: 'cur-phone-4',
    title: 'Motorola Edge 50 Pro',
    brand: 'Motorola',
    category: 'Smartphones',
    price: 31999,
    originalPrice: 35999,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'Snapdragon 7 Gen 3',
      RAM: '12GB LPDDR4X',
      Storage: '256GB UFS 2.2',
      Display: '6.7" Curved pOLED, 144Hz, HDR10+, Pantone Certified',
      Camera: '50MP Main with OIS + 10MP Telephoto (3x optical) + 13MP Ultrawide/Macro',
      Battery: '4500mAh with 125W Wired Charging & 50W Wireless Charging',
      Build: 'Vegan Leather Back, IP68 Water Submersible',
      OS: 'Clean Hello UI (Near stock Android)'
    },
    pros: [
      'Incredibly clean, ad-free Near-Stock Android software experience',
      'Gorgeous vegan leather back design that is soft, grippy, and premium',
      'Ultra smooth 144Hz screen refresh rate for fluid scrolling',
      'Full IP68 waterproof rating and 125W fast charging at a budget-friendly price'
    ],
    cons: [
      'Slightly weaker processor performance compared to raw-power gaming phones at this price',
      '4500mAh battery is slightly smaller than the 5000mAh industry standard',
      'Software updates can sometimes be delayed'
    ],
    metrics: {
      performance: 8,
      camera: 8,
      battery: 8,
      display: 9,
      value: 9,
      gaming: 8,
      isOled: true,
      isHighRefresh: true,
      isWaterproof: true,
      os: 'android'
    },
    researchSummary: {
      strengths: 'Outstanding design and hand-feel, superb 144Hz display, extremely fast charging, clean stock software, and actual telephoto camera lens under ₹35k.',
      concerns: 'Average processor limits extreme sustained gaming, and battery life is standard single-day rather than multi-day.',
      confidenceRating: 89,
      reliableData: true,
      text: 'Highly popular in India for users seeking premium flagships aesthetics, clean software, and solid cameras without paying massive premiums.'
    },
    retailers: [
      { name: 'Flipkart', price: 31999, url: 'https://flipkart.com', lowestAvailable: true },
      { name: 'Amazon India', price: 32499, url: 'https://amazon.in' }
    ],
    advice: {
      whyItFits: 'Fits your target budget range and aligns with your desire for clean, bloatware-free software and great overall design.',
      wherePerformsWell: 'Excels in fast battery top-ups, beautiful ergonomic hand grip, displaying vibrant colors, and clear 3x optical portrait shots.',
      tradeoffs: 'You trade off top-tier raw gaming horsepower for clean software and premium design.',
      buyerType: 'Perfect for daily average users, office professionals, and aesthetic lovers who want a premium, clean Android experience.'
    }
  },
  {
    id: 'cur-phone-5',
    title: 'Samsung Galaxy M36 5G',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 19999,
    originalPrice: 24999,
    image: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'Exynos 1480 (4nm)',
      RAM: '8GB LPDDR4X',
      Storage: '128GB (Expandable up to 1TB)',
      Display: '6.6" Super AMOLED, 120Hz refresh rate',
      Camera: '50MP Main with OIS + 8MP Ultrawide + 2MP Macro',
      Battery: '6000mAh Extreme Battery capacity',
      Charging: '25W charging support (no charger in box)',
      Build: 'Polycarbonate body, Gorilla Glass Victus+'
    },
    pros: [
      'Massive 6000mAh battery provides a consistent 2-day battery life with ease',
      'Vibrant 120Hz Super AMOLED display offers premium brightness and punchy colors',
      '4 years of Android OS updates and 5 years of security updates guaranteed',
      'Exynos 1480 processor built on efficient 4nm offers smooth daily operations'
    ],
    cons: [
      'Very slow charging (25W takes about 1 hour and 45 minutes to charge 6000mAh)',
      'No charger provided in the retail packaging box',
      'Slightly thicker and heavier build (208g) due to the massive battery'
    ],
    metrics: {
      performance: 7,
      camera: 7.5,
      battery: 10,
      display: 8.5,
      value: 10,
      gaming: 7,
      isOled: true,
      isHighRefresh: true,
      isWaterproof: false,
      os: 'android'
    },
    researchSummary: {
      strengths: 'Peerless 2-day battery endurance, robust Knox security, beautiful AMOLED display, and industry-leading software support longevity at this price.',
      concerns: 'Thick plastic frame, slow charging, and gaming restricted to casual/mid settings.',
      confidenceRating: 91,
      reliableData: true,
      text: 'Verified by millions of budget users in India as the ultimate reliable daily driver for unmatched battery life.'
    },
    retailers: [
      { name: 'Amazon India', price: 19999, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Flipkart', price: 20499, url: 'https://flipkart.com' }
    ],
    advice: {
      whyItFits: 'Perfect for your sub-₹20,000 budget, providing Samsung brand reliability and a monster battery.',
      wherePerformsWell: 'Excels in maximum screen-on time, basic video streaming, reading, social media scrolling, and longevity of software.',
      tradeoffs: 'Takes a long time to charge and does not include a charger. It is not suitable for high-end graphic games.',
      buyerType: 'Ideal for students, parents, budget buyers, travelers, and anyone prioritizing endless battery life over luxury specs.'
    }
  },

  // ---------------- LAPTOPS ----------------
  {
    id: 'cur-laptop-1',
    dbProductId: 'prod-4',
    title: 'Apple MacBook Air 13" (M3)',
    brand: 'Apple',
    category: 'Laptops',
    price: 114900,
    originalPrice: 124900,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'Apple M3 chip (8-core CPU, 10-core GPU)',
      RAM: '16GB Unified Memory',
      Storage: '512GB Superfast SSD',
      Display: '13.6" Liquid Retina Display, 500 nits, Wide Color (P3)',
      Battery: 'Up to 18 hours battery life, MagSafe 3 charging',
      Weight: '1.24 kg (Ultra-lightweight)',
      Design: 'Fanless silent thermal design, premium aluminum enclosure',
      External: 'Supports up to two external displays (with lid closed)'
    },
    pros: [
      'Completely fanless, 100% silent design even under peak compile loads',
      'Incredible battery life (15-18 real-world hours) that easily beats Intel/AMD rivals',
      'Beautiful 500-nit Liquid Retina screen with highly accurate P3 color space',
      'Superb lightweight design (1.24kg) that is extremely durable'
    ],
    cons: [
      'Unified RAM is non-upgradable after purchase',
      'Limited to only 2 Thunderbolt USB-C ports',
      'Cannot support multiple displays unless the laptop lid remains closed'
    ],
    metrics: {
      performance: 9,
      battery: 10,
      display: 9,
      value: 8.5,
      gaming: 6, // Not for heavy AAA PC gaming
      isOled: false,
      isHighRefresh: false,
      weight: 1.24,
      os: 'macos'
    },
    researchSummary: {
      strengths: 'Phenomenal daily performance, complete silent operation, unmatched battery endurance, highly tactile keyboard, and superb aluminum build quality.',
      concerns: 'Not suited for heavy AAA Windows gaming, lacks memory upgrade paths, and has limited physical port selection.',
      confidenceRating: 96,
      reliableData: true,
      text: 'Universally acclaimed by reviewers as the single best overall laptop for developers, students, and everyday consumers in the world today.'
    },
    retailers: [
      { name: 'Amazon India', price: 114900, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Apple Store India', price: 124900, url: 'https://apple.com/in' }
    ],
    advice: {
      whyItFits: 'Perfect for development, coding, and light creative tasks, providing a premium macOS experience with silent, legendary battery endurance.',
      wherePerformsWell: 'Excels in compiling code, web development, running standard docker VMs, writing, and portable café workflows.',
      tradeoffs: 'You cannot upgrade the internal RAM/SSD later, and it does not run standard Windows-exclusive game titles natively.',
      buyerType: 'Perfect for software developers, university students, writers, and digital nomads seeking portable perfection.'
    }
  },
  {
    id: 'cur-laptop-2',
    title: 'ASUS ROG Zephyrus G14',
    brand: 'Asus',
    category: 'Laptops',
    price: 149999,
    originalPrice: 169999,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'AMD Ryzen 9 8945HS (8 Cores / 16 Threads)',
      RAM: '16GB LPDDR5X (Dual Channel)',
      Storage: '1TB PCIe 4.0 NVMe M.2 SSD',
      Graphics: 'NVIDIA GeForce RTX 4060 (8GB GDDR6, 90W TGP)',
      Display: '14" 3K ROG Nebula OLED, 120Hz, 100% DCI-P3, G-Sync',
      Battery: '73Wh battery with 180W Type-C power adapter',
      Weight: '1.50 kg',
      Build: 'CNC Aluminum with slash lighting'
    },
    pros: [
      'Jaw-dropping 3K OLED screen with deep blacks, high refresh, and perfect color accuracy',
      'Extremely high gaming performance in a portable 14" form factor',
      'Excellent trackpad, highly tactical keys, and clean slash aesthetic',
      'Surprisingly long battery life (7-8 hours on eco mode) for a gaming laptop'
    ],
    cons: [
      'Fans can become quite loud and high-pitched in Turbo mode',
      'The chassis gets very warm to the touch during heavy gaming sessions',
      'RAM is soldered and cannot be upgraded'
    ],
    metrics: {
      performance: 10,
      battery: 7.5,
      display: 10,
      value: 8.5,
      gaming: 10,
      isOled: true,
      isHighRefresh: true,
      weight: 1.5,
      os: 'windows'
    },
    researchSummary: {
      strengths: 'Unbelievable 3K OLED screen quality, extreme AMD Ryzen 9 processing power, highly portable design, and excellent speakers.',
      concerns: 'High thermal heat output under load, loud cooling fan profile, and no RAM expansion slot.',
      confidenceRating: 93,
      reliableData: true,
      text: 'Widely praised as the "MacBook Pro of Windows laptops" for its sleek balance of professional design and high-end gaming raw muscle.'
    },
    retailers: [
      { name: 'Amazon India', price: 149999, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Flipkart', price: 152000, url: 'https://flipkart.com' }
    ],
    advice: {
      whyItFits: 'Perfect for your heavy gaming, coding, and content creation needs, offering dedicated RTX graphics and a gorgeous 120Hz screen.',
      wherePerformsWell: 'Excels in AAA high-resolution PC gaming, video editing, local machine learning models, and smooth coding streams.',
      tradeoffs: 'Generates considerable fan noise and heat during long gaming sessions. Keep it on a hard flat desk surface.',
      buyerType: 'Ideal for hardcore gamers, professional video editors, engineering students, and Windows enthusiasts who refuse to carry heavy bricks.'
    }
  },
  {
    id: 'cur-laptop-3',
    title: 'Lenovo IdeaPad Slim 5',
    brand: 'Lenovo',
    category: 'Laptops',
    price: 68990,
    originalPrice: 79990,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'Intel Core Ultra 5 125H (14 Cores with AI NPU)',
      RAM: '16GB LPDDR5X (Dual Channel)',
      Storage: '1TB SSD M.2 PCIe 4.0',
      Graphics: 'Intel Arc Graphics (Integrated)',
      Display: '14" WUXGA (1920x1200) OLED, 60Hz, 100% DCI-P3',
      Battery: '57Wh battery, Rapid Charge Boost (2 hours in 15 mins)',
      Weight: '1.46 kg',
      Build: 'Military-grade certified aluminum chassis'
    },
    pros: [
      'Stunning 14" OLED screen at a highly competitive mid-range price',
      'Excellent performance with the latest Intel Core Ultra 5 and built-in AI NPU',
      'MIL-STD-810H military grade durability certification',
      '16GB RAM and a massive 1TB SSD storage pre-installed'
    ],
    cons: [
      'Display refresh rate is capped at 60Hz instead of 90Hz/120Hz',
      'Integrated graphics is not suitable for heavy modern gaming',
      'The keyboard backlight has only two brightness settings'
    ],
    metrics: {
      performance: 8,
      battery: 8,
      display: 9,
      value: 10,
      gaming: 5.5,
      isOled: true,
      isHighRefresh: false,
      weight: 1.46,
      os: 'windows'
    },
    researchSummary: {
      strengths: 'Stellar value-for-money, premium aluminum durability, highly vibrant OLED display with deep blacks, and rich 1TB storage layout.',
      concerns: 'Standard 60Hz screen refresh is not optimized for gaming, and integrated graphics limits intense 3D design software.',
      confidenceRating: 91,
      reliableData: true,
      text: 'Considered by reviewers as the absolute best value-for-money mid-range Windows laptop for everyday office and coding work.'
    },
    retailers: [
      { name: 'Amazon India', price: 68990, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Lenovo Store India', price: 69990, url: 'https://lenovo.com/in' }
    ],
    advice: {
      whyItFits: 'Fits your medium budget of ₹50k-75k perfectly, offering a stunning OLED display and highly powerful Core Ultra processor.',
      wherePerformsWell: 'Excels in high-definition movie streaming, general coding/writing, rapid battery charging, and office multi-tasking.',
      tradeoffs: 'Not suited for heavy games. Screen is a beautiful OLED but restricted to standard 60Hz fluid rate.',
      buyerType: 'Perfect for students, remote workers, casual writers, and value-seeking coders who want a premium screen.'
    }
  },
  {
    id: 'cur-laptop-4',
    title: 'Lenovo IdeaPad Slim 3',
    brand: 'Lenovo',
    category: 'Laptops',
    price: 36990,
    originalPrice: 48990,
    image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'AMD Ryzen 3 7320U (4 Cores / 8 Threads)',
      RAM: '8GB LPDDR5',
      Storage: '512GB PCIe NVMe SSD',
      Graphics: 'AMD Radeon 610M Integrated',
      Display: '15.6" FHD (1920x1080) Anti-glare TN panel, 250 nits',
      Battery: '47Wh, Up to 6 hours life',
      Weight: '1.55 kg',
      Ports: 'USB-C, USB-A, HDMI, Headphone Jack, SD Card Reader'
    },
    pros: [
      'Extremely affordable price for a reliable, brand-backed portable device',
      'Responsive daily speed with fast PCIe NVMe SSD storage',
      'Full size comfortable keyboard with number pad',
      'Very silent and cool operation during web tasks'
    ],
    cons: [
      'The TN display has narrow vertical viewing angles and washed-out colors',
      '8GB RAM is soldered and cannot be expanded later',
      'Plastic chassis can feel a bit flexible under hand pressure'
    ],
    metrics: {
      performance: 5.5,
      battery: 6.5,
      display: 5,
      value: 10,
      gaming: 3,
      isOled: false,
      isHighRefresh: false,
      weight: 1.55,
      os: 'windows'
    },
    researchSummary: {
      strengths: 'Very affordable entry price, decent processing speed for basic document editing/web tasks, and solid full-sized keyboard.',
      concerns: 'Washed-out display colors with limited viewing angles, and plastic overall casing quality.',
      confidenceRating: 88,
      reliableData: true,
      text: 'A highly reliable entry-level machine that performs standard everyday internet duties reliably without breaking the bank.'
    },
    retailers: [
      { name: 'Amazon India', price: 36990, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Flipkart', price: 37490, url: 'https://flipkart.com' }
    ],
    advice: {
      whyItFits: 'Perfect for your entry-level budget of sub-₹40k, providing standard utility for browsing and light homework.',
      wherePerformsWell: 'Excels in spreadsheet calculations, Zoom video calls, typing research notes, and watching casual video content.',
      tradeoffs: 'The screen is basic with limited colors, and it will struggle under multiple heavy developer applications or compile streams.',
      buyerType: 'Ideal for parents, school-going children, administrative assistants, and basic budget searchers.'
    }
  },

  // ---------------- RUNNING SHOES ----------------
  {
    id: 'cur-shoe-1',
    title: 'Nike Air Zoom Pegasus 40',
    brand: 'Nike',
    category: 'Running Shoes',
    price: 10495,
    originalPrice: 11995,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Cushioning: 'React Foam with Dual Zoom Air Units (Forefoot & Heel)',
      Drop: '10 mm heel-to-toe drop',
      Weight: '288 grams (Men\'s US 9)',
      Terrain: 'Daily Road running & Track training',
      Arch_Support: 'Neutral (Balanced support for standard gaits)',
      Upper: 'Single-layer engineered mesh for optimum breathability',
      Outsole: 'Waffle-inspired rubber pattern for supreme grip'
    },
    pros: [
      'Incredibly balanced and consistent daily training ride - legendary reliability',
      'Dual Zoom Air units offer highly responsive and springy energy return',
      'Highly comfortable redesigned midfoot strap holds the foot securely',
      'Superb rubber outsole durability - easily lasts up to 800+ kilometers'
    ],
    cons: [
      'Slightly heavy compared to modern ultra-lightweight racing shoes',
      'React foam can feel a bit firm during very long runs (over 21km)',
      'Not optimized for aggressive rugged off-road trail running'
    ],
    metrics: {
      performance: 9,
      battery: 0, // unused
      display: 0, // unused
      value: 10,
      gaming: 0, // unused
      terrain: 'road',
      pronation: 'neutral',
      cushion: 'balanced'
    },
    researchSummary: {
      strengths: 'Outstanding durability, balanced and highly dependable cushion, highly secure mesh lock, and versatile for walking or short sprints.',
      concerns: 'A bit traditional and heavy, lacks extreme plush cloud feel of max-cushion competitors.',
      confidenceRating: 95,
      reliableData: true,
      text: 'Now in its 40th iteration, the Pegasus is widely regarded by running communities as the most consistent daily training shoe ever built.'
    },
    retailers: [
      { name: 'Nike India Store', price: 10495, url: 'https://nike.com/in', lowestAvailable: true },
      { name: 'Myntra', price: 10995, url: 'https://myntra.com' }
    ],
    advice: {
      whyItFits: 'Perfect for your daily road running, providing a highly reliable and durable neutral running platform.',
      wherePerformsWell: 'Excels in daily workouts, consistent road runs (5km - 15km), walking, and gym session cross-training.',
      tradeoffs: 'Avoid using them on deep mud/trail tracks as they lack aggressive mud lugs. They are dependable rather than fluffy.',
      buyerType: 'Perfect for beginner to intermediate road runners, daily joggers, and walkers seeking long-lasting quality.'
    }
  },
  {
    id: 'cur-shoe-2',
    title: 'Asics Gel-Kayano 30',
    brand: 'Asics',
    category: 'Running Shoes',
    price: 15999,
    originalPrice: 17999,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Cushioning: 'FF BLAST PLUS ECO with PureGEL technology',
      Stability: '4D Guidance System (Adaptive overpronation support)',
      Drop: '10 mm drop',
      Weight: '303 grams',
      Terrain: 'Road running, long distance marathons, walking',
      Arch_Support: 'Overpronation stability support (ideal for flat arches)',
      Upper: 'Stretch knit upper for absolute snug fit'
    },
    pros: [
      'Unmatched stability system dynamically corrects flat foot pronation gently',
      'Incredibly plush, cloud-like cushioning with advanced PureGEL in the heel',
      'Premium step-in feel with a highly plush padded collar and tongue',
      'Outstanding joint impact reduction - saves knees during long runs'
    ],
    cons: [
      'Quite heavy (303g) which is not ideal for short speed sprints',
      'Knit upper holds onto heat, making it run a bit warm in peak summers',
      'Premium high-end pricing'
    ],
    metrics: {
      performance: 9.5,
      battery: 0,
      display: 0,
      value: 8.5,
      gaming: 0,
      terrain: 'road',
      pronation: 'overpronation',
      cushion: 'max'
    },
    researchSummary: {
      strengths: 'Exceptional arch support without feeling rigid, extremely soft and luxurious cushion, and premium materials designed to reduce running joint strain.',
      concerns: 'Relatively heavy weight, and a high-tier price tag.',
      confidenceRating: 94,
      reliableData: true,
      text: 'Hailed by podiatrists and marathoners worldwide as the absolute benchmark shoe for flat feet, overpronation, and joint protection.'
    },
    retailers: [
      { name: 'Asics India Store', price: 15999, url: 'https://asics.com/in', lowestAvailable: true },
      { name: 'Myntra', price: 16499, url: 'https://myntra.com' }
    ],
    advice: {
      whyItFits: 'Perfectly matches your overpronation/flat feet condition, providing industry-leading guidance and maximum protective cushioning.',
      wherePerformsWell: 'Excels in slow long-distance runs (half-marathons and full-marathons), daily recovery runs, and long hours of standing/walking.',
      tradeoffs: 'You trade off snappy lightweight speed for plush luxury and heavy-duty stability protection.',
      buyerType: 'Ideal for runners with flat feet, overpronators, heavy runners, and anyone recovering from knee or shin splint pain.'
    }
  },
  {
    id: 'cur-shoe-3',
    title: 'Adidas Ultraboost Light',
    brand: 'Adidas',
    category: 'Running Shoes',
    price: 18999,
    originalPrice: 21999,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Cushioning: 'Light BOOST foam (30% lighter than classic Boost)',
      Drop: '10 mm drop',
      Weight: '299 grams',
      Outsole: 'Continental™ Better Rubber (extreme road wet grip)',
      Upper: 'PRIMEKNIT+ textile (contains 50% recycled ocean plastic)',
      Arch: 'Linear Energy Push (LEP) system for balanced support'
    },
    pros: [
      'Stunning fashion appeal - seamlessly transitions from active running to casual street wear',
      'The sock-like PRIMEKNIT upper wraps around the foot like a soft, cozy glove',
      'Continental™ rubber outsole provides incredible grip, even on wet asphalt roads',
      'Light Boost foam offers highly bouncy and fun energy bounce'
    ],
    cons: [
      'Very expensive retail pricing',
      'The tight sock-knit fit can feel constricting for people with wide feet',
      'Slightly heavy compared to pure speed racing shoes'
    ],
    metrics: {
      performance: 8.5,
      battery: 0,
      display: 0,
      value: 8,
      gaming: 0,
      terrain: 'road',
      pronation: 'neutral',
      cushion: 'max'
    },
    researchSummary: {
      strengths: 'Outstanding aesthetic design, exceptional wet-weather Continental grip, and extremely comfortable knit material wrap.',
      concerns: 'Premium pricing, slightly tight midfoot cage, and best suited for casual/moderate runs rather than elite racing speed.',
      confidenceRating: 92,
      reliableData: true,
      text: 'Acclaimed globally as the most stylish premium hybrid running shoe that offers top-tier walking comfort and solid athletic utility.'
    },
    retailers: [
      { name: 'Adidas India Store', price: 18999, url: 'https://adidas.co.in', lowestAvailable: true },
      { name: 'Myntra', price: 19499, url: 'https://myntra.com' }
    ],
    advice: {
      whyItFits: 'Perfect for you if you want premium comfort, brand prestige, and a shoe that looks fantastic casually while offering great road cushion.',
      wherePerformsWell: 'Excels in walking commutes, steady paced road runs, travel, and lifestyle fashion statement matching.',
      tradeoffs: 'Avoid if you have extremely wide feet (order half a size up). It is a hybrid lifestyle runner rather than a lightweight racing flat.',
      buyerType: 'Perfect for style-conscious joggers, travelers, daily walkers, and active individuals who value premium comfort.'
    }
  },

  // ---------------- SMARTWATCHES ----------------
  {
    id: 'cur-watch-1',
    dbProductId: 'prod-2',
    title: 'Apple Watch Ultra 2',
    brand: 'Apple',
    category: 'Smartwatches',
    price: 89900,
    originalPrice: 89900,
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: 'Apple S9 SiP (Dual-Core)',
      Display: '49mm Always-On Retina LTPO OLED, 3000 nits peak',
      Battery: 'Up to 36 hours normal use (72 hours in low-power mode)',
      GPS: 'Dual-frequency precision GPS (L1 + L5)',
      Sensors: 'ECG, Blood Oxygen, Heart Rate, Skin Temperature, Depth gauge',
      Build: 'Aerospace-grade Titanium case, Sapphire crystal glass',
      Water: '100m water resistant, EN13319 recreational dive certified',
      Compatibility: 'iOS Only (Requires iPhone Xs or later)'
    },
    pros: [
      'Incredibly robust titanium chassis with professional dive and altitude certifications',
      'Insanely bright 3000-nit display is perfectly readable in blinding desert sun',
      'Dual frequency GPS provides surgical pinpoint accuracy in dense cities or forests',
      'Brilliant physical "Action Button" is customizable for physical quick triggers'
    ],
    cons: [
      'Absolutely restricted to Apple iOS only - will not pair with Android devices',
      'Very large 49mm size can feel massive and heavy on smaller wrists',
      'High premium price entry point'
    ],
    metrics: {
      performance: 10,
      battery: 8, // 36-72 hrs is great for Apple Watch, but less than Garmin
      display: 10,
      value: 8,
      gaming: 0,
      isOled: true,
      isWaterproof: true,
      gpsPrecision: 'dual-frequency',
      os: 'ios'
    },
    researchSummary: {
      strengths: 'Outstanding dual-frequency GPS tracking, beautiful and blindingly bright 49mm display, professional build quality, and unmatched Apple ecosystem smart features.',
      concerns: 'Completely incompatible with Android, bulky size, and needs charging every 2-3 days compared to weeks on Garmin.',
      confidenceRating: 95,
      reliableData: true,
      text: 'Universally hailed as the ultimate luxury rugged outdoor smartwatch for iPhone owners.'
    },
    retailers: [
      { name: 'Amazon India', price: 89900, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Apple Store India', price: 89900, url: 'https://apple.com/in' }
    ],
    advice: {
      whyItFits: 'Perfect for your iOS device, offering premium multi-sport outdoor GPS tracking and luxurious titanium durability.',
      wherePerformsWell: 'Excels in extreme hiking navigation, ocean swimming, smart voice replies, heart health auditing, and bright outdoor conditions.',
      tradeoffs: 'Android is completely unsupported, and you must charge it every second day.',
      buyerType: 'Designed for iPhone users who are outdoor adventurers, athletes, or simply want the most robust luxury smartwatch Apple makes.'
    }
  },
  {
    id: 'cur-watch-2',
    title: 'Garmin Forerunner 965',
    brand: 'Garmin',
    category: 'Smartwatches',
    price: 67490,
    originalPrice: 69990,
    image: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Display: '1.4" Always-On AMOLED screen with Titanium bezel',
      Battery: 'Up to 23 DAYS in smartwatch mode (31 hours in GPS mode)',
      GPS: 'Multi-band GPS with SatIQ technology (Precision tracking)',
      Sensors: 'Elevate V4 Heart rate, Pulse Ox, Barometric Altimeter, Gyroscope',
      Maps: 'Built-in full-color topographical maps preloaded',
      Weight: '53 grams (Ultra lightweight and comfortable)',
      Compatibility: 'Universal Compatibility (Both Android and iOS)'
    },
    pros: [
      'Breathtaking battery life - lasts up to 23 days on a single charge',
      'Built-in full-color topographical map screens work offline without phone connection',
      'SatIQ multi-band GPS offers industry-leading tracking in thick mountain covers',
      'Advanced professional training readiness, fatigue, and recovery diagnostics'
    ],
    cons: [
      'Very basic smart reply system (text replies restricted to Android only, no mic for calls)',
      'The companion Garmin Connect app has a steep learning curve with massive data fields',
      'Screen is not a touch-fluid luxury OS (tailored for physical buttons during sweat runs)'
    ],
    metrics: {
      performance: 9,
      battery: 10, // 23 days is legendary
      display: 8.5, // great AMOLED but not 3000 nits
      value: 9,
      gaming: 0,
      isOled: true,
      isWaterproof: true,
      gpsPrecision: 'dual-frequency',
      os: 'universal'
    },
    researchSummary: {
      strengths: 'Legendary multi-week battery life, incredible offline mapping features, extremely comfortable lightweight profile, and world-class athletic diagnostic reports.',
      concerns: 'Lacks premium smart assistant calls/replies and speaker features, and companion app is dense.',
      confidenceRating: 96,
      reliableData: true,
      text: 'Unanimously crowned by professional triathletes and trail runners as the absolute king of active sports navigation smartwatches.'
    },
    retailers: [
      { name: 'Amazon India', price: 67490, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Garmin India Store', price: 69990, url: 'https://garmin.co.in' }
    ],
    advice: {
      whyItFits: 'Perfect for your GPS trail running / sports tracking needs, offering universal compatibility and elite-level sports insights with weeks of battery.',
      wherePerformsWell: 'Excels in marathon pace planning, offline mountain trail routing, heart-rate variability auditing, and leaving charger bricks at home during travel.',
      tradeoffs: 'Lacks speaker/mic phone answering features. It is a highly specialized athletic computer first, smartwatch second.',
      buyerType: 'Ideal for runners, cyclists, hikers, ironman athletes, and travelers who prioritize physical data and battery over voice notifications.'
    }
  },
  {
    id: 'cur-watch-3',
    title: 'Samsung Galaxy Watch 7',
    brand: 'Samsung',
    category: 'Smartwatches',
    price: 29999,
    originalPrice: 32999,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    specifications: {
      Processor: '3nm Exynos W1000 (Fastest watch CPU on Android)',
      Display: 'Super AMOLED Always-on, 2000 nits Peak brightness',
      Battery: 'Up to 40 hours normal use',
      OS: 'Wear OS 5 co-developed with Google',
      Sensors: 'BioActive Sensor (ECG, Blood Pressure, Body Composition, Heart Rate)',
      GPS: 'Dual-frequency GPS (L1 + L5)',
      Build: 'Armor Aluminum case, Sapphire Crystal glass, IP68'
    },
    pros: [
      'Incredibly fluid and fast animations driven by the cutting-edge 3nm Exynos chip',
      'Advanced FDA-cleared ECG, Blood Pressure, and Body Composition sensor tracking',
      'Full Wear OS app ecosystem including offline Google Maps, Spotify, and WhatsApp',
      'Dual-frequency GPS offers excellent running route tracking'
    ],
    cons: [
      'ECG and Blood Pressure features are restricted to Samsung Galaxy phones only',
      'Battery life requires daily charging (lasts about 1.5 days max)',
      'Incompatible with Apple iOS devices'
    ],
    metrics: {
      performance: 9.5,
      battery: 6.5,
      display: 9.5,
      value: 9,
      gaming: 0,
      isOled: true,
      isWaterproof: true,
      gpsPrecision: 'dual-frequency',
      os: 'android'
    },
    researchSummary: {
      strengths: 'Top-tier health tracking accuracy, highly fluid system response, beautiful AMOLED screen, and seamless Google Maps/apps integration.',
      concerns: 'Poor battery endurance, and restriction of key medical sensors to Samsung phone users only.',
      confidenceRating: 91,
      reliableData: true,
      text: 'The absolute default premium smartwatch option for Android and Samsung Galaxy users.'
    },
    retailers: [
      { name: 'Amazon India', price: 29999, url: 'https://amazon.in', lowestAvailable: true },
      { name: 'Flipkart', price: 30499, url: 'https://flipkart.com' }
    ],
    advice: {
      whyItFits: 'Matches your Android phone preference perfectly, offering full smart notifications, calls, and extensive health tracking.',
      wherePerformsWell: 'Excels in responding to text messages on wrist, tracking gym body fat metrics, navigation on the fly, and sleep tracking.',
      tradeoffs: 'Incompatible with iPhone. Battery life will not exceed 30-40 hours, necessitating a daily charging routine.',
      buyerType: 'Perfect for Android and Samsung smartphone owners seeking an elegant, fully smart, app-rich lifestyle wearable.'
    }
  }
];
