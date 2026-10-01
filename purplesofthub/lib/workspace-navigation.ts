/** Presentation-only path matching. External destinations cannot be active workspace pages. */
export function isWorkspaceDestinationActive(pathname: string | null | undefined, href: string, rootHref: string): boolean {
  if (!href.startsWith("/")) return false;
  const clean = (pathname ?? "").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return clean === href || (href !== rootHref && clean.startsWith(href + "/"));
}
