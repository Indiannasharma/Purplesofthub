# Admin Command Center UI/UX sprint

Baseline: `818acf347515f5e214467271ce1799cec011399f` on `main`, matching `origin/main` before editing. This supersedes the earlier SHA in the request. No reset, branch, schema migration or dependency change was performed.

The sprint refines the operational Admin shell and customer shell, adopts PurpleSoftHub application surfaces, and removes proven Admin demo entrypoints. Full TailAdmin retirement is **not proven**: active full-width authentication screens, mixed global CSS and shared template assets still have consumers.

The architectural inputs were the platform system audit, `platform-workspace-foundation.md`, `customer-workspace-phase2.md` and `customer-workspace-phase3.md`. The dependency inventory and SHA-256 snapshots were collected before edits. The original three untracked audit files remain untracked and unchanged.

## Route inventory and classification

There were 41 Admin page entrypoints: 27 operational, partial or pending surfaces and 14 template demonstrations. There are now 27. All ten customer Dashboard routes remain.

| Area | Retained routes | Classification / scope |
| --- | --- | --- |
| Overview | `/admin`, `/admin/dashboard` redirect | Active production. Real aggregation and ApexCharts retained; KPI presentation compacted. |
| Clients | `/admin/clients`, `/admin/clients/[id]` | Active production. Existing TanStack and details bodies retained; shared shell, spacing, focus and wrapping refined. |
| Leads | `/admin/leads` | Active production. Existing TanStack body and API retained. |
| Projects | `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]` | Active production list/create; detail controls remain under restoration. Lists use exact recorded statuses and genuine progress, including 0 and 100. |
| Services | `/admin/services`, `/admin/services/new` | Active production. Catalog/create/delete remain. Missing edit-route links removed. |
| Invoices | `/admin/invoices`, `/admin/invoices/new` | Active production. Native recorded currency and references; no invented detail route. Creation, line-item arithmetic, draft/send status and send sequence retained. |
| Payments | `/admin/payments` | Active production. Read-only transactions and filters retained. Mixed-currency revenue display replaced with record count; each row keeps its recorded amount/currency. |
| Advertising | `/admin/ads`, `/admin/ads/[clientId]` | Active production. Manual metrics explicitly labelled; client selection and existing campaign/stat mutations retained. Missing global campaign-create link removed. |
| Music | `/admin/music` | Active production. Submitted campaign fields and status preserved; semantic record cards and explicit failed reads. |
| Subscribers | `/admin/subscribers` | Active production. Search/filter/sort and existing CSV behavior retained. |
| Recovery | `/admin/recovery` | Active production. Guarded request, status, notes, creation and signed-document contracts retained. |
| Portfolio | `/admin/portfolio`, `/admin/portfolio/new`, `/admin/portfolio/[id]` | Active production. Shared `ProjectForm` adoption covers create/edit; API and normalization retained. |
| Blog | `/admin/blog`, `/admin/blog/create`, `/admin/blog/edit/[id]` | Active production. CRUD, upload, categories, formatting and 30-second autosave contracts retained. |
| Comments | `/admin/comments` | Active production. Approval/soft-delete contracts retained. |
| Resources | `/admin/resources` | Partial production. Built-in records plus browser-local additions, not public publication. Storage key, payload, upload fallback and removal remain. External-store hydration replaces synchronous effect state. |
| Settings | `/admin/settings` | Profile/password/sign-out are operational. Agency and notification fields are explicitly nonpersistent previews; false save-success controls removed. |
| Promotions | `/admin/promotions` | Pending product definition; no fabricated workflow. |
| Academy | Public `/academy` navigation link | No fabricated LMS administration, student or enrollment metrics. |

Customer routes retained: `/dashboard`, `/dashboard/projects`, `/dashboard/invoices`, `/dashboard/files`, `/dashboard/services`, `/dashboard/ads`, `/dashboard/music`, `/dashboard/recovery`, `/dashboard/connect-meta`, `/dashboard/settings`. Customer body, loader, ownership and payment changes were excluded from this sprint.

## Dependency map and safe retirement decision

| Dependency | Before / after classification | Decision |
| --- | --- | --- |
| AdminShell, navigation and modern Overview | Active production | Refine existing frame; keep authorization in server layout. |
| CustomerShell | Active production | Comfortable shell density, reduced-motion/focus rules, bounded Sheet and Nova handling; preserve customer bodies. |
| Workspace primitives and lowercase shadcn/Radix modules | Active production | Reuse page, header, fields, states, buttons, Sheet, dialogs, dropdowns and tooltips. Header accepts rendered count descriptions; command wrapper forwards optional focus restoration. |
| TanStack Table | Active production | Retain Clients/Leads and use shared table/mobile cards for Projects/Invoices. |
| ApexCharts | Active production | Keep real Overview charts and package. Static bar/line demo entrypoints removed. |
| Projects/create, Invoices/create, Music, Promotions inline TailAdmin tokens | Active legacy -> adopted production | Replace `boxdark`, `stroke`, `bodydark` presentation with PurpleSoftHub-owned surfaces and controls. |
| Recovery public nested Checkbox | Active legacy -> adopted production | Native controlled WorkspaceCheckbox keeps boolean callback, checked/disabled state, implicit label, Space and form behavior. No consent or submission contract change. |
| Root `dark:bg-boxdark-2 dark:text-bodydark` classes | Active legacy -> removed | Body uses existing public semantic background/text variables. Providers, analytics, auth and gateway scripts unchanged. |
| `/full-width-pages/signin`, `/full-width-pages/signup` | Active legacy | Retain. They still reach `components/auth/SignInForm.tsx` / `SignUpForm.tsx`, old Checkbox, InputField, Label and nested Button. A separate safe authentication-presentation migration is required. |
| `app/globals.css`, Outfit, compatibility `--cmd-*`, template theme values | Mixed active production / legacy | Retain byte-for-byte. New Admin and checkbox CSS is scoped. No blind hex replacement or global token deletion. |
| `/full-width-pages/error-404`, GridShape and shared branding/image assets | Active or mixed / unknown | Retain; no asset deletion is justified by demo-route removal alone. |
| Legacy profile/example/header/table components | Demo, now unreachable, or uncertain consumer history | Retain source. Final production import traversal identifies the two authentication forms as the remaining consumers of the scanned legacy Checkbox/Button patterns. |
| FullCalendar, flatpickr, vector-map packages, nested template libraries | Template imports still exist in retained source / unknown cleanup scope | Retain packages and lockfile. No named TailAdmin npm dependency exists to uninstall. |

Final scan: no old Checkbox import remains in public recovery; no `boxdark`, `stroke`, `bodydark` presentation reference remains in the adopted Admin route bodies or root body class. Twelve retained source files still match the narrower legacy Checkbox/Button/token scan; two are reachable from current production routes: the legacy authentication forms. This is **not** a claim that every template token, CSS rule or asset is eliminated.

Full TailAdmin retirement: **NO**. Exact blockers are the retained full-width authentication presentation chain, mixed global CSS/theme compatibility values, active GridShape/error/auth assets, and retained template component/package consumers requiring a separate consumer audit. Unknown dependencies were not removed.

## UI and preservation details

Admin density uses one page-padding owner, compact grouped navigation, restrained surfaces, semantic text and status colors, consistent form/card radii, shorter real KPI cards, wrapping records and labelled mobile cards. Native form labels are connected to their controls. The existing image has transparent square padding; bounded CSS crops that padding for the wordmark, while the collapsed sidebar uses the existing app icon.

Global button reset conflicts required explicit scoped visibility for mobile navigation, desktop collapse and expanded/compact search. Radix continues to provide traps, Escape and outside dismissal. Mobile navigation returns focus to its opener; the palette returns focus to the visible search control. Mobile-only desktop-collapse controls are hidden.

External read failures now produce visible error states rather than false successful empty lists. Async read callbacks and type repairs leave request contracts intact. Cosmetic palette edits were limited to CSS objects/properties and display-status colors, never database payloads or schema values.

The real notification bell remains the production default with the real profile ID. The isolated guarded preview supplies a neutral notification presentation node so synthetic identity never drives notification queries. No preview flag was added to a persisted environment file.

SHA-256 comparison: 97 selected protected files remain byte-for-byte unchanged, including API routes, auth/session modules, Supabase/RLS/storage material, customer Dashboard bodies/loaders, dependency files, ESLint configuration, global CSS and all three audit files. Request-contract tests compare 22 adopted pages against pre-edit transport ASTs, covering table names, selected columns, ordering, filters, identifiers, URLs, payloads and send calls. Project/invoice creation calculations and sequencing remain separately preserved in their controllers.

## Deleted files

Only the following fourteen audited page entrypoints were deleted. Before removal, normalized static/dynamic imports and production navigation/source references were checked; the pages were isolated template/sample surfaces. Their underlying components, assets and packages were retained.

```text
app/admin/(others-pages)/(chart)/bar-chart/page.tsx
app/admin/(others-pages)/(chart)/line-chart/page.tsx
app/admin/(others-pages)/(forms)/form-elements/page.tsx
app/admin/(others-pages)/(tables)/basic-tables/page.tsx
app/admin/(others-pages)/blank/page.tsx
app/admin/(others-pages)/calendar/page.tsx
app/admin/(others-pages)/profile/page.tsx
app/admin/(ui-elements)/alerts/page.tsx
app/admin/(ui-elements)/avatars/page.tsx
app/admin/(ui-elements)/badge/page.tsx
app/admin/(ui-elements)/buttons/page.tsx
app/admin/(ui-elements)/images/page.tsx
app/admin/(ui-elements)/modals/page.tsx
app/admin/(ui-elements)/videos/page.tsx
```

Dependencies removed: none. Assets removed: none. Schema migrations: none.

## Validation and release

Authenticated operational testing is unavailable in the existing browser session: compiled `/admin` redirects to `/sign-in`. Isolated fixture QA does not count as authenticated CRUD, storage, notifications or payment verification. No production QA records, uploads, payments, consent submissions, password changes or messages were created.

Final checks on October 2, 2026:

| Check | Result |
| --- | --- |
| `npm test` | 115 passed, zero failed: 87 existing plus 28 sprint tests. |
| `npx tsc --noEmit` | Passed independently. |
| `npm run build` | Passed on Next 16.1.6; 133 static-generation entries completed. Existing edge-runtime warning remains. |
| Changed-file ESLint | Zero errors, zero warnings; final Shell and test-file edits independently rechecked. |
| Full repository ESLint comparison | Baseline 1,905 files: 2,453 errors / 19,141 warnings. Final 1,895 files plus focused final rechecks: 2,387 errors / 19,121 warnings. Zero added diagnostic fingerprints; reduction of 66 errors and 20 warnings. Historical repository lint remains nonzero. |
| ESLint configuration | Unchanged SHA-256 `54cb3f18cb19a84da22b2a65420cec659db700cab6f7e00d2fa4a510489b2bb9`; no rule disabling or ignore expansion. |
| Protected files | 97 selected files unchanged; no missing protected files. |
| Request contracts | All 22 pre-edit transport AST comparisons pass. |
| Responsive fixtures | 84 screenshots: Admin Projects/Invoices/forms and Customer Overview/Projects/Invoices at 375, 390, 430, 768, 1024, 1280 and 1440 pixels, each in light and dark mode. Document and main scrolling widths show no horizontal overflow. |
| Keyboard and overlays | Admin/Customer mobile Sheets bounded to 310×812 at 375 pixels; Escape returns focus to opener. Admin search supports empty results and returns focus to visible search trigger. Native required validation, checkbox Space activation, true boolean callback and disabled checked/unchecked states verified in isolated fixture. |
| Theme and Nova | Admin dark primary button uses lavender `#a78bfa` with dark foreground `#1b1030`. Closed Nova has a dedicated 72-pixel Admin gutter; real assistant opened/closed locally without sending a message. Nova visibility is hidden while either shell's dialog is open. |
| Diff | `git diff --check` passes. User audit documents remain outside the commit. |

Screenshot and viewport evidence is saved in `C:/Users/HP/.codex/visualizations/2026/10/01/01a0f513-b343-7442-8b69-c1a5f3e089cf/` (`admin-sprint-matrix.json`, `customer-sprint-matrix.json`, `customer-sprint-overview-matrix.json` and matching PNGs). Final dependency/lint/preservation evidence is saved as `C:/Users/HP/AppData/Local/Temp/purplesofthub-uiux-final-evidence.json`.

The guarded fixtures use synthetic records and preserve existing production preview restrictions. The local preview flag was process-only. Release uses the user's authorized normal commit and push on `main`; the final commit and Vercel deployment observations are reported in the completion message. A successful public/anonymous production smoke check cannot establish authenticated workflow correctness.

Recommended next step: use an existing safe authenticated Admin/customer session for read-only operational smoke testing, then separately scope migration of the remaining legacy authentication presentation and audit the shared global compatibility CSS before claiming full TailAdmin retirement. Do not begin LMS or Marketplace work as part of this sprint.
