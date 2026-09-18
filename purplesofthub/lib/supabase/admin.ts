import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client that uses the service-role key.
 *
 * Why this exists (Phase 1C):
 *  - The admin dashboard must show *accurate* admin aggregates. A few tables
 *    (`chat_leads` in particular) have RLS enabled without a verified SELECT
 *    policy, so an admin-session read can silently return zero rows. Silently
 *    reporting "0 leads" would be worse than reporting "unavailable".
 *  - `lib/auth.ts` already uses exactly this pattern for the admin profile
 *    read, so this is the established convention in this codebase.
 *
 * Security contract:
 *  - This module must only ever be imported by server code (Server Components,
 *    Route Handlers, Server Actions). It is NEVER imported by a client
 *    component and the key is never serialized to the browser.
 *  - Callers MUST already be inside an authenticated admin context
 *    (`getAuthenticatedProfile()` / `requireAdmin()`).
 *  - Returns null when credentials are absent so callers can fall back to the
 *    session client instead of throwing.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null

  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}