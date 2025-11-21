/**
 * Client Portal Matter View - Client Component
 * Phase 12.7 - Client Portal
 */

'use client'

import { useState } from 'react'
import type { Matter, Client } from '@/types'
import type { Database } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Home,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Pound,
  User,
  Building2,
} from 'lucide-react'
import { PortalContactForm } from './portal-contact-form'
import { PortalOfferAcceptance } from './portal-offer-acceptance'

type Tenant = Database['public']['Tables']['tenants']['Row']

interface PortalMatterViewClientProps {
  token: string
  matter: Matter
  client?: Client
  tenant?: Tenant
}

export function PortalMatterViewClient({
  token,
  matter,
  client,
  tenant,
}: PortalMatterViewClientProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Format stage name
  const stageName = matter.current_stage
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

  // Calculate progress percentage (12 stages total)
  const stageOrder = [
    'client_entry',
    'quote_check',
    'client_details',
    'financial_questionnaire',
    'financial_checks',
    'home_report',
    'establish_parameters',
    'offer_creation',
    'offer_approval',
    'client_acceptance',
    'offer_outcome',
    'conveyancing_allocation',
  ]
  const currentStageIndex = stageOrder.indexOf(matter.current_stage)
  const progressPercent = currentStageIndex >= 0 ? ((currentStageIndex + 1) / 12) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              {tenant?.branding_logo_url ? (
                <img
                  src={tenant.branding_logo_url}
                  alt={tenant.company_name || 'Logo'}
                  className="mb-4 h-12 w-auto"
                />
              ) : (
                <Building2 className="mb-4 h-12 w-12 text-primary" />
              )}
              <h1 className="text-3xl font-bold text-gray-900">Your Matter Details</h1>
              <p className="mt-1 text-lg text-gray-600">{matter.matter_number}</p>
            </div>
            <Badge
              className={
                matter.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : matter.status === 'active'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {matter.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Progress: {stageName}</span>
              <span className="text-gray-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <Home className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="contact">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Offer Acceptance Card (if pending) */}
            {(matter as any).current_offer && (
              <PortalOfferAcceptance
                token={token}
                matter={matter}
                offer={(matter as any).current_offer}
              />
            )}

            {/* Property Details */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
                <Home className="mr-2 h-5 w-5 text-primary" />
                Property Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(matter as any).property?.address_line1 && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Address</p>
                      <p className="text-gray-900">
                        {(matter as any).property.address_line1}
                        {(matter as any).property.address_line2 && <br />}
                        {(matter as any).property.address_line2}
                        <br />
                        {(matter as any).property.city}, {(matter as any).property.postcode}
                      </p>
                    </div>
                  </div>
                )}
                {matter.purchase_price && (
                  <div className="flex items-start gap-3">
                    <Pound className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Purchase Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        £{Number(matter.purchase_price).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                )}
                {matter.closing_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Proposed Closing Date</p>
                      <p className="text-gray-900">
                        {new Date(matter.closing_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {matter.instruction_date && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Instruction Date</p>
                      <p className="text-gray-900">
                        {new Date(matter.instruction_date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
                <User className="mr-2 h-5 w-5 text-primary" />
                Your Solicitor
              </h2>
              <div className="space-y-3">
                {tenant?.company_name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{tenant.company_name}</span>
                  </div>
                )}
                {tenant?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a href={`tel:${tenant.phone}`} className="text-primary hover:underline">
                      {tenant.phone}
                    </a>
                  </div>
                )}
                {tenant?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <a href={`mailto:${tenant.email}`} className="text-primary hover:underline">
                      {tenant.email}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Documents</h2>
              {(matter as any).documents && (matter as any).documents.length > 0 ? (
                <div className="space-y-3">
                  {(matter as any).documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          {doc.description && (
                            <p className="text-sm text-gray-600">{doc.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Uploaded {new Date(doc.created_at).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                      {doc.status === 'verified' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">No documents available yet</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <PortalContactForm token={token} clientName={client ? `${client.first_name} ${client.last_name}` : undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
