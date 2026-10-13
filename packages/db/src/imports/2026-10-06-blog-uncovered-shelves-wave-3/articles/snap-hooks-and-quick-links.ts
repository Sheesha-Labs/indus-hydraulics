import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Snap hooks and quick links, read from the 44 listings and their variant
 * rows: type, gate, size and WLL in lbs or kg. Several stainless families
 * carry ratings identical to their carbon twins and are awaiting the
 * supplier's confirmation, so no stainless rating is quoted. Kilogram figures
 * in brackets are conversions of the listed pounds.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'snap-hooks-and-quick-links',
  title: 'Snap hooks and quick links: ratings, gates and where not to use them',
  excerpt:
    'A 10 mm quick link on our listings is rated 2,640 lbs; a 10 mm Grade 80 chain sling leg, 3.15 tonnes. How quick links and snap hooks are rated, why the gate decides their strength, and why they are not overhead lifting hardware.',
  categorySlug: 'lifting-rigging',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T03:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between a quick link and a snap hook?',
      answer:
        'A quick link is a closed link with a threaded sleeve that screws shut across the opening; it carries its rating only when the sleeve is fully closed. A snap hook has a spring-loaded gate that closes on its own, sometimes with a screw lock. Both are connectors for general rigging, lashing and marine work, rated in pounds or kilograms — a 10 mm quick link on our listings is 2,640 lbs WLL — and neither should be used for overhead lifting unless it is specifically rated and certified for it.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Quick links close with a threaded sleeve; snap hooks with a spring gate, sometimes screw-locked.',
        'Our zinc-plated quick links run from 220 lbs WLL at 3.5 mm to 8,000 lbs at 16 mm, with a breaking load four times the WLL.',
        'Our zinc-plated snap hooks run from 200 lbs at 4 × 40 mm to 1,800 lbs at 15 × 200 mm.',
        'An open sleeve or a side load takes most of the strength away. Load in line, sleeve fully closed.',
        'These are general-purpose connectors. For lifting, use a rated master link, shackle or hook with its certificate.',
      ],
    },
    {
      type: 'lead',
      html: 'Quick links and snap hooks are the fastest way to join two things, which is exactly why they end up in places they were never meant to be. Size for size, they are rated far below the lifting hardware they resemble, and <strong>their strength depends on a gate</strong> that someone has to remember to close. Used for what they are made for, they are excellent; used as lifting gear, they are a liability.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What is on the shelf.',
      anchor: 'types',
    },
    {
      type: 'comparison_table',
      caption: 'Connector types on our listings (carbon steel, zinc plated)',
      columns: ['Type', 'How it closes', 'WLL range listed'],
      rows: [
        { cells: ['Quick link (4× breaking load)', 'Threaded sleeve', '220 lbs (3.5 mm) to 8,000 lbs (16 mm)'], highlight: true },
        { cells: ['Wide jaw quick link', 'Threaded sleeve, wider opening', '200 lbs (3.5 mm) to 2,750 lbs (12 mm)'] },
        { cells: ['Long and pear-shaped quick links', 'Threaded sleeve', '175–2,800 lbs; 120–1,650 lbs'] },
        { cells: ['Snap hook', 'Spring gate', '200 lbs (4 × 40 mm) to 1,800 lbs (15 × 200 mm)'] },
        { cells: ['Snap hook with screw lock', 'Spring gate plus locking sleeve', '200 lbs to 1,600 lbs'] },
        { cells: ['S hook with safety latch', 'Latch', '750 lbs to 1,250 lbs'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Quick links: the sleeve is the strength.',
      anchor: 'quick-links',
    },
    {
      type: 'paragraph',
      html: 'A quick link is an oval or pear-shaped link with a gap in one side and a threaded sleeve that screws across it. Closed, the sleeve completes the ring and the link carries its rated load along its long axis; part-open, the link is a hook with a weak, thin tip. Our 4× quick links state a breaking load four times the working load limit, from 220 lbs WLL at 3.5 mm through 2,640 lbs (about 1,200 kg) at 10 mm to 8,000 lbs at 16 mm. Screw the sleeve fully home every time, by hand and then a nip with a spanner where the job calls for it, and load the link in line rather than across its width.',
    },
    {
      type: 'comparison_table',
      caption: 'Quick link, 4× WLL breaking load, zinc plated',
      columns: ['Size', 'WLL (as listed)', 'Approx. kg'],
      rows: [
        { cells: ['5 mm', '660 lbs', '300 kg'] },
        { cells: ['6 mm', '880 lbs', '400 kg'] },
        { cells: ['8 mm', '1,600 lbs', '726 kg'] },
        { cells: ['10 mm', '2,640 lbs', '1,200 kg'], highlight: true },
        { cells: ['12 mm', '3,300 lbs', '1,497 kg'] },
        { cells: ['16 mm', '8,000 lbs', '3,630 kg'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Snap hooks: the gate is the weak point.',
      anchor: 'snap-hooks',
    },
    {
      type: 'paragraph',
      html: 'A snap hook closes itself with a spring-loaded gate, which is what makes it quick, and also what makes it vulnerable: the gate is the weakest part, and a load against it or a rope that rolls across it can open it. Screw-lock versions add a sleeve that holds the gate shut. Our zinc-plated snap hooks are sized by wire diameter and length — 10 × 100 mm is listed at 770 lbs WLL — and the pear-shaped spring snaps, oval snap hooks and boat snaps on the shelf are rated lower again, in tens or hundreds of kilograms. They suit lanyards, light rigging, marine and agricultural use, not structural or lifting loads.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Not for overhead lifting.',
      body: 'Do not use quick links, snap hooks or S hooks from this shelf to lift loads overhead. Their ratings are a fraction of lifting hardware of the same size — a 10 mm quick link at 2,640 lbs against a 10 mm Grade 80 chain sling leg at 3.15 t — and a working load limit is not a breaking load. For lifting, use a certified master link, shackle or lifting hook.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Stainless steel versions.',
      anchor: 'stainless',
    },
    {
      type: 'paragraph',
      html: 'Most connector types are also listed in 304 or 316 stainless steel, polished, for marine, food and architectural use where zinc plating would corrode or flake. Stainless and carbon versions of the same pattern do not necessarily carry the same rating, so take the WLL for a stainless connector from the certificate supplied with it rather than from the carbon steel table. For where stainless is worth the cost in rigging, see <a href="/blog/stainless-vs-galvanized-rigging-gulf">stainless against galvanised rigging in the Gulf</a>.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Give the type, size, material and finish, and the load the connector will see, so we can confirm the rating covers it. If the job is lifting, tell us — we will quote rated lifting components instead, such as the master links in <a href="/blog/master-links-explained">master links explained</a> or the shackles in <a href="/blog/types-of-shackles">types of shackles</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can a quick link be used for lifting?',
          answer:
            'Not the general-purpose quick links on this shelf. Their ratings are far below lifting hardware of the same size. Use a certified master link or shackle for lifting.',
        },
        {
          question: 'What is the WLL of a 10 mm quick link?',
          answer:
            'Our zinc-plated 4× quick link is listed at 2,640 lbs (about 1,200 kg) at 10 mm, with a breaking load four times that — and only with the sleeve fully closed.',
        },
        {
          question: 'What is the weakest part of a snap hook?',
          answer:
            'The gate. A load against it, or a rope rolling across it, can open it. Screw-lock snap hooks hold the gate shut.',
        },
        {
          question: 'Are stainless snap hooks rated the same as zinc-plated ones?',
          answer:
            'Not necessarily. Take the rating for a stainless connector from its own certificate.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Quick links and snap hooks',
      skus: [
        'IH-LR-QL-4X',
        'IH-LR-QL-WJ',
        'IH-LR-SN-LQL-G',
        'IH-LR-SN-PSQL-G',
        'IH-LR-SN-STD',
        'IH-LR-SN-S',
        'IH-LR-SN-SHSL',
        'IH-LR-SN-DQLSS',
      ],
    },
    {
      type: 'category_link',
      slug: 'snap-hooks-quick-links',
      label: 'Snap hooks and quick links',
      blurb: '44 quick links, snap hooks, S hooks and boat snaps.',
    },
    {
      type: 'category_link',
      slug: 'master-links-rings-swivels',
      label: 'Master links, rings and swivels',
      blurb: 'Rated connectors for lifting assemblies.',
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: 'Bow and dee shackles with WLL tables.',
    },

    {
      type: 'cta_block',
      heading: 'Need connectors for a job?',
      body: 'Send the type, size, material and the load involved. We will confirm the rating, or quote rated lifting hardware if the job is a lift.',
      quoteLabel: 'Quote connectors',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Types, gates, sizes and WLLs checked against our snap hook and quick link listings; kilogram figures converted from the listed pounds.',
    },
  ],
}

export default ARTICLE
