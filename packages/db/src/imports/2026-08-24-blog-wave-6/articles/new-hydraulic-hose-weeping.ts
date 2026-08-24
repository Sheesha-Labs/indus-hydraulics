import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'new-hydraulic-hose-weeping',
  title: 'Why a new hose assembly weeps, and what to check before blaming the crimp',
  excerpt:
    'A hose fitted this morning is damp by the afternoon. The crimp is the last thing to suspect, not the first — and there are five checks ahead of it that take a minute each.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'New hydraulic hose leaking at the fitting — what to check first',
  seoDescription:
    'A new hose assembly weeping at the connection is almost never a bad crimp. The order to check: seat damage, seat angle mismatch, missing O-ring, contamination, make-up, then crimp diameter.',
  focusKeyword: 'new hydraulic hose leaking',
  publishedAt: '2026-08-24T17:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A weep at the union nut is a sealing-surface problem. A weep at the ferrule is a crimp problem. They are different faults and the first is far more common.',
        'Check where the oil is actually coming from before anything else — wipe the assembly dry and pressurise it briefly.',
        'A 37 degree nut will thread onto a 45 degree seat and will never seal. The threads match; the cones do not.',
        'ORFS leaks at a new joint are usually a missing, pinched or wrong-size face O-ring.',
        'If the crimp really is at fault, the assembly leaks between the ferrule and the hose cover, and it usually fails rather than weeps.',
      ],
    },
    {
      type: 'lead',
      html: 'The instinct is to blame whoever made the hose. Sometimes that is right. Far more often the assembly is fine and the joint it was screwed into is not — and because the fault is at the machine end rather than the hose end, replacing the hose again produces exactly the same weep.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'First: find out which end of the joint is leaking.',
      anchor: 'locate-the-leak',
    },
    {
      type: 'paragraph',
      html: 'Oil tracks along a hose and pools somewhere convenient, which is almost never where it came from. <strong>Wipe the whole assembly and both connections completely dry, run the circuit briefly, then look before the oil has time to travel.</strong> Everything below depends on getting this right.',
    },
    {
      type: 'comparison_table',
      caption: 'Where it appears against what it means',
      columns: ['Oil appears', 'What is leaking', 'Section below'],
      rows: [
        {
          cells: [
            'At the union nut, between nut and port',
            'The sealing surface',
            'Sections 02 to 04',
          ],
          highlight: true,
        },
        { cells: ['Between the ferrule and the hose cover', 'The crimp', 'Section 05'] },
        {
          cells: [
            'Through the hose cover itself, away from the ends',
            'The hose — pinhole or permeation',
            'Not a fitting fault at all',
          ],
        },
        {
          cells: [
            'From the port body, around its own threads',
            'The port adapter, not your new hose',
            'Section 02',
          ],
        },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The seat is damaged, or it is the wrong seat.',
      anchor: 'the-seat',
    },
    {
      type: 'paragraph',
      html: 'This is the largest single cause. A metal cone seals by deforming slightly against its mate, so a scratch, a burr, or a previous over-tightening is permanent. <strong>A damaged seat cannot be sealed by tightening harder</strong> — that only spreads the damage into the mating cone as well, turning one bad part into two.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The 37 and 45 degree trap.',
      body: 'JIC 37 degree and SAE 45 degree flare share thread sizes in several dimensions. A 37 degree nut will thread happily onto a 45 degree seat, feel tight, and leak forever, because the two cones only touch on a single line. If a joint weeps no matter what you do, put a straight edge across the cone angle before doing anything else.',
    },
    {
      type: 'comparison_table',
      caption: 'What to look for on the seat',
      columns: ['Check', 'How', 'If it fails'],
      rows: [
        {
          cells: [
            'Radial scratch across the cone',
            'Fingernail across the seat',
            'Replace the fitting — polishing does not restore it',
          ],
          highlight: true,
        },
        {
          cells: [
            'Bright ring worn off centre',
            'Look at the contact witness mark',
            'The two cones are different angles',
          ],
        },
        {
          cells: [
            'Flattened or spread cone tip',
            'Compare against a new fitting',
            'Previous over-tightening; replace both halves',
          ],
        },
        {
          cells: [
            'Pitting or corrosion',
            'Wipe clean and look under light',
            'Replace; pits are leak paths',
          ],
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The O-ring is missing, pinched, or the wrong one.',
      anchor: 'o-ring',
    },
    {
      type: 'paragraph',
      html: 'ORFS and O-ring boss connections carry a soft seal that does all the work. New assemblies arrive with it fitted; it then falls into the tray, gets rolled out of its groove during assembly, or gets replaced from a generic kit with something a size out. <strong>An ORFS joint torqued perfectly with no O-ring leaks immediately and looks exactly like a crimp failure to anyone standing back from it.</strong>',
    },
    {
      type: 'comparison_table',
      caption: 'Soft-seal faults and how they present',
      columns: ['Fault', 'How it presents'],
      rows: [
        {
          cells: ['O-ring absent', 'Steady leak from the moment of first pressure'],
          highlight: true,
        },
        {
          cells: [
            'O-ring pinched on assembly',
            'Weeps, and a piece of the ring is visible at the joint edge',
          ],
        },
        { cells: ['Wrong size from a generic kit', 'Seals cold, weeps warm'] },
        {
          cells: [
            'Wrong material for the fluid',
            'Seals for days or weeks, then swells or hardens',
          ],
          highlight: true,
        },
        {
          cells: [
            'Reused ring from the old assembly',
            'Takes a set, then weeps after the first heat cycle',
          ],
        },
      ],
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Contamination and make-up.',
      anchor: 'contamination-and-make-up',
    },
    {
      type: 'decision_tree',
      heading: 'The last two checks before the crimp',
      intro: 'Both are quick and both are common on a hose fitted in the field.',
      branches: [
        {
          condition: 'Was the seat clean when it was assembled?',
          outcome: 'Grit, paint or thread sealant on a metal cone holds it open.',
          detail:
            'Sand on a sealing face is a Gulf-specific version of this problem. Any compound on a seat that is not meant to have one produces the same result.',
        },
        {
          condition: 'Was the joint properly made up?',
          outcome: 'Under-tightening weeps; over-tightening destroys the seat and then weeps.',
          detail:
            'Both ends of the mistake produce a leak, which is why "it must not be tight enough" is such a costly assumption. Use the manufacturer torque figure, or turns from finger tight where a wrench cannot reach.',
        },
        {
          condition: 'Was the assembly under tension or twist when tightened?',
          outcome: 'A hose installed with a twist unloads through the nut.',
          detail:
            'Look at the layline. If it spirals, the assembly is fighting the joint every time the circuit pressurises.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'When it really is the crimp.',
      anchor: 'the-crimp',
    },
    {
      type: 'paragraph',
      html: 'A crimp fault does not usually weep politely at the union nut. It shows as oil emerging <strong>between the ferrule skirt and the hose cover</strong>, and it tends to progress quickly rather than sit at a steady drip. If that is what you have, stop using the assembly — an under-crimped fitting can release the hose entirely under pressure.',
    },
    {
      type: 'direct_answer',
      question: 'Why is my brand new hydraulic hose leaking at the fitting?',
      answer:
        'Most often the sealing surface, not the hose. Check in this order: which side of the joint the oil is actually coming from, damage to the metal seat, a mismatched seat angle such as a 37 degree nut on a 45 degree seat, a missing or pinched O-ring on ORFS and O-ring boss connections, contamination on the seat, and finally make-up torque. A genuine crimp fault leaks between the ferrule and the hose cover, not at the nut.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never find a leak with your hand.',
      body: 'A pinhole leak at hydraulic pressure produces a stream that penetrates skin without leaving an obvious wound, and injected hydraulic fluid is a surgical emergency that gets worse by the hour. Depressurise before inspecting, and use a piece of card rather than a finger to trace a suspected pinhole.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-fittings',
      label: 'Hose fittings by thread type',
      blurb: 'JIC, ORFS, BSP, metric and DIN, with dimensions published.',
    },
    {
      type: 'category_link',
      slug: 'seals-accessories',
      label: 'Seals and accessories',
      blurb: 'Face O-rings and bonded seals in the right sizes and materials.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'The joint weeps. Should I just tighten it more?',
          answer:
            'Once, gently, if it was clearly under-tightened. Beyond that you are damaging the seat, and a damaged seat cannot be recovered by tightening. If a modest nip does not stop it, take the joint apart and look at the sealing surfaces.',
        },
        {
          question: 'Can I put sealant on a JIC or ORFS fitting to stop a weep?',
          answer:
            'No. Those seal on a cone and a face O-ring respectively. Sealant on the thread holds the sealing surfaces apart and makes the leak permanent.',
        },
        {
          question: 'How do I tell 37 degree from 45 degree by eye?',
          answer:
            'Side by side it is obvious; alone it is not. Compare against a known fitting, or measure the seat diameter at the mouth against the thread size — a 45 degree flare has a visibly shallower cone for the same thread.',
        },
        {
          question:
            'The hose was fine for a week, then started weeping. Is that still an assembly fault?',
          answer:
            'Usually yes — a marginal seal that survived until the first proper heat cycle, or an O-ring of the wrong material starting to swell. A genuinely good joint does not begin weeping on its own.',
        },
        {
          question: 'The new hose is slightly too short. Does that cause leaks?',
          answer:
            'Yes. A hose under tension pulls on the sealing faces continuously and will unseat a joint that would otherwise hold. Length is a sealing issue, not only a routing one.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Fault ordering reflects what our own workshop finds when an assembly is returned as leaking.',
    },
    {
      type: 'cta_block',
      heading: 'If an assembly we built is weeping, tell us.',
      body: 'Send a photograph of the joint and of the layline. We will work out whether it is the assembly or the port it went into — and if it is ours, we will remake it.',
      quoteLabel: 'Report a hose fault',
    },
  ],
}

export default ARTICLE
