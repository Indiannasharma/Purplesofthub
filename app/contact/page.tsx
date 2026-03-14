import type { Metadata } from "next";
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

export default function ContactPage() {
  return (
    <main style={{ background: "#06030f", color: "#e2d9f3", minHeight: "100vh" }}>
      <Navbar />
      <section style={{ padding: "120px 5% 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.2) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div className="contact-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start", position: "relative", zIndex: 2 }}>
          {/* Left info */}
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 14 }}>Get In Touch</p>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,56px)", fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              Let&apos;s Build Something <span className="grad-text">Great Together</span>
            </h1>
            <p style={{ color: "#9d8fd4", fontSize: 16, lineHeight: 1.85, marginBottom: 40 }}>
              Whether you need a website, an app, a full SaaS platform, or help growing your music — we&apos;re ready to make it happen. Fill in the form and we&apos;ll be in touch within 24 hours.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                ["📧", "Email Us", "hello@purplesofthub.com"],
                ["🌐", "Website", "purplesofthub.netlify.app"],
                ["📱", "Social", "@purplesofthub"],
                ["⏰", "Response Time", "Within 24 hours"],
              ].map(([ic, label, val]) => (
                <div key={label} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                  <div>
                    <div style={{ fontSize: 12, color: "#5b4d8a", fontWeight: 600, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 15, color: "#c084fc", fontWeight: 500 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right form */}
          <Reveal delay={0.15}>
            <div>
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Send us a message</p>
                <p style={{ color: "#9d8fd4", fontSize: 14 }}>Tell us about your project and we&apos;ll get back to you within 24 hours.</p>
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
