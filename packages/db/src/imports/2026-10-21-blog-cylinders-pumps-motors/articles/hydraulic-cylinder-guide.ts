import type { BlogArticleSeed } from '../shared'
import { CYLINDER_ANATOMY } from '../diagrams'

/**
 * Pillar: hydraulic cylinders. Types, anatomy, seals, materials, selection. Ratings and ranges quoted from our
 * listings (welded 1"–8" bore; Magister 3,500 psi; Enerpac 10,000 psi RC 5–100 t, RR 10–500 t; Custom Hoists
 * telescopic strokes 71.94"–219.62"; CDT3 ISO 6020-2 160 bar). Seal temperature bands are the ranges seal makers
 * publish for standard compounds and are stated as typical.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-cylinder-guide',
  title: 'Hydraulic cylinders: the complete guide to types, parts, seals and selection',
  excerpt:
    'Single-acting or double-acting, welded or tie-rod, ram, telescopic or 10,000 psi — what each cylinder type is for, what is inside it, how the seals work, what the rod and barrel are made of, and the eight measurements that identify a replacement.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Cylinders Guide: Types, Parts, Seals & Selection',
  seoDescription:
    'Complete guide to hydraulic cylinders: single vs double acting, welded, tie-rod, telescopic, ram and 10,000 psi types, cylinder parts and seals, rod and barrel materials, and how to measure a cylinder for replacement.',
  focusKeyword: 'hydraulic cylinder types',
  publishedAt: '2026-10-21T07:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A single-acting cylinder is powered one way and returned by load, gravity or a spring; a double-acting cylinder is powered both ways.',
        'Construction follows the job: welded for mobile equipment, tie-rod for industry, telescopic for long strokes from short bodies, 10,000 psi for jacking and maintenance.',
        'Inside every double-acting cylinder are a piston seal, a rod seal, a wiper and wear rings; most failures start at the rod seal and wiper, and most of those start with a damaged rod.',
        'Rods are induction-hardened or plain steel with hard chrome; barrels are honed tube. Damage to either surface ends the seals’ life however good the seals are.',
        'Bore, rod, stroke, retracted length, mount and pin at each end, ports and working pressure identify a replacement. A nameplate is a bonus.',
      ],
    },
    {
      type: 'lead',
      html: 'A hydraulic cylinder is the simplest component in a hydraulic system and the one asked to do the most visible work: lift the boom, tip the body, close the press, split the log. It is also the one most often replaced like-for-like without anyone checking whether like-for-like was ever right. This guide covers every family we stock, what is inside them, and how to choose one that will last.',
    },

    { type: 'section_head', number: '/01', title: 'How a cylinder works.', anchor: 'principle' },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'The parts of a double-acting welded cylinder. The cap side has the full bore area; the rod side has only the ring around the rod, which is why a cylinder pulls weaker and retracts faster than it pushes and extends.',
      alt: 'Cutaway diagram of a double-acting welded hydraulic cylinder. From left: cap clevis, welded cap, cap-end port, honed barrel, the cap-side oil chamber shaded as full bore area, the piston with piston seals, the rod-side annulus chamber, the chromed rod, the rod-end port, the gland carrying the rod seal, wiper and wear ring, and the rod eye.',
      svg: CYLINDER_ANATOMY,
    },
    {
      type: 'prose',
      html: '<p>Oil pumped into the cap end pushes the piston along the barrel and extends the rod; oil from the rod end is pushed out to tank. Reverse the valve, and oil into the rod end retracts it. The force is pressure times the area the oil acts on, and the speed is flow divided by that area — the arithmetic is in <a href="/blog/hydraulic-cylinder-force-and-speed">cylinder force and speed</a>.</p><p>Everything else in a cylinder exists to keep that oil where it should be, keep dirt out, and keep the rod running straight in its bearing.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Single-acting and double-acting.', anchor: 'action' },
    {
      type: 'prose',
      html: '<p>A <strong>single-acting</strong> cylinder has one working port. Oil extends it; something else brings it back — the weight of the load, an internal spring, or the load itself. Dump bodies, scissor lifts, most telescopic hoists and the majority of 10,000 psi jacking cylinders are single-acting: our Enerpac RC range is spring-return, and the high-tonnage HCG and lock-nut LPL families are load-return. They need only one hose and a simple valve, but they cannot pull.</p><p>A <strong>double-acting</strong> cylinder has two ports and is powered in both directions. It can push and pull, hold position both ways against a valve, and control the speed of both strokes. Almost every welded and tie-rod cylinder on mobile and industrial equipment is double-acting.</p><p>A <strong>ram</strong> or <strong>plunger</strong> cylinder is a single-acting cylinder with no separate piston: the rod is the full working diameter and seals at the gland. It is simple and robust for pure pushing — jacks, presses, lifts.</p>',
    },

    { type: 'section_head', number: '/03', title: 'The families, and where each one lives.', anchor: 'families' },
    {
      type: 'comparison_table',
      caption: 'Cylinder families we stock',
      columns: ['Family', 'Construction', 'Typical pressure', 'Where it is used'],
      rows: [
        { cells: ['Welded', 'Cap welded to barrel, gland threaded or ring-retained', '2,500–3,500 psi', 'Loaders, tractors, implements, trucks, lifts, splitters'], highlight: true },
        { cells: ['Tie-rod (inch)', 'Ends clamped by external tie rods, NFPA pattern', 'Around 3,000 psi', 'Machine tools, presses, fixed plant'] },
        { cells: ['Tie-rod (metric)', 'ISO 6020-2 compact or ISO 6022 heavy series', '160 bar / 250 bar', 'European machinery, plant and automation'] },
        { cells: ['Telescopic', 'Nested stages extending in sequence', 'Maker-rated per stage', 'Dump bodies, tipping trailers, long-reach lifts'] },
        { cells: ['10,000 psi', 'Heavy-wall steel or aluminium, single or double-acting', '700 bar (10,000 psi)', 'Jacking, pressing, pulling, bolting, maintenance'] },
        { cells: ['Loader, plow and specialty', 'Welded, with application-specific ends', '2,500–3,500 psi', 'Front loaders, snowplows, top links, log splitters'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The detailed comparisons are in their own articles: <a href="/blog/welded-vs-tie-rod-hydraulic-cylinders">welded vs tie-rod</a>, <a href="/blog/telescopic-hydraulic-cylinders">telescopic cylinders</a>, and <a href="/blog/high-pressure-hydraulic-cylinders-and-pumps">10,000 psi cylinders and pumps</a>. The short version: the machine usually chooses the family, and the job of the buyer is to match the bore, rod, stroke, closed length and mounts exactly.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Inside the cylinder.', anchor: 'parts' },
    {
      type: 'prose',
      html: '<h3>Barrel</h3><p>A seamless or drawn-over-mandrel steel tube honed inside to a fine, cross-hatched finish. The finish is a compromise: smooth enough not to wear the piston seal, textured enough to hold a film of oil. Scoring, pitting or a bore worn oval ends the seal’s life.</p><h3>Piston and piston seals</h3><p>The piston divides the cap side from the rod side. Its seal — a single bidirectional seal or a pair — must hold pressure in both directions on a double-acting cylinder. Wear rings (guide bands) on either side keep the piston centred so the seal is not carrying side load. A piston seal that bypasses lets oil cross from one side to the other, and the cylinder drifts or loses force.</p><h3>Rod</h3><p>Usually medium-carbon steel (C45E is the conventional grade), ground and hard-chrome plated; on heavier-duty cylinders, induction-hardened under the chrome so a knock dents less easily. The chrome is thin — typically a few tens of microns — and its job is corrosion and wear resistance, not strength. For marine and offshore duty, nickel-chrome rods with a nickel underlayer resist salt spray for far longer than single-layer chrome. A rod that is pitted, scored or bent will cut any new seal fitted to it, which is why resealing a damaged rod is money wasted.</p><h3>Gland (head)</h3><p>The gland closes the rod end of the barrel and carries the rod’s bearing and seals: a <strong>rod seal</strong> holding pressure, a <strong>buffer seal</strong> on heavier designs protecting it from pressure spikes, a <strong>wiper</strong> (scraper) on the outside cleaning the rod as it retracts, and a <strong>wear ring</strong> or bronze bush guiding the rod. Static O-rings and back-up rings seal the gland to the barrel.</p><h3>Cushions</h3><p>On industrial cylinders, a cushion spear on the piston enters a pocket at the end of the stroke, trapping oil that has to escape through a small adjustable orifice. The piston decelerates instead of hammering into the end cap. Mobile welded cylinders rarely have them; their pivots and loads absorb the end-of-stroke shock instead.</p><h3>Ports</h3><p>Most inch cylinders use SAE O-ring boss (ORB) ports — our welded listings are mostly ORB -6 or -8 — and some use NPT; metric cylinders use BSPP or metric ISO 6149 ports, and large industrial cylinders use SAE code 61 flange pads. A port that is too small for the flow throttles the cylinder, heats the oil and caps its speed.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Seals, heat and the Gulf.', anchor: 'seals' },
    {
      type: 'prose',
      html: '<p>Seal compounds set the cylinder’s temperature and fluid limits. The common ones:</p><ul><li><strong>Nitrile (NBR)</strong> — the standard for mineral oil. Published ranges vary by source and grade, roughly −30/−40 °C to +100 °C continuous, with short excursions higher.</li><li><strong>Polyurethane (PU/AU)</strong> — tougher and more extrusion- and wear-resistant than nitrile, the usual choice for rod seals and wipers on mobile cylinders. Standard grades are commonly rated to about +80 °C; hydrolysis-resistant grades reach +100 to +120 °C. Standard grades dislike hot water.</li><li><strong>Fluorocarbon (FKM)</strong> — for high temperatures (to about +200 °C) and many synthetic fluids; more expensive, and stiff in the cold.</li><li><strong>PTFE-based</strong> — low friction, very wide temperature range, used as the dynamic face of composite piston and rod seals with an elastomer energiser.</li></ul><p>In the Gulf, the question is not ambient temperature but oil temperature. Parker’s cylinder guidance puts the optimum oil temperature at 50–60 °C and recommends no more than about 82 °C; a standard polyurethane seal is rated to about 80 °C. A cylinder that sits in the sun with oil returning at 80–90 °C is at or past the top of that range — and seal industry guidance is that a 10 °C rise can cut seal life by a factor of about five. If oil temperatures on a machine regularly run that high, fix the cooling first; then consider a seal kit in a higher-temperature compound.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Grit is the other killer.',
      body: 'Most rod-seal failures begin outside the cylinder. Dust and sand stick to the oil film on the extended rod; on retract, the wiper has to scrape them off, and a worn wiper lets them through to the rod seal. On machines working in sand, a good double-lip wiper and, where the rod is exposed for long periods, a rod boot are worth more than any upgrade to the pressure seal.',
    },

    { type: 'section_head', number: '/06', title: 'Mounts and side load.', anchor: 'mounts' },
    {
      type: 'prose',
      html: '<p>The mount is how the cylinder is fixed to the machine at each end, and it decides how much side load the cylinder sees. Pivot mounts — clevis, cross tube, tang with a pin, pin eye, swivel eye — let the cylinder swing to follow its load, so the force stays on the rod axis. Fixed mounts — flanges, side lugs, extended tie rods — hold the cylinder rigidly and need the load guided separately. All of them, with their standard codes and the ag clevis pattern, are covered in <a href="/blog/hydraulic-cylinder-mounting-styles">hydraulic cylinder mounting styles</a>.</p>',
    },

    { type: 'section_head', number: '/07', title: 'Measuring a cylinder for replacement.', anchor: 'measure' },
    {
      type: 'prose',
      html: '<ol><li><strong>Bore.</strong> The inside diameter of the barrel. On an assembled cylinder, measure the barrel’s outside diameter and tell us that it is the OD — wall thickness varies by maker and pressure rating, so OD alone is a strong clue rather than a bore.</li><li><strong>Rod diameter</strong>, with a caliper, on an undamaged section.</li><li><strong>Stroke</strong> — extended pin-to-pin length minus retracted pin-to-pin length.</li><li><strong>Retracted length</strong>, pin centre to pin centre with the rod fully in. A replacement with the right stroke but the wrong closed length will not fit.</li><li><strong>Mount at each end</strong> and the <strong>pin diameter</strong>; for a clevis, the gap between the jaws; for a cross tube, its length and bore.</li><li><strong>Ports</strong> — type (ORB, NPT, BSPP) and size, and their position relative to the mounts.</li><li><strong>Working pressure</strong> of the circuit, and whether the rod end can be blocked.</li><li><strong>Action</strong> — single or double-acting.</li></ol><p>Send those eight items and a photograph. They identify a stock replacement faster than a part number from an OEM that has since changed suppliers.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What are the main types of hydraulic cylinder?', answer: 'By action: single-acting and double-acting. By construction: welded, tie-rod, mill-type, telescopic and ram. By pressure class: standard mobile and industrial cylinders around 2,500–3,500 psi, and 10,000 psi cylinders for jacking and maintenance.' },
        { question: 'What is the difference between single and double-acting cylinders?', answer: 'A single-acting cylinder is powered in one direction and returned by gravity, a spring or the load. A double-acting cylinder is powered both ways and can push and pull.' },
        { question: 'What are the parts of a hydraulic cylinder?', answer: 'Barrel, cap (base), piston with its seals and wear rings, rod, gland with rod seal, wiper and wear ring, static seals, ports and the mounts at each end. Industrial cylinders may add cushions.' },
        { question: 'Why do hydraulic cylinder seals fail?', answer: 'Most often because the rod is damaged or dirty: grit gets past a worn wiper, a scored or pitted rod cuts the seal, or side load wears the gland bearing. Heat, the wrong fluid and pressure spikes are the other causes.' },
        { question: 'How do I measure a hydraulic cylinder?', answer: 'Bore, rod diameter, stroke, retracted pin-to-pin length, the mount and pin size at each end, port type and size, working pressure and whether it is single or double-acting.' },
        { question: 'Is it worth rebuilding a hydraulic cylinder?', answer: 'Yes, if the rod chrome and barrel bore are undamaged and the cylinder is not a common stock size. If either surface is damaged, a new cylinder is often cheaper than re-chroming and honing.' },
        { question: 'What seals are best for hot climates?', answer: 'Standard nitrile and polyurethane suit most work if oil temperature stays below roughly 80 °C. Where it runs hotter, fix the cooling first, then consider higher-temperature compounds such as FKM for static and some dynamic seals.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'One from each family',
      skus: ['IH-CHF-CT-3', 'IH-CHF-TR-3', 'IH-CYL-100-70-500', 'IH-CHS-TELESCOPIC-SA', 'IH-ENE-CYL-RC', 'IH-ENE-CYL-RR', 'IH-CHF-LD-2', 'IH-MAG-WLSN-LS-4'],
    },
    { type: 'category_link', slug: 'cylinders', label: 'Hydraulic cylinders', blurb: 'Every family, from 1" welded to 1,000 ton jacking cylinders.' },
    { type: 'category_link', slug: 'welded-hydraulic-cylinders', label: 'Welded cylinders', blurb: '90 listings by mount and bore.' },
    { type: 'category_link', slug: 'high-pressure-cylinders', label: '10,000 psi cylinders', blurb: 'Single and double-acting, hollow plunger, low height and lock-nut.' },
    {
      type: 'related_articles',
      slugs: ['welded-vs-tie-rod-hydraulic-cylinders', 'hydraulic-cylinder-force-and-speed', 'hydraulic-cylinder-mounting-styles', 'telescopic-hydraulic-cylinders', 'high-pressure-hydraulic-cylinders-and-pumps', 'hydraulic-cylinder-drift-diagnosis'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Families, ratings and port types from our own cylinder listings; seal temperature ranges are typical published values for standard compounds — check the seal kit’s own data.',
    },
    {
      type: 'cta_block',
      heading: 'Need a cylinder matched?',
      body: 'Send the eight measurements above and a photograph. We will match it from stock and quote the hoses and fittings that connect it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
