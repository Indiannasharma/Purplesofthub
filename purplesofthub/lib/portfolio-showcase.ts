export const SHOWCASE_SERVICES = [
  { name: 'Logo Design', icon: '🎨', href: '/services/logo-design' },
  { name: 'Brand Identity', icon: '✨', href: '/services/branding-creative-design' },
  { name: 'Web Design', icon: '🌐', href: '/services/web-development' },
  { name: 'UI/UX', icon: '🧩', href: '/services/ui-ux-design' },
  { name: 'Video', icon: '🎬', href: '/services/video-content-creation' },
  { name: 'Marketing', icon: '📣', href: '/services/facebook-and-instagram-ads' },
  { name: 'AI', icon: '🤖', href: '/services/saas-development' },
  { name: 'Photography', icon: '📸', href: '/contact' },
  { name: 'Live Streaming', icon: '📡', href: '/contact' },
  { name: 'Motion Graphics', icon: '💫', href: '/services/video-content-creation' },
  { name: 'SEO', icon: '🔍', href: '/services/seo-content' },
] as const

export const SHOWCASE_INDUSTRIES = [
  { name: 'Technology', icon: '💻' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Education', icon: '🎓' },
  { name: 'Finance', icon: '💰' },
  { name: 'Agriculture', icon: '🌾' },
  { name: 'Real Estate', icon: '🏠' },
  { name: 'Automotive', icon: '🚗' },
  { name: 'Hospitality', icon: '🏨' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Government', icon: '🏛️' },
  { name: 'NGO', icon: '🤝' },
] as const

export const TRUST_CLIENTS = [
  { name: 'Starzz Properties', emoji: '🏠' },
  { name: '24HRS Content Hub', emoji: '📸' },
  { name: 'CollinsKind', emoji: '👗' },
  { name: 'Eco Pi Rewards', emoji: '♻️' },
  { name: 'Nova AI', emoji: '🤖' },
  { name: 'Meridian Bank', emoji: '🏦' },
  { name: 'AfroBeats Festival', emoji: '🎵' },
  { name: 'EduBridge', emoji: '🎓' },
  { name: 'CloudMetrics', emoji: '📊' },
  { name: 'Healthcare Plus', emoji: '🩺' },
  { name: 'Luxe Hair Co.', emoji: '💇' },
  { name: 'BuildRight', emoji: '🏗️' },
]

export const TIMELINE_STEPS = [
  { key: 'discovery', label: 'Discovery', icon: '🔎' },
  { key: 'research', label: 'Research', icon: '🧪' },
  { key: 'design', label: 'Design', icon: '✏️' },
  { key: 'revision', label: 'Revision', icon: '🔁' },
  { key: 'delivery', label: 'Delivery', icon: '📦' },
  { key: 'completion', label: 'Completion', icon: '✅' },
] as const

export const MOCKUP_TYPES = [
  { key: 'desktop', label: 'Desktop' },
  { key: 'laptop', label: 'Laptop' },
  { key: 'tablet', label: 'Tablet' },
  { key: 'phone', label: 'Phone' },
  { key: 'magazine', label: 'Magazine' },
  { key: 'billboard', label: 'Billboard' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'businessCard', label: 'Business Card' },
  { key: 'vehicleBranding', label: 'Vehicle Branding' },
  { key: 'rollupBanner', label: 'Roll-up Banner' },
  { key: 'socialMedia', label: 'Social Media' },
  { key: '_3d', label: '3D Mockup' },
] as const

export const DOWNLOAD_LABELS: Record<string, string> = {
  companyProfile: 'Company Profile',
  corporateProfile: 'Corporate Profile',
  sponsorshipDeck: 'Sponsorship Deck',
  sponsorshipProposal: 'Sponsorship Proposal',
  brandGuidelines: 'Brand Guideline',
  capabilityStatement: 'Capability Statement',
  annualReport: 'Annual Report',
  magazine: 'Magazine',
  productCatalogue: 'Catalogue',
  presentation: 'Presentation',
  brochure: 'Brochure',
  trainingManual: 'Training Manual',
  businessProposal: 'Business Proposal',
  eventBrandingKit: 'Event Branding Kit',
  investmentPitchDeck: 'Pitch Deck',
}

export const PROJECT_DOWNLOAD_CATALOG = [
  { key: 'companyProfile', label: 'Company Profile', resource: 'company-profile' },
  { key: 'corporateProfile', label: 'Corporate Profile', resource: 'corporate-profile' },
  { key: 'sponsorshipDeck', label: 'Sponsorship Deck', resource: 'sponsorship-deck' },
  { key: 'productCatalogue', label: 'Catalogue', resource: 'product-catalogue' },
  { key: 'presentation', label: 'Presentation', resource: 'investment-pitch-deck' },
  { key: 'brochure', label: 'Brochure', resource: 'marketing-brochure' },
  { key: 'brandGuidelines', label: 'Brand Guideline', resource: 'brand-guidelines' },
  { key: 'capabilityStatement', label: 'Capability Statement', resource: 'capability-statement' },
  { key: 'investmentPitchDeck', label: 'Pitch Deck', resource: 'investment-pitch-deck' },
  { key: 'businessProposal', label: 'Business Proposal', resource: 'business-proposal' },
  { key: 'annualReport', label: 'Annual Report', resource: 'annual-report' },
] as const

export const VIDEO_SLOTS = [
  { key: 'promo', label: 'Promo Video' },
  { key: 'walkthrough', label: 'Walkthrough' },
  { key: 'animation', label: 'Animation' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
] as const

export const SERVICE_HREFS: Record<string, string> = {
  'Website': '/services/web-development',
  'Website Design': '/services/web-development',
  'Web Design': '/services/web-development',
  'Brand Identity': '/services/branding-creative-design',
  'Logo Design': '/services/logo-design',
  'Social Media': '/services/social-media-management',
  'Printing': '/contact',
  'Photography': '/contact',
  'UI/UX': '/services/ui-ux-design',
  'UI/UX Design': '/services/ui-ux-design',
  'Video': '/services/video-content-creation',
  'SEO': '/services/seo-content',
  'Marketing': '/services/facebook-and-instagram-ads',
}

export const WHATSAPP_URL = 'https://wa.me/qr/L36LMHQ4RLP2B1'

export function recommendedServicesFor(category: string | null, deliverables: string[] = []): string[] {
  const cat = (category || '').toLowerCase()
  if (cat.includes('company profile') || cat.includes('corporate') || cat.includes('publication') || cat.includes('catalogue')) {
    return ['Website', 'Brand Identity', 'Social Media', 'Printing', 'Photography']
  }
  if (cat.includes('website') || cat.includes('ui') || cat.includes('app')) {
    return ['Brand Identity', 'UI/UX', 'SEO', 'Video']
  }
  if (cat.includes('brand') || cat.includes('logo') || cat.includes('identity')) {
    return ['Website', 'Social Media', 'Printing', 'Photography']
  }
  if (cat.includes('video') || cat.includes('youtube') || cat.includes('motion')) {
    return ['Social Media', 'Brand Identity', 'Website', 'Marketing']
  }
  if (deliverables.some((item) => /profile|catalogue|deck|proposal/i.test(item))) {
    return ['Website', 'Brand Identity', 'Social Media', 'Printing', 'Photography']
  }
  return ['Website', 'Brand Identity', 'Social Media', 'UI/UX']
}

export function youtubeIdFromUrl(url?: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/)
  return match?.[1] || null
}

export function comparisonLabel(type?: string | null): string {
  switch (type) {
    case 'brand-refresh':
      return 'Brand Refresh'
    case 'website-redesign':
      return 'Website Redesign'
    case 'logo-evolution':
      return 'Logo Evolution'
    default:
      return 'Before / After'
  }
}
