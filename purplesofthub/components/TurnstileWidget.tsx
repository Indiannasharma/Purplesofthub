'use client'

interface TurnstileWidgetProps {
  onVerify?: (token: string) => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
  resetSignal?: number
}

// TODO: Integrate Cloudflare Turnstile widget when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set
export default function TurnstileWidget({
  onVerify,
  onError,
  theme = 'auto',
}: TurnstileWidgetProps) {
  return null
}
