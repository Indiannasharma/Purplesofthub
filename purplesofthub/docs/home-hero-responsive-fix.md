# Homepage hero responsiveness fix

Starting branch: main. Starting HEAD and remote main: c36306bd09c8a47620b0772ee808758fa15e57c9. Remote verified without pulling; no subsequent source changes were present. The three existing untracked audits are preserved.

## Root cause from the completed read-only audit

The CSS globe and SVG rings used independent viewport widths, caps and anchors. Rings increased from 700 px at 1440 px to 760 px below that breakpoint. At 900/768 px the globe's floating animation overwrote the horizontal translate needed for centering, leaving its center 160 px left of the rings; the clipped stage cut the globe's left edge. Full-width wrappers also left the smaller scene aligned to the left. Paired max-width:1023px/min-width:1024px rules could both fail at fractional CSS widths. Text remained visible; this was a layout/animation defect, not a proven WebGL or compositor failure.

## Implementation

- HomeHero.tsx: marks the entire decorative visual aria-hidden. Original headline, description and both /contact links remain unchanged.
- HeroCosmosScene.tsx: retains the original CSS globe, colors, lighting gradients, two SVG layers, all twelve ellipses, SVG viewBox, clip paths, fill behavior and dash animation. Globe, rings and aura use a common 50%/50% center in one percentage-based scene. A common parent owns floating motion; child centering is static. Aura pulsing retains both centering translations. Independent tablet/1440 sizing rules and scene perspective/translateZ promotion are removed.
- globals.css: mobile-first one-column hero and hidden decorative visual, displayed only at min-width:1024px. Desktop visual width is its grid track rather than 58vw, with no independent placement transform. Hero-scoped padding prevents global section breakpoints from creating partial layouts. Original desktop and phone type/CTA sizes are retained.
- tests/ui/public-rendering.test.mjs: three focused regressions verify actual SVG server output, artwork preservation, shared-center/static-transform separation and the desktop visibility threshold. Existing snapshots are not updated.

The visual frame is square. Scene width is 87.4% of the frame, capped at 700 px; its aspect ratio matches 920/660. The rotated SVG viewport needs approximately 1.144 times its unrotated width: 87.4% therefore fits the complete rotated box inside the allocated column. Globe diameter is 51.428571% of scene width, preserving the original 360:700 globe/ring proportion. There is no sizing change at 1440 px.

Lighting, blur, particle size and planet motion lengths use scene-relative em units. Supported container units derive the unit from actual scene width (700 px reference). Older browsers retain percentage layout with a bounded viewport-based lighting fallback; essential text and geometric alignment do not depend on container queries or JavaScript observers. SVG non-scaling stroke behavior is intentionally preserved.

Reduced motion disables the common float, aura pulse, surface and particles, and explicitly includes dashed ring strokes. Permanent entrance will-change is removed. The existing visible-by-default document/template and text entrance behavior remain untouched.

## Before/after geometry

Before: at 900/768 px, globe-ring center error -160 px; rings 700 px at 1440 but 760 px at 1280; scene still visible on tablets. After target: coincident centers, constant proportions, continuous desktop sizing and no decorative layout/paint below 1024 px. The built site now measures center differences within 0.01 px in both axes across the requested desktop widths, including while the shared float is active. Both rotated ring boxes and the globe stay within the square visual frame. Below 1024 px all scene rectangles are zero.

| Width | Frame width | Globe diameter | SVG ring viewport width |
| --- | --- | --- | --- |
| 1024 | 407.8 | 183.3 | 356.4 |
| 1100 | 438.3 | 197.0 | 383.0 |
| 1200 | 478.3 | 215.0 | 418.0 |
| 1280 | 510.3 | 229.4 | 446.0 |
| 1439 | 574.1 | 258.1 | 501.8 |
| 1440 | 574.4 | 258.2 | 502.0 |
| 1600 | 642.6 | 288.8 | 561.6 |
| 1920 | 640.6 | 287.9 | 559.9 |

Values are CSS dimensions before the temporary entrance transform. The light/dark visual matrices also capture bounding boxes during that decorative entrance. The small size reduction between 1600 and 1920 follows the existing capped grid/container gap, without a breakpoint jump or globe/ring ratio change.

## Validation so far

Independent TypeScript: passed. Changed-file ESLint: passed, zero diagnostics. Focused rendering regressions: 18/18 passed. Full suite: 215 tests, 210 passed, five inherited Blog contract failures (two compatibility-retirement cases and three admin-sprint request contracts). All affected Blog sources and fixtures are byte-identical to the starting baseline. No snapshot, lint configuration or business source was changed to force a pass.

Production build: passed with exit code 0, including TypeScript, all 133 entries and standalone packaging. The slow local dev compilation was stopped so the production build can run without concurrent compiler pressure. Old generated standalone artifacts were preserved in .next/standalone-hero-backup to avoid previously observed Windows copy locks; source/configuration is unchanged by that move.

## Preservation and remaining limitations

All 732 tracked paths were hashed before editing. Only the three authorized hero sources and the focused regression file differ; the requested document is new. app/page.tsx, template/Reveal hardening, navigation, Nova, auth, Workspace/Admin, payments, APIs, schemas, pricing, package/lock files and existing audit documents remain unchanged.

Ellipse fill remains the original default black fill. Changing it to fill:none is a separate optional visual refinement and is deliberately excluded. Physical Samsung/Android and other engine parity are not claimed. Deployment and production verification are pending the validated release.

## Completed local visual QA

Actual compiled production build served at port 3110. Codex in-app Chromium checked 375, 390, 430, 768, 900, 1023, 1024, 1100, 1200, 1280, 1439, 1440, 1600 and 1920 in both light and dark themes. Every sample retained heading/CTA opacity 1 and the original /contact links, had no document horizontal overflow, and passed globe/ring frame containment and alignment. Complete visual hidden at every tested width below 1024, including the previously broken 900/768 and exact 1023 boundary.

Two down/up resize cycles added 22 samples: no failed containment, alignment, overflow or content-visibility checks. The common float remains active while globe/ring centering transforms are static. Re-showing the decorative scene can restart its existing entrance; its center stays aligned during the entrance. Screenshots reviewed at 1440 in both themes, 1024 and 390 dark; these show the premium CSS globe/SVG rings intact and all mobile copy/CTAs visible.

Explicit fractional widths (1023.5, 1023.9, 1024.1, 1024.5) were rejected by the tool's integer-only viewport API and are not reported as tested. The mobile-first base covers widths where the min-width:1024px query does not match; there is no paired max-width gate for scene visibility. Live reduced-motion preference emulation is not exposed by the available browser capabilities; stylesheet regressions verify the explicit ring/scene suppression. No real Android, Samsung, Safari or Firefox device test is claimed.

Evidence files in C:/Users/HP/.codex/visualizations/2026/10/01/01a0f513-b343-7442-8b69-c1a5f3e089cf: hero-fix-qa.json, hero-fix-sizing.json, hero-fix-1440-light.jpg, hero-fix-1440-dark.jpg, hero-fix-1024-dark.jpg and hero-fix-mobile-dark.jpg.

The React best-practices review found no new hooks, subscriptions, event listeners, client data flows or business-controller changes. The decorative group is aria-hidden, has no interactive children, and cannot intercept pointers. Core server-rendered content does not depend on the particle timer, motion initialization, container units or IntersectionObserver.

