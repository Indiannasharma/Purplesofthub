import type { SupabaseClient } from '@supabase/supabase-js'
import { RECOVERY_DOCUMENTS_BUCKET } from './documents'

/**
 * Small database helpers shared by the public and admin recovery routes.
 *
 * The recovery schema history is fragmented (see
 * PURPLESOFTHUB_PLATFORM_AUDIT.md), so both routes must tolerate a column that
 * is genuinely absent in a given environment without ever masking a real error.
 */

export type DatabaseError = { code?: string; message?: string }

/**
 * PostgREST reports a column the environment does not have yet as PGRST204
 * ("Could not find the 'x' column of 'y' in the schema cache"); PostgreSQL
 * itself reports 42703.
 */
export function missingColumnFromError(error: DatabaseError): string | null {
  const message = error.message ?? ''

  if (error.code === 'PGRST204' || error.code === '42703' || /column/i.test(message)) {
    const postgrest = message.match(/Could not find the '([^']+)' column/i)
    if (postgrest) return postgrest[1]

    const postgres = message.match(/column "([^"]+)" of relation/i)
    if (postgres) return postgres[1]
  }

  return null
}

/**
 * Insert a recovery request, dropping *only* columns this environment does not
 * have. Any other error is returned to the caller unchanged.
 */
export async function insertRecoveryRequest(
  supabase: SupabaseClient,
  table: string,
  payload: Record<string, unknown>
): Promise<DatabaseError | null> {
  const current: Record<string, unknown> = { ...payload }
  let lastError: DatabaseError | null = null

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { error } = await supabase.from(table).insert(current)
    if (!error) return null

    lastError = error
    const column = missingColumnFromError(error)
    if (!column || !(column in current)) return error

    console.warn(
      `[recovery] column "${column}" is absent in this environment; retrying without it`
    )
    delete current[column]
  }

  return lastError
}

/** Remove objects that were uploaded for a submission that then failed. */
export async function removeRecoveryObjects(
  supabase: SupabaseClient,
  objectPaths: string[]
): Promise<void> {
  if (objectPaths.length === 0) return

  const { error } = await supabase.storage.from(RECOVERY_DOCUMENTS_BUCKET).remove(objectPaths)
  if (error) {
    console.warn('[recovery] orphaned upload cleanup failed:', error.message)
  }
}
