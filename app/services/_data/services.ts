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
  cta?: string;
  ctaLink?: string;
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
    tagline: "Interfaces designed to delight and convert",
    category: "Design",
    icon: "🎨",
    color: "#db2777",
    heroDescription:
      "We design pixel-perfect interfaces grounded in user psychology, research, and conversion principles.",
    overview:
      "Great design is more than aesthetics — it drives business results. Our UI/UX design process combines user research, intuitive layouts, and visual excellence to create products people love to use.",
    features: [
      "User Interface Design",
      "User Experience Design",
      "Wireframing & Prototyping",
      "Design Systems",
      "Mobile App Design",
      "Web App Design",
      "Brand UI Guidelines",
      "Figma Design Files",
    ],
    process: [
      { step: "01", title: "Research", desc: "Understand users, goals, and competitor landscape." },
      { step: "02", title: "Wireframes", desc: "Map out user flows and page layouts." },
      { step: "03", title: "Design", desc: "Create high-fidelity designs in Figma." },
      { step: "04", title: "Handoff", desc: "Deliver production-ready design files with guidelines." },
    ],
    technologies: ["Figma", "Adobe XD", "Illustrator", "Photoshop", "Maze", "Principle"],
    benefits: [
      "Higher conversion rates",
      "Better user retention",
      "Consistent brand experience",
      "Production-ready design files",
    ],
    faqs: [
      {
        q: "What files do I receive?",
        a: "You receive fully organised Figma files with all components, design tokens, and guidelines for your development team.",
      },
      {
        q: "Do you do branding too?",
        a: "Yes — we offer full branding services including logo design, brand guidelines, and visual identity systems.",
      },
      {
        q: "How long does UI/UX design take?",
        a: "A standard web design project takes 5-10 days. Complex app designs with multiple screens take 2-4 weeks.",
      },
    ],
    relatedServices: ["web-development", "mobile-app-development", "ecommerce-development"],
    metaTitle: "UI/UX Design Services — PurpleSoftHub",
    metaDescription:
      "Professional UI/UX design services. We create beautiful, conversion-focused interfaces for web and mobile apps.",
    keywords: [
      "UI UX design services",
      "UI design agency",
      "UX design Nigeria",
      "Figma design services",
      "app design agency",
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
    slug: "music-promotion",
    title: "Music Distribution & Promotion",
    shortTitle: "Music Promotion",
    tagline: "Get your music heard by the world",
    category: "Music",
    icon: "🎵",
    color: "#86198f",
    heroDescription:
      "We help artists distribute their music to 150+ platforms worldwide and run targeted promotion campaigns that build real fanbases and grow streams.",
    overview:
      "Getting your music heard is just as important as creating it. We handle the full process — from global distribution to playlist pitching and social media promotion campaigns that put your music in front of the right audience.",
    features: [
      "Distribution to 150+ Platforms",
      "Spotify Playlist Pitching",
      "Apple Music Promotion",
      "TikTok Music Campaigns",
      "Instagram & YouTube Promotion",
      "Artist Branding & Cover Art",
      "Stream Analytics & Reporting",
      "Audience Growth Strategy",
    ],
    process: [
      { step: "01", title: "Submit", desc: "Submit your track and choose your promotion package." },
      { step: "02", title: "Distribute", desc: "Go live on Spotify, Apple Music, and 150+ platforms." },
      { step: "03", title: "Promote", desc: "Run targeted campaigns on TikTok, Instagram, and YouTube." },
      { step: "04", title: "Report", desc: "Receive detailed analytics on streams and audience growth." },
    ],
    technologies: ["Spotify for Artists", "Apple Music Connect", "DistroKid", "TuneCore", "TikTok for Artists", "YouTube Music"],
    benefits: [
      "Music on 150+ platforms in 24 hours",
      "Real streams from real listeners",
      "Professional artist branding",
      "Detailed analytics and reports",
    ],
    faqs: [
      {
        q: "How long until my music is live?",
        a: "Most platforms go live within 24-72 hours of submission. Spotify and Apple Music typically take 2-5 business days.",
      },
      {
        q: "Do I keep my music rights?",
        a: "Yes — you retain 100% of your music rights. We distribute on your behalf but you own your music.",
      },
      {
        q: "What promotion packages do you offer?",
        a: "We offer Starter ($10), Growth ($30), and Pro ($65) packages. Each includes distribution plus varying levels of active promotion and reporting.",
      },
    ],
    relatedServices: ["content-creation", "social-media-management", "facebook-ads"],
    metaTitle: "Music Distribution & Promotion — PurpleSoftHub",
    metaDescription:
      "Music distribution to 150+ platforms and targeted promotion campaigns. We help artists grow their streams and build real fanbases.",
    keywords: [
      "music distribution Nigeria",
      "music promotion services",
      "Spotify promotion",
      "music marketing agency",
      "independent artist promotion",
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
    tagline: "Grow your brand on social media consistently",
    category: "Marketing",
    icon: "📲",
    color: "#7c3aed",
    heroDescription:
      "We manage your social media presence across all platforms — creating content, growing your audience, and building a brand that people love.",
    overview:
      "Consistent, high-quality social media presence is essential for any modern business. We handle your content creation, posting, community management, and growth strategy so you can focus on running your business.",
    features: [
      "Content Strategy & Planning",
      "Graphic Design & Video Content",
      "Daily/Weekly Posting Schedule",
      "Community Management",
      "Hashtag Research & Strategy",
      "Instagram, Facebook, TikTok, X",
      "Analytics & Monthly Reports",
      "Influencer Outreach (on request)",
    ],
    process: [
      { step: "01", title: "Strategy", desc: "Brand audit and content strategy development." },
      { step: "02", title: "Content", desc: "Design and write content for your brand voice." },
      { step: "03", title: "Publish", desc: "Schedule and post content consistently." },
      { step: "04", title: "Grow", desc: "Engage audience and report on growth metrics." },
    ],
    technologies: ["Meta Business Suite", "Buffer", "Canva", "CapCut", "Adobe Premiere", "After Effects", "Later"],
    benefits: [
      "Consistent brand presence online",
      "Save hours of time every week",
      "Grow followers organically",
      "Professional content every day",
    ],
    faqs: [
      {
        q: "Which platforms do you manage?",
        a: "We manage Instagram, Facebook, TikTok, X (Twitter), LinkedIn, and YouTube. You choose which platforms matter most for your brand.",
      },
      {
        q: "How many posts per month?",
        a: "Our packages range from 12 to 30 posts per month depending on your chosen plan. We also include stories and reels in most packages.",
      },
      {
        q: "Do I need to provide content?",
        a: "No — we handle everything from concept to design to posting. We just need your brand guidelines and any product photos you want to use.",
      },
    ],
    relatedServices: ["facebook-ads", "content-creation", "google-ads", "account-recovery"],
    metaTitle: "Social Media Management — PurpleSoftHub",
    metaDescription:
      "Professional social media management for Instagram, Facebook, TikTok and more. Grow your brand consistently.",
    keywords: [
      "social media management",
      "social media agency Nigeria",
      "Instagram management",
      "social media marketing",
      "content creation Nigeria",
    ],
  },

  {
    slug: "seo",
    title: "SEO Services",
    shortTitle: "SEO",
    tagline: "Rank higher on Google and get found by your customers",
    category: "Marketing",
    icon: "🔍",
    color: "#059669",
    heroDescription:
      "We help businesses rank higher on Google through technical SEO, content strategy, and link building that drives real organic traffic.",
    overview:
      "Search Engine Optimisation is the most cost-effective long-term marketing strategy. We help you rank for the keywords your customers are searching for, driving consistent organic traffic to your business.",
    features: [
      "Technical SEO Audit",
      "Keyword Research & Strategy",
      "On-Page SEO Optimization",
      "Content Strategy & Creation",
      "Link Building",
      "Local SEO (Google Business Profile)",
      "Monthly SEO Reports",
      "Competitor Analysis",
    ],
    process: [
      { step: "01", title: "Audit", desc: "Full technical SEO audit of your website." },
      { step: "02", title: "Strategy", desc: "Keyword research and content roadmap." },
      { step: "03", title: "Optimise", desc: "Implement on-page and technical fixes." },
      { step: "04", title: "Report", desc: "Monthly ranking reports and ongoing improvements." },
    ],
    technologies: ["Google Search Console", "Ahrefs", "SEMrush", "Screaming Frog", "Google Analytics", "Google Business"],
    benefits: [
      "Rank on page 1 of Google",
      "Free organic traffic 24/7",
      "Outrank your competitors",
      "Long-term sustainable growth",
    ],
    faqs: [
      {
        q: "How long does SEO take?",
        a: "SEO is a long-term strategy. Most clients see measurable improvements within 3-6 months of consistent optimization.",
      },
      {
        q: "Do you guarantee page 1 ranking?",
        a: "No ethical SEO agency can guarantee rankings — but we use proven strategies that consistently move clients up the rankings.",
      },
      {
        q: "What's included in monthly SEO?",
        a: "Monthly SEO includes keyword tracking, content optimization, technical fixes, link building, and a detailed ranking report.",
      },
    ],
    relatedServices: ["web-development", "social-media-management", "digital-marketing"],
    metaTitle: "SEO Services — PurpleSoftHub",
    metaDescription:
      "Professional SEO services to help your business rank higher on Google and drive consistent organic traffic.",
    keywords: [
      "SEO services",
      "SEO agency Nigeria",
      "search engine optimization",
      "Google ranking services",
      "local SEO Nigeria",
    ],
  },

  {
    slug: "content-creation",
    title: "Content Creation",
    shortTitle: "Content Creation",
    tagline: "Scroll-stopping content that builds your brand",
    category: "Creative",
    icon: "🎬",
    color: "#d97706",
    heroDescription:
      "We create high-quality video content, graphics, and creative assets that capture attention and tell your brand story across all platforms.",
    overview:
      "Content is the foundation of every successful digital marketing strategy. We produce professional videos, graphics, and creative assets that make your brand stand out and drive real engagement.",
    features: [
      "Short-Form Video (Reels, TikTok)",
      "Explainer & Promotional Videos",
      "AI-Generated Video Content",
      "Graphic Design & Illustrations",
      "Photography Direction",
      "Brand Content Strategy",
      "YouTube Video Production",
      "Ad Creative Production",
    ],
    process: [
      { step: "01", title: "Brief", desc: "Understand your brand, audience, and content goals." },
      { step: "02", title: "Create", desc: "Produce video and graphic content assets." },
      { step: "03", title: "Edit", desc: "Professional editing with motion graphics." },
      { step: "04", title: "Deliver", desc: "Platform-ready files in all required formats." },
    ],
    technologies: ["Adobe Premiere Pro", "After Effects", "CapCut", "Canva", "Adobe Illustrator", "Photoshop", "OpenArt AI", "RunwayML"],
    benefits: [
      "Professional brand content",
      "Higher engagement rates",
      "AI-enhanced video production",
      "Ready for all platforms",
    ],
    faqs: [
      {
        q: "What types of videos do you create?",
        a: "We create promotional videos, product showcases, explainer videos, social media reels, TikToks, and AI-generated content.",
      },
      {
        q: "Do you use AI for content?",
        a: "Yes — we use the latest AI tools including RunwayML and OpenArt for AI video generation combined with professional editing in Premiere Pro.",
      },
      {
        q: "How many videos per month?",
        a: "Content packages range from 4 to 20 pieces of content per month depending on your chosen plan and content requirements.",
      },
    ],
    relatedServices: ["social-media-management", "facebook-ads", "music-promotion"],
    metaTitle: "Content Creation Services — PurpleSoftHub",
    metaDescription:
      "Professional content creation including video production, graphic design, and AI-generated content for social media and advertising.",
    keywords: [
      "content creation Nigeria",
      "video production Nigeria",
      "social media content creation",
      "AI video content",
      "creative content agency",
    ],
  },

  {
    slug: "facebook-ads",
    title: "Facebook & Instagram Ads",
    shortTitle: "Facebook Ads",
    tagline: "Targeted social ads that reach your ideal customers",
    category: "Marketing",
    icon: "📘",
    color: "#1877f2",
    heroDescription:
      "We create and manage high-converting Facebook and Instagram ad campaigns that reach your ideal customers and drive measurable results.",
    overview:
      "Meta advertising is one of the most powerful tools for reaching your target audience. We build, test, and scale campaigns that consistently deliver results for our clients.",
    features: [
      "Facebook Ad Campaign Management",
      "Instagram Ad Campaigns",
      "Audience Research & Targeting",
      "Custom & Lookalike Audiences",
      "Ad Creative Design",
      "A/B Split Testing",
      "Retargeting Campaigns",
      "Monthly Performance Reports",
    ],
    process: [
      { step: "01", title: "Research", desc: "Audience research and competitor ad analysis." },
      { step: "02", title: "Creative", desc: "Design ad creatives and write compelling copy." },
      { step: "03", title: "Launch", desc: "Set up targeting, budgets, and campaign structure." },
      { step: "04", title: "Scale", desc: "Optimise and scale winning campaigns." },
    ],
    technologies: ["Meta Ads Manager", "Meta Business Suite", "Meta Pixel", "Meta Conversions API", "Facebook Analytics"],
    benefits: [
      "Reach millions of targeted users",
      "Lower cost per lead than Google",
      "Powerful visual ad formats",
      "Retarget website visitors",
    ],
    faqs: [
      {
        q: "What ad budget do I need?",
        a: "We recommend a minimum ad spend of $150-300/month for Facebook and Instagram campaigns to gather enough data and see meaningful results.",
      },
      {
        q: "Do you design the ad creatives?",
        a: "Yes — our team handles ad creative design, copywriting, and all campaign setup as part of our management service.",
      },
      {
        q: "Can you run ads for my online store?",
        a: "Absolutely — we specialise in e-commerce Facebook ads including catalogue campaigns, dynamic ads, and retargeting sequences.",
      },
    ],
    relatedServices: ["google-ads", "social-media-management", "ecommerce-development"],
    metaTitle: "Facebook & Instagram Ads — PurpleSoftHub",
    metaDescription:
      "Professional Facebook and Instagram ad management. We create targeted campaigns that drive real results.",
    keywords: [
      "Facebook ads management",
      "Instagram ads agency",
      "Meta ads Nigeria",
      "social media advertising",
      "Facebook advertising agency Nigeria",
    ],
  },

  {
    slug: "google-ads",
    title: "Google Ads Management",
    shortTitle: "Google Ads",
    tagline: "Get in front of customers actively searching for you",
    category: "Marketing",
    icon: "🎯",
    color: "#dc2626",
    heroDescription:
      "We create and manage high-converting Google Ads campaigns that put your business in front of customers actively searching for your services.",
    overview:
      "Google Ads is the most powerful paid advertising platform for capturing intent-driven customers. We manage your campaigns to maximise ROI and minimise wasted ad spend.",
    features: [
      "Search Campaign Setup & Management",
      "Display & Banner Ads",
      "YouTube Advertising",
      "Shopping Ads (E-commerce)",
      "Remarketing Campaigns",
      "Keyword Research & Bidding",
      "Ad Copywriting & Testing",
      "Monthly Performance Reports",
    ],
    process: [
      { step: "01", title: "Research", desc: "Keyword research and competitor ad analysis." },
      { step: "02", title: "Setup", desc: "Campaign structure, targeting, and ad creation." },
      { step: "03", title: "Optimise", desc: "Ongoing bid management and A/B testing." },
      { step: "04", title: "Report", desc: "Weekly performance updates and monthly strategy reviews." },
    ],
    technologies: ["Google Ads", "Google Analytics", "Google Tag Manager", "Google Merchant Center", "Google Search Console"],
    benefits: [
      "Appear at top of Google instantly",
      "Only pay when someone clicks",
      "Target customers by location",
      "Measurable ROI on every campaign",
    ],
    faqs: [
      {
        q: "What budget do I need for Google Ads?",
        a: "We recommend a minimum ad spend of $200-500/month to see meaningful results. Our management fee is separate from your ad budget.",
      },
      {
        q: "How quickly will I see results?",
        a: "Google Ads can drive traffic immediately after launch. Most clients see significant results within the first 30 days.",
      },
      {
        q: "Do you manage the ad account?",
        a: "Yes — we handle everything from campaign setup to daily optimization and monthly reporting.",
      },
    ],
    relatedServices: ["facebook-ads", "seo", "social-media-management"],
    metaTitle: "Google Ads Management — PurpleSoftHub",
    metaDescription:
      "Professional Google Ads management. We create and optimise campaigns that drive traffic and maximise your ROI.",
    keywords: [
      "Google Ads management",
      "Google Ads agency Nigeria",
      "PPC management",
      "Google advertising services",
      "paid search advertising",
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
      { step: "01", title: "Strategy", desc: "Define your products, pricing, and customer journey." },
      { step: "02", title: "Design", desc: "Create a shopping experience that converts." },
      { step: "03", title: "Build", desc: "Develop with secure payment processing." },
      { step: "04", title: "Launch", desc: "Go live with full testing and support." },
    ],
    technologies: ["Shopify", "Next.js", "Stripe", "Paystack", "Flutterwave", "Tailwind CSS", "MongoDB"],
    benefits: [
      "Sell online 24/7 automatically",
      "Secure payment processing",
      "Easy product management",
      "Built for mobile shoppers",
    ],
    faqs: [
      {
        q: "Shopify or custom built?",
        a: "For most businesses we recommend Shopify — it's fast to launch and easy to manage. For unique requirements we build custom solutions.",
      },
      {
        q: "Which payment methods are supported?",
        a: "We integrate Paystack, Flutterwave, Stripe, and other major gateways depending on your target market.",
      },
      {
        q: "Can I manage products myself?",
        a: "Yes — we set up a simple dashboard so you can add, edit, and manage products without any technical knowledge.",
      },
    ],
    relatedServices: ["web-development", "digital-marketing", "seo"],
    metaTitle: "E-commerce Development — PurpleSoftHub",
    metaDescription:
      "Professional e-commerce development. Custom online stores, Shopify development, and payment gateway integration.",
    keywords: [
      "ecommerce development",
      "online store development",
      "Shopify development",
      "ecommerce website Nigeria",
      "online store Nigeria",
    ],
  },

  {
    slug: "account-recovery",
    title: "Social Media Account Recovery",
    shortTitle: "Account Recovery",
    tagline: "Recover hacked or disabled social media accounts fast",
    category: "Digital Marketing",
    icon: "🔐",
    color: "#7c3aed",
    heroDescription:
      "Professional account recovery service for hacked, disabled, or locked Facebook, Instagram, and TikTok accounts. Fast, secure, and reliable recovery.",
    overview:
      "Lost access to your social media account? Our expert team specialises in recovering hacked or disabled accounts across all major platforms. We work directly with platform support systems to restore your account access quickly and securely.",
    features: [
      "Facebook Account Recovery",
      "Instagram Account Recovery",
      "TikTok Account Recovery",
      "Hacked Account Recovery",
      "Disabled Account Appeals",
      "Identity Verification Support",
      "Two-Factor Auth Issues",
      "Account Security Audit",
    ],
    process: [
      { step: "01", title: "Assessment", desc: "Review your account situation and gather necessary information." },
      { step: "02", title: "Documentation", desc: "Prepare identity verification and account proof documents." },
      { step: "03", title: "Recovery", desc: "Submit recovery requests through official platform channels." },
      { step: "04", title: "Restoration", desc: "Restore account access and implement security measures." },
    ],
    technologies: ["Facebook API", "Instagram API", "TikTok API", "Identity Verification Systems"],
    benefits: [
      "Quick recovery process",
      "Expert team guidance",
      "Confidential handling",
      "Secure account restoration",
    ],
    faqs: [
      {
        q: "How long does account recovery take?",
        a: "Recovery takes 14–30 business days depending on the platform and account situation. We work with official support channels for the fastest recovery.",
      },
      {
        q: "What information do I need to provide?",
        a: "You'll need valid government ID (NIN, Passport, Driver's License), email address, phone number, and details about your account.",
      },
      {
        q: "What's the success rate?",
        a: "We have a high success rate for hacked accounts and disabled accounts. Final recovery depends on platform policies and account verification.",
      },
    ],
    relatedServices: ["social-media-management", "facebook-ads", "content-creation"],
    cta: "Start Account Recovery 🔐",
    ctaLink: "/services/social-media-management/account-recovery",
    metaTitle: "Social Media Account Recovery — PurpleSoftHub",
    metaDescription:
      "Professional social media account recovery for Facebook, Instagram, and TikTok. Recover hacked or disabled accounts securely.",
    keywords: [
      "account recovery",
      "hacked account recovery",
      "Facebook account recovery",
      "Instagram account recovery",
      "TikTok account recovery",
      "disabled account recovery",
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
