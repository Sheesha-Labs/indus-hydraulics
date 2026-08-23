/**
 * Designed industry pages — the content record behind a bespoke `/industries/{slug}`.
 *
 * WHY THIS EXISTS ALONGSIDE THE `industries` TABLE
 *
 * Six industries live in the database. Their pages are one template driven by
 * editable columns, and that is the right shape for a vertical whose page is
 * "who we are, for this sector". This file is for the other kind: a page whose
 * argument is specific enough that it needs its own sections, its own diagram
 * and its own lead form.
 *
 * The split copies `market-pages.ts` exactly — two layouts, one route. A slug
 * with a record here renders the designed page; every other slug falls through
 * to the DB-backed template. Adding one is adding a record, not writing a
 * route.
 *
 * WHY THE CARD FIELDS ARE HERE TOO. The `/industries` index and the header's
 * Industries dropdown both read the `industries` table. A designed page with no
 * row would be unreachable from either, and a row whose editable copy drives
 * the card but not the page is a form that lies about what it does. So the
 * record carries its own `card` block, the index and the nav union it in, and
 * the whole page — route, card, nav entry, sitemap URL — ships and reverts in
 * one commit.
 *
 * COPY PROVENANCE, and it matters on this page:
 *
 *   1. Technical, QC and risk-control copy carries over from the principal
 *      supplier's page for the same range (Bestflow / BAFAW), effectively as
 *      written. It describes their actual process. Do not reword it to sound
 *      better — flag it instead.
 *   2. Identity and commercial framing was rewritten, because the source
 *      describes a China-based manufacturer and Indus is a Dubai distributor.
 *      "Supplied from our principal manufacturing partner", the contact block
 *      and the quoting currency are ours. AWAITING CLIENT SIGN-OFF.
 *   3. The enquiry form has no counterpart on the source page. New copy.
 *
 * THE DISCLAIMER IN `architecture.disclaimer` IS A LIABILITY LINE, not filler.
 * Keep it, and keep it next to the diagram.
 */

/** Public Supabase bucket holding this page's photography. */
const IMG_BASE =
  'https://hesezbozronntejnsopr.supabase.co/storage/v1/object/public/industry-images/data-center-liquid-cooling'

/**
 * A photograph with its production alt text.
 *
 * `alt` is the alt attribute as it ships — it was written for the page, not
 * derived from the filename, and it never repeats the heading beside it.
 *
 * `ratio` is the box the image is rendered INTO, and it is deliberately not
 * always the ratio the design named. Three of these assets are wider or
 * narrower than the prototype's placeholder frames, and `object-cover` crops
 * the difference. Where a crop would remove something the alt text promises —
 * the machining/inspection/packing triptych is the clear case — the box was
 * changed to the asset's own ratio instead. See the note on each.
 */
export type IndustryImageRatio = '4/3' | '16/9' | '1/1' | '3/4'

/**
 * Where the subject sits when `object-cover` has to crop.
 *
 * A closed union rather than a free `object-position` string, because the
 * renderer maps it to a Tailwind class and Tailwind cannot generate a class
 * from a value it never sees in source. A new position is a two-line change in
 * both files, and the type stops the version that silently emits no CSS.
 */
export type IndustryImageFocus = 'lower'

export type IndustryImage = {
  readonly src: string
  readonly alt: string
  readonly ratio: IndustryImageRatio
  readonly focus?: IndustryImageFocus
}

const img = (
  file: string,
  alt: string,
  ratio: IndustryImageRatio,
  focus?: IndustryImageFocus
): IndustryImage => ({
  src: `${IMG_BASE}/${file}`,
  alt,
  ratio,
  ...(focus ? { focus } : {}),
})

/** One of the four buyer types the page addresses. */
export type IndustryBuyer = {
  readonly kicker: string
  readonly title: string
  readonly body: string
}

/** A place in the system where our parts land. */
export type IndustryLocation = {
  readonly number: string
  readonly title: string
  readonly body: string
  readonly image: IndustryImage
  /**
   * Product groups relevant at this connection point.
   *
   * Rendered as plain badges, NOT links. The four families below are a
   * stainless range the catalogue does not carry yet — there is no category
   * page to point at, and a badge that navigates somewhere unrelated is worse
   * than one that does not navigate at all. Wire them up when the range is
   * catalogued.
   */
  readonly relevant: readonly string[]
}

/** A product family: the page's four sellable groups. */
export type IndustryFamily = {
  readonly kicker: string
  readonly title: string
  readonly image: IndustryImage
  readonly points: readonly string[]
  readonly includes: string
}

/** A quality-control step, image-led. */
export type IndustryQcStep = {
  readonly number: string
  readonly kicker: string
  readonly title: string
  readonly body: string
  readonly image: IndustryImage
}

/** A project risk, its control, and the record that evidences the control. */
export type IndustryRisk = {
  readonly number: string
  readonly risk: string
  readonly control: string
  readonly record: string
}

/** A step in the quote sequence. */
export type IndustryStep = {
  readonly kicker: string
  readonly title: string
  readonly body: string
}

export type DesignedIndustryPage = {
  readonly slug: string
  /** Fields the `/industries` index card and the nav dropdown read. */
  readonly card: {
    readonly name: string
    readonly navName: string
    readonly tagline: string
    readonly description: string
    readonly chips: readonly string[]
  }
  readonly seo: { readonly title: string; readonly description: string }
  readonly breadcrumbLabel: string
  readonly hero: {
    readonly eyebrow: string
    readonly headingLead: string
    readonly headingEmphasis: string
    readonly lede: string
    readonly checks: readonly string[]
    readonly image: IndustryImage
    readonly stats: readonly { readonly value: string; readonly label: string }[]
  }
  readonly architecture: {
    readonly eyebrow: string
    readonly heading: string
    readonly noteLabel: string
    readonly note: string
    readonly disclaimer: string
    readonly image: IndustryImage
    readonly caption: string
  }
  readonly buyers: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly items: readonly IndustryBuyer[]
  }
  readonly locations: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly items: readonly IndustryLocation[]
  }
  readonly families: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly items: readonly IndustryFamily[]
    readonly stripLabel: string
    readonly strip: string
  }
  readonly qc: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly items: readonly IndustryQcStep[]
  }
  readonly risk: {
    readonly eyebrow: string
    readonly headingLead: string
    readonly headingEmphasis: string
    readonly body: string
    readonly items: readonly IndustryRisk[]
    readonly ctaLabel: string
    readonly ctaHref: string
    readonly image: IndustryImage
  }
  readonly review: {
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly steps: readonly IndustryStep[]
    readonly formTitle: string
    readonly formBody: string
    readonly applications: readonly string[]
    readonly spec: readonly (readonly [string, string])[]
  }
  readonly closing: {
    readonly heading: string
    readonly body: string
  }
}

const DATA_CENTRE_LIQUID_COOLING: DesignedIndustryPage = {
  slug: 'data-center-liquid-cooling',

  card: {
    name: 'AI Data Centre Liquid Cooling',
    navName: 'Data Centre Liquid Cooling',
    tagline: 'FWS · CDU · TCS',
    description:
      'Stainless steel valves, fittings, flanges and drawing-based adapters for facility water, CDU assemblies and selected technology-cooling interfaces.',
    chips: ['304 / 316L', 'Drawing-based', 'MTR on request'],
  },

  seo: {
    title: 'Data Centre Liquid Cooling Valves & Fittings',
    description:
      'Source drawing-based stainless steel valves, fittings and flanges for CDU, FWS and selected TCS applications, with traceability and inspection scope by order.',
  },

  breadcrumbLabel: 'AI Data Centre Liquid Cooling',

  hero: {
    eyebrow: 'Indus Hydraulics · data centre liquid-cooling components',
    headingLead: 'Stainless steel valves, fittings & flanges for',
    headingEmphasis: 'data centre liquid cooling',
    lede: 'Standard and drawing-based components for facility water, CDU and selected technology cooling interfaces, supplied from our principal manufacturing partner. Material, dimensions, traceability and inspection are controlled to project requirements.',
    checks: [
      '304 / 316L options by product specification',
      'Standard parts and custom components from approved drawings',
      'Material records and project-defined inspection documentation',
    ],
    // Portrait scene shot in a landscape frame. Centre-cropping cuts the bench
    // the fittings sit on, so the focal point is pushed below centre.
    image: img(
      'stainless-steel-liquid-cooling-components-manufacturing.webp',
      'Stainless steel valves, fittings and flanges in an industrial manufacturing setting',
      '4/3',
      'lower'
    ),
    stats: [
      { value: '304 / 316L', label: 'Material options' },
      { value: '4', label: 'Product families' },
      { value: 'MTR', label: 'Traceability on request' },
      { value: '{years} yrs', label: 'Specialist supply' },
    ],
  },

  architecture: {
    eyebrow: 'Supply scope',
    heading: 'What we supply, and what the diagram only locates.',
    noteLabel: 'Indus Hydraulics supply scope:',
    note: 'valves, fittings, flanges and custom connection parts. CDU, manifolds, racks and cooling equipment are shown only to indicate system location.',
    disclaimer:
      'In the illustrated liquid-to-liquid architecture, the CDU separates the facility water system from the technology cooling system. Final coolant and wetted-material compatibility must be confirmed by the system designer.',
    // 16/9 rather than the design's 16/10: this is a labelled schematic and any
    // crop takes labels off the edges.
    image: img(
      'data-center-liquid-cooling-fws-cdu-tcs-diagram.webp',
      'Data centre liquid cooling system diagram — facility water system, CDU and technology cooling system',
      '16/9'
    ),
    caption: 'Typical liquid-cooling architecture · FWS — CDU — TCS',
  },

  buyers: {
    eyebrow: 'Project fit & system locations',
    heading: 'Components for CDU, manifold and facility-water connections',
    lede: 'We supply standard and drawing-based stainless steel connection parts for CDU OEMs, row- and rack-manifold manufacturers, system integrators and EPC/MEP contractors. Material, connection and inspection requirements are confirmed against project specifications before production.',
    items: [
      {
        kicker: 'CDU MANUFACTURERS',
        title: 'CDU manufacturers',
        body: 'Valves, fittings, flanges and custom adapters for internal piping and heat-exchanger interfaces.',
      },
      {
        kicker: 'MANIFOLD BUILDERS',
        title: 'Rack manifold builders',
        body: 'Fittings, valves and adapters for branch connections, manifold ports and equipment interfaces.',
      },
      {
        kicker: 'EPC · MEP',
        title: 'EPC and MEP contractors',
        body: 'Connection parts for facility-water tie-ins, skid interfaces and field-installed piping systems.',
      },
      {
        kicker: 'INTEGRATORS',
        title: 'Liquid-cooling system integrators',
        body: 'Standard and custom components for modular assemblies and selected technology-cooling interfaces.',
      },
    ],
  },

  locations: {
    eyebrow: 'Liquid-cooling system locations',
    heading: 'Where our components fit in data centre liquid cooling',
    lede: 'Stainless steel valves, fittings, flanges and drawing-based adapters for defined connection points in facility-water piping, CDU assemblies and selected manifold and rack-side interfaces. Scope is confirmed against project drawings, fluid, pressure, temperature, material and inspection requirements.',
    items: [
      {
        number: '01',
        title: 'Facility Water Supply & Return',
        body: 'CDU inlet/outlet piping, pump-skid connections and facility-side tie-ins.',
        image: img(
          'facility-side-cooling-loops-for-data-center.webp',
          'Facility-side cooling loops for a data centre',
          '4/3'
        ),
        relevant: ['Socket-weld fittings', 'Sanitary valves', 'Flanges & adapters'],
      },
      {
        number: '02',
        title: 'CDU Internal Piping',
        body: 'Heat-exchanger, pump, filter, drain, bypass and service connections.',
        image: img(
          'data-center-modular-cooling-tube.webp',
          'Modular cooling tube assembly inside a CDU',
          '4/3'
        ),
        relevant: ['Sanitary fittings', 'Sanitary valves', 'Interface adapters'],
      },
      {
        number: '03',
        title: 'Rack Manifold Distribution',
        body: 'Manifold inlets, outlets, branch ports and isolation points.',
        image: img('data-center-manifold-tube.webp', 'Data centre rack manifold tube assembly', '4/3'),
        relevant: ['Socket-weld fittings', 'Sanitary fittings', 'Sanitary valves'],
      },
      {
        number: '04',
        title: 'Rack-Side & Cold-Plate Loop Interfaces',
        body: 'Hard-pipe transitions and defined equipment interfaces upstream of hose and quick-disconnect assemblies.',
        image: img('cold-plate-cooling-connections.webp', 'Cold-plate cooling connections', '4/3'),
        relevant: ['Sanitary fittings', 'Isolation valves', 'Adapters'],
      },
    ],
  },

  families: {
    eyebrow: 'Product families',
    heading: 'Stainless steel components for data centre liquid cooling',
    lede: 'Choose by connection method and system location. Standard and drawing-based parts are supplied to agreed material, dimensions, end connections and inspection scope.',
    items: [
      {
        kicker: 'SW · ASME B16.11',
        title: 'Socket-Weld Fittings',
        image: img(
          'stainless-steel-socket-weld-fittings.webp',
          'Stainless steel socket weld elbows, tees, couplings, unions and reducers',
          '1/1'
        ),
        points: [
          'Compact connection profile for space-limited piping layouts',
          'Welded joints reduce the number of detachable connection points',
          'Drawing-based dimensions available for equipment and manifold interfaces',
        ],
        includes: 'Elbows, tees, couplings and reducers for facility-water, CDU and manifold piping.',
      },
      {
        kicker: '316L · CLAMP END',
        title: 'Sanitary Fittings',
        image: img(
          '316l-sanitary-fittings.webp',
          '316L stainless steel sanitary elbows, tees, ferrules, clamps and reducers',
          '1/1'
        ),
        points: [
          'Smooth-bore transitions with fewer internal geometric interruptions',
          'Clamp-end configurations support faster assembly and disassembly',
          'Multiple end configurations for equipment and piping transitions',
        ],
        includes: 'Elbows, tees, reducers, ferrules and clamps for CDU and equipment connections.',
      },
      {
        kicker: 'ISOLATION · DRAIN · NRV',
        title: 'Sanitary Valves',
        image: img(
          'stainless-steel-sanitary-valves.webp',
          'Stainless steel sanitary ball valves and butterfly valves with clamp connections',
          '1/1'
        ),
        points: [
          'Compact stainless designs for space-constrained equipment piping',
          'Matching clamp or weld ends reduce unnecessary transition parts',
          'Multiple valve configurations for defined system functions',
        ],
        includes:
          'Butterfly, ball, diaphragm and check valves for isolation, drain, bypass and non-return functions.',
      },
      {
        kicker: 'WN · BLIND · CUSTOM',
        title: 'Flanges & Adapters',
        image: img(
          'stainless-steel-flanges-adapters.webp',
          'Stainless steel weld neck, blind and adapter flanges for engineered piping connections',
          '1/1'
        ),
        points: [
          'Connect dissimilar flange, weld and threaded interfaces',
          'Drawing-based machining supports accurate mating geometry',
          'Detachable interfaces simplify equipment installation and removal',
        ],
        includes: 'Flanges and custom adapters for skid, manifold, equipment and facility-piping interfaces.',
      },
    ],
    stripLabel: 'Submit drawing or BOM:',
    strip: 'we review manufacturability, material, end connections and inspection scope before quotation.',
  },

  qc: {
    eyebrow: 'Engineering & quality control',
    heading: 'Quality controlled from drawing to dispatch',
    lede: 'Each order is controlled against the approved drawing, specified material, agreed inspection scope and packing requirements.',
    items: [
      {
        number: '01',
        kicker: 'DRAWING & INTERFACE CONTROL',
        title: 'Approved Dimensions Before Production',
        body: 'Drawings or confirmed samples lock dimensions, end connections and acceptance criteria before production.',
        image: img(
          'approved-drawing-component-reference.webp',
          'Approved drawing and component reference',
          '4/3'
        ),
      },
      {
        number: '02',
        kicker: 'MATERIAL TRACEABILITY',
        title: 'Material Identity Maintained',
        body: 'Where required, the Material Test Report and heat-number marking link the supplied part to the specified stainless steel grade.',
        image: img(
          'material-traceability-heat-number-marking.webp',
          'Material traceability and heat-number marking',
          '4/3'
        ),
      },
      {
        number: '03',
        kicker: 'AGREED INSPECTION SCOPE',
        title: 'Acceptance Criteria Defined Upfront',
        body: 'Dimensions, surface condition and any specified tests are checked against agreed methods and acceptance criteria.',
        image: img(
          'stainless-component-dimensional-inspection.webp',
          'Stainless steel component inspection',
          '4/3'
        ),
      },
      {
        number: '04',
        kicker: 'CLEANING & PACKING CONTROL',
        title: 'Protected for Shipment',
        body: 'Where specified, parts are deburred, cleaned, dried, capped and separated to reduce contamination and handling damage before dispatch.',
        image: img(
          'clean-capped-stainless-parts-packing.webp',
          'Clean, capped stainless parts and packing',
          '4/3'
        ),
      },
    ],
  },

  risk: {
    eyebrow: 'Project risk control',
    headingLead: 'Control interface, material, leakage and shipping risk',
    headingEmphasis: 'before installation',
    body: 'Critical interface, material, inspection and packing requirements are confirmed before production. The agreed order documents define the checks to be performed and the records to be supplied.',
    items: [
      {
        number: '01',
        risk: 'INTERFACE MISMATCH',
        control:
          'Confirm connection type, critical dimensions, wall thickness, tolerances and installation clearance against the approved drawing or confirmed sample.',
        record: 'Approved drawing or confirmed product sample',
      },
      {
        number: '02',
        risk: 'MATERIAL UNCERTAINTY',
        control:
          'Confirm stainless steel grade, wetted materials, seal material, surface finish and service fluid before production.',
        record: 'Material certificate and heat-number record',
      },
      {
        number: '03',
        risk: 'LEAKAGE OR FUNCTIONAL NONCONFORMANCE',
        control:
          'Define dimensional checks and any specified pressure, leakage or valve-function tests, including the method and acceptance criteria, before production.',
        record: 'Inspection report and specified test report',
      },
      {
        number: '04',
        risk: 'CONTAMINATION OR SHIPPING DAMAGE',
        control:
          'Define deburring, cleaning, drying, end protection, separation and packing requirements for the application.',
        record: 'Final inspection and packing record when specified',
      },
    ],
    /*
      The design labels this button "See inspection equipment and quality-control
      capabilities" and points it at a quality-control page. That page does not
      exist on this site, and shipping the designed label over /services would
      promise the supplier's factory QC and deliver our workshop case studies.
      The label is narrowed to what the destination actually is. Restore the
      designed wording when the quality-control page is written.
    */
    ctaLabel: 'See our inspection and testing services',
    ctaHref: '/services',
    // 4/3, not the design's 3/4. The asset is a three-panel composite —
    // machining, inspection, packing — and a portrait crop keeps only the
    // middle panel, which would leave the alt text describing two things that
    // are no longer in the frame.
    image: img(
      'stainless-component-machining-inspection-packing.webp',
      'Stainless steel component manufacturing control — machining, inspection and packing',
      '4/3'
    ),
  },

  review: {
    eyebrow: 'Start your project review',
    heading: 'Send your drawing or BOM for technical review',
    lede: 'Send a drawing, BOM or specification. We review manufacturability, dimensions, connections, material, quantity, inspection and documentation requirements before quotation.',
    steps: [
      {
        kicker: '01 · SUBMIT',
        title: 'Send Your Drawing or Requirements',
        body: 'Provide the drawing, BOM or specification with quantity, material, connection and application details.',
      },
      {
        kicker: '02 · TECHNICAL REVIEW',
        title: 'Confirm the Supply Scope',
        body: 'Review dimensions, material, end connections, quantity and applicable operating requirements against the submitted information.',
      },
      {
        kicker: '03 · CONFIRM',
        title: 'Agree Inspection and Documentation',
        body: 'Define inspection items, acceptance criteria and the records required with the order.',
      },
      {
        kicker: '04 · QUOTE',
        title: 'Receive a Defined Quotation',
        body: 'The quotation states the confirmed product scope, quantity, price, lead time, inspection, documentation and packing requirements.',
      },
    ],
    formTitle: 'Project enquiry',
    formBody: 'Attach the drawing or BOM and we reply within one business day.',
    applications: [
      'CDU internal piping',
      'Rack manifold distribution',
      'Facility water supply & return',
      'Rack-side / cold-plate interfaces',
    ],
    spec: [
      ['Reply time', '1 business day'],
      ['Quoting currency', 'AED / USD'],
      ['Best fit', 'CDU OEMs · manifold builders · EPC / MEP · integrators'],
    ],
  },

  closing: {
    heading: 'Specifying a liquid-cooling build?',
    body: 'Send the interface drawing and the fluid, pressure and temperature conditions. We confirm scope, material and inspection before we quote.',
  },
}

/** Every designed industry page, in the order they should appear on the index. */
export const DESIGNED_INDUSTRY_PAGES: readonly DesignedIndustryPage[] = [DATA_CENTRE_LIQUID_COOLING]

/** The record for a slug, or `undefined` when the slug takes the DB template. */
export function designedIndustryPage(slug: string): DesignedIndustryPage | undefined {
  return DESIGNED_INDUSTRY_PAGES.find((page) => page.slug === slug)
}

/** Slugs with a designed page — for `generateStaticParams` and the sitemap. */
export function designedIndustrySlugs(): readonly string[] {
  return DESIGNED_INDUSTRY_PAGES.map((page) => page.slug)
}
