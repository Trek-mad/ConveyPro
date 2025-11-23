'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, FileText, Users, CheckSquare, File, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { globalSearch, type SearchResult, type SearchFilters } from '@/services/search.service'
import Link from 'next/link'

interface SearchClientProps {
  initialQuery: string
  tenantId: string
  userId: string
}

export default function SearchClient({ initialQuery, tenantId, userId }: SearchClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [mattersCount, setMattersCount] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)
  const [tasksCount, setTasksCount] = useState(0)
  const [documentsCount, setDocumentsCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'all' | 'matter' | 'client' | 'task' | 'document'>('all')
  const [filters, setFilters] = useState<SearchFilters>({})

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotalCount(0)
      return
    }

    setLoading(true)

    try {
      const searchFilters: SearchFilters = {
        ...filters,
        entity_types: activeTab === 'all' ? undefined : [activeTab]
      }

      const response = await globalSearch(searchQuery, tenantId, searchFilters)

      if (response.success && response.data) {
        setResults(response.data.results)
        setTotalCount(response.data.total_count)
        setMattersCount(response.data.matters_count)
        setClientsCount(response.data.clients_count)
        setTasksCount(response.data.tasks_count)
        setDocumentsCount(response.data.documents_count)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      performSearch(query)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setTotalCount(0)
    router.push('/search')
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'matter':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'client':
        return <Users className="h-5 w-5 text-green-500" />
      case 'task':
        return <CheckSquare className="h-5 w-5 text-orange-500" />
      case 'document':
        return <File className="h-5 w-5 text-purple-500" />
      default:
        return null
    }
  }

  const renderResult = (result: SearchResult) => {
    switch (result.entity_type) {
      case 'matter':
        return (
          <Link
            key={result.id}
            href={`/purchase-matters/${result.id}`}
            className="block hover:bg-gray-50 transition-colors"
          >
            <Card className="mb-3">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getEntityIcon('matter')}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {highlightText(result.matter_number, query)}
                      </h3>
                      <Badge variant="outline">{result.status}</Badge>
                      {result.stage_name && (
                        <Badge variant="secondary">{result.stage_name}</Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">
                      {highlightText(result.property_address, query)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Client: {result.client_name}</span>
                      {result.fee_earner_name && (
                        <span>Fee Earner: {result.fee_earner_name}</span>
                      )}
                      {result.purchase_price && (
                        <span>£{result.purchase_price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )

      case 'client':
        return (
          <Card key={result.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getEntityIcon('client')}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {highlightText(`${result.first_name} ${result.last_name}`, query)}
                  </h3>
                  <div className="flex flex-col gap-1 text-sm text-gray-500">
                    {result.email && (
                      <span>{highlightText(result.email, query)}</span>
                    )}
                    {result.phone && <span>{result.phone}</span>}
                    {result.mobile && <span>{result.mobile}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'task':
        return (
          <Card key={result.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getEntityIcon('task')}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {highlightText(result.title, query)}
                    </h3>
                    <Badge variant="outline">{result.status}</Badge>
                  </div>
                  {result.description && (
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {highlightText(result.description, query)}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Matter: {result.matter_number}</span>
                    {result.assigned_to_name && (
                      <span>Assigned to: {result.assigned_to_name}</span>
                    )}
                    {result.due_date && (
                      <span>Due: {new Date(result.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'document':
        return (
          <Card key={result.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getEntityIcon('document')}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {highlightText(result.file_name, query)}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Badge variant="secondary">{result.document_type}</Badge>
                    <span>Matter: {result.matter_number}</span>
                    <span>{(result.file_size / 1024).toFixed(1)} KB</span>
                    {result.uploaded_by_name && (
                      <span>Uploaded by: {result.uploaded_by_name}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const filteredResults = activeTab === 'all'
    ? results
    : results.filter(r => r.entity_type === activeTab)

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle>Search ConveyPro</CardTitle>
          <CardDescription>
            Search across matters, clients, tasks, and documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by matter number, property address, client name, task title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Count & Tabs */}
      {totalCount > 0 && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold">{totalCount}</span> results for &quot;{query}&quot;
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">
                All ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="matter">
                <FileText className="h-4 w-4 mr-1" />
                Matters ({mattersCount})
              </TabsTrigger>
              <TabsTrigger value="client">
                <Users className="h-4 w-4 mr-1" />
                Clients ({clientsCount})
              </TabsTrigger>
              <TabsTrigger value="task">
                <CheckSquare className="h-4 w-4 mr-1" />
                Tasks ({tasksCount})
              </TabsTrigger>
              <TabsTrigger value="document">
                <File className="h-4 w-4 mr-1" />
                Documents ({documentsCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-3">
                {filteredResults.map(result => renderResult(result))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* No Results */}
      {!loading && query && totalCount === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-500">
              Try adjusting your search query or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !query && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Start searching</h3>
            <p className="text-gray-500">
              Enter a search term to find matters, clients, tasks, or documents
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
