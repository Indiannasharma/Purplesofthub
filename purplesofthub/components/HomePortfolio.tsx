"use client";

import Link from "next/link";
import type { PortfolioProject } from "@/types/portfolio";
import ProjectCard from "@/app/portfolio/_components/ProjectCard";

export default function HomePortfolio({ projects }: { projects: PortfolioProject[] }) {
  const published = projects.filter((p) => p.status !== "archived");
  const featured = published.filter((p) => p.featured);
  const visible = (featured.length ? featured : published).slice(0, 6);

  if (!visible.length) return null;

  return (
    <section style={{ padding: "88px 5%", background: "var(--cyber-bg2)", borderTop: "1px solid var(--cyber-border)", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#a855f7", textTransform: "uppercase", marginBottom: 12 }}>Selected work</p>
          <h2 className="cyber-section-heading" style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", margin: 0 }}>
            Recent <span className="grad-text">projects.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 28 }}>
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/portfolio" className="cyber-btn-outline" style={{ padding: "13px 32px", fontSize: 15, display: "inline-block", textDecoration: "none" }}>
            View all work
          </Link>
        </div>
      </div>
    </section>
  );
}
