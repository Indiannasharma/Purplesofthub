'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewProject() {
  const router = useRouter()
  const supabase = createClient()
  const [clients, setClients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
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
  }, [])

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

  const InputField = ({
    label,
    children
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <div>
      <label className="block text-sm font-medium text-bodydark2 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500`

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/projects"
          className="text-bodydark2 hover:text-brand-500 transition-colors text-sm"
        >
          ← Projects
        </Link>
        <h2 className="text-2xl font-bold text-black dark:text-white">
          New Project
        </h2>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <InputField label="Project Title *">
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Business Website"
                className={inputClass}
              />
            </InputField>
          </div>

          <InputField label="Client *">
            <select
              value={form.client_id}
              onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              className={inputClass + ' bg-white dark:bg-boxdark'}
            >
              <option value="">Select client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.email}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Service">
            <select
              value={form.service_id}
              onChange={e => setForm(f => ({ ...f, service_id: e.target.value }))}
              className={inputClass + ' bg-white dark:bg-boxdark'}
            >
              <option value="">Select service...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Status">
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className={inputClass + ' bg-white dark:bg-boxdark'}
            >
              {['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'].map(s => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label={`Progress: ${form.progress}%`}>
            <input
              type="range"
              min="0"
              max="100"
              value={form.progress}
              onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
              className="w-full accent-brand-500"
            />
          </InputField>

          <InputField label="Start Date">
            <input
              type="date"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className={inputClass}
            />
          </InputField>

          <InputField label="Due Date">
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              className={inputClass}
            />
          </InputField>

          <InputField label="Budget (₦)">
            <input
              type="number"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="e.g. 150000"
              className={inputClass}
            />
          </InputField>
        </div>

        <InputField label="Description">
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Project details..."
            rows={4}
            className={inputClass + ' resize-none'}
          />
        </InputField>

        <div className="flex gap-3 justify-end pt-2">
          <Link
            href="/admin/projects"
            className="px-5 py-2.5 rounded-lg border border-stroke dark:border-strokedark text-sm font-medium text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
