/**
 * Prompt rendering for the AI Suggest layer.
 *
 * The "system" prompt is designed to be cached by Anthropic prompt caching:
 * the brand voice, JSON output schema, and few-shot examples are stable across
 * calls; the per-entity context goes in the user message.
 *
 * The library here is intentionally tiny — no LLM calls, no Prisma. The
 * server action that calls Anthropic imports `renderTemplate` and the
 * `defaultSystemPrompt*` constants.
 */

import { TITLE_RANGE, DESCRIPTION_RANGE } from './types'

/** Variables a prompt template can interpolate. */
export type PromptContext = {
  title?: string
  sku?: string
  mpn?: string
  brand?: string
  categoryPath?: string
  topSpecs?: string
  descriptionShort?: string
  focusKeyword?: string
}

/**
 * Replace `{{key}}` placeholders. Unknown placeholders are left as empty
 * strings so a sloppy template doesn't crash a generation.
 */
export function renderTemplate(template: string, ctx: PromptContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = (ctx as Record<string, string | undefined>)[key]
    return value ? value.toString() : ''
  })
}

/**
 * Default system prompt for meta_title generation. Designed to be the cached
 * prefix — only swap this out if the brand voice rules genuinely change.
 */
export const defaultSystemPromptMetaTitle = `You write SEO meta titles for an industrial hydraulics e-commerce catalogue (Indus Hydraulics — pumps, fittings, hoses, valves for B2B engineers and procurement buyers).

Rules:
- Output JSON only, with the schema {"title": string}.
- Keep titles between ${TITLE_RANGE.min} and ${TITLE_RANGE.max} characters.
- Lead with the most distinctive identifier (part number / SKU / MPN) when buyers search by it.
- Include the brand only when it is well known and adds search value.
- Use industrial terminology, not marketing language. No "premium", "best-in-class", "world-class".
- Do not invent specs or compatibility claims.

Few-shot examples:
{"title":"3/8 NPT Hydraulic Hose Fitting — Parker 10643-6-6"}
{"title":"SAE 100R2 Hydraulic Hose 1/2 in × 50 ft — Eaton EC600"}
{"title":"Pressure Relief Valve 3000 PSI Adjustable — Sun PRDB-LAN"}

Respond ONLY with the JSON object. No prose, no explanation.`

export const defaultSystemPromptMetaDescription = `You write SEO meta descriptions for the Indus Hydraulics B2B industrial catalogue.

Rules:
- Output JSON only, with the schema {"description": string}.
- Keep descriptions between ${DESCRIPTION_RANGE.min} and ${DESCRIPTION_RANGE.max} characters.
- Lead with the most useful technical fact (size, pressure rating, material).
- Include a buyer-relevant outcome (compatibility, lead time, application) when known.
- No exclamation marks. No "Shop now" / "Buy today" / urgency language.
- Do not invent specs or claims.

Few-shot examples:
{"description":"Parker 10643-6-6 hydraulic hose fitting, 3/8 in male NPT × -6 hose. Forged carbon steel, 5800 PSI working pressure. Compatible with 482-series hose. In stock — ships next business day."}
{"description":"Sun PRDB-LAN adjustable pressure relief valve, 0–3000 PSI range, 30 GPM rated flow. SAE-08 cartridge mount. Used in mobile-equipment hydraulic circuits and stationary power units."}

Respond ONLY with the JSON object. No prose, no explanation.`

export const defaultSystemPromptAltText = `You write image alt text for the Indus Hydraulics catalogue.

Rules:
- Output JSON only, with the schema {"alt": string}.
- Maximum 125 characters.
- Describe what is visibly in the image (product, angle, key visual feature). Do not restate the title or repeat brand+SKU verbatim.
- No "image of", "picture of" — just describe the subject.

Respond ONLY with the JSON object.`

/**
 * Default user template variables for a Product. Admins can edit the active
 * template per kind in /seo/ai/templates.
 */
export const defaultUserTemplateProduct = `Product:
- Title: {{title}}
- SKU: {{sku}}
- MPN: {{mpn}}
- Brand: {{brand}}
- Category: {{categoryPath}}
- Focus keyword: {{focusKeyword}}
- Key specs: {{topSpecs}}
- Short description: {{descriptionShort}}

Generate the field requested in the system instructions.`
