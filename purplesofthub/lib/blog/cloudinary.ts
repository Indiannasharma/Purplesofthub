import 'server-only'
import { v2 as cloudinary } from 'cloudinary'
import { matchesFileSignature, UPLOAD_PURPOSES } from '@/lib/uploadPolicy'
import { BlogPublishingError } from './publishing'
export const BLOG_IMAGE_MAX_BYTES = 3 * 1024 * 1024
export async function blogImageUpload(file: File) {
  const rule = UPLOAD_PURPOSES.blog
  if (!file.size || file.size > BLOG_IMAGE_MAX_BYTES)
    throw new BlogPublishingError(413, 'image_too_large', 'Upload an image of at most 3 MB.')
  if (!rule.mimeTypes.includes(file.type))
    throw new BlogPublishingError(415, 'unsupported_image', 'Use a PNG, JPG, WebP or AVIF image.')
  const buffer = Buffer.from(await file.arrayBuffer())
  if (!matchesFileSignature(buffer, file.type))
    throw new BlogPublishingError(415, 'invalid_image', 'Image contents do not match the declared type.')
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret)
    throw new BlogPublishingError(503, 'image_service_unavailable', 'The image service is not configured.')
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })
  return {
    async upload(): Promise<{ url: string; publicId: string }> {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: rule.folder, resource_type: 'image',
          unique_filename: true, overwrite: false }, (error, result) => {
          if (error || !result?.secure_url) reject(new BlogPublishingError(502, 'image_upload_failed', 'Image upload failed. The article was not saved.'))
          else resolve({ url: result.secure_url, publicId: result.public_id })
        }).end(buffer)
      })
    },
    async remove(publicId: string) { await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }) },
  }
}
