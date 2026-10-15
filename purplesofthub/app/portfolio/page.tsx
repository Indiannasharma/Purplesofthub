import PortfolioListing from './_components/PortfolioListing'
import { publicPortfolioCatalog } from '@/lib/portfolio-public.server'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  return <PortfolioListing projects={await publicPortfolioCatalog()} />
}
