import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact Us — Start Your Project",
  description: "Get in touch with PurpleSoftHub. Tell us about your project and we'll get back to you within 24 hours.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}/contact` },
  openGraph: { title: "Contact PurpleSoftHub — Start Your Project", description: "Tell us about your project and we'll get back to you within 24 hours." },
};

type ContactInfoItem = {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
};

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.7 4.3 18.5 19.4c-.2 1.1-.9 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.9 12.8l-5-1.6c-1.1-.3-1.1-1.1.2-1.6L20.5 2.1c.9-.3 1.7.2 1.2 2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

const contactInfoItems: ContactInfoItem[] = [
  { icon: "📧", label: "Email Us", value: "hello@purplesofthub.com" },
  { icon: "🌐", label: "Website", value: "purplesofthub.com" },
  { icon: "📱", label: "Social", value: "@purplesofthub" },
  {
    icon: <TelegramIcon />,
    label: "Telegram Support",
    value: "@PurpleSofthubsupport",
    href: "https://t.me/PurpleSofthubsupport",
  },
  { icon: "⏰", label: "Response Time", value: "Within 24 hours" },
];

const contactRowStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
};

export default function ContactPage() {
  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />
      <section style={{ padding: "120px 5% 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.2) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div className="contact-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start", position: "relative", zIndex: 2 }}>
          {/* Left info */}
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 14 }}>Get In Touch</p>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,56px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              Let&apos;s Build Something <span className="grad-text">Great Together</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.85, marginBottom: 40 }}>
              Whether you need a website, an app, a full SaaS platform, or help growing your music — we&apos;re ready to make it happen. Fill in the form and we&apos;ll be in touch within 24 hours.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 28, padding: "14px 16px", border: "1px solid rgba(34,158,217,.24)", borderRadius: 12, background: "rgba(34,158,217,.08)" }}>
              Having trouble reaching us on WhatsApp? Chat with us on Telegram for faster support.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {contactInfoItems.map(({ icon, label, value, href }) => {
                const content = (
                  <>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, color: "#c084fc" }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 15, color: "#c084fc", fontWeight: 500 }}>{value}</div>
                    </div>
                  </>
                );

                if (href) {
                  return (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ ...contactRowStyle, textDecoration: "none" }}>
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={label} style={contactRowStyle}>
                    {content}
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Right form */}
          <Reveal delay={0.15}>
            <div>
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Send us a message</p>
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Tell us about your project and we&apos;ll get back to you within 24 hours.</p>
              </div>
              <ContactForm />
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:768px){section > div{grid-template-columns:1fr!important}}`}</style>
      </section>
      <Footer />
    </main>
  );
}
