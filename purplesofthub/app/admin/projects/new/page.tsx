'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { AdminPage } from '@/components/admin/AdminPage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminField } from '@/components/admin/AdminField'
import { WorkspaceButton as Button } from '@/components/workspace/button'
import { AdminErrorState } from '@/components/admin/AdminErrorState'

export default function NewProject() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [clients, setClients] = useState<{ id: string; full_name: string | null; email: string }[]>([])
  const [services, setServices] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    client_id: '',
    service_id: '',
    status: 'pending',
    progress: 0,
    start_date: '',
    due_date: '',
    budget: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: clientData },
        { data: serviceData }
      ] = await Promise.all([
        supabase.from('profiles')
          .select('id, full_name, email')
          .eq('role', 'client')
          .order('full_name'),
        supabase.from('services')
          .select('id, name')
          .eq('is_active', true)
          .order('name')
      ])
      setClients(clientData || [])
      setServices(serviceData || [])
    }
    fetchData()
  }, [supabase])

  const handleSubmit = async () => {
    if (!form.title || !form.client_id) {
      setError('Title and client are required')
      return
    }
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('projects')
      .insert({
        title: form.title,
        description: form.description,
        client_id: form.client_id,
        status: form.status,
        progress: Number(form.progress),
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        budget: form.budget ? Number(form.budget) : null,
      })

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push('/admin/projects')
  }

  return <AdminPage className="cc-module admin-form">
    <AdminPageHeader title="New Project" description="Set up a project for an existing customer." actions={<Button asChild variant="outline"><Link href="/admin/projects">Back to Projects</Link></Button>} />
    {error ? <AdminErrorState title="Could not create project" description={error} /> : null}
    <div className="admin-form-panel"><div className="admin-form-grid">
      <AdminField id="project-title" label="Project title *"><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Business Website" /></AdminField>
      <AdminField id="project-client" label="Client *"><select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.full_name || c.email}</option>)}</select></AdminField>
      <AdminField id="project-service" label="Service"><select value={form.service_id} onChange={e => setForm(f => ({ ...f, service_id: e.target.value }))}><option value="">Select service...</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></AdminField>
      <AdminField id="project-status" label="Status"><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></AdminField>
      <AdminField id="project-progress" label={'Progress: '+form.progress+'%'}><input type="range" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} /></AdminField>
      <AdminField id="project-start" label="Start date"><input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></AdminField>
      <AdminField id="project-due" label="Due date"><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></AdminField>
      <AdminField id="project-budget" label="Budget (₦)"><input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="e.g. 150000" /></AdminField>
    </div><div style={{ marginTop: 20 }}><AdminField id="project-description" label="Description"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Project details..." rows={4} /></AdminField></div>
    <div className="admin-form-actions"><Button asChild variant="outline"><Link href="/admin/projects">Cancel</Link></Button><Button onClick={handleSubmit} disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</Button></div></div>
  </AdminPage>
}
