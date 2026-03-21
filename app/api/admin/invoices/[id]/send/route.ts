import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

async function sendInvoiceEmail({
  to, name, invoiceId, amount, currency, paymentLink,
}: { to: string; name: string; invoiceId: string; amount: number; currency: string; paymentLink: string }) {
  const EMAIL_USER = process.env.EMAIL_USER
  const EMAIL_PASS = process.env.EMAIL_PASS
  if (!EMAIL_USER || !EMAIL_PASS) return

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } })
  const safeName = escapeHtml(name || 'there')
  const safeLink = encodeURI(paymentLink)
  const symbol = currency === 'NGN' ? '₦' : '$'

  await transporter.sendMail({
    from: `"PurpleSoftHub" <${EMAIL_USER}>`, to,
    subject: `Invoice ${escapeHtml(invoiceId)} from PurpleSoftHub`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:40px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
      <h2 style="color:#a855f7;">Hi ${safeName}</h2>
      <p style="color:#b8a9d9;">Amount due: <strong style="color:#fff;">${symbol}${Number(amount).toLocaleString()}</strong></p>
      <div style="text-align:center;margin:24px 0;"><a href="${safeLink}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">Pay Invoice →</a></div>
    </div>`,
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, profiles:client_id(email, full_name)')
      .eq('id', id).single()

    if (error || !invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })

    const clientEmail = (invoice.profiles as { email?: string } | null)?.email
    const clientName = (invoice.profiles as { full_name?: string } | null)?.full_name || ''

    if (!clientEmail) return NextResponse.json({ error: 'Client email not found.' }, { status: 400 })

    const paymentLink = body?.paymentLink ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com'}/dashboard/invoices/${id}`

    await sendInvoiceEmail({
      to: clientEmail, name: clientName, invoiceId: String(id),
      amount: invoice.amount, currency: invoice.currency, paymentLink,
    })

    const { data: updated } = await supabase
      .from('invoices').update({ status: 'sent' }).eq('id', id).select().single()

    return NextResponse.json({ invoice: updated })
  } catch (error) {
    console.error('Admin invoice send error:', error)
    return NextResponse.json({ error: 'Failed to send invoice.' }, { status: 500 })
  }
}
