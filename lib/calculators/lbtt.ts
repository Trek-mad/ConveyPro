/**
 * Land and Buildings Transaction Tax (LBTT) Calculator
 * Scottish property tax calculation
 *
 * Based on 2024/2025 tax year rates
 * https://www.revenue.scot/taxes/land-buildings-transaction-tax
 */

export interface LBTTBand {
  min: number
  max: number | null
  rate: number
  label: string
}

export interface LBTTBreakdownItem {
  band: string
  taxableAmount: number
  rate: number
  tax: number
}

export interface LBTTCalculation {
  purchasePrice: number
  standardLBTT: number
  adsLBTT: number
  totalLBTT: number
  effectiveRate: number
  breakdown: LBTTBreakdownItem[]
  isAdditionalProperty: boolean
  isFirstTimeBuyer: boolean
  propertyType: 'residential' | 'non-residential'
}

/**
 * Residential LBTT Tax Bands (2024/2025)
 */
export const RESIDENTIAL_BANDS: LBTTBand[] = [
  { min: 0, max: 145000, rate: 0, label: 'Up to £145,000' },
  { min: 145000, max: 250000, rate: 0.02, label: '£145,001 to £250,000' },
  { min: 250000, max: 325000, rate: 0.05, label: '£250,001 to £325,000' },
  { min: 325000, max: 750000, rate: 0.10, label: '£325,001 to £750,000' },
  { min: 750000, max: null, rate: 0.12, label: 'Above £750,000' },
]

/**
 * Non-residential LBTT Tax Bands (2024/2025)
 */
export const NON_RESIDENTIAL_BANDS: LBTTBand[] = [
  { min: 0, max: 150000, rate: 0, label: 'Up to £150,000' },
  { min: 150000, max: 250000, rate: 0.01, label: '£150,001 to £250,000' },
  { min: 250000, max: null, rate: 0.05, label: 'Above £250,000' },
]

/**
 * Additional Dwelling Supplement (ADS) Rate
 * Applied to entire purchase price for additional residential properties
 */
export const ADS_RATE = 0.06 // 6%

/**
 * First-time buyer relief threshold
 * No LBTT on purchases up to this amount for eligible first-time buyers
 */
export const FIRST_TIME_BUYER_THRESHOLD = 175000

/**
 * Calculate LBTT for a property purchase
 */
export function calculateLBTT(params: {
  purchasePrice: number
  isAdditionalProperty?: boolean
  isFirstTimeBuyer?: boolean
  propertyType?: 'residential' | 'non-residential'
}): LBTTCalculation {
  const {
    purchasePrice,
    isAdditionalProperty = false,
    isFirstTimeBuyer = false,
    propertyType = 'residential',
  } = params

  // Validate input
  if (purchasePrice < 0) {
    throw new Error('Purchase price cannot be negative')
  }

  // Select appropriate tax bands
  const bands = propertyType === 'residential' ? RESIDENTIAL_BANDS : NON_RESIDENTIAL_BANDS

  // Calculate standard LBTT using progressive tax bands
  const { total: standardLBTT, breakdown } = calculateProgressiveTax(purchasePrice, bands)

  // Apply first-time buyer relief (residential only)
  // First-time buyers pay no LBTT on the first £175,000
  let finalStandardLBTT = standardLBTT
  let reliefAmount = 0
  if (propertyType === 'residential' && isFirstTimeBuyer) {
    if (purchasePrice <= FIRST_TIME_BUYER_THRESHOLD) {
      // Property costs £175k or less - no LBTT at all
      reliefAmount = standardLBTT
      finalStandardLBTT = 0
    } else {
      // Property costs more than £175k - pay LBTT only on the amount above £175k
      const taxableAmount = purchasePrice - FIRST_TIME_BUYER_THRESHOLD
      const { total: reducedLBTT } = calculateProgressiveTax(taxableAmount, bands)
      reliefAmount = standardLBTT - reducedLBTT
      finalStandardLBTT = reducedLBTT
    }
  }

  // Calculate ADS (residential additional properties only)
  let adsLBTT = 0
  if (propertyType === 'residential' && isAdditionalProperty) {
    adsLBTT = purchasePrice * ADS_RATE
  }

  // Calculate totals
  const totalLBTT = finalStandardLBTT + adsLBTT
  const effectiveRate = purchasePrice > 0 ? (totalLBTT / purchasePrice) * 100 : 0

  return {
    purchasePrice,
    standardLBTT: finalStandardLBTT,
    adsLBTT,
    totalLBTT,
    effectiveRate: Math.round(effectiveRate * 100) / 100, // Round to 2 decimal places
    breakdown,
    isAdditionalProperty,
    isFirstTimeBuyer,
    propertyType,
  }
}

/**
 * Calculate tax using progressive tax bands
 * (tax is calculated on portions of the price in each band)
 */
function calculateProgressiveTax(
  amount: number,
  bands: LBTTBand[]
): { total: number; breakdown: LBTTBreakdownItem[] } {
  let totalTax = 0
  const breakdown: LBTTBreakdownItem[] = []

  for (const band of bands) {
    // Determine the taxable amount in this band
    const bandMin = band.min
    const bandMax = band.max || Infinity

    if (amount <= bandMin) {
      // Purchase price doesn't reach this band
      break
    }

    const taxableAmount = Math.min(amount, bandMax) - bandMin
    const bandTax = taxableAmount * band.rate

    totalTax += bandTax

    breakdown.push({
      band: band.label,
      taxableAmount,
      rate: band.rate * 100, // Convert to percentage
      tax: Math.round(bandTax * 100) / 100, // Round to 2 decimal places
    })

    if (amount <= bandMax) {
      // Purchase price doesn't exceed this band
      break
    }
  }

  return {
    total: Math.round(totalTax * 100) / 100, // Round to 2 decimal places
    breakdown,
  }
}

/**
 * Format currency for display (internal utility)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get a human-readable summary of the LBTT calculation
 */
export function getLBTTSummary(calculation: LBTTCalculation): string {
  const lines: string[] = []

  lines.push(`Purchase Price: ${formatCurrency(calculation.purchasePrice)}`)

  if (calculation.isFirstTimeBuyer && calculation.purchasePrice <= FIRST_TIME_BUYER_THRESHOLD) {
    lines.push('First-Time Buyer Relief Applied: No LBTT due')
  } else {
    lines.push(`Standard LBTT: ${formatCurrency(calculation.standardLBTT)}`)
  }

  if (calculation.isAdditionalProperty && calculation.adsLBTT > 0) {
    lines.push(`Additional Dwelling Supplement (6%): ${formatCurrency(calculation.adsLBTT)}`)
  }

  lines.push(`Total LBTT: ${formatCurrency(calculation.totalLBTT)}`)
  lines.push(`Effective Rate: ${calculation.effectiveRate.toFixed(2)}%`)

  return lines.join('\n')
}

/**
 * Example usage and test cases
 */
export const LBTT_EXAMPLES = [
  {
    description: 'First-time buyer, £150,000 property',
    params: {
      purchasePrice: 150000,
      isFirstTimeBuyer: true,
      isAdditionalProperty: false,
    },
    expectedLBTT: 0, // First-time buyer relief
  },
  {
    description: 'Standard purchase, £250,000 property',
    params: {
      purchasePrice: 250000,
      isFirstTimeBuyer: false,
      isAdditionalProperty: false,
    },
    expectedLBTT: 2100, // £2,100 LBTT
  },
  {
    description: 'Additional property, £300,000',
    params: {
      purchasePrice: 300000,
      isFirstTimeBuyer: false,
      isAdditionalProperty: true,
    },
    expectedLBTT: 20600, // £2,600 standard + £18,000 ADS
  },
  {
    description: 'High-value property, £1,000,000',
    params: {
      purchasePrice: 1000000,
      isFirstTimeBuyer: false,
      isAdditionalProperty: false,
    },
    expectedLBTT: 72100, // Progressive tax calculation
  },
]
