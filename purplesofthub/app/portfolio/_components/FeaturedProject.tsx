"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PortfolioProject } from "@/types/portfolio";

interface FeaturedProjectProps {
  project: PortfolioProject;
  index: number;
}

export default function FeaturedProject({ project, index }: FeaturedProjectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="portfolio-card"
      style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        background: "var(--bg-card)",
        border: "1px solid rgba(124,58,237,0.2)",
        boxShadow: "0 8px 40px rgba(124,58,237,0.1)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
      }}
      whileHover={{ y: -6 }}
      onHoverStart={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(124,58,237,0.5)";
        el.style.boxShadow = "0 30px 80px rgba(124,58,237,0.25), 0 0 60px rgba(124,58,237,0.1)";
      }}
      onHoverEnd={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(124,58,237,0.2)";
        el.style.boxShadow = "0 8px 40px rgba(124,58,237,0.1)";
      }}
    >
      {/* Cover Area */}
      <div
        style={{
          position: "relative",
          height: 200,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${project.color}22, rgba(124,58,237,0.1))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Decorative background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% 20%, ${project.color}44 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(124,58,237,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />

        {/* Large emoji */}
        <motion.div
          style={{
            fontSize: 80,
            position: "relative",
            zIndex: 2,
            filter: "drop-shadow(0 12px 32px rgba(124,58,237,0.4))",
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {project.emoji}
        </motion.div>

        {/* Category badge */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 3,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: 100,
            padding: "5px 14px",
            fontSize: 11,
            fontWeight: 700,
            color: "#6d28d9",
            letterSpacing: "0.04em",
          }}
        >
          {project.category}
        </div>

        {/* Featured badge */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 3,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            borderRadius: 100,
            padding: "5px 14px",
            fontSize: 10,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.06em",
            boxShadow: "0 4px 16px rgba(124,58,237,0.5)",
          }}
        >
          ★ FEATURED
        </div>
        <div className="portfolio-card-overlay" style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, transparent 20%, rgba(17,8,40,0.82) 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 16,
          gap: 8,
          zIndex: 3,
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(project.servicesUsed || project.deliverables || []).slice(0, 3).map((item) => (
              <span key={item} style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.14)", borderRadius: 100, padding: "3px 8px" }}>{item}</span>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: 600 }}>
            {project.views.toLocaleString()} views · {project.likes} likes
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "26px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
        }}
      >
        {/* Title + Industry */}
        <div>
          <h3
            style={{
              fontFamily: "Outfit",
              fontSize: 20,
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {project.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: project.color,
                background: `${project.color}15`,
                border: `1px solid ${project.color}30`,
                borderRadius: 100,
                padding: "3px 12px",
              }}
            >
              {project.industry}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
              {project.clientName} · {project.year}
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
            lineHeight: 1.7,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.overview}
        </p>

        {/* Deliverables preview */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
          {(project.deliverables ?? []).slice(0, 3).map((d) => (
            <span
              key={d}
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "#6d28d9",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: 100,
                padding: "3px 10px",
              }}
            >
              {d}
            </span>
          ))}
        </div>

        {/* View Project Button */}
        <Link
          href={`/portfolio/${project.slug}`}
          style={{ textDecoration: "none", marginTop: 4 }}
        >
          <motion.div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              transition: "all 0.3s ease",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            View Project
            <span style={{ fontSize: 16 }}>→</span>
          </motion.div>
        </Link>
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${project.color}, #a855f7)`,
        }}
      />
    </motion.div>
  );
}