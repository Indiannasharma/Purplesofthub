export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Invoice from '@/lib/models/Invoice'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-gray-500/20 text-gray-400',
  sent:      'bg-blue-500/20 text-blue-400',
  paid:      'bg-green-500/20 text-green-400',
  overdue:   'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
}

const STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()

  const invoice = await Invoice.findById(id)
    .populate('client', 'firstName lastName email company phone')
    .populate('project', 'title')
    .lean() as Record<string, unknown> | null
  if (!invoice) notFound()

  const client = invoice.client as Record<string, unknown> | null
  const project = invoice.project as Record<string, unknown> | null
  const items = (invoice.items as Array<Record<string, unknown>>) ?? []

  async function updateStatus(formData: FormData) {
    'use server'
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: InvoiceModel } = await import('@/lib/models/Invoice')
    await connectDBFn()
    const status = String(formData.get('status'))
    const update: Record<string, unknown> = { status }
    if (status === 'paid') update.paidAt = new Date()
    await InvoiceModel.findByIdAndUpdate(id, update)
    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/admin/invoices/${id}`)
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/invoices" className="text-xs text-gray-400 hover:text-brand-400 mb-3 inline-block">
          ← Back to Invoices
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-mono">{String(invoice.invoiceNumber)}</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Created {new Date(String(invoice.createdAt)).toLocaleDateString()}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[String(invoice.status)] || 'bg-gray-500/20 text-gray-400'}`}>
            {String(invoice.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice body */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            {/* Invoice header */}
            <div className="border-b border-gray-800 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bill To</p>
                  {client && (
                    <>
                      <p className="font-semibold text-white">{String(client.firstName || '')} {String(client.lastName || '')}</p>
                      <p className="text-sm text-gray-400">{String(client.email || '')}</p>
                      {client.company ? <p className="text-sm text-gray-400">{String(client.company)}</p> : null}
                      {client.phone ? <p className="text-sm text-gray-400">{String(client.phone)}</p> : null}
                    </>
                  )}
                </div>
                <div className="text-right">
                  {project && (
                    <p className="text-sm text-gray-400 mb-1">
                      Project: <span className="text-white">{String(project.title)}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-400">
                    Due: <span className="text-white">{invoice.dueDate ? new Date(String(invoice.dueDate)).toLocaleDateString() : '—'}</span>
                  </p>
                  {invoice.paidAt ? (
                    <p className="text-xs text-green-400 mt-1">
                      Paid {new Date(String(invoice.paidAt)).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="px-6 py-3 text-gray-300">{String(item.description || '—')}</td>
                      <td className="px-6 py-3 text-right text-gray-400">{Number(item.quantity ?? 1)}</td>
                      <td className="px-6 py-3 text-right text-gray-400">{String(invoice.currency === 'USD' ? '$' : '₦')}{Number(item.unitPrice ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-medium text-white">{String(invoice.currency === 'USD' ? '$' : '₦')}{Number(item.total ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-800 p-6">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>{String(invoice.currency === 'USD' ? '$' : '₦')}{Number(invoice.subtotal ?? 0).toLocaleString()}</span>
                </div>
                {Number(invoice.tax ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Tax</span>
                    <span>{String(invoice.currency === 'USD' ? '$' : '₦')}{Number(invoice.tax).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-700 pt-2 text-base font-bold text-white">
                  <span>Total</span>
                  <span>{String(invoice.currency === 'USD' ? '$' : '₦')}{Number(invoice.total ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {invoice.notes ? (
              <div className="border-t border-gray-800 px-6 py-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-gray-400">{String(invoice.notes)}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h5 className="mb-4 text-sm font-semibold text-white">Update Status</h5>
            <form action={updateStatus} className="space-y-3">
              <select
                name="status"
                defaultValue={String(invoice.status)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
              >
                Save Status
              </button>
            </form>
          </div>

          {!!invoice.paymentReference && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h5 className="mb-3 text-sm font-semibold text-white">Payment</h5>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference</p>
              <p className="font-mono text-xs text-brand-400 break-all">{String(invoice.paymentReference)}</p>
              {!!invoice.paymentMethod && (
                <>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 mt-3">Method</p>
                  <p className="text-sm text-gray-300">{String(invoice.paymentMethod)}</p>
                </>
              )}
            </div>
          )}

          {client && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h5 className="mb-3 text-sm font-semibold text-white">Client</h5>
              <p className="text-sm font-medium text-white">{String(client.firstName || '')} {String(client.lastName || '')}</p>
              <p className="text-xs text-gray-400 mt-0.5">{String(client.email || '')}</p>
              <Link href={`/admin/clients/${String(client._id)}`} className="mt-3 inline-block text-xs text-brand-400 hover:underline">
                View Client →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
