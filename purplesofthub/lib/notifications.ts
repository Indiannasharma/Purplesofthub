import { SupabaseClient } from '@supabase/supabase-js'

export type NotificationType =
  | 'signup'
  | 'recovery'
  | 'payment'
  | 'project'
  | 'music_campaign'
  | 'general'

export interface NotificationPayload {
  user_id?: string | null
  admin_id: string
  title: string
  message: string
  type: NotificationType | string
}

/**
 * Insert a new notification for an admin.
 * Call this from any server action, route handler, or client flow.
 */
export async function createNotification(
  supabase: SupabaseClient,
  params: NotificationPayload
) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id:  params.user_id ?? null,
      admin_id: params.admin_id,
      title:    params.title,
      message:  params.message,
      type:     params.type,
      is_read:  false,
    })
    .select()
    .single()

  if (error) console.error('[createNotification]', error.message)
  return { data, error }
}

/**
 * Mark a single notification as read by its ID.
 */
export async function markAsRead(
  supabase: SupabaseClient,
  notificationId: string
) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) console.error('[markAsRead]', error.message)
  return { error }
}

/**
 * Mark every unread notification as read for a given admin.
 */
export async function markAllAsRead(
  supabase: SupabaseClient,
  adminId: string
) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('admin_id', adminId)
    .eq('is_read', false)

  if (error) console.error('[markAllAsRead]', error.message)
  return { error }
}

/**
 * Retrieve the first admin user ID from the profiles table.
 * Useful when sending notifications from user-facing routes/actions.
 */
export async function getAdminId(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  return data?.id ?? null
}
