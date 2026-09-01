import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Names standard families, never an OEM table.
 *
 * Chinese machines are built to metric and BSP conventions far more often than
 * to inch flare ones, and high-pressure pump and motor connections are flanged
 * on larger machines the same way they are everywhere. That is as specific as
 * the evidence we hold allows, so the article stops there and spends the rest
 * of its length on how to tell the families apart in the hand.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fittings-on-a-chinese-excavator',
  title: 'Fittings on a Chinese excavator: which thread families to expect',
  excerpt:
    'Metric 24° cone and BSP cover most of what you will meet, with flanges on the big lines. What each looks like in the hand, and why the badge on the machine never settles it.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Fittings on a Chinese excavator — thread families to expect',
  seoDescription:
    'The thread families commonly found on Chinese-built excavators and loaders — metric 24° cone, BSP and SAE flanges — how to tell them apart, and what a workshop should stock.',
  focusKeyword: 'fittings on a chinese excavator',
  publishedAt: '2026-09-01T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Expect metric 24° cone (DIN 2353 family) and BSP parallel as the two you will meet most.',
        'Larger pump, motor and main-line connections are usually flanged rather than threaded.',
        'A 24° metric cone and a 60° BSP cone are easy to confuse by eye and impossible to confuse with a seat gauge.',
        'Machines built for export markets are not always built to the same convention as machines built for the domestic one.',
        'The machine tells you what to carry. The fitting in your hand tells you what to fit — and only measurement settles that.',
      ],
    },
    {
      type: 'lead',
      html: 'The fittings on a Chinese excavator are not exotic; the trouble is that two of the families involved look alike. Chinese wheel loaders, excavators and backhoes are on almost every site we ship to, and the first time a workshop re-hoses one it usually discovers that the adapter drawer built around an older European or Japanese fleet does not cover it. The good news is that the range of families involved is small. The bad news is that two of them look similar enough to be swapped by anyone in a hurry.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The two families that cover most of the machine.',
      anchor: 'the-two-families',
    },
    {
      type: 'paragraph',
      html: 'The first is the <strong>metric 24° cone</strong> — the DIN 2353 world of bite-type tube couplings and their hose-end equivalents, in light and heavy series. The thread is metric, the seat is a 24° cone inside the female, and the male carries either a matching cone or a cone with an O-ring in it. The second is <strong>BSP parallel</strong>, where the thread is Whitworth form and the seal is made either on a 60° cone or on a bonded seal under the hex.',
    },
    {
      type: 'comparison_table',
      caption: 'Telling them apart with what is in your pocket',
      columns: ['Property', 'Metric 24° cone', 'BSP parallel'],
      rows: [
        { cells: ['Thread form', '60° metric, whole-millimetre pitch', '55° Whitworth, threads per inch'] },
        { cells: ['Seat', '24° cone in the female', '60° cone, or flat face for a bonded seal'], highlight: true },
        { cells: ['Typical male marking', 'M18×1.5, M22×1.5 and similar', 'G1/4, G3/8, G1/2 and similar'] },
        { cells: ['What a pitch gauge shows', 'A clean metric pitch', 'A whole number of threads per inch'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never judge a seat by looking into the port.',
      body: 'A 24° cone and a 60° cone are twenty-one degrees apart and look nearly identical down a dark bore with oil in it. A seat gauge costs almost nothing and settles it in a second; a wrong seat seals for a day, then weeps, then washes the seat out and takes the port with it.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Where the flanges are.',
      anchor: 'flanges',
    },
    {
      type: 'paragraph',
      html: 'Pump outlets, motor connections and the main boom lines on larger machines are commonly <strong>four-bolt split flanges</strong> rather than threaded connections, because a thread big enough for that bore and pressure would be impractical to make up in a confined space. Flanges are identified by their bolt pattern and flange-head dimensions rather than by a thread, which makes them the easiest thing on the machine to specify correctly from a photograph and a tape measure.',
    },
    {
      type: 'category_link',
      slug: 'sae-flange-fittings',
      label: 'SAE flange fittings',
      blurb: 'Code 61 and Code 62 heads, halves and bolt kits.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Why the badge does not settle it.',
      anchor: 'the-badge',
    },
    {
      type: 'paragraph',
      html: 'Three things move a machine away from whatever it left the factory with. It may have been <strong>built for a different market</strong> — export specifications differ. It may have been <strong>repaired</strong>, and a repair uses whatever the last workshop had, which is how a machine ends up with two thread families on one boom. And attachments arrive with their own conventions, so a breaker or an auger can be a different world from the carrier it hangs on.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'This is why we quote from the fitting, not the machine.',
      body: 'Send a photograph of the end and the measurements — across the thread, the pitch, and the seat angle if you have a gauge — rather than the make and model. A part identified from a measurement is right; a part identified from a model number is a probability.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'What to carry if this is your fleet.',
      anchor: 'what-to-carry',
    },
    {
      type: 'paragraph',
      html: 'A workshop supporting these machines is usually best served by depth in two families rather than breadth across six: metric 24° cone in the common bores, BSP parallel with a box of bonded seals, and the adapters that bridge between them. Add flange halves and bolt kits for the sizes on your largest machines, because those are the ones that strand a machine when they fail.',
    },
    {
      type: 'product_embed',
      heading: 'The two families, stocked in Dubai',
      skus: ['IH-AD-DIN-034', 'IH-AD-BSP-038'],
      note: 'Bridging adapters between them are the third thing worth having in the drawer.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Are Chinese machines built to BSP or metric?',
          answer:
            'Both appear, frequently on the same machine, and the mix varies by manufacturer, model and the market the machine was built for. Expect to meet metric 24° cone and BSP parallel, carry adapters for both, and confirm each fitting by measurement rather than by assumption.',
        },
        {
          question: 'Can I use a JIC fitting in a metric port because it threads in?',
          answer:
            'No. A thread that engages is not the same as a seal that holds — the seat angles are different, so the two surfaces touch on a line rather than a face. It will hold for a while and then it will not, and by then the port is damaged.',
        },
        {
          question: 'Do you supply fittings for machines you cannot identify?',
          answer:
            'Yes — that is the normal case. Send photographs of the end, the thread measured across the crests, the pitch, and the seat if you can see it. We name the part from that.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Mixed fleet, no local stockist?',
      body: 'Send photographs and measurements of the ends you keep replacing. We will name the parts, tell you which adapters bridge the families you actually have, and quote them as one consignment.',
      quoteLabel: 'Identify a fitting',
    },
  ],
}

export default ARTICLE
