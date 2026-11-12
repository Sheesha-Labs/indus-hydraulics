/**
 * What "New newsletter" offers — the built-in templates' names, one-line
 * descriptions, which shelf of the dialog they sit on, a sketch of their
 * stack for the thumbnail, and whether one record has to be picked first.
 * Pure data, so the dialog (a client component) can show it; the builders
 * that read the database live in templates.ts.
 */

export type TemplateNeeds = 'product' | 'brand' | 'industry' | 'category' | 'article' | 'service'

export const TEMPLATE_SECTIONS = ['Products & ranges', 'Services & case studies', 'Offers & alerts', 'Know-how & industries', 'Company news', 'Start from scratch', 'Rich text'] as const
export type TemplateSection = (typeof TEMPLATE_SECTIONS)[number]

/**
 * One band of a template's thumbnail, top to bottom — drawn as a tiny email
 * in the dialog so a template can be recognised before it is opened.
 */
export type SketchBand =
  | 'top'
  | 'mast'
  | 'logo'
  | 'stripe'
  | 'amber'
  | 'poster'
  | 'hero'
  | 'image'
  | 'heading'
  | 'text'
  | 'grey'
  | 'list'
  | 'pills'
  | 'bars'
  | 'tiles-ticks'
  | 'grid'
  | 'rows'
  | 'tiles'
  | 'cards'
  | 'stats'
  | 'steps'
  | 'quote'
  | 'kv'
  | 'offer'
  | 'person'
  | 'button'
  | 'cta'
  | 'footer'

export type BuiltInTemplate = {
  id: string
  group: 'blocks' | 'rich'
  section: TemplateSection
  label: string
  description: string
  /** lucide icon name, mapped in the dialog. */
  icon: 'rocket' | 'award' | 'package' | 'tag' | 'factory' | 'calendar' | 'megaphone' | 'blocks' | 'file' | 'mail' | 'newspaper' | 'wrench' | 'clipboard' | 'layers' | 'book' | 'alarm' | 'siren' | 'hand' | 'clock'
  /** One record the template is built around, picked in a second step. */
  needs?: TemplateNeeds
  sketch: readonly SketchBand[]
}

const FOOT = ['stripe', 'footer'] as const

export const BUILT_IN_TEMPLATES = [
  // ── Products & ranges ──
  {
    id: 'product-news',
    group: 'blocks',
    section: 'Products & ranges',
    label: 'Product news',
    description: 'A trade-magazine issue: masthead, new products in alternating rows, one article not to miss, a wall of tiles.',
    icon: 'newspaper',
    sketch: ['mast', 'stripe', 'heading', 'rows', 'rows', 'cards', 'tiles', ...FOOT],
  },
  {
    id: 'product-launch',
    group: 'blocks',
    section: 'Products & ranges',
    label: 'Product launch',
    description: 'A launch mailer from one product: its photo, what it is, more from the same range, a quote ask.',
    icon: 'rocket',
    needs: 'product',
    sketch: ['mast', 'stripe', 'hero', 'rows', 'grid', 'cta', ...FOOT],
  },
  {
    id: 'category-showcase',
    group: 'blocks',
    section: 'Products & ranges',
    label: 'Range in focus',
    description: 'One category: its photo and story, products from it in rows and tiles, how to order, related ranges.',
    icon: 'layers',
    needs: 'category',
    sketch: ['mast', 'stripe', 'hero', 'rows', 'tiles', 'steps', 'grid', 'cta', ...FOOT],
  },
  {
    id: 'brand-spotlight',
    group: 'blocks',
    section: 'Products & ranges',
    label: 'Brand spotlight',
    description: 'One brand we supply: its photo and story, the figures, its newest products, a closing ask.',
    icon: 'award',
    needs: 'brand',
    sketch: ['mast', 'stripe', 'hero', 'text', 'stats', 'grid', 'cta', ...FOOT],
  },
  {
    id: 'featured-products',
    group: 'blocks',
    section: 'Products & ranges',
    label: 'Featured products',
    description: 'An introduction, live cards for the newest products and brands, a closing ask.',
    icon: 'package',
    sketch: ['mast', 'stripe', 'heading', 'grid', 'tiles', 'cta', ...FOOT],
  },

  // ── Services & case studies ──
  {
    id: 'service-spotlight',
    group: 'blocks',
    section: 'Services & case studies',
    label: 'Workshop & field services',
    description: 'A bold services mailer: poster headline over a workshop photo, what we take in, a photo grid of real jobs, how a repair runs.',
    icon: 'wrench',
    sketch: ['mast', 'stripe', 'poster', 'image', 'stripe', 'grey', 'pills', 'grid', 'steps', 'cta', ...FOOT],
  },
  {
    id: 'case-study',
    group: 'blocks',
    section: 'Services & case studies',
    label: 'Case study',
    description: 'One job from the workshop: the headline, the photo, the outcome, the figures, what the crew said, more like it.',
    icon: 'clipboard',
    needs: 'service',
    sketch: ['top', 'mast', 'stripe', 'poster', 'image', 'text', 'tiles-ticks', 'kv', 'quote', 'cta', 'rows', ...FOOT],
  },
  {
    id: 'rapid-response',
    group: 'blocks',
    section: 'Services & case studies',
    label: 'Breakdown support',
    description: '“Line down? We move fast.” A WhatsApp-first ask, what happens next in four steps, recent turnarounds, who to call.',
    icon: 'siren',
    sketch: ['mast', 'stripe', 'poster', 'steps', 'pills', 'rows', 'person', ...FOOT],
  },

  // ── Offers & alerts ──
  {
    id: 'stock-alert',
    group: 'blocks',
    section: 'Offers & alerts',
    label: 'Ex-stock alert',
    description: 'Amber and navy: what is on the shelf now, in rows, why ordering from stock pays, a this-week ask.',
    icon: 'alarm',
    sketch: ['amber', 'mast', 'poster', 'amber', 'rows', 'rows', 'bars', 'cta', ...FOOT],
  },
  {
    id: 'offer',
    group: 'blocks',
    section: 'Offers & alerts',
    label: 'Offer',
    description: 'A promotion: a header, an offer card with its badge and terms, the products it covers.',
    icon: 'tag',
    sketch: ['mast', 'stripe', 'hero', 'offer', 'cta', ...FOOT],
  },

  // ── Know-how & industries ──
  {
    id: 'engineering-guide',
    group: 'blocks',
    section: 'Know-how & industries',
    label: 'Engineering guide',
    description: 'One article from the blog: its photo, the gist, key takeaways, related reading, an engineer to ask.',
    icon: 'book',
    needs: 'article',
    sketch: ['mast', 'stripe', 'image', 'heading', 'text', 'button', 'tiles-ticks', 'list', 'person', ...FOOT],
  },
  {
    id: 'industry-focus',
    group: 'blocks',
    section: 'Know-how & industries',
    label: 'Industry focus',
    description: 'One industry: its photo, what we supply for it, popular ranges and engineering guides.',
    icon: 'factory',
    needs: 'industry',
    sketch: ['mast', 'stripe', 'hero', 'text', 'grid', 'list', 'cta', ...FOOT],
  },

  // ── Company news ──
  {
    id: 'bulletin',
    group: 'blocks',
    section: 'Company news',
    label: 'Monthly bulletin',
    description: 'The month in one email: contents, new stock, the figures, a case study, engineering notes, brands, a tip.',
    icon: 'newspaper',
    sketch: ['mast', 'stripe', 'list', 'grid', 'stats', 'rows', 'list', 'tiles', 'quote', 'cta', ...FOOT],
  },
  {
    id: 'welcome',
    group: 'blocks',
    section: 'Company news',
    label: 'Welcome',
    description: 'For a new subscriber or customer: who we are in figures, what we stock, how to get a part priced, who to write to.',
    icon: 'hand',
    sketch: ['mast', 'stripe', 'heading', 'stats', 'text', 'tiles', 'steps', 'person', ...FOOT],
  },
  {
    id: 'event-invitation',
    group: 'blocks',
    section: 'Company news',
    label: 'Event invitation',
    description: 'A header, the details, what we are bringing, a book-a-meeting button.',
    icon: 'calendar',
    sketch: ['mast', 'stripe', 'hero', 'kv', 'text', 'grid', 'button', ...FOOT],
  },
  {
    id: 'office-notice',
    group: 'blocks',
    section: 'Company news',
    label: 'Office hours notice',
    description: 'A public holiday or a move: when we are closed, when we are back, who to call for a breakdown.',
    icon: 'clock',
    sketch: ['mast', 'stripe', 'poster', 'text', 'kv', 'person', ...FOOT],
  },
  {
    id: 'announcement',
    group: 'blocks',
    section: 'Company news',
    label: 'Announcement',
    description: 'A heading, a few paragraphs and one button. Plain and quick.',
    icon: 'megaphone',
    sketch: ['mast', 'stripe', 'heading', 'text', 'button', ...FOOT],
  },

  // ── Start from scratch ──
  {
    id: 'build-your-own',
    group: 'blocks',
    section: 'Start from scratch',
    label: 'Build your own',
    description: 'Just the masthead and the footer — add blocks one by one from the library.',
    icon: 'blocks',
    sketch: ['mast', 'stripe', ...FOOT],
  },
  { id: 'rich-blank', group: 'rich', section: 'Rich text', label: 'Blank', description: 'An empty page in the editor.', icon: 'file', sketch: ['text'] },
  { id: 'rich-letter', group: 'rich', section: 'Rich text', label: 'Letter', description: 'A greeting, your message and a sign-off.', icon: 'mail', sketch: ['text', 'text'] },
  {
    id: 'rich-digest',
    group: 'rich',
    section: 'Rich text',
    label: 'Monthly digest',
    description: 'The six newest products and the latest three articles, as linked lists.',
    icon: 'newspaper',
    sketch: ['text', 'list', 'list'],
  },
] as const satisfies readonly BuiltInTemplate[]

export type BuiltInTemplateId = (typeof BUILT_IN_TEMPLATES)[number]['id']
export const BUILT_IN_TEMPLATE_IDS = BUILT_IN_TEMPLATES.map((t) => t.id) as [BuiltInTemplateId, ...BuiltInTemplateId[]]

export const NEEDS_LABEL: Record<TemplateNeeds, { question: string; placeholder: string }> = {
  product: { question: 'Which product is it launching?', placeholder: 'Search products by name or SKU' },
  brand: { question: 'Which brand is it about?', placeholder: 'Search brands' },
  industry: { question: 'Which industry is it for?', placeholder: 'Search industries' },
  category: { question: 'Which range is it about?', placeholder: 'Search categories' },
  article: { question: 'Which article is it built on?', placeholder: 'Search blog articles' },
  service: { question: 'Which case study is it about?', placeholder: 'Search case studies' },
}
