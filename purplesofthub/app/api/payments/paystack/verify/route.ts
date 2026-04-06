import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.redirect(
      new URL(
        '/dashboard/invoices?error=no_reference',
        request.url
      )
    )
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    )
    const data = await response.json()

    if (data.data?.status === 'success') {
      const invoiceId = data.data.metadata?.invoice_id
      if (invoiceId) {
        const supabase = await createClient()

        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', invoiceId)
      }
      return NextResponse.redirect(
        new URL(
          '/dashboard/invoices?success=paid',
          request.url
        )
      )
    }

    return NextResponse.redirect(
      new URL(
        '/dashboard/invoices?error=payment_failed',
        request.url
      )
    )
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        '/dashboard/invoices?error=verify_failed',
        request.url
      )
    )
  }
}
