import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Sanitize email
    const safeEmail = email.slice(0, 200)
    const safeSource = (source || 'website').slice(0, 100)

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

      await supabase.from('newsletter_subscribers').insert({
        email: safeEmail,
        source: safeSource,
        created_at: new Date().toISOString(),
      })
    } catch (dbError) {
      // Log but don't fail — email is more important than DB save
      console.error('DB save failed:', dbError)
    }

    // Send notification to PurpleSoftHub team
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"PurpleSoftHub Newsletter" <${process.env.EMAIL_USER}>`,
      to: 'hello@purplesofthub.com',
      subject: `New Newsletter Subscriber: ${safeEmail}`,
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
            .field {
              margin-bottom: 16px;
              padding-bottom: 16px;
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
              <h1>📧 New Newsletter Subscriber</h1>
            </div>
            <div class="body">
              <div class="field">
                <div class="label">Email</div>
                <div class="value">
                  <a href="mailto:${safeEmail}" style="color:#7c3aed">
                    ${safeEmail}
                  </a>
                </div>
              </div>
              <div class="field">
                <div class="label">Source</div>
                <div class="value">${safeSource}</div>
              </div>
              <div class="field">
                <div class="label">Date</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
            </div>
            <div class="footer">
              <p>© PurpleSoftHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Send welcome email to subscriber
    await transporter.sendMail({
      from: `"PurpleSoftHub" <${process.env.EMAIL_USER}>`,
      to: safeEmail,
      subject: 'Welcome to PurpleSoftHub Newsletter! 🎉',
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
              <h1>Welcome! 🎉</h1>
            </div>
            <div class="body">
              <p>Hi there,</p>
              <p>Thank you for subscribing to the PurpleSoftHub newsletter! You'll receive exclusive updates about our latest projects, insights, and announcements.</p>
              <p>Stay tuned for amazing content coming your way!</p>
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

    return NextResponse.json(
      { success: true, message: 'Subscription successful' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
