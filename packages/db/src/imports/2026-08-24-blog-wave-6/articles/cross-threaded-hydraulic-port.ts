import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'cross-threaded-hydraulic-port',
  title: 'Cross-threaded or stripped port: repair it, insert it, or replace the block',
  excerpt:
    'What is recoverable depends on something most people never think about: whether that port seals on the thread or somewhere else. Get that question right and the decision makes itself.',
  categorySlug: 'failure-analysis',
  authorSlug: 'mehul-rana',
  seoTitle: 'Cross-threaded hydraulic port — what can actually be repaired',
  seoDescription:
    'A stripped or cross-threaded hydraulic port: how to assess the damage, why O-ring boss ports are more recoverable than tapered ones, and when a thread insert is not an acceptable repair.',
  focusKeyword: 'cross threaded hydraulic port',
  publishedAt: '2026-08-24T18:08:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'First question: does this port seal on the thread, or on an O-ring against a machined face?',
        'A tapered port seals on the thread itself, so thread damage is sealing damage. There is much less to recover.',
        'An O-ring boss port seals on the spotface. The thread only supplies clamp load, which widens the repair options.',
        'Cross-threading is caused at the start of assembly, not at the end. Start every fitting by hand, backwards, until it drops.',
        'A thread insert in a pressure port is a manufacturer decision, not a workshop one. Ask before fitting it.',
      ],
    },
    {
      type: 'lead',
      html: 'It happens in the first second of an assembly, usually with a fitting held at a slight angle in an awkward space, and it is discovered several turns later when something that should have been getting easier gets harder. What follows next is where the cost is decided, because the instinct — keep turning, it will straighten out — converts a marginal thread into a scrapped manifold.',
    },

    { type: 'section_head', number: '/01', title: 'Stop at the first sign.', anchor: 'stop-early' },
    {
      type: 'comparison_table',
      caption: 'What a cross-thread feels like, against normal resistance',
      columns: ['Symptom', 'Reading'],
      rows: [
        {
          cells: ['Resistance from the first turn', 'Cross-threaded, or the wrong thread entirely'],
          highlight: true,
        },
        {
          cells: [
            'Free, then suddenly tight well before seating',
            'Cross-threaded, or debris in the port',
          ],
          highlight: true,
        },
        {
          cells: [
            'Gets easier if you back it off and it will not restart',
            'Thread damage already done',
          ],
        },
        {
          cells: [
            'Turns freely all the way with no seating resistance',
            'Stripped, or a badly mismatched pair',
          ],
        },
        { cells: ['Smooth, gradual increase in resistance at the end', 'Normal'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The habit that prevents nearly all of this.',
      body: 'Start every fitting by hand, turning it backwards until you feel the thread start drop into place, then turn it forwards. It takes two seconds, it works in the dark and by feel alone, and it is the difference between a fitting and a manifold repair.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Which kind of port is it?',
      anchor: 'which-port',
    },
    {
      type: 'paragraph',
      html: 'This is the question that determines everything else. <strong>A port that seals on the thread has no margin for thread damage. A port that seals on a face has some.</strong> The same visible damage can be a scrapped casting in one case and a straightforward repair in the other.',
    },
    {
      type: 'comparison_table',
      caption: 'Sealing location against recoverability',
      columns: ['Port type', 'Where it seals', 'Outlook after thread damage'],
      rows: [
        {
          cells: [
            'NPT / BSPT tapered',
            'On the thread flanks',
            'Poor — the damaged surface is the sealing surface',
          ],
          highlight: true,
        },
        {
          cells: [
            'O-ring boss (SAE J1926, ISO 6149)',
            'O-ring against the machined spotface',
            'Better — thread supplies load only, spotface is what must be intact',
          ],
          highlight: true,
        },
        {
          cells: [
            'BSPP with bonded seal',
            'Bonded washer under the fitting head',
            'Better, provided the face and the first threads are sound',
          ],
        },
        {
          cells: [
            'SAE split flange port',
            'O-ring against the port face; bolts in tapped holes',
            'Often best — a damaged bolt hole is not the sealing path',
          ],
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The options, and what each one costs you.',
      anchor: 'options',
    },
    {
      type: 'decision_tree',
      heading: 'Working through the repair choice',
      intro: 'In increasing order of intervention. Stop at the first one that genuinely applies.',
      branches: [
        {
          condition: 'One or two damaged leading threads, face-sealing port, spotface intact',
          outcome: 'Chase the thread carefully and re-make with a new fitting and new seal.',
          detail:
            'Use a proper thread chaser rather than a cutting tap: a tap removes material and can convert a recoverable thread into an oversize one.',
        },
        {
          condition: 'Damage through the engagement length, but the component is removable',
          outcome: 'Take it to a machine shop and have the port assessed properly.',
          detail:
            'On a bench, with the component clean and the damage visible, the decision is far better informed than it is on the machine.',
        },
        {
          condition: 'Someone has suggested a thread insert',
          outcome: 'Check with the component manufacturer before fitting one.',
          detail:
            'A wire insert restores a thread but changes the load path and the effective seating geometry, and in a pressure port that is a design change rather than a repair. It may be acceptable; it is not your call to make unaided.',
        },
        {
          condition: 'Tapered port, damage into the sealing length',
          outcome: 'Assume the port is finished. Plan a component repair or replacement.',
          detail:
            'A tapered port that is holding after a repair is often holding on sealant alone, and it lets go later under thermal cycling.',
        },
        {
          condition: 'Cast aluminium housing, thread pulled out',
          outcome: 'Replacement is usually the honest answer.',
          detail:
            'Aluminium is where over-tightening does the most damage and where improvised repairs are least reliable.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A repaired pressure port is a safety decision.',
      body: 'If a port lets go at pressure, the fitting becomes a projectile and the fluid becomes an injection hazard. That is why manufacturer guidance matters here more than ingenuity — and why lifting equipment, access platforms and anything under an inspection regime should not carry an improvised port repair at all.',
    },
    {
      type: 'direct_answer',
      question: 'Can a cross-threaded hydraulic port be repaired?',
      answer:
        'It depends where the port seals. An O-ring boss or flange port seals on a machined face and the thread only provides clamp load, so light thread damage can often be chased and re-made with a new fitting and seal. A tapered NPT or BSPT port seals on the thread itself, so damage through the sealing length usually means replacing the component. Thread inserts in pressure ports should be confirmed with the component manufacturer rather than fitted as a workshop repair.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Before you re-assemble.',
      anchor: 'before-reassembly',
    },
    {
      type: 'comparison_table',
      caption: 'The checks that stop it happening twice',
      columns: ['Check', 'Why'],
      rows: [
        {
          cells: [
            'Confirm the fitting is the right thread for the port',
            'A large share of cross-threading is a mismatched pair, not clumsiness',
          ],
          highlight: true,
        },
        {
          cells: [
            'Clean every chip and particle out of the port',
            'Swarf from the damage is now loose in the circuit',
          ],
          highlight: true,
        },
        {
          cells: [
            'Inspect the spotface on a face-sealing port',
            'That surface, not the thread, is what has to be perfect',
          ],
        },
        {
          cells: [
            'Fit a new fitting, not the one that was cross-threaded',
            'Its thread is damaged too, and it will spread the damage',
          ],
        },
        {
          cells: [
            'Make up to the correct figure',
            'Over-tightening after a repair finishes what the cross-thread started',
          ],
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'The right thread family for the port, so it starts straight.',
    },
    {
      type: 'category_link',
      slug: 'seals-accessories',
      label: 'Seals and accessories',
      blurb: 'New O-rings and bonded seals for the re-make.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I just run a tap through it?',
          answer:
            'A cutting tap removes material and can turn a recoverable thread into an oversize one. A thread chaser, used carefully and squarely, is the tool for cleaning up a damaged thread — and only where the sealing surface is not the thread.',
        },
        {
          question: 'Is a wire thread insert acceptable in a hydraulic port?',
          answer:
            'Sometimes, and it is the component manufacturer who says so. It changes the load path and the seating geometry, which in a pressure application is a design question rather than a workshop one.',
        },
        {
          question: 'It seals now. Is it fixed?',
          answer:
            'Not necessarily. Marginal repairs on tapered ports commonly hold cold and start weeping after heat cycling. Re-inspect after the machine has been through a full working day.',
        },
        {
          question: 'How do I avoid cross-threading in a blind, awkward position?',
          answer:
            'Start the fitting by hand, turning backwards until the thread start drops in, then forwards. If you cannot get a hand to it, that is a sign to remove whatever is in the way rather than to start it with a wrench.',
        },
        {
          question: 'The fitting went in fine but the threads look different. Should I worry?',
          answer:
            'Yes. Two families can engage partially and feel acceptable while making contact on only part of the flank. Confirm the thread family before pressurising rather than after.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Assessment sequence as used by our own workshop. Repair acceptability always defers to the component manufacturer.',
    },
    {
      type: 'cta_block',
      heading: 'Send a photograph of the port before you decide.',
      body: 'A square-on photograph of the damaged thread and the spotface is usually enough to say whether it is recoverable. It costs nothing to ask, and it is a lot cheaper than a repair that fails.',
      quoteLabel: 'Ask about a port',
    },
  ],
}

export default ARTICLE
