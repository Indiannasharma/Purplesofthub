import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
// TODO: Restore ClientSettingsForm component from git
// import ClientSettingsForm from '@/components/Client/SettingsForm'

export default async function ClientSettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Settings</h2>
        <p className="text-sm text-bodydark2 mt-1">Manage your account</p>
      </div>

      <div className="max-w-2xl">
        <div className="text-sm text-bodydark2">Settings form placeholder</div>
      </div>
    </>
  )
}
