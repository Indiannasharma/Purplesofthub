import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getData() {
  await connectDB()
  const [clients, projects] = await Promise.all([
    User.find({ role: 'client' }).select('firstName lastName email').sort({ firstName: 1 }).lean() as Promise<Array<Record<string, unknown>>>,
    Project.find({}).select('title client').populate('client', 'firstName lastName').sort({ updatedAt: -1 }).lean() as Promise<Array<Record<string, unknown>>>,
  ])
  return { clients, projects }
}

async function generateInvoiceNumber(): Promise<string> {
  const count = await Invoice.countDocuments()
  const num = String(count + 1).padStart(4, '0')
  return `INV-${new Date().getFullYear()}-${num}`
}

export default async function NewInvoicePage() {
  const { clients, projects } = await getData()

  async function createInvoice(formData: FormData) {
    'use server'
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: InvoiceModel } = await import('@/lib/models/Invoice')
    await connectDBFn()

    const count = await InvoiceModel.countDocuments()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const qty1 = Number(formData.get('qty1')) || 1
    const price1 = Number(formData.get('price1')) || 0
    const qty2 = Number(formData.get('qty2')) || 0
    const price2 = Number(formData.get('price2')) || 0
    const qty3 = Number(formData.get('qty3')) || 0
    const price3 = Number(formData.get('price3')) || 0

    const items = []
    if (formData.get('desc1')) items.push({ description: formData.get('desc1'), quantity: qty1, unitPrice: price1, total: qty1 * price1 })
    if (formData.get('desc2') && qty2 > 0) items.push({ description: formData.get('desc2'), quantity: qty2, unitPrice: price2, total: qty2 * price2 })
    if (formData.get('desc3') && qty3 > 0) items.push({ description: formData.get('desc3'), quantity: qty3, unitPrice: price3, total: qty3 * price3 })

    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const tax = Number(formData.get('tax')) || 0
    const total = subtotal + tax

    await InvoiceModel.create({
      invoiceNumber,
      client: formData.get('clientId'),
      project: formData.get('projectId') || undefined,
      items,
      subtotal,
      tax,
      total,
      currency: formData.get('currency') || 'NGN',
      status: 'draft',
      dueDate: formData.get('dueDate') ? new Date(String(formData.get('dueDate'))) : undefined,
      notes: formData.get('notes'),
    })
    redirect('/admin/invoices')
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/invoices" className="text-xs text-gray-400 hover:text-brand-400 mb-3 inline-block">
          ← Back to Invoices
        </Link>
        <h2 className="text-2xl font-bold text-white">New Invoice</h2>
        <p className="text-sm text-gray-400 mt-0.5">Create a draft invoice for a client</p>
      </div>

      <div className="max-w-2xl">
        <form action={createInvoice} className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
            <h5 className="text-sm font-semibold text-white">Invoice Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Client <span className="text-red-400">*</span></label>
                <select name="clientId" required className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
                  <option value="">— Select client —</option>
                  {clients.map((c) => (
                    <option key={String(c._id)} value={String(c._id)}>
                      {String(c.firstName || '')} {String(c.lastName || '')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Project (optional)</label>
                <select name="projectId" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
                  <option value="">— None —</option>
                  {projects.map((p) => {
                    const c = p.client as Record<string, unknown> | null
                    return (
                      <option key={String(p._id)} value={String(p._id)}>
                        {String(p.title)}{c ? ` (${String(c.firstName || '')} ${String(c.lastName || '')})` : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Currency</label>
                <select name="currency" defaultValue="NGN" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Due Date</label>
                <input type="date" name="dueDate" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none [color-scheme:dark]" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
            <h5 className="text-sm font-semibold text-white">Line Items</h5>
            {[1, 2, 3].map((n) => (
              <div key={n} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6">
                  {n === 1 && <label className="mb-1.5 block text-xs text-gray-400">Description</label>}
                  <input type="text" name={`desc${n}`} required={n === 1} placeholder={`Item ${n}…`} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
                </div>
                <div className="col-span-2">
                  {n === 1 && <label className="mb-1.5 block text-xs text-gray-400">Qty</label>}
                  <input type="number" name={`qty${n}`} min="0" defaultValue={n === 1 ? 1 : 0} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none" />
                </div>
                <div className="col-span-4">
                  {n === 1 && <label className="mb-1.5 block text-xs text-gray-400">Unit Price</label>}
                  <input type="number" name={`price${n}`} min="0" step="0.01" placeholder="0" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="mb-1.5 block text-xs text-gray-400">Tax Amount</label>
                <input type="number" name="tax" min="0" step="0.01" defaultValue="0" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Notes</label>
            <textarea name="notes" rows={3} placeholder="Payment terms, thank you note…" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none resize-none" />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-all">
              Create Invoice
            </button>
            <Link href="/admin/invoices" className="text-sm text-gray-400 hover:text-white">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
