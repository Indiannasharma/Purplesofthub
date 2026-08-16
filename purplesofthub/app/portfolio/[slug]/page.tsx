import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProjectBySlug } from "@/lib/portfolio.server";
import { normalizeProject } from "@/lib/portfolio-normalize";
import { PORTFOLIO_PROJECTS } from "../_data/portfolio";
import { WHATSAPP_URL } from "@/lib/portfolio-showcase";
import type { PortfolioProject } from "@/types/portfolio";

export function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((project) => ({ slug: project.slug }));
}

async function loadProject(slug: string): Promise<PortfolioProject | null> {
  const remote = await getProjectBySlug(slug);
  if (remote) return normalizeProject(remote);
  const fallback = PORTFOLIO_PROJECTS.find((project) => project.slug === slug);
  return fallback ? normalizeProject(fallback) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = await loadProject((await params).slug);
  return project
    ? {
        title: `${project.title} | PurpleSoftHub Portfolio`,
        description: project.overview || undefined,
        openGraph: project.ogImage
          ? { images: [{ url: project.ogImage, alt: project.title }] }
          : undefined,
      }
    : {};
}

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await loadProject((await params).slug);
  if (!project) notFound();

  const hero = project.coverImage || project.featuredThumbnail || project.heroBanner || project.gallery[0] || null;
  const gallery = project.gallery.filter(Boolean).slice(0, 8);
  const deliverables = project.deliverables.length ? project.deliverables : project.servicesUsed;

  return (
    <main className="flex min-h-[calc(100vh-68px)] flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <article className="flex-1">
        {/* ── PROJECT HERO ── */}
        <header className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pb-14 lg:pt-28">
          <Link href="/portfolio" className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]">
            ← Back to selected work
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            {project.category || "Selected work"}
          </p>
          <h1 className="mt-4 max-w-5xl text-4xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
            {project.overview || "A considered creative project by PurpleSoftHub."}
          </p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
            {[
              ["Client", project.clientName],
              ["Category", project.category],
              ["Year", project.year],
            ].map(([label, value]) =>
              value ? (
                <span key={label}>
                  <strong className="text-[var(--text-primary)]">{label}</strong> {value}
                </span>
              ) : null
            )}
          </div>
        </header>

        {/* ── HERO VISUAL ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#2a1058,#7c3aed)]">
            {hero ? (
              <Image
                src={hero}
                alt={project.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl text-white">
                {project.emoji || "✦"}
              </div>
            )}
          </div>
        </div>

        {/* ── OVERVIEW + DELIVERABLES ── */}
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">The work</p>
            <p className="mt-5 max-w-2xl text-base leading-9 text-[var(--text-secondary)] sm:text-lg">
              {project.overview || "We shaped a clear, distinctive visual direction designed to work across every important touchpoint."}
            </p>

            {/* ── VISUAL WORK GALLERY ── */}
            {gallery.length ? (
              <div className="mt-12">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Visual work</p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {gallery.map((image, index) => (
                    <div
                      key={image}
                      className={`relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--bg-secondary)] ${
                        index % 3 === 1 ? "sm:mt-8" : ""
                      }`}
                    >
                      <Image
                        src={image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Services delivered</p>
            <ul className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
              {deliverables.map((item) => (
                <li key={item} className="border-b border-[color:var(--border)] pb-3">
                  {item}
                </li>
              ))}
            </ul>

            {project.clientName && project.clientName !== project.title ? (
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Client</p>
                <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{project.clientName}</p>
              </div>
            ) : null}

            {project.liveUrl ? (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                View Live Project ↗
              </Link>
            ) : null}
          </aside>
        </div>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-[#281044] px-6 py-10 text-white sm:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.3),transparent_50%)]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Have a similar project?
              </p>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  Let's build something with the same ambition.
                </h2>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#281044] transition hover:opacity-90"
                  >
                    Start a Project
                  </Link>
                  <Link
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50"
                  >
                    Talk to Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
      <Footer />
    </main>
  );
}