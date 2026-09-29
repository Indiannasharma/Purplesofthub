"use client";

import Link from "next/link";
import type { PortfolioProject } from "@/types/portfolio";
import ProjectMedia from "./ProjectMedia";

interface ProjectCardProps {
  project: PortfolioProject;
  index?: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const summary = project.overview || project.finalSolution || project.challenge;

  return (
    <Link href={`/portfolio/${project.slug}`} className="pf-card">
      <ProjectMedia project={project} className="pf-card-media" />

      <div className="pf-card-body">
        <h3 className="pf-card-title">{project.title}</h3>
        <p className="pf-card-client">{project.category || project.service || project.clientName || "Selected work"}</p>
        {summary ? <p className="pf-card-summary">{summary}</p> : null}

        <div className="pf-card-foot">
          <span className="pf-card-cta" aria-hidden="true">
            View project
            <span className="pf-card-arrow">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
