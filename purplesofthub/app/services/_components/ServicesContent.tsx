"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Service } from "@/app/services/_data/services";

// CountUp animation component for stats
function CountUpStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [count, setCount] = useState(0);

  // Parse the value to get the number
  const numValue = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const duration = 2000; // 2 seconds
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * numValue);
            setCount(current);
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [numValue, hasAnimated]);

  return (
    <div ref={ref}>
      <div style={{
        fontFamily: "Outfit",
        fontSize: "clamp(36px,4vw,52px)",
        fontWeight: 900,
        background: "linear-gradient(135deg,#7c3aed,#a855f7)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 8,
        textShadow: "0 0 30px rgba(168,85,247,0.3)",
      }}>
        {hasAnimated ? `${count.toLocaleString()}${suffix}` : `0${suffix}`}
      </div>
      <div style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const CATEGORIES = ["All", "Development", "Marketing", "Design", "Creative", "Music"];

const STATS = [
  { value: "10+", label: "Services Offered" },
  { value: "50+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "24hr", label: "Response Time" },
];

export default function ServicesContent({ services }: { services: Service[] }) {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? services : services.filter((s) => s.category === active);

  return (
    <>
      {/* ── CATEGORY TABS + CARDS ── */}
      <section style={{ padding: "0 5% 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Tabs */}
          <div className="svc-tabs-row" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 48, justifyContent: "center" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                style={{
                  background: active === cat ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(124,58,237,.1)",
                  border: active === cat ? "1px solid transparent" : "1px solid rgba(124,58,237,.2)",
                  borderRadius: 100,
                  padding: "8px 22px",
                  fontSize: 13,
                  color: active === cat ? "#fff" : "var(--accent)",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="svc-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
            {filtered.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <div
                  className="glass-card"
                  style={{ padding: "0 0 28px", height: "100%", display: "flex", flexDirection: "column", cursor: "pointer", position: "relative", overflow: "hidden" }}
                >
                  {/* Colored top border */}
                  <div style={{ height: 4, background: `linear-gradient(90deg,${s.color},#a855f7)`, borderRadius: "12px 12px 0 0" }} />

                  <div style={{ padding: "24px 28px 0", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Icon + category */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ fontSize: 40 }}>{s.icon}</div>
                      <span style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 100, padding: "4px 12px", fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
                        {s.category}
                      </span>
                    </div>

                    {/* Title + tagline */}
                    <div style={{ fontFamily: "Outfit", fontSize: 19, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>{s.title}</div>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{s.tagline}</p>

                    {/* 3 key features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 22, flex: 1 }}>
                      {s.features.slice(0, 3).map((f) => (
                        <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ color: "#a855f7", fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                          <span style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>Learn More →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ padding: "60px 5%", background: "rgba(124,58,237,.06)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div className="svc-stats-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24, textAlign: "center" }}>
          {STATS.map((stat) => (
            <CountUpStat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "90px 5%", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3.5vw,46px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", marginBottom: 16 }}>
            Not Sure Which Service You Need?
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 36, lineHeight: 1.75 }}>
            Book a free discovery call and we&apos;ll help you figure out exactly what your business needs.
          </p>
          <Link href="/contact">
            <button className="btn-main animate-glow" style={{ padding: "15px 36px", fontSize: 16 }}>
              📅 Book a Free Call
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
