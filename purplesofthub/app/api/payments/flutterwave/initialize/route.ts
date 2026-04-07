import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      amount,
      currency,
      name,
      meta,
      redirect_url,
    } = await request.json()

    const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY

    if (!flwSecretKey) {
      return NextResponse.json(
        { error: 'Flutterwave not configured' },
        { status: 500 }
      )
    }

    const txRef = `psb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const response = await fetch(
      'https://api.flutterwave.com/v3/payments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${flwSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount,
          currency: currency || 'NGN',
          redirect_url,
          customer: {
            email,
            name: name || 'Donor',
          },
          meta,
          customizations: {
            title: 'PurpleSoftHub Donation',
            description: 'Supporting Tech Education in Africa',
            logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
          },
        }),
      }
    )

    const data = await response.json()

    if (data.status === 'success') {
      return NextResponse.json({
        payment_link: data.data.link,
        tx_ref: txRef,
      })
    }

    return NextResponse.json(
      { error: data.message || 'Payment failed' },
      { status: 400 }
    )

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}