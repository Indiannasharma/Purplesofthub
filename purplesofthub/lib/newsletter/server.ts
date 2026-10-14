import 'server-only'
import { createClient } from '@supabase/supabase-js'

/** Public signup is validated by the route; subscriber access stays on the server. */
export function createNewsletterClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    db: { schema: 'public' },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Zero-row metadata check, not a guarantee of insert permission or email delivery. */
export async function newsletterAvailable(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false
  try {
    const response = await fetch(url + '/rest/v1/newsletter_subscribers?select=id,email,status,source,created_at,updated_at&limit=0', {
      method: 'HEAD', cache: 'no-store',
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Accept-Profile': 'public' },
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch { return false }
}
