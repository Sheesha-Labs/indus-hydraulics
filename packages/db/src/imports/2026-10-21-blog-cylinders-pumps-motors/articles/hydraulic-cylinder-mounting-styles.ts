import type { BlogArticleSeed } from '../shared'

/**
 * Cylinder mounting styles. NFPA codes MX0–MX3, MF1/MF2, MS2, MS4, MP1/MP2, MT1/MT2/MT4 from NFPA-pattern maker
 * catalogues; ISO-style MP3/MP5/MF3/MF4/MT4/MS2 as used by Rexroth on the CDH1 (RE 17332); the three mounting
 * groups from Parker's 2MA guide; Maxim TC "ASAE" strokes (8"/16", 1" pin, 1.25" on 16" for 3–4" bores, 2,500 psi)
 * from a maker catalogue page; SAE J716 / ISO 2057 as the remote-cylinder references. MF5/MF6/MS7 NOT used
 * (unverified). ASABE S201 NOT cited (unverified). Welded mount types from our listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-cylinder-mounting-styles',
  title: 'Hydraulic cylinder mounting styles: clevis, cross tube, trunnion, flange and the codes that name them',
  excerpt:
    'The mount decides whether a cylinder pushes straight or bends itself to death. Welded mounts — clevis, cross tube, tang, pin eye, swivel eye — the NFPA and ISO codes for tie-rod mounts, what an ASAE or “ag” cylinder is, and how to measure pins, gaps and closed length so a replacement fits first time.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Hydraulic Cylinder Mounting Styles: Types, NFPA & ISO Codes',
  seoDescription:
    'Hydraulic cylinder mounting styles explained: clevis, cross tube, tang, pin eye, swivel eye, trunnion, flange and side-lug mounts, NFPA and ISO mount codes, ASAE agricultural cylinders, side load and how to measure for replacement.',
  focusKeyword: 'hydraulic cylinder mounting styles',
  publishedAt: '2026-10-21T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Mounts fall into three groups: fixed mounts that take force on the centreline, pivot mounts that let the cylinder swing in one plane, and fixed mounts that take force off the centreline.',
        'Pivot mounts — clevis, cross tube, pin eye, trunnion — let a cylinder follow a curved path; fixed mounts need the load guided separately.',
        'NFPA tie-rod codes run MX (tie rods extended), MF (flange), MS (side mount), MP (pivot clevis) and MT (trunnion); ISO cylinders use similar codes such as MP3, MP5, MF3 and MS2.',
        'An “ASAE” agricultural cylinder follows common interchange dimensions — 8" and 16" strokes on a 1" pin are typical — so it swaps between tractors and implements.',
        'A replacement needs the right closed length, pin diameter and clevis gap as well as bore and stroke. Most failed fits are a closed length that is an inch out.',
      ],
    },
    {
      type: 'lead',
      html: 'Two cylinders with the same bore, rod and stroke can be completely different parts. One has a clevis at each end; the other a cross tube and a threaded rod; a third is a tie-rod cylinder with a front flange. The mount decides whether the cylinder fits the machine, and whether it pushes along its own axis or takes a bending load that wears its seals out in a season.',
    },

    { type: 'section_head', number: '/01', title: 'Three groups of mount.', anchor: 'groups' },
    {
      type: 'prose',
      html: '<p>Parker’s cylinder guidance divides mounts into three groups, and the grouping explains most of the design rules:</p><ol><li><strong>Fixed mounts that absorb force on the centreline</strong> — end flanges, extended tie rods, centreline lugs. The strongest mounts for straight-line work, because the force passes straight through the cylinder’s axis into the structure.</li><li><strong>Pivot mounts</strong> — clevises, cross tubes, pin eyes, trunnions. They let the cylinder swing in one plane, so it follows a load that moves through an arc: a boom, a bucket, a tipping body, a door.</li><li><strong>Fixed mounts that do not absorb force on the centreline</strong> — side lugs and foot mounts. The force acts below the cylinder’s axis, so the mount bolts see a turning moment as well as shear; they need dowels or a shear key, and the load must be guided.</li></ol><p>A useful rule from Eaton’s cylinder engineers: rigid mounts for linear motion parallel to the rod; swivel (pivot) mounts for curvilinear motion. Mounting style also affects the maximum allowable pressure — a cylinder hung off its front flange is stressed differently from one pushing through its cap — which is why tie-rod catalogues rate some mounts lower than others.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Welded cylinder mounts.', anchor: 'welded' },
    {
      type: 'comparison_table',
      caption: 'Welded cylinder mount types on our shelf',
      columns: ['Mount', 'What it is', 'Where you find it', 'Measure'],
      rows: [
        { cells: ['Clevis', 'A forked end with a cross-drilled pin hole', 'Implements, loaders, lifts', 'Pin diameter, gap between jaws, jaw depth'], highlight: true },
        { cells: ['Ag clevis (ASAE)', 'A clevis at both ends to common ag interchange dimensions', 'Tractor remotes and implements', 'Stroke, closed length, pin'] },
        { cells: ['Cross tube', 'A tube welded across the cap (and often the rod), with a bore for a pin', 'Loaders, plows, dump hoists, forestry', 'Tube length, bore, OD'] },
        { cells: ['Tang', 'A single flat plate with a pin hole', 'Compact linkages, steering', 'Plate thickness, pin hole'] },
        { cells: ['Pin eye', 'A solid eye with a plain bore', 'General mobile and industrial', 'Eye width, pin hole'] },
        { cells: ['Swivel eye', 'An eye fitted with a spherical bearing', 'Where some misalignment must be absorbed', 'Eye width, bearing bore'] },
        { cells: ['Universal / threaded rod', 'Plain or threaded rod end to take a separate clevis or eye', 'Custom installations', 'Rod thread'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Most welded mobile cylinders are pivot-mounted at both ends, and often the two ends differ — a cross tube at the cap and a clevis on the rod, or a tang at one end and a pin eye at the other. Our listings are grouped by mount (Bailey, Chief, Magister and Maxim clevis, cross tube, tang, pin eye, swivel eye and ag clevis cylinders) so a match can start from the mount and narrow by bore and stroke.</p><h3>Cross tubes versus clevises</h3><p>A cross tube carries its pin in a long bearing area and tolerates misalignment and dirt well; it is common on loaders, plows and forestry machines, and heavy-duty versions carry grease nipples on the tubes. A clevis puts the pin through two jaws either side of a bracket on the machine; it is compact and easy to connect, and it is the standard on agricultural implements. Swapping one for the other means changing the bracket on the machine as well as the cylinder.</p>',
    },

    { type: 'section_head', number: '/03', title: 'ASAE and agricultural cylinders.', anchor: 'asae' },
    {
      type: 'prose',
      html: '<p>“ASAE cylinder” is trade shorthand for a double-acting clevis-to-clevis agricultural cylinder built to the interchange dimensions that grew out of the American Society of Agricultural Engineers’ work (now ASABE), so that one cylinder can move between a tractor’s remote outlets and different implements. The relevant published standards are SAE J716 (application of hydraulic remote control to tractors and trailed implements, now cancelled) and ISO 2057 (remote-control hydraulic cylinders for trailed implements).</p><p>In catalogues, the ASAE strokes are 8" and 16". A typical example from one maker’s tie-rod ag range: 2,500 psi rating, 2"–4" bores, a 1-1/8" rod, a 1" pin — 1-1/4" on the 16" stroke for 3"–4" bores — and 8" and 16" strokes marked ASAE. Our welded ag-clevis cylinders follow the same pattern.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Same bore and stroke is not the same cylinder.',
      body: 'A non-ASAE 2.5" × 8" cylinder can be two inches shorter pin-to-pin than an ASAE 2.5" × 8" cylinder. Check the retracted pin-centre length as well as bore and stroke, or the replacement will not reach both pins.',
    },

    { type: 'section_head', number: '/04', title: 'Tie-rod mount codes: NFPA and ISO.', anchor: 'codes' },
    {
      type: 'comparison_table',
      caption: 'NFPA tie-rod cylinder mount codes (NFPA/ANSI T3.6.7 pattern)',
      columns: ['Code', 'Mount', 'Group'],
      rows: [
        { cells: ['MX0', 'No mount (basic cylinder)', '—'] },
        { cells: ['MX1', 'Tie rods extended, both ends', 'Fixed, centreline'] },
        { cells: ['MX2', 'Tie rods extended, cap end', 'Fixed, centreline'] },
        { cells: ['MX3', 'Tie rods extended, head end', 'Fixed, centreline'] },
        { cells: ['MF1', 'Head rectangular flange', 'Fixed, centreline'], highlight: true },
        { cells: ['MF2', 'Cap rectangular flange', 'Fixed, centreline'] },
        { cells: ['MS2', 'Side lugs (foot)', 'Fixed, off centreline'] },
        { cells: ['MS4', 'Side or bottom tapped holes', 'Fixed, off centreline'] },
        { cells: ['MP1', 'Cap fixed clevis', 'Pivot'] },
        { cells: ['MP2', 'Cap detachable clevis', 'Pivot'] },
        { cells: ['MT1', 'Head trunnion', 'Pivot'] },
        { cells: ['MT2', 'Cap trunnion', 'Pivot'] },
        { cells: ['MT4', 'Intermediate trunnion', 'Pivot'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Metric cylinders use a similar vocabulary. On Rexroth’s mill-type CDH1, for example: MP3 is a swivel eye at the base, MP5 a self-aligning clevis (spherical bearing) at the base, MF3 and MF4 round flanges at head and base, MT4 a trunnion whose position along the barrel is specified, and MS2 a foot mount. Rod ends take a self-aligning or plain clevis on a thread. The ISO tie-rod standards — ISO 6020-2 (160 bar compact) and ISO 6022 (250 bar) — fix the mounting dimensions so a cylinder of the same code and size from another maker bolts into the same place. Our Rexroth CDT3 cylinders are listed with their mount codes: MS2 foot and MP1 clevis.</p>',
    },
    {
      type: 'direct_answer',
      question: 'What is the best mount for a hydraulic cylinder?',
      answer:
        'The one that keeps the force on the cylinder’s axis for the motion the load makes. For straight-line motion along the rod, a fixed centreline mount — an end flange or extended tie rods — is strongest. For a load that moves through an arc, a pivot mount — clevis, cross tube, pin eye or trunnion — so the cylinder can follow it. Side-lug and foot mounts are compact but take the force off the centreline and need the load guided.',
    },

    { type: 'section_head', number: '/05', title: 'Side load, pins and alignment.', anchor: 'side-load' },
    {
      type: 'prose',
      html: '<p>A cylinder is designed to push and pull along its own axis. Any force across it — from a misaligned pivot, a load guided by the cylinder instead of by the machine, or a fixed mount on a load that moves in an arc — is carried by the gland bearing and the piston wear ring, and wears them on one side until the seals leak and the rod scores.</p><ul><li><strong>Pins must be free.</strong> Parker’s telescopic-cylinder manual gives pin-to-hole clearances of 1/16"–1/8" on mounting eyes narrower than 5" and 1/8"–3/16" on wider ones, with side clearance either side. A pin hammered into a tight hole turns a pivot mount into a fixed one.</li><li><strong>Keep both pivots parallel.</strong> If the cap and rod pins are not parallel, the cylinder twists as it strokes.</li><li><strong>Do not use the cylinder as a guide.</strong> A cylinder pushing a sliding table, a gate or a press platen must have the load guided by rails or bushes.</li><li><strong>Watch over-extension on jacks.</strong> Even a vertical load side-loads a short cylinder extended too far or with its saddle seated badly; Enerpac recommends tilt saddles and using no more than 80% of stroke.</li><li><strong>Long strokes need stiffness.</strong> Pivot-to-pivot cylinders buckle over their full length — see <a href="/blog/hydraulic-cylinder-force-and-speed">force, speed and buckling</a>.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'Measuring the mount for a replacement.', anchor: 'measure' },
    {
      type: 'prose',
      html: '<ol><li><strong>Mount type at each end</strong> — and photograph both.</li><li><strong>Pin diameter</strong> at each end, measured on the pin, not the worn hole.</li><li><strong>Clevis gap</strong> — the width between the jaws — and the jaw depth to the pin centre.</li><li><strong>Cross tube</strong> length, outside diameter and bore.</li><li><strong>Retracted length</strong>, pin centre to pin centre, with the rod fully in.</li><li><strong>Extended length</strong>, pin centre to pin centre, or the stroke.</li><li><strong>Port positions</strong> relative to the mounts — on a clevis cylinder, whether the ports face up when the clevis is horizontal.</li><li>For tie-rod cylinders: the <strong>NFPA or ISO mount code</strong>, bore, rod, stroke and rod-end thread.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What are the types of hydraulic cylinder mounts?', answer: 'Pivot mounts (clevis, cross tube, pin eye, swivel eye, tang, trunnion), fixed centreline mounts (flanges, extended tie rods) and fixed off-centreline mounts (side lugs, foot mounts, tapped holes).' },
        { question: 'What is the difference between a clevis and a cross tube cylinder?', answer: 'A clevis is a fork with a pin through two jaws; a cross tube is a tube welded across the end with a pin through its bore. Cross tubes carry the pin in a longer bearing and suit loaders and forestry; clevises are standard on agricultural implements.' },
        { question: 'What is an ASAE hydraulic cylinder?', answer: 'An agricultural double-acting clevis cylinder built to common interchange dimensions so it swaps between tractors and implements. ASAE strokes are typically 8" and 16" on a 1" pin.' },
        { question: 'What does MF1 mean on a cylinder?', answer: 'An NFPA tie-rod cylinder with a head-end rectangular flange. MF2 is the cap-end flange; MP1 a cap clevis; MS2 side lugs; MT4 an intermediate trunnion.' },
        { question: 'Why does my cylinder wear on one side?', answer: 'Side load — a misaligned or tight pivot, a fixed mount on a load moving in an arc, or the cylinder being used to guide the load. Fix the alignment before replacing the seals.' },
        { question: 'How do I measure a hydraulic cylinder for replacement?', answer: 'Mount type and pin diameter at each end, clevis gap or cross-tube length, retracted and extended pin-to-pin lengths, bore, rod, ports and their positions.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Cylinders by mount',
      skus: ['IH-CHF-CL-3', 'IH-MAG-WCTN-CT-3', 'IH-CHF-TG-25', 'IH-MAG-WPEN-PE-3', 'IH-MAX-SE-2', 'IH-BLY-AGC-25', 'IH-CYL-100-70-500', 'IH-CYL-63-45-200'],
    },
    { type: 'category_link', slug: 'welded-hydraulic-cylinders', label: 'Welded cylinders', blurb: 'Grouped by mount: clevis, cross tube, tang, pin eye, swivel eye, ag clevis.' },
    { type: 'category_link', slug: 'tie-rod-cylinders', label: 'Tie-rod cylinders', blurb: 'NFPA-pattern tie-rod cylinders.' },
    {
      type: 'related_articles',
      slugs: ['hydraulic-cylinder-guide', 'welded-vs-tie-rod-hydraulic-cylinders', 'hydraulic-cylinder-force-and-speed', 'hydraulic-cylinder-drift-diagnosis'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'NFPA codes from NFPA-pattern catalogues; ISO-style codes from Rexroth CDH1 data; ag dimensions from a maker catalogue; pin clearances from Parker’s telescopic manual.',
    },
    {
      type: 'cta_block',
      heading: 'Matching a cylinder to its mounts?',
      body: 'Send the mount and pin at each end, the clevis gap or tube length, retracted and extended lengths, bore and stroke, with a photograph of each end. We will find the stock cylinder that fits between your pins.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
