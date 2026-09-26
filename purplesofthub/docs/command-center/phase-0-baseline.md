# Command Center — Phase 0 Baseline & Phase 1 Prototype Record

**Date:** 2026-09-26 · **Branch:** `feat/command-center-phase1`

## Baseline

| Item | Value |
|---|---|
| Repository root | `C:\Users\HP\Documents\Code\Softwork` (app root: `purplesofthub/`) |
| Baseline branch | `main` @ `da6648999c991b66746b7c6342c33360ac286de1` |
| Worktree at start | Clean except untracked `PURPLESOFTHUB_PLATFORM_AUDIT.md` (preserved, not committed) |
| Production SHA | **UNVERIFIED** — no Vercel console access from this session. `origin/main` HEAD is the presumed deployed commit. Confirm in Phase 7 against the Vercel deployment record. |
| Browser/test accounts | Not available in-session. Phase 1 uses an isolated, unauthenticated preview route, so captures are real but do not exercise auth flows. |

## Tooling decisions (Phase 0/1)

| Decision | Choice | Rationale |
|---|---|---|
| Screenshot capture | Playwright **CLI via `npx`** (no `package.json` change, browsers install to user cache) | Visual evidence required now; formal Playwright test dependency deferred until owner approves the dependency + test accounts |
| Preview charts | Original zero-dependency SVG | SSR-safe, deterministic, no new deps; **Recharts vs ApexCharts deferred to Phase 2** (ApexCharts already ships and is used by the current admin dashboard; Recharts offers a more React-native API — decide with real data volume in hand) |
| Data tables | Not needed for Overview; **TanStack Table evaluation deferred to Phase 5** (module tables) | Avoid installing before an approved phase needs it |
| TanStack Query | Already installed; not used by the static prototype | Will serve interactive server state in Phase 4+ |
| Fonts | `next/font/google` Space Grotesk + Inter, loaded **only** in the preview layout | Zero impact on marketing site typography |
| Tokens | Scoped `.cc-root` CSS custom properties in the preview route | `globals.css` consolidation stays in Phase 2 as planned |

## Prototype isolation guarantees

- Route: `/design/command-center` — not linked from any navigation.
- `robots: noindex, nofollow`.
- 404 in production builds unless `DESIGN_PREVIEW_ENABLED=true`.
- No imports from TailAdmin legacy components; no edits to existing admin/client code, auth, APIs, or `globals.css`.
- All data is illustrative (`lib/command-center/mock-data.ts`), labeled in the UI banner and section subtitles.

## Regression checklist (to execute every phase)

**Admin:** `/admin` · clients list+detail · leads · projects list+new+detail · services list+new · invoices list+new · payments · portfolio list+new+detail · blog list+create+edit · comments · resources · ads + ads/[clientId] · subscribers · music · recovery · settings — each checked for: auth redirect (signed-out → `/sign-in`; non-admin → `/dashboard`), data render, empty state, 1440×900 / 768×1024 / 390×844, light + dark, keyboard tab order, visible focus.

**Client:** `/dashboard` · projects · invoices · services · files · ads · music · recovery · settings — signed-out redirect to `/sign-in`, client data isolation, same viewport/theme/keyboard matrix.

**Cross-cutting:** sign-in/sign-up/recovery flows unchanged; checkout verification unchanged; Nova widget behavior unchanged; marketing site unchanged; `node --test tests/**/*.test.mjs` green; `tsc --noEmit` clean; `next build` green.
