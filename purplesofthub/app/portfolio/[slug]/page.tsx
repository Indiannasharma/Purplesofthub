import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const PROJECTS = [
  {
    slug: "eco-pi-rewards",
    emoji: "♻️",
    title: "Eco Pi Rewards",
    category: "Web Development",
    tag: "Sustainability · Blockchain",
    description: "Environmental sustainability rewards platform where users recycle bottles and earn Pi cryptocurrency as rewards.",
    tech: ["Next.js", "React", "Tailwind CSS", "Pi Network API"],
    color: "#22c55e",
    challenge: "Build an engaging platform that incentivises eco-friendly behaviour through blockchain rewards.",
    solution: "Designed a gamified recycling tracking system integrated with Pi Network for seamless reward distribution.",
    result: "Platform successfully launched connecting eco-conscious users with Pi cryptocurrency rewards.",
  },
  {
    slug: "24hrs-content-hub",
    emoji: "📸",
    title: "24HRS Content Hub",
    category: "Web Development",
    tag: "Creative · Booking",
    description: "Premium content creation studio in Lekki, Lagos — photoshoots, podcasts, brand content and events with online booking.",
    tech: ["HTML", "Tailwind CSS (CDN)", "JavaScript", "Netlify"],
    color: "#f59e0b",
    challenge: "Build a fast, elegant booking website for a Lagos content studio with zero backend cost.",
    solution: "Delivered a CDN-based Tailwind site with smooth animations, service showcase and booking inquiry form deployed on Netlify.",
    result: "Studio now receives consistent online booking inquiries with a professional digital presence.",
  },
  {
    slug: "starzz-properties",
    emoji: "🏠",
    title: "Starzz Properties Ltd",
    category: "Web Development",
    tag: "Real Estate · Lead Generation",
    description: "Premium real estate platform with property listings, lead generation tools and professional brand presence.",
    tech: ["Next.js", "Tailwind CSS", "MongoDB", "Nodemailer"],
    color: "#7c3aed",
    challenge: "Create a credible, conversion-focused real estate website that generates qualified leads.",
    solution: "Built a modern property listing platform with lead capture forms, WhatsApp CTA integration and SEO optimisation.",
    result: "Significant increase in qualified property inquiries and stronger brand authority online.",
  },
  {
    slug: "3rdyearts",
    emoji: "🎨",
    title: "3rdyearts",
    category: "UI/UX Design",
    tag: "Creative · Portfolio",
    description: "Creative digital solutions platform showcasing artistic projects, digital art and creative services.",
    tech: ["React", "Tailwind CSS", "Framer Motion", "Netlify"],
    color: "#ec4899",
    challenge: "Design a visually striking portfolio that captures the brand's unique creative identity.",
    solution: "Crafted an immersive dark-themed portfolio with smooth animations and a curated gallery of creative works.",
    result: "Brand now has a compelling digital presence attracting creative collaboration opportunities.",
  },
  {
    slug: "collinskind-fashion",
    emoji: "👗",
    title: "CollinsKind Fashion",
    category: "Digital Marketing",
    tag: "Fashion · Branding",
    description: "Timeless fashion brand digital presence — website, social media strategy and brand identity.",
    tech: ["Next.js", "Tailwind CSS", "Instagram API", "Meta Ads"],
    color: "#a855f7",
    challenge: "Establish a strong digital presence for an emerging Nigerian fashion brand.",
    solution: "Built a stunning fashion website with Instagram feed integration, lookbook gallery and targeted Meta Ads campaign strategy.",
    result: "Brand successfully launched online with growing social media following and increased customer engagement.",
  },
];

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = PROJECTS.find((p) => p.slug === params.slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study`,
    description: project.description,
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const project = PROJECTS.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const others = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 2);

  return (
    <main style={{ background: "#06030f", color: "#e2d9f3", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "120px 5% 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 40% 0%,${project.color}22 0%,transparent 65%)`, pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <Link href="/portfolio" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#9d8fd4", fontSize: 14, textDecoration: "none", marginBottom: 32 }}>
              ← Back to Portfolio
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "#c084fc", fontWeight: 600 }}>{project.category}</span>
              <span style={{ fontSize: 12, color: project.color, fontWeight: 600 }}>{project.tag}</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>{project.emoji}</div>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              {project.title}
            </h1>
            <p style={{ color: "#9d8fd4", fontSize: 18, lineHeight: 1.8, maxWidth: 680 }}>{project.description}</p>
          </Reveal>
        </div>
      </section>

      {/* Case Study Body */}
      <section style={{ padding: "20px 5% 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Challenge → Solution → Result */}
          {[
            { label: "01 — The Challenge", icon: "🎯", text: project.challenge, color: "#ef4444" },
            { label: "02 — Our Solution", icon: "💡", text: project.solution, color: "#3b82f6" },
            { label: "03 — The Result", icon: "🚀", text: project.result, color: project.color },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 0.1}>
              <div className="glass-card" style={{ padding: "36px 32px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(180deg,${item.color},transparent)`, borderRadius: "20px 0 0 20px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 13, color: item.color, letterSpacing: 1, textTransform: "uppercase" }}>{item.label}</span>
                </div>
                <p style={{ color: "#b8a9d9", fontSize: 16, lineHeight: 1.85 }}>{item.text}</p>
              </div>
            </Reveal>
          ))}

          {/* Tech Stack */}
          <Reveal delay={0.3}>
            <div className="glass-card" style={{ padding: "36px 32px" }}>
              <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 20 }}>⚙️ Tech Stack</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {project.tech.map(t => (
                  <span key={t} style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "8px 18px", fontSize: 14, color: "#c084fc", fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* More Projects */}
      {others.length > 0 && (
        <section style={{ padding: "0 5% 80px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Reveal>
              <h2 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 24 }}>More Projects</h2>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {others.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.1}>
                  <div className="glass-card" style={{ padding: "28px 24px" }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{p.emoji}</div>
                    <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 8 }}>{p.title}</div>
                    <p style={{ color: "#9d8fd4", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{p.description}</p>
                    <Link href={`/portfolio/${p.slug}`}>
                      <button className="btn-outline" style={{ padding: "8px 18px", fontSize: 13 }}>View Case Study →</button>
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: "60px 5% 100px", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", marginBottom: 16 }}>
              Like what you see? <span className="grad-text">Let&apos;s talk.</span>
            </h2>
            <p style={{ color: "#9d8fd4", marginBottom: 32, fontSize: 16 }}>Tell us about your project and we&apos;ll get back to you within 24 hours.</p>
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
