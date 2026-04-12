import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )

    // Fetch published blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content, featured_image, author_name, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.purplesofthub.com'

    // Generate RSS XML
    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PurpleSoftHub Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Insights on web development, digital marketing, music and tech from Africa's Digital Innovation Studio.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${
      (posts || [])
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
      <description>${escapeXml(post.excerpt || '')}</description>
      <content:encoded><![CDATA[
${post.content || ''}
${post.featured_image ? `<br /><img src="${post.featured_image}" alt="${escapeXml(post.title)}" />` : ''}
      ]]></content:encoded>
      ${post.featured_image ? `<image><url>${post.featured_image}</url><title>${escapeXml(post.title)}</title><link>${postUrl}</link></image>` : ''}
    </item>
          `
        })
        .join('')
    }
  </channel>
</rss>`

    return new Response(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Failed to generate RSS feed:', error)
    return new Response('Failed to generate feed', { status: 500 })
  }
}

// Helper function to escape XML special characters
function escapeXml(str: string): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
