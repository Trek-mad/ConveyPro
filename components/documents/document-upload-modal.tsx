'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, X, FileText } from 'lucide-react'
import { uploadDocument } from '@/services/document.service'

interface DocumentUploadModalProps {
  matterId: string
  tenantId: string
  onClose: () => void
}

const DOCUMENT_TYPES = [
  { value: 'home_report', label: 'Home Report' },
  { value: 'financial_questionnaire', label: 'Financial Questionnaire' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'id_document', label: 'ID Document' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'mortgage_in_principle', label: 'Mortgage in Principle' },
  { value: 'survey', label: 'Survey' },
  { value: 'contract', label: 'Contract' },
  { value: 'searches', label: 'Searches' },
  { value: 'title_deed', label: 'Title Deed' },
  { value: 'other', label: 'Other' },
]

export function DocumentUploadModal({
  matterId,
  tenantId,
  onClose,
}: DocumentUploadModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    // Check file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    setFile(selectedFile)
    setError('')

    // Auto-fill title from filename if empty
    if (!title) {
      const name = selectedFile.name.replace(/\.[^/.]+$/, '') // Remove extension
      setTitle(name)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !documentType || !title) {
      setError('Please fill in all required fields')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('matterId', matterId)
      formData.append('tenantId', tenantId)
      formData.append('documentType', documentType)
      formData.append('title', title)
      if (description) {
        formData.append('description', description)
      }

      const result = await uploadDocument(formData)

      if ('error' in result) {
        setError(result.error)
        setUploading(false)
        return
      }

      // Success
      router.refresh()
      onClose()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload document')
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
            type="button"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-4 rounded-full p-1 hover:bg-gray-200"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, Word, Excel, Images (max 50MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </>
            )}
          </div>

          {/* Document Type */}
          <div>
            <Label htmlFor="documentType" className="required">
              Document Type
            </Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="required">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or description"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
