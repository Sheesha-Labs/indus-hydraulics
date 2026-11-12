/**
 * The "Add block" library: ready-made variants of each block, laid over its
 * defaults (catalogue.ts). Each is a starting point — every word, colour and
 * image stays editable once it is in the email.
 */

import { BRAND } from '@indus/domain'
import type { BlockPreset } from './types'

const P = (id: string, type: string, label: string, description: string, props: BlockPreset['props'] = {}): BlockPreset => ({
  id,
  type,
  label,
  description,
  props,
})

const emptyImage = { image: null, alt: '', link: '', caption: '' }

export const PRESETS: BlockPreset[] = [
  // Headers
  P('hero-new-stock', 'hero', 'New in stock', 'Navy band (or a photo) with the name, “New in stock” and a button.'),
  P('hero-left', 'hero', 'Hero, words on the left', 'Headline and button set to the left, darker overlay.', {
    align: 'start',
    overlayOpacity: 60,
    eyebrow: 'Product focus',
    heading: 'Hydraulic hose, cut to length',
    text: 'One- and two-wire braided and multi-spiral hose, crimped and tested in the UAE.',
    buttonLabel: 'Browse hoses',
  }),
  P('hero-update', 'hero', 'Monthly update, no photo', 'A short navy band with the month and a headline — for when there is no picture.', {
    height: 's',
    eyebrow: 'Monthly update',
    heading: 'What is new at Indus',
    text: '',
    buttonLabel: '',
    buttonUrl: '',
  }),
  P('hero-photo', 'hero', 'Photograph only', 'The picture and the logo, nothing else.', {
    eyebrow: '',
    heading: '',
    text: '',
    buttonLabel: '',
    buttonUrl: '',
    height: 'l',
    overlayOpacity: 10,
  }),
  P('hero-poster', 'hero', 'Poster headline', 'Navy band, heavy capitals with one phrase in steel blue, a white button.', {
    caps: true,
    heading: 'Line down? ==We move fast.==',
    highlightColor: BRAND.steel,
    eyebrow: 'Breakdown support',
    text: 'Send a photo of the nameplate. An engineer matches it and quotes the same day.',
    buttonLabel: 'Request a quote',
    buttonUrl: '/contact',
  }),
  P('masthead-news', 'masthead', 'Masthead, “Product news”', 'Navy band: white logo, the issue on the right, a large faint word across the foot.'),
  P('masthead-plain', 'masthead', 'Masthead, logo only', 'Navy band with the white logo and a line on the right — no faint word.', {
    label: 'The Indus Bulletin',
    title: 'This month',
    watermark: '',
    padding: 's',
  }),
  P('topbar-points', 'topbar', 'Top strip', 'Three short points on an accent strip, above everything.'),
  P('topbar-amber', 'topbar', 'Top strip, amber', 'An amber strip with navy words — for stock alerts.', {
    items: [{ text: 'On the shelf now' }, { text: 'Ships this week' }, { text: 'While stock lasts' }],
    background: BRAND.warning,
    textColor: BRAND.navy,
  }),
  P('logo-plain', 'logo', 'Logo', 'The logo on white, at the left.'),
  P('logo-navy', 'logo', 'Logo on navy', 'The company name in white on a navy band.', { logo: 'wordmark', background: BRAND.navy, textColor: BRAND.white }),
  P('logo-link', 'logo', 'Logo with a link', 'Logo at the left, a link at the right.', { linkLabel: 'indushydraulics.com', linkUrl: '/', padding: 's' }),

  // Text
  P('heading-serif', 'heading', 'Serif heading', 'A large serif heading.'),
  P('heading-eyebrow', 'heading', 'Heading with a line above', 'Small capitals over a heading.', { eyebrow: 'In this issue', heading: 'What is new this month' }),
  P('heading-centre', 'heading', 'Centred heading', 'A medium heading, centred.', { align: 'center', size: 'm' }),
  P('heading-poster', 'heading', 'Poster heading on navy', 'Heavy capitals on navy, one phrase in steel blue.', {
    heading: 'Repaired. Tested. ==Certified.==',
    size: 'xl',
    caps: true,
    highlightColor: BRAND.steel,
    align: 'center',
    textColor: BRAND.white,
    background: BRAND.navy,
    padding: 'l',
  }),
  P('text-plain', 'text', 'Paragraph', 'Prose, set to the left.'),
  P('text-lead', 'text', 'Large intro', 'An opening line in a larger size.', { size: 'l' }),
  P('section-grey', 'section', 'Intro on grey', 'Heading, paragraph and button on a light grey band.'),
  P('section-white', 'section', 'Intro on white', 'Heading, paragraph and button on white.', { background: '', padding: 'm' }),
  P('section-navy', 'section', 'Intro on navy', 'White words on a navy band.', {
    background: BRAND.navy,
    textColor: BRAND.white,
    buttonColor: BRAND.white,
    buttonTextColor: BRAND.navy,
  }),
  P('quote-customer', 'quote', 'Customer’s words', 'A testimonial with who said it.'),
  P('quote-engineer', 'quote', 'Engineer’s tip', 'A pull quote from the workshop, on grey.', {
    quote: 'Most hose failures we see start at the fitting. Match the fitting series to the hose and crimp to the maker’s chart.',
    author: 'Indus workshop',
    role: 'Hose assembly team',
    background: BRAND.surface2,
  }),

  // Images
  P('image-bleed', 'image', 'Photograph, edge to edge', 'A full-width picture between sections.'),
  P('image-inset', 'image', 'Photograph with margins', 'A picture with a margin, rounded corners and a caption.', { fullBleed: false, rounded: true, padding: 's' }),
  P('image-text-left', 'image-text', 'Photo, text beside it', 'Picture on the left, words on the right.'),
  P('image-text-right', 'image-text', 'Text, photo beside it', 'Words on the left, picture on the right.', { side: 'end' }),
  P('gallery-two', 'gallery', 'Two photos', 'Two pictures side by side.'),
  P('gallery-three', 'gallery', 'Three photos', 'Three pictures side by side.', { items: [emptyImage, emptyImage, emptyImage] }),

  P('image-grid-two', 'image-grid', 'Photo grid, captions on bars', 'Four photos two to a row, each with a navy caption bar.'),
  P('image-grid-three', 'image-grid', 'Photo grid, three across', 'Three photos in a row with plain captions under them.', {
    columns: '3',
    captionStyle: 'below',
    background: '',
    items: [
      { image: null, alt: '', caption: '', link: '' },
      { image: null, alt: '', caption: '', link: '' },
      { image: null, alt: '', caption: '', link: '' },
    ],
  }),

  // Columns
  P('steps-order', 'steps', 'How to order', 'Three numbered steps from part number to delivery.'),
  P('steps-four', 'steps', 'Four steps on grey', 'Four numbered steps on a grey band.', {
    eyebrow: 'How a repair runs',
    heading: 'From your yard and back again',
    background: BRAND.surface2,
    items: [
      { title: 'Send photos', text: 'The nameplate, the fault and when you need it.' },
      { title: 'Strip and quote', text: 'We open it up and quote the repair.' },
      { title: 'Rebuild and test', text: 'New seals and parts, then a pressure test.' },
      { title: 'Back with papers', text: 'Test report and certificate in the box.' },
    ],
  }),
  P('features-three', 'features', 'Three reasons', 'Three short points divided by thin lines.'),
  P('features-two', 'features', 'Two points', 'Two short points side by side.', {
    heading: '',
    items: [
      { icon: null, title: 'OEM parts', text: 'From the makers we list' },
      { icon: null, title: 'Matched equivalents', text: 'When the original is on long lead time' },
    ],
  }),
  P('cards-services', 'cards', 'Two service cards', 'Two cards on grey: photo, title, line, link.'),
  P('cards-three', 'cards', 'Three cards', 'Three cards on white.', {
    background: '',
    cardBackground: BRAND.surface2,
    items: [
      { image: null, title: 'Hose assembly', text: 'Made to order and pressure-tested.', linkLabel: 'Find out more', url: '/services' },
      { image: null, title: 'Cylinder repair', text: 'Strip-down, reseal and test.', linkLabel: 'Find out more', url: '/services' },
      { image: null, title: 'Part identification', text: 'From a nameplate or a photo.', linkLabel: 'Find out more', url: '/contact' },
    ],
  }),
  P('stats-plain', 'stats', 'Three figures', 'Big figures with a label under each.'),
  P('stats-navy', 'stats', 'Figures on navy', 'White figures on a navy band.', { background: BRAND.navy, textColor: BRAND.onNavy, valueColor: BRAND.white }),

  // Lists & details
  P('checklist-pills', 'checklist', 'Highlights as pills', 'White pills with a blue tick, on navy.'),
  P('checklist-bars', 'checklist', 'Highlights as bars', 'Solid blue bars on navy, a heading in capitals.', { style: 'bars', caps: true, heading: 'Why order from stock' }),
  P('checklist-tiles', 'checklist', 'Highlights as tiles', 'Ticked tiles two to a row, on grey.', {
    style: 'tiles',
    heading: 'Key takeaways',
    background: BRAND.surface2,
    textColor: BRAND.ink,
    pillColor: BRAND.white,
    pillTextColor: BRAND.ink,
    padding: 'm',
  }),
  P('chips-standards', 'chips', 'Standards', 'The hose standards we stock to, as tags.'),
  P('chips-sizes', 'chips', 'Sizes', 'Sizes as square tags on grey.', {
    heading: 'Sizes in stock',
    shape: 'square',
    background: BRAND.surface2,
    items: [{ label: '1/4"' }, { label: '3/8"' }, { label: '1/2"' }, { label: '3/4"' }, { label: '1"' }],
  }),
  P('list-ticks', 'list', 'Ticked list', 'Two columns with ticks.'),
  P('list-rules', 'list', 'Ruled list', 'One column with a line under each item.', { columns: '1', marker: 'rule' }),
  P('kv-spec', 'key-values', 'Spec table', 'Label and value on each line, on grey.'),
  P('kv-event', 'key-values', 'Event details', 'Date, time and venue.', {
    heading: 'The details',
    background: '',
    items: [
      { label: 'Date', value: '' },
      { label: 'Time', value: '' },
      { label: 'Venue', value: '' },
    ],
  }),
  P('person-sales', 'person', 'Sales contact', 'A photo, name and how to reach them.'),
  P('contact-details', 'contact', 'Contact and links', 'Company, address, phone and a row of links.'),

  // Calls to action
  P('button-solid', 'button', 'Solid button', 'An accent button, centred.'),
  P('button-outline', 'button', 'Outline button', 'An outlined button.', { buttonStyle: 'outline' }),
  P('button-wide', 'button', 'Full-width button', 'A button across the column.', { fullWidth: true }),
  P('cta-navy', 'cta-band', 'Closing band, navy', 'Heading, line and two buttons on navy.'),
  P('cta-single', 'cta-band', 'One button on grey', 'A single ask on a light grey band.', {
    background: BRAND.surface2,
    textColor: BRAND.ink,
    primaryColor: BRAND.accent,
    primaryTextColor: BRAND.white,
    secondaryLabel: '',
    secondaryUrl: '',
  }),
  P('offer-percent', 'offer', 'Offer with a badge', 'A promotion card: badge, offer, terms and a button.'),
  P('offer-products', 'offer', 'Offer on picked products', 'The offer, then the products it covers as cards.', {
    badge: 'Ex-stock',
    heading: 'Ready to ship this week',
    text: 'These items are on the shelf in the UAE and can leave the same day the order is confirmed.',
    terms: 'While stock lasts. Quantities confirmed on the quote.',
    records: { kind: 'product', ids: [], labels: [], layout: 'grid' },
  }),
  P('social-links', 'social', 'Social links', 'LinkedIn and the website, centred.'),
  P('social-badges', 'social', 'Social badges on navy', 'Round white badges on a navy band — for the foot of the email.', {
    style: 'badges',
    badgeColor: BRAND.white,
    badgeTextColor: BRAND.navy,
    background: BRAND.navy,
    padding: 'm',
  }),

  // From the site
  P('records-brands', 'records', 'Brands', 'Brand cards with their photo or logo.', {
    heading: 'Brands we supply',
    records: { kind: 'brand', ids: [], labels: [], layout: 'grid' },
    buttonLabel: 'All brands',
    buttonUrl: '/brands',
  }),
  P('records-products', 'records', 'Products', 'Product cards, two to a row.', { heading: 'New in stock', records: { kind: 'product', ids: [], labels: [], layout: 'grid' } }),
  P('records-rows', 'records', 'Products in alternating rows', 'A white card per product — photo, name, maker, a line and a button — sides alternating, on grey.', {
    heading: '',
    records: { kind: 'product', ids: [], labels: [], layout: 'rows' },
    itemLabel: 'Discover',
    buttonLabel: '',
    background: BRAND.surface2,
  }),
  P('records-tiles', 'records', 'Product tiles', 'Small tiles three to a row, the last one a blue “and many more” tile.', {
    heading: 'More new arrivals',
    records: { kind: 'product', ids: [], labels: [], layout: 'tiles' },
    buttonLabel: 'And many other products…',
    align: 'center',
    background: BRAND.surface2,
  }),
  P('records-cases', 'records', 'Case studies', 'Jobs from the workshop, as alternating rows.', {
    heading: 'From the workshop',
    records: { kind: 'service', ids: [], labels: [], layout: 'rows' },
    itemLabel: 'Read the case study',
    buttonLabel: 'All case studies',
    buttonUrl: '/services',
    background: BRAND.surface2,
  }),
  P('records-categories', 'records', 'Categories', 'Ranges to browse, as a list.', {
    heading: 'Ranges to browse',
    records: { kind: 'category', ids: [], labels: [], layout: 'list' },
    buttonLabel: 'All categories',
  }),
  P('records-articles', 'records', 'Articles', 'Recent guides from the blog.', {
    heading: 'From the blog',
    records: { kind: 'article', ids: [], labels: [], layout: 'cards' },
    buttonLabel: 'All articles',
    buttonUrl: '/blog',
  }),
  P('records-industries', 'records', 'Industries', 'Industries we supply, as a list.', {
    heading: 'Industries we supply',
    records: { kind: 'industry', ids: [], labels: [], layout: 'list' },
    buttonLabel: 'All industries',
    buttonUrl: '/industries',
  }),

  // Spacing
  P('stripe-blue', 'stripe', 'Blue stripe', 'An 8px blue bar with a thin steel line — between bands.'),
  P('stripe-amber', 'stripe', 'Amber stripe', 'An amber bar with a thin navy line.', { color: BRAND.warning, secondColor: BRAND.navy2 }),
  P('divider', 'divider', 'Line', 'A thin line.'),
  P('divider-short', 'divider', 'Short line', 'A short centred line.', { width: 20 }),
  P('spacer', 'spacer', 'Space', '32px of space.'),
  P('spacer-grey', 'spacer', 'Grey space', 'A grey gap between bands.', { background: BRAND.surface2, height: 24 }),
]
