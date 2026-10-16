import { notFound } from 'next/navigation'
import InsightsArchive from '@/components/blog/InsightsArchive'
import { publicBlogCategories } from '@/lib/blog/public-feed'
import { archiveMetadata } from '@/lib/blog/category-metadata'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{slug: string}>; searchParams: Promise<Record<string, string | string[] | undefined>> }
export async function generateMetadata({params}: Props) {
  const {slug} = await params
  const category = (await publicBlogCategories()).find(item => item.slug === slug)
  if (!category) notFound()
  return archiveMetadata(category)
}
export default async function CategoryPage({params,searchParams}: Props) {
  return <InsightsArchive searchParams={searchParams} categorySlug={(await params).slug}/>
}
