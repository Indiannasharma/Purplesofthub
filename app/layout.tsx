import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ChatBot from "@/components/ChatBot";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PurpleSoftHub — Digital Innovation Studio",
    template: "%s — PurpleSoftHub",
  },
  description:
    "We build websites, apps, SaaS platforms, AI tools and run digital marketing and music distribution for businesses worldwide.",
  keywords: [
    "web development", "mobile app development", "digital marketing",
    "SaaS development", "UI/UX design", "music distribution",
    "AI tools", "tech startup", "PurpleSoftHub", "Next.js agency",
  ],
  authors: [{ name: "PurpleSoftHub", url: SITE_URL }],
  creator: "PurpleSoftHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "PurpleSoftHub",
    title: "PurpleSoftHub — Digital Innovation Studio",
    description:
      "We build websites, apps, SaaS platforms, AI tools and run digital marketing and music distribution for businesses worldwide.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PurpleSoftHub — Digital Innovation Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PurpleSoftHub — Digital Innovation Studio",
    description: "Build your digital future with PurpleSoftHub.",
    images: ["/og-image.png"],
    creator: "@purplesofthub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark:bg-gray-900">
        <ThemeProvider>
          <SidebarProvider>
            {children}
            <ChatBot />
          </SidebarProvider>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
