type ProjectIdentity = { slug?: unknown; title?: unknown };

export const REMOVED_DEMO_PORTFOLIO_SLUGS = new Set([
  "techflow-logo", "greenleaf-organic", "africa-summit-sponsorship-deck",
  "tech-innovation-sponsorship-proposal", "global-finance-corporate-profile",
  "healthcare-plus-company-profile", "construction-capability-statement",
  "fashion-retail-product-catalogue", "tech-products-catalogue",
  "real-estate-business-proposal", "annual-report-2025", "education-partnership-deck",
  "investment-presentation", "music-festival-event-branding", "corporate-conference-branding",
]);

const REMOVED_DEMO_PORTFOLIO_TITLES = new Set([
  "techflow logo suite", "greenleaf organic brand", "africa summit sponsorship deck",
  "tech innovation sponsorship proposal", "global finance corporate profile",
  "healthcare plus company profile", "buildright capability statement",
  "fashion retail product catalogue", "tech products catalogue", "real estate business proposal",
  "annual report 2025", "education partnership deck", "investment presentation",
  "music festival event branding", "corporate conference branding",
]);

export function isRemovedDemoPortfolioProject(project: ProjectIdentity): boolean {
  const slug = typeof project.slug === "string" ? project.slug.trim().toLowerCase() : "";
  const title = typeof project.title === "string" ? project.title.trim().toLowerCase() : "";
  return REMOVED_DEMO_PORTFOLIO_SLUGS.has(slug) || REMOVED_DEMO_PORTFOLIO_TITLES.has(title);
}

export function excludeRemovedDemoPortfolioProjects<T extends ProjectIdentity>(projects: T[]): T[] {
  return projects.filter((project) => !isRemovedDemoPortfolioProject(project));
}
