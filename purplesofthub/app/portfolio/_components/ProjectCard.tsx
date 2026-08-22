"use client";
import Link from "next/link";
import type { PortfolioProject } from "@/types/portfolio";

export default function ProjectCard({ project }: { project: PortfolioProject; index?: number }) {
  const image = project.coverImage || project.featuredThumbnail || project.heroBanner || project.gallery?.[0] || null;

  return (
    <Link href={`/portfolio/${project.slug}`} className="group block" style={{ textDecoration: "none" }}>
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          borderRadius: 20,
          background: "linear-gradient(135deg, #2a1058, #7c3aed)",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={project.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.6s ease",
            }}
            className="group-hover:scale-[1.04]"
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2a1058,#7c3aed)" }} />
        )}
      </div>
      <p
        style={{
          margin: "14px 0 0",
          fontFamily: "Outfit, sans-serif",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
        }}
      >
        {project.title}
      </p>
    </Link>
  );
}
