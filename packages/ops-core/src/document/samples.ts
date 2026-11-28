import * as F from './__fixtures__/inputs'
import type { BuildContext } from './builders/common'
import {
  buildCreditNote,
  buildDn,
  buildInvoice,
  buildOa,
  buildPi,
  buildPl,
  buildPo,
  buildQuotation,
  buildRfq,
} from './builders'
import {
  createClientSafeOrderDoc,
  createClientSafeQuotation,
  createSupplierSafePo,
  createSupplierSafeRfq,
} from './safe'
import { applyTemplate, templateOptions, type TemplateDefinition } from './template'
import type { DocKind, DocumentData } from './types'

/**
 * A sample document of each kind, from the neutral S11-T01 inputs ("Sample Client LLC", "Example Valve Co"),
 * built through the real builders with the caller's context. Settings › Document templates previews a draft
 * template on it until a kind's record mapper exists (S12, S17, S24) and says so on screen.
 */
export function buildSampleDocument(kind: DocKind, ctx: BuildContext): DocumentData {
  switch (kind) {
    case 'quotation': {
      const { revision: _revision, ...first } = F.QUOTATION
      return buildQuotation(createClientSafeQuotation({ ...first, number: null }), ctx)
    }
    case 'rfq':
      return buildRfq(createSupplierSafeRfq(F.RFQ), ctx)
    case 'po':
      return buildPo(createSupplierSafePo({ ...F.PO, number: null }), ctx)
    case 'oa':
      return buildOa(createClientSafeOrderDoc({ ...F.OA, number: null }), ctx)
    case 'pi':
      return buildPi(createClientSafeOrderDoc({ ...F.PI, number: null }), ctx)
    case 'invoice':
      return buildInvoice(createClientSafeOrderDoc({ ...F.INVOICE, number: null }), ctx)
    case 'cn':
      return buildCreditNote(createClientSafeOrderDoc({ ...F.CREDIT_NOTE, number: null }), ctx)
    case 'dn':
      return buildDn(createClientSafeOrderDoc({ ...F.DELIVERY_NOTE, number: null }), ctx)
    case 'pl':
      return buildPl(createClientSafeOrderDoc({ ...F.PACKING_LIST, number: null }), ctx)
  }
}

/** The sample's offer terms, shown until Settings › Offer terms resolves a client's preset (S11-T06). */
export const SAMPLE_TERMS = F.CTX.terms ?? []

/**
 * A kind's sample rendered through a template (a draft being edited, or the published one): built with the
 * template's columns and pending note, then its block order and switches applied. Pure, so the editor shows
 * the draft as it changes, and the PDF preview draws the same data.
 */
export function previewSample(
  kind: DocKind,
  definition: TemplateDefinition,
  ctx: Omit<BuildContext, 'template'> & { disclaimer?: string | null }
): DocumentData {
  const { disclaimer, ...rest } = ctx
  const data = buildSampleDocument(kind, {
    ...rest,
    terms: rest.terms ?? SAMPLE_TERMS,
    template: {
      ...templateOptions(kind, definition),
      ...(disclaimer !== undefined ? { disclaimer } : {}),
    },
  })
  return applyTemplate(data, definition)
}

/** The neutral enquiry facts a terms preview fills when no enquiry is chosen (no client, no real site). */
export const SAMPLE_TERMS_CONTEXT: Readonly<Record<string, string>> = {
  site: 'Example site',
  port: 'Example port',
  incoterm: 'DAP',
  origin: 'China',
  delivery_date: '30 Jan 2027',
}
