import { Prisma, type PrismaClient } from '@indus/ops-db'

/**
 * Test and parity seed for boards 11 and 12 (S10-T02): six neutral clients in the boards' order, each quoting in
 * BHD so `/clients?ccy=BHD` isolates them (and their KPI row) from anything else in the local database. Each has
 * enquiries, open leads, sent quotations (USD at the locked 3.6725) and orders. The first client carries board 12:
 * three contacts, five enquiries in the board's stages, six quotations, two leads, trades for "What they buy" and
 * lost reasons. Local databases only.
 */
export const BOARD11_CLIENTS = [
  ['Sample Petrochem Services', 'Abu Dhabi', 'AE', 'Oil & gas', 3, 1, '2410000', '860000'],
  ['Sample Power & Water', 'Sharjah', 'AE', 'Utilities', 2, 1, '1120000', '410000'],
  ['Sample Marine Engineering', 'Dubai', 'AE', 'Marine', 2, 0, '980000', '220000'],
  ['Sample Steel Works', 'Jeddah', 'SA', 'Steel', 1, 2, '740000', '310000'],
  ['Sample Utilities', 'Doha', 'QA', 'Utilities', 2, 0, '520000', '90000'],
  ['Sample Cement', 'Ras Al Khaimah', 'AE', 'Cement', 1, 1, '310000', '120000'],
] as const

const FX = new Prisma.Decimal('3.6725')

export interface ClientsSeed {
  clientIds: string[]
  enquiryIds: string[]
  tradeIds: string[]
}

export async function seedClients(db: PrismaClient, tag: string): Promise<ClientsSeed> {
  const out: ClientsSeed = { clientIds: [], enquiryIds: [], tradeIds: [] }
  const stamp = Date.now().toString().slice(-5)
  let n = 0
  const ref = () => `ENQ-2096-${stamp}${String(++n).padStart(3, '0')}`
  const now = Date.now()
  const daysAgo = (d: number) => new Date(now - d * 86_400_000)
  const yearStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 2))
  const ytd = (d: number) => new Date(Math.max(yearStart.getTime(), now - d * 86_400_000))

  // Board 12's trades by fixed slug (shared across runs; never archived by the seed).
  const trades = await Promise.all(
    ['Valves & actuation', 'Instrumentation', 'Seals & gaskets', 'Bearings'].map((name, i) =>
      db.trade.upsert({
        where: { slug: `parity-b12-${i}` },
        create: { name, slug: `parity-b12-${i}` },
        update: {},
        select: { id: true },
      })
    )
  )
  out.tradeIds = trades.map((t) => t.id)
  const groupFor = async (enquiryId: string, tradeIdx: number) =>
    (
      await db.tradeGroup.create({
        data: { enquiryId, name: `G${tradeIdx}`, tradeId: trades[tradeIdx]!.id },
        select: { id: true },
      })
    ).id

  for (const [
    i,
    [name, city, country, industry, enquiries, leads, quoted, won],
  ] of BOARD11_CLIENTS.entries()) {
    const c = await db.company.create({
      data: {
        name: i === 0 ? name : `${name}`,
        aliases: [`${name} ${tag}`],
        isClient: true,
        city,
        country,
        industry,
        clientProfile: {
          create: {
            quotingCurrency: 'BHD',
            clientSince: new Date(Date.UTC(2021, 0, 1)),
            vendorCode: i === 0 ? 'SPS-0417' : null,
            paymentTermsText: i === 0 ? '30 days' : null,
          },
        },
      },
      select: { id: true },
    })
    out.clientIds.push(c.id)
    for (let k = 0; k < leads; k++)
      await db.lead.create({
        data: {
          ref: `L-9${stamp}${i}${k}`,
          name: name,
          companyId: c.id,
          title: k === 0 ? 'Pump station instrumentation' : 'Compressor overhaul spares',
          source: 'email',
          stage: 'new',
          estValue: new Prisma.Decimal(i === 0 ? 120000 : 60000),
          estCurrency: 'USD',
        },
      })
    // Board 11's own rows: enquiries this year (the last one sets "Last RFQ"), one sent quotation and one order.
    const lastDays = [74, 68, 67, 68, 69, 67][i]!
    let quotationEnquiry = ''
    for (let k = 0; k < (i === 0 ? 0 : enquiries); k++) {
      const e = await db.enquiry.create({
        data: {
          ref: ref(),
          title: `Enquiry ${k + 1}`,
          receivedVia: 'email',
          receivedAt: ytd(lastDays + k * 9),
          clientId: c.id,
          stage: 'quoted',
        },
        select: { id: true },
      })
      out.enquiryIds.push(e.id)
      if (k === 0) quotationEnquiry = e.id
    }
    if (i === 0) continue // board 12 seeds the first client's quotations and orders below
    const usdQuoted = new Prisma.Decimal(quoted).div(FX)
    const q = await db.quotation.create({
      data: {
        enquiryId: quotationEnquiry,
        clientId: c.id,
        number: `INDUS/Q9${stamp}${i}`,
        currency: 'USD',
        vatTreatment: 'export_zero_rated',
        status: 'sent',
        sentAt: ytd(lastDays),
        total: usdQuoted.mul(FX).div(FX).toDecimalPlaces(4),
        fxRateToAed: FX,
      },
      select: { id: true },
    })
    await db.order.create({
      data: {
        ref: `SO-9${stamp}${i}`,
        enquiryId: quotationEnquiry,
        quotationId: q.id,
        clientId: c.id,
        clientPoNumber: `PO-${i}`,
        currency: 'USD',
        orderValue: new Prisma.Decimal(won).div(FX).toDecimalPlaces(4),
        total: new Prisma.Decimal(won).div(FX).toDecimalPlaces(4),
        estimateAed: { marginPct: '17.2' },
      },
    })
  }

  // Board 12: the first client.
  const id = out.clientIds[0]!
  await db.contact.createMany({
    data: [
      {
        companyId: id,
        name: 'Omar Example',
        email: `procurement.${tag}@sample-petrochem.example`,
        role: 'Procurement lead',
        isPreferred: true,
        sourceKind: 'manual',
      },
      {
        companyId: id,
        name: 'Layla Example',
        email: `maintenance.${tag}@sample-petrochem.example`,
        role: 'Maintenance planner',
        sourceKind: 'manual',
      },
      {
        companyId: id,
        name: 'Tariq Example',
        email: `buyer.${tag}@sample-petrochem.example`,
        role: 'Buyer',
        sourceKind: 'manual',
      },
    ],
  })
  const B12: ReadonlyArray<readonly [string, number, string, string, number, string | null]> = [
    ['Turnaround spares', 12, '312000', 'quotes_in', 74, null],
    ['Control valve trims', 6, '226000', 'negotiation', 115, null],
    ['Instrument air dryers', 3, '64000', 'sourcing', 78, null],
    ['Compressor seal kits', 9, '184000', 'won', 130, null],
    ['Heat exchanger gaskets', 22, '142000', 'lost', 170, 'price'],
  ]
  const eIds: string[] = []
  for (const [k, [title, lines, value, stage, days, lost]] of B12.entries()) {
    const e = await db.enquiry.create({
      data: {
        ref: ref(),
        title,
        receivedVia: 'email',
        receivedAt: daysAgo(days),
        clientId: id,
        stage: stage as never,
        estValueMax: new Prisma.Decimal(value),
        estCurrency: 'USD',
        ...(lost ? { lostReason: lost as never, closedAt: daysAgo(days - 20) } : {}),
      },
      select: { id: true },
    })
    eIds.push(e.id)
    out.enquiryIds.push(e.id)
    const g = await groupFor(e.id, [0, 0, 1, 2, 2][k]!)
    await db.enquiryLine.createMany({
      data: Array.from({ length: lines }, (_, j) => ({
        enquiryId: e.id,
        no: j + 1,
        description: `Line ${j + 1}`,
        qty: new Prisma.Decimal(1),
        tradeGroupId: j < lines - 1 || k !== 0 ? g : null,
      })),
    })
  }
  const Q: ReadonlyArray<readonly [string, string, number, string, string, string]> = [
    ['R2', 'Control valve trims', 91, '226000', '16.1', 'sent'],
    ['', 'Control valve trims', 107, '241000', '19.4', 'superseded'],
    ['', 'Compressor seal kits', 123, '184000', '18.0', 'won'],
    ['', 'Heat exchanger gaskets', 172, '142000', '21.5', 'lost'],
    ['R3', 'Pump bearings & couplings', 197, '97000', '15.2', 'won'],
    ['', 'Level instrumentation', 238, '118000', '17.8', 'evaluating'],
  ]
  for (const [k, [rev, , days, total, margin, status]] of Q.entries()) {
    const q = await db.quotation.create({
      data: {
        enquiryId: eIds[Math.min(k, eIds.length - 1)]!,
        clientId: id,
        number: `INDUS/Q8${stamp}${k}${rev ? `-${rev}` : ''}`,
        currency: 'USD',
        vatTreatment: 'export_zero_rated',
        status: status as never,
        sentAt: daysAgo(days),
        total: new Prisma.Decimal(total),
        fxRateToAed: FX,
        marginPct: new Prisma.Decimal(margin),
      },
      select: { id: true },
    })
    if (status === 'won')
      await db.order.create({
        data: {
          ref: `SO-8${stamp}${k}`,
          enquiryId: eIds[3]!,
          quotationId: q.id,
          clientId: id,
          clientPoNumber: `PO-SPS-${k}`,
          currency: 'USD',
          orderValue: new Prisma.Decimal(total),
          total: new Prisma.Decimal(total),
          estimateAed: { marginPct: margin },
        },
      })
  }
  return out
}

/** Board-11 rows leave the list (archived) so later runs and other tests do not see them. */
export async function archiveClients(db: PrismaClient, seed: ClientsSeed): Promise<void> {
  await db.enquiry.updateMany({
    where: { id: { in: seed.enquiryIds } },
    data: { closedAt: new Date() },
  })
  await db.company.updateMany({
    where: { id: { in: seed.clientIds } },
    data: { archivedAt: new Date() },
  })
}
