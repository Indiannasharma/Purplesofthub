import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Providers } from "@/app/Providers";
import { ThemeProvider } from "@/context/ThemeContext";
import ChatBot from "@/components/ChatBot";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.purplesofthub.com'),
  title: {
    default: "PurpleSoftHub — Africa's Digital Innovation Studio",
    template: '%s | PurpleSoftHub',
  },
  description: "PurpleSoftHub is Africa's leading digital innovation studio. We build world-class websites, mobile apps, SaaS platforms, run digital marketing campaigns, promote music globally and train the next generation of African tech talent. Serving clients across Africa, UK, USA, Canada and beyond.",
  keywords: [
    // Brand
    "PurpleSoftHub",
    "Purplesoft Nigeria",
    "Africa digital innovation studio",
    // Core services
    "web development Africa",
    "mobile app development Africa",
    "digital marketing Africa",
    "UI UX design Africa",
    "SaaS development Africa",
    "music promotion Africa",
    // Global reach
    "African digital agency",
    "digital agency Nigeria",
    "African tech studio",
    "web development Nigeria",
    "digital innovation Africa",
    // Academy
    "tech academy Africa",
    "learn web development Africa",
    "digital skills training Nigeria",
    // Niche services
    "music distribution Africa",
    "social media account recovery",
    "account recovery Nigeria",
    "social media management Africa",
    // Global
    "African startup studio",
    "digital agency for global brands",
  ],
  authors: [{ name: 'PurpleSoftHub', url: 'https://www.purplesofthub.com' }],
  creator: 'PurpleSoftHub',
  publisher: 'PurpleSoftHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.purplesofthub.com',
    siteName: 'PurpleSoftHub',
    title: "PurpleSoftHub — Africa's Digital Innovation Studio",
    description: "Building world-class digital products for businesses, startups and creators across Africa and beyond. Web · Mobile · Marketing · Music · Academy.",
    images: [
      {
        url: 'https://www.purplesofthub.com/og-image.png',
        width: 1200,
        height: 630,
        alt: "PurpleSoftHub — Africa's Digital Innovation Studio",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@purplesofthub',
    creator: '@purplesofthub',
    title: "PurpleSoftHub — Africa's Digital Innovation Studio",
    description: "Building world-class digital products across Africa and beyond. Web · Mobile · Marketing · Music · Academy.",
    images: ['https://www.purplesofthub.com/og-image.png'],
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
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.purplesofthub.com',
  },
  other: {
    'twitter:card': 'summary_large_image',
    'twitter:image': 'https://www.purplesofthub.com/og-image.png',
    'twitter:image:alt': "PurpleSoftHub — Africa's Digital Innovation Studio",
    'og:image': 'https://www.purplesofthub.com/og-image.png',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body suppressHydrationWarning className="dark:bg-boxdark-2 dark:text-bodydark">
        <ThemeProvider>
          <Providers>
            {children}
            <ChatBot />
            <WhatsAppButton />
          </Providers>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
