import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
// TODO: Restore ProjectDetailClient component from git
// import ProjectDetailClient from '@/components/Admin/ProjectDetail'

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const role = user.user_metadata?.role || user.app_metadata?.role
  if (role !== 'admin') redirect('/dashboard')

  const { data: project } = await supabase
    .from('projects')
    .select(
      `
      *,
      profiles:client_id(
        id, full_name, email
      )
    `
    )
    .eq('id', params.id)
    .single()

  if (!project) redirect('/admin/projects')

  const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', params.id).order('order')

  const { data: updates } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-600 mb-6">Project detail page is being restored. Please check back soon.</p>
      {/* TODO: Restore ProjectDetailClient component from git */}
      {/* <ProjectDetailClient project={project} tasks={tasks || []} updates={updates || []} /> */}
    </div>
  )
}
