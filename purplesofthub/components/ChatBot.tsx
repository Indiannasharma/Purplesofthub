'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import type { NovaMode, NovaUiMessage } from '@/lib/nova'

const WHATSAPP_LINK = 'https://wa.me/qr/L36LMHQ4RLP2B1'
const TELEGRAM_LINK = 'https://t.me/PurpleSofthubsupport'

type Visitor = {
  name: string
  email: string
  phone: string
  budget: string
  timeline: string
}

type ApiResponse = {
  reply?: string
  mode?: NovaMode
  sessionId?: string
  showHandoff?: boolean
  leadSaved?: boolean
  serviceInterest?: string | null
}

function getMode(pathname: string): NovaMode {
  if (pathname.startsWith('/admin')) return 'admin_ops'
  if (pathname.startsWith('/dashboard')) return 'client_support'
  return 'public_sales'
}

function modeCopy(mode: NovaMode) {
  if (mode === 'admin_ops') {
    return {
      eyebrow: 'Admin Operations Agent',
      title: 'Nova Ops',
      intro: 'Summarize leads, draft replies, and plan next actions.',
      placeholder: 'Ask Nova to summarize, draft, or plan...',
      firstMessage: 'Hi, I am Nova Ops. I can help summarize leads, draft replies, and organize next actions for PurpleSoftHub.',
      shortcuts: ['Summarize new leads', 'Draft a client reply', 'What should I do next?'],
    }
  }

  if (mode === 'client_support') {
    return {
      eyebrow: 'Client Support Agent',
      title: 'Nova Support',
      intro: 'Project help, invoices, files, and support routing.',
      placeholder: 'Ask about your project, invoice, or support request...',
      firstMessage: 'Hi, I am Nova. I can help with your project, invoices, files, or support requests.',
      shortcuts: ['I need a project update', 'I need a revision', 'I have a payment question'],
    }
  }

  return {
    eyebrow: 'AI Growth Concierge',
    title: 'Nova',
    intro: 'Plan your website, app, ads, or digital growth with PurpleSoftHub.',
    placeholder: 'Tell Nova what you want to build or grow...',
    firstMessage: 'Hi, I am Nova by PurpleSoftHub. Tell me what you want to build or grow, and I will help you choose the right service.',
    shortcuts: ['I need a website', 'I need an app', 'I need ads or marketing'],
  }
}

function getStoredSessionId() {
  if (typeof window === 'undefined') return ''
  const existing = window.localStorage.getItem('nova_session_id')
  if (existing) return existing
  const created = crypto.randomUUID()
  window.localStorage.setItem('nova_session_id', created)
  return created
}

export default function ChatBot() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const mode = useMemo(() => getMode(pathname), [pathname])
  const copy = useMemo(() => modeCopy(mode), [mode])
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<NovaUiMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHandoff, setShowHandoff] = useState(false)
  const [leadSaved, setLeadSaved] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [visitor, setVisitor] = useState<Visitor>({
    name: '',
    email: '',
    phone: '',
    budget: '',
    timeline: '',
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSessionId(getStoredSessionId())
  }, [])

  useEffect(() => {
    setMessages([{ role: 'assistant', content: copy.firstMessage }])
    setShowHandoff(false)
    setLeadSaved(false)
  }, [copy.firstMessage, mode])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading, open])

  async function sendMessage(text: string) {
    const clean = text.trim()
    if (!clean || loading) return

    const nextMessages: NovaUiMessage[] = [...messages, { role: 'user', content: clean }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          sessionId,
          page: pathname,
          visitor,
          messages: nextMessages,
        }),
      })
      const data = await response.json() as ApiResponse
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId)
        window.localStorage.setItem('nova_session_id', data.sessionId)
      }
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.reply || 'Nova had trouble answering. Please use WhatsApp or Telegram for help.',
        },
      ])
      setShowHandoff(Boolean(data.showHandoff))
      if (data.leadSaved) setLeadSaved(true)
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Nova could not connect right now. You can still reach the team through WhatsApp or Telegram.',
        },
      ])
      setShowHandoff(true)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  const needsLeadFields = mode === 'public_sales' || mode === 'client_support'

  return (
    <div className="nova-shell" data-theme={theme} aria-live="polite">
      {open && (
        <div className="nova-panel" role="dialog" aria-label="Nova by PurpleSoftHub">
          <div className="nova-header">
            <div className="nova-mark">
              <Sparkles size={22} />
            </div>
            <div>
              <p>{copy.eyebrow}</p>
              <h2>{copy.title}</h2>
              <span className="nova-presence">Online now</span>
            </div>
            <button type="button" className="nova-icon-button" onClick={() => setOpen(false)} aria-label="Close Nova">
              <X size={18} />
            </button>
          </div>

          <div className="nova-mode">
            <Bot size={16} />
            <span>{copy.intro}</span>
          </div>

          <div className="nova-messages" ref={scrollRef}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`nova-message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="nova-message assistant loading">
                <Loader2 size={16} />
                Thinking through the best next step...
              </div>
            )}
          </div>

          <div className="nova-shortcuts">
            {copy.shortcuts.map((shortcut) => (
              <button type="button" key={shortcut} onClick={() => void sendMessage(shortcut)}>
                {shortcut}
              </button>
            ))}
          </div>

          {needsLeadFields && (
            <details className="nova-lead-box">
              <summary>
                <UserRoundCheck size={16} />
                Send project details
                <ChevronDown size={15} />
              </summary>
              <div className="nova-lead-grid">
                <input value={visitor.name} onChange={(event) => setVisitor((v) => ({ ...v, name: event.target.value }))} placeholder="Name" />
                <input value={visitor.email} onChange={(event) => setVisitor((v) => ({ ...v, email: event.target.value }))} placeholder="Email" />
                <input value={visitor.phone} onChange={(event) => setVisitor((v) => ({ ...v, phone: event.target.value }))} placeholder="Phone / WhatsApp" />
                <input value={visitor.budget} onChange={(event) => setVisitor((v) => ({ ...v, budget: event.target.value }))} placeholder="Budget" />
                <input value={visitor.timeline} onChange={(event) => setVisitor((v) => ({ ...v, timeline: event.target.value }))} placeholder="Timeline" />
              </div>
              {leadSaved && <p className="nova-saved">Saved. The PurpleSoftHub team has the context for follow-up.</p>}
            </details>
          )}

          {(showHandoff || mode !== 'admin_ops') && (
            <div className="nova-handoff">
              <p>Prefer a direct conversation?</p>
              <div>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer">Telegram</a>
              </div>
            </div>
          )}

          <form className="nova-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.placeholder}
              aria-label="Message Nova"
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="nova-fab"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open Nova assistant"
        aria-expanded={open}
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
        {!open && <span>Nova</span>}
      </button>

      <style jsx>{`
        .nova-shell {
          --nova-panel-bg: rgba(255, 255, 255, 0.96);
          --nova-panel-text: #160b2f;
          --nova-panel-subtle: #6b5b82;
          --nova-panel-muted: #7c5a9e;
          --nova-panel-border: rgba(124, 58, 237, 0.18);
          --nova-panel-shadow: 0 26px 80px rgba(31, 15, 74, 0.22);
          --nova-header-bg:
            radial-gradient(circle at top left, rgba(34, 211, 238, 0.16), transparent 34%),
            linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(255, 255, 255, 0));
          --nova-mark-bg: linear-gradient(135deg, #7c3aed, #06b6d4);
          --nova-surface: rgba(248, 245, 255, 0.88);
          --nova-surface-strong: rgba(255, 255, 255, 0.94);
          --nova-assistant-bg: rgba(248, 245, 255, 0.96);
          --nova-assistant-text: #2f2145;
          --nova-input-bg: rgba(255, 255, 255, 0.98);
          --nova-input-text: #160b2f;
          --nova-faint-border: rgba(124, 58, 237, 0.12);
          --nova-handoff-bg: rgba(16, 185, 129, 0.12);
          --nova-handoff-border: rgba(5, 150, 105, 0.22);
          --nova-handoff-text: #064e3b;
          position: fixed;
          right: max(24px, env(safe-area-inset-right));
          bottom: max(24px, env(safe-area-inset-bottom));
          z-index: 9999;
          font-family: inherit;
        }

        .nova-shell[data-theme='dark'] {
          --nova-panel-bg: rgba(9, 6, 24, 0.95);
          --nova-panel-text: #f8fafc;
          --nova-panel-subtle: #cbd5e1;
          --nova-panel-muted: #a5b4fc;
          --nova-panel-border: rgba(148, 163, 184, 0.22);
          --nova-panel-shadow: 0 30px 90px rgba(0, 0, 0, 0.48);
          --nova-header-bg:
            radial-gradient(circle at top left, rgba(6, 182, 212, 0.26), transparent 34%),
            linear-gradient(135deg, rgba(124, 58, 237, 0.28), rgba(5, 9, 22, 0));
          --nova-surface: rgba(15, 23, 42, 0.62);
          --nova-surface-strong: rgba(15, 23, 42, 0.78);
          --nova-assistant-bg: rgba(30, 41, 59, 0.84);
          --nova-assistant-text: #e2e8f0;
          --nova-input-bg: rgba(2, 6, 23, 0.76);
          --nova-input-text: #f8fafc;
          --nova-faint-border: rgba(148, 163, 184, 0.14);
          --nova-handoff-bg: rgba(16, 185, 129, 0.1);
          --nova-handoff-border: rgba(16, 185, 129, 0.18);
          --nova-handoff-text: #d1fae5;
        }

        .nova-fab {
          min-width: 64px;
          height: 58px;
          border: 0;
          border-radius: 999px;
          padding: 0 18px;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 900;
          letter-spacing: 0;
          cursor: pointer;
          box-shadow: 0 18px 48px rgba(124, 58, 237, 0.34), 0 0 0 6px rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .nova-fab:hover {
          transform: translateY(-2px);
          box-shadow: 0 26px 55px rgba(6, 182, 212, 0.24);
        }

        .nova-panel {
          width: min(390px, calc(100vw - 28px));
          height: min(640px, calc(100dvh - 108px));
          min-height: 520px;
          margin-bottom: 14px;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid var(--nova-panel-border);
          background: var(--nova-panel-bg);
          color: var(--nova-panel-text);
          box-shadow: var(--nova-panel-shadow);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          display: flex;
          flex-direction: column;
          animation: nova-pop 0.18s ease both;
        }

        .nova-header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 11px;
          align-items: center;
          padding: 15px;
          background: var(--nova-header-bg);
          border-bottom: 1px solid var(--nova-faint-border);
          flex: 0 0 auto;
        }

        .nova-mark {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          color: #fff;
          background: var(--nova-mark-bg);
          box-shadow: 0 14px 30px rgba(34, 211, 238, 0.22);
        }

        .nova-header p {
          margin: 0 0 3px;
          color: var(--nova-panel-muted);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .nova-header h2 {
          margin: 0;
          color: var(--nova-panel-text);
          font-size: 20px;
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: 0;
        }

        .nova-presence {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 7px;
          color: #bbf7d0;
          font-size: 12px;
          font-weight: 800;
        }

        .nova-presence::before {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.14);
        }

        .nova-icon-button,
        .nova-form button {
          border: 0;
          cursor: pointer;
          display: inline-grid;
          place-items: center;
        }

        .nova-icon-button {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          color: var(--nova-panel-subtle);
          background: var(--nova-surface-strong);
          border: 1px solid var(--nova-faint-border);
        }

        .nova-mode {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 10px 15px;
          color: var(--nova-panel-subtle);
          font-size: 12px;
          line-height: 1.45;
          background: var(--nova-surface);
          border-bottom: 1px solid var(--nova-faint-border);
          flex: 0 0 auto;
        }

        .nova-messages {
          min-height: 0;
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 14px 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nova-message {
          width: fit-content;
          max-width: 88%;
          padding: 10px 12px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.5;
          white-space: pre-wrap;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
        }

        .nova-message.assistant {
          align-self: flex-start;
          color: var(--nova-assistant-text);
          background: var(--nova-assistant-bg);
          border: 1px solid var(--nova-faint-border);
        }

        .nova-message.user {
          align-self: flex-end;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
        }

        .nova-message.loading {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .nova-message.loading svg {
          animation: nova-spin 0.8s linear infinite;
        }

        .nova-shortcuts {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 0 15px 10px;
          scrollbar-width: none;
          flex: 0 0 auto;
        }

        .nova-shortcuts::-webkit-scrollbar {
          display: none;
        }

        .nova-shortcuts button {
          border: 1px solid rgba(34, 211, 238, 0.2);
          background: var(--nova-surface);
          color: var(--nova-panel-muted);
          border-radius: 10px;
          padding: 7px 10px;
          white-space: nowrap;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          min-height: 32px;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }

        .nova-shortcuts button:hover {
          transform: translateY(-1px);
          border-color: rgba(34, 211, 238, 0.44);
          background: var(--nova-surface-strong);
        }

        .nova-lead-box {
          margin: 0 15px 10px;
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 14px;
          background: var(--nova-surface);
          overflow: hidden;
          flex: 0 0 auto;
        }

        .nova-lead-box summary {
          list-style: none;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 10px 12px;
          color: var(--nova-panel-text);
          font-size: 12px;
          font-weight: 800;
        }

        .nova-lead-box summary::-webkit-details-marker {
          display: none;
        }

        .nova-lead-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 0 12px 12px;
        }

        .nova-lead-grid input,
        .nova-form input {
          width: 100%;
          min-width: 0;
          color: var(--nova-input-text);
          background: var(--nova-input-bg);
          border: 1px solid var(--nova-faint-border);
          outline: none;
          border-radius: 12px;
        }

        .nova-lead-grid input {
          height: 39px;
          padding: 0 10px;
          font-size: 12px;
        }

        .nova-saved {
          margin: -3px 12px 12px;
          color: #86efac;
          font-size: 12px;
          line-height: 1.4;
        }

        .nova-handoff {
          margin: 0 15px 10px;
          padding: 10px;
          border-radius: 14px;
          background: var(--nova-handoff-bg);
          border: 1px solid var(--nova-handoff-border);
          flex: 0 0 auto;
        }

        .nova-handoff p {
          margin: 0 0 8px;
          color: var(--nova-handoff-text);
          font-size: 12px;
          font-weight: 800;
        }

        .nova-handoff div {
          display: flex;
          gap: 8px;
        }

        .nova-handoff a {
          flex: 1;
          text-align: center;
          text-decoration: none;
          border-radius: 11px;
          padding: 8px 10px;
          color: #062a1b;
          background: #34d399;
          font-size: 12px;
          font-weight: 900;
        }

        .nova-handoff a:last-child {
          color: #e0f2fe;
          background: #0284c7;
        }

        .nova-form {
          display: grid;
          grid-template-columns: 1fr 44px;
          gap: 8px;
          padding: 12px 15px 14px;
          border-top: 1px solid var(--nova-faint-border);
          flex: 0 0 auto;
        }

        .nova-form input {
          height: 44px;
          padding: 0 13px;
          font-size: 13px;
        }

        .nova-form button {
          height: 44px;
          border-radius: 14px;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
        }

        .nova-form button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @keyframes nova-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes nova-pop {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 640px) {
          .nova-shell {
            right: max(10px, env(safe-area-inset-right));
            bottom: max(10px, env(safe-area-inset-bottom));
            left: max(10px, env(safe-area-inset-left));
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }

          .nova-panel {
            width: 100%;
            height: min(680px, calc(100dvh - 86px));
            min-height: min(560px, calc(100dvh - 86px));
            border-radius: 18px;
            margin-bottom: 10px;
          }

          .nova-messages {
            min-height: 0;
          }

          .nova-lead-grid {
            grid-template-columns: 1fr;
          }

          .nova-header {
            padding: 15px;
          }

          .nova-mode {
            padding: 10px 14px;
            font-size: 12px;
          }

          .nova-fab {
            min-width: 60px;
            height: 54px;
          }
        }

        @media (max-width: 380px) {
          .nova-panel {
            height: calc(100dvh - 78px);
            min-height: 0;
          }

          .nova-messages {
            min-height: 0;
          }

          .nova-header h2 {
            font-size: 19px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nova-fab,
          .nova-message.loading svg {
            animation: none;
            transition: none;
          }
        }

        @media (min-width: 641px) and (max-height: 780px) {
          .nova-panel {
            height: min(560px, calc(100dvh - 96px));
            min-height: 0;
          }

          .nova-header {
            padding: 13px 14px;
          }

          .nova-mark {
            width: 38px;
            height: 38px;
          }

          .nova-mode {
            padding: 8px 14px;
          }

          .nova-message {
            padding: 9px 11px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}
