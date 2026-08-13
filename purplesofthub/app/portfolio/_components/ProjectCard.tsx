"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PortfolioProject } from "@/types/portfolio";

interface ProjectCardProps {
  project: PortfolioProject;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="portfolio-card"
      style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        background: "var(--bg-card)",
        border: "1px solid rgba(124,58,237,0.15)",
        boxShadow: "0 4px 24px rgba(124,58,237,0.06)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
      }}
      whileHover={{ y: -8 }}
      onHoverStart={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(124,58,237,0.4)";
        el.style.boxShadow = "0 20px 60px rgba(124,58,237,0.2), 0 0 40px rgba(124,58,237,0.1)";
      }}
      onHoverEnd={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(124,58,237,0.15)";
        el.style.boxShadow = "0 4px 24px rgba(124,58,237,0.06)";
      }}
    >
      {/* Cover Image Area */}
      <div
        style={{
          position: "relative",
          height: 200,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${project.color}22, rgba(124,58,237,0.08))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Decorative pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 30%, ${project.color}33 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(124,58,237,0.2) 0%, transparent 50%)`,
          }}
        />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />

        {/* Emoji / Icon */}
        <motion.div
          style={{
            fontSize: 64,
            position: "relative",
            zIndex: 2,
            filter: "drop-shadow(0 8px 24px rgba(124,58,237,0.3))",
          }}
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {project.emoji}
        </motion.div>

        {/* Category Badge */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 3,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: 100,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            color: "#6d28d9",
            letterSpacing: "0.03em",
          }}
        >
          {project.category}
        </div>

        {/* Featured Badge */}
        {project.featured && (
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 3,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              borderRadius: 100,
              padding: "4px 12px",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.05em",
              boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
            }}
          >
            ★ FEATURED
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 40%, rgba(124,58,237,0.15) 100%)",
            opacity: 0,
            transition: "opacity 0.3s",
            zIndex: 2,
          }}
          whileHover={{ opacity: 1 }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          padding: "24px 22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        {/* Title + Industry */}
        <div>
          <h3
            style={{
              fontFamily: "Outfit",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {project.title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: project.color,
                background: `${project.color}15`,
                border: `1px solid ${project.color}30`,
                borderRadius: 100,
                padding: "2px 10px",
              }}
            >
              {project.industry}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
              {project.year}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 13.5,
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

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
          {(project.tags ?? []).slice(0, 3).map((tag) => (
            <span
              key={tag}
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
              {tag}
            </span>
          ))}
        </div>

        {/* View Details Button */}
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
              padding: "11px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              opacity: 0,
              transform: "translateY(8px)",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
            }}
            whileHover={{ scale: 1.02 }}
            className="portfolio-card-btn"
          >
            View Details
            <span style={{ fontSize: 16 }}>→</span>
          </motion.div>
        </Link>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${project.color}, #a855f7)`,
          opacity: 0,
          transition: "opacity 0.3s",
        }}
        className="portfolio-card-accent"
      />
    </motion.div>
  );
}