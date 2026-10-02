import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPage } from "@/components/admin/AdminPage";
import { redirect } from 'next/navigation'
import { getAuthenticatedProfile } from '@/lib/auth'
// TODO: Restore ProjectDetailClient component from git
// import ProjectDetailClient from '@/components/Admin/ProjectDetail'

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getAuthenticatedProfile()
  if (!auth.ok) {
    redirect(auth.response.status === 401 ? '/sign-in' : '/dashboard')
  }

  if (auth.role !== 'admin') redirect('/dashboard')

  const supabase = await createClient()

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
    .eq('id', id)
    .single()

  if (!project) redirect('/admin/projects')

  await supabase.from('tasks').select('*').eq('project_id', id).order('order')

  await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return (
    <AdminPage className="cc-module admin-form admin-adopted">
      <AdminPageHeader title={project.title || project.name || "Project"} description="Project details" /><AdminEmptyState title="Detail controls are under restoration" description="Project task and update controls are unavailable on this page. Return to Projects to review recorded status and progress." />
      {/* TODO: Restore ProjectDetailClient component from git */}
      {/* <ProjectDetailClient project={project} tasks={tasks || []} updates={updates || []} /> */}
    </AdminPage>
  )
}
