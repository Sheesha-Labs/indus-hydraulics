import type { BlogArticleSeed } from '../shared'

/**
 * Rolling, recovering and storing lay flat hose. NFPA 1962 §4.6.5 and §4.7 storage rules (as quoted
 * in fire service sources); ozone and mildew from industry hose-care guidance. Rolling patterns
 * described generally, not attributed. Equipment facts from IH-LF-EPW / EHR / EHM / EWR1.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'how-to-roll-and-store-lay-flat-hose',
  title: 'How to roll, recover and store lay flat hose',
  excerpt:
    'Lay flat hose earns its name at the end of the job: drained and rolled, a kilometre of it fits on a pallet. Rolled badly or stored wet, it loses a season of life. How to drain and roll hose by hand and by machine, the roll patterns that make redeployment fast, and how to store it so it comes out ready to work.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'How to Roll and Store Lay Flat Hose (By Hand and Machine)',
  seoDescription:
    'How to recover, roll and store lay flat hose: draining, straight and double rolls, winders, tractor reels and hose movers, and storage rules — dry, out of sun, away from ozone, not stacked too high.',
  focusKeyword: 'how to roll lay flat hose',
  publishedAt: '2026-10-14T07:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Drain first: open the far end, lift the high points, and roll from the far end so the rolling pushes out what is left.',
        'Roll tight and straight with the coupling protected; a double roll puts both couplings on the outside for fast deployment.',
        'From 6" up, use a machine: a portable winder, a tractor reel or a hose mover saves crews and hose.',
        'Store clean and fully dry, out of direct sun, in a ventilated place, away from ozone sources such as electric motors.',
        'Do not stack coils so high that the bottom ones deform, and keep damaged hose tagged and apart.',
      ],
    },
    {
      type: 'lead',
      html: 'The advantage of lay flat over pipe is that it goes back on a pallet at the end of the job. But a hose rolled full of water is heavy and kinks; one rolled dirty grows mould; one stored in the sun ages twice as fast. Good recovery and storage costs a few minutes per length and adds seasons to the hose. This guide covers it from the end of pumping to the next deployment.',
    },

    { type: 'section_head', number: '/01', title: 'Draining the line.', anchor: 'draining' },
    {
      type: 'prose',
      html: '<ol><li><strong>Stop the pump and close the valves gradually.</strong></li><li><strong>Open the far end</strong> and any drain points, and let gravity empty what it can.</li><li><strong>Lift the high points</strong> and walk the water towards the low end.</li><li><strong>Disconnect</strong> into short lengths you can handle.</li><li><strong>Flush</strong> lines that carried slurry, seawater, sewage, concrete or fuel before rolling them.</li></ol>',
    },

    { type: 'section_head', number: '/02', title: 'Rolling by hand.', anchor: 'rolling' },
    {
      type: 'paragraph',
      html: 'Lay the length out straight and flat. For a <strong>straight roll</strong>, start at the far end and roll towards the coupling, keeping the edges aligned so the coil is tight and flat; rolling from the far end pushes the last water out ahead of the roll. Protect the coupling at the centre or outside so its thread or face cannot be damaged. For a <strong>double roll</strong>, fold the length in half and roll from the fold, so both couplings end up on the outside together — slower to make, faster to deploy, and the usual pattern for small fire and forestry hose. Whatever the pattern, use the one your crew deploys from.',
    },
    {
      type: 'direct_answer',
      question: 'How do you roll lay flat hose?',
      answer:
        'Drain it, lay it out straight, and roll it tightly from the far end towards the coupling with the edges aligned, so the rolling pushes out the last of the water. For fast deployment, fold it in half and roll from the fold so both couplings are on the outside. From 6" upwards, use a winder or reel.',
    },

    { type: 'section_head', number: '/03', title: 'Rolling by machine.', anchor: 'machines' },
    {
      type: 'paragraph',
      html: 'From about 6" upwards, rolling by hand takes several people and is hard on backs and on the hose. Three machines cover most work: a <a href="/p/portable-lay-flat-hose-winder">portable motorised winder</a> for 6" to 12" hose in lengths up to 40 m, wheeled to the hose end and back; a <a href="/p/tractor-mounted-lay-flat-hose-reel">tractor-mounted reel</a> that lays and recovers about 610 m of 6" hose from the tractor hydraulics; and a <a href="/p/lay-flat-hose-mover">hose mover</a> that lifts and relocates long lines between fields or work areas without dragging them over rough ground. For borehole risers, a <a href="/p/well-riser-hose-winding-trailer-2-inch">winding trailer</a> recovers hose, cable and pump together.',
    },

    { type: 'section_head', number: '/04', title: 'Storage.', anchor: 'storage' },
    {
      type: 'prose',
      html: '<ul><li><strong>Dry before storage.</strong> Hose rolled or boxed wet grows mould and mildew. NFPA 1962 requires fire hose to be drained and thoroughly dried before it is stored — good practice for all lay flat.</li><li><strong>Not on hot ground.</strong> Do not dry hose on hot pavement or in intense sun.</li><li><strong>Out of direct sunlight</strong>, in a ventilated store or under a shade canopy.</li><li><strong>Away from ozone sources</strong> — electric motors and high-voltage equipment — which age rubber.</li><li><strong>Away from fuels, chemicals and sharp objects</strong>, and protected from rodents.</li><li><strong>On pallets or racks</strong>, not stacked so high that the bottom coils deform.</li><li><strong>Tag damaged hose</strong> and keep it apart from ready stock until it is repaired and tested.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Hot climates.',
      body: 'In the Gulf, storage is where hose life is won or lost. Shade, pallets and dry coils matter more than anything done on the job — see lay flat hose in Gulf heat.',
    },
    {
      type: 'paragraph',
      html: 'Before the next deployment, inspect each coil: cover wear along the edges, cracking at old folds, coupling damage and seals. Rotate stock so the oldest hose is used first, and change the fold points when re-rolling fire hose so creases do not wear through in one place. See <a href="/blog/why-lay-flat-hose-fails">why lay flat hose fails</a> and <a href="/blog/how-to-repair-lay-flat-hose">how to repair lay flat hose</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Should lay flat hose be stored wet?', answer: 'No. Drain and dry it fully first; hose stored wet grows mould and mildew and the jacket can rot.' },
        { question: 'How do I roll large lay flat hose?', answer: 'With a machine — a portable winder for 6" to 12" lengths up to 40 m, or a tractor-mounted reel for long lines.' },
        { question: 'Can lay flat hose be stored outside?', answer: 'Only under cover. Direct sun and heat age the cover; store it in shade, off the ground and away from ozone sources.' },
        { question: 'What is a double roll?', answer: 'A roll made from the middle of a folded length, so both couplings finish on the outside — quick to deploy.' },
        { question: 'How high can I stack hose coils?', answer: 'Not so high that the bottom coils deform. Use pallets or racks.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Winders, reels and movers',
      skus: ['IH-LF-EPW', 'IH-LF-EHR', 'IH-LF-EHM', 'IH-LF-EWR1', 'IH-LF-EWR2'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hose-reels-winders',
      label: 'Lay flat hose reels and winders',
      blurb: 'Machines for laying, recovering and moving lay flat hose.',
    },
    {
      type: 'related_articles',
      slugs: ['why-lay-flat-hose-fails', 'how-to-repair-lay-flat-hose', 'lay-flat-hose-in-gulf-heat', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Storage rules from NFPA 1962 as quoted in fire service sources and industry hose-care guidance. Equipment facts from the Indus reel and winder listings.',
    },
    {
      type: 'cta_block',
      heading: 'Handling a lot of hose?',
      body: 'Tell us the bore, the lengths and how often lines move. We will recommend the winder, reel or mover to suit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
