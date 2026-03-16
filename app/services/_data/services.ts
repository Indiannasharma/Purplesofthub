export interface ServiceProcess {
  step: string;
  title: string;
  desc: string;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  category: string;
  icon: string;
  color: string;
  heroDescription: string;
  overview: string;
  features: string[];
  process: ServiceProcess[];
  technologies: string[];
  benefits: string[];
  faqs: ServiceFaq[];
  relatedServices: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    shortTitle: "Web Development",
    tagline: "Modern websites that convert visitors into clients",
    category: "Development",
    icon: "🌐",
    color: "#4f46e5",
    heroDescription:
      "We build blazing-fast, SEO-optimised websites and web applications that convert visitors into paying clients. From business sites to full SaaS platforms.",
    overview:
      "At PurpleSoftHub, we build modern, high-performance websites designed to grow your business. Every site we deliver is mobile-responsive, SEO-ready, and built with clean, scalable code.",
    features: [
      "Custom Business Websites",
      "SaaS Platform Development",
      "E-commerce Stores",
      "Custom Dashboards & Portals",
      "Landing Pages",
      "Progressive Web Apps (PWA)",
      "Performance Optimization",
      "SEO-Friendly Code Structure",
    ],
    process: [
      { step: "01", title: "Discovery", desc: "We understand your goals, audience, and technical requirements." },
      { step: "02", title: "Design", desc: "We create wireframes and prototypes for your approval." },
      { step: "03", title: "Development", desc: "We build with clean, scalable, modern code." },
      { step: "04", title: "Launch", desc: "We deploy, test, and support your site post-launch." },
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "MongoDB", "PostgreSQL", "Vercel", "Netlify"],
    benefits: [
      "Rank higher on Google",
      "Load in under 2 seconds",
      "Works on all devices",
      "Built to scale with your business",
    ],
    faqs: [
      {
        q: "How long does a website take?",
        a: "A standard business website takes 7–14 days. More complex projects like SaaS platforms take 4–8 weeks.",
      },
      {
        q: "What is the cost?",
        a: "Business websites start from $300. Final pricing depends on your requirements. Book a free discovery call for a custom quote.",
      },
      {
        q: "Will my website be mobile friendly?",
        a: "Yes — every website we build is fully responsive and tested across all devices and screen sizes.",
      },
    ],
    relatedServices: ["ui-ux-design", "seo", "ecommerce-development"],
    metaTitle: "Web Development Services — PurpleSoftHub",
    metaDescription:
      "Professional web development services. We build fast, SEO-optimised websites, SaaS platforms, and e-commerce stores that grow your business.",
    keywords: [
      "web development services",
      "web development agency",
      "custom website development",
      "Next.js development",
      "React development agency",
    ],
  },

  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    shortTitle: "Mobile Apps",
    tagline: "Cross-platform apps users actually love to use",
    category: "Development",
    icon: "📱",
    color: "#7c3aed",
    heroDescription:
      "We build high-performance cross-platform mobile apps for iOS and Android using Flutter and React Native.",
    overview:
      "From MVP to enterprise-grade mobile app, we design and develop cross-platform applications that deliver exceptional user experiences and real business results.",
    features: [
      "iOS App Development",
      "Android App Development",
      "Cross-Platform (Flutter)",
      "React Native Apps",
      "App Store Submission",
      "Push Notifications",
      "Offline Support",
      "API Integration",
    ],
    process: [
      { step: "01", title: "Planning", desc: "Define features, user flows, and technical architecture." },
      { step: "02", title: "UI/UX Design", desc: "Design every screen with user experience in mind." },
      { step: "03", title: "Development", desc: "Build and test on both iOS and Android." },
      { step: "04", title: "Launch", desc: "Submit to App Store and Google Play with full support." },
    ],
    technologies: ["Flutter", "React Native", "Dart", "Firebase", "REST APIs", "GraphQL", "iOS", "Android"],
    benefits: [
      "One codebase for iOS and Android",
      "Native performance and feel",
      "Faster time to market",
      "Ongoing maintenance support",
    ],
    faqs: [
      {
        q: "Flutter or React Native?",
        a: "We recommend Flutter for most projects — it delivers near-native performance and has a single codebase for both platforms.",
      },
      {
        q: "How much does an app cost?",
        a: "Mobile apps start from $800. Complex apps with custom backends start from $2,000. Book a call for a detailed quote.",
      },
      {
        q: "Do you handle App Store submission?",
        a: "Yes — we handle the full submission process for both the Apple App Store and Google Play Store.",
      },
    ],
    relatedServices: ["web-development", "ui-ux-design", "saas-development"],
    metaTitle: "Mobile App Development — PurpleSoftHub",
    metaDescription:
      "Professional mobile app development using Flutter and React Native. iOS and Android apps built to perform.",
    keywords: [
      "mobile app development",
      "Flutter app development",
      "React Native development",
      "iOS app development",
      "Android app development",
    ],
  },

  {
    slug: "digital-marketing",
    title: "Digital Marketing & Advertising",
    shortTitle: "Digital Marketing",
    tagline: "Data-driven campaigns that bring real customers",
    category: "Marketing",
    icon: "📣",
    color: "#6d28d9",
    heroDescription:
      "We run high-ROI ad campaigns across Meta, Google, TikTok, and Snapchat — combined with organic strategies that grow your brand long-term.",
    overview:
      "Our digital marketing team builds full-funnel strategies that attract, convert, and retain customers. We combine paid advertising with SEO and content to deliver measurable, scalable growth.",
    features: [
      "Meta Ads (Facebook & Instagram)",
      "Google Ads (Search & Display)",
      "TikTok Advertising",
      "Snapchat Ads",
      "YouTube Advertising",
      "Retargeting Campaigns",
      "Conversion Rate Optimization",
      "Performance Reporting & Analytics",
    ],
    process: [
      { step: "01", title: "Audit", desc: "We analyse your current marketing and identify growth opportunities." },
      { step: "02", title: "Strategy", desc: "We build a full-funnel plan targeting your ideal customer." },
      { step: "03", title: "Launch", desc: "We create and launch optimised campaigns across your chosen platforms." },
      { step: "04", title: "Optimise", desc: "We continuously test and improve to maximise your return on ad spend." },
    ],
    technologies: ["Meta Ads Manager", "Google Ads", "Google Analytics 4", "TikTok Ads Manager", "Snapchat Ads", "SEMrush", "Hotjar"],
    benefits: [
      "Lower cost per acquisition",
      "Trackable ROI on every dollar spent",
      "Reach your exact target audience",
      "Scale what works, cut what doesn't",
    ],
    faqs: [
      {
        q: "What budget do I need to start?",
        a: "We recommend a minimum ad spend of $500/month to gather meaningful data. Management fees are separate and depend on campaign scope.",
      },
      {
        q: "Which platform should I advertise on?",
        a: "It depends on your audience and product. We'll recommend the right mix during your discovery call.",
      },
      {
        q: "How soon will I see results?",
        a: "Most clients see initial data within the first week. Optimised results typically appear after 30–60 days of testing.",
      },
    ],
    relatedServices: ["seo", "social-media-management", "branding-design"],
    metaTitle: "Digital Marketing Services — PurpleSoftHub",
    metaDescription:
      "Results-driven digital marketing. Meta Ads, Google Ads, TikTok Ads, and SEO campaigns that grow your business.",
    keywords: [
      "digital marketing agency",
      "Facebook ads agency",
      "Google ads management",
      "TikTok advertising",
      "performance marketing",
    ],
  },

  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    shortTitle: "UI/UX Design",
    tagline: "Pixel-perfect designs that convert and delight",
    category: "Design",
    icon: "🎨",
    color: "#7c3aed",
    heroDescription:
      "We design beautiful, intuitive digital products grounded in user research and conversion principles — from wireframes to full design systems.",
    overview:
      "Great design is the difference between a product users love and one they abandon. Our design team creates user-centric interfaces that look stunning, feel intuitive, and are built to convert.",
    features: [
      "Mobile & Web App Design",
      "Website UI Design",
      "Wireframing & Prototyping",
      "Design Systems & Style Guides",
      "User Research & Testing",
      "Conversion-Focused Layouts",
      "Accessibility Compliance",
      "Handoff-Ready Figma Files",
    ],
    process: [
      { step: "01", title: "Research", desc: "We study your users, competitors, and business goals to define the design direction." },
      { step: "02", title: "Wireframe", desc: "We map out all screens and flows before adding visual design." },
      { step: "03", title: "Design", desc: "We create high-fidelity mockups with your brand colours, fonts, and components." },
      { step: "04", title: "Handoff", desc: "We deliver developer-ready Figma files with all assets and specs." },
    ],
    technologies: ["Figma", "Adobe XD", "Principle", "Framer", "Maze", "Hotjar", "Zeroheight"],
    benefits: [
      "Higher conversion rates",
      "Reduced development rework",
      "Consistent brand identity",
      "User-tested before development",
    ],
    faqs: [
      {
        q: "Do you deliver Figma files?",
        a: "Yes — all designs are delivered as organised, developer-ready Figma files with components and variables.",
      },
      {
        q: "Can you redesign my existing product?",
        a: "Absolutely. We can audit your existing product, identify UX problems, and redesign it from scratch or incrementally.",
      },
      {
        q: "Do you do user testing?",
        a: "Yes — we offer usability testing using tools like Maze and real user interviews to validate designs before development.",
      },
    ],
    relatedServices: ["web-development", "mobile-app-development", "branding-design"],
    metaTitle: "UI/UX Design Services — PurpleSoftHub",
    metaDescription:
      "Professional UI/UX design services. We create beautiful, conversion-optimised interfaces for apps, websites, and SaaS products.",
    keywords: [
      "UI UX design agency",
      "app design services",
      "website design agency",
      "Figma design services",
      "product design agency",
    ],
  },

  {
    slug: "saas-development",
    title: "SaaS Development",
    shortTitle: "SaaS Development",
    tagline: "From MVP to enterprise — SaaS built to scale",
    category: "Development",
    icon: "⚙️",
    color: "#6d28d9",
    heroDescription:
      "We build end-to-end SaaS platforms — from early MVP validation to enterprise-grade infrastructure with subscriptions, multi-tenancy, and AI integrations.",
    overview:
      "We've built SaaS products from the ground up for founders and businesses. Our full-stack team handles everything from architecture and authentication to subscription billing and analytics dashboards.",
    features: [
      "MVP Development",
      "AI-Powered Tools & Automation",
      "Subscription Billing (Stripe)",
      "Multi-tenant Architecture",
      "Admin & Analytics Dashboards",
      "API Development & Integration",
      "Authentication & User Management",
      "Scalable Cloud Infrastructure",
    ],
    process: [
      { step: "01", title: "Scope", desc: "We define your core feature set and build a technical architecture roadmap." },
      { step: "02", title: "MVP", desc: "We ship a working product fast so you can validate with real users." },
      { step: "03", title: "Iterate", desc: "We refine based on user feedback through agile sprints." },
      { step: "04", title: "Scale", desc: "We optimise infrastructure for growth and ongoing feature development." },
    ],
    technologies: ["Next.js", "Node.js", "Stripe", "Supabase", "Prisma", "OpenAI", "PostgreSQL", "Redis", "AWS"],
    benefits: [
      "Launch faster with a lean MVP",
      "Recurring revenue from day one",
      "Built to handle thousands of users",
      "AI-ready architecture",
    ],
    faqs: [
      {
        q: "How long does an MVP take?",
        a: "A focused MVP with core features typically takes 6–10 weeks depending on complexity.",
      },
      {
        q: "Can you integrate AI into my SaaS?",
        a: "Yes — we integrate OpenAI, Anthropic Claude, and other AI APIs to power automation, chatbots, and AI-driven features.",
      },
      {
        q: "Do you handle hosting and DevOps?",
        a: "Yes — we set up cloud hosting, CI/CD pipelines, and monitoring so your product runs reliably.",
      },
    ],
    relatedServices: ["web-development", "mobile-app-development", "ui-ux-design"],
    metaTitle: "SaaS Development Services — PurpleSoftHub",
    metaDescription:
      "End-to-end SaaS development. We build scalable SaaS platforms with subscription billing, AI integrations, and enterprise infrastructure.",
    keywords: [
      "SaaS development company",
      "MVP development agency",
      "SaaS platform development",
      "AI SaaS development",
      "subscription app development",
    ],
  },

  {
    slug: "music-distribution",
    title: "Music Distribution & Promotion",
    shortTitle: "Music Distribution",
    tagline: "Get heard on 150+ platforms worldwide",
    category: "Music",
    icon: "🎵",
    color: "#86198f",
    heroDescription:
      "We distribute your music to Spotify, Apple Music, and 150+ platforms globally — and run targeted promotion campaigns to grow your streams and fanbase.",
    overview:
      "PurpleSoftHub is one of the few digital agencies that combines music distribution with real marketing power. We don't just upload your music — we promote it through TikTok, Instagram Reels, playlist campaigns, and artist branding.",
    features: [
      "Distribution to 150+ Streaming Platforms",
      "Spotify Playlist Pitching",
      "TikTok & Instagram Reels Promotion",
      "YouTube Music Distribution",
      "Artist Branding & Cover Art",
      "Stream Analytics & Reporting",
      "Pre-Save Campaign Setup",
      "Lyric Video Creation",
    ],
    process: [
      { step: "01", title: "Submit", desc: "You submit your track and we handle the rest — metadata, artwork, ISRC codes." },
      { step: "02", title: "Distribute", desc: "Your music goes live on Spotify, Apple Music, Tidal, and 150+ platforms." },
      { step: "03", title: "Promote", desc: "We launch targeted promo campaigns on TikTok, Instagram, and YouTube." },
      { step: "04", title: "Grow", desc: "We monitor analytics and optimise campaigns to keep momentum going." },
    ],
    technologies: ["DistroKid", "TuneCore", "Spotify for Artists", "Apple Music Connect", "Meta Ads", "TikTok Ads"],
    benefits: [
      "Your music on every major platform",
      "Real streams from targeted audiences",
      "Full analytics and royalty tracking",
      "Artist brand that stands out",
    ],
    faqs: [
      {
        q: "How long does distribution take?",
        a: "Music typically goes live within 3–7 business days after submission. We recommend submitting at least 2 weeks before your release date.",
      },
      {
        q: "Do I keep my royalties?",
        a: "Yes — you keep 100% of your royalties. We charge a distribution and promotion service fee, not a royalty cut.",
      },
      {
        q: "Can you help with my Spotify pitch?",
        a: "Yes — we submit your music to Spotify's editorial team through Spotify for Artists before your release date.",
      },
    ],
    relatedServices: ["branding-design", "social-media-management", "digital-marketing"],
    metaTitle: "Music Distribution & Promotion Services — PurpleSoftHub",
    metaDescription:
      "Get your music on Spotify, Apple Music, and 150+ platforms. We distribute and promote your music worldwide with targeted campaigns.",
    keywords: [
      "music distribution service",
      "Spotify promotion",
      "music promotion agency",
      "independent artist distribution",
      "music marketing agency",
    ],
  },

  {
    slug: "branding-design",
    title: "Branding & Creative Design",
    shortTitle: "Branding",
    tagline: "A brand identity that makes you unforgettable",
    category: "Design",
    icon: "✨",
    color: "#a855f7",
    heroDescription:
      "We craft bold, memorable brand identities — from logo design and colour palettes to full brand guidelines that make your business stand out.",
    overview:
      "Your brand is more than a logo. It's the first impression, the feeling, and the story. We help businesses and creators build a visual identity that communicates value, builds trust, and stays memorable.",
    features: [
      "Logo Design & Variations",
      "Brand Colour Palette",
      "Typography Selection",
      "Brand Guidelines Document",
      "Business Card & Stationery Design",
      "Social Media Branding Kit",
      "Pitch Deck & Presentation Design",
      "Brand Refresh & Rebranding",
    ],
    process: [
      { step: "01", title: "Discovery", desc: "We learn your brand values, audience, competitors, and vision." },
      { step: "02", title: "Concepts", desc: "We present 3 initial concept directions for you to choose from." },
      { step: "03", title: "Refine", desc: "We refine your chosen direction until it's perfect." },
      { step: "04", title: "Deliver", desc: "We deliver all files in every format — print-ready and digital." },
    ],
    technologies: ["Adobe Illustrator", "Figma", "Adobe Photoshop", "Canva Pro", "Adobe InDesign"],
    benefits: [
      "Stand out in a crowded market",
      "Build instant trust with customers",
      "Consistent identity across all channels",
      "Ready for print and digital use",
    ],
    faqs: [
      {
        q: "What files will I receive?",
        a: "You'll receive your logo and assets in AI, EPS, SVG, PNG, and PDF formats — ready for print and digital use.",
      },
      {
        q: "How many logo concepts do you provide?",
        a: "We provide 3 initial concepts and include up to 3 rounds of revisions on your chosen direction.",
      },
      {
        q: "Can you rebrand an existing business?",
        a: "Yes — we specialise in both new brands and rebrands. We'll analyse your existing identity and evolve it strategically.",
      },
    ],
    relatedServices: ["ui-ux-design", "social-media-management", "web-development"],
    metaTitle: "Branding & Logo Design Services — PurpleSoftHub",
    metaDescription:
      "Professional branding and logo design. We create memorable brand identities with logos, colour palettes, and full brand guidelines.",
    keywords: [
      "branding agency",
      "logo design services",
      "brand identity design",
      "creative branding agency",
      "logo designer",
    ],
  },

  {
    slug: "social-media-management",
    title: "Social Media Management",
    shortTitle: "Social Media",
    tagline: "Grow your audience and stay consistent online",
    category: "Marketing",
    icon: "📲",
    color: "#0ea5e9",
    heroDescription:
      "We manage your social media presence end-to-end — from content creation and scheduling to community management and monthly performance reports.",
    overview:
      "Consistent, high-quality social media is one of the most powerful tools for growing your brand. Our team creates platform-specific content, engages your audience, and grows your following organically.",
    features: [
      "Content Strategy & Planning",
      "Graphic & Video Content Creation",
      "Caption Writing & Hashtag Research",
      "Post Scheduling & Publishing",
      "Community Management & DM Responses",
      "Instagram, TikTok, Facebook & LinkedIn",
      "Monthly Analytics Reports",
      "Influencer Outreach & Collaboration",
    ],
    process: [
      { step: "01", title: "Audit", desc: "We audit your existing social presence and identify gaps and opportunities." },
      { step: "02", title: "Strategy", desc: "We build a monthly content calendar aligned with your business goals." },
      { step: "03", title: "Create", desc: "We produce scroll-stopping content — graphics, videos, and captions." },
      { step: "04", title: "Grow", desc: "We post, engage, and report — then refine for the next month." },
    ],
    technologies: ["Meta Business Suite", "Buffer", "Later", "Canva Pro", "CapCut", "Hootsuite", "Sprout Social"],
    benefits: [
      "Stay consistent without the time investment",
      "Content that looks professional",
      "Organic follower growth",
      "Full performance visibility monthly",
    ],
    faqs: [
      {
        q: "How many posts per month do I get?",
        a: "Our standard plan includes 12–20 posts per month depending on the package. Custom plans are available.",
      },
      {
        q: "Which platforms do you manage?",
        a: "We manage Instagram, TikTok, Facebook, LinkedIn, and X (Twitter). Most clients start with 2–3 platforms.",
      },
      {
        q: "Will I need to approve content?",
        a: "Yes — we send you a content calendar each month for approval before anything goes live.",
      },
    ],
    relatedServices: ["digital-marketing", "branding-design", "seo"],
    metaTitle: "Social Media Management Services — PurpleSoftHub",
    metaDescription:
      "Professional social media management. We handle content creation, scheduling, and community management across Instagram, TikTok, and more.",
    keywords: [
      "social media management agency",
      "Instagram management services",
      "TikTok content agency",
      "social media marketing",
      "content creation agency",
    ],
  },

  {
    slug: "seo",
    title: "SEO & Growth Marketing",
    shortTitle: "SEO",
    tagline: "Rank on Google and grow organic traffic",
    category: "Marketing",
    icon: "🔍",
    color: "#059669",
    heroDescription:
      "We implement proven SEO strategies that improve your Google rankings, drive qualified organic traffic, and compound your growth month over month.",
    overview:
      "Search engine optimisation is the highest-ROI long-term marketing channel. We combine technical SEO, content strategy, and link building to get your business ranking for the keywords your customers are searching.",
    features: [
      "Technical SEO Audit & Fixes",
      "Keyword Research & Strategy",
      "On-Page Optimisation",
      "Content Creation & Blogging",
      "Link Building & Outreach",
      "Local SEO (Google Business Profile)",
      "Core Web Vitals Optimisation",
      "Monthly Ranking Reports",
    ],
    process: [
      { step: "01", title: "Audit", desc: "We perform a full technical and content SEO audit of your site." },
      { step: "02", title: "Research", desc: "We identify high-value keywords your target customers are searching." },
      { step: "03", title: "Optimise", desc: "We optimise on-page elements, fix technical issues, and create content." },
      { step: "04", title: "Report", desc: "We track rankings, traffic, and conversions with monthly reports." },
    ],
    technologies: ["SEMrush", "Ahrefs", "Google Search Console", "Google Analytics 4", "Screaming Frog", "Surfer SEO"],
    benefits: [
      "Free, compounding traffic over time",
      "Higher quality leads from search",
      "Outrank your competitors",
      "Long-term ROI that grows monthly",
    ],
    faqs: [
      {
        q: "How long does SEO take to work?",
        a: "Most clients see measurable ranking improvements within 3–6 months. SEO compounds over time and is a long-term investment.",
      },
      {
        q: "Do you do local SEO?",
        a: "Yes — we optimise your Google Business Profile and local citations to help you rank in local search results.",
      },
      {
        q: "Can you write SEO content for my blog?",
        a: "Yes — content creation is included in our SEO packages. We research, write, and publish SEO-optimised blog posts for you.",
      },
    ],
    relatedServices: ["digital-marketing", "web-development", "social-media-management"],
    metaTitle: "SEO Services — PurpleSoftHub",
    metaDescription:
      "Professional SEO services that improve your Google rankings and drive qualified organic traffic to your business.",
    keywords: [
      "SEO services",
      "search engine optimisation agency",
      "local SEO services",
      "SEO agency",
      "Google ranking services",
    ],
  },

  {
    slug: "ecommerce-development",
    title: "E-commerce Development",
    shortTitle: "E-commerce",
    tagline: "Online stores built to sell 24 hours a day",
    category: "Development",
    icon: "🛍️",
    color: "#0891b2",
    heroDescription:
      "We build powerful e-commerce stores that are fast, secure, and optimised to convert browsers into buyers.",
    overview:
      "From product listings to payment processing, we build complete e-commerce solutions that work seamlessly across all devices and drive consistent online sales.",
    features: [
      "Custom E-commerce Stores",
      "Shopify Development",
      "Payment Gateway Integration",
      "Inventory Management",
      "Product Catalog Setup",
      "Shopping Cart & Checkout",
      "Order Management System",
      "Mobile-Optimised Shopping Experience",
    ],
    process: [
      { step: "01", title: "Plan", desc: "We define your store structure, product catalogue, and conversion goals." },
      { step: "02", title: "Design", desc: "We design a brand-consistent store focused on product discovery and conversion." },
      { step: "03", title: "Build", desc: "We develop and configure your store with all integrations and payment options." },
      { step: "04", title: "Launch", desc: "We launch, test, and provide training so you can manage your store with ease." },
    ],
    technologies: ["Shopify", "WooCommerce", "Next.js Commerce", "Stripe", "PayPal", "Klaviyo", "Google Shopping"],
    benefits: [
      "Start selling online fast",
      "Checkout optimised for conversions",
      "Scales as your product range grows",
      "Integrated with marketing tools",
    ],
    faqs: [
      {
        q: "Shopify or WooCommerce — which is better?",
        a: "Shopify is ideal for most businesses due to its ease of use and reliability. WooCommerce suits businesses already on WordPress. We'll recommend the right fit.",
      },
      {
        q: "Can you migrate my existing store?",
        a: "Yes — we migrate products, orders, and customer data from your existing platform to a new, better-performing store.",
      },
      {
        q: "Do you set up payment processing?",
        a: "Yes — we integrate Stripe, PayPal, and local payment methods so you can accept payments from day one.",
      },
    ],
    relatedServices: ["digital-marketing", "seo", "branding-design"],
    metaTitle: "E-commerce Development Services — PurpleSoftHub",
    metaDescription:
      "Professional e-commerce development on Shopify and WooCommerce. We build high-converting online stores that grow your revenue.",
    keywords: [
      "e-commerce development agency",
      "Shopify development",
      "WooCommerce development",
      "online store development",
      "e-commerce website agency",
    ],
  },
];

export default services;

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getRelatedServices(slugs: string[]): Service[] {
  return slugs.map((s) => services.find((svc) => svc.slug === s)).filter(Boolean) as Service[];
}
