import { v2 as cloudinary } from 'cloudinary'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log('Config:', {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY
    ? process.env.CLOUDINARY_API_KEY.slice(0, 6) + '...' 
    : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET
    ? 'SET ✅' : 'MISSING ❌',
})

try {
  const result = await cloudinary.api.ping()
  console.log('Cloudinary ping:', result)
  console.log('✅ Cloudinary working!')
} catch (err) {
  console.error('❌ Cloudinary error:', err.message)
}