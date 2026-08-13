export type ProjectStatus = 'draft' | 'published' | 'archived'

export interface PortfolioProject {
  id: string
  title: string
  slug: string
  client_name: string | null
  client_id: string | null
  industry: string | null
  category: string | null
  service: string | null
  completion_date: string | null
  year: string | null

  // Cover / Media
  cover_image: string | null
  hero_banner: string | null
  featured_thumbnail: string | null
  gallery: string[]

  // Content
  overview: string | null
  challenge: string | null
  solution: string | null
  deliverables: string[]
  results: string | null
  client_feedback: string | null

  // Services
  services_used: string[]

  // Tags
  tags: string[]

  // Client Info
  client_logo: string | null
  client_website: string | null

  // Statistics
  project_duration: string | null
  team_size: string | null
  software_used: string | null
  deliverables_count: number | null

  // Status
  status: ProjectStatus
  featured: boolean

  // Visual
  color: string
  emoji: string

  // SEO
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[]
  og_image: string | null
  canonical_url: string | null
  structured_data: Record<string, unknown> | null

  // External Links
  live_url: string | null
  behance_url: string | null
  dribbble_url: string | null
  youtube_embed: string | null
  instagram_embed: string | null
  figma_embed: string | null
  adobe_xd_embed: string | null

  // Meta
  view_count: number
  created_at: string
  updated_at: string
}

export interface PortfolioCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PortfolioIndustry {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PortfolioService {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
  sort_order: number
  created_at: string
}

export interface PortfolioClient {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website: string | null
  industry: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioTestimonial {
  id: string
  project_id: string | null
  client_name: string
  company: string | null
  photo_url: string | null
  rating: number
  review: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface MediaItem {
  id: string
  filename: string
  url: string
  public_id: string | null
  folder: string
  file_type: string | null
  file_size: number | null
  width: number | null
  height: number | null
  alt_text: string | null
  created_by: string | null
  created_at: string
  updated_at: string
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