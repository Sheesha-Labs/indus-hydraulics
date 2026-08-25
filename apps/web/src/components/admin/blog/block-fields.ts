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
 * Every block type in the union has a form. The six service-case shapes
 * (`problem_solution`, `approach_grid`, `spec_table`, `result_box`, `sop_block`,
 * `team_list`) were carry-through only at first, on the reasoning that no
 * knowledge-base article had used them; a failure-analysis or overhaul
 * write-up wants exactly those, and "the editor can display it but not create
 * it" is a worse answer than a form with a few more fields.
 *
 * The carry-through card remains for a block whose type is not in this list at
 * all — a row hand-written against a future schema, or one this build predates.
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
      /** MUST match the schema's `.default()`. See `newRow`. */
      default: string
    }
  | {
      kind: 'checkbox'
      key: string
      label: string
      hint?: string
      /** MUST match the schema's `.default()`. See `newRow`. */
      default: boolean
    }

/**
 * A fresh row, seeded from the descriptors' declared defaults.
 *
 * An added row used to start as `{}`, which reads as "unticked" and "first
 * option" in the form while the schema fills in its own defaults on save. A
 * task added to a procedure therefore showed as not-done and saved as done.
 * Declaring the default in one place and rendering from it removes the gap.
 */
export function newRow(fields: ScalarField[]): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const field of fields) {
    if (field.kind === 'select' || field.kind === 'checkbox') row[field.key] = field.default
  }
  return row
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
  /** A fixed nested object, e.g. `problem_solution.problem`. */
  | { kind: 'object'; key: string; label: string; hint?: string; fields: ScalarField[] }
  /**
   * An array of objects where one member is itself an array of objects — the
   * only two-deep shape in the set (`sop_block.phases[].rows[]`). Kept as its
   * own kind rather than making `rows` recursive: one block needs it, and a
   * general recursion would let a form nest four deep with no way to read it.
   */
  | {
      kind: 'groups'
      key: string
      label: string
      hint?: string
      itemLabel: string
      min: number
      max: number
      /** Fields on the group itself, e.g. the phase name. */
      fields: ScalarField[]
      /** The nested list every group carries. */
      nested: {
        key: string
        itemLabel: string
        min: number
        max: number
        fields: ScalarField[]
      }
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
        default: 'note',
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
    type: 'related_articles',
    label: 'Related articles',
    purpose:
      'Links sideways to other articles. The blog links down into the catalogue everywhere and sideways nowhere without this.',
    fields: [
      { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Related reading' },
      {
        kind: 'strings',
        key: 'slugs',
        label: 'Article slugs',
        itemLabel: 'Slug',
        hint: 'The slug from the article URL — /blog/<slug>. A slug that no longer resolves is skipped rather than rendering a dead link.',
        placeholder: 'stopping-an-npt-thread-leak',
        min: 1,
        max: 6,
      },
    ],
    template: () => ({ type: 'related_articles', slugs: [''] }) as BlogBlockInput,
  },
  {
    type: 'page_link',
    label: 'Page link',
    purpose: 'Points at a market, service or industry page.',
    fields: [
      {
        kind: 'select',
        key: 'kind',
        label: 'Page type',
        default: 'market',
        options: [
          { value: 'market', label: 'Export market — /markets/<slug>' },
          { value: 'service', label: 'Service — /services/<slug>' },
          { value: 'industry', label: 'Industry — /industries/<slug>' },
        ],
      },
      {
        kind: 'text',
        key: 'slug',
        label: 'Slug',
        required: true,
        mono: true,
        hint: 'The slug from the page URL. The prefix comes from the page type, so do not include it.',
      },
      { kind: 'text', key: 'label', label: 'Link label', required: true },
      { kind: 'textarea', key: 'blurb', label: 'Blurb', rows: 2 },
    ],
    template: () => ({ type: 'page_link', kind: 'market', slug: '', label: '' }) as BlogBlockInput,
  },
  {
    type: 'market_reach',
    label: 'Market reach',
    purpose:
      'Where we deliver the work this article describes. One paragraph plus the destinations, generated per blog category by the importer — edit here only to override it for a single article.',
    fields: [
      {
        kind: 'text',
        key: 'heading',
        label: 'Heading',
        required: true,
        placeholder: 'Where we send the replacement',
      },
      {
        kind: 'textarea',
        key: 'body',
        label: 'Paragraph',
        required: true,
        rows: 6,
        hint: 'Plain text, no HTML. No transit times, no premises abroad, no local-stock claims — the same rules the market pages are written to.',
      },
      {
        kind: 'groups',
        key: 'groups',
        label: 'Regions',
        itemLabel: 'Region',
        hint: 'Four regions reads best. The region name should match the markets index so the two agree.',
        min: 1,
        max: 6,
        fields: [
          {
            kind: 'text',
            key: 'region',
            label: 'Region',
            required: true,
            placeholder: 'GCC & Middle East',
          },
        ],
        nested: {
          key: 'markets',
          itemLabel: 'Destination',
          min: 1,
          max: 6,
          fields: [
            {
              kind: 'text',
              key: 'slug',
              label: 'Market slug',
              required: true,
              mono: true,
              placeholder: 'saudi-arabia',
              hint: 'From the /markets/<slug> URL. A slug with no live page is dropped when the article renders.',
            },
            {
              kind: 'text',
              key: 'name',
              label: 'Country name',
              required: true,
              placeholder: 'Saudi Arabia',
            },
          ],
        },
      },
      {
        kind: 'textarea',
        key: 'footnote',
        label: 'Closing line',
        rows: 2,
        hint: 'The link to the markets index is added automatically after this.',
      },
    ],
    template: () =>
      ({
        type: 'market_reach',
        heading: '',
        body: '',
        groups: [{ region: '', markets: [{ slug: '', name: '' }] }],
      }) as BlogBlockInput,
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
      {
        kind: 'text',
        key: 'publisher',
        label: 'Publisher',
        required: true,
        placeholder: 'SAE International',
      },
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
    type: 'problem_solution',
    label: 'Problem / solution',
    purpose:
      'Two columns side by side — what we were told against what we found. Sets a case up before the detail.',
    fields: [
      {
        kind: 'object',
        key: 'problem',
        label: 'Problem',
        fields: [
          {
            kind: 'text',
            key: 'label',
            label: 'Label',
            required: true,
            placeholder: 'What we were told',
          },
          { kind: 'text', key: 'title', label: 'Title', required: true },
          { kind: 'textarea', key: 'body', label: 'Body', required: true, rows: 4 },
        ],
      },
      {
        kind: 'object',
        key: 'solution',
        label: 'Solution',
        fields: [
          {
            kind: 'text',
            key: 'label',
            label: 'Label',
            required: true,
            placeholder: 'What we found',
          },
          { kind: 'text', key: 'title', label: 'Title', required: true },
          { kind: 'textarea', key: 'body', label: 'Body', required: true, rows: 4 },
        ],
      },
    ],
    template: () =>
      ({
        type: 'problem_solution',
        problem: { label: 'What we were told', title: '', body: '' },
        solution: { label: 'What we found', title: '', body: '' },
      }) as BlogBlockInput,
  },
  {
    type: 'approach_grid',
    label: 'Approach grid',
    purpose: 'The phases of a job, as a grid. Two to six of them.',
    fields: [
      {
        kind: 'rows',
        key: 'phases',
        label: 'Phases',
        itemLabel: 'Phase',
        min: 2,
        max: 6,
        fields: [
          {
            kind: 'text',
            key: 'number',
            label: 'Number',
            required: true,
            mono: true,
            placeholder: 'PHASE 01',
          },
          { kind: 'text', key: 'title', label: 'Title', required: true },
          { kind: 'textarea', key: 'body', label: 'Body', required: true, rows: 3 },
          {
            kind: 'text',
            key: 'duration',
            label: 'Duration',
            required: true,
            mono: true,
            placeholder: 'Days 0 — 2',
          },
        ],
      },
    ],
    template: () =>
      ({
        type: 'approach_grid',
        phases: [
          { number: 'PHASE 01', title: '', body: '', duration: '' },
          { number: 'PHASE 02', title: '', body: '', duration: '' },
        ],
      }) as BlogBlockInput,
  },
  {
    type: 'spec_table',
    label: 'Spec table',
    purpose:
      'As-found against after-rebuild, row by row. The shape a strip-down report is written in.',
    fields: [
      { kind: 'text', key: 'caption', label: 'Caption', required: true },
      {
        kind: 'rows',
        key: 'rows',
        label: 'Rows',
        itemLabel: 'Row',
        min: 1,
        max: 40,
        fields: [
          { kind: 'text', key: 'component', label: 'Component', required: true },
          { kind: 'text', key: 'spec', label: 'Spec', required: true, mono: true },
          { kind: 'text', key: 'asFound', label: 'As found', required: true, mono: true },
          { kind: 'text', key: 'afterRebuild', label: 'After rebuild', required: true, mono: true },
          { kind: 'text', key: 'status', label: 'Status', required: true },
          {
            kind: 'select',
            key: 'asFoundStyle',
            label: 'As-found style',
            options: [
              { value: 'plain', label: 'Plain' },
              { value: 'num', label: 'Measurement' },
              { value: 'bad', label: 'Failure — red' },
            ],
            default: 'plain',
          },
          {
            kind: 'select',
            key: 'afterStyle',
            label: 'After style',
            options: [
              { value: 'good', label: 'Pass — green' },
              { value: 'num', label: 'Measurement' },
              { value: 'plain', label: 'Plain' },
            ],
            default: 'good',
          },
          { kind: 'checkbox', key: 'highlight', label: 'Critical finding', default: false },
        ],
      },
    ],
    template: () =>
      ({
        type: 'spec_table',
        caption: '',
        rows: [
          {
            component: '',
            spec: '',
            asFound: '',
            afterRebuild: '',
            status: '',
            asFoundStyle: 'plain',
            afterStyle: 'good',
            highlight: false,
          },
        ],
      }) as BlogBlockInput,
  },
  {
    type: 'result_box',
    label: 'Result box',
    purpose: 'Closes a case with the numbers — two to six metric cells under a short summary.',
    fields: [
      {
        kind: 'text',
        key: 'label',
        label: 'Label',
        required: true,
        mono: true,
        placeholder: 'Result · summary',
      },
      { kind: 'text', key: 'title', label: 'Title', required: true },
      { kind: 'textarea', key: 'body', label: 'Body', required: true, rows: 4 },
      {
        kind: 'rows',
        key: 'cells',
        label: 'Metrics',
        itemLabel: 'Metric',
        min: 2,
        max: 6,
        fields: [
          {
            kind: 'text',
            key: 'value',
            label: 'Value',
            required: true,
            mono: true,
            placeholder: '32',
          },
          { kind: 'text', key: 'valueSmall', label: 'Unit', mono: true, placeholder: 'hrs' },
          { kind: 'text', key: 'label', label: 'Label', required: true },
          {
            kind: 'select',
            key: 'style',
            label: 'Style',
            options: [
              { value: 'neutral', label: 'Neutral' },
              { value: 'good', label: 'Good — green' },
              { value: 'accent', label: 'Accent' },
            ],
            default: 'neutral',
          },
        ],
      },
    ],
    template: () =>
      ({
        type: 'result_box',
        label: 'Result · summary',
        title: '',
        body: '',
        cells: [
          { value: '', label: '', style: 'accent' },
          { value: '', label: '', style: 'neutral' },
        ],
      }) as BlogBlockInput,
  },
  {
    type: 'sop_block',
    label: 'Procedure',
    purpose:
      'A checklist with a dark header bar, grouped into phases. Each task carries who did it and with what.',
    fields: [
      {
        kind: 'text',
        key: 'header',
        label: 'Header',
        required: true,
        mono: true,
        placeholder: 'SOP-OG-014 · HOSE OVERHAUL · REV 06',
      },
      {
        kind: 'text',
        key: 'completion',
        label: 'Completion',
        required: true,
        mono: true,
        placeholder: '32 / 32 COMPLETE',
      },
      {
        kind: 'groups',
        key: 'phases',
        label: 'Phases',
        itemLabel: 'Phase',
        min: 1,
        max: 12,
        fields: [
          {
            kind: 'text',
            key: 'name',
            label: 'Phase name',
            required: true,
            placeholder: 'Phase 01 · Mobilise & inspect',
          },
        ],
        nested: {
          key: 'rows',
          itemLabel: 'Task',
          min: 1,
          max: 30,
          fields: [
            { kind: 'text', key: 'task', label: 'Task', required: true },
            { kind: 'textarea', key: 'detail', label: 'Detail', required: true, rows: 2 },
            { kind: 'text', key: 'who', label: 'Who', required: true, placeholder: 'Field tech' },
            {
              kind: 'text',
              key: 'tool',
              label: 'Tool',
              required: true,
              placeholder: 'Torque wrench',
            },
            { kind: 'checkbox', key: 'done', label: 'Done', default: true },
          ],
        },
      },
    ],
    template: () =>
      ({
        type: 'sop_block',
        header: '',
        completion: '',
        phases: [
          {
            name: '',
            rows: [{ task: '', detail: '', who: '', tool: '', done: true }],
          },
        ],
      }) as BlogBlockInput,
  },
  {
    type: 'team_list',
    label: 'Team list',
    purpose: 'Who did the work, and what each of them was responsible for.',
    fields: [
      { kind: 'textarea', key: 'intro', label: 'Intro', rows: 3 },
      {
        kind: 'rows',
        key: 'members',
        label: 'Members',
        itemLabel: 'Member',
        min: 1,
        max: 20,
        fields: [
          { kind: 'text', key: 'name', label: 'Name', required: true },
          { kind: 'text', key: 'role', label: 'Role', required: true },
          { kind: 'text', key: 'location', label: 'Location' },
          { kind: 'textarea', key: 'scope', label: 'Scope', required: true, rows: 2 },
        ],
      },
      {
        kind: 'text',
        key: 'caseFileMeta',
        label: 'Case file line',
        mono: true,
        hint: 'Mono caps foot line, e.g. "Case file · INTAKE-0142 · Published 2026-08".',
      },
    ],
    template: () =>
      ({
        type: 'team_list',
        members: [{ name: '', role: '', scope: '' }],
      }) as BlogBlockInput,
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
