import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClientIp, checkRateLimit, rateLimiters } from '@/lib/rateLimit'
import { redis } from '@/lib/redis'
import {
  detectHandoffIntent,
  detectServiceInterest,
  extractEmail,
  extractPhone,
  generateNovaFallbackReply,
  getNovaSystemPrompt,
  summarizeForLead,
  type NovaMode,
  type NovaUiMessage,
} from '@/lib/nova'

type RequestBody = {
  mode?: NovaMode
  sessionId?: string
  page?: string
  messages?: NovaUiMessage[]
  visitor?: {
    name?: string
    email?: string
    phone?: string
    budget?: string
    timeline?: string
  }
}

type ProfileRole = 'admin' | 'client' | null
type NovaAiProvider = 'softclaw' | 'anthropic'

function getConfiguredAiProvider(): NovaAiProvider | null {
  const requested = process.env.NOVA_AI_PROVIDER?.trim().toLowerCase()
  if (requested === 'softclaw' || requested === 'anthropic') return requested
  if (process.env.SOFTCLAW_NOVA_CHAT_URL) return 'softclaw'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  return null
}

async function generateSoftclawReply(input: {
  mode: NovaMode
  messages: NovaUiMessage[]
  fallback: string
}) {
  const url = process.env.SOFTCLAW_NOVA_CHAT_URL?.trim()
  if (!url) return input.fallback

  const secret = process.env.SOFTCLAW_NOVA_ALERT_SECRET
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'x-softclaw-nova-secret': secret } : {}),
    },
    body: JSON.stringify({
      source: 'purplesofthub-nova',
      mode: input.mode,
      systemPrompt: getNovaSystemPrompt(input.mode),
      messages: input.messages,
      fallback: input.fallback,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Softclaw Nova chat failed: ${response.status} ${errorText.slice(0, 300)}`)
  }

  const data = await response.json() as {
    reply?: string
  }
  return data.reply?.trim() || input.fallback
}

async function generateAnthropicReply(input: {
  mode: NovaMode
  messages: NovaUiMessage[]
  fallback: string
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return input.fallback

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 700,
    system: getNovaSystemPrompt(input.mode),
    messages: input.messages,
  })

  return response.content[0]?.type === 'text' ? response.content[0].text : input.fallback
}

async function generateAiReply(input: {
  mode: NovaMode
  messages: NovaUiMessage[]
  fallback: string
}) {
  const provider = getConfiguredAiProvider()
  if (!provider) return input.fallback

  try {
    if (provider === 'softclaw') return await generateSoftclawReply(input)
    return await generateAnthropicReply(input)
  } catch (error) {
    console.warn(`Nova ${provider} fallback used:`, error)
    return input.fallback
  }
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getCurrentUserRole(): Promise<{ userId: string | null; role: ProfileRole }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { userId: null, role: null }

  const admin = getAdminClient()
  const client = admin ?? supabase
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    userId: user.id,
    role: profile?.role === 'admin' ? 'admin' : 'client',
  }
}

function authorizeMode(requested: NovaMode | undefined, role: ProfileRole): NovaMode {
  if (requested === 'admin_ops') return role === 'admin' ? 'admin_ops' : 'public_sales'
  if (requested === 'client_support') return role ? 'client_support' : 'public_sales'
  return 'public_sales'
}

async function storeConversation(input: {
  sessionId: string
  mode: NovaMode
  page?: string
  userId: string | null
  userMessage: string
  assistantReply: string
  handoff: boolean
  serviceInterest: string | null
}) {
  const admin = getAdminClient()
  if (!admin) return

  try {
    await admin.from('nova_conversations').upsert({
      session_id: input.sessionId,
      mode: input.mode,
      page: input.page ?? null,
      user_id: input.userId,
      status: input.handoff ? 'handoff_requested' : 'active',
      service_interest: input.serviceInterest,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' })

    await admin.from('nova_messages').insert([
      {
        session_id: input.sessionId,
        role: 'user',
        content: input.userMessage,
      },
      {
        session_id: input.sessionId,
        role: 'assistant',
        content: input.assistantReply,
      },
    ])
  } catch (error) {
    console.warn('Nova conversation persistence skipped:', error)
  }
}

async function storeLead(input: {
  name?: string
  email?: string
  phone?: string
  serviceInterest: string | null
  summary: string
  handoff: boolean
  sessionId: string
  mode: NovaMode
  page?: string
}) {
  const admin = getAdminClient()
  if (!admin) return null

  const lead = {
    name: input.name?.trim() || 'Nova website visitor',
    email: input.email?.trim().toLowerCase() || 'unknown@purplesofthub.com',
    phone: input.phone?.trim() || null,
    message: input.summary,
    service_interest: input.serviceInterest,
    status: 'new',
  }

  try {
    const { data } = await admin.from('chat_leads').insert(lead).select('id').single()
    const leadId = data?.id ? String(data.id) : null
    if (leadId) {
      await Promise.allSettled([
        admin.from('nova_handoffs').insert({
          session_id: input.sessionId,
          lead_id: Number(leadId),
          channel: input.handoff ? 'human' : 'telegram',
          reason: input.handoff ? 'Visitor requested human help or showed handoff intent.' : 'Qualified Nova lead captured.',
          status: 'new',
        }),
        admin.from('nova_alerts').insert({
          session_id: input.sessionId,
          lead_id: Number(leadId),
          priority: input.handoff ? 'high' : 'normal',
          summary: input.summary,
          sent_to_softclaw: Boolean(process.env.SOFTCLAW_NOVA_ALERT_URL),
        }),
        admin.from('nova_conversations').update({
          status: input.handoff ? 'handoff_requested' : 'lead_captured',
          updated_at: new Date().toISOString(),
        }).eq('session_id', input.sessionId),
      ])
    }
    return leadId
  } catch (error) {
    console.warn('Nova rich lead insert failed, retrying minimal lead:', error)
    try {
      const { data } = await admin.from('chat_leads').insert({
        name: lead.name,
        email: lead.email,
        message: lead.message,
        status: 'new',
      }).select('id').single()
      return data?.id ? String(data.id) : null
    } catch (fallbackError) {
      console.warn('Nova minimal lead insert failed:', fallbackError)
      return null
    }
  }
}

async function notifySoftclaw(input: {
  leadId: string | null
  mode: NovaMode
  serviceInterest: string | null
  summary: string
  handoff: boolean
  page?: string
  visitor: RequestBody['visitor']
}) {
  const url = process.env.SOFTCLAW_NOVA_ALERT_URL
  if (!url) return

  const secret = process.env.SOFTCLAW_NOVA_ALERT_SECRET
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'x-softclaw-nova-secret': secret } : {}),
      },
      body: JSON.stringify({
        source: 'purplesofthub-nova',
        leadId: input.leadId,
        mode: input.mode,
        serviceInterest: input.serviceInterest,
        handoff: input.handoff,
        page: input.page,
        visitor: input.visitor,
        summary: input.summary,
      }),
    })
  } catch (error) {
    console.warn('Softclaw Nova alert failed:', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(rateLimiters.chat, ip).catch((error) => {
      console.warn('Nova rate limit skipped:', error)
      return { ok: true, remaining: 999, resetAt: Date.now() + 600000 }
    })
    if (!rl.ok) {
      const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { reply: 'Nova is receiving a lot of requests. Please try again shortly.', showHandoff: true, retryAfterSec },
        { status: 429, headers: { 'Retry-After': retryAfterSec.toString() } }
      )
    }

    const body = await req.json() as RequestBody
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : []
    const latest = messages[messages.length - 1]
    if (!latest || latest.role !== 'user' || !latest.content.trim()) {
      return NextResponse.json({ error: 'A user message is required.' }, { status: 400 })
    }

    const { userId, role } = await getCurrentUserRole()
    const mode = authorizeMode(body.mode, role)
    const sessionId = body.sessionId || crypto.randomUUID()
    const storageKey = `nova:${sessionId}`

    let modelMessages = messages
    if (redis) {
      try {
        const stored = await redis.lrange<NovaUiMessage>(storageKey, 0, 29)
        modelMessages = stored.length > 0 ? [...stored, latest].slice(-30) : messages
      } catch (error) {
        console.warn('Nova Redis history read failed:', error)
      }
    }

    const combinedText = modelMessages.map((message) => message.content).join('\n')
    const serviceInterest = detectServiceInterest(combinedText)
    const email = body.visitor?.email || extractEmail(combinedText) || undefined
    const phone = body.visitor?.phone || extractPhone(combinedText) || undefined
    const handoffByText = detectHandoffIntent(latest.content)

    let reply = generateNovaFallbackReply({
      mode,
      serviceInterest,
      latestMessage: latest.content,
      handoff: handoffByText,
    })

    reply = await generateAiReply({
      mode,
      messages: modelMessages,
      fallback: reply,
    })

    const handoff = handoffByText || /whatsapp|telegram|talk to (a )?(human|person|team)|connect you/i.test(reply)
    const shouldSaveLead = handoff || Boolean(email || phone)
    const summary = summarizeForLead([...modelMessages, { role: 'assistant', content: reply }])

    if (redis) {
      try {
        const pipe = redis.pipeline()
        pipe.rpush(storageKey, latest, { role: 'assistant' as const, content: reply })
        pipe.expire(storageKey, 60 * 60 * 24)
        await pipe.exec()
      } catch (error) {
        console.warn('Nova Redis history write failed:', error)
      }
    }

    await storeConversation({
      sessionId,
      mode,
      page: body.page,
      userId,
      userMessage: latest.content,
      assistantReply: reply,
      handoff,
      serviceInterest,
    })

    let leadId: string | null = null
    if (shouldSaveLead) {
      leadId = await storeLead({
        name: body.visitor?.name,
        email,
        phone,
        serviceInterest,
        summary,
        handoff,
        sessionId,
        mode,
        page: body.page,
      })
    }

    if (handoff || leadId) {
      await notifySoftclaw({
        leadId,
        mode,
        serviceInterest,
        summary,
        handoff,
        page: body.page,
        visitor: { ...body.visitor, email, phone },
      })
    }

    return NextResponse.json({
      reply,
      mode,
      sessionId,
      showHandoff: handoff,
      leadSaved: Boolean(leadId),
      serviceInterest,
    })
  } catch (error) {
    console.error('Nova API error:', error)
    return NextResponse.json(
      {
        reply: 'Nova hit a temporary issue. You can still reach the PurpleSoftHub team through WhatsApp or Telegram.',
        showHandoff: true,
      },
      { status: 500 }
    )
  }
}
