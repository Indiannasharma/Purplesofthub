import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getAuthenticatedProfile } from '@/lib/auth'
import { formatLimit, matchesFileSignature, resolveUploadRule } from '@/lib/uploadPolicy'

export const dynamic = 'force-dynamic'

/** Fields returned to the client after a successful Cloudinary upload. */
type CloudinaryUploadResult = {
  secure_url?: string
  url?: string
  public_id?: string
  bytes?: number
  format?: string
  original_filename?: string
  resource_type?: string
  width?: number
  height?: number
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const cloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret)

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
}

export async function POST(request: NextRequest) {
  if (!cloudinaryConfigured) {
    console.error('[upload/cloudinary] Cloudinary credentials are not configured')
    return NextResponse.json(
      { error: 'File upload is not available right now' },
      { status: 503 }
    )
  }

  // 1. Authentication — session cookies only. Never a client-supplied user id.
  const auth = await getAuthenticatedProfile()
  if (!auth.ok) return auth.response

  try {
    const formData = await request.formData()

    // 2. File presence.
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 3. Server-side allowlist for the destination folder. The browser only
    //    sends a purpose key; unknown / traversal-like values are rejected.
    const rawPurpose = formData.get('folder')
    const rule = resolveUploadRule(typeof rawPurpose === 'string' ? rawPurpose : null)

    if (!rule) {
      return NextResponse.json(
        { error: 'Unsupported upload folder' },
        { status: 400 }
      )
    }

    // 4. Authorization — admin-only purposes are checked against the profile
    //    role resolved on the server (same source of truth as requireAdmin).
    if (rule.requireAdmin && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 5. Size limit.
    if (file.size > rule.maxBytes) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${formatLimit(rule.maxBytes)}.` },
        { status: 413 }
      )
    }

    // 6. MIME allowlist for this upload purpose.
    if (!rule.mimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type for this upload.' },
        { status: 415 }
      )
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 7. Content check for the strict image / PDF allowlists.
    if (!matchesFileSignature(buffer, file.type)) {
      return NextResponse.json(
        { error: 'File contents do not match the declared file type.' },
        { status: 415 }
      )
    }

    // 8. Server-controlled destination.
    const folder = rule.perUserFolder
      ? `${rule.folder}/${auth.userId}`
      : rule.folder

    // Upload to Cloudinary
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
            overwrite: false,
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error('Cloudinary upload failed'))
              return
            }
            resolve(result)
          }
        )
        .end(buffer)
    })

    return NextResponse.json({
      url: uploadResult.secure_url || uploadResult.url,
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      bytes: uploadResult.bytes,
      format: uploadResult.format,
      original_filename: uploadResult.original_filename,
      resource_type: uploadResult.resource_type,
      width: uploadResult.width,
      height: uploadResult.height,
    })

  } catch (error) {
    // Never surface provider or internal error details to the client.
    console.error(
      '[upload/cloudinary] Upload failed:',
      error instanceof Error ? error.message : 'unknown error'
    )
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}