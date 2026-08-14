"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PREMIUM_RESOURCES, RESOURCE_CATEGORIES } from "@/app/portfolio/_data/resources";
import type { PremiumResource } from "@/types/portfolio";
import { SERVICE_HREFS } from "@/lib/portfolio-showcase";

const STORAGE_KEY = "psh-unlocked-resources";
const ADMIN_KEY = "psh-admin-resources";

function loadUnlocked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadAdminResources(): PremiumResource[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />}>
      <ResourcesLibrary />
    </Suspense>
  );
}

function ResourcesLibrary() {
  const params = useSearchParams();
  const type = params.get("type");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [active, setActive] = useState<PremiumResource | null>(null);
  const [adminExtras, setAdminExtras] = useState<PremiumResource[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setUnlocked(loadUnlocked());
    setAdminExtras(loadAdminResources());
  }, []);

  useEffect(() => {
    if (!type) return;
    const match = [...PREMIUM_RESOURCES, ...adminExtras].find((item) => item.slug === type || item.category.toLowerCase().replace(/\s+/g, "-") === type);
    if (match) setActive(match);
  }, [type, adminExtras]);

  const resources = useMemo(() => {
    const all = [...PREMIUM_RESOURCES, ...adminExtras].filter((item) => item.status === "published");
    return all.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const hay = `${item.title} ${item.description} ${item.tags.join(" ")} ${item.category}`.toLowerCase();
      return matchesCategory && hay.includes(query.toLowerCase());
    });
  }, [adminExtras, category, query]);

  async function unlock(resource: PremiumResource) {
    if (resource.emailGate && !unlocked.includes(resource.id)) {
      if (!email.includes("@")) {
        setStatus("Enter a valid email to unlock this download.");
        return;
      }
      try {
        await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: `resource:${resource.slug}` }),
        });
      } catch {
        // still unlock locally so the library remains usable offline
      }
      const next = [...unlocked, resource.id];
      setUnlocked(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    setStatus("Download ready.");
    if (resource.pdfUrl) window.open(resource.pdfUrl, "_blank", "noopener,noreferrer");
  }

  const canDownload = (resource: PremiumResource) => !resource.emailGate || unlocked.includes(resource.id);

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />
      <section style={{ padding: "140px 5% 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 40% 0%,rgba(124,58,237,0.16),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#6d28d9", textTransform: "uppercase" }}>Premium Resources</p>
          <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(40px,7vw,72px)", fontWeight: 900, letterSpacing: "-2px", margin: "10px 0 16px" }}>
            The Resource <span className="grad-text">Library</span>
          </h1>
          <p style={{ maxWidth: 640, color: "var(--text-muted)", fontSize: 18, lineHeight: 1.8 }}>
            Company profiles, decks, guidelines, catalogues, and capability documents — preview, download, and share with your team.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 5% 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="portfolio-search-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 220px", gap: 12, marginBottom: 24 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources, tags, categories…" style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(124,58,237,0.2)", background: "var(--bg-card)", color: "var(--text-primary)" }} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "12px 12px", borderRadius: 12, border: "1px solid rgba(124,58,237,0.2)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
              <option>All</option>
              {RESOURCE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {resources.map((resource) => (
              <article key={resource.id} className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase" }}>{resource.category} · v{resource.version}</div>
                <h2 style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 800, margin: 0 }}>{resource.title}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, flex: 1 }}>{resource.description}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {resource.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 100, background: "rgba(124,58,237,0.08)" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setActive(resource)} className="btn-outline" style={{ padding: "9px 12px", fontSize: 13, cursor: "pointer" }}>Preview</button>
                  <button onClick={() => unlock(resource)} className="btn-main" style={{ padding: "9px 12px", fontSize: 13, cursor: "pointer" }}>
                    {canDownload(resource) ? "Download" : "Unlock"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,6,24,0.72)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setActive(null)}>
          <div className="glass-card" style={{ maxWidth: 560, width: "100%", padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase" }}>{active.category} · Version {active.version}</div>
            <h3 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, margin: "8px 0 10px" }}>{active.title}</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{active.description}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {active.relatedServices.map((service) => (
                <Link key={service} href={SERVICE_HREFS[service] || "/services"} style={{ fontSize: 12, color: "#6d28d9", fontWeight: 700 }}>{service}</Link>
              ))}
            </div>
            {active.emailGate && !unlocked.includes(active.id) && (
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email to unlock download" style={{ width: "100%", marginBottom: 12, padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(124,58,237,0.25)", background: "var(--bg-card)", color: "var(--text-primary)" }} />
            )}
            {status && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{status}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => unlock(active)} className="btn-main" style={{ padding: "12px 18px", cursor: "pointer" }}>
                {canDownload(active) ? "Download PDF" : "Email me the file"}
              </button>
              <button onClick={() => setActive(null)} className="btn-outline" style={{ padding: "12px 18px", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
