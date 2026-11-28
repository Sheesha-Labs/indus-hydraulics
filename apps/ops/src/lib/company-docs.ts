import type { $Enums } from '@indus/ops-db'

/** Board 213's document kinds, labels and "Used in" tags (S11-T07): pure data for the page and the service. */
export const COMPANY_DOC_KINDS = [
  'trade_licence',
  'vat_certificate',
  'iso_certificate',
  'atex_certificate',
  'api_licence',
  'approval',
  'bank_letter',
  'company_profile',
  'past_performance_letter',
  'insurance',
  'other',
] as const satisfies readonly $Enums.ComplianceDocKind[]

export const COMPANY_DOC_LABEL: Record<(typeof COMPANY_DOC_KINDS)[number], string> = {
  trade_licence: 'Trade licence',
  vat_certificate: 'VAT certificate',
  iso_certificate: 'ISO certificate',
  atex_certificate: 'ATEX certificate',
  api_licence: 'API licence',
  approval: 'Approval',
  bank_letter: 'Bank letter',
  company_profile: 'Company profile',
  past_performance_letter: 'Past performance letters',
  insurance: 'Insurance',
  other: 'Other',
}

export const USED_IN = [
  'Tender packs',
  'Vendor forms',
  'Invoices',
  'Supplier registrations',
  'Client vendor forms',
] as const
