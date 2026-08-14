"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PortfolioProject } from "@/types/portfolio";

interface ProjectCardProps {
  project: PortfolioProject;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const serviceIcons = (project.servicesUsed?.length ? project.servicesUsed : project.deliverables).slice(0, 4);

  return (
    <Link href={`/portfolio/${project.slug}`} style={{ textDecoration: "none", height: "100%", display: "block" }}>
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
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
        }}
        whileHover={{ y: -8 }}
      >
        <div
          className="portfolio-card-cover"
          style={{
            position: "relative",
            height: 220,
            overflow: "hidden",
            background: `linear-gradient(135deg, ${project.color}33, rgba(124,58,237,0.12))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt={project.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          ) : (
            <div style={{ fontSize: 64, position: "relative", zIndex: 2, filter: "drop-shadow(0 8px 24px rgba(124,58,237,0.3))" }}>
              {project.emoji}
            </div>
          )}

          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 4,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: 100,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 700,
              color: "#6d28d9",
            }}
          >
            {project.category}
          </div>

          {project.featured && (
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 4,
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                borderRadius: 100,
                padding: "4px 12px",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.05em",
              }}
            >
              ★ FEATURED
            </div>
          )}

          <div className="portfolio-card-overlay" style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${project.color}22 0%, rgba(17,8,40,0.82) 100%)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 18,
            gap: 10,
            zIndex: 3,
          }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {serviceIcons.map((item) => (
                <span key={item} style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 100,
                  padding: "3px 8px",
                }}>
                  {item}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, color: "rgba(255,255,255,0.88)", fontSize: 11, fontWeight: 600 }}>
              <span>{project.views.toLocaleString()} views</span>
              <span>{project.likes} likes</span>
              <span>{project.enquiries} enquiries</span>
            </div>
            <div className="portfolio-card-btn" style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
              width: "fit-content",
            }}>
              View Case Study
              <span>→</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 20px 20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <div>
            <h3 style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
              {project.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: project.color,
                background: `${project.color}15`,
                border: `1px solid ${project.color}30`,
                borderRadius: 100,
                padding: "2px 10px",
              }}>
                {project.industry}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                {project.clientName} · {project.year}
              </span>
            </div>
          </div>
          <p style={{
            color: "var(--text-muted)",
            fontSize: 13.5,
            lineHeight: 1.7,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {project.overview}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
            {(project.tags ?? []).slice(0, 3).map((tag) => (
              <span key={tag} style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "#6d28d9",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: 100,
                padding: "3px 10px",
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="portfolio-card-accent" style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${project.color}, #a855f7)`,
          opacity: 0,
        }} />
      </motion.div>
    </Link>
  );
}
