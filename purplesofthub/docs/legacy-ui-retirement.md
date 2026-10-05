# Legacy UI retirement sprint

Starting SHA: `65d6547ee00e2688b3c2b742e751c72f0b7a5667`, `main`, equal to `origin/main` after fetch and fast-forward pull. Tracked tree was clean; the three user audit reports remain untouched.

## Initial footprint and route inventory

The prior narrow scan is reproduced exactly: 12 source references, two production-reachable template authentication forms. Each initial match is classified below. The import graph includes static imports, re-exports, dynamic imports and literal require calls; source string searches supplement it. Production roots include App Router pages, layouts, handlers and framework error conventions. Test roots are traversed separately.

| Source | Classification | Consumer / result |
| --- | --- | --- |
| `components/header/UserDropdown.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/header/NotificationDropdown.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/user-profile/UserMetaCard.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/user-profile/UserInfoCard.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/user-profile/UserAddressCard.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/example/ModalExample/VerticallyCenteredModal.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/example/ModalExample/FullScreenModal.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/example/ModalExample/FormInModal.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/example/ModalExample/DefaultModal.tsx` | DEAD LEGACY | No production reachability; closed deletion set |
| `components/auth/SignUpForm.tsx` | ACTIVE PRODUCTION at baseline | `/full-width-pages/signup` → old Checkbox/InputField/Label; placeholder Google/X and signup controls |
| `components/auth/SignInForm.tsx` | ACTIVE PRODUCTION at baseline | `/full-width-pages/signin` → old Checkbox/InputField/Label/Button; placeholder controls without authentication handlers |
| `components/tables/DataTable.tsx` | DEAD LEGACY | No production reachability; closed deletion set |

Real authentication routes are `/sign-in`, `/sign-up`, `/forgot-password`, `/auth/callback`, `/auth/signout` and `/api/auth/*`. The callback failure destination is `/sign-in?error=auth_failed`, retained unchanged. `/signin` and `/signup` are not existing canonical routes. No reset-password or verification page exists: forgot-password currently requests `/auth/callback?next=/reset-password`. That existing missing reset destination is documented, not implemented or rewritten. The retained full-width authentication URLs now render the corresponding canonical working page and use its exact existing controller, removing nonfunctional template providers and agreement controls.

## Authentication and error presentation

A focused single-column identity/form composition replaces cyberpunk/glass template styling. Existing Workspace semantic tokens, WorkspaceButton, next-themes/Radix theme control, Lucide and the real PurpleSoftHub identity are reused. No additional provider, identity role selector, consent contract or password visibility feature is invented. Full name/email/password state, presence validation, Enter submission positions, Google OAuth options, Supabase methods, notification calls, role lookup, loading/error behavior, success states and all redirect destinations remain equivalent. Catch assertions and removal of the unused router binding are type/presentation cleanup only. Complete pre-edit handler ASTs are checked against the final source, including sequencing and error semantics.

Labels have explicit control IDs, existing field types, autocomplete, associated escaped errors, aria-invalid, aria-describedby, busy/status feedback and visible focus. The form disables browser-native validation to preserve the existing controller validation. Credentials and provider messages are not stored by the presentation component.

The full-width 404 page and root error/global-error render the shared lightweight status surface. Root `not-found.tsx` provides the same presentation while framework 404 behavior remains. Error reset callbacks and logging are retained; diagnostic message/digest visibility remains development-only. Global error retains its required html/body boundary and a provider-independent system-color fallback. Existing template references to absent error/grid illustrations disappear.

## CSS ownership

`globals.css` was patched, not rewritten. Removed: flatpickr stylesheet import, 26 unused template palette declarations, and eleven unused menu utility blocks. Removed palette names: `boxdark`, `boxdark-2`, `bodydark`, `bodydark1`, `bodydark2`, `graydark`, `gray-2`, `gray-3`, `whiten`, `whiter`, `blackho`, `black-2`, `stroke`, `strokedark`, `form`, `formdark` and `meta-1` through `meta-10`. Shared dark class variant, Tailwind/form infrastructure, public brand/grays/semantic tokens, public animations/navigation, Academy/Portfolio/blog styles, inputs, generic no-scrollbar and shared control defaults remain. Auth-specific rules are scoped in `app/styles/auth.css`; Workspace and Command Center token/stylesheet owners are unchanged.

The `--cmd-*` compatibility variables remain necessary in production customer modules and some Admin bodies. They are not blindly renamed or removed. Production consumers include:

- `app/admin/ads/[clientId]/page.tsx`
- `app/admin/ads/page.tsx`
- `app/admin/recovery/page.tsx`
- `app/admin/blog/page.tsx`
- `app/admin/settings/page.tsx`
- `app/dashboard/music/page.tsx`
- `app/dashboard/ads/page.tsx`
- `app/dashboard/connect-meta/page.tsx`
- `app/dashboard/recovery/page.tsx`
- `app/dashboard/services/page.tsx`
- `components/dashboard/ServicePlanModal.tsx`
- `app/dashboard/files/page.tsx`
- `app/dashboard/settings/page.tsx`

These modules were deliberately preserved. Under the requested strict rule that retained compatibility artifacts prevent a full-retirement claim, **TailAdmin fully retired: NO** until that compatibility dependency is migrated and independently verified. This is distinct from production TailAdmin component/layout/auth imports, which are eliminated. Public gray/brand tokens are shared production styling, not candidates for deletion by naming alone.

## Components and assets

82 proven non-production source files were removed. After replacing the two reachable auth pages, every deleted file had zero production/test reachability and no incoming edge from outside the closed deletion set; the final four old client-shell/context/map files were checked separately. No recursive folder deletion was used.

Removed source files:

- `components/header/UserDropdown.tsx`
- `components/header/NotificationDropdown.tsx`
- `app/test-dashboard.tsx`
- `components/form/switch/Switch.tsx`
- `components/form/Select.tsx`
- `components/form/MultiSelect.tsx`
- `components/form/Label.tsx`
- `layout/SidebarWidget.tsx`
- `components/form/input/TextArea.tsx`
- `layout/Backdrop.tsx`
- `components/form/input/RadioSm.tsx`
- `layout/AppSidebar.tsx`
- `components/form/input/Radio.tsx`
- `layout/AppHeader.tsx`
- `components/form/input/InputField.tsx`
- `components/form/input/FileInput.tsx`
- `components/form/input/Checkbox.tsx`
- `components/videos/TwentyOneIsToNine.tsx`
- `components/videos/SixteenIsToNine.tsx`
- `components/videos/OneIsToOne.tsx`
- `components/videos/FourIsToThree.tsx`
- `components/form/group-input/PhoneInput.tsx`
- `components/form/Form.tsx`
- `components/user-profile/UserMetaCard.tsx`
- `components/user-profile/UserInfoCard.tsx`
- `components/user-profile/UserAddressCard.tsx`
- `components/form/form-elements/ToggleSwitch.tsx`
- `components/form/form-elements/TextAreaInput.tsx`
- `components/form/form-elements/SelectInputs.tsx`
- `components/form/form-elements/RadioButtons.tsx`
- `components/form/form-elements/InputStates.tsx`
- `components/form/form-elements/InputGroup.tsx`
- `components/form/form-elements/FileInputExample.tsx`
- `components/form/form-elements/DropZone.tsx`
- `components/form/form-elements/DefaultInputs.tsx`
- `components/form/form-elements/CheckboxComponents.tsx`
- `components/form/date-picker.tsx`
- `components/example/ModalExample/VerticallyCenteredModal.tsx`
- `components/example/ModalExample/ModalBasedAlerts.tsx`
- `components/example/ModalExample/FullScreenModal.tsx`
- `components/example/ModalExample/FormInModal.tsx`
- `components/example/ModalExample/DefaultModal.tsx`
- `components/ui/video/YouTubeEmbed.tsx`
- `components/ui/video/VideosExample.tsx`
- `components/ecommerce/StatisticsChart.tsx`
- `components/ecommerce/RecentOrders.tsx`
- `components/ecommerce/MonthlyTarget.tsx`
- `components/ecommerce/MonthlySalesChart.tsx`
- `components/ecommerce/EcommerceMetrics.tsx`
- `components/ecommerce/DemographicCard.tsx`
- `components/ecommerce/CountryMap.tsx`
- `components/ui/table/index.tsx`
- `components/ui/modal/index.tsx`
- `components/ui/images/TwoColumnImageGrid.tsx`
- `components/ui/images/ThreeColumnImageGrid.tsx`
- `components/ui/images/ResponsiveImage.tsx`
- `components/common/ThemeTogglerTwo.tsx`
- `components/common/PageBreadCrumb.tsx`
- `components/common/GridShape.tsx`
- `components/common/ComponentCard.tsx`
- `components/common/ChartTab.tsx`
- `components/ui/dropdown/DropdownItem.tsx`
- `components/ui/dropdown/Dropdown.tsx`
- `components/charts/LineChart.tsx`
- `components/charts/BarChart.tsx`
- `hooks/useModal.ts`
- `hooks/useGoBack.ts`
- `components/calendar/Calendar.tsx`
- `components/ui/button/Button.tsx`
- `components/auth/SignUpForm.tsx`
- `components/auth/SignInForm.tsx`
- `components/ui/badge/Badge.tsx`
- `components/ui/avatar/AvatarText.tsx`
- `components/ui/avatar/Avatar.tsx`
- `components/ui/alert/Alert.tsx`
- `components/tables/Pagination.tsx`
- `components/tables/DataTable.tsx`
- `components/tables/BasicTableOne.tsx`
- `components/client/ClientHeader.tsx`
- `components/client/ClientSidebar.tsx`
- `context/SidebarContext.tsx`
- `components/Maps/ClientWorldMap.tsx`

Removed assets (no remaining source/string consumers):

- `public/images/logo/logo.svg`
- `public/images/logo/logo-icon.svg`
- `public/images/logo/logo-dark.svg`
- `public/images/logo/auth-logo.svg`
- `public/images/brand-15.svg`
- `public/images/brand-14.svg`
- `public/images/brand-13.svg`
- `public/images/brand-12.svg`
- `public/images/brand-11.svg`
- `public/images/brand-10.svg`
- `public/images/brand-09.svg`
- `public/images/brand-08.svg`
- `public/images/brand-07.svg`
- `public/images/brand-06.svg`
- `public/images/brand-05.svg`
- `public/images/brand-04.svg`
- `public/images/brand-03.svg`
- `public/images/brand-02.svg`
- `public/images/brand-01.svg`

The real PurpleSoftHub logo, favicon and all public/business assets remain. Unclassified assets and unrelated libraries are retained as UNKNOWN rather than deleted by folder name. The fourteen template demo page routes removed by the previous sprint remain absent. Legacy full-width URLs remain as working shared-page entrypoints, not template demos.

## Packages and canonical Admin route

Removed direct dependencies: six FullCalendar packages (`core`, `daygrid`, `interaction`, `list`, `react`, `timegrid`), `flatpickr`, both `@react-jvectormap` packages, `jsvectormap` and `react-dropzone`. Their only known source consumers were removed template calendar/date-picker/chart/map files or the proven unused old client map/dropzone sample. Corresponding obsolete vector-map overrides were removed. ApexCharts/react-apexcharts remain required by real Command Center charts. Tailwind, shadcn/Radix, Lucide, TanStack, next-themes, Next/React and all auth/business libraries remain. Other unused-looking product/tooling packages are UNKNOWN unless consumer evidence establishes template-only origin. No Vercel configuration change.

`/admin` is the canonical Command Center overview. No active navigation points to `/admin/dashboard`; its existing 404 is expected and no duplicate overview route is created.

## Final reference search

The narrow component/import scan has zero production matches and one regression-test reference. Broader searches classify the two TailAdmin mentions in `app/admin/layout.tsx` and `components/admin/dashboard/RefreshButton.tsx` as comments, not imports. Retained `tailwind.config.js` contains old color names and `types/jsvectormap.d.ts` is an ambient type declaration with no source consumers; they remain isolated/tooling compatibility artifacts and prevent an unqualified claim that every legacy artifact is gone. Documentation and historical audit references are separated from runtime evidence. Two existing checkouts under `.claude/worktrees` retain historical source copies and contribute to repository-wide lint; they are outside this application runtime graph and are preserved. Removed calendar, flatpickr, vector-map and dropzone imports have no production consumers, and the eleven packages are absent from manifest and lockfile.

## Verification and limitations

Checks completed so far on October 5, 2026: all 130 repository tests pass; strengthened auth/package coverage independently passes all 15 tests. Independent TypeScript passes. Changed-file ESLint covers 14 files with zero errors and two inherited sign-in navigation warnings; the final test edit independently has zero errors/warnings. `git diff --check` passes. Hash comparison confirms 671 retained files unchanged, only the twelve intended baseline files modified and 101 approved source/asset removals. Retained lockfile package versions have zero changes. Baseline reconstruction from the saved original three auth sources reproduces 1,895 files / 2,387 errors / 19,121 warnings. Production build passes on Next 16.1.6, including all 134 static-generation entries; the existing edge-runtime warning remains. Final repository-wide lint: 1,818 files / 2,370 errors / 19,119 warnings, a reduction of 17 errors and two warnings from the pristine baseline. Per-file/rule/severity/message multiset comparison finds zero added diagnostics. ESLint configuration is unchanged, with no suppression or ignore expansion. All 152 compiled dependency trace files contain zero references to the eleven removed packages. The new auth fixture returns 404 with the process-local preview flag disabled. Anonymous compiled HTTP checks pass: public and canonical/legacy auth pages return 200; unknown routes, the pre-existing missing reset page and `/admin/dashboard` return 404; Customer Overview/Projects/Invoices and Admin Overview return 307 to `/sign-in`. The explicit legacy error page retains its existing 200 route behavior while actual unknown paths correctly return 404.

At the earlier withheld delivery, browser verification was blocked: the primary browser runtime reports an unavailable native bridge, and supported CUA binding, availability and fresh-tab attempts repeatedly time out. No current screenshot matrix, responsive/theme verdict or authenticated operational result can be claimed. Historical sprint screenshots are not counted as verification of these changes. Commit/push/deployment are withheld because the request makes release conditional on successful validation. The guarded noindex auth preview shares the real presentation component but has no Supabase client or request transport; it is only for safe local state/keyboard testing. No production credentials are manufactured and no sign-in/signup/reset/OAuth request, notification, production record, message, password change or payment is created for QA. Real authenticated smoke testing requires an existing safe session; preview testing is reported separately.


## Release validation — October 5, 2026

Supported CUA browser access was restored with a fresh local tab after the primary bridge failed. The rebuilt production-intended sign-in, sign-up and forgot-password pages passed all seven requested widths (375, 390, 430, 768, 1024, 1280, 1440) in both themes: 42 final layout cases with no horizontal overflow, broken logos or Nova/control intersections. Current screenshots and geometry are saved in the task visualization directory as release-*.png and release-matrix.json.

QA found Nova covering the sign-up footer tagline at tablet/desktop widths. The only release-validation code correction is a scoped 160px desktop auth-footer gutter; the rebuilt 768/1280 screenshots show the collision resolved. No controller, dependency, global styling or business contract was changed during validation.

The transport-free auth fixture verified long wrapped errors, aria-invalid and error associations, disabled email/Google loading actions, live status, long-email success, Enter submission and Google Space activation without sending requests. Tab and Shift+Tab follow the field/link order with a visible 2px outline; theme-menu keyboard activation and focus return work. Computed enabled-button contrast is 7.10:1 light and 6.63:1 dark; placeholders 4.89:1 and 5.74:1. Reduced-motion rules are source/test verified; OS emulation and screen-reader testing were unavailable. Mobile virtual-keyboard behavior is not claimed.

Actual not-found UI was inspected at 375/1440 in both themes. Public homepage and sign-in entry render; requested customer Overview/Projects/Invoices and Admin routes redirect the signed-out browser to sign-in. No safe authenticated session exists, so live authenticated data/CRUD QA remains unavailable. Additional guarded customer/Admin shell fixtures render correctly; mobile Sheets are bounded, hide Nova, and Escape returns focus to their triggers. Nova opens/closes without messaging. Existing root payment scripts emit console errors, and React hydration warnings were observed locally; payment/root controllers are unchanged and no payment action was tested.

Final release checks: independent TypeScript passed; changed-file ESLint 14 files / 0 errors / 2 inherited warnings; 130 tests passed; production build passed with 134 generated entries; full ESLint 1,818 files / 2,370 errors / 19,119 warnings, with an identical diagnostic multiset to the prior final measurement and zero new diagnostics versus the reconstructed baseline. Preservation again confirms 671 byte-identical retained files, twelve intended baseline modifications and 101 audited deletions; audits remain unchanged. Diff whitespace checks pass.

Commit/push/deployment and production verification will be recorded after publication. Full TailAdmin retirement remains NO. The missing reset-password destination, customer project/invoice detail/PDF/Pay gaps, schema/financial-lineage discrepancies and authenticated verification remain separately scoped. No next platform phase or compatibility-token cleanup was started.
