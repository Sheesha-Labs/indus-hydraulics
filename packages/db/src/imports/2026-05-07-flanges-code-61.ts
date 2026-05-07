/**
 * Bulk SAE Flange Code 61 import — 2026-05-07
 *
 * 4 products extending the existing sae-flange-fittings category (which after
 * PR #67 had 10 products: 2 split-flange clamps and 8 Code-62 / Supercat
 * variants). The Code 61 flange-on-fitting family was empty — this batch
 * fills it with the 4 standard configurations.
 *
 *   - IH-FL-61      Flange Code 61 Hose Fitting (straight)
 *   - IH-FL-61-90   90° Flange Code 61 Hose Fitting
 *   - IH-FL-61-45   45° Flange Code 61 Hose Fitting
 *   - IH-FL-61-LD   Flange Code 61 Long Drop Hose Fitting
 *
 * Reuses Indus brand, sae-flange-spec template, and sae-flange-fittings
 * category — all from PR #67. No brand / category / spec-template / megamenu
 * changes in this batch.
 *
 * Run with:
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-flanges-code-61.ts --dry-run
 *   pnpm --filter @indus/db db:import src/imports/2026-05-07-flanges-code-61.ts
 */
import type { FaqEntry, ImportBatch, ProductImportPayload } from '../import/types'

// ── Common defaults ───────────────────────────────────────────────────────

const COMMON: Pick<
  ProductImportPayload,
  | 'brandSlug'
  | 'status'
  | 'unitOfMeasure'
  | 'listPriceCurrency'
  | 'stockQty'
  | 'leadTimeDays'
  | 'countryOfOrigin'
> = {
  brandSlug: 'indus',
  status: 'active',
  unitOfMeasure: 'each',
  listPriceCurrency: 'AED',
  stockQty: 0,
  leadTimeDays: 7,
  countryOfOrigin: 'UAE',
}

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Per-product input shape ───────────────────────────────────────────────

type FlangeConfig = 'straight' | '45-elbow' | '90-elbow' | 'long-drop'

type Code61Flange = {
  sku: string
  title: string
  configuration: FlangeConfig
  oneLiner: string
  notes?: string
}

// ── Shared values (Code 61 family) ────────────────────────────────────────

const SIZE_RANGE = '1/2" – 5"'
const WORKING_PRESSURE = 'up to 210 bar (3000 psi)'
const BOLT_PATTERN = 'SAE J518 Code 61 4-bolt; bolts SAE J429 Grade 5 minimum'
const APPLICABLE_STANDARDS = 'SAE J518 Code 61, ISO 6162-1'

const CONFIG_LABEL: Record<FlangeConfig, string> = {
  straight: 'straight',
  '45-elbow': '45° elbow',
  '90-elbow': '90° elbow',
  'long-drop': 'long-drop',
}

// ── HTML description ──────────────────────────────────────────────────────

function flangeHtml(g: Code61Flange): string {
  const config = CONFIG_LABEL[g.configuration]
  return `<p>The <strong>${escape(g.title)}</strong> is a Code 61 Flange-on-Fitting per SAE J518 Code 61 (standard-pressure, up to 210 bar / 3000 psi) — ${escape(config)} configuration.</p>
<h3>Construction</h3>
<ul>
<li>Type: Code 61 Flange-on-Fitting</li>
<li>Code: SAE J518 Code 61 (standard pressure)</li>
<li>Configuration: ${escape(g.configuration)}</li>
<li>Bolt pattern: ${escape(BOLT_PATTERN)}</li>
<li>Size range: ${escape(SIZE_RANGE)}</li>
<li>Material: Carbon steel (stainless steel available on request)</li>
<li>Surface treatment: Zinc-plated, Cr3+ passivated, RoHS-compliant</li>
${g.notes ? `<li>Notes: ${escape(g.notes)}</li>` : ''}
</ul>
<h3>Performance</h3>
<p>Working pressure ${escape(WORKING_PRESSURE)}. Operating temperature -40°C to +120°C. Sealed by a face O-ring under the flange head — no thread sealing required.</p>
<h3>Applicable Standards</h3>
<ul>
${APPLICABLE_STANDARDS.split(',')
  .map((s) => `<li>${escape(s.trim())}</li>`)
  .join('\n')}
</ul>
<h3>How to order</h3>
<p>Specify (a) the flange port size on your equipment, (b) matching Code 61 split-flange clamps (Indus IH-FL-CLAMP-61), and (c) for hose assemblies the host hose grade and overall length. Indus crimps and pressure-tests the assembly before dispatch.</p>
<h3>Companion products</h3>
<p>Pair with Indus Split Flange Clamps Code 61 (IH-FL-CLAMP-61) and the appropriate Indus crimp ferrule for the host hose grade. For high-pressure service above 210 bar, use the Code 62 family instead — Code 61 and Code 62 components are NOT interchangeable.</p>`
}

// ── FAQs (8 per product, Code-61-specific) ────────────────────────────────

function flangeFaqs(g: Code61Flange): FaqEntry[] {
  return [
    {
      q: 'What SAE J518 code series is this — Code 61 or Code 62?',
      a: 'Code 61 — standard-pressure series, rated up to 210 bar (3000 psi). Use Code 61 split-flange clamps to mount; Code 62 clamps are NOT interchangeable (different bolt pattern and pressure rating).',
    },
    {
      q: 'What is the working pressure rating?',
      a: `${WORKING_PRESSURE}. The pressure rating is set by the SAE J518 Code 61 series. The host hose grade must match — don't pair this fitting with a hose rated below 210 bar.`,
    },
    {
      q: 'What sizes are available?',
      a: `${SIZE_RANGE}. Code 61 supports a wider size range than Code 62 — sizes correspond to the flange port on the equipment side (pump, valve, cylinder).`,
    },
    {
      q: 'What bolt pattern does this flange use?',
      a: `${BOLT_PATTERN}. Bolt grade per SAE J429 Grade 5 minimum is sufficient for Code 61 standard-pressure service. (Code 62 high-pressure flanges require Grade 8 bolts.)`,
    },
    {
      q: 'What materials and finishes are available?',
      a: 'Standard: carbon steel with zinc-plated, Cr3+ passivated, RoHS-compliant finish. Stainless steel 316 available on request for marine, chemical, or food-grade service.',
    },
    {
      q: 'Do I need to order split-flange clamps separately?',
      a: 'Yes — flange-on-fitting variants must be paired with matching Indus Split Flange Clamps Code 61 (IH-FL-CLAMP-61) — NOT Code 62 clamps. Order quantity = number of flange joints (each joint takes 4 bolts + 2 clamp halves).',
    },
    {
      q: 'Is crimping included?',
      a: 'Crimping is quoted separately. Indus offers full assembly with pressure testing and certification on request — specify hose grade, length, and end fittings on the RFQ.',
    },
    {
      q: 'Lead time?',
      a: 'Common sizes (1/2" – 2") are ex-stock from Dubai. Larger flange sizes (2-1/2" – 5") typically ship within 7 working days.',
    },
  ]
}

// ── Translator ────────────────────────────────────────────────────────────

function makeFlange(g: Code61Flange): ProductImportPayload {
  return {
    ...COMMON,
    sku: g.sku,
    title: g.title,
    categorySlug: 'sae-flange-fittings',
    specTemplateSlug: 'sae-flange-spec',
    descriptionShort: `${g.oneLiner} SAE J518 Code 61 (210 bar), ${SIZE_RANGE}.`.slice(0, 500),
    descriptionLong: flangeHtml(g),
    specs: {
      flange_type: 'code-61-fitting',
      flange_code: 'code-61',
      configuration: g.configuration,
      nominal_size_range: SIZE_RANGE,
      working_pressure_max: WORKING_PRESSURE,
      bolt_pattern: BOLT_PATTERN,
      material: 'Carbon steel (stainless on request)',
      surface_treatment: 'Zinc-plated, Cr3+ passivated, RoHS-compliant',
      applicable_standards: APPLICABLE_STANDARDS,
    },
    faqs: flangeFaqs(g),
    seoTitle: `${g.title} | Indus Hydraulics`.slice(0, 200),
    seoDescription: g.oneLiner.slice(0, 500),
    focusKeyword: 'SAE J518 Code 61 flange',
  }
}

// ── Product data ──────────────────────────────────────────────────────────

const FLANGES: Code61Flange[] = [
  {
    sku: 'IH-FL-61',
    title: 'Flange Code 61 Hose Fitting',
    configuration: 'straight',
    oneLiner:
      'Straight Code 61 flange-on-fitting — standard-pressure hose end for SAE J518 Code 61 4-bolt mounting on hydraulic equipment up to 210 bar.',
  },
  {
    sku: 'IH-FL-61-90',
    title: '90° Flange Code 61 Hose Fitting',
    configuration: '90-elbow',
    oneLiner:
      '90° elbow Code 61 flange-on-fitting — standard-pressure hose end with right-angle drop from the flange head for tight routing.',
  },
  {
    sku: 'IH-FL-61-45',
    title: '45° Flange Code 61 Hose Fitting',
    configuration: '45-elbow',
    oneLiner:
      '45° elbow Code 61 flange-on-fitting — standard-pressure with moderate-angle drop from the flange head.',
  },
  {
    sku: 'IH-FL-61-LD',
    title: 'Flange Code 61 Long Drop Hose Fitting',
    configuration: 'long-drop',
    oneLiner:
      'Long-drop Code 61 flange-on-fitting — standard-pressure with extended barrel for clearance over hose ferrule shoulders.',
  },
]

// ── The batch ─────────────────────────────────────────────────────────────

const batch: ImportBatch = {
  meta: {
    id: '2026-05-07-flanges-code-61',
    description:
      'Bulk-add 4 SAE J518 Code 61 flange-on-fitting hose ends (straight, 45°, 90°, long-drop) under the existing sae-flange-fittings category. Reuses Indus brand and sae-flange-spec template — no schema, megamenu, or category changes.',
  },

  brands: [],
  categories: [],
  specTemplates: [],
  // No megamenu change — sae-flange-fittings is already a leaf under
  // "Hoses & Fittings → Hose Fittings" (added in PR #67).

  products: FLANGES.map(makeFlange),
}

export default batch
