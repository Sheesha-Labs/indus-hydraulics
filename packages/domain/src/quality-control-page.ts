/**
 * `/quality-control` — the testing and inspection page.
 *
 * WHAT THIS PAGE IS FOR. It answers one question for an engineering or QA
 * buyer: what is actually tested, on what equipment, at which stage — and what
 * documentation reaches me? No prices, no listings. The conversion is an
 * inspection scope submitted for confirmation.
 *
 * THE CERTIFICATE GALLERY IS GONE, AND ITS ABSENCE IS A DECISION. The source
 * page closes with four scanned certificates; the client asked for that block
 * to be dropped. Section 5 (`records`) replaces it — it makes the same
 * documentation argument without publishing anyone's certificates. ISO 9001
 * still appears in the hero spec table and in stage 01, so the credential is
 * not lost. Do not reinstate the gallery.
 *
 * WHY A FLAT CONSTANT AND NOT A CMS PAGE — same reasoning as the manufacturing
 * page. The instrument names, the standards designations and the twelve checks
 * are claims about a real production line, not copy. In a constant, a change is
 * a reviewable diff.
 *
 * COPY PROVENANCE, four kinds:
 *
 *   1. The twelve inspection checks and the laboratory instrument names carry
 *      over from the supplier's page effectively as written. Safe to ship. Do
 *      not silently reword — flag instead.
 *   2. Identity framing was rewritten. The source says "BAFAW conducts
 *      comprehensive testing…" and "Each BAFAW fitting is inspected…"; Indus is
 *      a Dubai distributor, so the hero reads "Our principal manufacturing
 *      partner conducts…". AWAITING CLIENT SIGN-OFF.
 *   3. New copy needing review: the laboratory category kickers and one-line
 *      descriptions, the three stage intros, the whole records panel, the
 *      requirements grid and the enquiry form.
 *   4. TWO COMMERCIAL CLAIMS NEED CONFIRMING, not merely reviewing — they are
 *      promises about what Indus will do, not descriptions of a factory. Both
 *      are marked NEEDS CONFIRMATION at their definition below.
 *
 * SPELLING IS DELIBERATELY MIXED: new copy is British (`sulphur`, `analyse`),
 * verbatim supplier sentences keep their American forms (`analyzed`, and
 * `Sulfur` inside the instrument's name). That marks which sentences are quoted.
 */

import type { DesignedEnquiry, DesignedPageImage } from './designed-pages'

/** Public Supabase bucket holding this page's 32 photographs. */
const IMG_BASE =
  'https://hesezbozronntejnsopr.supabase.co/storage/v1/object/public/quality-control-images'

const img = (
  file: string,
  alt: string,
  ratio: DesignedPageImage['ratio']
): DesignedPageImage => ({ src: `${IMG_BASE}/${file}`, alt, ratio })

/** A key/value row in a spec table. */
export type QualitySpecRow = readonly [key: string, value: string]

/** One instrument in the testing laboratory grid. */
export type QualityInstrument = {
  readonly name: string
  readonly category: string
  readonly description: string
  readonly image: DesignedPageImage
}

/**
 * One frame in the dimensional-inspection contact sheet.
 *
 * `caption` doubles as the alt text — on this page the caption asserts what the
 * photograph shows, so the two must not be allowed to drift apart.
 */
export type QualityFrame = {
  readonly image: DesignedPageImage
  readonly caption: string
}

/** One of the four checks inside an inspection stage. */
export type QualityCheck = {
  readonly title: string
  readonly body: string
  readonly image: DesignedPageImage
}

/** One of the three inspection stages. */
export type QualityStage = {
  readonly number: string
  readonly name: string
  /** Mono tag pushed right of the stage name, e.g. `BEFORE MACHINING`. */
  readonly tag: string
  readonly intro: string
  readonly checks: readonly QualityCheck[]
}

/** A document that ships with the batch. */
export type QualityRecord = {
  readonly code: string
  readonly title: string
  readonly body: string
}

/** A cell in the "what we need / what comes back" grid. */
export type QualityRequirement = { readonly label: string; readonly body: string }

/** A cross-link to a sibling designed page. */
export type QualityRelated = { readonly label: string; readonly href: string; readonly body: string }

export type QualityControlPage = {
  readonly path: string
  readonly seo: { readonly title: string; readonly description: string }
  readonly breadcrumbLabel: string
  readonly hero: {
    readonly eyebrow: string
    readonly headingLead: string
    readonly headingEmphasis: string
    readonly lede: string
    readonly spec: readonly QualitySpecRow[]
    readonly stats: readonly { readonly value: string; readonly label: string }[]
  }
  readonly lab: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly items: readonly QualityInstrument[]
  }
  readonly dimensional: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    /** Row one — four portraits. See the layout note on `QUALITY_CONTROL_PAGE`. */
    readonly portraitRow: readonly QualityFrame[]
    /** Row two — four landscapes. */
    readonly landscapeRow: readonly QualityFrame[]
  }
  readonly stages: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly items: readonly QualityStage[]
  }
  readonly records: {
    readonly eyebrow: string
    readonly headingLead: string
    readonly headingEmphasis: string
    readonly body: string
    readonly items: readonly QualityRecord[]
    readonly ctaLabel: string
    readonly ctaHref: string
    readonly image: DesignedPageImage
  }
  readonly scope: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly requirements: readonly QualityRequirement[]
    readonly formTitle: string
    readonly formBody: string
    readonly spec: readonly QualitySpecRow[]
  }
  readonly closing: {
    readonly heading: string
    readonly body: string
    /** "Quality desk" here, where the sibling pages say "Project desk". */
    readonly deskLabel: string
  }
  readonly related: readonly QualityRelated[]
}

export const QUALITY_CONTROL_PAGE: QualityControlPage = {
  path: '/quality-control',

  seo: {
    title: 'Quality Control — Testing, Inspection & Certification',
    description:
      'Twelve inspection checkpoints across raw material, process and finished product, with material test reports, dimensional and NDT records issued with every batch.',
  },

  breadcrumbLabel: 'Quality Control',

  hero: {
    eyebrow: 'Testing and verification behind what we supply',
    headingLead: 'Precision verified,',
    headingEmphasis: 'from the inside out.',
    lede: 'Our principal manufacturing partner conducts comprehensive testing of material mechanical strength and chemical composition to ensure consistent quality under demanding operating conditions.',
    spec: [
      ['Quality system', 'ISO 9001'],
      ['Standards', 'ASME · ASTM · ISO'],
      ['Inspection stages', '3 · 12 checks'],
      ['Records retained', '3 years minimum'],
    ],
    stats: [
      { value: '12', label: 'Laboratory instruments' },
      { value: '12', label: 'Inspection checkpoints' },
      { value: '100%', label: 'Visual inspection' },
      { value: 'UT · PT · MT', label: 'NDT methods' },
    ],
  },

  lab: {
    eyebrow: 'Testing laboratory',
    heading: 'Instruments that produce the numbers on the certificate',
    lede: 'Mechanical strength, chemical composition, corrosion resistance and metallurgical structure are each measured on dedicated equipment. Where an order calls for a test report, it comes from these instruments.',
    /*
      Instrument NAMES are verbatim from the source, including the abbreviated
      "HFI Carbon Sulfur Meter" whose own image is captioned "High Frequency
      Infrared Carbon Sulfur Meter". The short form is kept as the card title
      because that is what the supplier calls it. Categories and one-line
      descriptions are new copy, written to make the grid scannable.
    */
    items: [
      {
        name: 'Universal strength machine',
        category: 'MECHANICAL',
        description: 'Tensile and yield strength to destruction',
        image: img('universal-strength-machine.webp', 'Universal tensile strength testing machine', '16/9'),
      },
      {
        name: 'Steel tube bending tester',
        category: 'MECHANICAL',
        description: 'Bend and flattening behaviour of tube and pipe',
        image: img('steel-tube-bending-tester.webp', 'Steel tube bending and flattening test rig', '16/9'),
      },
      {
        name: 'Spectrophotometer',
        category: 'CHEMICAL',
        description: 'Elemental composition against grade limits',
        image: img('spectrophotometer.webp', 'Bench spectrophotometer in the chemical laboratory', '16/9'),
      },
      {
        name: 'Salt spray tester',
        category: 'CORROSION',
        description: 'Accelerated corrosion exposure on coatings',
        image: img('salt-spray-tester.webp', 'Salt spray corrosion test cabinet', '16/9'),
      },
      {
        name: 'Microscope',
        category: 'METALLURGY',
        description: 'Grain structure, segregation and porosity',
        image: img('microscope.webp', 'Metallurgical microscope on a laboratory bench', '16/9'),
      },
      {
        name: 'HFI Carbon Sulfur Meter',
        category: 'CHEMICAL',
        description: 'Carbon and sulphur by high-frequency infrared',
        image: img('hfi-carbon-sulfur-meter.webp', 'High-frequency infrared carbon and sulphur analyser', '16/9'),
      },
      {
        name: 'Gas chromatograph',
        category: 'CHEMICAL',
        description: 'Volatile constituent separation and assay',
        image: img('gas-chromatograph.webp', 'Gas chromatograph with sample injection port', '16/9'),
      },
      {
        name: 'Ammonia nitrogen tester',
        category: 'PROCESS WATER',
        description: 'Nitrogen load in process and rinse water',
        image: img('ammonia-nitrogen-tester.webp', 'Ammonia nitrogen analyser for process water', '16/9'),
      },
      {
        name: 'Atomic spectrophotometer',
        category: 'CHEMICAL',
        description: 'Trace metal quantification by absorption',
        image: img('atomic-spectrophotometer.webp', 'Atomic absorption spectrophotometer', '16/9'),
      },
      {
        name: 'Direct reading chromatograph',
        category: 'CHEMICAL',
        description: 'Direct-read composition on the melt floor',
        image: img('direct-reading-chromatograph.webp', 'Direct reading spectrometer for melt-floor composition', '16/9'),
      },
      {
        name: 'Drying oven',
        category: 'SAMPLE PREP',
        description: 'Controlled drying ahead of weighing and assay',
        image: img('drying-oven.webp', 'Laboratory drying oven for sample preparation', '16/9'),
      },
      {
        name: 'Chemical Composition Analysis',
        category: 'CHEMICAL',
        description: 'Sample preparation and composition record',
        image: img('chemical-composition-analysis.webp', 'Technician preparing a sample for composition analysis', '16/9'),
      },
    ],
  },

  dimensional: {
    eyebrow: 'Dimensional inspection',
    heading: 'Precision measured. Perfectly matched.',
    lede: 'Each fitting is inspected for dimensional accuracy to ensure exact fit and consistent quality across every batch.',
    /*
      EVERY CAPTION HERE WAS REWRITTEN AGAINST THE ACTUAL PHOTOGRAPH.

      The handoff mapped these eight frames from hash-named source files and
      warned that the mapping was a guess — "if a photograph doesn't show what
      its slot claims, change the caption to match the photograph rather than
      forcing the shot". Six of the eight did not match: the frame captioned as
      a thread gauge is a caliper across hex flats, the one captioned as a bore
      caliper is the actual thread gauge, the "wall thickness" frame is a
      caliper on a thread major diameter, the "bench inspection station" is a
      handheld XRF analyser, the "batch layout" is a bevel protractor, and the
      "height gauge on a flange face" is a digital caliper reading a nipple
      length. On a page whose whole argument is evidentiary, a caption that
      misnames the instrument in the picture is a factual error.

      THE ROWS ALSO CHANGED. The design used three portraits plus one
      "fill" frame that stretched to match their height — apparatus that exists
      only to balance a row of mixed orientations. The eight assets are in fact
      four portraits and four landscapes, so they sort into two naturally
      uniform rows and the fill trick is unnecessary. Same visual result, no
      stretched frame, and no ragged bottom edge to guard against.
    */
    portraitRow: [
      {
        image: img('caliper-across-flats.webp', 'Vernier caliper measuring across the flats of a machined hex fitting', '3/4'),
        caption: 'Caliper across the flats of a machined fitting',
      },
      {
        image: img('thread-gauge-check.webp', 'Thread gauge entered into the threaded end of a coupling', '3/4'),
        caption: 'Thread gauge check on a machined coupling',
      },
      {
        image: img('thread-diameter-caliper.webp', 'Vernier caliper on the major diameter of an external thread', '3/4'),
        caption: 'Thread major diameter on a hex nipple',
      },
      {
        image: img('bevel-protractor-check.webp', 'Bevel protractor set against a forged fitting to read an angle', '3/4'),
        caption: 'Bevel protractor reading an angle on a forged fitting',
      },
    ],
    landscapeRow: [
      {
        image: img('end-face-square-check.webp', 'Precision square checking the end face of a nipple against the thread axis', '4/3'),
        caption: 'End face checked square to the thread axis',
      },
      {
        image: img('digital-caliper-length.webp', 'Digital caliper reading the overall length of a hex nipple', '4/3'),
        caption: 'Digital caliper on overall length',
      },
      {
        image: img('socket-end-square-check.webp', 'Two precision squares checking the socket ends of a forged fitting for square', '4/3'),
        caption: 'Socket ends checked for square',
      },
      {
        /*
          NOT a dimensional measurement — this is a handheld XRF gun doing
          positive material identification. It is captioned for what it is
          rather than being described as a gauge. Worth swapping for a genuine
          dimensional frame if the client can supply one; it sits here because
          the row needs a fourth landscape and it is at least inspection.
        */
        image: img('xrf-alloy-verification.webp', 'Handheld XRF analyser reading alloy composition on a threaded fitting', '4/3'),
        caption: 'Handheld XRF confirming alloy grade',
      },
    ],
  },

  stages: {
    eyebrow: 'Inspection stages',
    heading: 'Quality is our lifeline.',
    lede: 'From raw material inspection to final packaging, each pipe fitting undergoes a rigorous multi-stage testing process, complying with international standards such as ASME, ASTM, and ISO 9001.',
    items: [
      {
        number: '01',
        name: 'Raw Material Inspection',
        tag: 'BEFORE MACHINING',
        intro: 'Incoming steel is proven for composition, size and structure before a single cut is made.',
        checks: [
          {
            title: 'Spectral Analysis',
            body: 'Each batch of steel (A105 / A182 / A350) is tested using a spectrometer to confirm chemical composition meets ASTM and ASME requirements.',
            image: img('spectral-analysis.webp', 'Spectrum analyser confirming material composition', '4/3'),
          },
          {
            title: 'Dimensional Verification',
            body: 'Raw bars and forgings are measured using calibrated calipers and ultrasonic thickness gauges to ensure size tolerance before machining.',
            image: img('raw-dimensional-verification.webp', 'Caliper and ultrasonic gauge check on raw stock', '4/3'),
          },
          {
            title: 'Metallographic Structure',
            body: 'Samples are analyzed under a metallurgical microscope to confirm proper grain structure and absence of segregation or porosity.',
            image: img('metallographic-structure.webp', 'Metallurgical microscope reading grain structure', '4/3'),
          },
          {
            title: 'Coating & Hardness Test',
            body: 'Surface hardness and coating thickness are checked to meet corrosion-resistance and mechanical performance standards.',
            image: img('coating-hardness-test.webp', 'Thickness gauge verifying coating on a fitting', '4/3'),
          },
        ],
      },
      {
        number: '02',
        name: 'Process Inspection',
        tag: 'DURING PRODUCTION',
        intro: 'The first article proves the setup; the run is then monitored and re-verified at every shift change.',
        checks: [
          {
            title: 'First Article Inspection',
            body: 'Before mass production, a trial sample is machined and fully inspected to validate tool setup, thread profile, and dimensions.',
            image: img('first-article-inspection.webp', 'First article measured against the approved drawing', '4/3'),
          },
          {
            title: 'In-Process Dimensional',
            body: 'CNC machining dimensions (thread pitch, diameter, bevel angle) are monitored with CMM (Coordinate Measuring Machine) and thread gauges per ASME B1.20.1.',
            image: img('in-process-dimensional.webp', 'Full-dimension inspection in progress on a machined part', '4/3'),
          },
          {
            title: 'Non-Destructive Testing (NDT)',
            body: 'Forged and welded parts are tested for air holes, cracks, or inclusions using UT / PT / MT, following ASME Section V requirements.',
            image: img('non-destructive-testing.webp', 'Ultrasonic inspection for internal defects', '4/3'),
          },
          {
            title: 'Shift-End Verification',
            body: 'After each production run, critical dimensions and visual quality are rechecked to ensure consistency between shifts and batches.',
            image: img('shift-end-verification.webp', 'Shift-end recheck of critical dimensions', '4/3'),
          },
        ],
      },
      {
        number: '03',
        name: 'Finished Product Inspection',
        tag: 'BEFORE DISPATCH',
        intro: 'Surface, strength, marking and packing are signed off as one release, and the records go with the batch.',
        checks: [
          {
            title: 'Visual & Surface Inspection',
            body: 'All products are examined for surface finish, thread quality, and marking clarity (size, material grade, heat number).',
            image: img('visual-surface-inspection.webp', 'Surface finish and marking clarity check', '4/3'),
          },
          {
            title: 'Pressure & Mechanical Testing',
            body: 'Random samples undergo hydrostatic, tensile, and impact tests to verify mechanical strength and pressure resistance per ASME B16.11 / B16.9.',
            // The frame shows the pendulum impact tester itself, with no part
            // in shot — the alt says so rather than claiming a sampled fitting.
            image: img('pressure-mechanical-testing.webp', 'Pendulum impact tester in the mechanical testing laboratory', '4/3'),
          },
          {
            title: 'Identification Review',
            body: 'Each batch is checked for correct markings — heat number, standard, and class rating — to ensure full material traceability.',
            image: img('identification-review.webp', 'Marking and label verification against the batch record', '4/3'),
          },
          {
            title: 'Packaging & Shipping',
            body: 'Products are securely packed in fumigation-free pallets and cartons, with additional rust protection for overseas shipping.',
            image: img('packaging-shipping.webp', 'Pallet and carton check with shipping marks', '4/3'),
          },
        ],
      },
    ],
  },

  records: {
    eyebrow: 'What travels with the batch',
    headingLead: 'An inspection is only useful if the',
    headingEmphasis: 'record reaches you',
    /*
      NEEDS CONFIRMATION, not merely review. The three-year retention comes from
      the supplier's page; the REISSUE promise is new copy and commits Indus to
      a service. Confirm the desk can actually honour it before this ships.
    */
    body: 'Define the documentation with the order and it ships with the goods. Records are archived for at least three years, so a certificate can be reissued against a heat number years after delivery.',
    items: [
      {
        code: 'MTR',
        title: 'Material Test Report',
        body: 'Chemical composition and mechanical properties against the specified grade, tied to the heat number.',
      },
      {
        code: 'DIM',
        title: 'Dimensional report',
        body: 'Measured dimensions against the drawing, with the instruments used and their calibration status.',
      },
      {
        code: 'NDT',
        title: 'NDT report',
        body: 'UT / PT / MT results per ASME Section V, with the method and acceptance criteria stated.',
      },
      {
        code: 'PKG',
        title: 'Packing list & marking record',
        body: 'Batch marking, class rating and packing configuration as shipped.',
      },
    ],
    ctaLabel: 'See manufacturing capability',
    ctaHref: '/manufacturing',
    /*
      The page's one intentional image reuse — it is also laboratory card 12.
      Rendered 4/3, not the designed 3/4: the asset is a 4/3 landscape and a
      portrait crop would take nearly half its width. Swap in a dedicated
      records or archive photograph if the client supplies one.
    */
    image: img(
      'chemical-composition-analysis.webp',
      'Technician preparing a sample for composition analysis',
      '4/3'
    ),
  },

  scope: {
    eyebrow: 'Define your inspection scope',
    heading: 'Tell us what has to be proven',
    lede: 'Inspection and documentation are agreed before production, not after. Send the specification or the standard you work to and we confirm the checks, the methods and the acceptance criteria that will apply to your order.',
    requirements: [
      {
        label: 'What we need',
        body: 'Standard or specification · material grade · critical dimensions · required test reports · witness or third-party requirement',
      },
      {
        label: 'What comes back',
        body: 'Confirmed inspection scope, methods, acceptance criteria and the documents issued with the batch',
      },
      {
        /*
          NEEDS CONFIRMATION. This names SGS, BV and TÜV and commits to
          arranging and scheduling third-party inspection. It is a commercial
          undertaking, not a description of the factory, and it is entirely new
          copy. Confirm before publishing.
        */
        label: 'Third-party inspection',
        body: 'TPI by SGS, BV, TÜV or your nominated agency can be arranged and scheduled against the production date',
      },
      {
        label: 'Standards',
        body: 'ASME B16.11 · B16.9 · B1.20.1 · ASME Section V · ASTM A105 / A182 / A350 · ISO 9001',
      },
    ],
    formTitle: 'Inspection enquiry',
    formBody: 'Attach the specification or standard and we reply within one business day.',
    spec: [
      ['Reply time', '1 business day'],
      ['Records retained', '3 years minimum'],
      ['Quoting currency', 'AED / USD'],
    ],
  },

  closing: {
    heading: 'Need certified material?',
    body: 'Send the standard and the documents your project requires. We confirm the inspection scope and what ships with the batch before we quote.',
    // "Quality desk" rather than the sibling pages' "Project desk". Kept
    // distinct in case these enquiries route to a QA contact; unify if they do
    // not.
    deskLabel: 'Quality desk',
  },

  related: [
    {
      label: 'Manufacturing capability',
      href: '/manufacturing',
      body: 'Casting, forging and CNC under one process chain — the twelve controlled stages these checks sit inside.',
    },
    {
      label: 'AI data centre liquid cooling',
      href: '/industries/data-center-liquid-cooling',
      body: 'Stainless valves, fittings and flanges for facility water, CDU and rack-manifold interfaces.',
    },
  ],
}

/**
 * The enquiry config the server action re-resolves a posted form against.
 *
 * `Not sure — advise` is first and is the default, the same pattern as the
 * manufacturing page's process route: most enquirers do not know which reports
 * their specification demands, and forcing a choice loses the lead.
 */
export const QUALITY_CONTROL_ENQUIRY: DesignedEnquiry = {
  key: 'quality-control',
  pageName: 'Quality Control',
  path: '/quality-control',
  choiceLabel: 'Documents required',
  choices: [
    'Not sure — advise',
    'Material Test Report (MTR)',
    'Dimensional report',
    'NDT report',
    'Full document pack',
    'Third-party inspection (TPI)',
  ],
  internalNote:
    'Submitted from the quality-control page — inspection scope enquiry, confirm the standard, acceptance criteria and document set before quoting.',
}
