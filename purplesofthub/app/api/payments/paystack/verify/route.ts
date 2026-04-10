import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.redirect(
      new URL('/dashboard/invoices?error=no_reference', request.url)
    )
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )
    const data = await response.json()

    if (data.data?.status === 'success') {
      const invoiceId = data.data.metadata?.invoice_id
      if (!invoiceId) {
        console.warn('Paystack verification succeeded without invoice metadata:', {
          reference,
        })
        return NextResponse.redirect(
          new URL('/dashboard/invoices?error=missing_invoice', request.url)
        )
      }

      const supabase = await createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (!user || userError) {
        console.warn('Paystack verification attempted without an authenticated user:', {
          reference,
          invoiceId,
        })
        return NextResponse.redirect(
          new URL('/dashboard/invoices?error=unauthorized', request.url)
        )
      }

      const invoiceNumericId = Number(invoiceId)
      if (!Number.isInteger(invoiceNumericId) || invoiceNumericId <= 0) {
        console.warn('Paystack verification received invalid invoice metadata:', {
          reference,
          invoiceId,
          userId: user.id,
        })
        return NextResponse.redirect(
          new URL('/dashboard/invoices?error=invalid_invoice', request.url)
        )
      }

      // Security note: re-check ownership, amount, and currency before marking the invoice as paid.
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, client_id, amount, currency, status')
        .eq('id', invoiceNumericId)
        .single()

      if (invoiceError || !invoice) {
        console.warn('Paystack verification could not load invoice:', {
          reference,
          invoiceId: invoiceNumericId,
          userId: user.id,
          error: invoiceError?.message,
        })
        return NextResponse.redirect(
          new URL('/dashboard/invoices?error=invoice_not_found', request.url)
        )
      }

      if (invoice.client_id !== user.id) {
        console.warn('Paystack verification ownership mismatch:', {
          reference,
          invoiceId: invoiceNumericId,
          userId: user.id,
        })
        return NextResponse.redirect(
          new URL('/dashboard/invoices?error=invoice_forbidden', request.url)
        )
      }

      const paidAmount = Number(data.data.amount) / 100
      const invoiceAmount = Number(invoice.amount)
      const paidCurrency = String(data.data.currency || '').toUpperCase()
      const invoiceCurrency = String(invoice.currency || '').toUpperCase()

      if (Math.round(paidAmount * 100) !== Math.round(invoiceAmount * 100)) {
        console.warn('Paystack verification amount mismatch:', {
          reference,
          invoiceId: invoiceNumericId,
          userId: user.id,
          paidAmount,
          invoiceAmount,
        })
        return NextResponse.redirect(
          new URL('/dashboard/invoices?error=amount_mismatch', request.url)
        )
      }

      if (invoiceCurrency && paidCurrency && invoiceCurrency !== paidCurrency) {
        console.warn('Paystack verification currency mismatch:', {
          reference,
          invoiceId: invoiceNumericId,
          userId: user.id,
          paidCurrency,
          invoiceCurrency,
        })
        return NextResponse.redirect(
          new URL('/dashboard/invoices?error=currency_mismatch', request.url)
        )
      }

      if (invoice.status !== 'paid') {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', invoiceNumericId)

        if (updateError) {
          console.error('Failed to mark invoice as paid:', {
            reference,
            invoiceId: invoiceNumericId,
            userId: user.id,
            error: updateError.message,
          })
          return NextResponse.redirect(
            new URL('/dashboard/invoices?error=update_failed', request.url)
          )
        }
      }

      return NextResponse.redirect(
        new URL('/dashboard/invoices?success=paid', request.url)
      )
    }

    return NextResponse.redirect(
      new URL('/dashboard/invoices?error=payment_failed', request.url)
    )
  } catch (error) {
    console.error('Paystack verification failed:', error)
    return NextResponse.redirect(
      new URL('/dashboard/invoices?error=verify_failed', request.url)
    )
  }
}
