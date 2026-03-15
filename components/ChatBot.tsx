"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  showHandoff?: boolean;
}

interface LeadData {
  name?: string;
  email?: string;
}

const QUICK_REPLIES = [
  "What services do you offer?",
  "How much does a website cost?",
  "I need music promotion 🎵",
  "Talk to a human 👋",
];

const WHATSAPP_URL =
  "https://wa.me/message/BPNJE7CPON3OJ1?text=" +
  encodeURIComponent(
    "Hi Emmanuel! I was just chatting with Puri on PurpleSoftHub and I'd love to discuss my project 💜"
  );

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationDot, setShowNotificationDot] = useState(true);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [leadSaved, setLeadSaved] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Bubble entrance after 2s delay
  useEffect(() => {
    const t = setTimeout(() => setBubbleVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Welcome message 500ms after first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const t = setTimeout(() => {
        setMessages([
          {
            id: uid(),
            role: "assistant",
            content:
              "Hey there! 👋 I'm Puri, your PurpleSoftHub AI assistant. I can help you find the right service, answer questions, or connect you with Emmanuel directly. What can I help you with today? 💜",
            timestamp: new Date(),
          },
        ]);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const saveLead = useCallback(
    async (allMessages: Message[], handoffTriggered: boolean) => {
      if (leadSaved || (!leadData.name && !leadData.email)) return;
      const summary = allMessages
        .slice(-8)
        .map((m) => `${m.role === "user" ? "User" : "Puri"}: ${m.content}`)
        .join("\n");
      try {
        await fetch("/api/chat/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: leadData.name,
            email: leadData.email,
            summary,
            handoffTriggered,
          }),
        });
        setLeadSaved(true);
      } catch {
        // silent
      }
    },
    [leadData, leadSaved]
  );

  const extractLeadData = useCallback((allMessages: Message[]) => {
    const combined = allMessages.map((m) => m.content).join(" ");
    const emailMatch = combined.match(
      /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
    );
    const nameMatch = combined.match(
      /(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    );
    setLeadData((prev) => {
      const next = { ...prev };
      if (emailMatch && !prev.email) next.email = emailMatch[0];
      if (nameMatch && !prev.name) next.name = nameMatch[1];
      return next;
    });
  }, []);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    if (captchaEnabled && !captchaToken) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "Please complete the captcha before sending a message.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setInput("");
    setShowNotificationDot(false);
    setHasInteracted(true);

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          leadData,
          captchaToken,
        }),
      });

      const data = (await res.json()) as {
        reply: string;
        showHandoff: boolean;
        shouldSaveLead: boolean;
      };

      const aiMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply || "Sorry, something went wrong. Please try again! 💜",
        timestamp: new Date(),
        showHandoff: data.showHandoff,
      };

      const final = [...updated, aiMsg];
      setMessages(final);
      extractLeadData(final);

      if (data.shouldSaveLead) {
        saveLead(final, data.showHandoff);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "Sorry, I'm having connection issues. Please try again! 💜",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      if (captchaEnabled) {
        setCaptchaToken("");
        setCaptchaReset((v) => v + 1);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowNotificationDot(false);
  };

  if (!bubbleVisible) return null;

  return (
    <>
      <style>{`
        @keyframes bubblePulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0;   }
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-5px); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes bubbleEntrance {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        .puri-bubble  { animation: bubbleEntrance 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .puri-window  { animation: chatSlideUp 0.3s ease forwards; }
        .puri-msg     { animation: messageIn 0.3s ease forwards; }
        .puri-dot1    { animation: typingBounce 0.6s ease infinite 0s;    }
        .puri-dot2    { animation: typingBounce 0.6s ease infinite 0.15s; }
        .puri-dot3    { animation: typingBounce 0.6s ease infinite 0.3s;  }
        .puri-pulse {
          position: absolute; inset: -6px; border-radius: 50%;
          background: rgba(168,85,247,0.5);
          animation: bubblePulse 2s ease-out infinite;
          pointer-events: none;
        }
        .puri-scroll::-webkit-scrollbar { width: 3px; }
        .puri-scroll::-webkit-scrollbar-track { background: transparent; }
        .puri-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,.4); border-radius: 4px; }

        /* ── Responsive chat window ── */
        .puri-window {
          width: min(360px, calc(100vw - 32px)) !important;
          height: min(520px, calc(100dvh - 104px)) !important;
          right: 16px !important;
          bottom: 88px !important;
        }
        @media (max-width: 480px) {
          .puri-window {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
          }
          .puri-bubble {
            bottom: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>

      {/* ── Floating Bubble ── */}
      <div
        className="puri-bubble"
        style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}
      >
        <div style={{ position: "relative" }}>
          {!isOpen && <div className="puri-pulse" />}

          {/* Red notification dot */}
          {showNotificationDot && !isOpen && (
            <div
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ef4444",
                border: "2px solid #06030f",
                zIndex: 3,
              }}
            />
          )}

          <button
            onClick={isOpen ? () => setIsOpen(false) : handleOpen}
            aria-label={isOpen ? "Close Puri chat" : "Open Puri chat"}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
              position: "relative",
              zIndex: 2,
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isOpen ? "✕" : "💬"}
          </button>
        </div>
      </div>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="puri-window"
          style={{
            position: "fixed",
            bottom: 88,
            right: 16,
            zIndex: 9998,
            width: "min(360px, calc(100vw - 32px))",
            height: "min(520px, calc(100dvh - 104px))",
            background: "#06030f",
            border: "1px solid rgba(124,58,237,.25)",
            borderRadius: 20,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,.1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 16px 14px",
              borderBottom: "1px solid rgba(124,58,237,.15)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(124,58,237,.08)",
              flexShrink: 0,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 18,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              P
            </div>

            {/* Name + status */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: 14,
                  lineHeight: 1.2,
                }}
              >
                Puri — PurpleSoftHub AI
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 6px #22c55e",
                  }}
                />
                <span style={{ color: "#9d8fd4", fontSize: 11 }}>
                  Typically replies instantly
                </span>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: "none",
                border: "none",
                color: "#9d8fd4",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: 4,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="puri-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="puri-msg"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {/* Bubble */}
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                        : "rgba(255,255,255,.06)",
                    border:
                      msg.role === "assistant"
                        ? "1px solid rgba(124,58,237,.2)"
                        : "none",
                    color: "#fff",
                    fontSize: 13,
                    lineHeight: 1.6,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    color: "#3d2f60",
                    fontSize: 10,
                    marginTop: 3,
                    marginLeft: msg.role === "user" ? 0 : 4,
                    marginRight: msg.role === "user" ? 4 : 0,
                  }}
                >
                  {formatTime(msg.timestamp)}
                </div>

                {/* WhatsApp Handoff Card */}
                {msg.showHandoff && (
                  <div
                    style={{
                      marginTop: 8,
                      width: "100%",
                      maxWidth: 280,
                      background: "rgba(37,211,102,0.08)",
                      border: "1px solid rgba(37,211,102,0.25)",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        color: "#86efac",
                        fontWeight: 700,
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      👋 Chat with Emmanuel directly
                    </div>

                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: "100%",
                        background:
                          "linear-gradient(135deg, #25d366, #128c7e)",
                        borderRadius: 50,
                        padding: "14px 24px",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 15,
                        textDecoration: "none",
                        boxSizing: "border-box",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.88")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      {/* WhatsApp SVG */}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Open WhatsApp Now
                    </a>

                    <div
                      style={{
                        color: "#9d8fd4",
                        fontSize: 12,
                        marginTop: 10,
                        textAlign: "center",
                      }}
                    >
                      Tap above to start a WhatsApp chat — Emmanuel replies
                      fast! ⚡
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "12px 16px",
                    background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(124,58,237,.2)",
                    borderRadius: "18px 18px 18px 4px",
                  }}
                >
                  <div
                    className="puri-dot1"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#a855f7",
                    }}
                  />
                  <div
                    className="puri-dot2"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#a855f7",
                    }}
                  />
                  <div
                    className="puri-dot3"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#a855f7",
                    }}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick replies — shown only before first user message */}
          {!hasInteracted && messages.length > 0 && (
            <div
              style={{
                padding: "0 12px 10px",
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                flexShrink: 0,
              }}
            >
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 500,
                    background: "rgba(124,58,237,.12)",
                    border: "1px solid rgba(124,58,237,.3)",
                    color: "#c084fc",
                    cursor: "pointer",
                    transition: "all .2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,.25)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,.12)";
                    e.currentTarget.style.color = "#c084fc";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          {captchaEnabled && (
            <div style={{ padding: "0 12px 10px", display: "flex", justifyContent: "center" }}>
              <TurnstileWidget onVerify={setCaptchaToken} resetSignal={captchaReset} theme="dark" />
            </div>
          )}
          <div
            style={{
              padding: "10px 12px 14px",
              borderTop: "1px solid rgba(124,58,237,.12)",
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isLoading && sendMessage()
              }
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 50,
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(124,58,237,.2)",
                color: "#fff",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                opacity: isLoading ? 0.6 : 1,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(124,58,237,.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(124,58,237,.2)")
              }
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                border: "none",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#fff",
                flexShrink: 0,
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                transition: "all .2s",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
