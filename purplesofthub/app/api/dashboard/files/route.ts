import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function normalizeFileRow(file: any) {
  return {
    id: file.id,
    client_id: file.client_id ?? null,
    uploaded_by: file.uploaded_by ?? null,
    file_name: file.file_name ?? '',
    file_url: file.file_url ?? '',
    file_type: file.file_type ?? null,
    file_size: file.file_size ?? null,
    created_at: file.created_at ?? null,
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('files')
    .select('id, client_id, uploaded_by, file_name, file_url, file_type, file_size, created_at')
    .or(`client_id.eq.${user.id},uploaded_by.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to load files' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    files: (data ?? []).map(normalizeFileRow),
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const fileUrl = String(body.file_url || body.url || body.secure_url || '').trim()
  const fileName = String(body.file_name || body.name || '').trim()
  const fileType = String(body.file_type || body.format || '').trim() || null
  const fileSize = Number.isFinite(Number(body.file_size)) ? Math.max(0, Number(body.file_size)) : null

  if (!fileUrl) {
    return NextResponse.json({ error: 'Missing file_url' }, { status: 400 })
  }

  if (!fileName) {
    return NextResponse.json({ error: 'Missing file_name' }, { status: 400 })
  }

  const payload = {
    client_id: user.id,
    uploaded_by: user.id,
    file_name: fileName,
    file_url: fileUrl,
    file_type: fileType,
    file_size: fileSize,
  }

  const { data, error } = await supabase
    .from('files')
    .insert(payload)
    .select('id, client_id, uploaded_by, file_name, file_url, file_type, file_size, created_at')
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to save file metadata' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    file: normalizeFileRow(data),
  })
}
