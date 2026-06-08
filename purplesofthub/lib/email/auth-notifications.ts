type AuthEmailType = 'welcome' | 'login'

type AuthEmailPayload = {
  type: AuthEmailType
  email: string
  fullName?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}

type SendAuthEmailResult =
  | { sent: true }
  | { sent: false; skipped: true; reason: string }

const BRAND_PURPLE = '#7c3aed'
const BRAND_PINK = '#a855f7'
const BRAND_CYAN = '#22d3ee'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com')
    .trim()
    .replace(/\/+$/, '')
}

function getFirstName(fullName?: string | null): string {
  const name = fullName?.trim()
  if (!name) return 'there'
  return name.split(/\s+/)[0]
}

function formatLoginTime(): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date())
}

function emailShell(content: string): string {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>PurpleSoftHub</title>
      </head>
      <body style="margin:0;padding:0;background:#070511;font-family:Inter,Arial,sans-serif;color:#e9e4ff;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#070511;padding:32px 12px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:linear-gradient(165deg,#100b22 0%,#090716 100%);border:1px solid rgba(124,58,237,.38);border-radius:20px;overflow:hidden;box-shadow:0 18px 70px rgba(12,7,31,.48);">
                <tr>
                  <td style="padding:24px 28px;border-bottom:1px solid rgba(124,58,237,.22);">
                    <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${BRAND_CYAN};font-weight:800;">PurpleSoftHub</div>
                    <div style="margin-top:6px;color:#9d8fd4;font-size:13px;">Digital Innovation Studio</div>
                  </td>
                </tr>
                ${content}
                <tr>
                  <td style="padding:22px 28px;background:#0a0718;border-top:1px solid rgba(124,58,237,.18);">
                    <p style="margin:0 0 8px;color:#a99dd1;font-size:13px;line-height:1.7;">
                      Need help? Reply to this email or contact us through PurpleSoftHub support.
                    </p>
                    <p style="margin:0;color:#766a9f;font-size:12px;line-height:1.6;">
                      PurpleSoftHub, Lagos, Nigeria<br />
                      <a href="${getSiteUrl()}" style="color:${BRAND_CYAN};text-decoration:none;">${getSiteUrl()}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

function buildWelcomeEmail(fullName?: string | null): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(getFirstName(fullName))
  const siteUrl = getSiteUrl()
  const dashboardUrl = `${siteUrl}/dashboard`

  return {
    subject: 'Welcome to PurpleSoftHub',
    text: `Welcome to PurpleSoftHub, ${getFirstName(fullName)}. Your account is ready. Open your dashboard: ${dashboardUrl}`,
    html: emailShell(`
      <tr>
        <td style="padding:30px 28px 10px;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">Welcome, ${safeName}.</h1>
          <p style="margin:12px 0 0;color:#cfc4f4;font-size:15px;line-height:1.75;">
            Your PurpleSoftHub account is ready. You can now request projects, explore services, manage invoices, and track work from your client dashboard.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 28px 4px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.24);border-radius:14px;">
            <tr>
              <td style="padding:18px 18px;color:#e9e4ff;font-size:14px;line-height:1.75;">
                <strong style="color:#fff;">What you can do next</strong><br />
                Start a project request, review service plans, manage payments, and follow your project updates from one place.
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:22px 28px 30px;">
          <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,${BRAND_PURPLE},${BRAND_PINK});color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 22px;border-radius:12px;box-shadow:0 10px 28px rgba(124,58,237,.35);">Open Dashboard</a>
        </td>
      </tr>
    `),
  }
}

function buildLoginEmail(payload: AuthEmailPayload): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(getFirstName(payload.fullName))
  const safeTime = escapeHtml(formatLoginTime())
  const safeIp = escapeHtml(payload.ipAddress || 'Unknown')
  const safeDevice = escapeHtml(payload.userAgent || 'Unknown device')
  const dashboardUrl = `${getSiteUrl()}/dashboard`

  return {
    subject: 'New login to your PurpleSoftHub account',
    text: `Hi ${getFirstName(payload.fullName)}, there was a new login to your PurpleSoftHub account at ${formatLoginTime()}. IP: ${payload.ipAddress || 'Unknown'}. If this was not you, reset your password.`,
    html: emailShell(`
      <tr>
        <td style="padding:30px 28px 10px;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">New account login</h1>
          <p style="margin:12px 0 0;color:#cfc4f4;font-size:15px;line-height:1.75;">
            Hi ${safeName}, your PurpleSoftHub account was just accessed. If this was you, no action is needed.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 28px 4px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.24);border-radius:14px;">
            <tr>
              <td style="padding:18px;color:#dff8ff;font-size:14px;line-height:1.8;">
                <strong style="color:#fff;">Login details</strong><br />
                Time: ${safeTime}<br />
                IP address: ${safeIp}<br />
                Device: ${safeDevice}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:22px 28px 30px;">
          <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,${BRAND_PURPLE},${BRAND_PINK});color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 22px;border-radius:12px;">Go to Dashboard</a>
          <p style="margin:18px 0 0;color:#a99dd1;font-size:13px;line-height:1.7;">
            If this was not you, reset your password immediately and contact PurpleSoftHub support.
          </p>
        </td>
      </tr>
    `),
  }
}

export async function sendAuthNotificationEmail(
  payload: AuthEmailPayload
): Promise<SendAuthEmailResult> {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS

  if (!emailUser || !emailPass) {
    return { sent: false, skipped: true, reason: 'Missing EMAIL_USER or EMAIL_PASS' }
  }

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  })

  const message =
    payload.type === 'welcome'
      ? buildWelcomeEmail(payload.fullName)
      : buildLoginEmail(payload)

  await transporter.sendMail({
    from: `"PurpleSoftHub" <${emailUser}>`,
    to: payload.email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })

  return { sent: true }
}
