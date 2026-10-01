import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PurpleSoftHub Academy — Practical Digital Skills",
  description:
    "Learn web development, digital marketing, UI/UX design, music business and AI skills. Build practical skills through real projects for modern careers and creative businesses.",
  keywords: [
    "practical digital skills",
    "web development courses",
    "AI skills training",
    "music business courses",
    "tech academy Africa",
    "learn web development Africa",
    "digital skills training Nigeria",
    "UI UX design course Africa",
    "digital marketing course Nigeria",
    "music business Africa",
    "AI skills Africa",
    "PurpleSoftHub Academy",
  ],
  alternates: {
    canonical: "https://www.purplesofthub.com/academy",
  },
  openGraph: {
    title: "PurpleSoftHub Academy — Practical Digital Skills",
    description:
      "Learn web development, digital marketing, UI/UX design, music business and AI skills. Build practical skills through real projects for modern careers and creative businesses.",
    url: "https://www.purplesofthub.com/academy",
    siteName: "PurpleSoftHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PurpleSoftHub Academy — Practical Digital Skills",
    description:
      "Learn web development, digital marketing, UI/UX design, music business and AI skills. Build practical skills through real projects for modern careers and creative businesses.",
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
