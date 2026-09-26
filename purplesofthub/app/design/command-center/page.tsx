import { CommandCenterPreview } from "@/components/command-center/preview";

/**
 * Phase 1 — isolated Admin Overview design prototype.
 * Renders with illustrative sample data only (see lib/command-center/mock-data.ts).
 * Use ?theme=dark or ?theme=light to force a theme for review/capture.
 */
export default async function CommandCenterPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme } = await searchParams;
  const initialTheme = theme === "dark" ? "dark" : "light";

  return <CommandCenterPreview initialTheme={initialTheme} />;
}
