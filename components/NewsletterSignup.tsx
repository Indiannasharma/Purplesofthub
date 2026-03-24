"use client";
import { useState } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const handleSubmit = async () => {
    if (!email.trim()) { setStatus("error"); setMessage("Please enter your email."); return; }
    if (captchaEnabled && !captchaToken) { setStatus("error"); setMessage("Please complete the captcha."); return; }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You're subscribed!");
        setEmail("");
        setCaptchaToken("");
        setCaptchaReset((v) => v + 1);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section style={{ padding: "80px 5%", background: "rgba(124,58,237,.05)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 20, fontSize: 12, fontWeight: 600, color: "#c084fc", letterSpacing: 1 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
          NEWSLETTER
        </div>
        <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, color: "inherit", letterSpacing: "-1px", marginBottom: 12 }}>
          Stay in the <span className="grad-text">Loop</span>
        </h2>
        <p style={{ color: "#9d8fd4", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
          Get the latest tech insights, marketing tips, and exclusive updates from PurpleSoftHub — straight to your inbox.
        </p>

        {status === "success" ? (
          <div style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 14, padding: "20px 24px", color: "#86efac", fontSize: 15, fontWeight: 600 }}>
            🎉 {message} Check your inbox for a welcome email!
          </div>
        ) : (
          <>
            {status === "error" && message && (
              <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#fca5a5", fontSize: 14 }}>
                ⚠️ {message}
              </div>
            )}
            {captchaEnabled && (
              <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                <TurnstileWidget onVerify={setCaptchaToken} resetSignal={captchaReset} theme="dark" />
              </div>
            )}
            <div className="newsletter-row" style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto", flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{ flex: 1, minWidth: 200, padding: "13px 18px", borderRadius: 50, background: "rgba(255,255,255,.05)", border: "1px solid rgba(168,85,247,.25)", color: "inherit", fontSize: 15, fontFamily: "Outfit", outline: "none" }}
              />
              <button
                className="btn-main"
                onClick={handleSubmit}
                disabled={status === "loading"}
                style={{ padding: "13px 26px", fontSize: 15, opacity: status === "loading" ? 0.7 : 1, whiteSpace: "nowrap" }}
              >
                {status === "loading" ? "Subscribing..." : "Subscribe →"}
              </button>
            </div>
            <p style={{ color: "#3d2f60", fontSize: 12, marginTop: 14 }}>No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </section>
  );
}
