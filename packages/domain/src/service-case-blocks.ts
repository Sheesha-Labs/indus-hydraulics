/**
 * ServiceCase body block types — typed discriminated union with Zod runtime
 * validation. Stored as a JSONB array on `service_cases.bodyBlocks`.
 *
 * The /services/[slug] detail page renders an article from this array by
 * switching on `block.type`. Adding a new block kind = add a variant here +
 * a renderer component on the storefront. Removing a kind requires a data
 * migration (every published case may reference it).
 *
 * Sentinel values:
 *   - section_head.number → "/01" — display ordinal, drives the sticky TOC
 *   - figures use Media id (resolved server-side to mediaUrl())
 */
import { z } from 'zod'

// ── Shared atoms ──────────────────────────────────────────────────────────

const NonEmpty = (max: number) =>
  z.string().trim().min(1).max(max)

const OptionalText = (max: number) =>
  z.string().trim().max(max).optional().nullable()

const OutcomeStyleEnum = z.enum(['neutral', 'good', 'accent'])

// ── Block: section head ───────────────────────────────────────────────────
// Renders as a divider + numbered title (anchored for the sticky TOC).
export const SectionHeadBlockSchema = z.object({
  type: z.literal('section_head'),
  /** Display ordinal, e.g. "/01" — appears next to the H2. */
  number: NonEmpty(8),
  /** Section heading text, e.g. "The problem on the rig." */
  title: NonEmpty(200),
  /** URL anchor (kebab-case), e.g. "problem". Drives the TOC link target. */
  anchor: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'anchor must be kebab-case'),
})
export type SectionHeadBlock = z.infer<typeof SectionHeadBlockSchema>

// ── Block: lead paragraph (with drop cap) ─────────────────────────────────
export const LeadBlockSchema = z.object({
  type: z.literal('lead'),
  /** HTML; sanitised at render time. May contain <strong>. */
  html: NonEmpty(2000),
})
export type LeadBlock = z.infer<typeof LeadBlockSchema>

// ── Block: body paragraph ─────────────────────────────────────────────────
export const ParagraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  /** HTML; may contain <strong>, <a>, <em>, <ul>, <li>. */
  html: NonEmpty(4000),
})
export type ParagraphBlock = z.infer<typeof ParagraphBlockSchema>

// ── Block: problem / solution two-column ──────────────────────────────────
// Side-by-side comparison: red-bordered "what they told us" vs green-bordered
// "what we found." Used early in the article to set up the case.
export const ProblemSolutionBlockSchema = z.object({
  type: z.literal('problem_solution'),
  problem: z.object({
    label: NonEmpty(80),
    title: NonEmpty(200),
    body: NonEmpty(800),
  }),
  solution: z.object({
    label: NonEmpty(80),
    title: NonEmpty(200),
    body: NonEmpty(800),
  }),
})
export type ProblemSolutionBlock = z.infer<typeof ProblemSolutionBlockSchema>

// ── Block: figure (image with caption) ────────────────────────────────────
export const FigureBlockSchema = z.object({
  type: z.literal('figure'),
  /** Media row id; rendered via mediaUrl(). Optional for placeholder content. */
  imageId: z.string().trim().min(1).max(120).optional().nullable(),
  /** Plain-text caption fallback when imageId is missing — appears inside the placeholder box. */
  placeholderLabel: OptionalText(120),
  /** Caption text under the figure — supports a leading bold "FIG. NN" prefix. */
  captionPrefix: OptionalText(20),
  caption: NonEmpty(400),
  /** Aspect ratio CSS-style ("16/9", "21/9"). Default 16/9. */
  aspectRatio: z
    .enum(['16/9', '21/9', '4/3', '1/1'])
    .optional()
    .default('16/9'),
})
export type FigureBlock = z.infer<typeof FigureBlockSchema>

// ── Block: pull quote ─────────────────────────────────────────────────────
export const PullQuoteBlockSchema = z.object({
  type: z.literal('pull_quote'),
  quote: NonEmpty(600),
  /** Citation byline — appears in mono caps under the quote. */
  cite: NonEmpty(120),
})
export type PullQuoteBlock = z.infer<typeof PullQuoteBlockSchema>

// ── Block: 4-phase approach grid ──────────────────────────────────────────
export const ApproachGridBlockSchema = z.object({
  type: z.literal('approach_grid'),
  phases: z
    .array(
      z.object({
        /** Mono caps label, e.g. "PHASE 01" */
        number: NonEmpty(20),
        title: NonEmpty(80),
        body: NonEmpty(400),
        /** Mono footer, e.g. "Days 0 — 2" */
        duration: NonEmpty(40),
      }),
    )
    .min(2)
    .max(6),
})
export type ApproachGridBlock = z.infer<typeof ApproachGridBlockSchema>

// ── Block: SOP checklist ──────────────────────────────────────────────────
// A structured procedure block with a dark header bar (SOP id + N/N complete)
// and grouped phases of checked task rows. Each row carries owner + tool/method.
export const SopBlockSchema = z.object({
  type: z.literal('sop_block'),
  /** Header line, e.g. "SOP-OG-014 · HWU CYLINDER & HOSE OVERHAUL · REV 06 · NACE" */
  header: NonEmpty(160),
  /** Right-aligned completion, e.g. "32 / 32 COMPLETE" — accent-coloured. */
  completion: NonEmpty(40),
  phases: z
    .array(
      z.object({
        /** Phase heading, e.g. "Phase 01 · Mobilise & inspect" */
        name: NonEmpty(120),
        rows: z
          .array(
            z.object({
              task: NonEmpty(160),
              detail: NonEmpty(400),
              who: NonEmpty(40),
              tool: NonEmpty(40),
              done: z.boolean().default(true),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
})
export type SopBlock = z.infer<typeof SopBlockSchema>

// ── Block: before/after spec table ────────────────────────────────────────
export const SpecTableBlockSchema = z.object({
  type: z.literal('spec_table'),
  /** Caption above the table, mono caps. */
  caption: NonEmpty(200),
  rows: z
    .array(
      z.object({
        component: NonEmpty(120),
        spec: NonEmpty(80),
        asFound: NonEmpty(80),
        afterRebuild: NonEmpty(80),
        status: NonEmpty(80),
        /** Whether the row is highlighted (critical finding). */
        highlight: z.boolean().default(false),
        /** Style of as-found cell: 'bad' (red) for failures, 'num' (mono) for measurements. */
        asFoundStyle: z.enum(['bad', 'num', 'plain']).default('plain'),
        /** After-rebuild cell is always green if pass, else 'num'. */
        afterStyle: z.enum(['good', 'num', 'plain']).default('good'),
      }),
    )
    .min(1)
    .max(40),
})
export type SpecTableBlock = z.infer<typeof SpecTableBlockSchema>

// ── Block: dark result summary box ────────────────────────────────────────
export const ResultBoxBlockSchema = z.object({
  type: z.literal('result_box'),
  /** Mono accent label, e.g. "Result · summary" */
  label: NonEmpty(80),
  title: NonEmpty(300),
  body: NonEmpty(800),
  /** 2–6 metric cells; first cell typically uses 'accent' style. */
  cells: z
    .array(
      z.object({
        value: NonEmpty(40),
        valueSmall: OptionalText(20),
        label: NonEmpty(40),
        style: OutcomeStyleEnum.default('neutral'),
      }),
    )
    .min(2)
    .max(6),
})
export type ResultBoxBlock = z.infer<typeof ResultBoxBlockSchema>

// ── Block: team list ──────────────────────────────────────────────────────
export const TeamListBlockSchema = z.object({
  type: z.literal('team_list'),
  /** Optional intro paragraph before the bulleted list. */
  intro: OptionalText(800),
  members: z
    .array(
      z.object({
        name: NonEmpty(120),
        role: NonEmpty(120),
        location: OptionalText(120),
        scope: NonEmpty(400),
      }),
    )
    .min(1)
    .max(20),
  /** Optional foot meta line (mono caps), e.g. "Case file · INTAKE-... · Published..." */
  caseFileMeta: OptionalText(300),
})
export type TeamListBlock = z.infer<typeof TeamListBlockSchema>

// ── Discriminated union ───────────────────────────────────────────────────
export const BodyBlockSchema = z.discriminatedUnion('type', [
  SectionHeadBlockSchema,
  LeadBlockSchema,
  ParagraphBlockSchema,
  ProblemSolutionBlockSchema,
  FigureBlockSchema,
  PullQuoteBlockSchema,
  ApproachGridBlockSchema,
  SopBlockSchema,
  SpecTableBlockSchema,
  ResultBoxBlockSchema,
  TeamListBlockSchema,
])
export type BodyBlock = z.infer<typeof BodyBlockSchema>

export const BodyBlocksSchema = z.array(BodyBlockSchema)
export type BodyBlocks = z.infer<typeof BodyBlocksSchema>

// ── Right rail / meta strip / card schemas ────────────────────────────────

export const MetaCellSchema = z.object({
  label: NonEmpty(40),
  value: NonEmpty(40),
  /** Smaller appended text, e.g. "· 50 klb HWU" after the bold value. */
  valueSmall: OptionalText(40),
  style: OutcomeStyleEnum.default('neutral'),
})
export type MetaCell = z.infer<typeof MetaCellSchema>
export const MetaCellsSchema = z.array(MetaCellSchema).max(6)

export const SpecAtGlanceSchema = z.object({
  label: NonEmpty(40),
  value: NonEmpty(60),
})
export type SpecAtGlance = z.infer<typeof SpecAtGlanceSchema>
export const SpecsAtGlanceSchema = z.array(SpecAtGlanceSchema).max(20)

export const DownloadSchema = z.object({
  label: NonEmpty(80),
  url: NonEmpty(800),
  size: NonEmpty(40),
  /** Optional format pill text, e.g. "PDF" / "XLSX" / "ZIP". */
  format: OptionalText(20),
})
export type Download = z.infer<typeof DownloadSchema>
export const DownloadsSchema = z.array(DownloadSchema).max(20)

export const CardOutcomePillSchema = z.object({
  label: NonEmpty(40),
  style: OutcomeStyleEnum.default('neutral'),
})
export type CardOutcomePill = z.infer<typeof CardOutcomePillSchema>
export const CardOutcomePillsSchema = z.array(CardOutcomePillSchema).max(6)

export const GalleryImageIdsSchema = z.array(z.string().trim().min(1).max(120)).max(60)

// ── Display helpers ───────────────────────────────────────────────────────

export const SERVICE_CASE_CATEGORY_LABELS: Record<string, string> = {
  cylinders: 'Cylinders',
  hoses: 'Hoses',
  pumps: 'Pumps',
  valves_manifolds: 'Valves & manifolds',
  bop_pressure_control: 'BOP & pressure control',
  ct_wireline: 'CT & wireline',
  wellhead: 'Wellhead',
  field_service: 'Field service',
  lab_forensics: 'Lab & forensics',
  custom_builds: 'Custom builds',
}

export type ServiceCaseCategoryKey = keyof typeof SERVICE_CASE_CATEGORY_LABELS

/** Resolve a category enum value to a human-readable chip label (with fallback). */
export function serviceCaseCategoryLabel(category: string): string {
  return SERVICE_CASE_CATEGORY_LABELS[category] ?? category
}
