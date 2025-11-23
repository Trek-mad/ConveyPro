'use client'

import { useState, useEffect } from 'react'
import { Download, Filter, Search, X, FileText, Loader2, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  getActivities,
  getActivityTypes,
  getUserActivitySummary,
  exportActivitiesToCSV,
  type ActivityLog,
  type UserActivitySummary
} from '@/services/activity-log.service'
import ActivityTimeline from './activity-timeline'
import { exportToCSV } from '@/lib/utils/csv'

interface GlobalActivityLogViewerProps {
  tenantId: string
  userId: string
}

export default function GlobalActivityLogViewer({ tenantId, userId }: GlobalActivityLogViewerProps) {
  const { toast } = useToast()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [userSummaries, setUserSummaries] = useState<UserActivitySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activityTypes, setActivityTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadActivities()
    loadActivityTypes()
    loadUserSummaries()
  }, [])

  useEffect(() => {
    loadActivities()
  }, [searchQuery, selectedType, selectedUser, dateFrom, dateTo])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const filters: any = {}

      if (selectedType !== 'all') filters.activity_type = selectedType
      if (selectedUser !== 'all') filters.user_id = selectedUser
      if (dateFrom) filters.date_from = dateFrom
      if (dateTo) filters.date_to = dateTo
      if (searchQuery.trim()) filters.search_query = searchQuery

      const result = await getActivities(tenantId, filters, 100)

      if (result.success && result.data) {
        setActivities(result.data.activities)
        setTotalCount(result.data.total_count)
        setHasMore(result.data.has_more)
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

  const loadUserSummaries = async () => {
    const result = await getUserActivitySummary(tenantId)
    if (result.success && result.data) {
      setUserSummaries(result.data)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedUser('all')
    setDateFrom('')
    setDateTo('')
  }

  const handleExport = async () => {
    try {
      const filters: any = {}
      if (selectedType !== 'all') filters.activity_type = selectedType
      if (selectedUser !== 'all') filters.user_id = selectedUser
      if (dateFrom) filters.date_from = dateFrom
      if (dateTo) filters.date_to = dateTo

      const result = await exportActivitiesToCSV(tenantId, filters)

      if (result.success && result.data) {
        const exportData = result.data.map(a => ({
          date: new Date(a.created_at).toLocaleString(),
          user: a.user_name || 'Unknown',
          activity_type: a.activity_type,
          description: a.description,
          matter_number: a.matter_number || 'N/A'
        }))

        const csv = exportToCSV(exportData, 'activity-log')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`
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
    selectedUser !== 'all' ? selectedUser : null,
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
                Complete audit trail across all matters and users
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
                disabled={loading || activities.length === 0}
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <label className="text-sm font-medium mb-2 block">User</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {userSummaries.map(user => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="users">User Summary</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Activity Timeline
                <Badge variant="secondary">{totalCount}</Badge>
              </CardTitle>
              <CardDescription>
                Showing {activities.length} of {totalCount} activities
                {hasMore && ' (showing first 100)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : activities.length === 0 ? (
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
                <ActivityTimeline activities={activities} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Summary Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Activity Summary
              </CardTitle>
              <CardDescription>Activity breakdown by user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userSummaries.map((user) => (
                  <div key={user.user_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{user.user_name}</h3>
                        <p className="text-sm text-gray-500">{user.user_email}</p>
                      </div>
                      <Badge variant="secondary">
                        {user.total_activities} activities
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.activity_types.slice(0, 5).map(({ type, count }) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {formatActivityType(type)}: {count}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last activity: {new Date(user.last_activity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
