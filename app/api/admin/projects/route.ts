import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

async function sendProjectStartedEmail({ to, name, projectTitle, description, dueDate, dashboardUrl }:
  { to: string; name: string; projectTitle: string; description?: string; dueDate?: string; dashboardUrl: string }) {
  const EMAIL_USER = process.env.EMAIL_USER
  const EMAIL_PASS = process.env.EMAIL_PASS
  if (!EMAIL_USER || !EMAIL_PASS) return

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } })
  const dueText = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'To be confirmed'

  await transporter.sendMail({
    from: `"PurpleSoftHub" <${EMAIL_USER}>`, to,
    subject: 'Your project has started! 🚀',
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:40px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
      <h2 style="color:#a855f7;">Hi ${name || 'there'}, your project is now live!</h2>
      <p style="color:#b8a9d9;">We just kicked off <strong>${projectTitle}</strong>.</p>
      ${description ? `<p style="color:#b8a9d9;">${description}</p>` : ''}
      <p style="color:#b8a9d9;">Expected delivery: <strong style="color:#fff;">${dueText}</strong></p>
      <div style="text-align:center;margin:24px 0;"><a href="${dashboardUrl}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">Open Your Dashboard →</a></div>
    </div>`,
  })
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const supabase = await createClient()
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, profiles:client_id(email, full_name)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Admin projects GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json()
    const title = String(body?.title || '').trim()
    const clientId = String(body?.client_id || body?.client || '').trim()

    if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    if (!clientId) return NextResponse.json({ error: 'Client is required.' }, { status: 400 })

    const supabase = await createClient()

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title,
        description: String(body?.description || ''),
        client_id: clientId,
        service_type: String(body?.service_type || body?.service || ''),
        status: body?.status || 'pending',
        progress: Number(body?.progress || 0),
        start_date: body?.start_date || null,
        end_date: body?.end_date || body?.due_date || null,
        budget: body?.budget ? Number(body.budget) : null,
      })
      .select()
      .single()

    if (error) throw error

    const { data: client } = await supabase.from('profiles').select('email, full_name').eq('id', clientId).single()
    if (client?.email) {
      await sendProjectStartedEmail({
        to: client.email, name: client.full_name || '',
        projectTitle: project.title, description: project.description,
        dueDate: project.end_date,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com'}/dashboard/projects/${project.id}`,
      })
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Admin projects POST error:', error)
    return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 })
  }
}
