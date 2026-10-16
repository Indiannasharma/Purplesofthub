import type { Metadata } from 'next'

const SITE_URL = 'https://www.purplesofthub.com'

// Category records remain authoritative in blog_categories; this only supplies presentation.
export const CATEGORY_PRESENTATION = {
  gaming: {
    name: 'Gaming',
    title: 'Gaming News, Reviews & Updates | PurpleSoftHub Insights',
    description: 'Explore gaming news, game trailers, release dates, reviews, consoles, and gaming technology on PurpleSoftHub Insights.',
    emptyTitle: 'Gaming stories are on the way.',
    emptyDescription: 'News, trailers, reviews and gaming technology. Explore our latest insights while we prepare the first story.',
  },
  'how-to': {
    name: 'How-To & Tutorials',
    title: 'How-To Guides & Tutorials | PurpleSoftHub Insights',
    description: 'Explore step-by-step tutorials covering technology, AI tools, websites, social media, digital marketing, and troubleshooting.',
    emptyTitle: 'Your next guide is on the way.',
    emptyDescription: 'Practical, step-by-step help for your digital life. Explore our latest insights while we prepare the first tutorial.',
  },
} as const

export function categoryPresentation(category?: { name: string; slug: string }) {
  if (!category || !Object.hasOwn(CATEGORY_PRESENTATION, category.slug)) return undefined
  const presentation = CATEGORY_PRESENTATION[category.slug as keyof typeof CATEGORY_PRESENTATION]
  return presentation.name === category.name ? presentation : undefined
}

export function archiveMetadata(category?: { name: string; slug: string }): Metadata {
  const presentation = categoryPresentation(category)
  const canonical = SITE_URL + '/insights' + (category ? '/category/' + encodeURIComponent(category.slug) : '')
  const title = category ? presentation?.title || category.name + ' | PurpleSoftHub Insights' : 'PurpleSoftHub Insights | Technology, Business & Creativity'
  const description = category ? presentation?.description || 'Explore '+category.name+' articles and perspectives from PurpleSoftHub Insights.' : 'Insights on technology, web development, digital marketing and digital growth from PurpleSoftHub.'
  const image = SITE_URL + '/og-image.png'
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'website', siteName: 'PurpleSoftHub Insights', title,
      description, url: canonical, images: [image] },
    twitter: { card: 'summary_large_image', title,
      description, images: [image] },
  }
}
