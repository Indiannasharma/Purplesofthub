import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const data = {
      fullName: formData.get('fullName') as string,
      facebookHandle: formData.get('facebookHandle') as string,
      firstName: formData.get('firstName') as string,
      surname: formData.get('surname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      supportType: formData.get('supportType') as string,
      additionalInfo: formData.get('additionalInfo') as string,
      platform: formData.get('platform') as string,
      amount: formData.get('amount') as string,
    }

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

      await supabase.from('account_recovery_requests').insert({
        ...data,
        status: 'pending_payment',
        created_at: new Date().toISOString(),
      })
    } catch (dbErr) {
      console.error('DB error:', dbErr)
    }

    // Send email to team
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"PurpleSoftHub" <${process.env.EMAIL_USER}>`,
      to: 'hello@purplesofthub.com',
      replyTo: data.email,
      subject: `🔐 New Account Recovery: ${data.fullName} — ${data.platform?.toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:28px 24px;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:22px">
              🔐 New Account Recovery Request
            </h2>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">
              Platform: ${data.platform?.toUpperCase()}
            </p>
          </div>
          <div style="padding:28px 24px">
            ${Object.entries({
              'Full Name': data.fullName,
              'Facebook Handle': data.facebookHandle,
              'First Name': data.firstName,
              'Surname': data.surname,
              'Email': data.email,
              'Phone': data.phone,
              'Support Type': data.supportType,
              'Additional Info': data.additionalInfo,
              'Platform': data.platform,
            }).map(([key, value]) => `
              <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f0f0f0">
                <div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
                  ${key}
                </div>
                <div style="font-size:14px;color:#1a1a1a">
                  ${value || '—'}
                </div>
              </div>
            `).join('')}
          </div>
          <div style="background:#f8f5ff;padding:16px 24px;text-align:center;font-size:12px;color:#888">
            PurpleSoftHub Account Recovery · ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Recovery API error:', error)
    return NextResponse.json(
      { error: 'Failed to submit' },
      { status: 500 }
    )
  }
}
