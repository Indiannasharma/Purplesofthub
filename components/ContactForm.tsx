"use client";
import { useState } from "react";

const SERVICES = [
  "Web Development", "Mobile App Development", "Digital Marketing",
  "UI/UX Design", "SaaS Development", "Music Distribution & Promotion", "Tech Consulting",
];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", service: "", message: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "52px 32px", background: "rgba(124,58,237,.1)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 24 }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
        <div style={{ fontFamily: "Outfit", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Message Sent!</div>
        <p style={{ color: "#9d8fd4", marginBottom: 24, fontSize: 15 }}>
          Thanks for reaching out! We'll get back to you within 24 hours. Check your email for a confirmation.
        </p>
        <button className="btn-main" style={{ padding: "10px 24px", fontSize: 14 }}
          onClick={() => setStatus("idle")}>Send Another →</button>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: "40px 36px" }}>
      {errorMsg && (
        <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#fca5a5", fontSize: 14 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {[
        { label: "Full Name *", field: "name", type: "text", ph: "Your full name" },
        { label: "Email Address *", field: "email", type: "email", ph: "your@email.com" },
      ].map(({ label, field, type, ph }) => (
        <div key={field} style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: "#b8a9d9", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{label}</label>
          <input
            type={type} placeholder={ph}
            value={form[field as keyof typeof form]}
            onChange={e => setForm({ ...form, [field]: e.target.value })}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(168,85,247,.2)", color: "#fff", fontSize: 15 }}
          />
        </div>
      ))}

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", color: "#b8a9d9", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Service Needed</label>
        <select
          value={form.service}
          onChange={e => setForm({ ...form, service: e.target.value })}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "rgba(10,5,25,.9)", border: "1px solid rgba(168,85,247,.2)", color: form.service ? "#fff" : "#5b4d8a", fontSize: 15 }}
        >
          <option value="">Select a service...</option>
          {SERVICES.map(s => <option key={s} value={s} style={{ background: "#0d0820" }}>{s}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ display: "block", color: "#b8a9d9", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Message *</label>
        <textarea
          rows={5} placeholder="Tell us about your project..."
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(168,85,247,.2)", color: "#fff", fontSize: 15, resize: "vertical", fontFamily: "Outfit" }}
        />
      </div>

      <button
        className="btn-main"
        style={{ width: "100%", padding: 15, fontSize: 16, opacity: status === "loading" ? 0.7 : 1 }}
        onClick={handleSubmit}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Send Message →"}
      </button>
    </div>
  );
}
