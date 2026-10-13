import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The letter code, decoded. Every figure is from the 25 cam and groove listings
 * and the 17 specialty adapters: types, sizes, materials, gaskets, and the one
 * pressure curve the range is rated to.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'cam-and-groove-coupling-types',
  title: 'Cam and groove coupling types: A, B, C, D, E, F, DC and DP explained',
  excerpt:
    'Eight letters cover almost every cam and groove fitting: which half has the cam arms, what is on the other end, and the pressure derate nobody prints on the box.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the cam and groove coupling types?',
      answer:
        'A cam and groove joint is two halves: a male adapter with a machined groove, and a female coupler whose two cam arms pull the adapter home against a gasket. The letter says which half it is and what is on its other end. A, E and F are male adapters with a female thread, a hose shank and a male thread. B, C and D are female couplers with a male thread, a hose shank and a female thread. DC caps an adapter and DP plugs a coupler.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Male adapters: A (female thread), E (hose shank), F (male thread). Female couplers: B (male thread), C (hose shank), D (female thread).',
        'C and E are the two types that take a hose. The tank or pump end is usually an A, B, D or F, chosen by the thread on the equipment.',
        'DC is a dust cap and DP a dust plug. Neither is rated for pressure.',
        'Our listings rate the range to 250 psi from 1/2" to 2", 150 psi at 3"–4" and 75 psi at 5"–6" — the coupling, not the hose, sets the ceiling on a large line.',
        'The range is listed to MIL A-A-59326 (US) and EN 14420-7 (Europe), the two interchange standards for cam locking couplings.',
      ],
    },
    {
      type: 'lead',
      html: 'Cam and groove — camlock, cam lock, quick-release coupling — is the connection on almost every tanker outlet, transfer pump and frac tank in the region. It connects by hand in seconds, which is why it is everywhere, and it is ordered by letter, which is why the wrong half arrives so often. The letter is a code for <strong>which half it is and what is on its other end</strong>, and once you can read it the order writes itself.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Two halves, one groove.',
      anchor: 'two-halves',
    },
    {
      type: 'paragraph',
      html: 'Every cam and groove connection is a male adapter and a female coupler. The adapter is a plain spigot with a groove machined around it. The coupler carries a gasket and two cam arms on its sides: push the adapter in, close the arms, and the cams ride into the groove and draw the halves together against the gasket. Nothing is threaded at the joint itself — the threads, shanks and flanges are on the <strong>other</strong> end of each half, and that is what the letter describes.',
    },
    {
      type: 'comparison_table',
      caption: 'The six working types',
      columns: ['Type', 'Coupling half', 'Other end'],
      rows: [
        { cells: ['A', 'Male adapter', 'Female NPT thread'] },
        { cells: ['B', 'Female coupler (cam arms)', 'Male NPT thread'] },
        { cells: ['C', 'Female coupler (cam arms)', 'Hose shank'], highlight: true },
        { cells: ['D', 'Female coupler (cam arms)', 'Female NPT thread'] },
        { cells: ['E', 'Male adapter', 'Hose shank'], highlight: true },
        { cells: ['F', 'Male adapter', 'Male NPT thread'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The way to hold it: the adapters are A, E and F, the couplers are B, C and D, and the two that take a hose are C and E. "A C on the hose and an F in the tank" is an order nobody can misread. "A two-inch camlock" is a guess waiting to happen, because it does not say which half you are holding.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Caps, plugs and the rest of the alphabet.',
      anchor: 'caps-and-plugs',
    },
    {
      type: 'paragraph',
      html: 'Two more letters close an open half. A <strong>DC</strong> is a dust cap with its own cam arms that locks over a male adapter; a <strong>DP</strong> is a dust plug — a male adapter with no bore — that locks into a female coupler. Both keep grit and rain out of a joint that is not in use, and both are listed as not designed for pressure. A line that has to be blanked under pressure wants a pressure-rated cap or a valve.',
    },
    {
      type: 'paragraph',
      html: 'Beyond the eight, the letters combine. <strong>DA</strong> joins a coupler to an adapter — in our range as 45° and 90° elbows and as a reducer. <strong>DD</strong> is coupler to coupler and <strong>SA</strong> is adapter to adapter, both used as spools. Reducing types add an R: a CR is a reducing C, an ER a reducing E, a DR a reducing D. Socket-weld halves (DW, AW) and ANSI Class 150 flanged halves (FA, FC) put a cam and groove end on fixed pipework.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Working pressure falls as the size rises.',
      anchor: 'pressure-by-size',
    },
    {
      type: 'paragraph',
      html: 'Our cam and groove listings carry one rating curve across the standard types: up to 250 psi from 1/2" to 2", 150 psi at 3" and 4", and 75 psi at 5" and 6". The reason is arithmetic — the force the cam arms must hold is the pressure times the area it acts on, and the area grows with the square of the bore. The datasheet for the specific material and size governs; sizes above 6" are rated individually.',
    },
    {
      type: 'comparison_table',
      caption: 'Rated working pressure by size, standard types (our listings)',
      columns: ['Size', 'psi', 'bar (approx.)'],
      rows: [
        { cells: ['1/2" – 2"', '250', '17'] },
        { cells: ['3" – 4"', '150', '10'] },
        { cells: ['5" – 6"', '75', '5'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The coupling can be the weakest part of the line.',
      body: 'A 20 bar oil suction and delivery hose fitted with 6" cam and groove halves is a 5 bar assembly, because the coupling is rated at 75 psi. Rate the assembly to its weakest component — hose, coupling or clamp — and mark it at that figure.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'The shank is where it lets go.',
      anchor: 'shank',
    },
    {
      type: 'paragraph',
      html: 'A C or an E with a barbed shank holds the hose only as well as whatever is clamped around it. The cams rarely release; a hose walking off a shank under pressure is far more common. Use a clamp made for the hose\'s outside diameter, or swage a ferrule over the shank — our ferrules and sleeves for KC and cam-lock shanks exist for exactly that. CrimpTEK C and E halves go one step further: the shank is machined for hydraulic crimping, there is no band at all, and our listings rate the assembly to the host hose rather than to a clamp.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Materials, gaskets and variants.',
      anchor: 'materials',
    },
    {
      type: 'paragraph',
      html: 'The standard types are listed in aluminium, brass, 316 and 304 stainless steel, plated iron, polypropylene and Nyglass composite; the self-locking types in aluminium, brass and 316 stainless. Aluminium is the light general-purpose choice, stainless the usual choice for chemicals and food, and the plastics are for corrosive liquids at lower pressure. The gasket is Buna-N as standard, with Viton (FKM), EPDM, PTFE and neoprene available — and it needs the same compatibility check as the hose liner, because a compatible hose with the wrong gasket still leaks at the coupling.',
    },
    {
      type: 'paragraph',
      html: 'Self-locking couplers have spring-loaded cam arms that lock shut, so vibration or a snagged lanyard cannot open a joint on a tanker or a pump skid. Every working type also comes as a 90° elbow, and the DA as a 45°. Lockable dust caps (DCL) add a padlock point where a product line must not be opened by the wrong person.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Two standards, one interchange.',
      body: 'Our cam and groove halves are listed to MIL A-A-59326 in the US and EN 14420-7 in Europe, which is why a coupler from one maker latches onto an adapter from another. Reducing and proprietary variants are worth checking half against half before they go into service.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is camlock the same as cam and groove?',
          answer:
            'Yes. Camlock, cam lock, cam and groove and quick-release coupling describe the same two-half connection, and the letter types are common to all of them.',
        },
        {
          question: 'Which cam and groove type goes on the hose?',
          answer:
            'C (female coupler) or E (male adapter) — the two with a hose shank. The tank or pump end is then an A, B, D or F, chosen by the thread on the equipment.',
        },
        {
          question: 'Can a dust cap blank a line under pressure?',
          answer:
            'No. Our DC and DP listings are marked not for pressure applications. Use a pressure-rated cap or close a valve.',
        },
        {
          question: 'Why does a 6" coupling carry a lower rating than a 2"?',
          answer:
            'Because the force on the cam arms is the pressure times the area, and the area rises with the square of the bore. Our listings step the rating from 250 psi at 2" to 150 psi at 3"–4" and 75 psi at 5"–6".',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'The standard types',
      skus: [
        'IH-CGC-STD-A',
        'IH-CGC-STD-B',
        'IH-CGC-STD-C',
        'IH-CGC-STD-D',
        'IH-CGC-STD-E',
        'IH-CGC-STD-F',
        'IH-CGC-STD-DC',
        'IH-CGC-STD-DP',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Self-locking, crimped and specialty halves',
      skus: ['IH-CGC-SL-C', 'IH-CGC-CT-C', 'IH-CGC-CT-E', 'IH-CGC-90-DA', 'IH-SPC-SA', 'IH-SPC-DCL'],
    },
    {
      type: 'category_link',
      slug: 'cam-and-groove-couplings',
      label: 'Cam and groove couplings',
      blurb: 'Types A to F, DC and DP, self-locking and CrimpTEK, 1/2" to 12".',
    },
    {
      type: 'category_link',
      slug: 'specialty-adapters-couplings',
      label: 'Specialty cam and groove adapters',
      blurb: 'Reducers, spools, socket-weld and ANSI 150 flanged halves.',
    },
    {
      type: 'category_link',
      slug: 'hose-clamps-sleeves-ferrules',
      label: 'Clamps, sleeves and ferrules',
      blurb: 'Ferrules and sleeves for KC and cam-lock shanks, safety and interlocking clamps.',
    },

    {
      type: 'cta_block',
      heading: 'Matching a half you already have?',
      body: 'Send a photograph of the half on the equipment and the hose bore. We will name the type, size and gasket, and quote both halves if the old one has seen better days.',
      quoteLabel: 'Quote cam and groove fittings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Types, sizes, materials, gaskets and pressure ratings checked against our cam and groove listings.',
    },
  ],
}

export default ARTICLE
