export type NovaMode = 'public_sales' | 'client_support' | 'admin_ops'

export type NovaUiMessage = {
  role: 'user' | 'assistant'
  content: string
}

export const NOVA_MODES: Record<NovaMode, { label: string; greeting: string }> = {
  public_sales: {
    label: 'Public Sales Agent',
    greeting:
      "Hi, I'm Nova by PurpleSoftHub. Tell me what you want to build or grow, and I will help you choose the right service.",
  },
  client_support: {
    label: 'Client Support Agent',
    greeting:
      "Hi, I'm Nova. I can help with your project, invoices, files, or support requests.",
  },
  admin_ops: {
    label: 'Admin Operations Agent',
    greeting:
      "Hi, I'm Nova Ops. I can summarize leads, draft replies, and help you move client work forward.",
  },
}

const SERVICES = `
PurpleSoftHub services and starting prices:
- Web Development: business websites, ecommerce, landing pages, dashboards, and SaaS-ready websites from $300.
- Mobile App Development: Android, iOS, React Native, Flutter, backend/API apps from $500.
- SaaS/Product Development: MVPs, AI tools, automations, dashboards, custom platforms from $1,071.
- Facebook and Instagram Ads: campaign setup, management, reporting, and creative testing from $30 weekly or $107 monthly.
- Social Media Management: content planning, captions, scheduling, reporting from $53 monthly.
- UI/UX Design: Figma designs, prototypes, app/web product design from $107.
- Logo Design and Branding: logos, brand kits, creative direction from $17.
- SEO and Content Marketing: search visibility, blog/content planning from $28 monthly.
- Video Content Creation: short-form and brand video content from $35.
- Music Distribution: singles, albums, EPs, artist plans from $10.
- Music Promotion: Spotify, Apple Music, TikTok, Reels, playlist and campaign support from $21.
- Account Recovery: Facebook, Instagram, TikTok, X, Gmail recovery support from $30.

Process: discovery, strategy, design, build, launch, support.
Primary contact: hello@purplesofthub.com.
Telegram support: https://t.me/PurpleSofthubsupport.
WhatsApp support: https://wa.me/qr/L36LMHQ4RLP2B1.
`

const SHARED_RULES = `
You are Nova by PurpleSoftHub, a polished website agent for PurpleSoftHub, a premium African digital innovation studio serving clients globally.

General behavior:
- Be concise, warm, confident, and useful.
- Keep replies under 120 words unless the user asks for details.
- Ask one helpful follow-up question when needed.
- Never pretend to have performed an external action.
- Never ask for passwords, OTPs, private keys, seed phrases, or sensitive account credentials.
- Prices are starting prices; final quotes depend on scope.
- For complex, urgent, confused, payment-related, or sensitive requests, offer human handoff through WhatsApp or Telegram.
- If the visitor seems ready to buy, collect name, email or phone, service interest, budget, timeline, and a short project summary.
- If unsure, guide them to a discovery call or human support.
${SERVICES}
`

export function getNovaSystemPrompt(mode: NovaMode) {
  if (mode === 'admin_ops') {
    return `${SHARED_RULES}

Mode: Admin Operations Agent.
You are assisting the PurpleSoftHub owner/team inside the admin dashboard.
You may help summarize leads, draft replies, organize project next steps, draft content ideas, and suggest actions.
You must not claim to send messages, change pricing, delete data, approve refunds, or alter live website content unless a backend tool result confirms it.
When recommending actions, present them clearly and practically.`
  }

  if (mode === 'client_support') {
    return `${SHARED_RULES}

Mode: Client Support Agent.
You are assisting a logged-in PurpleSoftHub client.
Help with project questions, revision requests, files, invoices, service onboarding, and support routing.
If the request requires private project data you do not have, ask the client to describe the project or use the dashboard page.
For urgent support, offer WhatsApp or Telegram handoff.`
  }

  return `${SHARED_RULES}

Mode: Public Sales Agent.
You are assisting website visitors.
Your goal is to help them choose the right PurpleSoftHub service, understand starting prices, and become a qualified lead.
Recommend one clear service or package path when possible.
If the visitor asks for a human, is confused, seems urgent, or wants a custom quote, offer WhatsApp or Telegram handoff.`
}

export function detectHandoffIntent(text: string) {
  const normalized = text.toLowerCase()
  return [
    'human',
    'real person',
    'whatsapp',
    'telegram',
    'call me',
    'urgent',
    'asap',
    'confused',
    'support',
    'speak to',
    'talk to',
    'custom quote',
    'payment issue',
    'refund',
    'angry',
    'frustrated',
  ].some((keyword) => normalized.includes(keyword))
}

export function detectServiceInterest(text: string) {
  const normalized = text.toLowerCase()
  const matches: Array<[string, string[]]> = [
    ['Web Development', ['website', 'web app', 'landing page', 'ecommerce', 'shopify', 'next.js']],
    ['Mobile App Development', ['mobile app', 'android', 'ios', 'flutter', 'react native']],
    ['SaaS Development', ['saas', 'software', 'dashboard', 'automation', 'ai tool', 'platform']],
    ['Digital Marketing', ['ads', 'marketing', 'facebook ad', 'instagram ad', 'google ad', 'seo']],
    ['Social Media Management', ['social media', 'content', 'posting', 'instagram management']],
    ['UI/UX Design', ['ui', 'ux', 'figma', 'prototype', 'app design']],
    ['Branding and Logo Design', ['logo', 'branding', 'brand identity']],
    ['Music Promotion', ['music promotion', 'spotify', 'playlist', 'artist promotion']],
    ['Music Distribution', ['music distribution', 'distribute my song', 'album', 'ep release']],
    ['Account Recovery', ['account recovery', 'hacked', 'disabled account', 'recover my']],
  ]

  return matches.find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))?.[0] ?? null
}

export function extractEmail(text: string) {
  return text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] ?? null
}

export function extractPhone(text: string) {
  const match = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)
  return match?.[0]?.trim() ?? null
}

export function summarizeForLead(messages: NovaUiMessage[]) {
  return messages
    .slice(-10)
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n')
    .slice(0, 3000)
}

export function generateNovaFallbackReply(input: {
  mode: NovaMode
  serviceInterest: string | null
  latestMessage: string
  handoff: boolean
}) {
  const service = input.serviceInterest ?? 'the right PurpleSoftHub service'

  if (input.mode === 'admin_ops') {
    return 'Nova Ops is online. I can help summarize leads, draft a client reply, organize next steps, or prepare a follow-up checklist. Tell me the client name, service, current stage, and what you want to move forward.'
  }

  if (input.mode === 'client_support') {
    return 'I can help with your PurpleSoftHub project, invoice, files, revision request, or support issue. Please share your project name and what you need help with. If it is urgent, I can also point you to WhatsApp or Telegram support.'
  }

  if (input.handoff) {
    return `I can connect you with the PurpleSoftHub team for ${service}. To make the handoff useful, please send your name, email or WhatsApp number, budget range, timeline, and a short summary of what you want to build.`
  }

  return `PurpleSoftHub can help with ${service}. The usual flow is discovery, strategy, design/build, launch, then support. To recommend the best package, tell me your goal, budget range, timeline, and whether this is for a new business, existing brand, or client project.`
}
