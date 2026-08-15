import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProjectBySlug } from "@/lib/portfolio.server";
import { normalizeProject } from "@/lib/portfolio-normalize";
import { PORTFOLIO_PROJECTS } from "../_data/portfolio";
import type { PortfolioProject } from "@/types/portfolio";

export async function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((project) => ({ slug: project.slug }));
}

function getFallbackProject(slug: string) {
  const local = PORTFOLIO_PROJECTS.find((project) => project.slug === slug);
  return local ? normalizeProject(local) : null;
}

async function loadProject(slug: string): Promise<PortfolioProject | null> {
  const remote = await getProjectBySlug(slug);
  if (remote) return normalizeProject(remote);
  return getFallbackProject(slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);

  if (!project) return {};

  return {
    title: `${project.title} | PurpleSoftHub Portfolio`,
    description: project.overview || `Selected work by PurpleSoftHub for ${project.clientName || "a client"}.`,
    openGraph: {
      title: project.title,
      description: project.overview || undefined,
      type: "article",
      images: project.coverImage ? [{ url: project.coverImage }] : [],
    },
  };
}

function MetaItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{label}</div>
      <div className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{value}</div>
    </div>
  );
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--bg-secondary)]">
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
    </div>
  );
}

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await loadProject(slug);

  if (!project) notFound();

  const heroImage = project.coverImage || project.heroBanner || project.gallery[0] || null;
  const gallery = project.gallery.filter(Boolean).slice(0, 6);
  const deliverables = project.deliverables.length ? project.deliverables : project.servicesUsed;
  const metaItems = [
    { label: "Category", value: project.category },
    { label: "Service", value: project.service },
    { label: "Year", value: project.year },
    { label: "Client", value: project.clientName },
  ];

  return (
    <main className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-32">
        <div className="max-w-3xl">
          <Link href="/portfolio" className="text-sm font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]">
            ← Back to portfolio
          </Link>
          <div className="mt-6 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--bg-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            {project.category || "Portfolio"}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">{project.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[color:var(--text-secondary)] sm:text-lg">
            {project.overview || "A polished creative project from PurpleSoftHub."}
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-sm text-[color:var(--text-secondary)]">
            {metaItems.map((item) => item.value ? (
              <span key={item.label} className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg-card)] px-4 py-2">
                <span className="font-semibold text-[color:var(--text-primary)]">{item.label}:</span> {item.value}
              </span>
            ) : null)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--bg-card)] shadow-[0_24px_80px_rgba(17,8,40,0.12)]">
          {heroImage ? (
            <div className="relative aspect-[16/9]">
              <Image src={heroImage} alt={project.title} fill className="object-cover" priority sizes="(max-width: 1280px) 100vw, 1280px" />
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-[linear-gradient(135deg,rgba(124,58,237,0.9),rgba(40,10,84,0.98))] p-8 text-center text-white">
              <div>
                <div className="text-7xl">{project.emoji || "🎨"}</div>
                <p className="mt-4 text-lg font-medium text-white/80">Hero image coming soon</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-16">
        <div className="space-y-8">
          <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Overview</p>
            <p className="mt-4 text-sm leading-8 text-[color:var(--text-secondary)] sm:text-base">
              {project.overview || "This project was designed to communicate clearly, feel premium, and support the client&apos;s next stage of growth."}
            </p>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Gallery</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Selected visuals</h2>
              </div>
            </div>

            {gallery.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {gallery.map((image) => (
                  <GalleryImage key={image} src={image} alt={project.title} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-[color:var(--bg-card)] p-8 text-sm text-[color:var(--text-secondary)]">
                Additional gallery assets are not available for this project yet.
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Deliverables</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {deliverables.map((item) => (
                <span key={item} className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Project details</p>
            <div className="mt-4 grid gap-3">
              <MetaItem label="Category" value={project.category} />
              <MetaItem label="Service" value={project.service} />
              <MetaItem label="Year" value={project.year} />
              <MetaItem label="Client" value={project.clientName} />
            </div>

            {project.liveUrl ? (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                View Live Project
              </Link>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(124,58,237,0.95),rgba(50,12,103,0.98))] p-6 text-white shadow-[0_24px_70px_rgba(124,58,237,0.22)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Ready for your next project?</p>
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em]">Let&apos;s build work that is clear, polished, and made to last.</p>
            <Link href="/contact" className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--primary)] transition hover:bg-white/95">
              Start a Project
            </Link>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Next step</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Need something similar?</h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                We can shape the brand, design system, or digital experience around your next launch.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/portfolio" className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-5 py-3 text-sm font-semibold text-[color:var(--text-primary)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]">
                Back to portfolio
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
