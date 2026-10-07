type StructuredPost = { title: string; slug: string; seo_description?: string | null; excerpt?: string | null;
  featured_image?: string | null; published_at?: string | null; created_at?: string | null; updated_at?: string | null;
  author_name?: string | null; author_type?: string | null; category?: string | null; tags?: string[] | null; source_urls?: string[] | null }
export function blogPosting(post: StructuredPost) {
  const site = 'https://www.purplesofthub.com'
  const url = site + '/blog/' + post.slug
  const author = post.author_name || 'PurpleSoftHub'
  return { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
    description: post.seo_description || post.excerpt || undefined, url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, image: post.featured_image || undefined,
    datePublished: post.published_at || undefined, dateModified: post.updated_at || undefined,
    author: { '@type': author === 'PurpleSoftHub' ? 'Organization' : post.author_type === 'Organization' ? 'Organization' : 'Person', name: author },
    publisher: { '@type': 'Organization', name: 'PurpleSoftHub', url: site },
    articleSection: post.category || undefined, keywords: post.tags?.length ? post.tags.join(', ') : undefined,
    citation: post.source_urls?.length ? post.source_urls : undefined }
}
export function serializeBlogPosting(value: ReturnType<typeof blogPosting>) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
