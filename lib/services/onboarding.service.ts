// =====================================================
// PHASE 11: ONBOARDING SERVICE
// =====================================================

import { createClient } from '@/lib/supabase/server'
import type {
  TenantOnboarding,
  OnboardingWalkthrough,
  UpdateOnboardingRequest,
  OnboardingProgress,
} from '@/lib/types/go-to-market'

// =====================================================
// TENANT ONBOARDING
// =====================================================

export async function getTenantOnboarding(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenant_onboarding')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    // If not found, create initial onboarding record
    if (error.code === 'PGRST116') {
      return await createTenantOnboarding(tenantId)
    }
    return { error: error.message, onboarding: null }
  }

  return { onboarding: data as TenantOnboarding, error: null }
}

export async function createTenantOnboarding(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenant_onboarding')
    .insert({
      tenant_id: tenantId,
      current_step: 1,
      success_score: 0,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, onboarding: null }
  }

  return { onboarding: data as TenantOnboarding, error: null }
}

export async function updateTenantOnboarding(
  tenantId: string,
  updates: UpdateOnboardingRequest
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenant_onboarding')
    .update(updates)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) {
    return { error: error.message, onboarding: null }
  }

  // Calculate success score
  const onboarding = data as TenantOnboarding
  const score = calculateSuccessScore(onboarding)

  // Update score if changed
  if (score !== onboarding.success_score) {
    await supabase
      .from('tenant_onboarding')
      .update({ success_score: score })
      .eq('tenant_id', tenantId)
  }

  return { onboarding: { ...onboarding, success_score: score }, error: null }
}

export async function completeOnboardingStep(
  tenantId: string,
  stepId: string
) {
  const supabase = await createClient()

  // Get current onboarding
  const { data: onboarding } = await supabase
    .from('tenant_onboarding')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (!onboarding) {
    return { error: 'Onboarding not found', onboarding: null }
  }

  const typedOnboarding = onboarding as TenantOnboarding
  const completedSteps = typedOnboarding.completed_steps || []

  // Add step if not already completed
  if (!completedSteps.includes(stepId)) {
    completedSteps.push(stepId)

    const { data, error } = await supabase
      .from('tenant_onboarding')
      .update({
        completed_steps: completedSteps,
        current_step: Math.min(typedOnboarding.current_step + 1, 10),
      })
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      return { error: error.message, onboarding: null }
    }

    return { onboarding: data as TenantOnboarding, error: null }
  }

  return { onboarding: typedOnboarding, error: null }
}

export async function updateChecklistItem(
  tenantId: string,
  itemKey: keyof TenantOnboarding['checklist'],
  completed: boolean
) {
  const supabase = await createClient()

  // Get current checklist
  const { data: onboarding } = await supabase
    .from('tenant_onboarding')
    .select('checklist')
    .eq('tenant_id', tenantId)
    .single()

  if (!onboarding) {
    return { error: 'Onboarding not found', onboarding: null }
  }

  const checklist = (onboarding as any).checklist
  checklist[itemKey] = completed

  const { data, error } = await supabase
    .from('tenant_onboarding')
    .update({ checklist })
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) {
    return { error: error.message, onboarding: null }
  }

  return { onboarding: data as TenantOnboarding, error: null }
}

function calculateSuccessScore(onboarding: TenantOnboarding): number {
  let score = 0

  // Completed steps (40 points max)
  score += (onboarding.completed_steps?.length || 0) * 5

  // Checklist items (60 points max, 10 per item)
  const checklist = onboarding.checklist
  if (checklist.profile_completed) score += 10
  if (checklist.team_invited) score += 10
  if (checklist.first_quote_created) score += 10
  if (checklist.branding_customized) score += 10
  if (checklist.form_created) score += 10
  if (checklist.campaign_created) score += 10

  return Math.min(score, 100)
}

// =====================================================
// ONBOARDING WALKTHROUGHS
// =====================================================

export async function getOnboardingWalkthroughs() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('onboarding_walkthroughs')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    return { error: error.message, walkthroughs: [] }
  }

  return { walkthroughs: data as unknown as OnboardingWalkthrough[], error: null }
}

export async function getOnboardingWalkthrough(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('onboarding_walkthroughs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    return { error: error.message, walkthrough: null }
  }

  return { walkthrough: data as unknown as OnboardingWalkthrough, error: null }
}

// =====================================================
// ONBOARDING PROGRESS
// =====================================================

export async function getOnboardingProgress(tenantId: string) {
  const { onboarding, error } = await getTenantOnboarding(tenantId)

  if (error || !onboarding) {
    return { error: error || 'Onboarding not found', progress: null }
  }

  // Define next steps based on current progress
  const nextSteps = getNextSteps(onboarding)

  // Calculate progress percentage
  const totalSteps = 6 // Number of checklist items
  const completedSteps = Object.values(onboarding.checklist).filter(
    (v) => v === true
  ).length
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

  const progress: OnboardingProgress = {
    onboarding,
    next_steps: nextSteps,
    progress_percentage: progressPercentage,
  }

  return { progress, error: null }
}

function getNextSteps(onboarding: TenantOnboarding) {
  const steps = []

  if (!onboarding.checklist.profile_completed) {
    steps.push({
      id: 'complete_profile',
      title: 'Complete Your Profile',
      description: 'Add your firm details and branding',
      action: '/settings/firm',
      order: 1,
    })
  }

  if (!onboarding.checklist.team_invited) {
    steps.push({
      id: 'invite_team',
      title: 'Invite Your Team',
      description: 'Add team members to collaborate',
      action: '/team',
      order: 2,
    })
  }

  if (!onboarding.checklist.first_quote_created) {
    steps.push({
      id: 'create_first_quote',
      title: 'Create Your First Quote',
      description: 'Generate your first conveyancing quote',
      action: '/quotes/new',
      order: 3,
    })
  }

  if (!onboarding.checklist.branding_customized) {
    steps.push({
      id: 'customize_branding',
      title: 'Customize Your Branding',
      description: 'Upload logo and set brand colors',
      action: '/settings/branding',
      order: 4,
    })
  }

  if (!onboarding.checklist.form_created) {
    steps.push({
      id: 'create_form',
      title: 'Create a Quote Form',
      description: 'Build a custom quote form for your website',
      action: '/admin/forms/new',
      order: 5,
    })
  }

  if (!onboarding.checklist.campaign_created) {
    steps.push({
      id: 'create_campaign',
      title: 'Set Up a Campaign',
      description: 'Create your first email campaign',
      action: '/campaigns/new',
      order: 6,
    })
  }

  return steps.slice(0, 3) // Return top 3 next steps
}

// =====================================================
// SAMPLE DATA GENERATION
// =====================================================

export async function generateSampleData(tenantId: string) {
  const supabase = await createClient()

  // Mark sample data as generated
  await supabase
    .from('tenant_onboarding')
    .update({ sample_data_generated: true })
    .eq('tenant_id', tenantId)

  // In production, this would create:
  // - 5 sample clients
  // - 10 sample quotes
  // - 3 sample campaigns
  // - Sample form templates

  return { error: null }
}
