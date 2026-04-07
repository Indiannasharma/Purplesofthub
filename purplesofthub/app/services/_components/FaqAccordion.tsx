"use client";
import { useState } from "react";
import type { ServiceFaq } from "@/app/services/_data/services";

export default function FaqAccordion({ faqs }: { faqs: ServiceFaq[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="glass-card"
          style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div style={{ position: "absolute", top: 0, left: 0, width: 3, bottom: 0, background: "linear-gradient(180deg,#7c3aed,#a855f7)", borderRadius: "4px 0 0 4px" }} />
          <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.4 }}>
              {faq.q}
            </div>
            <div style={{ fontSize: 18, color: "var(--accent)", flexShrink: 0, transition: "transform .2s", transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}>
              +
            </div>
          </div>
          {open === i && (
            <div style={{ padding: "0 28px 22px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.8 }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
