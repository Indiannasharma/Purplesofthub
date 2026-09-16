"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ProjectCard from "./_components/ProjectCard";
import ProjectSpotlight from "./_components/ProjectSpotlight";
import { fetchPublishedProjectsClient } from "@/lib/portfolio.client";
import { normalizeProjects } from "@/lib/portfolio-normalize";
import { PORTFOLIO_PROJECTS } from "./_data/portfolio";
import type { PortfolioProject } from "@/types/portfolio";

const FILTERS = ["All", "Web", "Brand", "Mobile", "Music"] as const;
type Filter = (typeof FILTERS)[number];

const MATCH: Record<Filter, string[]> = {
  All: [],
  Web: ["web", "website", "ui", "ux", "saas"],
  Brand: ["brand", "identity", "logo", "fashion", "graphic"],
  Mobile: ["mobile", "app", "ios", "android"],
  Music: ["music", "audio", "spotify", "artist"],
};

function matches(project: PortfolioProject, filter: Filter) {
  if (filter === "All") return true;
  const text = [project.title, project.category, project.service, project.industry, project.overview, ...(project.tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return MATCH[filter].some((term) => text.includes(term));
}

const VALUES = [
  {
    number: "01",
    title: "Discovery & strategy",
    copy: "We start with the market, the audience, and the metric that matters — so design decisions are grounded in evidence, never guesswork.",
  },
  {
    number: "02",
    title: "Design systems that scale",
    copy: "Typography, colour, grid, and components are defined once, then reused with confidence across every channel you own.",
  },
  {
    number: "03",
    title: "Launch with proof",
    copy: "Responsive builds, sensible performance budgets, and analytics wired in from day one so results stay visible.",
  },
];
export default function PortfolioPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [projects, setProjects] = useState<PortfolioProject[]>(normalizeProjects(PORTFOLIO_PROJECTS));

  useEffect(() => {
    let active = true;
    fetchPublishedProjectsClient().then((published) => {
      if (active && published.length) setProjects(normalizeProjects(published));
    });
    return () => {
      active = false;
    };
  }, []);

  const published = useMemo(() => projects.filter((p) => p.status !== "archived"), [projects]);

  const visible = useMemo(
    () => published.filter((p) => matches(p, filter)),
    [published, filter]
  );

  const counts = useMemo(
    () => FILTERS.map((item) => ({ item, count: published.filter((p) => matches(p, item)).length })),
    [published]
  );

  const stats = useMemo(() => {
    const industries = new Set(published.map((p) => p.industry).filter(Boolean));
    const deliverables = published.reduce(
      (total, p) => total + (p.deliverablesCount ?? p.deliverables?.length ?? 0),
      0
    );
    const years = published
      .map((p) => Number(p.year))
      .filter((year) => Number.isFinite(year) && year > 2000);
    const span = years.length ? `${Math.min(...years)}—${Math.max(...years)}` : "Ongoing";

    return [
      { value: `${published.length}`, label: "Case studies" },
      { value: `${industries.size}`, label: "Industries served" },
      { value: deliverables ? `${deliverables}+` : "End-to-end", label: "Assets delivered" },
      { value: span, label: "Years of practice" },
    ];
  }, [published]);

  const spotlight = filter === "All" ? visible.find((p) => p.featured) : undefined;
  const gridProjects = spotlight ? visible.filter((p) => p.slug !== spotlight.slug) : visible;

  return (
    <main className="pf-page">
      <Navbar />

      <div className="pf-backdrop" aria-hidden="true">
        <span className="pf-backdrop-glow pf-backdrop-glow-a" />
        <span className="pf-backdrop-glow pf-backdrop-glow-b" />
      </div>

      <section className="pf-hero">
        <div className="pf-shell">
          <Reveal>
            <p className="pf-eyebrow">
              <span className="pf-eyebrow-dot" aria-hidden="true" />
              Portfolio · Selected work
            </p>
            <h1 className="pf-hero-title">
              Work we are <span>proud of.</span>
            </h1>
            <p className="pf-hero-copy">
              Brands, platforms, and campaigns designed and shipped for clients across Africa and
              beyond — each one built to earn attention and turn it into measurable growth.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="pf-hero-actions">
              <Link href="/contact" className="pf-btn pf-btn-primary">
                Start a project
                <span className="pf-card-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href="/services" className="pf-btn pf-btn-ghost">
                Browse services
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="pf-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="pf-stat">
                  <dt className="pf-stat-label">{stat.label}</dt>
                  <dd className="pf-stat-value">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <div className="pf-toolbar">
        <div className="pf-shell pf-toolbar-inner">
          <nav className="pf-filters" aria-label="Filter work">
            {counts.map(({ item, count }) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`pf-chip${filter === item ? " is-active" : ""}`}
              >
                {item}
                <span className="pf-chip-count">{count}</span>
              </button>
            ))}
          </nav>
          <p className="pf-result-count">
            Showing <strong>{visible.length}</strong> of {published.length} projects
          </p>
        </div>
      </div>
<section className="pf-section">
        <div className="pf-shell">
          {spotlight ? (
            <Reveal>
              <ProjectSpotlight project={spotlight} />
            </Reveal>
          ) : null}

          {gridProjects.length ? (
            <div className="pf-grid">
              {gridProjects.map((project, index) => (
                <Reveal key={project.slug} delay={Math.min(index, 5) * 0.06}>
                  <ProjectCard project={project} index={index} />
                </Reveal>
              ))}
            </div>
          ) : null}

          {!visible.length ? (
            <div className="pf-empty">
              <p className="pf-empty-title">Nothing in this category yet.</p>
              <p className="pf-empty-copy">
                Try another filter, or browse the full body of work.
              </p>
              <button type="button" className="pf-btn pf-btn-primary" onClick={() => setFilter("All")}>
                Show all work
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="pf-section pf-section-values">
        <div className="pf-shell">
          <Reveal>
            <p className="pf-eyebrow">
              <span className="pf-eyebrow-dot" aria-hidden="true" />
              How we work
            </p>
            <h2 className="pf-section-title">
              Premium is a process, <span>not a filter.</span>
            </h2>
          </Reveal>

          <div className="pf-values">
            {VALUES.map((value, index) => (
              <Reveal key={value.number} delay={index * 0.08}>
                <article className="pf-value">
                  <span className="pf-value-number" aria-hidden="true">
                    {value.number}
                  </span>
                  <h3>{value.title}</h3>
                  <p>{value.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-section pf-section-cta">
        <div className="pf-shell">
          <Reveal>
            <div className="pf-cta">
              <div className="pf-cta-inner">
                <p className="pf-eyebrow pf-eyebrow-light">Start a project</p>
                <h2 className="pf-cta-title">Have something in mind?</h2>
                <p className="pf-cta-copy">
                  Tell us the goal and the deadline. We will come back with a clear scope, a
                  timeline, and the shape of the work.
                </p>
              </div>
              <div className="pf-cta-actions">
                <Link href="/contact" className="pf-btn pf-btn-light">
                  Talk to us
                  <span className="pf-card-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <a href="mailto:hello@purplesofthub.com" className="pf-cta-mail">
                  hello@purplesofthub.com
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}