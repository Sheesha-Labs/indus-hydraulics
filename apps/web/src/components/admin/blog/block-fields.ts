import type { BlogBlockInput } from '@indus/domain'

/**
 * Field descriptions for the block types an article is actually written from.
 *
 * One descriptor list per block rather than thirteen bespoke forms: the shapes
 * differ only in their fields, and thirteen hand-written forms would be
 * thirteen places for a label to lose its `htmlFor`, a required field to go
 * missing, or a max length to drift from the schema.
 *
 * The schema stays the authority on what is valid — `BlogBlockSchema` runs on
 * the submitted object and again on the server. These descriptors decide what
 * the form looks like and what it starts as, nothing more.
 *
 * The service-case-shaped blocks (`spec_table`, `sop_block`, `approach_grid`,
 * `team_list`, `problem_solution`, `result_box`) deliberately have no form.
 * They belong to /services case studies, they carry five-column rebuild tables
 * that no knowledge-base article has used, and a form for each would be a lot
 * of surface area for content nobody is writing here. They still round-trip
 * untouched — see the carry-through card.
 */

/** The single-value fields — everything a repeatable row is built from. */
export type ScalarField =
  | {
      kind: 'text' | 'textarea'
      key: string
      label: string
      hint?: string
      placeholder?: string
      required?: boolean
      rows?: number
      mono?: boolean
    }
  | {
      kind: 'select'
      key: string
      label: string
      hint?: string
      options: Array<{ value: string; label: string }>
    }

export type Field =
  | ScalarField
  /** An array of plain strings, e.g. `key_takeaways.items`. */
  | {
      kind: 'strings'
      key: string
      label: string
      hint?: string
      itemLabel: string
      placeholder?: string
      min: number
      max: number
    }
  /** An array of objects, each edited with its own sub-fields. */
  | {
      kind: 'rows'
      key: string
      label: string
      hint?: string
      itemLabel: string
      min: number
      max: number
      fields: ScalarField[]
    }
  /** The comparison table's columns + rows, which have to agree. */
  | { kind: 'matrix'; key: 'rows'; label: string; hint?: string }

export type BlockFormSpec = {
  type: string
  label: string
  /** One line under the dialog title — what the block is FOR, not what it is. */
  purpose: string
  fields: Field[]
  /** Starting value when the block is inserted. */
  template: () => BlogBlockInput
}

const FORMS: BlockFormSpec[] = [
  {
    type: 'key_takeaways',
    label: 'Key takeaways',
    purpose:
      'Opens the article. The block an answer engine lifts almost verbatim — write each point so it stands alone.',
    fields: [
      { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Key takeaways' },
      {
        kind: 'strings',
        key: 'items',
        label: 'Points',
        itemLabel: 'Point',
        placeholder: 'One complete, quotable sentence.',
        min: 2,
        max: 6,
      },
    ],
    template: () => ({ type: 'key_takeaways', items: ['', ''] }) as BlogBlockInput,
  },
  {
    type: 'direct_answer',
    label: 'Direct answer',
    purpose:
      'Sits under a question-shaped heading. Kept short on purpose: a 60-word answer gets quoted whole, a 300-word one gets skipped.',
    fields: [
      {
        kind: 'text',
        key: 'question',
        label: 'Question',
        required: true,
        placeholder: 'How do I identify a hydraulic fitting?',
      },
      { kind: 'textarea', key: 'answer', label: 'Answer', required: true, rows: 4 },
    ],
    template: () => ({ type: 'direct_answer', question: '', answer: '' }) as BlogBlockInput,
  },
  {
    type: 'comparison_table',
    label: 'Comparison table',
    purpose: 'Side-by-side compare — JIC vs ORFS vs BSPP, R1 vs R2 vs 4SP.',
    fields: [
      { kind: 'text', key: 'caption', label: 'Caption', placeholder: 'What the table compares' },
      {
        kind: 'matrix',
        key: 'rows',
        label: 'Table',
        hint: 'Every row carries one cell per column — a ragged table renders values under the wrong heading.',
      },
    ],
    template: () =>
      ({
        type: 'comparison_table',
        columns: ['', ''],
        rows: [{ cells: ['', ''] }],
      }) as BlogBlockInput,
  },
  {
    type: 'faq_block',
    label: 'FAQ',
    purpose:
      'Renders an accordion and feeds FAQPage structured data from the same text, so the two cannot disagree.',
    fields: [
      { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Common questions' },
      {
        kind: 'rows',
        key: 'items',
        label: 'Questions',
        itemLabel: 'Question',
        min: 1,
        max: 20,
        fields: [
          { kind: 'text', key: 'question', label: 'Question', required: true },
          { kind: 'textarea', key: 'answer', label: 'Answer', required: true, rows: 3 },
        ],
      },
    ],
    template: () =>
      ({ type: 'faq_block', items: [{ question: '', answer: '' }] }) as BlogBlockInput,
  },
  {
    type: 'callout',
    label: 'Callout',
    purpose:
      'A note beside the prose. Danger is reserved for genuine safety content — injection injury, stored energy, whip restraint.',
    fields: [
      {
        kind: 'select',
        key: 'tone',
        label: 'Tone',
        options: [
          { value: 'note', label: 'Note' },
          { value: 'warning', label: 'Warning' },
          { value: 'danger', label: 'Danger — safety' },
        ],
      },
      { kind: 'text', key: 'title', label: 'Title', required: true },
      { kind: 'textarea', key: 'body', label: 'Body', required: true, rows: 4 },
    ],
    template: () => ({ type: 'callout', tone: 'note', title: '', body: '' }) as BlogBlockInput,
  },
  {
    type: 'product_embed',
    label: 'Product embed',
    purpose:
      'Routes the article into the catalogue. Referenced by SKU, so a broken reference is legible rather than a dead id.',
    fields: [
      { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Parts for this job' },
      {
        kind: 'strings',
        key: 'skus',
        label: 'SKUs',
        itemLabel: 'SKU',
        hint: 'A SKU that no longer resolves is skipped on the article rather than rendering a dead card.',
        placeholder: 'IH-HOS-R2-08',
        min: 1,
        max: 8,
      },
      { kind: 'textarea', key: 'note', label: 'Note', rows: 2 },
    ],
    template: () => ({ type: 'product_embed', skus: [''] }) as BlogBlockInput,
  },
  {
    type: 'category_link',
    label: 'Category link',
    purpose: 'Points at a catalogue category hub.',
    fields: [
      {
        kind: 'text',
        key: 'slug',
        label: 'Category slug',
        required: true,
        mono: true,
        hint: 'The slug from the category URL — /c/<slug>.',
      },
      { kind: 'text', key: 'label', label: 'Link label', required: true },
      { kind: 'textarea', key: 'blurb', label: 'Blurb', rows: 2 },
    ],
    template: () => ({ type: 'category_link', slug: '', label: '' }) as BlogBlockInput,
  },
  {
    type: 'standard_citation',
    label: 'Standard citation',
    purpose:
      'A structured reference to a published standard. An article either has the reference or visibly does not.',
    fields: [
      {
        kind: 'text',
        key: 'standard',
        label: 'Standard',
        required: true,
        mono: true,
        placeholder: 'SAE J1273',
      },
      { kind: 'text', key: 'publisher', label: 'Publisher', required: true, placeholder: 'SAE International' },
      { kind: 'text', key: 'title', label: 'Document title', required: true },
      { kind: 'text', key: 'clause', label: 'Clause', mono: true, placeholder: '§4.2' },
      {
        kind: 'textarea',
        key: 'summary',
        label: 'What it says',
        required: true,
        rows: 4,
        hint: 'In our words. Never a substitute for reading the standard.',
      },
      { kind: 'text', key: 'url', label: 'Link', placeholder: 'https://…' },
      { kind: 'text', key: 'edition', label: 'Edition', placeholder: '2020' },
    ],
    template: () =>
      ({
        type: 'standard_citation',
        standard: '',
        publisher: '',
        title: '',
        summary: '',
      }) as BlogBlockInput,
  },
  {
    type: 'decision_tree',
    label: 'Decision tree',
    purpose:
      'Branching selection logic — hose grade by pressure, thread family by seat angle. The format engineers screenshot.',
    fields: [
      { kind: 'text', key: 'heading', label: 'Heading', required: true },
      { kind: 'textarea', key: 'intro', label: 'Intro', rows: 2 },
      {
        kind: 'rows',
        key: 'branches',
        label: 'Branches',
        itemLabel: 'Branch',
        min: 2,
        max: 12,
        fields: [
          {
            kind: 'text',
            key: 'condition',
            label: 'Condition',
            required: true,
            placeholder: 'Working pressure above 350 bar?',
          },
          {
            kind: 'text',
            key: 'outcome',
            label: 'Outcome',
            required: true,
            placeholder: 'Four-spiral — EN 856 4SP or 4SH.',
          },
          { kind: 'textarea', key: 'detail', label: 'Detail', rows: 2 },
          { kind: 'text', key: 'sku', label: 'SKU', mono: true },
        ],
      },
    ],
    template: () =>
      ({
        type: 'decision_tree',
        heading: '',
        branches: [
          { condition: '', outcome: '' },
          { condition: '', outcome: '' },
        ],
      }) as BlogBlockInput,
  },
  {
    type: 'download_block',
    label: 'Download',
    purpose: 'Files a reader can take away — a chart, a checklist, a datasheet.',
    fields: [
      { kind: 'text', key: 'heading', label: 'Heading' },
      {
        kind: 'rows',
        key: 'items',
        label: 'Files',
        itemLabel: 'File',
        min: 1,
        max: 10,
        fields: [
          { kind: 'text', key: 'label', label: 'Label', required: true },
          { kind: 'text', key: 'url', label: 'URL', required: true, mono: true },
          { kind: 'text', key: 'size', label: 'Size', required: true, placeholder: '1.2 MB' },
          { kind: 'text', key: 'format', label: 'Format', placeholder: 'PDF' },
        ],
      },
    ],
    template: () =>
      ({
        type: 'download_block',
        items: [{ label: '', url: '', size: '' }],
      }) as BlogBlockInput,
  },
  {
    type: 'cta_block',
    label: 'Call to action',
    purpose:
      'Closes the article. One that ranks and offers no path to a quote is a cost, not an asset.',
    fields: [
      { kind: 'text', key: 'heading', label: 'Heading', required: true },
      { kind: 'textarea', key: 'body', label: 'Body', required: true, rows: 3 },
      { kind: 'text', key: 'quoteLabel', label: 'Button label', placeholder: 'Request a quote' },
      {
        kind: 'text',
        key: 'quoteUrl',
        label: 'Button link',
        mono: true,
        hint: 'Leave blank to send readers to /quote.',
      },
    ],
    template: () => ({ type: 'cta_block', heading: '', body: '' }) as BlogBlockInput,
  },
  {
    type: 'pull_quote',
    label: 'Pull quote',
    purpose: 'A line worth setting apart, with who said it.',
    fields: [
      { kind: 'textarea', key: 'quote', label: 'Quote', required: true, rows: 3 },
      { kind: 'text', key: 'cite', label: 'Attribution', required: true },
    ],
    template: () => ({ type: 'pull_quote', quote: '', cite: '' }) as BlogBlockInput,
  },
  {
    type: 'as_of_stamp',
    label: 'As-of stamp',
    purpose:
      'When the figures on this page were last checked. Separate from the publish date — a 2024 article can carry a 2026-verified chart.',
    fields: [
      {
        kind: 'text',
        key: 'verifiedOn',
        label: 'Verified on',
        required: true,
        mono: true,
        placeholder: 'YYYY-MM-DD',
      },
      { kind: 'textarea', key: 'note', label: 'Note', rows: 2 },
    ],
    template: () => ({ type: 'as_of_stamp', verifiedOn: '' }) as BlogBlockInput,
  },
]

export const BLOCK_FORMS: ReadonlyArray<BlockFormSpec> = FORMS

const BY_TYPE = new Map(FORMS.map((f) => [f.type, f]))

/** The form for a block type, or undefined when it is carry-through only. */
export function blockForm(type: string | null | undefined): BlockFormSpec | undefined {
  return type ? BY_TYPE.get(type) : undefined
}
