"use client";

import { useState } from "react";
import { monogram } from "./ProjectMedia";
import type { PortfolioProject } from "@/types/portfolio";

export interface CaseStudyMedia {
  src: string;
  label: string;
  caption?: string;
}

interface CaseStudyGalleryProps {
  items: CaseStudyMedia[];
  project: PortfolioProject;
  variant?: "grid" | "panels";
}

interface PlateProps {
  item: CaseStudyMedia;
  project: PortfolioProject;
  index: number;
  variant: "grid" | "panels";
}

/**
 * One media plate.
 *
 * Designed artwork is always painted underneath, so a project whose asset is missing - or a
 * remote asset that fails to load - still shows intentional work instead of a broken image,
 * and real assets fade in over it once decoded.
 */
function Plate({ item, project, index, variant }: PlateProps) {
  const [status, setStatus] = useState<"idle" | "ready" | "failed">("idle");
  const accent = project.color || "#a855f7";
  const showImage = status !== "failed";
  const isReady = status === "ready";

  return (
    <figure
      className={`pf-cs-plate${variant === "panels" ? " is-panel" : ""}`}
      style={{ "--pf-accent": accent } as React.CSSProperties}
    >
      <div className="pf-cs-plate-media">
        <div
          className="pf-cs-plate-art"
          role={isReady ? undefined : "img"}
          aria-label={isReady ? undefined : `${project.title} — ${item.label} artwork`}
          aria-hidden={isReady ? true : undefined}
        >
          <span className="pf-cs-plate-num" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="pf-cs-plate-mono" aria-hidden="true">
            {monogram(project.title)}
          </span>
          <span className="pf-cs-plate-emoji" aria-hidden="true">
            {project.emoji || "🎨"}
          </span>
        </div>

        {showImage ? (
          <img
            src={item.src}
            alt={item.caption ? `${project.title} — ${item.caption}` : `${project.title} — ${item.label}`}
            className={isReady ? "pf-cs-plate-img is-loaded" : "pf-cs-plate-img"}
            loading="lazy"
            decoding="async"
            onLoad={() => setStatus("ready")}
            onError={() => setStatus("failed")}
          />
        ) : null}
      </div>

      <figcaption className="pf-cs-plate-caption">
        <span className="pf-cs-plate-tag">{item.label}</span>
        {item.caption ? <span className="pf-cs-plate-note">{item.caption}</span> : null}
      </figcaption>
    </figure>
  );
}

export default function CaseStudyGallery({ items, project, variant = "grid" }: CaseStudyGalleryProps) {
  if (!items.length) return null;

  return (
    <div className={variant === "panels" ? "pf-cs-plates is-panels" : "pf-cs-plates"}>
      {items.map((item, index) => (
        <Plate
          key={`${item.label}-${index}`}
          item={item}
          project={project}
          index={index}
          variant={variant}
        />
      ))}
    </div>
  );
}