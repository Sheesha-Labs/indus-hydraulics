import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'stopping-an-npt-thread-leak',
  title: 'Stopping an NPT leak: tape, sealant, or neither',
  excerpt:
    'A tapered thread seals on the thread itself, which is why it needs help. Every other connector on the machine seals somewhere else, which is why putting tape on it makes the leak worse.',
  categorySlug: 'specification-standards',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'NPT thread leaking — tape or sealant, and where neither belongs',
  seoDescription:
    'Why an NPT joint leaks, whether to use PTFE tape or anaerobic sealant, how far back to start the wrap, and the four connector families where adding either one guarantees a leak.',
  focusKeyword: 'npt thread leaking hydraulic',
  publishedAt: '2026-08-24T17:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'NPT seals on the flanks of the thread itself. Nothing else on a hydraulic machine does, which is why NPT is the only connection on it that wants a sealant.',
        'Anaerobic liquid sealant is the better choice on a hydraulic circuit. PTFE tape shreds, and the shreds end up downstream in a valve.',
        'If you use tape anyway: start two threads back from the end, wrap in the direction the fitting will turn, and never let it overhang the first thread.',
        'Never put tape or sealant on JIC, ORFS, flare, or an O-ring boss. They seal on a cone, a face or an O-ring, and the sealant holds the seat apart.',
        'A joint that leaks after three attempts is usually a damaged or over-tightened port, not a sealant problem.',
      ],
    },
    {
      type: 'lead',
      html: 'Two ports on the same manifold can look almost identical and want opposite treatment. Getting that wrong is the most common cause of a leak that will not go away no matter how hard it is tightened — and tightening harder is what turns a weep into a cracked port.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Where the seal actually happens.',
      anchor: 'where-the-seal-happens',
    },
    {
      type: 'paragraph',
      html: 'Every leak argument on a hydraulic machine resolves the moment you answer one question: <strong>what surface is doing the sealing?</strong> A tapered pipe thread is the odd one out. It wedges metal against metal along a helical path that is never continuous, so it needs something in the gaps. Everything else has a dedicated sealing surface, and a sealant on the thread only stops that surface from meeting.',
    },
    {
      type: 'comparison_table',
      caption: 'What seals, and what that means for sealant',
      columns: ['Connection', 'Sealing surface', 'Tape or sealant?'],
      rows: [
        {
          cells: [
            'NPT / NPTF, BSPT',
            'The thread flanks themselves',
            'Yes — sealant, or tape if nothing else is available',
          ],
          highlight: true,
        },
        { cells: ['JIC 37 degree', 'The metal cone', 'No — never'] },
        { cells: ['ORFS', 'A face O-ring', 'No — never'] },
        {
          cells: [
            'O-ring boss (ORB, SAE J1926)',
            'An O-ring against the port spotface',
            'No — never',
          ],
        },
        { cells: ['BSPP with bonded seal', 'The bonded washer under the head', 'No — never'] },
        { cells: ['SAE split flange', 'An O-ring in the flange head groove', 'No — never'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A parallel thread that has been taped will still leak.',
      body: 'BSPP looks close enough to BSPT that people treat them the same. It is parallel, it seals on a bonded washer or an O-ring, and tape on the threads does nothing except make the fitting feel tight before it is seated. If tape appears to be helping a parallel thread, the seal it should have had is missing.',
    },

    { type: 'section_head', number: '/02', title: 'Sealant or tape.', anchor: 'sealant-or-tape' },
    {
      type: 'paragraph',
      html: 'On a hydraulic circuit the answer is anaerobic liquid sealant, and the reason is contamination rather than sealing performance. <strong>Tape does not dissolve, does not filter out, and does not stay where it was put.</strong> A shred that reaches a proportional valve is a fault that presents weeks later and looks nothing like a plumbing mistake.',
    },
    {
      type: 'comparison_table',
      caption: 'The practical difference',
      columns: ['Property', 'Anaerobic sealant', 'PTFE tape'],
      rows: [
        {
          cells: ['Debris risk', 'None once cured', 'Shreds on assembly and on removal'],
          highlight: true,
        },
        {
          cells: ['Lubrication during make-up', 'Yes, which is why torque feels different', 'Yes'],
        },
        { cells: ['Tolerates a marginal thread', 'Better — it fills', 'Worse — it bridges'] },
        { cells: ['Disassembly', 'Breaks free with heat if needed', 'Easy'] },
        { cells: ['Cure time before pressure', 'Follow the product data sheet', 'None'] },
        {
          cells: ['Right choice for hydraulics', 'Yes', 'Only if nothing else is on the van'],
          highlight: true,
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'NPTF is not an invitation to skip sealant.',
      body: 'Dryseal NPTF is machined so the thread crests deform into the roots and can seal without a compound. In practice it is specified alongside a sealant on hydraulic pressure lines anyway, because the deformation only works reliably on a first assembly with an undamaged mating thread. Treat "dryseal" as a tolerance class, not a licence.',
    },

    { type: 'section_head', number: '/03', title: 'If you are using tape.', anchor: 'using-tape' },
    {
      type: 'decision_tree',
      heading: 'Wrapping tape so it does not end up in the oil',
      intro:
        'Four rules. Every one of them exists because of a specific failure that turns up later.',
      branches: [
        {
          condition: 'Where to start the wrap',
          outcome: 'Two full threads back from the leading edge.',
          detail:
            'Tape overhanging the first thread is the piece that gets sheared off into the port on assembly. This single rule prevents most tape contamination.',
        },
        {
          condition: 'Which direction',
          outcome:
            'The direction the fitting turns as it tightens — clockwise, viewed from the open end.',
          detail:
            'Wrapped the other way, the tape unwinds and bunches ahead of the thread instead of bedding into it.',
        },
        {
          condition: 'How many wraps',
          outcome: 'Two to three for a fine thread, three to four for a coarse one. Not eight.',
          detail:
            'Excess tape acts as a wedge. The joint feels tight several turns early, seals briefly, and splits the female port on the next thermal cycle.',
        },
        {
          condition: 'Re-using a previously taped fitting',
          outcome: 'Strip every trace of the old tape first.',
          detail:
            'Fresh tape over old tape is the most reliable way to produce a joint that leaks and cannot be diagnosed by looking at it.',
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Should I use PTFE tape or thread sealant on a hydraulic fitting?',
      answer:
        'Use anaerobic thread sealant on tapered threads — NPT, NPTF and BSPT — because PTFE tape sheds fragments that end up in valves and pumps. Use neither on JIC, ORFS, O-ring boss, BSPP with a bonded seal, or SAE flange connections: those seal on a cone, a face or an O-ring, and any compound on the thread holds the sealing surface apart.',
    },

    { type: 'section_head', number: '/04', title: 'When it still leaks.', anchor: 'still-leaking' },
    {
      type: 'comparison_table',
      caption: 'Third attempt, still weeping',
      columns: ['What you see', 'Most likely cause', 'What to do'],
      rows: [
        {
          cells: [
            'Weeps at the same clock position',
            'Damaged or scored female thread',
            'Inspect the port; the male fitting is rarely the problem',
          ],
        },
        {
          cells: [
            'Leaks only when hot',
            'Thread bottomed rather than wedged',
            'Check engagement depth against the port standard',
          ],
        },
        {
          cells: [
            'Sealed, then wept after a week',
            'Tape wedge relaxing, or sealant not cured before pressure',
            'Strip, clean, re-make with sealant and observe cure time',
          ],
          highlight: true,
        },
        {
          cells: [
            'Port face is cracked or bulged',
            'Over-tightening',
            'Stop. The port needs repair or replacement, not another turn',
          ],
          highlight: true,
        },
        {
          cells: [
            'Fitting turns with no increase in resistance',
            'Stripped thread',
            'Replace the fitting and inspect the port',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Do not chase a pressurised leak with a wrench.',
      body: 'Tightening a joint under pressure is how people are injured by fluid injection. A pinhole stream from a hydraulic circuit penetrates skin without a visible wound and is a surgical emergency. Relieve the pressure, then work on the joint.',
    },
    {
      type: 'standard_citation',
      standard: 'ASME B1.20.1',
      publisher: 'ASME',
      title: 'Pipe Threads, General Purpose (Inch)',
      summary:
        'Defines the NPT thread form, taper and gauging practice. It specifies the geometry of the thread — it does not specify a sealant, which is why sealing practice comes from the fitting manufacturer rather than from the thread standard.',
    },
    {
      type: 'standard_citation',
      standard: 'ASME B1.20.3',
      publisher: 'ASME',
      title: 'Dryseal Pipe Threads (Inch)',
      summary:
        'Defines NPTF dryseal threads, where crest-to-root interference is intended to seal without a compound. Relevant here because it is the source of the belief that a tapered thread never needs sealant — a belief that holds for a first assembly of two undamaged dryseal parts and not much further.',
    },
    {
      type: 'category_link',
      slug: 'npt-adapters',
      label: 'NPT adapters',
      blurb: 'Straights, elbows and reducers, with the thread standard stated.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters by thread type',
      blurb: 'Every family, so you can convert a port instead of fighting it.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I use PTFE tape on a JIC fitting to stop it weeping?',
          answer:
            'No. A JIC joint seals on the 37 degree cone. Tape on the thread stops the cone seating fully, so it converts a small leak into a permanent one. A weeping JIC is a damaged seat, a mismatched seat angle, or insufficient make-up.',
        },
        {
          question: 'How many wraps of tape are correct?',
          answer:
            'Two to three on a fine thread, three to four on a coarse one, always starting two threads back from the end. If more than that seems necessary, the thread or the port is damaged and more tape will not fix it.',
        },
        {
          question: 'Is thread sealant safe with hydraulic oil?',
          answer:
            'Anaerobic thread sealants formulated for hydraulic and pneumatic service are compatible with mineral oil once cured. Check the data sheet for fluid compatibility and cure time before pressurising, especially with fire-resistant or synthetic fluids.',
        },
        {
          question: 'The port is NPT but the fitting is BSPT. Will sealant make that work?',
          answer:
            'No. The thread angles and pitches differ, so the flanks never make continuous contact. It may hold at low pressure for a while, which is the dangerous part. Convert the port properly with an adapter.',
        },
        {
          question: 'Why do some workshops ban PTFE tape entirely?',
          answer:
            'Because of contamination. Tape fragments do not dissolve and are not caught by every filter, and a fragment in a servo or proportional valve is an expensive fault that looks unrelated to the joint that caused it.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Thread standards checked against the published designations. Sealing practice reflects our own workshop policy.',
    },
    {
      type: 'cta_block',
      heading: 'Send a photograph of the port.',
      body: 'Most repeat leaks turn out to be a mismatched pair rather than a sealant problem, and that is visible from one square-on photograph of the port and the fitting. We will tell you which family you are looking at.',
      quoteLabel: 'Ask about a fitting',
    },
  ],
}

export default ARTICLE
