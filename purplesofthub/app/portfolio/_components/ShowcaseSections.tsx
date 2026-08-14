"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PortfolioProject } from "@/types/portfolio";
import {
  SHOWCASE_INDUSTRIES,
  SHOWCASE_SERVICES,
  TRUST_CLIENTS,
  comparisonLabel,
} from "@/lib/portfolio-showcase";

export function IndustryGrid({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (name: string) => void;
}) {
  return (
    <section style={{ padding: "72px 5%", background: "var(--bg-secondary)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#6d28d9", textTransform: "uppercase" }}>Client Industries</p>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, margin: "8px 0 0" }}>
            Built for <span className="grad-text">every sector</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
          {SHOWCASE_INDUSTRIES.map((item) => {
            const selected = active === item.name;
            return (
              <button
                key={item.name}
                onClick={() => onSelect(selected ? "All Industries" : item.name)}
                className="glass-card"
                style={{
                  padding: "18px 12px",
                  textAlign: "center",
                  cursor: "pointer",
                  border: selected ? "1px solid rgba(124,58,237,0.55)" : undefined,
                  background: selected ? "rgba(124,58,237,0.12)" : undefined,
                }}
              >
                <div style={{ fontSize: 26 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8 }}>{item.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ServiceIconCards() {
  return (
    <section style={{ padding: "72px 5%" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#6d28d9", textTransform: "uppercase" }}>Services Used</p>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, margin: "8px 0 0" }}>
            Craft across <span className="grad-text">every discipline</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
          {SHOWCASE_SERVICES.map((item) => (
            <Link key={item.name} href={item.href} className="glass-card" style={{ padding: "20px 14px", textAlign: "center", textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: 28 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8 }}>{item.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustLogoWall() {
  const row = [...TRUST_CLIENTS, ...TRUST_CLIENTS];
  return (
    <section style={{ padding: "72px 0", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: 28, padding: "0 5%" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#6d28d9", textTransform: "uppercase" }}>Trust</p>
        <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, margin: "8px 0 0" }}>
          Trusted by <span className="grad-text">Growing Businesses</span>
        </h2>
      </div>
      <div style={{ display: "flex", overflow: "hidden" }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          style={{ display: "flex", gap: 16, minWidth: "max-content", padding: "8px 0" }}
        >
          {row.map((client, index) => (
            <div key={`${client.name}-${index}`} className="glass-card" style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 20 }}>{client.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{client.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function ComparisonGallery({ projects }: { projects: PortfolioProject[] }) {
  const types = [
    { id: "all", label: "Before / After" },
    { id: "brand-refresh", label: "Brand Refresh" },
    { id: "website-redesign", label: "Website Redesign" },
    { id: "logo-evolution", label: "Logo Evolution" },
  ];
  const [active, setActive] = useState("all");
  const items = projects.filter((project) => project.comparison && (active === "all" || project.comparison.type === active)).slice(0, 8);
  if (!items.length) return null;
  return (
    <section style={{ padding: "72px 5%", background: "var(--bg-secondary)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#6d28d9", textTransform: "uppercase" }}>Portfolio Comparison</p>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, margin: "8px 0 0" }}>
            Before, after, and <span className="grad-text">the evolution</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          {types.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              padding: "8px 14px",
              borderRadius: 100,
              cursor: "pointer",
              border: active === item.id ? "1px solid transparent" : "1px solid rgba(124,58,237,0.2)",
              background: active === item.id ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(124,58,237,0.08)",
              color: active === item.id ? "#fff" : "#6d28d9",
              fontWeight: 700,
              fontSize: 12,
            }}>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {items.map((project) => (
            <Link key={project.slug} href={`/portfolio/${project.slug}`} className="glass-card" style={{ padding: 18, textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: 0.8 }}>
                {comparisonLabel(project.comparison?.type)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" }}>
                <div style={{ borderRadius: 12, minHeight: 88, background: "linear-gradient(135deg,#1f2937,#4b5563)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>Before</div>
                <div style={{ borderRadius: 12, minHeight: 88, background: `linear-gradient(135deg, ${project.color}, #a855f7)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>After</div>
              </div>
              <div style={{ fontFamily: "Outfit", fontWeight: 800 }}>{project.title}</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>{project.comparison?.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
