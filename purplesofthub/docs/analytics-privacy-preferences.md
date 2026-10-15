# Existing consent banner and privacy preferences

Implemented on main. The owner subsequently authorized the production release with the
commit message `feat: upgrade analytics privacy preferences`, following a final production
build and focused staging review. Production smoke results are reported with the release.

## Preserved architecture and appearance

`components/analytics/AnalyticsPreferences.tsx` remains the single consent controller.
Its bottom-left root (16px offsets), 520px maximum width, existing panel/trigger styles,
theme tokens, responsive padding, focus rules and motion-free behavior are retained.
The compact panel is not replaced by a modal or another consent system.

The existing `purplesofthub-analytics-preference` version-1 record and 180-day expiry
remain authoritative. Existing valid accept/reject decisions remain valid. No new cookies,
storage keys, tracking categories, providers or dependencies were introduced. The gtag adapter,
GA4 runtime, route restrictions, URL/referrer sanitization and deduplication are unchanged.

## Actions and state changes

- Banner: Accept All, Reject Optional and Customize. Accept and reject use identical button
  styling and minimum sizes. Accepted visitors retain an explicit withdrawal button when expanded.
- Customize opens a separate Radix dialog only after user action. Unknown/rejected consent
  starts with optional analytics unchecked. A valid existing acceptance is reflected accurately.
- Strictly necessary functions are described as always on. Optional analytics is the only
  optional category currently offered. Advertising storage, personalization and Google signals
  stay disabled; no inactive marketing toggles or unsupported category promises were added.
- Checkbox edits are drafts until Save Preferences. Escape, outside click and Close cancel
  drafts, preserve saved consent and restore focus. Acceptance/rejection/withdrawal use the
  existing synchronous runtime handler before storage or UI updates.
- Footer Privacy Preferences dispatches a local UI event to this controller. It has no store,
  provider, runtime or separate banner. It also works on public pages excluded from tracking;
  choosing analytics there does not bypass the runtime's route gate.
- The same existing storage listener handles cross-tab updates. Storage exceptions remain
  safe and the current tab can still reject or withdraw. Tracking stays off until acceptance.
- The existing newsletter controller recognizes both the unchanged banner region and the
  modal's standard dialog semantics, avoiding an automatic newsletter interruption.

## Accessibility and scope

The modal uses the installed Radix dialog for title/description associations, focus trapping,
Escape/outside dismissal, background interaction blocking and focus restoration. The optional
checkbox has a visible associated label and description. Footer controls and modal inputs have
visible keyboard focus. The dialog is viewport-bounded and scrollable; no new motion was added.
The privacy disclosure explains categories, purpose, provider, decision persistence and withdrawal.

This is a consent interface for the existing GA4 integration, not a claim of legal certification
or a complete vendor/storage audit. CDN-injected tools and other third-party settings are not
changed by this task. Newsletter opt-in, authentication, payment and theme systems remain separate.
No geographic profiling or location lookup was introduced.

Guidance used for the interface decisions:

- [ICO: managing consent for storage/access technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/): equally easy refusal and withdrawal, clear choices.
- [EDPB cookie-banner taskforce report](https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf): rejection in the first layer and avoiding deceptive choice design.
- [NDPC GAID 2025](https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf): cookie/tracking transparency and conspicuous notices consistent with data-protection principles.

## Verification

The first production smoke check found that `NEXT_PUBLIC_GA_ID` was absent from the
linked Vercel Production environment. The owner authorized adding the expected public
measurement ID. A follow-up one-line correction makes unknown-consent banner expansion
independent of GA4 configuration. Without configuration, acceptance remains disabled,
and rejection/customization remain available. Its targeted regression test passed.

- 14 focused analytics tests passed, retaining route/privacy/gating/deduplication/withdrawal
  regressions and adding banner, explicit-modal, optional-default and footer-opener checks.
- TypeScript and changed-file ESLint passed; Git diff check passed.
- One isolated Chrome session against the local app verified light/dark themes at 1440px
  and 390px. The banner retained its 16px left/bottom offsets and measured 520px/358px
  wide respectively. Neither banner nor dialog caused horizontal overflow.
- Customize and the footer opened the same labelled/described dialog. Optional analytics
  defaulted off; unsaved edits and Escape left consent unchanged. Keyboard focus remained
  trapped and returned to Customize or the footer on closing. Rejection survived reload.
- Actual network observation recorded no GA4 collections before consent, one after explicit
  acceptance, and no further collections after withdrawal; the runtime disable flag was true.
  Storage failures left rejection usable without loading the SDK. No runtime or hydration
  errors were captured. This focused UI check does not re-certify every GA4 navigation path
  or Google property collection; those runtime files were unchanged.
- Evidence: `C:/Users/HP/AppData/Local/Temp/psh-consent-fcCW0y/verification.json` and
  adjacent desktop/mobile light/dark banner/dialog screenshots. These temporary QA artifacts
  are not application deliverables or staged files. Other browsers and assistive technologies
  were not tested; no new motion needs reduced-motion emulation.
- Final release production build passed (Next.js 16.1.6, TypeScript and 132 generated entries).
  Only the eight consent UI, footer, disclosure, policy event, test and documentation files
  belong to this release; unrelated audits, historic screenshots and generated files are excluded.
