import type { BlogArticleSeed } from '../shared'

/**
 * Wire rope clips — orientation, number, turnback, torque, and where not to use them.
 *
 * Our clip product tables carry sizes and weights only, so every installation
 * figure here comes from a published source, checked on 2026-09-28:
 *   - US-type table: The Crosby Group's G-450 application table (Kito Crosby
 *     "Warnings & Application Instructions — Wire Rope End Fittings", 2025,
 *     identical in Crosby's 2013 PDF). Metric conversions are ours, and agree
 *     with the metric Annex B of EN 13411-5 where they overlap.
 *   - DIN 1142 style: EN 13411-5:2003 Annex A (greased-thread torques).
 *   - Sling eyes: OSHA 29 CFR 1926.251(c)(4)(iii), OSHA Safe Sling Use
 *     guidance, EN 13411-5 scope, EN 13414-1 scope.
 * Our drop-forged US-type clip has no Crosby cross-reference, so the copy
 * calls Crosby's table the reference and says the clip maker's table governs.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'wire-rope-clips-installation',
  title: 'How to install wire rope clips: which way round, how many, and how tight',
  excerpt:
    'A wire rope clip termination is only as good as its installation: the saddle on the live end, the right number of clips, the right length of turnback and the right torque, re-checked after the first load. Here are the published tables for US-type and DIN 1142 clips, and the one job clips must never do.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to install wire rope clips: number, turnback and torque',
  seoDescription:
    'How to install wire rope clips correctly: saddle on the live end, number of clips, turnback and torque tables for US-type and DIN 1142 clips, and why clips must not form sling eyes.',
  focusKeyword: 'how to install wire rope clips',
  publishedAt: '2026-09-28T15:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The saddle goes on the live, load-bearing end. The U-bolt goes on the dead, short end. Reversed, the U-bolt crushes the rope that carries the load.',
        'Number of clips, turnback and torque all come from the clip maker’s table. On a 1/2″ rope, the reference US table calls for 3 clips, 11-1/2″ of turnback and 65 ft-lb.',
        'Even correctly installed, a clipped eye holds about 80% of the rope’s breaking load on smaller sizes and 90% from 1″ up.',
        'Re-torque after the first load. The rope settles into the clips and the nuts lose tension.',
        'Clips must not be used to form the eyes of lifting slings. Use a ferrule-secured or spliced sling.',
      ],
    },
    {
      type: 'lead',
      html: 'Wire rope clips are the one rope termination anyone can make with a spanner, which is exactly why so many of them are made wrong. A clip that is reversed, too few, under-tightened or never re-checked can let the rope slip or crush it at the point that carries the load. The rules fit on one page.',
    },

    { type: 'section_head', number: '/01', title: 'Which way round.', anchor: 'orientation' },
    {
      type: 'paragraph',
      html: 'A U-bolt clip has two parts: the forged <strong>saddle</strong>, which cradles the rope, and the <strong>U-bolt</strong>, which clamps it. The U-bolt bites into the rope it sits on. So it goes on the <strong>dead end</strong> — the short tail after the rope has turned back around the thimble — and the saddle goes on the <strong>live end</strong> that carries the load.',
    },
    {
      type: 'paragraph',
      html: 'Crosby’s instructions put it memorably: “Never saddle a dead horse.” The saddle belongs on the live rope. Every clip on the termination faces the same way; alternating them puts a U-bolt on the live rope at every other clip.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A reversed clip crushes the rope that carries the load.',
      body: 'With the U-bolt on the live end, the bolt deforms the load-bearing rope at the very point it is working hardest, and the termination can fail well below its rating. If you find a reversed clip, take the termination out of service and remake it.',
    },
    {
      type: 'paragraph',
      html: 'Fist grips are the exception. They have a saddle on both sides, so they grip the live and dead ends alike and cannot be fitted the wrong way round.',
    },

    { type: 'section_head', number: '/02', title: 'How many, and how tight: US-type clips.', anchor: 'us-type-table' },
    {
      type: 'paragraph',
      html: 'The reference table for US-type drop-forged U-bolt clips is the one The Crosby Group publishes for its G-450 clip. It gives the minimum number of clips, the length of rope to turn back, and the nut torque, with <strong>threads clean, dry and unlubricated</strong>. If your clip maker publishes its own table, that one governs. The metric figures in brackets are our conversions.',
    },
    {
      type: 'comparison_table',
      caption: 'Minimum clips, turnback and torque for US-type drop-forged clips (Crosby G-450 table)',
      columns: ['Clip size', 'Rope (mm)', 'Clips', 'Turnback', 'Torque'],
      rows: [
        { cells: ['1/8″', '3–4', '2', '3-1/4″ (83 mm)', '4.5 ft-lb (6 N·m)'] },
        { cells: ['3/16″', '5', '2', '3-3/4″ (95 mm)', '7.5 ft-lb (10 N·m)'] },
        { cells: ['1/4″', '6–7', '2', '4-3/4″ (121 mm)', '15 ft-lb (20 N·m)'] },
        { cells: ['5/16″', '8', '2', '5-1/4″ (133 mm)', '30 ft-lb (41 N·m)'] },
        { cells: ['3/8″', '9–10', '2', '6-1/2″ (165 mm)', '45 ft-lb (61 N·m)'] },
        { cells: ['7/16″', '11–12', '2', '7″ (178 mm)', '65 ft-lb (88 N·m)'] },
        { cells: ['1/2″', '13', '3', '11-1/2″ (292 mm)', '65 ft-lb (88 N·m)'], highlight: true },
        { cells: ['9/16″', '14–15', '3', '12″ (305 mm)', '95 ft-lb (129 N·m)'] },
        { cells: ['5/8″', '16', '3', '12″ (305 mm)', '95 ft-lb (129 N·m)'] },
        { cells: ['3/4″', '18–20', '4', '18″ (457 mm)', '130 ft-lb (176 N·m)'] },
        { cells: ['7/8″', '22', '4', '19″ (483 mm)', '225 ft-lb (305 N·m)'] },
        { cells: ['1″', '24–25', '5', '26″ (660 mm)', '225 ft-lb (305 N·m)'] },
        { cells: ['1-1/8″', '28–30', '6', '34″ (864 mm)', '225 ft-lb (305 N·m)'] },
        { cells: ['1-1/4″', '33–34', '7', '44″ (1118 mm)', '360 ft-lb (488 N·m)'] },
        { cells: ['1-3/8″', '36', '7', '44″ (1118 mm)', '360 ft-lb (488 N·m)'] },
        { cells: ['1-1/2″', '38–40', '8', '54″ (1372 mm)', '360 ft-lb (488 N·m)'] },
        { cells: ['1-5/8″', '41–42', '8', '58″ (1473 mm)', '430 ft-lb (583 N·m)'] },
        { cells: ['1-3/4″', '44–46', '8', '61″ (1549 mm)', '590 ft-lb (800 N·m)'] },
        { cells: ['2″', '48–52', '8', '71″ (1803 mm)', '750 ft-lb (1017 N·m)'] },
        { cells: ['2-1/4″', '56–58', '8', '73″ (1854 mm)', '750 ft-lb (1017 N·m)'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The table applies to regular-lay 6x19 and 6x37 class rope, fibre or steel core. Add one clip when a pulley or sheave takes the place of the thimble, and on Seale-construction 6x19 rope of 1″ and larger. If you use more clips than the table asks for, lengthen the turnback in proportion. For rope outside those constructions, ask the clip maker.',
    },
    {
      type: 'direct_answer',
      question: 'How many wire rope clips do I need?',
      answer:
        'It depends on the rope size, and the clip maker’s table sets the minimum. On the widely used US table: two clips up to 7/16″ rope, three for 1/2″ to 5/8″, four for 3/4″ and 7/8″, five for 1″, rising to eight from 1-1/2″. Add one if the rope turns around a sheave instead of a thimble.',
    },

    { type: 'section_head', number: '/03', title: 'DIN 1142 and EN 13411-5 grips.', anchor: 'din-1142' },
    {
      type: 'paragraph',
      html: 'Metric U-bolt grips of the DIN 1142 design are covered by EN 13411-5. Its table differs from the US one in two ways that matter: it specifies more grips on the smaller sizes, and its torques are for <strong>greased</strong> threads, not dry ones. Never mix the torque from one table with the thread condition of the other.',
    },
    {
      type: 'comparison_table',
      caption: 'DIN 1142-style grips — EN 13411-5, Annex A (greased threads)',
      columns: ['Grip size (max rope)', 'Grips', 'Torque'],
      rows: [
        { cells: ['5 mm', '3', '2.0 N·m'] },
        { cells: ['6.5 mm', '3', '3.5 N·m'] },
        { cells: ['8 mm', '4', '6.0 N·m'] },
        { cells: ['10 mm', '4', '9.0 N·m'] },
        { cells: ['12 mm', '4', '20 N·m'] },
        { cells: ['14 mm', '4', '33 N·m'] },
        { cells: ['16 mm', '4', '49 N·m'] },
        { cells: ['19 mm', '4', '68 N·m'] },
        { cells: ['22 mm', '5', '107 N·m'] },
        { cells: ['26 mm', '5', '147 N·m'] },
        { cells: ['30 mm', '6', '212 N·m'] },
        { cells: ['34 mm', '6', '296 N·m'] },
        { cells: ['40 mm', '6', '363 N·m'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'For a rope between two sizes, use the next larger grip. EN 13411-5 places the first grip against the thimble with its bridge on the load-bearing rope, spaces the grips between 1.5 and 3 times the bridge width apart, and requires the termination to hold at least 80% of the rope’s minimum breaking force.',
    },
    {
      type: 'standard_citation',
      standard: 'EN 13411-5',
      publisher: 'CEN',
      title: 'Terminations for steel wire ropes — Safety — Part 5: U-bolt wire rope grips',
      summary:
        'Specifies U-bolt wire rope grips, the number of grips and tightening torque by rope size, and a termination efficiency of at least 80% of the rope’s minimum breaking force. Its scope excludes grips as the main securing device on mine hoists, crane hoist ropes and the eyes of slings for general lifting service, and it does not cover spiral strand.',
      edition: '2003+A1:2008',
    },

    { type: 'section_head', number: '/04', title: 'Making the termination.', anchor: 'installation' },
    {
      type: 'prose',
      html: '<ol><li>Turn back the length of rope given in the table and fit a thimble in the eye. The thimble stops the eye closing up and the rope bending sharply under load.</li><li>Fit the first clip one base width from the end of the dead end, U-bolt on the dead end, saddle on the live end. Tighten to the table torque.</li><li>Fit the next clip as close to the thimble as possible.</li><li>Space any remaining clips equally between the first two.</li><li>Take up the slack in the rope, then tighten every nut evenly, alternating from one nut to the other, to the table torque.</li><li>Apply a first load at least equal to the load the termination will carry, then re-tighten every nut to the table torque.</li><li>Inspect the termination and re-check the torque periodically in service.</li></ol>',
    },
    {
      type: 'paragraph',
      html: 'Even a perfect clip termination is weaker than the rope. The US table’s maker rates it at 80% of the rope’s minimum breaking force for 1/8″ to 7/8″ clips and 90% from 1″ upward, and EN 13411-5 requires at least 80%. Work that reduction into the WLL before the eye goes on a hook — our <a href="/blog/working-load-limit-vs-breaking-strength">guide to working load limit</a> shows how.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Ropes clips are not made for.',
      body: 'Do not clip plastic-coated wire rope: the coating hides whether the clip has gripped and lets it creep. EN 13411-5 does not cover spiral strand. For rotation-resistant, Lang-lay or other special constructions, follow the clip maker’s instructions or use a different termination. Reusing clips is discouraged by the maker of the US table.',
    },

    { type: 'section_head', number: '/05', title: 'The job clips must not do.', anchor: 'not-for-slings' },
    {
      type: 'paragraph',
      html: '<strong>Clips must not be used to form the eyes of lifting slings.</strong> US federal rules for construction work say sling eyes “shall not be formed by wire rope clips or knots” (29 CFR 1926.251). EN 13411-5 excludes clips as the securing device on the eyes of slings for general lifting service, and the European wire rope sling standard, EN 13414-1, covers only ferrule-secured and spliced eyes.',
    },
    {
      type: 'paragraph',
      html: 'US sling guidance allows a narrow exception — a sling designed by a qualified person where no prefabricated sling can be used — and even then requires drop-forged clips, never malleable ones, and never in a choker hitch. For almost every lift the answer is simpler: buy a ferrule-secured or spliced sling, rated and tagged by its maker.',
    },
    {
      type: 'paragraph',
      html: '<strong>Malleable iron clips</strong> — including the DIN 741 type and US-type malleable clips — are light-duty clamps. Crosby’s own guidance limits malleable cast-iron clips to non-critical applications. Use drop-forged clips wherever the termination carries a load that matters.',
    },
    {
      type: 'decision_tree',
      heading: 'Which clip for the job',
      intro: 'Start from what the termination holds.',
      branches: [
        { condition: 'A lifting sling eye', outcome: 'No clips. Use a ferrule-secured or spliced sling.' },
        { condition: 'A guy, stay, fixed line or winch rope end', outcome: 'Drop-forged U-bolt clips or fist grips, installed to the maker’s table.' },
        { condition: 'Metric rope on a European specification', outcome: 'DIN 1142 / EN 13411-5 grips, torqued on greased threads.' },
        { condition: 'Marine or corrosive service', outcome: 'Stainless steel drop-forged or DIN 1142 grips, same installation rules.' },
        { condition: 'Fencing, barriers, light non-critical ties', outcome: 'Malleable clips such as DIN 741 are acceptable here — and only here.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Clips and thimbles in this guide',
      skus: ['IH-LR-WC-DF', 'IH-LR-WC-FG', 'IH-LR-WC-D1142', 'IH-LR-WC-SSDF', 'IH-LR-WC-SSWRCD114', 'IH-LR-TH-US', 'IH-LR-TH-EH', 'IH-LR-WS-SWG'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Which side of the rope does the U-bolt go on?',
          answer:
            'The dead end — the short tail. The saddle goes on the live end that carries the load. Every clip faces the same way. A clip with its U-bolt on the live rope crushes the load-bearing rope and weakens the termination.',
        },
        {
          question: 'How many clips for a 1/2 inch wire rope?',
          answer:
            'Three on the reference US table, with 11-1/2″ (292 mm) of rope turned back and 65 ft-lb (88 N·m) on dry threads. On a DIN 1142-style grip for 12 to 14 mm rope, EN 13411-5 asks for four.',
        },
        {
          question: 'Should the threads be greased before torquing?',
          answer:
            'Follow the table you are using. The US table’s torques are for clean, dry threads. EN 13411-5’s DIN 1142-style torques are for greased threads. Using one table’s torque with the other’s thread condition over- or under-tightens the clip.',
        },
        {
          question: 'Can I make a lifting sling with wire rope clips?',
          answer:
            'No. Sling eyes must not be formed with clips under US federal rules, EN 13411-5 excludes them for general-service sling eyes, and the European wire rope sling standard covers only ferrule-secured and spliced eyes. Use a manufactured sling.',
        },
        {
          question: 'Why re-tighten after the first load?',
          answer:
            'Because the rope compresses and settles into the clips under load, and the nuts lose tension. Re-torquing after the first load, and periodically after that, keeps the clips gripping.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'wire-rope-clips',
      label: 'Wire rope clips',
      blurb: 'Drop-forged, fist grip, DIN 1142, DIN 741 and stainless clips.',
    },
    {
      type: 'category_link',
      slug: 'wire-rope-thimbles',
      label: 'Wire rope thimbles',
      blurb: 'Standard, extra-heavy and solid thimbles to protect the eye.',
    },
    {
      type: 'category_link',
      slug: 'wire-rope-slings',
      label: 'Wire rope slings',
      blurb: 'Ferrule-secured and spliced slings for lifting, rated and tagged.',
    },
    {
      type: 'related_articles',
      slugs: ['wire-rope-construction-explained', 'working-load-limit-vs-breaking-strength', 'sling-angle-chart'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-09-28',
      note: 'US-type figures from The Crosby Group’s published G-450 application table (2025 edition); metric conversions ours. DIN 1142-style figures from EN 13411-5:2003, Annex A. The clip maker’s own published table governs for its clips.',
    },
    {
      type: 'cta_block',
      heading: 'Need clips, thimbles or a made-up sling?',
      body: 'Tell us the rope diameter and construction and what the termination will hold. We will quote the right clips and thimbles — or a rated sling, if the job is a lift.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
