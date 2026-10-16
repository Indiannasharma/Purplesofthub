/** Only accept TikTok messages from the active frame and its exact provider origin. */
export function tiktokPlayerEvent(origin: string, sameFrame: boolean, data: unknown): 'ready' | 'playing' | 'error' | null {
  if (!sameFrame || origin !== 'https://www.tiktok.com' || !data || typeof data !== 'object') return null
  const message = data as Record<string, unknown>
  if (message['x-tiktok-player'] !== true) return null
  if (message.type === 'onPlayerReady') return 'ready'
  if (message.type === 'onStateChange' && message.value === 1) return 'playing'
  if (message.type === 'onPlayerError' || message.type === 'onError') return 'error'
  return null
}
