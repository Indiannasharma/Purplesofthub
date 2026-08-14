"use client";

import { motion } from "framer-motion";
import type { PortfolioProject } from "@/types/portfolio";
import { MOCKUP_TYPES } from "@/lib/portfolio-showcase";

function Screen({ src, color, emoji, title }: { src?: string; color: string; emoji: string; title: string }) {
  if (src) {
    return <img src={src} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  }
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: `linear-gradient(145deg, ${color}, #1e1038)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      gap: 6,
    }}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "0 10px", textAlign: "center" }}>{title}</span>
    </div>
  );
}

function Device({ type, children }: { type: string; children: React.ReactNode }) {
  if (type === "desktop") {
    return (
      <div>
        <div style={{ background: "#111", borderRadius: 10, padding: "10px 10px 6px", boxShadow: "0 18px 40px rgba(0,0,0,0.25)" }}>
          <div style={{ borderRadius: 6, overflow: "hidden", aspectRatio: "16/10" }}>{children}</div>
        </div>
        <div style={{ width: 70, height: 10, background: "#222", margin: "0 auto" }} />
        <div style={{ width: 120, height: 8, background: "#333", margin: "0 auto", borderRadius: "0 0 8px 8px" }} />
      </div>
    );
  }
  if (type === "laptop") {
    return (
      <div>
        <div style={{ background: "#1a1a1a", borderRadius: "12px 12px 0 0", padding: 8 }}>
          <div style={{ borderRadius: 4, overflow: "hidden", aspectRatio: "16/10" }}>{children}</div>
        </div>
        <div style={{ height: 14, background: "linear-gradient(180deg,#d1d5db,#9ca3af)", borderRadius: "0 0 10px 10px", position: "relative" }}>
          <div style={{ position: "absolute", left: "50%", top: 4, width: 40, height: 4, background: "#6b7280", borderRadius: 4, transform: "translateX(-50%)" }} />
        </div>
      </div>
    );
  }
  if (type === "tablet") {
    return (
      <div style={{ background: "#111", borderRadius: 22, padding: 10, boxShadow: "0 16px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "3/4" }}>{children}</div>
      </div>
    );
  }
  if (type === "phone") {
    return (
      <div style={{ background: "#111", borderRadius: 28, padding: "12px 8px", width: "62%", margin: "0 auto", boxShadow: "0 16px 32px rgba(0,0,0,0.28)" }}>
        <div style={{ width: 48, height: 6, background: "#222", borderRadius: 8, margin: "0 auto 8px" }} />
        <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "9/16" }}>{children}</div>
      </div>
    );
  }
  if (type === "magazine") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 180, boxShadow: "0 16px 30px rgba(0,0,0,0.18)", transform: "rotate(-1deg)" }}>
        <div style={{ background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>Cover</div>
        <div style={{ overflow: "hidden" }}>{children}</div>
      </div>
    );
  }
  if (type === "billboard") {
    return (
      <div>
        <div style={{ background: "#111", padding: 8, borderRadius: 4, boxShadow: "0 20px 36px rgba(0,0,0,0.25)" }}>
          <div style={{ overflow: "hidden", aspectRatio: "16/7" }}>{children}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 18%" }}>
          <div style={{ width: 8, height: 36, background: "#6b7280" }} />
          <div style={{ width: 8, height: 36, background: "#6b7280" }} />
        </div>
      </div>
    );
  }
  if (type === "packaging") {
    return (
      <div style={{ perspective: 800, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "70%", transform: "rotateY(-18deg) rotateX(8deg)", transformStyle: "preserve-3d" }}>
          <div style={{ overflow: "hidden", aspectRatio: "3/4", borderRadius: 4, boxShadow: "18px 18px 0 rgba(0,0,0,0.18)" }}>{children}</div>
        </div>
      </div>
    );
  }
  if (type === "businessCard") {
    return (
      <div style={{ width: "82%", margin: "18px auto", borderRadius: 10, overflow: "hidden", boxShadow: "0 12px 24px rgba(0,0,0,0.18)", aspectRatio: "1.75/1" }}>
        {children}
      </div>
    );
  }
  if (type === "vehicleBranding") {
    return (
      <div style={{ position: "relative", minHeight: 150 }}>
        <div style={{ position: "absolute", inset: "28% 8% 22%", borderRadius: "40px 70px 20px 20px", overflow: "hidden" }}>{children}</div>
        <div style={{ position: "absolute", left: "16%", bottom: 18, width: 28, height: 28, borderRadius: "50%", background: "#111" }} />
        <div style={{ position: "absolute", right: "18%", bottom: 18, width: 28, height: 28, borderRadius: "50%", background: "#111" }} />
        <div style={{ position: "absolute", inset: "18% 10% 30%", border: "3px solid #111", borderRadius: "48px 80px 16px 16px", pointerEvents: "none" }} />
      </div>
    );
  }
  if (type === "rollupBanner") {
    return (
      <div style={{ width: "46%", margin: "0 auto" }}>
        <div style={{ height: 8, background: "#374151", borderRadius: 4 }} />
        <div style={{ overflow: "hidden", aspectRatio: "2/5" }}>{children}</div>
        <div style={{ height: 10, background: "#111827", borderRadius: 6 }} />
      </div>
    );
  }
  if (type === "socialMedia") {
    return (
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#111" }}>@purplesofthub</div>
        <div style={{ aspectRatio: "1/1" }}>{children}</div>
        <div style={{ padding: 8, fontSize: 11, color: "#6b7280" }}>♡  Comment  Share</div>
      </div>
    );
  }
  return (
    <motion.div animate={{ y: [0, -10, 0], rotateZ: [-2, 2, -2] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{ transformStyle: "preserve-3d" }}>
      <div style={{ borderRadius: 18, overflow: "hidden", aspectRatio: "4/3", boxShadow: "0 24px 40px rgba(124,58,237,0.28)", transform: "rotateX(8deg) rotateY(-12deg)" }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function MockupShowcase({
  project,
  filter,
}: {
  project: PortfolioProject;
  filter: string;
}) {
  const items = filter === "all" ? MOCKUP_TYPES : MOCKUP_TYPES.filter((item) => item.key === filter);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 18 }}>
      {items.map((item, index) => (
        <motion.div
          key={item.key}
          className="glass-card"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04 }}
          style={{ padding: 16 }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: "#6d28d9", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12 }}>{item.label}</div>
          <Device type={item.key}>
            <Screen
              src={project.mockups?.[item.key as keyof NonNullable<PortfolioProject["mockups"]>] || project.coverImage || project.gallery[0] || undefined}
              color={project.color}
              emoji={project.emoji}
              title={project.title}
            />
          </Device>
        </motion.div>
      ))}
    </div>
  );
}
