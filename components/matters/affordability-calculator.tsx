'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calculator,
  RefreshCw,
} from 'lucide-react'
import { calculateAffordability } from '@/services/financial-questionnaire.service'

interface AffordabilityCalculatorProps {
  questionnaireId: string
}

type AffordabilityResult = {
  affordable: boolean
  total_income: number
  total_assets: number
  total_liabilities: number
  available_deposit: number
  total_needed: number
  shortfall: number
  warnings: string[]
}

export function AffordabilityCalculator({
  questionnaireId,
}: AffordabilityCalculatorProps) {
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<AffordabilityResult | null>(null)
  const [error, setError] = useState('')

  const runCalculation = async () => {
    setCalculating(true)
    setError('')

    try {
      const calcResult = await calculateAffordability(questionnaireId)

      if ('error' in calcResult) {
        setError(calcResult.error)
        setResult(null)
      } else {
        setResult(calcResult)
      }
    } catch (err) {
      console.error('Calculation error:', err)
      setError('Failed to calculate affordability')
      setResult(null)
    } finally {
      setCalculating(false)
    }
  }

  useEffect(() => {
    runCalculation()
  }, [questionnaireId])

  if (calculating && !result) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Calculator className="h-8 w-8 animate-pulse text-blue-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Calculating Affordability...
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Analyzing financial data and purchase requirements
        </p>
      </Card>
    )
  }

  if (error && !result) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Calculation Failed
        </h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <Button className="mt-4" onClick={runCalculation}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Calculator className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No Calculation Available
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Complete the financial questionnaire to see affordability analysis
        </p>
      </Card>
    )
  }

  const debtToIncomeRatio =
    result.total_income > 0
      ? (result.total_liabilities / result.total_income) * 100
      : 0

  const netAssets = result.total_assets - result.total_liabilities

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Affordability Assessment
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Based on financial questionnaire data
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runCalculation}
            disabled={calculating}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${calculating ? 'animate-spin' : ''}`}
            />
            Recalculate
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          {result.affordable ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-green-700">
                  Purchase Appears Affordable
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  Client has sufficient deposit to proceed
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-700">
                  Deposit Shortfall Identified
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  Additional funds required: £
                  {Math.abs(result.shortfall).toLocaleString('en-GB')}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Total Annual Income</p>
              <p className="text-xl font-bold text-gray-900">
                £{result.total_income.toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        </Card>

        {/* Assets */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-xl font-bold text-gray-900">
                £{result.total_assets.toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        </Card>

        {/* Liabilities */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Total Liabilities</p>
              <p className="text-xl font-bold text-gray-900">
                £{result.total_liabilities.toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        </Card>

        {/* Net Assets */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                netAssets >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <Calculator
                className={`h-6 w-6 ${
                  netAssets >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Net Assets</p>
              <p
                className={`text-xl font-bold ${
                  netAssets >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                £{netAssets.toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Deposit Analysis */}
      <Card className="p-6">
        <h4 className="mb-4 font-semibold text-gray-900">Deposit Analysis</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Needed (after mortgage):</span>
            <span className="font-medium text-gray-900">
              £{result.total_needed.toLocaleString('en-GB')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Available Deposit:</span>
            <span className="font-medium text-gray-900">
              £{result.available_deposit.toLocaleString('en-GB')}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3 text-sm">
            <span className="font-semibold text-gray-900">
              {result.shortfall > 0 ? 'Shortfall:' : 'Surplus:'}
            </span>
            <span
              className={`text-lg font-bold ${
                result.shortfall > 0 ? 'text-red-700' : 'text-green-700'
              }`}
            >
              £{Math.abs(result.shortfall).toLocaleString('en-GB')}
            </span>
          </div>
        </div>

        {result.shortfall > 0 && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Additional Funding Required
                </p>
                <p className="mt-1 text-sm text-red-700">
                  Client needs an additional £
                  {result.shortfall.toLocaleString('en-GB')} to complete this
                  purchase. Consider bridging finance, increased mortgage, or
                  additional savings.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Financial Ratios */}
      <Card className="p-6">
        <h4 className="mb-4 font-semibold text-gray-900">Financial Ratios</h4>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Debt-to-Income Ratio</span>
              <span className="font-medium text-gray-900">
                {debtToIncomeRatio.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${
                  debtToIncomeRatio > 50
                    ? 'bg-red-500'
                    : debtToIncomeRatio > 30
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(debtToIncomeRatio, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {debtToIncomeRatio > 50
                ? 'High risk - may affect mortgage approval'
                : debtToIncomeRatio > 30
                  ? 'Moderate - within acceptable range'
                  : 'Low - healthy financial position'}
            </p>
          </div>
        </div>
      </Card>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                Considerations & Warnings
              </h4>
              <ul className="mt-3 space-y-2">
                {result.warnings.map((warning, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendation */}
      <Card className="border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">
              Solicitor Recommendation
            </h4>
            <p className="mt-2 text-sm text-blue-800">
              {result.affordable
                ? 'Client appears financially positioned to proceed with this purchase. Verify all documentation and confirm mortgage approval before proceeding to missives.'
                : 'Client has a deposit shortfall. Advise client to secure additional funds through savings, family gift, or increased mortgage borrowing before proceeding. Consider delaying missives until funding is confirmed.'}
            </p>
            {result.warnings.length > 0 && (
              <p className="mt-2 text-sm text-blue-800">
                Address the {result.warnings.length} warning
                {result.warnings.length > 1 ? 's' : ''} above before
                proceeding.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
