"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchPublishedProjectsClient } from "@/lib/portfolio.client";
import { normalizeProjects } from "@/lib/portfolio-normalize";
import { PORTFOLIO_PROJECTS } from "./_data/portfolio";
import { WHATSAPP_URL } from "@/lib/portfolio-showcase";
import type { PortfolioProject } from "@/types/portfolio";

/* ─────────────────────────────────────────────
   CATEGORY FILTERS — derived from existing data
───────────────────────────────────────────── */
const CATEGORIES = ["All", "Branding", "Web", "Graphic Design", "Social Media", "Video", "Marketing"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_MATCHERS: Record<Category, string[]> = {
  All: [],
  Branding: ["brand", "branding", "identity", "logo", "event branding"],
  Web: ["web", "website", "ui", "ux", "app", "product", "mobile"],
  "Graphic Design": ["graphic", "design", "print", "poster", "brochure", "flyer", "catalogue", "profile", "deck", "proposal", "publication", "magazine", "report", "presentation"],
  "Social Media": ["social", "instagram", "facebook", "linkedin", "content", "campaign"],
  Video: ["video", "motion", "animation", "film", "production", "youtube", "podcast"],
  Marketing: ["marketing", "ad", "seo", "ai", "growth", "campaign"],
};

/* ─────────────────────────────────────────────
   SERVICE SHOWCASE — from existing website data
───────────────────────────────────────────── */
const SERVICE_GROUPS = [
  {
    label: "Branding",
    title: "We create identities people remember.",
    description: "Logos, brand identity, visual systems and brand assets that give businesses a distinctive voice.",
    items: ["Logo Design", "Brand Identity", "Brand Guidelines", "Visual Design"],
    href: "/services/branding-design",
    color: "#a855f7",
  },
  {
    label: "Web & Digital",
    title: "Digital experiences built to perform.",
    description: "Websites, landing pages, platforms and digital experiences designed to convert and scale.",
    items: ["Web Design", "Website Development", "UI/UX", "Landing Pages"],
    href: "/services/web-development",
    color: "#7c3aed",
  },
  {
    label: "Graphic Design",
    title: "Visuals that communicate with clarity.",
    description: "Marketing graphics, catalogues, presentations, promotional materials and campaign visuals.",
    items: ["Corporate Profiles", "Product Catalogues", "Presentations", "Print Design"],
    href: "/services/content-creation",
    color: "#8b5cf6",
  },
  {
    label: "Social Media",
    title: "Content that connects and converts.",
    description: "Social media graphics, campaigns and visual content built for engagement and growth.",
    items: ["Social Graphics", "Campaigns", "Content Design", "Ad Creatives"],
    href: "/services/social-media-management",
    color: "#c084fc",
  },
  {
    label: "Video & Content",
    title: "Stories that move people.",
    description: "Video production, editing, promotional content and digital storytelling that captures attention.",
    items: ["Video Editing", "Motion Graphics", "YouTube Content", "Promo Videos"],
    href: "/services/content-creation",
    color: "#a855f7",
  },
  {
    label: "Marketing & Growth",
    title: "Strategy that drives measurable results.",
    description: "Digital marketing, SEO, advertising and content marketing that grows your business.",
    items: ["Digital Marketing", "SEO", "Google Ads", "Meta Ads"],
    href: "/services/digital-marketing",
    color: "#6d28d9",
  },
];

const MARQUEE_SERVICES = [
  "Branding", "Web Development", "Graphic Design", "Video", "Social Media",
  "Digital Marketing", "SEO", "Content", "UI/UX", "Mobile Apps",
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function imageFor(project: PortfolioProject) {
  return project.coverImage || project.featuredThumbnail || project.heroBanner || project.gallery[0] || null;
}

function matches(project: PortfolioProject, category: Category) {
  if (category === "All") return true;
  const text = [
    project.title, project.category, project.service, project.industry,
    project.overview, ...project.tags, ...project.servicesUsed, ...project.deliverables,
  ].filter(Boolean).join(" ").toLowerCase();
  return CATEGORY_MATCHERS[category].some((term) => text.includes(term));
}

function categoryLabel(project: PortfolioProject): string {
  const cat = (project.category || "").toLowerCase();
  if (/brand|identity|logo/.test(cat)) return "Branding";
  if (/web|website|ui|ux|app|mobile/.test(cat)) return "Web";
  if (/social|instagram|facebook/.test(cat)) return "Social Media";
  if (/video|youtube|motion|film/.test(cat)) return "Video";
  if (/marketing|ad|seo|ai/.test(cat)) return "Marketing";
  return "Graphic Design";
}

/* ─────────────────────────────────────────────
   PROJECT VISUAL — premium image treatment
───────────────────────────────────────────── */
function ProjectVisual({ project, className = "", priority = false }: { project: PortfolioProject; className?: string; priority?: boolean }) {
  const src = imageFor(project);
  return (
    <div className={`group relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#2a1058,#7c3aed)] ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={project.title}
          fill
          priority={priority}
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="flex h-full items-end p-6 text-white">
          <span className="text-6xl drop-shadow-[0_8px_24px_rgba(124,58,237,0.4)]">{project.emoji || "✦"}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />
      <span className="absolute bottom-5 left-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
        {categoryLabel(project)}
      </span>
      <span className="absolute bottom-5 right-5 translate-y-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#31105d] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">
        View Project ↗
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROJECT CARD — clean premium presentation
───────────────────────────────────────────── */
function ProjectCard({ project, className = "", index = 0 }: { project: PortfolioProject; className?: string; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={className}
    >
      <Link href={`/portfolio/${project.slug}`} className="group block">
        <ProjectVisual project={project} className="aspect-[4/3]" />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">{project.title}</h3>
            <p className="mt-1 line-clamp-1 text-sm text-[var(--text-secondary)]">
              {project.overview || "A considered digital experience by PurpleSoftHub."}
            </p>
          </div>
          <span className="pt-1 text-lg text-[var(--primary)] transition-transform duration-300 group-hover:translate-x-1">↗</span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function PortfolioPage() {
  const [category, setCategory] = useState<Category>("All");
  const [projects, setProjects] = useState<PortfolioProject[]>(normalizeProjects(PORTFOLIO_PROJECTS));
  const [heroProjects, setHeroProjects] = useState<PortfolioProject[]>([]);
  const workRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    fetchPublishedProjectsClient().then((published) => {
      if (active && published.length) {
        const normalized = normalizeProjects(published);
        setProjects(normalized);
        setHeroProjects(normalized.filter((p) => p.featured).slice(0, 3));
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (heroProjects.length === 0) {
      setHeroProjects(projects.filter((p) => p.featured).slice(0, 3));
    }
  }, [projects, heroProjects.length]);

  const visible = useMemo(
    () => projects.filter((project) => matches(project, category)).sort((a, b) => Number(b.featured) - Number(a.featured)),
    [category, projects]
  );

  const featured = visible[0];
  const rest = visible.slice(1);
  const heroVisuals = heroProjects.length >= 3 ? heroProjects : projects.filter((p) => p.featured).slice(0, 3);

  const scrollToWork = () => {
    workRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="flex min-h-[calc(100vh-68px)] flex-col overflow-x-clip bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO — compact, layered project previews
      ═══════════════════════════════════════ */}
      <section className="relative border-b border-[color:var(--border)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(168,85,247,0.15),transparent_40%),linear-gradient(135deg,transparent_50%,rgba(124,58,237,0.05))]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left — copy */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]"
              >
                PurpleSoftHub / Selected Work
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-[4.5rem]"
              >
                We turn ideas into{" "}
                <span className="grad-text">digital experiences.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg"
              >
                Branding, websites, graphics, video, content and digital experiences
                created for businesses, brands and organizations.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href="/contact"
                  className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Start a Project
                </Link>
                <Link
                  href="/services"
                  className="rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Explore Our Services
                </Link>
              </motion.div>
            </div>

            {/* Right — layered project previews */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="relative hidden h-[320px] lg:block"
              aria-hidden="true"
            >
              {heroVisuals[0] && (
                <Link href={`/portfolio/${heroVisuals[0].slug}`} className="group absolute right-0 top-0 z-10 block w-[62%]">
                  <ProjectVisual project={heroVisuals[0]} className="aspect-[4/3] shadow-[0_20px_60px_rgba(124,58,237,0.25)]" priority />
                </Link>
              )}
              {heroVisuals[1] && (
                <Link href={`/portfolio/${heroVisuals[1].slug}`} className="group absolute bottom-0 left-0 z-20 block w-[48%]">
                  <ProjectVisual project={heroVisuals[1]} className="aspect-[4/3] shadow-[0_16px_48px_rgba(124,58,237,0.2)]" />
                </Link>
              )}
              {heroVisuals[2] && (
                <Link href={`/portfolio/${heroVisuals[2].slug}`} className="group absolute bottom-6 right-[8%] z-30 block w-[36%]">
                  <ProjectVisual project={heroVisuals[2]} className="aspect-[4/3] shadow-[0_12px_36px_rgba(124,58,237,0.18)]" />
                </Link>
              )}
              {/* Decorative glow */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--primary)]/20 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORY NAVIGATION — sticky horizontal
      ═══════════════════════════════════════ */}
      <div className="sticky top-[68px] z-40 border-b border-[color:var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Portfolio categories" className="flex gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--primary)]"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SELECTED WORK — editorial layout
      ═══════════════════════════════════════ */}
      <section ref={workRef} id="work" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-4 border-b border-[color:var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">The work</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Selected Work</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">A look at what we've been building.</p>
          </div>
          <button
            type="button"
            onClick={scrollToWork}
            className="hidden text-sm font-medium text-[var(--primary)] transition hover:opacity-80 sm:block"
          >
            Scroll to explore ↓
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {featured ? (
              <Link
                href={`/portfolio/${featured.slug}`}
                className="group mt-10 grid gap-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-end"
              >
                <ProjectVisual project={featured} className="aspect-[16/9] lg:aspect-[1.35/1]" priority />
                <div className="max-w-md pb-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                    Featured project
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                    {featured.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                    {featured.overview || "A focused creative project designed to make the next move clearer."}
                  </p>
                  <span className="mt-6 inline-flex text-sm font-semibold text-[var(--primary)]">
                    View Project <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">↗</span>
                  </span>
                </div>
              </Link>
            ) : null}

            {/* Asymmetric editorial grid */}
            <div className="mt-16 grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-12">
              {rest.map((project, index) => (
                <ProjectCard
                  key={`${project.slug}-${index}`}
                  project={project}
                  index={index}
                  className={index % 3 === 1 ? "lg:col-span-5 lg:mt-16" : "lg:col-span-7"}
                />
              ))}
            </div>

            {visible.length === 0 && (
              <div className="mt-16 rounded-[1.5rem] border border-dashed border-[color:var(--border)] p-12 text-center">
                <p className="text-4xl">✦</p>
                <p className="mt-4 text-lg font-semibold">No projects in this category yet.</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  New work is being added — check back soon.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ═══════════════════════════════════════
          CREATIVE SERVICES STRIP — marquee
      ═══════════════════════════════════════ */}
      <section className="border-y border-[color:var(--border)] bg-[var(--bg-secondary)]/45 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            From idea to execution
          </p>
        </div>
        <div className="relative mt-6 overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
            {[...MARQUEE_SERVICES, ...MARQUEE_SERVICES].map((service, index) => (
              <span key={`${service}-${index}`} className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]/70 sm:text-3xl">
                {service}
                <span className="ml-8 text-[var(--primary)]">·</span>
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-primary)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-primary)] to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICE SHOWCASE — editorial
      ═══════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">What we create</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl">
            Creative services with somewhere to go.
          </h2>
        </div>

        <div className="mt-12 space-y-16">
          {SERVICE_GROUPS.map((group, groupIndex) => {
            const groupProjects = projects.filter((p) => matches(p, group.label as Category)).slice(0, 2);
            return (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: groupIndex * 0.05 }}
                className="grid gap-8 border-b border-[color:var(--border)] pb-14 last:border-0 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                    {group.label}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                    {group.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
                    {group.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={group.href}
                    className="mt-6 inline-flex text-sm font-semibold text-[var(--primary)] transition hover:opacity-80"
                  >
                    Explore {group.label} <span className="ml-2">→</span>
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {groupProjects.length > 0 ? (
                    groupProjects.map((project, i) => (
                      <Link key={project.slug} href={`/portfolio/${project.slug}`} className="group">
                        <ProjectVisual project={project} className={i === 0 ? "aspect-[4/3]" : "aspect-[4/3] sm:mt-8"} />
                        <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{project.title}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-dashed border-[color:var(--border)]">
                      <span className="text-4xl opacity-30">✦</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHAT WE DO
      ═══════════════════════════════════════ */}
      <section className="border-y border-[color:var(--border)] bg-[var(--bg-secondary)]/45">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                More than a portfolio
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                We're a Digital Innovation Studio.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-[var(--text-secondary)]">
                Helping businesses turn ideas into brands, products and digital experiences.
                From strategy to launch, we craft work that performs.
              </p>
              <Link
                href="/services"
                className="mt-7 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Explore Our Services →
              </Link>
            </div>
            <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--border)] sm:grid-cols-2">
              {SERVICE_GROUPS.map((group) => (
                <div key={group.label} className="bg-[var(--bg-primary)] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                    {group.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {group.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#281044] px-6 py-12 text-white sm:px-10 sm:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.3),transparent_50%)]" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Have an idea worth building?
            </p>
            <div className="mt-4 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                Let's turn it into something people remember.
              </h2>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#281044] transition hover:opacity-90"
                >
                  Start a Project
                </Link>
                <Link
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50"
                >
                  Talk to Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}