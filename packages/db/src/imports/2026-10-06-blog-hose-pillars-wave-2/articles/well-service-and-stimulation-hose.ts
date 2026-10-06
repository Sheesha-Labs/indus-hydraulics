import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Well service and intervention hose, read from the five well service
 * listings: frac, onshore and offshore stimulation, well test production and
 * burner / flare boom hose.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'well-service-and-stimulation-hose',
  title: 'Well service and stimulation hose: frac, acidizing, well test and flare boom lines',
  excerpt:
    'Stimulation and frac lines run at 15,000 psi, well test lines carry sour produced fluid, and flare boom hose sees 200 °C. What each well service hose is built from, and why the liner is the decision.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T15:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What hose is used for well stimulation and frac service?',
      answer:
        'Flexible high-pressure hose with multiple high-tensile steel cable plies and a liner chosen for the fluid. Our frac hose assemblies and stimulation and acidizing hoses are rated 15,000 psi working: frac hose with an abrasion-resistant liner from 3" to 5", stimulation hose with an acid-resistant rubber or FKM / fluoropolymer liner from 2" to 3". Well test production hose is 10,000 psi for sour service, and burner / flare boom hose 5,000 psi to +200 °C.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Frac hose: 15,000 psi WP, 3" to 5", abrasion-resistant liner for proppant-laden fluid.',
        'Stimulation and acidizing: 15,000 psi WP, 2" to 3"; acid-resistant rubber onshore, FKM / fluoropolymer offshore to +130 °C.',
        'Well test production hose: 10,000 psi WP, 15,000 psi MBP, HNBR sour-service liner, API 16C and NACE MR-0175.',
        'Burner / flare boom hose: 5,000 psi WP, 2" to 6", heat-resistant FKM / HNBR with heat shielding, to +200 °C.',
        'All are flanged, and the liner — not the pressure class — is usually the deciding specification.',
      ],
    },
    {
      type: 'lead',
      html: 'Well service hose works at the extremes of oilfield duty: frac and acid jobs at 15,000 psi, sour produced fluid during a well test, and hot hydrocarbons on the way to the flare. At those pressures every candidate hose has steel cable reinforcement, so <strong>the liner is the decision</strong> — it is the part that meets proppant, acid, H₂S and heat.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Four duties, four liners.',
      anchor: 'duties',
    },
    {
      type: 'comparison_table',
      caption: 'Well service hose on our listings',
      columns: ['Hose', 'Rating and bore', 'Liner', 'Temperature'],
      rows: [
        { cells: ['Frac hose assemblies', '15,000 psi WP; 3" – 5"', 'Abrasion-resistant rubber', '−30 to +100 °C'], highlight: true },
        { cells: ['Onshore well stimulation', '15,000 psi WP; 2" – 3"', 'Acid-resistant synthetic rubber', '−30 to +100 °C'] },
        { cells: ['Offshore stimulation / intervention / acidizing', '15,000 psi WP; 2" – 3"', 'Acid-resistant FKM / fluoropolymer', '−30 to +130 °C'] },
        { cells: ['Well test production', '10,000 psi WP, 15,000 psi MBP; 2" – 4"', 'HNBR / sour-service rubber', '−30 to +100 °C'] },
        { cells: ['Burner / flare boom', '5,000 psi WP; 2" – 6"', 'Heat-resistant FKM / HNBR, heat-shielded', '−30 to +200 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Frac: abrasion at pressure.',
      anchor: 'frac',
    },
    {
      type: 'paragraph',
      html: 'Frac fluid carries proppant at high velocity, so a frac hose wears from the inside as well as holding 15,000 psi. Ours has an abrasion-resistant liner over frac-rated steel cable plies, flanged at both ends, from 3" to 5", and is listed against API 7K with API 16C as a cross-reference. Frac sites also run large-bore water lines at far lower pressure; our frac water couplings and the three-segment clamps for them run from 8" to 16".',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Stimulation and acidizing: the acid decides.',
      anchor: 'acidizing',
    },
    {
      type: 'paragraph',
      html: 'Acid stimulation puts hydrochloric and other acids through the hose at 15,000 psi. The onshore hose uses an acid-resistant synthetic rubber liner, listed against API Spec 7K and NACE MR-0175; the offshore stimulation, intervention and acidizing hose steps up to an FKM / fluoropolymer liner rated to +130 °C, listed against API 17J and NACE MR-0175. Specify the acid, its concentration and the treating temperature with the order — the liner choice follows from them.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Well test and flare: sour and hot.',
      anchor: 'well-test',
    },
    {
      type: 'paragraph',
      html: 'During a well test the hose carries whatever the well produces, which may be sour. Our well test production hose is 10,000 psi working with a 15,000 psi minimum burst, HNBR or sour-service rubber liner, flanged, listed to API 16C and NACE MR-0175. Downstream, the burner and flare boom hose carries produced fluid out to the burner: 5,000 psi working, 2" to 6", a heat-resistant FKM or HNBR liner and heat shielding, rated to +200 °C. NACE applies to the whole assembly — flanges and ring gaskets included — not just the hose body.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Restrain high-pressure lines.',
      body: 'A 15,000 psi hose that separates is lethal within its whip radius. Every well service hose should be restrained at each end and along its length per the job\'s safety plan, and pressure-tested before the job with the area cleared.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ends and documents.',
      anchor: 'ends',
    },
    {
      type: 'paragraph',
      html: 'All five of these hoses are flanged on our listings, which means the flanges and ring gaskets carry the same pressure and service class as the hose. Treating iron on the same job is joined with hammer unions — sour service unions for sour wells. The assembly ships with its certificates and NACE statement, which should be specified with the enquiry. See the <a href="/blog/oilfield-hose-guide">oilfield hose guide</a> and <a href="/blog/oilfield-hose-document-pack">the oilfield hose document pack</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What pressure is frac hose rated for?',
          answer:
            'Our frac hose assemblies are rated 15,000 psi working, from 3" to 5", with an abrasion-resistant liner.',
        },
        {
          question: 'What liner does an acidizing hose need?',
          answer:
            'An acid-resistant one. Our onshore stimulation hose uses acid-resistant synthetic rubber; the offshore acidizing hose uses FKM / fluoropolymer, rated to +130 °C.',
        },
        {
          question: 'Is well test hose suitable for sour service?',
          answer:
            'Ours is: 10,000 psi working with an HNBR / sour-service liner, listed to API 16C and NACE MR-0175. The end connections must be sour-rated too.',
        },
        {
          question: 'What temperature can flare boom hose handle?',
          answer:
            'Our burner / flare boom hose is rated to +200 °C with a heat-resistant FKM / HNBR liner and heat shielding.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Well service hose',
      skus: ['IH-OG-WSV-005', 'IH-OG-WSV-003', 'IH-OG-WSV-002', 'IH-OG-WSV-001', 'IH-OG-WSV-004'],
    },
    {
      type: 'category_link',
      slug: 'well-service-hoses',
      label: 'Well service and intervention hose',
      blurb: 'Frac, stimulation, acidizing, well test and flare boom hose.',
    },
    {
      type: 'category_link',
      slug: 'hammer-unions-sour-gas-service',
      label: 'Sour gas service hammer unions',
      blurb: 'Hammer unions made and documented for sour wells.',
    },

    {
      type: 'cta_block',
      heading: 'Planning a stimulation or test job?',
      body: 'Send the pressure, the fluids and acids, the temperature, the bore and the end connections. We will quote the certified assemblies with their documents.',
      quoteLabel: 'Quote well service hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Pressures, liners, temperatures, bores and standards checked against our well service hose listings.',
    },
  ],
}

export default ARTICLE
