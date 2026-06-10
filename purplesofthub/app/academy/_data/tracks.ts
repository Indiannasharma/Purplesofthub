export const academyCategories = [
  "All",
  "Tech",
  "Design & Creative",
  "Business & Marketing",
  "Music",
  "Youth",
] as const;

export type AcademyCategory = (typeof academyCategories)[number];

export type AcademyTrack = {
  slug: string;
  title: string;
  category: Exclude<AcademyCategory, "All">;
  level: string;
  duration: string;
  outcome: string;
  modules: string[];
  project: string;
  accent: string;
  relatedServiceSlug?: string;
};

export const academyTracks: AcademyTrack[] = [
  {
    slug: "web-development",
    title: "Web Development Bootcamp",
    category: "Tech",
    level: "Beginner to Advanced",
    duration: "12 weeks",
    outcome: "Build responsive websites and full-stack web apps for real clients or portfolio use.",
    modules: ["HTML/CSS", "JavaScript", "React", "Next.js", "APIs", "Databases", "Auth", "Deployment"],
    project: "Launch a business website and a dashboard-style web app.",
    accent: "#7c3aed",
    relatedServiceSlug: "web-development",
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    category: "Tech",
    level: "Beginner entry to Intermediate",
    duration: "10 weeks",
    outcome: "Build practical Android and iOS apps for businesses, creators, and communities.",
    modules: ["Mobile UI", "Flutter or React Native", "Navigation", "APIs", "Auth", "Payments", "Publishing"],
    project: "Ship a working mobile app prototype with user login and payments.",
    accent: "#06b6d4",
    relatedServiceSlug: "mobile-app-development",
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    category: "Design & Creative",
    level: "Beginner to Intermediate",
    duration: "8 weeks",
    outcome: "Design usable digital products from research to clickable prototype.",
    modules: ["Design thinking", "User research", "Wireframes", "Figma", "Prototyping", "Design systems", "Testing"],
    project: "Create a portfolio-ready product design case study.",
    accent: "#f59e0b",
    relatedServiceSlug: "ui-ux-design",
  },
  {
    slug: "graphic-design",
    title: "Graphic Design with Photoshop & Illustrator",
    category: "Design & Creative",
    level: "Beginner to Intermediate",
    duration: "8 weeks",
    outcome: "Create brand assets, social media designs, flyers, covers, and visual identities.",
    modules: ["Design principles", "Photoshop", "Illustrator", "Logo design", "Brand kits", "Social graphics", "Print export"],
    project: "Build a complete visual identity kit for a small brand.",
    accent: "#ec4899",
    relatedServiceSlug: "branding-creative-design",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    category: "Business & Marketing",
    level: "Beginner to Intermediate",
    duration: "8 weeks",
    outcome: "Plan, launch, and measure campaigns for brands, creators, and small businesses.",
    modules: ["Strategy", "SEO", "Social marketing", "Meta ads", "Google ads", "Analytics", "Email marketing"],
    project: "Launch a full campaign plan with budget, creatives, and reporting.",
    accent: "#10b981",
    relatedServiceSlug: "facebook-and-instagram-ads",
  },
  {
    slug: "ai-productivity",
    title: "AI & Productivity",
    category: "Tech",
    level: "Beginner",
    duration: "4 weeks",
    outcome: "Use AI tools to work faster, create better content, automate tasks, and support business workflows.",
    modules: ["AI basics", "Prompting", "Research workflows", "Content systems", "Business AI", "Responsible use"],
    project: "Design an AI-assisted workflow for a real business task.",
    accent: "#8b5cf6",
    relatedServiceSlug: "saas-development",
  },
  {
    slug: "saas-product-development",
    title: "SaaS/Product Development",
    category: "Tech",
    level: "Intermediate to Advanced",
    duration: "10 weeks",
    outcome: "Turn a problem into a validated digital product or MVP.",
    modules: ["Idea validation", "Product strategy", "UX flows", "MVP planning", "No-code tools", "Pricing", "Launch"],
    project: "Map and pitch a SaaS MVP with launch plan and metrics.",
    accent: "#14b8a6",
    relatedServiceSlug: "saas-development",
  },
  {
    slug: "cybersecurity-basics",
    title: "Cybersecurity Basics",
    category: "Tech",
    level: "Beginner",
    duration: "6 weeks",
    outcome: "Understand digital safety, common threats, and basic defensive practices.",
    modules: ["Internet safety", "Passwords/MFA", "Phishing", "Device security", "Networks", "Data protection", "Response"],
    project: "Create a practical security checklist for a small business.",
    accent: "#ef4444",
  },
  {
    slug: "business-automation",
    title: "Business Automation",
    category: "Business & Marketing",
    level: "Beginner to Intermediate",
    duration: "6 weeks",
    outcome: "Automate repetitive business tasks using modern tools and AI-assisted workflows.",
    modules: ["Workflow mapping", "Forms", "CRM basics", "Google Workspace", "Zapier/Make", "AI agents", "Dashboards"],
    project: "Build a simple lead capture and follow-up automation.",
    accent: "#22c55e",
    relatedServiceSlug: "saas-development",
  },
  {
    slug: "music-business-distribution",
    title: "Music Business & Digital Distribution",
    category: "Music",
    level: "Beginner to Intermediate",
    duration: "6 weeks",
    outcome: "Release, promote, monetize, and manage music digitally.",
    modules: ["DSP distribution", "Metadata", "Royalties", "Artist branding", "Playlist pitching", "Rollouts", "Analytics"],
    project: "Prepare a complete single release and promotion plan.",
    accent: "#a855f7",
    relatedServiceSlug: "music-distribution",
  },
  {
    slug: "content-creation-video-editing",
    title: "Content Creation & Video Editing",
    category: "Design & Creative",
    level: "Beginner to Intermediate",
    duration: "6 weeks",
    outcome: "Produce polished short-form and long-form content for brands, creators, and campaigns.",
    modules: ["Content strategy", "Scripting", "Shooting basics", "CapCut", "Premiere", "Thumbnails", "Publishing calendars"],
    project: "Create a seven-day content campaign with edited videos.",
    accent: "#0ea5e9",
    relatedServiceSlug: "video-content-creation",
  },
  {
    slug: "youth-digital-foundation",
    title: "Youth Digital Foundation Program",
    category: "Youth",
    level: "Foundation",
    duration: "6 weeks",
    outcome: "Gain practical digital confidence before choosing a deeper tech or creative track.",
    modules: ["Computer basics", "Internet safety", "Typing", "Productivity tools", "Intro coding", "Intro design", "AI basics"],
    project: "Complete mini projects across coding, design, and digital creativity.",
    accent: "#f97316",
  },
];

export const learningPaths = [
  {
    title: "Developer Path",
    desc: "Start with Web Development, then move into Mobile App Development or SaaS/Product Development.",
    tracks: ["Web Development", "Mobile Apps", "SaaS"],
  },
  {
    title: "Creator Path",
    desc: "Build practical creative skills for design, video, brand content, and digital portfolios.",
    tracks: ["Graphic Design", "UI/UX", "Video Editing"],
  },
  {
    title: "Business Growth Path",
    desc: "Learn how to market, automate, and scale small businesses with modern digital tools.",
    tracks: ["Digital Marketing", "Automation", "AI"],
  },
  {
    title: "Music & Media Path",
    desc: "Help artists release music, grow fanbases, and package campaigns professionally.",
    tracks: ["Distribution", "Branding", "Content"],
  },
];

export const academyFaqs = [
  {
    q: "Who can join PurpleSoftHub Academy?",
    a: "Beginners, students, creators, business owners, and young people who want practical digital skills.",
  },
  {
    q: "Will students build real projects?",
    a: "Yes. Every track is project-based so learners finish with work they can show in a portfolio.",
  },
  {
    q: "Are there certificates?",
    a: "Certificate support can be added per cohort after attendance, projects, and assessments are completed.",
  },
  {
    q: "Can sponsors support students?",
    a: "Yes. The Academy should connect to PurpleSoftHub's donation mission for scholarships, equipment, internet, and learning hubs.",
  },
];
