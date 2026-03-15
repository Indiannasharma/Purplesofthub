type CaptchaResult = {
  ok: boolean;
  error?: string;
};

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string
): Promise<CaptchaResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return { ok: true };
    }
    return { ok: false, error: "Captcha not configured." };
  }

  if (!token) {
    return { ok: false, error: "Captcha is required." };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  const data = (await res.json()) as { success?: boolean };
  return { ok: Boolean(data?.success) };
}
