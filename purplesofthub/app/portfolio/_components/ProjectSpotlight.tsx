"use client";

import Link from "next/link";
import type { PortfolioProject } from "@/types/portfolio";
import ProjectMedia from "./ProjectMedia";

interface ProjectSpotlightProps {
  project: PortfolioProject;
}

export default function ProjectSpotlight({ project }: ProjectSpotlightProps) {
  const summary =
    project.overview ||
    project.finalSolution ||
    project.challenge ||
    "A focused digital project built to improve brand presence and customer action.";

  const services = project.servicesUsed?.length ? project.servicesUsed : project.tags || [];
  const deliverableCount =
    project.deliverablesCount ?? (project.deliverables?.length ? project.deliverables.length : 0);

  const meta = [
    project.industry ? { label: "Industry", value: project.industry } : null,
    project.year ? { label: "Year", value: project.year } : null,
    project.service || project.category
      ? { label: "Service", value: project.service || project.category || "" }
      : null,
    deliverableCount ? { label: "Deliverables", value: `${deliverableCount}` } : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  return (
    <article className="pf-spotlight">
      <ProjectMedia
        project={project}
        className="pf-spot-media"
        showCategory={false}
        eager
      />

      <div className="pf-spot-body">
        <p className="pf-spot-label">
          <span className="pf-spot-dot" aria-hidden="true" />
          Featured case study
        </p>

        <h2 className="pf-spot-title">{project.title}</h2>
        <p className="pf-spot-copy">{summary}</p>

        {meta.length ? (
          <dl className="pf-spot-meta">
            {meta.map((item) => (
              <div key={item.label} className="pf-spot-meta-item">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {services.length ? (
          <div className="pf-spot-tags">
            {services.slice(0, 4).map((service) => (
              <span key={service} className="pf-tag">
                {service}
              </span>
            ))}
          </div>
        ) : null}

        <div className="pf-spot-actions">
          <Link href={`/portfolio/${project.slug}`} className="pf-btn pf-btn-primary">
            View case study
            <span className="pf-card-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <Link href="/contact" className="pf-btn pf-btn-ghost">
            Start a similar project
          </Link>
        </div>
      </div>
    </article>
  );
}