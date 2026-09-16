"use client";

import Link from "next/link";
import type { PortfolioProject } from "@/types/portfolio";
import ProjectMedia from "./ProjectMedia";

interface ProjectCardProps {
  project: PortfolioProject;
  index?: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const summary =
    project.overview ||
    project.finalSolution ||
    project.challenge ||
    "A focused digital project built to improve brand presence and customer action.";

  const tags = (project.tags?.length ? project.tags : project.servicesUsed || []).slice(0, 2);
  const number = typeof index === "number" ? String(index + 1).padStart(2, "0") : null;

  return (
    <Link href={`/portfolio/${project.slug}`} className="pf-card">
      <ProjectMedia project={project} className="pf-card-media" />

      <div className="pf-card-body">
        <div className="pf-card-head">
          {number ? (
            <span className="pf-card-number" aria-hidden="true">
              {number}
            </span>
          ) : null}
          <p className="pf-card-client">
            {project.clientName || project.industry || "PurpleSoftHub client"}
          </p>
          {project.year ? <span className="pf-card-year">{project.year}</span> : null}
        </div>

        <h3 className="pf-card-title">{project.title}</h3>
        <p className="pf-card-summary">{summary}</p>

        <div className="pf-card-foot">
          <div className="pf-card-tags">
            {tags.map((tag) => (
              <span key={tag} className="pf-tag">
                {tag}
              </span>
            ))}
          </div>
          <span className="pf-card-cta" aria-hidden="true">
            View case study
            <span className="pf-card-arrow">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}