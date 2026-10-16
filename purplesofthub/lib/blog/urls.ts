export const PUBLICATION_ORIGIN = 'https://www.purplesofthub.com'
export const PUBLICATION_PATH = '/insights'
export const articlePath = (slug: string) => PUBLICATION_PATH + '/' + encodeURIComponent(slug)
export const categoryPath = (slug: string) => PUBLICATION_PATH + '/category/' + encodeURIComponent(slug)
export function archivePath({ category, search, page }: { category?: string; search?: string; page?: number } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (page && page > 1) params.set('page', String(page))
  return (category ? categoryPath(category) : PUBLICATION_PATH) + (params.size ? '?' + params : '')
}
