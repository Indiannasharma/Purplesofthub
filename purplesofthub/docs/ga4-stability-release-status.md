# GA4 and stability implementation backup

Status as of 2026-10-14: implementation completed locally; production release remains blocked. Earlier release documents and browser evidence describe their respective validation stages, not the final state of every fix.

## Final hydration correction

The readable development reproduction identified a shared theme-context mismatch: the server used the light fallback while saved dark mode was used by the initial client render. HeroCosmosScene consequently rendered 42 versus 68 stars, and Nova's theme attribute also differed.

ThemeContext now supplies the same light/system snapshot during server rendering and initial hydration, then resolves the saved/system preference after hydration. Native next-themes initialization remains unchanged. No hydration suppression was added and Nova logic was not edited. The temporary scene-specific experiment was removed; HeroCosmosScene has no final change.

Four new hydration tests and three existing hero regressions passed. TypeScript, changed-file ESLint and diff checks passed. Development-browser light/dark reloads on desktop and mobile produced no new hydration errors; theme persistence and navigation passed. No production build was run after this final context change.

## Preserved implementation and limits

The backup includes consent-aware GA4, public-route restrictions, sanitized manual page views, privacy disclosures, navbar hydration stabilization and scoped Paystack loading. Existing automated Release A/C validation remains recorded in the corresponding documents. Payment configuration and database schemas are unchanged.

Actual GA4 outgoing requests, payload sanitization and network-level deduplication remain unverified. GA4 Realtime and the production measurement-ID value remain unverified. Real Paystack SDK readiness/checkout compatibility remains unverified. The Portfolio API relation issue remains unresolved; fallback content is preserved.

No merge, production deployment or Vercel setting change is authorized by this backup task. Branch-push deployment behavior could not be confirmed through the available Vercel access, so a push must not proceed until it is confirmed to cause no unwanted deployment. Unrelated audits, environment files, screenshots, console captures and generated build artifacts are excluded from the backup commit and preserved locally.
