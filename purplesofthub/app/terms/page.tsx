import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  title: "Terms of Service — PurpleSoftHub",
  description:
    "Read PurpleSoftHub's terms and conditions for using our website and services.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "Terms of Service — PurpleSoftHub",
    description: "Read PurpleSoftHub's terms and conditions for using our website and services.",
    url: `${SITE_URL}/terms`,
    siteName: "PurpleSoftHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service — PurpleSoftHub",
    description: "Read PurpleSoftHub's terms and conditions for using our website and services.",
  },
};

const SECTIONS = [
  {
    title: "1. Welcome",
    content:
      "Welcome to PurpleSoftHub. By accessing or using our website and services, you agree to the following terms and conditions.",
  },
  {
    title: "2. Use of the Website",
    content:
      "You agree to use this website for lawful purposes only and not to engage in any activity that may harm the website, its users, or the company.",
  },
  {
    title: "3. Services",
    content:
      "PurpleSoftHub provides digital services including web development, digital marketing, branding, and other technology solutions. Specific project terms may be outlined in separate agreements with clients.",
  },
  {
    title: "4. Intellectual Property",
    content:
      "All content on this website, including text, graphics, logos, and designs, is the property of PurpleSoftHub unless otherwise stated and may not be reproduced or distributed without permission.",
  },
  {
    title: "5. Limitation of Liability",
    content:
      "While we strive to provide accurate information and reliable services, PurpleSoftHub shall not be held liable for any damages resulting from the use or inability to use our website or services.",
  },
  {
    title: "6. Third-Party Links",
    content:
      "Our website may contain links to external websites or services. We are not responsible for the content or practices of these third-party sites.",
  },
  {
    title: "7. Changes to Terms",
    content:
      "We reserve the right to update or modify these Terms of Service at any time. Continued use of the website after changes indicates acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <main style={{ background: "var(--cyber-bg)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "130px 5% 60px" }}>
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(109,40,217,.15) 0%,transparent 65%)", top: "-20%", right: "-10%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,.12) 0%,transparent 65%)", bottom: "-10%", left: "5%", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <Reveal>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 28, fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
              LEGAL
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(34px,4vw,56px)", fontWeight: 900, lineHeight: 1.1, color: "var(--text-primary)", letterSpacing: "-2px", marginBottom: 16 }}>
              Terms of <span className="grad-text">Service</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 32 }}>Last updated: March 2026</p>
          </Reveal>
          <Reveal delay={0.25}>
            <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#7c3aed,#a855f7,transparent)", borderRadius: 2, maxWidth: 400, margin: "0 auto" }} />
          </Reveal>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section style={{ padding: "20px 5% 100px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {SECTIONS.map((section, i) => (
            <Reveal key={section.title} delay={i * 0.05}>
              <div style={{ marginBottom: 44 }}>
                <h2 style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, color: "var(--cyber-heading)", marginBottom: 14, borderLeft: "3px solid #7c3aed", paddingLeft: 12 }}>
                  {section.title}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.85 }}>
                  {section.content}
                </p>
              </div>
            </Reveal>
          ))}

          {/* Contact card */}
          <Reveal delay={0.1}>
            <div style={{ background: "var(--cyber-card)", border: "1px solid var(--cyber-border)", borderRadius: 20, padding: "clamp(28px, 4vw, 48px)", backdropFilter: "blur(10px)", textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
              <h3 style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", marginBottom: 10 }}>
                Questions about our terms?
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
                Contact us at{" "}
                <a href="mailto:hello@purplesofthub.com" style={{ color: "var(--accent)", textDecoration: "none" }}>
                  hello@purplesofthub.com
                </a>
              </p>
              <Link href="/contact">
                <button className="btn-main" style={{ padding: "13px 32px", fontSize: 15 }}>Contact Us</button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
