import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

async function sendProjectUpdateEmail({ to, name, projectTitle, updateMessage, dashboardUrl }:
  { to: string; name: string; projectTitle: string; updateMessage: string; dashboardUrl: string }) {
  const EMAIL_USER = process.env.EMAIL_USER
  const EMAIL_PASS = process.env.EMAIL_PASS
  if (!EMAIL_USER || !EMAIL_PASS) return

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } })

  await transporter.sendMail({
    from: `"PurpleSoftHub" <${EMAIL_USER}>`, to,
    subject: `Project update: ${projectTitle}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:40px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
      <h2 style="color:#a855f7;">Hi ${name || 'there'}, new project update</h2>
      <p style="color:#b8a9d9;"><strong>${projectTitle}</strong></p>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(124,58,237,.2);padding:16px;border-radius:12px;">${updateMessage}</div>
      <div style="text-align:center;margin:24px 0;"><a href="${dashboardUrl}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">View Project →</a></div>
    </div>`,
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const body = await req.json()
    const message = String(body?.message || '').trim()

    if (!message) return NextResponse.json({ error: 'Update message is required.' }, { status: 400 })

    const supabase = await createClient()

    // Store update in project_updates table (create this table in Supabase if needed)
    const { data: update, error } = await supabase
      .from('project_updates')
      .insert({ project_id: id, message, created_at: new Date().toISOString() })
      .select().single()

    if (error) throw error

    const { data: project } = await supabase
      .from('projects').select('title, client_id').eq('id', id).single()

    if (project?.client_id) {
      const { data: client } = await supabase
        .from('profiles').select('email, full_name').eq('id', project.client_id).single()

      if (client?.email) {
        await sendProjectUpdateEmail({
          to: client.email, name: client.full_name || '',
          projectTitle: project.title, updateMessage: message,
          dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com'}/dashboard/projects/${id}`,
        })
      }
    }

    return NextResponse.json({ update })
  } catch (error) {
    console.error('Admin project update POST error:', error)
    return NextResponse.json({ error: 'Failed to add update.' }, { status: 500 })
  }
}
