import HomePortfolio from '@/components/HomePortfolio'
import { publicPortfolioCatalog } from '@/lib/portfolio-public.server'
import { existsSync } from 'node:fs'
import path from 'node:path'

function availableImage(src: string | null): boolean {
  if (!src) return false
  if (!src.startsWith('/')) return true
  if (src.startsWith('//') || src.includes('\\')) return false
  const publicRoot = path.resolve(process.cwd(), 'public')
  const file = path.resolve(publicRoot, '.' + src.split(/[?#]/)[0])
  return file.startsWith(publicRoot + path.sep) && existsSync(file)
}

export default async function HomePortfolioSection() {
  const projects = await publicPortfolioCatalog()
  return <HomePortfolio projects={projects.map(project => ({ ...project,
    coverImage: availableImage(project.coverImage) ? project.coverImage : null,
    featuredThumbnail: availableImage(project.featuredThumbnail) ? project.featuredThumbnail : null,
    heroBanner: availableImage(project.heroBanner) ? project.heroBanner : null,
    gallery: project.gallery.filter(src => availableImage(src)),
  }))}/>
}
