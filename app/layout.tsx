import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Providers } from "@/app/Providers";
import ChatBot from "@/components/ChatBot";
import WhatsAppButton from "@/components/WhatsAppButton";
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark:bg-gray-900">
        <Providers>
          {children}
          <ChatBot />
          <WhatsAppButton />
        </Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
