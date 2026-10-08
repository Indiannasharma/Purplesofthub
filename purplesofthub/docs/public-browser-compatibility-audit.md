# Public browser compatibility audit

Audit date: October 8, 2026. Starting branch: main. Actual HEAD and origin/main after fetch: 8ab25fea3fb37ec62a057989c061a7713eaa5643. The requested historical baseline was 1d8fd58ca2c6ed6dc57636f68712bf1574f42fd9; intervening CMS/public Blog work is retained. Tracked tree was initially clean; all 729 tracked files and three untracked audit documents were hashed before editing.

## Reported symptom and reproduction boundary

A Samsung Internet user reports a page that initially loads, then loses ordinary content while scrolling, leaving a dark background, Nova and back-to-top visible. No device model, browser version, page URL or actual screenshot was supplied in this request. Those details were requested. No connected Samsung/Android browser is available through the current tools.

The exact physical Samsung scrolling defect is **not reproduced**. Its compositor-specific trigger is **not proven**. This report does not substitute a resized desktop browser or user-agent string for a real Samsung test.

A separate, definite visibility failure was reproduced using the actual components and installed React/Motion server renderer. No client effects, observer or animation executes during this test:

| Component | Original rendered root style | Consequence |
| --- | --- | --- |
| app/template.tsx | will-change:opacity; opacity:0 | The entire ordinary document is invisible until Motion succeeds |
| components/Reveal.tsx | opacity:0; transform:translateY(24px) | Sections remain hidden without a successful observer callback |
| shared FadeInUp | opacity:0; transform:translateY(24px) | Content starts invisible and depends on Motion/useInView |
| shared FadeIn | opacity:0 | Content depends on client visibility initialization |

The root layout places children inside the template but mounts ChatBot and ScrollToTop as siblings afterward. That separation explains why a failed document animation/paint layer can leave those floating controls visible. This matches the report structurally; it is not proof that Samsung actually changed opacity to zero while scrolling.

Before-state rendering evidence is saved as purplesofthub-mobile-baseline-ssr.json in the local task temporary directory. The original components are also captured in purplesofthub-mobile-original-sources.json. A read-only request to the actual production homepage returned HTTP 200 and confirmed the same root tag: <div style="will-change:opacity;opacity:0">. The hero and Nova markup are present in that response. This independently confirms the unsafe server-visibility contract in production; it does not reproduce Samsung's post-load scroll trigger. The response evidence is saved as purplesofthub-mobile-production-before.json. Source-level inline style evidence is exact. Live computed-style and scroll evidence is recorded below; Samsung layer-tree and CSS-disable diagnostics remain unavailable.

## Confirmed causes versus hypotheses

**Confirmed cause of the reproduced no-JavaScript/failed-observer blanking:** default-hidden essential content. There is no independent visibility fallback. The route template also permanently requests opacity compositing for the complete page.

**Samsung hypothesis requiring device evidence:** a large promoted document layer, possibly compounded by filtered descendants, can lose painting while sibling fixed controls continue painting. The source exposes that risk, but a Samsung layer-tree capture or CSS-disable experiment is needed to establish the actual trigger. A covering overlay or runtime exception also remains possible until live diagnostics are available. No browser sniffing, blanket translateZ fix or arbitrary z-index increase is used.

The scroll listeners inspected in Navbar and ScrollToTop update only header presentation and the back-to-top threshold; neither sets document opacity. Reveal only becomes visible once and does not intentionally hide sections again on reverse scrolling. Root template remounting follows Next's documented segment/navigation behavior; search parameters alone do not remount it. A normal scroll is therefore not proven to reset its animation state.

## Public source audit

| Surface | Findings / scope |
| --- | --- |
| Homepage | Root hidden template, Reveal/shared motion wrappers, observer-dependent progress bars, initially empty typewriter; hero copy's CSS entrance already uses opacity 1 |
| Services | Same template/Reveal; count helper initially shows zero and constructs an unguarded observer |
| Portfolio and case studies | Current page/slug bodies use Reveal; work cards have a forced identity translateZ layer. Older portfolio Motion examples retain hidden variants but are not imported by the current page/slug source search and are not deleted |
| Academy | Shared entrance wrappers and observer-dependent CountUp; existing scoped reduced-motion CSS retained |
| Music | Two actual public hero surfaces begin at opacity zero; existing page-specific reduced-motion CSS retained |
| Blog | Current editorial redesign retained byte-for-byte; shared template affects it. Existing stale Blog controller-contract tests are documented separately |
| About / Contact | Reveal gates essential headings/body. Contact controller and API are retained; no-script users receive the existing email/support alternative |
| Header / Footer | Fixed header has an alpha background even without blur; menu is conditionally mounted. Footer/core navigation links are server HTML. No full-document covering footer layer was found in source |
| Nova / back-to-top | Root siblings, intentional high z-index, no viewport-sized closed Nova panel. Nova backend, state, persistence and controller remain unchanged |

Source searches cover initial/animate/whileInView, observers, opacity/visibility, transforms/promotion, clipping/containment, fixed/sticky layers, viewport units, pseudo-elements, masks and blending. Decorative alpha/particle animations are separated from essential-content hiding; unrelated style cleanup is excluded.

## Implemented correction

- app/template.tsx becomes the normal server-rendered div convention documented by installed Next 16.1.6. Its wrapper and framework remount contract remain; the global opacity animation and permanent will-change layer are removed. This is the proven shared presentation defect; no authenticated controller/layout logic is altered.
- Reveal always renders ordinary visible content. A guarded observer can add only a small CSS translate animation after intersection. Missing, throwing or silent observers leave content visible. A missing/throwing media capability also leaves it static. Cleanup disconnects the observer.
- Shared FadeIn/FadeInUp/StaggerItem reuse that safe enhancement; StaggerContainer retains layout without a shared animated layer. Hover cards remain, with reduced-motion transform suppression. Gradient shimmer becomes a CSS-only optional animation rather than a perpetual client loop.
- Public Music and opened mobile navigation use initial=false with already-visible targets. No catalog, plan, CTA, checkout or auth behavior is changed.
- Service progress bars render their existing percentages immediately and no longer query the whole document or require an observer.
- CountUp starts at its actual end value; guarded, one-shot observer/timer enhancement remains optional. Reduced motion and unavailable capabilities retain the complete value. The Services count helper reuses it; its values/categories are unchanged.
- PersistentTypewriter renders its first complete word on the server. Reduced motion or inaccessible storage leaves readable static text. Optional persistence failures cannot terminate its typing loop.
- Back-to-top remains present and uses an immediate scroll when reduced motion is requested or media detection is unavailable.
- The header menu gains bounded vertical scrolling, with vh followed by dvh fallback sizing. Unsupported backdrop filtering receives an opaque existing-theme surface. These selectors do not change current Workspace/Admin surfaces.
- Unnecessary hero/work-card identity promotion hints are removed. Local decorative planet rendering remains; no redesign or speculative GPU promotion is performed.
- Reduced-motion CSS stops scoped public loops/transitions and the hero's decorative entrance; essential Reveal content stays visible. No-script Contact exposes a native email alternative without changing or submitting its JavaScript form controller.

Layout, typography, colors, original routes, public copy, business data, pricing and backend contracts are retained. Advanced motion is allowed to degrade; essential visibility no longer depends on it. Motion's official documentation confirms initial=false renders the animate targets: https://motion.dev/docs/react-animation . Installed Next's template guide explicitly documents a plain div wrapper.

## Regression evidence and validation

New tests in tests/ui/public-rendering.test.mjs execute actual component rendering and observer feature/failure paths rather than relying only on snapshots. They cover root visibility, all shared entrance wrappers, missing/throwing/silent/working observers, reduced-motion CSS, truthful text/count defaults, existing progress values, Services server counts, visible Music/menu targets, bounded/closed overlay structure and native no-script contact fallback.

Changed-file ESLint: 12 code/test files, zero errors, zero warnings; no rules or ignores changed. The original shared motion file's unused import warning disappears. Final full tests: 212 total, 207 passed, five failed. All fifteen focused public-rendering tests pass. The five failures are existing Blog source/transport snapshots: two in compatibility-retirement.test.mjs and three in admin-sprint.test.mjs for Blog list/create/edit. Their source files, test files and fixture files are byte-identical to the starting baseline; the unrelated CMS contracts are not rewritten to force a pass.

Independent TypeScript passes. The final production build completed with exit code 0, including all 133 entries and standalone packaging. Earlier Windows EBUSY packaging failures were resolved by moving only verified generated standalone output aside before a normal retry. No source/configuration workaround was applied. Preservation confirms 717 byte-identical tracked files, twelve intended tracked changes, no deletions and three unchanged untracked audit reports. Package/lock, authentication/RLS, Workspace/Admin sources, API routes, payment/checkout/pricing and database files remain byte-identical. git diff --check passes.

## Browser/device matrix and actual availability

| Target | Current result |
| --- | --- |
| Samsung Internet / Samsung Android | Not available; exact device reproduction pending |
| Chrome Android, Firefox Android, Brave/Edge/Opera Android | Not available; no real or connected Android session |
| Desktop Chromium via Codex in-app browser | Corrected production build: responsive, theme, scroll and interaction checks passed; this is not physical Android or standalone Chrome |
| Desktop Chrome/Edge/Firefox | Separate named engines unavailable; no parity claim |
| Safari/WebKit | No existing configured test runner or connected engine found |
| Opera Mini | Unavailable. Actual server-render and native-link fallbacks checked; proxy/device parity unverified |
| JavaScript unavailable | Actual server-render tests pass; live browser JS-disable control unavailable |
| Reduced motion | Capability/failure-path and CSS tests pass; live preference emulation unavailable |
| Slow CPU/network, background/foreground, physical rotation/browser chrome | Unavailable through the supported browser APIs |

## Live corrected-build evidence

The browser became usable after the user opened the chat. Heavy local compilation caused intermittent timeouts with only approximately 290 MB free RAM; one browser kernel launch also reported a Windows sandbox helper permission failure. After the complete build exited, supported browser access recovered. These earlier tool failures are not site exceptions.

The completed production build was served locally at port 3110. Homepage checks at 360, 375, 390, 412, 430, 768, 1024, 1280 and 1440 pixels passed in light and dark themes: document scrollWidth did not exceed innerWidth, and heading/main computed opacity was 1. The ordinary main layer had transform none and will-change auto. An 844 × 390 landscape viewport retained a painted hero. This is desktop viewport resizing, not Android/Samsung emulation.

At 390 × 844, repeated one-page downward scrolls traversed the whole homepage in both themes. Home/End jumps, reverse scrolling, mid-page pause/resume, menu open/close, Nova open/close and back-to-top succeeded. Back-to-top returned scrollY to 0. No blank document state appeared. The menu measured 572.5 px high against a 772 px maximum, with overflow-y auto and opacity 1. Nova opened its bounded panel and closed cleanly; no message, lead, newsletter, contact form or checkout was submitted.

Services, Portfolio, Academy, Music, Blog, About and Contact passed mobile scroll smoke in both themes and desktop 1440-pixel light-mode checks, with no document overflow and main opacity 1. The initial Blog loading skeleton was visible, then resolved to the published articles; the loaded list and footer were checked. Contact was rechecked after form/footer loading completed. Academy's CSS entrance was observed mid-animation at opacity approximately 0.96 before completing; its CSS base and reduced-motion rule remain visible without observer initialization.

Before-release production HTML independently confirmed the unsafe opacity-zero template. Its live footer remained visible on rapid scrolling; the precise Samsung symptom did not reproduce in the available engine.

Evidence directory: C:/Users/HP/.codex/visualizations/2026/10/01/01a0f513-b343-7442-8b69-c1a5f3e089cf. Saved files include rendering-qa-results.json, light-route-checks.json, desktop-route-checks.json; all eighteen homepage width/theme screenshots; fixed-home-top/middle/bottom-390-light.png and corresponding dark captures; and priority-route footer captures. Screenshots were visually reviewed at mobile and desktop widths. The JSON records sampled headings/scroll positions and computed styles, not hardware layer-tree evidence.

Console comparison found React hydration error #418 and the Paystack inline-script form error on both unchanged production and the corrected local build. They are existing observable issues, not declared fixed or proven causes of the Samsung scroll symptom. Payment scripts, root business setup and checkout contracts remain unchanged. Local Portfolio reads also reported an existing missing portfolio_projects table; fallback content stayed visible. No schema/environment repair is attempted in this rendering task.

## Release status and limits

Available checks pass under the no-new-errors policy: TypeScript, changed ESLint, all fifteen added rendering regressions, complete production build, whitespace and supported-browser public rendering QA. The full test suite retains five inherited Blog controller/source snapshot failures against byte-identical files; no tests, snapshots or CMS contracts were weakened to make them green.

Prepared for the requested main commit and normal push through the existing PurpleSoftHub Git/Vercel integration. Deployment and post-release evidence will be appended once observed. Physical Samsung/Android, other named engines, live reduced-motion/JS-off emulation and compositor tracing remain unverified. The confirmed animation-dependent visibility defect is fixed; the exact Samsung post-load trigger is not proven. No unrelated frontend redesign or backend changes were made.
