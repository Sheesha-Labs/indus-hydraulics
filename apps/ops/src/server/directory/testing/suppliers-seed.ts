import { Prisma, type PrismaClient } from '@indus/ops-db'

/**
 * Test and parity seed for boards 128 and 129 (S10-T03): fourteen neutral suppliers in the board's order and
 * states, all carrying one "parity" trade so `/suppliers?trade=<id>` isolates them; the sixth carries board 129
 * (line cards with quote counts, one locator-verified brand and one claimed, a reliability paragraph, a preferred
 * verified contact and a bouncing one, two certificates). Figures are written straight onto the profile, as the
 * nightly job would. Local databases only.
 */
type Row = readonly [
  name: string,
  type: string,
  tier: string,
  country: string,
  city: string,
  categories: readonly string[],
  rfqs: number,
  reply: number | null,
  medianH: number | null,
  win: number | null,
  lastDays: number,
  ccy: string,
]

export const BOARD128: readonly Row[] = [
  [
    'Example Armaturen GmbH',
    'principal',
    'principal',
    'DE',
    'Essen',
    ['Gate, globe valves', 'actuators'],
    38,
    95,
    50,
    34,
    16,
    'EUR',
  ],
  [
    'Example Valvole S.p.A.',
    'principal',
    'principal',
    'IT',
    'Brescia',
    ['Floating ball valves', 'actuators', 'trims'],
    41,
    93,
    43,
    41,
    15,
    'EUR',
  ],
  [
    'Sample Instruments Ltd',
    'distributor',
    'approved',
    'GB',
    'Leeds',
    ['Transmitters & gauges', 'gauges', 'level'],
    29,
    86,
    82,
    28,
    17,
    'GBP',
  ],
  [
    'Sample Bearings LLC',
    'stockist',
    'approved',
    'AE',
    'Deira',
    ['Ball bearings', 'housings', 'seals'],
    64,
    98,
    10,
    52,
    14,
    'AED',
  ],
  [
    'Sample Seals Trading',
    'stockist',
    'approved',
    'AE',
    'Sharjah',
    ['Seals', 'O-rings', 'gaskets'],
    22,
    91,
    14,
    31,
    18,
    'AED',
  ],
  [
    'Example Seiki Co.',
    'distributor',
    'approved',
    'JP',
    'Osaka',
    ['Roller bearings', 'instrumentation'],
    18,
    72,
    96,
    17,
    30,
    'JPY',
  ],
  [
    'Example Sealing Co.',
    'manufacturer',
    'approved',
    'US',
    'Houston',
    ['Mechanical seals', 'gaskets'],
    15,
    80,
    62,
    20,
    32,
    'USD',
  ],
  [
    'Sample Hydroseal Industries',
    'manufacturer',
    'trial',
    'IN',
    'Pune',
    ['Seal kits', 'hydraulic seals'],
    4,
    50,
    72,
    0,
    53,
    'INR',
  ],
  [
    'Sample Screens Co.',
    'manufacturer',
    'trial',
    'CN',
    'Shenzhen',
    ['Shale-shaker screens'],
    3,
    100,
    29,
    33,
    19,
    'USD',
  ],
  [
    'Sample Electricals',
    'local_shop',
    'approved',
    'AE',
    'Deira',
    ['Limit switches', 'relays'],
    12,
    92,
    12,
    42,
    14,
    'AED',
  ],
  [
    'Sample Downhole Supplies FZE',
    'stockist',
    'contact_only',
    'AE',
    'Jebel Ali',
    ['ESP penetrators', 'pigtails'],
    1,
    null,
    null,
    null,
    14,
    'AED',
  ],
  [
    'Example Penetrator Works',
    'manufacturer',
    'contact_only',
    'IN',
    'Gujarat',
    ['ESP penetrators'],
    1,
    null,
    null,
    null,
    14,
    'USD',
  ],
  [
    'Sample Oilfield Trading LLC',
    'trader',
    'contact_only',
    'AE',
    'Abu Dhabi',
    ['Oilfield spares'],
    2,
    0,
    null,
    null,
    25,
    'AED',
  ],
  [
    'Example Valve Supply Ltd',
    'trader',
    'blocked',
    'HK',
    '',
    ['Valve parts'],
    3,
    67,
    48,
    0,
    105,
    'USD',
  ],
] as const

export interface SuppliersSeed {
  supplierIds: string[]
  parityTradeId: string
  profileId: string
}

export async function seedSuppliers(db: PrismaClient, tag: string): Promise<SuppliersSeed> {
  const parity = await db.trade.upsert({
    where: { slug: 'parity-b128' },
    create: { name: 'Parity sample suppliers', slug: 'parity-b128', position: 999 },
    update: {},
    select: { id: true },
  })
  const tradeId = async (name: string) =>
    (await db.trade.findUnique({ where: { name }, select: { id: true } }))?.id ??
    (
      await db.trade.upsert({
        where: { slug: `parity-b128-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
        create: {
          name: `${name}`,
          slug: `parity-b128-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          parentId: parity.id,
          position: 999,
        },
        update: {},
        select: { id: true },
      })
    ).id
  const now = Date.now()
  const ids: string[] = []
  for (const [
    name,
    type,
    tier,
    country,
    city,
    cats,
    rfqs,
    reply,
    medianH,
    win,
    lastDays,
    ccy,
  ] of BOARD128) {
    const c = await db.company.create({
      data: {
        name,
        aliases: [`${name} ${tag}`],
        isSupplier: true,
        country,
        city: city || null,
        primaryDomain: `${tag}-${ids.length}.example`,
        domains: [`${tag}-${ids.length}.example`],
        supplierProfile: {
          create: {
            type: type as never,
            tier: tier as never,
            quotesCurrency: ccy,
            rfqsAsked: rfqs,
            repliesCount: reply === null ? 0 : Math.round((rfqs * reply) / 100),
            replyRatePct: reply === null ? null : new Prisma.Decimal(reply),
            medianReplyHours: medianH === null ? null : new Prisma.Decimal(medianH),
            winSharePct: win === null ? null : new Prisma.Decimal(win),
            lastQuoteAt: new Date(now - lastDays * 86_400_000),
            ...(tier === 'blocked'
              ? { blockReason: 'counterfeit', blockedAt: new Date(now - 30 * 86_400_000) }
              : {}),
          },
        },
      },
      select: { id: true },
    })
    ids.push(c.id)
    for (const cat of cats)
      await db.supplierLineCard.create({ data: { supplierId: c.id, tradeId: await tradeId(cat) } })
  }

  // Board 129: the third row.
  const id = ids[2]!
  await db.company.update({
    where: { id },
    data: { website: 'https://sample-instruments.example' },
  })
  await db.supplierProfile.update({
    where: { companyId: id },
    data: {
      usualIncoterm: 'FCA',
      usualIncotermPlace: 'Leeds',
      tierSince: new Date(Date.UTC(2025, 5, 3)),
      quotesCount: 25,
      posCount: 4,
      repliesCount: 25,
      reliabilitySummary:
        'Replies in about 3 days, quotes 86% of lines asked, delivered late 1 of 4 times. Safe for instruments; ask a second supplier when the deadline is under a week.\nFrom 29 RFQs, 25 quotes and 4 POs since Mar 2025',
    },
  })
  await db.supplierLineCard.deleteMany({ where: { supplierId: id } })
  const carry: ReadonlyArray<readonly [string, number, string | null, boolean, string | null]> = [
    ['Pressure transmitters', 14, 'HART', true, 'https://maker.example/locator'],
    ['Temperature transmitters', 9, null, false, null],
    ['Level gauges', 6, 'Magnetic', false, 'https://sample-instruments.example/level'],
    ['Pressure gauges', 5, null, false, null],
    ['Flow meters', 2, null, false, null],
  ]
  for (const [trade, n, brand, authorised, evidence] of carry)
    await db.supplierLineCard.create({
      data: {
        supplierId: id,
        tradeId: await tradeId(trade),
        brand,
        authorised,
        evidenceUrl: evidence,
        verifiedAt: authorised ? new Date(now - 25 * 86_400_000) : null,
        timesQuoted: n,
      },
    })
  await db.contact.createMany({
    data: [
      {
        companyId: id,
        name: 'Sarah Example',
        role: 'Sales',
        email: `sales.${tag}@sample-instruments.example`,
        phone: '+44 113 000 0000',
        isPreferred: true,
        sourceKind: 'verified_on_page',
        sourceUrl: 'https://sample-instruments.example/contact',
      },
      {
        companyId: id,
        name: 'J. Example',
        role: 'Quotes',
        email: `quotes.${tag}@sample-instruments.example`,
        status: 'bouncing',
        bouncedAt: new Date(now - 24 * 86_400_000),
        sourceKind: 'email_header',
      },
    ],
  })
  const inDays = (d: number) =>
    new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + d)
    )
  await db.complianceDocument.createMany({
    data: [
      {
        companyId: id,
        kind: 'iso_certificate',
        title: 'ISO 9001 certificate',
        expiresAt: inDays(580),
      },
      {
        companyId: id,
        kind: 'atex_certificate',
        title: 'ATEX certificate · level gauges',
        expiresAt: inDays(17),
      },
    ],
  })
  await db.screeningCheck.create({
    data: {
      companyId: id,
      kind: 'sanctions',
      result: 'clear',
      checkedAt: new Date(now - 25 * 86_400_000),
    },
  })
  return { supplierIds: ids, parityTradeId: parity.id, profileId: id }
}

/** Seeded suppliers leave every list (archived). */
export async function archiveSuppliers(db: PrismaClient, seed: SuppliersSeed): Promise<void> {
  await db.company.updateMany({
    where: { id: { in: seed.supplierIds } },
    data: { archivedAt: new Date() },
  })
}

/** Board 50: a draft supplier on the Documents step, seven of nine in (neutral names). */
export async function seedOnboardingDraft(
  db: PrismaClient,
  tag: string,
  ownerId: string
): Promise<string> {
  const c = await db.company.create({
    data: {
      name: 'Example Hidrolik Sanayi A.Ş.',
      legalName: 'Example Hidrolik Sanayi A.Ş.',
      aliases: [`Example Hidrolik ${tag}`],
      isSupplier: true,
      country: 'TR',
      website: 'examplehidrolik.example',
      domains: [`${tag}-ob.example`],
      supplierProfile: {
        create: {
          type: 'manufacturer',
          onboardingStatus: 'draft',
          proposedById: ownerId,
          proposedAt: new Date(Date.now() - 23 * 86_400_000),
          address: 'Example OSB, 34490 Istanbul',
          registryNo: '482117',
          taxId: '0681 224 590',
          foundedYear: 1998,
          staffCount: 240,
          introducedBy: 'Example Armaturen · referral',
          quoteCurrencies: ['EUR', 'USD'],
        },
      },
    },
    select: { id: true },
  })
  await db.contact.createMany({
    data: [
      {
        companyId: c.id,
        role: 'Sales',
        name: 'Emre Example',
        email: `sales.${tag}@examplehidrolik.example`,
        sourceKind: 'manual',
        isPreferred: true,
      },
      {
        companyId: c.id,
        role: 'Accounts',
        name: 'Selin Example',
        email: `accounts.${tag}@examplehidrolik.example`,
        sourceKind: 'manual',
      },
      {
        companyId: c.id,
        role: 'Quality',
        name: 'Murat Example',
        email: `qa.${tag}@examplehidrolik.example`,
        sourceKind: 'manual',
      },
    ],
  })
  const y = new Date().getUTCFullYear()
  const docs: Array<[string, string, string | null, string | null, Date | null]> = [
    ['trade_licence', 'received', 'Example Chamber of Commerce', '482117', null],
    ['vat_certificate', 'received', null, 'VKN 0681 224 590', null],
    [
      'iso_certificate',
      'received',
      'Example certifier',
      'cert 12 100 4471',
      new Date(Date.UTC(y + 1, 2, 14)),
    ],
    ['approval', 'received', 'EN 853 / EN 856 type tests', null, new Date(Date.UTC(y + 1, 5, 2))],
    ['bank_letter', 'received', 'TEST BANK', 'USD and EUR accounts', null],
    ['company_profile', 'received', null, 'PDF · 18 pages', null],
    ['code_of_conduct', 'awaiting_signature', null, null, null],
    ['nda', 'signed', null, null, null],
    ['ownership_declaration', 'requested', null, null, null],
  ]
  for (const [kind, status, issuer, number, expiresAt] of docs)
    await db.complianceDocument.create({
      data: {
        companyId: c.id,
        kind: kind as never,
        title: kind,
        status,
        issuer,
        number,
        expiresAt,
      },
    })
  return c.id
}

/** Board 51: the board-50 draft under review with its screening, a verified bank call-back and the recommendation. */
export async function seedVetting(
  db: PrismaClient,
  supplierId: string,
  ownerId: string,
  helperId: string
): Promise<void> {
  const lists: Array<[string, string, string, string]> = [
    [
      'UN Security Council consolidated list',
      'sanctions',
      'Company, 3 owners, 2 directors',
      'clear',
    ],
    ['US OFAC SDN and sectoral lists', 'sanctions', 'Company, owners, bank', 'clear'],
    ['EU and UK consolidated lists', 'sanctions', 'Company, owners', 'clear'],
    ['UAE local terrorist list', 'sanctions', 'Company, owners', 'clear'],
    [
      'Country of origin',
      'country_of_origin',
      'Türkiye · no restriction on hydraulic components',
      'clear',
    ],
    ['Re-export risk', 're_export', 'Code of conduct not yet signed', 'open'],
    ['Adverse media', 'adverse_media', 'No matches in the last 5 years', 'clear'],
  ]
  const at = new Date(Date.now() - 20 * 86_400_000)
  for (const [listName, kind, scope, result] of lists)
    await db.screeningCheck.create({
      data: {
        companyId: supplierId,
        kind: kind as never,
        listName,
        scope,
        result: result as never,
        checkedAt: at,
        checkedById: helperId,
      },
    })
  await db.supplierProfile.update({
    where: { companyId: supplierId },
    data: { onboardingStatus: 'under_review', registryPhone: '+90 212 000 4400' },
  })
  await db.supplierBankAccount.create({
    data: {
      supplierId,
      bankName: 'TEST BANK · Istanbul branch',
      accountName: 'EXAMPLE HIDROLIK SANAYI A.S.',
      currency: 'EUR',
      ibanEnc: Buffer.from('sealed-test'),
      ibanLast4: '8745',
      swift: 'TESTTRIS',
      status: 'verified',
      nameMatchesRegistry: true,
      letterMatchesIban: true,
      callbackNumber: '+90 212 000 4400',
      callbackNumberSource: 'registry',
      callbackSpokeTo: 'Selin Example',
      callbackSpokeToRole: 'Accounts',
      callbackAt: at,
      callbackRecordedById: ownerId,
      callbackGenuine: true,
      callbackOutcome: 'genuine',
      verifiedAt: at,
    },
  })
  await db.supplierApproval.create({
    data: {
      supplierId,
      decision: 'propose',
      fromTier: 'contact_only',
      toTier: 'contact_only',
      reason: 'fills a gap in 4SH hose',
      decidedById: helperId,
      decidedAt: at,
    },
  })
}

/** Board 52: hydraulics line cards on the board-50 draft (needs the trade taxonomy seed). */
export async function seedLineCard(db: PrismaClient, supplierId: string): Promise<void> {
  const rows: Array<[string, string | null, boolean]> = [
    ['hydraulics-hydraulic-hose', 'EN 853 1SN/2SN, EN 856 4SP/4SH/R13, SAE 100R2AT', true],
    ['hydraulics-hose-fittings', 'JIC, ORFS, BSP, DIN 24°, interlock', true],
    ['hydraulics-adapters', 'Crimped and tested, with DNV certificate', true],
    ['hydraulics-quick-couplings', 'ISO 7241-A/B, flat face ISO 16028', true],
    ['industrial-hose', 'Water, air, oil suction and delivery', false],
  ]
  for (const [slug, note, carried] of rows) {
    const t = await db.trade.findUnique({ where: { slug }, select: { id: true } })
    if (!t) continue
    await db.supplierLineCard.create({
      data: {
        supplierId,
        tradeId: t.id,
        specNote: note,
        status: carried ? 'trial' : 'not_carried',
        version: 1,
      },
    })
  }
  await db.supplierProfile.update({
    where: { companyId: supplierId },
    data: {
      usualIncoterm: 'FCA',
      usualIncotermPlace: 'Istanbul',
      quotesCurrency: 'EUR',
      defaultPaymentTerms: '30% advance, 70% before shipment',
      validityDays: 30,
      leadTimeText: '4–6 weeks',
      moqText: 'Hose 100 m per size',
      documentsWithPo: ['EN 10204 3.1', 'CoC', 'CoO'],
      expectedReplyDays: 3,
    },
  })
}
