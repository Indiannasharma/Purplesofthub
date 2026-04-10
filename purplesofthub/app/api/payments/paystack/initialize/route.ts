import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type PaystackInitBody = {
  invoiceId?: string | number
  amount?: number | string
  currency?: string
  email?: string
  metadata?: Record<string, unknown>
  callback_url?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let body: PaystackInitBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const invoiceId = body.invoiceId != null ? String(body.invoiceId).trim() : ''
  const isInvoicePayment = invoiceId.length > 0
  const requestedAmount =
    typeof body.amount === 'number' ? body.amount : Number(body.amount)
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY

  if (!paystackSecret) {
    return NextResponse.json(
      { error: 'Paystack not configured' },
      { status: 500 }
    )
  }

  if (isInvoicePayment && !user) {
    return NextResponse.json(
      { error: 'Please sign in to pay an invoice' },
      { status: 401 }
    )
  }

  const paystackEmail = body.email || user?.email
  if (!paystackEmail) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  let paymentAmount = requestedAmount
  let paymentCurrency = body.currency || 'NGN'
  let paymentReference = `txn_${Date.now()}`
  let paymentCallbackUrl = new URL('/api/payments/paystack/verify', request.url).toString()
  let paymentMetadata: Record<string, unknown> | undefined

  try {
    if (isInvoicePayment) {
      const invoiceNumericId = Number(invoiceId)
      if (!Number.isInteger(invoiceNumericId) || invoiceNumericId <= 0) {
        return NextResponse.json(
          { error: 'Invalid invoice ID' },
          { status: 400 }
        )
      }

      // Security note: the invoice must belong to the current user, and the amount must match.
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, client_id, amount, currency, status')
        .eq('id', invoiceNumericId)
        .single()

      if (invoiceError || !invoice) {
        console.warn('Paystack init invoice lookup failed:', {
          invoiceId: invoiceNumericId,
          userId: user?.id,
          error: invoiceError?.message,
        })
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        )
      }

      if (invoice.client_id !== user?.id) {
        console.warn('Paystack init invoice ownership mismatch:', {
          invoiceId: invoiceNumericId,
          userId: user?.id,
        })
        return NextResponse.json(
          { error: 'You do not have permission to pay this invoice' },
          { status: 403 }
        )
      }

      const invoiceAmount = Number(invoice.amount)
      if (Number.isFinite(requestedAmount) && Math.round(requestedAmount * 100) !== Math.round(invoiceAmount * 100)) {
        console.warn('Paystack init amount mismatch:', {
          invoiceId: invoiceNumericId,
          userId: user?.id,
          requestedAmount,
          invoiceAmount,
        })
        return NextResponse.json(
          { error: 'Invoice amount does not match the expected total' },
          { status: 400 }
        )
      }

      if (invoice.status === 'paid') {
        return NextResponse.json(
          { error: 'This invoice has already been paid' },
          { status: 409 }
        )
      }

      paymentAmount = invoiceAmount
      paymentCurrency = invoice.currency || paymentCurrency
      paymentReference = `inv_${invoiceNumericId}_${Date.now()}`
      paymentMetadata = {
        invoice_id: invoiceNumericId,
        user_id: user?.id,
      }
    } else {
      if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than zero' },
          { status: 400 }
        )
      }

      paymentAmount = requestedAmount

      if (body.callback_url) {
        try {
          const resolved = new URL(body.callback_url, request.url)
          if (resolved.origin === new URL(request.url).origin) {
            paymentCallbackUrl = resolved.toString()
          }
        } catch {
          // Ignore unsafe callback URLs and keep the local fallback.
        }
      }

      if (body.metadata) {
        paymentMetadata = {
          ...body.metadata,
          ...(user && { user_id: user.id }),
        }
      } else if (user) {
        paymentMetadata = { user_id: user.id }
      }
    }

    const requestBody: Record<string, unknown> = {
      email: paystackEmail,
      amount: Math.round(paymentAmount * 100),
      currency: paymentCurrency,
      reference: paymentReference,
      callback_url: paymentCallbackUrl,
    }

    if (paymentMetadata) {
      requestBody.metadata = paymentMetadata
    }

    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    const data = await response.json()
    if (!data.status) {
      console.error('Paystack initialization rejected:', data)
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error('Paystack initialization failed:', error)
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}
