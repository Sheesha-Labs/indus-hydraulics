import type { BlogArticleSeed } from '../shared'

/**
 * Offshore mooring chain grades. Mechanical properties from a stockist's chain mechanical properties
 * sheet (read from a 200 dpi render, 2026-11-08), whose columns follow IACS and the class societies;
 * the IACS W22 load constants from the makers' data sheets; R6 named (no properties) in a maker's 2026
 * news pages; the maker's note that grade 3 ship-chain steel does not meet mooring-chain requirements.
 * 76 mm loads are the live listing values.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'offshore-mooring-chain-grades-r3-r4-r5',
  title: 'Offshore mooring chain grades ORQ, R3, R3S, R4, R4S and R5: strength, toughness and loads',
  excerpt:
    'The six offshore mooring chain grades compared: tensile and yield strength, elongation, reduction of area and Charpy impact energy for each, the IACS test-load constants, what 76 mm chain carries in every grade, and how the R grades differ from ship anchor chain grade U3.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Mooring Chain Grades R3, R3S, R4, R4S, R5 and ORQ Compared',
  seoDescription:
    'Offshore mooring chain grades compared: ORQ, R3, R3S, R4, R4S and R5 tensile and yield strength, elongation, Charpy impact energy, IACS proof and break constants, and loads at 76 mm.',
  focusKeyword: 'mooring chain grades',
  publishedAt: '2026-11-08T09:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Offshore mooring chain is made in six grades: ORQ, R3, R3S, R4, R4S and R5, in rising order of strength.',
        'Minimum tensile strength rises from 690 MPa for R3 to 860 MPa for R4 and 1,000 MPa for R5; yield from 410 to 580 and 760 MPa.',
        'Every grade must also be tough at low temperature: R4 chain needs 50 J in the link and 36 J at the weld in a Charpy test at −20 °C.',
        'At 76 mm the minimum breaking load climbs from 4,621 kN (ORQ) to 7,009 kN (R5) — about half as much again for the same diameter.',
        'A higher grade lets a smaller, lighter chain carry the same load, but the connectors, testing and certificates must all match the grade.',
      ],
    },
    {
      type: 'lead',
      html: 'A ship’s anchor chain spends most of its life in the locker. A mooring chain on a floating production unit or a drilling rig is under load every hour for years, in seawater, cycling with every wave. That is why offshore chain has its own family of grades, with higher strength than ship chain and a toughness requirement for every grade. One chain maker puts it plainly: ordinary grade 3 anchor chain steel is far from meeting what a mooring chain needs — high strength, fatigue and corrosion resistance, weldability and low-temperature toughness at the weld.',
    },
    {
      type: 'figure',
      imageId: 'b38b9b7f-f2a7-49f5-b38d-27bd8d163f4e',
      caption: 'Mooring chain laid out for inspection: every length is proof tested and checked before it is certified.',
      aspectRatio: '4/3',
    },
    {
      type: 'direct_answer',
      question: 'What are the grades of offshore mooring chain?',
      answer:
        'ORQ, R3, R3S, R4, R4S and R5. ORQ is the original API oil-rig quality; R3 to R5 are the IACS and classification society grades. Minimum tensile strength runs from 690 MPa (R3) to 1,000 MPa (R5), with Charpy impact requirements at −20 °C or 0 °C for each grade.',
    },

    { type: 'section_head', number: '/01', title: 'Mechanical properties.', anchor: 'properties' },
    {
      type: 'comparison_table',
      caption: 'Minimum mechanical properties of mooring chain steel (as tabled by a chain stockist from IACS and class rules)',
      columns: ['Grade', 'Tensile, MPa', 'Yield, MPa', 'Elongation %', 'Reduction of area %'],
      rows: [
        { cells: ['ORQ', '641', '—', '17', '40'] },
        { cells: ['R3', '690', '410', '17', '50'] },
        { cells: ['R3S', '770', '490', '15', '50'] },
        { cells: ['R4', '860', '580', '12', '50'] },
        { cells: ['R4S', '960', '690', '12', '50'] },
        { cells: ['R5', '1,000', '760', '12', '50'] },
        { cells: ['Grade 3 (ship chain, for comparison)', '690', '—', '17', '40'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Grade 3 ship chain and R3 mooring chain share a 690 MPa tensile strength, but R3 adds a yield requirement, a higher reduction of area and a toughness requirement at a lower temperature. Above R3 the strength climbs quickly while the required elongation falls — higher-strength steel is less ductile, which is why toughness has to be specified separately.',
    },

    { type: 'section_head', number: '/02', title: 'Toughness: the Charpy requirement.', anchor: 'charpy' },
    {
      type: 'comparison_table',
      caption: 'Minimum Charpy V-notch impact energy, base material / weld (J)',
      columns: ['Grade', 'At −20 °C', 'At 0 °C'],
      rows: [
        { cells: ['ORQ', '—', '58 / 49 (40 / 36 at −15 °C)'] },
        { cells: ['R3', '40 / 30', '60 / 50'] },
        { cells: ['R3S', '45 / 33', '65 / 53'] },
        { cells: ['R4', '50 / 36', '70 / 50'] },
        { cells: ['R4S', '50 / 36', '—'] },
        { cells: ['R5', '58 / 42', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The flash-butt weld in every link is the place a chain is most likely to be brittle, so the weld has its own, lower minimum. The test temperature is the design temperature chosen for the project: −20 °C is usual, with 0 °C values given for R3, R3S and R4 where the class allows. How the welds are made is in <a href="/blog/how-anchor-chain-is-made">how anchor chain is made</a>; how they are tested in <a href="/blog/anchor-chain-testing-proof-break-ndt">anchor chain testing</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Test loads by grade.', anchor: 'loads' },
    {
      type: 'comparison_table',
      caption: 'IACS test-load constants and the loads they give at 76 mm (live listing values, kN)',
      columns: ['Grade', 'Break constant', 'Break at 76 mm', 'Proof at 76 mm, stud link / studless'],
      rows: [
        { cells: ['ORQ', '0.0211', '4,621', '3,066 / 3,066'] },
        { cells: ['R3', '0.0223', '4,884', '3,417 / 3,417'] },
        { cells: ['R3S', '0.0249', '5,454', '3,942 / 3,811'] },
        { cells: ['R4', '0.0274', '6,001', '4,731 / 4,205'] },
        { cells: ['R4S', '0.0304', '6,658', '5,257 / 4,665'] },
        { cells: ['R5', '0.0320', '7,009', '5,498 / 4,884'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Every load comes from F = c × d² × (44 − 0.08d) kN with the grade’s constant. One detail worth knowing: for R3 one class society proves stud link chain with a slightly lower constant (0.0148) than the 0.0156 others use, so check which rule set the certificate follows. All sizes from 36 to 205 mm are in the <a href="/blog/anchor-chain-size-chart">anchor chain size chart</a>, and the difference between the stud link and studless proof loads is explained in <a href="/blog/stud-link-vs-studless-chain">stud link vs studless chain</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Choosing a grade.', anchor: 'choosing' },
    {
      type: 'prose',
      html: '<p>The mooring analysis sets the required breaking strength; the grade decides how big and heavy a chain meets it. Things to weigh:</p><ul><li><strong>Weight.</strong> A higher grade carries the same load on a smaller chain, which matters on a deep-water line where the unit carries the chain’s weight.</li><li><strong>Fittings.</strong> Every connector must be rated to the grade — <a href="/p/h-link">H-links</a>, <a href="/p/pear-shaped-end-shackle-grade-r4">pear shackles</a>, <a href="/p/compact-mooring-swivel-grades-r4-and-r5">swivels</a> — see <a href="/blog/offshore-mooring-components">offshore mooring components</a>.</li><li><strong>Availability.</strong> R3 and R4 are the most widely made and stocked; R4S and R5 are made to order by fewer mills.</li><li><strong>Newer grades.</strong> Makers have begun to offer an R6 grade; check the class status before specifying it.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the strongest mooring chain grade?', answer: 'Of the established IACS grades, R5, with a minimum tensile strength of 1,000 MPa. Some makers now offer R6.' },
        { question: 'What does ORQ stand for?', answer: 'Oil Rig Quality — the original API grade for mooring chain, below R3 in strength.' },
        { question: 'Is R3 the same as grade 3 anchor chain?', answer: 'They share a 690 MPa tensile strength, but R3 adds a minimum yield of 410 MPa, a 50% reduction of area and a Charpy requirement at −20 °C, and has higher test loads.' },
        { question: 'What does the S in R3S and R4S mean?', answer: 'They are intermediate grades — stronger than R3 and R4 respectively, below the next grade up.' },
        { question: 'What Charpy energy does R4 chain need?', answer: '50 J in the base material and 36 J at the weld at −20 °C, or 70 J and 50 J at 0 °C.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Offshore mooring chain and fittings',
      skus: ['IH-MR-MC-SL', 'IH-MR-MC-SS', 'IH-MR-CN-HLK', 'IH-MR-AC-PESR4', 'IH-MR-AC-CSW', 'IH-MR-AC-AKS'],
    },
    { type: 'category_link', slug: 'offshore-mooring-chain', label: 'Offshore mooring chain', blurb: 'Stud link and studless chain in grades ORQ to R5, with adaptors and tails.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-size-chart', 'stud-link-vs-studless-chain', 'offshore-mooring-components', 'anchor-chain-testing-proof-break-ndt', 'anchor-chain-grades-u1-u2-u3'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Mechanical properties as tabled by a chain stockist from IACS and class rules; loads from our live listings (IACS UR W22). The classification society’s rules govern.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying mooring chain?',
      body: 'Send the diameter, grade, type, length and the class society. We will quote the chain and the matching connectors, each with its certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
