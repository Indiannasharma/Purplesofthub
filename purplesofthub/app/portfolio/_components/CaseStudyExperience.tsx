"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import MockupShowcase from "./MockupShowcase";
import type { PortfolioProject } from "@/types/portfolio";
import {
  MOCKUP_TYPES,
  PROJECT_DOWNLOAD_CATALOG,
  SERVICE_HREFS,
  SHOWCASE_SERVICES,
  TIMELINE_STEPS,
  VIDEO_SLOTS,
  WHATSAPP_URL,
  comparisonLabel,
  youtubeIdFromUrl,
} from "@/lib/portfolio-showcase";

const STORY = [
  { id: "challenge", label: "The Challenge" },
  { id: "research", label: "Research" },
  { id: "thinking", label: "Creative Thinking" },
  { id: "process", label: "Design Process" },
  { id: "result", label: "Final Result" },
  { id: "impact", label: "Business Impact" },
];

function hexSwatches(text: string | null): string[] {
  if (!text) return [];
  return Array.from(new Set(text.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || []));
}

function embedUrl(url?: string): string | null {
  if (!url) return null;
  const yt = youtubeIdFromUrl(url);
  if (yt) return `https://www.youtube.com/embed/${yt}`;
  if (url.includes("instagram.com")) return url;
  if (url.includes("tiktok.com")) return url;
  return url;
}

function MagneticButton({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "whatsapp";
}) {
  const solid = variant === "solid";
  const whatsapp = variant === "whatsapp";
  return (
    <Link href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ textDecoration: "none" }}>
      <motion.button
        className={solid ? "btn-main" : "btn-outline"}
        whileHover={{ y: -3, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: "14px 24px",
          fontSize: 14,
          fontWeight: 700,
          borderRadius: 12,
          cursor: "pointer",
          background: whatsapp ? "#25D366" : solid ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent",
          color: solid || whatsapp ? "#fff" : "var(--text-primary)",
          border: solid || whatsapp ? "none" : "2px solid rgba(124,58,237,0.3)",
        }}
      >
        {children}
      </motion.button>
    </Link>
  );
}

function StoryBlock({
  id,
  eyebrow,
  title,
  body,
  accent = "#7c3aed",
  icon,
  flush = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string | null;
  accent?: string;
  icon: string;
  flush?: boolean;
}) {
  if (!body) return null;
  return (
    <section id={id} style={{ padding: flush ? "8px 0 20px" : "20px 5% 28px" }}>
      <div style={{ maxWidth: flush ? "none" : 900, margin: "0 auto" }}>
        <Reveal>
          <div className="glass-card" style={{ padding: "36px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(180deg,${accent},transparent)` }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 26 }}>{icon}</span>
              <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 12, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>{eyebrow}</span>
            </div>
            <h2 style={{ fontFamily: "Outfit", fontSize: 26, fontWeight: 800, margin: "0 0 12px", color: "var(--text-primary)" }}>{title}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15.5, lineHeight: 1.85, margin: 0, whiteSpace: "pre-line" }}>{body}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function CaseStudyExperience({
  project,
  related,
}: {
  project: PortfolioProject;
  related: PortfolioProject[];
}) {
  const [mockupFilter, setMockupFilter] = useState<string>("all");
  const [compare, setCompare] = useState(52);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 320], [1, 0.35]);
  const swatches = useMemo(() => hexSwatches(project.colourSystem), [project.colourSystem]);
  const awards = project.awards || { agencyAwards: [], clientRecognition: [], certifications: [] };
  const afterVisual = project.comparison?.after || project.coverImage || project.gallery[0] || "";
  const beforeVisual = project.comparison?.before || project.gallery[1] || "";

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "120px 5% 48px", position: "relative", overflow: "hidden" }}>
        <motion.div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 40% 0%,${project.color}22 0%,transparent 65%)`, pointerEvents: "none", y: heroY, opacity: heroOpacity }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <Link href="/portfolio" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 14, textDecoration: "none", marginBottom: 32 }}>
              ← Back to Showcase
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "#6d28d9", fontWeight: 600 }}>{project.category}</span>
              <span style={{ fontSize: 12, color: project.color, fontWeight: 600 }}>{project.industry}</span>
              {project.featured && (
                <span style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: 100, padding: "5px 14px", fontSize: 11, color: "#fff", fontWeight: 700 }}>★ FEATURED</span>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>{project.emoji}</div>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              {project.title}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 18, lineHeight: 1.8, maxWidth: 720 }}>{project.overview}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
              {[
                ["Client", project.clientName],
                ["Year", project.year],
                ["Category", project.category],
                ["Duration", project.projectDuration],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
              {project.liveUrl && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Live</div>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 600, color: "#6d28d9", textDecoration: "none" }}>View Live →</a>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <nav aria-label="Case study chapters" style={{ position: "sticky", top: 72, zIndex: 20, backdropFilter: "blur(16px)", background: "color-mix(in srgb, var(--bg-primary) 82%, transparent)", borderBottom: "1px solid rgba(124,58,237,0.12)", padding: "10px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 8, overflowX: "auto" }} className="portfolio-tabs">
          {STORY.map((item, index) => (
            <a key={item.id} href={`#${item.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 100,
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.18)",
                color: "#6d28d9",
                fontSize: 12,
                fontWeight: 700,
              }}>
                {item.label}
                {index < STORY.length - 1 ? " ↓" : ""}
              </span>
            </a>
          ))}
        </div>
      </nav>

      <StoryBlock id="overview" eyebrow="Overview" title="Project Overview" body={project.overview} icon="📖" />

      <section style={{ padding: "8px 5% 36px" }}>
        <div className="case-story-spine" style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "64px 1fr", gap: 8 }}>
          <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 28 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 0 6px rgba(239,68,68,0.15)" }} />
            <div style={{ width: 2, flex: 1, background: "linear-gradient(180deg,#ef4444,#0ea5e9,#8b5cf6,#3b82f6,#10b981)" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
          </div>
          <div>
            <StoryBlock id="challenge" eyebrow="The Challenge" title="The problem we needed to solve" body={project.challenge} accent="#ef4444" icon="🎯" flush />
            <StoryBlock id="research" eyebrow="Research" title="What we learned first" body={project.research} accent="#0ea5e9" icon="🧪" flush />
            <section id="thinking" style={{ padding: "8px 0 20px" }}>
              <div className="glass-card" style={{ padding: "32px 28px" }}>
                <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 12, color: "#8b5cf6", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Creative Thinking</div>
                <h2 style={{ fontFamily: "Outfit", fontSize: 26, fontWeight: 800, margin: "0 0 16px" }}>Strategy, then direction</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Strategy</div>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-line", margin: 0 }}>{project.strategy}</p>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Creative Direction</div>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-line", margin: 0 }}>{project.creativeDirection}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section id="process" style={{ padding: "20px 5% 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3vw,36px)", fontWeight: 900, marginBottom: 8 }}>
              Design <span className="grad-text">Process</span>
            </h2>
            <p style={{ color: "var(--text-muted)", marginTop: 0 }}>Wireframes, mood, type, colour, and grid — walked as one system, not a pile of images.</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {[
              ["📐", "Wireframes", project.wireframes, "#6366f1"],
              ["🖼️", "Moodboard", project.moodboard, "#f59e0b"],
              ["🔤", "Typography", project.typography, "#14b8a6"],
              ["🎨", "Colour System", project.colourSystem, "#a855f7"],
              ["▦", "Grid System", project.gridSystem, "#22c55e"],
            ].map(([icon, label, body, accent]) => (
              <div key={label} className="glass-card" style={{ padding: 20, borderTop: `3px solid ${accent}` }}>
                <div style={{ fontSize: 22 }}>{icon}</div>
                <div style={{ fontFamily: "Outfit", fontWeight: 800, margin: "8px 0" }}>{label}</div>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-line", margin: 0 }}>{body}</p>
                {label === "Colour System" && swatches.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {swatches.map((hex) => (
                      <div key={hex} title={hex} style={{ width: 28, height: 28, borderRadius: 8, background: hex, border: "1px solid rgba(124,58,237,0.2)" }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoryBlock id="result" eyebrow="Final Result" title="The finished work" body={project.finalSolution} accent="#3b82f6" icon="💡" />

      <section style={{ padding: "20px 5% 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, margin: 0 }}>Interactive <span className="grad-text">Mockups</span></h2>
                <p style={{ color: "var(--text-muted)", margin: "8px 0 0" }}>Desktop, devices, print, environments, and 3D presentations.</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setMockupFilter("all")} className="btn-outline" style={{ padding: "8px 12px", fontSize: 12, borderRadius: 100, cursor: "pointer" }}>All</button>
                {MOCKUP_TYPES.map((item) => (
                  <button key={item.key} onClick={() => setMockupFilter(item.key)} className="btn-outline" style={{ padding: "8px 12px", fontSize: 12, borderRadius: 100, cursor: "pointer" }}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
          <MockupShowcase project={project} filter={mockupFilter} />
        </div>
      </section>

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9", letterSpacing: 1, textTransform: "uppercase" }}>{comparisonLabel(project.comparison?.type)}</div>
                <h3 style={{ fontFamily: "Outfit", fontSize: 24, margin: "6px 0 0" }}>{project.comparison?.label || "Before and after"}</h3>
              </div>
              <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", minHeight: 280 }}>
                <div style={{ position: "absolute", inset: 0, background: afterVisual ? undefined : `linear-gradient(135deg, ${project.color}, #a855f7)` }}>
                  {afterVisual ? <img src={afterVisual} alt="After" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 32, color: "#fff", fontWeight: 800 }}>After</div>}
                </div>
                <div style={{ position: "absolute", inset: 0, width: `${compare}%`, overflow: "hidden", borderRight: "3px solid #fff" }}>
                  <div style={{ width: `${10000 / compare}%`, maxWidth: "none", height: "100%", background: beforeVisual ? undefined : "linear-gradient(135deg,#111827,#4b5563)" }}>
                    {beforeVisual ? <img src={beforeVisual} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", paddingLeft: 32, color: "#fff", fontWeight: 800 }}>Before</div>}
                  </div>
                </div>
              </div>
              <input aria-label="Compare before and after" type="range" min={8} max={92} value={compare} onChange={(e) => setCompare(Number(e.target.value))} style={{ width: "100%", marginTop: 16 }} />
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900 }}>Project <span className="grad-text">Gallery</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {(project.gallery.length ? project.gallery : [project.coverImage, project.heroBanner, project.featuredThumbnail].filter(Boolean) as string[]).length
              ? (project.gallery.length ? project.gallery : [project.coverImage, project.heroBanner, project.featuredThumbnail].filter(Boolean) as string[]).map((img, i) => (
                <div key={img} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(124,58,237,0.2)", aspectRatio: "4/3" }}>
                  <img src={img} alt={`${project.title} gallery ${i + 1}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))
              : ["Cover", "Detail", "Application"].map((label) => (
                <div key={label} style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: `linear-gradient(145deg, ${project.color}, #1e1038)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>
                  {project.emoji} {label}
                </div>
              ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900 }}>Video <span className="grad-text">Showcase</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {VIDEO_SLOTS.map((slot) => {
              const url = project.videos?.[slot.key] || (slot.key === "youtube" ? project.youtubeEmbed : undefined) || (slot.key === "instagram" ? project.instagramEmbed : undefined);
              const embed = embedUrl(url || undefined);
              return (
                <div key={slot.key} className="glass-card" style={{ padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", marginBottom: 8 }}>{slot.label}</div>
                  {embed?.includes("youtube.com/embed") ? (
                    <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden" }}>
                      <iframe src={embed} title={`${project.title} ${slot.label}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                    </div>
                  ) : url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#6d28d9", fontWeight: 700 }}>Open {slot.label} player →</a>
                  ) : (
                    <div style={{ minHeight: 120, borderRadius: 12, background: "rgba(124,58,237,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
                      Ready for a {slot.label.toLowerCase()} embed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Project <span className="grad-text">Timeline</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 0, position: "relative" }}>
            {TIMELINE_STEPS.map((step, index) => (
              <div key={step.key} style={{ padding: 8, textAlign: "center", position: "relative" }}>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div aria-hidden="true" style={{ position: "absolute", top: 28, left: "50%", right: "-50%", height: 2, background: "linear-gradient(90deg,#7c3aed,#a855f7)", opacity: 0.35 }} />
                )}
                <div className="glass-card" style={{ padding: 16, position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 22 }}>{step.icon}</div>
                  <div style={{ fontWeight: 800, marginTop: 8 }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{project.timeline?.[step.key] || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Services <span className="grad-text">Used</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
            {(project.servicesUsed.length ? project.servicesUsed : project.deliverables).map((item) => {
              const match = SHOWCASE_SERVICES.find((service) => service.name.toLowerCase() === item.toLowerCase() || item.toLowerCase().includes(service.name.toLowerCase().split(" ")[0]));
              return (
                <div key={item} className="glass-card" style={{ padding: "18px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{match?.icon || "✦"}</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Project <span className="grad-text">Statistics</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
            {[
              ["Views", project.views.toLocaleString()],
              ["Downloads", project.downloadCount.toLocaleString()],
              ["Likes", project.likes.toLocaleString()],
              ["Enquiries", project.enquiries.toLocaleString()],
              ["Completed", project.completionDate || project.year],
              ["Duration", project.projectDuration],
              ["Team", String(project.teamSize?.length || 0)],
              ["Deliverables", String(project.deliverablesCount || project.deliverables.length)],
            ].map(([label, value]) => (
              <div key={label} className="glass-card" style={{ padding: 16, textAlign: "center" }}>
                <div style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 900 }}>{value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          {project.teamSize && project.teamSize.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
              {project.teamSize.map((member) => (
                <span key={member} style={{ padding: "6px 12px", borderRadius: 100, background: "rgba(124,58,237,0.08)", fontSize: 12, fontWeight: 600 }}>{member}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <StoryBlock id="impact" eyebrow="Results" title="Business impact" body={project.results} accent="#10b981" icon="📈" />
      <StoryBlock id="feedback" eyebrow="Client Feedback" title="What the client said" body={project.clientFeedback} accent="#f59e0b" icon="💬" />

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Awards & <span className="grad-text">Recognition</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {[
              ["Agency Awards", awards.agencyAwards],
              ["Client Recognition", awards.clientRecognition],
              ["Certifications", awards.certifications],
            ].map(([label, items]) => (
              <div key={String(label)} className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>{label}</div>
                {(items as string[]).length ? (items as string[]).map((item) => (
                  <div key={item} style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 6 }}>🏆 {item}</div>
                )) : <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Future-ready. This space is prepared for upcoming recognition.</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Project <span className="grad-text">Downloads</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
            {PROJECT_DOWNLOAD_CATALOG.map((item) => {
              const url = project.downloads?.[item.key as keyof NonNullable<PortfolioProject["downloads"]>];
              const href = url || `/contact?intent=download&resource=${item.resource}`;
              return (
                <Link key={item.key} href={href} className="glass-card" style={{ padding: 16, textDecoration: "none", color: "inherit" }}>
                  <div style={{ fontSize: 22 }}>📄</div>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#6d28d9", marginTop: 6 }}>{url ? "Preview / Download →" : "Open in library →"}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: "12px 5% 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Related <span className="grad-text">Services</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
            {project.recommendedServices.map((service) => (
              <Link key={service} href={SERVICE_HREFS[service] || "/services"} className="glass-card" style={{ padding: 18, textDecoration: "none", color: "inherit" }}>
                <div style={{ fontWeight: 800 }}>{service}</div>
                <div style={{ fontSize: 12, color: "#6d28d9", marginTop: 6 }}>Explore service →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ padding: "12px 5% 48px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Related <span className="grad-text">Projects</span></h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
              {related.map((item) => (
                <Link key={item.slug} href={`/portfolio/${item.slug}`} className="glass-card" style={{ padding: 22, textDecoration: "none", color: "inherit" }}>
                  <div style={{ fontSize: 32 }}>{item.emoji}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, marginTop: 8 }}>{item.title}</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{item.overview}</p>
                  <div style={{ color: "#6d28d9", fontWeight: 700, fontSize: 13 }}>View Case Study →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: "40px 5% 100px", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 12 }}>
              Request a similar project. <span className="grad-text">Let’s build it.</span>
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Every case study is a conversation starter — book a consultation, download a pack, or message us now.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <MagneticButton href={`/contact?intent=similar&project=${project.slug}`}>Request Similar Project</MagneticButton>
              <MagneticButton href="/contact?intent=consult" variant="outline">Book Consultation</MagneticButton>
              <MagneticButton href="/contact?intent=download&resource=capability-statement" variant="outline">Request Capability Statement</MagneticButton>
              <MagneticButton href="/contact?intent=download&resource=company-profile" variant="outline">Request Company Profile</MagneticButton>
              <MagneticButton href={WHATSAPP_URL} variant="whatsapp">WhatsApp</MagneticButton>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
