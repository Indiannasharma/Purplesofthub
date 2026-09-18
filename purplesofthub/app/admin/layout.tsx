import { redirect } from 'next/navigation'
import { getAuthenticatedProfile } from '@/lib/auth'
import AdminShell from '@/components/admin/AdminShell'

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
  )
}
