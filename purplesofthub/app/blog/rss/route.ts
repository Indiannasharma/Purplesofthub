import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content, featured_image, author_name, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('RSS feed error:', error.message)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.purplesofthub.com'
    const items = (posts || [])
      .filter((p: any) => p.slug && p.title)
      .map((post: any) => {
        const postUrl = `${baseUrl}/blog/${post.slug}`
        const pubDate = new Date(post.published_at || post.created_at).toUTCString()
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.author_name || 'PurpleSoftHub')}</author>
      <description>${escapeXml(post.excerpt || post.content?.substring(0, 200) || '')}</description>
      ${post.featured_image ? `<enclosure url="${post.featured_image}" type="image/jpeg" />` : ''}
    </item>`
      })
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PurpleSoftHub Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Insights on web development, digital marketing, music and tech from Africa's Digital Innovation Studio.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('RSS route failed:', err)
    return new Response('Feed unavailable', { status: 500 })
  }
}

function escapeXml(str: string): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
