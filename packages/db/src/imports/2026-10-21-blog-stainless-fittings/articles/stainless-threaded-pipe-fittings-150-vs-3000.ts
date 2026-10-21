import type { BlogArticleSeed } from '../shared'
import { SOCKET_WELD_GAP } from '../diagrams'
import { stockList } from '../products'

/**
 * Cast 150# vs forged 3000# stainless threaded fittings, socket-weld fittings and pipe nipples. Sources read
 * 2026-10-21: MSS SP-114 title and scope (corrosion-resistant threaded and socket-welding fittings, Class 150 and
 * 1000; current edition 2018); a fitting maker's booklet reproducing the SP-114 Class 150 table for heavy cast 304/316
 * (300 psi at −20 to 150 °F falling to 150 psi at 350 °F; A351 castings; B1.20.1 threads) — maker not named;
 * ASME B16.11 scope (threaded Class 2000/3000/6000, socket-weld 3000/6000/9000); Wermac B16.11 pages (class-to-
 * schedule correspondence; sizes; 1/16" socket-weld gap); ASTM A733 abstract (stainless nipples 1/8–12 in, NPT both
 * ends); Swagelok MS-13-77 (NPT 60° thread, 1°47' taper, seal on the thread, sealant needed and reduces galling, no
 * torque standard for tapered threads).
 * NOT used: "150 psi saturated steam" for Class 150 (beyond the table's 350 °F row); any Class 1000 figure.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-threaded-pipe-fittings-150-vs-3000',
  title: 'Stainless threaded pipe fittings: cast 150# vs forged 3000#, socket weld, and pipe nipples',
  excerpt:
    'Two stainless 1" elbows with the same NPT thread are not the same part: one is a cast Class 150 fitting for water and air, the other a forged Class 3000 fitting to ASME B16.11. How to tell them apart, what each is rated for, why a Class 3000 threaded fitting matches Sch 160 pipe but a Class 3000 socket weld matches Sch 80, the 1/16" socket-weld gap, and how to seal stainless NPT without galling it.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Threaded Fittings: 150# Cast vs 3000# Forged Explained',
  seoDescription:
    'Stainless threaded pipe fittings: cast Class 150 (MSS SP-114) vs forged Class 3000 (ASME B16.11), pressure ratings, class-to-schedule matching, socket-weld gap, NPT sealing and galling, and stainless pipe nipples.',
  focusKeyword: 'stainless steel threaded pipe fittings',
  publishedAt: '2026-10-21T16:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Cast Class 150 stainless fittings (MSS SP-114) are for moderate pressure: a maker table reproducing SP-114 gives 300 psi up to 150 °F, falling to 150 psi at 350 °F.',
        'Forged fittings to ASME B16.11 come in Classes 2000, 3000 and 6000 threaded and 3000, 6000 and 9000 socket weld — rated to match a pipe schedule, not a fixed psi.',
        'The same number means different walls: a Class 3000 threaded fitting matches Sch 160 pipe, a Class 3000 socket-weld fitting matches Sch 80.',
        'Leave about 1/16" (1.6 mm) between pipe end and socket shoulder before fillet-welding a socket-weld fitting.',
        'NPT seals on the thread and always needs sealant — which also lubricates stainless threads that would otherwise gall.',
      ],
    },
    {
      type: 'lead',
      html: 'Small-bore stainless piping — drains, vents, instrument take-offs, utility water and air, chemical dosing — is mostly threaded or socket-welded rather than butt-welded. The fittings look alike on a shelf, and buyers often order "1" stainless elbow, NPT" without saying which kind. This guide sets out the two threaded families, the socket-weld option, nipples, and how each is rated.',
    },

    { type: 'section_head', number: '/01', title: 'Cast Class 150: MSS SP-114.', anchor: 'cast' },
    {
      type: 'prose',
      html: '<p>The economical stainless threaded fitting is a <strong>casting</strong> — ASTM A351 CF8 (the cast equivalent of 304) or CF8M (316, with 2–3% molybdenum) — machined with NPT threads to ASME B1.20.1. The standard is <strong>MSS SP-114</strong>, "Corrosion Resistant Pipe Fittings, Threaded and Socket-Welding, Class 150 and 1000". You can usually tell a cast fitting by its rounded body and beaded band at each end.</p><p>Class 150 is a pressure–temperature rating, not a pressure. A fitting maker’s table reproducing SP-114 for heavy-pattern cast 304 and 316 gives:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Class 150 cast stainless threaded fittings, non-shock working pressure (maker table reproducing MSS SP-114)',
      columns: ['Material temperature', 'Maximum working pressure'],
      rows: [
        { cells: ['−20 to 150 °F (−28 to 65 °C)', '300 psi (20.6 bar)'], highlight: true },
        { cells: ['200 °F (93 °C)', '265 psi (18.2 bar)'] },
        { cells: ['250 °F (121 °C)', '225 psi (15.5 bar)'] },
        { cells: ['300 °F (148 °C)', '185 psi (12.8 bar)'] },
        { cells: ['350 °F (176 °C)', '150 psi (10.3 bar)'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The same table assumes the material is at the fluid temperature and allows interpolation between rows. One consequence worth noting: saturated steam at 150 psig is about 366 °F — beyond the table’s last row — so "150# for 150 psi steam" is not something this table supports. Ask the fitting maker for its own steam rating, or use forged fittings. Use cast 150# for water, air, low-pressure chemicals and process utilities; not for shock, vibration or cyclic service.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Forged Class 3000: ASME B16.11.', anchor: 'forged' },
    {
      type: 'prose',
      html: '<p>Where pressure, vibration or the piping class demand more, the fitting is <strong>forged</strong> — ASTM A182 F304/F316 bar or forgings — and dimensioned to <strong>ASME B16.11</strong>. B16.11 rates threaded fittings in Classes 2000, 3000 and 6000 and socket-weld fittings in Classes 3000, 6000 and 9000. The class says which pipe the fitting is built to match:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'ASME B16.11 class and the pipe schedule it matches',
      columns: ['Class', 'Threaded fitting matches', 'Socket-weld fitting matches'],
      rows: [
        { cells: ['2000', 'Sch 80 / XS', '—'] },
        { cells: ['3000', 'Sch 160', 'Sch 80 / XS'], highlight: true },
        { cells: ['6000', 'XXS', 'Sch 160'] },
        { cells: ['9000', '—', 'XXS'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>That is the trap: <strong>Class 3000 threaded</strong> is matched to Sch 160 pipe, because the thread cuts into the wall, while <strong>Class 3000 socket weld</strong> is matched to Sch 80. A forged fitting is rated as the pipe it matches, so its working pressure comes from the pipe rating for that schedule, grade and temperature — which is why our forged listings carry no single psi figure. Class 3000 threaded fittings are made from ½" to 2" (Class 2000 to 4"); socket-weld fittings are generally used at NPS 2 and below.</p>',
    },
    {
      type: 'standard_citation',
      standard: 'ASME B16.11',
      publisher: 'ASME',
      title: 'Forged Fittings, Socket-Welding and Threaded',
      summary:
        'Ratings, dimensions, tolerances, marking and material requirements for forged fittings: Class 2000, 3000 and 6000 for threaded ends and Class 3000, 6000 and 9000 for socket-weld ends.',
    },

    { type: 'section_head', number: '/03', title: 'Socket weld: leave the gap.', anchor: 'socket' },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'A socket-weld joint is a fillet weld at the socket mouth. The pipe is pushed home and pulled back about 1/16" (1.6 mm) before welding, so the weld can shrink without cracking its root.',
      alt: 'Half section of a socket-weld joint. The pipe sits inside the socket of a B16.11 fitting with a small gap of about 1/16 inch, 1.6 mm, between the pipe end and the socket shoulder. A fillet weld joins the fitting mouth to the pipe outside. A note says bottoming the pipe leaves no room for weld shrinkage and the root can crack as the joint cools.',
      svg: SOCKET_WELD_GAP,
    },
    {
      type: 'prose',
      html: '<p>The rule, attributed to the ASME B31 piping codes, is an expansion gap of about 1/16" (1.6 mm) between pipe end and socket shoulder — a nominal clearance, not a precise tolerance. Socket weld leaves a small crevice behind the pipe end, which is why hygienic and some corrosive services avoid it in favour of butt welds.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Sealing stainless NPT without galling it.', anchor: 'sealing' },
    {
      type: 'prose',
      html: '<p>NPT (ASME B1.20.1) is a 60° thread on a 1°47′ taper — 1 in 16 on diameter — and it seals on the thread itself, so it always needs a sealant. Swagelok makes the second reason explicit: sealant reduces the potential for galling, and two stainless threads forced together dry can cold-weld and seize. PTFE tape or a PTFE paste does both jobs. There is no standard torque or turn count for tapered threads, so stop at a firm make-up rather than chasing one more turn; a stainless thread that has started to bind is about to gall.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not over-drive a taper into a cast fitting.',
      body: 'A tapered male thread acts as a wedge. Forcing it too deep into a cast 150# fitting can split the casting; if the joint will not seal at a firm make-up, the threads or the sealant are wrong, not the torque.',
    },

    { type: 'section_head', number: '/05', title: 'Pipe nipples.', anchor: 'nipples' },
    {
      type: 'prose',
      html: '<p>A nipple is a short length of pipe threaded at both ends. ASTM A733 covers welded and seamless stainless nipples from 1/8" to 12" with NPT threads both ends. A "close" nipple is threaded along its whole length with no plain pipe between the threads. Order the schedule as well as the size — a Sch 80 seamless nipple is the match for Class 3000 forged fittings and for anything vibrating; welded Sch 40 suits general low-pressure work — and hex nipples where the joint must be made up with a spanner.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Cast 150#, forged 3000# or socket weld?',
      branches: [
        { condition: 'Water, air or mild chemicals, below ~150 psi, no shock?', outcome: 'Cast 150# threaded fittings.', sku: 'IH-PF-C90-B6' },
        { condition: 'Higher pressure, vibration, or a piping class that calls for B16.11?', outcome: 'Forged 3000# threaded fittings on Sch 80 or heavier nipples.', sku: 'IH-PF-F90-J6' },
        { condition: 'Must not leak through a thread, small bore, weld allowed?', outcome: 'Socket-weld fittings, with the 1/16" gap.' },
        { condition: 'Hygienic or crevice-sensitive service?', outcome: 'Neither — use butt-weld or sanitary fittings.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between 150# and 3000# stainless fittings?', answer: '150# fittings are cast (MSS SP-114) for moderate pressure; a maker table gives 300 psi at room temperature falling to 150 psi at 350 °F. 3000# fittings are forged to ASME B16.11 and rated to match Sch 160 pipe (threaded) or Sch 80 (socket weld).' },
        { question: 'What pressure is a 3000# threaded fitting rated for?', answer: 'B16.11 rates it to the pipe it matches — Sch 160 for a threaded Class 3000 fitting — at the grade and temperature in service. The pipe rating gives the figure.' },
        { question: 'Can I use 150# cast stainless fittings on steam?', answer: 'Only within the maker’s rating. The SP-114 Class 150 table reproduced by one maker ends at 150 psi at 350 °F, which is below the temperature of 150 psi saturated steam; ask for the maker’s steam rating or use forged fittings.' },
        { question: 'Why leave a gap in a socket weld?', answer: 'To give the fillet weld room to shrink as it cools. A pipe bottomed in the socket can crack the weld root. About 1/16" (1.6 mm) is the usual clearance.' },
        { question: 'How do I stop stainless NPT threads galling?', answer: 'Always use a sealant that also lubricates — PTFE tape or paste — and stop at a firm make-up. Dry stainless threads forced together can cold-weld.' },
        { question: 'What is a close nipple?', answer: 'A nipple threaded along its full length with no plain pipe between the threads — the shortest nipple for a given size.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Cast 150# and forged 3000# threaded fittings in 304 and 316, and stainless pipe nipples:</p>' + stockList(['stainless-steel-150-threaded-pipe-fittings', 'stainless-steel-3000-forged-threaded-fittings', 'stainless-steel-pipe-nipples']),
    },
    {
      type: 'product_embed',
      heading: 'Threaded fittings and nipples',
      skus: ['IH-PF-C90-B6', 'IH-PF-CT-B6', 'IH-PF-CU-B6', 'IH-PF-F90-J6', 'IH-PF-FT-J6', 'IH-PF-FU-J6', 'IH-PF-N6S8', 'IH-PF-N6H'],
    },
    { type: 'category_link', slug: 'stainless-steel-150-threaded-pipe-fittings', label: 'Cast 150# threaded fittings', blurb: '304 and 316 elbows, tees, couplings, unions, plugs and bushings.' },
    { type: 'category_link', slug: 'stainless-steel-3000-forged-threaded-fittings', label: 'Forged 3000# threaded fittings', blurb: 'ASME B16.11 forged elbows, tees, couplings, unions and caps.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'asme-b16-11', text: 'ASME B16.11 — Forged Fittings, Socket-Welding and Threaded, scope.', url: 'https://www.asme.org/codes-standards/find-codes-standards/b16-11-forged-fittings-socket-welding-threaded' },
        { id: 'mss-sp-114', text: 'MSS SP-114 — Corrosion Resistant Pipe Fittings, Threaded and Socket-Welding, Class 150 and 1000.', url: 'https://www.dinmedia.de/en/standard/mss-sp-114/314204682' },
        { id: 'wermac-threaded', text: 'Wermac. Threaded fittings to ASME B16.11.', url: 'https://wermac.org/fittings/threaded_general.html' },
        { id: 'wermac-sw', text: 'Wermac. Socket-weld fittings to ASME B16.11.', url: 'https://wermac.org/fittings/socket_weld_general.html' },
        { id: 'astm-a733', text: 'ASTM A733 — Welded and Seamless Carbon Steel and Austenitic Stainless Steel Pipe Nipples.', url: 'https://store.astm.org/a0733-25.html' },
        { id: 'swagelok-threads', text: 'Swagelok. Thread and End Connection Identification Guide, MS-13-77.', url: 'https://www.swagelok.com/downloads/webcatalogs/en/ms-13-77.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-steel-pipe-fittings-guide', 'stainless-steel-weld-outlets', 'stainless-steel-butt-weld-fittings', 'tube-fitting-end-connections'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Class 150 table from a maker booklet reproducing MSS SP-114; B16.11 classes and schedule matching from ASME and engineering references; NPT sealing from Swagelok. Confirm cast ratings with the fitting maker.',
    },
    {
      type: 'cta_block',
      heading: 'Threaded or socket-weld?',
      body: 'Send the size, pressure, temperature, medium and grade. We will say whether cast 150# is enough or the line needs forged 3000#, and quote the fittings and nipples together.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
