'use client'

import { useState, useEffect } from 'react'
import { Download, Filter, Search, X, FileText, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  getMatterActivities,
  getActivityTypes,
  exportActivitiesToCSV,
  type ActivityLog
} from '@/services/activity-log.service'
import ActivityTimeline from './activity-timeline'
import { exportToCSV } from '@/services/analytics.service'

interface ActivityLogViewerProps {
  matterId: string
  tenantId: string
  matterNumber: string
  propertyAddress: string
}

export default function ActivityLogViewer({
  matterId,
  tenantId,
  matterNumber,
  propertyAddress
}: ActivityLogViewerProps) {
  const { toast } = useToast()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activityTypes, setActivityTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadActivities()
    loadActivityTypes()
  }, [matterId])

  useEffect(() => {
    applyFilters()
  }, [activities, searchQuery, selectedType, dateFrom, dateTo])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const result = await getMatterActivities(matterId, tenantId)

      if (result.success && result.data) {
        setActivities(result.data)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load activities',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load activities',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadActivityTypes = async () => {
    const result = await getActivityTypes(tenantId)
    if (result.success && result.data) {
      setActivityTypes(result.data)
    }
  }

  const applyFilters = () => {
    let filtered = [...activities]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        a =>
          a.description.toLowerCase().includes(query) ||
          a.user_name?.toLowerCase().includes(query) ||
          a.activity_type.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(a => a.activity_type === selectedType)
    }

    // Date filters
    if (dateFrom) {
      filtered = filtered.filter(a => new Date(a.created_at) >= new Date(dateFrom))
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(a => new Date(a.created_at) <= endDate)
    }

    setFilteredActivities(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setDateFrom('')
    setDateTo('')
  }

  const handleExport = async () => {
    try {
      const result = await exportActivitiesToCSV(tenantId, { matter_id: matterId })

      if (result.success && result.data) {
        const exportData = result.data.map(a => ({
          date: new Date(a.created_at).toLocaleString(),
          user: a.user_name || 'Unknown',
          activity_type: a.activity_type,
          description: a.description,
          matter_number: a.matter_number || matterNumber
        }))

        const csv = exportToCSV(exportData, 'activity-log')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `activity-log-${matterNumber}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast({
          title: 'Success',
          description: 'Activity log exported to CSV'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export activity log',
        variant: 'destructive'
      })
    }
  }

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const activeFilterCount = [
    searchQuery,
    selectedType !== 'all' ? selectedType : null,
    dateFrom,
    dateTo
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Complete audit trail for {matterNumber} - {propertyAddress}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={loading || filteredActivities.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters Panel */}
        {showFilters && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Activity Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {activityTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {formatActivityType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Timeline
            <Badge variant="secondary">{filteredActivities.length}</Badge>
          </CardTitle>
          <CardDescription>
            {filteredActivities.length === activities.length
              ? `Showing all ${activities.length} activities`
              : `Showing ${filteredActivities.length} of ${activities.length} activities`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No activities found
              </h3>
              <p className="text-gray-500">
                {activeFilterCount > 0
                  ? 'Try adjusting your filters'
                  : 'No activities have been logged yet'}
              </p>
            </div>
          ) : (
            <ActivityTimeline activities={filteredActivities} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
