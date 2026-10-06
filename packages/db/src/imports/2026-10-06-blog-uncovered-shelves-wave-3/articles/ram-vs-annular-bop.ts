import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Ram and annular BOPs and their wear parts, read from the 5 annular, 11 ram,
 * 5 ram block and 13 spare-part listings: bore, pressure, cavities, ram type,
 * elastomer and temperature. OEM designs appear as the "style" the listings
 * name. The 13-5/8" 10K nipple-up kit listed a BX-160 ring, the 13-5/8" 5K
 * ring, so it is not embedded; corrected to BX-159 by
 * 2026-10-06-listing-data-fixes.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'ram-vs-annular-bop',
  title: 'Ram and annular BOPs: what each one seals, and the spares that wear',
  excerpt:
    'A blowout preventer stack combines two kinds of preventer: the annular, which seals around almost anything in the bore, and rams, which seal one way and seal hard. How each works, the ram types, and the elastomers and bolting that need replacing.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T02:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between a ram BOP and an annular BOP?',
      answer:
        'An annular BOP closes a large ring-shaped elastomer packing element around whatever is in the bore — drill pipe, collars or tool joints — so one element covers many sizes. A ram BOP closes a pair of steel rams with elastomer packers from opposite sides: pipe rams seal around one pipe size, variable bore rams around a range, blind rams on an empty bore, and blind-shear rams cut the pipe and seal. Stacks use both, with the annular usually at the top.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Annular: one elastomer element that seals around many shapes and sizes. Rams: steel blocks that seal one way, hard.',
        'Ram types: pipe rams (one size), variable bore rams (a range — 5" to 7" on one of ours), blind rams and blind-shear rams.',
        'Our ram BOPs come in double, triple and quadruple bodies, from 7-1/16" workover stacks to 18-3/4" 15,000 psi subsea.',
        'Packing elements, ram packers and bonnet seals are the wear parts; ours are listed in HNBR for sour service.',
        'Sour-service flange bolting is hardness-controlled B7M studs with 2HM nuts, not standard B7 and 2H.',
      ],
    },
    {
      type: 'lead',
      html: 'A blowout preventer has one job — to close the well when the well will not stay closed by itself — and it does that job in two different ways. The annular preventer <strong>seals around almost anything</strong>; the ram preventers seal around a particular thing, or cut it, and hold more firmly. A stack is built from both, and the spares that keep it ready are mostly rubber.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The annular preventer.',
      anchor: 'annular',
    },
    {
      type: 'paragraph',
      html: 'An annular BOP contains a doughnut-shaped elastomer packing element reinforced with steel inserts. Hydraulic pressure drives a piston that squeezes the element inwards until it seals around whatever is in the bore — drill pipe, a tool joint, a casing string or a kelly — which is why it is usually the first preventer closed on a kick. Our annulars are listed in the GK style at 11" and 13-5/8", 5,000 and 10,000 psi, and in the GX style at 18-3/4" and 10,000 psi for subsea stacks, all for sour service.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Ram preventers and ram types.',
      anchor: 'rams',
    },
    {
      type: 'comparison_table',
      caption: 'Ram types on our listings',
      columns: ['Ram', 'What it does', 'Example we list'],
      rows: [
        { cells: ['Pipe ram', 'Seals around one pipe size', 'U style, 11" and 13-5/8" 10K, for 5" drill pipe'], highlight: true },
        { cells: ['Variable bore ram', 'Seals around a range of pipe sizes', 'U style 13-5/8" 10K, 5" to 7"; 11" 10K, 3-1/2" to 5"'] },
        { cells: ['Blind-shear ram', 'Cuts the pipe and seals the bore', 'U style 13-5/8" 10K'] },
        { cells: ['Stripper ram', 'Seals while pipe moves through, for snubbing', 'In our 7-1/16" 10K snubbing stack'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Ram BOPs close two steel ram blocks from opposite sides of the bore, each faced with an elastomer packer and top seal. They seal more firmly than an annular element, and pipe rams can hang off the drill string, but each pair seals only what it was made for. Bodies house one or more ram cavities: our listings run from double-cavity U-style preventers at 11" and 13-5/8" (5,000 and 10,000 psi), a UII-style 13-5/8" at 15,000 psi with HPHT trim to 350 °F, and T-81-style 7-1/16" workover preventers at 3,000 and 5,000 psi, to a triple-cavity 18-3/4" 15,000 psi subsea preventer and quadruple snubbing and coiled-tubing stacks.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The spares that wear.',
      anchor: 'spares',
    },
    {
      type: 'paragraph',
      html: 'The parts that are replaced are the elastomers and the joint hardware. Annular packing elements are listed in GK and spherical styles at 13-5/8", in the GK style at 11", and in the GX style at 18-3/4" for subsea, all in HNBR; ram redress kits cover one cavity, and bonnet seal kits the doors of a U-style preventer. Each nipple-up needs new ring gaskets and the right studs and nuts — for sour service, B7M studs and 2HM nuts — and a test plug lets the stack be pressure tested against the wellhead bowl. Between the stack and the wellhead sit drilling spools, double studded adapters and adapter flanges — ours are a 13-5/8" 10K drilling spool, a 13-5/8" × 11" 10K double studded adapter and an 11" × 7-1/16" 10K crossover, all for sour service. Control units have their own soft goods: our Koomey-style five-year kit covers seals, diaphragms, bladders and pilot hoses, to API 16D.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Elastomers age on the shelf.',
      body: 'Packing elements and seals have a finite storage life and harden with heat, light and ozone. Store them cool, dark and in their packaging, record the cure or manufacture date, and use stock in rotation — an element that has been in a hot container for years is not a spare.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Matching spares to the stack.',
      anchor: 'matching',
    },
    {
      type: 'paragraph',
      html: 'Every spare is specific to the preventer design, bore and pressure: a 13-5/8" 10,000 psi U-style ram block will not fit a 5,000 psi body of another design. Order by preventer style, bore, pressure, service and — for pipe rams — the pipe size, and quote the serial or assembly number where it is available. Flanged connections take BX rings at these pressures, covered in <a href="/blog/ring-joint-gaskets-r-rx-bx">R, RX and BX ring joint gaskets</a>, and the control lines in <a href="/blog/bop-control-hose-fire-resistance">BOP control hose fire resistance</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Why is the annular usually at the top of the stack?',
          answer:
            'It seals around almost anything in the bore, so it can be closed first on a kick whatever is across the stack, with the rams below for a firmer, size-specific seal.',
        },
        {
          question: 'What is a variable bore ram?',
          answer:
            'A ram that seals around a range of pipe sizes rather than one — for example 5" to 7" on our 13-5/8" 10,000 psi U-style listing.',
        },
        {
          question: 'What bolting is used on sour-service BOP flanges?',
          answer:
            'Hardness-controlled ASTM A193 B7M studs with A194 2HM nuts, as on our 13-5/8" 10,000 psi sour stud kit.',
        },
        {
          question: 'What does a BOP test plug do?',
          answer:
            'It seals in the wellhead bowl so the BOP stack can be pressure tested from above without pressuring the casing below.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Preventers',
      skus: [
        'IH-BOP-AN-13-58-10K-T20-INDUS',
        'IH-BOP-AN-11-5K-T20-INDUS',
        'IH-BOP-RAM-13-58-10K-DBL-T20-INDUS',
        'IH-BOP-RAM-11-5K-DBL-T20-INDUS',
        'IH-BOP-RAM-7-5K-DBL-T20-INDUS',
        'IH-BOP-RAM-13-58-15K-DBL-HPHT-INDUS',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Ram blocks and spares',
      skus: [
        'IH-BOP-RB-PIPE-CAM-U-13-58-10K-5DP-INDUS',
        'IH-BOP-RB-VBR-CAM-U-13-58-10K-5-7-INDUS',
        'IH-BOP-RB-BLIND-SHEAR-CAM-U-13-58-10K-INDUS',
        'IH-BOP-PE-HYDRIL-GK-13-58-10K-HNBR-INDUS',
        'IH-BOP-KIT-RAM-REDRESS-CAM-U-13-58-10K-INDUS',
        'IH-BOP-BS-CAM-U-13-58-10K-INDUS',
        'IH-BOP-STUD-B7M-13-58-10K-INDUS',
        'IH-BOP-TP-LIFT-13-58-10K-INDUS',
      ],
    },
    {
      type: 'category_link',
      slug: 'bop-annular',
      label: 'Annular BOPs',
      blurb: 'GK style 11" and 13-5/8", GX style 18-3/4" subsea.',
    },
    {
      type: 'category_link',
      slug: 'bop-ram',
      label: 'Ram BOPs',
      blurb: 'Double, triple and quadruple bodies from 5-1/8" to 18-3/4".',
    },
    {
      type: 'category_link',
      slug: 'bop-ram-blocks',
      label: 'Ram blocks and assemblies',
      blurb: 'Pipe, variable bore and blind-shear rams.',
    },
    {
      type: 'category_link',
      slug: 'bop-spare-parts',
      label: 'BOP spare parts and elastomers',
      blurb: 'Packing elements, seal kits, bolting, test plugs and control unit kits.',
    },

    {
      type: 'cta_block',
      heading: 'Redressing a BOP stack?',
      body: 'Send the preventer style, bore, pressure, service and pipe sizes, with serial numbers if you have them. We will quote elements, ram blocks, seal kits and bolting together.',
      quoteLabel: 'Quote BOP spares',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Bores, pressures, cavities, ram types, elastomers and temperatures checked against our BOP and BOP spares listings.',
    },
  ],
}

export default ARTICLE
