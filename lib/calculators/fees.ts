/**
 * Conveyancing Fee Calculator
 * Calculates legal fees, disbursements, and VAT
 */

import type { Json } from '@/types/database'

export interface FeeBreakdownItem {
  description: string
  amount: number
  isVatable: boolean
  category: 'legal_fee' | 'disbursement' | 'other'
}

export interface FeeCalculation {
  baseFee: number
  disbursements: number
  subtotal: number
  vat: number
  total: number
  breakdown: FeeBreakdownItem[]
  transactionValue: number
  transactionType: string
}

export interface FeeStructure {
  name: string
  tiers: FeeTier[]
  disbursements: DisbursementItem[]
  vatRate: number
}

export interface FeeTier {
  minValue: number
  maxValue: number | null
  fee: number
  description: string
}

export interface DisbursementItem {
  description: string
  amount: number
  required: boolean
  appliesToTypes?: string[]
}

/**
 * VAT rate (UK standard rate)
 */
export const VAT_RATE = 0.20 // 20%

/**
 * Default fee structure for residential conveyancing
 * This can be customized per tenant via tenant_settings
 */
export const DEFAULT_RESIDENTIAL_FEE_STRUCTURE: FeeStructure = {
  name: 'Standard Residential Conveyancing',
  vatRate: VAT_RATE,
  tiers: [
    {
      minValue: 0,
      maxValue: 100000,
      fee: 850,
      description: 'Up to £100,000',
    },
    {
      minValue: 100000,
      maxValue: 200000,
      fee: 1100,
      description: '£100,001 to £200,000',
    },
    {
      minValue: 200000,
      maxValue: 300000,
      fee: 1350,
      description: '£200,001 to £300,000',
    },
    {
      minValue: 300000,
      maxValue: 500000,
      fee: 1600,
      description: '£300,001 to £500,000',
    },
    {
      minValue: 500000,
      maxValue: 750000,
      fee: 1950,
      description: '£500,001 to £750,000',
    },
    {
      minValue: 750000,
      maxValue: null,
      fee: 2500,
      description: 'Above £750,000',
    },
  ],
  disbursements: [
    {
      description: 'Land Registry Search',
      amount: 12,
      required: true,
    },
    {
      description: 'Local Authority Search',
      amount: 150,
      required: true,
    },
    {
      description: 'Environmental Search',
      amount: 45,
      required: true,
    },
    {
      description: 'Chancel Check',
      amount: 18,
      required: true,
    },
    {
      description: 'Bankruptcy Search (per person)',
      amount: 2,
      required: true,
    },
    {
      description: 'Land Registry Registration Fee',
      amount: 150,
      required: true,
      appliesToTypes: ['purchase'],
    },
    {
      description: 'SDLT/LBTT Return Fee',
      amount: 50,
      required: true,
      appliesToTypes: ['purchase'],
    },
    {
      description: 'Bank Transfer Fee',
      amount: 35,
      required: true,
    },
    {
      description: 'ID Verification Check (per person)',
      amount: 15,
      required: true,
    },
  ],
}

/**
 * Remortgage fee structure (typically lower than purchase/sale)
 */
export const DEFAULT_REMORTGAGE_FEE_STRUCTURE: FeeStructure = {
  name: 'Remortgage Conveyancing',
  vatRate: VAT_RATE,
  tiers: [
    {
      minValue: 0,
      maxValue: 200000,
      fee: 450,
      description: 'Up to £200,000',
    },
    {
      minValue: 200000,
      maxValue: 500000,
      fee: 550,
      description: '£200,001 to £500,000',
    },
    {
      minValue: 500000,
      maxValue: null,
      fee: 750,
      description: 'Above £500,000',
    },
  ],
  disbursements: [
    {
      description: 'Land Registry Search',
      amount: 12,
      required: true,
    },
    {
      description: 'Bankruptcy Search (per person)',
      amount: 2,
      required: true,
    },
    {
      description: 'Land Registry Registration Fee',
      amount: 95,
      required: true,
    },
    {
      description: 'Bank Transfer Fee',
      amount: 35,
      required: true,
    },
  ],
}

/**
 * Calculate conveyancing fees
 */
export function calculateFees(params: {
  transactionValue: number
  transactionType: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
  feeStructure?: FeeStructure
  customDisbursements?: DisbursementItem[]
  numberOfBuyers?: number
}): FeeCalculation {
  const {
    transactionValue,
    transactionType,
    feeStructure,
    customDisbursements,
    numberOfBuyers = 1,
  } = params

  // Validate input
  if (transactionValue < 0) {
    throw new Error('Transaction value cannot be negative')
  }

  // Select appropriate fee structure
  let structure = feeStructure
  if (!structure) {
    structure =
      transactionType === 'remortgage'
        ? DEFAULT_REMORTGAGE_FEE_STRUCTURE
        : DEFAULT_RESIDENTIAL_FEE_STRUCTURE
  }

  // Calculate base legal fee from tiers
  const baseFee = calculateBaseFee(transactionValue, structure.tiers)

  // Calculate disbursements
  const disbursements = customDisbursements || structure.disbursements
  const applicableDisbursements = disbursements.filter(
    (d) =>
      d.required &&
      (!d.appliesToTypes || d.appliesToTypes.includes(transactionType))
  )

  // Build breakdown
  const breakdown: FeeBreakdownItem[] = []

  // Add legal fee
  breakdown.push({
    description: 'Professional Legal Fees',
    amount: baseFee,
    isVatable: true,
    category: 'legal_fee',
  })

  // Add disbursements
  let totalDisbursements = 0
  for (const disbursement of applicableDisbursements) {
    let amount = disbursement.amount

    // Multiply per-person fees by number of buyers
    if (disbursement.description.includes('(per person)')) {
      amount *= numberOfBuyers
    }

    breakdown.push({
      description: disbursement.description,
      amount,
      isVatable: false, // Disbursements are typically not subject to VAT
      category: 'disbursement',
    })

    totalDisbursements += amount
  }

  // Calculate VAT (only on vatable items)
  const vatableAmount = breakdown
    .filter((item) => item.isVatable)
    .reduce((sum, item) => sum + item.amount, 0)

  const vat = vatableAmount * structure.vatRate

  // Calculate totals
  const subtotal = baseFee + totalDisbursements
  const total = subtotal + vat

  return {
    baseFee,
    disbursements: totalDisbursements,
    subtotal,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100,
    breakdown,
    transactionValue,
    transactionType,
  }
}

/**
 * Calculate base fee from tiered structure
 */
function calculateBaseFee(transactionValue: number, tiers: FeeTier[]): number {
  for (const tier of tiers) {
    if (
      transactionValue >= tier.minValue &&
      (tier.maxValue === null || transactionValue <= tier.maxValue)
    ) {
      return tier.fee
    }
  }

  // If no tier matches, use the highest tier
  const highestTier = tiers[tiers.length - 1]
  return highestTier.fee
}

/**
 * Parse fee structure from tenant settings (JSON)
 */
export function parseFeeStructure(json: Json): FeeStructure | null {
  try {
    if (typeof json !== 'object' || json === null) {
      return null
    }

    const obj = json as Record<string, unknown>

    // Validate required fields
    if (
      typeof obj.name !== 'string' ||
      !Array.isArray(obj.tiers) ||
      !Array.isArray(obj.disbursements)
    ) {
      return null
    }

    return {
      name: obj.name,
      tiers: obj.tiers as FeeTier[],
      disbursements: obj.disbursements as DisbursementItem[],
      vatRate: typeof obj.vatRate === 'number' ? obj.vatRate : VAT_RATE,
    }
  } catch {
    return null
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get a human-readable summary of the fee calculation
 */
export function getFeeSummary(calculation: FeeCalculation): string {
  const lines: string[] = []

  lines.push(`Transaction Value: ${formatCurrency(calculation.transactionValue)}`)
  lines.push(`Transaction Type: ${formatTransactionType(calculation.transactionType)}`)
  lines.push('')
  lines.push(`Professional Legal Fees: ${formatCurrency(calculation.baseFee)}`)
  lines.push(`Disbursements: ${formatCurrency(calculation.disbursements)}`)
  lines.push(`Subtotal: ${formatCurrency(calculation.subtotal)}`)
  lines.push(`VAT (20%): ${formatCurrency(calculation.vat)}`)
  lines.push('')
  lines.push(`TOTAL: ${formatCurrency(calculation.total)}`)

  return lines.join('\n')
}

/**
 * Format transaction type for display
 */
function formatTransactionType(type: string): string {
  const types: Record<string, string> = {
    purchase: 'Purchase',
    sale: 'Sale',
    remortgage: 'Remortgage',
    transfer_of_equity: 'Transfer of Equity',
  }
  return types[type] || type
}

/**
 * Example usage and test cases
 */
export const FEE_EXAMPLES = [
  {
    description: 'Standard purchase, £250,000',
    params: {
      transactionValue: 250000,
      transactionType: 'purchase' as const,
    },
    expectedTotal: 1942.2, // £1,350 + disbursements + VAT
  },
  {
    description: 'Remortgage, £300,000',
    params: {
      transactionValue: 300000,
      transactionType: 'remortgage' as const,
    },
    expectedTotal: 754, // £550 + disbursements + VAT
  },
]
