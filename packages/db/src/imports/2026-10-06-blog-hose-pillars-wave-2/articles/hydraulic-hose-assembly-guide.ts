import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The hose assembly pillar: specify, cut, clean, skive, crimp, measure, test,
 * cap and tag. No crimp diameters — those belong to the specific hose,
 * fitting and die, and publishing a generic table is how assemblies end up
 * wrong. Fitting-to-hose compatibility is from the crimp fitting listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-assembly-guide',
  title: 'Hydraulic hose assembly: specifying, cutting, crimping, testing and tagging',
  excerpt:
    'A hose assembly is a manufactured part, not a length of hose with ends on. The steps that make one right — from the specification to the crimp diameter, the proof test and the tag — and the mistakes that make one wrong.',
  categorySlug: 'hose-assembly',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T14:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How is a hydraulic hose assembly made?',
      answer:
        'Specify it completely — hose grade and bore, both fittings, overall length and the angle between elbows. Cut the hose square, clean it, skive the cover if the fitting requires it, insert the fitting to depth, and crimp with the die specified for that hose and fitting to a published diameter. Measure the crimp, flush the assembly, proof test it, cap both ends and tag it with the parts and the test date.',
    },
    {
      type: 'key_takeaways',
      heading: 'The short version',
      items: [
        'An assembly is fully specified by hose grade, bore, both fittings, overall length and, for two elbows, the angle between them.',
        'Hose, fitting, ferrule and die are a matched set: the crimp diameter belongs to that combination, not to the hose size.',
        'Skive only where the fitting is designed for it; most current two-wire hose takes no-skive ends, most spiral hose still needs skiving.',
        'Measure every crimp; a proof test confirms the assembly holds now, not that the crimp is right.',
        'Cap the ends and tag the assembly; an untagged assembly cannot be re-ordered or audited.',
      ],
    },
    {
      type: 'lead',
      html: 'A hose assembly looks like a length of hose with a fitting on each end, and that is exactly how it gets underspecified. It is a <strong>manufactured part</strong>, built to a specification that ties a particular hose to particular fittings with a particular crimp, and its rating is only as good as the weakest decision in that chain. This guide walks the chain in order and links to the detail on each step.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Specify it completely.',
      anchor: 'specify',
    },
    {
      type: 'paragraph',
      html: 'Five items fully describe an assembly: the hose grade and bore, the fitting at each end (family, size, gender, shape), the overall length, and — where both ends are elbows — the orientation angle between them, viewed down the hose. Overall length is measured sealing face to sealing face, which on many fittings is not the visible end. The old assembly, or a photograph of its layline and both ends, supplies most of this. See <a href="/blog/getting-a-hydraulic-hose-made">getting a hydraulic hose made</a>, <a href="/blog/how-to-measure-a-hydraulic-hose">measuring a hose</a> and <a href="/blog/what-to-send-for-a-hose-quote">what to send for a hose quote</a>.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Overall length is not cut length.',
      body: 'Cut length is shorter than overall length by however far each fitting extends beyond the hose, and that differs by fitting type and size. Give us the overall length and the ends; the cut length is the workshop\'s arithmetic.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Match the hose, fitting and ferrule.',
      anchor: 'match',
    },
    {
      type: 'paragraph',
      html: 'The fitting series must be made for the hose construction. Our braided-hose crimp fittings are listed for EN 853 1SN and 2SN and SAE 100R1AT, 100R2AT, 100R16 and 100R17; our spiral-hose crimp fittings for EN 856 4SP and SAE 100R12. 4SH, R13 and R15 take their own ferrules — our crimp ferrule shelf lists skive interlock ferrules for 4SH and a double-skive ferrule for R13. Mixing a ferrule from one source with a hose from another leaves no published crimp specification to work to. See <a href="/blog/braided-vs-spiral-hose-fittings">braided against spiral hose fittings</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'Hose to fitting series (our listings)',
      columns: ['Hose', 'Fitting series', 'Ferrule'],
      rows: [
        { cells: ['1SN, 2SN, R1AT, R2AT, R16, R17', 'Braided-hose crimp fittings', 'No-skive, e.g. for R2AT / 2SN'], highlight: true },
        { cells: ['4SP, R12', 'Spiral-hose crimp fittings', 'Skive, for 4SP and R12'] },
        { cells: ['4SH', 'Per the 4SH specification', 'Skive interlock for 4SH'] },
        { cells: ['R13', 'Per the R13 specification', 'Double-skive for R13'] },
        { cells: ['R7, R8 thermoplastic', 'Per the thermoplastic specification', 'No-skive for R7 / R8'] },
        { cells: ['R14 PTFE', 'PTFE fittings', 'Specialty ferrule for PTFE'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Cut, clean and skive.',
      anchor: 'cut',
    },
    {
      type: 'paragraph',
      html: 'Cut the hose square with a proper hose saw so the wire does not splay, then blow out the debris — a new hose cut on a dirty bench is a common route for contamination into a clean circuit. Skive only where the fitting is designed for it: a skive fitting removes the cover, and sometimes the inner tube, so the ferrule grips the wire directly; crimping a skive fitting over an intact cover leaves the wire held through rubber that relaxes. Most current two-wire hose takes no-skive ends; spiral hose generally still needs skiving. See <a href="/blog/skiving-and-fitting-selection">skiving explained</a>.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Crimp to a diameter.',
      anchor: 'crimp',
    },
    {
      type: 'paragraph',
      html: 'Insert the fitting to its full depth — marking the hose first makes a short insertion visible — and crimp with the die set the maker specifies for that hose and fitting. The target is a finished outside diameter over the ferrule, published by the fitting maker for that exact combination, with a tolerance in tenths of a millimetre. Measure it with callipers after every crimp. Too loose and the hose walks out under pressure; too tight and the crimp cuts the reinforcement it was meant to grip. See <a href="/blog/hydraulic-hose-crimp-faults">crimp faults</a> and <a href="/blog/hose-burst-at-the-fitting">bursts at the fitting</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Why we do not publish a crimp table.',
      body: 'A crimp diameter belongs to one hose, one fitting and one die. A generic table by hose size is the most-searched and least reliable thing in this trade, and on somebody\'s machine it would be wrong. Work to the specification for the parts in your hand.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Clean, test, cap and tag.',
      anchor: 'finish',
    },
    {
      type: 'paragraph',
      html: 'Flush or blow the assembly clean, then proof test it: a hydrostatic test to a defined pressure above working, held and inspected for leakage, fitting movement and permanent change. A proof test confirms the assembly holds now; it does not confirm the crimp is in specification, which is why the diameter is measured as well. Cap both ends before the assembly leaves the bench, and tag it with the hose, fittings and test date — the tag is what makes a hose register possible and an audit answerable. See <a href="/blog/hose-assembly-test-certificate">what a test certificate proves</a> and <a href="/blog/bulk-hose-refit-and-tagging">bulk refit and tagging</a>.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Installing it.',
      anchor: 'install',
    },
    {
      type: 'paragraph',
      html: 'A correctly built assembly can still be killed in four seconds at the machine. Do not twist it — the layline must run straight. Do not start a bend at the ferrule; leave a straight length out of the fitting. Respect the bend radius, clamp to guide rather than pin, and measure articulating runs at both extremes of travel. Make up the joints by the method for each family. See <a href="/blog/hose-routing-bend-radius-twist">routing, bend radius and twist</a>, <a href="/blog/hydraulic-hose-installed-with-a-twist">installed with a twist</a> and <a href="/blog/hydraulic-fitting-make-up-torque">make-up torque and turns</a>.',
    },

    {
      type: 'section_head',
      number: '/07',
      title: 'Build it yourself, or have it built.',
      anchor: 'make-or-buy',
    },
    {
      type: 'paragraph',
      html: 'Plenty of operations should own a crimper; the arithmetic is about the whole system — dies, ferrule stock, calibration, records and someone trained — not the machine price. Many land in the middle: bulk hose and fittings held on site for everyday circuits, and finished, tested assemblies for anything with a consequence beyond downtime. See <a href="/blog/should-you-buy-a-hose-crimper">should you buy a crimper</a>, <a href="/blog/bulk-hose-or-finished-assemblies">bulk hose or finished assemblies</a> and <a href="/blog/on-site-hydraulic-hose-service-uae">on-site hose service</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What information do I need to order a hose assembly?',
          answer:
            'Hose grade and bore, the fitting at each end, the overall length sealing face to sealing face, and the angle between two elbow ends. A photograph of the old hose\'s layline and both ends covers most of it.',
        },
        {
          question: 'Can any fitting be crimped onto any hose?',
          answer:
            'No. The fitting series must be made for the hose. Our braided-hose fittings are listed for 1SN, 2SN, R1AT, R2AT, R16 and R17; our spiral-hose fittings for 4SP and R12.',
        },
        {
          question: 'Does a proof test prove the crimp is correct?',
          answer:
            'No. It proves the assembly holds pressure now. A marginal crimp can pass a static test and fail after a few thousand pressure cycles, so the crimp diameter is measured as well.',
        },
        {
          question: 'Do I need to skive the hose?',
          answer:
            'Only if the fitting is a skive design. Most current two-wire hose takes no-skive fittings; most spiral hose still needs skiving.',
        },
        {
          question: 'Why do assemblies need caps and tags?',
          answer:
            'Caps keep contamination out between the bench and the machine. Tags record the hose, fittings and test date, so the assembly can be re-ordered and audited.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Hose, fittings and ferrules that go together',
      skus: ['IH-HOSE-R2-2SN', 'IH-CF43-JICF', 'IH-CF-NS-R2T2SN', 'IH-HOSE-4SP', 'IH-CF71-JICF', 'IH-CF-SK-4SP', 'IH-CF-SK-4SH-IL', 'IH-CF-DS-R13'],
    },
    {
      type: 'category_link',
      slug: 'crimp-ferrules',
      label: 'Crimp ferrules',
      blurb: 'No-skive, skive, interlock and PTFE ferrules by hose.',
    },
    {
      type: 'category_link',
      slug: 'braided-hose-crimp-fittings',
      label: 'Braided hose crimp fittings',
      blurb: 'For 1SN, 2SN, R1AT, R2AT, R16 and R17 hose.',
    },
    {
      type: 'category_link',
      slug: 'spiral-hose-crimp-fittings',
      label: 'Spiral hose crimp fittings',
      blurb: 'For 4SP and R12 hose.',
    },

    {
      type: 'cta_block',
      heading: 'Need assemblies built and tagged?',
      body: 'Send the hose, the ends, the lengths and the orientation — or the old assemblies. We will build, crimp-measure, proof test, cap and tag them.',
      quoteLabel: 'Quote hose assemblies',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Hose-to-fitting compatibility and ferrule types checked against our crimp fitting and ferrule listings.',
    },
  ],
}

export default ARTICLE
