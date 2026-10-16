'use client'
import { useEffect, useRef, useState } from 'react'
import { createPreviewController, optimizedPreviewUrl } from '@/lib/media-preview'
import styles from './card-video.module.css'

export default function CardVideoPreview({ src, title }: { src?: string | null; title: string }) {
  const url = optimizedPreviewUrl(src)
  const video = useRef<HTMLVideoElement>(null)
  const controller = useRef<ReturnType<typeof createPreviewController> | null>(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const element = video.current
    const card = element?.closest('[data-preview-card]')
    if (!element || !card || !url) return
    // The source is assigned only after hover intent or an explicit button press.
    const nativePlay = element.play.bind(element)
    const player = {
      get muted() { return element.muted }, set muted(value: boolean) { element.muted = value },
      get currentTime() { return element.currentTime }, set currentTime(value: number) { element.currentTime = value },
      pause: () => element.pause(),
      play: () => { if (!element.getAttribute('src')) element.src = url; return nativePlay() },
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const instance = createPreviewController(player, {
      hoverAllowed: () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
      reducedMotion: () => motion.matches, playing: value => { setPlaying(value); if (value) setFailed(false) }, failed: () => setFailed(true),
    })
    controller.current = instance
    const enter = (event: Event) => { if ((event as PointerEvent).pointerType !== 'touch') instance.hover() }
    const leave = () => instance.stop()
    const hidden = () => { if (document.hidden) instance.stop() }
    card.addEventListener('pointerenter', enter)
    card.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', hidden)
    motion.addEventListener('change', leave)
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => { if (entries.some(entry => !entry.isIntersecting)) instance.stop() })
    observer?.observe(card)
    return () => {
      instance.dispose(); controller.current = null
      card.removeEventListener('pointerenter', enter); card.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', hidden); motion.removeEventListener('change', leave)
      observer?.disconnect()
    }
  }, [url])
  if (!url) return null
  return <div className={styles.preview} data-playing={playing}>
    <video ref={video} muted loop playsInline preload="none" aria-hidden="true" className={playing ? styles.visible : undefined} onError={() => { controller.current?.stop(); setFailed(true) }}/>
    <button type="button" className={styles.control} aria-label={(playing ? 'Pause' : 'Play') + ' muted preview: ' + title} aria-pressed={playing}
      onClick={event => { event.preventDefault(); event.stopPropagation(); if (playing) controller.current?.stop(); else { setFailed(false); void controller.current?.play() } }}
      onBlur={() => controller.current?.stop()}>{playing ? 'Ⅱ Pause preview' : '▷ Play preview'}</button>
    {failed && <span role="status" className={styles.error}>Preview unavailable. Open the story to explore.</span>}
  </div>
}
