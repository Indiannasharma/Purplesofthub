import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { invoiceId, amount, currency, email, metadata, callback_url } = await request.json()

  // Use provided email or user email
  const paystackEmail = email || user?.email
  if (!paystackEmail) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY
  if (!paystackSecret) {
    return NextResponse.json(
      { error: 'Paystack not configured' },
      { status: 500 }
    )
  }

  try {
    const amountInSmallestUnit =
      currency === 'USD'
        ? Math.round(amount * 100)
        : Math.round(amount * 100)

    // Build request body
    const requestBody: any = {
      email: paystackEmail,
      amount: amountInSmallestUnit,
      currency: currency || 'NGN',
      reference: `${invoiceId || 'txn'}_${Date.now()}`,
      callback_url: callback_url || `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/paystack/verify`,
    }

    // Add metadata if provided
    if (metadata) {
      requestBody.metadata = {
        ...metadata,
        ...(user && { user_id: user.id }),
        ...(invoiceId && { invoice_id: invoiceId }),
      }
    } else if (invoiceId || user) {
      requestBody.metadata = {
        ...(invoiceId && { invoice_id: invoiceId }),
        ...(user && { user_id: user.id }),
      }
    }

    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    )

    const data = await response.json()
    if (!data.status) {
      return NextResponse.json(
        { error: data.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}
