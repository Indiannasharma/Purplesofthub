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

    // Fetch all blog posts (not filtered by status)
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching posts:', error)
      console.log('Database error details:', error.message)
    }

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
    <atom:link href="${baseUrl}/blog/feed" rel="self" type="application/rss+xml" />
    ${
      (posts || [])
        .map((post: any) => {
          if (!post.slug || !post.title) return ''
          const postUrl = `${baseUrl}/blog/${post.slug}`
          const pubDate = post.published_at
            ? new Date(post.published_at).toUTCString()
            : new Date(post.created_at).toUTCString()

          return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.author_name || 'PurpleSoftHub')}</author>
      <description>${escapeXml(post.excerpt || post.content?.substring(0, 200) || '')}</description>
      <content:encoded><![CDATA[
${post.content ? sanitizeHtml(post.content) : ''}
${post.featured_image ? `<br /><img src="${post.featured_image}" alt="${escapeXml(post.title)}" style="max-width: 100%; height: auto;" />` : ''}
      ]]></content:encoded>
      ${post.featured_image ? `<image><url>${post.featured_image}</url><title>${escapeXml(post.title)}</title><link>${postUrl}</link></image>` : ''}
    </item>
          `
        })
        .filter(Boolean)
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
    // Return empty but valid RSS on error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.purplesofthub.com'
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PurpleSoftHub Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Insights on web development, digital marketing, music and tech from Africa's Digital Innovation Studio.</description>
  </channel>
</rss>`,
      {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
        },
      }
    )
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

// Sanitize HTML content for RSS
function sanitizeHtml(html: string): string {
  if (!html) return ''
  // Remove script tags and content
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}
