import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Plate and beam clamps, read from the 11 listings and their variant rows:
 * clamp type, WLL, rating basis (per pair where the listing says so), jaw
 * opening and beam flange range. The L, LC, QS and TMS listings do not state
 * whether their WLL is per clamp or per pair, and the article says so rather
 * than assuming.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'vertical-vs-horizontal-plate-lifting-clamps',
  title: 'Vertical and horizontal plate lifting clamps: pairs, jaw range and when to use each',
  excerpt:
    'A vertical clamp grips one plate edge-up; horizontal clamps work in pairs to lift plates flat. How each type grips, why the jaw range and the rating basis matter, and where a beam clamp fits in.',
  categorySlug: 'lifting-rigging',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T03:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between vertical and horizontal plate lifting clamps?',
      answer:
        'A vertical plate clamp grips the edge of a plate with a cam and lifts it edge-up, or turns it from flat to vertical. Horizontal plate clamps grip the plate edges from the side and are used in pairs, or sets, with a spreader beam or a multi-leg sling, to lift plates and bundles flat. On our listings the horizontal clamps are rated per pair — the PPD type from 0.8 t to 30 t — and every clamp has a jaw range the plate thickness must fall within.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Vertical clamps lift a single plate edge-up or turn it; horizontal clamps lift plates flat, in pairs.',
        'Our PPD, PDQ and THK horizontal clamps and CDH vertical clamps are rated per pair, as the size labels say.',
        'The plate thickness must sit inside the jaw range: 0–25 mm for a 0.8 t PPD pair, up to 100–270 mm for the 30 t pair.',
        'Beam clamps fix a hoist to a beam flange: ours are 1 t to 10 t for flanges from 75 mm to 320 mm.',
        'A WLL is not a breaking load, and a clamp is only as good as its teeth, its cam and a clean plate surface.',
      ],
    },
    {
      type: 'lead',
      html: 'Steel plate has no lifting points, so the lifting point has to be brought to it — a clamp that bites the edge and holds by friction and the grip of hardened teeth. Which clamp depends on <strong>which way up the plate travels</strong>: edge-up from a rack, flat from a stack, or turned over on the way. Get that wrong and the clamp is loaded in a direction it was never designed to hold.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Clamp types on our listings.',
      anchor: 'types',
    },
    {
      type: 'comparison_table',
      caption: 'Plate and beam clamps, as listed',
      columns: ['Clamp', 'Use', 'WLL range listed'],
      rows: [
        { cells: ['Vertical, CDH', 'Lift edge-up or turn a plate; locking cam', '1 t to 8 t per pair'], highlight: true },
        { cells: ['Horizontal with release, PPD', 'Lift plates flat, in pairs; replaceable jaw plate', '0.8 t to 30 t per pair'] },
        { cells: ['Horizontal with roller, PDQ', 'Lift plates flat, in pairs', '1 t to 12 t per pair'] },
        { cells: ['Thin sheet, THK / THKS', 'Thin sheet lifted flat, in pairs', '0.5 t to 10 t per pair'] },
        { cells: ['Horizontal L, QS, TMS', 'Plates lifted flat; TMS has a locking device', '0.8–10 t; 1–8 t; 1–10 t (basis not stated)'] },
        { cells: ['Steel section clamp, LC', 'Sections lifted horizontally', '1 t to 3 t'] },
        { cells: ['Beam clamp', 'Hoist anchor on a beam flange', '1 t to 10 t'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Vertical clamps.',
      anchor: 'vertical',
    },
    {
      type: 'paragraph',
      html: 'A vertical clamp has a fixed jaw and a toothed cam. Once the plate edge is in the mouth, the cam is set against it — on the CDH, a hardened cam in a die-forged alloy body — and the pull of the load rotates the cam harder into the plate, so the grip rises with the load. That is what lets a vertical clamp lift a plate from a rack or turn it from flat to vertical. The locking mechanism holds the cam closed before the lift starts, so the clamp cannot shake loose while the plate is still light. Our CDH jaw openings run from 0–20 mm at 1 t to 0–60 mm at 8 t.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Horizontal clamps work in pairs.',
      anchor: 'horizontal',
    },
    {
      type: 'paragraph',
      html: 'Horizontal clamps grip opposite edges of a plate or a bundle and lift it flat, hung from a spreader beam or a two- or four-leg sling. A single horizontal clamp cannot hold a plate on its own, which is why our PPD, PDQ and THK clamps are rated per pair — the WLL is what two clamps lift together, at the sling angle the maker allows. Long plates that sag between two clamps need two pairs on a beam. The PPD has a replaceable jaw plate; the THK and THKS are for thin sheet, from 0.5 t per pair.',
    },
    {
      type: 'comparison_table',
      caption: 'PPD horizontal plate clamp, per pair',
      columns: ['WLL per pair', 'Jaw opening', 'Clamp weight'],
      rows: [
        { cells: ['0.8 t', '0–25 mm', '2.5 kg'] },
        { cells: ['2 t', '0–40 mm', '5 kg'] },
        { cells: ['5 t', '0–50 mm', '7.5 kg'] },
        { cells: ['10 t', '0–120 mm', '33 kg'], highlight: true },
        { cells: ['16 t', '50–150 mm', '50 kg'] },
        { cells: ['30 t', '100–270 mm', '108 kg'] },
      ],
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Check the rating basis and the jaw range before every lift.',
      body: 'A clamp rated per pair lifts half that load each; using one alone, or reading a per-pair rating as per clamp, doubles the load on it. The plate must sit inside the jaw range, the surface must be free of oil, grease and loose scale, and the teeth and cam must be sharp and undamaged. A WLL is not a breaking load — never exceed it, and keep everyone clear of the load path.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Beam clamps and section clamps.',
      anchor: 'beam',
    },
    {
      type: 'paragraph',
      html: 'A beam clamp is not a load-gripping clamp at all: it fixes to the flange of an I-beam to make a temporary anchor for a chain block or hoist. Ours are listed from 1 t to 10 t; the 1 t to 5 t sizes fit flanges from 75 mm or 80 mm up to 220 mm, and the 10 t fits 90 mm to 320 mm. The beam must be able to carry the load at that point. The LC clamp is a horizontal clamp for steel sections, listed from 1 t (1–13 mm jaw) to 3 t (12–35 mm jaw). Hoists to hang from a beam clamp are compared in <a href="/blog/chain-block-vs-lever-hoist-vs-electric-hoist">chain block, lever hoist and electric hoist</a>.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering a clamp.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Give the plate thickness range, the heaviest plate or bundle, whether it travels flat, edge-up or is turned, and how it will be slung. For horizontal clamps, say whether you need a pair or two pairs; for beam clamps, give the flange width and thickness. Our clamps ship with the manufacturer\'s test certificate. Clamps, like all lifting accessories, are examined periodically — see <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can one horizontal plate clamp be used on its own?',
          answer:
            'No. Horizontal clamps are used in pairs or sets on opposite edges. Our PPD, PDQ and THK clamps are rated per pair.',
        },
        {
          question: 'What jaw opening do I need?',
          answer:
            'One whose range includes your plate thickness. A 2 t PPD pair is listed at 0–40 mm; the 16 t pair starts at 50 mm, so it will not grip thinner plate.',
        },
        {
          question: 'What is a vertical plate clamp used for?',
          answer:
            'Lifting a single plate edge-up, or turning it from flat to vertical. Its cam grips harder as the load increases, and a lock holds it closed before the lift.',
        },
        {
          question: 'What size beam clamp fits my beam?',
          answer:
            'Ours cover flanges from 75 mm to 220 mm at 1 t and 2 t, 80 mm to 220 mm at 3 t and 5 t, and 90 mm to 320 mm at 10 t.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Plate and beam clamps',
      skus: [
        'IH-LR-LC-CDH',
        'IH-LR-LC-PPD',
        'IH-LR-LC-PDQ',
        'IH-LR-LC-THK',
        'IH-LR-LC-TMS',
        'IH-LR-LC-LC',
        'IH-LR-LC-BEAM',
        'IH-LR-LC-QS',
      ],
    },
    {
      type: 'category_link',
      slug: 'lifting-beam-clamps',
      label: 'Lifting and beam clamps',
      blurb: 'Vertical and horizontal plate clamps, section clamps and beam clamps.',
    },
    {
      type: 'category_link',
      slug: 'chain-blocks-manual-hoists',
      label: 'Chain blocks and manual hoists',
      blurb: 'Hoists to hang from a beam clamp or trolley.',
    },

    {
      type: 'cta_block',
      heading: 'Choosing a plate clamp?',
      body: 'Send the plate thickness range, the heaviest lift, how the plate travels and how it will be slung. We will quote the clamp or pair with its certificate.',
      quoteLabel: 'Quote plate clamps',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Clamp types, WLLs, rating basis, jaw openings, weights and beam flange ranges checked against our clamp listings.',
    },
  ],
}

export default ARTICLE
