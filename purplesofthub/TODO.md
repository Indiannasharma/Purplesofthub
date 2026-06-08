## 2026-06-08 Task: Branded Auth Emails
- [x] Inspect existing auth and email flow
- [x] Add branded welcome and login email templates
- [x] Trigger emails from signup, login, and OAuth callback
- [x] Run build/type checks

## 2026-06-08 Task: Sign-up input focus bug
- [x] Inspect sign-up form state/render behavior
- [x] Keep sign-up page wrapper stable across input state updates
- [x] Verify sign-up fields accept continuous typing

## 2026-06-08 Task: Supabase signup database error
- [x] Inspect public signup and Supabase invite failure screenshots
- [x] Trace auth signup to Supabase database triggers
- [x] Add production SQL repair for auth user profile creation triggers
- [x] Apply repair migration to Supabase production and verify signup/invite

## 2026-06-08 Task: Service pricing catalog cleanup
- [x] Inspect public service plan source and checkout validation catalog
- [x] Replace stale checkout plan validation with official `service-plans.ts`
- [x] Align client dashboard services and plan modal with official service plans
- [x] Run type checks and verify working tree
