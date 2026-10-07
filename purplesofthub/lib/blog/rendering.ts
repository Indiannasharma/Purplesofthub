import { Marked, Renderer } from 'marked'
const SITE_URL = 'https://www.purplesofthub.com'
function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
function safeLink(href: string, image = false) {
  try {
    const url = new URL(href, SITE_URL)
    if (url.username || url.password || !['https:', ...(image ? [] : ['http:', 'mailto:'])].includes(url.protocol)) return null
    return url.href
  } catch { return null }
}
const renderer = new Renderer()
renderer.html = ({ text }) => escapeHtml(text)
renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens)
  const url = safeLink(href)
  if (!url) return text
  return '<a class="article-link" href="' + escapeHtml(url) + '"' + (title ? ' title="' + escapeHtml(title) + '"' : '')
    + ' target="_blank" rel="noopener noreferrer">' + text + '</a>'
}
renderer.image = ({ href, text, title }) => {
  const url = safeLink(href, true)
  if (!url) return escapeHtml(text)
  return '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(text) + '"' + (title ? ' title="' + escapeHtml(title) + '"' : '') + ' loading="lazy" />'
}
const markdown = new Marked({ renderer, gfm: true, breaks: false, async: false })
/** Markdown only. Raw HTML is escaped and non-web link protocols are rejected. */
export function renderBlogMarkdown(content: string): string {
  return (markdown.parse(content, { async: false }) as string)
    .replace(/<h([1-6])>/g, '<h$1 class="article-h$1">')
    .replace(/<p>/g, '<p class="article-p">').replace(/<ul>/g, '<ul class="article-ul">')
    .replace(/<ol(?: start="(\d+)")?>/g, '<ol class="article-ul" start="$1">')
    .replace(/<li>/g, '<li class="article-li">').replace(/<blockquote>/g, '<blockquote class="article-quote">')
    .replace(/<pre>/g, '<pre class="code-block">').replace(/<hr>/g, '<hr class="article-hr">')
}
