import type { BlogArticleSeed } from '../shared'

/**
 * Sources for every figure: interchange profiles, body sizes, end connections, valving, locking type,
 * seal material, temperature range and per-row psi ratings from the live listings on
 * industrial-interchange-fittings (first 60 of 186 products reviewed). ISO 6150 named as the standard
 * for cylindrical pneumatic quick-action couplings; its type letters are mapped only for the industrial
 * profile, which is widely published as ISO 6150 B. No flow figures are given: only one listing row
 * carries one and it is not representative. No profile is claimed for the catalogue beyond what the
 * listings name (industrial, ARO 210, ARO 310 interchange, automotive / Tru-Flate, Schrader, Bowes).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pneumatic-quick-coupler-types',
  title: 'Pneumatic quick coupler types: industrial, ARO, automotive and Euro profiles, and why they do not mix',
  excerpt:
    'An air coupler only connects to a plug of the same profile. How industrial interchange, ARO 210, automotive (Tru-Flate) and European profiles differ, how to tell them apart, and what body size, valving and locking mean when you order.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pneumatic Quick Coupler Types and Profiles',
  seoDescription:
    'Pneumatic quick coupler types: industrial interchange, ARO 210, automotive Tru-Flate and Euro profiles, why plugs do not mix, and how to identify yours.',
  focusKeyword: 'pneumatic quick coupler types',
  publishedAt: '2026-11-21T11:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the types of pneumatic quick coupler?',
      answer:
        'Pneumatic quick couplers are grouped by plug profile. The common ones are industrial interchange (Milton M-style, ISO 6150 B), ARO 210, automotive (Tru-Flate) and the European profile. Each coupler accepts only its own plug, even at the same nominal size, so identify the profile before you buy a single half.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The profile is the shape of the plug nose: its diameter, length and the position of the groove the locking balls drop into. Two plugs of the same 1/4" body size but different profiles will not lock.',
        'Industrial interchange is the most common profile on workshop air in many markets. ARO 210 and automotive (Tru-Flate) are close in size and are the ones most often mixed up.',
        'Body size and thread size are separate. A 1/4" body coupler can have a 3/8" NPT thread, so state both.',
        'Couplers (sockets) are usually valved and shut off when disconnected; plugs (nipples) usually are not. The listings state which.',
        'Rated pressure is per part. Most pneumatic rows on our shelf give 250 or 300 psi; check the row for the size you order.',
      ],
    },
    {
      type: 'lead',
      html: 'A plug that goes into a coupler but will not latch, or latches and then blows out, is nearly always a profile mismatch. The halves look alike, and catalogues use different names for the same profile. This article sorts out the profiles, how to identify the one on your air line, and what else to specify. Everything here is about compressed-air couplers. Hydraulic couplers follow a different set of standards, covered in <a href="/blog/hydraulic-quick-couplers-iso-7241">ISO 7241 A, B and flat-face quick couplers</a>. The couplers we list are on the <a href="/c/industrial-interchange-fittings">pneumatic and industrial interchange couplers</a> shelf.',
    },
    { type: 'section_head', number: '/01', title: 'The profiles.', anchor: 'profiles' },
    {
      type: 'paragraph',
      html: 'A pneumatic coupler holds the plug with a ring of locking balls that drop into a groove on the plug nose, under a spring-loaded sleeve. The profile fixes where that groove sits and how wide the nose is. ISO 6150 standardises cylindrical quick-action couplings for pneumatics and defines more than one plug profile; the industrial interchange profile is the one widely published as ISO 6150 B. The other common profiles are trade names that became generic.',
    },
    {
      type: 'comparison_table',
      caption: 'Common pneumatic coupler profiles and what our shelf lists',
      columns: ['Profile', 'Also called', 'Where you meet it', 'On our shelf'],
      rows: [
        { cells: ['Industrial interchange', 'Milton M-style, ISO 6150 B, I/M type', 'General workshop and plant air', 'Yes: sleeve-lock and push-to-connect couplers, hose barb and push-lock plugs'], highlight: true },
        { cells: ['ARO 210', 'A-style', 'Plants and tool fleets that standardised on that profile', 'Yes: automatic couplers with male NPTF or hose barb, and plugs'] },
        { cells: ['ARO 310 interchange', '3/8" ARO', 'Larger 3/8" body air tools', 'Yes: 3/8" body plugs listed as ARO 310 interchange'] },
        { cells: ['Automotive', 'Tru-Flate, T-style', 'Garages, tyre and body shops', 'Yes: sleeve-lock couplers with hose barb and push-lock barb'] },
        { cells: ['European', 'Euro, 7.2 mm', 'Machinery and workshops across Europe', 'Not named on the listings; ask'] },
        { cells: ['Schrader and Bowes', 'Named interchanges', 'Specific tool fleets and older systems', 'Yes: Schrader couplers and Bowes-style plugs'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Some couplers are sold as multi-profile and accept two or three plug types. Treat that as a property of a particular part, stated on its listing, not something to assume. If a listing does not name the profiles it takes, it takes one.',
    },
    { type: 'section_head', number: '/02', title: 'Why they do not mix.', anchor: 'mixing' },
    {
      type: 'paragraph',
      html: 'Within a body size the profiles are close enough that a wrong plug will often enter the coupler. What fails is the lock. If the groove is in the wrong place, the balls either cannot drop or sit on the edge of the groove, and the plug can blow out under pressure, taking the hose with it. If the nose is the wrong diameter, the coupler seal does not seal and the joint leaks, or the valve in the coupler is not pushed open far enough and the tool starves. Mixing profiles on one site is the usual cause: a contractor’s hose with one profile on a plant line with another. Pick one profile per site, and change any odd plugs on tools as they come in.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Disconnect without pressure where you can',
      body: 'A plug held only on the edge of its groove can release suddenly. If a plug does not click home, or comes out with the sleeve still forward, stop using that pair. Vent the line before you disconnect a hose that is whipping or will not release.',
    },
    { type: 'section_head', number: '/03', title: 'How to identify your profile.', anchor: 'identify' },
    {
      type: 'paragraph',
      html: 'The plug is easier to identify than the coupler. Three checks, in order:',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Look for a marking.</strong> Many plugs and couplers carry a letter or a series name on the body or the sleeve. The coupler is usually marked more clearly than the plug.</li><li><strong>Compare against a known plug.</strong> Hold the unknown plug beside a plug of known profile and the same body size. Industrial plugs have a shorter nose with the groove close to a wide front shoulder; automotive plugs have a longer, slimmer nose; ARO 210 plugs are slimmer than industrial with a short nose. The difference is visible side by side, though not on its own.</li><li><strong>Measure it.</strong> With a caliper, take the nose diameter in front of the groove and the distance from the tip to the groove. Send both with a photo against a ruler and we match the profile.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Then read the body size and the connection. The listings give both: for example an <a href="/p/dixon-m-series-aro-pneumatic-automatic-male-threaded-couplers">ARO 210 automatic coupler with male NPTF</a> comes in a 1/4" body with a 1/4" or 3/8" thread, and in 3/8" and 1/2" thread versions in steel. Body size decides which plugs fit; the thread decides what it screws into.',
    },
    { type: 'section_head', number: '/04', title: 'Coupler, plug, valving and locking.', anchor: 'options' },
    {
      type: 'paragraph',
      html: 'The coupler, also called the socket or female half, carries the locking mechanism and usually a valve that shuts the air off when the plug is removed. The plug, also called the nipple or male half, is usually unvalved, so it is the half fitted to the tool. Our listings state this per part. The <a href="/p/parker-20-series-couplers-hose-barb">industrial-profile hose barb couplers</a> are listed as valved and sleeve-locked, in steel with nitrile seals and a -40°F to +250°F range, while the matching ARO-profile nipple listing is unvalved.',
    },
    {
      type: 'paragraph',
      html: 'Locking comes in two kinds. A sleeve-lock coupler needs the sleeve pulled back to insert the plug. A push-to-connect or automatic coupler takes the plug with one hand and only needs the sleeve moved to release it. The shelf also lists manual and automatic sockets, one-way sockets and sleeve-guard sockets that shield the sleeve from accidental release. End connections run to male and female NPTF, BSPP on some brass couplers, hose barb and push-lock barb. The <a href="/p/parker-10-series-couplers-hose-barb">automotive-profile (Tru-Flate) hose barb couplers</a> and the <a href="/p/dixon-push-lock-hose-plugs">industrial push-lock hose plugs</a> are typical hose-end parts. For pressure, read the row: most pneumatic rows on these listings give 250 or 300 psi, and a few hose-end rows give more. Browse the full range on the <a href="/c/industrial-interchange-fittings">pneumatic and industrial interchange couplers</a> shelf.',
    },
    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'order' },
    {
      type: 'prose',
      html: '<ul><li>The profile, if known, or a photo of the plug against a ruler with the nose diameter and tip-to-groove distance.</li><li>Coupler, plug or both, and how many of each.</li><li>Body size and end connection: thread type and size, or hose ID for a barb.</li><li>Valved or unvalved, sleeve-lock or push-to-connect, and any need for a sleeve guard.</li><li>Body material (brass, steel or stainless) and the working pressure.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is industrial interchange the same as Milton M-style?',
          answer: 'Yes, they are names for the same profile, also published as ISO 6150 B and called I/M type. A plug of this profile fits any industrial interchange coupler of the same body size.',
        },
        {
          question: 'Will an automotive (Tru-Flate) plug fit an industrial coupler?',
          answer: 'No. It may enter, but the groove and nose do not match, so it will not lock reliably and can blow out under pressure. Use plugs and couplers of one profile.',
        },
        {
          question: 'What size pneumatic quick coupler do I need?',
          answer: 'Two sizes matter. The body size, commonly 1/4", 3/8" or 1/2", sets flow and which plugs fit. The thread or barb size sets what it connects to. They are often different, for example a 1/4" body with a 3/8" NPT thread.',
        },
        {
          question: 'What is the difference between a coupler and a plug?',
          answer: 'The coupler, or socket, is the female half with the locking sleeve and usually a shut-off valve. It goes on the supply side. The plug, or nipple, is the male half that goes on the tool or hose end. Most plugs are unvalved.',
        },
        {
          question: 'Can I use a pneumatic coupler for hydraulics?',
          answer: 'No. Pneumatic couplers on our shelf are rated in the low hundreds of psi. Hydraulic couplers are a different family with their own standards and much higher ratings; see our article on ISO 7241 quick couplers.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Pneumatic couplers and plugs by profile',
      skus: [
        'IH-PAR-20-SERIES-COUPLERS-HOSE-BARB',
        'IH-DIX-PUSH-LOCK-HOSE-PLUGS',
        'IH-DIX-M-SERIES-ARO-PNEUMATIC-AUTOMATIC-MALE-THREADED-CO',
        'IH-ZSI-310-SERIES-PLUGS-3-8-INCH',
        'IH-PAR-10-SERIES-COUPLERS-HOSE-BARB',
        'IH-PAR-E-Z-MATE-SERIES-COUPLERS-HOSE-BARB',
      ],
    },
    {
      type: 'category_link',
      slug: 'industrial-interchange-fittings',
      label: 'Pneumatic and industrial interchange couplers',
      blurb: 'Air couplers and plugs in industrial, ARO, automotive, Schrader and Bowes profiles, with threaded, barb and push-lock ends.',
    },
    {
      type: 'related_articles',
      slugs: ['hydraulic-quick-couplers-iso-7241', 'universal-air-couplings-explained', 'push-to-connect-air-fittings', 'compressed-air-hose-selection'],
    },
    {
      type: 'cta_block',
      heading: 'Matching air couplers to your fleet?',
      body: 'Send the profile, or a photo and two caliper readings of the plug, with body size and end connection. We quote and ship from Dubai, UAE, and match plugs and couplers before they leave.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
