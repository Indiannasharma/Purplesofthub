import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import nodemailer from 'nodemailer'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(webhookSecret)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return new Response('Webhook verification failed', { status: 400 })
  }

  await connectDB()

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses[0]?.email_address

    await User.create({
      clerkId: id,
      email,
      firstName: first_name || '',
      lastName: last_name || '',
      avatar: image_url || '',
      role: 'client',
    })

    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS
    const emailTo = process.env.EMAIL_TO

    if (emailUser && emailPass && email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass },
      })

      const safeName = escapeHtml(first_name || 'there')
      const safeEmail = escapeHtml(email)
      const safeFirst = escapeHtml(first_name || '')
      const safeLast = escapeHtml(last_name || '')

      await transporter.sendMail({
        from: `"PurpleSoftHub" <${emailUser}>`,
        to: email,
        subject: 'Welcome to PurpleSoftHub',
        html: `
          <div style="font-family: Outfit, sans-serif; max-width: 600px; margin: 0 auto;
            background: #06030f; color: #e2d9f3; padding: 40px; border-radius: 16px;
            border: 1px solid rgba(124,58,237,0.3);">
            <h1 style="color: #a855f7; margin-bottom: 16px;">Welcome to PurpleSoftHub</h1>
            <p style="color: #b8a9d9; line-height: 1.8; margin-bottom: 16px;">
              Hi ${safeName}! Your account is ready.
            </p>
            <p style="color: #b8a9d9; line-height: 1.8; margin-bottom: 24px;">
              You can now log in to your dashboard to browse our services,
              track your projects, and manage your invoices.
            </p>
            <a href="https://purplesofthub.com/dashboard"
              style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;
                padding: 12px 28px; border-radius: 50px; text-decoration: none;
                font-weight: 700; display: inline-block;">
              Go to Dashboard
            </a>
            <p style="color: #3d2f60; font-size: 12px; margin-top: 32px;">
              2026 PurpleSoftHub. purplesofthub.com
            </p>
          </div>
        `,
      })

      if (emailTo) {
        await transporter.sendMail({
          from: `"PurpleSoftHub Website" <${emailUser}>`,
          to: emailTo,
          subject: `New User Signed Up`,
          html: `
            <div style="font-family: sans-serif; padding: 24px;">
              <h2>New User Registration</h2>
              <p>Name: ${safeFirst} ${safeLast}</p>
              <p>Email: ${safeEmail}</p>
              <p>Time: ${new Date().toLocaleString()}</p>
            </div>
          `,
        })
      }
    }
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    await User.findOneAndUpdate(
      { clerkId: id },
      {
        email: email_addresses[0]?.email_address,
        firstName: first_name || '',
        lastName: last_name || '',
        avatar: image_url || '',
      }
    )
  }

  if (evt.type === 'user.deleted') {
    await User.findOneAndUpdate({ clerkId: evt.data.id }, { isActive: false })
  }

  return new Response('OK', { status: 200 })
}
