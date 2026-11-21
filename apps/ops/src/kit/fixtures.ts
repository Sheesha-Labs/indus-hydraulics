// NEUTRAL sample data for the /_kit specimen and visual baselines. Nothing here comes from the handoff:
// no real company, person, address, bank or TRN (CLAUDE.md §12).
export const COMPANIES = {
  supplier: 'Example Valve Co',
  client: 'Sample Client LLC',
  other: 'Demo Bearings FZE',
} as const

export const PEOPLE = {
  owner: { name: 'Owner Example', initials: 'OE', role: 'Owner · sales@' },
  helper: { name: 'Helper Example', initials: 'HE', role: 'Helper · purchase@' },
  assistant: { name: 'Assistant', initials: 'AS', role: 'Works on Autopilot levels' },
} as const

export const REFS = {
  enquiry: 'ENQ-2026-0001',
  quotation: 'INDUS/Q10001',
  quotationRevised: 'INDUS/Q10001-R2',
  supplierRfq: 'IH-RFQ-2611-P01',
  order: 'SO-0001',
  po: 'INDUS/PO10001',
  clientRef: 'SAMPLE/PO-0001',
} as const

export const BANK = {
  name: 'TEST BANK',
  iban: 'AE00 0000 0000 0000 0000 000',
  trn: '000000000000000',
} as const

export const MONEY = {
  usd: { ccy: 'USD', amount: '12,400.00' },
  eur: { ccy: 'EUR', amount: '8,420.00' },
  negative: { ccy: 'AED', amount: '(1,283.00)' },
} as const

export const LINES = [
  { pn: 'VLV-1001', description: 'Gate valve, 2", class 300', qty: '4 ea' },
  { pn: 'BRG-6316-C3', description: 'Deep groove ball bearing, C3', qty: '24 ea' },
  { pn: 'GSK-2001', description: 'Spiral wound gasket, 3", class 600', qty: '40 ea' },
] as const
