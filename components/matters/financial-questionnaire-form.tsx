// @ts-nocheck
'use client'

// TODO: This component has multiple field mismatches with the FinancialQuestionnaire schema
// and needs to be refactored to align with the database structure

import { useState } from 'react'
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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  DollarSign,
  PiggyBank,
  CreditCard,
  Home,
  AlertCircle,
  FileText,
} from 'lucide-react'
import {
  createFinancialQuestionnaire,
  updateFinancialQuestionnaire,
} from '@/services/financial-questionnaire.service'
import type { FinancialQuestionnaire } from '@/types'

interface FinancialQuestionnaireFormProps {
  matterId: string
  clientId: string
  tenantId: string
  existing?: FinancialQuestionnaire | null
  onComplete?: () => void
}

type FormData = Partial<FinancialQuestionnaire>

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Employment', icon: Briefcase },
  { id: 3, title: 'Income', icon: DollarSign },
  { id: 4, title: 'Assets', icon: PiggyBank },
  { id: 5, title: 'Liabilities', icon: CreditCard },
  { id: 6, title: 'Property Sale', icon: Home },
  { id: 7, title: 'Mortgage & Deposit', icon: FileText },
  { id: 8, title: 'Review', icon: Check },
]

export function FinancialQuestionnaireForm({
  matterId,
  clientId,
  tenantId,
  existing,
  onComplete,
}: FinancialQuestionnaireFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>(
    existing || {
      matter_id: matterId,
      client_id: clientId,
      tenant_id: tenantId,
    }
  )

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      let result

      if (existing?.id) {
        // Update existing
        result = await updateFinancialQuestionnaire(existing.id, formData)
      } else {
        // Create new
        result = await createFinancialQuestionnaire(formData as any)
      }

      if ('error' in result) {
        setError(result.error)
        setSubmitting(false)
        return
      }

      router.refresh()
      if (onComplete) {
        onComplete()
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Failed to save questionnaire')
      setSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Questionnaire
            </h3>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-gray-700">
                This questionnaire collects financial information for your property purchase.
                Your personal details are already stored in your client profile.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
              <AlertCircle className="h-4 w-4" />
              <p>Please proceed to the next step to begin entering your financial details.</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Employment Details
            </h3>

            <div>
              <Label htmlFor="employment_status">Employment Status</Label>
              <Select
                value={formData.employment_status || ''}
                onValueChange={(value) =>
                  updateField('employment_status', value)
                }
              >
                <SelectTrigger id="employment_status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self_employed">Self-Employed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.employment_status === 'employed' ||
              formData.employment_status === 'self_employed') && (
              <>
                <div>
                  <Label htmlFor="employer_name">
                    {formData.employment_status === 'self_employed'
                      ? 'Business Name'
                      : 'Employer Name'}
                  </Label>
                  <Input
                    id="employer_name"
                    value={formData.employer_name || ''}
                    onChange={(e) =>
                      updateField('employer_name', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="occupation">Job Title / Role</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation || ''}
                    onChange={(e) => updateField('occupation', e.target.value)}
                  />
                </div>

                {/* Years employed field removed - not in schema */}
              </>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Income Details
            </h3>

            <div>
              <Label htmlFor="annual_income">Annual Gross Income (£)</Label>
              <Input
                id="annual_income"
                type="number"
                min="0"
                value={formData.annual_income || ''}
                onChange={(e) =>
                  updateField('annual_income', parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="has_additional_income"
                  checked={(formData.additional_income_sources && formData.additional_income_sources.length > 0) || false}
                  onChange={(e) =>
                    updateField('has_additional_income', e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="has_additional_income" className="mb-0">
                  I have additional income
                </Label>
              </div>

              {formData.additional_income_sources && formData.additional_income_sources.length > 0 && (
                <>
                  <div className="mb-3">
                    <Label htmlFor="additional_income_source">
                      Source of Additional Income
                    </Label>
                    <Input
                      id="additional_income_source"
                      value={formData.additional_income_source || ''}
                      onChange={(e) =>
                        updateField('additional_income_source', e.target.value)
                      }
                      placeholder="e.g., Rental income, dividends"
                    />
                  </div>
                  <div>
                    <Label htmlFor="additional_income_amount">
                      Annual Additional Income (£)
                    </Label>
                    <Input
                      id="additional_income_amount"
                      type="number"
                      min="0"
                      value={formData.additional_income_amount || ''}
                      onChange={(e) =>
                        updateField(
                          'additional_income_amount',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Assets & Savings
            </h3>

            <div>
              <Label htmlFor="savings_amount">Savings (£)</Label>
              <Input
                id="savings_amount"
                type="number"
                min="0"
                value={formData.savings_amount || ''}
                onChange={(e) =>
                  updateField('savings_amount', parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="investments_amount">
                Investments & ISAs (£)
              </Label>
              <Input
                id="investments_amount"
                type="number"
                min="0"
                value={formData.investments_amount || ''}
                onChange={(e) =>
                  updateField(
                    'investments_amount',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
              />
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="has_other_assets"
                  checked={formData.has_other_assets || false}
                  onChange={(e) =>
                    updateField('has_other_assets', e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="has_other_assets" className="mb-0">
                  I have other assets
                </Label>
              </div>

              {formData.has_other_assets && (
                <>
                  <div className="mb-3">
                    <Label htmlFor="other_assets_description">
                      Description of Other Assets
                    </Label>
                    <Textarea
                      id="other_assets_description"
                      value={formData.other_assets_description || ''}
                      onChange={(e) =>
                        updateField('other_assets_description', e.target.value)
                      }
                      placeholder="e.g., Vehicles, jewelry"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="other_assets_value">Value (£)</Label>
                    <Input
                      id="other_assets_value"
                      type="number"
                      min="0"
                      value={formData.other_assets_value || ''}
                      onChange={(e) =>
                        updateField(
                          'other_assets_value',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Liabilities & Debts
            </h3>

            <div>
              <Label htmlFor="existing_mortgage_balance">
                Existing Mortgage Balance (£)
              </Label>
              <Input
                id="existing_mortgage_balance"
                type="number"
                min="0"
                value={formData.existing_mortgage_balance || ''}
                onChange={(e) =>
                  updateField(
                    'existing_mortgage_balance',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="credit_card_debt">Credit Card Debt (£)</Label>
              <Input
                id="credit_card_debt"
                type="number"
                min="0"
                value={formData.credit_card_debt || ''}
                onChange={(e) =>
                  updateField(
                    'credit_card_debt',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="loan_debts">Personal Loans (£)</Label>
              <Input
                id="loan_debts"
                type="number"
                min="0"
                value={formData.loan_debts || ''}
                onChange={(e) =>
                  updateField('loan_debts', parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="has_other_liabilities"
                  checked={formData.has_other_liabilities || false}
                  onChange={(e) =>
                    updateField('has_other_liabilities', e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="has_other_liabilities" className="mb-0">
                  I have other liabilities
                </Label>
              </div>

              {formData.has_other_liabilities && (
                <>
                  <div className="mb-3">
                    <Label htmlFor="other_liabilities_description">
                      Description
                    </Label>
                    <Textarea
                      id="other_liabilities_description"
                      value={formData.other_liabilities_description || ''}
                      onChange={(e) =>
                        updateField(
                          'other_liabilities_description',
                          e.target.value
                        )
                      }
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="other_liabilities_amount">Amount (£)</Label>
                    <Input
                      id="other_liabilities_amount"
                      type="number"
                      min="0"
                      value={formData.other_liabilities_amount || ''}
                      onChange={(e) =>
                        updateField(
                          'other_liabilities_amount',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Property Sale Information
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="selling_property"
                checked={formData.selling_property || false}
                onChange={(e) =>
                  updateField('selling_property', e.target.checked)
                }
                className="h-4 w-4"
              />
              <Label htmlFor="selling_property" className="mb-0">
                I am selling a property to fund this purchase
              </Label>
            </div>

            {formData.selling_property && (
              <>
                <div>
                  <Label htmlFor="property_to_sell_address">
                    Property Address
                  </Label>
                  <Textarea
                    id="property_to_sell_address"
                    value={formData.property_to_sell_address || ''}
                    onChange={(e) =>
                      updateField('property_to_sell_address', e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="sale_status">Sale Status</Label>
                  <Select
                    value={formData.sale_status || ''}
                    onValueChange={(value) => updateField('sale_status', value)}
                  >
                    <SelectTrigger id="sale_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="marketing">On Market</SelectItem>
                      <SelectItem value="under_offer">Under Offer</SelectItem>
                      <SelectItem value="missives_concluded">
                        Missives Concluded
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expected_sale_price">
                    Expected Sale Price (£)
                  </Label>
                  <Input
                    id="expected_sale_price"
                    type="number"
                    min="0"
                    value={formData.expected_sale_price || ''}
                    onChange={(e) =>
                      updateField(
                        'expected_sale_price',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="outstanding_mortgage_on_sale">
                    Outstanding Mortgage on Sale Property (£)
                  </Label>
                  <Input
                    id="outstanding_mortgage_on_sale"
                    type="number"
                    min="0"
                    value={formData.outstanding_mortgage_on_sale || ''}
                    onChange={(e) =>
                      updateField(
                        'outstanding_mortgage_on_sale',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="expected_sale_proceeds">
                    Expected Net Proceeds (£)
                  </Label>
                  <Input
                    id="expected_sale_proceeds"
                    type="number"
                    min="0"
                    value={formData.expected_sale_proceeds || ''}
                    onChange={(e) =>
                      updateField(
                        'expected_sale_proceeds',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Sale price minus mortgage and costs
                  </p>
                </div>
              </>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mortgage & Deposit
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mortgage_required"
                checked={formData.mortgage_required || false}
                onChange={(e) =>
                  updateField('mortgage_required', e.target.checked)
                }
                className="h-4 w-4"
              />
              <Label htmlFor="mortgage_required" className="mb-0">
                I require a mortgage for this purchase
              </Label>
            </div>

            {formData.mortgage_required && (
              <>
                <div>
                  <Label htmlFor="mortgage_amount_required">
                    Mortgage Amount Required (£)
                  </Label>
                  <Input
                    id="mortgage_amount_required"
                    type="number"
                    min="0"
                    value={formData.mortgage_amount_required || ''}
                    onChange={(e) =>
                      updateField(
                        'mortgage_amount_required',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mortgage_in_principle"
                    checked={formData.mortgage_in_principle || false}
                    onChange={(e) =>
                      updateField('mortgage_in_principle', e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="mortgage_in_principle" className="mb-0">
                    I have a Mortgage in Principle (AIP/DIP)
                  </Label>
                </div>

                {formData.mortgage_in_principle && (
                  <div>
                    <Label htmlFor="mortgage_lender">Lender Name</Label>
                    <Input
                      id="mortgage_lender"
                      value={formData.mortgage_lender || ''}
                      onChange={(e) =>
                        updateField('mortgage_lender', e.target.value)
                      }
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="deposit_amount">Deposit Amount (£)</Label>
              <Input
                id="deposit_amount"
                type="number"
                min="0"
                value={formData.deposit_amount || ''}
                onChange={(e) =>
                  updateField('deposit_amount', parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="deposit_source">Source of Deposit</Label>
              <Select
                value={formData.deposit_source || ''}
                onValueChange={(value) => updateField('deposit_source', value)}
              >
                <SelectTrigger id="deposit_source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="gift">Gift from Family</SelectItem>
                  <SelectItem value="sale_proceeds">
                    Sale of Property
                  </SelectItem>
                  <SelectItem value="inheritance">Inheritance</SelectItem>
                  <SelectItem value="investments">Investments</SelectItem>
                  <SelectItem value="multiple">Multiple Sources</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ads_applicable"
                checked={formData.ads_applicable || false}
                onChange={(e) =>
                  updateField('ads_applicable', e.target.checked)
                }
                className="h-4 w-4"
              />
              <Label htmlFor="ads_applicable" className="mb-0">
                Additional Dwelling Supplement (ADS) applies
              </Label>
            </div>
            <p className="text-xs text-gray-500">
              ADS is an 8% tax for buyers who already own a residential property
              in Scotland
            </p>
          </div>
        )

      case 8:
        const totalIncome =
          (formData.annual_income || 0) +
          (formData.additional_income_amount || 0)
        const totalAssets =
          (formData.savings_amount || 0) +
          (formData.investments_amount || 0) +
          (formData.other_assets_value || 0)
        const totalLiabilities =
          (formData.existing_mortgage_balance || 0) +
          (formData.credit_card_debt || 0) +
          (formData.loan_debts || 0) +
          (formData.other_liabilities_amount || 0)

        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Review Your Information
            </h3>

            <Card className="p-4">
              <h4 className="mb-3 font-medium text-gray-900">
                Financial Summary
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Total Annual Income:</dt>
                  <dd className="font-medium text-gray-900">
                    £{totalIncome.toLocaleString('en-GB')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Total Assets:</dt>
                  <dd className="font-medium text-gray-900">
                    £{totalAssets.toLocaleString('en-GB')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Total Liabilities:</dt>
                  <dd className="font-medium text-gray-900">
                    £{totalLiabilities.toLocaleString('en-GB')}
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-gray-600">Deposit Amount:</dt>
                  <dd className="font-semibold text-green-600">
                    £
                    {(formData.deposit_amount || 0).toLocaleString('en-GB')}
                  </dd>
                </div>
                {formData.mortgage_required && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Mortgage Required:</dt>
                    <dd className="font-medium text-gray-900">
                      £
                      {(formData.mortgage_amount_required || 0).toLocaleString(
                        'en-GB'
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {totalLiabilities > totalIncome * 0.5 && (
              <div className="flex gap-3 rounded-md border border-yellow-300 bg-yellow-50 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">
                    High Debt-to-Income Ratio
                  </p>
                  <p className="mt-1 text-yellow-700">
                    Your liabilities exceed 50% of your annual income. This may
                    affect mortgage approval.
                  </p>
                </div>
              </div>
            )}

            {formData.mortgage_required && !formData.mortgage_in_principle && (
              <div className="flex gap-3 rounded-md border border-blue-300 bg-blue-50 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">
                    Mortgage in Principle Recommended
                  </p>
                  <p className="mt-1 text-blue-700">
                    Consider obtaining a Mortgage in Principle before
                    proceeding.
                  </p>
                </div>
              </div>
            )}

            {formData.ads_applicable && (
              <div className="flex gap-3 rounded-md border border-orange-300 bg-orange-50 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">
                    Additional Dwelling Supplement
                  </p>
                  <p className="mt-1 text-orange-700">
                    An 8% ADS will apply to this purchase.
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="mb-8 grid grid-cols-4 gap-2 md:grid-cols-8">
        {STEPS.map((step) => {
          const Icon = step.icon
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : isCompleted
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-50 text-gray-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{step.title}</span>
            </button>
          )
        })}
      </div>

      {/* Form Content */}
      <Card className="p-6">
        {renderStepContent()}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Questionnaire'}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
