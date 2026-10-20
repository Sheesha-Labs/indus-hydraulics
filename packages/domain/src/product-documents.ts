/**
 * How a product document is named on the storefront.
 *
 * Until 2026-10 every product document was a datasheet, so the product page
 * offered `documents[0]` as "↓ Datasheet" and the Documents tab printed the raw
 * enum (`datasheet`). Maker service instructions are the first other kind to
 * be attached, and under the old code a service manual would have been offered
 * as the product's datasheet. Both surfaces read this module instead.
 */

/** Mirrors the Prisma `DocumentKind` enum. */
export type ProductDocumentKind = 'datasheet' | 'step' | 'iges' | 'service_manual' | 'installation_guide' | 'certificate'

const LABELS: Record<ProductDocumentKind, { label: string; badge: string }> = {
  datasheet: { label: 'Datasheet', badge: 'DATA' },
  service_manual: { label: 'Service manual', badge: 'MAN' },
  installation_guide: { label: 'Installation guide', badge: 'INST' },
  step: { label: 'STEP model', badge: 'STEP' },
  iges: { label: 'IGES model', badge: 'IGES' },
  certificate: { label: 'Certificate', badge: 'CERT' },
}

/** Human label for the document's kind, e.g. "Service manual". */
export function documentKindLabel(kind: string): string {
  return LABELS[kind as ProductDocumentKind]?.label ?? kind.replace(/_/g, ' ')
}

/** Four-character badge drawn on the document's file icon. */
export function documentKindBadge(kind: string): string {
  return LABELS[kind as ProductDocumentKind]?.badge ?? kind.toUpperCase().slice(0, 4)
}

/**
 * The document to offer as the product's datasheet: the first one that IS a
 * datasheet, in display order. Null when the product has none — a service
 * manual is never promoted to "Datasheet".
 */
export function primaryDatasheet<T extends { kind: string }>(documents: readonly T[]): T | null {
  return documents.find((d) => d.kind === 'datasheet') ?? null
}
