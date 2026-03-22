import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { invoiceId, amount, currency } = await request.json()

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

    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          amount: amountInSmallestUnit,
          currency: currency || 'NGN',
          reference: `inv_${invoiceId}_${Date.now()}`,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/paystack/verify`,
          metadata: {
            invoice_id: invoiceId,
            user_id: user.id,
            custom_fields: [
              {
                display_name: 'Invoice ID',
                variable_name: 'invoice_id',
                value: invoiceId
              }
            ]
          }
        })
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
