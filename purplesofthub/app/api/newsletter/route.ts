import { NextRequest, NextResponse } 
  from 'next/server'
import { normalizeEmail } from '@/lib/newsletter/policy'
import { createNewsletterClient, newsletterAvailable } from '@/lib/newsletter/server'

export const dynamic = 'force-dynamic'

/** No subscriber records are returned. Capability checking never performs a write. */
export async function GET() {
  const available = await newsletterAvailable()
  return NextResponse.json({ available }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json()
    const email = body?.email
    const source = ['homepage', 'blog-insights', 'newsletter-popup', 'website'].includes(body?.source) ? body.source : 'website'

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const safeEmail = normalizeEmail(email)
    if (!safeEmail) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const supabase = createNewsletterClient()
    if (!supabase) return NextResponse.json({ error: 'Newsletter signup is temporarily unavailable.' }, { status: 503 })

    // Check if already subscribed
    const { data: existing, error: lookupError } =
      await supabase
        .from('newsletter_subscribers')
        .select('id, email, status')
        .eq('email', safeEmail)
        .maybeSingle()

    if (lookupError) return NextResponse.json({ error: 'Newsletter signup is temporarily unavailable.' }, { status: 503 })

    if (existing) {
      if (existing.status === 
        'unsubscribed') {
        // Reactivate
        const { data: updated, error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            status: 'active',
            updated_at: 
              new Date().toISOString()
          })
          .eq('id', existing.id)
          .select('id')
          .maybeSingle()

        if (updateError || !updated) return NextResponse.json({ error: 'Could not confirm your subscription. Please try again.' }, { status: 503 })

        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed.'
        })
      }

      if (existing.status !== 'active') return NextResponse.json({ error: 'Could not confirm your subscription. Please try again.' }, { status: 503 })
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!'
      })
    }

    // Insert new subscriber
    const { error: insertError } = 
      await supabase
        .from('newsletter_subscribers')
        .insert({
          email: safeEmail,
          source: source || 'website',
          status: 'active',
          created_at: 
            new Date().toISOString(),
        })

    if (insertError) {
      // A concurrent signup may win the unique-email constraint; verify its active state.
      if (insertError.code === '23505') {
        const { data: concurrent, error: checkError } = await supabase.from('newsletter_subscribers').select('status').eq('email', safeEmail).maybeSingle()
        if (!checkError && concurrent?.status === 'active') return NextResponse.json({ success: true, message: 'You are already subscribed!' })
      }
      
      // Schema setup is an operator task; never create tables from a public request.
      if (insertError.code === '42P01') {
        return NextResponse.json(
          { 
            error: 'Newsletter table not found. Please run database setup.',
            code: 'TABLE_NOT_FOUND'
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to save subscription',
        },
        { status: 500 }
      )
    }

    // Try to send welcome email
    // but don't fail if email fails
    try {
      const nodemailer = 
        await import('nodemailer')
      
      if (process.env.EMAIL_USER && 
          process.env.EMAIL_PASS) {
        
        const transporter = nodemailer
          .default.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          })

        // Notify team
        await transporter.sendMail({
          from: `"PurpleSoftHub" <${process.env.EMAIL_USER}>`,
          to: 'hello@purplesofthub.com',
          subject: `📧 New Subscriber: ${safeEmail}`,
          html: `
            <div style="font-family:Arial,
              sans-serif;max-width:500px;
              margin:0 auto;background:#fff;
              border-radius:12px;overflow:hidden;
              box-shadow:0 2px 20px 
                rgba(0,0,0,0.1)">
              <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);
                padding:24px;text-align:center">
                <h2 style="color:#fff;margin:0;
                  font-size:20px">
                  📧 New Newsletter Subscriber!
                </h2>
              </div>
              <div style="padding:24px">
                <p style="color:#444;
                  font-size:15px">
                  <strong>${safeEmail}</strong> 
                  just subscribed to your 
                  newsletter.
                </p>
                <p style="color:#888;
                  font-size:13px">
                  Source: ${source || 'website'}<br>
                  Time: ${new Date()
                    .toLocaleString('en-NG', {
                      timeZone: 'Africa/Lagos'
                    })}
                </p>
              </div>
            </div>
          `,
        })

        // Welcome email to subscriber
        await transporter.sendMail({
          from: `"PurpleSoftHub" <${process.env.EMAIL_USER}>`,
          to: safeEmail,
          subject: 'Welcome to PurpleSoftHub Newsletter! 💜',
          html: `
            <div style="font-family:Arial,
              sans-serif;max-width:600px;
              margin:0 auto;background:#fff;
              border-radius:12px;overflow:hidden;
              box-shadow:0 2px 20px 
                rgba(0,0,0,0.1)">
              <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);
                padding:40px 24px;
                text-align:center">
                <h1 style="color:#fff;
                  margin:0 0 8px;
                  font-size:26px;
                  font-weight:800">
                  Welcome to the Family! 💜
                </h1>
                <p style="color:rgba(255,255,255,0.85);
                  margin:0;font-size:15px">
                  You are now subscribed to 
                  PurpleSoftHub Newsletter
                </p>
              </div>
              <div style="padding:36px 28px">
                <p style="color:#444;
                  line-height:1.7;
                  font-size:15px">
                  Hi there! 👋
                </p>
                <p style="color:#444;
                  line-height:1.7;
                  font-size:15px">
                  Thank you for subscribing! 
                  You will be the first to know 
                  about new services, tips and 
                  special offers from 
                  <strong>PurpleSoftHub</strong>.
                </p>
                <ul style="color:#444;
                  line-height:2;font-size:15px">
                  <li>🚀 New services</li>
                  <li>💡 Tech tips</li>
                  <li>🎵 Music promotion news</li>
                  <li>🎓 Academy updates</li>
                  <li>🔥 Special offers</li>
                </ul>
                <div style="text-align:center;
                  margin:28px 0">
                  <a href="https://purplesofthub.com"
                    style="display:inline-block;
                      background:linear-gradient(135deg,#7c3aed,#a855f7);
                      color:#fff;
                      padding:14px 32px;
                      border-radius:10px;
                      text-decoration:none;
                      font-weight:700;
                      font-size:15px">
                    Visit PurpleSoftHub →
                  </a>
                </div>
              </div>
              <div style="background:#f8f5ff;
                padding:20px 24px;
                text-align:center;
                font-size:13px;color:#888;
                border-top:1px solid #ede9fe">
                <strong style="color:#7c3aed">
                  PurpleSoftHub
                </strong> · 
                <a href="https://purplesofthub.com"
                  style="color:#7c3aed;
                    text-decoration:none">
                  purplesofthub.com
                </a><br>
                Lagos, Nigeria 🇳🇬<br>
                <small>
                  To unsubscribe reply STOP 
                  to this email
                </small>
              </div>
            </div>
          `,
        })
      }
    } catch (emailError) {
      // Email failed but subscription 
      // was saved — that's okay
      void emailError
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Check your inbox for a welcome email.'
    })

  } catch {
    return NextResponse.json(
      { 
        error: 'Something went wrong. Please try again.',
      },
      { status: 500 }
    )
  }
}
