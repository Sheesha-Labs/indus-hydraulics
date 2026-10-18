import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Slurry umbilical systems: layout, hose, couplings, reels. Facts checked 2026-10-13: Irish Farmers
 * Journal (2014: typical kit, outputs, horsepower, hose life; 2025 on flow metering), Teagasc
 * (2024: umbilical LESS units, compaction, in-crop timing), profi (move to 5–6" hose). Product facts
 * from IH-LF-TSS / TSD / CAG / EHR / EHM / EPW. No vendor sources used.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'slurry-umbilical-system-guide',
  title: 'Slurry umbilical systems explained: supply line, drag hose, reels and couplings',
  excerpt:
    'An umbilical system pumps slurry from the store through a hose to an applicator on the tractor — no tankers, no road trips, far less soil compaction. With low-emission spreading now required across Ireland, Germany, Denmark, the Netherlands and Scotland, it is how many farms and contractors meet the rules. How the system is laid out, what each hose does, and how to choose supply line, drag hose, couplings and reels.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Slurry Umbilical System Guide: Supply Line, Drag Hose, Reels',
  seoDescription:
    'How a slurry umbilical system works: pump, lay flat supply line, drag hose, applicator, reels and couplings. Output, horsepower, soil compaction, low-emission spreading rules, and how to choose each hose.',
  focusKeyword: 'slurry umbilical system',
  publishedAt: '2026-10-13T21:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An umbilical system pumps slurry from the store to the applicator through hose, so no tanker crosses the field or the road.',
        'Two hoses do different jobs: a supply line that lies still along the route, and a drag hose the tractor pulls while spreading.',
        'The applicator — trailing shoe, trailing hose or injector — is what makes it low-emission; the umbilical is what makes it light on the ground.',
        'A typical set-up is a pump, around 1,000 m of hose, a reel and an applicator; contractor rigs run larger bores and longer lines.',
        'Couplings that intermate across sizes, and reels that lay and recover hose quickly, save more time than any other choice.',
      ],
    },
    {
      type: 'lead',
      html: 'A slurry tanker carries a few thousand gallons per trip, compacts the field with every pass and spends much of its day on the road. An umbilical system replaces the trips with hose. A pump at the store pushes slurry through a <strong>supply line</strong> laid out to the field; at the field a <strong>drag hose</strong> connects to an applicator on a tractor, which pulls the hose behind it as it works up and down. The tractor carries no load, so it can be light; the applicator enters the field once; and the slurry goes on when ground and crop are ready. Known as umbilical, dragline or drag-hose systems — <em>Schleppschlauch</em> in German, <em>sleepslang</em> in Dutch — they have become a mainstay of low-emission spreading.',
    },

    { type: 'section_head', number: '/01', title: 'How the system is laid out.', anchor: 'layout' },
    {
      type: 'prose',
      html: '<ol><li><strong>Store and agitator.</strong> The slurry is mixed so the pump draws a consistent material.</li><li><strong>Pump.</strong> A PTO- or engine-driven pump at the store. Irish farm press puts the requirement at 120 hp or more to pump through around 1,000 m of hose.</li><li><strong>Supply line.</strong> Lay flat hose from the pump to the field, along headlands, hedges and lanes, sometimes crossing roads under ramps or through culverts.</li><li><strong>Manifold or hydrant at the field.</strong> Where supply meets drag, often with a valve and flow meter.</li><li><strong>Drag hose.</strong> The length the tractor pulls behind it, laid in a loop and worked back and forth across the field.</li><li><strong>Applicator.</strong> A trailing shoe, trailing hose (dribble bar) or injector on the tractor, with a flow meter and swivel on the hose connection.</li></ol>',
    },
    {
      type: 'figure',
      imageId: FIG['fig-umbilical-reel'],
      captionPrefix: 'FIG. 01',
      caption: 'A tractor-mounted reel lays the supply line out from the store and winds it back after the job.',
      aspectRatio: '16/9',
    },
    {
      type: 'direct_answer',
      question: 'What is a slurry umbilical system?',
      answer:
        'A slurry umbilical system pumps slurry from the store through a lay flat supply line and a drag hose to an applicator on a tractor, instead of carrying it in a tanker. The tractor pulls the drag hose behind it while spreading, so it carries no load, causes far less soil compaction and makes no road trips.',
    },

    { type: 'section_head', number: '/02', title: 'Why farms and contractors use them.', anchor: 'why' },
    {
      type: 'paragraph',
      html: 'Teagasc, Ireland’s farm advisory service, notes that an umbilical low-emission unit covers ground quickly and is far lighter than a tanker, avoiding compaction — which makes it suited to spreading into growing cereal crops at the right growth stage. The applicator enters the field once, so there is less mud on roads and no shuttle traffic between yard and field. Irish farm press has reported outputs above 25,000 litres an hour on farm systems and up to 60,000 litres an hour on contractor rigs. The rules have pushed the other way too: low-emission spreading is now compulsory for many farms in Ireland, Germany, Denmark, the Netherlands and Scotland — see <a href="/blog/low-emission-slurry-spreading-rules-europe">low-emission slurry spreading rules in Europe</a>.',
    },

    { type: 'section_head', number: '/03', title: 'The two hoses.', anchor: 'hoses' },
    {
      type: 'comparison_table',
      caption: 'Supply line vs drag hose',
      columns: ['Property', 'Supply line', 'Drag hose'],
      rows: [
        { cells: ['What it does', 'Carries slurry from the pump to the field', 'Is pulled behind the tractor while spreading'] },
        { cells: ['Movement', 'Lies still once laid', 'Dragged and turned all day'] },
        { cells: ['Wall', 'Standard wall, long lengths', 'Heavier wall, high abrasion and kink resistance'], highlight: true },
        { cells: ['Typical bore', 'Often one or two sizes larger', '4" most common; 5"–6" for more output'] },
        { cells: ['Our hose', 'TPU slurry supply hose, 5"–16", 14–15 bar (10 bar at 16")', 'TPU slurry drag hose, 2-1/2"–8", red for visibility'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/tpu-lay-flat-slurry-supply-hose">TPU slurry supply hose</a> comes in lengths up to 400 m to cut joints, and resists hydrolysis, UV and weather on long outdoor runs. The <a href="/p/tpu-lay-flat-slurry-drag-hose">TPU slurry drag hose</a> has a heavier wall — 2.7 mm at 2-1/2" up to 6.0 mm at 8" — extruded through the jacket in one pass with no adhesive to fail, and resists abrasion, kinking, hydrolysis and fungus. Sizing both is covered in <a href="/blog/slurry-drag-hose-sizing-and-life">slurry drag hose sizing and life</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Couplings and handling.', anchor: 'couplings' },
    {
      type: 'paragraph',
      html: 'Drag hose is coupled and uncoupled in the field with wet, gloved hands, so couplings matter. Our <a href="/p/lay-flat-slurry-hose-coupling">slurry hose couplings</a> have knurled grip ribs, a round body that reduces stress concentration, and hard-anodised aluminium that resists manure; the 4", 5" and 6" sizes intermate without adapters, and so do the 7" and 8". For handling, a <a href="/p/tractor-mounted-lay-flat-hose-reel">tractor-mounted reel</a> holds about 610 m of 6" lay flat and lays or recovers it from the tractor hydraulics; a <a href="/p/lay-flat-hose-mover">hose mover</a> relocates long lines between fields without dragging them; and a <a href="/p/portable-lay-flat-hose-winder">portable winder</a> rolls up shorter lengths of 6" to 12".',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Measure what you spread.',
      body: 'Low-emission rules are about rate as well as method. A flow meter on the applicator, calibrated for your slurry, is the only way to know the application rate from an umbilical system — the pump’s output varies with slurry thickness and hose length.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How long is the hose on an umbilical system?', answer: 'A typical farm set-up runs around 1,000 m of hose between store and applicator; contractor systems often run more. Output falls as length rises, so bore and pump must be matched to the distance.' },
        { question: 'How much horsepower does an umbilical system need?', answer: 'Irish farm press puts it at 120 hp or more to pump through about 1,000 m, and over 100 hp to pull the drag hose.' },
        { question: 'Is an umbilical system low-emission?', answer: 'The applicator makes it low-emission — trailing shoe, trailing hose or injection. The umbilical makes it light on the ground and keeps tankers off the road.' },
        { question: 'What is the difference between supply hose and drag hose?', answer: 'Supply hose lies still from pump to field; drag hose is pulled behind the tractor and needs a heavier wall and more abrasion resistance.' },
        { question: 'Can different hose sizes be joined?', answer: 'Yes. Our 4", 5" and 6" slurry couplings intermate without adapters, as do the 7" and 8".' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For umbilical systems',
      skus: ['IH-LF-TSS', 'IH-LF-TSD', 'IH-LF-CAG', 'IH-LF-EHR', 'IH-LF-EHM', 'IH-LF-EPW'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hose-reels-winders',
      label: 'Lay flat hose reels and winders',
      blurb: 'Tractor reels, hose movers and portable winders for umbilical systems.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'ireland',
      label: 'Umbilical hose supply to Ireland',
      blurb: 'Supply line, drag hose, couplings and reels for Irish farms and contractors.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'netherlands',
      label: 'Umbilical hose supply to the Netherlands',
      blurb: 'Sleepslang and supply hose for Dutch contractors.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'denmark',
      label: 'Umbilical hose supply to Denmark',
      blurb: 'Drag and supply hose for Danish slurry application.',
    },
    {
      type: 'related_articles',
      slugs: ['low-emission-slurry-spreading-rules-europe', 'slurry-drag-hose-sizing-and-life', 'lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-couplings-guide', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'System figures from Irish farm press (2014, 2025) and Teagasc (2024). Hose and equipment facts from the Indus slurry hose, coupling and reel listings.',
    },
    {
      type: 'cta_block',
      heading: 'Building or re-hosing an umbilical system?',
      body: 'Send your pump, distances, application rates and applicator. We will size supply line and drag hose and quote couplings and reels with them.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
