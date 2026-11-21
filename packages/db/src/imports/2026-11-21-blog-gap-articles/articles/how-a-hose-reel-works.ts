import type { BlogArticleSeed } from '../shared'

/**
 * How a lay flat hose reel works and how to wind one. Figures are live listing values from the
 * lay-flat-hose-reels-winders shelf: tractor-mounted reel (IH-LF-EHR) 2,000 ft / about 610 m of 6",
 * 3 to 10 hose lengths, hydraulic motor, 3-point hitch front or rear; portable motorised winder
 * (IH-LF-EPW) 6" to 12", up to 40 m per coil; 2" riser trailer (IH-LF-EWR1) 300 m with pump cable,
 * 400 mm core, 1,300 mm OD, 605 mm wide, up to 1,400 kg reel load, 5.5 kW winding motor, 8 kW diesel
 * generator; 8" riser system (IH-LF-EWR2) 150 m, swing arm over the well head; 3-point hitch hose
 * mover (IH-LF-EHM) with wheel guide. Winding practice (drain, flatten, start at the coupling end,
 * even tension, coupling protection) is general good practice. No capacity is given for any reel
 * or hose size the listings do not state.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-a-hose-reel-works',
  title: 'How a lay flat hose reel works, and how to wind one without damaging the hose',
  excerpt:
    'A lay flat hose reel is a powered drum that winds empty, flattened hose onto itself in a flat spiral and pays it back out. How the drum, drive and guide work, the main reel types, and the winding routine that keeps hose and couplings in service.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Wind a Hose Reel: Lay Flat Hose Reels Explained',
  seoDescription:
    'How to wind a hose reel and how a lay flat hose reel system works: drum, drive and guide, reel and winder types, draining, winding and storing the hose.',
  focusKeyword: 'how to wind a hose reel',
  publishedAt: '2026-11-21T10:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do you wind a hose reel?',
      answer:
        'Shut the pump down and release the pressure. Open the far end so the hose can drain, then fix the coupling end to the drum. Wind slowly under light, even tension, keeping the hose flat and centred so each wrap lies squarely on the last. Protect the couplings, secure the free end, and store the reel out of the sun.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A lay flat hose reel is a drum, a drive and a guide. The drum stores the hose, the drive turns it, and the guide keeps the hose running on straight.',
        'Lay flat hose winds in a flat spiral, so each wrap adds two hose thicknesses to the coil diameter. Capacity depends on the hose and the drum, not just the bore.',
        'Drives on our reels are tractor hydraulics, an electric motor, or an electric motor fed by an on-board generator.',
        'Drain the hose before winding. Water left inside adds weight, stretches the coil and stays trapped for the next job.',
        'Start at the coupling end, wind with even tension, and never let a coupling sit loose between wraps.',
      ],
    },
    {
      type: 'lead',
      html: 'Lay flat hose is fast to lay and slow to pick up by hand. A few hundred metres of 6" hose is heavy even when empty, and dragging it wears the cover. A reel turns that into a machine job. This article explains how a reel system works and how to wind hose onto one. For rolling hose by hand, read <a href="/blog/how-to-roll-and-store-lay-flat-hose">how to roll, recover and store lay flat hose</a>. Our reels and winders are on the <a href="/c/lay-flat-hose-reels-winders">hose reels and winding equipment</a> shelf.',
    },

    { type: 'section_head', number: '/01', title: 'How a hose reel system works.', anchor: 'how-it-works' },
    {
      type: 'prose',
      html: '<p>Every powered reel has the same three parts.</p><ul><li><strong>Drum.</strong> A core with side flanges. The core diameter sets how tightly the first wraps bend, and the flange diameter and width set how much hose fits. On our <a href="/p/well-riser-hose-winding-trailer-2-inch">2" well riser winding trailer</a> the reel has a 400 mm core, a 1,300 mm outside diameter and a 605 mm width, and carries up to 1,400 kg.</li><li><strong>Drive.</strong> Turns the drum to wind in and controls it while paying out. The <a href="/p/tractor-mounted-lay-flat-hose-reel">tractor-mounted reel</a> uses a high-torque hydraulic motor run from the tractor. The riser trailer has a 5.5 kW electric winding motor and its own 8 kW diesel generator, so it works at a well head with no site power.</li><li><strong>Guide.</strong> Feeds the hose onto the drum in line. On the 8" riser system it is a swing arm over the well head; on the hose mover it is a wheel.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Lay flat hose winds in a flat spiral, like a roll of tape. Each turn sits on the one before, and the coil grows by two hose thicknesses each time round. So the length a drum holds depends on how thick the flattened hose is, as well as the drum size. A heavy-wall hose of the same bore fills the drum sooner. That is why reel capacities are stated for one hose size and type, and should not be scaled to another.',
    },

    { type: 'section_head', number: '/02', title: 'Types of lay flat hose reel.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Reels and winders on our listings',
      columns: ['Type', 'Mounting and drive', 'Stated capacity', 'Typical use'],
      rows: [
        { cells: ['Tractor-mounted hose reel', '3-point hitch, front or rear; tractor hydraulics', '2,000 ft (about 610 m) of 6", 3 to 10 hose lengths', 'Slurry and manure transfer, irrigation'] },
        { cells: ['Portable motorised winder', 'Wheeled; motorised', '6" to 12" hose, up to 40 m per coil', 'Short runs: industry, farms, municipal, emergency'] },
        { cells: ['Well riser winding trailer, 2"', 'Road trailer; 5.5 kW motor, 8 kW diesel generator', '300 m of 2" riser hose with pump cable', 'Borehole pump installation and recovery'] },
        { cells: ['Riser hose winding system, 8"', 'Road trailer; powered reel, swing arm', '150 m of 8" riser hose', 'High-yield wells and dewatering bores'] },
        { cells: ['Hose mover', '3-point hitch; wheel guide', 'Not a storage reel', 'Moving long, heavy lines across a site'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'A field reel suits long supply lines that are laid and recovered often, as in <a href="/blog/irrigation-lay-flat-hose-guide">irrigation</a> and slurry work. A portable winder suits shorter coils that are moved between jobs. A riser reel is different again: it lowers a pump into a well on the hose and lifts it out, so it carries the pump cable alongside and has to hold the weight of the column. The <a href="/p/lay-flat-hose-mover">hose mover</a> does not store hose; it lifts and repositions a line without dragging it.',
    },

    { type: 'section_head', number: '/03', title: 'How to wind lay flat hose onto a reel.', anchor: 'winding' },
    {
      type: 'prose',
      html: '<ol><li><strong>Shut down and release pressure.</strong> Stop the pump, close the valves and vent the line. Never wind a hose that is still pressurised.</li><li><strong>Disconnect and drain.</strong> Uncouple both ends and open the far end. Lift the line or run along it so the water flows out. A full hose of large bore weighs many times more than the empty hose.</li><li><strong>Start at the coupling end.</strong> Fix the first coupling to the drum or its clamp so it cannot slip, with the hose leading straight off the drum.</li><li><strong>Keep it flat and centred.</strong> Feed the hose through the guide with no twist. A twisted hose winds as a lump, and the next wraps crease over it.</li><li><strong>Wind slowly, with even tension.</strong> Tight enough to stop the coil loosening, not so tight that the hose stretches or the drive drags it over the ground. Winding pushes any remaining water toward the open end; let it out.</li><li><strong>Protect the far coupling.</strong> Fit a cap or plug, and secure the free end so the coupling cannot swing against the coil or the frame in transport.</li><li><strong>Inspect as it comes in.</strong> Winding is the best time to see cuts, abrasion and soft spots. Mark damage and cut it out before the next job. <a href="/blog/how-to-repair-lay-flat-hose">How to repair lay flat hose</a> covers re-coupling.</li></ol>',
    },
    {
      type: 'paragraph',
      html: 'Paying out is the same in reverse. Lay the hose along its route at walking speed with the drive controlling the drum, not free-wheeling. Avoid dragging hose over sharp edges, and keep vehicles off it. Most damage to lay flat hose happens during handling, not pumping; <a href="/blog/why-lay-flat-hose-fails">why lay flat hose fails</a> sets out the causes.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Keep hands clear of a powered drum.',
      body: 'A powered reel can pull a hand or glove into the coil faster than the operator can stop it. Guide the hose from a distance, stop the drive before clearing a twist, and never step over a moving line.',
    },

    { type: 'section_head', number: '/04', title: 'Drying and storage on the reel.', anchor: 'storage' },
    {
      type: 'paragraph',
      html: 'Hose wound wet stays wet in the middle of the coil. For clean water that is mostly a weight and hygiene problem; for slurry, seawater or chemicals, rinse the hose before winding. Store reels in the shade or under a cover: sunlight and heat age the cover, and in the Gulf a reel left in the sun heats up well above the air temperature. <a href="/blog/lay-flat-hose-in-gulf-heat">Lay flat hose in Gulf heat</a> covers summer practice. Keep the reel off standing water and check the drive, bearings and guide before each season.',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'prose',
      html: '<p>Our reels and winders on the <a href="/c/lay-flat-hose-reels-winders">hose reels and winding equipment</a> shelf are built to order and quoted from Dubai, UAE. To specify one we need:</p><ul><li>Hose bore, type and wall (or the hose listing you use)</li><li>Total length to be stored, and the length of each section</li><li>The job: field supply, short transfer, or well riser with pump cable</li><li>Mounting and power: tractor 3-point hitch, trailer, site power, or none</li><li>Coupling type on the hose</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How does a hose reel system work?', answer: 'A drum stores the hose, a drive turns the drum to wind in or control pay-out, and a guide feeds the hose on straight. On a lay flat reel the empty hose flattens and builds up in a flat spiral.' },
        { question: 'What is a hose reel winding machine?', answer: 'A powered winder that rolls lay flat hose into a coil and lays it out again. Ours range from a wheeled, motorised winder for 6" to 12" hose to trailer reels for 2" and 8" well riser hose.' },
        { question: 'Can you use an air hose reel for water?', answer: 'Only if the reel’s maker rates its swivel and inlet for water. Air reels are built for round hose that stays connected while wound, and their swivel seals and metal parts may not suit water. Drain it after use either way. Lay flat reels are a different design: the hose is wound empty and disconnected.' },
        { question: 'How much hose does a lay flat reel hold?', answer: 'It depends on the hose wall as well as the bore and the drum. Our tractor reel holds about 610 m of 6" hose and the 2" riser trailer 300 m of riser hose with pump cable. For other hoses, send us the hose and we will check.' },
        { question: 'What types of hose reel are there?', answer: 'For lay flat hose: tractor-mounted reels, portable motorised winders and trailer-mounted riser reels. For round hose: wall-mounted and retractable reels, which keep the hose connected while it is wound.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Lay flat hose reels and winders',
      skus: ['IH-LF-EHR', 'IH-LF-EPW', 'IH-LF-EWR1', 'IH-LF-EWR2', 'IH-LF-EHM'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hose-reels-winders',
      label: 'Hose reels & winding equipment',
      blurb: 'Tractor-mounted reels, portable winders, well riser winding trailers and hose movers for lay flat hose.',
    },
    {
      type: 'related_articles',
      slugs: ['how-to-roll-and-store-lay-flat-hose', 'lay-flat-hose-guide', 'why-lay-flat-hose-fails', 'lay-flat-hose-in-gulf-heat'],
    },
    {
      type: 'cta_block',
      heading: 'Winding hose by hand?',
      body: 'Tell us the hose, the length and how you move it on site. We will propose a reel or winder and quote it from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
