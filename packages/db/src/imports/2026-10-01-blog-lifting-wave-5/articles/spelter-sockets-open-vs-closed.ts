import type { BlogArticleSeed } from '../shared'

/**
 * Spelter sockets — open vs closed, zinc vs resin, and the wedge socket.
 *
 * Sources checked 2026-10-01: Kito Crosby catalogue G-416/G-417 pages (100%
 * efficiency, rope constructions, forged ≤ 1-1/2", cast alloy 1-5/8–4" with
 * MPI/UT, RR-S-550F types, G-417 pin rule, strand basket rule), WIRELOCK
 * resin page (100%, −54 to +116 °C, pour range), Crosby termination manual
 * (broom and clean; procedure per ISO 17558 / API RP9B / Wire Rope Users
 * Manual; zinc preheat ≤ 450 °C; proof test 2 × WLL; most capacity in the
 * bottom third), S-421T wedge socket (80%, live end in line with the pin,
 * tail lengths, first load, EN 13411-6); SafeWork NSW (live end on the sloping
 * side fails at the socket).
 * Not used, unverified: zinc pouring temperature; any maker wording on open vs
 * closed use (the copy describes the shapes instead).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'spelter-sockets-open-vs-closed',
  title: 'Spelter sockets: open vs closed, zinc vs resin, and when a wedge socket will do',
  excerpt:
    'A properly poured spelter socket keeps 100% of the wire rope’s breaking load — the only end fitting besides a swaged socket that does. Open sockets connect with a pin through their jaws; closed sockets take a pin or shackle through a solid eye. A wedge socket is quicker to fit but keeps 80%. Here is how to choose and what a good socket needs.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Open vs closed spelter socket: efficiency, zinc vs resin, wedge sockets',
  seoDescription:
    'Open and closed spelter sockets compared: 100% termination efficiency, zinc vs resin pouring, sizing for rope and pin, proof testing, and how a wedge socket differs.',
  focusKeyword: 'open vs closed spelter socket',
  publishedAt: '2026-10-01T12:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A correctly poured spelter socket develops 100% of the rope’s catalogue breaking strength.',
        'An open socket has two jaws and a pin, for connecting to an eye, lug or plate. A closed socket has a solid eye, for connecting through a pin or shackle.',
        'Sockets can be poured with molten zinc or with resin. Both reach 100%; resin is limited to about −54 °C to 116 °C in service.',
        'A wedge socket can be fitted on site without pouring, but keeps 80% of the rope’s strength and must be fitted with the live end in line with the pin.',
        'Socketing is a skilled job: the rope end is broomed, cleaned and poured to a written procedure, and the assembly is proof-tested.',
      ],
    },
    {
      type: 'lead',
      html: 'Crane pendants, guy lines, structural strand and heavy rigging often call for an end fitting that keeps the rope’s full strength. Of the common terminations, only poured and swaged sockets do. The choice between them, and between open and closed shapes, comes down to what the rope connects to and how the socket will be made.',
    },

    { type: 'section_head', number: '/01', title: 'Open or closed.', anchor: 'open-closed' },
    {
      type: 'comparison_table',
      caption: 'Open and closed spelter sockets',
      columns: ['Aspect', 'Open socket (G-416 pattern)', 'Closed socket (G-417 pattern)'],
      rows: [
        { cells: ['Shape', 'Two jaws with a removable pin', 'A solid eye'] },
        { cells: ['Connects to', 'An eye, lug, plate or another closed socket, through its pin', 'A shackle, clevis or pin passed through the eye'] },
        { cells: ['Efficiency', '100% of the rope’s catalogue strength', '100% of the rope’s catalogue strength'] },
        { cells: ['Note', '—', 'Its pin must not be larger than the pin of the matching open socket'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Sockets of this pattern are rated for 6x7, 6x19 and 6x37 class ropes, regular or Lang lay, fibre or steel core. The smaller sizes are forged; the largest, from about 1-5/8″, are cast alloy steel and are inspected by magnetic particle and ultrasonic testing. For strand such as 1x7, the socket’s basket must be at least five times the strand diameter or fifty times the wire diameter, whichever is greater.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between an open and a closed spelter socket?',
      answer:
        'An open spelter socket has two jaws and a pin, so it connects to an eye, lug or plate through that pin. A closed spelter socket has a solid eye and connects through a pin or shackle passed through it. Both, correctly poured, develop 100% of the rope’s breaking strength.',
    },

    { type: 'section_head', number: '/02', title: 'Zinc or resin.', anchor: 'zinc-resin' },
    {
      type: 'paragraph',
      html: 'The socket is filled after the rope end has been opened out into a broom and cleaned. <strong>Zinc</strong> is the traditional filler, poured molten into a socket that may be preheated — to no more than 450 °C. <strong>Resin</strong>, a two-part compound, needs no molten metal on site, and is also rated at 100%; one resin system is rated for service from −54 °C to 116 °C and is approved only for specific sockets.',
    },
    {
      type: 'paragraph',
      html: 'Either way, socketing must follow a written procedure — the rope and socket maker’s instructions, ISO 17558 or API RP 9B — and the finished assembly is proof-tested, typically to twice the WLL. Most of a poured socket’s holding capacity is in the bottom third, nearest the rope entry, which is why a clean, fully filled bottom matters most.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Socketing is not a field improvisation.',
      body: 'A socket poured without brooming and cleaning the wires, or with the wrong filler, can pull out well below the rope’s strength while looking perfect from outside. Have sockets poured by trained staff to a written procedure, and keep the proof-test record with the assembly.',
    },

    { type: 'section_head', number: '/03', title: 'When a wedge socket will do.', anchor: 'wedge-socket' },
    {
      type: 'paragraph',
      html: 'A wedge socket grips the rope between a tapered body and a wedge, and can be fitted and adjusted on site without pouring. It keeps about <strong>80%</strong> of the rope’s strength, so it suits rope ends that are adjusted or replaced on site, rather than where full strength is needed.',
    },
    {
      type: 'prose',
      html: '<ul><li>The <strong>live end</strong> must run straight in line with the socket pin. Fitted the other way, with the live end on the sloping side of the wedge, the rope fails at the socket.</li><li>Leave a tail of at least six rope diameters, and not less than 150 mm, on standard ropes — at least twenty diameters on rotation-resistant rope, with the tail secured before it goes in.</li><li>Never clamp or attach the dead end back to the live end.</li><li>Apply a first load at least equal to the working load to seat the wedge before use.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a rope end',
      intro: 'Start from the strength you need at the end.',
      branches: [
        { condition: 'Full rope strength at the end — pendants, guys, structural strand', outcome: 'Spelter socket, open or closed to suit the connection.' },
        { condition: 'Connecting to a lug, plate or eye', outcome: 'Open socket, through its pin.' },
        { condition: 'Connecting with a shackle or pin', outcome: 'Closed socket.' },
        { condition: 'Rope end adjusted or replaced on site, 80% acceptable', outcome: 'Wedge socket, fitted with the live end in line.' },
        { condition: 'Sling eyes', outcome: 'Ferrule-secured or Flemish eye — see our termination guide.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Sockets in this guide',
      skus: ['IH-LR-ST-OSSG416', 'IH-LR-ST-CSSG417'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'How strong is a spelter socket?',
          answer: 'A correctly poured spelter socket develops 100% of the wire rope’s catalogue breaking strength.',
        },
        {
          question: 'Is resin as good as zinc in a spelter socket?',
          answer:
            'Resin socketing is rated at 100% efficiency like zinc, but has a service temperature range — one system is rated −54 °C to 116 °C — and is approved only for specific sockets. Follow the resin maker’s instructions.',
        },
        {
          question: 'Which way round does a wedge socket go?',
          answer:
            'With the live, load-bearing rope running straight in line with the socket pin. With the live end on the sloping side of the wedge, the rope fails at the socket.',
        },
        {
          question: 'Do socketed assemblies need proof testing?',
          answer:
            'Yes. The socketed assembly is proof-tested after pouring, typically to twice its WLL; sling standards call for 2 to 2.5 times the rated load.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'wire-rope-sockets-terminals',
      label: 'Wire rope sockets and terminals',
      blurb: 'Open and closed spelter sockets and swage terminals.',
    },
    {
      type: 'related_articles',
      slugs: ['wire-rope-eye-terminations', 'wire-rope-thimble-types', 'wire-rope-construction-explained', 'wire-rope-clips-installation'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Socket data from The Crosby Group’s published catalogue and termination manual; wedge socket orientation also from SafeWork NSW. The socket and filler maker’s instructions govern.',
    },
    {
      type: 'cta_block',
      heading: 'Need sockets for pendants or guys?',
      body: 'Tell us the rope diameter and construction and what the end connects to. We will quote open or closed spelter sockets to suit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
