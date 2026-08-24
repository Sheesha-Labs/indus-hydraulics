import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'photographing-a-hydraulic-fitting',
  title: 'Photographing a fitting so someone can identify it without holding it',
  excerpt:
    'Four photographs and one measurement identify almost any hydraulic fitting remotely. Most requests arrive with one photograph taken at arm’s length, and that one settles nothing.',
  categorySlug: 'fitting-identification',
  authorSlug: 'sunil-patel',
  seoTitle: 'How to photograph a hydraulic fitting for identification',
  seoDescription:
    'The four angles that let a supplier identify a hydraulic fitting from photographs: end face square on, profile against a rule, thread with a gauge, and the assembly in place.',
  focusKeyword: 'identify hydraulic fitting photo',
  publishedAt: '2026-08-24T17:52:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The end face square on is the most important photograph. The seat is what separates families that share a thread.',
        'Put something of known size in every frame. A steel rule beats a coin, and a coin beats nothing.',
        'Photograph the profile against a rule so the cone angle and the seat depth are visible.',
        'A thread gauge and a caliper in the frame turn an opinion into a measurement.',
        'One photograph of the fitting still on the machine tells us the port type, which is half the answer.',
      ],
    },
    {
      type: 'lead',
      html: 'Fitting identification is a solved problem when the part is in your hand and a coin-flip when it is not. The gap between those two is almost entirely photography — which angles, what is in frame, and what got left out. This is the list we would ask for anyway, so sending it first saves a day.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The four photographs.',
      anchor: 'four-photographs',
    },
    {
      type: 'comparison_table',
      caption: 'What each one settles',
      columns: ['Photograph', 'How to take it', 'What it settles'],
      rows: [
        {
          cells: [
            'End face, square on',
            'Camera directly down the bore, fitting flat, good light',
            'Seat type and gender — the single most decisive image',
          ],
          highlight: true,
        },
        {
          cells: [
            'Profile, against a steel rule',
            'Side on, rule touching the fitting, markings legible',
            'Cone angle, seat depth, hex size, overall proportion',
          ],
          highlight: true,
        },
        {
          cells: [
            'Thread, close',
            'Close enough to count threads over a known length',
            'Pitch, and whether it is parallel or tapered',
          ],
        },
        {
          cells: [
            'In place on the machine',
            'Before removal, showing the port and the routing',
            'Port type, orientation, and why it failed',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Square on means square on.',
      body: 'A photograph taken at even twenty degrees off axis foreshortens the seat and makes a 37 degree cone look like a 45, or an O-ring groove disappear entirely. Rest the fitting on a flat surface, hold the phone directly above it, and check the image before sending it.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What to put in the frame.',
      anchor: 'in-the-frame',
    },
    {
      type: 'comparison_table',
      caption: 'Scale references, best to worst',
      columns: ['Reference', 'Verdict'],
      rows: [
        {
          cells: ['Steel rule with millimetre markings', 'Best — gives dimensions directly'],
          highlight: true,
        },
        {
          cells: [
            'Caliper set on the measurement, display visible',
            'Best for thread diameter, and removes any doubt',
          ],
          highlight: true,
        },
        {
          cells: [
            'Thread pitch gauge engaged on the thread',
            'Settles pitch, which settles the family in most cases',
          ],
        },
        { cells: ['A coin', 'Adequate — tell us which coin'] },
        { cells: ['A hand', 'Poor, but far better than no reference at all'] },
        { cells: ['Nothing', 'The photograph cannot be used for sizing'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two measurements are worth taking even if the photographs are perfect: <strong>the thread outside diameter for a male fitting, or inside diameter for a female, and the pitch.</strong> Those two numbers plus a clear view of the seat will identify the great majority of fittings without further discussion.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The things people leave out.',
      anchor: 'commonly-missed',
    },
    {
      type: 'comparison_table',
      caption: 'Each of these costs a round trip',
      columns: ['Missing detail', 'Consequence'],
      rows: [
        {
          cells: ['The other end of the assembly', 'Half the part cannot be quoted'],
          highlight: true,
        },
        {
          cells: [
            'The layline on the hose',
            'Grade, size and often the pressure rating are printed there and legible in a photograph',
          ],
          highlight: true,
        },
        {
          cells: [
            'Elbow orientation',
            'The angle between the two ends decides whether it will route',
          ],
        },
        { cells: ['Overall length', 'Cut length cannot be derived from a photograph'] },
        {
          cells: [
            'Whether the seat is damaged',
            'Changes the diagnosis from supply to failure analysis',
          ],
        },
        {
          cells: [
            'Which machine and circuit',
            'Lets us sanity-check the specification rather than copy it',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Clean it first.',
      body: 'A fitting caked in oil and sand photographs as a smooth grey object. Thirty seconds with a rag and some solvent turns an unidentifiable image into an obvious one, and it is the difference between a same-day answer and a conversation.',
    },
    {
      type: 'direct_answer',
      question: 'How do I photograph a hydraulic fitting so it can be identified?',
      answer:
        'Take four photographs: the end face square on with the camera directly down the bore, the profile against a steel rule, a close view of the thread with a pitch gauge or caliper if you have one, and the fitting in place on the machine before removal. Clean the part first, keep something of known size in every frame, and send the thread diameter and pitch as numbers if you can measure them.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'A worked example of a good request.',
      anchor: 'worked-example',
    },
    {
      type: 'comparison_table',
      caption: 'What a request that gets priced first time looks like',
      columns: ['Item', 'Example'],
      rows: [
        { cells: ['Photographs', 'End face, profile against rule, thread close, on the machine'] },
        { cells: ['Measurements', 'Thread OD 22.0 mm, pitch 1.5 mm'] },
        {
          cells: ['Hose detail', 'Layline photograph, overall length 780 mm face to face'],
          highlight: true,
        },
        {
          cells: [
            'Both ends',
            'Straight one end, 90 degree elbow the other, elbow pointing away from the boom',
          ],
        },
        { cells: ['Context', 'Excavator boom cylinder feed, failed after eight months'] },
        { cells: ['Quantity', 'Two, one for the shelf'] },
      ],
    },
    {
      type: 'category_link',
      slug: 'hydraulic-fittings',
      label: 'Hose fittings by thread type',
      blurb: 'Once it is identified, the family it belongs to.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'For when the answer is that the port and the hose are different families.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can you identify a fitting from one photograph?',
          answer:
            'Sometimes, if it is square on to the end face and something of known size is in the frame. More often one photograph narrows it to two families that need a measurement to separate.',
        },
        {
          question: 'I do not have a caliper or a thread gauge. Is that a problem?',
          answer:
            'No. Photograph the fitting against a steel rule, square on and in focus, and count threads across a marked distance. That gets close enough to confirm against a table.',
        },
        {
          question: 'What if there are no markings on the fitting at all?',
          answer:
            'That is the normal case. Fittings are identified by geometry — thread diameter, pitch, seat form and angle — rather than by markings. Absence of markings changes nothing about the method.',
        },
        {
          question: 'Should I send the fitting instead?',
          answer:
            'If it is convenient, yes, and it removes all doubt. Photographs exist so you do not have to wait for a courier to find out what you need.',
        },
        {
          question: 'Does a phone camera give enough detail?',
          answer:
            'Easily, with light and a steady hand. Wipe the part, use daylight or a work lamp rather than the flash, tap to focus on the seat, and check the image is sharp before you send it.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Based on what our own counter has to ask for when a photographed request cannot be answered.',
    },
    {
      type: 'cta_block',
      heading: 'Send the photographs and we will tell you what it is.',
      body: 'Identification is free and it does not oblige you to buy anything. If we are not the right supplier for the part, we will say so and point you at what it is called.',
      quoteLabel: 'Send a photograph',
    },
  ],
}

export default ARTICLE
