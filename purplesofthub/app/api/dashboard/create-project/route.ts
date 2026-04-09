import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const {
      serviceId,
      serviceName,
      planName,
      amount,
      deliveryTime,
      paymentReference,
      paymentMethod,
    } = body

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_id: user.id,
        title: `${serviceName} - ${planName}`,
        description: `Service: ${serviceName}\nPlan: ${planName}\nDelivery: ${deliveryTime}`,
        service_type: serviceName,
        status: 'in_progress',
        progress: 0,
        start_date: new Date().toISOString(),
        budget: amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (projectError) {
      console.error('Project creation error:', projectError)
      return new Response(JSON.stringify({ error: 'Failed to create project' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        project_id: project.id,
        client_id: user.id,
        amount: amount,
        currency: 'NGN',
        status: 'paid',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError)
      // Don't return error, project was created successfully
    }

    return new Response(JSON.stringify({ 
      success: true, 
      projectId: project.id,
      invoiceId: invoice?.id 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Create project error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}