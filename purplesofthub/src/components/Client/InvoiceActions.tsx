'use client'
import { useState } from 'react'

interface InvoiceActionsProps {
  invoiceId: string
  status: string
  amount: number
  currency: string
}

export default function InvoiceActions({
  invoiceId,
  status,
  amount,
  currency
}: InvoiceActionsProps) {
  const [paying, setPaying] = useState(false)

  const handlePayWithPaystack = async () => {
    setPaying(true)

    try {
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          amount,
          currency
        })
      })
      const data = await res.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch (err) {
      console.error('Payment error:', err)
    }
    setPaying(false)
  }

  if (status === 'paid') {
    return <span className="text-xs text-green-500 font-medium">✓ Paid</span>
  }

  if (status === 'draft' || status === 'cancelled') {
    return <span className="text-xs text-bodydark2">—</span>
  }

  return (
    <button
      onClick={handlePayWithPaystack}
      disabled={paying}
      className="text-xs px-3 py-1.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all disabled:opacity-50"
    >
      {paying ? 'Processing...' : 'Pay Now'}
    </button>
  )
}
