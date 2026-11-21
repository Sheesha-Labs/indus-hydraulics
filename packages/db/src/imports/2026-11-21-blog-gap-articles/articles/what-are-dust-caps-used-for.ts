import type { BlogArticleSeed } from '../shared'

/**
 * What dust caps are used for, on hydraulic and industrial couplings. Facts are from the live
 * dust-caps-plugs shelf: materials (rubber, nitrile, elastomer, vinyl, PVC, plastic, polypropylene,
 * aluminium, brass, steel, stainless steel, plated malleable iron), size ranges (caps 1/8" to 6", plugs
 * 1/8" to 8"), caps described as nipple protectors and plugs as coupler protectors, tethers / chains /
 * stainless bead-chain lanyards, and caps and plugs listed for ISO 7241-1 Series A, ISO-B and ISO 16028
 * flush-face couplings, cam and groove and screw-to-connect couplings. Standards named: ISO 7241-1,
 * ISO 16028, ISO 5675 (agricultural couplers), ISO 4406 (cleanliness code, no figures quoted). No
 * pressure rating is given for any cap because no listing publishes one. No brand or series is named.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'what-are-dust-caps-used-for',
  title: 'What are dust caps used for? Caps and plugs for hydraulic couplings and hose ends',
  excerpt:
    'A dust cap keeps dirt, water and knocks off an open connection while it is disconnected. On a hydraulic quick coupler the cap covers the male nipple and the plug closes the female coupler. Here is what each does, which material suits which job, and how to match one to the coupling.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'What Are Dust Caps Used For? Hydraulic Caps and Plugs',
  seoDescription:
    'What dust caps are used for on hydraulic couplers and hose ends: caps vs plugs, rubber, plastic and metal, tethers, and matching the coupling interchange.',
  focusKeyword: 'what are dust caps used for',
  publishedAt: '2026-11-21T09:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are dust caps used for?',
      answer:
        'Dust caps cover an open connection, such as a quick coupler half, a hose end or a port, while it is disconnected. They keep dirt, sand and water out of the hydraulic system and protect the sealing faces and valve from knocks. On quick couplers the cap goes over the male nipple and the dust plug goes into the female coupler.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A dust cap is contamination control for the moment a connection is open. Whatever sits on an uncovered coupler face goes into the oil the next time it is connected.',
        'On quick couplers, the cap covers the male half (the nipple) and the plug goes into the female half (the coupler). Naming varies, so match the cap or plug to the coupling half, not just the name.',
        'Rubber, vinyl and plastic caps are quick to fit and cheap. Aluminium, brass and steel caps last longer on site and on screw-to-connect couplers.',
        'A cap must match the coupling interchange, for example ISO 7241-1 Series A, ISO-B, ISO 16028 flush face or cam and groove, and the body size.',
        'A dust cap is not a pressure closure. Blank a line that may be pressurised with a rated cap or plug fitting, not a dust cap.',
      ],
    },
    {
      type: 'lead',
      html: 'The cheapest part on a hydraulic machine is often the one missing. Dust caps go astray within weeks on most sites, and nobody notices until a coupler starts to leak or a valve sticks. The cap is there because an open coupling is the easiest way for dirt to get into a clean system. This article covers what caps and plugs do, the materials, and how to order one that fits. The rest of the job is covered in <a href="/blog/contamination-during-a-hose-change">contamination during a field hose change</a>.',
    },

    { type: 'section_head', number: '/01', title: 'What a dust cap does.', anchor: 'what-it-does' },
    {
      type: 'paragraph',
      html: 'A disconnected coupler half has its valve and seal face open to the air. On a tractor, excavator or skid steer that means dust, sand, mud and wash water. When the coupling is next connected, anything on the faces is pushed into the oil, where it scores pumps and valves and raises the system’s ISO 4406 cleanliness code. A cap or plug stops that at the source. It also protects the parts that make the seal: a dented nipple or a damaged poppet will not seal, and a cap takes the knock instead.',
    },
    {
      type: 'paragraph',
      html: 'So are dust caps necessary? On anything that is connected and disconnected in the field, yes. Couplings on attachments, implements and test points are opened often, and a missing cap is one of the easiest causes of contamination to fix. The same applies to new hose assemblies and components in transit, covered in <a href="/blog/dirt-ingress-in-transit-and-storage">dirt ingress in transit and storage</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Dust caps and dust plugs.', anchor: 'caps-vs-plugs' },
    {
      type: 'paragraph',
      html: 'The two names describe which half they protect. A dust cap fits over a male end: the nipple of a quick coupling, or a male thread. A dust plug fits into a female end: the coupler (socket) of a quick coupling, or a female port. The listings on our <a href="/c/dust-caps-plugs">dust caps and plugs</a> shelf follow that convention: caps described as nipple protectors, plugs as coupler protectors. Not every maker does, and some sell a combined cap/plug, so check which half it fits before ordering.',
    },
    {
      type: 'paragraph',
      html: 'Some caps and plugs come with a strap, chain or lanyard so they stay with the coupling. One of our listings carries a stainless steel bead chain lanyard; others come with a chain or a tether strap with a hanging hole. A tethered cap is the one most likely to still be there next month.',
    },

    { type: 'section_head', number: '/03', title: 'Materials.', anchor: 'materials' },
    {
      type: 'comparison_table',
      caption: 'Dust cap and plug materials on our live listings',
      columns: ['Material', 'Typical use', 'Notes'],
      rows: [
        { cells: ['Rubber, nitrile, elastomer', 'Push-on caps and plugs for hydraulic quick couplers', 'Quick to fit, flexible; the agricultural caps on our shelf are elastomer'] },
        { cells: ['Vinyl, PVC, plastic', 'Push-on plugs, test-point caps, coloured caps', 'Light and low cost; colour can mark the circuit'] },
        { cells: ['Polypropylene', 'Cam and groove caps and plugs', 'Light; does not corrode'] },
        { cells: ['Aluminium', 'Screw-to-connect and wing-style couplers, cam and groove', 'Durable on site; some come with a lanyard'] },
        { cells: ['Brass', 'Thread-to-connect couplers, cam and groove', 'Durable; often with a chain'] },
        { cells: ['Steel, stainless steel, plated malleable iron', 'Heavy-duty couplings, larger cam and groove sizes', 'For knocks and long service'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Sizes on the shelf run from 1/8 in to 6 in for caps and 1/8 in to 8 in for plugs, with the larger sizes in cam and groove. For the fitting itself, the choice is usually set by the coupling: rubber push-on caps for push-to-connect hydraulic couplers, metal caps for screw-to-connect couplers that will be dropped and dragged.',
    },

    { type: 'section_head', number: '/04', title: 'Matching the cap to the coupling.', anchor: 'matching' },
    {
      type: 'paragraph',
      html: 'A dust cap fits one coupling interchange and one body size. The common families are ISO 7241-1 Series A (the usual general-purpose and agricultural profile), ISO 7241-1 Series B, ISO 16028 flush face, screw-to-connect couplers and cam and groove. Agricultural tractor couplers are often ordered to ISO 5675. Find the interchange first; <a href="/blog/hydraulic-quick-couplers-iso-7241">quick couplers: ISO 7241 A, B and flat-face</a> explains how to tell them apart, and cam and groove sizes are in <a href="/blog/cam-and-groove-coupling-types">cam and groove coupling types</a>.',
    },
    {
      type: 'paragraph',
      html: 'Examples from the range: <a href="/p/parker-6600-series-rubber-dust-caps-plugs">rubber caps and plugs for ISO 7241-1 Series A couplings</a>, <a href="/p/dixon-dqc-h-series-dust-cap-plugs">nitrile ISO-B caps and plugs</a> from 1/2 in to 1-1/4 in, <a href="/p/dixon-dqc-ht-series-dust-plugs">nitrile plugs for ISO 16028 flush-face couplers</a>, <a href="/p/dixon-ws-series-dust-caps">aluminium wing-style caps with a bead chain lanyard</a> and <a href="/p/dixon-dust-caps">cam and groove and threaded dust caps</a> up to 6 in.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A dust cap does not hold pressure.',
      body: 'Unless the listing gives a pressure rating, treat a dust cap or plug as a cover, not a seal. Do not use one to blank a line or port that may be pressurised. Relieve the pressure before disconnecting, and use a rated cap or plug fitting where a line has to be closed.',
    },
    {
      type: 'paragraph',
      html: 'Searches for dust caps also turn up tyre valve caps and loudspeaker dust caps. A tyre valve cap does the same job on a smaller scale, keeping grit out of the valve core. A loudspeaker dust cap, the dome compared with a phase plug, is a different part entirely. We supply caps and plugs for hydraulic and industrial couplings only.',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'prose',
      html: '<p>Indus quotes and ships dust caps and plugs from Dubai, UAE, with the couplings or on their own. Send:</p><ul><li>The coupling interchange (ISO 7241-1 A or B, ISO 16028 flush face, screw-to-connect, cam and groove) and the body size.</li><li>Which half: cap for the male nipple, plug for the female coupler, or both.</li><li>Material preference: rubber, plastic, aluminium, brass or steel.</li><li>Whether you want a tether, chain or lanyard.</li><li>Quantities, and a photo of the coupling if you are unsure of the interchange.</li></ul><p>See the full range on the <a href="/c/dust-caps-plugs">dust caps and plugs</a> shelf.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is the difference between dust caps and plugs?',
          answer:
            'A dust cap fits over a male end, such as a quick coupling nipple or male thread. A dust plug fits into a female end, such as the coupler half or a port. Some makers sell a combined cap/plug.',
        },
        {
          question: 'Are dust caps necessary on hydraulic couplers?',
          answer:
            'Yes, on any coupling that is disconnected in the field. An uncovered coupler collects dirt and water, which go into the oil the next time it is connected, and the cap also protects the sealing faces from damage.',
        },
        {
          question: 'Will any dust cap fit my coupler?',
          answer:
            'No. A cap fits one interchange and one body size. Identify the coupling standard, for example ISO 7241-1 Series A, ISO-B or ISO 16028 flush face, and the size before ordering.',
        },
        {
          question: 'Which dust caps are best for hydraulic quick couplers?',
          answer:
            'Rubber or plastic push-on caps are quick and cheap for push-to-connect couplers. Aluminium, brass or steel caps last longer on screw-to-connect couplers and in rough site conditions. A tether or chain stops them being lost.',
        },
        {
          question: 'Is there a dust cap size chart?',
          answer:
            'Caps are sized by the coupling body size, not a separate chart. Our listings run from 1/8 in to 6 in for caps and 1/8 in to 8 in for plugs, each shown against the coupling it fits.',
        },
        {
          question: 'Can a dust cap be used to seal a pressurised line?',
          answer:
            'No, unless the listing gives a pressure rating. A dust cap is a cover. Use a rated cap or plug fitting to blank a line that may be under pressure.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Dust caps and plugs',
      skus: [
        'IH-PAR-6600-SERIES-CAPS',
        'IH-DIX-DQC-H-SERIES-DUST-CAP-PLUGS',
        'IH-DIX-DQC-HT-SERIES-DUST-PLUGS',
        'IH-DIX-WS-SERIES-DUST-CAPS',
        'IH-DIX-AG-SERIES-DUST-CAPS',
        'IH-DIX-DUST-PLUGS',
      ],
    },
    {
      type: 'category_link',
      slug: 'dust-caps-plugs',
      label: 'Dust caps and plugs',
      blurb: 'Rubber, plastic and metal caps and plugs for quick couplers, cam and groove and threaded hose ends, 1/8 in to 8 in.',
    },
    {
      type: 'related_articles',
      slugs: ['contamination-during-a-hose-change', 'dirt-ingress-in-transit-and-storage', 'hydraulic-quick-couplers-iso-7241', 'mini-excavator-hose-maintenance'],
    },
    {
      type: 'cta_block',
      heading: 'Lost the caps on your couplers?',
      body: 'Tell us the coupling interchange, size and which half needs covering. We will quote matching caps and plugs from Dubai, with tethers if you want them.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
