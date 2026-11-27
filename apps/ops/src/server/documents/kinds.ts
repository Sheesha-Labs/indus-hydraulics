import type { DocKind } from '@indus/ops-core'
import type { $Enums } from '@indus/ops-db'

/**
 * The render model's kinds (ops-core DocKind) and the stored record kinds (Prisma DocumentKind) of the nine
 * documents Ops produces (S11-T04). Supplier documents go out from purchase@, client documents from sales@.
 */
export const RECORD_KIND: Record<DocKind, $Enums.DocumentKind> = {
  quotation: 'quotation',
  rfq: 'supplier_rfq',
  oa: 'order_acknowledgement',
  pi: 'proforma_invoice',
  po: 'supplier_po',
  pl: 'packing_list',
  dn: 'delivery_note',
  invoice: 'tax_invoice',
  cn: 'credit_note',
}

export const SUPPLIER_KINDS: ReadonlySet<DocKind> = new Set(['rfq', 'po'])

export function mailboxRoleFor(kind: DocKind): 'client' | 'supplier' {
  return SUPPLIER_KINDS.has(kind) ? 'supplier' : 'client'
}
