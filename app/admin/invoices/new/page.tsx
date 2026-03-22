'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export default function NewInvoice() {
  const router = useRouter()
  const supabase = createClient()
  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
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
  }, [])

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
  }, [form.client_id])

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

  const inputClass = `w-full px-3 py-2.5 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500`
  const currency = form.currency === 'NGN' ? '₦' : '$'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/invoices"
            className="text-bodydark2 hover:text-brand-500 transition-colors text-sm"
          >
            ← Invoices
          </Link>
          <h2 className="text-2xl font-bold text-black dark:text-white">New Invoice</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-stroke dark:border-strokedark text-sm font-medium text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('send')}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Send'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line items */}
          <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
            <div className="px-6 py-4 border-b border-stroke dark:border-strokedark flex items-center justify-between">
              <h6 className="font-semibold text-black dark:text-white">Line Items</h6>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-2 bg-gray-50 dark:bg-boxdark text-xs font-medium text-bodydark2 uppercase">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1" />
            </div>

            {/* Items */}
            <div className="p-4 space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(i, 'description', e.target.value)}
                    placeholder="Description"
                    className={inputClass + ' md:col-span-5'}
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                    min="1"
                    className={inputClass + ' md:col-span-2 text-center'}
                  />
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={e => updateItem(i, 'unit_price', Number(e.target.value))}
                    min="0"
                    placeholder="0"
                    className={inputClass + ' md:col-span-2 text-right'}
                  />
                  <div className="md:col-span-2 text-right text-sm font-semibold text-black dark:text-white px-3 py-2.5">
                    {currency}
                    {item.total.toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    className="md:col-span-1 text-bodydark2 hover:text-red-500 transition-colors text-center disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={addItem}
                className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                + Add Line Item
              </button>
            </div>

            {/* Totals */}
            <div className="border-t border-stroke dark:border-strokedark px-6 py-4">
              <div className="flex justify-end">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-bodydark2">Subtotal</span>
                    <span className="text-black dark:text-white font-medium">
                      {currency}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-stroke dark:border-strokedark pt-2">
                    <span className="text-black dark:text-white">Total</span>
                    <span className="text-brand-500 text-lg">
                      {currency}
                      {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-5">
            <label className="block text-sm font-medium text-bodydark2 mb-2">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Payment terms, additional info..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-4">
          <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-bodydark2 mb-1.5">Client *</label>
              <select
                value={form.client_id}
                onChange={e => setForm(f => ({ ...f, client_id: e.target.value, project_id: '' }))}
                className={inputClass + ' bg-white dark:bg-boxdark'}
              >
                <option value="">Select client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.email}
                  </option>
                ))}
              </select>
            </div>

            {projects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-bodydark2 mb-1.5">Project (optional)</label>
                <select
                  value={form.project_id}
                  onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                  className={inputClass + ' bg-white dark:bg-boxdark'}
                >
                  <option value="">No project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-bodydark2 mb-1.5">Currency</label>
              <select
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className={inputClass + ' bg-white dark:bg-boxdark'}
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-bodydark2 mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 p-5 text-white">
            <p className="text-sm opacity-80 mb-1">Invoice Total</p>
            <p className="text-3xl font-bold">
              {currency}
              {total.toLocaleString()}
            </p>
            <p className="text-sm opacity-80 mt-2">
              {items.length} line item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
