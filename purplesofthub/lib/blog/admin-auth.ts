import 'server-only'
import { requireAdmin } from '@/lib/auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { authorizeBlogRequest } from '@/lib/blog/authorization'

export async function requireBlogAdmin(request: Request) {
  return authorizeBlogRequest(request, {
    async verifyAdminToken(token) {
      const db = createServiceRoleClient()
      if (!db) return { ok: false, status: 503, error: 'Publishing is not configured.' }
      const { data: { user }, error } = await db.auth.getUser(token)
      if (error || !user) return { ok: false, status: 401, error: 'Invalid or expired admin access token.' }
      const { data: profile, error: profileError } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (profileError) return { ok: false, status: 503, error: 'Authorization is temporarily unavailable.' }
      if (profile?.role !== 'admin') return { ok: false, status: 403, error: 'Admin access is required.' }
      return { ok: true, userId: user.id }
    },
    async sessionAdmin() {
      const result = await requireAdmin()
      if (!result.ok) return { ok: false, status: result.response.status, error: result.response.status === 401 ? 'Unauthorized' : 'Admin access is required.' }
      return { ok: true, userId: result.userId }
    },
  })
}
