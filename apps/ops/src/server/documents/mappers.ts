import 'server-only'
import type {
  ClientSafeOrderDoc,
  ClientSafeQuotation,
  OrderDocInput,
  SupplierSafePo,
  SupplierSafeRfq,
} from '@indus/ops-core'

/**
 * The only place ClientSafe* / SupplierSafe* builder inputs are made from database rows (S11-T04, ADR-13). Each
 * reads exactly the fields its audience may see and passes them through the ops-core factory, which refuses a
 * forbidden key at any depth.
 *
 * The records arrive in later sprints, so these are signatures until then; calling one throws (a test proves
 * each still does, so a sprint that builds it also replaces its test):
 *   toClientSafeQuotation   S17 (quotation approval)
 *   toSupplierSafeRfq       S12 (supplier RFQs)
 *   toSupplierSafePo        S24 (supplier POs)
 *   toClientSafeOrderDoc    S24–S27 (OA, PI, PL, DN, tax invoice, credit note)
 */
export class MapperNotBuilt extends Error {
  constructor(
    readonly mapper: string,
    readonly sprint: string
  ) {
    super(`${mapper} arrives in ${sprint}`)
  }
}

export async function toClientSafeQuotation(_quotationId: string): Promise<ClientSafeQuotation> {
  throw new MapperNotBuilt('toClientSafeQuotation', 'S17')
}

export async function toSupplierSafeRfq(_rfqId: string): Promise<SupplierSafeRfq> {
  throw new MapperNotBuilt('toSupplierSafeRfq', 'S12')
}

export async function toSupplierSafePo(_poId: string): Promise<SupplierSafePo> {
  throw new MapperNotBuilt('toSupplierSafePo', 'S24')
}

export async function toClientSafeOrderDoc(
  _kind: OrderDocInput['kind'],
  _orderId: string
): Promise<ClientSafeOrderDoc> {
  throw new MapperNotBuilt('toClientSafeOrderDoc', 'S24–S27')
}
