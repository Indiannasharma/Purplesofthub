'use client';
import { useEffect, useRef, useState } from 'react';
import { mediaDocument, recognizeMedia, validateMediaBlock, type MediaBlock } from '@/lib/blog/media';
import { tiktokPlayerEvent } from '@/lib/blog/player-events';
import styles from './media.module.css';

export default function RichMediaEmbed({ block }: { block: MediaBlock }) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'loaded' | 'ready' | 'playing' | 'unavailable'>('idle');
  const [expanded, setExpanded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const loadButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const validated = validateMediaBlock(block);
  const spec = validated && recognizeMedia(validated.sourceUrl, validated.caption);
  const active = ['loading', 'loaded', 'ready', 'playing'].includes(phase);
  const provider = spec ? spec.provider : null;
  const source = spec ? spec.sourceUrl : null;
  useEffect(() => {
    if (phase === 'loading') frame.current?.focus();
    else if (restoreFocus.current) { restoreFocus.current = false; loadButton.current?.focus(); }
  }, [phase]);
  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = window.setTimeout(() => setPhase('unavailable'), 20000);
    return () => window.clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    if (!active || provider !== 'youtube' || !frame.current) return;
    let cancelled = false;
    let player: { destroy(): void } | undefined;
    const ownedFrame = frame.current;
    void import('@/lib/blog/youtube-client').then(module => module.youtubeApi()).then(api => {
      if (cancelled || !frame.current) return;
      player = new api.Player(frame.current, {events: {
        onReady: () => { if (!cancelled) setPhase('ready'); },
        onError: () => { if (!cancelled) setPhase('unavailable'); },
        onStateChange: event => { if (!cancelled) setPhase(event.data === 1 ? 'playing' : 'ready'); },
      }});
    }).catch(() => { if (!cancelled) setPhase('unavailable'); });
    return () => {
      cancelled = true;
      // React removes its iframe first; SDK cleanup must not remove a React-owned node mid-commit.
      queueMicrotask(() => { if (player && !ownedFrame.isConnected) { try { player.destroy(); } catch { /* The provider may already have removed a failed frame. */ } } });
    };
  }, [active, provider, source]);
  useEffect(() => {
    if (!active || provider !== 'tiktok') return;
    const receive = (event: MessageEvent) => {
      const signal = tiktokPlayerEvent(event.origin, event.source === frame.current?.contentWindow, event.data);
      if (signal) setPhase(signal === 'error' ? 'unavailable' : signal);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [active, provider]);
  if (!spec) return <p>Media unavailable. The rest of this article is unchanged.</p>;
  const document = mediaDocument(spec);
  const native = spec.provider === 'cloudinary';
  const supported = Boolean(native || spec.frameUrl || document);
  const compactAudio = spec.variant === 'audio' && (/\/(?:track|song)\//.test(spec.sourceUrl) || spec.sourceUrl.includes('?i='));
  const playerUrl = spec.provider === 'youtube' ? spec.frameUrl + '?enablejsapi=1&playsinline=1' + (typeof window !== 'undefined' ? '&origin=' + encodeURIComponent(window.location.origin) : '') : spec.frameUrl;
  const knowsReadiness = native || provider === 'youtube' || provider === 'tiktok';
  return <figure className={styles.media} data-media-provider={spec.provider}>
    <div className={styles.source}><span>{spec.label}</span><span>{spec.variant === 'audio' ? 'Listen' : spec.variant === 'post' ? 'Social perspective' : 'Watch'}</span></div>
    <div className={styles.stage + ' ' + styles[spec.variant] + (compactAudio ? ' ' + styles.compactAudio : '') + (expanded ? ' ' + styles.expanded : '')}>
      {active ? <>
        {phase === 'loading' && <p className={styles.loading} role="status">Connecting to {spec.label}…</p>}
        {native ? <video src={spec.sourceUrl} controls playsInline preload="metadata" onCanPlay={() => setPhase('ready')} onPlaying={() => setPhase('playing')} onError={() => setPhase('unavailable')}/> :
          <iframe ref={frame} title={spec.label + ' embedded media'} src={playerUrl} srcDoc={document} loading="lazy" referrerPolicy={provider === 'youtube' ? 'strict-origin-when-cross-origin' : 'no-referrer'} sandbox={'allow-scripts allow-popups allow-popups-to-escape-sandbox' + (document ? '' : ' allow-same-origin')} allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen onLoad={() => { if (!knowsReadiness) setPhase('loaded'); }} onError={() => setPhase('unavailable')} />}
      </> : <div className={styles.placeholder}>
        <span className={styles.symbol} aria-hidden="true">{spec.variant === 'audio' ? '♫' : spec.variant === 'post' ? '↗' : '▷'}</span>
        <strong>{phase === 'unavailable' ? 'This media could not be loaded' : spec.label + (spec.variant === 'audio' ? ' player' : ' media')}</strong>
        <p>{!supported ? 'This link does not offer a supported player. Open the original to explore it.' : phase === 'unavailable' ? 'It may be private, restricted or temporarily unavailable. You can still open the original.' : 'Loading this media connects to ' + spec.label + ', which may use cookies and process data under its own privacy policy. Your analytics choice does not load this player.'}</p>
        {supported && <button ref={loadButton} type="button" onClick={() => setPhase('loading')}>{phase === 'unavailable' ? 'Try again' : 'Load ' + spec.label + ' media'}</button>}
      </div>}
    </div>
    <div className={styles.links}><a href={spec.sourceUrl} target="_blank" rel="noopener noreferrer">Open original on {spec.label} ↗</a>{active && <button type="button" onClick={() => { restoreFocus.current = true; setPhase('idle'); }}>Close media</button>}{active && spec.variant === 'post' && <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Reduce post height' : 'Expand post'}</button>}</div>
    {active && <p className={styles.note} role="status">{phase === 'playing' ? 'Playback started.' : phase === 'ready' ? 'Player ready. Use its controls to play.' : phase === 'loaded' ? 'Frame loaded; content availability is not confirmed. Scroll within long posts or expand the view.' : 'Waiting for the player.'} If the provider cannot display this content, use Open original. Availability and sign-in requirements are controlled by {spec.label}.</p>}
    {spec.caption && <figcaption>{spec.caption}</figcaption>}
  </figure>;
}
