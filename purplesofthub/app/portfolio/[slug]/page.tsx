import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProjectBySlug } from "@/lib/portfolio.server";
import { normalizeProject } from "@/lib/portfolio-normalize";
import { PORTFOLIO_PROJECTS } from "../_data/portfolio";
import type { PortfolioProject } from "@/types/portfolio";

export function generateStaticParams() { return PORTFOLIO_PROJECTS.map((project) => ({ slug: project.slug })); }
async function loadProject(slug: string): Promise<PortfolioProject | null> { const remote = await getProjectBySlug(slug); if (remote) return normalizeProject(remote); const fallback = PORTFOLIO_PROJECTS.find((project) => project.slug === slug); return fallback ? normalizeProject(fallback) : null; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const project = await loadProject((await params).slug); return project ? { title: `${project.title} | PurpleSoftHub Portfolio`, description: project.overview || undefined } : {}; }

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await loadProject((await params).slug); if (!project) notFound();
  const hero = project.coverImage || project.featuredThumbnail || project.heroBanner || project.gallery[0] || null;
  const gallery = project.gallery.filter(Boolean).slice(0, 8); const deliverables = project.deliverables.length ? project.deliverables : project.servicesUsed;
  return <main className="bg-[var(--bg-primary)] text-[var(--text-primary)]"><Navbar /><article>
    <header className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-36"><Link href="/portfolio" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)]">← Back to selected work</Link><p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">{project.category || "Selected work"}</p><h1 className="mt-4 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">{project.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">{project.overview || "A considered creative project by PurpleSoftHub."}</p><div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">{[["Client", project.clientName], ["Category", project.category], ["Year", project.year]].map(([label, value]) => value ? <span key={label}><strong className="text-[var(--text-primary)]">{label}</strong> {value}</span> : null)}</div></header>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#2a1058,#7c3aed)]">{hero ? <Image src={hero} alt={project.title} fill priority className="object-cover" sizes="100vw" /> : <div className="flex h-full items-center justify-center text-7xl text-white">{project.emoji || "✦"}</div>}</div></div>
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8 lg:py-20"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">The work</p><p className="mt-5 max-w-2xl text-lg leading-9 text-[var(--text-secondary)]">{project.overview || "We shaped a clear, distinctive visual direction designed to work across every important touchpoint."}</p>{gallery.length ? <div className="mt-12 grid gap-5 sm:grid-cols-2">{gallery.map((image) => <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--bg-secondary)]"><Image src={image} alt={project.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" /></div>)}</div> : null}</div><aside className="lg:sticky lg:top-28 lg:self-start"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Deliverables</p><ul className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">{deliverables.map((item) => <li key={item} className="border-b border-[color:var(--border)] pb-3">{item}</li>)}</ul>{project.liveUrl ? <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">View Live Project ↗</Link> : null}</aside></div>
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"><div className="rounded-[1.5rem] bg-[#281044] px-6 py-10 text-white sm:px-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Start a conversation</p><div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-3xl font-semibold tracking-[-0.04em]">Have a project with a similar ambition?</h2><Link href="/contact" className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#281044]">Start a Project</Link></div></div></section>
  </article><Footer /></main>;
}
