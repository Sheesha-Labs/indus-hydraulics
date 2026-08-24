import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-fitting-make-up-torque',
  title: 'How tight is tight: make-up torque and turns from finger tight',
  excerpt:
    'Nobody carries a torque wrench up a boom. The method that works without one is a published one, it is specific to each connector family, and it is the reason two fitters get different results on the same joint.',
  categorySlug: 'hose-assembly',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic fitting torque — FFFT method by connector type',
  seoDescription:
    'How tight a hydraulic fitting should be: why torque figures vary by manufacturer, how the turns-from-finger-tight method works, and what over-tightening does to each seat type.',
  focusKeyword: 'hydraulic fitting torque',
  publishedAt: '2026-08-24T17:36:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'There is no universal torque table. Figures are published by the fitting manufacturer, and they differ with plating, seal type and whether the thread was lubricated.',
        'Turns from finger tight (FFFT) exists because it removes friction from the equation — friction is what makes torque unreliable in the field.',
        'Finger tight has a definition: metal-to-metal contact, wrench not yet applied. Getting that starting point wrong invalidates the count.',
        'Over-tightening does not produce a better seal on any family. On a cone it flattens the seat, on an O-ring joint it extrudes the seal.',
        'Always use two wrenches. Torquing a fitting without backing up the port body twists the adapter beneath it.',
      ],
    },
    {
      type: 'lead',
      html: 'The most consequential number in hose work is the one nobody writes down. It varies by family, by size, by plating, by whether there is a drop of oil on the thread — and because a joint that is slightly loose and a joint that is badly over-tightened both leak, the feedback a fitter gets is ambiguous in exactly the wrong direction.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Why we are not publishing a torque table.',
      anchor: 'no-table',
    },
    {
      type: 'paragraph',
      html: 'It would be the most-visited page on this site and it would be wrong on somebody’s machine. Torque figures are <strong>a property of the specific fitting, not of the thread size</strong>. Two ORFS fittings of the same dash size from different makers, one zinc-nickel and one plain, carry different figures because friction differs — and torque is a proxy for clamp load, not a measurement of it.',
    },
    {
      type: 'comparison_table',
      caption: 'What changes the correct torque for the same nominal size',
      columns: ['Variable', 'Effect'],
      rows: [
        {
          cells: [
            'Plating and surface finish',
            'Changes friction, and therefore the torque needed for the same clamp load',
          ],
          highlight: true,
        },
        {
          cells: [
            'Lubricated or dry thread',
            'A lubricated thread reaches the same load at lower torque — often much lower',
          ],
          highlight: true,
        },
        { cells: ['Seat type', 'A cone, a face O-ring and a bonded seal all load differently'] },
        { cells: ['Material', 'Stainless and steel fittings of the same size differ'] },
        {
          cells: [
            'New or previously used',
            'A seat that has been made up before behaves differently',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Where to get the number.',
      body: 'The catalogue or installation sheet for the fitting brand you are actually holding. Failing that, the machine manufacturer service manual for that port. A figure from a chart found online, attached to no brand, is a guess with a decimal point in it.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The method that works without a torque wrench.',
      anchor: 'ffft',
    },
    {
      type: 'paragraph',
      html: 'Turns from finger tight — FFFT, sometimes counted in flats of the nut — is what manufacturers publish for field assembly. It works because <strong>a turn is a distance, and distance is what actually loads a joint.</strong> Friction changes how much torque a turn costs, but not how far the nut travelled.',
    },
    {
      type: 'decision_tree',
      heading: 'Using FFFT correctly',
      intro: 'The method is simple and the errors are all in the setup.',
      branches: [
        {
          condition: 'Establish finger tight properly',
          outcome:
            'Thread the nut on by hand until metal meets metal and it will not turn further by hand.',
          detail:
            'Not "until it feels snug with a wrench" and not "until it stops spinning freely". A count that starts from the wrong place ends in the wrong place.',
        },
        {
          condition: 'Mark the starting position',
          outcome: 'A line across the nut and the adapter with a marker pen.',
          detail:
            'This is what makes the count auditable afterwards, and it is what lets a second person check the joint without breaking it.',
        },
        {
          condition: 'Turn the published amount for that family and size',
          outcome: 'Counted in flats or in fractions of a turn, from the manufacturer sheet.',
          detail:
            'The figure is smaller for larger sizes on cone connections. Do not carry a number across from one size to another.',
        },
        {
          condition: 'Back up the port body throughout',
          outcome: 'Two wrenches, always.',
          detail:
            'One wrench transmits the whole make-up torque into whatever is beneath the fitting — usually an adapter that then loosens or shears.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What over-tightening does, family by family.',
      anchor: 'over-tightening',
    },
    {
      type: 'comparison_table',
      caption: 'The damage is different in each case, and permanent in most',
      columns: ['Connection', 'What over-tightening does', 'Recoverable?'],
      rows: [
        {
          cells: [
            'JIC 37 degree',
            'Flattens and spreads the cone; can crack the nut',
            'No — replace both halves',
          ],
          highlight: true,
        },
        {
          cells: [
            'ORFS',
            'Extrudes the face O-ring out of its groove',
            'Sometimes, with a new O-ring — inspect the groove',
          ],
        },
        {
          cells: [
            'O-ring boss',
            'Crushes the O-ring against the spotface, or bottoms the thread',
            'Usually, with a new O-ring',
          ],
        },
        {
          cells: [
            'BSPP with bonded seal',
            'Squeezes the bonded washer out from under the head',
            'Yes, with a new bonded seal',
          ],
        },
        {
          cells: [
            'NPT / BSPT',
            'Wedges and splits the female port',
            'No — the port is the expensive half',
          ],
          highlight: true,
        },
        {
          cells: [
            'SAE flange',
            'Cocks the head and pinches the O-ring',
            'Yes, if the port face is undamaged',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Tapered threads have no natural stop.',
      body: 'A cone or O-ring joint tells you when it is home. A tapered pipe thread keeps accepting turns until something breaks, which is why NPT ports crack far more often than any other connection on a machine. This is the one family where a torque figure or a turn count matters more than feel, not less.',
    },
    {
      type: 'direct_answer',
      question: 'How tight should a hydraulic fitting be?',
      answer:
        'To the torque published by the fitting manufacturer for that exact part, or — where a torque wrench cannot be used — the published number of turns or flats from finger tight for that family and size. Finger tight means metal-to-metal contact by hand before any wrench is applied. Always back up the port body with a second wrench, and never treat over-tightening as insurance: it damages every seat type rather than improving the seal.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Re-making a joint that has been apart.',
      anchor: 're-making',
    },
    {
      type: 'comparison_table',
      caption: 'Second and subsequent assemblies',
      columns: ['Situation', 'What to do'],
      rows: [
        {
          cells: [
            'Cone connection, seats undamaged',
            'Re-make to the same figure; inspect the cone first',
          ],
        },
        {
          cells: ['Any joint with a soft seal', 'Fit a new seal. Reused O-rings have taken a set'],
          highlight: true,
        },
        {
          cells: ['Tapered thread', 'Strip old sealant completely and re-seal from clean'],
          highlight: true,
        },
        {
          cells: [
            'Joint that was previously over-tightened',
            'Replace the fitting rather than re-make it',
          ],
        },
        { cells: ['Split flange', 'New O-ring, cross-pattern torque in stages'] },
      ],
    },
    {
      type: 'standard_citation',
      standard: 'SAE J514',
      publisher: 'SAE International',
      title: 'Hydraulic Tube Fittings',
      summary:
        'Defines the dimensions of the 37 degree flare and related fitting families. It governs the geometry of the connection; assembly torque figures are published by fitting manufacturers against their own parts, which is why a torque value must be traced to a brand rather than to this standard.',
    },
    {
      type: 'standard_citation',
      standard: 'SAE J1273',
      publisher: 'SAE International',
      title: 'Recommended Practices for Hydraulic Hose Assemblies',
      summary:
        'Covers selection, routing, assembly and inspection of hose assemblies, including installation practice such as avoiding twist and using two wrenches. The reference to reach for when writing an internal procedure for hose work.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-fittings',
      label: 'Hose fittings by thread type',
      blurb: 'Supplied with the manufacturer assembly data.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'The part that shears when only one wrench is used.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I just tighten until it stops weeping?',
          answer:
            'That approach finds the leak threshold on the way to damaging the seat, and it gives no warning when it passes it. Set the joint correctly the first time; if it then weeps, the fault is the sealing surface, not the torque.',
        },
        {
          question: 'Should I put oil on the threads before assembly?',
          answer:
            'Only if the manufacturer figure assumes a lubricated thread — otherwise the same torque produces a much higher clamp load. Where lubrication is specified, follow it exactly, including which surfaces.',
        },
        {
          question: 'What does FFFT mean?',
          answer:
            'Turns from finger tight: you bring the joint to metal-to-metal contact by hand, mark it, then rotate the published amount for that family and size. It removes friction from the equation, which is why it works in the field.',
        },
        {
          question: 'Is a torque wrench worth carrying on a service van?',
          answer:
            'For large sizes and for flange work, yes. For most field hose changes the marked FFFT method is faster and more repeatable than a torque wrench used at an awkward angle.',
        },
        {
          question: 'Why do two fitters get different results on the same joint?',
          answer:
            'Friction. Different plating, a trace of oil, a different wrench length and a different feel for finger tight all change the torque reached. That is exactly the variance the turn-count method is designed to remove.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Deliberately carries no torque values. Take those from the catalogue for the fitting in your hand.',
    },
    {
      type: 'cta_block',
      heading: 'Ask for the assembly data with the parts.',
      body: 'When we supply fittings we can supply the manufacturer torque and turn figures for them. Ask at the point of order and it comes with the delivery rather than after the leak.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
