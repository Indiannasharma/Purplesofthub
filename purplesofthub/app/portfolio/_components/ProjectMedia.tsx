"use client";

import { useState } from "react";
import type { PortfolioProject } from "@/types/portfolio";

/** Picks the best available cover for a project, mirroring the order used elsewhere in the app. */
export function projectImage(project: PortfolioProject): string | null {
  return (
    project.coverImage ||
    project.featuredThumbnail ||
    project.heroBanner ||
    project.gallery?.[0] ||
    null
  );
}

/** Two-character monogram used by the fallback artwork. Prefers letter initials so
 *  digit-leading titles (e.g. "24HRS Content Hub") still read as a brand mark. */
export function monogram(title: string): string {
  const words = title
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const initials = words
    .filter((word) => /^[a-zA-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  if (initials) return initials.toUpperCase();

  const fallback = words[0]?.slice(0, 2) || title.slice(0, 2);
  return fallback.toUpperCase();
}

interface ProjectMediaProps {
  project: PortfolioProject;
  className?: string;
  showCategory?: boolean;
  eager?: boolean;
}

/**
 * Cover artwork for a project.
 *
 * The accent-tinted monogram panel is always rendered as the base layer, so a project
 * without a cover - or one whose file fails to load - still shows intentional artwork
 * instead of a broken image, and covers fade in over the placeholder once decoded.
 */
export default function ProjectMedia({
  project,
  className = "",
  showCategory = true,
  eager = false,
}: ProjectMediaProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = projectImage(project);
  const style = { "--pf-accent": project.color || "#a855f7" } as React.CSSProperties;
  const showImage = Boolean(src) && !failed;

  return (
    <div className={`pf-media ${className}`.trim()} style={style}>
      <div
        className="pf-media-fallback"
        role={showImage ? undefined : "img"}
        aria-label={showImage ? undefined : `${project.title} cover artwork`}
        aria-hidden={showImage ? true : undefined}
      >
        <span className="pf-media-mono" aria-hidden="true">
          {monogram(project.title)}
        </span>
        <span className="pf-media-emoji" aria-hidden="true">
          {project.emoji || "🎨"}
        </span>
      </div>

      {showImage ? (
        <img
          src={src as string}
          alt={project.title}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={loaded ? "pf-media-img is-loaded" : "pf-media-img"}
        />
      ) : null}

      <div className="pf-media-shade" aria-hidden="true" />

      {showCategory && project.category ? (
        <span className="pf-media-category">{project.category}</span>
      ) : null}
    </div>
  );
}
