import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { PORTFOLIO_PROJECTS } from "../_data/portfolio";

export async function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study | PurpleSoftHub`,
    description: project.overview,
    openGraph: {
      title: `${project.title} — PurpleSoftHub`,
      description: project.overview,
      type: "website",
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  const others = PORTFOLIO_PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section style={{ padding: "120px 5% 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 40% 0%,${project.color}22 0%,transparent 65%)`, pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <Link href="/portfolio" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 14, textDecoration: "none", marginBottom: 32, transition: "color 0.2s" }}>
              ← Back to Portfolio
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "#6d28d9", fontWeight: 600 }}>{project.category}</span>
              <span style={{ fontSize: 12, color: project.color, fontWeight: 600 }}>{project.industry}</span>
              {project.featured && (
                <span style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: 100, padding: "5px 14px", fontSize: 11, color: "#fff", fontWeight: 700, letterSpacing: "0.05em" }}>★ FEATURED</span>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>{project.emoji}</div>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              {project.title}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 18, lineHeight: 1.8, maxWidth: 680 }}>{project.overview}</p>
          </Reveal>

          {/* Project Meta */}
          <Reveal delay={0.15}>
            <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Client</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{project.client}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Year</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{project.year}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Category</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{project.category}</div>
              </div>
              {project.liveUrl && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Live</div>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 600, color: "#6d28d9", textDecoration: "none" }}>
                    View Live →
                  </a>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROJECT OVERVIEW
      ══════════════════════════════════════ */}
      <section style={{ padding: "20px 5% 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div className="glass-card" style={{ padding: "36px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>📖</span>
                <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 13, color: "#6d28d9", letterSpacing: 1, textTransform: "uppercase" }}>Project Overview</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.85, margin: 0 }}>{project.overview}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CHALLENGE + SOLUTION
      ══════════════════════════════════════ */}
      <section style={{ padding: "20px 5% 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          {/* Challenge */}
          <Reveal>
            <div className="glass-card" style={{ padding: "36px 32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#ef4444,transparent)", borderRadius: "20px 0 0 20px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🎯</span>
                <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 13, color: "#ef4444", letterSpacing: 1, textTransform: "uppercase" }}>The Challenge</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.85, margin: 0 }}>{project.challenge}</p>
            </div>
          </Reveal>

          {/* Solution */}
          <Reveal delay={0.1}>
            <div className="glass-card" style={{ padding: "36px 32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#3b82f6,transparent)", borderRadius: "20px 0 0 20px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>💡</span>
                <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 13, color: "#3b82f6", letterSpacing: 1, textTransform: "uppercase" }}>Creative Solution</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.85, margin: 0 }}>{project.solution}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DELIVERABLES
      ══════════════════════════════════════ */}
      <section style={{ padding: "20px 5% 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3vw,32px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1px", margin: 0 }}>
                What We <span className="grad-text">Delivered</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {project.deliverables.map((deliverable, i) => (
              <Reveal key={deliverable} delay={i * 0.05}>
                <div className="glass-card" style={{ padding: "20px 16px", textAlign: "center", height: "100%" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{deliverable}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          GALLERY
      ══════════════════════════════════════ */}
      {project.gallery.length > 0 && (
        <section style={{ padding: "20px 5% 60px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3vw,32px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1px", margin: 0 }}>
                  Project <span className="grad-text">Gallery</span>
                </h2>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
              {project.gallery.map((img, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(124,58,237,0.2)", aspectRatio: "4/3", position: "relative" }}>
                    <img
                      src={img}
                      alt={`${project.title} - ${i + 1}`}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          PROJECT DETAILS / TAGS
      ══════════════════════════════════════ */}
      <section style={{ padding: "20px 5% 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div className="glass-card" style={{ padding: "36px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 24 }}>🏷️</span>
                <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 13, color: "#6d28d9", letterSpacing: 1, textTransform: "uppercase" }}>Project Details</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {project.tags.map((tag) => (
                  <span key={tag} style={{ background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 100, padding: "8px 18px", fontSize: 13, color: "#6d28d9", fontWeight: 600 }}>{tag}</span>
                ))}
              </div>

              {project.tech && project.tech.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0 20px" }}>
                    <span style={{ fontSize: 24 }}>⚙️</span>
                    <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 13, color: "#6d28d9", letterSpacing: 1, textTransform: "uppercase" }}>Technology Stack</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {project.tech.map((t) => (
                      <span key={t} style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 100, padding: "8px 18px", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MORE PROJECTS
      ══════════════════════════════════════ */}
      {others.length > 0 && (
        <section style={{ padding: "20px 5% 80px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <Reveal>
              <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 24 }}>More Projects</h2>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {others.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.1}>
                  <Link href={`/portfolio/${p.slug}`} style={{ textDecoration: "none" }}>
                    <div className="glass-card" style={{ padding: "28px 24px", height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 36 }}>{p.emoji}</div>
                        <span style={{ background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 100, padding: "3px 10px", fontSize: 10.5, color: "#6d28d9", fontWeight: 600 }}>{p.category}</span>
                      </div>
                      <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "var(--text-primary)" }}>{p.title}</div>
                      <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7, margin: 0, flex: 1 }}>{p.overview}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6d28d9", fontSize: 13, fontWeight: 600 }}>
                        View Case Study <span>→</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section style={{ padding: "60px 5% 100px", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", marginBottom: 16 }}>
              Like what you see? <span className="grad-text">Let's talk.</span>
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 16 }}>Tell us about your project and we'll get back to you within 24 hours.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact"><button className="btn-main" style={{ padding: "14px 32px", fontSize: 15 }}>Start a Project →</button></Link>
              <Link href="/portfolio"><button className="btn-outline" style={{ padding: "14px 32px", fontSize: 15 }}>← All Projects</button></Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}