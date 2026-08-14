import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PORTFOLIO_PROJECTS } from "../_data/portfolio";
import { getProjectBySlug } from "@/lib/portfolio.server";
import { normalizeProject } from "@/lib/portfolio-normalize";
import CaseStudyExperience from "../_components/CaseStudyExperience";

export async function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.seoTitle || `${project.title} — Case Study | PurpleSoftHub`,
    description: project.seoDescription || project.overview || undefined,
    keywords: project.seoKeywords,
    alternates: project.canonicalUrl ? { canonical: project.canonicalUrl } : undefined,
    openGraph: {
      title: project.seoTitle || `${project.title} — PurpleSoftHub`,
      description: project.seoDescription || project.overview || undefined,
      type: "website",
      images: project.ogImage ? [{ url: project.ogImage }] : [],
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staticProject = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
  const remote = await getProjectBySlug(slug).catch(() => null);
  if (!staticProject && !remote) notFound();

  const project = normalizeProject({ ...(staticProject || {}), ...(remote || {}) });
  const relatedSlugs = project.relatedProjects || [];
  const related = (
    relatedSlugs.length
      ? PORTFOLIO_PROJECTS.filter((p) => relatedSlugs.includes(p.slug))
      : PORTFOLIO_PROJECTS.filter((p) => p.slug !== project.slug && (p.category === project.category || p.industry === project.industry))
  ).slice(0, 3);

  return <CaseStudyExperience project={project} related={related} />;
}
