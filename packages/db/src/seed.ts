/**
 * Seed script — idempotent. Running twice produces the same state.
 * Run: pnpm --filter=@indus/db seed
 */
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { seedIndustries } from './seed-industries'
import { MEGAMENU_TREE, type MegamenuSeedNode } from './megamenu-tree'

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

  // Slug carries the search phrase; `name` stays clean for the on-page label
  // and the megamenu. The two are deliberately decoupled — see
  // src/scripts/rename-categories-intent-slugs.ts.
  const catHoses = await db.category.upsert({
    where: { slug: 'hydraulic-hose-fittings-suppliers-uae' },
    create: {
      name: 'Hoses & Fittings',
      slug: 'hydraulic-hose-fittings-suppliers-uae',
      position: 4,
      isPublished: true,
      seoTitle: 'Hydraulic Hose Fittings Suppliers in UAE',
      focusKeyword: 'hydraulic hose fittings suppliers',
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

  // ── Industries ─────────────────────────────────────────────────────────────
  // 6 industries with rich marketing data + 3 case studies each, migrated
  // from the previously hardcoded TS files. See packages/db/src/seed-industries.ts.
  const industryCount = await seedIndustries(db)
  console.log(`  ✓ ${industryCount} industries`)

  // ── Staff user ──────────────────────────────────────────────────────────────
  const staffUser = await db.staffUser.upsert({
    where: { email: 'admin@indushydraulics.me' },
    create: {
      email: 'admin@indushydraulics.me',
      name: 'Ayush Bhatia',
      role: 'super_admin',
      isActive: true,
      passwordHash: await hash('admin123456'),
    },
    update: {},
  })

  console.log(`  ✓ Staff user: ${staffUser.email}`)

  // ── Accounts & contacts ────────────────────────────────────────────────────
  const steelAccount = await db.account.upsert({
    where: { code: 'EMSTEEL-001' },
    create: {
      code: 'EMSTEEL-001',
      displayName: 'Emirates Steel',
      legalName: 'Emirates Steel Arkan PJSC',
      region: 'UAE',
      tier: 'gold',
      status: 'active',
      creditLimit: 5000000,
      paymentTermsDays: 45,
    },
    update: {},
  })

  const oilGasAccount = await db.account.upsert({
    where: { code: 'ADNOC-001' },
    create: {
      code: 'ADNOC-001',
      displayName: 'ADNOC',
      legalName: 'Abu Dhabi National Oil Company',
      region: 'UAE',
      tier: 'platinum',
      status: 'active',
      creditLimit: 10000000,
      paymentTermsDays: 60,
    },
    update: {},
  })

  const marineAccount = await db.account.upsert({
    where: { code: 'DPWORLD-001' },
    create: {
      code: 'DPWORLD-001',
      displayName: 'DP World',
      legalName: 'DP World UAE Region',
      region: 'UAE',
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
    where: { email: 'ravi@emiratessteel.ae' },
    create: {
      accountId: steelAccount.id,
      email: 'ravi@emiratessteel.ae',
      firstName: 'Ravi',
      lastName: 'Kumar',
      phone: '+971 2 507 0000',
      passwordHash: await hash('emsteel123'),
      role: 'admin',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'priya@emiratessteel.ae' },
    create: {
      accountId: steelAccount.id,
      email: 'priya@emiratessteel.ae',
      firstName: 'Priya',
      lastName: 'Sharma',

      phone: '+971 2 507 0001',
      passwordHash: await hash('emsteel123'),
      role: 'procurement',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'arjun@adnoc.ae' },
    create: {
      accountId: oilGasAccount.id,
      email: 'arjun@adnoc.ae',
      firstName: 'Arjun',
      lastName: 'Mehta',

      phone: '+971 2 707 0000',
      passwordHash: await hash('adnocpass123'),
      role: 'admin',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'sunita@adnoc.ae' },
    create: {
      accountId: oilGasAccount.id,
      email: 'sunita@adnoc.ae',
      firstName: 'Sunita',
      lastName: 'Patel',

      phone: '+971 2 707 0001',
      passwordHash: await hash('adnocpass123'),
      role: 'procurement',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'kapil@dpworld.com' },
    create: {
      accountId: marineAccount.id,
      email: 'kapil@dpworld.com',
      firstName: 'Kapil',
      lastName: 'Desai',

      phone: '+971 4 881 5555',
      passwordHash: await hash('dpworld123pass'),
      role: 'admin',
      isActive: true,
    },
    update: {},
  })

  await db.accountContact.upsert({
    where: { email: 'meena@dpworld.com' },
    create: {
      accountId: marineAccount.id,
      email: 'meena@dpworld.com',
      firstName: 'Meena',
      lastName: 'Joshi',

      phone: '+971 4 881 5556',
      passwordHash: await hash('dpworld123pass'),
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
      descriptionLong:
        'The A10VSO is a high-efficiency variable displacement axial piston swashplate design pump suitable for hydrostatic drives in open circuits. 71cc displacement with through-drive capability.',
      categoryId: catPumps.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-AP45-D-R-V',
      mpn: 'A10VSO45DRV/31R-PSC62K40',
      slug: 'bosch-rexroth-a10vso-45cc-pump',
      title: 'Bosch Rexroth A10VSO 45cc Axial Piston Pump',
      descriptionShort: 'Compact variable piston pump, 45cc/rev, suitable for mobile machinery.',
      descriptionLong:
        'Compact variant of the proven A10VSO series. 45cc displacement, robust construction for mobile and industrial applications.',
      categoryId: catPumps.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-AP100-D-R-V',
      mpn: 'A10VSO100DRV/31R-PSC62K07',
      slug: 'bosch-rexroth-a10vso-100cc-pump',
      title: 'Bosch Rexroth A10VSO 100cc Axial Piston Pump',
      descriptionShort: 'Large-displacement variable pump for high-power industrial drives.',
      descriptionLong:
        'A10VSO 100cc variant for demanding industrial applications. Pressure compensated with optional load sensing.',
      categoryId: catPumps.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-PGH4-21-020',
      mpn: 'PGH4-2X/020RE07VU2',
      slug: 'bosch-rexroth-pgh4-gear-pump',
      title: 'Bosch Rexroth PGH4 Gear Pump 20cc',
      descriptionShort: 'High-performance external gear pump, 20cc/rev, SAE A mount.',
      descriptionLong:
        'PGH4 series gear pump for industrial hydraulic power units. Low noise, high efficiency, available in multiple sizes.',
      categoryId: catPumps.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-T7B-B09-2R00-A100',
      mpn: 'T7B-B09-2R00-A100',
      slug: 'parker-t7b-vane-pump',
      title: 'Parker T7B Vane Pump 09cc',
      descriptionShort: 'Fixed displacement vane pump, quiet operation, ideal for machine tools.',
      descriptionLong:
        'Parker T7B series balanced vane pump. Extremely quiet operation, suitable for machine tool and industrial applications.',
      categoryId: catPumps.id,
      brandId: brands[1]!.id,
    },
    {
      sku: 'IH-T6C-012-1R00-B1',
      mpn: 'T6C-012-1R00-B1',
      slug: 'parker-t6c-vane-pump',
      title: 'Parker T6C Vane Pump 12cc',
      descriptionShort: 'Double-pump capable vane pump, through-drive for tandem configuration.',
      descriptionLong:
        'Parker T6C fixed displacement vane pump with through-drive for tandem mounting. Suitable for power units.',
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
      descriptionLong:
        'Yuken DSG-01 series directional control valve with detachable coils. 3C4 spool provides P-to-T connection in centre position. Max 40 L/min, 315 bar.',
      categoryId: catValves.id,
      brandId: brands[2]!.id,
    },
    {
      sku: 'IH-DSG-01-2B2-D24',
      mpn: 'DSG-01-2B2-D24-50',
      slug: 'yuken-dsg-01-2b2-valve',
      title: 'Yuken DSG-01 Solenoid Directional Valve 2B2 24VDC',
      descriptionShort: '4/2 spring-offset solenoid valve, cetop-3, dual solenoid.',
      descriptionLong:
        'Yuken DSG-01 2B2 spool for 4/2 directional control. Failsafe spring-offset design for safety-critical applications.',
      categoryId: catValves.id,
      brandId: brands[2]!.id,
    },
    {
      sku: 'IH-MBR-01-30',
      mpn: 'MBR-01-B-30',
      slug: 'yuken-mbr-pressure-reducing-valve',
      title: 'Yuken MBR-01 Pressure Reducing Valve 30MPa',
      descriptionShort: 'Direct-acting pressure reducing valve, cetop-3, 0–30MPa range.',
      descriptionLong:
        'Yuken MBR series pressure reducing valves for branch circuit pressure control. Tamper-resistant adjustment, internal drain.',
      categoryId: catValves.id,
      brandId: brands[2]!.id,
    },
    {
      sku: 'IH-BG-03-315',
      mpn: 'BG-03-315',
      slug: 'yuken-bg-pressure-relief-valve',
      title: 'Yuken BG-03 Pressure Relief Valve 315 bar',
      descriptionShort: 'Pilot-operated relief valve, cetop-5, 315 bar maximum setting.',
      descriptionLong:
        'Yuken BG series pilot-operated pressure relief valves for high-flow system protection. Low cracking pressure differential.',
      categoryId: catValves.id,
      brandId: brands[2]!.id,
    },
    {
      sku: 'IH-FLCB-LAN-3C4-D24',
      mpn: 'FLCB-LAN-3C4-D24-2190',
      slug: 'rexroth-flcb-proportional-valve',
      title: 'Bosch Rexroth FLCB Proportional Directional Valve',
      descriptionShort: 'Proportional directional control valve, integrated electronics, NG10.',
      descriptionLong:
        'Bosch Rexroth FLCB series proportional directional valve with on-board electronics and position feedback. For precise closed-loop control.',
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
      descriptionLong:
        'Standard ISO 6020/2 tie-rod hydraulic cylinder. 80mm bore, 50mm rod, 300mm stroke. Foot bracket mount standard. NBR seals, chrome rod.',
      categoryId: catCylinders.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-CYL-100-70-500',
      mpn: 'ISO-TR-100-70-500-FB',
      slug: 'iso-tie-rod-cylinder-100x70x500',
      title: 'ISO Tie-Rod Cylinder 100×70×500mm Stroke',
      descriptionShort: 'Heavy-duty tie-rod cylinder, 100mm bore × 500mm stroke.',
      descriptionLong:
        'ISO 6020/2 compliant heavy-duty cylinder. 100mm bore for high-force applications. NBR seals standard, PTFE available on request.',
      categoryId: catCylinders.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-CYL-63-45-200',
      mpn: 'ISO-TR-63-45-200-CB',
      slug: 'iso-tie-rod-cylinder-63x45x200',
      title: 'ISO Tie-Rod Cylinder 63×45×200mm Stroke',
      descriptionShort: 'Compact tie-rod cylinder, clevis bracket mount, 63mm bore.',
      descriptionLong:
        'Compact ISO cylinder for confined spaces. Clevis bracket mount for pivot applications. 250 bar max working pressure.',
      categoryId: catCylinders.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-WC-120-80-600',
      mpn: 'WC-120-80-600-H',
      slug: 'welded-cylinder-120x80x600',
      title: 'Welded Hydraulic Cylinder 120×80×600mm',
      descriptionShort: 'Heavy industrial welded cylinder, 120mm bore, 600mm stroke, MF5 mount.',
      descriptionLong:
        'Custom-configurable welded cylinder for heavy industrial applications. Integral ports, hard chrome rod, steel end caps.',
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
      descriptionLong:
        'Parker A-LOK stainless steel JIC elbow for corrosive environments. 1/2" BSP male thread. Full bore design minimises pressure drop.',
      categoryId: catHoses.id,
      brandId: brands[1]!.id,
    },
    {
      sku: 'IH-421-08',
      mpn: '421-8',
      slug: 'parker-421-1-2-hose',
      title: 'Parker 421 High-Pressure Hose 1/2" DN13',
      descriptionShort: 'Wire-braided hydraulic hose, 1/2" DN13, 420 bar WP, per metre.',
      descriptionLong:
        'Parker 421 series two-wire braid hose conforming to SAE 100R2AT and EN853-2SN. 420 bar working pressure at 1/2" bore.',
      categoryId: catHoses.id,
      brandId: brands[1]!.id,
    },
    {
      sku: 'IH-451-12',
      mpn: '451-12',
      slug: 'parker-451-3-4-hose',
      title: 'Parker 451TC Compact Spiral Hose 3/4" DN19',
      descriptionShort: 'Four-spiral compact hose, 3/4" DN19, 360 bar WP, per metre.',
      descriptionLong:
        'Parker 451TC four-wire spiral hose with compact cover. High pressure and impulse resistance. SAE 100R13 compliant.',
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
      descriptionLong:
        'HYDAC SB330 series bladder accumulator for pulsation dampening and energy storage. 10L capacity, 330 bar max pressure, gas valve on top.',
      categoryId: catSeals.id,
      brandId: brands[3]!.id,
    },
    {
      sku: 'IH-SB330-4A1',
      mpn: 'SB330-4A1/112A9-330A',
      slug: 'hydac-sb330-4l-accumulator',
      title: 'HYDAC Bladder Accumulator SB330 4L 330 bar',
      descriptionShort: 'Compact 4 litre bladder accumulator, 330 bar, carbon steel shell.',
      descriptionLong:
        'HYDAC SB330 4L. Same construction as 10L variant in a more compact body. Suitable for tight installations.',
      categoryId: catSeals.id,
      brandId: brands[3]!.id,
    },
    {
      sku: 'IH-0330R010BN4HC',
      mpn: '0330R010BN4HC',
      slug: 'hydac-0330-return-line-filter',
      title: 'HYDAC 0330R Return Line Filter 10 Micron',
      descriptionShort: 'Return line pressure filter, 10 micron glass fibre element, bypass valve.',
      descriptionLong:
        'HYDAC 0330R series high-capacity return line filter. 10 micron Beta 10 ≥ 200 glass fibre. Visual / electrical clog indicator available.',
      categoryId: catSeals.id,
      brandId: brands[3]!.id,
    },
    {
      sku: 'IH-0160DN010BN4HC',
      mpn: '0160DN010BN4HC',
      slug: 'hydac-0160-suction-filter',
      title: 'HYDAC 0160DN Suction Filter 10 Micron',
      descriptionShort: 'Suction strainer / filter, 10 micron, tank top mount, bypass valve.',
      descriptionLong:
        'HYDAC 0160DN series suction filter for hydraulic power units. Tank-top mounting with bypass valve protecting pump from cavitation.',
      categoryId: catSeals.id,
      brandId: brands[3]!.id,
    },
    {
      sku: 'IH-KHB-G12-14-2X-S',
      mpn: 'KHB-G1/2-14-2X/S',
      slug: 'rexroth-khb-ball-valve',
      title: 'Bosch Rexroth KHB Ball Valve 1/2" G',
      descriptionShort: 'Screw-in ball valve, 1/2" G, 500 bar rated, stainless steel ball.',
      descriptionLong:
        'Rexroth KHB series high-pressure ball valve. 500 bar rated for use in test benches and high-pressure instrumentation circuits.',
      categoryId: catSeals.id,
      brandId: brands[0]!.id,
    },
    {
      sku: 'IH-PP-11KW-30-DS',
      mpn: 'PP-S-11KW-30L-DSG-B',
      slug: 'standard-power-pack-11kw',
      title: 'Standard Hydraulic Power Pack 11kW 30L/min',
      descriptionShort: '11kW 3-phase electric motor, gear pump 30 L/min, 30L tank, DSG-01 valve.',
      descriptionLong:
        'Ready-to-install hydraulic power unit. 11kW 3-phase 50Hz motor, 30 L/min gear pump, 250 bar max, 30L painted steel tank. Includes pressure gauge, return filter and relief valve.',
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

  console.log(
    `  ✓ ${productData.length} products (${created} created, ${productData.length - created} skipped)`
  )

  // ── Spec templates + product specs ─────────────────────────────────────────
  // Backfills templates + template-linked ProductSpec rows so Compare works on
  // seeded products. Idempotent: re-running upserts the templates and replaces
  // template-linked specs (templateFieldId IS NOT NULL) per product.
  await seedSpecTemplates({
    [catPumps.id]: 'pump-spec',
    [catValves.id]: 'valve-spec',
    [catCylinders.id]: 'cylinder-spec',
    [catHoses.id]: 'hose-fitting-spec',
    // Accumulators + filters are both inside the Seals & Accessories category;
    // each product picks the matching template via PRODUCT_SPECS below.
  })
  console.log('  ✓ Spec templates + product specs')

  // ── Store settings ──────────────────────────────────────────────────────────
  const brandDefaults = {
    tagline:
      'UAE-based distributor of industrial hydraulic components, serving engineers globally.',
    certificationLine: 'ISO 9001:2015 Certified',
    contactPhone: '+971 52 2477942',
    contactEmail: 'sales@indushydraulics.me',
    contactHours: 'Mon–Fri 09:00–18:00 GST',
    contactLocationLabel: 'Dubai HQ',
  } as const

  const existingSettings = await db.storeSettings.findFirst()
  if (!existingSettings) {
    await db.storeSettings.create({
      data: {
        name: 'Indus Hydraulics',
        supportEmail: 'support@indushydraulics.me',
        defaultCurrency: 'USD',
        defaultIncoterm: 'EXW',
        defaultPaymentTerms: 30,
        ...brandDefaults,
      },
    })
  } else {
    // Backfill any null brand/contact fields without clobbering editor changes.
    const patch: Record<string, string> = {}
    for (const [key, value] of Object.entries(brandDefaults)) {
      if ((existingSettings as Record<string, unknown>)[key] == null) patch[key] = value
    }
    if (Object.keys(patch).length > 0) {
      await db.storeSettings.update({ where: { id: existingSettings.id }, data: patch })
    }
  }

  console.log('  ✓ Store settings')

  // ── Navigation menus ────────────────────────────────────────────────────────
  await seedNavigationMenus()
  console.log('  ✓ Navigation menus')

  // ── AI prompt templates (SEO Suggest layer) ────────────────────────────────
  await seedAiPromptTemplates()
  console.log('  ✓ AI prompt templates')

  // ── Counters (atomic code generators) ───────────────────────────────────────
  await seedCounters()
  console.log('  ✓ Counters')

  console.log('\n✅ Seed complete.')
}

// Backfill `Counter` rows from existing user-facing codes so the new atomic
// generators in `packages/db/src/codes.ts` continue numbering where the
// previous `count + 1` logic left off. Idempotent and monotonic — re-running
// never decrements an already-seeded counter, even if rows are deleted.
async function seedCounters() {
  type ScopeYear = { scope: string; year: number; max: number }

  const rfqs = await db.rfq.findMany({ select: { code: true } })
  const accounts = await db.account.findMany({ select: { code: true } })
  const quotes = await db.quote.findMany({
    where: { revision: 1 },
    select: { code: true },
  })

  const targets = new Map<string, ScopeYear>()
  const bump = (scope: string, year: number, value: number) => {
    const key = `${scope}:${year}`
    const existing = targets.get(key)
    if (!existing || value > existing.max) {
      targets.set(key, { scope, year, max: value })
    }
  }

  for (const { code } of rfqs) {
    const m = code.match(/^RFQ-(\d{4})-(\d+)$/)
    if (m) bump('rfq', Number(m[1]), Number(m[2]))
  }
  for (const { code } of accounts) {
    const m = code.match(/^ACC-(\d{4})-(\d+)$/)
    if (m) bump('account', Number(m[1]), Number(m[2]))
  }
  for (const { code } of quotes) {
    const m = code.match(/^INDUS\/Q(\d+)$/)
    if (m) bump('quote', 0, Number(m[1]) - 26386) // QUOTE_ZOHO_BASE
  }

  for (const { scope, year, max } of targets.values()) {
    const existing = await db.counter.findUnique({
      where: { scope_year: { scope, year } },
      select: { value: true },
    })
    const target = Math.max(existing?.value ?? 0, max)
    if (existing && existing.value === target) continue
    await db.counter.upsert({
      where: { scope_year: { scope, year } },
      create: { scope, year, value: target },
      update: { value: target },
    })
  }
}

// Default Anthropic prompt prefixes for the SEO Suggest drawer. Lives here
// rather than in the admin app so that `pnpm db:seed` makes the drawer
// useful out of the box. The system prompts are designed for Anthropic
// prompt caching — keep them stable.
async function seedAiPromptTemplates() {
  const titleSystem = `You write SEO meta titles for the Indus Hydraulics B2B industrial catalogue (pumps, fittings, hoses, valves).

Rules:
- Output JSON only, with the schema {"title": string}.
- Keep titles between 30 and 60 characters.
- Lead with the most distinctive identifier (part number / SKU / MPN) when buyers search by it.
- Include the brand only when it is well known and adds search value.
- Use industrial terminology, not marketing language. No "premium", "best-in-class", "world-class".
- Do not invent specs or compatibility claims.

Few-shot examples:
{"title":"3/8 NPT Hydraulic Hose Fitting — Parker 10643-6-6"}
{"title":"SAE 100R2 Hydraulic Hose 1/2 in × 50 ft — Eaton EC600"}
{"title":"Pressure Relief Valve 3000 PSI Adjustable — Sun PRDB-LAN"}

Respond ONLY with the JSON object. No prose, no explanation.`

  const descriptionSystem = `You write SEO meta descriptions for the Indus Hydraulics B2B industrial catalogue.

Rules:
- Output JSON only, with the schema {"description": string}.
- Keep descriptions between 120 and 160 characters.
- Lead with the most useful technical fact (size, pressure rating, material).
- Include a buyer-relevant outcome (compatibility, lead time, application) when known.
- No exclamation marks. No "Shop now" / "Buy today" / urgency language.
- Do not invent specs or claims.

Few-shot examples:
{"description":"Parker 10643-6-6 hydraulic hose fitting, 3/8 in male NPT × -6 hose. Forged carbon steel, 5800 PSI working pressure. Compatible with 482-series hose."}
{"description":"Sun PRDB-LAN adjustable pressure relief valve, 0–3000 PSI range, 30 GPM rated flow. SAE-08 cartridge mount. Used in mobile-equipment hydraulic circuits."}

Respond ONLY with the JSON object. No prose, no explanation.`

  const focusKeywordSystem = `You pick the strongest focus keyword (primary search phrase) for an SEO page.

Rules:
- Output JSON only, with the schema {"keyword": string}.
- Pick a single phrase, 2-5 words, lowercase, no punctuation.
- Prefer phrases buyers actually search — part categories ("hydraulic hose fitting"), specs ("3000 psi relief valve"), or brand+series when the brand drives traffic.
- Avoid SKU/MPN strings as the keyword — those are titles, not phrases people search.

Respond ONLY with the JSON object.`

  const altTextSystem = `You write image alt text for the Indus Hydraulics catalogue.

Rules:
- Output JSON only, with the schema {"alt": string}.
- Maximum 125 characters.
- Describe what is visibly in the image (product, angle, key visual feature). Do not restate the title or repeat brand+SKU verbatim.
- No "image of", "picture of" — just describe the subject.

Respond ONLY with the JSON object.`

  const userTemplateProduct = `Product:
- Title: {{title}}
- SKU: {{sku}}
- MPN: {{mpn}}
- Brand: {{brand}}
- Category: {{categoryPath}}
- Focus keyword: {{focusKeyword}}
- Key specs: {{topSpecs}}
- Short description: {{descriptionShort}}

Generate the field requested in the system instructions.`

  const userTemplateGeneric = `Entity:
- Title: {{title}}
- Slug: {{sku}}
- Brand: {{brand}}
- Category: {{categoryPath}}
- Focus keyword: {{focusKeyword}}
- Short description: {{descriptionShort}}

Generate the field requested in the system instructions.`

  type Seed = {
    kind: 'meta_title' | 'meta_description' | 'focus_keywords' | 'alt_text'
    entityType: 'product' | 'category' | 'brand' | 'industry' | 'cms_page' | 'blog_post'
    name: string
    systemPrompt: string
    userTemplate: string
    model: string
    maxTokens: number
  }

  const entityTypes = ['product', 'category', 'brand', 'industry', 'cms_page', 'blog_post'] as const

  const seeds: Seed[] = []
  for (const et of entityTypes) {
    const userTpl = et === 'product' ? userTemplateProduct : userTemplateGeneric
    seeds.push({
      kind: 'meta_title',
      entityType: et,
      name: `Default ${et} title`,
      systemPrompt: titleSystem,
      userTemplate: userTpl,
      model: 'claude-sonnet-4-6',
      maxTokens: 200,
    })
    seeds.push({
      kind: 'meta_description',
      entityType: et,
      name: `Default ${et} description`,
      systemPrompt: descriptionSystem,
      userTemplate: userTpl,
      model: 'claude-sonnet-4-6',
      maxTokens: 400,
    })
    seeds.push({
      kind: 'focus_keywords',
      entityType: et,
      name: `Default ${et} focus keyword`,
      systemPrompt: focusKeywordSystem,
      userTemplate: userTpl,
      model: 'claude-sonnet-4-6',
      maxTokens: 80,
    })
    if (et === 'product') {
      seeds.push({
        kind: 'alt_text',
        entityType: et,
        name: `Default ${et} alt text`,
        systemPrompt: altTextSystem,
        userTemplate: userTpl,
        model: 'claude-sonnet-4-6',
        maxTokens: 200,
      })
    }
  }

  // Idempotent: the @@unique([kind, entityType, isActive]) means upsert
  // by that triple needs the where shape Prisma exposes for compound keys.
  for (const s of seeds) {
    await db.aiPromptTemplate.upsert({
      where: {
        kind_entityType_isActive: { kind: s.kind, entityType: s.entityType, isActive: true },
      },
      create: { ...s, isActive: true },
      update: {
        // Only refresh prompts; leave model/maxTokens settings the admin
        // may have hand-tuned via /seo/ai/templates (Phase 2).
        systemPrompt: s.systemPrompt,
        userTemplate: s.userTemplate,
        name: s.name,
      },
    })
  }
}

async function seedNavigationMenus() {
  const headerMenu = await db.navMenu.upsert({
    where: { location: 'primary_header' },
    create: {
      slug: 'primary-header',
      name: 'Primary header',
      location: 'primary_header',
      isPublished: true,
      publishedAt: new Date(),
    },
    update: {},
  })
  const megamenu = await db.navMenu.upsert({
    where: { location: 'primary_megamenu' },
    create: {
      slug: 'primary-megamenu',
      name: 'Megamenu (Products)',
      location: 'primary_megamenu',
      isPublished: true,
      publishedAt: new Date(),
    },
    update: {},
  })
  const footerMainMenu = await db.navMenu.upsert({
    where: { location: 'footer_main' },
    create: {
      slug: 'footer-main',
      name: 'Footer — main',
      location: 'footer_main',
      isPublished: true,
      publishedAt: new Date(),
    },
    update: {},
  })
  const footerLegalMenu = await db.navMenu.upsert({
    where: { location: 'footer_legal' },
    create: {
      slug: 'footer-legal',
      name: 'Footer — legal',
      location: 'footer_legal',
      isPublished: true,
      publishedAt: new Date(),
    },
    update: {},
  })
  await db.navMenu.upsert({
    where: { location: 'mobile_drawer' },
    create: {
      slug: 'mobile-drawer',
      name: 'Mobile drawer',
      location: 'mobile_drawer',
      isPublished: false,
    },
    update: {},
  })

  // Idempotent: only seed items when the menu is empty.
  const headerCount = await db.navMenuItem.count({ where: { menuId: headerMenu.id } })
  if (headerCount === 0) {
    const headerItems = [
      { label: 'Products', customUrl: '/c' },
      { label: 'Brands', customUrl: '/brands' },
      { label: 'Industries', customUrl: '/industries' },
      { label: 'Blog', customUrl: '/blog' },
      { label: 'About', customUrl: '/hydraulic-components-supplier-uae' },
      { label: 'Contact', customUrl: '/contact' },
    ]
    for (let i = 0; i < headerItems.length; i++) {
      const it = headerItems[i]!
      await db.navMenuItem.create({
        data: {
          menuId: headerMenu.id,
          parentId: null,
          position: i,
          label: it.label,
          linkType: 'custom_url',
          customUrl: it.customUrl,
        },
      })
    }
  }

  const megamenuCount = await db.navMenuItem.count({ where: { menuId: megamenu.id } })
  if (megamenuCount === 0) {
    const allCategories = await db.category.findMany({ select: { id: true, slug: true } })
    const categoryBySlug = new Map(allCategories.map((c) => [c.slug, c.id]))

    // Prune the canonical 6-section tree to what this DB can link: drop category
    // nodes whose slug is absent, and drop any container left with no surviving
    // children. custom_url leaf links always survive. A minimal seed DB yields a
    // clean partial menu; a fully populated DB reproduces the whole structure.
    type PrunedNode = {
      label: string
      categoryId: string | null
      url: string | null
      children: PrunedNode[]
    }
    const prune = (nodes: MegamenuSeedNode[]): PrunedNode[] => {
      const out: PrunedNode[] = []
      for (const n of nodes) {
        const categoryId = n.category ? (categoryBySlug.get(n.category) ?? null) : null
        const children = prune(n.children ?? [])
        const originallyContainer = (n.children?.length ?? 0) > 0
        const keep = children.length > 0 || categoryId !== null || (!!n.url && !originallyContainer)
        if (!keep) continue
        out.push({ label: n.label, categoryId, url: n.url ?? null, children })
      }
      return out
    }

    const createNodes = async (nodes: PrunedNode[], parentId: string | null): Promise<void> => {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!
        const row = await db.navMenuItem.create({
          data: {
            menuId: megamenu.id,
            parentId,
            position: i,
            label: n.label,
            linkType: n.categoryId ? 'category' : n.url ? 'custom_url' : 'none',
            categoryId: n.categoryId,
            customUrl: n.categoryId ? null : n.url,
          },
        })
        if (n.children.length > 0) await createNodes(n.children, row.id)
      }
    }

    await createNodes(prune(MEGAMENU_TREE), null)
  }

  // ── footer_main ────────────────────────────────────────────────────────────
  const footerMainCount = await db.navMenuItem.count({ where: { menuId: footerMainMenu.id } })
  if (footerMainCount === 0) {
    // First-time seed of this menu: also force it to published in case the menu row
    // pre-existed in an unpublished state (e.g., created by an earlier seed).
    if (!footerMainMenu.isPublished) {
      await db.navMenu.update({
        where: { id: footerMainMenu.id },
        data: { isPublished: true, publishedAt: new Date() },
      })
    }
    // Column 1: Products — link to real Categories where they exist; fall back to /c
    const productsColumn = await db.navMenuItem.create({
      data: {
        menuId: footerMainMenu.id,
        parentId: null,
        position: 0,
        label: 'Products',
        linkType: 'none',
      },
    })
    const footerProducts: Array<{ label: string; categorySlug: string | null }> = [
      { label: 'Hydraulic Pumps', categorySlug: 'hydraulic-pumps' },
      { label: 'Valves & Manifolds', categorySlug: 'valves-manifolds' },
      { label: 'Hydraulic Cylinders', categorySlug: 'hydraulic-cylinders' },
      { label: 'Hoses & Fittings', categorySlug: 'hydraulic-hose-fittings-suppliers-uae' },
      { label: 'Power Packs', categorySlug: null },
      { label: 'Seals & Accessories', categorySlug: null },
    ]
    for (let i = 0; i < footerProducts.length; i++) {
      const item = footerProducts[i]!
      const category = item.categorySlug
        ? await db.category.findUnique({ where: { slug: item.categorySlug }, select: { id: true } })
        : null
      await db.navMenuItem.create({
        data: {
          menuId: footerMainMenu.id,
          parentId: productsColumn.id,
          position: i,
          label: item.label,
          linkType: category ? 'category' : 'custom_url',
          categoryId: category?.id ?? null,
          customUrl: category ? null : '/c',
        },
      })
    }

    // Column 2: Company — custom URLs to existing storefront routes
    const companyColumn = await db.navMenuItem.create({
      data: {
        menuId: footerMainMenu.id,
        parentId: null,
        position: 1,
        label: 'Company',
        linkType: 'none',
      },
    })
    const companyLinks = [
      { label: 'About', url: '/hydraulic-components-supplier-uae' },
      { label: 'Brands', url: '/brands' },
      { label: 'Industries', url: '/industries' },
      // Both surfaces were reachable only from sitemap.xml before this — no
      // page on the site linked to either, which is why /locations never
      // accumulated internal links.
      { label: 'Service areas', url: '/locations' },
      { label: 'Export markets', url: '/markets' },
      { label: 'Blog', url: '/blog' },
      { label: 'Contact', url: '/contact' },
    ]
    for (let i = 0; i < companyLinks.length; i++) {
      const item = companyLinks[i]!
      await db.navMenuItem.create({
        data: {
          menuId: footerMainMenu.id,
          parentId: companyColumn.id,
          position: i,
          label: item.label,
          linkType: 'custom_url',
          customUrl: item.url,
        },
      })
    }
  }

  // ── footer_legal ───────────────────────────────────────────────────────────
  // Two stages: (1) seed the full set when the menu is empty; (2) for existing
  // databases that were seeded earlier with only Privacy/Terms/Sitemap, add
  // any missing items (Shipping/Returns/Warranty) idempotently. Reordering is
  // available to editors via the admin nav CMS.
  const legalLinks = [
    { label: 'Privacy', url: '/privacy' },
    { label: 'Terms', url: '/terms' },
    { label: 'Shipping', url: '/shipping' },
    { label: 'Returns', url: '/returns' },
    { label: 'Warranty', url: '/warranty' },
    { label: 'Sitemap', url: '/sitemap.xml' },
  ]
  const footerLegalCount = await db.navMenuItem.count({ where: { menuId: footerLegalMenu.id } })
  if (footerLegalCount === 0) {
    for (let i = 0; i < legalLinks.length; i++) {
      const item = legalLinks[i]!
      await db.navMenuItem.create({
        data: {
          menuId: footerLegalMenu.id,
          parentId: null,
          position: i,
          label: item.label,
          linkType: 'custom_url',
          customUrl: item.url,
        },
      })
    }
  } else {
    for (const item of legalLinks) {
      const exists = await db.navMenuItem.findFirst({
        where: { menuId: footerLegalMenu.id, label: item.label },
        select: { id: true },
      })
      if (exists) continue
      const max = await db.navMenuItem.aggregate({
        where: { menuId: footerLegalMenu.id },
        _max: { position: true },
      })
      await db.navMenuItem.create({
        data: {
          menuId: footerLegalMenu.id,
          parentId: null,
          position: (max._max.position ?? -1) + 1,
          label: item.label,
          linkType: 'custom_url',
          customUrl: item.url,
        },
      })
    }
  }
}

// ── Spec template seeding ────────────────────────────────────────────────────

type FieldDef = {
  key: string
  label: string
  unit: string | null
  dataType: 'text' | 'number' | 'boolean' | 'select'
  group: string
  position: number
  isQuickSpec?: boolean
  isKeyFeature?: boolean
}

type TemplateDef = {
  slug: string
  name: string
  description: string
  fields: FieldDef[]
}

const TEMPLATES: TemplateDef[] = [
  {
    slug: 'pump-spec',
    name: 'Hydraulic pump',
    description: 'Standard spec template for hydraulic pumps (axial piston, gear, vane).',
    fields: [
      {
        key: 'displacement',
        label: 'Displacement',
        unit: 'cm³/rev',
        dataType: 'number',
        group: 'Hydraulic',
        position: 0,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'pressure_peak',
        label: 'Pressure (peak)',
        unit: 'bar',
        dataType: 'number',
        group: 'Hydraulic',
        position: 1,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'speed_max',
        label: 'Speed (max)',
        unit: 'rpm',
        dataType: 'number',
        group: 'Hydraulic',
        position: 2,
        isQuickSpec: true,
      },
      {
        key: 'pump_type',
        label: 'Pump type',
        unit: null,
        dataType: 'text',
        group: 'Hydraulic',
        position: 3,
      },
      {
        key: 'volumetric_efficiency',
        label: 'Volumetric efficiency',
        unit: '%',
        dataType: 'number',
        group: 'Hydraulic',
        position: 4,
      },
      {
        key: 'mounting',
        label: 'Mounting',
        unit: null,
        dataType: 'text',
        group: 'Mechanical',
        position: 0,
        isQuickSpec: true,
      },
      {
        key: 'rotation',
        label: 'Rotation',
        unit: null,
        dataType: 'text',
        group: 'Mechanical',
        position: 1,
      },
      {
        key: 'weight',
        label: 'Weight',
        unit: 'kg',
        dataType: 'number',
        group: 'Mechanical',
        position: 2,
      },
      {
        key: 'warranty_months',
        label: 'Warranty',
        unit: 'months',
        dataType: 'number',
        group: 'Commercial',
        position: 0,
      },
    ],
  },
  {
    slug: 'valve-spec',
    name: 'Hydraulic valve',
    description: 'Spec template for solenoid, pressure and proportional hydraulic valves.',
    fields: [
      {
        key: 'flow_rate_max',
        label: 'Flow rate (max)',
        unit: 'L/min',
        dataType: 'number',
        group: 'Performance',
        position: 0,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'pressure_max',
        label: 'Pressure (max)',
        unit: 'bar',
        dataType: 'number',
        group: 'Performance',
        position: 1,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'valve_function',
        label: 'Function',
        unit: null,
        dataType: 'text',
        group: 'Performance',
        position: 2,
      },
      {
        key: 'cetop_size',
        label: 'CETOP size',
        unit: null,
        dataType: 'text',
        group: 'Mechanical',
        position: 0,
        isQuickSpec: true,
      },
      {
        key: 'weight',
        label: 'Weight',
        unit: 'kg',
        dataType: 'number',
        group: 'Mechanical',
        position: 1,
      },
      {
        key: 'voltage',
        label: 'Coil voltage',
        unit: null,
        dataType: 'text',
        group: 'Electrical',
        position: 0,
      },
      {
        key: 'coil_power',
        label: 'Coil power',
        unit: 'W',
        dataType: 'number',
        group: 'Electrical',
        position: 1,
      },
      {
        key: 'warranty_months',
        label: 'Warranty',
        unit: 'months',
        dataType: 'number',
        group: 'Commercial',
        position: 0,
      },
    ],
  },
  {
    slug: 'cylinder-spec',
    name: 'Hydraulic cylinder',
    description: 'Spec template for tie-rod and welded hydraulic cylinders.',
    fields: [
      {
        key: 'bore',
        label: 'Bore',
        unit: 'mm',
        dataType: 'number',
        group: 'Dimensions',
        position: 0,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'rod_diameter',
        label: 'Rod diameter',
        unit: 'mm',
        dataType: 'number',
        group: 'Dimensions',
        position: 1,
        isQuickSpec: true,
      },
      {
        key: 'stroke',
        label: 'Stroke',
        unit: 'mm',
        dataType: 'number',
        group: 'Dimensions',
        position: 2,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'pressure_max',
        label: 'Pressure (max)',
        unit: 'bar',
        dataType: 'number',
        group: 'Performance',
        position: 0,
      },
      {
        key: 'push_force_kn',
        label: 'Push force',
        unit: 'kN',
        dataType: 'number',
        group: 'Performance',
        position: 1,
      },
      {
        key: 'mount_style',
        label: 'Mount style',
        unit: null,
        dataType: 'text',
        group: 'Mechanical',
        position: 0,
      },
      {
        key: 'seal_type',
        label: 'Seal material',
        unit: null,
        dataType: 'text',
        group: 'Mechanical',
        position: 1,
      },
      {
        key: 'warranty_months',
        label: 'Warranty',
        unit: 'months',
        dataType: 'number',
        group: 'Commercial',
        position: 0,
      },
    ],
  },
  {
    slug: 'hose-fitting-spec',
    name: 'Hose / fitting',
    description: 'Spec template for high-pressure hoses and fittings.',
    fields: [
      {
        key: 'bore_size',
        label: 'Bore size',
        unit: null,
        dataType: 'text',
        group: 'Dimensions',
        position: 0,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'length_mm',
        label: 'Length',
        unit: 'mm',
        dataType: 'number',
        group: 'Dimensions',
        position: 1,
      },
      {
        key: 'pressure_working',
        label: 'Working pressure',
        unit: 'bar',
        dataType: 'number',
        group: 'Performance',
        position: 0,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'pressure_burst',
        label: 'Burst pressure',
        unit: 'bar',
        dataType: 'number',
        group: 'Performance',
        position: 1,
      },
      {
        key: 'temp_max',
        label: 'Temperature (max)',
        unit: '°C',
        dataType: 'number',
        group: 'Performance',
        position: 2,
      },
      {
        key: 'reinforcement',
        label: 'Reinforcement',
        unit: null,
        dataType: 'text',
        group: 'Construction',
        position: 0,
      },
      {
        key: 'fitting_type',
        label: 'Fitting type',
        unit: null,
        dataType: 'text',
        group: 'Construction',
        position: 1,
      },
    ],
  },
  {
    slug: 'accumulator-spec',
    name: 'Hydraulic accumulator',
    description: 'Spec template for bladder, piston and diaphragm accumulators.',
    fields: [
      {
        key: 'capacity_l',
        label: 'Capacity',
        unit: 'L',
        dataType: 'number',
        group: 'Performance',
        position: 0,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'pressure_max',
        label: 'Pressure (max)',
        unit: 'bar',
        dataType: 'number',
        group: 'Performance',
        position: 1,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'pre_charge_bar',
        label: 'Pre-charge',
        unit: 'bar',
        dataType: 'number',
        group: 'Performance',
        position: 2,
      },
      {
        key: 'bladder_material',
        label: 'Bladder material',
        unit: null,
        dataType: 'text',
        group: 'Mechanical',
        position: 0,
      },
      {
        key: 'weight',
        label: 'Weight',
        unit: 'kg',
        dataType: 'number',
        group: 'Mechanical',
        position: 1,
      },
      {
        key: 'warranty_months',
        label: 'Warranty',
        unit: 'months',
        dataType: 'number',
        group: 'Commercial',
        position: 0,
      },
    ],
  },
  {
    slug: 'filter-spec',
    name: 'Hydraulic filter',
    description: 'Spec template for return-line, suction and pressure filters.',
    fields: [
      {
        key: 'filtration_micron',
        label: 'Filtration rating',
        unit: 'µm',
        dataType: 'number',
        group: 'Performance',
        position: 0,
        isQuickSpec: true,
        isKeyFeature: true,
      },
      {
        key: 'flow_rate_max',
        label: 'Flow rate (max)',
        unit: 'L/min',
        dataType: 'number',
        group: 'Performance',
        position: 1,
        isQuickSpec: true,
      },
      {
        key: 'pressure_drop_bar',
        label: 'Pressure drop',
        unit: 'bar',
        dataType: 'number',
        group: 'Performance',
        position: 2,
      },
      {
        key: 'mount_style',
        label: 'Mount style',
        unit: null,
        dataType: 'text',
        group: 'Mechanical',
        position: 0,
      },
      {
        key: 'weight',
        label: 'Weight',
        unit: 'kg',
        dataType: 'number',
        group: 'Mechanical',
        position: 1,
      },
      {
        key: 'warranty_months',
        label: 'Warranty',
        unit: 'months',
        dataType: 'number',
        group: 'Commercial',
        position: 0,
      },
    ],
  },
]

/** templateSlug + spec values for each seeded SKU. SKUs not listed stay
 *  template-less (legitimately, like the one-off ball valve and power pack). */
const PRODUCT_SPECS: Record<string, { templateSlug: string; values: Record<string, string> }> = {
  // Pumps
  'IH-AP71-D-R-V': {
    templateSlug: 'pump-spec',
    values: {
      displacement: '71',
      pressure_peak: '350',
      speed_max: '2600',
      pump_type: 'Axial piston (variable)',
      volumetric_efficiency: '94',
      mounting: 'SAE-B 2-bolt',
      rotation: 'CW (right)',
      weight: '26.5',
      warranty_months: '24',
    },
  },
  'IH-AP45-D-R-V': {
    templateSlug: 'pump-spec',
    values: {
      displacement: '45',
      pressure_peak: '350',
      speed_max: '2800',
      pump_type: 'Axial piston (variable)',
      volumetric_efficiency: '93',
      mounting: 'SAE-B 2-bolt',
      rotation: 'CW (right)',
      weight: '20.0',
      warranty_months: '24',
    },
  },
  'IH-AP100-D-R-V': {
    templateSlug: 'pump-spec',
    values: {
      displacement: '100',
      pressure_peak: '350',
      speed_max: '2400',
      pump_type: 'Axial piston (variable)',
      volumetric_efficiency: '95',
      mounting: 'SAE-C 2-bolt',
      rotation: 'CW (right)',
      weight: '38.0',
      warranty_months: '24',
    },
  },
  'IH-PGH4-21-020': {
    templateSlug: 'pump-spec',
    values: {
      displacement: '20',
      pressure_peak: '320',
      speed_max: '3200',
      pump_type: 'External gear',
      volumetric_efficiency: '92',
      mounting: 'SAE-A 2-bolt',
      rotation: 'CW',
      weight: '8.5',
      warranty_months: '12',
    },
  },
  'IH-T7B-B09-2R00-A100': {
    templateSlug: 'pump-spec',
    values: {
      displacement: '9',
      pressure_peak: '210',
      speed_max: '2400',
      pump_type: 'Vane (fixed)',
      volumetric_efficiency: '90',
      mounting: 'SAE-A 2-bolt',
      rotation: 'CW',
      weight: '6.2',
      warranty_months: '12',
    },
  },
  'IH-T6C-012-1R00-B1': {
    templateSlug: 'pump-spec',
    values: {
      displacement: '12',
      pressure_peak: '210',
      speed_max: '2400',
      pump_type: 'Vane (fixed, through-drive)',
      volumetric_efficiency: '90',
      mounting: 'SAE-B 2-bolt',
      rotation: 'CW',
      weight: '7.4',
      warranty_months: '12',
    },
  },

  // Valves
  'IH-DSG-01-3C4-D24': {
    templateSlug: 'valve-spec',
    values: {
      flow_rate_max: '40',
      pressure_max: '315',
      valve_function: '4/3 spring-centred directional',
      cetop_size: 'CETOP 3',
      weight: '1.6',
      voltage: '24 VDC',
      coil_power: '30',
      warranty_months: '12',
    },
  },
  'IH-DSG-01-2B2-D24': {
    templateSlug: 'valve-spec',
    values: {
      flow_rate_max: '40',
      pressure_max: '315',
      valve_function: '4/2 spring-offset directional',
      cetop_size: 'CETOP 3',
      weight: '1.6',
      voltage: '24 VDC',
      coil_power: '30',
      warranty_months: '12',
    },
  },
  'IH-MBR-01-30': {
    templateSlug: 'valve-spec',
    values: {
      flow_rate_max: '30',
      pressure_max: '300',
      valve_function: 'Pressure reducing (direct-acting)',
      cetop_size: 'CETOP 3',
      weight: '1.4',
      warranty_months: '12',
    },
  },
  'IH-BG-03-315': {
    templateSlug: 'valve-spec',
    values: {
      flow_rate_max: '160',
      pressure_max: '315',
      valve_function: 'Pressure relief (pilot-operated)',
      cetop_size: 'CETOP 5',
      weight: '3.2',
      warranty_months: '12',
    },
  },
  'IH-FLCB-LAN-3C4-D24': {
    templateSlug: 'valve-spec',
    values: {
      flow_rate_max: '100',
      pressure_max: '315',
      valve_function: 'Proportional directional (closed-loop)',
      cetop_size: 'NG10',
      weight: '4.8',
      voltage: '24 VDC',
      coil_power: '40',
      warranty_months: '24',
    },
  },

  // Cylinders
  'IH-CYL-80-50-300': {
    templateSlug: 'cylinder-spec',
    values: {
      bore: '80',
      rod_diameter: '50',
      stroke: '300',
      pressure_max: '250',
      push_force_kn: '125',
      mount_style: 'Foot bracket (FB)',
      seal_type: 'NBR',
      warranty_months: '12',
    },
  },
  'IH-CYL-100-70-500': {
    templateSlug: 'cylinder-spec',
    values: {
      bore: '100',
      rod_diameter: '70',
      stroke: '500',
      pressure_max: '250',
      push_force_kn: '196',
      mount_style: 'Foot bracket (FB)',
      seal_type: 'NBR',
      warranty_months: '12',
    },
  },
  'IH-CYL-63-45-200': {
    templateSlug: 'cylinder-spec',
    values: {
      bore: '63',
      rod_diameter: '45',
      stroke: '200',
      pressure_max: '250',
      push_force_kn: '78',
      mount_style: 'Clevis bracket (CB)',
      seal_type: 'NBR',
      warranty_months: '12',
    },
  },
  'IH-WC-120-80-600': {
    templateSlug: 'cylinder-spec',
    values: {
      bore: '120',
      rod_diameter: '80',
      stroke: '600',
      pressure_max: '350',
      push_force_kn: '395',
      mount_style: 'MF5 mid-flange',
      seal_type: 'PTFE-NBR',
      warranty_months: '12',
    },
  },

  // Hoses & fittings
  'IH-JIC-90-08': {
    templateSlug: 'hose-fitting-spec',
    values: {
      bore_size: '1/2"',
      pressure_working: '420',
      pressure_burst: '1680',
      temp_max: '120',
      reinforcement: 'Stainless steel (316)',
      fitting_type: '90° JIC 37° elbow, BSP male',
    },
  },
  'IH-421-08': {
    templateSlug: 'hose-fitting-spec',
    values: {
      bore_size: '1/2" (DN13)',
      pressure_working: '420',
      pressure_burst: '1680',
      temp_max: '100',
      reinforcement: '2-wire braid (SAE 100R2AT)',
      fitting_type: 'Hose, sold per metre',
    },
  },
  'IH-451-12': {
    templateSlug: 'hose-fitting-spec',
    values: {
      bore_size: '3/4" (DN19)',
      pressure_working: '360',
      pressure_burst: '1440',
      temp_max: '100',
      reinforcement: '4-spiral compact (SAE 100R13)',
      fitting_type: 'Hose, sold per metre',
    },
  },

  // Accumulators
  'IH-SB330-10A1': {
    templateSlug: 'accumulator-spec',
    values: {
      capacity_l: '10',
      pressure_max: '330',
      pre_charge_bar: '100',
      bladder_material: 'NBR',
      weight: '14.5',
      warranty_months: '24',
    },
  },
  'IH-SB330-4A1': {
    templateSlug: 'accumulator-spec',
    values: {
      capacity_l: '4',
      pressure_max: '330',
      pre_charge_bar: '100',
      bladder_material: 'NBR',
      weight: '7.8',
      warranty_months: '24',
    },
  },

  // Filters
  'IH-0330R010BN4HC': {
    templateSlug: 'filter-spec',
    values: {
      filtration_micron: '10',
      flow_rate_max: '330',
      pressure_drop_bar: '0.4',
      mount_style: 'Inline / return-line',
      weight: '3.4',
      warranty_months: '12',
    },
  },
  'IH-0160DN010BN4HC': {
    templateSlug: 'filter-spec',
    values: {
      filtration_micron: '10',
      flow_rate_max: '160',
      pressure_drop_bar: '0.2',
      mount_style: 'Tank-top suction',
      weight: '2.8',
      warranty_months: '12',
    },
  },

  // IH-KHB-G12-14-2X-S (ball valve) and IH-PP-11KW-30-DS (power pack) intentionally omitted —
  // both are one-offs in the catalogue and don't fit any of the templates above. They will
  // continue to show "Compare unavailable" on the product page until a fitting template is
  // designed by an engineer.
}

async function seedSpecTemplates(categoryDefaultTemplate: Record<string, string>): Promise<void> {
  // 1. Upsert templates and their fields.
  const templateBySlug = new Map<string, { id: string; fieldByKey: Map<string, string> }>()
  for (const tpl of TEMPLATES) {
    const template = await db.specTemplate.upsert({
      where: { slug: tpl.slug },
      create: { slug: tpl.slug, name: tpl.name, description: tpl.description },
      update: { name: tpl.name, description: tpl.description },
    })
    const fieldByKey = new Map<string, string>()
    for (const f of tpl.fields) {
      const field = await db.specTemplateField.upsert({
        where: { templateId_key: { templateId: template.id, key: f.key } },
        create: {
          templateId: template.id,
          key: f.key,
          label: f.label,
          unit: f.unit,
          dataType: f.dataType,
          group: f.group,
          position: f.position,
          isQuickSpec: f.isQuickSpec ?? false,
          isKeyFeature: f.isKeyFeature ?? false,
        },
        update: {
          label: f.label,
          unit: f.unit,
          dataType: f.dataType,
          group: f.group,
          position: f.position,
          isQuickSpec: f.isQuickSpec ?? false,
          isKeyFeature: f.isKeyFeature ?? false,
        },
      })
      fieldByKey.set(f.key, field.id)
    }
    templateBySlug.set(tpl.slug, { id: template.id, fieldByKey })
  }

  // 2. Set Category.defaultSpecTemplateId so the admin "create product" flow
  //    pre-fills the right template per category.
  for (const [categoryId, templateSlug] of Object.entries(categoryDefaultTemplate)) {
    const tpl = templateBySlug.get(templateSlug)
    if (!tpl) continue
    await db.category.update({
      where: { id: categoryId },
      data: { defaultSpecTemplateId: tpl.id },
    })
  }

  // 3. Per product: attach specTemplateId, replace template-linked specs.
  for (const [sku, payload] of Object.entries(PRODUCT_SPECS)) {
    const tpl = templateBySlug.get(payload.templateSlug)
    if (!tpl) continue
    const product = await db.product.findUnique({ where: { sku }, select: { id: true } })
    if (!product) continue

    await db.$transaction([
      db.product.update({
        where: { id: product.id },
        data: { specTemplateId: tpl.id },
      }),
      // Idempotent: drop any existing template-linked specs for this product
      // before re-creating from the seed. Free-form specs (templateFieldId IS
      // NULL) are left alone so admin-curated additions survive a reseed.
      db.productSpec.deleteMany({
        where: { productId: product.id, templateFieldId: { not: null } },
      }),
    ])

    const templateDef = TEMPLATES.find((t) => t.slug === payload.templateSlug)!
    const rows = Object.entries(payload.values)
      .map(([key, value], idx) => {
        const fieldId = tpl.fieldByKey.get(key)
        const fieldDef = templateDef.fields.find((f) => f.key === key)
        if (!fieldId || !fieldDef) return null
        return {
          productId: product.id,
          group: fieldDef.group,
          label: fieldDef.label,
          value,
          unit: fieldDef.unit,
          position: idx,
          templateFieldId: fieldId,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    if (rows.length > 0) {
      await db.productSpec.createMany({ data: rows })
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
