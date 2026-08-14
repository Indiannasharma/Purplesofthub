import type { PortfolioProject, RawPortfolioProject } from '@/types/portfolio'
import { recommendedServicesFor } from '@/lib/portfolio-showcase'

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNullable(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  return null
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value === 'string' && value.trim()) return value.split(',').map((item) => item.trim()).filter(Boolean)
  return []
}

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key]
  }
  return undefined
}

function storyFallback(kind: string, project: { title: string; industry: string | null; category: string | null; clientName: string | null; overview: string | null; challenge: string | null }) {
  const client = project.clientName || project.title
  const industry = project.industry || 'their market'
  const category = (project.category || 'creative work').toLowerCase()

  switch (kind) {
    case 'research':
      return `We studied the ${industry} landscape and spoke with stakeholders around ${client} to understand audience behaviour, competitor gaps, and the moments that matter most.`
    case 'strategy':
      return `The strategy centred on ${category} that builds trust quickly: a clear story, a distinctive visual system, and a conversion path that turns attention into enquiries.`
    case 'creativeDirection':
      return `Creative direction for ${client} balances premium craft with practical communication — bold enough to stand out, disciplined enough to work across digital, print, and campaign use.`
    case 'wireframes':
      return `We mapped the experience from first impression to final action, then refined layout, hierarchy, and interaction before any high-fidelity design was locked.`
    case 'moodboard':
      return `The moodboard gathered colour, texture, typography, photography, and reference work that felt right for ${industry} without copying the category default.`
    case 'typography':
      return `Typography was chosen for authority at large sizes and clarity at small sizes — a confident display voice paired with a highly readable supporting family.`
    case 'colourSystem':
      return `The colour system uses the brand accent as a signature, supported by restrained neutrals so content, photography, and product stay in focus.`
    case 'gridSystem':
      return `A responsive modular grid keeps the work consistent across desktop, tablet, and mobile, with an 8px spacing rhythm for editorial control.`
    case 'results':
      return project.overview
        ? `The finished work gave ${client} a clearer market position and a stronger platform for growth.`
        : `The project delivered a more confident brand presence and a clearer path from discovery to enquiry.`
    default:
      return null
  }
}

export function normalizeProject(input: RawPortfolioProject | PortfolioProject | Record<string, unknown>): PortfolioProject {
  const raw = (input || {}) as Record<string, unknown>
  const title = asString(pick(raw, 'title'), 'Untitled Project')
  const slug = asString(pick(raw, 'slug'), title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
  const clientName = asNullable(pick(raw, 'clientName', 'client_name')) || title
  const category = asNullable(pick(raw, 'category'))
  const industry = asNullable(pick(raw, 'industry'))
  const overview = asNullable(pick(raw, 'overview'))
  const challenge = asNullable(pick(raw, 'challenge'))
  const finalSolution = asNullable(pick(raw, 'finalSolution', 'solution'))
  const deliverables = asStringArray(pick(raw, 'deliverables'))
  const servicesUsed = asStringArray(pick(raw, 'servicesUsed', 'services_used'))
  const tags = asStringArray(pick(raw, 'tags'))
  const softwareUsed = asStringArray(pick(raw, 'softwareUsed', 'software_used', 'tech'))
  const year = asNullable(pick(raw, 'year')) || '2025'
  const color = asString(pick(raw, 'color'), '#7c3aed')

  const projectSeed = { title, industry, category, clientName, overview, challenge }

  const mockupsRaw = (pick(raw, 'mockups') as PortfolioProject['mockups']) || null
  const videosRaw = (pick(raw, 'videos') as PortfolioProject['videos']) || null
  const timelineRaw = (pick(raw, 'timeline') as PortfolioProject['timeline']) || null
  const downloadsRaw = (pick(raw, 'downloads') as PortfolioProject['downloads']) || null
  const awardsRaw = (pick(raw, 'awards') as PortfolioProject['awards']) || null
  const comparisonRaw = (pick(raw, 'comparison') as PortfolioProject['comparison']) || inferComparison(category, title)

  const views = Number(pick(raw, 'views', 'viewCount', 'view_count') ?? 0) || 0
  const downloadCount = Number(pick(raw, 'downloadCount', 'download_count') ?? 0) || 0

  return {
    id: asString(pick(raw, 'id'), slug),
    title,
    slug,
    clientName,
    clientId: asNullable(pick(raw, 'clientId', 'client_id')),
    industry,
    category,
    service: asNullable(pick(raw, 'service')) || category,
    completionDate: asNullable(pick(raw, 'completionDate', 'completion_date')),
    year,
    coverImage: asNullable(pick(raw, 'coverImage', 'cover_image')),
    heroBanner: asNullable(pick(raw, 'heroBanner', 'hero_banner')),
    featuredThumbnail: asNullable(pick(raw, 'featuredThumbnail', 'featured_thumbnail')),
    gallery: asStringArray(pick(raw, 'gallery')),
    overview,
    challenge,
    research: asNullable(pick(raw, 'research')) || storyFallback('research', projectSeed),
    strategy: asNullable(pick(raw, 'strategy')) || storyFallback('strategy', projectSeed),
    creativeDirection: asNullable(pick(raw, 'creativeDirection', 'creative_direction')) || storyFallback('creativeDirection', projectSeed),
    wireframes: asNullable(pick(raw, 'wireframes')) || storyFallback('wireframes', projectSeed),
    moodboard: asNullable(pick(raw, 'moodboard')) || storyFallback('moodboard', projectSeed),
    typography: asNullable(pick(raw, 'typography')) || storyFallback('typography', projectSeed),
    colourSystem: asNullable(pick(raw, 'colourSystem', 'colour_system', 'color_system')) || storyFallback('colourSystem', projectSeed),
    gridSystem: asNullable(pick(raw, 'gridSystem', 'grid_system')) || storyFallback('gridSystem', projectSeed),
    finalSolution,
    deliverables,
    results: asNullable(pick(raw, 'results')) || storyFallback('results', projectSeed),
    clientFeedback: asNullable(pick(raw, 'clientFeedback', 'client_feedback')),
    comparison: comparisonRaw,
    recommendedServices: asStringArray(pick(raw, 'recommendedServices', 'recommended_services')).length
      ? asStringArray(pick(raw, 'recommendedServices', 'recommended_services'))
      : recommendedServicesFor(category, deliverables),
    mockups: mockupsRaw,
    videos: videosRaw,
    timeline: timelineRaw || {
      discovery: 'Week 1',
      research: 'Week 1–2',
      design: 'Week 2–5',
      revision: 'Week 5–6',
      delivery: 'Week 6–7',
      completion: year,
    },
    servicesUsed: servicesUsed.length ? servicesUsed : deliverables,
    tags,
    clientLogo: asNullable(pick(raw, 'clientLogo', 'client_logo')),
    clientWebsite: asNullable(pick(raw, 'clientWebsite', 'client_website')),
    projectDuration: asNullable(pick(raw, 'projectDuration', 'project_duration')) || '6–8 weeks',
    teamSize: asStringArray(pick(raw, 'teamSize', 'team_size')).length
      ? asStringArray(pick(raw, 'teamSize', 'team_size'))
      : ['Creative Director', 'Designer', 'Strategist'],
    softwareUsed,
    deliverablesCount: Number(pick(raw, 'deliverablesCount', 'deliverables_count') ?? deliverables.length) || deliverables.length,
    views,
    downloadCount,
    likes: Number(pick(raw, 'likes') ?? Math.max(12, Math.round(views * 0.08))) || 24,
    enquiries: Number(pick(raw, 'enquiries') ?? Math.max(3, Math.round(views * 0.01))) || 4,
    status: (asString(pick(raw, 'status'), 'published') as PortfolioProject['status']) || 'published',
    featured: Boolean(pick(raw, 'featured')),
    color,
    emoji: asString(pick(raw, 'emoji'), '🎨'),
    seoTitle: asNullable(pick(raw, 'seoTitle', 'seo_title')),
    seoDescription: asNullable(pick(raw, 'seoDescription', 'seo_description')) || overview,
    seoKeywords: asStringArray(pick(raw, 'seoKeywords', 'seo_keywords')),
    ogImage: asNullable(pick(raw, 'ogImage', 'og_image')),
    canonicalUrl: asNullable(pick(raw, 'canonicalUrl', 'canonical_url')),
    structuredData: (pick(raw, 'structuredData', 'structured_data') as Record<string, unknown> | null) || null,
    liveUrl: asNullable(pick(raw, 'liveUrl', 'live_url')),
    behanceUrl: asNullable(pick(raw, 'behanceUrl', 'behance_url')),
    dribbbleUrl: asNullable(pick(raw, 'dribbbleUrl', 'dribbble_url')),
    youtubeEmbed: asNullable(pick(raw, 'youtubeEmbed', 'youtube_embed')),
    instagramEmbed: asNullable(pick(raw, 'instagramEmbed', 'instagram_embed')),
    figmaEmbed: asNullable(pick(raw, 'figmaEmbed', 'figma_embed')),
    adobeXdEmbed: asNullable(pick(raw, 'adobeXdEmbed', 'adobe_xd_embed')),
    downloads: downloadsRaw,
    awards: awardsRaw,
    relatedProjects: asStringArray(pick(raw, 'relatedProjects', 'related_projects')),
    viewCount: Number(pick(raw, 'viewCount', 'view_count') ?? views) || views,
    createdAt: asString(pick(raw, 'createdAt', 'created_at'), `${year}-01-01T00:00:00Z`),
    updatedAt: asString(pick(raw, 'updatedAt', 'updated_at'), new Date().toISOString()),
  }
}

export function normalizeProjects(list: Array<RawPortfolioProject | PortfolioProject | Record<string, unknown>>): PortfolioProject[] {
  return list.map((item) => normalizeProject(item))
}

function colourName(hex?: string | null): string {
  const value = (hex || '').toLowerCase()
  if (!value) return ''
  if (value.includes('22c55e') || value.includes('10b981') || value.includes('16a34a')) return 'green emerald'
  if (value.includes('7c3aed') || value.includes('8b5cf6') || value.includes('a855f7')) return 'purple violet'
  if (value.includes('3b82f6') || value.includes('06b6d4') || value.includes('0ea5e9')) return 'blue cyan'
  if (value.includes('f59e0b') || value.includes('fbbf24')) return 'amber gold yellow'
  if (value.includes('ef4444') || value.includes('f43f5e') || value.includes('d946ef')) return 'red pink magenta'
  if (value.includes('111') || value.includes('000')) return 'black'
  return 'colour color'
}

function inferComparison(category: string | null, title: string): PortfolioProject['comparison'] {
  const hay = `${category || ''} ${title}`.toLowerCase()
  if (/logo/.test(hay)) {
    return { type: 'logo-evolution', label: `${title} logo evolution` }
  }
  if (/website|web |ui\/ux|app/.test(hay)) {
    return { type: 'website-redesign', label: `${title} website redesign` }
  }
  if (/brand|identity/.test(hay)) {
    return { type: 'brand-refresh', label: `${title} brand refresh` }
  }
  return { type: 'before-after', label: `${title} before and after` }
}

export function matchesShowcaseSearch(project: PortfolioProject, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    project.title,
    project.overview,
    project.challenge,
    project.finalSolution,
    project.clientName,
    project.industry,
    project.category,
    project.service,
    project.color,
    colourName(project.color),
    ...(project.tags || []),
    ...(project.servicesUsed || []),
    ...(project.softwareUsed || []),
    ...(project.deliverables || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}
