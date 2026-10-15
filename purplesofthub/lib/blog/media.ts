export type MediaProvider = 'youtube' | 'tiktok' | 'facebook' | 'x' | 'threads' | 'reddit' | 'spotify' | 'audiomack' | 'apple-music';
export type MediaVariant = 'wide' | 'vertical' | 'audio' | 'post';
export type MediaBlock = { version: 1; provider: MediaProvider; sourceUrl: string; contentId: string; caption: string; variant: MediaVariant };
export type MediaSpec = MediaBlock & { label: string; frameUrl?: string; script?: string };
export const MEDIA_PROVIDERS: Record<MediaProvider, { label: string; hosts: string[] }> = {
  youtube: { label: 'YouTube', hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'] },
  tiktok: { label: 'TikTok', hosts: ['tiktok.com', 'www.tiktok.com'] },
  facebook: { label: 'Facebook', hosts: ['facebook.com', 'www.facebook.com', 'm.facebook.com'] },
  x: { label: 'X', hosts: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'] },
  threads: { label: 'Threads', hosts: ['threads.net', 'www.threads.net', 'threads.com', 'www.threads.com'] },
  reddit: { label: 'Reddit', hosts: ['reddit.com', 'www.reddit.com', 'old.reddit.com'] },
  spotify: { label: 'Spotify', hosts: ['open.spotify.com'] },
  audiomack: { label: 'Audiomack', hosts: ['audiomack.com', 'www.audiomack.com'] },
  'apple-music': { label: 'Apple Music', hosts: ['music.apple.com'] },
};

/** No remote lookup, redirects, iframe snippets or user-provided embed endpoints. */
export function recognizeMedia(input: unknown, caption = ''): MediaSpec | null {
  if (typeof input !== 'string' || input.length > 2048 || /[\\\u0000-\u0020]|%2f|%5c|%00/i.test(input.trim())) return null;
  let url: URL;
  try { url = new URL(input.trim()); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
  const entry = (Object.entries(MEDIA_PROVIDERS) as [MediaProvider, {label:string;hosts:string[]}][]).find(([, p]) => p.hosts.includes(url.hostname));
  if (!entry) return null;
  const [provider, { label }] = entry;
  const path = url.pathname.replace(/\/$/, '');
  let sourceUrl = '', contentId = '', frameUrl: string | undefined, script: string | undefined;
  let variant: MediaVariant = 'post';
  let match: RegExpMatchArray | null;
  switch (provider) {
    case 'youtube': {
      contentId = url.hostname === 'youtu.be' ? path.slice(1) : path === '/watch' ? url.searchParams.get('v') || '' : path.match(/^\/(?:shorts|embed)\/([\w-]{11})$/)?.[1] || '';
      if (!/^[\w-]{11}$/.test(contentId)) return null;
      variant = path.startsWith('/shorts/') ? 'vertical' : 'wide';
      sourceUrl = variant === 'vertical' ? 'https://www.youtube.com/shorts/' + contentId : 'https://www.youtube.com/watch?v=' + contentId;
      frameUrl = 'https://www.youtube-nocookie.com/embed/' + contentId;
      break;
    }
    case 'tiktok':
      match = path.match(/^\/@([\w.-]{1,40})\/video\/(\d{10,25})$/); if (!match) return null;
      contentId = match[2]; variant = 'vertical'; sourceUrl = 'https://www.tiktok.com' + path;
      frameUrl = 'https://www.tiktok.com/player/v1/' + contentId + '?autoplay=0'; break;
    case 'facebook': {
      match = path.match(/^\/(?:[\w.-]+\/(videos|posts)\/|reel\/)(\d{5,30}|pfbid[A-Za-z0-9]{10,200})$/);
      if (match?.[2].startsWith('pfbid') && match[1] !== 'posts') return null;
      const watch = path === '/watch' && /^\d{5,30}$/.test(url.searchParams.get('v') || '') ? url.searchParams.get('v') : null;
      if (!match && !watch) return null;
      contentId = watch || match![2];
      const video = Boolean(watch || match?.[1] === 'videos' || path.startsWith('/reel/'));
      variant = path.startsWith('/reel/') ? 'vertical' : video ? 'wide' : 'post';
      sourceUrl = watch ? 'https://www.facebook.com/watch/?v=' + watch : 'https://www.facebook.com' + path;
      frameUrl = 'https://www.facebook.com/plugins/' + (video ? 'video' : 'post') + '.php?' + new URLSearchParams({ href: sourceUrl, width: '500', show_text: 'true' }); break;
    }
    case 'x':
      match = path.match(/^\/([\w]{1,30})\/status\/(\d{5,25})$/); if (!match) return null;
      contentId = match[2]; sourceUrl = 'https://x.com/' + match[1] + '/status/' + contentId;
      script = 'https://platform.twitter.com/widgets.js'; break;
    case 'threads':
      match = path.match(/^\/@([\w.]{1,50})\/post\/([\w-]{5,40})$/); if (!match) return null;
      contentId = match[2]; sourceUrl = 'https://www.threads.net' + path;
      script = 'https://www.threads.net/embed.js'; break;
    case 'reddit':
      match = path.match(/^\/r\/([\w]{1,50})\/comments\/([a-z0-9]{3,15})(?:\/([\w-]{1,200}))?$/i); if (!match) return null;
      contentId = match[2]; sourceUrl = 'https://www.reddit.com' + path + '/';
      script = 'https://embed.reddit.com/widgets.js'; break;
    case 'spotify':
      match = path.match(/^\/(?:intl-[a-z]{2}\/)?(track|album|playlist|artist)\/([A-Za-z0-9]{22})$/); if (!match) return null;
      contentId = match[2]; variant = 'audio'; sourceUrl = 'https://open.spotify.com/' + match[1] + '/' + contentId;
      frameUrl = 'https://open.spotify.com/embed/' + match[1] + '/' + contentId; break;
    case 'audiomack':
      match = path.match(/^\/([\w-]{1,100})\/(song|album|playlist)\/([\w-]{1,200})$/); if (!match) return null;
      contentId = match[1] + '/' + match[2] + '/' + match[3]; variant = 'audio'; sourceUrl = 'https://audiomack.com/' + contentId;
      frameUrl = 'https://audiomack.com/embed/' + contentId; break;
    case 'apple-music': {
      match = path.match(/^\/([a-z]{2})\/(album|song|playlist|artist)\/([^/]{1,600})\/([\w.-]{1,100})$/i); if (!match) return null;
      if (!/^(?:\d{1,25}|pl\.[\w-]+)$/.test(match[4])) return null;
      const track = url.searchParams.get('i');
      if (track && !/^\d{1,25}$/.test(track)) return null;
      contentId = track || match[4]; variant = 'audio'; sourceUrl = 'https://music.apple.com' + path + (track ? '?i=' + track : '');
      // Apple artist pages are valid originals, but not playable embedded media.
      if (match[2] !== 'artist') frameUrl = sourceUrl.replace('https://music.apple.com', 'https://embed.music.apple.com'); break;
    }
  }
  return { version: 1, provider, label, sourceUrl, contentId, variant, caption: caption.trim().slice(0, 400), ...(frameUrl ? { frameUrl } : {}), ...(script ? { script } : {}) };
}

export function validateMediaBlock(input: unknown): MediaBlock | null {
  if (!input || typeof input !== 'object') return null;
  const item = input as Record<string, unknown>;
  if (item.version !== 1 || typeof item.caption !== 'string' || item.caption.length > 400) return null;
  const spec = recognizeMedia(item.sourceUrl, item.caption);
  if (!spec || item.provider !== spec.provider || item.contentId !== spec.contentId || item.variant !== spec.variant) return null;
  return { version: 1, provider: spec.provider, sourceUrl: spec.sourceUrl, contentId: spec.contentId, caption: spec.caption, variant: spec.variant };
}

export function serializeMedia(spec: MediaBlock): string {
  const block = validateMediaBlock(spec);
  if (!block) throw new Error('Unsupported media URL or block.');
  return '\n\n```psh-media\n' + JSON.stringify(block) + '\n```\n\n';
}

function escape(value: string) { return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }
/** Generated only from a revalidated allowlisted spec; sandboxed, isolated from the app. */
export function mediaDocument(block: MediaBlock): string | undefined {
  const spec = recognizeMedia(block.sourceUrl);
  if (!spec?.script) return undefined;
  const href = escape(spec.sourceUrl);
  const markup = spec.provider === 'x' ? `<blockquote class="twitter-tweet"><a href="${href}">View post on X</a></blockquote>` : spec.provider === 'threads' ? `<blockquote class="text-post-media" data-text-post-permalink="${href}"><a href="${href}">View post on Threads</a></blockquote>` : `<blockquote class="reddit-embed-bq"><a href="${href}">View post on Reddit</a></blockquote>`;
  return '<!doctype html><html><head><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:0;background:transparent}blockquote{margin:0}iframe{max-width:100%}</style></head><body>' + markup + '<script async src="' + spec.script + '"></script></body></html>';
}
