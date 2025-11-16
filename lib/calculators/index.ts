/**
 * Combined calculator utilities for quotes
 * Integrates LBTT and fee calculations
 */

import { calculateLBTT, type LBTTCalculation } from './lbtt'
import { calculateFees, type FeeCalculation, type FeeStructure } from './fees'

export * from './lbtt'
export * from './fees'

export interface QuoteCalculation {
  lbtt: LBTTCalculation
  fees: FeeCalculation
  summary: {
    propertyValue: number
    lbttTotal: number
    legalFeesTotal: number
    grandTotal: number
  }
}

/**
 * Calculate complete quote including LBTT and legal fees
 */
export function calculateQuote(params: {
  // Property details
  purchasePrice: number
  isAdditionalProperty?: boolean
  isFirstTimeBuyer?: boolean
  propertyType?: 'residential' | 'non-residential'

  // Transaction details
  transactionType: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
  numberOfBuyers?: number

  // Optional custom fee structure (from tenant settings)
  feeStructure?: FeeStructure
}): QuoteCalculation {
  // Calculate LBTT
  const lbtt = calculateLBTT({
    purchasePrice: params.purchasePrice,
    isAdditionalProperty: params.isAdditionalProperty,
    isFirstTimeBuyer: params.isFirstTimeBuyer,
    propertyType: params.propertyType,
  })

  // Calculate legal fees
  const fees = calculateFees({
    transactionValue: params.purchasePrice,
    transactionType: params.transactionType,
    feeStructure: params.feeStructure,
    numberOfBuyers: params.numberOfBuyers,
  })

  return {
    lbtt,
    fees,
    summary: {
      propertyValue: params.purchasePrice,
      lbttTotal: lbtt.totalLBTT,
      legalFeesTotal: fees.total,
      grandTotal: lbtt.totalLBTT + fees.total,
    },
  }
}

/**
 * Format complete quote summary for display
 */
export function getQuoteSummary(calculation: QuoteCalculation): string {
  const lines: string[] = []

  lines.push('=== QUOTE SUMMARY ===')
  lines.push('')
  lines.push(`Property Value: £${calculation.summary.propertyValue.toLocaleString()}`)
  lines.push('')

  lines.push('--- LBTT (Land & Buildings Transaction Tax) ---')
  lines.push(`Standard LBTT: £${calculation.lbtt.standardLBTT.toLocaleString()}`)
  if (calculation.lbtt.adsLBTT > 0) {
    lines.push(`Additional Dwelling Supplement: £${calculation.lbtt.adsLBTT.toLocaleString()}`)
  }
  lines.push(`Total LBTT: £${calculation.lbtt.totalLBTT.toLocaleString()}`)
  lines.push('')

  lines.push('--- Legal Fees ---')
  lines.push(`Professional Fees: £${calculation.fees.baseFee.toLocaleString()}`)
  lines.push(`Disbursements: £${calculation.fees.disbursements.toLocaleString()}`)
  lines.push(`VAT (20%): £${calculation.fees.vat.toLocaleString()}`)
  lines.push(`Total Legal Fees: £${calculation.fees.total.toLocaleString()}`)
  lines.push('')

  lines.push('===================')
  lines.push(`GRAND TOTAL: £${calculation.summary.grandTotal.toLocaleString()}`)
  lines.push('===================')

  return lines.join('\n')
}
