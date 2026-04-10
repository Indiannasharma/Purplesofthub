import { redirect } from 'next/navigation'
import { getAuthenticatedProfile } from '@/lib/auth'
import AdminLayoutClient from './layout-client'

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

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
