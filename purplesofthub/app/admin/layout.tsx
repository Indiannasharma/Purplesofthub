import { redirect } from 'next/navigation'
import { getAuthenticatedProfile } from '@/lib/auth'
import AdminShell from '@/components/admin/AdminShell'
import { ccFontVariables } from '@/components/command-center/fonts'
import '@/app/styles/command-center.css'

/**
 * Admin area layout.
 *
 * Authorization is unchanged: the Supabase session is resolved server-side and
 * non-admins are redirected before any Admin UI renders.
 *
 * Presentation: the Command Center shell (Phase 2). Its design tokens live in
 * app/styles/command-center.css, scoped under `.cc-root` so the public site is
 * untouched. The legacy TailAdmin classes/components are intentionally still
 * present for rollback.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await getAuthenticatedProfile()
  if (!auth.ok) {
    redirect(auth.response.status === 401 ? '/sign-in' : '/dashboard')
  }

  if (auth.role !== 'admin') redirect('/dashboard')

  return (
    <div className={ccFontVariables}>
      <AdminShell
        profile={{
          userId: auth.userId,
          email: auth.email,
          fullName: auth.fullName,
          role: auth.role,
        }}
      >
        {children}
      </AdminShell>
    </div>
  )
}
