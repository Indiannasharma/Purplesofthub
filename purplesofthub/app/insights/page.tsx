import InsightsArchive, { archivePageMetadata } from '@/components/blog/InsightsArchive'
export const dynamic = 'force-dynamic'
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }
export async function generateMetadata({ searchParams }: Props) { return archivePageMetadata(searchParams) }
export default function InsightsPage({ searchParams }: Props) { return <InsightsArchive searchParams={searchParams}/> }
