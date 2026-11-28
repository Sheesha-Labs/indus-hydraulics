import { readFileSync } from 'node:fs'
import { describe, expect, expectTypeOf, it } from 'vitest'
import * as F from './__fixtures__/inputs'
import { buildPo, buildQuotation, buildRfq } from './builders'
import { CLIENT_COLUMNS, SUPPLIER_COLUMNS } from './columns'
import {
  createClientSafeQuotation,
  createSupplierSafePo,
  createSupplierSafeRfq,
  type ClientSafeQuotation,
  type QuotationInput,
  type RfqInput,
  type SupplierSafeRfq,
} from './safe'

/**
 * Compile-time proofs (S11-T01, CLAUDE.md §10). Every `@ts-expect-error` must stay an error: if a client field
 * ever becomes assignable to an RFQ or PO input, or a supplier, cost or margin field to a client input, the
 * directive is unused and `bun check` fails. The brand means a builder takes only what a factory made.
 */

describe('safe inputs (type proofs)', () => {
  it('an RFQ input rejects client identity; a quotation input rejects supplier, cost and margin', () => {
    // Compiled, never run: the factories would also refuse these at run time.
    const proofs = () => {
      createSupplierSafeRfq({
        ...F.RFQ,
        // @ts-expect-error a client name never reaches a supplier
        clientName: 'Sample Client LLC',
      })
      createSupplierSafeRfq({
        ...F.RFQ,
        // @ts-expect-error nor the client's reference
        clientRef: 'SAMPLE/RFQ-0001',
      })
      createSupplierSafeRfq({
        ...F.RFQ,
        // @ts-expect-error nor the ENQ ref
        enquiryRef: 'ENQ-2026-0001',
      })
      createSupplierSafePo({
        ...F.PO,
        // @ts-expect-error a PO line cannot carry the client's part number
        lines: [{ ...F.PO.lines[0]!, clientPartNumber: 'SAMPLE-V-0101' }],
      })
      createClientSafeQuotation({
        ...F.QUOTATION,
        // @ts-expect-error a supplier name never reaches a client
        supplierName: 'Example Valve Co',
      })
      createClientSafeQuotation({
        ...F.QUOTATION,
        // @ts-expect-error nor our cost
        lines: [{ ...F.QUOTATION.lines[0]!, costAed: '300' }],
      })
      createClientSafeQuotation({
        ...F.QUOTATION,
        // @ts-expect-error nor the margin
        marginPct: '18',
      })
    }
    expect(typeof proofs).toBe('function')
  })

  it('builders take only branded inputs made by a factory', () => {
    const plainQuote: QuotationInput = F.QUOTATION
    const plainRfq: RfqInput = F.RFQ
    const proofs = () => {
      // @ts-expect-error a plain object is not ClientSafe
      buildQuotation(plainQuote, F.CTX)
      // @ts-expect-error a plain object is not SupplierSafe
      buildRfq(plainRfq, F.CTX)
      // @ts-expect-error a client-safe quotation is not a supplier-safe PO
      buildPo(createClientSafeQuotation(F.QUOTATION), F.CTX)
    }
    expect(typeof proofs).toBe('function')
    expectTypeOf(createClientSafeQuotation(F.QUOTATION)).toEqualTypeOf<ClientSafeQuotation>()
    expectTypeOf(createSupplierSafeRfq(F.RFQ)).toEqualTypeOf<SupplierSafeRfq>()
  })
})

describe('columns', () => {
  it('no supplier, cost, landed or margin column exists, in the lists or anywhere in the module', () => {
    const keys = [...CLIENT_COLUMNS, ...SUPPLIER_COLUMNS].join(' ')
    expect(keys).not.toMatch(/supplier|cost|landed|margin/i)
    const src = readFileSync(new URL('./columns.ts', import.meta.url), 'utf8')
      .split('\n')
      .filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l))
      .join('\n')
    expect(src).not.toMatch(/['"](supplier|cost|landed|margin)[A-Za-z]*['"]/i)
  })
})
