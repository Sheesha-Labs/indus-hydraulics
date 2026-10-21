import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Thermoplastic hose (SAE 100R7, R8, R18) and its fittings. Sources read 2026-10-21: Parker Parflex Catalog 4660
 * (56 Series permanent crimp for 518D R7, 520N/528N R8, 580N/588N R8, 53DM/538DM R18 (-4 to -10); "Electrical,
 * Non-Conductivity: SAE J517" for 518C, 518D, 528N, 578X, 588N, 538DM; orange = non-conductive; R8 520N/528N nylon tube
 * aramid reinforcement 5,000 psi at -3/-4 … 3,500 at -8, "lighter and smaller O.D. than 100R2"; 580N/588N to 2,000 psi
 * at -16; R18 53DM/538DM "3,045 psi constant pressure", −70 to 212 °F, over-the-sheave); Parflex bulletin 4660-518D
 * (aerial lift market, SAE J517 non-conductivity, ANSI A92.2, ISO 3949-R7-2, non-perforated cover, 4:1 per SAE J517 vs
 * 3:1 per ANSI A92.2 so two pressures on the layline; R7 ratings by dash; 56 Series and 51R field attachable). Parker
 * 4400 safety guide (§2.1.1 near high voltage only if approved, marked "nonconductive" and approved by the equipment
 * maker; "do not conclude that it is nonconductive"; thermoplastic shelf life unlimited). Gates crimp manual (shear-cut
 * thermoplastic hose and deburr). Listing copy (Parker 56 Series end forms; THY series for braided, pressure-wash,
 * thermoplastic and low-pressure hose; R7, R8 and R18 hoses).
 * NOT used: SAE J517 non-conductivity test values.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'thermoplastic-hose-fittings-guide',
  title: 'Thermoplastic hose fittings: R7, R8 and R18 hose, non-conductive hose and the 56 Series crimp ends',
  excerpt:
    'An orange thermoplastic hose on a bucket truck is not orange for show: Parker’s 518D is made and marked non-conductive to SAE J517 for work near power lines — and Parker warns never to assume any hose is non-conductive unless it is branded so. Thermoplastic R7, R8 and R18 hose, what each is for and rated at, the Parker 56 Series crimp fittings and THY series ends that go on them, and how to assemble them.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Thermoplastic Hose Fittings: R7, R8, R18 & Non-Conductive Hose',
  seoDescription:
    'A guide to thermoplastic hydraulic hose (SAE 100R7, R8, R18) and its crimp fittings: non-conductive orange hose for aerial lifts, pressure ratings by size, Parker 56 Series and THY series fittings, and assembly.',
  focusKeyword: 'thermoplastic hose fittings',
  publishedAt: '2026-10-21T21:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Thermoplastic hydraulic hose has a thermoplastic core — nylon in Parker’s R7 and R8 — and synthetic-fibre reinforcement such as aramid: SAE 100R7 (medium pressure), R8 (high pressure) and R18 (3,000 psi class).',
        'Non-conductive versions — orange in Parker’s range — are tested to SAE J517 for work near power lines; Parker’s 518D R7 is made for the aerial lift market and meets ANSI A92.2.',
        'Parker: never use hose near high voltage unless it is approved for it, marked "nonconductive", and approved by the equipment maker — and do not assume any hose is non-conductive unless it is branded so.',
        'Parker crimps its thermoplastic hoses with the 56 Series; 518D also takes the 51R field-attachable series.',
        'R8 is lighter and smaller in OD than 100R2 for the same pressure; R18 holds 3,045 psi constant and suits over-the-sheave use.',
      ],
    },
    {
      type: 'lead',
      html: 'Thermoplastic hose is the specialist of the hydraulic hose family: light, flexible, with a smooth low-friction cover, and — in its non-conductive form — the only hydraulic hose you should run up the boom of an aerial lift working near live lines. It also needs its own fittings. This guide covers the hose types, their ratings, and the crimp ends that go on them.',
    },

    { type: 'section_head', number: '/01', title: 'R7, R8 and R18.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Parker Parflex thermoplastic hose examples, working pressure psi',
      columns: ['Class', 'Parker hose', 'Ratings', 'Fittings'],
      rows: [
        { cells: ['SAE 100R7, non-conductive', '518D', '3,000 at -4, 2,250 at -6 to -10, 1,250 at -12, 1,000 at -16', '56 Series crimp; 51R field attachable'], highlight: true },
        { cells: ['SAE 100R8', '520N / 528N', '5,000 at -3 and -4, 4,500 at -5, 4,000 at -6, 3,500 at -8', '56 Series'] },
        { cells: ['SAE 100R8', '580N / 588N', '3,500 at -8, 2,750 at -10, 2,250 at -12, 2,000 at -16', '56 Series'] },
        { cells: ['SAE 100R18', '53DM / 538DM', '3,045 constant, -4 to -10', '56 Series'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parflex describes its R8 hoses as lighter and smaller in OD than 100R2 hose, and its R18 hose as excellent for over-the-sheave use, from −70 to 212 °F on petroleum fluids. The 518D layline carries two pressures because SAE J517 requires a 4:1 design factor for R7 while ANSI A92.2 accepts 3:1 for aerial devices. Parker notes thermoplastic shelf life is considered unlimited.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Non-conductive hose.', anchor: 'non-conductive' },
    {
      type: 'prose',
      html: '<p>Parflex lists several hoses as meeting SAE J517 electrical non-conductivity — 518C, 518D, 528N, 578X, 588N and 538DM — all with orange covers; 518D, built specifically for the aerial lift market, also meets ANSI A92.2 for vehicle-mounted elevating and rotating aerial devices and has a non-perforated cover. Colour is a convention, not a guarantee. Parker’s safety guide says not to use hose near high-voltage lines unless the application is approved in Parker’s publication for that product, the hose is marked "nonconductive", and the equipment maker approves it — and warns that many black rubber compounds are inherently conductive, so do not conclude a hose is non-conductive unless it is designed and branded so.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A conductive hose on an aerial lift can kill.',
      body: 'Replace a hose on an insulated boom only with a hose of the same non-conductive rating, marked as such, with fittings approved for it, and follow the equipment maker’s requirements for the insulated boom.',
    },

    { type: 'section_head', number: '/03', title: 'The fittings.', anchor: 'fittings' },
    {
      type: 'prose',
      html: '<p>Parker crimps its Parflex thermoplastic hoses with the <strong>56 Series</strong>; sizes outside its range use other Parflex series, and 518D can also take the 51R field-attachable series. Our Parker 56 Series range covers male and female NPTF, JIC 37° male and female swivels, SAE 45° and ORB, NPSM, BSPP 60° cone, and metric L and S 24° cone and ball-nose ends. The <strong>THY series</strong> in our range is a separate crimp system whose listings name braided, pressure-wash, thermoplastic and low-pressure hose — use it only with the hose and crimp specification it is made for, and never mix its shells and stems with another series. Our no-skive ferrule for R7/R8 hose is listed with the crimp ferrules.</p><p>Assembly follows the same rules as rubber hose — same make of hose and fitting, the maker’s crimper and specification — with one difference at the cut: Gates notes thermoplastic and PTFE hose can be cut cleanly with a shear, then deburred inside with a sharp knife.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is thermoplastic hydraulic hose?', answer: 'Hose with a thermoplastic core, such as nylon, and synthetic-fibre reinforcement — SAE 100R7, R8 and R18 — lighter and more flexible than rubber hose of similar pressure.' },
        { question: 'Is orange hydraulic hose non-conductive?', answer: 'Orange is the convention for non-conductive thermoplastic hose, but only hose designed, tested and branded "nonconductive" (to SAE J517) should be treated as such.' },
        { question: 'What fittings go on thermoplastic hose?', answer: 'The series the hose maker lists — for Parker Parflex hose, the 56 Series crimp fittings (and 51R field attachable on 518D).' },
        { question: 'What is the difference between R7 and R8 hose?', answer: 'Pressure: R8 is the high-pressure thermoplastic hose (Parker 520N/528N to 5,000 psi in small sizes); R7 is the medium-pressure class.' },
        { question: 'What is R18 hose?', answer: 'A thermoplastic hose rated for constant pressure across its sizes — Parker’s 53DM/538DM at 3,045 psi — suited to over-the-sheave applications.' },
        { question: 'How do I cut thermoplastic hose?', answer: 'With a shear for a clean cut, then deburr the tube inside with a sharp knife.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Parker 56 Series crimp fittings, THY series fittings and thermoplastic hose:</p>' + stockList(['thermoplastic-hose-crimp-fittings', 'thy-series-crimp-fittings', 'thermoplastic-hoses']),
    },
    {
      type: 'product_embed',
      heading: 'Thermoplastic hose and fittings',
      skus: ['IH-PK-10656', 'IH-PK-10356', 'IH-PK-10156', 'IH-PK-19256', 'IH-PK-1CA56', 'IH-HS-R18LFNC', 'IH-HOSE-R7-TP', 'IH-CF-NS-R7R8'],
    },
    { type: 'category_link', slug: 'thermoplastic-hose-crimp-fittings', label: 'Thermoplastic hose crimp fittings', blurb: 'Parker 56 Series ends for thermoplastic hose.' },
    { type: 'category_link', slug: 'thermoplastic-hoses', label: 'Thermoplastic hoses', blurb: 'R7, R8 and R18 hose, including non-conductive.' },
    { type: 'page_link', kind: 'industry', slug: 'power', label: 'Power', blurb: 'Utility and line-work equipment.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parflex-4660', text: 'Parker Parflex. Catalog 4660 — Thermoplastic and PTFE Hose.', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Parflex/CATALOG_4660-Thermoplastic_Hose.pdf' },
        { id: 'parflex-518d', text: 'Parker Parflex. Bulletin 4660-518D — non-conductive hose.', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Parflex/4660-518D_non-conductive_hose.pdf' },
        { id: 'parker-4400', text: 'Parker Hannifin. Catalog 4400 — Hose Products (safety guide).', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Hose-Products-Division/Catalog-4400-PDF-Files/HPD_4400_Catalog.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['sae-100r-hose-types', 'braided-hose-crimp-fittings-guide', 'ptfe-and-textile-hose-ends', 'crimped-reusable-or-ready-made-hose-assemblies'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Hose ratings, non-conductivity and fitting series from Parker Parflex Catalog 4660 and bulletin 4660-518D; safety rules from Parker Catalog 4400.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing thermoplastic hose?',
      body: 'Send the hose type and marking, size, both ends and whether it must be non-conductive. We will quote the matching hose and fittings.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
