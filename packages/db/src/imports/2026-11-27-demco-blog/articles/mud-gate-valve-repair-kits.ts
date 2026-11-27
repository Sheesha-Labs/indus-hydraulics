import type { BlogArticleSeed } from '../shared'

/**
 * Mud gate valve repair kits (refresh). Sources: DEMCO gate valve catalogue parts-list pages with the
 * repair-kit legend (major = square mark, minor = round mark): pp.7, 9, 11, 13 (DM 7500 kits
 * J025177-00X74 / -10X74, 3 in major printed J025177-11374), pp.15, 17, 19, 21 (DM 5000 kits J025216-0X221 /
 * -1X221), pp.31, 33, 35, 37 (DMA 7500 major kits J025177-10X79) and pp.39, 41, 43 (DMA 5000 major kits
 * J025216-14229 / -15229; the 2 in and 4 in pages both print 14229). Kit contents are read from the
 * marks beside each part, the mark sitting before the row it belongs to.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'mud-gate-valve-repair-kits',
  title: 'Mud gate valve repair kits: DEMCO DM 5000, DM 7500 and DMA minor and major kits by size',
  excerpt:
    'DEMCO DM gate valve repair kits come in two grades. A minor kit renews the gate, seat and the seals that wear first. A major kit adds the stem, stem seal and the remaining seals. The part numbers depend on the family (DM 7500, DM 5000 or DMA) and on the seat port size.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Mud Gate Valve Repair Kits: DEMCO DM and DMA by Size',
  seoDescription:
    'DEMCO mud gate valve repair kits: DM 7500, DM 5000 and DMA minor and major kit numbers by size, what each covers, the trims they fit.',
  focusKeyword: 'mud gate valve repair kits',
  publishedAt: '2026-11-27T16:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Which repair kit fits a DEMCO DM gate valve?',
      answer:
        'It depends on the family and the seat port. DM 7500 kits are J025177-00X74 (minor) and -10X74 (major); DM 5000 kits are J025216-0X221 (minor) and -1X221 (major); DMA automated valves take major kits J025177-10X79 or J025216-14229 and -15229. The DM 7500 and DM 5000 kits are not interchangeable.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Every kit is listed for one trim. DM 7500 kits are for J0XXXXX-XX72140 (410 stainless stem, 41XX gate with QPQ nitriding, HNBR seat and seals). DM 5000 kits are for J0XXXXX-XX82110 (316 stainless stem, 41XX gate with ENP, 1045 Buna-N seat and seals).',
        'A minor kit covers the parts marked with a round dot in the parts list: the gate, seat assembly, and the seals that wear first. A major kit, marked with a square, covers those and the stem, stem screw, stem seal assembly and remaining seals.',
        'The DM 7500 and DM 5000 use different seat designs and different kit series (J025177 and J025216). Their parts never interchange, and neither does either kit with the DMA kits.',
        'The 3 in DM 7500 major kit is printed J025177-11374 where the other sizes follow the 10X74 pattern, and the 2 in and 4 in DMA 5000 pages print the same major kit number. Confirm those two against the valve.',
        'The catalogue lists a major kit as one each for one year of service. For other trims, it says to consult the maker.',
      ],
    },
    {
      type: 'lead',
      html: 'A mud gate valve that weeps at the seat or leaks past the stem rarely needs replacing. It needs a kit, and the DM design was made for that: the bonnet comes off while the valve stays in the line, and the parts that wear are in a few boxed sets. The difficulty is knowing which set. This article lists every DM and DMA kit number in the catalogue by size, what each grade covers, and the trims they fit. To identify your valve first, read <a href="/blog/demco-dm-gate-valve-part-numbers">the DM assembly number guide</a>.',
    },

    { type: 'section_head', number: '/01', title: 'What minor and major kits cover.', anchor: 'coverage' },
    {
      type: 'paragraph',
      html: 'Each DM parts list in the catalogue has a repair-kit column. A round mark means the part is in the minor kit, and a square mark means it is in the major kit. Parts with both marks are in both. The legend on each page names the kit numbers and says the major kit is one each for one year of service.',
    },
    {
      type: 'paragraph',
      html: '<strong>DM 7500 minor kit.</strong> The gate and gate clip, the seat assembly, the two wear rings, the wear-ring seal O-rings (sizes 2 to 4 in) and the bonnet seal O-ring. <strong>DM 7500 major kit.</strong> Everything in the minor kit, plus the secondary seal O-ring, the housing seal O-ring (a rod wiper on the 5-1/8 in), the stem, the stem screw, the stem seal assembly with bushing, and on the 3 in and larger the thrust needle roller bearings and thrust washers. On the 5-1/8 in the wear-ring seal O-ring is major only.',
    },
    {
      type: 'paragraph',
      html: '<strong>DM 5000 minor kit.</strong> The gate, the seat assembly and the bonnet seal O-ring. <strong>DM 5000 major kit.</strong> Those, plus the secondary seal O-ring, the housing seal O-ring, the stem, the stem screw and the stem seal assembly with bushing. On the 4 in and 5-1/8 in the major kit also carries thrust washers, and on the 5-1/8 in a thrust needle roller bearing.',
    },
    {
      type: 'paragraph',
      html: 'In practice the minor kit is what you fit when the seat leaks and the gate is scored, and the major kit is what you fit at the end of a service interval or when the stem seal leaks. If the gate or seat shows damage beyond wear, send us the photographs and the part numbers and we will check them against the parts list.',
    },

    { type: 'section_head', number: '/02', title: 'Kit numbers by size.', anchor: 'table' },
    {
      type: 'comparison_table',
      caption: 'DEMCO DM and DMA repair kits by seat port, as printed in the catalogue',
      columns: ['Seat port', 'DM 7500 minor', 'DM 7500 major', 'DM 5000 minor', 'DM 5000 major', 'DMA 7500 major', 'DMA 5000 major'],
      rows: [
        { cells: ['2 in', 'J025177-00274', 'J025177-10274', 'J025216-01221', 'J025216-11221', 'J025177-10279', 'J025216-14229'] },
        { cells: ['3 in', 'J025177-00374', 'J025177-11374 (as printed)', 'J025216-02221', 'J025216-12221', 'J025177-10379', 'No DMA 5000 in this size'] },
        { cells: ['4 in', 'J025177-00474', 'J025177-10474', 'J025216-04221', 'J025216-14221', 'J025177-10479', 'J025216-14229'] },
        { cells: ['5-1/8 in', 'J025177-00574', 'J025177-10574', 'J025216-05221', 'J025216-15221', 'J025177-10579', 'J025216-15229'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two printed numbers need care. The 3 in DM 7500 major kit is J025177-11374, where the other sizes follow the pattern J025177-10X74, and the 2 in and 4 in DMA 5000 pages both print J025216-14229. We list them as printed; confirm both against the valve and the maker before relying on them. The kit listings we carry are the <a href="/p/demco-dm-7500-gate-valve-repair-kit-2-inch">2 in DM 7500 kit</a>, the <a href="/p/demco-dm-7500-gate-valve-repair-kit-3-inch">3 in DM 7500 kit</a>, the <a href="/p/demco-dm-gate-valve-repair-kit-4-inch">4 in DM kit (5,000 and 7,500 psi)</a>, the <a href="/p/demco-dm-7500-gate-valve-repair-kit-5-1-8-inch">5-1/8 in DM 7500 kit</a>, the <a href="/p/demco-dm-5000-gate-valve-repair-kit-2-inch">2 in</a>, <a href="/p/demco-dm-5000-gate-valve-repair-kit-3-inch">3 in</a> and <a href="/p/demco-dm-5000-gate-valve-repair-kit-5-1-8-inch">5-1/8 in</a> DM 5000 kits, and <a href="/p/demco-dma-automated-gate-valve-repair-kits-parts">the DMA kits and parts</a>.',
    },

    { type: 'section_head', number: '/03', title: 'DMA automated valves.', anchor: 'dma' },
    {
      type: 'paragraph',
      html: 'The DMA series is the DM gate valve with a hydraulic Ledeen actuator, and the catalogue lists a major kit only. The DMA 7500 kits (J025177-10279, -10379, -10479 and -10579) cover the bushing, the gate and gate clip, the rod wiper O-ring, the wear-ring seal O-ring, the bonnet seal O-ring, the seat assembly, the stem seal assembly and the wear rings. The DMA 5000 kits cover the bushing, the gate, the rod wiper O-ring, the bonnet seal O-ring, the seat assembly and the stem seal assembly. The DMA gate is 17-4 PH stainless steel with QPQ nitriding, a different part from the manual valve’s gate, which is one more reason a DM kit does not fit a DMA.',
    },

    { type: 'section_head', number: '/04', title: 'The trims the kits are listed for.', anchor: 'trims' },
    {
      type: 'comparison_table',
      caption: 'Kit trim strings. XX is the end connection and body digits, which a kit does not depend on',
      columns: ['Family', 'Trim string', 'What it means'],
      rows: [
        { cells: ['DM 7500', 'J0XXXXX-XX72140', '410 SS stem, 41XX gate with QPQ nitriding, 410 SS seat ring, HNBR seat and seals, no inlay'] },
        { cells: ['DM 5000', 'J0XXXXX-XX82110', '316 SS stem (17-4PH on the 5-1/8 in), 41XX gate with ENP, 1045 seat insert, Buna-N seat and seals, no inlay'] },
        { cells: ['DMA 7500', 'J0XXXXX-XX891401', '17-4 PH SS stem, 17-4 PH gate with QPQ nitriding, HNBR seat and seals, with hydraulic actuator'] },
        { cells: ['DMA 5000', 'J0XXXXX-XX991101', '17-4 PH SS with QPQ nitriding, 1045 insert, Buna-N seat and bonnet seal, HNBR stem seal'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'If your valve’s trim digits differ, for example an FKM seat (code 2 on the 7,500 psi valve) or a different gate material, the standard kit is not listed for it. The catalogue is direct: consult the maker for other repair kit trim options. Send us the full assembly number from the nameplate and we will check which seat and seal part numbers apply.',
    },

    { type: 'section_head', number: '/05', title: 'Why the families never interchange.', anchor: 'interchange' },
    {
      type: 'paragraph',
      html: 'The DM 7500 seat is two metal wear rings encapsulated in elastomer; the DM 5000 seat is a one-piece assembly expanded by a spread ring. The parts that make up a kit differ accordingly: a 2 in DM 7500 seat assembly is 2139742-01 (HNBR), a 2 in DM 5000 seat assembly is J001876-011 (1045 and Buna-N), and the DMA gates and stem seals have their own X-series numbers. Kits are in separate series (J025177 and J025216), and the same size in different families has different lengths and weights. Do not mix parts across families, and do not assume that a gate or seat from a Model 72 or another gate valve will fit; the <a href="/blog/model-72-vs-dm-gate-valve">Model 72 comparison</a> shows where the designs differ, and the <a href="/blog/demco-dm-5000-vs-dm-7500-gate-valve">DM 5000 and DM 7500 article</a> lists both seat designs.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Fit the kit to the valve, not the size.',
      body: 'A 4 in DM 7500 and a 4 in DM 5000 are both “4 in gate valves”. They take different seats, wear rings, gates and kits. Read the family and the trim off the nameplate before ordering any part.',
    },

    { type: 'section_head', number: '/06', title: 'Beyond the kit.', anchor: 'parts' },
    {
      type: 'paragraph',
      html: 'Not every wearing part is in a kit. Gates, seat assemblies, stems, wear rings and O-rings are also listed individually, so a valve that needs only a gate or one set of seals does not need a full kit. Our <a href="/c/gate-valve-repair-kits">gate valve repair kits</a> shelf lists the kits and the individual parts; the <a href="/c/mud-manifold-fittings">mud manifold fittings</a> shelf covers the manifold side. Indus Hydraulics quotes from Dubai, UAE: send the nameplate number, the seat port and the part you need.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is the difference between a minor and a major kit?',
          answer:
            'A minor kit covers the gate, seat assembly and the seals that wear first. A major kit covers those and the stem, stem screw, stem seal assembly and the remaining O-rings, with thrust bearings and washers on the larger sizes. The DM parts lists mark each part with a round or square symbol.',
        },
        {
          question: 'What are the DM 7500 repair kit part numbers?',
          answer:
            'Minor kits are J025177-00274 (2 in), -00374 (3 in), -00474 (4 in) and -00574 (5-1/8 in). Major kits are J025177-10274, -11374 (as printed for the 3 in), -10474 and -10574.',
        },
        {
          question: 'What are the DM 5000 repair kit part numbers?',
          answer:
            'Minor kits are J025216-01221, -02221, -04221 and -05221 for the 2, 3, 4 and 5-1/8 in. Major kits are J025216-11221, -12221, -14221 and -15221.',
        },
        {
          question: 'Does the DMA use the same kits?',
          answer:
            'No. The DMA 7500 uses major kits J025177-10279, -10379, -10479 and -10579, and the DMA 5000 uses J025216-14229 and -15229. Only major kits are listed for DMA valves.',
        },
        {
          question: 'Can I use a DM 5000 kit on a DM 7500?',
          answer:
            'No. The seat designs, seat assemblies, wear rings and kit series are different, so the parts do not interchange between the two families.',
        },
        {
          question: 'What if my valve has an FKM seat?',
          answer:
            'The standard kits are listed for HNBR (DM 7500) and Buna-N (DM 5000) trims. Other elastomers are available on the seat assembly, and the catalogue says to consult the maker for other kit trims, so send the assembly number.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'DEMCO DM and DMA repair kits',
      skus: ['IH-GVRK-DM7K5-KIT-2', 'IH-GVRK-DM-KIT-4', 'IH-GVRK-DM5K-KIT-3', 'IH-GVRK-DMA-KITS'],
    },
    {
      type: 'category_link',
      slug: 'gate-valve-repair-kits',
      label: 'Gate valve repair kits',
      blurb: 'DEMCO DM 5000, DM 7500 and DMA kits, with gates, seats, stems, wear rings and O-rings.',
    },
    {
      type: 'related_articles',
      slugs: ['demco-dm-gate-valve-part-numbers', 'demco-dm-5000-vs-dm-7500-gate-valve', 'rebuilding-a-model-72-gate-valve', 'model-72-vs-dm-gate-valve'],
    },
    {
      type: 'cta_block',
      heading: 'Need a kit for a DM gate valve?',
      body: 'Send the assembly number from the nameplate and the seat port. We will match the family and trim and quote the kit from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
