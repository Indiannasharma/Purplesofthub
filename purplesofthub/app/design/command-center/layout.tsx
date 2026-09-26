import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ccFontVariables } from "@/components/command-center/fonts";
import "@/app/styles/command-center.css";
import "./preview.css";

/**
 * Phase 1 — isolated Command Center design preview.
 *
 * Guardrails:
 *  - Never linked from product navigation.
 *  - noindex/nofollow.
 *  - Returns 404 in production unless DESIGN_PREVIEW_ENABLED=true is set.
 *  - Zero edits to globals.css: all tokens are scoped under `.cc-root`
 *    (shared with the production Admin shell in app/styles/command-center.css).
 *  - Only this layout loads ./preview.css, which hides global product chrome.
 */

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

  return <div className={ccFontVariables}>{children}</div>;
}
