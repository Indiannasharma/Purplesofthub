import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

type MailConfig =
  | { transporter: nodemailer.Transporter; from: string; to: string }
  | null

const TEAM_RECIPIENTS = [
  'hello@purplesofthub.com',
  'purplesofthub@gmail.com',
]

function createMailConfig(): MailConfig {
  const from =
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    process.env.EMAIL_TO ||
    'hello@purplesofthub.com'
  const to = process.env.EMAIL_TO || 'hello@purplesofthub.com'

  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST
  const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587')
  const smtpSecure = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE || '').toLowerCase() === 'true'
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS

  if (smtpHost && smtpUser && smtpPass) {
    return {
      transporter: nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }),
      from,
      to,
    }
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }),
      from,
      to,
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      service,
      message,
      token // Turnstile token
    } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const safeName = name
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .slice(0, 100)
    const safeEmail = email.slice(0, 200)
    const safeMessage = message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .slice(0, 2000)
    const safeService = (service || 'General').slice(0, 100)
    const safePhone = (phone || 'Not provided').slice(0, 50)

    // Save to Supabase
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            },
          },
        }
      )

      await supabase.from('contacts').insert({
        name: safeName,
        email: safeEmail,
        phone: safePhone,
        service: safeService,
        message: safeMessage,
        created_at: new Date().toISOString(),
      })
    } catch (dbError) {
      // Log but don't fail — email is more important than DB save
      console.error('DB save failed:', dbError)
    }

    // Send email to PurpleSoftHub team when mail credentials are available.
    const mailConfig = createMailConfig()
    if (mailConfig) {
      try {
        const teamEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #fff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #7c3aed, #a855f7);
              padding: 32px 24px;
              text-align: center;
            }
            .header h1 {
              color: #fff;
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .header p {
              color: rgba(255,255,255,0.8);
              margin: 8px 0 0;
              font-size: 14px;
            }
            .body {
              padding: 32px 24px;
            }
            .field {
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #f0f0f0;
            }
            .field:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            .label {
              font-size: 12px;
              font-weight: 700;
              color: #7c3aed;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 6px;
            }
            .value {
              font-size: 15px;
              color: #1a1a1a;
              line-height: 1.6;
            }
            .message-box {
              background: #f8f5ff;
              border-left: 4px solid #7c3aed;
              border-radius: 0 8px 8px 0;
              padding: 16px;
            }
            .footer {
              background: #f8f5ff;
              padding: 20px 24px;
              text-align: center;
              font-size: 13px;
              color: #666;
            }
            .reply-btn {
              display: inline-block;
              background: linear-gradient(135deg, #7c3aed, #a855f7);
              color: #fff;
              padding: 12px 28px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 700;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 New Contact Message</h1>
              <p>Someone reached out via purplesofthub.com</p>
            </div>
            <div class="body">
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${safeName}</div>
              </div>
              <div class="field">
                <div class="label">Email</div>
                <div class="value">
                  <a href="mailto:${safeEmail}" style="color:#7c3aed">
                    ${safeEmail}
                  </a>
                </div>
              </div>
              <div class="field">
                <div class="label">Phone</div>
                <div class="value">${safePhone}</div>
              </div>
              <div class="field">
                <div class="label">Service Interested In</div>
                <div class="value">${safeService}</div>
              </div>
              <div class="field">
                <div class="label">Message</div>
                <div class="value">
                  <div class="message-box">
                    ${safeMessage.replace(/\n/g, '<br>')}
                  </div>
                </div>
              </div>
              <div style="text-align:center">
                <a href="mailto:${safeEmail}" class="reply-btn">
                  Reply to ${safeName} →
                </a>
              </div>
            </div>
            <div class="footer">
              <p>© PurpleSoftHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `

        for (const recipient of TEAM_RECIPIENTS) {
          try {
            await mailConfig.transporter.sendMail({
              from: `"PurpleSoftHub Contact" <${mailConfig.from}>`,
              to: recipient,
              replyTo: safeEmail,
              subject: `New Contact: ${safeName} — ${safeService}`,
              html: teamEmailHtml,
            })
          } catch (recipientError) {
            console.error(`Contact email send failed for ${recipient}:`, recipientError)
          }
        }

        // Send confirmation to user
        await mailConfig.transporter.sendMail({
          from: `"PurpleSoftHub" <${mailConfig.from}>`,
          to: safeEmail,
          replyTo: mailConfig.to,
          subject: 'We received your message 🎉',
          html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #fff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #7c3aed, #a855f7);
              padding: 32px 24px;
              text-align: center;
            }
            .header h1 {
              color: #fff;
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .body {
              padding: 32px 24px;
            }
            .body p {
              font-size: 15px;
              color: #333;
              line-height: 1.6;
              margin: 0 0 16px;
            }
            .footer {
              background: #f8f5ff;
              padding: 20px 24px;
              text-align: center;
              font-size: 13px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank you! 🙏</h1>
            </div>
            <div class="body">
              <p>Hi ${safeName},</p>
              <p>We've received your message and our team will get back to you within 24 hours.</p>
              <p>In the meantime, feel free to reach out to us on WhatsApp for quicker response!</p>
              <p>Best regards,<br><strong>The PurpleSoftHub Team</strong></p>
            </div>
            <div class="footer">
              <p>© PurpleSoftHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        })
      } catch (emailError) {
        // Do not fail the whole contact submission if email transport misbehaves.
        console.error('Contact email send failed:', emailError)
      }
    } else {
      console.warn('Contact email skipped: missing SMTP/EMAIL credentials')
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
