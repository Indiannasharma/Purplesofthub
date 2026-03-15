type RateLimitState = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitState>();

export function rateLimit(
  key: string,
  opts: { windowMs: number; max: number }
) {
  const now = Date.now();
  const state = store.get(key);
  if (!state || now > state.resetAt) {
    const resetAt = now + opts.windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: opts.max - 1, resetAt };
  }

  if (state.count >= opts.max) {
    return { ok: false, remaining: 0, resetAt: state.resetAt };
  }

  state.count += 1;
  return { ok: true, remaining: opts.max - state.count, resetAt: state.resetAt };
}

export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") || "unknown";
}
