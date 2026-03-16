import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Invoice from '@/lib/models/Invoice'

function buildInvoiceNumber() {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `INV-${stamp}-${random}`
}

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

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const invoices = await Invoice.find({})
      .sort({ createdAt: -1 })
      .populate('client', 'firstName lastName email')
      .populate('project', 'title')
      .lean()

    return NextResponse.json({ invoices }, { status: 200 })
  } catch (error) {
    console.error('Admin invoices GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json()
    const clientId = String(body?.client || '').trim()

    if (!clientId) {
      return NextResponse.json({ error: 'Client is required.' }, { status: 400 })
    }

    const rawItems = Array.isArray(body?.items) ? body.items : []
    if (!rawItems.length) {
      return NextResponse.json({ error: 'At least one line item is required.' }, { status: 400 })
    }

    const items = normalizeItems(rawItems)
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxPercent = Number(body?.tax || 0)
    const taxAmount = subtotal * (taxPercent / 100)
    const total = Number((subtotal + taxAmount).toFixed(2))

    await connectDB()
    const invoice = await Invoice.create({
      invoiceNumber: buildInvoiceNumber(),
      client: clientId,
      project: body?.project || null,
      items,
      subtotal,
      tax: taxPercent,
      total,
      currency: body?.currency || 'NGN',
      status: body?.status || 'draft',
      dueDate: body?.dueDate ? new Date(body.dueDate) : undefined,
      notes: String(body?.notes || ''),
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Admin invoices POST error:', error)
    return NextResponse.json({ error: 'Failed to create invoice.' }, { status: 500 })
  }
}
