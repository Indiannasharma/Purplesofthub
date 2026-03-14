import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services — Web, Mobile, Marketing, SaaS & Music",
  description: "Explore all PurpleSoftHub services: Web Development, Mobile Apps, Digital Marketing, UI/UX Design, SaaS Development, and Music Distribution.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}/services` },
  openGraph: { title: "Our Services — PurpleSoftHub", description: "6 services under one roof: Web, Mobile, Marketing, SaaS, Design & Music." },
};

const SERVICES = [
  {
    icon: "🌐", title: "Web Development", color: "#4f46e5",
    desc: "We build blazing-fast, SEO-optimised websites and web applications that convert visitors into paying clients.",
    features: ["Business Websites", "SaaS Platforms", "E-commerce Stores", "Custom Dashboards", "Landing Pages", "Web Apps"],
    stack: ["Next.js", "React", "Tailwind CSS", "TypeScript", "MongoDB", "PostgreSQL"],
  },
  {
    icon: "📱", title: "Mobile App Development", color: "#7c3aed",
    desc: "Cross-platform mobile apps for iOS and Android that deliver exceptional user experiences and real business results.",
    features: ["iOS Apps", "Android Apps", "Cross-platform", "App Store Submission", "Push Notifications", "Offline Support"],
    stack: ["Flutter", "React Native", "Dart", "Firebase", "REST APIs"],
  },
  {
    icon: "📣", title: "Digital Marketing", color: "#6d28d9",
    desc: "Data-driven ad campaigns and organic growth strategies that bring the right customers to your business.",
    features: ["Meta Ads (Facebook/Instagram)", "Google Ads", "TikTok Ads", "Snapchat Ads", "SEO", "Content Strategy"],
    stack: ["Meta Ads Manager", "Google Ads", "Analytics", "SEMrush", "Ahrefs"],
  },
  {
    icon: "🎨", title: "UI/UX Design", color: "#7c3aed",
    desc: "Pixel-perfect product design grounded in user research, psychology, and conversion principles.",
    features: ["App Design", "Website Design", "Wireframing", "Prototyping", "Design Systems", "User Research"],
    stack: ["Figma", "Adobe XD", "Principle", "Maze", "Hotjar"],
  },
  {
    icon: "⚙️", title: "SaaS Development", color: "#6d28d9",
    desc: "End-to-end SaaS platforms built to scale — from MVP validation to enterprise-grade infrastructure.",
    features: ["MVP Development", "AI Tools", "Automation Dashboards", "Subscription Billing", "Multi-tenancy", "API Development"],
    stack: ["Next.js", "Node.js", "Stripe", "Supabase", "Prisma", "OpenAI"],
  },
  {
    icon: "🎵", title: "Music Distribution & Promotion", color: "#86198f",
    desc: "We help artists get heard worldwide — from global distribution to social media campaigns that build real fanbases.",
    features: ["Music Distribution (150+ platforms)", "Spotify Playlist Campaigns", "TikTok/Reels Promotion", "Artist Branding", "Cover Art Design", "Analytics & Reporting"],
    stack: ["DistroKid", "TuneCore", "Spotify for Artists", "Apple Music Connect"],
  },
];

export default function ServicesPage() {
  return (
    <main style={{ background: "#06030f", color: "#e2d9f3", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "120px 5% 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.2) 0%,transparent 60%)", pointerEvents: "none" }} />
        <Reveal>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 14 }}>What We Offer</p>
          <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,60px)", fontWeight: 900, color: "#fff", letterSpacing: "-2px", marginBottom: 16 }}>
            6 Services. <span className="grad-text">One Powerful Hub.</span>
          </h1>
          <p style={{ color: "#9d8fd4", fontSize: 18, maxWidth: 560, margin: "0 auto 40px" }}>
            Everything your business needs to build, launch, market, and grow — under one roof.
          </p>
          <Link href="/contact">
            <button className="btn-main" style={{ padding: "14px 32px", fontSize: 16 }}>Get a Free Quote →</button>
          </Link>
        </Reveal>
      </section>

      {/* Services */}
      <section style={{ padding: "60px 5% 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <div className="glass-card" style={{ padding: "40px 36px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${s.color},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{s.icon}</div>
                    <div style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.title}</div>
                  </div>
                  <p style={{ color: "#9d8fd4", fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>{s.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                    {s.stack.map(t => (
                      <span key={t} style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 100, padding: "4px 12px", fontSize: 12, color: "#c084fc", fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                  <Link href="/contact">
                    <button className="btn-main" style={{ padding: "10px 22px", fontSize: 14 }}>Get Started →</button>
                  </Link>
                </div>
                <div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 16 }}>What&apos;s Included:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {s.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "#a855f7", fontSize: 16 }}>✓</span>
                        <span style={{ color: "#b8a9d9", fontSize: 14 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <style>{`@media(max-width:768px){.glass-card{grid-template-columns:1fr!important}}`}</style>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 5%", textAlign: "center", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)" }}>
        <Reveal>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", marginBottom: 16 }}>
            Not Sure Which Service You Need?
          </h2>
          <p style={{ color: "#9d8fd4", fontSize: 16, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
            Book a free discovery call and we&apos;ll help you figure out exactly what your business needs.
          </p>
          <Link href="/contact">
            <button className="btn-main animate-glow" style={{ padding: "15px 36px", fontSize: 16 }}>
              📅 Book a Free Discovery Call
            </button>
          </Link>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
