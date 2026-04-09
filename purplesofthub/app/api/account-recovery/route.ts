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
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      handle: formData.get('handle') as string,
      appeal_message: formData.get('appeal_message') as string,
      admin_notes: formData.get('admin_notes') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      issueType: formData.get('issueType') as string,
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
      
      // Create admin client with service role for privileged operations (bypasses RLS)
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          cookies: {
            getAll: () => [],
            setAll: () => {}
          },
        }
      )

      // Get current authenticated admin user
      const { data: { user: adminUser }, error: adminError } = await supabaseAdmin.auth.getUser()
      
      // Lookup user profile by email if provided
      let user_id = null
      if (data.email) {
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .single()
        
        if (userProfile) {
          user_id = userProfile.id
        }
      }

      // Upload ID document
      if (data.idFile && data.idFile.size > 0) {
        const idFileName = `id_${Date.now()}_${data.idFile.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('account-recovery-documents')
          .upload(idFileName, data.idFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from('account-recovery-documents')
            .getPublicUrl(idFileName)
          idDocumentUrl = urlData.publicUrl
        }
      }

      // Upload screenshot
      if (data.screenshotFile && data.screenshotFile.size > 0) {
        const screenshotFileName = `screenshot_${Date.now()}_${data.screenshotFile.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('account-recovery-documents')
          .upload(screenshotFileName, data.screenshotFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from('account-recovery-documents')
            .getPublicUrl(screenshotFileName)
          screenshotUrl = urlData.publicUrl
        }
      }

      // Save to Supabase using admin client
      await supabaseAdmin.from('account_recovery_requests').insert({
        first_name: data.first_name,
        last_name: data.last_name || null,
        handle: data.handle || null,
        appeal_message: data.appeal_message || null,
        admin_notes: data.admin_notes || null,
        email: data.email,
        user_id: user_id,
        created_by_admin_id: adminUser?.id || null,
        phone: data.phone || null,
        support_type: data.issueType,
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
      subject: `🔐 New Account Recovery: ${data.first_name} — ${data.platform?.toUpperCase()}`,
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
               'Full Name': `${data.first_name} ${data.last_name}`.trim(),
              'Handle': data.handle,
              'Email': data.email,
              'Phone': data.phone,
              'Issue Type': data.issueType,
              'Appeal Message': data.appeal_message,
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
