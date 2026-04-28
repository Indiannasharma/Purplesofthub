import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null

  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const fileId = Number(id)

  if (!Number.isFinite(fileId)) {
    return NextResponse.json({ error: 'Invalid file id' }, { status: 400 })
  }

  const { data: file, error: fetchError } = await supabase
    .from('files')
    .select('id, client_id, uploaded_by')
    .eq('id', fileId)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message || 'Failed to load file' },
      { status: 500 }
    )
  }

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const ownsFile =
    file.client_id === user.id || file.uploaded_by === user.id

  if (!ownsFile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const service = getServiceRoleClient()

  if (!service) {
    return NextResponse.json(
      {
        error:
          'File deletion requires a Supabase service role key because the current schema does not expose a DELETE policy.',
      },
      { status: 500 }
    )
  }

  const { error: deleteError } = await service
    .from('files')
    .delete()
    .eq('id', fileId)

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message || 'Failed to delete file' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
