/**
 * `/manufacturing` — the content record behind the manufacturing capability page.
 *
 * WHAT THIS PAGE IS FOR. It answers one question for an engineering buyer:
 * how are these fittings actually made, and what is controlled at each stage?
 * It carries no prices and no product listings. The conversion is a drawing,
 * sample or specification submitted for a manufacturing quote, and every CTA
 * resolves to that one form.
 *
 * WHY A FLAT CONSTANT AND NOT A CMS PAGE. Every figure on this page is a
 * measured capability of a real production line — ±5 °C melt control, 630 T to
 * 1600 T presses, HB ≤ 187, 0.01 mm CMM. Those are claims, not copy. Putting
 * them behind a rich-text box invites an editor to round one off, and nothing
 * downstream would catch it. When the partner's capability changes, this file
 * changes, and the diff is reviewable.
 *
 * COPY PROVENANCE — four kinds on this page, and they are not interchangeable:
 *
 *   1. Process, workshop and QC copy carries over from the principal
 *      supplier's page (Bestflow / BAFAW) effectively as written. It describes
 *      real measured capability. Safe to ship, and NOT to be reworded — flag
 *      it instead.
 *   2. Identity framing was rewritten. The source says "BAFAW employs a
 *      vertically integrated…" and "BAFAW operates over 20 CNC lathes…"
 *      throughout; Indus is a Dubai distributor, not the manufacturer, so the
 *      hero reads "Our principal manufacturing partner runs…" and the workshop
 *      bullets are stated impersonally. This is the difference between claiming
 *      a factory and describing a partner's. AWAITING CLIENT SIGN-OFF.
 *   3. ONE SOURCE SENTENCE WAS BROKEN AND IS NOW COMPLETED. The supplier's OEM
 *      step 2 ends mid-sentence on their live page: "Our engineers analyze the
 *      design, confirm materials and processes,". It reads here as "…and
 *      return a costed quotation." That ending is an assumption about their
 *      intent. AWAITING SIGN-OFF.
 *   4. The requirements grid and the enquiry form are new copy — the source
 *      page has neither, it uses a pop-up.
 *
 * SPELLING IS DELIBERATELY MIXED. New copy is British (`analyse`,
 * `standardised`, `moulding`); verbatim supplier sentences keep their American
 * spellings (`molding`, `normalizing`, `categorized`). The inconsistency marks
 * which sentences are quoted. Normalise it only as a whole-site decision.
 */

import type { DesignedEnquiry, DesignedPageImage } from './designed-pages'

/** Public Supabase bucket holding this page's three photographs. */
const IMG_BASE =
  'https://hesezbozronntejnsopr.supabase.co/storage/v1/object/public/manufacturing-images'

const img = (file: string, alt: string): DesignedPageImage => ({
  // All three source frames are near 3:2 and the design box is 16/10, so
  // `object-cover` trims about 7% off the sides — nothing in any of them sits
  // that close to the edge.
  src: `${IMG_BASE}/${file}`,
  alt,
  ratio: '16/10',
})

/** A key/value row in a spec table. */
export type ManufacturingSpecRow = readonly [key: string, value: string]

/** One of the three production workshops. */
export type ManufacturingWorkshop = {
  readonly name: string
  /** Mono tag pushed to the right of the block header, e.g. `630–1600 T · ±0.3 mm`. */
  readonly tag: string
  readonly image: DesignedPageImage
  /** Mono uppercase line under the photograph. Visible copy, not alt text. */
  readonly caption: string
  readonly points: readonly string[]
  /** Only the casting block has one — the note is an emphasis, not a slot to fill. */
  readonly note?: { readonly label: string; readonly body: string }
  readonly spec: readonly ManufacturingSpecRow[]
}

/** One of the twelve controlled process stages. */
export type ManufacturingStage = {
  readonly stage: string
  readonly title: string
  readonly body: string
  /** The stated outcome. Rendered under an accent GUARANTEE label. */
  readonly guarantee: string
}

/** A step in the OEM workflow, on the navy panel. */
export type ManufacturingOemStep = {
  readonly step: string
  readonly title: string
  readonly body: string
  /**
   * Which icon the renderer draws. A closed union rather than a component,
   * because this record is plain data that a domain test can read.
   */
  readonly icon: 'upload' | 'gauge' | 'wrench' | 'settings' | 'truck'
}

/** A cell in the "what we need / what comes back" grid. */
export type ManufacturingRequirement = {
  readonly label: string
  readonly body: string
}

export type ManufacturingPage = {
  readonly path: string
  readonly seo: { readonly title: string; readonly description: string }
  readonly breadcrumbLabel: string
  readonly hero: {
    readonly eyebrow: string
    readonly headingLead: string
    readonly headingEmphasis: string
    readonly lede: string
    readonly spec: readonly ManufacturingSpecRow[]
    readonly stats: readonly { readonly value: string; readonly label: string }[]
  }
  readonly workshops: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly items: readonly ManufacturingWorkshop[]
  }
  readonly process: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly items: readonly ManufacturingStage[]
  }
  readonly oem: {
    readonly eyebrow: string
    readonly headingLead: string
    readonly headingEmphasis: string
    readonly body: string
    readonly items: readonly ManufacturingOemStep[]
    readonly ctaLabel: string
    readonly ctaHref: string
  }
  readonly build: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly requirements: readonly ManufacturingRequirement[]
    readonly formTitle: string
    readonly formBody: string
    readonly spec: readonly ManufacturingSpecRow[]
  }
  readonly closing: { readonly heading: string; readonly body: string }
  /** The sibling page, cross-linked because the two are the same family. */
  readonly related: { readonly label: string; readonly href: string; readonly body: string }
}

export const MANUFACTURING_PAGE: ManufacturingPage = {
  path: '/manufacturing',

  seo: {
    title: 'Manufacturing — Casting, Forging & CNC Capability',
    description:
      'Casting, forging and CNC production behind the pipe fittings we supply — twelve controlled process stages, material traceability and inspection records with every batch.',
  },

  breadcrumbLabel: 'Manufacturing',

  hero: {
    eyebrow: 'Manufacturing behind what we supply',
    headingLead: 'Integrated',
    headingEmphasis: 'Manufacturing System',
    lede: 'Our principal manufacturing partner runs a vertically integrated industrial pipe fitting manufacturing system. Every step, from raw material forming to final surface treatment, ensures consistent quality and reliable performance for each batch of products.',
    spec: [
      ['Melt control', '±5 °C'],
      ['Press range', '630 T – 1600 T'],
      ['CMM accuracy', '0.01 mm'],
      ['Records retained', '3 years minimum'],
    ],
    stats: [
      { value: '3', label: 'Production workshops' },
      { value: '12', label: 'Controlled process stages' },
      { value: '100%', label: 'Visual inspection' },
      { value: 'ISO 9001', label: 'Quality system' },
    ],
  },

  workshops: {
    eyebrow: 'Production workshops',
    heading: 'Casting, forging and CNC under one process chain',
    lede: 'Three workshops cover the full route from melt to finished thread. Each carries its own measured control points, and the records follow the lot through to dispatch.',
    items: [
      {
        name: 'Casting Workshop',
        tag: 'INDUCTION MELT · ±5 °C',
        image: img(
          'casting-workshop-induction-furnace.webp',
          'Casting workshop — induction furnace pour and sand moulding line'
        ),
        caption: 'Casting workshop · induction melt and automatic sand moulding',
        points: [
          'Induction furnaces up to 1 ton capacity, allowing precise temperature control within ±5 °C.',
          'Each heat is tested on a spectrometer before pouring to verify chemical composition (C, Si, Mn, Cr, Ni) meets ASTM A105/A216 standards.',
          'Automatic sand molding and controlled cooling lines to reduce shrinkage and internal porosity.',
          'Every casting is subjected to 100% visual inspection and random X-ray testing to ensure integrity before machining.',
        ],
        note: {
          label: 'Real control point',
          body: 'steel composition, mold temperature, and cooling rate determine internal density — all three are monitored.',
        },
        spec: [
          ['Furnace capacity', '≤ 1 ton'],
          ['Melt control', '±5 °C'],
          ['Composition check', 'Spectrometer, per heat'],
          ['Standards', 'ASTM A105 / A216'],
          ['Inspection', '100% visual · random X-ray'],
        ],
      },
      {
        name: 'Forged Workshop',
        tag: '630–1600 T · ±0.3 mm',
        image: img(
          'forging-line-hydraulic-press.webp',
          'Forging line — hydraulic press forming elbows, tees and sockets'
        ),
        caption: 'Forging line · hydraulic presses, normalizing and quenching',
        points: [
          'Forging lines use hydraulic presses from 630 T to 1600 T, suitable for elbows, tees, and sockets up to 4 inches.',
          'Billets are heated in gas furnaces with ±10 °C temperature uniformity, ensuring full deformation and refined grain structure.',
          'After forging, each blank goes through normalizing and quenching under computer-controlled furnaces, and hardness (HB ≤ 187) is tested batch by batch.',
          'Dimensional accuracy of forged blanks is kept within ±0.3 mm to minimize machining loss.',
        ],
        spec: [
          ['Press range', '630 T – 1600 T'],
          ['Size range', 'Up to 4 inches'],
          ['Furnace uniformity', '±10 °C'],
          ['Heat treatment', 'Normalize + quench'],
          ['Hardness', 'HB ≤ 187, per batch'],
          ['Blank tolerance', '±0.3 mm'],
        ],
      },
      {
        name: 'CNC Workshop',
        tag: '20+ LATHES · CMM 0.01 mm',
        image: img(
          'cnc-workshop-lathes.webp',
          'CNC workshop — lathes and machining centres running threading and precision bores'
        ),
        caption: 'CNC workshop · threading, precision bores and CMM verification',
        points: [
          'Over 20 CNC lathes and 3 machining centers, handling threading (NPT, BSP, BSPT) and precision bores.',
          'Each operator follows a three-step measurement protocol — initial setup, in-process, and final verification — with digital gauges (Mitutoyo, Japan).',
          'Critical threads are checked with go/no-go gauges and sealing faces measured by CMM (Coordinate Measuring Machine) to 0.01 mm accuracy.',
          'All machining data are recorded per lot, so every fitting can be traced back to the exact machine and operator.',
        ],
        spec: [
          ['CNC lathes', '20+'],
          ['Machining centres', '3'],
          ['Thread forms', 'NPT · BSP · BSPT'],
          ['Gauging', 'Mitutoyo digital · go/no-go'],
          ['CMM accuracy', '0.01 mm'],
          ['Traceability', 'Per lot, machine and operator'],
        ],
      },
    ],
  },

  process: {
    eyebrow: 'Manufacturing process',
    heading: 'Industrial pipe fittings manufacturing process',
    lede: 'Quality is not checked at the end — it is built into every stage of production. Twelve stages, each with a defined control and a stated guarantee.',
    items: [
      {
        stage: '01',
        title: 'Material Acceptance',
        body: 'All incoming raw materials — carbon steel, stainless steel, or alloy steel — are verified through chemical composition analysis using spectrometers. Only certified materials that meet ASTM and ASME standards are accepted for production.',
        guarantee: 'Traceable mill certificates and batch tracking for every heat number.',
      },
      {
        stage: '02',
        title: 'Cutting Material',
        body: 'Each bar or billet is precision-cut using automatic sawing machines to ensure consistent size and clean ends. Cutting accuracy is controlled within ±0.5 mm to prepare for uniform forming and machining.',
        guarantee: 'Zero material deviation, stable dimensional base for forming.',
      },
      {
        stage: '03',
        title: 'Heating',
        body: 'The material is heated in temperature-controlled induction furnaces, maintaining an accurate forging temperature range of 1,150–1,250 °C. This ensures the best mechanical properties and metal grain uniformity.',
        guarantee: 'Controlled microstructure and strength from the start.',
      },
      {
        stage: '04',
        title: 'Forming',
        body: 'Forging or extrusion is performed under strict process monitoring, using hydraulic and friction press machines (up to 1,000 tons) to achieve high-density, defect-free forming.',
        guarantee: 'No porosity, no cracks, excellent toughness.',
      },
      {
        stage: '05',
        title: 'Heat Treatment',
        body: 'After forming, parts undergo normalizing, quenching, and tempering to achieve required hardness and tensile properties. Each furnace cycle is digitally recorded and traceable.',
        guarantee: 'Stable metallurgical structure and consistent mechanical performance.',
      },
      {
        stage: '06',
        title: 'Surface Treatment',
        body: 'Surfaces are treated via shot blasting, pickling, and anti-corrosion coating depending on customer requirements. For stainless steel, passivation is provided to enhance corrosion resistance.',
        guarantee: 'Improved durability and extended service life.',
      },
      {
        stage: '07',
        title: 'Bore / Lathe Machining',
        body: 'Machining is done using CNC lathes and precision boring machines to achieve thread accuracy as per ASME B1.20.1 and dimensional tolerance within ±0.1 mm.',
        guarantee: 'Perfect alignment and leak-free assembly.',
      },
      {
        stage: '08',
        title: 'Non-Destructive Examination',
        body: 'Each batch undergoes 100% visual inspection and random NDE (MT, UT, PT) per MSS-SP-97 or API 6A. Defects such as cracks, porosity, or inclusions are eliminated before shipment.',
        guarantee: 'Structural integrity verified for every fitting.',
      },
      {
        stage: '09',
        title: 'Finished Product Inspection',
        body: 'Comprehensive inspections include dimension, pressure, and surface tests using calibrated instruments. Inspection records are archived for at least 3 years.',
        guarantee: 'Every fitting is test-documented, not just visually checked.',
      },
      {
        stage: '10',
        title: 'Marking',
        body: 'Each fitting is marked by laser engraving or stamping with material grade, size, heat number, and standard (e.g. ASME B16.11).',
        guarantee: 'Full product traceability and global standard conformity.',
      },
      {
        stage: '11',
        title: 'Packing',
        body: 'All fittings are packed with anti-corrosion oil, sealed in PE bags, and reinforced in plywood cases. Export packaging meets ISPM-15 international shipping standards.',
        guarantee: 'Clean, safe, moisture-proof delivery worldwide.',
      },
      {
        stage: '12',
        title: 'Store & Transport',
        body: 'Finished goods are stored in a climate-controlled warehouse, categorized by material and size. Loading follows the FIFO principle to ensure timely shipment and traceability.',
        guarantee: 'Stable storage condition and punctual global delivery.',
      },
    ],
  },

  oem: {
    eyebrow: 'OEM process',
    headingLead: 'From design to',
    headingEmphasis: 'reliable delivery',
    body: 'From material selection and prototyping to mass production and final inspection, each project follows a standardised OEM workflow — clear communication, controlled timelines, and measurable quality at every stage.',
    items: [
      {
        step: '01',
        title: 'Send Your Drawing or Sample',
        body: 'Provide your technical drawing, 3D file, or physical sample — we start from your idea.',
        icon: 'upload',
      },
      {
        step: '02',
        title: 'Engineering Evaluation & Quotation',
        // The source sentence ends mid-clause on the supplier's live page. See
        // the copy-provenance note at the top — this ending is an assumption.
        body: 'Engineers analyse the design, confirm materials and processes, and return a costed quotation.',
        icon: 'gauge',
      },
      {
        step: '03',
        title: 'Prototype / Sample Production',
        body: 'Rapid sampling with full dimensional and performance testing before approval.',
        icon: 'wrench',
      },
      {
        step: '04',
        title: 'Mass Production',
        body: 'Once the sample is confirmed, production begins under ISO 9001 and ASME B16.11 quality control.',
        icon: 'settings',
      },
      {
        step: '05',
        title: 'Inspection & Delivery',
        body: 'Every batch is inspected and shipped with material certificates and inspection reports.',
        icon: 'truck',
      },
    ],
    /*
      The design labels this "See quality-control capabilities" and points it at
      a quality-control page. That page does not exist on this site — the same
      gap the data-centre page hit. The label is narrowed to what /services
      actually is. Restore the designed wording when the page is written.
    */
    ctaLabel: 'See our inspection and testing services',
    ctaHref: '/services',
  },

  build: {
    eyebrow: 'Start a build',
    heading: 'Send a drawing, sample or specification',
    lede: 'Custom and OEM parts are quoted against the drawing. Tell us the material, size, thread form and quantity, and we confirm the process route, inspection scope and documentation before pricing.',
    requirements: [
      {
        label: 'What we need',
        body: 'Drawing, 3D file or physical sample · material grade · quantity · thread form · applicable standard',
      },
      {
        label: 'What comes back',
        body: 'Confirmed process route, material, lead time, inspection scope and unit price',
      },
      {
        label: 'Documentation',
        body: 'Mill certificates, heat-number record, inspection report and packing list',
      },
      {
        label: 'Standards',
        body: 'ASTM · ASME B16.11 · ASME B1.20.1 · MSS-SP-97 · ISPM-15 packing',
      },
    ],
    formTitle: 'Manufacturing enquiry',
    formBody: 'Attach the drawing or sample photo and we reply within one business day.',
    spec: [
      ['Reply time', '1 business day'],
      ['Sampling', 'Before mass production'],
      ['Quoting currency', 'AED / USD'],
    ],
  },

  closing: {
    heading: 'Need a part made to drawing?',
    body: 'Send the drawing and the standard it has to meet. We confirm the process route, inspection scope and documentation before we quote.',
  },

  related: {
    label: 'AI data centre liquid cooling',
    href: '/industries/data-center-liquid-cooling',
    body: 'The stainless valves, fittings and flanges this line produces for facility water, CDU and rack-manifold interfaces.',
  },
}

/**
 * The enquiry config the server action re-resolves a posted form against.
 *
 * `Not sure — advise` is FIRST and is the default the form selects. That is
 * deliberate: most manufacturing enquiries do not know their process route,
 * and a required choice they cannot make is a lost lead. It is also a real
 * answer — the desk reads it as "we need to advise on this one".
 */
export const MANUFACTURING_ENQUIRY: DesignedEnquiry = {
  key: 'manufacturing',
  pageName: 'Manufacturing',
  path: '/manufacturing',
  choiceLabel: 'Process route',
  choices: ['Not sure — advise', 'Casting', 'Forging', 'CNC machining only', 'Full OEM programme'],
  internalNote:
    'Submitted from the manufacturing page — made-to-drawing or OEM scope, confirm the process route and inspection requirements before quoting.',
}
