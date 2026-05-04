import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getServiceBySlug } from "@/lib/payments/service-plans";
import ServicePricingCards from "@/components/services/ServicePricingCards";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  title: "SaaS Development Pricing | PurpleSoftHub",
  description:
    "Transparent SaaS development pricing from N1,500,000. Compare MVP, Growth, and Enterprise plans.",
  keywords: ["saas pricing", "mvp development pricing", "subscription platform pricing", "PurpleSoftHub pricing"],
  alternates: { canonical: `${SITE_URL}/services/saas-development/pricing` },
  openGraph: {
    title: "SaaS Development Pricing | PurpleSoftHub",
    description: "Transparent SaaS development pricing from N1,500,000",
    url: `${SITE_URL}/services/saas-development/pricing`,
    siteName: "PurpleSoftHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Development Pricing",
    description: "Transparent SaaS development pricing from N1,500,000",
  },
};

export default function SaaSDevelopmentPricingPage() {
  const service = getServiceBySlug("saas-development");

  if (!service) return null;

  return (
    <>
      <Navbar />

      <main style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        position: "relative",
        overflowX: "hidden",
      }}>
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--blog-grid-line, rgba(124,58,237,0.08)) 1px, transparent 1px),
            linear-gradient(90deg, var(--blog-grid-line, rgba(124,58,237,0.08)) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{
          position: "fixed",
          top: "-200px",
          left: "-200px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
        <div style={{
          position: "fixed",
          bottom: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <section style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "clamp(60px, 8vw, 100px) 24px 80px",
            textAlign: "center",
          }}>
            <div style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "700px",
              margin: "0 auto",
              animation: "slideIn 0.6s ease-out",
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: "100px",
                padding: "8px 20px",
                marginBottom: "24px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#a855f7",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                <span style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#a855f7",
                  display: "inline-block",
                  animation: "pulseDot 1.8s ease-in-out infinite",
                }} />
                SaaS Development Pricing
              </div>

              <h1 style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 900,
                color: "var(--text-primary)",
                margin: "0 0 20px",
                lineHeight: 1.1,
                letterSpacing: "-0.5px",
              }}>
                Choose Your{" "}
                <span style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7, #22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Perfect SaaS Plan
                </span>
              </h1>

              <p style={{
                fontSize: "clamp(15px, 2vw, 18px)",
                color: "var(--text-secondary)",
                margin: "0 0 36px",
                lineHeight: 1.7,
                maxWidth: "560px",
                marginLeft: "auto",
                marginRight: "auto",
              }}>
                Flexible SaaS development plans for founders, startups, and businesses launching dashboards, portals, subscription products, and scalable digital tools.
              </p>
            </div>
          </section>

          <section style={{
            maxWidth: "1300px",
            margin: "0 auto",
            padding: "clamp(40px, 5vw, 80px) 16px",
          }}>
            <ServicePricingCards service={service} showAll={true} />
          </section>
        </div>
      </main>

      <Footer />

      <style>{`
        :root {
          --blog-grid-line: rgba(124, 58, 237, 0.08);
        }

        .dark {
          --blog-grid-line: rgba(124, 58, 237, 0.06);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseDot {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
