/**
 * What "New newsletter" offers — the built-in templates' names, one-line
 * descriptions and whether one record has to be picked first. Pure data, so
 * the dialog (a client component) can show it; the builders that read the
 * database live in templates.ts.
 */

export type TemplateNeeds = 'product' | 'brand' | 'industry'

export type BuiltInTemplate = {
  id: string
  group: 'blocks' | 'rich'
  label: string
  description: string
  /** lucide icon name, mapped in the dialog. */
  icon: 'rocket' | 'award' | 'package' | 'tag' | 'factory' | 'calendar' | 'megaphone' | 'blocks' | 'file' | 'mail' | 'newspaper'
  /** One record the template is built around, picked in a second step. */
  needs?: TemplateNeeds
}

export const BUILT_IN_TEMPLATES = [
  {
    id: 'product-launch',
    group: 'blocks',
    label: 'Product launch',
    description: 'A launch mailer from one product: its photo, what it is, more from the same range, a quote ask.',
    icon: 'rocket',
    needs: 'product',
  },
  {
    id: 'brand-spotlight',
    group: 'blocks',
    label: 'Brand spotlight',
    description: 'One brand we supply: its photo and story, the figures, its newest products, a closing ask.',
    icon: 'award',
    needs: 'brand',
  },
  {
    id: 'featured-products',
    group: 'blocks',
    label: 'Featured products',
    description: 'Logo, an introduction, live cards for the newest products and brands, a closing ask.',
    icon: 'package',
  },
  {
    id: 'offer',
    group: 'blocks',
    label: 'Offer',
    description: 'A promotion: a header, an offer card with its badge and terms, the products it covers.',
    icon: 'tag',
  },
  {
    id: 'industry-focus',
    group: 'blocks',
    label: 'Industry focus',
    description: 'One industry: its photo, what we supply for it, popular ranges and engineering guides.',
    icon: 'factory',
    needs: 'industry',
  },
  {
    id: 'event-invitation',
    group: 'blocks',
    label: 'Event invitation',
    description: 'A header, the details, what we are bringing, a book-a-meeting button.',
    icon: 'calendar',
  },
  {
    id: 'announcement',
    group: 'blocks',
    label: 'Announcement',
    description: 'Logo, a heading, a few paragraphs and one button. Plain and quick.',
    icon: 'megaphone',
  },
  {
    id: 'build-your-own',
    group: 'blocks',
    label: 'Build your own',
    description: 'Just the logo and the footer — add blocks one by one from the library.',
    icon: 'blocks',
  },
  { id: 'rich-blank', group: 'rich', label: 'Blank', description: 'An empty page in the editor.', icon: 'file' },
  { id: 'rich-letter', group: 'rich', label: 'Letter', description: 'A greeting, your message and a sign-off.', icon: 'mail' },
  {
    id: 'rich-digest',
    group: 'rich',
    label: 'Monthly digest',
    description: 'The six newest products and the latest three articles, as linked lists.',
    icon: 'newspaper',
  },
] as const satisfies readonly BuiltInTemplate[]

export type BuiltInTemplateId = (typeof BUILT_IN_TEMPLATES)[number]['id']
export const BUILT_IN_TEMPLATE_IDS = BUILT_IN_TEMPLATES.map((t) => t.id) as [BuiltInTemplateId, ...BuiltInTemplateId[]]

export const NEEDS_LABEL: Record<TemplateNeeds, { question: string; placeholder: string }> = {
  product: { question: 'Which product is it launching?', placeholder: 'Search products by name or SKU' },
  brand: { question: 'Which brand is it about?', placeholder: 'Search brands' },
  industry: { question: 'Which industry is it for?', placeholder: 'Search industries' },
}
