import type { BlogArticleSeed } from '../shared'

/**
 * LNG bunkering couplings. Checked 2026-10-18 against manntek.se DCC, CBC, PERC, VSD, fall arrest, hose saddle,
 * purge line, insulation flange and heated parking pages: DCC for LNG, N2, O2, Ar, ethylene to -196 °C, no
 * retightening during cool-down, 10,000+ test cycles, ISO/TS 18683 (ASTM F3312) DN 25–150 vs ISO 21593 1"–8" for
 * ship-to-ship bunkering, PTFE seals, stainless body; PERC HPN2 nitrogen release unit, SIL2 PLC assessed by DNV-GL;
 * VSD three wires (alarm, ESD 1, ESD 2) (high). No bunkering procedure or regulation is stated — not sourced here.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lng-bunkering-couplings-iso-21593',
  title: 'LNG bunkering couplings: ISO 21593 vs ISO/TS 18683, breakaways and emergency release',
  excerpt:
    'An LNG bunkering line is a chain: the dry cryogenic coupling, a breakaway or powered emergency release coupling, the transfer hose and the gear that holds and protects it. How the two coupling standards differ, how emergency release is staged as vessels move apart, and what goes around the hose string.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'LNG Bunkering Couplings: ISO 21593 vs ISO/TS 18683, PERC',
  seoDescription:
    'LNG bunkering couplings explained: dry cryogenic couplings to ISO 21593 or ISO/TS 18683 at -196 °C, cryogenic breakaways, PERC emergency release, VSD and the hose-string equipment.',
  focusKeyword: 'lng bunkering coupling',
  publishedAt: '2026-10-18T11:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A dry cryogenic coupling (DCC) closes both halves before it separates and works down to -196 °C without retightening during cool-down.',
        'ISO 21593 is the standard for dry couplings in ship-to-ship LNG bunkering; the DCC to ISO/TS 18683 suits existing and most land-based installations.',
        'Match the coupling standard to the other half, or to the one the terminal or vessel specifies.',
        'A powered emergency release coupling (PERC) separates the line on an ESD signal or by manual override; a vessel separation device stages alarm, ESD 1 and ESD 2 as ships move apart.',
        'The hose string also needs saddles, fall arrest, purge lines, insulation flanges and, after transfer, a heated parking device.',
      ],
    },
    {
      type: 'lead',
      html: 'At -162 °C, LNG punishes every weak point in a transfer line: joints that loosen as they cool, seals that harden, and couplings that cannot be parted quickly when a ship moves. A bunkering line is therefore built as a system, from the coupling at the manifold to the release that protects both vessels. The hose itself is covered in <a href="/blog/cryogenic-transfer-hose">cryogenic transfer hose</a>; this article is about the couplings and the equipment around them.',
    },

    { type: 'section_head', number: '/01', title: 'Two coupling standards.', anchor: 'standards' },
    {
      type: 'comparison_table',
      caption: 'MannTek dry cryogenic couplings by interface standard',
      columns: ['Feature', 'DCC to ISO/TS 18683 (ASTM F3312)', 'DCC ISO to ISO 21593'],
      rows: [
        { cells: ['Sizes', 'DN 25 to DN 150', '1" to 8"'] },
        { cells: ['Best fit', 'Existing installations and most land-based LNG work', 'Ship-to-ship LNG bunkering'], highlight: true },
        { cells: ['Purpose', 'Wider range of transfer jobs outside marine bunkering', 'Cross-manufacturer compatibility at sea'] },
        { cells: ['Service temperature', 'Down to -196 °C', 'Down to -196 °C'] },
        { cells: ['Body and seals', 'Stainless steel, PTFE seals', 'Stainless steel, PTFE seals'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between ISO 21593 and ISO/TS 18683 dry couplings?',
      answer:
        'ISO 21593 is the international standard for dry couplings in ship-to-ship LNG bunkering, written so couplings from different makers connect at sea. MannTek builds its DCC ISO to it in 1" to 8". The DCC to ISO/TS 18683 (ASTM F3312), DN 25 to DN 150, suits existing installations and most land-based LNG transfer. The two do not mix: match the other half or the standard the terminal specifies.',
    },
    {
      type: 'paragraph',
      html: 'MannTek uses the same bayonet principle and self-sealing valves as its dry disconnect couplings, and states that unlike a flanged or threaded joint the DCC needs no retightening during cool-down. It reports more than 10,000 connect and disconnect cycles in cryogenic testing.',
    },

    { type: 'section_head', number: '/02', title: 'Emergency release, in stages.', anchor: 'release' },
    {
      type: 'prose',
      html: '<p>MannTek’s vessel separation device uses three wires of different length between the vessels:</p><ul><li>The shortest is a trip wire that sounds or shows an alarm when the vessels start to move.</li><li>The middle wire triggers ESD 1: the on-board ESD system stops the pumps and closes the ESD valves.</li><li>The longest triggers ESD 2, which is sent to the HPN2 release unit and activates the powered emergency release coupling.</li></ul><p>The PERC then separates the line with both halves closed. Its release unit uses high-pressure nitrogen, and MannTek’s PLC control for the system has been assessed by DNV-GL as compliant with SIL2. After release, a friction fall arrest lowers the hose at a steady rate, and a Twin PERC can release the purge line together with the transfer line.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Breaking bolt or powered?',
      body: 'Cryogenic breakaways with breaking bolts or cable release protect a line passively. A PERC adds a controlled, signalled release tied to the ESD system, which is why it is used in ship-to-ship bunkering.',
    },

    { type: 'section_head', number: '/03', title: 'Around the hose string.', anchor: 'string' },
    {
      type: 'paragraph',
      html: 'The rest of the line is what keeps it working between emergencies. Single or double hose saddles hold the hose and its bend radius on both vessels; hose buns and lifting devices handle it without kinking; Kevlar-reinforced covers protect it when dragged over a deck. Nitrogen purge lines, connected through a spool piece, clear the hose after transfer; insulation flanges break electrical continuity along the line. After the transfer, a heated parking device defrosts and dries the hose unit so it is ready again within minutes. The full range is gathered on our <a href="/industries/lng-future-fuels">LNG and future fuels</a> page.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which coupling standard should I specify?', answer: 'The one the other half uses, or the one the terminal or vessel specifies. ISO 21593 for ship-to-ship bunkering; ISO/TS 18683 for most existing and land-based installations.' },
        { question: 'Can ISO 21593 and ISO/TS 18683 couplings connect?', answer: 'No. They are different interfaces. Choose the version that matches the other half.' },
        { question: 'What temperature are the couplings rated for?', answer: 'MannTek rates the DCC for cryogenic liquefied gases down to -196 °C.' },
        { question: 'What triggers a PERC release?', answer: 'An ESD 2 signal, for example from a vessel separation device, or a manual override.' },
        { question: 'Do you supply the hose and the equipment around it?', answer: 'Yes. MannTek transfer hose (composite or stainless, 1" to 10") and the saddles, fall arrest, purge lines and other equipment are quoted to order with the couplings.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'LNG couplings and release',
      skus: ['IH-MNT-DCC-TU', 'IH-MNT-DCC-HU', 'IH-MNT-CBC', 'IH-MNT-CBCC', 'IH-MNT-PERC'],
    },
    {
      type: 'category_link',
      slug: 'lng-cryogenic-couplings',
      label: 'LNG and cryogenic couplings',
      blurb: 'MannTek DCC, CBC and PERC for LNG and liquid gases.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'lng-future-fuels',
      label: 'LNG and future fuels',
      blurb: 'Couplings, release and hose-string equipment for bunkering.',
    },
    {
      type: 'related_articles',
      slugs: ['cryogenic-transfer-hose', 'tanker-loading-and-vapour-recovery-hose', 'industrial-hose-couplings-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-18',
      note: 'Coupling standards, sizes, temperature and test cycles from MannTek’s DCC page; release staging from MannTek’s VSD, PERC, fall arrest and Twin PERC pages.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying a bunkering line?',
      body: 'Send the standard, line size, vessels or terminal and the release you need. We will quote the MannTek couplings and the hose-string equipment together.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
