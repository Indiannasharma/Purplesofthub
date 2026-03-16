import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Invoice from '@/lib/models/Invoice'

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

  await transporter.sendMail({
    from: `"PurpleSoftHub" <${EMAIL_USER}>`,
    to,
    subject: `Invoice ${invoiceNumber} from PurpleSoftHub`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:40px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
        <h2 style="color:#a855f7;margin-bottom:8px;">Hi ${name || 'there'}</h2>
        <p style="color:#b8a9d9;line-height:1.7;margin-bottom:16px;">Your invoice <strong>${invoiceNumber}</strong> is ready.</p>
        <p style="color:#b8a9d9;line-height:1.7;margin-bottom:24px;">Amount due: <strong style="color:#fff;">${currency === 'USD' ? '$' : '₦'}${Number(total).toLocaleString()}</strong></p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${paymentLink}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">Pay Invoice →</a>
        </div>
        <p style="color:#9d8fd4;font-size:12px;text-align:center;margin-top:24px;">© 2026 PurpleSoftHub. All rights reserved.</p>
      </div>
    `,
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json().catch(() => ({}))
    await connectDB()

    const invoice = await Invoice.findById(params.id).populate('client', 'firstName email').lean()
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    }

    const client = invoice.client as { firstName?: string; email?: string } | null
    const paymentLink =
      body?.paymentLink ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com'}/dashboard/invoices/${invoice._id}`

    if (client?.email) {
      await sendInvoiceEmail({
        to: client.email,
        name: client.firstName || '',
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        currency: invoice.currency,
        paymentLink,
      })
    }

    const updated = await Invoice.findByIdAndUpdate(
      params.id,
      { $set: { status: 'sent' } },
      { new: true }
    ).lean()

    return NextResponse.json({ invoice: updated }, { status: 200 })
  } catch (error) {
    console.error('Admin invoice send error:', error)
    return NextResponse.json({ error: 'Failed to send invoice.' }, { status: 500 })
  }
}
