import type { PublicArticle } from './public-feed'

/** Bounded editorial selections; no invented popularity ranking. */
export function storyLayout(posts: PublicArticle[]) {
  const seen = new Set<string>()
  const unique = posts.filter(post => { if (seen.has(post.id)) return false; seen.add(post.id); return true })
  const featured = unique.slice(0, Math.min(3, Math.max(1, unique.length - 1)))
  return { lead: featured[0], secondary: featured.slice(1), latest: unique.slice(featured.length) }
}
export function categoryGroups(posts: PublicArticle[]) {
  const groups = new Map<string, PublicArticle[]>()
  for (const post of posts) if (post.category) {
    const stories = groups.get(post.category) || []
    if (stories.length < 3 && !stories.some(story => story.id === post.id)) stories.push(post)
    groups.set(post.category, stories)
  }
  return [...groups].slice(0, 3).map(([name, stories]) => ({ name, stories }))
}
export function readingMinutes(content: string) {
  const words = content.replace(/https?:\/\/\S+/g, '').replace(/[#*_>~]/g, '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
export function relatedStories<T extends PublicArticle & { tags?: string[] | null }>(posts: T[], current: { id: string; category?: string | null; tags?: string[] | null }) {
  const tags = new Set((current.tags || []).map(tag => tag.toLowerCase()))
  const score = (post: T) => Number(Boolean(current.category && post.category === current.category)) * 10 + (post.tags || []).filter(tag => tags.has(tag.toLowerCase())).length
  const seen = new Set([current.id])
  return posts.filter(post => { if (seen.has(post.id)) return false; seen.add(post.id); return true }).sort((a,b) => score(b)-score(a)).slice(0,3)
}

/** Suppress only an exact duplicate opening title; stored Markdown is never changed. */
export function articleMarkdown(content:string,title:string) {
 const heading=content.match(/^\s*#\s+([^\r\n]+)\r?\n(?:\r?\n)?/)
 return heading&&heading[1].trim()===title.trim()?content.slice(heading[0].length):content
}
