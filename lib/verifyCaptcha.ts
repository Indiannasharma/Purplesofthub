export async function verifyCaptcha(
  token: string | undefined,
  ip?: string
): Promise<{ ok: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping captcha verification')
    return { ok: true }
  }

  if (!token) {
    return { ok: false, error: 'Captcha token is required.' }
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretKey, response: token, remoteip: ip }),
      }
    )

    const data = await response.json()
    if (data.success === true) {
      return { ok: true }
    }
    return { ok: false, error: 'Captcha verification failed.' }
  } catch (error) {
    console.error('Captcha verification error:', error)
    return { ok: false, error: 'Captcha verification failed.' }
  }
}
