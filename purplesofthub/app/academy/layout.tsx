import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PurpleSoftHub Academy — Tech Education Across Africa",
  description:
    "Learn web development, digital marketing, UI/UX design, music business and AI skills. PurpleSoftHub Academy is training the next generation of African tech talent.",
  keywords: [
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
    title: "PurpleSoftHub Academy — Tech Education Across Africa",
    description:
      "Learn web development, digital marketing, UI/UX design, music business and AI skills. PurpleSoftHub Academy is training the next generation of African tech talent.",
    url: "https://www.purplesofthub.com/academy",
    siteName: "PurpleSoftHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PurpleSoftHub Academy — Tech Education Across Africa",
    description:
      "Learn web development, digital marketing, UI/UX design, music business and AI skills. PurpleSoftHub Academy is training the next generation of African tech talent.",
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
