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
    template: "%s | PurpleSoftHub",
  },
  description: "PurpleSoftHub is a digital innovation studio in Lagos, Nigeria offering web development, mobile apps, digital marketing, UI/UX design, SaaS development and music promotion.",
  keywords: [
    "web development Nigeria",
    "digital marketing Lagos",
    "mobile app development Nigeria",
    "music promotion Africa",
    "UI UX design Lagos",
    "SaaS development Nigeria",
    "PurpleSoftHub",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "PurpleSoftHub",
    title: "PurpleSoftHub — Digital Innovation Studio",
    description: "Professional web development, mobile apps, digital marketing and music promotion from Lagos, Nigeria. 💜",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PurpleSoftHub — Digital Innovation Studio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@purplesofthub",
    creator: "@purplesofthub",
    title: "PurpleSoftHub — Digital Innovation Studio",
    description: "Professional web development, mobile apps, digital marketing and music promotion from Lagos, Nigeria.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-192x192.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/android-chrome-192x192.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    shortcut: '/android-chrome-192x192.png',
  },
  robots: {
    index: true,
    follow: true,
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
