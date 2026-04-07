import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  title: "Privacy Policy — PurpleSoftHub",
  description:
    "Learn how PurpleSoftHub collects, uses, and protects your personal information.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "Privacy Policy — PurpleSoftHub",
    description: "Learn how PurpleSoftHub collects, uses, and protects your personal information.",
    url: `${SITE_URL}/privacy`,
    siteName: "PurpleSoftHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — PurpleSoftHub",
    description: "Learn how PurpleSoftHub collects, uses, and protects your personal information.",
  },
};

const SECTIONS = [
  {
    title: "1. Introduction",
    content:
      "At PurpleSoftHub, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard the information you provide when using our website.",
  },
  {
    title: "2. Information We Collect",
    content:
      "We may collect the following types of information:\n\n• Personal information such as your name and email address when you submit forms on our website.\n• Contact details and project information submitted through our contact forms or chatbot.\n• Analytics data related to how users interact with our website.",
  },
  {
    title: "3. How We Use Your Information",
    content:
      "The information we collect may be used to:\n\n• Respond to inquiries or service requests\n• Improve our services and website experience\n• Send updates or communications related to our services\n• Analyze website performance and user engagement",
  },
  {
    title: "4. Data Protection",
    content:
      "We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, or misuse.",
  },
  {
    title: "5. Third-Party Services",
    content:
      "Our website may use third-party services such as analytics providers, email services, and communication tools to improve functionality. These services may collect information according to their own privacy policies.",
  },
  {
    title: "6. Your Privacy Rights",
    content:
      "You have the right to request access to or deletion of your personal information stored by us. If you wish to make such a request, please contact us through our website.",
  },
  {
    title: "7. Updates to This Policy",
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our services or legal requirements.",
  },
];

export default function PrivacyPage() {
  return (
    <main style={{ background: "var(--cyber-bg)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "130px 5% 60px" }}>
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(109,40,217,.15) 0%,transparent 65%)", top: "-20%", left: "-10%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,.12) 0%,transparent 65%)", bottom: "-10%", right: "5%", pointerEvents: "none" }} />
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
              Privacy <span className="grad-text">Policy</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 32 }}>Last updated: March 2026</p>
          </Reveal>
          {/* Divider */}
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
                <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.85, whiteSpace: "pre-line" }}>
                  {section.content}
                </p>
              </div>
            </Reveal>
          ))}

          {/* Contact card */}
          <Reveal delay={0.1}>
            <div style={{ background: "var(--cyber-card)", border: "1px solid var(--cyber-border)", borderRadius: 20, padding: "clamp(28px, 4vw, 48px)", backdropFilter: "blur(10px)", textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>✉️</div>
              <h3 style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", marginBottom: 10 }}>
                Questions about our privacy policy?
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
