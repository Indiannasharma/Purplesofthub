type ProjectIdentity = { slug?: unknown; title?: unknown };

export const REMOVED_DEMO_PORTFOLIO_SLUGS = new Set([
  "techflow-logo", "greenleaf-organic", "africa-summit-sponsorship-deck",
  "tech-innovation-sponsorship-proposal", "global-finance-corporate-profile",
  "healthcare-plus-company-profile", "construction-capability-statement",
  "fashion-retail-product-catalogue", "tech-products-catalogue",
  "real-estate-business-proposal", "annual-report-2025", "education-partnership-deck",
  "investment-presentation", "music-festival-event-branding", "corporate-conference-branding",
  "product-launch-event", "product-launch-event-branding", "instagram-campaign-fashion",
  "holiday-campaign-social", "product-launch-social", "product-launch-social-campaign",
  "restaurant-social-media", "restaurant-social-media-package", "healthcare-website",
  "healthcare-website-design", "education-platform", "education-platform-website",
  "restaurant-website", "restaurant-website-design", "banking-app", "banking-app-ui-ux",
  "ecommerce-ui", "ecommerce-ui-ux", "saas-dashboard-ui", "saas-dashboard-ui-ux",
  "fitness-app", "fitness-tracking-app", "delivery-app", "food-delivery-app",
  "youtube-channel-branding", "podcast-cover-design", "youtube-shorts-graphics",
  "youtube-short-graphics", "corporate-video-production", "event-video-highlights",
  "product-promo-video", "motion-graphics-brand", "motion-graphics-brand-package",
  "ai-product-visuals", "ai-video-campaign", "ai-marketing-concepts", "magazine-design",
  "brochure-design", "corporate-brochure-design", "poster-series", "poster-series-design",
]);

const REMOVED_DEMO_PORTFOLIO_TITLES = new Set([
  "techflow logo suite", "greenleaf organic brand", "africa summit sponsorship deck",
  "tech innovation sponsorship proposal", "global finance corporate profile",
  "healthcare plus company profile", "buildright capability statement",
  "fashion retail product catalogue", "tech products catalogue", "real estate business proposal",
  "annual report 2025", "education partnership deck", "investment presentation",
  "music festival event branding", "corporate conference branding",
  "product launch event branding", "instagram campaign — fashion", "instagram campaign fashion",
  "holiday campaign social media", "holiday campaign social", "product launch social campaign",
  "restaurant social media package", "healthcare website design", "education platform website",
  "restaurant website design", "banking app ui/ux", "e-commerce ui/ux", "saas dashboard ui/ux",
  "fitness tracking app", "food delivery app", "youtube channel branding", "podcast cover design",
  "youtube shorts graphics", "youtube short graphics", "corporate video production",
  "event video highlights", "product promo video", "motion graphics brand package",
  "ai product visuals", "ai video campaign", "ai marketing concepts", "magazine design",
  "corporate brochure design", "poster series design",
]);

export function isRemovedDemoPortfolioProject(project: ProjectIdentity): boolean {
  const slug = typeof project.slug === "string" ? project.slug.trim().toLowerCase() : "";
  const title = typeof project.title === "string" ? project.title.trim().toLowerCase() : "";
  return REMOVED_DEMO_PORTFOLIO_SLUGS.has(slug) || REMOVED_DEMO_PORTFOLIO_TITLES.has(title);
}

export function excludeRemovedDemoPortfolioProjects<T extends ProjectIdentity>(projects: T[]): T[] {
  return projects.filter((project) => !isRemovedDemoPortfolioProject(project));
}
