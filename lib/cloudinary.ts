// Lazy load Cloudinary only when needed to avoid import-time config validation
let cloudinary: any = null

function getCloudinaryInstance() {
  if (!cloudinary) {
    const { v2 } = require('cloudinary')
    cloudinary = v2
  }
  return cloudinary
}

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return null
  }

  const cloud = getCloudinaryInstance()
  cloud.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  return cloud
}

export async function uploadFile(file: string, folder: string = 'purplesofthub') {
  const cloud = getCloudinaryConfig()
  if (!cloud) {
    throw new Error('Cloudinary credentials not configured')
  }
  const result = await cloud.uploader.upload(file, {
    folder,
    resource_type: 'auto',
  })
  return {
    url: result.secure_url,
    publicId: result.public_id,
    fileType: result.resource_type,
    fileSize: result.bytes,
  }
}

export async function deleteFile(publicId: string) {
  const cloud = getCloudinaryConfig()
  if (!cloud) {
    throw new Error('Cloudinary credentials not configured')
  }
  return await cloud.uploader.destroy(publicId)
}
