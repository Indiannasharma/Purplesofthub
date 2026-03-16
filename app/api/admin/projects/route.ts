import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Project from '@/lib/models/Project'
import User from '@/lib/models/User'

async function sendProjectStartedEmail({
  to,
  name,
  projectTitle,
  description,
  dueDate,
  dashboardUrl,
}: {
  to: string
  name: string
  projectTitle: string
  description?: string
  dueDate?: Date
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

  const dueText = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'To be confirmed'

  await transporter.sendMail({
    from: `"PurpleSoftHub" <${EMAIL_USER}>`,
    to,
    subject: 'Your project has started! 🚀',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:40px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
        <h2 style="color:#a855f7;margin-bottom:8px;">Hi ${name || 'there'}, your project is now live!</h2>
        <p style="color:#b8a9d9;line-height:1.7;margin-bottom:16px;">We just kicked off <strong>${projectTitle}</strong>.</p>
        ${description ? `<p style="color:#b8a9d9;line-height:1.7;margin-bottom:16px;">${description}</p>` : ''}
        <p style="color:#b8a9d9;line-height:1.7;margin-bottom:24px;">Expected delivery: <strong style="color:#fff;">${dueText}</strong></p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${dashboardUrl}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">Open Your Dashboard →</a>
        </div>
        <p style="color:#9d8fd4;font-size:12px;text-align:center;margin-top:24px;">© 2026 PurpleSoftHub. All rights reserved.</p>
      </div>
    `,
  })
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const projects = await Project.find({})
      .sort({ updatedAt: -1 })
      .populate('client', 'firstName lastName email')
      .populate('service', 'name category')
      .lean()

    return NextResponse.json({ projects }, { status: 200 })
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
    const clientId = String(body?.client || '').trim()

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    }
    if (!clientId) {
      return NextResponse.json({ error: 'Client is required.' }, { status: 400 })
    }

    await connectDB()

    const project = await Project.create({
      title,
      description: String(body?.description || ''),
      client: clientId,
      service: body?.service || null,
      status: body?.status || 'planning',
      progress: Number(body?.progress || 0),
      startDate: body?.startDate ? new Date(body.startDate) : undefined,
      dueDate: body?.dueDate ? new Date(body.dueDate) : undefined,
    })

    const client = await User.findById(clientId).lean() as { email?: string; firstName?: string } | null
    if (client?.email) {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com'}/dashboard/projects/${project._id}`
      await sendProjectStartedEmail({
        to: client.email,
        name: client.firstName || '',
        projectTitle: project.title,
        description: project.description || '',
        dueDate: project.dueDate,
        dashboardUrl,
      })
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Admin projects POST error:', error)
    return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 })
  }
}
