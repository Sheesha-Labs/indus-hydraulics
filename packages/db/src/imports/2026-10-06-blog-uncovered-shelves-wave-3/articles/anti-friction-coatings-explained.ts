import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Molykote anti-friction coatings, read from the 19 listings: solid
 * lubricant, cure temperature, service temperature, flash point and packs.
 * Molykote 7325 sits on this shelf but is listed with a penetration and a
 * dropping point, which describe a grease; it is not discussed as a coating.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anti-friction-coatings-explained',
  title: 'Anti-friction coatings explained: dry-film lubricants, cure temperatures and where they beat grease',
  excerpt:
    'An anti-friction coating is lubricant applied like paint and cured into a dry film. What is in one, why the cure temperature decides where it can be used, and the jobs where a coating outlasts any grease.',
  categorySlug: 'maintenance-reliability',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T00:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is an anti-friction coating?',
      answer:
        'A dry-film lubricant: solid lubricant particles — MoS2, graphite or PTFE — carried in a binder and a solvent, applied like paint and cured into a thin bonded film. Once cured there is no oil to wash out, drip or hold dust. Some cure at room temperature: Molykote D-321 R is listed with a 20 °C cure and D-96 at 23 °C. Others are baked: D-708 and PA-744 at 180 °C, D-6600 at 200 °C, D-6818 and D-7620 at 220 °C.',
    },
    {
      type: 'key_takeaways',
      items: [
        'An anti-friction coating is solid lubricant in a binder, cured onto the part. It lubricates dry.',
        'Cure temperature decides where it can be applied: room-temperature films for assembled parts and field work, oven-cured films for production.',
        'MoS2 and graphite films carry high loads; PTFE films give low friction at moderate loads and a cleaner finish.',
        'Adhesion depends on preparation. A coating on a greasy or smooth surface wears off quickly.',
        'Several coatings are solvent-borne with low flash points — 3402 C is listed at 15 °C. Ventilate and keep ignition sources away.',
      ],
    },
    {
      type: 'lead',
      html: 'Some parts cannot be greased after assembly, some must not attract dust, and some run where oil would contaminate the product. For those the answer is to <strong>put the lubricant on before the part goes in</strong>, as a film bonded to the surface. That is an anti-friction coating, and Molykote lists them from aerosol cans for the workshop to drums for production lines.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What is in the can.',
      anchor: 'composition',
    },
    {
      type: 'paragraph',
      html: 'Every coating on our listings is described the same way: organic binder, solids and solvent. The solid is the lubricant — MoS<sub>2</sub>, graphite, a blend of the two, or PTFE. The binder holds it on the surface, and the solvent lets it be sprayed, dipped or brushed and then leaves as the film dries or cures. The result is a film measured in microns rather than millimetres, so tolerances on close-fitting parts are barely affected.',
    },
    {
      type: 'comparison_table',
      caption: 'Molykote anti-friction coatings on our listings',
      columns: ['Coating', 'Solid lubricant', 'Cure', 'Listed temperature'],
      rows: [
        { cells: ['D-321 R', 'MoS₂, graphite', '20 °C', '−180 °C to 450 °C'], highlight: true },
        { cells: ['D-96', 'PTFE', '23 °C', '−40 °C to 150 °C'] },
        { cells: ['D-3484', 'MoS₂, graphite', '23 °C to 200 °C', '−70 °C to 250 °C'] },
        { cells: ['D-10-GBL', 'Graphite', '180 °C', '−70 °C to 380 °C'] },
        { cells: ['D-708 / D-7708', 'PTFE', '180 °C', '−60 °C to 240 °C'] },
        { cells: ['PA-744', 'Graphite, MoS₂', '180 °C', '−75 °C to 300 °C'] },
        { cells: ['D-6024', 'Blend', '180 °C', '−70 °C to 310 °C'] },
        { cells: ['D-6600', 'PTFE', '200 °C', '−40 °C to 260 °C'] },
        { cells: ['D-6818', 'Graphite, MoS₂', '220 °C', '−70 °C to 310 °C'] },
        { cells: ['D-7620', 'MoS₂, graphite', '220 °C', '−70 °C to 300 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Air-cure or heat-cure.',
      anchor: 'cure',
    },
    {
      type: 'paragraph',
      html: 'The cure temperature is the first filter. A room-temperature film such as D-321 R or D-96 can go onto an assembled part, a large component or a part in the field, because nothing has to go into an oven. A heat-cured film needs the part to tolerate the cure — 180 °C to 220 °C on our listings — which rules out assemblies with seals, plastics or heat-treated parts that would be affected, but suits production runs of fasteners, springs, slides and small components. D-3484 is listed with a cure from 23 °C to 200 °C.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Choosing the solid.',
      anchor: 'solids',
    },
    {
      type: 'paragraph',
      html: 'MoS<sub>2</sub> and graphite films are the choice for high contact pressure and slow movement — threads, cams, slides and hinges — and the widest temperature ranges on our listings belong to them: D-321 R from −180 °C to 450 °C and D-10-GBL to 380 °C. PTFE films (D-96, D-708, D-7708, D-6600) give low friction at moderate loads and a cleaner finish; D-96 is listed as transparent. Where friction must be consistent, as on fasteners tightened to a torque, a cured film gives the same surface on every part.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Preparation decides adhesion.',
      anchor: 'preparation',
    },
    {
      type: 'paragraph',
      html: 'A coating is only as good as its bond. The surface has to be free of oil, grease and loose scale before application, and a slightly roughened surface — blasted or phosphated — holds a film far longer than a polished one. Apply thin, even coats rather than one heavy one, let each flash off, and follow the cure time and temperature for the product. A thinner (Molykote 7415) is listed on the same shelf for adjusting solvent-borne coatings; check that it suits the coating before using it.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Solvent-borne coatings are flammable.',
      body: 'Several of these coatings carry low flash points on our listings — 3402 C at 15 °C and 7409 at 35 °C. Apply with ventilation, away from sparks and hot surfaces, and let the solvent evaporate fully before any oven cure.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Where a coating beats grease.',
      anchor: 'uses',
    },
    {
      type: 'paragraph',
      html: 'Coatings earn their place where grease fails for reasons other than lubrication: dusty or sandy sites where grease turns into grinding paste, food and clean areas where oil must not migrate, parts that cannot be re-lubricated once assembled, and very low or very high temperatures where a grease thickens or runs. For moving parts that can be serviced, a grease is still simpler; for static threads, an <a href="/blog/anti-seize-and-assembly-pastes">anti-seize or assembly paste</a>. The wider range is in <a href="/blog/molykote-lubricant-types-explained">Molykote lubricant types explained</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'How is an anti-friction coating applied?',
          answer:
            'By spraying, dipping or brushing onto a clean, slightly roughened surface, then letting it dry or curing it in an oven, depending on the product. Thin, even coats work better than one heavy coat.',
        },
        {
          question: 'Which Molykote coating cures at room temperature?',
          answer:
            'D-321 R is listed with a 20 °C cure and D-96 with a 23 °C cure. D-3484 is listed from 23 °C to 200 °C.',
        },
        {
          question: 'MoS2 or PTFE coating?',
          answer:
            'MoS2 and graphite films for high loads and slow movement; PTFE films for low friction at moderate loads and a cleaner finish.',
        },
        {
          question: 'Can an anti-friction coating replace grease?',
          answer:
            'On parts that cannot be re-lubricated, must stay clean or run in dust, often yes. On bearings that can be serviced, a grease usually remains the better choice.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Molykote anti-friction coatings',
      skus: [
        'IH-LUB-D-321-R-ANTI-FRICTION-COATING-SPRAY',
        'IH-LUB-D-96-ANTI-FRICTION-COATING',
        'IH-LUB-D-3484-ANTI-FRICTION-COATING',
        'IH-LUB-D-10-GBL-ANTI-FRICTION-COATING',
        'IH-LUB-D-708-ANTI-FRICTION-COATING',
        'IH-LUB-PA-744-ANTI-FRICTION-COATING',
        'IH-LUB-D-6600-ANTI-FRICTION-COATING',
        'IH-LUB-D-7620-ANTI-FRICTION-COATING',
      ],
    },
    {
      type: 'category_link',
      slug: 'molykote-anti-friction-coatings',
      label: 'Molykote anti-friction coatings',
      blurb: 'Air-cured and heat-cured dry films in cans, pails and drums.',
    },
    {
      type: 'category_link',
      slug: 'molykote-dispersions',
      label: 'Molykote dispersions',
      blurb: 'Including the 557 silicone dry-film lubricant.',
    },

    {
      type: 'cta_block',
      heading: 'Considering a dry film for a component?',
      body: 'Send the part, its material, the load and movement, the temperature range and whether it can go into an oven. We will suggest the coating and quote it.',
      quoteLabel: 'Quote anti-friction coatings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Solid lubricants, cure temperatures, service temperatures, flash points and packs checked against our Molykote coating listings.',
    },
  ],
}

export default ARTICLE
