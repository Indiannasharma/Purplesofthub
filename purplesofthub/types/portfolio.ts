export type ProjectStatus = 'draft' | 'published' | 'archived'

export interface PortfolioProject {
  id: string
  title: string
  slug: string
  clientName: string | null
  clientId: string | null
  industry: string | null
  category: string | null
  service: string | null
  completionDate: string | null
  year: string | null

  // Cover / Media
  coverImage: string | null
  heroBanner: string | null
  featuredThumbnail: string | null
  gallery: string[]

  // Case Study Sections (NEW)
  overview: string | null
  challenge: string | null
  research: string | null
  strategy: string | null
  creativeDirection: string | null
  wireframes: string | null
  moodboard: string | null
  typography: string | null
  colourSystem: string | null
  gridSystem: string | null
  finalSolution: string | null
  deliverables: string[]
  results: string | null
  clientFeedback: string | null

  // Comparison (before / after, brand refresh, redesign)
  comparison: {
    type: 'before-after' | 'brand-refresh' | 'website-redesign' | 'logo-evolution'
    before?: string
    after?: string
    label?: string
  } | null

  // Related services to recommend on the case study
  recommendedServices: string[]

  // Interactive Mockups (NEW)
  mockups: {
    desktop?: string
    laptop?: string
    tablet?: string
    phone?: string
    magazine?: string
    billboard?: string
    packaging?: string
    businessCard?: string
    vehicleBranding?: string
    rollupBanner?: string
    socialMedia?: string
    _3d?: string
  } | null

  // Videos (NEW)
  videos: {
    promo?: string
    walkthrough?: string
    animation?: string
    youtube?: string
    instagram?: string
    tiktok?: string
  } | null

  // Project Timeline (NEW)
  timeline: {
    discovery: string | null
    research: string | null
    design: string | null
    revision: string | null
    delivery: string | null
    completion: string | null
  } | null

  // Services Used (NEW)
  servicesUsed: string[]

  // Tags
  tags: string[]

  // Client Info
  clientLogo: string | null
  clientWebsite: string | null

  // Statistics (NEW)
  projectDuration: string | null
  teamSize: string[] | null
  softwareUsed: string[] | null
  deliverablesCount: number | null
  views: number
  downloadCount: number
  likes: number
  enquiries: number

  // Status
  status: ProjectStatus
  featured: boolean

  // Visual
  color: string
  emoji: string

  // SEO
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string[]
  ogImage: string | null
  canonicalUrl: string | null
  structuredData: Record<string, unknown> | null

  // External Links
  liveUrl: string | null
  behanceUrl: string | null
  dribbbleUrl: string | null
  youtubeEmbed: string | null
  instagramEmbed: string | null
  figmaEmbed: string | null
  adobeXdEmbed: string | null

  // Downloads (NEW)
  downloads: {
    companyProfile?: string
    corporateProfile?: string
    sponsorshipDeck?: string
    sponsorshipProposal?: string
    brandGuidelines?: string
    capabilityStatement?: string
    annualReport?: string
    magazine?: string
    productCatalogue?: string
    presentation?: string
    brochure?: string
    trainingManual?: string
    businessProposal?: string
    eventBrandingKit?: string
    investmentPitchDeck?: string
  } | null

  // Awards & Recognition (NEW)
  awards: {
    agencyAwards: string[]
    clientRecognition: string[]
    certifications: string[]
  } | null

  // Related Projects (NEW)
  relatedProjects: string[] // slugs

  // Meta
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface PortfolioCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface PortfolioIndustry {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface PortfolioService {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface PortfolioClient {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  website: string | null
  industry: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface PortfolioTestimonial {
  id: string
  projectId: string | null
  clientName: string
  company: string | null
  photoUrl: string | null
  rating: number
  review: string
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface MediaItem {
  id: string
  filename: string
  url: string
  publicId: string | null
  folder: string
  fileType: string | null
  fileSize: number | null
  width: number | null
  height: number | null
  altText: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export const PORTFOLIO_SERVICES_LIST = [
  'Brand Identity', 'Logo Design', 'Website Development', 'Mobile App',
  'Corporate Profile', 'Company Profile', 'Sponsorship Deck', 'Sponsorship Proposal',
  'Product Catalogue', 'Event Branding', 'Social Media', 'Digital Marketing',
  'SEO', 'Video Editing', 'Motion Graphics', 'Photography',
  'Live Streaming', 'AI Creative', 'Content Creation',
  'YouTube Management', 'Instagram Management',
]

export const PORTFOLIO_TAGS = [
  'Corporate', 'Technology', 'Education', 'Healthcare',
  'Real Estate', 'Startup', 'Government', 'Finance',
  'Entertainment', 'Luxury',
]

export const PORTFOLIO_INDUSTRIES_LIST = [
  'Technology', 'Healthcare', 'Education', 'Construction',
  'Fashion', 'Automotive', 'Tourism', 'Finance',
  'NGO', 'Government', 'Agriculture', 'Real Estate',
  'Hospitality',
]

export const PORTFOLIO_CATEGORIES_LIST = [
  'Featured Projects', 'Brand Identity', 'Corporate Profiles', 'Company Profiles',
  'Sponsorship Decks', 'Sponsorship Proposals', 'Product Catalogues',
  'Event Branding', 'Website Design', 'UI/UX', 'Mobile Apps',
  'Social Media', 'YouTube', 'Instagram', 'Video Production',
  'Motion Graphics', 'AI Creative', 'Print Design',
  'Marketing Campaigns', 'Live Streaming',
]

export type ResourceCategory =
  | 'Company Profile'
  | 'Corporate Profile'
  | 'Sponsorship Proposal'
  | 'Sponsorship Deck'
  | 'Brand Guidelines'
  | 'Capability Statement'
  | 'Annual Report'
  | 'Magazine'
  | 'Product Catalogue'
  | 'Marketing Brochure'
  | 'Training Manual'
  | 'Business Proposal'
  | 'Event Branding Kit'
  | 'Investment Pitch Deck'

export interface PremiumResource {
  id: string
  title: string
  slug: string
  description: string
  category: ResourceCategory
  version: string
  tags: string[]
  coverImage: string | null
  pdfUrl: string | null
  previewUrl: string | null
  relatedServices: string[]
  emailGate: boolean
  downloadCount: number
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

export type RawPortfolioProject = Partial<PortfolioProject> & {
  slug: string
  title: string
  client_name?: string | null
  solution?: string | null
  tech?: string[]
  services_used?: string[]
}