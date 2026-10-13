import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Pillar: lay flat hose — what it is, the materials, pressure, sizing, couplings, handling.
 *
 * Every figure quoted is from our live size tables (TPU dewatering, TPU well riser, NBR discharge,
 * TPU slurry drag, TPU concrete, EPDM/PE suction) as loaded 2026-10-13. No maker names.
 */
const CROSS_SECTION = `<svg viewBox="0 0 760 300" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
<rect x="0" y="0" width="760" height="300" fill="#ffffff"/>
<g transform="translate(150,150)">
<circle r="118" fill="#1f2937"/>
<circle r="104" fill="#e5e7eb"/>
<circle r="96" fill="#9ca3af"/>
<circle r="84" fill="#ffffff"/>
<text x="0" y="6" text-anchor="middle" font-size="15" font-weight="700" fill="#1f2937">Bore</text>
</g>
<g font-size="14" fill="#1f2937">
<line x1="268" y1="62" x2="400" y2="62" stroke="#9ca3af"/><text x="410" y="66" font-weight="700">Cover</text>
<text x="410" y="86" fill="#4b5563" font-size="13">TPU, nitrile rubber (NBR) or PVC — takes abrasion, UV and weather</text>
<line x1="252" y1="130" x2="400" y2="130" stroke="#9ca3af"/><text x="410" y="134" font-weight="700">Jacket (reinforcement)</text>
<text x="410" y="154" fill="#4b5563" font-size="13">Circular-woven polyester — carries the pressure and the tensile load</text>
<line x1="240" y1="200" x2="400" y2="200" stroke="#9ca3af"/><text x="410" y="204" font-weight="700">Tube (liner)</text>
<text x="410" y="224" fill="#4b5563" font-size="13">Same polymer as the cover — seals the fluid in, sets chemical resistance</text>
<text x="410" y="262" fill="#b91c1c" font-size="13" font-weight="600">Through-the-weave: tube and cover extruded through the jacket in one pass</text>
</g>
</svg>`

const ARTICLE: BlogArticleSeed = {
  slug: 'lay-flat-hose-guide',
  title: 'Lay flat hose: the complete guide to types, pressure, sizing and couplings',
  excerpt:
    'Lay flat hose rolls flat when empty, runs out in continuous lengths up to 400 m and carries anything from groundwater to diesel to concrete. This guide covers how it is built, the three cover materials, what its pressure rating really means, how to size a line, which couplings to use and the one job it must never do.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Hose Guide: Types, Pressure Ratings, Sizes & Couplings',
  seoDescription:
    'Lay flat hose explained: TPU vs NBR vs PVC, pressure ratings by bore, sizing for flow, couplings, reels and the applications it suits — dewatering, frac water, well risers, fuel, fire.',
  focusKeyword: 'lay flat hose',
  publishedAt: '2026-10-13T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Lay flat hose is a woven polyester jacket with a polymer tube and cover. It is round when full and flat when empty, so 200 to 400 m fits on one reel.',
        'TPU is the strongest cover (10 to 85 bar in our range); nitrile rubber (NBR) resists oil and is rated 10 bar in every size; PVC is the light, low-cost option for clean water at low pressure.',
        'Working pressure falls as the bore grows: our TPU dewatering hose is 21 bar at 1-1/2" and 10 bar at 16". Always read the rating for the size you are buying.',
        'Size the bore for the flow and the line length first, then check the friction loss plus any lift stays inside the working pressure.',
        'Lay flat hose collapses under vacuum. The pump suction needs a rigid-helix suction hose; lay flat goes on the discharge.',
      ],
    },
    {
      type: 'lead',
      html: 'Few hoses do as many jobs as lay flat. The same basic construction carries floodwater off a construction site, frac water between ponds and well pads, a submersible pump’s output up a 200 m borehole, diesel to a drilling camp, drinking water to a relief site and liquid manure across a farm. What changes from job to job is the cover material, the pressure class, the bore and the coupling — and choosing those four correctly is most of the work.',
    },

    { type: 'section_head', number: '/01', title: 'What lay flat hose is.', anchor: 'what-it-is' },
    {
      type: 'direct_answer',
      question: 'What is lay flat hose?',
      answer:
        'Lay flat hose is a flexible hose built on a circular-woven polyester jacket with a polymer tube and cover — usually TPU, nitrile rubber or PVC. It is round when pressurised and collapses flat when empty, so long continuous lengths roll onto a reel. It is used for water transfer, dewatering, irrigation, fuel, slurry and firefighting.',
    },
    {
      type: 'paragraph',
      html: 'Every lay flat hose has three layers. The <strong>jacket</strong> is a seamless tube of polyester yarn woven on a circular loom; it carries the internal pressure and, when the hose hangs in a well or is dragged behind a tractor, the tensile load. The <strong>tube</strong> on the inside seals the fluid in and decides chemical resistance. The <strong>cover</strong> on the outside takes abrasion, sunlight and weather.',
    },
    {
      type: 'diagram',
      svg: CROSS_SECTION,
      captionPrefix: 'FIG. 01',
      caption: 'The three layers of a lay flat hose. In a through-the-weave hose the tube and cover are one continuous polymer that passes through the jacket.',
      alt: 'Cross-section of a lay flat hose showing three concentric layers: the outer cover of TPU, nitrile rubber or PVC; the circular-woven polyester jacket that carries pressure and tensile load; and the inner tube of the same polymer as the cover. A note says that in through-the-weave construction the tube and cover are extruded through the jacket in one pass.',
    },
    {
      type: 'paragraph',
      html: 'How the layers are joined matters more than any single material. In <strong>through-the-weave</strong> construction the polymer is extruded through the woven jacket in one pass, so tube, jacket and cover become one wall that cannot delaminate. All of our <a href="/c/tpu-lay-flat-hoses">TPU lay flat hoses</a> are made this way. Older lined hoses glue a separate tube inside the jacket; they work, but the bond is the first thing to fail when the hose is flexed, heated or dragged for years.',
    },

    { type: 'section_head', number: '/02', title: 'Where it is used.', anchor: 'applications' },
    {
      type: 'paragraph',
      html: 'Lay flat replaces rigid pipe wherever a line has to go down quickly, move often or come back up again. These are the applications we supply it for, and the hose built for each:',
    },
    {
      type: 'comparison_table',
      caption: 'Lay flat hose by application',
      columns: ['Application', 'What matters', 'Hose'],
      rows: [
        { cells: ['Construction and mine dewatering', 'Flow, abrasion, long runs', 'TPU dewatering hose (1-1/2" to 16"); NBR discharge hose'], highlight: true },
        { cells: ['Frac water transfer', 'Large bore, pressure, fast deploy and recovery', 'TPU dewatering hose, 10" to 16"'] },
        { cells: ['Borehole pump riser', 'Tensile strength, pressure at depth, no corrosion', 'TPU well riser hose (to 40 bar)'] },
        { cells: ['Diesel and fuel transfer', 'Oil resistance, static earthing', 'Antistatic TPU fuel hose'] },
        { cells: ['Temporary drinking water', 'Potable-water certification', 'TPU drinking water hose'] },
        { cells: ['Concrete placement', 'High pressure, abrasion', 'TPU concrete hose (to 85 bar)'] },
        { cells: ['Slurry umbilical systems', 'Kink and abrasion resistance, tensile strength', 'TPU slurry supply and drag hose'] },
        { cells: ['Firefighting', 'Approvals, handling, liner type', 'Single- and double-jacket fire hose'] },
        { cells: ['Irrigation and site pumps', 'Low cost, light weight', 'PVC lay flat hose'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Links to each: <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering hose</a>, <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a>, <a href="/p/tpu-lay-flat-well-riser-hose">TPU well riser hose</a>, <a href="/p/antistatic-tpu-lay-flat-fuel-hose">antistatic fuel hose</a>, <a href="/p/tpu-lay-flat-drinking-water-hose">drinking water hose</a>, <a href="/p/tpu-lay-flat-concrete-placement-hose">concrete placement hose</a>, <a href="/p/tpu-lay-flat-slurry-supply-hose">slurry supply</a> and <a href="/p/tpu-lay-flat-slurry-drag-hose">slurry drag</a> hose, <a href="/c/jacketed-fire-hoses">jacketed fire hose</a> and <a href="/p/pvc-lay-flat-discharge-hose">PVC lay flat hose</a>.',
    },

    { type: 'section_head', number: '/03', title: 'TPU, nitrile rubber or PVC.', anchor: 'materials' },
    {
      type: 'paragraph',
      html: 'The cover material sets almost everything else — pressure class, abrasion life, oil resistance, temperature range, weight and price. In short:',
    },
    {
      type: 'comparison_table',
      caption: 'The three cover materials at a glance (figures from our range)',
      columns: ['Property', 'TPU', 'NBR', 'PVC'],
      rows: [
        { cells: ['Working pressure', '10 to 85 bar by product and size', '10 bar, all sizes 1-1/2" to 12"', 'Low; confirmed per order'] },
        { cells: ['Abrasion and dragging', 'Highest', 'Good, ribbed cover', 'Lowest'] },
        { cells: ['Oil and fuel', 'Good; antistatic grade for fuel', 'Good', 'Poor'] },
        { cells: ['Temperature (our range)', '-50 °C to +80 °C', '-20 °C to +80 °C', 'Mild conditions'] },
        { cells: ['Lengths', 'Up to 400 m', 'Up to 200 m', 'Shorter coils'] },
        { cells: ['Typical use', 'Dewatering, frac, risers, fuel, slurry', 'Dewatering, oily water, fire', 'Irrigation, site pumps'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/blog/tpu-vs-nbr-vs-pvc-lay-flat-hose">TPU vs NBR vs PVC comparison</a> goes through each property in detail, with the trade-offs that decide most orders.',
    },

    { type: 'section_head', number: '/04', title: 'What the pressure rating means.', anchor: 'pressure' },
    {
      type: 'paragraph',
      html: 'Lay flat hose carries two pressure figures. The <strong>working pressure</strong> is the most it may see in service; the <strong>burst pressure</strong> is a test figure — usually two to three times the working pressure — and never an operating limit. The working pressure also falls as the bore grows, because the same jacket has to hold a larger circumference. Our TPU dewatering hose shows the pattern:',
    },
    {
      type: 'comparison_table',
      caption: 'TPU dewatering hose: working and burst pressure by bore',
      columns: ['Bore', 'Working pressure', 'Burst pressure', 'Weight'],
      rows: [
        { cells: ['1-1/2" to 2-1/2"', '21 bar', '63 bar', '0.45 to 0.75 kg/m'] },
        { cells: ['3" and 4"', '17 bar', '51 bar', '1.07 to 1.45 kg/m'] },
        { cells: ['6"', '14 bar', '42 bar', '2.30 kg/m'] },
        { cells: ['8"', '15 bar', '45 bar', '3.50 kg/m'] },
        { cells: ['10" to 14"', '14 bar', '42 bar', '3.80 to 5.25 kg/m'] },
        { cells: ['16"', '10 bar', '30 bar', '6.20 kg/m'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Different products are built to different classes: the <a href="/p/tpu-lay-flat-well-riser-hose">TPU well riser hose</a> runs from 40 bar at 1-1/4" to 18 bar at 10", the high-pressure class of <a href="/p/tpu-lay-flat-concrete-placement-hose">concrete hose</a> reaches 85 bar, and the <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a> is 10 bar in every size. Our guide to <a href="/blog/lay-flat-hose-pressure-ratings">lay flat hose pressure ratings</a> explains why, and how to allow for surge and couplings.',
    },

    { type: 'section_head', number: '/05', title: 'Sizing a line.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'Pick the bore from the flow and the length of the line, not from the pump outlet. Pushing water through a hose costs pressure — friction loss — and the loss climbs steeply as the bore shrinks. As a rule of thumb, keep the water speed between about 1.5 and 3 m/s. At 200 m³/h a 6" line loses roughly 4.6 bar per kilometre; a 4" line at the same flow loses over 30 bar per kilometre, more than the hose can carry.',
    },
    {
      type: 'paragraph',
      html: 'Then add the static head: every 10 m the water is lifted costs about 1 bar. The friction loss plus the lift plus any delivery pressure must stay inside the working pressure of the hose and of every coupling on it. The full method, with a loss table for every bore from 2" to 16", is in our guide to <a href="/blog/lay-flat-hose-flow-and-friction-loss">lay flat hose flow and friction loss</a>.',
    },

    { type: 'section_head', number: '/06', title: 'Couplings and handling.', anchor: 'couplings-handling' },
    {
      type: 'figure',
      imageId: FIG['fig-pillar-reel'],
      captionPrefix: 'FIG. 02',
      caption: 'Large-bore lay flat comes back as fast as it goes out: a tractor-mounted reel recovers a supply line across a field in minutes.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'A lay flat line is only as good as its joints. Small bores take <a href="/c/cam-and-groove-couplings">cam and groove</a>, <a href="/c/storz-couplings">Storz</a> or <a href="/c/bauer-type-couplings">Bauer-type</a> couplings banded onto the hose. From 4" up, purpose-made <a href="/c/lay-flat-hose-couplings">lay flat couplings</a> use a forged shank and bolted clamp halves, ending in a <a href="/p/large-bore-lay-flat-grooved-coupling">grooved end</a>, a <a href="/p/large-bore-storz-lay-flat-coupling">large Storz head</a>, a <a href="/p/large-bore-flanged-lay-flat-coupling">flange</a> or a <a href="/p/high-pressure-lay-flat-hose-coupling">high-pressure male and female pair</a>. Our <a href="/blog/lay-flat-hose-couplings-guide">coupling guide</a> compares them.',
    },
    {
      type: 'paragraph',
      html: 'Handling is the other half of the economics. A 16" hose weighs 6.2 kg per metre, so a 200 m length is more than a tonne: it needs a <a href="/p/tractor-mounted-lay-flat-hose-reel">tractor-mounted reel</a>, a <a href="/p/portable-lay-flat-hose-winder">portable motorised winder</a> or a <a href="/p/lay-flat-hose-mover">hose mover</a>. Borehole risers go in and out with a <a href="/p/well-riser-hose-winding-trailer-2-inch">powered winding trailer</a>.',
    },

    { type: 'section_head', number: '/07', title: 'The one job it cannot do.', anchor: 'suction' },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never put lay flat hose on a pump suction.',
      body: 'Under vacuum, atmospheric pressure flattens the hose and seals the pump inlet. Use a rigid-helix suction hose on the inlet — ours holds up to 0.95 bar vacuum — and lay flat on the discharge.',
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/epdm-pe-suction-hose">EPDM/PE suction hose</a> has a rigid polyethylene helix and is rated for vacuum at every size from 1" to 6". The guide to <a href="/blog/suction-hose-vs-lay-flat-hose">suction hose vs lay flat hose</a> shows how to lay out the two sides of a pump.',
    },

    { type: 'section_head', number: '/08', title: 'Choosing in five questions.', anchor: 'choosing' },
    {
      type: 'decision_tree',
      heading: 'Specifying a lay flat hose',
      intro: 'Answer these in order; each one narrows the next.',
      branches: [
        { condition: 'What is the fluid?', outcome: 'Clean water: any cover. Oily water: NBR or TPU. Fuel: antistatic TPU. Drinking water: certified potable hose. Concrete or slurry: the dedicated TPU grades.' },
        { condition: 'What flow, over what length and lift?', outcome: 'Sets the bore — keep velocity near 1.5 to 3 m/s and check friction loss plus lift.' },
        { condition: 'What is the highest pressure the pump can make?', outcome: 'Choose a hose and couplings whose working pressure at that bore is higher, with margin for surge.' },
        { condition: 'Will it be dragged, buried, left in sun or moved daily?', outcome: 'Dragging and daily moves favour TPU; long sun exposure favours TPU or NBR over PVC.' },
        { condition: 'What does it connect to?', outcome: 'Pick the coupling family — grooved, Storz, flanged, camlock, Bauer — and whether you want assemblies made up.' },
      ],
    },
    {
      type: 'paragraph',
      html: 'In the Gulf, lay flat does most of its work in a handful of jobs: <a href="/blog/construction-dewatering-hose-gcc">construction dewatering</a> on high-water-table sites, <a href="/blog/frac-water-transfer-lay-flat-hose">frac water transfer</a> to gas well pads, <a href="/blog/flexible-borehole-riser-vs-steel-column-pipe">flexible risers in boreholes</a>, <a href="/blog/antistatic-fuel-transfer-hose-guide">temporary fuel lines</a> and <a href="/blog/single-vs-double-jacket-fire-hose">fire hose</a>. Each has its own guide, and <a href="/blog/lay-flat-hose-in-gulf-heat">running lay flat in Gulf heat</a> covers what summer does to all of them.',
    },
    {
      type: 'paragraph',
      html: 'In Europe the same hose turns up in very different work: <a href="/blog/slurry-umbilical-system-guide">slurry umbilical systems</a> on farms, <a href="/blog/overland-pumping-water-main-bypass">over-pumping and water main bypass</a>, <a href="/blog/flood-response-pumping-lay-flat-hose">flood response</a>, <a href="/blog/mine-dewatering-lay-flat-hose">mine dewatering</a>, <a href="/blog/snowmaking-hose-guide">snowmaking</a>, <a href="/blog/irrigation-lay-flat-hose-guide">irrigation</a> and <a href="/blog/concrete-placement-hose-guide">concrete placement</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How long can a single lay flat hose be?', answer: 'Our TPU lay flat hoses are made in continuous lengths up to 400 m; NBR up to 200 m. Long lengths mean fewer joints — fewer leak points and less friction loss at couplings.' },
        { question: 'Can lay flat hose be used for suction?', answer: 'No. It collapses under vacuum. Use a rigid-helix suction hose on the pump inlet and lay flat on the discharge.' },
        { question: 'What is the difference between working pressure and burst pressure?', answer: 'Working pressure is the maximum allowed in service. Burst pressure is the pressure at which a test sample fails, typically two to three times the working pressure. Never operate a hose near its burst pressure.' },
        { question: 'Does lay flat hose need special couplings?', answer: 'Small bores use standard camlock, Storz or Bauer couplings banded on. Large bores use dedicated lay flat couplings with a forged shank and a bolted clamp sized to the hose wall.' },
        { question: 'Is TPU lay flat hose worth the extra cost over PVC?', answer: 'For anything dragged, pressurised above a few bar, exposed to oil or used repeatedly, yes: TPU carries far higher pressure, resists abrasion and lasts longer. For a seasonal, low-pressure clean-water line, PVC is usually enough.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Lay flat hoses in this guide',
      skus: ['IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-TWR', 'IH-LF-TOF', 'IH-LF-TPW', 'IH-LF-TSS', 'IH-LF-SEP', 'IH-LF-PVC'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'TPU, NBR and PVC lay flat hose, fire hose, suction hose, couplings and reels — 36 listings.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Lay flat hose supply to Saudi Arabia',
      blurb: 'Dewatering, frac water and borehole risers for Saudi projects, shipped from the UAE.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'united-kingdom',
      label: 'Lay flat hose supply to the United Kingdom',
      blurb: 'Over-pumping, dewatering and slurry hose for UK contractors and farms.',
    },
    {
      type: 'related_articles',
      slugs: ['construction-dewatering-hose-gcc', 'frac-water-transfer-lay-flat-hose', 'flexible-borehole-riser-vs-steel-column-pipe', 'tpu-vs-nbr-vs-pvc-lay-flat-hose', 'lay-flat-hose-pressure-ratings', 'lay-flat-hose-flow-and-friction-loss'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Pressure, weight and size figures from the Indus lay flat hose size tables as published on 13 October 2026. Friction figures are estimates by the Hazen–Williams method (C = 140) for water.',
    },
    {
      type: 'cta_block',
      heading: 'Need a lay flat line specified?',
      body: 'Send the fluid, flow, line length, lift and pump, and we will recommend the hose, bore and couplings — supplied as bulk coils or made-up assemblies.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
