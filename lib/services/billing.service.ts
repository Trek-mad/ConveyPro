// =====================================================
// PHASE 11: BILLING & SUBSCRIPTIONS SERVICE
// =====================================================

import { createClient } from '@/lib/supabase/server'
import type {
  SubscriptionPlan,
  TenantSubscription,
  PaymentMethod,
  Invoice,
  UsageEvent,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  BillingDashboardData,
} from '@/lib/types/go-to-market'

// =====================================================
// SUBSCRIPTION PLANS
// =====================================================

export async function getSubscriptionPlans() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    return { error: error.message, plans: [] }
  }

  return { plans: data as SubscriptionPlan[], error: null }
}

export async function getSubscriptionPlan(planId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single()

  if (error) {
    return { error: error.message, plan: null }
  }

  return { plan: data as SubscriptionPlan, error: null }
}

// =====================================================
// TENANT SUBSCRIPTIONS
// =====================================================

export async function getTenantSubscription(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenant_subscriptions')
    .select(`
      *,
      plan:plan_id (*)
    `)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    return { error: error.message, subscription: null }
  }

  return { subscription: data as any, error: null }
}

export async function createSubscription(
  tenantId: string,
  data: CreateSubscriptionRequest
) {
  const supabase = await createClient()

  // In production, this would create a Stripe subscription first
  // For now, create the database record

  const periodStart = new Date()
  const periodEnd = new Date()

  if (data.billing_cycle === 'monthly') {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  }

  const { data: subscription, error } = await supabase
    .from('tenant_subscriptions')
    .insert({
      tenant_id: tenantId,
      plan_id: data.plan_id,
      billing_cycle: data.billing_cycle,
      status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, subscription: null }
  }

  return { subscription: subscription as TenantSubscription, error: null }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: UpdateSubscriptionRequest
) {
  const supabase = await createClient()

  // In production, this would update the Stripe subscription first

  const { data: subscription, error } = await supabase
    .from('tenant_subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single()

  if (error) {
    return { error: error.message, subscription: null }
  }

  return { subscription: subscription as TenantSubscription, error: null }
}

export async function cancelSubscription(subscriptionId: string) {
  const supabase = await createClient()

  // In production, cancel Stripe subscription first

  const { data, error } = await supabase
    .from('tenant_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single()

  if (error) {
    return { error: error.message, subscription: null }
  }

  return { subscription: data as TenantSubscription, error: null }
}

// =====================================================
// PAYMENT METHODS
// =====================================================

export async function getPaymentMethods(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('is_default', { ascending: false })

  if (error) {
    return { error: error.message, payment_methods: [] }
  }

  return { payment_methods: data as PaymentMethod[], error: null }
}

export async function addPaymentMethod(
  tenantId: string,
  data: CreatePaymentMethodRequest
) {
  const supabase = await createClient()

  // In production, attach payment method to Stripe customer first

  // If setting as default, unset other defaults
  if (data.set_as_default) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('tenant_id', tenantId)
  }

  const { data: paymentMethod, error } = await supabase
    .from('payment_methods')
    .insert({
      tenant_id: tenantId,
      stripe_payment_method_id: data.stripe_payment_method_id,
      type: 'card', // Would come from Stripe
      last4: '4242', // Would come from Stripe
      brand: 'Visa', // Would come from Stripe
      is_default: data.set_as_default || false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, payment_method: null }
  }

  return { payment_method: paymentMethod as PaymentMethod, error: null }
}

export async function deletePaymentMethod(paymentMethodId: string) {
  const supabase = await createClient()

  // In production, detach from Stripe first

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// INVOICES
// =====================================================

export async function getInvoices(tenantId: string, limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('invoice_date', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message, invoices: [] }
  }

  return { invoices: data as unknown as Invoice[], error: null }
}

export async function getInvoice(invoiceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (error) {
    return { error: error.message, invoice: null }
  }

  return { invoice: data as unknown as Invoice, error: null }
}

// =====================================================
// USAGE TRACKING
// =====================================================

export async function trackUsage(
  tenantId: string,
  subscriptionId: string,
  eventType: 'quote_created' | 'email_sent' | 'user_added' | 'client_added',
  quantity: number = 1,
  metadata?: Record<string, any>
) {
  const supabase = await createClient()

  // Insert usage event
  const { error: eventError } = await supabase
    .from('usage_events')
    .insert({
      tenant_id: tenantId,
      subscription_id: subscriptionId,
      event_type: eventType,
      quantity,
      metadata: metadata || {},
    })

  if (eventError) {
    console.error('Error tracking usage:', eventError)
  }

  // TODO: Update subscription usage counter
  // Note: Supabase JS client doesn't support raw SQL in updates
  // This should be implemented using RPC or fetch-then-update
  /*
  if (eventType === 'quote_created') {
    await supabase.rpc('increment_quotes_used', { subscription_id: subscriptionId })
  } else if (eventType === 'email_sent') {
    await supabase.rpc('increment_emails_sent', { subscription_id: subscriptionId })
  }
  */

  return { error: null }
}

export async function getUsageStats(tenantId: string, subscriptionId: string) {
  const supabase = await createClient()

  const { data: subscription, error } = await supabase
    .from('tenant_subscriptions')
    .select(`
      quotes_used_this_period,
      emails_sent_this_period,
      plan:plan_id (
        max_quotes_per_month,
        max_email_sends_per_month
      )
    `)
    .eq('id', subscriptionId)
    .single()

  if (error) {
    return { error: error.message, usage: null }
  }

  return {
    usage: {
      quotes_used: subscription.quotes_used_this_period,
      emails_sent: subscription.emails_sent_this_period,
      quotes_limit: (subscription.plan as any)?.max_quotes_per_month,
      emails_limit: (subscription.plan as any)?.max_email_sends_per_month,
    },
    error: null,
  }
}

// =====================================================
// BILLING DASHBOARD
// =====================================================

export async function getBillingDashboard(tenantId: string) {
  const supabase = await createClient()

  // Get subscription with plan
  const { subscription } = await getTenantSubscription(tenantId)

  // Get payment methods
  const { payment_methods } = await getPaymentMethods(tenantId)

  // Get recent invoices
  const { invoices } = await getInvoices(tenantId, 5)

  // Get usage stats
  let usage = null
  if (subscription) {
    const { usage: usageData } = await getUsageStats(tenantId, subscription.id)
    usage = usageData
  }

  const dashboard: BillingDashboardData = {
    subscription: subscription || undefined,
    plan: subscription?.plan,
    payment_methods,
    recent_invoices: invoices,
    usage_this_period: usage || {
      quotes_used: 0,
      emails_sent: 0,
    },
  }

  return { dashboard, error: null }
}

// =====================================================
// STRIPE INTEGRATION (Placeholder)
// =====================================================

// These functions would integrate with Stripe in production

export async function createStripeCustomer(tenantId: string, email: string) {
  // In production: const customer = await stripe.customers.create({ email, metadata: { tenant_id: tenantId } })
  return { customer_id: 'cus_placeholder', error: null }
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string
) {
  // In production: const subscription = await stripe.subscriptions.create({ customer: customerId, items: [{ price: priceId }] })
  return { subscription_id: 'sub_placeholder', error: null }
}

export async function createStripeCheckoutSession(
  tenantId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  // In production: const session = await stripe.checkout.sessions.create({ ... })
  return {
    session_url: `${successUrl}?session_id=placeholder`,
    error: null,
  }
}

export async function createStripeBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  // In production: const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl })
  return { portal_url: returnUrl, error: null }
}
