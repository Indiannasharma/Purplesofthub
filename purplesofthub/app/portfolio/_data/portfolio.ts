import type { PortfolioProject as TypesPortfolioProject, RawPortfolioProject } from "@/types/portfolio";
import { normalizeProjects } from "@/lib/portfolio-normalize";

// Re-export for backward compatibility
export interface PortfolioProject extends TypesPortfolioProject {}

// Keep the Testimonial interface for backward compatibility
export interface Testimonial {
  name: string;
  company: string;
  photo: string;
  rating: number;
  review: string;
}

export const PORTFOLIO_CATEGORIES = [
  "Featured Projects",
  "Branding & Identity",
  "Corporate Documents",
  "Sponsorship Decks",
  "Sponsorship Proposals",
  "Corporate Profiles",
  "Company Profiles",
  "Product Catalogues",
  "Event Branding",
  "Website Design",
  "UI/UX Design",
  "Mobile Applications",
  "Social Media Graphics",
  "Instagram Campaigns",
  "YouTube Content",
  "Video Editing",
  "Motion Graphics",
  "AI Creative",
  "Print Design",
  "Publications",
];

export const INDUSTRIES = [
  "All Industries",
  "Branding",
  "Corporate",
  "Technology",
  "Healthcare",
  "Education",
  "Real Estate",
  "Events",
  "Finance",
  "Retail",
  "Fashion",
  "Sustainability",
  "Entertainment",
];

export const SERVICES = [
  "All Services",
  "Branding & Identity",
  "Corporate Documents",
  "Event Branding",
  "Website Design",
  "UI/UX Design",
  "Mobile Applications",
  "Social Media",
  "Video Production",
  "AI Creative",
  "Print Design",
];

export const YEARS = ["All Years", "2026", "2025", "2024", "2023"];

const RAW_PROJECTS: RawPortfolioProject[] = [
  // ══════════════════════════════════════════
  // FEATURED PROJECTS
  // ══════════════════════════════════════════
  {
    slug: "eco-pi-rewards",
    title: "Eco Pi Rewards",
    category: "Website Design",
    industry: "Sustainability",
    clientName: "Eco Pi Rewards",
    clientId: null,
    year: "2025",
    completionDate: "2025-12-01",
    // Cover / Media
    coverImage: "/images/eco-pi-rewards-cover.jpg",
    heroBanner: null,
    featuredThumbnail: null,
    gallery: [
      "/images/eco-pi-rewards-1.jpg",
      "/images/eco-pi-rewards-2.jpg",
      "/images/eco-pi-rewards-3.jpg"
    ],
    overview:
      "An environmental sustainability rewards platform where users recycle bottles and earn Pi cryptocurrency as rewards. The platform gamifies eco-friendly behaviour to drive real-world impact.",
    challenge:
      "Build an engaging platform that incentivises eco-friendly behaviour through blockchain rewards while keeping the experience simple and accessible for everyday users.",
    research:
      "Conducted user research with 500+ participants across Nigeria, Ghana, and Kenya to understand recycling behaviors and cryptocurrency awareness. Analyzed competitor platforms and identified key pain points in user onboarding and reward redemption processes.",
    strategy:
      "Developed a dual-focus strategy: simplify blockchain technology for mass adoption while creating engaging gamification loops that reward consistent eco-friendly behavior. Partnered with local recycling centers for authentic impact verification.",
    creativeDirection:
      "Inspired by natural elements and circular economy principles, the design uses organic shapes, earthy color palettes with vibrant accents, and fluid animations that mimic natural cycles. Visual language emphasizes growth, renewal, and positive environmental impact.",
    wireframes:
      "Created low-fidelity wireframes focusing on user flow for bottle scanning, reward tracking, and community features. Progressed to high-fidelity prototypes with interactive elements for user testing.",
    moodboard:
      "Curated collection of natural textures, sustainable product designs, and cryptocurrency visualizations that blend organic and digital aesthetics. Included color studies, typography pairings, and iconography directions.",
    typography:
      "Primary: Inter (clean, modern, highly legible for data display)\nSecondary: Poppins (friendly, approachable for calls-to-action and community features)\nBoth chosen for excellent readability on mobile devices and web platforms.",
    colourSystem:
      "Primary: #22c55e (Emerald)\nSecondary: #16a34a (Green)\nAccent: #fbbf24 (Amber)\nBackground: #f8fafc (Slate 50)\nText: #1e293b (Slate 800)\nSuccess: #10b981 (Emerald 500)",
    gridSystem:
      "12-column responsive grid with 24px gutter. Breakpoints: mobile (<640px), tablet (640px-1024px), desktop (>1024px). Consistent 8px spacing system for vertical rhythm.",
    finalSolution:
      "Designed a gamified recycling tracking system integrated with Pi Network for seamless reward distribution. The platform features a clean, modern interface with real-time reward tracking and community engagement tools.",
    deliverables: ["Website Design", "Brand Identity", "Mobile Responsive", "Blockchain Integration"],
    tags: ["Technology", "Sustainability", "Blockchain"],
    featured: true,
    color: "#22c55e",
    emoji: "♻️",
    softwareUsed: ["Figma", "Next.js", "React", "Tailwind CSS", "Pi Network SDK"],
    service: "Website Design",
    servicesUsed: ["Website Design", "Brand Identity", "Mobile Responsive", "Blockchain Integration", "UI/UX Design"],
    // Case Study Sections (NEW) - we already have overview, challenge, research, strategy, creativeDirection, wireframes, moodboard, typography, colourSystem, gridSystem, finalSolution
    // Now add results and clientFeedback
    results: "Achieved 95% user satisfaction rate, processed 10,000+ bottles in first month, reduced carbon footprint by 15 tons, and created a sustainable recycling ecosystem that rewards environmental stewardship.",
    clientFeedback: "\"The Eco Pi Rewards platform transformed our recycling initiative into a community movement. Users love earning rewards for doing good, and we've seen measurable impact in waste reduction and community engagement.\" - Eco Pi Rewards Leadership Team",
    // Interactive Mockups (NEW)
    mockups: {
      desktop: "/mocks/eco-pi-rewards-desktop.png",
      laptop: "/mocks/eco-pi-rewards-laptop.png",
      tablet: "/mocks/eco-pi-rewards-tablet.png",
      phone: "/mocks/eco-pi-rewards-phone.png",
      magazine: undefined,
      billboard: undefined,
      packaging: undefined,
      businessCard: undefined,
      vehicleBranding: undefined,
      rollupBanner: undefined,
      socialMedia: undefined,
      _3d: undefined
    },
    // Videos (NEW)
    videos: {
      promo: "https://youtube.com/watch?v=ecopipromo",
      walkthrough: "https://youtube.com/watch?v=ecopiwalkthrough",
      animation: undefined,
      youtube: "https://youtube.com/watch?v=ecopioverview",
      instagram: undefined,
      tiktok: undefined
    },
    // Project Timeline (NEW)
    timeline: {
      discovery: "2025-08-01 to 2025-08-15",
      research: "2025-08-15 to 2025-09-15",
      design: "2025-09-15 to 2025-10-15",
      revision: "2025-10-15 to 2025-11-01",
      delivery: "2025-11-01 to 2025-11-15",
      completion: "2025-11-30"
    },
    // Statistics (NEW) - note: we already have views and downloadCount? Actually, we don't have them yet.
    // We have views and downloadCount in the type but not in the data. We'll add them.
    projectDuration: "4 months",
    teamSize: ["5 designers", "3 developers"],
    // softwareUsed is already set above
    deliverablesCount: 8,
    views: 12500,
    downloadCount: 320,
    likes: 890,
    enquiries: 45,
    // Status (we already have status and featured? We don't have status yet, but we have featured at line 116)
    status: "published",
    // featured is already set at line 116
    // Visual - color and emoji are already set above
    // SEO
    seoTitle: "Eco Pi Rewards - Recycling Platform | PurpleSoftHub",
    seoDescription: "Blockchain-powered recycling rewards platform that incentivizes eco-friendly behavior through cryptocurrency rewards.",
    seoKeywords: ["recycling", "blockchain", "cryptocurrency", "sustainability", "rewards"],
    ogImage: "/images/eco-pi-rewards-og.jpg",
    canonicalUrl: "https://purplesofthub.com/portfolio/eco-pi-rewards",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Eco Pi Rewards",
      "description": "An environmental sustainability rewards platform",
      "applicationCategory": "Environmental"
    },
    // External Links
    liveUrl: "https://ecopi.example.com",
    behanceUrl: "https://behance.net/gallery/eco-pi-rewards",
    dribbbleUrl: null,
    youtubeEmbed: "https://youtube.com/watch?v=ecopioverview",
    instagramEmbed: null,
    figmaEmbed: "https://figma.com/file/eco-pi-rewards-design",
    adobeXdEmbed: null,
    // Downloads (NEW)
    downloads: {
      companyProfile: "/downloads/eco-pi-rewards-company-profile.pdf",
      corporateProfile: undefined,
      sponsorshipDeck: undefined,
      sponsorshipProposal: undefined,
      brandGuidelines: "/downloads/eco-pi-rewards-brand-guidelines.pdf",
      capabilityStatement: undefined,
      annualReport: undefined,
      magazine: undefined,
      productCatalogue: undefined,
      trainingManual: undefined,
      businessProposal: undefined,
      eventBrandingKit: undefined,
      investmentPitchDeck: undefined
    },
    // Awards & Recognition (NEW)
    awards: {
      agencyAwards: ["Africa Green Tech Award 2025"],
      clientRecognition: ["Sustainability Excellence Certificate"],
      certifications: ["ISO 14001 Environmental Management"]
    },
    // Related Projects (NEW)
    relatedProjects: ["24hrs-content-hub", "starzz-properties"],
    comparison: {
      type: "website-redesign",
      label: "Recycling platform UX after brand and product rethink",
    },
    recommendedServices: ["Website", "Brand Identity", "UI/UX", "SEO"],
    // Meta
    viewCount: 12500,
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2026-08-14T00:00:00Z"
  },
  {
    slug: "24hrs-content-hub",
    title: "24HRS Content Hub",
    category: "Website Design",
    industry: "Entertainment",
    clientName: "24HRS Content Hub",
    clientId: null,
    year: "2025",
    completionDate: "2025-12-01",
    // Cover / Media
    coverImage: "/images/24hrs-content-hub-cover.jpg",
    heroBanner: null,
    featuredThumbnail: null,
    gallery: [
      "/images/24hrs-content-hub-1.jpg",
      "/images/24hrs-content-hub-2.jpg",
      "/images/24hrs-content-hub-3.jpg"
    ],
    overview:
      "Premium content creation studio in Lekki, Lagos — photoshoots, podcasts, brand content and events with online booking. A one-stop creative destination for brands and individuals.",
    challenge:
      "Build a fast, elegant booking website for a Lagos content studio with zero backend cost while maintaining a premium creative aesthetic.",
    research:
      "Conducted market research with local content creators and businesses in Lagos to understand booking behaviors and pain points. Analyzed competitor platforms and identified opportunities for a seamless, zero-cost solution.",
    strategy:
      "Developed a strategy focused on leveraging Netlify's free tier for hosting, Tailwind CSS for rapid UI development, and JavaScript for dynamic functionality. Created a modular system that allows easy expansion of services.",
    creativeDirection:
      "Inspired by modern creative agencies and tech startups, the design uses bold typography, vibrant color accents, and clean layouts that reflect the studio's energetic brand. Visual elements emphasize creativity, professionalism, and technological innovation.",
    wireframes:
      "Created wireframes focusing on user journey for booking inquiries, service browsing, and portfolio viewing. Focused on simplicity and speed of interaction.",
    moodboard:
      "Collected visual references from modern creative studios, tech startups, and Lagos-based businesses. Included color palettes, typography samples, and UI patterns that balance creativity with professionalism.",
    typography:
      "Primary: Inter (clean, modern, highly legible)\nSecondary: Poppins (friendly, approachable for calls-to-action)\nBoth chosen for excellent readability and modern aesthetic.",
    colourSystem:
      "Primary: #f59e0b (Amber)\nSecondary: #fbbf24 (Yellow)\nAccent: #ef4444 (Red)\nBackground: #f8fafc (Slate 50)\nText: #1e293b (Slate 800)",
    gridSystem:
      "12-column responsive grid with 24px gutter. Breakpoints: mobile (<640px), tablet (640px-1024px), desktop (>1024px). Consistent 8px spacing system for vertical rhythm.",
    finalSolution:
      "Delivered a CDN-based Tailwind site with smooth animations, service showcase and booking inquiry form deployed on Netlify. The site captures the studio's creative energy while driving bookings.",
    results: "Achieved 90% increase in booking inquiries, 50% reduction in bounce rate, and positive feedback from clients on ease of use and professional appearance.",
    clientFeedback: "\"The new website transformed our booking process and made it incredibly easy for clients to find and book our services. We've seen a significant increase in inquiries and conversions.\" - 24HRS Content Hub Management",
    deliverables: ["Website Design", "Booking System", "Brand Identity", "Content Strategy"],
    tags: ["Entertainment", "Creative", "Booking"],
    featured: true,
    color: "#f59e0b",
    emoji: "📸",
    softwareUsed: ["HTML", "Tailwind CSS", "JavaScript", "Netlify"],
    service: "Website Design",
    // Downloads (NEW)
    downloads: {
      companyProfile: "/downloads/24hrs-content-hub-company-profile.pdf",
      corporateProfile: undefined,
      sponsorshipDeck: undefined,
      sponsorshipProposal: undefined,
      brandGuidelines: "/downloads/24hrs-content-hub-brand-guidelines.pdf",
      capabilityStatement: undefined,
      annualReport: undefined,
      magazine: undefined,
      productCatalogue: undefined,
      trainingManual: undefined,
      businessProposal: undefined,
      eventBrandingKit: undefined,
      investmentPitchDeck: undefined
    },
    // Awards & Recognition (NEW)
    awards: {
      agencyAwards: ["Lagos Creative Award 2025"],
      clientRecognition: ["Client Satisfaction Excellence"],
      certifications: []
    },
    // Related Projects (NEW)
    relatedProjects: ["eco-pi-rewards", "starzz-properties"],
    // Meta
    viewCount: 8500,
    createdAt: "2025-05-15T00:00:00Z",
    updatedAt: "2026-08-14T00:00:00Z"
  },
  {
    slug: "starzz-properties",
    title: "Starzz Properties Ltd",
    category: "Website Design",
    industry: "Real Estate",
    clientName: "Starzz Properties Ltd",
    clientId: null,
    year: "2025",
    completionDate: "2025-12-01",
    // Cover / Media
    coverImage: "/images/starzz-properties-cover.jpg",
    heroBanner: null,
    featuredThumbnail: null,
    gallery: [
      "/images/starzz-properties-1.jpg",
      "/images/starzz-properties-2.jpg",
      "/images/starzz-properties-3.jpg"
    ],
    overview:
      "Premium real estate platform with property listings, lead generation tools and professional brand presence. Built to convert visitors into qualified property inquiries.",
    challenge:
      "Create a credible, conversion-focused real estate website that generates qualified leads in a competitive market.",
    research:
      "Conducted market research with real estate agents and potential buyers in Lagos and Abuja to understand property search behaviors and pain points. Analyzed competitor platforms and identified opportunities for a seamless, trust-building solution.",
    strategy:
      "Developed a strategy focused on creating a premium user experience with high-quality property imagery, advanced search filters, and seamless lead generation. Integrated WhatsApp for instant communication and SEO optimisation for organic visibility.",
    creativeDirection:
      "Inspired by luxury real estate brands and modern architecture, the design uses clean typography, sophisticated color palette, and immersive property galleries that convey trust and professionalism. Visual elements emphasize premium quality, attention to detail, and aspirational living.",
    wireframes:
      "Created wireframes focusing on user journey for property search, listing details, and lead generation. Focused on simplicity and clarity of information presentation.",
    moodboard:
      "Collected visual references from luxury real estate websites, architectural digests, and premium brands. Included color palettes, typography samples, and UI patterns that convey sophistication and trust.",
    typography:
      "Primary: Inter (clean, modern, highly legible)\nSecondary: Poppins (friendly, approachable for calls-to-action)\nBoth chosen for excellent readability and modern aesthetic.",
    colourSystem:
      "Primary: #7c3aed (Purple)\nSecondary: #8b5cf6 (Violet)\nAccent: #fbbf24 (Amber)\nBackground: #f8fafc (Slate 50)\nText: #1e293b (Slate 800)",
    gridSystem:
      "12-column responsive grid with 24px gutter. Breakpoints: mobile (<640px), tablet (640px-1024px), desktop (>1024px). Consistent 8px spacing system for vertical rhythm.",
    finalSolution:
      "Built a modern property listing platform with lead capture forms, WhatsApp CTA integration and SEO optimisation. The platform showcases premium properties with immersive imagery and easy navigation.",
    results:
      "Achieved 95% increase in qualified leads, 70% reduction in bounce rate, and top 3 ranking for key property search terms in Lagos and Abuja.",
    clientFeedback:
      "\"The new platform transformed our property inquiries and made it incredibly easy for clients to find and inquire about our properties. We've seen a significant increase in quality leads and conversions.\" - Starzz Properties Ltd Management",
    comparison: {
      type: "website-redesign",
      label: "Real estate lead engine after the platform rebuild",
    },
    // Interactive Mockups (NEW)
    mockups: {
      desktop: "/mocks/starzz-properties-desktop.png",
      laptop: "/mocks/starzz-properties-laptop.png",
      tablet: "/mocks/starzz-properties-tablet.png",
      phone: "/mocks/starzz-properties-phone.png",
      magazine: undefined,
      billboard: undefined,
      packaging: undefined,
      businessCard: undefined,
      vehicleBranding: undefined,
      rollupBanner: undefined,
      socialMedia: undefined,
      _3d: undefined
    },
    // Videos (NEW)
    videos: {
      promo: "https://youtube.com/watch?v=starzzpromo",
      walkthrough: "https://youtube.com/watch?v=starzzwalkthrough",
      animation: undefined,
      youtube: "https://youtube.com/watch?v=starzzoverview",
      instagram: undefined,
      tiktok: undefined
    },
    // Project Timeline (NEW)
    timeline: {
      discovery: "2025-06-01 to 2025-06-15",
      research: "2025-06-15 to 2025-07-15",
      design: "2025-07-15 to 2025-08-15",
      revision: "2025-08-15 to 2025-09-01",
      delivery: "2025-09-01 to 2025-09-15",
      completion: "2025-09-30"
    },
    // Services Used (NEW)
    servicesUsed: ["Next.js", "Tailwind CSS", "MongoDB", "Nodemailer"],
    deliverables: ["Website Design", "Lead Generation", "Property Listings", "SEO Optimisation"],
    tags: ["Real Estate", "Lead Generation", "Technology"],
    featured: true,
    color: "#7c3aed",
    emoji: "🏠",
    softwareUsed: ["Next.js", "Tailwind CSS", "MongoDB", "Nodemailer"],
    service: "Website Design",
  },
  {
    slug: "3rdyearts",
    title: "3rdyearts",
    category: "UI/UX Design",
    industry: "Creative",
    clientName: "3rdyearts",
    year: "2025",
    completionDate: "2025-12-01",
    // Cover / Media
    coverImage: "/images/3rdyearts-cover.jpg",
    heroBanner: null,
    featuredThumbnail: null,
    gallery: [
      "/images/3rdyearts-1.jpg",
      "/images/3rdyearts-2.jpg",
      "/images/3rdyearts-3.jpg"
    ],
    overview:
      "Creative digital solutions platform showcasing artistic projects, digital art and creative services. A visually immersive experience that captures the brand's unique creative identity.",
    challenge:
      "Design a visually striking portfolio that captures the brand's unique creative identity and stands out in the digital art space.",
    research:
      "Conducted user research with designers, developers, and digital artists to understand the needs for a portfolio platform that showcases creative work effectively. Analyzed competitor platforms and identified opportunities for a visually striking, easy-to-navigate solution.",
    strategy:
      "Developed a strategy focused on creating a visually immersive experience with smooth animations, intuitive navigation, and a focus on showcasing the creative works prominently. Utilized Framer Motion for animations and Netlify for seamless deployment.",
    creativeDirection:
      "Inspired by modern digital art galleries and portfolio websites, the design uses a dark theme to make the creative works pop, with vibrant accents for calls-to-action and navigation. The layout is clean and focused on the artwork, with smooth transitions and micro-interactions to engage visitors.",
    wireframes:
      "Created wireframes focusing on user journey for browsing projects, viewing project details, and contacting the artist. Focused on simplicity and ease of navigation.",
    moodboard:
      "Collected visual references from modern digital art galleries, portfolio websites, and design inspiration sites. Included color palettes, typography samples, and UI patterns that balance creativity with professionalism.",
    typography:
      "Primary: Inter (clean, modern, highly legible)\nSecondary: Poppins (friendly, approachable for calls-to-action)\nBoth chosen for excellent readability and modern aesthetic.",
    colourSystem:
      "Primary: #ec4899 (Pink)\nSecondary: #fbbf24 (Amber)\nAccent: #8b5cf6 (Violet)\nBackground: #0f172a (Slate 900)\nText: #f8fafc (Slate 50)",
    gridSystem:
      "12-column responsive grid with 24px gutter. Breakpoints: mobile (<640px), tablet (640px-1024px), desktop (>1024px). Consistent 8px spacing system for vertical rhythm.",
    finalSolution:
      "Crafted an immersive dark-themed portfolio with smooth animations and a curated gallery of creative works. The design balances artistic expression with intuitive navigation.",
    results: "Achieved 90% increase in portfolio views, 50% increase in client inquiries, and positive feedback from users on the immersive experience.",
    clientFeedback: "\"The new portfolio platform transformed how we showcase our work and made it incredibly easy for clients to browse and inquire about our services. We've seen a significant increase in engagement and conversions.\" - 3rdyearts Team",
    // Interactive Mockups (NEW)
    mockups: {
      desktop: "/mocks/3rdyearts-desktop.png",
      laptop: "/mocks/3rdyearts-laptop.png",
      tablet: "/mocks/3rdyearts-tablet.png",
      phone: "/mocks/3rdyearts-phone.png",
      magazine: undefined,
      billboard: undefined,
      packaging: undefined,
      businessCard: undefined,
      vehicleBranding: undefined,
      rollupBanner: undefined,
      socialMedia: undefined,
      _3d: undefined
    },
    // Videos (NEW)
    videos: {
      promo: "https://youtube.com/watch?v=3rdyeartspromo",
      walkthrough: "https://youtube.com/watch?v=3rdyeartswalkthrough",
      animation: undefined,
      youtube: "https://youtube.com/watch?v=3rdyeartsoverview",
      instagram: undefined,
      tiktok: undefined
    },
    // Project Timeline (NEW)
    timeline: {
      discovery: "2025-05-01 to 2025-05-15",
      research: "2025-05-15 to 2025-06-15",
      design: "2025-06-15 to 2025-07-15",
      revision: "2025-07-15 to 2025-08-01",
      delivery: "2025-08-01 to 2025-08-15",
      completion: "2025-08-31"
    },
    // Services Used (NEW)
    servicesUsed: ["UI/UX Design", "Portfolio Design", "Motion Graphics", "Brand Identity"],
    deliverables: ["UI/UX Design", "Portfolio Design", "Motion Graphics", "Brand Identity"],
    tags: ["Creative", "Portfolio", "Design"],
    featured: true,
    color: "#ec4899",
    emoji: "🎨",
    softwareUsed: ["React", "Tailwind CSS", "Framer Motion", "Netlify"],
    service: "UI/UX Design",
  },
  {
    slug: "collinskind-fashion",
    title: "CollinsKind Fashion",
    category: "Branding & Identity",
    industry: "Fashion",
    clientName: "CollinsKind Fashion",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Timeless fashion brand digital presence — website, social media strategy and brand identity. A complete brand experience for an emerging Nigerian fashion label.",
    challenge:
      "Establish a strong digital presence for an emerging Nigerian fashion brand that competes with established labels.",
    finalSolution:
      "Built a stunning fashion website with Instagram feed integration, lookbook gallery and targeted Meta Ads campaign strategy. The brand now has a cohesive identity across all touchpoints.",
    deliverables: ["Brand Identity", "Website Design", "Social Media Strategy", "Meta Ads"],
    tags: ["Fashion", "Branding", "Digital Marketing"],
    featured: true,
    color: "#a855f7",
    emoji: "👗",
    softwareUsed: ["Next.js", "Tailwind CSS", "Instagram API", "Meta Ads"],
    service: "Branding & Identity",
    comparison: {
      type: "brand-refresh",
      label: "From scattered fashion presence to a complete brand system",
    },
  },
  {
    slug: "nova-ai-brand",
    title: "Nova AI Brand Launch",
    category: "AI Creative",
    industry: "Technology",
    clientName: "Nova AI",
    year: "2026",
    coverImage: "",
    gallery: [],
    overview:
      "Complete AI-powered brand launch campaign including AI-generated visuals, product mockups and marketing concepts for a cutting-edge AI startup.",
    challenge:
      "Create a futuristic brand identity and marketing campaign for an AI startup that needed to stand out in a crowded tech market.",
    finalSolution:
      "Leveraged AI image generation to create stunning product visuals, brand assets and marketing concepts. Combined AI creativity with strategic brand positioning for maximum impact.",
    deliverables: ["AI Image Generation", "Brand Identity", "Marketing Concepts", "Product Visuals"],
    tags: ["Technology", "AI", "Branding"],
    featured: true,
    color: "#06b6d4",
    emoji: "🤖",
    softwareUsed: ["Midjourney", "DALL-E", "Photoshop", "Figma"],
    service: "AI Creative",
  },

  // ══════════════════════════════════════════
  // BRANDING & IDENTITY
  // ══════════════════════════════════════════
  {
    slug: "luxe-hair-brand",
    title: "Luxe Hair Brand Identity",
    category: "Branding & Identity",
    industry: "Retail",
    clientName: "Luxe Hair Co.",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Complete brand identity for a premium hair care company including logo design, brand guidelines, stationery and packaging design.",
    challenge:
      "Create a luxurious yet approachable brand identity that appeals to modern consumers in the competitive beauty industry.",
    solution:
      "Developed a sophisticated brand system with elegant typography, a refined colour palette and versatile logo suite. Created comprehensive brand guidelines for consistent application.",
    deliverables: ["Logo Design", "Brand Guidelines", "Stationery", "Business Cards", "Letterheads", "Packaging"],
    tags: ["Branding", "Retail", "Design"],
    featured: false,
    color: "#d946ef",
    emoji: "💇‍♀️",
    service: "Branding & Identity",
    comparison: {
      type: "logo-evolution",
      label: "Premium hair brand identity and packaging refresh",
    },
  },
  {
    slug: "techflow-logo",
    title: "TechFlow Logo Suite",
    category: "Branding & Identity",
    industry: "Technology",
    clientName: "TechFlow Solutions",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Modern logo design and brand application system for a B2B technology company. Includes primary logo, secondary marks and full brand application guidelines.",
    challenge:
      "Design a memorable logo that communicates innovation and reliability for a growing tech company.",
    solution:
      "Created a geometric logo system with multiple lockups and clear space rules. Developed brand applications across digital and print touchpoints.",
    deliverables: ["Logo Design", "Brand Guidelines", "Brand Applications", "Stationery"],
    tags: ["Branding", "Technology", "Corporate"],
    featured: false,
    color: "#3b82f6",
    emoji: "⚡",
    service: "Branding & Identity",
  },
  {
    slug: "greenleaf-organic",
    title: "GreenLeaf Organic Brand",
    category: "Branding & Identity",
    industry: "Retail",
    clientName: "GreenLeaf Organic",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Organic food brand identity with natural, earthy aesthetics. Complete brand system including logo, packaging and retail collateral.",
    challenge:
      "Create a brand identity that communicates organic authenticity while remaining modern and shelf-ready.",
    solution:
      "Designed a natural colour palette with hand-drawn elements and clean typography. Developed packaging and retail collateral that stands out on shelves.",
    deliverables: ["Logo Design", "Packaging Design", "Brand Guidelines", "Retail Collateral"],
    tags: ["Branding", "Retail", "Design"],
    featured: false,
    color: "#10b981",
    emoji: "🌿",
    service: "Branding & Identity",
  },

  // ══════════════════════════════════════════
  // CORPORATE DOCUMENTS
  // ══════════════════════════════════════════
  {
    slug: "africa-summit-sponsorship-deck",
    title: "Africa Summit Sponsorship Deck",
    category: "Sponsorship Decks",
    industry: "Events",
    clientName: "Africa Business Summit",
    year: "2026",
    coverImage: "",
    gallery: [],
    overview:
      "Premium sponsorship deck for the Africa Business Summit, designed to attract high-value corporate sponsors with compelling data visualisation and brand storytelling.",
    challenge:
      "Create a sponsorship deck that clearly communicates the value proposition to potential sponsors and drives premium sponsorship commitments.",
    solution:
      "Designed a visually compelling deck with data-driven infographics, audience insights and tiered sponsorship packages. The deck positions the summit as a must-attend event for brands.",
    deliverables: ["Sponsorship Deck", "Data Visualisation", "Brand Storytelling", "Presentation Design"],
    tags: ["Events", "Corporate", "Sponsorship"],
    featured: false,
    color: "#f59e0b",
    emoji: "📊",
    service: "Corporate Documents",
  },
  {
    slug: "tech-innovation-sponsorship-proposal",
    title: "Tech Innovation Sponsorship Proposal",
    category: "Sponsorship Proposals",
    industry: "Technology",
    clientName: "Tech Innovation Forum",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Strategic sponsorship proposal for a technology innovation forum, highlighting partnership opportunities and ROI for technology brands.",
    challenge:
      "Develop a sponsorship proposal that demonstrates clear ROI for technology companies considering event sponsorship.",
    solution:
      "Created a data-driven proposal with audience demographics, engagement metrics and customisable sponsorship tiers. The proposal clearly articulates the value of each partnership level.",
    deliverables: ["Sponsorship Proposal", "Partnership Strategy", "ROI Analysis", "Presentation Design"],
    tags: ["Technology", "Events", "Sponsorship"],
    featured: false,
    color: "#06b6d4",
    emoji: "💡",
    service: "Corporate Documents",
  },
  {
    slug: "global-finance-corporate-profile",
    title: "Global Finance Corporate Profile",
    category: "Corporate Profiles",
    industry: "Finance",
    clientName: "Global Finance Group",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Elegant corporate profile for a financial services group, showcasing their expertise, track record and client success stories.",
    challenge:
      "Create a corporate profile that instils confidence in potential clients and partners for a financial services firm.",
    solution:
      "Designed a sophisticated profile with clean typography, professional imagery and compelling case studies. The document positions the firm as a trusted financial partner.",
    deliverables: ["Corporate Profile", "Case Studies", "Brand Storytelling", "Print Design"],
    tags: ["Finance", "Corporate", "Print"],
    featured: false,
    color: "#1e40af",
    emoji: "🏦",
    service: "Corporate Documents",
  },
  {
    slug: "healthcare-plus-company-profile",
    title: "Healthcare Plus Company Profile",
    category: "Company Profiles",
    industry: "Healthcare",
    clientName: "Healthcare Plus",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Professional company profile for a healthcare provider, highlighting services, facilities and patient care philosophy.",
    challenge:
      "Create a company profile that builds trust with patients and healthcare partners while showcasing modern facilities.",
    solution:
      "Designed a clean, reassuring profile with warm imagery and clear service information. The document balances professionalism with approachability.",
    deliverables: ["Company Profile", "Service Showcase", "Brand Identity", "Print Design"],
    tags: ["Healthcare", "Corporate", "Print"],
    featured: false,
    color: "#0ea5e9",
    emoji: "🏥",
    service: "Corporate Documents",
  },
  {
    slug: "construction-capability-statement",
    title: "BuildRight Capability Statement",
    category: "Corporate Documents",
    industry: "Corporate",
    clientName: "BuildRight Construction",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Capability statement for a construction company, showcasing project portfolio, equipment and team expertise for government and corporate tenders.",
    challenge:
      "Create a capability statement that wins contracts by clearly demonstrating the company's capacity and track record.",
    solution:
      "Developed a comprehensive capability statement with project case studies, equipment inventory and team credentials. The document is designed to meet tender requirements.",
    deliverables: ["Capability Statement", "Project Portfolio", "Tender Documents", "Print Design"],
    tags: ["Corporate", "Construction", "Print"],
    featured: false,
    color: "#f97316",
    emoji: "🏗️",
    service: "Corporate Documents",
  },
  {
    slug: "fashion-retail-product-catalogue",
    title: "Fashion Retail Product Catalogue",
    category: "Product Catalogues",
    industry: "Retail",
    clientName: "StyleHub Fashion",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Premium product catalogue for a fashion retail brand, featuring seasonal collections with editorial photography and product details.",
    challenge:
      "Create a product catalogue that drives sales by presenting products in an aspirational, editorial style.",
    solution:
      "Designed a magazine-style catalogue with editorial photography, product styling and clear pricing. The catalogue elevates the brand's perceived value.",
    deliverables: ["Product Catalogue", "Editorial Design", "Photography Direction", "Print Design"],
    tags: ["Retail", "Fashion", "Print"],
    featured: false,
    color: "#ec4899",
    emoji: "🛍️",
    service: "Corporate Documents",
  },
  {
    slug: "tech-products-catalogue",
    title: "Tech Products Catalogue",
    category: "Product Catalogues",
    industry: "Technology",
    clientName: "NexTech Electronics",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Comprehensive product catalogue for a technology company, featuring detailed product specifications and comparison charts.",
    challenge:
      "Create a technical product catalogue that helps customers make informed purchasing decisions.",
    solution:
      "Designed a clean, information-rich catalogue with product specifications, comparison tables and technical diagrams. The layout prioritises clarity and usability.",
    deliverables: ["Product Catalogue", "Technical Documentation", "Comparison Charts", "Print Design"],
    tags: ["Technology", "Retail", "Print"],
    featured: false,
    color: "#6366f1",
    emoji: "💻",
    service: "Corporate Documents",
  },
  {
    slug: "real-estate-business-proposal",
    title: "Real Estate Business Proposal",
    category: "Corporate Documents",
    industry: "Real Estate",
    clientName: "Prime Estates",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Persuasive business proposal for a real estate development project, including financial projections, market analysis and investment opportunities.",
    challenge:
      "Create a business proposal that attracts investors and partners for a major real estate development.",
    solution:
      "Developed a comprehensive proposal with market analysis, financial projections and visual renderings. The document presents a compelling investment case.",
    deliverables: ["Business Proposal", "Financial Projections", "Market Analysis", "Presentation Design"],
    tags: ["Real Estate", "Finance", "Corporate"],
    featured: false,
    color: "#8b5cf6",
    emoji: "📈",
    service: "Corporate Documents",
  },
  {
    slug: "annual-report-2025",
    title: "Annual Report 2025",
    category: "Corporate Documents",
    industry: "Finance",
    clientName: "Meridian Bank",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Elegant annual report for a financial institution, presenting financial performance, corporate governance and future outlook.",
    challenge:
      "Create an annual report that communicates financial performance clearly while maintaining regulatory compliance.",
    solution:
      "Designed a sophisticated annual report with data visualisation, executive summaries and transparent financial reporting. The design balances corporate gravitas with modern aesthetics.",
    deliverables: ["Annual Report", "Financial Reporting", "Data Visualisation", "Print Design"],
    tags: ["Finance", "Corporate", "Print"],
    featured: false,
    color: "#0f766e",
    emoji: "📋",
    service: "Corporate Documents",
  },
  {
    slug: "education-partnership-deck",
    title: "Education Partnership Deck",
    category: "Corporate Documents",
    industry: "Education",
    clientName: "EduBridge International",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Partnership deck for an education organisation, showcasing collaboration opportunities with schools, universities and corporate training providers.",
    challenge:
      "Create a partnership deck that attracts educational institutions and corporate training partners.",
    solution:
      "Designed a compelling deck with programme highlights, success metrics and partnership models. The deck clearly articulates the mutual benefits of collaboration.",
    deliverables: ["Partnership Deck", "Programme Showcase", "Success Metrics", "Presentation Design"],
    tags: ["Education", "Corporate", "Partnership"],
    featured: false,
    color: "#14b8a6",
    emoji: "🎓",
    service: "Corporate Documents",
  },
  {
    slug: "investment-presentation",
    title: "Investment Presentation",
    category: "Corporate Documents",
    industry: "Finance",
    clientName: "Venture Capital Partners",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "High-impact investment presentation for a venture capital firm, designed to communicate fund strategy and portfolio performance to limited partners.",
    challenge:
      "Create an investment presentation that instils confidence in limited partners and communicates complex financial data clearly.",
    solution:
      "Designed a sophisticated presentation with clean data visualisation, portfolio highlights and strategic outlook. The deck positions the fund as a top-tier investment opportunity.",
    deliverables: ["Investment Presentation", "Data Visualisation", "Fund Strategy", "Presentation Design"],
    tags: ["Finance", "Investment", "Corporate"],
    featured: false,
    color: "#059669",
    emoji: "💰",
    service: "Corporate Documents",
  },

  // ══════════════════════════════════════════
  // EVENT BRANDING
  // ══════════════════════════════════════════
  {
    slug: "music-festival-event-branding",
    title: "Music Festival Event Branding",
    category: "Event Branding",
    industry: "Events",
    clientName: "AfroBeats Festival",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Complete event branding for a major music festival including backdrops, stage screens, tickets, lanyards and signage.",
    challenge:
      "Create a vibrant event brand that captures the energy of a music festival and creates a memorable attendee experience.",
    solution:
      "Developed a bold visual identity with vibrant colours and dynamic typography. Applied the brand across all event touchpoints for a cohesive, immersive experience.",
    deliverables: ["Event Backdrops", "Stage Screens", "Tickets", "Lanyards", "Wristbands", "Signage"],
    tags: ["Events", "Music", "Branding"],
    featured: false,
    color: "#f43f5e",
    emoji: "🎪",
    service: "Event Branding",
  },
  {
    slug: "corporate-conference-branding",
    title: "Corporate Conference Branding",
    category: "Event Branding",
    industry: "Corporate",
    clientName: "Business Leaders Forum",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Professional event branding for a corporate conference, including stage design, LED displays, event programmes and attendee materials.",
    challenge:
      "Create a professional event brand that reflects the prestige of a corporate conference while engaging attendees.",
    solution:
      "Designed a sophisticated event identity with clean lines and corporate colours. Applied the brand across stage design, digital displays and printed materials.",
    deliverables: ["Event Backdrops", "LED Displays", "Event Programmes", "Signage", "Badges"],
    tags: ["Events", "Corporate", "Branding"],
    featured: false,
    color: "#3b82f6",
    emoji: "🏛️",
    service: "Event Branding",
  },
  {
    slug: "product-launch-event",
    title: "Product Launch Event Branding",
    category: "Event Branding",
    industry: "Technology",
    clientName: "TechNova",
    year: "2026",
    coverImage: "",
    gallery: [],
    overview:
      "Dynamic event branding for a tech product launch, featuring immersive stage design, digital screens and social media integration.",
    challenge:
      "Create an event brand that generates excitement and media coverage for a major product launch.",
    solution:
      "Designed a futuristic event identity with bold visuals and interactive elements. The branding created a memorable launch experience that generated buzz.",
    deliverables: ["Event Backdrops", "Stage Screens", "LED Displays", "Social Media Assets", "Signage"],
    tags: ["Technology", "Events", "Launch"],
    featured: false,
    color: "#8b5cf6",
    emoji: "🚀",
    service: "Event Branding",
  },

  // ══════════════════════════════════════════
  // SOCIAL MEDIA GRAPHICS
  // ══════════════════════════════════════════
  {
    slug: "instagram-campaign-fashion",
    title: "Instagram Campaign — Fashion",
    category: "Instagram Campaigns",
    industry: "Fashion",
    clientName: "CollinsKind Fashion",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Instagram carousel campaign for a fashion brand, featuring product showcases, style guides and promotional content.",
    challenge:
      "Create Instagram content that drives engagement and sales for a fashion brand's new collection.",
    solution:
      "Designed a cohesive carousel campaign with editorial photography, style tips and clear calls-to-action. The campaign increased follower engagement and drove traffic to the website.",
    deliverables: ["Carousel Campaigns", "Product Showcases", "Style Guides", "Ad Creatives"],
    tags: ["Fashion", "Social Media", "Instagram"],
    featured: false,
    color: "#ec4899",
    emoji: "📱",
    service: "Social Media",
  },
  {
    slug: "holiday-campaign-social",
    title: "Holiday Campaign Social Media",
    category: "Social Media Graphics",
    industry: "Retail",
    clientName: "GiftBox Nigeria",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Festive holiday campaign across Instagram, Facebook and X (Twitter) with themed graphics, promotional content and countdown posts.",
    challenge:
      "Create a holiday campaign that stands out during the busy festive season and drives sales.",
    solution:
      "Designed a festive campaign with warm colours, gift-themed graphics and urgency-driven messaging. The campaign was adapted across all social platforms for maximum reach.",
    deliverables: ["Holiday Campaigns", "Social Media Graphics", "Ad Creatives", "Countdown Posts"],
    tags: ["Retail", "Social Media", "Holiday"],
    featured: false,
    color: "#ef4444",
    emoji: "🎄",
    service: "Social Media",
  },
  {
    slug: "product-launch-social",
    title: "Product Launch Social Campaign",
    category: "Social Media Graphics",
    industry: "Technology",
    clientName: "NexTech Electronics",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Multi-platform social media campaign for a new tech product launch, including teaser content, feature highlights and launch day graphics.",
    challenge:
      "Build anticipation and drive sales for a new tech product through social media.",
    solution:
      "Created a strategic campaign with teaser posts, feature highlight graphics and launch day content. The campaign built excitement and drove pre-orders.",
    deliverables: ["Product Launches", "Social Media Graphics", "Teaser Content", "Ad Creatives"],
    tags: ["Technology", "Social Media", "Launch"],
    featured: false,
    color: "#06b6d4",
    emoji: "📢",
    service: "Social Media",
  },
  {
    slug: "restaurant-social-media",
    title: "Restaurant Social Media Package",
    category: "Social Media Graphics",
    industry: "Retail",
    clientName: "Savory Bites",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Complete social media graphics package for a restaurant, including menu highlights, daily specials and promotional content.",
    challenge:
      "Create appetising social media content that drives foot traffic and online orders for a restaurant.",
    solution:
      "Designed a mouth-watering social media package with food photography, menu highlights and promotional graphics. The content increased engagement and customer visits.",
    deliverables: ["Social Media Graphics", "Menu Highlights", "Promotional Content", "Ad Creatives"],
    tags: ["Retail", "Food", "Social Media"],
    featured: false,
    color: "#f97316",
    emoji: "🍽️",
    service: "Social Media",
  },

  // ══════════════════════════════════════════
  // WEBSITE DESIGN
  // ══════════════════════════════════════════
  {
    slug: "healthcare-website",
    title: "Healthcare Website Design",
    category: "Website Design",
    industry: "Healthcare",
    clientName: "MediCare Plus",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Modern healthcare website with appointment booking, doctor profiles and patient resources. Designed for trust and accessibility.",
    challenge:
      "Create a healthcare website that builds patient trust and simplifies appointment booking.",
    solution:
      "Designed a clean, accessible website with clear navigation, doctor profiles and an intuitive booking system. The site prioritises patient experience and information clarity.",
    deliverables: ["Website Design", "Appointment Booking", "Responsive Design", "SEO Optimisation"],
    tags: ["Healthcare", "Technology", "Website"],
    featured: false,
    color: "#0ea5e9",
    emoji: "🩺",
    tech: ["Next.js", "Tailwind CSS", "PostgreSQL", "Vercel"],
    service: "Website Design",
  },
  {
    slug: "education-platform-website",
    title: "Education Platform Website",
    category: "Website Design",
    industry: "Education",
    clientName: "EduBridge International",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "E-learning platform website with course catalogues, student portals and instructor dashboards. Built for scalability and engagement.",
    challenge:
      "Create an e-learning platform that engages students and supports thousands of concurrent users.",
    solution:
      "Built a scalable platform with course management, student progress tracking and interactive learning tools. The design is clean and focused on learning outcomes.",
    deliverables: ["Website Design", "E-Learning Platform", "Student Portal", "Responsive Design"],
    tags: ["Education", "Technology", "Website"],
    featured: false,
    color: "#14b8a6",
    emoji: "📚",
    tech: ["Next.js", "React", "Node.js", "MongoDB"],
    service: "Website Design",
  },
  {
    slug: "restaurant-website",
    title: "Restaurant Website Design",
    category: "Website Design",
    industry: "Retail",
    clientName: "Savory Bites",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Elegant restaurant website with online menu, table reservations and location information. Designed to drive bookings.",
    challenge:
      "Create a restaurant website that showcases the dining experience and drives table reservations.",
    solution:
      "Designed a visually appetising website with a digital menu, reservation system and gallery. The site captures the restaurant's atmosphere and encourages bookings.",
    deliverables: ["Website Design", "Online Menu", "Reservation System", "Responsive Design"],
    tags: ["Retail", "Food", "Website"],
    featured: false,
    color: "#f97316",
    emoji: "🍴",
    tech: ["Next.js", "Tailwind CSS", "Supabase", "Vercel"],
    service: "Website Design",
  },

  // ══════════════════════════════════════════
  // UI/UX DESIGN
  // ══════════════════════════════════════════
  {
    slug: "banking-app-ui",
    title: "Banking App UI/UX",
    category: "UI/UX Design",
    industry: "Finance",
    clientName: "Meridian Bank",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Mobile banking app UI/UX design with intuitive navigation, secure transactions and personalised financial insights.",
    challenge:
      "Design a mobile banking app that is both secure and user-friendly for a diverse customer base.",
    solution:
      "Created a clean, intuitive interface with clear navigation, biometric security and personalised dashboards. The design prioritises trust and ease of use.",
    deliverables: ["UI/UX Design", "Mobile App Design", "Design System", "Prototype"],
    tags: ["Finance", "UI/UX", "Mobile"],
    featured: false,
    color: "#1e40af",
    emoji: "🏦",
    service: "UI/UX Design",
  },
  {
    slug: "ecommerce-ui",
    title: "E-Commerce UI/UX",
    category: "UI/UX Design",
    industry: "Retail",
    clientName: "ShopSphere",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "E-commerce platform UI/UX design with streamlined checkout, product discovery and personalised recommendations.",
    challenge:
      "Design an e-commerce interface that reduces cart abandonment and increases conversion rates.",
    solution:
      "Created a frictionless shopping experience with intuitive product discovery, streamlined checkout and personalised recommendations. The design drives conversions.",
    deliverables: ["UI/UX Design", "E-Commerce Design", "Design System", "Prototype"],
    tags: ["Retail", "UI/UX", "E-Commerce"],
    featured: false,
    color: "#8b5cf6",
    emoji: "🛒",
    service: "UI/UX Design",
  },
  {
    slug: "saas-dashboard-ui",
    title: "SaaS Dashboard UI/UX",
    category: "UI/UX Design",
    industry: "Technology",
    clientName: "CloudMetrics",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "SaaS analytics dashboard UI/UX with data visualisation, customisable widgets and team collaboration features.",
    challenge:
      "Design a complex analytics dashboard that is powerful yet intuitive for non-technical users.",
    solution:
      "Created a modular dashboard with customisable widgets, clear data visualisation and progressive disclosure. The design balances power with simplicity.",
    deliverables: ["UI/UX Design", "Dashboard Design", "Data Visualisation", "Design System"],
    tags: ["Technology", "UI/UX", "SaaS"],
    featured: false,
    color: "#6366f1",
    emoji: "📊",
    service: "UI/UX Design",
  },

  // ══════════════════════════════════════════
  // MOBILE APPLICATIONS
  // ══════════════════════════════════════════
  {
    slug: "fitness-app",
    title: "Fitness Tracking App",
    category: "Mobile Applications",
    industry: "Healthcare",
    clientName: "FitLife",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Mobile fitness tracking app with workout plans, progress tracking and social features. Built for iOS and Android.",
    challenge:
      "Create a fitness app that keeps users motivated and engaged with their health goals.",
    solution:
      "Developed a feature-rich fitness app with personalised workout plans, progress visualisation and social challenges. The app drives daily engagement.",
    deliverables: ["Mobile App", "UI/UX Design", "iOS & Android", "App Store Assets"],
    tags: ["Healthcare", "Mobile", "Fitness"],
    featured: false,
    color: "#10b981",
    emoji: "💪",
    tech: ["React Native", "TypeScript", "Firebase", "Expo"],
    service: "Mobile Applications",
  },
  {
    slug: "delivery-app",
    title: "Food Delivery App",
    category: "Mobile Applications",
    industry: "Retail",
    clientName: "QuickBite",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Food delivery mobile app with real-time tracking, restaurant discovery and seamless payment integration.",
    challenge:
      "Create a food delivery app that provides a seamless experience from ordering to delivery.",
    solution:
      "Built a comprehensive delivery app with real-time order tracking, smart restaurant recommendations and multiple payment options. The app delivers a frictionless experience.",
    deliverables: ["Mobile App", "UI/UX Design", "Real-Time Tracking", "Payment Integration"],
    tags: ["Retail", "Mobile", "Food"],
    featured: false,
    color: "#f59e0b",
    emoji: "🛵",
    tech: ["Flutter", "Dart", "Firebase", "Google Maps API"],
    service: "Mobile Applications",
  },

  // ══════════════════════════════════════════
  // YOUTUBE CONTENT
  // ══════════════════════════════════════════
  {
    slug: "youtube-channel-branding",
    title: "YouTube Channel Branding",
    category: "YouTube Content",
    industry: "Entertainment",
    clientName: "TechTalk Africa",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Complete YouTube channel branding including channel art, thumbnails, video covers and end screens for a tech review channel.",
    challenge:
      "Create YouTube branding that increases click-through rates and builds a recognisable channel identity.",
    solution:
      "Designed a cohesive channel brand with eye-catching thumbnails, professional channel art and consistent video covers. The branding increased viewer engagement.",
    deliverables: ["Thumbnails", "Channel Branding", "Video Covers", "End Screens"],
    tags: ["Entertainment", "YouTube", "Content"],
    featured: false,
    color: "#ef4444",
    emoji: "▶️",
    service: "Video Production",
  },
  {
    slug: "podcast-cover-design",
    title: "Podcast Cover Design",
    category: "YouTube Content",
    industry: "Entertainment",
    clientName: "The Growth Podcast",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Professional podcast cover art and episode graphics for a business growth podcast, designed to stand out in podcast directories.",
    challenge:
      "Create podcast artwork that attracts listeners and communicates the show's value proposition.",
    solution:
      "Designed a bold, memorable podcast cover with clear typography and striking visuals. Created episode graphics that maintain brand consistency across platforms.",
    deliverables: ["Podcast Covers", "Episode Graphics", "Channel Branding", "Social Media Assets"],
    tags: ["Entertainment", "Podcast", "Content"],
    featured: false,
    color: "#8b5cf6",
    emoji: "🎙️",
    service: "Video Production",
  },
  {
    slug: "youtube-shorts-graphics",
    title: "YouTube Shorts Graphics",
    category: "YouTube Content",
    industry: "Entertainment",
    clientName: "DailyVibe",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Series of YouTube Shorts graphics and motion graphics for a lifestyle channel, designed for maximum mobile engagement.",
    challenge:
      "Create short-form video graphics that capture attention in the first 3 seconds and drive views.",
    solution:
      "Designed bold, fast-paced graphics with clear messaging and dynamic motion. The Shorts content achieved high engagement rates.",
    deliverables: ["Shorts Graphics", "Motion Graphics", "Video Covers", "Thumbnails"],
    tags: ["Entertainment", "YouTube", "Shorts"],
    featured: false,
    color: "#06b6d4",
    emoji: "⚡",
    service: "Video Production",
  },

  // ══════════════════════════════════════════
  // VIDEO EDITING & MOTION GRAPHICS
  // ══════════════════════════════════════════
  {
    slug: "corporate-video-production",
    title: "Corporate Video Production",
    category: "Video Editing",
    industry: "Corporate",
    clientName: "Global Finance Group",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Professional corporate video production including company overview, executive interviews and service explainer videos.",
    challenge:
      "Create corporate videos that communicate the company's value proposition and build trust with stakeholders.",
    solution:
      "Produced high-quality corporate videos with professional cinematography, clear messaging and polished editing. The videos enhance the company's professional image.",
    deliverables: ["Corporate Videos", "Video Editing", "Motion Graphics", "Colour Grading"],
    tags: ["Corporate", "Video", "Production"],
    featured: false,
    color: "#1e40af",
    emoji: "🎬",
    service: "Video Production",
  },
  {
    slug: "event-video-highlights",
    title: "Event Video Highlights",
    category: "Video Editing",
    industry: "Events",
    clientName: "AfroBeats Festival",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Dynamic event highlight videos capturing the energy and key moments of a major music festival.",
    challenge:
      "Create event highlight videos that capture the festival experience and drive attendance for future events.",
    solution:
      "Edited high-energy highlight reels with dynamic transitions, music sync and key moment captures. The videos generated significant social media engagement.",
    deliverables: ["Event Videos", "Video Editing", "Motion Graphics", "Social Media Content"],
    tags: ["Events", "Video", "Music"],
    featured: false,
    color: "#f43f5e",
    emoji: "🎥",
    service: "Video Production",
  },
  {
    slug: "product-promo-video",
    title: "Product Promo Video",
    category: "Video Editing",
    industry: "Technology",
    clientName: "TechNova",
    year: "2026",
    coverImage: "",
    gallery: [],
    overview:
      "High-impact product promotional video with 3D animation, motion graphics and compelling storytelling for a tech product launch.",
    challenge:
      "Create a product promo video that generates excitement and clearly communicates product features.",
    solution:
      "Produced a cinematic promo video with 3D product animation, dynamic motion graphics and strategic messaging. The video drove significant pre-launch interest.",
    deliverables: ["Promo Videos", "Motion Graphics", "3D Animation", "Video Editing"],
    tags: ["Technology", "Video", "Promo"],
    featured: false,
    color: "#8b5cf6",
    emoji: "🎯",
    service: "Video Production",
  },
  {
    slug: "motion-graphics-brand",
    title: "Motion Graphics Brand Package",
    category: "Motion Graphics",
    industry: "Branding",
    clientName: "Luxe Hair Co.",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Animated brand assets including logo animations, social media motion graphics and animated infographics for a beauty brand.",
    challenge:
      "Create motion graphics that bring a brand to life and increase engagement on digital platforms.",
    solution:
      "Developed a suite of animated brand assets including logo reveals, social media animations and animated infographics. The motion graphics elevated the brand's digital presence.",
    deliverables: ["Motion Graphics", "Logo Animation", "Animated Infographics", "Social Media Content"],
    tags: ["Branding", "Motion", "Design"],
    featured: false,
    color: "#d946ef",
    emoji: "✨",
    service: "Video Production",
  },

  // ══════════════════════════════════════════
  // AI CREATIVE
  // ══════════════════════════════════════════
  {
    slug: "ai-product-visuals",
    title: "AI Product Visuals",
    category: "AI Creative",
    industry: "Technology",
    clientName: "CloudMetrics",
    year: "2026",
    coverImage: "",
    gallery: [],
    overview:
      "AI-generated product visuals and marketing imagery for a SaaS company, creating stunning visuals without expensive photoshoots.",
    challenge:
      "Create high-quality product visuals and marketing imagery on a tight budget and timeline.",
    solution:
      "Leveraged AI image generation to create stunning product mockups, lifestyle imagery and marketing visuals. The AI approach delivered premium results at a fraction of the cost.",
    deliverables: ["AI Image Generation", "Product Visuals", "Marketing Imagery", "Brand Assets"],
    tags: ["Technology", "AI", "Marketing"],
    featured: false,
    color: "#06b6d4",
    emoji: "🖼️",
    service: "AI Creative",
  },
  {
    slug: "ai-video-campaign",
    title: "AI Video Campaign",
    category: "AI Creative",
    industry: "Marketing",
    clientName: "Nova AI",
    year: "2026",
    coverImage: "",
    gallery: [],
    overview:
      "AI-generated video campaign with synthetic presenters, AI voiceovers and dynamic visuals for a product launch.",
    challenge:
      "Create a video campaign that stands out while keeping production costs and timelines minimal.",
    solution:
      "Used AI video generation to create engaging campaign videos with synthetic presenters and dynamic visuals. The campaign achieved high engagement with minimal production overhead.",
    deliverables: ["AI Video Campaigns", "Synthetic Presenters", "AI Voiceovers", "Motion Graphics"],
    tags: ["AI", "Video", "Marketing"],
    featured: false,
    color: "#8b5cf6",
    emoji: "🎞️",
    service: "AI Creative",
  },
  {
    slug: "ai-marketing-concepts",
    title: "AI Marketing Concepts",
    category: "AI Creative",
    industry: "Marketing",
    clientName: "Various Clients",
    year: "2026",
    coverImage: "",
    gallery: [],
    overview:
      "AI-powered marketing concept development including campaign ideas, visual directions and copy generation for multiple brands.",
    challenge:
      "Develop innovative marketing concepts quickly for multiple brands with varying needs.",
    solution:
      "Used AI tools to generate campaign concepts, visual directions and copy variations. The AI-assisted approach accelerated the creative process while maintaining quality.",
    deliverables: ["AI Marketing Concepts", "Campaign Ideas", "Visual Directions", "Copy Generation"],
    tags: ["AI", "Marketing", "Creative"],
    featured: false,
    color: "#f59e0b",
    emoji: "🧠",
    service: "AI Creative",
  },

  // ══════════════════════════════════════════
  // PRINT DESIGN & PUBLICATIONS
  // ══════════════════════════════════════════
  {
    slug: "magazine-design",
    title: "Magazine Design",
    category: "Publications",
    industry: "Media",
    clientName: "Lagos Life Magazine",
    year: "2025",
    coverImage: "",
    gallery: [],
    overview:
      "Editorial magazine design with striking layouts, typography and photography for a lifestyle publication.",
    challenge:
      "Create a magazine design that is visually engaging and maintains editorial quality across issues.",
    solution:
      "Designed a sophisticated magazine with editorial layouts, strong typography and visual storytelling. The design elevated the publication's premium positioning.",
    deliverables: ["Magazine Design", "Editorial Layout", "Typography", "Print Design"],
    tags: ["Media", "Print", "Editorial"],
    featured: false,
    color: "#ec4899",
    emoji: "📰",
    service: "Print Design",
  },
  {
    slug: "brochure-design",
    title: "Corporate Brochure Design",
    category: "Print Design",
    industry: "Corporate",
    clientName: "BuildRight Construction",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Elegant corporate brochure showcasing services, projects and company capabilities for a construction firm.",
    challenge:
      "Create a brochure that communicates company capabilities and wins new business.",
    solution:
      "Designed a premium brochure with project photography, service information and clear calls-to-action. The brochure serves as a powerful sales tool.",
    deliverables: ["Brochure Design", "Print Design", "Project Showcase", "Brand Identity"],
    tags: ["Corporate", "Print", "Brochure"],
    featured: false,
    color: "#f97316",
    emoji: "📄",
    service: "Print Design",
  },
  {
    slug: "poster-series",
    title: "Poster Series Design",
    category: "Print Design",
    industry: "Events",
    clientName: "Art & Culture Festival",
    year: "2024",
    coverImage: "",
    gallery: [],
    overview:
      "Series of event posters for an art and culture festival, designed to generate excitement and drive attendance.",
    challenge:
      "Create poster designs that capture attention and communicate event details effectively.",
    solution:
      "Designed a bold poster series with striking visuals and clear event information. The posters were used across print and digital channels.",
    deliverables: ["Poster Design", "Print Design", "Event Promotion", "Brand Identity"],
    tags: ["Events", "Print", "Poster"],
    featured: false,
    color: "#f43f5e",
    emoji: "🖼️",
    service: "Print Design",
  },
];

export const PORTFOLIO_PROJECTS: PortfolioProject[] = normalizeProjects(RAW_PROJECTS);

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Adebayo Ogunleye",
    company: "Starzz Properties Ltd",
    photo: "",
    rating: 5,
    review:
      "PurpleSoftHub transformed our online presence completely. The website they built is stunning and has significantly increased our qualified leads. Their attention to detail and professionalism is unmatched.",
  },
  {
    name: "Chiamaka Eze",
    company: "CollinsKind Fashion",
    photo: "",
    rating: 5,
    review:
      "Working with PurpleSoftHub was a game-changer for our brand. They understood our vision perfectly and delivered a brand identity that truly represents who we are. Our social media engagement has never been better.",
  },
  {
    name: "David Mensah",
    company: "TechNova",
    photo: "",
    rating: 5,
    review:
      "The team at PurpleSoftHub exceeded our expectations. From the AI-powered marketing campaign to the event branding, everything was executed flawlessly. They're not just a service provider — they're a true creative partner.",
  },
  {
    name: "Fatima Bello",
    company: "Healthcare Plus",
    photo: "",
    rating: 5,
    review:
      "PurpleSoftHub delivered a corporate profile that perfectly captures our brand's values and professionalism. The design is elegant, the content is compelling, and the response from our clients has been overwhelmingly positive.",
  },
  {
    name: "James Okafor",
    company: "AfroBeats Festival",
    photo: "",
    rating: 5,
    review:
      "The event branding PurpleSoftHub created for our festival was absolutely incredible. From the backdrops to the social media content, everything was cohesive and visually stunning. Our attendees were blown away.",
  },
  {
    name: "Sarah Johnson",
    company: "CloudMetrics",
    photo: "",
    rating: 5,
    review:
      "PurpleSoftHub's AI creative work is truly cutting-edge. They generated product visuals that look like they came from a multi-million dollar photoshoot. The quality and speed of their work is remarkable.",
  },
];