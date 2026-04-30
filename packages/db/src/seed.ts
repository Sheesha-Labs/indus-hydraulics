/**
 * Seed script — idempotent. Running twice produces the same state.
 * Run: pnpm --filter=@indus/db seed
 */
import { PrismaClient } from '../generated/client'
import crypto from 'crypto'

const db = new PrismaClient()

async function hash(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hashBuf = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256')
  return `${salt}:${hashBuf.toString('hex')}`
}

async function main() {
  console.log('🌱 Seeding database…')

  // ── Brands ─────────────────────────────────────────────────────────────────
  const brands = await Promise.all([
    db.brand.upsert({
      where: { slug: 'bosch-rexroth' },
      create: {
        name: 'Bosch Rexroth',
        slug: 'bosch-rexroth',
        country: 'Germany',
        isAuthorizedDistributor: true,
        isPublished: true,
        seoTitle: 'Bosch Rexroth Hydraulics',
        seoDescription: 'Authorized distributor of Bosch Rexroth hydraulic components.',
      },
      update: {},
    }),
    db.brand.upsert({
      where: { slug: 'parker' },
      create: {
        name: 'Parker Hannifin',
        slug: 'parker',
        country: 'USA',
        isAuthorizedDistributor: true,
        isPublished: true,
        seoTitle: 'Parker Hannifin Hydraulics',
        seoDescription: 'Full range of Parker Hannifin hydraulic hoses, fittings and valves.',
      },
      update: {},
    }),
    db.brand.upsert({
      where: { slug: 'yuken' },
      create: {
        name: 'Yuken',
        slug: 'yuken',
        country: 'Japan',
        isAuthorizedDistributor: true,
        isPublished: true,
        seoTitle: 'Yuken Hydraulics',
        seoDescription: 'Yuken hydraulic valves and pumps.',
      },
      update: {},
    }),
    db.brand.upsert({
      where: { slug: 'hydac' },
      create: {
        name: 'HYDAC',
        slug: 'hydac',
        country: 'Germany',
        isAuthorizedDistributor: false,
        isPublished: true,
        seoTitle: 'HYDAC Hydraulics',
        seoDescription: 'HYDAC filtration, accumulators and hydraulic accessories.',
      },
      update: {},
    }),
  ])

  console.log(`  ✓ ${brands.length} brands`)

  // ── Categories ─────────────────────────────────────────────────────────────
  const catPumps = await db.category.upsert({
    where: { slug: 'hydraulic-pumps' },
    create: {
      name: 'Hydraulic Pumps',
      slug: 'hydraulic-pumps',
      position: 1,
      isPublished: true,
      seoTitle: 'Hydraulic Pumps',
      seoDescription: 'Axial piston, gear and vane hydraulic pumps from top manufacturers.',
    },
    update: {},
  })

  const catValves = await db.category.upsert({
    where: { slug: 'valves-manifolds' },
    create: {
      name: 'Valves & Manifolds',
      slug: 'valves-manifolds',
      position: 2,
      isPublished: true,
      seoTitle: 'Hydraulic Valves & Manifolds',
      seoDescription: 'Directional control, pressure relief, flow control and check valves.',
    },
    update: {},
  })

  const catCylinders = await db.category.upsert({
    where: { slug: 'cylinders' },
    create: {
      name: 'Hydraulic Cylinders',
      slug: 'cylinders',
      position: 3,
      isPublished: true,
      seoTitle: 'Hydraulic Cylinders',
      seoDescription: 'Tie-rod, welded and telescopic hydraulic cylinders for industrial use.',
    },
    update: {},
  })

  const catHoses = await db.category.upsert({
    where: { slug: 'hoses-fittings' },
    create: {
      name: 'Hoses & Fittings',
      slug: 'hoses-fittings',
      position: 4,
      isPublished: true,
      seoTitle: 'Hydraulic Hoses & Fittings',
      seoDescription: 'High-pressure hydraulic hoses, JIC, BSP and metric fittings.',
    },
    update: {},
  })

  const catSeals = await db.category.upsert({
    where: { slug: 'seals-accessories' },
    create: {
      name: 'Seals & Accessories',
      slug: 'seals-accessories',
      position: 5,
      isPublished: true,
      seoTitle: 'Hydraulic Seals & Accessories',
      seoDescription: 'Hydraulic seals, accumulators, filters and power pack accessories.',
    },
    update: {},
  })

  const categories = [catPumps, catValves, catCylinders, catHoses, catSeals]
  console.log(`  ✓ ${categories.length} categories`)

  // ── Staff user ──────────────────────────────────────────────────────────────
  const staffUser = await db.staffUser.upsert({
    where: { email: 'admin@indushydraulics.com' },
    create: {
      email: 'admin@indushydraulics.com',
      name: 'Ravi Bhatt',
      role: 'super_admin',
      isActive: true,
      passwordHash: await hash('admin123456'),
    },
    update: {},
  })

  console.log(`  ✓ Staff user: ${staffUser.email}`)

  // ── Accounts & contacts ────────────────────────────────────────────────────
  const tataAccount = await db.account.upsert({
    where: { code: 'TATA-001' },
    create: {
      code: 'TATA-001',
      displayName: 'Tata Steel',
      legalName: 'Tata Steel Limited',
      region: 'India',
      tier: 'gold',
      status: 'active',
      creditLimit: 5000000,
      paymentTermsDays: 45,
    },
    update: {},
  })

  const ongcAccount = await db.account.upsert({
    where: { code: 'ONGC-001' },
    create: {
      code: 'ONGC-001',
      displayName: 'ONGC',
      legalName: 'Oil and Natural Gas Corporation Limited',
      region: 'India',
      tier: 'platinum',
      status: 'active',
      creditLimit: 10000000,
      paymentTermsDays: 60,
    },
    update: {},
  })

  const marineAccount = await db.account.upsert({
    where: { code: 'ESSAR-001' },
    create: {
      code: 'ESSAR-001',
      displayName: 'Essar Ports',
      legalName: 'Essar Ports Limited',
      region: 'India',
      tier: 'silver',
      status: 'active',
      creditLimit: 2000000,
      paymentTermsDays: 30,
    },
    update: {},
  })

  console.log(`  ✓ 3 accounts`)

  // Contacts
  await db.accountContact.upsert({
    where: { email: 'ravi@tatasteel.com' },
    create: {
      accountId: tataAccount.id,
      email: 'ravi@tatasteel.com',
      firstName: 'Ravi',
      lastName: 'Kumar',
      phone: '+91 22 6665 8000',
      passwordHash: await hash('tatasteel123'),
      role: 'admin',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'priya@tatasteel.com' },
    create: {
      accountId: tataAccount.id,
      email: 'priya@tatasteel.com',
      firstName: 'Priya',
      lastName: 'Sharma',

      phone: '+91 22 6665 8001',
      passwordHash: await hash('tatasteel123'),
      role: 'procurement',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'arjun@ongc.co.in' },
    create: {
      accountId: ongcAccount.id,
      email: 'arjun@ongc.co.in',
      firstName: 'Arjun',
      lastName: 'Mehta',

      phone: '+91 79 2323 3456',
      passwordHash: await hash('ongcpass123'),
      role: 'admin',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'sunita@ongc.co.in' },
    create: {
      accountId: ongcAccount.id,
      email: 'sunita@ongc.co.in',
      firstName: 'Sunita',
      lastName: 'Patel',

      phone: '+91 79 2323 3457',
      passwordHash: await hash('ongcpass123'),
      role: 'procurement',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'kapil@essarports.com' },
    create: {
      accountId: marineAccount.id,
      email: 'kapil@essarports.com',
      firstName: 'Kapil',
      lastName: 'Desai',

      phone: '+91 22 6692 1111',
      passwordHash: await hash('essar123pass'),
      role: 'admin',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'meena@essarports.com' },
    create: {
      accountId: marineAccount.id,
      email: 'meena@essarports.com',
      firstName: 'Meena',
      lastName: 'Joshi',

      phone: '+91 22 6692 1112',
      passwordHash: await hash('essar123pass'),
      role: 'procurement',
      isActive: true,
    },
    update: {},
  })

  console.log(`  ✓ 6 contacts`)

  // ── Products ────────────────────────────────────────────────────────────────
  const productData = [
    // Hydraulic Pumps (Bosch Rexroth)
    {
      sku: 'IH-AP71-D-R-V',
      mpn: 'A10VSO71DRV/31R-PSC62K02',
      slug: 'bosch-rexroth-a10vso-71cc-pump',
      title: 'Bosch Rexroth A10VSO 71cc Axial Piston Pump',
      descriptionShort: 'Variable displacement axial piston pump, 71cc/rev, SAE B mount.',
      descriptionLong: 'The A10VSO is a high-efficiency variable displacement axial piston swashplate design pump suitable for hydrostatic drives in open circuits. 71cc displacement with through-drive capability.',
      categoryId: catPumps.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-AP45-D-R-V',
      mpn: 'A10VSO45DRV/31R-PSC62K40',
      slug: 'bosch-rexroth-a10vso-45cc-pump',
      title: 'Bosch Rexroth A10VSO 45cc Axial Piston Pump',
      descriptionShort: 'Compact variable piston pump, 45cc/rev, suitable for mobile machinery.',
      descriptionLong: 'Compact variant of the proven A10VSO series. 45cc displacement, robust construction for mobile and industrial applications.',
      categoryId: catPumps.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-AP100-D-R-V',
      mpn: 'A10VSO100DRV/31R-PSC62K07',
      slug: 'bosch-rexroth-a10vso-100cc-pump',
      title: 'Bosch Rexroth A10VSO 100cc Axial Piston Pump',
      descriptionShort: 'Large-displacement variable pump for high-power industrial drives.',
      descriptionLong: 'A10VSO 100cc variant for demanding industrial applications. Pressure compensated with optional load sensing.',
      categoryId: catPumps.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-PGH4-21-020',
      mpn: 'PGH4-2X/020RE07VU2',
      slug: 'bosch-rexroth-pgh4-gear-pump',
      title: 'Bosch Rexroth PGH4 Gear Pump 20cc',
      descriptionShort: 'High-performance external gear pump, 20cc/rev, SAE A mount.',
      descriptionLong: 'PGH4 series gear pump for industrial hydraulic power units. Low noise, high efficiency, available in multiple sizes.',
      categoryId: catPumps.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-T7B-B09-2R00-A100',
      mpn: 'T7B-B09-2R00-A100',
      slug: 'parker-t7b-vane-pump',
      title: 'Parker T7B Vane Pump 09cc',
      descriptionShort: 'Fixed displacement vane pump, quiet operation, ideal for machine tools.',
      descriptionLong: 'Parker T7B series balanced vane pump. Extremely quiet operation, suitable for machine tool and industrial applications.',
      categoryId: catPumps.id,
      brandId: brands[1]!.id,
    },
    {
      sku: 'IH-T6C-012-1R00-B1',
      mpn: 'T6C-012-1R00-B1',
      slug: 'parker-t6c-vane-pump',
      title: 'Parker T6C Vane Pump 12cc',
      descriptionShort: 'Double-pump capable vane pump, through-drive for tandem configuration.',
      descriptionLong: 'Parker T6C fixed displacement vane pump with through-drive for tandem mounting. Suitable for power units.',
      categoryId: catPumps.id,
      brandId: brands[1]!.id,
    },

    // Valves (Yuken)
    {
      sku: 'IH-DSG-01-3C4-D24',
      mpn: 'DSG-01-3C4-D24-50',
      slug: 'yuken-dsg-01-directional-valve',
      title: 'Yuken DSG-01 Solenoid Directional Valve 3C4 24VDC',
      descriptionShort: '4/3 spring-centred solenoid valve, cetop-3, 24VDC coil, 40 L/min.',
      descriptionLong: 'Yuken DSG-01 series directional control valve with detachable coils. 3C4 spool provides P-to-T connection in centre position. Max 40 L/min, 315 bar.',
      categoryId: catValves.id,
      brandId: brands[2]!.id,
    },
    {
      sku: 'IH-DSG-01-2B2-D24',
      mpn: 'DSG-01-2B2-D24-50',
      slug: 'yuken-dsg-01-2b2-valve',
      title: 'Yuken DSG-01 Solenoid Directional Valve 2B2 24VDC',
      descriptionShort: '4/2 spring-offset solenoid valve, cetop-3, dual solenoid.',
      descriptionLong: 'Yuken DSG-01 2B2 spool for 4/2 directional control. Failsafe spring-offset design for safety-critical applications.',
      categoryId: catValves.id,
      brandId: brands[2]!.id,
    },
    {
      sku: 'IH-MBR-01-30',
      mpn: 'MBR-01-B-30',
      slug: 'yuken-mbr-pressure-reducing-valve',
      title: 'Yuken MBR-01 Pressure Reducing Valve 30MPa',
      descriptionShort: 'Direct-acting pressure reducing valve, cetop-3, 0–30MPa range.',
      descriptionLong: 'Yuken MBR series pressure reducing valves for branch circuit pressure control. Tamper-resistant adjustment, internal drain.',
      categoryId: catValves.id,
      brandId: brands[2]!.id,
    },
    {
      sku: 'IH-BG-03-315',
      mpn: 'BG-03-315',
      slug: 'yuken-bg-pressure-relief-valve',
      title: 'Yuken BG-03 Pressure Relief Valve 315 bar',
      descriptionShort: 'Pilot-operated relief valve, cetop-5, 315 bar maximum setting.',
      descriptionLong: 'Yuken BG series pilot-operated pressure relief valves for high-flow system protection. Low cracking pressure differential.',
      categoryId: catValves.id,
      brandId: brands[2]!.id,
    },
    {
      sku: 'IH-FLCB-LAN-3C4-D24',
      mpn: 'FLCB-LAN-3C4-D24-2190',
      slug: 'rexroth-flcb-proportional-valve',
      title: 'Bosch Rexroth FLCB Proportional Directional Valve',
      descriptionShort: 'Proportional directional control valve, integrated electronics, NG10.',
      descriptionLong: 'Bosch Rexroth FLCB series proportional directional valve with on-board electronics and position feedback. For precise closed-loop control.',
      categoryId: catValves.id,
      brandId: brands[0]!.id,
    },

    // Cylinders
    {
      sku: 'IH-CYL-80-50-300',
      mpn: 'ISO-TR-80-50-300-FB',
      slug: 'iso-tie-rod-cylinder-80x50x300',
      title: 'ISO Tie-Rod Cylinder 80×50×300mm Stroke',
      descriptionShort: 'Double-acting tie-rod cylinder, ISO 6020/2, 80mm bore × 300mm stroke.',
      descriptionLong: 'Standard ISO 6020/2 tie-rod hydraulic cylinder. 80mm bore, 50mm rod, 300mm stroke. Foot bracket mount standard. NBR seals, chrome rod.',
      categoryId: catCylinders.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-CYL-100-70-500',
      mpn: 'ISO-TR-100-70-500-FB',
      slug: 'iso-tie-rod-cylinder-100x70x500',
      title: 'ISO Tie-Rod Cylinder 100×70×500mm Stroke',
      descriptionShort: 'Heavy-duty tie-rod cylinder, 100mm bore × 500mm stroke.',
      descriptionLong: 'ISO 6020/2 compliant heavy-duty cylinder. 100mm bore for high-force applications. NBR seals standard, PTFE available on request.',
      categoryId: catCylinders.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-CYL-63-45-200',
      mpn: 'ISO-TR-63-45-200-CB',
      slug: 'iso-tie-rod-cylinder-63x45x200',
      title: 'ISO Tie-Rod Cylinder 63×45×200mm Stroke',
      descriptionShort: 'Compact tie-rod cylinder, clevis bracket mount, 63mm bore.',
      descriptionLong: 'Compact ISO cylinder for confined spaces. Clevis bracket mount for pivot applications. 250 bar max working pressure.',
      categoryId: catCylinders.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-WC-120-80-600',
      mpn: 'WC-120-80-600-H',
      slug: 'welded-cylinder-120x80x600',
      title: 'Welded Hydraulic Cylinder 120×80×600mm',
      descriptionShort: 'Heavy industrial welded cylinder, 120mm bore, 600mm stroke, MF5 mount.',
      descriptionLong: 'Custom-configurable welded cylinder for heavy industrial applications. Integral ports, hard chrome rod, steel end caps.',
      categoryId: catCylinders.id,
      brandId: brands[1]!.id,
    },

    // Hoses & Fittings (Parker)
    {
      sku: 'IH-JIC-90-08',
      mpn: 'A-LOK-90-08-SS',
      slug: 'parker-jic-37-elbow-1-2',
      title: 'Parker JIC 37° Elbow 1/2" BSP — Stainless',
      descriptionShort: '90° JIC 37° elbow, 1/2" BSP male, 316 SS, rated to 420 bar.',
      descriptionLong: 'Parker A-LOK stainless steel JIC elbow for corrosive environments. 1/2" BSP male thread. Full bore design minimises pressure drop.',
      categoryId: catHoses.id,
      brandId: brands[1]!.id,
    },
    {
      sku: 'IH-421-08',
      mpn: '421-8',
      slug: 'parker-421-1-2-hose',
      title: 'Parker 421 High-Pressure Hose 1/2" DN13',
      descriptionShort: 'Wire-braided hydraulic hose, 1/2" DN13, 420 bar WP, per metre.',
      descriptionLong: 'Parker 421 series two-wire braid hose conforming to SAE 100R2AT and EN853-2SN. 420 bar working pressure at 1/2" bore.',
      categoryId: catHoses.id,
      brandId: brands[1]!.id,
    },
    {
      sku: 'IH-451-12',
      mpn: '451-12',
      slug: 'parker-451-3-4-hose',
      title: 'Parker 451TC Compact Spiral Hose 3/4" DN19',
      descriptionShort: 'Four-spiral compact hose, 3/4" DN19, 360 bar WP, per metre.',
      descriptionLong: 'Parker 451TC four-wire spiral hose with compact cover. High pressure and impulse resistance. SAE 100R13 compliant.',
      categoryId: catHoses.id,
      brandId: brands[1]!.id,
    },

    // Seals / Accumulators (HYDAC)
    {
      sku: 'IH-SB330-10A1',
      mpn: 'SB330-10A1/112A9-330A',
      slug: 'hydac-sb330-bladder-accumulator',
      title: 'HYDAC Bladder Accumulator SB330 10L 330 bar',
      descriptionShort: 'Bladder accumulator, 10 litre, 330 bar max, nitrogen pre-charge.',
      descriptionLong: 'HYDAC SB330 series bladder accumulator for pulsation dampening and energy storage. 10L capacity, 330 bar max pressure, gas valve on top.',
      categoryId: catSeals.id,
      brandId: brands[3]!.id,
    },
    {
      sku: 'IH-SB330-4A1',
      mpn: 'SB330-4A1/112A9-330A',
      slug: 'hydac-sb330-4l-accumulator',
      title: 'HYDAC Bladder Accumulator SB330 4L 330 bar',
      descriptionShort: 'Compact 4 litre bladder accumulator, 330 bar, carbon steel shell.',
      descriptionLong: 'HYDAC SB330 4L. Same construction as 10L variant in a more compact body. Suitable for tight installations.',
      categoryId: catSeals.id,
      brandId: brands[3]!.id,
    },
    {
      sku: 'IH-0330R010BN4HC',
      mpn: '0330R010BN4HC',
      slug: 'hydac-0330-return-line-filter',
      title: 'HYDAC 0330R Return Line Filter 10 Micron',
      descriptionShort: 'Return line pressure filter, 10 micron glass fibre element, bypass valve.',
      descriptionLong: 'HYDAC 0330R series high-capacity return line filter. 10 micron Beta 10 ≥ 200 glass fibre. Visual / electrical clog indicator available.',
      categoryId: catSeals.id,
      brandId: brands[3]!.id,
    },
    {
      sku: 'IH-0160DN010BN4HC',
      mpn: '0160DN010BN4HC',
      slug: 'hydac-0160-suction-filter',
      title: 'HYDAC 0160DN Suction Filter 10 Micron',
      descriptionShort: 'Suction strainer / filter, 10 micron, tank top mount, bypass valve.',
      descriptionLong: 'HYDAC 0160DN series suction filter for hydraulic power units. Tank-top mounting with bypass valve protecting pump from cavitation.',
      categoryId: catSeals.id,
      brandId: brands[3]!.id,
    },
    {
      sku: 'IH-KHB-G12-14-2X-S',
      mpn: 'KHB-G1/2-14-2X/S',
      slug: 'rexroth-khb-ball-valve',
      title: 'Bosch Rexroth KHB Ball Valve 1/2" G',
      descriptionShort: 'Screw-in ball valve, 1/2" G, 500 bar rated, stainless steel ball.',
      descriptionLong: 'Rexroth KHB series high-pressure ball valve. 500 bar rated for use in test benches and high-pressure instrumentation circuits.',
      categoryId: catSeals.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-PP-11KW-30-DS',
      mpn: 'PP-S-11KW-30L-DSG-B',
      slug: 'standard-power-pack-11kw',
      title: 'Standard Hydraulic Power Pack 11kW 30L/min',
      descriptionShort: '11kW 3-phase electric motor, gear pump 30 L/min, 30L tank, DSG-01 valve.',
      descriptionLong: 'Ready-to-install hydraulic power unit. 11kW 3-phase 50Hz motor, 30 L/min gear pump, 250 bar max, 30L painted steel tank. Includes pressure gauge, return filter and relief valve.',
      categoryId: catSeals.id,
      brandId: brands[0]!.id,
    },
  ]

  let created = 0
  for (const p of productData) {
    const existing = await db.product.findUnique({ where: { sku: p.sku } })
    if (!existing) {
      await db.product.create({
        data: {
          ...p,
          status: 'active',
        },
      })
      created++
    }
  }

  console.log(`  ✓ ${productData.length} products (${created} created, ${productData.length - created} skipped)`)

  // ── Store settings ──────────────────────────────────────────────────────────
  const existingSettings = await db.storeSettings.findFirst()
  if (!existingSettings) {
    await db.storeSettings.create({
      data: {
        name: 'Indus Hydraulics',
        supportEmail: 'support@indushydraulics.com',
        defaultCurrency: 'USD',
        defaultIncoterm: 'EXW',
        defaultPaymentTerms: 30,
      },
    })
  }

  console.log('  ✓ Store settings')
  console.log('\n✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
