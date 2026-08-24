import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'split-female-quick-coupler',
  title: 'What splits a female coupler half',
  excerpt:
    'A cracked female coupler body is not a manufacturing defect and it is not bad luck. It is almost always one of three things, and two of them are avoidable for nothing.',
  categorySlug: 'failure-analysis',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Cracked female hydraulic quick coupler — causes',
  seoDescription:
    'Why the female half of a hydraulic quick coupler splits: pressure spikes against a closed poppet, water freezing or thermal expansion in a disconnected line, and fatigue from forced connection.',
  focusKeyword: 'quick coupler cracked female',
  publishedAt: '2026-08-24T18:51:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The female half is thin-walled where the locking balls sit, and that is where it splits.',
        'Cause one: pressure applied against a closed poppet with the coupler disconnected. The circuit sees no flow, so nothing warns the operator.',
        'Cause two: trapped fluid expanding — thermally in Gulf conditions, or by water freezing where that applies.',
        'Cause three: fatigue from repeated forced connection, which deforms the ball track long before it cracks.',
        'A split female half means the male half and the circuit both need checking. It rarely fails alone.',
      ],
    },
    {
      type: 'lead',
      html: 'It arrives at the counter as a coupler with a clean longitudinal crack down one side, usually with the customer convinced they were sold a bad part. They almost never were. The female body carries a groove for the locking balls, and that groove is the thinnest section in the whole assembly — so whatever pressure the coupler was subjected to found it.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Pressure against a closed poppet.',
      anchor: 'closed-poppet',
    },
    {
      type: 'paragraph',
      html: 'This is the most common cause and the least obvious. With the coupler disconnected, the poppet closes and the line is sealed. If the operator then works the control lever, <strong>the pump delivers into a dead end.</strong> There is no flow, so there is no noise, no heat and no movement to warn anyone — and the pressure at the coupler goes to whatever the relief valve allows, which may be far above what the coupler is rated to hold statically in that condition.',
    },
    {
      type: 'comparison_table',
      caption: 'How it usually happens',
      columns: ['Scenario', 'Why nobody notices'],
      rows: [
        {
          cells: [
            'Attachment removed, auxiliary lever bumped',
            'No attachment to move, so nothing looks wrong',
          ],
          highlight: true,
        },
        {
          cells: ['Auxiliary circuit left in detent', 'The lever stays where it was put'],
          highlight: true,
        },
        {
          cells: [
            'Testing a circuit with the coupler capped',
            'Deliberate, and the rating is easy to overlook',
          ],
        },
        {
          cells: [
            'Machine transported with a control locked',
            'It happens on the truck, not on site',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Dust caps are not pressure caps.',
      body: 'A plastic dust cap keeps dirt out and nothing else. If a circuit must be pressurised with the coupler disconnected, it needs a proper rated plug, and the relief setting needs to be within the coupler static rating.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Trapped fluid with nowhere to go.',
      anchor: 'trapped-fluid',
    },
    {
      type: 'paragraph',
      html: 'A disconnected coupler seals a fixed volume. Oil expands as it warms, and it is very nearly incompressible, so <strong>the expansion appears as pressure instead of as volume.</strong> In the Gulf, an attachment lying in direct sun on a dark yard surface goes through a large temperature swing across a working day. Where equipment operates in freezing conditions, water that has found its way into a coupler cavity does the same thing far more violently when it turns to ice.',
    },
    {
      type: 'comparison_table',
      caption: 'Reading the crack',
      columns: ['What you see', 'Most likely cause'],
      rows: [
        {
          cells: [
            'Clean longitudinal split at the ball groove',
            'Overpressure — poppet closed against pump or thermal expansion',
          ],
          highlight: true,
        },
        { cells: ['Bulged body before it split', 'Sustained overpressure rather than a spike'] },
        {
          cells: ['Deformed ball track, sleeve stiff, then cracked', 'Repeated forced connection'],
          highlight: true,
        },
        {
          cells: [
            'Cracked with corrosion in the fracture face',
            'The crack was there for some time before it let go',
          ],
        },
        { cells: ['Male half also damaged', 'Forced connection, or the pair was mismatched'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Fatigue from being forced.', anchor: 'fatigue' },
    {
      type: 'paragraph',
      html: 'A coupler that will not connect is usually holding trapped pressure, and the common response is a hammer. That does not just risk injury — it deforms the ball track and the sleeve, and from then on <strong>the locking balls sit in a distorted groove and concentrate load where the section is thinnest.</strong> The crack that appears months later is attributed to the coupler, and it was caused in the yard by a mallet.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A cracked coupler under pressure is a projectile risk.',
      body: 'If a female half fails while connected and pressurised, the two halves separate under load and the fluid is released as a jet. Take a cracked coupler out of service immediately — do not keep using it because it is not leaking yet.',
    },
    {
      type: 'direct_answer',
      question: 'Why did the female half of my hydraulic quick coupler crack?',
      answer:
        'Almost always overpressure at the thinnest section, where the locking ball groove is machined. The three causes are: pressure applied against the closed poppet while the coupler is disconnected, which produces no flow and therefore no warning; fluid trapped in the disconnected line expanding as it warms, or freezing where that applies; and fatigue from repeatedly forcing a coupler that would not connect, which deforms the ball track first and cracks later.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Stopping it happening again.',
      anchor: 'prevention',
    },
    {
      type: 'comparison_table',
      caption: 'What actually prevents it',
      columns: ['Measure', 'Which cause it addresses'],
      rows: [
        {
          cells: [
            'Neutral the auxiliary control before disconnecting, and leave it there',
            'Pressure against a closed poppet',
          ],
          highlight: true,
        },
        { cells: ['Store attachments and loose hoses in shade', 'Thermal expansion'] },
        {
          cells: [
            'Fit rated plugs, not dust caps, where a circuit stays pressurised',
            'Pressure against a closed poppet',
          ],
        },
        {
          cells: [
            'Pressure-eliminator or screw-to-connect couplers',
            'Forced connection and trapped pressure together',
          ],
          highlight: true,
        },
        { cells: ['Replace couplers as matched pairs', 'Mismatch and uneven ball loading'] },
        {
          cells: [
            'Retire any coupler that has been hammered',
            'Fatigue, before it becomes a crack',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'quick-couplers',
      label: 'Hydraulic quick couplers',
      blurb: 'Matched pairs, including pressure-eliminator designs.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Attachment assemblies, built and tagged.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Was I sold a defective coupler?',
          answer:
            'Occasionally, but rarely. A clean split at the ball groove is the signature of overpressure at the thinnest section, and the three ways that pressure arises are all things that happen in service.',
        },
        {
          question: 'It is cracked but not leaking. Can I finish the shift?',
          answer:
            'No. A cracked pressure-carrying part can separate under load, and the failure mode is a jet of fluid and two halves parting. Replace it.',
        },
        {
          question: 'Should I replace both halves?',
          answer:
            'Yes. Whatever cracked one half loaded the other, and a mismatched replacement is how the next failure starts.',
        },
        {
          question: 'Is this more common in the UAE than elsewhere?',
          answer:
            'The thermal expansion route is, because surface temperatures on equipment standing in direct sun are far above air temperature. The freezing route is not relevant here.',
        },
        {
          question: 'Would a higher-rated coupler solve it?',
          answer:
            'It raises the threshold without addressing the cause. If pressure is being applied against a closed poppet, the right fix is the procedure and the plug, not a stronger part to break later.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Failure signatures as seen across returned couplers at our own counter.',
    },
    {
      type: 'cta_block',
      heading: 'Send us the failed half.',
      body: 'The fracture face usually says which of the three causes it was, and that decides whether you need a different coupler or a different procedure. We will tell you which.',
      quoteLabel: 'Ask about a failure',
    },
  ],
}

export default ARTICLE
