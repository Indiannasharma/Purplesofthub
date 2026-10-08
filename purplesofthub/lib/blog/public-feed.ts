import 'server-only'
import { publishedParams, exhaustedPublishedPage } from './queries'
export type PublicArticle = { id: string; title: string; slug: string; excerpt: string; featured_image: string | null;
  featured_image_alt: string | null; category: string | null; author_name: string | null; published_at: string | null }
export const PUBLIC_ARTICLE_FIELDS = 'id,title,slug,excerpt,featured_image,featured_image_alt,category,author_name,published_at'
export async function publishedArticles(options: { limit?: number; page?: number; search?: string; category?: string } = {}) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const limit = Math.min(12, Math.max(1, options.limit || 3))
  const page = Math.max(1, options.page || 1)
  if (!base || !key) return { ok:false as const, posts:[] as PublicArticle[], total:0 }
  try {
    const params = publishedParams({ ...options, limit, page })
    const response = await fetch(base + '/rest/v1/blog_posts?' + params, { cache:'no-store', headers:{ apikey:key, Authorization:'Bearer ' + key, Prefer:'count=exact' }, signal:AbortSignal.timeout(10000) })
    const exhaustedTotal=exhaustedPublishedPage(response.status,response.headers.get('content-range'))
    if(exhaustedTotal!==null)return {ok:true as const,posts:[] as PublicArticle[],total:exhaustedTotal}
    if (!response.ok) throw new Error('Feed query failed')
    const posts = await response.json()
    const total = Number(response.headers.get('content-range')?.split('/')[1])
    if (!Array.isArray(posts) || !Number.isFinite(total)) throw new Error('Invalid feed response')
    return { ok:true as const, posts:posts as PublicArticle[], total }
  } catch { console.error('[blog feed] Published article query is unavailable.'); return { ok:false as const, posts:[] as PublicArticle[], total:0 } }
}
export async function publicBlogCategories(): Promise<{ name:string;slug:string }[]> {
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!base || !key) return []
  try { const response=await fetch(base+'/rest/v1/blog_categories?select=name,slug&order=name.asc&limit=100',{cache:'no-store',headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)}); if(!response.ok) return []; return await response.json() } catch { return [] }
}
