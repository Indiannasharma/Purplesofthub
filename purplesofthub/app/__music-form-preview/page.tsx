'use client'

import { useState } from 'react'
import MusicSubmitForm from '@/components/dashboard/MusicSubmitForm'

export default function MusicFormPreviewPage() {
  const [open, setOpen] = useState(true)

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-brand-600 px-5 py-3 font-bold text-white"
      >
        Open music form
      </button>

      {open && (
        <MusicSubmitForm
          planName="Superstar Campaign With A Very Long Plan Name"
          planPrice={150000}
          planPriceUSD={107}
          planType="promotion"
          onClose={() => setOpen(false)}
        />
      )}
    </main>
  )
}
