import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The metal hose pillar: construction, materials, pressure, temperature, the
 * specialty assemblies and couplings, and installation — read from the 86
 * listings on the metal hose shelves.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'metal-hose-guide',
  title: 'Metal hose: a guide to corrugated, braided, exotic-alloy and specialty hose',
  excerpt:
    'Where rubber reaches its limit, metal hose takes over: −200 to +650 °C, pressures to 414 bar, and media that attack every elastomer. How it is built, how to choose it, and how not to kill it at installation.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T13:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is metal hose and when is it used?',
      answer:
        'Metal hose is a thin metal tube formed into corrugations so it bends, usually covered by a wire braid that carries the pressure. With no elastomer in it, it handles extreme temperatures, aggressive media, fire risk and permeation that defeat rubber. Our metal hoses run from −200 to +650 °C in stainless and to +815 °C in Inconel, at pressures up to 414 bar at the smallest size, from DN6 to DN350.',
    },
    {
      type: 'key_takeaways',
      heading: 'The short version',
      items: [
        'The corrugated core bends and contains the medium; the braid stops the core stretching and carries the pressure.',
        'Braid count sets the rating: up to 13 bar unbraided, 146 bar single braid and 215 bar double braid on our S9x stainless series; 414 bar on compressed high-pressure cores.',
        'Stainless (316L, 321) covers −200 to +650 °C; Monel, Hastelloy, Inconel and bronze cover the media and temperatures stainless cannot.',
        'Specialty assemblies handle cryogenic liquids, oxygen, chlorine, molten products and hazardous areas.',
        'Metal hose dies of twist and multi-plane movement at installation more often than of anything in service.',
      ],
    },
    {
      type: 'lead',
      html: 'Rubber hose has limits that no compound fixes: it softens with heat, becomes brittle in cryogenic cold, burns, lets some gases permeate, and is attacked by some media whatever it is made of. Metal hose has none of those limits. It has its own — it must not be twisted, it fatigues if moved in the wrong way, and it costs more — but within them it is the <strong>only flexible connection</strong> for a great deal of process, energy and industrial gas duty.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'How metal hose is built.',
      anchor: 'construction',
    },
    {
      type: 'paragraph',
      html: 'The core is a thin-walled tube formed into corrugations — usually <strong>annular</strong>, each a separate ring, for pressure and vibration; sometimes <strong>helical</strong>, a continuous spiral, for extra flexibility and full drainage. Under pressure a corrugated core extends like a bellows, so it is covered by a <strong>braid</strong> of woven wire welded to the end fittings, which restrains it and carries most of the load. Add a second or third braid and the rating rises; compress the corrugations tightly and it rises again. The details are in <a href="/blog/corrugated-stainless-steel-hose">corrugated stainless steel hose</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'What each layer contributes (headline figures, smallest size)',
      columns: ['Construction', 'Example in our range', 'Up to'],
      rows: [
        { cells: ['Unbraided annular core', 'Thorburn S91, 316L', '13 bar'] },
        { cells: ['Single braid', 'Thorburn S92, 316L / 304 braid', '146 bar'] },
        { cells: ['Double braid', 'Thorburn S92Z', '215 bar'] },
        { cells: ['Compressed core, double braid', 'Thorburn S98Z', '414 bar'], highlight: true },
        { cells: ['Helical, single braid (extra flex)', 'Thorburn S65, 321', '35 bar'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Choosing the material.',
      anchor: 'materials',
    },
    {
      type: 'paragraph',
      html: 'Most metal hose is stainless: 316L for general corrosion resistance and 321 for sustained high temperature, with 304 or 316L braid, all listed from −200 to +650 °C. When the medium attacks stainless or the temperature passes its limit, the core changes alloy — Monel 400 for chlorine and hydrofluoric service, Hastelloy C276 for strong acids and hot chlorides, Inconel 625 to +815 °C, bronze for marine and non-ferrous systems. The braid needs the same thought, because it is exposed to the atmosphere; see <a href="/blog/exotic-alloy-metal-hose">exotic alloy metal hose</a>.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Pressure.',
      anchor: 'pressure',
    },
    {
      type: 'paragraph',
      html: 'Metal hose ratings are quoted at the smallest size and fall as the bore rises, so always ask for the figure at your size. A standard braided stainless hose covers most process duty; for hydraulic pressures, compressed and closed-pitch cores with double or triple braid reach 350 to 414 bar on our listings — see <a href="/blog/high-pressure-metal-hose">high-pressure metal hose</a>. At room temperature a spiral rubber hose is lighter and cheaper at the same pressure; metal earns its place where heat, fire, permeation or an all-metal requirement rule rubber out.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'PTFE: the non-metallic alternative.',
      anchor: 'ptfe',
    },
    {
      type: 'paragraph',
      html: 'Where the problem is chemistry rather than heat, a PTFE hose under a stainless braid is often the better answer: PTFE is inert to almost every medium, runs from −73 to +260 °C, and our smoothbore PTFE hose is rated to 350 bar at the smallest size. Convoluted PTFE gives a tighter bend at lower pressure. The constructions are compared in <a href="/blog/ptfe-hose-explained">PTFE hose explained</a>.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Specialty assemblies.',
      anchor: 'specialty',
    },
    {
      type: 'paragraph',
      html: 'Several duties have assemblies built around them. <strong>Cryogenic</strong> transfer hose for LIN, LOX, argon, LNG and CO₂ is covered in <a href="/blog/cryogenic-transfer-hose">cryogenic transfer hose</a>. <strong>Chlorine</strong> transfer hose for tankers and rail loading is Monel, double braided, listed to Chlorine Institute Pamphlet 6. <strong>Steam-jacketed</strong> hose keeps asphalt, pitch and molten products flowing, with an outer jacket around the product core. <strong>Electrically heated</strong> hose does the same with a heater, including an ATEX and IECEx Zone 1 rated version for hazardous areas. And <strong>pipe loops</strong> absorb thermal expansion in pipework in a U or V shape.',
    },
    {
      type: 'comparison_table',
      caption: 'Specialty metal hose in our range',
      columns: ['Assembly', 'Listing', 'Rating / temperature'],
      rows: [
        { cells: ['Chlorine transfer (tanker, rail)', 'Thorburn M96ZC Monel', '14 bar, −40 to +100 °C'] },
        { cells: ['Steam-jacketed, asphalt and pitch', 'Thorburn TSJ 2"', '25 bar, to +230 °C'] },
        { cells: ['Steam-jacketed, molten service', 'Thorburn TSJ 3"', '25 bar, to +250 °C'] },
        { cells: ['Electrically heated, hazardous area', 'Thorburn Sure-Temp 2" Ex', '25 bar, to +200 °C; ATEX, IECEx Zone 1'] },
        { cells: ['Pipe loop (U or V)', 'Thorburn Thor-Loop UL, VL', '100 bar, −200 to +650 °C'] },
        { cells: ['Industrial oxygen service', 'Thorburn CGA96', '200 bar; CGA G-4.1 cleaned'], highlight: true },
      ],
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Fire protection and guarding.',
      anchor: 'fire',
    },
    {
      type: 'paragraph',
      html: 'Metal hose survives fire far better than rubber, and some duties require proof of it: our Senior Flexonics Bartlett fire-safe assembly is API 6FA fire-test certified, rated 200 bar to +815 °C. Other hoses can be protected: silicone fire jackets and fire tape rated to +1,093 °C, smooth-flex stainless and galvanised hose, interlocked lock-section hose and ball-joint armour guards that stop a hose being crushed or abraded.',
    },

    {
      type: 'section_head',
      number: '/07',
      title: 'Couplings and end fittings.',
      anchor: 'couplings',
    },
    {
      type: 'paragraph',
      html: 'Metal hose is welded to its end fittings — flanges, threaded ends, unions, sanitary and cam lock ends — in carbon steel, stainless or a matched exotic alloy. On the coupling shelf: O-seal pipe unions (1/2" to 6"), swivel joints at 35 or 200 bar, Met-O-Seal tanker couplings, the T92H dry-break quick coupling and non-valved cryogenic couplings. A union or swivel at one end is the simplest way to install a hose without twisting it.',
    },

    {
      type: 'section_head',
      number: '/08',
      title: 'Installation: how metal hose dies.',
      anchor: 'installation',
    },
    {
      type: 'paragraph',
      html: 'Metal hose fails at installation far more often than in service. Never twist it — torsion concentrates stress in the corrugations and can halve the hose\'s life. Keep movement in one plane; a hose that moves in several planes fatigues quickly. Use the dynamic bend radius, not the static one, where the hose moves; leave a straight length at each end fitting; allow the live length the maker gives for vibration — 102 mm on our S9x series. Make up the second end with a union or a floating flange so the hose hangs straight before anything is tightened.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Support long runs, and never pull on the hose.',
      body: 'A metal hose is not a structural member. Support long runs so they do not sag, never use the hose to pull pipework into alignment, and do not let it carry the weight of valves or equipment.',
    },

    {
      type: 'section_head',
      number: '/09',
      title: 'Standards and certificates.',
      anchor: 'standards',
    },
    {
      type: 'paragraph',
      html: 'Our metal hose listings cite ISO 10380, the corrugated metal hose standard, and many list NACE MR0175 / ISO 15156 compliance for sour service and CSA B51. Industrial gas assemblies carry CGA references, the oxygen and some heated hoses UL536, and the S99Z nuclear-grade hose a CRN monogram with CSA N299.1 and N285.0. Ask for the certificate the duty requires at quotation — it can rarely be produced after the hose has shipped.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What temperature can metal hose handle?',
          answer:
            'Our stainless metal hoses are listed from −200 to +650 °C, Inconel to +815 °C. End fittings and gaskets may set a lower limit.',
        },
        {
          question: 'Why does a metal hose need a braid?',
          answer:
            'Because a corrugated core extends like a bellows under pressure. The braid restrains it and carries most of the load — on our S9x series it raises the rating from 13 bar unbraided to 146 bar with one braid and 215 bar with two.',
        },
        {
          question: 'What is the difference between annular and helical metal hose?',
          answer:
            'Annular corrugations are separate rings, best for pressure and vibration. Helical corrugations spiral along the hose, giving extra flexibility and full drainage at lower pressure.',
        },
        {
          question: 'Why did my metal hose crack after a few weeks?',
          answer:
            'Usually twist at installation, movement in more than one plane, or bending tighter than the dynamic radius. All three concentrate stress in the corrugations.',
        },
        {
          question: 'Which standard covers metal hose?',
          answer:
            'ISO 10380, which our listings cite, with NACE MR0175 / ISO 15156, CSA B51, CGA and UL536 references on the models that carry them.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Across the metal hose shelves',
      skus: [
        'IH-MH-THORBURN-S92-316L',
        'IH-MH-THORBURN-S98Z-316L',
        'IH-MH-THORBURN-I96-INCONEL',
        'IH-MH-THORBURN-M96ZC-TANKER',
        'IH-MH-THORBURN-TSJ-2IN-ASPHALT',
        'IH-MH-THORBURN-SURETEMP-EX-2IN',
        'IH-MH-SENIOR-FLEX-BARTLETT-FIRESAFE',
        'IH-MH-THORBURN-UO-SMALL',
      ],
    },
    {
      type: 'category_link',
      slug: 'metallic-hose-suppliers-uae',
      label: 'Metal hose',
      blurb: 'Stainless, exotic alloy, high-pressure, fire protection, specialty and PTFE hose.',
    },
    {
      type: 'category_link',
      slug: 'metallic-fire-protection-hoses',
      label: 'Fire protection and specialty cores',
      blurb: 'Fire jackets, fire tape, armour guards, lock-section and smooth-flex hose.',
    },
    {
      type: 'category_link',
      slug: 'metallic-hose-couplings',
      label: 'Metal hose couplings',
      blurb: 'Unions, swivel joints, tanker, dry-break and cryogenic couplings.',
    },

    {
      type: 'cta_block',
      heading: 'Specifying a metal hose assembly?',
      body: 'Send the medium, pressure, temperature, bore, length, end fittings, how the hose moves and the certificate you need. We will quote the core, braid, ends and documentation.',
      quoteLabel: 'Quote metal hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Constructions, materials, headline pressures, temperatures and certifications checked against our metal hose listings.',
    },
  ],
}

export default ARTICLE
