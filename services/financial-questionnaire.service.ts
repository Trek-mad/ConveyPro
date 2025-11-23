// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type {
  FinancialQuestionnaire,
  FinancialQuestionnaireInsert,
  FinancialQuestionnaireUpdate,
} from '@/types'

/**
 * Create a financial questionnaire
 */
export async function createFinancialQuestionnaire(
  data: Omit<FinancialQuestionnaireInsert, 'id'>
): Promise<{ questionnaire: FinancialQuestionnaire } | { error: string }> {
  try {
    const user = await requireAuth()
    const canCreate = await hasRole(data.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canCreate) {
      return { error: 'Unauthorized to create questionnaires' }
    }

    const supabase = await createClient()

    const { data: questionnaire, error } = await supabase
      .from('financial_questionnaires')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating questionnaire:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${data.matter_id}`)
    return { questionnaire }
  } catch (error) {
    console.error('Unexpected error in createFinancialQuestionnaire:', error)
    return { error: 'Failed to create questionnaire' }
  }
}

/**
 * Get questionnaire for a matter and client
 */
export async function getFinancialQuestionnaire(
  matterId: string,
  clientId: string
): Promise<{ questionnaire: FinancialQuestionnaire | null } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { data: questionnaire, error } = await supabase
      .from('financial_questionnaires')
      .select('*')
      .eq('matter_id', matterId)
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching questionnaire:', error)
      return { error: error.message }
    }

    return { questionnaire: questionnaire || null }
  } catch (error) {
    console.error('Unexpected error in getFinancialQuestionnaire:', error)
    return { error: 'Failed to fetch questionnaire' }
  }
}

/**
 * Update financial questionnaire
 */
export async function updateFinancialQuestionnaire(
  questionnaireId: string,
  updates: FinancialQuestionnaireUpdate
): Promise<{ questionnaire: FinancialQuestionnaire } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing questionnaire
    const { data: existing, error: fetchError } = await supabase
      .from('financial_questionnaires')
      .select('tenant_id, matter_id')
      .eq('id', questionnaireId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Questionnaire not found' }
    }

    const canUpdate = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized to update questionnaires' }
    }

    const { data: questionnaire, error } = await supabase
      .from('financial_questionnaires')
      .update(updates)
      .eq('id', questionnaireId)
      .select()
      .single()

    if (error) {
      console.error('Error updating questionnaire:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { questionnaire }
  } catch (error) {
    console.error('Unexpected error in updateFinancialQuestionnaire:', error)
    return { error: 'Failed to update questionnaire' }
  }
}

/**
 * Complete financial questionnaire (mark as completed)
 */
export async function completeFinancialQuestionnaire(
  questionnaireId: string
): Promise<{ questionnaire: FinancialQuestionnaire } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing questionnaire
    const { data: existing, error: fetchError } = await supabase
      .from('financial_questionnaires')
      .select('tenant_id, matter_id')
      .eq('id', questionnaireId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Questionnaire not found' }
    }

    const canComplete = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canComplete) {
      return { error: 'Unauthorized' }
    }

    const { data: questionnaire, error } = await supabase
      .from('financial_questionnaires')
      .update({
        completed_at: new Date().toISOString(),
        completed_by: user.id,
      })
      .eq('id', questionnaireId)
      .select()
      .single()

    if (error) {
      console.error('Error completing questionnaire:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { questionnaire }
  } catch (error) {
    console.error('Unexpected error in completeFinancialQuestionnaire:', error)
    return { error: 'Failed to complete questionnaire' }
  }
}

/**
 * Calculate affordability based on questionnaire data
 */
export async function calculateAffordability(
  questionnaireId: string
): Promise<
  | {
      affordable: boolean
      total_income: number
      total_assets: number
      total_liabilities: number
      available_deposit: number
      total_needed: number
      shortfall: number
      warnings: string[]
    }
  | { error: string }
> {
  try {
    await requireAuth()
    const supabase = await createClient()

    // Get questionnaire data
    const { data: questionnaire, error } = await supabase
      .from('financial_questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .single()

    if (error || !questionnaire) {
      return { error: 'Questionnaire not found' }
    }

    // Get matter purchase price
    const { data: matter } = await supabase
      .from('matters')
      .select('purchase_price')
      .eq('id', questionnaire.matter_id)
      .single()

    const purchasePrice = matter?.purchase_price || 0

    // Calculate totals
    const totalIncome =
      (questionnaire.annual_income || 0) +
      (questionnaire.additional_income_amount || 0)

    const totalAssets =
      (questionnaire.savings_amount || 0) +
      (questionnaire.investments_amount || 0) +
      (questionnaire.other_assets_value || 0) +
      (questionnaire.expected_sale_proceeds || 0)

    const totalLiabilities =
      (questionnaire.existing_mortgage_balance || 0) +
      (questionnaire.credit_card_debt || 0) +
      (questionnaire.loan_debts || 0) +
      (questionnaire.other_liabilities_amount || 0)

    const availableDeposit = questionnaire.deposit_amount || 0
    const mortgageRequired = questionnaire.mortgage_amount_required || 0
    const totalNeeded = purchasePrice - mortgageRequired
    const shortfall = totalNeeded - availableDeposit

    // Generate warnings
    const warnings: string[] = []

    if (shortfall > 0) {
      warnings.push(`Deposit shortfall of £${shortfall.toLocaleString('en-GB')}`)
    }

    if (totalLiabilities > totalIncome * 0.5) {
      warnings.push('High debt-to-income ratio (>50%)')
    }

    if (questionnaire.mortgage_required && !questionnaire.mortgage_in_principle) {
      warnings.push('No mortgage in principle obtained')
    }

    if (questionnaire.selling_property && questionnaire.sale_status === 'not_started') {
      warnings.push('Property sale not yet started')
    }

    if (questionnaire.ads_applicable) {
      warnings.push('Additional Dwelling Supplement (8%) will apply')
    }

    const affordable = shortfall <= 0

    return {
      affordable,
      total_income: totalIncome,
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      available_deposit: availableDeposit,
      total_needed: totalNeeded,
      shortfall,
      warnings,
    }
  } catch (error) {
    console.error('Unexpected error in calculateAffordability:', error)
    return { error: 'Failed to calculate affordability' }
  }
}

/**
 * Verify financial questionnaire (solicitor approval)
 */
export async function verifyFinancialQuestionnaire(
  questionnaireId: string
): Promise<{ questionnaire: FinancialQuestionnaire } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing questionnaire
    const { data: existing, error: fetchError } = await supabase
      .from('financial_questionnaires')
      .select('tenant_id, matter_id')
      .eq('id', questionnaireId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Questionnaire not found' }
    }

    const canVerify = await hasRole(existing.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canVerify) {
      return { error: 'Unauthorized to verify questionnaires' }
    }

    const { data: questionnaire, error } = await supabase
      .from('financial_questionnaires')
      .update({
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq('id', questionnaireId)
      .select()
      .single()

    if (error) {
      console.error('Error verifying questionnaire:', error)
      return { error: error.message }
    }

    revalidatePath(`/matters/${existing.matter_id}`)
    return { questionnaire }
  } catch (error) {
    console.error('Unexpected error in verifyFinancialQuestionnaire:', error)
    return { error: 'Failed to verify questionnaire' }
  }
}
