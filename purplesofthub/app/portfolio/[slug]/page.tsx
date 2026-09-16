import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ProjectCard from "../_components/ProjectCard";
import ProjectMedia from "../_components/ProjectMedia";
import CaseStudyGallery from "../_components/CaseStudyGallery";
import CaseStudyToc, { type CaseStudySection } from "../_components/CaseStudyToc";
import { getProjectBySlug } from "@/lib/portfolio.server";
import { authoredContentMap, normalizeProject } from "@/lib/portfolio-normalize";
import { PORTFOLIO_PROJECTS, RAW_PROJECTS } from "../_data/portfolio";
import {
  DOWNLOAD_LABELS,
  MOCKUP_TYPES,
  SERVICE_HREFS,
  TIMELINE_STEPS,
  VIDEO_SLOTS,
  WHATSAPP_URL,
  youtubeIdFromUrl,
} from "@/lib/portfolio-showcase";
import type { PortfolioProject } from "@/types/portfolio";

export function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((project) => ({ slug: project.slug }));
}

interface LoadedProject {
  project: PortfolioProject;
  raw: Record<string, unknown>;
}

/**
 * Resolves a case study from Supabase first, then from the bundled seed.
 *
 * The raw record travels with the normalised project because `normalizeProject()` drafts copy
 * for empty narrative fields - only the raw record can tell authored work from a draft, and
 * this page never presents a draft as project fact.
 */
async function loadProject(slug: string): Promise<LoadedProject | null> {
  const remote = await getProjectBySlug(slug);
  if (remote) {
    return { project: normalizeProject(remote), raw: remote as unknown as Record<string, unknown> };
  }

  const seed = RAW_PROJECTS.find((project) => project.slug === slug);
  if (!seed) return null;
  return { project: normalizeProject(seed), raw: seed as unknown as Record<string, unknown> };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const loaded = await loadProject((await params).slug);
  if (!loaded) return {};

  const { project } = loaded;
  const canonical = project.canonicalUrl || `/portfolio/${project.slug}`;
  /* Authored SEO titles are complete, so they bypass the layout's "| PurpleSoftHub" template
     rather than rendering the brand suffix twice. */
  const title = project.seoTitle
    ? { absolute: project.seoTitle }
    : `${project.title} — ${project.category || "Selected work"} case study`;
  const shareTitle =
    project.seoTitle || `${project.title} — ${project.category || "Selected work"} case study`;
  const description =
    project.seoDescription ||
    project.overview ||
    `A ${project.category || "creative"} project designed and delivered by PurpleSoftHub.`;
  const ogImage = isPublicUrl(project.ogImage) ? project.ogImage : null;

  return {
    title,
    description,
    alternates: { canonical },
    keywords: project.seoKeywords.length ? project.seoKeywords : project.tags,
    openGraph: {
      type: "article",
      title: shareTitle,
      description,
      url: canonical,
      images: ogImage ? [{ url: ogImage, alt: project.title }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: shareTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

const SITE_URL = "https://www.purplesofthub.com";

/** Studio-level process. Shown when a project has no dated timeline of its own. */
const PROCESS = [
  { label: "Discovery", copy: "Brief, audience and success criteria agreed before any design decision." },
  { label: "Design", copy: "Direction, layout and system refined against real content and review rounds." },
  { label: "Build", copy: "Production-ready assets and code — responsive, fast, accessible." },
  { label: "Launch", copy: "Handover, iteration and measurement so the work keeps earning attention." },
] as const;

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb | null {
  const raw = hex.trim().replace(/^#/, "");
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function mixHex(hex: string, target: string, amount: number): string {
  const from = hexToRgb(hex);
  const to = hexToRgb(target);
  if (!from || !to) return hex;
  const channel = (index: number) =>
    Math.round(from[index] + (to[index] - from[index]) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

/** Tint/shade ramp built from the project accent — always real project data. */
function accentRamp(accent: string): { hex: string; label: string }[] {
  return [
    { hex: mixHex(accent, "#ffffff", 0.8), label: "Highlight" },
    { hex: mixHex(accent, "#ffffff", 0.5), label: "Soft" },
    { hex: accent, label: "Accent" },
    { hex: mixHex(accent, "#000000", 0.3), label: "Deep" },
    { hex: mixHex(accent, "#000000", 0.55), label: "Shadow" },
  ];
}

/** Pulls labelled hex values out of an authored colour-system description. */
function swatchesFromText(text: string | null): { hex: string; label: string }[] {
  if (!text) return [];
  const rows: { hex: string; label: string }[] = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/#[0-9a-fA-F]{3,8}/);
    if (!match) continue;
    const label = line.split(/[:(]/)[0].replace(/[^\w\s&/-]/g, "").trim() || "Colour";
    rows.push({ hex: match[0], label });
  }
  return rows;
}

/** Turns "90% increase in booking inquiries" style copy into headline metrics. */
function metricsFromText(text: string | null): { value: string; label: string }[] {
  if (!text) return [];
  const found: { value: string; label: string }[] = [];
  const pattern = /(\d+(?:\.\d+)?\s?%)\s*([a-zA-Z][a-zA-Z\s-]{2,48})/g;
  let match: RegExpExecArray | null = pattern.exec(text);
  while (match && found.length < 4) {
    const label = match[2]
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[,.;:]$/, "")
      .split(" ")
      .slice(0, 5)
      .join(" ");
    found.push({ value: match[1].replace(/\s/g, ""), label });
    match = pattern.exec(text);
  }
  return found;
}

/** Splits authored typography copy into spec rows ("Primary: Inter (clean, modern)"). */
function typeRows(text: string | null): { label: string; value: string }[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [head, ...rest] = line.split(":");
      const value = (rest.length ? rest.join(":") : line).replace(/\(.*?\)/g, "").trim();
      return { label: rest.length ? head.trim() : "Type", value };
    })
    .filter((row) => row.value)
    .slice(0, 4);
}

/** Splits authored feedback into quote and attribution ("...quote..." - Client Management). */
function splitFeedback(text: string): { quote: string; author: string | null } {
  const cleaned = text.trim();
  const match = cleaned.match(/^(.*?)[\s]*[-–—][\s]*([^-–—]{2,60})$/);
  if (match) {
    return { quote: match[1].replace(/^["“]|["”]$/g, "").trim(), author: match[2].trim() };
  }
  return { quote: cleaned.replace(/^["“]|["”]$/g, "").trim(), author: null };
}

/** Placeholder hosts are filtered so no case study links nowhere. */
function isPublicUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  return !/(example\.(com|org|net)|localhost|127\.0\.0\.1|placeholder|TODO)/i.test(url);
}

/** Only a real-looking YouTube id is embedded, so placeholder ids never render a dead player. */
function youtubeEmbed(url: string | null | undefined): string | null {
  const id = youtubeIdFromUrl(url ?? undefined);
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

/** Local assets are checked on disk; remote assets rely on the client-side fallback. */
function assetExists(src: string): boolean {
  if (!src.startsWith("/")) return true;
  try {
    return existsSync(path.join(process.cwd(), "public", src.replace(/^\//, "")));
  } catch {
    return false;
  }
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** "2025-08-01 to 2025-08-15" -> "August 2025 → September 2025". */
function rangeLabel(value: string): string {
  const [from, to] = value.split(/\s+to\s+/i);
  const left = formatDate(from?.trim() ?? null);
  const right = to ? formatDate(to.trim()) : null;
  if (left && right) return left === right ? left : `${left} → ${right}`;
  return formatDate(value) || value;
}

interface BlockProps {
  id: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Numbered case-study section. The index is drawn by CSS counters, so numbering stays
 *  correct no matter which sections a project actually has. */
function Block({ id, kicker, title, children, className = "" }: BlockProps) {
  return (
    <section id={id} className={`pf-cs-block pf-cs-anchor${className ? ` ${className}` : ""}`}>
      <header className="pf-cs-block-head">
        <span className="pf-cs-block-index" aria-hidden="true" />
        <div className="pf-cs-block-titles">
          <p className="pf-cs-kicker">{kicker}</p>
          <h2 className="pf-cs-h2">{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

type MockupKey = keyof NonNullable<PortfolioProject["mockups"]>;

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const loaded = await loadProject((await params).slug);
  if (!loaded) notFound();

  const { project } = loaded;
  const authored = authoredContentMap(loaded.raw);

  const accent = project.color || "#a855f7";
  const deliverables = project.deliverables.length ? project.deliverables : project.servicesUsed;
  const tags = project.tags.length
    ? project.tags
    : [project.industry, project.category].filter((value): value is string => Boolean(value));
  const gallery = project.gallery.filter(Boolean).slice(0, 8);
  const liveUrl = isPublicUrl(project.liveUrl) ? project.liveUrl : null;

  /* Authored design-system data only. normalizeProject() drafts these fields when a project
     has none, so they are read through the authored map and never shown as project fact. */
  const swatches = authored.colourSystem ? swatchesFromText(project.colourSystem) : [];
  const ramp = accentRamp(accent);
  const typeSpec = authored.typography ? typeRows(project.typography) : [];
  const metrics = authored.results ? metricsFromText(project.results) : [];
  const gridSpec = authored.gridSystem ? project.gridSystem : null;

  const timelineRaw = authored.timeline ? project.timeline : null;
  const timeline = timelineRaw
    ? TIMELINE_STEPS.reduce<{ label: string; value: string }[]>((rows, step) => {
        const value = timelineRaw[step.key];
        if (value) rows.push({ label: step.label, value });
        return rows;
      }, [])
    : [];

  const mockupsRaw = project.mockups;
  const mockups = mockupsRaw
    ? MOCKUP_TYPES.reduce<{ label: string; src: string }[]>((items, item) => {
        const src = mockupsRaw[item.key as MockupKey];
        if (src) items.push({ label: item.label, src });
        return items;
      }, [])
    : [];

  const videos = VIDEO_SLOTS.reduce<{ label: string; id: string }[]>((items, slot) => {
    const id = project.videos ? youtubeEmbed(project.videos[slot.key]) : null;
    if (id) items.push({ label: slot.label, id });
    return items;
  }, []);

  const tools = project.softwareUsed ?? [];

  const documents = project.downloads
    ? Object.entries(project.downloads)
        .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
        .map(([key, value]) => {
          const src = value as string;
          const ready = assetExists(src);
          return {
            key,
            label: DOWNLOAD_LABELS[key] || key,
            href: ready ? src : `/contact?intent=download&resource=${encodeURIComponent(key)}`,
            ready,
          };
        })
    : [];

  const awards = project.awards
    ? [
        ...(project.awards.agencyAwards ?? []).map((value) => ({ kind: "Award", value })),
        ...(project.awards.clientRecognition ?? []).map((value) => ({ kind: "Recognition", value })),
        ...(project.awards.certifications ?? []).map((value) => ({ kind: "Certification", value })),
      ]
    : [];

  const completed = formatDate(project.completionDate);
  const facets = [
    { label: "Client", value: project.clientName || project.title },
    project.industry ? { label: "Industry", value: project.industry } : null,
    project.category ? { label: "Category", value: project.category } : null,
    project.service && project.service !== project.category
      ? { label: "Service", value: project.service }
      : null,
    project.year ? { label: "Year", value: project.year } : null,
    authored.projectDuration && project.projectDuration
      ? { label: "Duration", value: project.projectDuration }
      : null,
    completed ? { label: "Completed", value: completed } : null,
  ].filter((facet): facet is { label: string; value: string } => Boolean(facet && facet.value));

  const stats = [
    project.year ? { label: "Year", value: project.year } : null,
    deliverables.length ? { label: "Deliverables", value: String(deliverables.length) } : null,
    project.industry ? { label: "Industry", value: project.industry } : null,
    project.category ? { label: "Discipline", value: project.category } : null,
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat && stat.value));

  const preferredSlugs = project.relatedProjects.filter(Boolean);
  const related = PORTFOLIO_PROJECTS.filter((item) => item.slug !== project.slug)
    .map((item) => ({
      item,
      score:
        (item.tags || []).filter((tag) => tags.includes(tag)).length * 3 +
        (item.category && item.category === project.category ? 2 : 0) +
        (item.industry && item.industry === project.industry ? 2 : 0) +
        (preferredSlugs.includes(item.slug) ? 6 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 3)
    .map((entry) => entry.item);

  const position = PORTFOLIO_PROJECTS.findIndex((item) => item.slug === project.slug);
  const total = PORTFOLIO_PROJECTS.length;
  const previous = position >= 0 ? PORTFOLIO_PROJECTS[(position - 1 + total) % total] : null;
  const next = position >= 0 ? PORTFOLIO_PROJECTS[(position + 1) % total] : null;

  const sections: CaseStudySection[] = [];
  if (project.challenge) sections.push({ id: "challenge", label: "Challenge" });
  if (project.finalSolution) sections.push({ id: "outcome", label: "Outcome" });
  sections.push({ id: "visuals", label: gallery.length ? "Visuals" : "Visual system" });
  if (authored.research || authored.strategy) sections.push({ id: "approach", label: "Approach" });
  if (authored.creativeDirection || authored.moodboard || authored.wireframes) {
    sections.push({ id: "direction", label: "Direction" });
  }
  if (typeSpec.length || swatches.length || gridSpec) {
    sections.push({ id: "system", label: "Design system" });
  }
  if (deliverables.length) sections.push({ id: "delivery", label: "Delivered" });
  sections.push(
    timeline.length ? { id: "timeline", label: "Timeline" } : { id: "process", label: "Process" }
  );
  if (tools.length) sections.push({ id: "tools", label: "Tools" });
  if (authored.results) sections.push({ id: "impact", label: "Impact" });
  if (project.clientFeedback) sections.push({ id: "feedback", label: "Feedback" });
  if (mockups.length || videos.length) sections.push({ id: "mockups", label: "Mockups" });
  if (awards.length) sections.push({ id: "recognition", label: "Recognition" });
  if (documents.length) sections.push({ id: "documents", label: "Documents" });
  sections.push({ id: "related", label: "Related work" });

  const feedbackQuote = project.clientFeedback ? splitFeedback(project.clientFeedback) : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: `${project.title} — ${project.category || "case study"}`,
    description: project.overview || undefined,
    url: project.canonicalUrl || `${SITE_URL}/portfolio/${project.slug}`,
    dateCreated: project.completionDate || project.year || undefined,
    genre: project.category || undefined,
    keywords: tags.join(", "),
    about: project.industry || undefined,
    creator: { "@type": "Organization", name: "PurpleSoftHub", url: SITE_URL },
  };

  return (
    <main className="pf-page">
      <Navbar />

      <div className="pf-backdrop" aria-hidden="true">
        <span className="pf-backdrop-glow pf-backdrop-glow-a" />
        <span className="pf-backdrop-glow pf-backdrop-glow-b" />
      </div>

      <CaseStudyToc
        sections={sections}
        title={project.title}
        eyebrow={project.category || "Selected work"}
        year={project.year}
      />

      <article className="pf-cs">
        <header className="pf-cs-hero">
          <div className="pf-shell pf-cs-hero-inner">
            <Reveal>
              <div className="pf-cs-hero-copy">
                <p className="pf-cs-eyebrow">
                  <span className="pf-cs-eyebrow-dot" aria-hidden="true" />
                  {project.category || "Selected work"}
                  {project.industry ? (
                    <>
                      <span className="pf-cs-eyebrow-sep" aria-hidden="true">
                        /
                      </span>
                      {project.industry}
                    </>
                  ) : null}
                </p>

                <h1 className="pf-cs-title">{project.title}</h1>

                <p className="pf-cs-lead">
                  {project.overview ||
                    `A ${project.category || "creative"} project designed, produced and delivered end to end by PurpleSoftHub.`}
                </p>

                <div className="pf-cs-actions">
                  <Link
                    href={`/contact?intent=similar&project=${project.slug}`}
                    className="pf-btn pf-btn-primary"
                  >
                    Start a similar project
                    <span className="pf-card-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                  {liveUrl ? (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pf-btn pf-btn-ghost"
                    >
                      Visit live project ↗
                    </a>
                  ) : null}
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pf-btn pf-btn-ghost"
                  >
                    WhatsApp us
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div
                className="pf-cs-hero-visual"
                style={{ "--pf-accent": accent } as React.CSSProperties}
              >
                <ProjectMedia project={project} className="pf-cs-hero-media" showCategory={false} eager />
                <div className="pf-cs-hero-overlay">
                  <span className="pf-cs-hero-chip">{project.year || "Case study"}</span>
                  <span className="pf-cs-hero-chip is-quiet">
                    {gallery.length ? `${gallery.length} visuals` : `${deliverables.length} deliverables`}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {stats.length ? (
            <div className="pf-shell">
              <Reveal delay={0.18}>
                <dl className="pf-cs-stats">
                  {stats.map((stat) => (
                    <div key={stat.label} className="pf-cs-stat">
                      <dt>{stat.label}</dt>
                      <dd>{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          ) : null}
        </header>

        <div className="pf-shell pf-cs-layout">
          <div className="pf-cs-main">
            {project.challenge ? (
              <Block id="challenge" kicker="The brief" title="The challenge">
                <div className="pf-cs-quote">
                  <p>{project.challenge}</p>
                </div>
              </Block>
            ) : null}

            {project.finalSolution ? (
              <Block id="outcome" kicker="What we shipped" title="The outcome">
                <p className="pf-cs-copy pf-cs-copy-lead">{project.finalSolution}</p>
                {authored.comparison && project.comparison?.label ? (
                  <p className="pf-cs-transformation">
                    <span aria-hidden="true"></span>
                    {project.comparison.label}
                  </p>
                ) : null}
              </Block>
            ) : null}

            <Block
              id="visuals"
              kicker={gallery.length ? "Selected visuals" : "Visual identity"}
              title={gallery.length ? "The work" : "Visual system"}
            >
              {gallery.length ? (
                <CaseStudyGallery
                  items={gallery.map((src, index) => ({
                    src,
                    label: `Visual ${String(index + 1).padStart(2, "0")}`,
                    caption: project.category || undefined,
                  }))}
                  project={project}
                />
              ) : (
                <div className="pf-cs-system">
                  <div className="pf-cs-mark">
                    <span className="pf-cs-mark-emoji" aria-hidden="true">
                      {project.emoji || "🎨"}
                    </span>
                    <span className="pf-cs-mark-title">{project.title}</span>
                    <span className="pf-cs-mark-meta">
                      {project.category}
                      {project.industry ? ` · ${project.industry}` : ""}
                    </span>
                  </div>

                  <div className="pf-cs-ramp">
                    <p className="pf-cs-spec-label">Accent ramp — built from the project colour</p>
                    <div className="pf-cs-swatches">
                      {ramp.map((swatch) => (
                        <div key={`${swatch.label}-${swatch.hex}`} className="pf-cs-swatch">
                          <span
                            className="pf-cs-swatch-chip"
                            style={{ background: swatch.hex }}
                            aria-hidden="true"
                          />
                          <span className="pf-cs-swatch-label">{swatch.label}</span>
                          <span className="pf-cs-swatch-hex">{swatch.hex.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pf-cs-tiles">
                    <div className="pf-cs-tile">
                      <span className="pf-cs-tile-label">Discipline</span>
                      <span className="pf-cs-tile-value">{project.category || "Creative"}</span>
                    </div>
                    <div className="pf-cs-tile">
                      <span className="pf-cs-tile-label">Industry</span>
                      <span className="pf-cs-tile-value">{project.industry || "Cross-sector"}</span>
                    </div>
                    <div className="pf-cs-tile">
                      <span className="pf-cs-tile-label">Delivered</span>
                      <span className="pf-cs-tile-value">{project.year || "Ongoing"}</span>
                    </div>
                  </div>

                  {tags.length ? (
                    <div className="pf-cs-chips">
                      {tags.map((tag) => (
                        <span key={tag} className="pf-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </Block>

            {authored.research || authored.strategy ? (
              <Block id="approach" kicker="Research & strategy" title="How we approached it">
                <div className="pf-cs-story">
                  {authored.research ? (
                    <article className="pf-cs-story-card">
                      <h3>Research</h3>
                      <p>{project.research}</p>
                    </article>
                  ) : null}
                  {authored.strategy ? (
                    <article className="pf-cs-story-card">
                      <h3>Strategy</h3>
                      <p>{project.strategy}</p>
                    </article>
                  ) : null}
                </div>
              </Block>
            ) : null}

            {authored.creativeDirection || authored.moodboard || authored.wireframes ? (
              <Block id="direction" kicker="Art direction" title="Creative direction">
                <div className="pf-cs-story">
                  {authored.creativeDirection ? (
                    <article className="pf-cs-story-card">
                      <h3>Creative direction</h3>
                      <p>{project.creativeDirection}</p>
                    </article>
                  ) : null}
                  {authored.moodboard ? (
                    <article className="pf-cs-story-card">
                      <h3>Moodboard</h3>
                      <p>{project.moodboard}</p>
                    </article>
                  ) : null}
                  {authored.wireframes ? (
                    <article className="pf-cs-story-card">
                      <h3>Wireframes &amp; user flows</h3>
                      <p>{project.wireframes}</p>
                    </article>
                  ) : null}
                </div>
              </Block>
            ) : null}

            {typeSpec.length || swatches.length || gridSpec ? (
              <Block id="system" kicker="Design system" title="Type, colour &amp; grid">
                <div className="pf-cs-specs">
                  {typeSpec.length ? (
                    <div className="pf-cs-spec">
                      <p className="pf-cs-spec-label">Typography</p>
                      <dl className="pf-cs-spec-rows">
                        {typeSpec.map((row) => (
                          <div key={`${row.label}-${row.value}`} className="pf-cs-spec-row">
                            <dt>{row.label}</dt>
                            <dd>{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}

                  {swatches.length ? (
                    <div className="pf-cs-spec">
                      <p className="pf-cs-spec-label">Colour system</p>
                      <div className="pf-cs-swatches">
                        {swatches.map((swatch) => (
                          <div key={`${swatch.label}-${swatch.hex}`} className="pf-cs-swatch">
                            <span
                              className="pf-cs-swatch-chip"
                              style={{ background: swatch.hex }}
                              aria-hidden="true"
                            />
                            <span className="pf-cs-swatch-label">{swatch.label}</span>
                            <span className="pf-cs-swatch-hex">{swatch.hex.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {gridSpec ? (
                    <div className="pf-cs-spec">
                      <p className="pf-cs-spec-label">Grid system</p>
                      <p className="pf-cs-copy">{gridSpec}</p>
                    </div>
                  ) : null}
                </div>
              </Block>
            ) : null}

            {deliverables.length ? (
              <Block id="delivery" kicker="Scope of work" title="What we delivered">
                <ol className="pf-cs-list">
                  {deliverables.map((item) => (
                    <li key={item} className="pf-cs-list-item">
                      <span className="pf-cs-list-num" aria-hidden="true" />
                      <span className="pf-cs-list-label">{item}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            ) : null}

            {timeline.length ? (
              <Block id="timeline" kicker="Delivery timeline" title="How the project ran">
                <ol className="pf-cs-timeline">
                  {timeline.map((step) => (
                    <li key={step.label} className="pf-cs-timeline-step">
                      <span className="pf-cs-timeline-dot" aria-hidden="true" />
                      <span className="pf-cs-timeline-label">{step.label}</span>
                      <span className="pf-cs-timeline-value">{rangeLabel(step.value)}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            ) : (
              <Block id="process" kicker="How we work" title="A process built for delivery">
                <ol className="pf-cs-process">
                  {PROCESS.map((step, index) => (
                    <li key={step.label} className="pf-cs-process-step">
                      <span className="pf-cs-process-num" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="pf-cs-process-label">{step.label}</span>
                      <span className="pf-cs-process-copy">{step.copy}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {tools.length ? (
              <Block id="tools" kicker="Tools &amp; technology" title="Built with">
                <div className="pf-cs-tools">
                  {tools.map((tool) => (
                    <span key={tool} className="pf-cs-tool">
                      {tool}
                    </span>
                  ))}
                </div>
              </Block>
            ) : null}

            {authored.results ? (
              <Block id="impact" kicker="Business impact" title="What it changed">
                {metrics.length ? (
                  <dl className="pf-cs-metrics">
                    {metrics.map((metric) => (
                      <div key={`${metric.value}-${metric.label}`} className="pf-cs-metric">
                        <dt className="pf-cs-metric-label">{metric.label}</dt>
                        <dd className="pf-cs-metric-value">{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <p className="pf-cs-copy pf-cs-copy-lead">{project.results}</p>
              </Block>
            ) : null}

            {feedbackQuote ? (
              <Block id="feedback" kicker="Client feedback" title="In their words">
                <figure className="pf-cs-feedback">
                  <span className="pf-cs-feedback-mark" aria-hidden="true">
                    “
                  </span>
                  <blockquote className="pf-cs-feedback-quote">{feedbackQuote.quote}</blockquote>
                  <figcaption className="pf-cs-feedback-author">
                    {feedbackQuote.author || project.clientName || project.title}
                  </figcaption>
                </figure>
              </Block>
            ) : null}

            {mockups.length || videos.length ? (
              <Block id="mockups" kicker="Applications" title="In the wild">
                {videos.length ? (
                  <div className="pf-cs-videos">
                    {videos.map((video) => (
                      <div key={video.id} className="pf-cs-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.id}`}
                          title={`${project.title} — ${video.label}`}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <span className="pf-cs-video-label">{video.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {mockups.length ? (
                  <CaseStudyGallery
                    items={mockups.map((mockup) => ({ src: mockup.src, label: mockup.label }))}
                    project={project}
                    variant="panels"
                  />
                ) : null}
              </Block>
            ) : null}

            {awards.length ? (
              <Block id="recognition" kicker="Recognition" title="Awards &amp; acknowledgement">
                <ul className="pf-cs-awards">
                  {awards.map((award) => (
                    <li key={`${award.kind}-${award.value}`} className="pf-cs-award">
                      <span className="pf-cs-award-kind">{award.kind}</span>
                      <span className="pf-cs-award-value">{award.value}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}

            {documents.length ? (
              <Block id="documents" kicker="Documents" title="Project documents">
                <ul className="pf-cs-documents">
                  {documents.map((document) => (
                    <li key={document.key} className="pf-cs-document">
                      <span className="pf-cs-document-label">{document.label}</span>
                      {document.ready ? (
                        <a
                          href={document.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pf-cs-document-link"
                        >
                          Download PDF ↗
                        </a>
                      ) : (
                        <Link href={document.href} className="pf-cs-document-link">
                          Available on request
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}

          </div>

          <aside className="pf-cs-aside">
            <div className="pf-cs-aside-sticky">
              <div className="pf-cs-panel">
                <p className="pf-cs-panel-label">Project facts</p>
                <dl className="pf-cs-facts">
                  {facets.map((facet) => (
                    <div key={facet.label} className="pf-cs-fact">
                      <dt>{facet.label}</dt>
                      <dd>{facet.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {deliverables.length ? (
                <div className="pf-cs-panel">
                  <p className="pf-cs-panel-label">Services delivered</p>
                  <ul className="pf-cs-side-list">
                    {deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {tags.length ? (
                <div className="pf-cs-panel">
                  <p className="pf-cs-panel-label">Focus areas</p>
                  <div className="pf-cs-chips">
                    {tags.map((tag) => (
                      <span key={tag} className="pf-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pf-cs-panel pf-cs-panel-cta">
                <p className="pf-cs-panel-label">Next step</p>
                <p className="pf-cs-panel-copy">
                  Want something like {project.title}? Let’s scope it together.
                </p>
                <Link
                  href={`/contact?intent=similar&project=${project.slug}`}
                  className="pf-btn pf-btn-primary pf-btn-block"
                >
                  Start a similar project
                  <span className="pf-card-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-btn pf-btn-ghost pf-btn-block"
                >
                  Message on WhatsApp
                </a>
                {liveUrl ? (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pf-cs-live"
                  >
                    Visit the live project ↗
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        {project.recommendedServices.length ? (
          <section className="pf-cs-band">
            <div className="pf-shell">
              <Reveal>
                <p className="pf-eyebrow">
                  <span className="pf-eyebrow-dot" aria-hidden="true" />
                  Keep exploring
                </p>
                <h2 className="pf-section-title">
                  Related <span>services</span>
                </h2>
              </Reveal>
              <div className="pf-cs-services">
                {project.recommendedServices.slice(0, 4).map((service) => (
                  <Link
                    key={service}
                    href={SERVICE_HREFS[service] || "/services"}
                    className="pf-cs-service"
                  >
                    <span className="pf-cs-service-name">{service}</span>
                    <span className="pf-cs-service-cta">
                      Explore
                      <span className="pf-card-arrow" aria-hidden="true">
                        →
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="pf-cs-band pf-cs-anchor" id="related">
          <div className="pf-shell">
            <Reveal>
              <p className="pf-eyebrow">
                <span className="pf-eyebrow-dot" aria-hidden="true" />
                More from the studio
              </p>
              <h2 className="pf-section-title">
                Related <span>work</span>
              </h2>
            </Reveal>

            <div className="pf-cs-related">
              {related.map((item, index) => (
                <Reveal key={item.slug} delay={index * 0.08}>
                  <ProjectCard project={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {previous || next ? (
          <nav className="pf-shell pf-cs-nav" aria-label="More projects">
            {previous ? (
              <Link href={`/portfolio/${previous.slug}`} className="pf-cs-nav-link pf-cs-nav-prev">
                <span className="pf-cs-nav-kicker">← Previous project</span>
                <span className="pf-cs-nav-title">{previous.title}</span>
                <span className="pf-cs-nav-meta">
                  {previous.category}
                  {previous.year ? ` · ${previous.year}` : ""}
                </span>
              </Link>
            ) : null}
            {next ? (
              <Link href={`/portfolio/${next.slug}`} className="pf-cs-nav-link pf-cs-nav-next">
                <span className="pf-cs-nav-kicker">Next project →</span>
                <span className="pf-cs-nav-title">{next.title}</span>
                <span className="pf-cs-nav-meta">
                  {next.category}
                  {next.year ? ` · ${next.year}` : ""}
                </span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </article>

      <section className="pf-section pf-section-cta">
        <div className="pf-shell">
          <Reveal>
            <div className="pf-cta">
              <div className="pf-cta-inner">
                <p className="pf-eyebrow pf-eyebrow-light">Start a project</p>
                <h2 className="pf-cta-title">Want work like {project.title}?</h2>
                <p className="pf-cta-copy">
                  Tell us the goal and the deadline. We will come back with a clear scope, a
                  timeline, and the shape of the work.
                </p>
              </div>
              <div className="pf-cta-actions">
                <Link
                  href={`/contact?intent=similar&project=${project.slug}`}
                  className="pf-btn pf-btn-light"
                >
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}