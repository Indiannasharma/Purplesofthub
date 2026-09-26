import { Inter, Space_Grotesk } from "next/font/google";

/**
 * Command Center typography — shared by the production Admin shell
 * (app/admin/layout.tsx) and the isolated design preview
 * (app/design/command-center/layout.tsx).
 *
 * The CSS variables are consumed by `--cc-font-body` / `--cc-font-display`
 * in app/styles/command-center.css.
 */
export const ccBodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-cc-body",
  display: "swap",
});

export const ccDisplayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-cc-display",
  display: "swap",
});

/** Ready-to-spread className carrying both font variables. */
export const ccFontVariables = `${ccBodyFont.variable} ${ccDisplayFont.variable}`;
