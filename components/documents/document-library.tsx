'use client'

import { useState } from 'react'
import { Document } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  CheckCircle,
  Trash2,
  Upload,
  Filter,
  Grid,
  List,
  Search,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  getDocumentDownloadUrl,
  verifyDocument,
  deleteDocument,
} from '@/services/document.service'
import { useRouter } from 'next/navigation'
import { DocumentUploadModal } from './document-upload-modal'
import { formatDistanceToNow } from 'date-fns'

interface DocumentLibraryProps {
  documents: Document[]
  matterId: string
  tenantId: string
  canManage?: boolean
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  home_report: 'Home Report',
  financial_questionnaire: 'Financial Questionnaire',
  offer_letter: 'Offer Letter',
  id_document: 'ID Document',
  bank_statement: 'Bank Statement',
  mortgage_in_principle: 'Mortgage in Principle',
  survey: 'Survey',
  contract: 'Contract',
  searches: 'Searches',
  title_deed: 'Title Deed',
  other: 'Other',
}

export function DocumentLibrary({
  documents,
  matterId,
  tenantId,
  canManage = false,
}: DocumentLibraryProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesType = filterType === 'all' || doc.document_type === filterType
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleDownload = async (documentId: string, fileName: string) => {
    setDownloadingId(documentId)
    try {
      const result = await getDocumentDownloadUrl(documentId)

      if ('error' in result) {
        alert(result.error)
        return
      }

      // Trigger download
      const link = document.createElement('a')
      link.href = result.url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download document')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleVerify = async (documentId: string) => {
    if (!confirm('Verify this document as approved?')) return

    setVerifyingId(documentId)
    try {
      const result = await verifyDocument(documentId)

      if ('error' in result) {
        alert(result.error)
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Verify error:', error)
      alert('Failed to verify document')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleDelete = async (documentId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return

    setDeletingId(documentId)
    try {
      const result = await deleteDocument(documentId)

      if ('error' in result) {
        alert(result.error)
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: Document['status']) => {
    const variants: Record<Document['status'], string> = {
      uploaded: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
    }
    return (
      <Badge className={variants[status]}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileText className="h-5 w-5 text-purple-600" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-600" />
    } else {
      return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  if (documents.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No documents uploaded
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by uploading your first document
          </p>
          {canManage && (
            <Button
              className="mt-4"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>

        {showUploadModal && (
          <DocumentUploadModal
            matterId={matterId}
            tenantId={tenantId}
            onClose={() => setShowUploadModal(false)}
          />
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Documents ({documents.length})
        </h3>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          {canManage && (
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document List/Grid */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon(doc.mime_type || 'application/octet-stream')}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{doc.title}</h4>
                      {getStatusBadge(doc.status)}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span>{DOCUMENT_TYPE_LABELS[doc.document_type]}</span>
                      <span>•</span>
                      <span>
                        {((doc.file_size || 0) / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(doc.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.file_name)}
                    disabled={downloadingId === doc.id}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {downloadingId === doc.id ? 'Downloading...' : 'Download'}
                  </Button>

                  {canManage && doc.status !== 'verified' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(doc.id)}
                      disabled={verifyingId === doc.id}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {verifyingId === doc.id ? 'Verifying...' : 'Verify'}
                    </Button>
                  )}

                  {canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.title)}
                      disabled={deletingId === doc.id}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  {getFileIcon(doc.mime_type || 'application/octet-stream')}
                  {getStatusBadge(doc.status)}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">{doc.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {DOCUMENT_TYPE_LABELS[doc.document_type]}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {((doc.file_size || 0) / 1024 / 1024).toFixed(2)} MB •{' '}
                    {formatDistanceToNow(new Date(doc.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {doc.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="flex flex-col gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.file_name)}
                    disabled={downloadingId === doc.id}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {downloadingId === doc.id ? 'Downloading...' : 'Download'}
                  </Button>

                  {canManage && (
                    <div className="flex gap-2">
                      {doc.status !== 'verified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleVerify(doc.id)}
                          disabled={verifyingId === doc.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        disabled={deletingId === doc.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            No documents found matching your filters
          </p>
        </Card>
      )}

      {showUploadModal && (
        <DocumentUploadModal
          matterId={matterId}
          tenantId={tenantId}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  )
}
