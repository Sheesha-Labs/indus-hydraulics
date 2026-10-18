import type { BlogArticleSeed } from '../shared'

/**
 * Dry disconnect vs camlock. Checked 2026-10-18 against manntek.se (DDC page, Design 2.0 brochure XB40, accessory
 * pages) and the configurator: valves in both halves, one turning motion, STANAG 3756 / ASTM F1122 interface,
 * 1"–8", 10–25 bar by material with 5× safety factor, materials and seals, selectivity coding (high). Camlock facts
 * kept to what any cam-and-groove coupling is: an open coupling with no valve (high); types and standards are left
 * to the existing cam-and-groove post.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'dry-disconnect-vs-camlock-couplings',
  title: 'Dry disconnect vs camlock couplings: when the spill on disconnect matters',
  excerpt:
    'A camlock is an open coupling: part it under a full hose and the contents come out. A dry disconnect has a valve in each half that closes before the halves separate. How the two compare, which duties justify a dry disconnect, and what changing over involves.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Dry Disconnect vs Camlock Couplings: Spill, Safety, Cost',
  seoDescription:
    'Dry disconnect vs camlock: valves in both halves vs an open coupling, spill on disconnect, STANAG 3756 interchangeability, materials, pressure and when the change pays for itself.',
  focusKeyword: 'dry disconnect vs camlock',
  publishedAt: '2026-10-18T11:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A camlock (cam and groove) coupling has no valve: whatever is in the hose comes out when it is parted.',
        'A dry disconnect has a valve in both halves that closes before the halves separate, so only a trace of product is lost.',
        'MannTek’s DDC interface follows STANAG 3756 and ASTM F1122, so halves of the same size from makers on that interface connect.',
        'Choose a dry disconnect for fuels, chemicals, solvents and acids, and wherever a spill is a safety, environmental or cost problem.',
        'Camlocks stay the right choice for water, slurry and other media where a little spill does not matter.',
      ],
    },
    {
      type: 'lead',
      html: 'Camlocks are everywhere because they are quick, cheap and simple: two cam arms pull the coupler onto the grooved adapter and the line is made. The catch is at the other end of the job. A camlock has nothing inside it to stop the flow, so the moment it is opened the hose and the pipe empty through the joint. For water that is a puddle. For diesel, solvent or acid it is a spill, an exposure and a clean-up. A dry disconnect coupling is built to remove exactly that. For the camlock types themselves, see <a href="/blog/cam-and-groove-coupling-types">cam and groove coupling types</a>.',
    },

    { type: 'section_head', number: '/01', title: 'How they differ.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'Camlock vs dry disconnect coupling',
      columns: ['Feature', 'Camlock (cam and groove)', 'Dry disconnect (MannTek DDC)'],
      rows: [
        { cells: ['Valve', 'None: an open coupling', 'One in each half, tank unit and hose unit'] },
        { cells: ['On disconnect', 'Hose and pipe contents run out', 'Both valves close before the halves part; minimal product loss'], highlight: true },
        { cells: ['Connecting', 'Pull the cam arms down', 'Couple and turn: one motion opens both valves'] },
        { cells: ['Interface', 'Cam and groove profile by size', 'STANAG 3756 / ASTM F1122 bayonet, 1" to 8"'] },
        { cells: ['Materials (DDC)', 'Aluminium, brass, stainless, polypropylene and others', 'Aluminium, brass, stainless, Hastelloy, titanium, PVDF, PEEK'] },
        { cells: ['Pressure (DDC)', 'Depends on type and material', '10 to 25 bar by material, with a five times safety factor'] },
        { cells: ['Cost', 'Low', 'Higher, paid back where spills cost money'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a dry disconnect coupling and a camlock?',
      answer:
        'A camlock is an open coupling with no valve, so the contents of the hose escape when it is disconnected. A dry disconnect coupling has a valve in each half; turning it to disconnect closes both valves before the halves separate, so almost no product is lost. Dry disconnects cost more and are used for fuels, chemicals and other media where a spill matters.',
    },

    { type: 'section_head', number: '/02', title: 'When the spill matters.', anchor: 'when' },
    {
      type: 'paragraph',
      html: 'The case for a dry disconnect is strongest where three things meet: a hazardous or valuable medium, frequent connections, and people standing at the joint. That covers road and rail tanker loading and unloading, including bottom loading, ISO and IBC containers, chemical and petrochemical plant, pharmaceutical transfer and ship manifolds. MannTek designed the DDC for liquids, fuels, chemicals and gases, and builds it in 1" for industrial process plant up to 6" and 8" for marine bunkering and ship-to-shore transfer. For LPG there is a dedicated version, covered in <a href="/blog/lpg-dry-gas-couplings-and-acme">LPG dry gas couplings</a>; for LNG and other cryogenic liquids see <a href="/blog/lng-bunkering-couplings-iso-21593">LNG bunkering couplings</a>.',
    },
    {
      type: 'prose',
      html: '<p>Beyond the spill itself, a dry disconnect adds controls a camlock cannot offer:</p><ul><li><strong>Selectivity coding:</strong> slots on the tank unit and pins on the hose unit stop the wrong medium being connected.</li><li><strong>Locking device</strong> on the hose unit, so a made coupling cannot loosen by accident.</li><li><strong>Stop before disconnect:</strong> if a valve fails to seal, the halves cannot be separated.</li><li><strong>Electronic sensor</strong> reporting whether the valves are open, for interlocks and drive-away protection.</li><li><strong>Hose unit with integrated breakaway</strong> for lines that could be pulled.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Changing over.', anchor: 'changeover' },
    {
      type: 'paragraph',
      html: 'A dry disconnect replaces both halves of the joint. The tank unit, which has no swivel, goes where the camlock adapter was on the tank, container or manifold, on a BSP or NPT thread or an ANSI, EN, TW, TTMA or JIS flange. The hose unit, with its swivel and handles, goes on the hose or loading arm. Because the DDC interface follows STANAG 3756, a fleet can change over site by site and still connect to tank units already in service on the same interface. Close each half with a dust cap or plug when it is not in use; the open faces are what wear.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Check the other half first.',
      body: 'Before ordering, confirm the make and size of the tank units or hose units the new halves must meet. Same interface, same size is the rule.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a dry disconnect completely spill-free?', answer: 'Not literally: a trace stays on the faces between the valves. MannTek describes the loss as minimal. It is a different order from a camlock, which empties the hose.' },
        { question: 'Can a dry disconnect connect to a camlock?', answer: 'No. They have different interfaces. Change both halves of the joint, or use an adapter made for the purpose.' },
        { question: 'Will a MannTek DDC fit another maker’s dry disconnect?', answer: 'The DDC interface follows STANAG 3756 and ASTM F1122, so same-size halves built to that interface connect. Send us the make on site and we will confirm.' },
        { question: 'What pressure does a dry disconnect take?', answer: 'MannTek publishes 10 to 25 bar for the DDC range, depending on body material, with a five times safety factor.' },
        { question: 'What does it cost compared with a camlock?', answer: 'More per joint. It pays back where spills, exposure, clean-up or lost product cost money on every disconnection.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Dry disconnect couplings',
      skus: ['IH-MNT-DDC-TU', 'IH-MNT-DDC-HU', 'IH-MNT-DDC-CAP', 'IH-MNT-DEC-TU', 'IH-MNT-DEC-HU'],
    },
    {
      type: 'category_link',
      slug: 'dry-disconnect-couplings',
      label: 'Dry disconnect couplings',
      blurb: 'MannTek DDC, DGC, DAC and DEC tank and hose units, 1" to 8".',
    },
    {
      type: 'category_link',
      slug: 'cam-and-groove-couplings',
      label: 'Cam and groove couplings',
      blurb: 'Types A to F, DC and DP for water, slurry and general transfer.',
    },
    {
      type: 'related_articles',
      slugs: ['cam-and-groove-coupling-types', 'tanker-loading-and-vapour-recovery-hose', 'industrial-hose-couplings-guide', 'industrial-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-18',
      note: 'DDC interface, sizes, materials, pressure and options from MannTek’s DDC product page, Design 2.0 brochure and configurator.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing camlocks on a tanker or plant?',
      body: 'Send the medium, the sizes and the connections on both sides. We will quote matching MannTek tank and hose units.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
