"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PortfolioProject } from "@/types/portfolio";
import ProjectCard from "@/app/portfolio/_components/ProjectCard";

const TABS = [
  { id: "latest", label: "Latest Projects" },
  { id: "featured", label: "Featured Projects" },
  { id: "branding", label: "Latest Branding" },
  { id: "website", label: "Latest Website" },
  { id: "video", label: "Latest Video" },
  { id: "publication", label: "Latest Publication" },
] as const;

function byYear(a: PortfolioProject, b: PortfolioProject) {
  return Number(b.year || 0) - Number(a.year || 0);
}

export default function HomePortfolio({ projects }: { projects: PortfolioProject[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("featured");

  const groups = useMemo(() => {
    const published = projects.filter((p) => p.status !== "archived");
    return {
      latest: [...published].sort(byYear).slice(0, 6),
      featured: published.filter((p) => p.featured).slice(0, 6),
      branding: published.filter((p) => /brand|identity|logo/i.test(p.category || "")).sort(byYear).slice(0, 6),
      website: published.filter((p) => /website|ui\/ux|app/i.test(p.category || "")).sort(byYear).slice(0, 6),
      video: published.filter((p) => /video|youtube|motion|instagram/i.test(p.category || "")).sort(byYear).slice(0, 6),
      publication: published.filter((p) => /profile|catalogue|publication|print|magazine|deck|proposal/i.test(p.category || "")).sort(byYear).slice(0, 6),
    };
  }, [projects]);

  const visible = groups[tab];

  return (
    <section style={{ padding: "90px 5%", background: "var(--cyber-bg2)", borderTop: "1px solid var(--cyber-border)", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#a855f7", textTransform: "uppercase", marginBottom: 12 }}>Creative Showcase</p>
          <h2 className="cyber-section-heading" style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 14 }}>
            Latest work. <span className="grad-text">Featured craft.</span>
          </h2>
          <p style={{ color: "var(--cyber-body)", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
            Branding, websites, video, and publications — automatically grouped from the showcase.
          </p>
        </div>
        <div className="portfolio-tabs" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                padding: "9px 16px",
                borderRadius: 100,
                border: tab === item.id ? "1px solid transparent" : "1px solid rgba(124,58,237,0.25)",
                background: tab === item.id ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(124,58,237,0.08)",
                color: tab === item.id ? "#fff" : "#a855f7",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
          {visible.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link href="/portfolio">
            <button className="cyber-btn-outline" style={{ padding: "13px 32px", fontSize: 15 }}>
              Open the full showcase →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
