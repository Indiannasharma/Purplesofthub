'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FileUploadClient({ userId }: { userId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setError('')
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      // Simulate progress
      setProgress(20)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(50)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      setProgress(80)

      // Save file metadata to Supabase
      const { error: dbError } = await supabase
        .from('files')
        .insert([
          {
            user_id: userId,
            file_name: file.name,
            file_size: data.size,
            file_url: data.url,
            file_type: data.format,
            cloudinary_public_id: data.public_id,
            uploaded_at: new Date().toISOString(),
          },
        ])

      if (dbError) {
        throw new Error('Failed to save file metadata')
      }

      setProgress(100)
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
        // Refresh the page or reload files
        window.location.reload()
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all disabled:opacity-50"
      >
        {uploading ? `Uploading... ${progress}%` : 'Upload File'}
      </button>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
