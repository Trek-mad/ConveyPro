import { Suspense } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Pricing | ConveyPro',
  description: 'Simple, transparent pricing for conveyancing quote automation',
}

async function PricingContent() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/plans`, {
    cache: 'no-store',
  })

  const { plans } = await response.json()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose the perfect plan for your firm. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {plans && plans.map((plan: any) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.is_popular ? 'border-blue-500 border-2 shadow-lg' : ''
            }`}
          >
            {plan.is_popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">£{plan.price_monthly}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-500">
                or £{plan.price_yearly}/year (save £{(plan.price_monthly * 12 - plan.price_yearly).toFixed(0)})
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button className="w-full" variant={plan.is_popular ? 'default' : 'outline'}>
                Start Free Trial
              </Button>

              <div className="space-y-2">
                {plan.features && typeof plan.features === 'string'
                  ? JSON.parse(plan.features).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))
                  : plan.features?.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
              </div>

              {plan.max_users && (
                <div className="pt-4 border-t text-sm text-gray-600">
                  <p>• Up to {plan.max_users} users</p>
                  {plan.max_quotes_per_month && (
                    <p>• {plan.max_quotes_per_month} quotes/month</p>
                  )}
                  {plan.max_clients && <p>• {plan.max_clients} clients</p>}
                  {plan.max_email_sends_per_month && (
                    <p>• {plan.max_email_sends_per_month} emails/month</p>
                  )}
                </div>
              )}

              {!plan.max_users && (
                <div className="pt-4 border-t text-sm text-gray-600">
                  <p>• Unlimited users</p>
                  <p>• Unlimited quotes</p>
                  <p>• Unlimited clients</p>
                  <p>• Unlimited emails</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          All plans include
        </h2>
        <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">14-day free trial</h3>
            <p className="text-sm text-gray-600">No credit card required</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">Cancel anytime</h3>
            <p className="text-sm text-gray-600">No long-term contracts</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">Email support</h3>
            <p className="text-sm text-gray-600">Fast, friendly help</p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-600">
          Need a custom plan?{' '}
          <a href="/demo" className="text-blue-600 hover:underline">
            Contact sales
          </a>
        </p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  )
}
