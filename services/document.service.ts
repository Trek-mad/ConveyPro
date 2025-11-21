'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Document, DocumentInsert, DocumentUpdate } from '@/types'

const STORAGE_BUCKET = 'matter-documents'

/**
 * Upload a document to Supabase Storage and create metadata record
 */
export async function uploadDocument(
  formData: FormData
): Promise<{ document: Document } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Extract form data
    const file = formData.get('file') as File
    const matterId = formData.get('matterId') as string
    const tenantId = formData.get('tenantId') as string
    const documentType = formData.get('documentType') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null

    if (!file || !matterId || !tenantId || !documentType || !title) {
      return { error: 'Missing required fields' }
    }

    // Check permissions
    const canUpload = await hasRole(tenantId, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpload) {
      return { error: 'Unauthorized to upload documents' }
    }

    // Generate unique file path: tenant_id/matter_id/timestamp_filename
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${tenantId}/${matterId}/${timestamp}_${safeFileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { error: 'Failed to upload file' }
    }

    // Create document metadata record
    const documentData: DocumentInsert = {
      tenant_id: tenantId,
      document_type: documentType as any,
      title,
      description,
      matter_id: matterId,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      version: 1,
      is_latest_version: true,
      status: 'uploaded',
      uploaded_by: user.id,
      metadata: {},
    }

    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (dbError) {
      // Rollback: delete the uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      console.error('Database error:', dbError)
      return { error: dbError.message }
    }

    revalidatePath(`/matters/${matterId}`)
    return { document }
  } catch (error) {
    console.error('Unexpected error in uploadDocument:', error)
    return { error: 'Failed to upload document' }
  }
}

/**
 * Get documents for a matter
 */
export async function getDocumentsForMatter(
  matterId: string,
  filters?: {
    document_type?: string
    status?: Document['status']
  }
): Promise<{ documents: Document[] } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    let query = supabase
      .from('documents')
      .select('*')
      .eq('matter_id', matterId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters?.document_type) {
      query = query.eq('document_type', filters.document_type)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return { error: error.message }
    }

    return { documents: documents || [] }
  } catch (error) {
    console.error('Unexpected error in getDocumentsForMatter:', error)
    return { error: 'Failed to fetch documents' }
  }
}

/**
 * Get signed URL for downloading a document
 */
export async function getDocumentDownloadUrl(
  documentId: string
): Promise<{ url: string } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get document metadata
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('tenant_id, storage_path')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return { error: 'Document not found' }
    }

    // Check permissions
    const hasAccess = await hasRole(document.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
      'viewer',
    ])

    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    // Generate signed URL (valid for 1 hour)
    const { data, error: urlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(document.storage_path, 3600)

    if (urlError || !data) {
      console.error('Error creating signed URL:', urlError)
      return { error: 'Failed to generate download URL' }
    }

    return { url: data.signedUrl }
  } catch (error) {
    console.error('Unexpected error in getDocumentDownloadUrl:', error)
    return { error: 'Failed to get download URL' }
  }
}

/**
 * Verify a document
 */
export async function verifyDocument(
  documentId: string
): Promise<{ document: Document } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get document to check tenant
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('tenant_id, matter_id')
      .eq('id', documentId)
      .single()

    if (fetchError || !existingDoc) {
      return { error: 'Document not found' }
    }

    const canVerify = await hasRole(existingDoc.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canVerify) {
      return { error: 'Unauthorized to verify documents' }
    }

    const { data: document, error } = await supabase
      .from('documents')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq('id', documentId)
      .select()
      .single()

    if (error) {
      console.error('Error verifying document:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existingDoc.matter_id}`)
    return { document }
  } catch (error) {
    console.error('Unexpected error in verifyDocument:', error)
    return { error: 'Failed to verify document' }
  }
}

/**
 * Delete a document (soft delete + remove from storage)
 */
export async function deleteDocument(
  documentId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get document
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('tenant_id, matter_id, storage_path')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return { error: 'Document not found' }
    }

    const canDelete = await hasRole(document.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canDelete) {
      return { error: 'Unauthorized to delete documents' }
    }

    // Soft delete in database
    const { error: dbError } = await supabase
      .from('documents')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (dbError) {
      console.error('Error deleting document:', dbError)
      return { error: dbError.message }
    }

    // Remove from storage (optional - could keep for recovery)
    await supabase.storage.from(STORAGE_BUCKET).remove([document.storage_path])

    revalidatePath(`/matters/${document.matter_id}`)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteDocument:', error)
    return { error: 'Failed to delete document' }
  }
}

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string,
  updates: DocumentUpdate
): Promise<{ document: Document } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing document
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('tenant_id, matter_id')
      .eq('id', documentId)
      .single()

    if (fetchError || !existingDoc) {
      return { error: 'Document not found' }
    }

    const canUpdate = await hasRole(existingDoc.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized to update documents' }
    }

    const { data: document, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating document:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existingDoc.matter_id}`)
    return { document }
  } catch (error) {
    console.error('Unexpected error in updateDocument:', error)
    return { error: 'Failed to update document' }
  }
}
