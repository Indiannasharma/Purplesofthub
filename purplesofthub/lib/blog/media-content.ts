import { Lexer } from 'marked';
import { validateMediaBlock, serializeMedia, type MediaBlock } from './media';
import { previewVideoUrl } from '../media-preview';
export type ArticleSegment = { type: 'markdown'; text: string } | { type: 'media'; block: MediaBlock; start: number; end: number };
export function articlePreviewVideo(content: string): string | null {
  const media = articleSegments(content).find(segment => segment.type === 'media' && segment.block.provider === 'cloudinary');
  return media?.type === 'media' ? previewVideoUrl(media.block.sourceUrl) : null;
}

/** Only top-level fenced structured blocks become media; nested/code examples remain literal. */
export function articleSegments(content: string): ArticleSegment[] {
  const segments: ArticleSegment[] = [];
  const normalized = content.replace(/\r\n?/g, '\n');
  const positions: number[] | undefined = content.includes('\r') ? [] : undefined;
  if (positions) {
    for (let i = 0; i < content.length; i++) { positions.push(i); if (content[i] === '\r' && content[i + 1] === '\n') i++; }
    positions.push(content.length);
  }
  let pending = '', offset = 0, normalizedOffset = 0;
  for (const token of Lexer.lex(normalized)) {
    const normalizedStart = normalized.indexOf(token.raw, normalizedOffset);
    if (normalizedStart < 0) continue;
    const start = positions ? positions[normalizedStart] : normalizedStart;
    const normalizedEnd = normalizedStart + token.raw.length;
    const end = positions ? positions[normalizedEnd] : normalizedEnd;
    pending += content.slice(offset, start);
    let block: MediaBlock | null = null;
    if (token.type === 'code' && token.lang === 'psh-media') {
      try { block = validateMediaBlock(JSON.parse(token.text)); } catch { /* Render invalid blocks as escaped code. */ }
    }
    if (block) {
      if (pending) segments.push({ type: 'markdown', text: pending });
      pending = ''; segments.push({ type: 'media', block, start, end });
    } else pending += content.slice(start, end);
    offset = end; normalizedOffset = normalizedEnd;
  }
  pending += content.slice(offset);
  if (pending) segments.push({ type: 'markdown', text: pending });
  // Avoid altering even whitespace or reference definitions in existing articles without embeds.
  return segments.some(s => s.type === 'media') ? segments : [{ type: 'markdown', text: content }];
}

export function editMedia(content: string, index: number, action: 'replace' | 'remove' | 'up' | 'down', replacement?: MediaBlock): string {
  const blocks = articleSegments(content).filter(s => s.type === 'media');
  const current = blocks[index];
  if (!current) return content;
  if (action === 'replace' && replacement) return content.slice(0, current.start) + serializeMedia(replacement).trim() + '\n\n' + content.slice(current.end);
  if (action === 'remove') return content.slice(0, current.start) + content.slice(current.end);
  const other = blocks[index + (action === 'up' ? -1 : 1)];
  if (!other) return content;
  const [a, b] = current.start < other.start ? [current, other] : [other, current];
  return content.slice(0, a.start) + content.slice(b.start, b.end) + content.slice(a.end, b.start) + content.slice(a.start, a.end) + content.slice(b.end);
}
