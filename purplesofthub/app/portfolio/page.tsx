"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "./_components/ProjectCard";
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

  const visible = useMemo(
    () => projects.filter((p) => p.status !== "archived").filter((p) => matches(p, filter)),
    [projects, filter]
  );

  return (
    <main className="flex min-h-[calc(100vh-68px)] flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Portfolio</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Work we are proud of.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-secondary)]">
          Brands, products, and campaigns made for clients across Africa and beyond.
        </p>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Filter work">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === item
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {visible.length ? (
          <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-[var(--text-secondary)]">Nothing in this category yet.</p>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] bg-[#281044] px-6 py-10 text-white sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Start a project</p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Have something in mind?</h2>
            <Link href="/contact" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#281044]">
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
