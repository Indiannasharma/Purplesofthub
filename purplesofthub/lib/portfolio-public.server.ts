import 'server-only'
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getPublishedProjects } from '@/lib/portfolio.server'
import { normalizeProjects } from '@/lib/portfolio-normalize'
import { PORTFOLIO_PROJECTS } from '@/app/portfolio/_data/portfolio'
import type { PortfolioProject } from '@/types/portfolio'

/**
 * Only checks which already-public bundled slugs have a database replacement.
 * The privileged read never selects or returns private project content, IDs or status.
 * An unpublished replacement must not resurrect its old bundled case study.
 * Fail closed if this check cannot complete. Never import this module in a client.
 */
export const allowedPortfolioFallback = cache(async (): Promise<PortfolioProject[]> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []
  try {
    const db = createClient(url, key, {
      db: { schema: 'public' },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const seeds = PORTFOLIO_PROJECTS.filter(project => project.status === 'published')
    if (!seeds.length) return []
    const { data, error } = await db.from('portfolio_projects').select('slug')
      .in('slug', seeds.map(project => project.slug)).limit(seeds.length)
      .abortSignal(AbortSignal.timeout(8000))
    if (error || !data) return []
    const replaced = new Set(data.map(row => row.slug as string))
    return seeds.filter(project => !replaced.has(project.slug))
  } catch {
    return []
  }
})

export const publicPortfolioCatalog = cache(async (): Promise<PortfolioProject[]> => {
  try {
    const projects = normalizeProjects(await getPublishedProjects())
      .filter(project => project.status === 'published')
    if (projects.length) return projects
  } catch {
    // A safe bundled fallback is still possible if the replacement check succeeds.
  }
  return allowedPortfolioFallback()
})
