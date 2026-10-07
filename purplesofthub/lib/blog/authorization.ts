export type BlogAuthorization = { ok: true; userId: string } | { ok: false; status: number; error: string }
export async function authorizeBlogRequest(request: Request, dependencies: {
  verifyAdminToken(token: string): Promise<BlogAuthorization>
  sessionAdmin(): Promise<BlogAuthorization>
}): Promise<BlogAuthorization> {
  const authorization = request.headers.get('authorization')
  if (authorization !== null) {
    const token = authorization.match(/^Bearer ([^\s]+)$/i)?.[1]
    if (!token) return { ok: false, status: 401, error: 'Use a valid admin Bearer access token.' }
    return dependencies.verifyAdminToken(token)
  }
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin')
    let sameOrigin = false
    try {
      const source = new URL(origin || '')
      const target = new URL(request.url)
      // Next may normalize its internal URL to localhost or a proxy hostname.
      // Host is the browser's actual destination authority, not a body field.
      const targetHost = (request.headers.get('host') || target.host).toLowerCase()
      sameOrigin = source.origin === origin && source.host.toLowerCase() === targetHost
        && (source.protocol === target.protocol || source.protocol === 'https:')
    } catch { /* Missing or malformed origins fail closed. */ }
    if (!sameOrigin || request.headers.get('sec-fetch-site') === 'cross-site')
      return { ok: false, status: 403, error: 'Cookie-authenticated changes require the same origin.' }
  }
  return dependencies.sessionAdmin()
}
