/**
 * Blog taxonomy — the ten topics the content programme is built around.
 *
 * These are not the eight chips the design mock shipped with. That set
 * (Sizing & Selection, Teardowns, Failure Analysis, Standards & Specs,
 * Industry — Marine, Industry — Mining, Procurement, Maintenance) covered
 * none of fittings, industrial hose, oilfield/pressure control or export —
 * which between them are the majority of the catalogue: 391 hose & fitting
 * SKUs, 279 industrial hose, 129 flow iron & wellhead, 110 oilfield valves.
 *
 * Each category is a hub at /blog/c/[slug] that accumulates internal links
 * from every article filed under it, and each names the catalogue area it
 * funnels into.
 */

export type BlogCategorySeed = {
  slug: string
  name: string
  description: string
  heroCopy: string
  position: number
}

const CATEGORIES: BlogCategorySeed[] = [
  {
    slug: 'specification-standards',
    name: 'Specification & standards',
    description:
      'SAE, EN, DIN and ISO hose and fitting specifications explained, with the pressure, temperature and construction data behind each grade.',
    heroCopy:
      'What the standards actually say — SAE 100R, EN 853/856, ISO 18752 and the API pressure-control specifications — read against the clause rather than repeated from a supplier catalogue.',
    position: 1,
  },
  {
    slug: 'fitting-identification',
    name: 'Thread & fitting identification',
    description:
      'How to identify a hydraulic fitting by thread form, seat angle and thread count, and what actually interchanges with what.',
    heroCopy:
      'JIC, ORFS, BSPP, BSPT, NPT, metric DIN 24° and SAE flange — how to tell them apart with a gauge and a caliper, and which of them will thread together and still leak.',
    position: 2,
  },
  {
    slug: 'hose-assembly',
    name: 'Assembly, crimping & certification',
    description:
      'Building hose assemblies: cut length, crimp diameter, die selection, skiving, proof testing and what belongs on a test certificate.',
    heroCopy:
      'What happens between a length of bulk hose and a certified assembly — measurement, crimp specification, proof test, and the documentation a procurement officer will ask for.',
    position: 3,
  },
  {
    slug: 'failure-analysis',
    name: 'Failure analysis',
    description:
      'Why hydraulic hoses fail — abrasion, kinking, ozone cracking, heat ageing, incorrect routing — and how to read a failed assembly.',
    heroCopy:
      'A failed hose usually tells you why it failed. Cover condition, wire exposure, burst geometry and fitting witness marks each point somewhere different.',
    position: 4,
  },
  {
    slug: 'safety',
    name: 'Safety & HSE',
    description:
      'Hydraulic injection injury, stored energy, whip restraint and the procedures that keep a pressurised system from hurting someone.',
    heroCopy:
      'High-pressure hydraulics injure people in ways that do not look serious for the first few hours. What the hazards are, and the controls that actually work against them.',
    position: 5,
  },
  {
    slug: 'maintenance-reliability',
    name: 'Maintenance & reliability',
    description:
      'Replacement intervals, inspection routines, hose registers, traceability and building a programme that ends unplanned failures.',
    heroCopy:
      'Moving from replacing hoses when they burst to replacing them before they do — criticality ranking, condition-based intervals, and the records that make it auditable.',
    position: 6,
  },
  {
    slug: 'oilfield-pressure-control',
    name: 'Oilfield & pressure control',
    description:
      'API 7K, 16C, 16D and 16A equipment: rotary and vibrator hose, choke and kill lines, BOP control hose, and the recertification regimes that govern them.',
    heroCopy:
      'Drilling, well-control and pressure-testing equipment, and what each API specification actually requires of it — including the intervals and documentation an operator will audit.',
    position: 7,
  },
  {
    slug: 'industrial-hose',
    name: 'Industrial hose',
    description:
      'Non-hydraulic hose by application — chemical, steam, food-grade, bunkering, dredging, air, water and abrasive material transfer.',
    heroCopy:
      'Industrial hose is selected on the medium, not the pressure. Liner compatibility, temperature, electrical continuity and the standards that apply to each service.',
    position: 8,
  },
  {
    slug: 'machine-down',
    name: 'Machine down',
    description:
      'Hose replacement by equipment type — excavators, forklifts, cranes, tippers, mixers and underground loaders — and what fails first on each.',
    heroCopy:
      'Which circuit went, how to identify the hose without the dealer part number, and how to get the machine back to work the same day.',
    position: 9,
  },
  {
    slug: 'procurement-export',
    name: 'Procurement & export',
    description:
      'HS classification, conformity certification, vendor registration, Incoterms and the document pack that clears a shipment.',
    heroCopy:
      'The paperwork side of buying hydraulics in the Gulf and exporting from it — classification, conformity, approvals and what a compliant document set contains.',
    position: 10,
  },
]

export default CATEGORIES
