import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  return NextResponse.json({
    configured: !!(cloudName && apiKey && apiSecret),
    cloudName: cloudName ? `${cloudName.substring(0, 4)}...` : 'MISSING',
    apiKey: apiKey ? `${apiKey.substring(0, 4)}...` : 'MISSING',
    apiSecret: apiSecret ? 'SET' : 'MISSING',
  })
}
