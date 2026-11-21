import type { BlogArticleSeed } from '../shared'

/**
 * Suction hose vs delivery hose: the general difference. Figures are live listing values from the
 * suction-hoses and water-suction-delivery-hoses shelves: EPDM/PE suction hose (IH-LF-SEP) 1" to 6",
 * vacuum rated to 0.95 bar, 1.4 to 3.0 bar working at 40 °C by size, rigid PE helix; 10 bar water S&D
 * hose (IH-IH-A210) 25 to 152 mm, 30 bar burst, textile plies and wire helix, printed 700 mmHg, -20 to
 * +70 °C; 16 bar S&D (IH-IH-A216) 51 to 203 mm, 48 bar burst, double helix, -35 to +70 °C; PVC S&D hoses
 * (IH-IH-DELVAC 19 to 51 mm, 4-8 bar; IH-IH-IRRIBULK 25 to 152 mm, 3-8 bar; both -10 to +55 °C, 3:1);
 * clear PVC discharge hose with rigid helix (IH-HS-1500) 3/4" to 8". Atmospheric pressure (about
 * 1 bar at sea level) and the ~10.3 m theoretical suction lift for water are standard physics.
 * No vacuum figure is given for any listing that does not publish one.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'suction-hose-vs-delivery-hose',
  title: 'Suction hose vs delivery hose: what is different, and which side of the pump each goes',
  excerpt:
    'A suction hose has a rigid helix so it stays round under vacuum on the inlet side of a pump. A delivery hose only has to hold positive pressure on the outlet side, so it can be lighter, or lay flat. How to tell them apart, and how to choose.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Suction Hose vs Delivery Hose: The Difference',
  seoDescription:
    'The difference between suction hose and delivery hose: helix, vacuum vs pressure, which side of the pump, suction and delivery hose, and how to choose.',
  focusKeyword: 'difference between suction hose and delivery hose',
  publishedAt: '2026-11-21T10:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between suction hose and delivery hose?',
      answer:
        'A suction hose goes on the inlet side of a pump, where the pressure inside is below atmospheric, so it has a rigid helix that stops it collapsing. A delivery (discharge) hose goes on the outlet side, where the pressure inside is positive, so it needs pressure strength rather than crush resistance. A suction and delivery hose is built to do both.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The difference is the direction of the load. Suction hose is squeezed from outside by the atmosphere; delivery hose is pushed outward by the pump.',
        'A suction hose carries a rigid helix of plastic or wire. A delivery-only hose usually has none, which is why lay flat hose works on the outlet side and fails on the inlet.',
        'Suction lift is capped by the atmosphere: about 1 bar at sea level, worth about 10.3 m of water in theory and less in practice.',
        'Suction and delivery (S&D) hose has a helix and a pressure rating, so one hose can serve either side. Read both ratings before using it on the outlet.',
        'Choose by side of the pump first, then bore, then pressure, temperature and fluid.',
      ],
    },
    {
      type: 'lead',
      html: 'Every pump has two hoses, and they do opposite jobs. People ask for “suction hose” when they mean any hose with a spiral in it, and for “delivery hose” when they mean anything that is not. The names come from the side of the pump the hose sits on, and that side decides how it is built. This article sets out the general difference. For the specific case of a pump with a lay flat outlet, read <a href="/blog/suction-hose-vs-lay-flat-hose">suction hose vs lay flat hose</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Vacuum on one side, pressure on the other.', anchor: 'vacuum-vs-pressure' },
    {
      type: 'paragraph',
      html: 'A centrifugal or diaphragm pump lifts liquid by lowering the pressure at its inlet. The atmosphere pushing on the water surface does the rest, driving liquid up the suction hose into the pump. So the inside of a suction hose runs below atmospheric pressure while the outside sits at atmospheric. The net force is inward: the hose is being crushed.',
    },
    {
      type: 'paragraph',
      html: 'That also sets a hard ceiling. Atmospheric pressure at sea level is about 1 bar, and a perfect vacuum can only remove that 1 bar. In water that equals about 10.3 m of lift in theory. Friction, fittings, temperature and the pump’s own requirements take a large share of it, so real suction lifts are much shorter. No hose can improve on the atmosphere; a good one only avoids wasting it.',
    },
    {
      type: 'paragraph',
      html: 'On the outlet the pump adds pressure. The inside of a delivery hose is above atmospheric, the force is outward, and the hose is being inflated. It needs reinforcement that resists bursting, not crushing. A hose that does one job well can be useless at the other.',
    },

    { type: 'section_head', number: '/02', title: 'How the construction differs.', anchor: 'construction' },
    {
      type: 'paragraph',
      html: 'The visible difference is the helix: a spiral of rigid plastic or steel wire built into the wall. It holds the hose round when the inside is under vacuum. Our <a href="/p/epdm-pe-suction-hose">EPDM/PE suction hose</a> uses a rigid polyethylene helix and is vacuum rated to 0.95 bar, in 1" to 6". Its pressure rating is modest, 1.4 to 3.0 bar at 40 °C depending on size, because the job is the inlet.',
    },
    {
      type: 'paragraph',
      html: 'Delivery hose drops the helix or relies on textile plies alone. Lay flat hose is the extreme case: no helix at all, so it rolls flat when empty and stores in a small space. Under positive pressure it rounds out and carries a lot of water a long way. Put it on a pump inlet and it closes up the moment the pump pulls. That is why lay flat is a delivery hose only. See the <a href="/blog/lay-flat-hose-guide">lay flat hose guide</a> for the outlet side.',
    },
    {
      type: 'comparison_table',
      caption: 'Suction hose and delivery hose compared',
      columns: ['Property', 'Suction hose', 'Delivery hose'],
      rows: [
        { cells: ['Pump side', 'Inlet', 'Outlet'] },
        { cells: ['Pressure inside', 'Below atmospheric (vacuum)', 'Above atmospheric'] },
        { cells: ['Main load on the wall', 'Crushing, from outside', 'Bursting, from inside'] },
        { cells: ['Helix', 'Rigid plastic or wire, always', 'Often none; lay flat has none'] },
        { cells: ['Key rating', 'Vacuum', 'Working pressure'] },
        { cells: ['Shape when empty', 'Stays round', 'Round, or flat for lay flat hose'] },
        { cells: ['Weight and stiffness', 'Heavier, stiffer for the bore', 'Lighter; lay flat rolls up'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Suction and delivery hose does both.', anchor: 'suction-and-delivery' },
    {
      type: 'paragraph',
      html: 'Most hoses sold for water pumps are suction and delivery (S&D) hoses: a helix for the inlet plus enough pressure strength for the outlet. They let one coil serve either side, which is useful on site. The ratings vary a great deal, so check both before putting one on a pump outlet. Our <a href="/c/water-suction-delivery-hoses">water suction and delivery hoses</a> cover the range:',
    },
    {
      type: 'comparison_table',
      caption: 'Suction and delivery hoses on our listings',
      columns: ['Hose', 'Bore', 'Working pressure', 'Reinforcement', 'Temperature'],
      rows: [
        { cells: ['Clear PVC S&D', '19 to 51 mm', '4 to 8 bar by size', 'PVC spiral helix', '-10 to +55 °C'] },
        { cells: ['Medium-duty PVC S&D', '25 to 152 mm', '3 to 8 bar by size', 'PVC spiral helix', '-10 to +55 °C'] },
        { cells: ['Rubber water S&D, 10 bar', '25 to 152 mm', '10 bar', 'Textile plies, wire helix', '-20 to +70 °C'] },
        { cells: ['Rubber water S&D, 16 bar', '51 to 203 mm', '16 bar', 'Textile plies, double helix', '-35 to +70 °C'] },
        { cells: ['EPDM/PE suction', '1" to 6"', '1.4 to 3.0 bar at 40 °C', 'Rigid PE helix', 'Not published'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The PVC hoses are light and cheap and suit agriculture and general water transfer. The <a href="/p/water-suction-delivery-hose-10-bar">10 bar rubber S&D hose</a> is printed with its 700 mmHg vacuum rating alongside the pressure, and the <a href="/p/water-suction-delivery-hose-16-bar">16 bar version</a> takes the large bores and the higher outlet pressures. The PVC hoses lose strength as they warm up, which matters in Gulf summers. <a href="/blog/pvc-or-rubber-suction-hose">PVC or rubber suction hose</a> covers that choice in detail.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A helix does not make a hose a suction hose.',
      body: 'Some hoses with a rigid helix are sold as discharge hose, such as our clear PVC discharge hose with rigid helix. The helix gives kink resistance and lets the hose lie on the ground without flattening. Use a hose on the inlet only if the listing gives a vacuum or suction rating for it.',
    },

    { type: 'section_head', number: '/04', title: 'How to choose.', anchor: 'choose' },
    {
      type: 'prose',
      html: '<ul><li><strong>Side of the pump.</strong> Inlet means a helix and a vacuum rating. Outlet means a pressure rating above the pump’s shut-off pressure.</li><li><strong>Bore.</strong> Match the pump connection, and never neck the suction down. A smaller suction bore adds friction where there is least pressure to spare. Our <a href="/c/suction-hoses">suction hoses</a> and S&D hoses run up to 6" and 203 mm respectively.</li><li><strong>Length.</strong> Keep the suction short and the pump close to the water. Delivery can be long; size it by friction loss.</li><li><strong>Fluid and temperature.</strong> Water, slurry, fuel and chemicals each need a suitable tube. Fuel and oil need their own hose; read <a href="/blog/oil-suction-and-discharge-hose">oil suction and discharge hose</a>. For dewatering, <a href="/blog/water-suction-and-dewatering-hose">water suction and dewatering hose</a> goes further.</li><li><strong>Ends.</strong> Camlock, threaded or flanged, fitted to suit the pump. A leaking suction joint lets air in and the pump loses prime.</li></ul>',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'prose',
      html: '<p>We quote and ship suction, delivery and S&D hose from Dubai, UAE, in cut lengths or as made-up assemblies. To quote quickly we need:</p><ul><li>Which side of the pump, or both, and the pump make and model if you have it</li><li>Bore and length of each hose</li><li>The fluid and its temperature range</li><li>Suction lift and delivery pressure, if known</li><li>End fittings for each end, and the quantity</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is suction hose the same as discharge hose?', answer: 'No. Suction hose works on the pump inlet under vacuum and needs a rigid helix to stay round. Discharge hose works on the outlet under positive pressure. A suction and delivery hose is built to do both jobs.' },
        { question: 'Can I use delivery hose on the suction side?', answer: 'Not unless it has a vacuum rating. A hose without a helix, such as lay flat, collapses as soon as the pump pulls and the pump starves.' },
        { question: 'What types of suction hose are there?', answer: 'The common types are PVC hose with a rigid PVC helix, rubber hose with textile plies and a steel wire helix, and specialist hoses for fuel, oil, chemicals or food. Choose by fluid, temperature, bore and the vacuum rating.' },
        { question: 'What sizes does suction hose come in?', answer: 'On our listings, from 19 mm up to 203 mm in suction and delivery hose, and 1" to 6" in the EPDM/PE suction hose. Match the bore to the pump inlet.' },
        { question: 'Which water suction and delivery hose do I need for a pump?', answer: 'Use an S&D hose with a helix on the inlet, sized to the pump connection. On the outlet, use either the same hose, if its working pressure is above the pump’s shut-off pressure, or lay flat hose for long runs.' },
        { question: 'Why does my pump lose prime with a new suction hose?', answer: 'Usually air is getting in at a fitting or clamp, or the hose is collapsing under vacuum because it has no helix or the wrong vacuum rating. Check the joints first.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Suction and delivery hoses',
      skus: ['IH-LF-SEP', 'IH-IH-A210', 'IH-IH-A216', 'IH-IH-IRRIBULK', 'IH-IH-DELVAC', 'IH-HS-1500'],
    },
    {
      type: 'category_link',
      slug: 'water-suction-delivery-hoses',
      label: 'Water suction & delivery hoses',
      blurb: 'PVC and rubber suction and delivery hoses for pumps, from 19 mm to 203 mm, with working pressures up to 16 bar.',
    },
    {
      type: 'related_articles',
      slugs: ['suction-hose-vs-lay-flat-hose', 'pvc-or-rubber-suction-hose', 'oil-suction-and-discharge-hose', 'water-suction-and-dewatering-hose'],
    },
    {
      type: 'cta_block',
      heading: 'Suction, delivery or both?',
      body: 'Tell us the pump, the fluid and the bore and length on each side. We will match the hose and the ends, and quote from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
