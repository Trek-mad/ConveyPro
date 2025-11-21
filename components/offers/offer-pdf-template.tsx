import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { Offer } from '@/types'

// Register fonts (optional - you can use default fonts)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
// })

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #0066cc',
  },
  firmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 5,
  },
  firmDetails: {
    fontSize: 9,
    color: '#666666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: '#333333',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0066cc',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#555555',
  },
  value: {
    width: '60%',
    color: '#333333',
  },
  amountBox: {
    backgroundColor: '#f0f7ff',
    padding: 15,
    marginVertical: 15,
    borderRadius: 5,
    border: '1 solid #0066cc',
  },
  amountLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  conditionsBox: {
    backgroundColor: '#fffdf0',
    padding: 12,
    marginVertical: 10,
    borderRadius: 5,
    border: '1 solid #e5e5e5',
  },
  conditionsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  conditionsText: {
    fontSize: 10,
    color: '#555555',
    whiteSpace: 'pre-wrap',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    paddingTop: 15,
    borderTop: '1 solid #e5e5e5',
  },
  footerText: {
    fontSize: 9,
    color: '#888888',
    textAlign: 'center',
  },
  signatureSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e5e5e5',
  },
  signatureLine: {
    borderBottom: '1 solid #333333',
    width: '60%',
    marginTop: 30,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666666',
  },
})

interface OfferPDFProps {
  offer: Offer
  matter: {
    matter_number: string
    purchase_price?: number
    primary_client?: {
      first_name: string
      last_name: string
    }
    property?: {
      address_line1: string
      address_line2?: string
      city: string
      postcode: string
    }
    selling_agent_name?: string
  }
  firmName: string
  firmAddress?: string
  firmPhone?: string
  firmEmail?: string
}

export function OfferPDFTemplate({
  offer,
  matter,
  firmName,
  firmAddress,
  firmPhone,
  firmEmail,
}: OfferPDFProps) {
  const formatDate = (date: string | null) => {
    if (!date) return 'Not specified'
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatPropertyAddress = () => {
    if (!matter.property) return 'Property address not available'
    const parts = [
      matter.property.address_line1,
      matter.property.address_line2,
      matter.property.city,
      matter.property.postcode,
    ].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.firmName}>{firmName}</Text>
          <Text style={styles.firmDetails}>
            {firmAddress && `${firmAddress} | `}
            {firmPhone && `Tel: ${firmPhone} | `}
            {firmEmail && `Email: ${firmEmail}`}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {offer.offer_type === 'written' ? 'WRITTEN OFFER' : 'VERBAL OFFER CONFIRMATION'}
        </Text>

        {/* Offer Reference */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Offer Number:</Text>
            <Text style={styles.value}>{offer.offer_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Matter Number:</Text>
            <Text style={styles.value}>{matter.matter_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Client Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>On Behalf Of</Text>
          <Text>
            {matter.primary_client
              ? `${matter.primary_client.first_name} ${matter.primary_client.last_name}`
              : 'Client name not available'}
          </Text>
        </View>

        {/* Selling Agent */}
        {matter.selling_agent_name && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>To</Text>
            <Text>{matter.selling_agent_name}</Text>
            <Text style={{ fontSize: 10, color: '#666666', marginTop: 3 }}>
              Selling Agent
            </Text>
          </View>
        )}

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property</Text>
          <Text>{formatPropertyAddress()}</Text>
        </View>

        {/* Offer Amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>OFFER AMOUNT</Text>
          <Text style={styles.amountValue}>{formatCurrency(offer.offer_amount)}</Text>
        </View>

        {/* Offer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offer Terms</Text>

          {offer.closing_date && (
            <View style={styles.row}>
              <Text style={styles.label}>Closing Date:</Text>
              <Text style={styles.value}>{formatDate(offer.closing_date)}</Text>
            </View>
          )}

          {offer.entry_date && (
            <View style={styles.row}>
              <Text style={styles.label}>Proposed Entry Date:</Text>
              <Text style={styles.value}>{formatDate(offer.entry_date)}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Survey Required:</Text>
            <Text style={styles.value}>{offer.survey_required ? 'Yes' : 'No'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Offer Type:</Text>
            <Text style={styles.value}>{offer.offer_type === 'written' ? 'Written' : 'Verbal'}</Text>
          </View>
        </View>

        {/* Conditions */}
        {offer.conditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conditions</Text>
            <View style={styles.conditionsBox}>
              <Text style={styles.conditionsText}>{offer.conditions}</Text>
            </View>
          </View>
        )}

        {/* Standard Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standard Terms</Text>
          <Text style={styles.paragraph}>
            This offer is made subject to the property being in substantially the same
            condition as at the date of the last inspection, and subject to obtaining a
            satisfactory survey and mortgage offer (if applicable).
          </Text>
          <Text style={styles.paragraph}>
            The offer is conditional upon conclusion of missives on terms acceptable to
            both parties within 28 days of acceptance, or such other period as may be
            agreed.
          </Text>
          <Text style={styles.paragraph}>
            This offer is made on behalf of our client and is subject to their final
            acceptance and confirmation.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={{ marginBottom: 15 }}>Yours faithfully,</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Solicitor Signature</Text>
          <Text style={styles.signatureLabel}>{firmName}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This document is private and confidential. It is intended for the addressee
            only.
          </Text>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {firmName}. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
