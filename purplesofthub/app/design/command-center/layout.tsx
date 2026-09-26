import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Space_Grotesk } from "next/font/google";
import "./command-center.css";

/**
 * Phase 1 — isolated Command Center design preview.
 *
 * Guardrails:
 *  - Never linked from product navigation.
 *  - noindex/nofollow.
 *  - Returns 404 in production unless DESIGN_PREVIEW_ENABLED=true is set.
 *  - Zero edits to globals.css: all tokens are scoped under `.cc-root`.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-cc-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-cc-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Command Center — Design Preview",
  robots: { index: false, follow: false },
};

export default function CommandCenterPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.DESIGN_PREVIEW_ENABLED !== "true"
  ) {
    notFound();
  }

  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable}`}>
      {children}
    </div>
  );
}
