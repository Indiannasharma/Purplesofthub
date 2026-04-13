"use client";
import { useState } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";

const SERVICES = [
  "Web Development",
  "Mobile App Development",
  "Digital Marketing",
  "UI/UX Design",
  "SaaS Development",
  "Music Distribution & Promotion",
  "Tech Consulting",
];

// ── Shared field styles ───────────────────────────────────────────────────────
const fieldBase: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 9,
  border: "1px solid rgba(168,85,247,0.22)",
  background: "rgba(124,58,237,0.05)",
  color: "var(--text-primary)",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 5,
};

export default function ContactForm() {
  const [form, setForm]           = useState({ name: "", email: "", service: "", message: "" });
  const [status, setStatus]       = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (captchaEnabled && !captchaToken) {
      setErrorMsg("Please complete the captcha.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res  = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", service: "", message: "" });
        setCaptchaToken("");
        setCaptchaReset(v => v + 1);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div style={{
        textAlign: "center",
        padding: "36px 24px",
        background: "rgba(124,58,237,0.08)",
        border: "1px solid rgba(168,85,247,0.25)",
        borderRadius: 18,
      }}>
        {/* Top accent */}
        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#7c3aed,#a855f7,transparent)", borderRadius: 2, marginBottom: 24 }} />
        <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
        <div style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
          Message Sent!
        </div>
        <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
          Thanks for reaching out! We'll get back to you within 24 hours.
        </p>
        <button
          className="btn-main"
          style={{ padding: "9px 22px", fontSize: 13 }}
          onClick={() => setStatus("idle")}
        >
          Send Another →
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: "rgba(124,58,237,0.04)",
      border: "1px solid rgba(168,85,247,0.18)",
      borderRadius: 18,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Top gradient accent */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg,transparent,#7c3aed,#a855f7,#7c3aed,transparent)",
      }} />

      <div style={{ padding: "22px 22px 20px" }}>
        {/* Error */}
        {errorMsg && (
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 8,
            padding: "9px 12px",
            marginBottom: 14,
            color: "#fca5a5",
            fontSize: 12,
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Name + Email — side by side on wider screens */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
          className="cf-two-col"
        >
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={fieldBase}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(168,85,247,0.55)";
                (e.target as HTMLInputElement).style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.1)";
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(168,85,247,0.22)";
                (e.target as HTMLInputElement).style.boxShadow   = "none";
              }}
            />
          </div>
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={fieldBase}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(168,85,247,0.55)";
                (e.target as HTMLInputElement).style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.1)";
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(168,85,247,0.22)";
                (e.target as HTMLInputElement).style.boxShadow   = "none";
              }}
            />
          </div>
        </div>

        {/* Service Needed */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Service Needed</label>
          <div style={{ position: "relative" }}>
            <select
              value={form.service}
              onChange={e => setForm({ ...form, service: e.target.value })}
              style={{
                ...fieldBase,
                /* explicit colours so it's always readable */
                background: "rgba(124,58,237,0.08)",
                color: form.service ? "var(--text-primary)" : "rgba(var(--text-primary-rgb, 100,80,160), 0.55)",
                appearance: "none",
                WebkitAppearance: "none",
                paddingRight: 36,
                cursor: "pointer",
              }}
              onFocus={e => {
                (e.target as HTMLSelectElement).style.borderColor = "rgba(168,85,247,0.55)";
                (e.target as HTMLSelectElement).style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.1)";
              }}
              onBlur={e => {
                (e.target as HTMLSelectElement).style.borderColor = "rgba(168,85,247,0.22)";
                (e.target as HTMLSelectElement).style.boxShadow   = "none";
              }}
            >
              <option value="" style={{ background: "#1a0f2e", color: "#c084fc" }}>
                Select a service…
              </option>
              {SERVICES.map(s => (
                <option key={s} value={s} style={{ background: "#1a0f2e", color: "#e2d9f3" }}>
                  {s}
                </option>
              ))}
            </select>
            {/* Custom chevron */}
            <svg
              width="12" height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(168,85,247,0.7)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Service pills for quick selection */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            marginTop: 8,
          }}>
            {SERVICES.slice(0, 5).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, service: s })}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 9px",
                  borderRadius: 100,
                  border: `1px solid ${form.service === s ? "rgba(168,85,247,0.6)" : "rgba(168,85,247,0.2)"}`,
                  background: form.service === s ? "rgba(124,58,237,0.2)" : "transparent",
                  color: form.service === s ? "#c084fc" : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Message *</label>
          <textarea
            rows={4}
            placeholder="Tell us about your project…"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            style={{
              ...fieldBase,
              resize: "vertical",
              minHeight: 90,
              lineHeight: 1.6,
            }}
            onFocus={e => {
              (e.target as HTMLTextAreaElement).style.borderColor = "rgba(168,85,247,0.55)";
              (e.target as HTMLTextAreaElement).style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.1)";
            }}
            onBlur={e => {
              (e.target as HTMLTextAreaElement).style.borderColor = "rgba(168,85,247,0.22)";
              (e.target as HTMLTextAreaElement).style.boxShadow   = "none";
            }}
          />
        </div>

        {/* Captcha */}
        {captchaEnabled && (
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
            <TurnstileWidget onVerify={setCaptchaToken} resetSignal={captchaReset} theme="dark" />
          </div>
        )}

        {/* Submit */}
        <button
          className="btn-main"
          style={{
            width: "100%",
            padding: "11px",
            fontSize: 13,
            fontWeight: 700,
            opacity: status === "loading" ? 0.7 : 1,
            cursor: status === "loading" ? "not-allowed" : "pointer",
          }}
          onClick={handleSubmit}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending…" : "Send Message →"}
        </button>
      </div>

      <style>{`
        /* Stack Name + Email on mobile */
        @media (max-width: 520px) {
          .cf-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
