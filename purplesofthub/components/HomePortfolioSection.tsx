import HomePortfolio from '@/components/HomePortfolio'
import { publicPortfolioCatalog } from '@/lib/portfolio-public.server'

export default async function HomePortfolioSection() {
  return <HomePortfolio projects={await publicPortfolioCatalog()} />
}
