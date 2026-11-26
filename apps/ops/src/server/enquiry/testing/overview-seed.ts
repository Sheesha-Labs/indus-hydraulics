import type { PrismaClient } from '@indus/ops-db'

/**
 * Test and parity seed for board 05 (S09-T03): one enquiry in Quotes in with twelve lines, five neutral
 * suppliers, the RFQs that carried the lines, confirmed quotes with their prices (USD, FX locked at 3.6725) and
 * the lowest price selected per line. Line 12 is still awaiting its supplier. Local databases only.
 */
export const BOARD05_SUPPLIERS = [
  'Sample Valves Co',
  'Test Actuation Co',
  'Demo Bearings Co',
  'Mock Instruments Co',
  'Trial Sealing Co',
] as const

type Sup = 0 | 1 | 2 | 3 | 4

/** [client PN, description, qty, quotes by supplier index: [unit price USD, lead weeks]]. */
export const BOARD05_LINES: ReadonlyArray<
  readonly [string, string, number, Partial<Record<Sup, readonly [number, number]>>]
> = [
  ['SC-VLV-GT-06-300', 'Gate valve 6" CL300, WCB, flanged RF', 8, { 0: [1840, 10], 1: [1690, 14] }],
  ['SC-VLV-GT-02-800', 'Gate valve 2" CL800, A105, socket weld', 24, { 0: [410, 8], 1: [385, 12] }],
  ['SC-VLV-BL-04-150', 'Ball valve 4" CL150, floating, SS316', 12, { 1: [960, 6], 0: [1120, 9] }],
  ['SC-VLV-GL-03-600', 'Globe valve 3" CL600, WCB, flanged RF', 6, { 0: [2650, 12] }],
  ['SC-ACT-DA-04', 'Pneumatic actuator, double-acting, 4"', 12, { 1: [1480, 8] }],
  ['SC-BRG-6316-C3', 'Deep groove ball bearing 6316, C3', 40, { 2: [64, 4] }],
  ['SC-BRG-22218-E', 'Spherical roller bearing 22218 E', 16, { 2: [395, 6] }],
  ['SC-INS-PT-100B', 'Pressure transmitter 0–100 bar, HART', 10, { 3: [1210, 5] }],
  ['SC-INS-TT-PT100', 'Temperature transmitter, RTD PT100', 14, { 3: [540, 5] }],
  ['SC-SEL-CT-55', 'Cartridge mechanical seal 55 mm', 6, { 4: [2980, 7] }],
  ['SC-GSK-SW-06-300', 'Spiral wound gasket 6" CL300', 120, { 4: [38, 3], 0: [44, 5] }],
  ['SC-INS-LG-1200', 'Magnetic level gauge 1200 mm C-C', 4, {}],
]

/** Which suppliers each RFQ went to and which line numbers it carried. */
const RFQS: ReadonlyArray<readonly [Sup, number[], 'quoted' | 'partial_quote' | 'sent']> = [
  [0, [1, 2, 3, 4, 11], 'quoted'],
  [1, [1, 2, 3, 5], 'quoted'],
  [2, [6, 7], 'quoted'],
  [3, [8, 9, 12], 'partial_quote'],
  [4, [10, 11], 'quoted'],
]

export interface Board05Seed {
  enquiryId: string
  ref: string
  supplierIds: string[]
  lineIds: string[]
}

export async function seedBoard05(
  db: PrismaClient,
  opts: { tag: string; ref: string; ownerId?: string | null; rfqPrefix: string }
): Promise<Board05Seed> {
  const client = await db.company.create({ data: { name: 'Sample Client LLC', isClient: true } })
  const supplierIds: string[] = []
  for (const name of BOARD05_SUPPLIERS)
    supplierIds.push((await db.company.create({ data: { name, isSupplier: true } })).id)
  const now = Date.now()
  const e = await db.enquiry.create({
    data: {
      ref: opts.ref,
      title: 'Plant turnaround spares — valves, bearings & instruments',
      clientId: client.id,
      clientRef: 'SC/MM/26-0001',
      receivedVia: 'email',
      receivedAt: new Date(now - 9 * 86_400_000),
      deadline: new Date(now + 8 * 86_400_000),
      stage: 'quotes_in',
      ownerId: opts.ownerId ?? null,
      lines: {
        create: BOARD05_LINES.map(([pn, d, qty, q], i) => ({
          no: i + 1,
          clientPartNo: pn,
          description: d,
          qty,
          status: Object.keys(q).length ? ('quoted' as const) : ('sourcing' as const),
          quotedByCount: Object.keys(q).length,
        })),
      },
    },
    select: { id: true, lines: { orderBy: { no: 'asc' }, select: { id: true } } },
  })
  const lineIds = e.lines.map((l) => l.id)
  const chase = new Date(now - 2 * 86_400_000)
  for (const [i, [sup, lines, status]] of RFQS.entries()) {
    const rfq = await db.supplierRfq.create({
      data: {
        ref: `IH-RFQ-${opts.rfqPrefix}-P${String(i + 7).padStart(2, '0')}`,
        enquiryId: e.id,
        status: 'sent',
        lines: {
          create: lines.map((n, p) => ({
            lineId: lineIds[n - 1]!,
            position: p + 1,
            qtyAsked: BOARD05_LINES[n - 1]![2],
          })),
        },
        recipients: {
          create: [
            {
              supplierId: supplierIds[sup]!,
              status,
              sentAt: new Date(now - 7 * 86_400_000),
              ...(status === 'partial_quote' ? { lastChasedAt: chase, chasersSent: 1 } : {}),
            },
          ],
        },
      },
    })
    void rfq
  }
  // One confirmed quote per supplier, every line it priced; the cheapest per line is selected.
  const best = new Map<number, { quoteLineId: string; price: number }>()
  for (const [s, supplierId] of supplierIds.entries()) {
    const priced = BOARD05_LINES.flatMap((line, i) => {
      const q = line[3][s as Sup]
      return q ? [[i + 1, q] as const] : []
    })
    if (!priced.length) continue
    const quote = await db.supplierQuote.create({
      data: {
        enquiryId: e.id,
        supplierId,
        receivedAt: new Date(now - 4 * 86_400_000),
        status: 'confirmed',
        currency: 'USD',
        fxRateToAed: '3.6725',
        fxLockedAt: new Date(now - 4 * 86_400_000),
        supplierRef: `${opts.tag}-${s}`,
      },
    })
    for (const [n, [price]] of priced) {
      const ql = await db.supplierQuoteLine.create({
        data: {
          quoteId: quote.id,
          enquiryLineId: lineIds[n - 1]!,
          unitPrice: String(price),
          qtyOffered: BOARD05_LINES[n - 1]![2],
        },
        select: { id: true },
      })
      const cur = best.get(n)
      if (!cur || price < cur.price) best.set(n, { quoteLineId: ql.id, price })
    }
  }
  for (const [n, b] of best)
    await db.enquiryLine.update({
      where: { id: lineIds[n - 1]! },
      data: { selectedQuoteLineId: b.quoteLineId },
    })
  return { enquiryId: e.id, ref: opts.ref, supplierIds, lineIds }
}
