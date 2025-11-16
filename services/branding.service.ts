import { createClient as createSupabaseClient } from '@/lib/supabase/server'

export interface BrandingSettings {
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  firm_name?: string
  tagline?: string
  show_branding_on_quotes?: boolean
  show_branding_on_emails?: boolean
}

/**
 * Get branding settings for a tenant
 */
export async function getBrandingSettings(tenantId: string): Promise<BrandingSettings> {
  const supabase = await createSupabaseClient()

  const { data: settings, error } = await supabase
    .from('tenant_settings')
    .select('key, value')
    .eq('tenant_id', tenantId)
    .in('key', [
      'branding_logo_url',
      'branding_primary_color',
      'branding_secondary_color',
      'branding_accent_color',
      'branding_firm_name',
      'branding_tagline',
      'branding_show_on_quotes',
      'branding_show_on_emails',
    ])

  if (error) {
    console.error('Error fetching branding settings:', error)
    return {}
  }

  // Convert settings array to object
  const brandingSettings: BrandingSettings = {}
  settings?.forEach((setting) => {
    const key = setting.key.replace('branding_', '')
    brandingSettings[key as keyof BrandingSettings] = setting.value as any
  })

  return brandingSettings
}

/**
 * Update branding settings for a tenant
 */
export async function updateBrandingSettings(
  tenantId: string,
  settings: Partial<BrandingSettings>
) {
  const supabase = await createSupabaseClient()

  const updates = Object.entries(settings).map(([key, value]) => ({
    tenant_id: tenantId,
    key: `branding_${key}`,
    value: value as any,
  }))

  const { error } = await supabase.from('tenant_settings').upsert(updates, {
    onConflict: 'tenant_id,key',
  })

  if (error) {
    console.error('Error updating branding settings:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Upload firm logo to Supabase Storage
 */
export async function uploadFirmLogo(
  tenantId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const supabase = await createSupabaseClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${tenantId}/logo.${fileExt}`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('firm-logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true, // Replace existing file
    })

  if (error) {
    console.error('Error uploading logo:', error)
    return { error: error.message }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('firm-logos').getPublicUrl(fileName)

  // Update branding settings with new logo URL
  await updateBrandingSettings(tenantId, {
    logo_url: publicUrl,
  })

  return { url: publicUrl }
}

/**
 * Delete firm logo
 */
export async function deleteFirmLogo(
  tenantId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseClient()

  // Get current logo URL to extract filename
  const settings = await getBrandingSettings(tenantId)
  if (!settings.logo_url) {
    return { success: true }
  }

  // Extract filename from URL
  const fileName = settings.logo_url.split('/').pop()
  if (!fileName) {
    return { error: 'Invalid logo URL' }
  }

  // Delete from storage
  const { error } = await supabase.storage
    .from('firm-logos')
    .remove([`${tenantId}/${fileName}`])

  if (error) {
    console.error('Error deleting logo:', error)
    return { error: error.message }
  }

  // Remove logo URL from settings
  await supabase
    .from('tenant_settings')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('key', 'branding_logo_url')

  return { success: true }
}

/**
 * Get default color scheme
 */
export function getDefaultColors() {
  return {
    primary_color: '#2563eb', // Blue 600
    secondary_color: '#64748b', // Slate 500
    accent_color: '#8b5cf6', // Violet 500
  }
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}
