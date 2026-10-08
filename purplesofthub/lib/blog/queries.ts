export const EDITORIAL_PAGE_SIZE = 12
export type EditorialQuery = { page: number; search: string; status: 'all' | 'draft' | 'published'; category: string; author: string; sort: 'newest' | 'oldest' | 'updated' }
export function searchTerm(value: unknown): string {
  return typeof value === 'string' ? value.replace(/[,%*()"\\\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100) : ''
}
export function editorialQuery(values: Record<string, unknown>): EditorialQuery {
  const candidate = typeof values.page === 'string' ? Number(values.page) : 1
  return { page: Number.isInteger(candidate) && candidate > 0 ? Math.min(candidate, 100000) : 1,
    search: searchTerm(values.q), status: values.status === 'draft' || values.status === 'published' ? values.status : 'all',
    category: typeof values.category === 'string' ? values.category.trim().slice(0, 100) : '',
    author: searchTerm(values.author), sort: values.sort === 'oldest' || values.sort === 'updated' ? values.sort : 'newest' }
}
export function editorialDate(value: string | null | undefined): string {
  if (!value || !Number.isFinite(new Date(value).getTime())) return 'Not published'
  return new Intl.DateTimeFormat('en-NG', { day:'numeric',month:'short',year:'numeric',timeZone:'Africa/Lagos' }).format(new Date(value))
}

export function publishedParams(options: { limit?:number;page?:number;search?:string;category?:string } = {}): URLSearchParams {
  const limit=Math.min(12,Math.max(1,options.limit||3));const page=Math.max(1,Math.floor(options.page||1));
  const params=new URLSearchParams({select:'id,title,slug,excerpt,featured_image,featured_image_alt,category,author_name,published_at',status:'eq.published',order:'published_at.desc.nullslast,created_at.desc,id.desc',limit:String(limit),offset:String((page-1)*limit)});
  const term=searchTerm(options.search);if(term)params.set('or','(title.ilike.%'+term+'%,excerpt.ilike.%'+term+'%)');
  if(options.category)params.set('category','eq.'+options.category);return params
}

/** PostgREST reports a valid total even when the requested offset exceeds the dataset. */
export function exhaustedPublishedPage(status:number,range:string|null):number|null {
  if(status!==416||!range)return null
  const match=range.match(/^\*\/(\d+)$/)
  if(!match)return null
  const total=Number(match[1])
  return Number.isSafeInteger(total)?total:null
}
