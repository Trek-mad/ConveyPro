import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientAcceptancePortal } from '@/components/offers/client-acceptance-portal'

export const metadata: Metadata = {
  title: 'Accept Offer | ConveyPro',
  description: 'Review and accept your property offer',
}

interface PageProps {
  params: Promise<{
    token: string
    offerId: string
  }>
}

export default async function ClientAcceptancePage({ params }: PageProps) {
  const { token, offerId } = await params
  const supabase = await createClient()

  // Verify token and get offer (simplified - in production you'd have a tokens table)
  // For now, we'll just fetch the offer and validate it's accessible
  const { data: offer, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .is('deleted_at', null)
    .single()

  if (error || !offer) {
    notFound()
  }

  // Get matter details
  const { data: matter } = await supabase
    .from('matters')
    .select('matter_number, properties:property_id(address_line1, address_line2, city, postcode)')
    .eq('id', offer.matter_id)
    .single()

  if (!matter) {
    notFound()
  }

  // Format property address
  let propertyAddress = ''
  const property = matter.properties as any
  if (property) {
    const parts = [
      property.address_line1,
      property.address_line2,
      property.city,
      property.postcode,
    ].filter(Boolean)
    propertyAddress = parts.join(', ')
  }

  return (
    <ClientAcceptancePortal
      offer={offer}
      matterNumber={matter.matter_number}
      propertyAddress={propertyAddress || undefined}
    />
  )
}
