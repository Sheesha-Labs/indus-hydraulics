import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LOGO_PNG_BASE64 } from './logo-data'
import { computeTotals, type EstimateInput } from './types'

// Color palette — neutral B2B, matches the Zoho template aesthetic.
const C = {
  ink: '#1c1917',
  body: '#44403c',
  muted: '#78716c',
  faint: '#a8a29e',
  rule: '#e7e5e4',
  surface: '#ffffff',
  fill: '#fafaf9',
  brand: '#0c4a6e',
} as const

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.body,
    lineHeight: 1.4,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logo: { width: 110, height: 50, objectFit: 'contain' },
  estimateTitleBlock: { flexDirection: 'column', alignItems: 'flex-end' },
  estimateTitle: { fontSize: 28, color: C.ink, fontWeight: 300, lineHeight: 1.2 },
  estimateNumber: { fontSize: 10, color: C.ink, fontWeight: 700, marginTop: 6 },

  // Company info under logo
  companyBlock: { marginBottom: 24 },
  companyName: { fontSize: 11, color: C.ink, fontWeight: 700, marginBottom: 2 },
  companyLine: { fontSize: 9, color: C.body, lineHeight: 1.4 },

  // Bill-to + metadata two-column
  billMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  billCol: { width: '50%' },
  metaCol: { width: '45%', alignItems: 'flex-end' },
  smallLabel: { fontSize: 9, color: C.muted, marginBottom: 4 },
  billName: { fontSize: 10, color: C.ink, fontWeight: 700, marginBottom: 2 },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
    paddingTop: 4,
  },
  metaLabel: { fontSize: 9, color: C.muted },
  metaValue: { fontSize: 9, color: C.ink, textAlign: 'right', maxWidth: 160 },

  subjectBlock: { marginBottom: 16 },
  subjectLabel: { fontSize: 9, color: C.muted, marginBottom: 4 },
  subjectText: { fontSize: 10, color: C.ink },

  // Line items table
  table: { marginBottom: 16, borderTopWidth: 0.5, borderTopColor: C.rule },
  tableHead: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: C.fill,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
  },
  cellNum: { width: '5%', paddingHorizontal: 8, color: C.body },
  cellDesc: { width: '55%', paddingHorizontal: 8, color: C.ink },
  cellQty: { width: '12%', paddingHorizontal: 8, textAlign: 'right', color: C.body },
  cellRate: { width: '14%', paddingHorizontal: 8, textAlign: 'right', color: C.body },
  cellAmount: { width: '14%', paddingHorizontal: 8, textAlign: 'right', color: C.ink },
  headCell: { fontSize: 9, color: C.muted, fontWeight: 700 },

  // Totals
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 12,
    color: C.body,
    paddingVertical: 4,
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    color: C.ink,
    paddingVertical: 4,
  },
  grandTotalRow: {
    backgroundColor: C.fill,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  grandTotalLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 12,
    color: C.ink,
    fontWeight: 700,
    fontSize: 10,
  },
  grandTotalValue: {
    width: 80,
    textAlign: 'right',
    color: C.ink,
    fontWeight: 700,
    fontSize: 10,
  },

  // Notes / terms / disclaimer
  sectionTitle: { fontSize: 10, color: C.ink, marginBottom: 6, marginTop: 12 },
  bodyText: { fontSize: 9, color: C.body, lineHeight: 1.5 },

  // Page footer
  pageNumber: {
    position: 'absolute',
    bottom: 24,
    right: 40,
    fontSize: 9,
    color: C.faint,
  },

  // Signature block (page 2)
  signatureBlock: { marginTop: 24 },
  sigLabel: { fontSize: 10, color: C.body, marginBottom: 12 },
  sigName: { fontSize: 10, color: C.ink, fontWeight: 700 },
  sigLine: { fontSize: 9, color: C.body },
})

function formatMoney(n: number, currency: string): string {
  // AED-style: two decimals, comma thousands separator. Avoids Intl edge-cases
  // in Node + react-pdf's font subsetting.
  const fixed = n.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const withCommas = intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${currency}${withCommas}.${decPart}`
}

function formatDate(d: Date): string {
  // "24 Apr 2026" — matches the Zoho template
  const day = d.getUTCDate()
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

export function EstimatePDF(props: EstimateInput) {
  const totals = computeTotals(props)
  const logoSrc = `data:image/png;base64,${props.logoBase64 ?? LOGO_PNG_BASE64}`
  const codeWithRev = props.revisionLabel ? `${props.code} ${props.revisionLabel}` : props.code

  return (
    <Document
      title={`${props.documentTitle} ${codeWithRev}`}
      author={props.branding.legalName}
      creator={props.branding.legalName}
      producer={props.branding.legalName}
    >
      {/* Page 1 — quote body */}
      <Page size="A4" style={styles.page}>
        {/* Header: logo (left) / "Estimate" + number (right) */}
        <View style={styles.headerRow}>
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.estimateTitleBlock}>
            <Text style={styles.estimateTitle}>{props.documentTitle}</Text>
            <Text style={styles.estimateNumber}># {codeWithRev}</Text>
          </View>
        </View>

        {/* Company block under logo */}
        <View style={styles.companyBlock}>
          <Text style={styles.companyName}>{props.branding.legalName}</Text>
          {props.branding.vatTrn ? <Text style={styles.companyLine}>TRN {props.branding.vatTrn}</Text> : null}
          {props.branding.addressLines.map((line, i) => (
            <Text key={i} style={styles.companyLine}>
              {line}
            </Text>
          ))}
        </View>

        {/* Bill-to (left) + metadata (right) */}
        <View style={styles.billMetaRow}>
          <View style={styles.billCol}>
            <Text style={styles.smallLabel}>Bill To</Text>
            <Text style={styles.billName}>{props.billTo.name}</Text>
            {props.billTo.addressLines.map((line, i) => (
              <Text key={i} style={styles.companyLine}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.metaCol}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Estimate Date :</Text>
              <Text style={styles.metaValue}>{formatDate(props.estimateDate)}</Text>
            </View>
            {props.expiryDate ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Expiry Date :</Text>
                <Text style={styles.metaValue}>{formatDate(props.expiryDate)}</Text>
              </View>
            ) : null}
            {props.referenceLine ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Reference# :</Text>
                <Text style={styles.metaValue}>{props.referenceLine}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Subject */}
        {props.subject ? (
          <View style={styles.subjectBlock}>
            <Text style={styles.subjectLabel}>Subject :</Text>
            <Text style={styles.subjectText}>{props.subject}</Text>
          </View>
        ) : null}

        {/* Line items */}
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.cellNum, styles.headCell]}>#</Text>
            <Text style={[styles.cellDesc, styles.headCell]}>Item & Description</Text>
            <Text style={[styles.cellQty, styles.headCell]}>Qty</Text>
            <Text style={[styles.cellRate, styles.headCell]}>Rate</Text>
            <Text style={[styles.cellAmount, styles.headCell]}>Amount</Text>
          </View>
          {props.lines.map((line, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.cellNum}>{i + 1}</Text>
              <Text style={styles.cellDesc}>{line.description}</Text>
              <Text style={styles.cellQty}>{line.qty.toFixed(2)}</Text>
              <Text style={styles.cellRate}>{formatMoney(line.rate, '')}</Text>
              <Text style={styles.cellAmount}>{formatMoney(line.qty * line.rate, '')}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>Sub Total</Text>
          <Text style={styles.totalValue}>{formatMoney(totals.subtotal, '')}</Text>
        </View>
        {props.vatRatePct > 0 ? (
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>{props.vatLabel ?? `VAT @ ${props.vatRatePct.toFixed(0)}%`}</Text>
            <Text style={styles.totalValue}>{formatMoney(totals.vatAmount, '')}</Text>
          </View>
        ) : null}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>{formatMoney(totals.total, props.currency)}</Text>
        </View>

        {/* Notes */}
        {props.notes ? (
          <View>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.bodyText}>{props.notes}</Text>
          </View>
        ) : null}

        {/* Terms */}
        {props.termsLines && props.termsLines.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            {props.termsLines.map((line, i) => (
              <Text key={i} style={styles.bodyText}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Disclaimer */}
        {props.disclaimer ? (
          <View>
            <Text style={styles.sectionTitle}>Disclaimer</Text>
            <Text style={styles.bodyText}>{props.disclaimer}</Text>
          </View>
        ) : null}

        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Page 2 — signature block */}
      <Page size="A4" style={styles.page}>
        <View style={styles.signatureBlock}>
          <Text style={styles.sigLabel}>Best Regards,</Text>
          <Text style={styles.sigName}>{props.signature.name}</Text>
          <Text style={styles.sigLine}>{props.signature.title}</Text>
          <Text style={styles.sigLine}>{props.signature.company}</Text>
          {props.signature.phone ? <Text style={styles.sigLine}>Mob: {props.signature.phone}</Text> : null}
          {props.signature.email ? <Text style={styles.sigLine}>Email: {props.signature.email}</Text> : null}
          {props.signature.addressLines?.map((line, i) => (
            <Text key={i} style={styles.sigLine}>
              {line}
            </Text>
          ))}
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>
    </Document>
  )
}
