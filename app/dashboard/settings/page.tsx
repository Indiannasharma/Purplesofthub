export const dynamic = 'force-dynamic'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export default async function ClientSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const clerkUser = await currentUser()
  const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null
  if (!user) redirect('/dashboard')

  async function updateProfile(formData: FormData) {
    'use server'
    const { auth: serverAuth } = await import('@clerk/nextjs/server')
    const { userId: uid } = await serverAuth()
    if (!uid) return
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: UserModel } = await import('@/lib/models/User')
    await connectDBFn()
    await UserModel.findOneAndUpdate({ clerkId: uid }, {
      phone: String(formData.get('phone') || '').trim(),
      company: String(formData.get('company') || '').trim(),
      country: String(formData.get('country') || '').trim(),
    })
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/dashboard/settings')
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage your profile and account preferences</p>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Profile summary */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/20 text-2xl font-bold text-brand-400">
              {String(user.firstName || clerkUser?.firstName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">
                {String(user.firstName || '')} {String(user.lastName || '')}
              </p>
              <p className="text-sm text-gray-400">{String(user.email)}</p>
              <span className="mt-1 inline-flex rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-400">
                Client
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Name and email are managed through Clerk. Update the fields below to personalize your account.
          </p>

          <form action={updateProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Company / Organization</label>
              <input
                type="text"
                name="company"
                defaultValue={String(user.company || '')}
                placeholder="Your company or brand name"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Phone Number</label>
              <input
                type="tel"
                name="phone"
                defaultValue={String(user.phone || '')}
                placeholder="+234 800 000 0000"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Country</label>
              <input
                type="text"
                name="country"
                defaultValue={String(user.country || '')}
                placeholder="Nigeria"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Account info */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h5 className="mb-4 text-sm font-semibold text-white">Account Details</h5>
          <div className="space-y-3">
            {[
              { label: 'Member Since', value: new Date(String(user.createdAt)).toLocaleDateString() },
              { label: 'Account Status', value: user.isActive ? 'Active' : 'Inactive' },
              { label: 'Role', value: 'Client' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                <span className="text-xs text-gray-500">{f.label}</span>
                <span className="text-xs text-gray-300">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h5 className="mb-2 text-sm font-semibold text-white">Need Help?</h5>
          <p className="text-xs text-gray-400 mb-4">Contact us for any questions about your projects or account.</p>
          <a
            href="mailto:hello@purplesofthub.com"
            className="inline-flex rounded-full border border-brand-500/50 px-4 py-2 text-xs font-medium text-brand-400 hover:bg-brand-500 hover:text-white transition-all"
          >
            Email Support
          </a>
        </div>
      </div>
    </>
  )
}
