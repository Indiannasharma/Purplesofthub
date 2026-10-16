import { MetadataRoute } from "next";
import { PORTFOLIO_PROJECTS } from "@/app/portfolio/_data/portfolio";
import { publishedArticles, publicBlogCategories } from '@/lib/blog/public-feed';
import { PUBLICATION_ORIGIN, articlePath, categoryPath } from '@/lib/blog/urls';
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

const PORTFOLIO_SLUGS = PORTFOLIO_PROJECTS.map((project) => project.slug);

const SERVICE_SLUGS = [
  "web-development",
  "mobile-app-development",
  "digital-marketing",
  "ui-ux-design",
  "saas-development",
  "music-distribution",
  "branding-design",
  "social-media-management",
  "seo",
  "ecommerce-development",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${SITE_URL}/services`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/portfolio`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${PUBLICATION_ORIGIN}/insights`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const servicePages = SERVICE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const portfolioPages = PORTFOLIO_SLUGS.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const [first,categories] = await Promise.all([publishedArticles({limit:12}),publicBlogCategories()]);
  const posts = [...first.posts];
  for(let page=2;first.ok&&page<=Math.min(4000,Math.ceil(first.total/12));page++) {
    const result=await publishedArticles({limit:12,page});
    if(!result.ok)break;
    posts.push(...result.posts);
  }
  const blogPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: PUBLICATION_ORIGIN + articlePath(post.slug),
    ...(post.published_at ? {lastModified:post.published_at} : {}),
    changeFrequency:'weekly',priority:0.6,
  }));
  blogPages.push(...categories.map(category=>({url:PUBLICATION_ORIGIN+categoryPath(category.slug),changeFrequency:'weekly' as const,priority:0.5})));

  return [...staticPages, ...servicePages, ...portfolioPages, ...blogPages];
}
