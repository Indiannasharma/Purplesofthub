import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Invoice from '@/lib/models/Invoice'

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

async function sendInvoiceEmail({
  to,
  name,
  invoiceNumber,
  total,
  currency,
  paymentLink,
}: {
  to: string
  name: string
  invoiceNumber: string
  total: number
  currency: string
  paymentLink: string
}) {
  const EMAIL_USER = process.env.EMAIL_USER
  const EMAIL_PASS = process.env.EMAIL_PASS
  if (!EMAIL_USER || !EMAIL_PASS) return

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  })

  const safeName          = escapeHtml(name || 'there')
  const safeInvoiceNumber = escapeHtml(invoiceNumber)
  const safePaymentLink   = encodeURI(paymentLink)

  await transporter.sendMail({
    from: `"PurpleSoftHub" <${EMAIL_USER}>`,
    to,
    subject: `Invoice ${safeInvoiceNumber} from PurpleSoftHub`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:40px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
        <h2 style="color:#a855f7;margin-bottom:8px;">Hi ${safeName}</h2>
        <p style="color:#b8a9d9;line-height:1.7;margin-bottom:16px;">Your invoice <strong>${safeInvoiceNumber}</strong> is ready.</p>
        <p style="color:#b8a9d9;line-height:1.7;margin-bottom:24px;">Amount due: <strong style="color:#fff;">${currency === 'USD' ? '$' : '₦'}${Number(total).toLocaleString()}</strong></p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${safePaymentLink}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">Pay Invoice →</a>
        </div>
        <p style="color:#9d8fd4;font-size:12px;text-align:center;margin-top:24px;">© 2026 PurpleSoftHub. All rights reserved.</p>
      </div>
    `,
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    await connectDB()

    const invoice = await Invoice.findById(id).populate('client', 'firstName email').lean() as ({ client?: { firstName?: string; email?: string } | null; invoiceNumber: string; total: number; currency: string; [key: string]: unknown }) | null
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    }

    const client = invoice.client
    if (!client || !client.email) {
      return NextResponse.json({ error: 'Client email not found. Cannot send invoice.' }, { status: 400 })
    }

    const paymentLink =
      body?.paymentLink ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com'}/dashboard/invoices/${id}`

    await sendInvoiceEmail({
      to: client.email,
      name: client.firstName || '',
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      currency: invoice.currency,
      paymentLink,
    })

    const updated = await Invoice.findByIdAndUpdate(
      id,
      { $set: { status: 'sent' } },
      { new: true }
    ).lean()

    return NextResponse.json({ invoice: updated }, { status: 200 })
  } catch (error) {
    console.error('Admin invoice send error:', error)
    return NextResponse.json({ error: 'Failed to send invoice.' }, { status: 500 })
  }
}
