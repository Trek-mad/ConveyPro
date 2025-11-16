import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { getClients } from '@/services/client.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Mail, Phone, MapPin, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Clients | ConveyPro',
  description: 'Manage your clients',
}

export default async function ClientsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Fetch clients
  const clientsResult = await getClients(membership.tenant_id)
  const clients = 'clients' in clientsResult ? clientsResult.clients : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-2 text-gray-600">
            Manage your client relationships and track opportunities
          </p>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Total Clients</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{clients.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Active This Month</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {clients.filter((c) => {
              const created = new Date(c.created_at)
              const now = new Date()
              return created.getMonth() === now.getMonth()
            }).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">First-Time Buyers</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {clients.filter((c) => c.life_stage === 'first-time-buyer').length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Investors</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {clients.filter((c) => c.life_stage === 'investor').length}
          </p>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No clients yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Add your first client to get started
            </p>
            <Link href="/clients/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Life Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {client.first_name} {client.last_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm">
                        {client.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${client.email}`}
                              className="hover:text-gray-900"
                            >
                              {client.email}
                            </a>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <a
                              href={`tel:${client.phone}`}
                              className="hover:text-gray-900"
                            >
                              {client.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {client.city && client.postcode && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {client.city}, {client.postcode}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {client.life_stage && (
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                          {client.life_stage.replace(/-/g, ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {client.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                        {(client.tags?.length || 0) > 3 && (
                          <span className="text-xs text-gray-500">
                            +{(client.tags?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
