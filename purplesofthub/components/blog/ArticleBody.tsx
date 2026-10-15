import { articleSegments } from '@/lib/blog/media-content';
import { renderBlogMarkdown } from '@/lib/blog/rendering';
import RichMediaEmbed from './RichMediaEmbed';
import { Lexer } from 'marked';

/** Text remains server rendered; only activated media needs a client boundary. */
export default function ArticleBody({ content, demoteTitle = false }: { content: string; demoteTitle?: boolean }) {
  const references = Lexer.lex(content).links;
  return <>{articleSegments(content).map((segment, index) => {
    if (segment.type === 'media') return <RichMediaEmbed key={segment.start + ':' + segment.block.sourceUrl} block={segment.block} />;
    let html = renderBlogMarkdown(segment.text, references);
    if (demoteTitle) html = html.replace(/<h1 class="article-h1">/g, '<h2 class="article-h2">').replace(/<\/h1>/g, '</h2>');
    return <div key={index} dangerouslySetInnerHTML={{ __html: html }} />;
  })}</>;
}
