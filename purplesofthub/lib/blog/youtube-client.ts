type YouTubePlayer = { destroy(): void }
type PlayerOptions = { events: { onReady(): void; onError(): void; onStateChange(event: {data: number}): void } }
type YouTubeApi = { Player: new (element: HTMLIFrameElement, options: PlayerOptions) => YouTubePlayer }
declare global {
  interface Window { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void }
}
let pending: Promise<YouTubeApi> | undefined
/** The fixed official API is loaded only after the reader activates a YouTube block. */
export function youtubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (pending) return pending
  pending = new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement('script')
    const previous = window.onYouTubeIframeAPIReady
    let settled = false
    const fail = () => {
      if (settled) return
      settled = true; clearTimeout(timer); script.remove(); pending = undefined
      window.onYouTubeIframeAPIReady = previous
      reject(new Error('YouTube player API unavailable'))
    }
    const timer = window.setTimeout(fail, 12000)
    window.onYouTubeIframeAPIReady = () => {
      if (!window.YT?.Player) return fail()
      if (settled) return
      settled = true; clearTimeout(timer); resolve(window.YT)
      previous?.()
    }
    script.src = 'https://www.youtube.com/iframe_api'; script.async = true
    script.referrerPolicy = 'strict-origin-when-cross-origin'; script.onerror = fail
    document.head.appendChild(script)
  })
  return pending
}
