import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import services, { getServiceBySlug, getRelatedServices } from "@/app/services/_data/services";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    keywords: service.keywords,
    alternates: { canonical: `${SITE_URL}/services/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `${SITE_URL}/services/${service.slug}`,
      siteName: "PurpleSoftHub",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: service.metaTitle,
      description: service.metaDescription,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = getRelatedServices(service.relatedServices);

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ padding: "120px 5% 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle,${service.color}22 0%,transparent 65%)`, top: "-20%", left: "-10%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,.12) 0%,transparent 65%)", bottom: "-10%", right: "0", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 20, fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
                {service.category.toUpperCase()}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,56px)", fontWeight: 900, lineHeight: 1.1, color: "var(--text-primary)", letterSpacing: "-2px", marginBottom: 16 }}>
                <span className="grad-text">{service.title}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p style={{ fontFamily: "Outfit", fontSize: "clamp(17px,2vw,22px)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.4 }}>
                {service.tagline}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.85, marginBottom: 36 }}>
                {service.heroDescription}
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="/contact">
                  <button className="btn-main animate-glow" style={{ padding: "14px 30px", fontSize: 15 }}>Start a Project</button>
                </Link>
                <Link href="/contact">
                  <button className="btn-outline" style={{ padding: "14px 30px", fontSize: 15 }}>Book a Free Call →</button>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right — icon card */}
          <Reveal delay={0.2}>
            <div className="glass-card animate-float" style={{ padding: "48px 40px", textAlign: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: 24, background: `linear-gradient(135deg,${service.color},#a855f7)`, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, boxShadow: `0 16px 48px ${service.color}44` }}>
                {service.icon}
              </div>
              <div style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: 22, color: "var(--text-primary)", marginBottom: 8 }}>
                {service.shortTitle}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                {service.tagline}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {service.technologies.slice(0, 4).map((t) => (
                  <span key={t} style={{ background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 100, padding: "4px 12px", fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:768px){section > div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── OVERVIEW + FEATURES ── */}
      <section style={{ padding: "90px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          <Reveal>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>OVERVIEW</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3vw,40px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: 20 }}>
                What&apos;s Included in Our <span className="grad-text">{service.shortTitle}</span> Service
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.85, marginBottom: 28 }}>
                {service.overview}
              </p>
              {/* Benefits */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {service.benefits.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#a855f7", fontSize: 16, flexShrink: 0 }}>✓</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="glass-card" style={{ padding: "32px 28px" }}>
              <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 20 }}>
                What&apos;s Included:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {service.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>✓</div>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:768px){section > div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── PROCESS ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>HOW WE WORK</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px" }}>
                Our <span className="grad-text">Process</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {service.process.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.1}>
                <div className="glass-card" style={{ padding: "32px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${service.color},#a855f7)` }} />
                  <div style={{ fontFamily: "Outfit", fontSize: 44, fontWeight: 900, color: "rgba(124,58,237,.2)", marginBottom: 12 }}>{p.step}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 16, color: "var(--text-primary)", marginBottom: 10 }}>{p.title}</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGIES ── */}
      <section style={{ padding: "80px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>TOOLS & TECH</p>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3vw,40px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", marginBottom: 40 }}>
              What We <span className="grad-text">Use</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {service.technologies.map((t) => (
                <span key={t} className="glass-card" style={{ padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "var(--accent)", borderRadius: 100 }}>{t}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>FAQ</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3vw,42px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px" }}>
                Common <span className="grad-text">Questions</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {service.faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className="glass-card" style={{ padding: "28px 32px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 3, bottom: 0, background: "linear-gradient(180deg,#7c3aed,#a855f7)", borderRadius: "4px 0 0 4px" }} />
                  <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 10 }}>
                    {faq.q}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.8 }}>{faq.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATED SERVICES ── */}
      {related.length > 0 && (
        <section style={{ padding: "80px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>EXPLORE MORE</p>
                <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3vw,38px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1px" }}>
                  Related <span className="grad-text">Services</span>
                </h2>
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {related.map((r, i) => (
                <Reveal key={r.slug} delay={i * 0.08}>
                  <Link href={`/services/${r.slug}`} style={{ textDecoration: "none" }}>
                    <div className="glass-card" style={{ padding: "28px 24px", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${r.color},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{r.icon}</div>
                        <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>{r.shortTitle}</div>
                      </div>
                      <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>{r.tagline}</p>
                      <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>Learn more →</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding: "100px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%,rgba(124,58,237,.16) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Reveal>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 660, margin: "0 auto" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase", marginBottom: 20 }}>
              → Ready to Get Started? ←
            </div>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(30px,5vw,54px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              Let&apos;s Build Something <span className="grad-text">Extraordinary</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>
              Book a free discovery call and let&apos;s talk about your {service.shortTitle.toLowerCase()} project.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact">
                <button className="btn-main animate-glow" style={{ padding: "16px 38px", fontSize: 16 }}>Start a Project</button>
              </Link>
              <Link href="/services">
                <button className="btn-outline" style={{ padding: "16px 38px", fontSize: 16 }}>All Services →</button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
