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
import { Plus, Trash2 } from 'lucide-react'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export default function NewInvoice() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [clients, setClients] = useState<{ id: string; full_name: string | null; email: string }[]>([])
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    client_id: '',
    project_id: '',
    currency: 'NGN',
    due_date: '',
    notes: '',
  })
  const [items, setItems] = useState<LineItem[]>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
  ])

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'client')
        .order('full_name')
      setClients(data || [])
    }
    fetchClients()
  }, [supabase])

  useEffect(() => {
    if (!form.client_id) return
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, title')
        .eq('client_id', form.client_id)
        .not('status', 'eq', 'cancelled')
      setProjects(data || [])
    }
    fetchProjects()
  }, [form.client_id, supabase])

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      // Recalculate total
      updated[index].total = Number(updated[index].quantity) * Number(updated[index].unit_price)
      return updated
    })
  }

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }
    ])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal

  const handleSubmit = async (action: 'draft' | 'send') => {
    if (!form.client_id) {
      setError('Please select a client')
      return
    }
    if (items.some(i => !i.description)) {
      setError('All line items need a description')
      return
    }
    setSaving(true)
    setError('')

    const { data: invoice, error: err } = await supabase
      .from('invoices')
      .insert({
        client_id: form.client_id,
        project_id: form.project_id || null,
        currency: form.currency,
        items: items,
        subtotal,
        total,
        due_date: form.due_date || null,
        notes: form.notes,
        status: action === 'send' ? 'pending' : 'draft'
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    // Send email if action is send
    if (action === 'send' && invoice) {
      await fetch(`/api/admin/invoices/${invoice.id}/send`, { method: 'POST' })
    }

    router.push('/admin/invoices')
  }

  const currency = form.currency === 'NGN' ? '₦' : '$'
  return <AdminPage className="cc-module admin-form">
    <AdminPageHeader title="New Invoice" description="Prepare line items, client details and billing dates." actions={<Button asChild variant="outline"><Link href="/admin/invoices">Back to Invoices</Link></Button>} />
    {error ? <AdminErrorState title="Could not save invoice" description={error} /> : null}
    <div className="admin-form-panel"><div className="admin-form-grid">
      <AdminField id="invoice-client" label="Client *"><select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value, project_id: '' }))}><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.full_name || c.email}</option>)}</select></AdminField>
      {projects.length > 0 ? <AdminField id="invoice-project" label="Project (optional)"><select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}><option value="">No project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></AdminField> : null}
      <AdminField id="invoice-currency" label="Currency"><select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}><option value="NGN">NGN (₦)</option><option value="USD">USD ($)</option></select></AdminField>
      <AdminField id="invoice-due" label="Due date"><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></AdminField>
    </div></div>
    <section className="admin-form-panel"><h2 className="cc-display" style={{fontSize:16,fontWeight:600}}>Line items</h2>
      {items.map((item,i) => <div key={i} className="admin-line-item">
        <AdminField id={'invoice-description-'+i} label="Description"><input type="text" value={item.description} onChange={e => updateItem(i,'description',e.target.value)} placeholder="Description" /></AdminField>
        <AdminField id={'invoice-quantity-'+i} label="Quantity"><input type="number" value={item.quantity} onChange={e => updateItem(i,'quantity',Number(e.target.value))} min="1" /></AdminField>
        <AdminField id={'invoice-price-'+i} label="Unit price"><input type="number" value={item.unit_price} onChange={e => updateItem(i,'unit_price',Number(e.target.value))} min="0" placeholder="0" /></AdminField>
        <div><span style={{color:'var(--cc-text-muted)',fontSize:12}}>Line total</span><p style={{fontSize:14,padding:'10px 0'}}>{currency}{item.total.toLocaleString()}</p></div>
        <Button variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={items.length === 1} aria-label={'Remove line item '+(i+1)}><Trash2 size={16} aria-hidden="true" /></Button>
      </div>)}
      <Button variant="outline" onClick={addItem} style={{marginTop:16}}><Plus size={16} aria-hidden="true" />Add line item</Button>
      <dl style={{display:'grid',gap:12,marginTop:24}}><div style={{display:'flex',justifyContent:'space-between',gap:16}}><dt>Subtotal</dt><dd>{currency}{subtotal.toLocaleString()}</dd></div><div style={{display:'flex',justifyContent:'space-between',gap:16,fontWeight:600}}><dt>Total</dt><dd>{currency}{total.toLocaleString()}</dd></div></dl>
    </section>
    <div className="admin-form-panel"><AdminField id="invoice-notes" label="Notes (optional)"><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, additional info..." rows={3} /></AdminField>
      <div className="admin-form-actions"><Button variant="outline" onClick={() => handleSubmit('draft')} disabled={saving}>Save Draft</Button><Button onClick={() => handleSubmit('send')} disabled={saving}>{saving ? 'Saving...' : 'Save & Send'}</Button></div>
    </div>
  </AdminPage>
}
