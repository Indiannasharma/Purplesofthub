import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Invoice from '@/lib/models/Invoice'

function normalizeItems(items: Array<{ description?: string; quantity?: number; unitPrice?: number; total?: number }>) {
  return items.map((item) => {
    const quantity = Number(item.quantity || 1)
    const unitPrice = Number(item.unitPrice || 0)
    const total = Number((quantity * unitPrice).toFixed(2))
    return {
      description: String(item.description || ''),
      quantity,
      unitPrice,
      total,
    }
  })
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    await connectDB()
    const invoice = await Invoice.findById(id)
      .populate('client', 'firstName lastName email phone company country')
      .populate('project', 'title')
      .lean()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    }

    return NextResponse.json({ invoice }, { status: 200 })
  } catch (error) {
    console.error('Admin invoice GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (body?.items) {
      const items = normalizeItems(body.items)
      const subtotal = items.reduce((sum, item) => sum + item.total, 0)
      const taxPercent = Number(body?.tax || 0)
      const taxAmount = subtotal * (taxPercent / 100)
      const total = Number((subtotal + taxAmount).toFixed(2))
      update.items = items
      update.subtotal = subtotal
      update.tax = taxPercent
      update.total = total
    }

    if (body?.status !== undefined) update.status = String(body.status)
    if (body?.dueDate !== undefined) update.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body?.notes !== undefined) update.notes = String(body.notes)
    if (body?.currency !== undefined) update.currency = body.currency
    if (body?.paidAt !== undefined) update.paidAt = body.paidAt ? new Date(body.paidAt) : null
    if (body?.paymentReference !== undefined) update.paymentReference = String(body.paymentReference)
    if (body?.paymentMethod !== undefined) update.paymentMethod = String(body.paymentMethod)

    await connectDB()
    const invoice = await Invoice.findByIdAndUpdate(id, { $set: update }, { new: true }).lean()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    }

    return NextResponse.json({ invoice }, { status: 200 })
  } catch (error) {
    console.error('Admin invoice PUT error:', error)
    return NextResponse.json({ error: 'Failed to update invoice.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    await connectDB()
    const invoice = await Invoice.findByIdAndDelete(id).lean()
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Admin invoice DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete invoice.' }, { status: 500 })
  }
}
