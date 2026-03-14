"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
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
  "I need music promotion",
  "Talk to a human 👋",
];

const WHATSAPP_URL =
  "https://wa.me/message/BPNJE7CPON3OJ1?text=" +
  encodeURIComponent(
    "Hi Emmanuel! I was chatting with Puri on PurpleSoftHub and I'd like to discuss my project 💜"
  );

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showDot, setShowDot] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey there! 👋 I'm Puri, your AI guide for PurpleSoftHub. I'm here to help you find the perfect service for your project. What can I help you with today? 💜",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ name: "", email: "", message: "" });
  const [emailSent, setEmailSent] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Entrance animation after 2s
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Pre-fill email form when lead data collected
  useEffect(() => {
    setEmailForm((prev) => ({
      ...prev,
      name: leadData.name || prev.name,
      email: leadData.email || prev.email,
    }));
  }, [leadData]);

  const saveLead = useCallback(
    async (handoffMethod: string) => {
      if (leadSaved) return;
      const summary = messages
        .slice(-6)
        .map((m) => `${m.role === "user" ? "User" : "Puri"}: ${m.content}`)
        .join("\n");
      try {
        await fetch("/api/chat/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...leadData, summary, handoffMethod }),
        });
        setLeadSaved(true);
      } catch {
        // silent
      }
    },
    [leadData, messages, leadSaved]
  );

  const extractLeadData = (text: string) => {
    const emailMatch = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    if (emailMatch) {
      setLeadData((prev) => ({ ...prev, email: emailMatch[0] }));
    }
    const nameMatch = text.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch) {
      setLeadData((prev) => ({ ...prev, name: nameMatch[1] }));
    }
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput("");
    setShowDot(false);

    const userMsg: Message = { role: "user", content, timestamp: new Date() };
    extractLeadData(content);

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          leadData,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const aiMsg: Message = {
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
          showHandoff: data.showHandoff,
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (data.shouldSaveLead && !leadSaved) {
          saveLead("none");
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having connection issues. Please try again! 💜",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleEmailSend = async () => {
    if (!emailForm.name || !emailForm.email || !emailForm.message) return;
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: emailForm.name,
          email: emailForm.email,
          message: emailForm.message,
          service: "Chat Lead",
        }),
      });
      setEmailSent(true);
      saveLead("email");
    } catch {
      // silent
    }
  };

  const handleWhatsApp = () => {
    saveLead("whatsapp");
    window.open(WHATSAPP_URL, "_blank");
  };

  const handleTawkto = () => {
    saveLead("tawkto");
    if (window.Tawk_API) {
      window.Tawk_API.setAttributes({
        name: leadData.name || "Website Visitor",
        email: leadData.email || "",
      });
      window.Tawk_API.toggle();
    }
    setOpen(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes bubblePulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bubbleEntrance {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .chat-bubble-enter { animation: bubbleEntrance 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .chat-window-enter { animation: chatSlideUp 0.3s ease forwards; }
        .msg-in { animation: messageIn 0.25s ease forwards; }
        .dot1 { animation: typingBounce 1s ease-in-out infinite 0s; }
        .dot2 { animation: typingBounce 1s ease-in-out infinite 0.15s; }
        .dot3 { animation: typingBounce 1s ease-in-out infinite 0.3s; }
        .pulse-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          background: rgba(168,85,247,0.4);
          animation: bubblePulse 2s ease-out infinite;
        }
        @media (max-width: 640px) {
          .chat-window {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            right: 0 !important; bottom: 0 !important;
            width: 100% !important; height: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Floating Bubble */}
      <div
        className="chat-bubble-enter"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}
      >
        <div style={{ position: "relative" }}>
          {!open && <div className="pulse-ring" />}
          {showDot && !open && (
            <div style={{
              position: "absolute", top: -2, right: -2, width: 12, height: 12,
              borderRadius: "50%", background: "#ef4444",
              border: "2px solid #06030f", zIndex: 1,
            }} />
          )}
          <button
            onClick={() => { setOpen(!open); setShowDot(false); }}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, color: "#fff",
              boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
              transition: "transform 0.2s",
              position: "relative", zIndex: 2,
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            aria-label={open ? "Close chat" : "Open chat"}
          >
            {open ? "✕" : "💬"}
          </button>
        </div>
      </div>

      {/* Chat Window */}
      {open && (
        <div
          className="chat-window chat-window-enter"
          style={{
            position: "fixed", bottom: 96, right: 24, zIndex: 9998,
            width: 360, height: 520,
            background: "#06030f",
            border: "1px solid rgba(124,58,237,.25)",
            borderRadius: 20,
            backdropFilter: "blur(20px)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,.15)",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "16px 16px 14px",
            borderBottom: "1px solid rgba(124,58,237,.15)",
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(124,58,237,.08)",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 18, color: "#fff", flexShrink: 0,
            }}>P</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 14, lineHeight: 1 }}>
                Puri — PurpleSoftHub AI
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                  animation: "bubblePulse 2s ease-out infinite",
                }} />
                <span style={{ color: "#9d8fd4", fontSize: 11 }}>Typically replies instantly</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#9d8fd4", cursor: "pointer", fontSize: 16, padding: 4 }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} className="msg-in" style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "10px 14px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                    : "rgba(255,255,255,.06)",
                  border: msg.role === "assistant" ? "1px solid rgba(124,58,237,.2)" : "none",
                  color: "#fff", fontSize: 13, lineHeight: 1.6,
                }}>{msg.content}</div>
                <div style={{ color: "#3d2f60", fontSize: 10, marginTop: 3, marginLeft: msg.role === "user" ? 0 : 4, marginRight: msg.role === "user" ? 4 : 0 }}>
                  {formatTime(msg.timestamp)}
                </div>

                {/* Handoff card */}
                {msg.showHandoff && (
                  <div style={{
                    marginTop: 8, width: "100%", maxWidth: 300,
                    background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.25)",
                    borderRadius: 14, padding: "14px 14px 12px",
                  }}>
                    <div style={{ color: "#c084fc", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                      👋 Connect with Emmanuel
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {/* WhatsApp */}
                      <button
                        onClick={handleWhatsApp}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          background: "linear-gradient(135deg,#22c55e,#16a34a)",
                          border: "none", borderRadius: 10, padding: "9px 12px",
                          color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                          transition: "all .2s", width: "100%",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                      >💬 WhatsApp</button>

                      {/* Email */}
                      <button
                        onClick={() => setShowEmailForm(!showEmailForm)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                          border: "none", borderRadius: 10, padding: "9px 12px",
                          color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                          transition: "all .2s", width: "100%",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                      >📧 Send Email</button>

                      {/* Live Chat */}
                      <button
                        onClick={handleTawkto}
                        title="Available when team is online"
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          background: "rgba(255,255,255,.05)", border: "1px solid rgba(124,58,237,.4)",
                          borderRadius: 10, padding: "9px 12px",
                          color: "#c084fc", fontSize: 13, fontWeight: 600, cursor: "pointer",
                          transition: "all .2s", width: "100%",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >💻 Live Chat</button>
                    </div>
                    <div style={{ color: "#9d8fd4", fontSize: 11, marginTop: 8, textAlign: "center" }}>
                      Choose what works best 💜
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Email form */}
            {showEmailForm && (
              <div className="msg-in" style={{
                background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)",
                borderRadius: 14, padding: "14px 12px",
              }}>
                {emailSent ? (
                  <div style={{ color: "#86efac", fontSize: 13, textAlign: "center", padding: 8 }}>
                    ✅ Message sent! We'll reply within 24 hours 💜
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: "#c084fc", fontWeight: 700, marginBottom: 10 }}>📧 Send us a message</div>
                    {["name", "email"].map((field) => (
                      <input
                        key={field}
                        placeholder={field === "name" ? "Your name" : "your@email.com"}
                        type={field === "email" ? "email" : "text"}
                        value={emailForm[field as "name" | "email"]}
                        onChange={e => setEmailForm(prev => ({ ...prev, [field]: e.target.value }))}
                        style={{
                          width: "100%", padding: "8px 10px", marginBottom: 8, borderRadius: 8,
                          background: "rgba(255,255,255,.05)", border: "1px solid rgba(124,58,237,.2)",
                          color: "#fff", fontSize: 12, fontFamily: "Outfit", outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    ))}
                    <textarea
                      placeholder="Tell us about your project..."
                      value={emailForm.message}
                      onChange={e => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      style={{
                        width: "100%", padding: "8px 10px", marginBottom: 8, borderRadius: 8,
                        background: "rgba(255,255,255,.05)", border: "1px solid rgba(124,58,237,.2)",
                        color: "#fff", fontSize: 12, fontFamily: "Outfit", outline: "none", resize: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={handleEmailSend}
                      style={{
                        width: "100%", padding: "9px", borderRadius: 8,
                        background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none",
                        color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}
                    >Send Message →</button>
                  </>
                )}
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 14px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(124,58,237,.2)", borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>
                {[1, 2, 3].map(n => (
                  <div key={n} className={`dot${n}`} style={{ width: 7, height: 7, borderRadius: "50%", background: "#a855f7" }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length === 1 && !loading && (
            <div style={{ padding: "0 12px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: "6px 12px", borderRadius: 100, fontSize: 11, fontWeight: 500,
                    background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.3)",
                    color: "#c084fc", cursor: "pointer", transition: "all .2s",
                    fontFamily: "Outfit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,.25)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,.12)"; e.currentTarget.style.color = "#c084fc"; }}
                >{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 12px 14px", borderTop: "1px solid rgba(124,58,237,.12)", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={loading}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 50,
                background: "rgba(255,255,255,.05)", border: "1px solid rgba(124,58,237,.2)",
                color: "#fff", fontSize: 13, fontFamily: "Outfit", outline: "none",
                opacity: loading ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "#fff", flexShrink: 0,
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: "all .2s",
              }}
              aria-label="Send message"
            >→</button>
          </div>
        </div>
      )}
    </>
  );
}
