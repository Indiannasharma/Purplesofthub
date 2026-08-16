"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchPublishedProjectsClient } from "@/lib/portfolio.client";
import { normalizeProjects } from "@/lib/portfolio-normalize";
import { PORTFOLIO_PROJECTS } from "./_data/portfolio";
import type { PortfolioProject } from "@/types/portfolio";

const CATEGORIES = ["All", "Branding", "Web", "Graphics", "Social", "Video", "Corporate"] as const;
type Category = (typeof CATEGORIES)[number];
const CATEGORY_MATCHERS: Record<Category, string[]> = {
  All: [], Branding: ["brand", "branding", "identity", "logo"], Web: ["web", "website", "ui", "ux", "app", "product"],
  Graphics: ["graphic", "design", "print", "poster", "brochure", "flyer"], Social: ["social", "instagram", "facebook", "linkedin", "content", "campaign"],
  Video: ["video", "motion", "animation", "film", "production"], Corporate: ["corporate", "company", "proposal", "deck", "presentation", "report"],
};
const SERVICES = [
  ["Branding", "Brand identity, logos, visual systems and brand assets."], ["Web & Digital", "Websites, landing pages, platforms and digital experiences."],
  ["Graphic Design", "Marketing materials, catalogues, presentations and campaign graphics."], ["Social Media", "Social graphics, content design and visual campaigns."],
  ["Video & Content", "Video editing, promotional content and digital storytelling."],
] as const;

function imageFor(project: PortfolioProject) { return project.coverImage || project.featuredThumbnail || project.heroBanner || project.gallery[0] || null; }
function matches(project: PortfolioProject, category: Category) {
  if (category === "All") return true;
  const text = [project.title, project.category, project.service, project.industry, project.overview, ...project.tags, ...project.servicesUsed, ...project.deliverables].filter(Boolean).join(" ").toLowerCase();
  return CATEGORY_MATCHERS[category].some((term) => text.includes(term));
}

function ProjectVisual({ project, className = "" }: { project: PortfolioProject; className?: string }) {
  const src = imageFor(project);
  return <div className={`group relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#2a1058,#7c3aed)] ${className}`}>
    {src ? <Image src={src} alt={project.title} fill className="object-cover transition duration-700 group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 66vw" /> : <div className="flex h-full items-end p-6 text-white"><span className="text-6xl">{project.emoji || "✦"}</span></div>}
    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
    <span className="absolute bottom-5 left-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{project.category || "Selected work"}</span>
    <span className="absolute bottom-5 right-5 translate-y-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#31105d] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">View project ↗</span>
  </div>;
}
function ProjectCard({ project, className = "" }: { project: PortfolioProject; className?: string }) {
  return <Link href={`/portfolio/${project.slug}`} className={`group block ${className}`}><ProjectVisual project={project} className="aspect-[4/3]" /><div className="mt-4 flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">{project.title}</h3><p className="mt-1 line-clamp-1 text-sm text-[var(--text-secondary)]">{project.overview || "A considered digital experience by PurpleSoftHub."}</p></div><span className="pt-1 text-lg text-[var(--primary)] transition-transform group-hover:translate-x-1">↗</span></div></Link>;
}

export default function PortfolioPage() {
  const [category, setCategory] = useState<Category>("All");
  const [projects, setProjects] = useState<PortfolioProject[]>(normalizeProjects(PORTFOLIO_PROJECTS));
  useEffect(() => { let active = true; fetchPublishedProjectsClient().then((published) => { if (active && published.length) setProjects(normalizeProjects(published)); }); return () => { active = false; }; }, []);
  const visible = useMemo(() => projects.filter((project) => matches(project, category)).sort((a, b) => Number(b.featured) - Number(a.featured)), [category, projects]);
  const featured = visible[0];

  return <main className="overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]"><Navbar />
    <section className="relative border-b border-[color:var(--border)]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.18),transparent_32%),linear-gradient(135deg,transparent_45%,rgba(124,58,237,0.06))]" /><div className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-36"><div className="max-w-5xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Selected work</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-7xl lg:text-[6.5rem]">Ideas designed to move brands forward.</h1><div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><p className="max-w-xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">A selection of branding, digital experiences, websites, campaigns, graphics and content created by PurpleSoftHub.</p><div className="flex shrink-0 gap-3"><Link href="/contact" className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Start a Project</Link><Link href="/services" className="rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]">View Services</Link></div></div></div></div></section>
    <section id="work" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20"><div className="flex flex-col gap-6 border-b border-[color:var(--border)] pb-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">The work</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Selected projects</h2></div><nav aria-label="Portfolio categories" className="portfolio-tabs flex gap-2">{CATEGORIES.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${category === item ? "bg-[var(--primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--primary)]"}`}>{item}</button>)}</nav></div>
      {featured ? <Link href={`/portfolio/${featured.slug}`} className="group mt-10 grid gap-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-end"><ProjectVisual project={featured} className="aspect-[16/9] lg:aspect-[1.35/1]" /><div className="max-w-md pb-2"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Featured project</p><h3 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{featured.title}</h3><p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">{featured.overview || "A focused creative project designed to make the next move clearer."}</p><span className="mt-7 inline-flex text-sm font-semibold text-[var(--primary)]">Explore the project <span className="ml-2 transition-transform group-hover:translate-x-1">↗</span></span></div></Link> : null}
      <div className="mt-16 grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-12">{visible.slice(1).map((project, index) => <ProjectCard key={`${project.slug}-${index}`} project={project} className={index % 3 === 1 ? "lg:col-span-5 lg:mt-16" : "lg:col-span-7"} />)}</div>
    </section>
    <section className="border-y border-[color:var(--border)] bg-[var(--bg-secondary)]/45"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">What we create</p><h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Creative direction with somewhere to go.</h2><div className="mt-10 grid gap-px overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--border)] md:grid-cols-2 lg:grid-cols-5">{SERVICES.map(([title, description]) => <div key={title} className="bg-[var(--bg-primary)] p-6"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p></div>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><div className="rounded-[1.75rem] bg-[#281044] px-6 py-10 text-white sm:px-10 sm:py-12"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Have a project in mind?</p><div className="mt-4 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between"><h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Let&apos;s build something remarkable.</h2><div className="flex shrink-0 gap-3"><Link href="/contact" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#281044]">Start a Project</Link><Link href="/contact" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white">Talk to Us</Link></div></div></div></section>
    <Footer /></main>;
}
