/**
 * The OFS gate-valve, repair-part and ball-valve pages built on 2026-09-25
 * (packages/db/data/ofs-gate-valve-repair-kits, ofs-gate-valves,
 * ofs-ball-valves). Their copy is sourced and stays: each one was held only
 * because it had four FAQs or fewer and a short description under 30 words.
 * Each gets a fuller short description and one more answer, using facts the
 * pages and their sources already carry (stamps read off the parts, Cameron's
 * TC1412 DM 7500 manual, the SWOP 4″ DM 7500 kit bill of materials, Demco's
 * DM parts chart, the valve nameplates).
 */
import type { Entry, Faq } from './types'

const SOURCES_DEMCO = [
  'Cameron TC1412 DM 7500 installation, operation and maintenance manual',
  'Part stamps and kit labels photographed in the OFS Energy export (read 2026-09-25)',
  'Demco DM 2000–5000 parts chart (2″) as published by OFS',
]

const gateFaq = (size: string, pn: string): Faq => ({
  question: 'How do I tell a DM 7500 gate from a DM 2000–5000 gate?',
  answer: `Read the stamp. Cameron's DM 7500 gates carry seven-digit part numbers, ${pn} on the ${size}, and are alloy steel, usually black QPQ-nitrided. DM 2000–5000 gates are nickel-plated steel or 316 stainless with four-digit Demco numbers, such as 1887-002 on the 2″. The two families share no gates, seats or kits.`,
})

const boreFaq = (size: string, bore: string): Faq => ({
  question: `What is the minimum bore through a ${size} DM 7500 valve?`,
  answer: `${bore} in, the inside diameter of the two body wear rings, per Cameron's DM 7500 manual. Check the wear rings whenever the seat insert is changed and replace them if they are scored.`,
})

const kitNumberFaq = (photographed: string | null): Faq => ({
  question: 'What part number should I quote for a DM 7500 kit?',
  answer: `Cameron numbers its DM 7500 kits J025177-00X74 for the minor kit and J025177-10X74 for the major kit, X being the valve size${photographed ? `: the 2″ minor kit we have photographed is ${photographed}` : ''}. Quote the number from your last kit or the valve's documentation and we confirm the match before quoting.`,
})

const seat5kFaq = (example: string | null): Faq => ({
  question: 'How do I identify a DM 2000–5000 seat assembly?',
  answer: `It is one piece: a black elastomer body with two locating pins, a slot for the gate and two metal wear inserts moulded in. DM 7500 valves use a separate ring-type insert with body wear rings instead. Demco numbers these seats with four digits${example ? `, ${example},` : ''} and Cameron adds a J00 prefix.`,
})

const apiMarksFaq = (marks: string, materialClass: string): Faq => ({
  question: `What do the markings ${marks} mean?`,
  answer: `They are API 6A designations. PSL, from 1 to 4, is the product specification level: it sets how much inspection, testing and documentation the valve receives. PR2 is the more demanding of the two performance requirement levels for design validation. ${materialClass} Specify the levels you need on the RFQ.`,
})

export const OFS_VALVES: Entry[] = [
  {
    sku: 'IH-GVRK-DM7K5-GATE-3',
    was: 'Demco DM 7500 Gate Valve Gate, 3″',
    descriptionShort:
      '3″ replacement gate for Demco DM 7500 mud gate valves rated 7,500 psi: alloy steel, usually black QPQ-nitrided, Cameron part no. 2171112-01. Supplied new, genuine Cameron or interchangeable, and best replaced together with the seat insert.',
    addFaqs: [gateFaq('3″', '2171112-01')],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM7K5-GATE-4',
    was: 'Demco DM 7500 Gate Valve Gate, 4″',
    descriptionShort:
      '4″ replacement gate for Demco DM 7500 mud gate valves rated 7,500 psi: alloy steel, usually black QPQ-nitrided, Cameron part no. 2171267-01. Supplied new, genuine Cameron or interchangeable, and best replaced together with the seat insert.',
    addFaqs: [gateFaq('4″', '2171267-01')],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM7K5-GATE-5',
    was: 'Demco DM 7500 Gate Valve Gate, 5″',
    descriptionShort:
      '5″ replacement gate for Demco DM 7500 mud gate valves rated 7,500 psi: alloy steel, usually black QPQ-nitrided, Cameron part no. 2171108-01. Supplied new, genuine Cameron or interchangeable, and best replaced together with the seat insert.',
    addFaqs: [gateFaq('5″', '2171108-01')],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM7K5-KIT-2',
    was: 'Demco DM 7500 Gate Valve Repair Kit, 2″ — Minor & Major',
    descriptionShort:
      '2″ repair kits for Demco DM 7500 mud gate valves: the minor kit J025177-00274 (gate, seat insert, wear rings and seals) and the major overhaul kit, which adds the stem, packing and stem screw. OEM Cameron or interchangeable.',
    addFaqs: [kitNumberFaq('J025177-00274')],
    sources: [...SOURCES_DEMCO, 'SWOP 4″ DM 7500 kit bill of materials'],
  },
  {
    sku: 'IH-GVRK-DM7K5-KIT-3',
    was: 'Demco DM 7500 Gate Valve Repair Kit, 3″ — Minor',
    descriptionShort:
      '3″ minor repair kit for Demco DM 7500 mud gate valves: gate, seat insert, two body wear rings with their seals, bonnet seal and gate clip. The major kit is supplied to order. New, OEM Cameron or interchangeable.',
    addFaqs: [kitNumberFaq(null)],
    addSpecs: [
      {
        group: 'Identification',
        label: 'Kit contents',
        value:
          'Minor kit: gate, seat insert, two body wear rings with seals, bonnet seal, gate clip',
      },
    ],
    sources: [...SOURCES_DEMCO, 'SWOP 4″ DM 7500 kit bill of materials'],
  },
  {
    sku: 'IH-GVRK-DM7K5-SEAT-2',
    was: 'Demco DM 7500 Gate Valve Seat Insert, 2″',
    descriptionShort:
      '2″ seat insert for Demco DM 7500 mud gate valves, Cameron part no. 2139742-01: AISI 410 stainless seat rings in Buna-N, HNBR or Viton, locking into two body wear rings. OEM Cameron or interchangeable.',
    addFaqs: [boreFaq('2″', '1.97')],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM7K5-SEAT-3',
    was: 'Demco DM 7500 Gate Valve Seat Insert, 3″',
    descriptionShort:
      '3″ seat insert for Demco DM 7500 mud gate valves: AISI 410 stainless seat rings in Buna-N, HNBR or Viton, locking into two body wear rings with their own seals. OEM Cameron or interchangeable.',
    addFaqs: [boreFaq('3″', '2.98')],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM7K5-SEAT-5',
    was: 'Demco DM 7500 Gate Valve Seat Insert, 5″',
    descriptionShort:
      '5″ seat insert for Demco DM 7500 mud gate valves: AISI 410 stainless seat rings in Buna-N, HNBR or Viton, locking into two body wear rings with their own seals. OEM Cameron or interchangeable.',
    addFaqs: [boreFaq('5″', '5.17')],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM5K-SEAT-2',
    was: 'Demco DM Gate Valve Seat Assembly, 2″, 2,000–5,000 psi',
    descriptionShort:
      '2″ one-piece seat assembly for Demco DM mud gate valves rated 2,000 to 5,000 psi: steel, ductile iron or 316 stainless wear inserts in Buna-N or Viton, from Demco 1876-021 (steel, Buna-N). OEM or interchangeable.',
    addFaqs: [seat5kFaq('1876-021 on the 2″ steel/Buna-N seat')],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM5K-SEAT-3',
    was: 'Demco DM Gate Valve Seat Assembly, 3″, 2,000–5,000 psi',
    descriptionShort:
      '3″ one-piece seat assembly for Demco DM mud gate valves rated 2,000 to 5,000 psi: metal wear inserts moulded into a Buna-N or Viton body with locating pins and a gate slot. OEM or interchangeable.',
    addFaqs: [seat5kFaq(null)],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM5K-SEAT-4',
    was: 'Demco DM Gate Valve Seat Assembly, 4″, 2,000–5,000 psi',
    descriptionShort:
      '4″ one-piece seat assembly for Demco DM mud gate valves rated 2,000 to 5,000 psi. The full-port steel/Buna-N seat is Demco 2207-021 (Cameron J002207-021); Viton to order. Supplied new, OEM or interchangeable.',
    addFaqs: [seat5kFaq('2207-021 on the 4″ full-port steel/Buna-N seat')],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM-SEAT-INSERT-1-5',
    was: 'Demco DM Gate Valve Seat Insert, 1-½″',
    descriptionShort:
      '1-½″ ring-type seat insert for Demco DM gate valves, marked 2259403-01: steel seat rings encapsulated in elastomer, the same design as the DM 7500 insert. We confirm the fit against your valve nameplate before quoting.',
    addFaqs: [
      {
        question: 'Which valves take this 1-½″ insert?',
        answer:
          "Demco DM gate valves of the ring-insert design. Cameron lists the DM 7500 itself from 2″ upward, so send the valve's nameplate details, or the number on your old insert, and we confirm the fit before quoting.",
      },
    ],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM-STEM-PACKING',
    was: 'Demco DM Gate Valve Stem Packing',
    descriptionShort:
      'Stem packing for Demco DM mud gate valves: Buna-N or Viton seals with a bronze bushing. Demco 1949-001 and 1949-006 fit 2″ DM 2000–5000 valves; J015853-008 is the 4″ DM 7500 vee packing. OEM or interchangeable.',
    addFaqs: [
      {
        question: 'Which packing part number do I need?',
        answer:
          "It depends on the valve's size and series. On 2″ DM 2000–5000 valves the stem seal assembly is 1949-001 in Buna-N or 1949-006 in Viton, each with a bronze bushing; on the 4″ DM 7500 it is the vee packing with bushing, J015853-008. For other sizes, send the valve nameplate details.",
      },
      {
        question: 'Buna-N or Viton?',
        answer:
          'Buna-N (nitrile) is the standard for water- and oil-based drilling mud. Viton is chosen for higher temperatures and aromatic or aggressive fluids. State the fluid and temperature on the RFQ if you are unsure.',
      },
    ],
    addSpecs: [
      {
        group: 'Identification',
        label: 'In repair kits',
        value: 'Major kits of both series (DM 2000–5000 stem seal assembly; DM 7500 vee packing)',
      },
    ],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM-STEM-SCREW-2',
    was: 'Demco DM Gate Valve Stem Screw, 2″',
    descriptionShort:
      '2″ stem screw for Demco DM mud gate valves (Demco 1913, steel), with the 1848 screw housing and 5530-224 Buna-N stem screw seal to order. The DM 7500 version is an AISI 1022 assembly with a roller thrust bearing.',
    addFaqs: [
      {
        question: 'What holds the stem screw in place?',
        answer:
          'The screw housing, which holds it in the bonnet: Demco 1848 on the DM 2000–5000, sealed with the 5530-224 Buna-N stem screw seal. On the DM 7500, Cameron supplies the screw as an assembly with a roller thrust bearing, in an AISI 1022 screw housing.',
      },
      {
        question: 'How do I match a stem screw to my valve?',
        answer:
          'By size and series. Send the valve nameplate details, or the number stamped on the old screw, and we match it before quoting.',
      },
    ],
    addSpecs: [
      {
        group: 'Construction',
        label: 'Material',
        value: 'Steel, yellow zinc plated (DM 2000–5000, as photographed); AISI 1022 (DM 7500)',
      },
      {
        group: 'Construction',
        label: 'Bearing',
        value: 'Roller thrust bearing (DM 7500 stem screw assembly)',
      },
    ],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-GVRK-DM-STEM-2',
    was: 'Demco DM Gate Valve Stem, 2″',
    descriptionShort:
      '2″ replacement stem for Demco DM mud gate valves: 303 or 316 stainless on the DM 2000–5000 (Demco 1931-002, 1931-008) and AISI 410 stainless, 22 HRC max, on the DM 7500. Supplied new, OEM Cameron or interchangeable.',
    addFaqs: [
      {
        question: 'Which stem material does each series use?',
        answer:
          'Cameron makes DM 7500 stems in AISI 410 stainless, hardened to 22 HRC at most. DM 2000–5000 stems are 303 stainless (1931-002) or 316 stainless (1931-008).',
      },
      {
        question: 'Is the stem part of a repair kit?',
        answer:
          'On the DM 7500 it comes in the major kit, with the vee packing and the stem screw; the minor kit does not include it. Order it on its own for a bent stem or damaged threads.',
      },
    ],
    addSpecs: [
      { group: 'Construction', label: 'Hardness', value: '22 HRC max (DM 7500, AISI 410)' },
    ],
    sources: SOURCES_DEMCO,
  },
  {
    sku: 'IH-OFV-GATE-2116-7K5',
    was: 'Gate Valve, 2-1/16″, 7,500 psi',
    descriptionShort:
      '2-1/16″ gate valve rated 7,500 psi, supplied new from WOM: the units we have seen are marked API 6A PSL 3, PR2 and material class DD-NL. Butt-weld, flanged or union ends and trim to your specification.',
    addFaqs: [
      apiMarksFaq(
        'PSL 3, PR2 and DD-NL',
        'DD is a sour-service material class with carbon or low-alloy steel body and trim, and NL means no limit is set on the H₂S partial pressure.'
      ),
    ],
    sources: ['Valve nameplates photographed in the OFS Energy export (read 2026-09-25)', 'API 6A'],
  },
  {
    sku: 'IH-OFV-GATE-3-7K5',
    was: 'Mud Gate Valve, 3″, 7,500 psi',
    descriptionShort:
      '3″ mud gate valve rated 7,500 psi for standpipe manifolds and mud pump discharge lines, supplied new from DEMCO. The unit shown has butt-weld ends for XXH pipe; flanged or union ends and trim to order.',
    addFaqs: [
      {
        question: 'What does butt-weld XXH mean?',
        answer:
          "The valve's ends are prepared for butt-welding to double extra-heavy (XXH) wall pipe. A butt-weld end has to match the pipe's wall, so state the pipe size and schedule on the RFQ.",
      },
    ],
    sources: ['Valve nameplates photographed in the OFS Energy export (read 2026-09-25)'],
  },
  {
    sku: 'IH-OFV-GATE-4116-7K5',
    was: 'Mud Gate Valve, 4-1/16″, 7,500 psi',
    descriptionShort:
      '4-1/16″ mud gate valve rated 7,500 psi for standpipe manifolds and mud pump discharge lines, supplied new from WOM and Anson. Units we have seen are marked PSL 3, PR2 or material class EE; ends and trim to order.',
    addFaqs: [
      apiMarksFaq(
        'PSL 3, PR2 and EE',
        'EE is a sour-service material class with a carbon or low-alloy steel body and stainless trim.'
      ),
    ],
    sources: ['Valve nameplates photographed in the OFS Energy export (read 2026-09-25)', 'API 6A'],
  },
  {
    sku: 'IH-IBV-4',
    was: 'Industrial Ball Valve, 4″ (DN100)',
    descriptionShort:
      '4″ (DN100) industrial ball valve for process, utility and plant service, rated 600 psi WOG on the Matco-Norca units we have seen. Supplied new, with the body, seat and end connections to suit your line.',
    sources: ['Valve markings photographed in the OFS Energy export (read 2026-09-25)'],
  },
]
