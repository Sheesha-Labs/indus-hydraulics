import { describe, expect, it } from 'vitest'
import type { ClientSafeLine, DocumentData, SupplierSafeLine } from './types'

/**
 * Compile-time proofs (CLAUDE.md §10). Every `@ts-expect-error` below must stay an error: if a supplier
 * or cost field ever becomes assignable to a ClientSafeLine (or a client field to a SupplierSafeLine),
 * the directive is unused and `bun run typecheck` fails. The runtime assertions only keep bun test
 * honest about the fixtures the proofs use.
 */

const clientLine: ClientSafeLine = {
  lineNo: 1,
  partNumber: 'VLV-1001',
  description: 'Gate valve, 2", class 300',
  clientPartNumber: 'SAMPLE-0001',
  qty: '4',
  uom: 'ea',
  unitPrice: '412.50',
  amount: '1,650.00',
  state: 'priced',
}

const supplierLine: SupplierSafeLine = {
  lineNo: 1,
  ourRef: 'Ref 2611-01',
  description: 'Gate valve, 2", class 300',
  qty: '4',
  uom: 'ea',
}

/** A record that knows both sides, as the database does. */
const internalLine = {
  ...clientLine,
  ourRef: 'Ref 2611-01',
  supplierName: 'Example Valve Co',
  unitCost: '300.00',
  landedCost: '318.40',
  margin: '0.23',
}

function takesClientLine(line: ClientSafeLine): ClientSafeLine {
  return line
}
function takesSupplierLine(line: SupplierSafeLine): SupplierSafeLine {
  return line
}

describe('ClientSafeLine', () => {
  it('cannot hold a supplier, cost, landed or margin field', () => {
    // @ts-expect-error: a supplier name never reaches a client
    const a: ClientSafeLine = { ...clientLine, supplierName: 'Example Valve Co' }
    // @ts-expect-error: a supplier ref never reaches a client
    const b: ClientSafeLine = { ...clientLine, supplierRef: 'EVC-Q-0001' }
    // @ts-expect-error: our cost never reaches a client
    const c: ClientSafeLine = { ...clientLine, unitCost: '300.00' }
    // @ts-expect-error: landed cost never reaches a client
    const d: ClientSafeLine = { ...clientLine, landedCost: '318.40' }
    // @ts-expect-error: margin never reaches a client
    const e: ClientSafeLine = { ...clientLine, margin: '0.23' }
    expect([a, b, c, d, e].every((l) => l.lineNo === 1)).toBe(true)
  })

  it('refuses a record that carries supplier fields even through a variable', () => {
    // @ts-expect-error: structural typing would accept the extra fields; the `never` keys refuse them
    const passed = takesClientLine(internalLine)
    expect(passed.partNumber).toBe('VLV-1001')
  })

  it('cannot be passed where a supplier line is expected', () => {
    // @ts-expect-error: the client's part number never reaches a supplier
    const passed = takesSupplierLine(clientLine)
    expect(passed.lineNo).toBe(1)
  })
})

describe('SupplierSafeLine', () => {
  it('cannot hold a client name, client ref, client part number, site or project', () => {
    // @ts-expect-error: the client's name never reaches a supplier
    const a: SupplierSafeLine = { ...supplierLine, clientName: 'Sample Client LLC' }
    // @ts-expect-error: the client's reference never reaches a supplier
    const b: SupplierSafeLine = { ...supplierLine, clientRef: 'SAMPLE/RFQ-0001' }
    // @ts-expect-error: the client's part number never reaches a supplier
    const c: SupplierSafeLine = { ...supplierLine, clientPartNumber: 'SAMPLE-0001' }
    // @ts-expect-error: the client's site never reaches a supplier
    const d: SupplierSafeLine = { ...supplierLine, site: 'Example Site' }
    // @ts-expect-error: the client's project never reaches a supplier
    const e: SupplierSafeLine = { ...supplierLine, project: 'Example Project' }
    expect([a, b, c, d, e].every((l) => l.lineNo === 1)).toBe(true)
  })

  it('refuses a record that carries client fields even through a variable', () => {
    // @ts-expect-error: clientPartNumber and supplierName make the internal record unsafe for a supplier
    const passed = takesSupplierLine(internalLine)
    expect(passed.description).toContain('Gate valve')
  })

  it('accepts a line with only supplier-safe fields', () => {
    expect(takesSupplierLine(supplierLine).ourRef).toBe('Ref 2611-01')
  })
})

describe('DocumentData', () => {
  it('is a union on layout', () => {
    const doc: DocumentData = {
      layout: 'house',
      kind: 'rfq',
      eyebrow: 'Request for quotation',
      title: 'Request for quotation',
      no: 'IH-RFQ-2611-P01',
      meta: [],
      footLabel: 'Valves',
      party: [],
      blocks: [],
    }
    // @ts-expect-error: estimate-only fields do not exist on a house document
    const items = doc.layout === 'house' ? doc.items : undefined
    expect(items).toBeUndefined()
  })
})
