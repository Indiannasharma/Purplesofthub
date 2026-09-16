"use client";

import Link from "next/link";
import type { PortfolioProject } from "@/types/portfolio";

export default function HomePortfolio({ projects }: { projects: PortfolioProject[] }) {
  const published = projects.filter((p) => p.status !== "archived");
  const featured = published.filter((p) => p.featured);
  const visible = (featured.length ? featured : published).slice(0, 6);

  if (!visible.length) return null;

  return (
    <section className="home-work-section">
      <div className="home-work-shell">
        <div className="home-work-header">
          <div>
            <p className="home-work-eyebrow">Selected work</p>
            <h2 className="home-work-title">
              Real projects, shaped into <span>premium digital proof.</span>
            </h2>
          </div>
          <p className="home-work-copy">
            A tighter look at the brands, platforms, and campaigns PurpleSoftHub has already helped shape.
          </p>
        </div>

        <div className="home-work-grid">
          {visible.map((project) => (
            <Link key={project.slug} href={`/portfolio/${project.slug}`} className="home-work-card">
              <div className="home-work-media">
                {project.coverImage || project.featuredThumbnail || project.heroBanner || project.gallery?.[0] ? (
                  <img
                    src={project.coverImage || project.featuredThumbnail || project.heroBanner || project.gallery?.[0] || ""}
                    alt={project.title}
                  />
                ) : (
                  <div className="home-work-fallback" aria-hidden="true">
                    <span>{project.emoji || "PSH"}</span>
                  </div>
                )}
                <div className="home-work-shade" />
                <span className="home-work-category">{project.category || "Case study"}</span>
              </div>

              <div className="home-work-body">
                <div>
                  <p className="home-work-client">{project.clientName || project.industry || "PurpleSoftHub client"}</p>
                  <h3>{project.title}</h3>
                  <p className="home-work-summary">
                    {project.overview || project.finalSolution || project.challenge || "A focused digital project built to improve brand presence and customer action."}
                  </p>
                </div>

                <div className="home-work-meta">
                  {(project.tags?.length ? project.tags : project.servicesUsed || []).slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="home-work-link">
                  View case study
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="home-work-action">
          <Link href="/portfolio" className="cyber-btn-outline" style={{ padding: "13px 32px", fontSize: 15, display: "inline-block", textDecoration: "none" }}>
            View all work
          </Link>
        </div>
      </div>
    </section>
  );
}
