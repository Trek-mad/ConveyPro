import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { QuoteWithRelations } from '@/types'

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #2563EB',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: '40%',
    fontSize: 10,
    color: '#6B7280',
  },
  value: {
    width: '60%',
    fontSize: 10,
    color: '#1F2937',
    fontWeight: 'medium',
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    borderBottom: '2px solid #D1D5DB',
    paddingVertical: 10,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 10,
    color: '#1F2937',
  },
  colLabel: {
    width: '60%',
    paddingLeft: 10,
  },
  colAmount: {
    width: '40%',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTop: '2px solid #2563EB',
  },
  totalLabel: {
    width: '60%',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingLeft: 10,
  },
  totalAmount: {
    width: '40%',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'right',
    paddingRight: 10,
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusDraft: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  },
  statusSent: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  statusAccepted: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: '1px solid #E5E7EB',
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
  },
  propertyBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
    border: '1px solid #BFDBFE',
  },
  propertyTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 6,
  },
  propertyAddress: {
    fontSize: 10,
    color: '#1F2937',
    lineHeight: 1.4,
  },
  notes: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 4,
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },
})

interface QuotePDFProps {
  quote: QuoteWithRelations
  tenantName: string
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ quote, tenantName }) => {
  // Parse fee breakdown
  const feeBreakdown =
    typeof quote.fee_breakdown === 'string'
      ? JSON.parse(quote.fee_breakdown)
      : quote.fee_breakdown

  const vatRate = feeBreakdown?.vat_rate || 20

  // Format currency
  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get transaction type label
  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Purchase',
      sale: 'Sale',
      remortgage: 'Remortgage',
      transfer_of_equity: 'Transfer of Equity',
    }
    return labels[type] || type
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>{tenantName}</Text>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>
            Conveyancing Quote
          </Text>
        </View>

        {/* Quote Title and Number */}
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.title}>Quote {quote.quote_number}</Text>
          <Text style={{ fontSize: 10, color: '#6B7280', marginBottom: 8 }}>
            Date: {formatDate(quote.created_at)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#6B7280', marginRight: 8 }}>
              Status:
            </Text>
            <Text
              style={[
                styles.badge,
                quote.status === 'accepted'
                  ? styles.statusAccepted
                  : quote.status === 'sent'
                    ? styles.statusSent
                    : styles.statusDraft,
              ]}
            >
              {quote.status}
            </Text>
          </View>
        </View>

        {/* Linked Property */}
        {quote.property && (
          <View style={styles.propertyBox}>
            <Text style={styles.propertyTitle}>Property Details</Text>
            <Text style={styles.propertyAddress}>
              {quote.property.address_line1}
              {quote.property.address_line2 && `\n${quote.property.address_line2}`}
              {`\n${quote.property.city}, ${quote.property.postcode}`}
              {quote.property.country && `\n${quote.property.country}`}
            </Text>
            {quote.property.title_number && (
              <Text
                style={{
                  fontSize: 9,
                  color: '#6B7280',
                  marginTop: 6,
                }}
              >
                Title Number: {quote.property.title_number}
              </Text>
            )}
          </View>
        )}

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{quote.client_name}</Text>
          </View>
          {quote.client_email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{quote.client_email}</Text>
            </View>
          )}
          {quote.client_phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{quote.client_phone}</Text>
            </View>
          )}
        </View>

        {/* Transaction Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction Type:</Text>
            <Text style={styles.value}>
              {getTransactionTypeLabel(quote.transaction_type)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction Value:</Text>
            <Text style={styles.value}>
              {formatCurrency(Number(quote.transaction_value))}
            </Text>
          </View>
        </View>

        {/* Financial Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fee Breakdown</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeaderText, styles.colLabel]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>
                Amount
              </Text>
            </View>

            {/* Base Fee */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colLabel]}>
                Legal Fees
              </Text>
              <Text style={[styles.tableCell, styles.colAmount]}>
                {formatCurrency(Number(quote.base_fee))}
              </Text>
            </View>

            {/* Disbursements */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colLabel]}>
                Disbursements
              </Text>
              <Text style={[styles.tableCell, styles.colAmount]}>
                {formatCurrency(Number(quote.disbursements))}
              </Text>
            </View>

            {/* VAT */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colLabel]}>
                VAT ({vatRate}%)
              </Text>
              <Text style={[styles.tableCell, styles.colAmount]}>
                {formatCurrency(Number(quote.vat_amount))}
              </Text>
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(Number(quote.total_amount))}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.notes}>
              <Text>{quote.notes}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This quote is valid for 30 days from the date of issue.
          </Text>
          <Text style={{ marginTop: 4 }}>
            © {new Date().getFullYear()} {tenantName}. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
