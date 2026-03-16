import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Project from '@/lib/models/Project'
import User from '@/lib/models/User'

async function sendProjectUpdateEmail({
  to,
  name,
  projectTitle,
  updateMessage,
  dashboardUrl,
}: {
  to: string
  name: string
  projectTitle: string
  updateMessage: string
  dashboardUrl: string
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
    subject: `Project update: ${projectTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:40px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
        <h2 style="color:#a855f7;margin-bottom:8px;">Hi ${name || 'there'}, new project update</h2>
        <p style="color:#b8a9d9;line-height:1.7;margin-bottom:16px;"><strong>${projectTitle}</strong></p>
        <div style="background:rgba(255,255,255,.05);border:1px solid rgba(124,58,237,.2);padding:16px;border-radius:12px;color:#e2d9f3;">
          ${updateMessage}
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${dashboardUrl}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">View Project →</a>
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
    const body = await req.json()
    const message = String(body?.message || '').trim()

    if (!message) {
      return NextResponse.json({ error: 'Update message is required.' }, { status: 400 })
    }

    await connectDB()
    const project = await Project.findByIdAndUpdate(
      params.id,
      { $push: { updates: { message, createdAt: new Date() } } },
      { new: true }
    ).lean()

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    const client = await User.findById(project.client).lean()
    if (client?.email) {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com'}/dashboard/projects/${project._id}`
      await sendProjectUpdateEmail({
        to: client.email,
        name: client.firstName || '',
        projectTitle: project.title,
        updateMessage: message,
        dashboardUrl,
      })
    }

    return NextResponse.json({ project }, { status: 200 })
  } catch (error) {
    console.error('Admin project update POST error:', error)
    return NextResponse.json({ error: 'Failed to add update.' }, { status: 500 })
  }
}
