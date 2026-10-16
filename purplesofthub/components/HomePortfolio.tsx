"use client";

import Link from "next/link";
import Image from 'next/image';
import CardVideoPreview from '@/components/media/CardVideoPreview';
import { portfolioPreview } from '@/lib/media-preview';
import type { PortfolioProject } from "@/types/portfolio";

export default function HomePortfolio({ projects }: { projects: PortfolioProject[] }) {
  const published = projects.filter((p) => p.status === "published");
  const withoutNova = published.filter((p) => !/nova ai brand launch/i.test(p.title));
  const featured = withoutNova.filter((p) => p.featured);
  const legjit = withoutNova.find((p) => p.slug === "legjit-baby-food");
  const selected = featured.length ? featured : withoutNova;
  const visible = [legjit, ...selected.filter((p) => p.slug !== "legjit-baby-food")]
    .filter((p): p is PortfolioProject => Boolean(p))
    .slice(0, 6);

  if (!visible.length) return null;

  return (
    <section className="home-work-section">
      <div className="home-work-shell">
        <div className="home-work-header">
          <div>
            <p className="home-work-eyebrow">Selected work</p>
            <h2 className="home-work-title">
              Real projects, shaped into <span>premium digital proof.</span>
            </h2>
          </div>
          <p className="home-work-copy">
            A tighter look at the brands, platforms, and campaigns PurpleSoftHub has already helped shape.
          </p>
        </div>

        <div className="home-work-grid">
          {visible.map((project) => {
            const image = project.coverImage || project.featuredThumbnail || project.heroBanner || project.gallery?.[0];
            const optimize = !image || image.startsWith('/') || /^https:\/\/res\.cloudinary\.com\//.test(image);
            return <article key={project.slug} className="home-work-card" data-preview-card>
              <div className="home-work-media">
                <Link href={`/portfolio/${project.slug}`} className="home-work-poster" aria-label={'View case study: '+project.title}>
                {image ? (
                  <Image src={image} alt={project.title} fill sizes="(max-width: 767px) 90vw, (max-width: 1100px) 45vw, 33vw" loading="lazy" unoptimized={!optimize}/>
                ) : (
                  <div className="home-work-fallback" aria-hidden="true">
                    <span>{project.emoji || "PSH"}</span>
                  </div>
                )}
                </Link>
                <CardVideoPreview src={portfolioPreview(project.videos)} title={project.title}/>
                <div className="home-work-shade" />
                <span className="home-work-category">{project.category || "Case study"}</span>
              </div>

              <Link href={`/portfolio/${project.slug}`} className="home-work-body">
                <div>
                  <p className="home-work-client">{project.clientName || project.industry || "PurpleSoftHub client"}</p>
                  <h3>{project.title}</h3>
                  <p className="home-work-summary">
                    {project.overview || project.finalSolution || project.challenge || "A focused digital project built to improve brand presence and customer action."}
                  </p>
                </div>

                <div className="home-work-meta">
                  {(project.tags?.length ? project.tags : project.servicesUsed || []).slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="home-work-link">
                  View case study
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            </article>
          })}
        </div>

        <div className="home-work-action">
          <Link href="/portfolio" className="cyber-btn-outline" style={{ padding: "13px 32px", fontSize: 15, display: "inline-block", textDecoration: "none" }}>
            View all work
          </Link>
        </div>
      </div>
    </section>
  );
}
