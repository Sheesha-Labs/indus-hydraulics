import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Snowmaking hose. Facts checked 2026-10-13: machine-made snow density 350–600 kg/m³ (The
 * Cryosphere 2017), Austrian resort water use ≈3,500 m³/ha/season (IMC 2025 abstract), losses can
 * exceed 50% (EGU 2016), ≈ −2.5 °C wet-bulb start (general reference, hedged). Lance pressures are
 * given only as "tens of bar" (single maker datasheet). IH-LF-TSM has no published pressure table.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'snowmaking-hose-guide',
  title: 'Snowmaking hose: what it must survive between the hydrant and the snow gun',
  excerpt:
    'Snowmaking puts water at high pressure through hose lying on snow at well below freezing, moved from hydrant to hydrant by crews in the dark. Ordinary hose stiffens, kinks and freezes. What a snowmaking hose must do, how much water a resort moves, how to choose and connect hose for fan guns and lances, and how to stop lines freezing.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Snowmaking Hose: Choosing Hose for Snow Guns and Hydrants',
  seoDescription:
    'What snowmaking hose must survive: cold flexibility, pressure, abrasion and UV. Water use per hectare, hydrant-to-gun connections for fan guns and lances, draining to prevent freezing, and choosing TPU lay flat hose.',
  focusKeyword: 'snowmaking hose',
  publishedAt: '2026-10-13T21:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A snowmaking hose has to stay flexible well below freezing, carry high pressure, resist abrasion on ice and be visible on snow.',
        'Resorts move a lot of water: Austrian resorts used on average about 3,500 m³ per hectare of piste per season.',
        'Machine-made snow weighs 350–600 kg/m³, so a cubic metre of water makes roughly 1.7 to 2.9 m³ of snow.',
        'Fan guns and lance or tower guns run at different pressures — match the hose rating to the hydrant pressure, not the gun’s nominal figure.',
        'Drain hose between moves and at the end of a session; water left in a line freezes and splits it.',
      ],
    },
    {
      type: 'lead',
      html: 'At a ski area, snowmaking begins when the air is cold and dry enough — typically around −2.5 °C wet-bulb temperature — and often runs through the night. A pumped network delivers water under pressure to hydrants along the pistes; from each hydrant a short hose feeds a fan gun or lance, and as the snow builds the crew moves guns and hoses to the next hydrant. The hose is the one component that is handled constantly, at the coldest time of day, on ice.',
    },

    { type: 'section_head', number: '/01', title: 'How much water.', anchor: 'water' },
    {
      type: 'paragraph',
      html: 'Machine-made snow is dense: research measurements put it at 350 to 600 kg/m³, so each cubic metre of water makes roughly 1.7 to 2.9 m³ of snow. Across a season the volumes are large — Austrian resorts used on average about 3,500 m³ of water per hectare of piste, and French figures go up to about 4,000 m³/ha — and field studies have found that over half of the water can be lost to evaporation, sublimation and wind drift. That water reaches each gun through a hydrant and, usually, a length of hose.',
    },

    { type: 'section_head', number: '/02', title: 'What the hose must survive.', anchor: 'requirements' },
    {
      type: 'figure',
      imageId: FIG['fig-snow-hydrant'],
      captionPrefix: 'FIG. 01',
      caption: 'The hydrant-to-gun connection is short, but it is handled in the dark, on ice, at the coldest hour.',
      aspectRatio: '16/9',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Cold flexibility.</strong> PVC and many rubbers stiffen sharply below freezing; a stiff hose kinks, cracks at folds and is hard to handle in gloves.</li><li><strong>Pressure.</strong> Snowmaking networks run at high pressure to atomise water; high-pressure lance and tower systems can run at several tens of bar.</li><li><strong>Abrasion.</strong> Hose is dragged over ice, rock and snow-groomer tracks.</li><li><strong>UV.</strong> High-altitude sun and snow glare age covers quickly.</li><li><strong>Visibility.</strong> A hose on the piste must be seen by groomers, skiers and crews — which is why snowmaking hose is usually yellow or orange.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/tpu-lay-flat-snowmaking-hose">TPU snowmaking hose</a> is made for exactly this: a TPU liner and cover around a woven jacket that stay flexible in the cold, resist abrasion, UV and chemicals, and come in high-visibility yellow. TPU hose in our range is rated down to −50 °C. A per-size pressure table is not published for this line, so send the hydrant pressure, bore, length and couplings and we will confirm the rating against your system.',
    },
    {
      type: 'direct_answer',
      question: 'What hose is used for snowmaking?',
      answer:
        'A pressure-rated hose that stays flexible well below freezing — usually TPU lay flat or a cold-rated rubber hose in high-visibility yellow — connecting the snow hydrant to the fan gun or lance. It must be rated for the hydrant pressure and drained between moves so it cannot freeze.',
    },

    { type: 'section_head', number: '/03', title: 'Fan guns, lances and pressure.', anchor: 'guns' },
    {
      type: 'paragraph',
      html: 'Fan guns combine a fan with nozzle rings and are moved around the slope; lance and tower guns are tall, fixed or semi-fixed and rely on water pressure and compressed air. Both are fed from hydrants, but pressures differ by system and by position on the mountain — hydrants low on the network see the static head of everything above them. Rate the hose on the <strong>highest hydrant pressure it will ever be connected to</strong>, and match the couplings to the hydrant and gun connections used across the resort so any hose fits any hydrant.',
    },

    { type: 'section_head', number: '/04', title: 'Stopping hose from freezing.', anchor: 'freezing' },
    {
      type: 'prose',
      html: '<ol><li><strong>Keep water moving</strong> while the gun runs; a flowing line rarely freezes.</li><li><strong>Drain before moving.</strong> Close the hydrant, open the drain, and lift the hose to empty it before dragging it to the next position.</li><li><strong>Drain at shutdown.</strong> A full hose left on the slope overnight freezes solid and can split.</li><li><strong>Coil lay flat hose flat and empty</strong> for transport by snowmobile or groomer.</li><li><strong>Inspect at the start of each season</strong> for cuts, cover wear and damaged couplings.</li></ol>',
    },
    {
      type: 'paragraph',
      html: 'The same hose serves indoor snow centres, including those in the Gulf, where the conditions are reversed: cold inside the hall, extreme heat in the plant areas outside. See <a href="/blog/lay-flat-hose-in-gulf-heat">lay flat hose in Gulf heat</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why is snowmaking hose yellow?', answer: 'For visibility on snow — to groomer drivers, skiers and the crews moving guns at night.' },
        { question: 'What temperature can snowmaking hose take?', answer: 'Our TPU hose is rated down to −50 °C and stays flexible in the cold.' },
        { question: 'How much water does snowmaking use?', answer: 'Austrian resorts used on average about 3,500 m³ of water per hectare of piste per season. One cubic metre of water makes roughly 1.7 to 2.9 m³ of machine-made snow.' },
        { question: 'How do I stop a snowmaking hose freezing?', answer: 'Keep water flowing while the gun runs, and drain the hose before moving it and at shutdown.' },
        { question: 'What pressure rating does snowmaking hose need?', answer: 'At least the highest hydrant pressure on your network. Send the hydrant pressure, bore and couplings and we will confirm the rating.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For snowmaking',
      skus: ['IH-LF-TSM', 'IH-LF-TDW', 'IH-LF-CER'],
    },
    {
      type: 'category_link',
      slug: 'tpu-lay-flat-hoses',
      label: 'TPU lay flat hoses',
      blurb: 'Including high-visibility snowmaking hose that stays flexible in the cold.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'norway',
      label: 'Snowmaking hose supply to Norway',
      blurb: 'Cold-flexible hose for Norwegian ski areas.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'italy',
      label: 'Snowmaking hose supply to Italy',
      blurb: 'Hose for Alpine and Apennine snowmaking networks.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'france',
      label: 'Snowmaking hose supply to France',
      blurb: 'Hose and couplings for French ski resorts.',
    },
    {
      type: 'related_articles',
      slugs: ['tpu-vs-nbr-vs-pvc-lay-flat-hose', 'lay-flat-hose-pressure-ratings', 'why-lay-flat-hose-fails', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Snow density from The Cryosphere (2017); water use from studies of Austrian and French resorts; losses from EGU 2016. Hose facts from the Indus TPU snowmaking hose listing.',
    },
    {
      type: 'cta_block',
      heading: 'Re-hosing a snowmaking network?',
      body: 'Send the hydrant pressures, gun types, bore, length per hydrant and couplings. We will confirm rating and quote.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
