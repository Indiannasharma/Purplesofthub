/** Only native Cloudinary upload assets are eligible; provider pages are never video sources. */
export function previewVideoUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048 || /[\\\s]|%2f|%5c/i.test(value)) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || url.username || url.password || url.port || url.search || url.hash) return null
    if (!/^\/[\w-]+\/video\/upload\/[\w,.:/!-]+\.(mp4|webm)$/.test(url.pathname) || url.pathname.includes('..')) return null
    return url.href
  } catch { return null }
}

/** Bound card delivery to six seconds and 720px; the full article keeps the approved original. */
export function optimizedPreviewUrl(value: unknown): string | null {
  return previewVideoUrl(value)?.replace('/video/upload/', '/video/upload/so_0,du_6,w_720,c_limit,q_auto/') || null
}

export function portfolioPreview(videos?: { preview?: string; promo?: string; walkthrough?: string; animation?: string } | null) {
  return [videos?.preview, videos?.promo, videos?.animation, videos?.walkthrough].map(previewVideoUrl).find(Boolean) || null
}

export function portfolioVideoValues(existing: Record<string, string | undefined> | null | undefined, youtube: string, preview: string) {
  const videos = { ...existing }
  if (youtube.trim()) videos.youtube = youtube.trim(); else delete videos.youtube
  if (preview.trim()) videos.preview = preview.trim(); else delete videos.preview
  return videos
}

export interface PreviewVideo { muted: boolean; currentTime: number; pause(): void; play(): Promise<void> }
/** Shared controller: one active preview, delayed fine-pointer hover, explicit touch/keyboard play. */
export function createPreviewController(video: PreviewVideo, options: {
  hoverAllowed(): boolean; reducedMotion(): boolean; playing(value: boolean): void; failed(): void
}, clock = { set: (fn: () => void) => setTimeout(fn, 250), clear: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer) }) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let generation = 0
  let disposed = false
  function stop() {
    generation++
    if (timer !== undefined) { clock.clear(timer); timer = undefined }
    video.pause()
    try { video.currentTime = 0 } catch { /* Metadata may not have loaded yet. */ }
    options.playing(false)
    if (activePreview === stop) activePreview = undefined
  }
  async function play() {
    if (disposed) return
    if (activePreview && activePreview !== stop) activePreview()
    activePreview = stop
    const attempt = ++generation
    video.muted = true
    try {
      await video.play()
      if (!disposed && attempt === generation) options.playing(true)
    } catch {
      if (!disposed && attempt === generation) { stop(); options.failed() }
    }
  }
  return {
    hover() { if (!disposed && options.hoverAllowed() && !options.reducedMotion()) { if (timer !== undefined) clock.clear(timer); timer = clock.set(() => { timer = undefined; void play() }) } },
    play,
    stop,
    dispose() { disposed = true; stop() },
  }
}
let activePreview: (() => void) | undefined
