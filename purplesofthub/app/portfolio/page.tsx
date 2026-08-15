"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchPublishedProjectsClient } from "@/lib/portfolio.client";
import { normalizeProjects } from "@/lib/portfolio-normalize";
import { PORTFOLIO_PROJECTS } from "./_data/portfolio";
import type { PortfolioProject } from "@/types/portfolio";

const CATEGORY_TABS = [
  "All",
  "Branding",
  "Graphic Design",
  "Web Design",
  "Social Media",
  "Video",
  "Corporate",
] as const;

const CATEGORY_MATCHERS: Record<(typeof CATEGORY_TABS)[number], string[]> = {
  All: [],
  Branding: ["brand", "branding", "identity", "logo"],
  "Graphic Design": ["graphic", "design", "print", "poster", "brochure", "flyer", "social"],
  "Web Design": ["web", "website", "ui", "ux", "app", "product"],
  "Social Media": ["social", "instagram", "facebook", "linkedin", "content", "campaign"],
  Video: ["video", "motion", "animation", "film", "production"],
  Corporate: ["corporate", "company profile", "proposal", "deck", "presentation", "report"],
};

const SERVICE_CARDS = [
  {
    title: "Brand Identity",
    description: "Modern identity systems with clear logo usage, colour direction, and flexible brand assets.",
  },
  {
    title: "Graphic Design",
    description: "Editorial, marketing, and campaign visuals that stay sharp across print and digital touchpoints.",
  },
  {
    title: "Web Design",
    description: "Premium landing pages and marketing sites that feel fast, clear, and conversion-focused.",
  },
  {
    title: "Social Media",
    description: "Consistent content systems for campaigns, launches, and always-on audience engagement.",
  },
  {
    title: "Video Production",
    description: "Short-form and promotional edits that communicate clearly and keep the brand tone polished.",
  },
  {
    title: "Corporate Assets",
    description: "Company profiles, pitch decks, and presentations that make the business feel credible and ready.",
  },
];

function matchesCategory(project: PortfolioProject, category: (typeof CATEGORY_TABS)[number]) {
  if (category === "All") return true;

  const needle = CATEGORY_MATCHERS[category];
  const haystack = [
    project.title,
    project.category,
    project.service,
    project.industry,
    project.overview,
    ...(project.tags || []),
    ...(project.deliverables || []),
    ...(project.servicesUsed || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return needle.some((term) => haystack.includes(term));
}

function formatMeta(project: PortfolioProject) {
  return [project.service || project.category, project.year, project.clientName]
    .filter(Boolean)
    .join(" · ");
}

function projectKey(project: PortfolioProject) {
  return `${project.slug}-${project.updatedAt || project.createdAt}`;
}

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORY_TABS)[number]>("All");
  const [projects, setProjects] = useState<PortfolioProject[]>(normalizeProjects(PORTFOLIO_PROJECTS));

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      const publishedProjects = await fetchPublishedProjectsClient();
      if (!mounted || !publishedProjects.length) return;
      setProjects(normalizeProjects(publishedProjects));
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleProjects = useMemo(() => {
    return [...projects]
      .filter((project) => matchesCategory(project, activeCategory))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [activeCategory, projects]);

  const featuredCount = useMemo(() => projects.filter((project) => project.featured).length, [projects]);

  return (
    <main className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-[color:var(--border)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.08),transparent_30%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(124,58,237,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-32">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] shadow-sm backdrop-blur">
                Portfolio
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[color:var(--text-primary)] sm:text-5xl lg:text-6xl">
                Creative work that speaks for itself.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--text-secondary)] sm:text-lg">
                Branding, graphic design, websites, social media, video, and digital experiences crafted to feel premium, clear, and built for growth.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Start a Project
                </Link>
                <Link
                  href="#work"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-card)] px-6 py-3 text-sm font-semibold text-[color:var(--text-primary)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
                >
                  View Work
                </Link>
              </div>
              <dl className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
                {[
                  { value: `${featuredCount}+`, label: "Featured projects" },
                  { value: `${projects.length}+`, label: "Published pieces" },
                  { value: "5+ years", label: "Built to scale" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-card)] p-5 shadow-sm backdrop-blur">
                    <dt className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{item.label}</dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle,rgba(168,85,247,0.2),transparent_70%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--bg-card)] shadow-[0_30px_80px_rgba(17,8,40,0.12)] backdrop-blur">
                {visibleProjects[0]?.coverImage || visibleProjects[0]?.heroBanner || visibleProjects[0]?.gallery?.[0] ? (
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={visibleProjects[0].coverImage || visibleProjects[0].heroBanner || visibleProjects[0].gallery[0] || ""}
                      alt={visibleProjects[0].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,3,15,0.8)] via-[rgba(6,3,15,0.15)] to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                        Featured project
                      </div>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em]">{visibleProjects[0].title}</h2>
                      <p className="mt-2 text-sm text-white/75">{formatMeta(visibleProjects[0])}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] items-end bg-[linear-gradient(160deg,rgba(124,58,237,0.9),rgba(40,10,84,0.98))] p-8 text-white">
                    <div>
                      <div className="text-5xl">{visibleProjects[0]?.emoji || "🎨"}</div>
                      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{visibleProjects[0]?.title || "Portfolio spotlight"}</h2>
                      <p className="mt-2 text-sm text-white/75">{visibleProjects[0] ? formatMeta(visibleProjects[0]) : "Selected creative work from PurpleSoftHub"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[color:var(--border)] bg-[color:var(--bg-secondary)]/60" id="work">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-white shadow-sm"
                      : "border-[color:var(--border)] bg-[color:var(--bg-card)] text-[color:var(--text-secondary)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]",
                  ].join(" ")}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Selected work</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">A focused grid of our best recent projects.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[color:var(--text-secondary)]">
            Each card keeps the image front and centre so the work is easy to scan, easy to trust, and easy to move into a client conversation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => {
            const imageSrc = project.coverImage || project.heroBanner || project.gallery?.[0] || null;

            return (
              <Link
                key={projectKey(project)}
                href={`/portfolio/${project.slug}`}
                className="group overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-card)] shadow-[0_12px_32px_rgba(17,8,40,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(17,8,40,0.12)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,rgba(124,58,237,0.16),rgba(168,85,247,0.06))]">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={project.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-end p-6 text-white">
                      <div>
                        <div className="text-5xl">{project.emoji || "🎨"}</div>
                        <p className="mt-3 text-sm text-white/75">{project.category || "Creative work"}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,3,15,0.72)] via-transparent to-transparent opacity-90" />
                  <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                    {project.category || "Portfolio"}
                  </div>
                  {project.featured && (
                    <div className="absolute right-4 top-4 inline-flex rounded-full bg-[color:var(--primary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                      Featured
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-medium text-white/80">{formatMeta(project)}</p>
                  </div>
                </div>

                <div className="space-y-3 p-6">
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">{project.title}</h3>
                  <p className="line-clamp-3 text-sm leading-7 text-[color:var(--text-secondary)]">{project.overview}</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.servicesUsed?.length ? project.servicesUsed : project.deliverables).slice(0, 3).map((item) => (
                      <span key={item} className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-b border-[color:var(--border)] bg-[color:var(--bg-secondary)]/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Services</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">What we deliver for brands, teams, and creators.</h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SERVICE_CARDS.map((service) => (
              <div
                key={service.title}
                className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 shadow-sm backdrop-blur"
              >
                <h3 className="text-lg font-semibold tracking-[-0.02em]">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(124,58,237,0.94),rgba(50,12,103,0.98))] px-6 py-10 text-white shadow-[0_24px_80px_rgba(124,58,237,0.25)] sm:px-10 sm:py-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Need a project like this?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Let&apos;s turn the next idea into polished work that feels premium from day one.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              Whether the brief is branding, web, content, or launch support, we can help shape the creative direction and build the right digital experience.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[color:var(--primary)] transition hover:bg-white/95">
                Start a Project
              </Link>
              <Link href="/services" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
