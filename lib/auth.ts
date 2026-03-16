import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  if (role !== 'admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true as const, userId }
}
