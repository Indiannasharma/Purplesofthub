import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Unified field names matching the database schema
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      handle: formData.get('handle') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      issueType: formData.get('issueType') as string,
      appealMessage: formData.get('appealMessage') as string,
      platform: formData.get('platform') as string,
      amount: formData.get('amount') as string,
      idFile: formData.get('idFile') as File | null,
      screenshotFile: formData.get('screenshotFile') as File | null,
    }

    // Upload files to Supabase Storage if present
    let idDocumentUrl = null
    let screenshotUrl = null

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

      // Upload ID document
      if (data.idFile && data.idFile.size > 0) {
        const idFileName = `id_${Date.now()}_${data.idFile.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('account-recovery-documents')
          .upload(idFileName, data.idFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('account-recovery-documents')
            .getPublicUrl(idFileName)
          idDocumentUrl = urlData.publicUrl
        }
      }

      // Upload screenshot
      if (data.screenshotFile && data.screenshotFile.size > 0) {
        const screenshotFileName = `screenshot_${Date.now()}_${data.screenshotFile.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('account-recovery-documents')
          .upload(screenshotFileName, data.screenshotFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('account-recovery-documents')
            .getPublicUrl(screenshotFileName)
          screenshotUrl = urlData.publicUrl
        }
      }

      // Save to Supabase
      await supabase.from('account_recovery_requests').insert({
        first_name: data.firstName,
        last_name: data.lastName || null,
        handle: data.handle || null,
        email: data.email,
        phone: data.phone || null,
        support_type: data.issueType,
        appeal_message: data.appealMessage || null,
        platform: data.platform,
        amount: data.amount ? parseFloat(data.amount) : null,
        id_document_url: idDocumentUrl,
        screenshot_url: screenshotUrl,
        status: 'pending_payment',
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
      subject: `🔐 New Account Recovery: ${data.firstName} — ${data.platform?.toUpperCase()}`,
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
              'Full Name': `${data.firstName} ${data.lastName}`.trim(),
              'Handle': data.handle,
              'Email': data.email,
              'Phone': data.phone,
              'Issue Type': data.issueType,
              'Appeal Message': data.appealMessage,
              'Platform': data.platform,
              'Amount': data.amount ? `₦${parseFloat(data.amount).toLocaleString()}` : '—',
              'ID Document': idDocumentUrl ? '✓ Uploaded' : 'Not provided',
              'Screenshot': screenshotUrl ? '✓ Uploaded' : 'Not provided',
            }).map(([key, value]) => `
              <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f0f0f0">
                <div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
                  ${key}
                </div>
                <div style="font-size:14px;color:#1a1a1a;white-space:pre-wrap">
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
