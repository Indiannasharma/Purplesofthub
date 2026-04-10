'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type CheckoutDraft = {
  firstName: string
  lastName: string
  email: string
  phone: string
  businessName: string
  password: string
  plan: string
  amount: number
  serviceId?: string
  serviceName?: string
  requiresProjectCreation?: boolean
}

const DRAFT_KEY = 'purplesofthub.checkout.draft'
const FINALIZED_KEY_PREFIX = 'purplesofthub.checkout.finalized:'
const FINALIZING_KEY_PREFIX = 'purplesofthub.checkout.finalizing:'

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('Confirming your payment...')
  const [reference, setReference] = useState('')
  const [nextPath, setNextPath] = useState('/sign-in')

  useEffect(() => {
    const paymentReference =
      searchParams.get('reference') ||
      searchParams.get('trxref') ||
      searchParams.get('tx_ref') ||
      ''

    if (!paymentReference) {
      setStatus('error')
      setMessage('Payment reference is missing. Please contact support if your payment was completed.')
      return
    }

    setReference(paymentReference)

    const finalizedKey = `${FINALIZED_KEY_PREFIX}${paymentReference}`
    const finalizingKey = `${FINALIZING_KEY_PREFIX}${paymentReference}`

    if (window.sessionStorage.getItem(finalizedKey)) {
      setNextPath(window.sessionStorage.getItem('purplesofthub.checkout.nextPath') || '/sign-in')
      setStatus('ready')
      setMessage('Your checkout is already complete.')
      return
    }

    const run = async () => {
      const draftRaw = window.sessionStorage.getItem(DRAFT_KEY)
      if (!draftRaw) {
        setStatus('error')
        setMessage('We could not find your checkout draft. Please contact support with your payment reference.')
        return
      }

      if (window.sessionStorage.getItem(finalizingKey) === paymentReference) {
        setStatus('loading')
        setMessage('Finalizing your checkout...')
        return
      }

      window.sessionStorage.setItem(finalizingKey, paymentReference)

      let draft: CheckoutDraft
      try {
        draft = JSON.parse(draftRaw) as CheckoutDraft
      } catch {
        setStatus('error')
        setMessage('Your saved checkout data is invalid. Please try again.')
        return
      }

      const paymentMethod = (searchParams.get('provider') as 'paystack' | 'flutterwave' | null) || 'paystack'
      const resolvedNextPath = draft.requiresProjectCreation ? '/dashboard/projects' : '/sign-in'

      try {
        const checkoutResponse = await fetch('/api/checkout/meta-ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: draft.firstName,
            lastName: draft.lastName,
            email: draft.email,
            phone: draft.phone,
            businessName: draft.businessName,
            password: draft.password,
            serviceId: draft.serviceId,
            serviceName: draft.serviceName,
            plan: draft.plan,
            amount: draft.amount,
            paymentReference,
            paymentMethod,
          }),
        })

        const checkoutData = await checkoutResponse.json()
        if (!checkoutResponse.ok || !checkoutData.success) {
          throw new Error(checkoutData.error || 'We could not complete your checkout.')
        }

        if (draft.requiresProjectCreation && draft.serviceId && draft.serviceName) {
          const projectResponse = await fetch('/api/dashboard/create-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: draft.serviceId,
              serviceName: draft.serviceName,
              planName: draft.plan,
              amount: draft.amount,
              paymentReference,
              paymentMethod,
            }),
          })

          const projectData = await projectResponse.json()
          if (!projectResponse.ok || !projectData.success) {
            throw new Error(projectData.error || 'Payment was processed, but project creation failed.')
          }
        }

        setNextPath(resolvedNextPath)
        window.sessionStorage.setItem(finalizedKey, paymentReference)
        window.sessionStorage.setItem('purplesofthub.checkout.nextPath', resolvedNextPath)
        window.sessionStorage.removeItem(finalizingKey)
        window.sessionStorage.removeItem(DRAFT_KEY)

        setStatus('ready')
        setMessage('Your payment was successful and your account has been prepared.')
      } catch (error) {
        window.sessionStorage.removeItem(finalizingKey)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Checkout finalization failed. Please contact support.')
      }
    }

    void run()
  }, [searchParams])

  const isSuccess = status === 'ready'

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 35%), #06030f',
      color: '#e9e4ff',
      textAlign: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 560,
        padding: '36px',
        borderRadius: 24,
        border: '1px solid rgba(124,58,237,0.28)',
        background: 'linear-gradient(180deg, rgba(15,11,31,0.96), rgba(8,6,18,0.96))',
        boxShadow: '0 0 60px rgba(124,58,237,0.18)',
      }}>
        <div style={{
          width: 84,
          height: 84,
          borderRadius: '50%',
          margin: '0 auto 24px',
          display: 'grid',
          placeItems: 'center',
          fontSize: 36,
          background: isSuccess ? 'rgba(16,185,129,0.14)' : 'rgba(124,58,237,0.14)',
          border: `2px solid ${isSuccess ? 'rgba(16,185,129,0.35)' : 'rgba(124,58,237,0.35)'}`,
        }}>
          {isSuccess ? '✓' : '…'}
        </div>

        <p style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#22d3ee', marginBottom: 12 }}>
          PurpleSoftHub Secure Checkout
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', margin: '0 0 12px', color: '#ffffff', lineHeight: 1.1 }}>
          {isSuccess ? 'Payment Confirmed' : 'Finalizing Payment'}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#c6b8ef', margin: '0 0 20px' }}>{message}</p>
        {reference && (
          <p style={{ fontSize: 13, color: '#9d8fd4', margin: '0 0 28px' }}>
            Reference: <span style={{ color: '#ffffff', fontWeight: 700 }}>{reference}</span>
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href={nextPath}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 24px',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: 800,
              color: '#fff',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            }}
          >
            Continue
          </Link>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 24px',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: 800,
              color: '#e9e4ff',
              border: '1px solid rgba(124,58,237,0.25)',
              background: 'rgba(124,58,237,0.08)',
            }}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  )
}
