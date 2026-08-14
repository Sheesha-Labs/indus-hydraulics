import { BLUEPRINT_IMAGE_HEIGHT, BLUEPRINT_IMAGE_WIDTH } from './types'

export type BlueprintPromptAuthoringRequest = {
  instructions: string
  input: string
}

export function buildBlueprintPromptAuthoringRequest(
  productTitle: string,
  date = new Date()
): BlueprintPromptAuthoringRequest {
  const revisionDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`

  const instructions = `You write production-ready image-generation prompts for INDUS Hydraulics catalogue product plates.

Return exactly one self-contained prompt as plain text. Do not add analysis, Markdown fences, quotation marks, headings outside the prompt, alternatives, or placeholders.

The product title is the only product-specific source. Interpret familiar hydraulic and industrial terminology in the title so the illustration has technically plausible geometry, visible construction, component callouts, and qualitative specification language. Never invent exact dimensions, pressure values, temperature values, material grades, standards, certifications, model numbers, or performance claims that are not present in the title. When a fact is unknown, use a truthful qualitative description or omit it.

Every authored prompt must preserve this INDUS visual system:
- A premium ${BLUEPRINT_IMAGE_WIDTH} x ${BLUEPRINT_IMAGE_HEIGHT} px landscape 4:3 technical blueprint-style product illustration.
- Off-white drafting-paper background, faint square grid, fine border and registration marks, subtle paper texture, clean technical linework, graphite shading, and dark navy blue highlights.
- One large, immediately recognizable isometric engineering schematic with a deliberate diagonal composition and useful negative space.
- A partial cutaway, exploded section, transparent section, or sectional detail when it can explain the product's construction.
- Four to six lettered technical callouts. Name visible or safely inferred components and describe their function or qualitative construction without unsupported numeric facts.
- Three right-side specification icons using qualitative, title-supported attributes such as duty class, construction profile, flow path, connection style, flexibility, or service category.
- A concise top-left product-family heading and a bottom-right engineering title block.
- Title-block fields selected from SERIES, TYPE, SIZE, WORKING PRESSURE, CONSTRUCTION, DRAWN BY, DATE, REV., and SCALE. Include a field only when its value is explicit in the title or can remain qualitative.
- DRAWN BY — INDUS HYDRAULICS, DATE — ${revisionDate}, REV. — 01, and SCALE — NTS.
- A compact legend box, XYZ axis icon, footer text "INDUS QUALITY. ENGINEERED RELIABILITY.", and a dark navy IH / INDUS logo tile.
- INDUS branding belongs in the publication frame. Print branding on the physical product only when the title identifies it as INDUS or the product is clearly generic/unbranded.
- No people, workshop, environmental scene, photorealistic background, decorative props, watermarks, or unrelated branding.

Write the prompt with the same operational specificity as a strong art-director brief: state the product, composition, orientation, construction detail, callouts, icons, headings, title-block content, branding, exclusions, and output requirements. All visible wording must be correctly spelled and concise enough to remain legible. End by requiring one polished opaque PNG that uses the full landscape canvas without square padding, letterboxing, or cropping.`

  return {
    instructions,
    input: `Author the ready-to-use INDUS blueprint image prompt for this product title:\n${productTitle.trim()}`,
  }
}

export function normalizeAuthoredBlueprintPrompt(value: string): string {
  let prompt = value.trim()

  if (prompt.startsWith('```') && prompt.endsWith('```')) {
    prompt = prompt.replace(/^```(?:text)?\s*/i, '').replace(/\s*```$/, '')
  }

  if (
    (prompt.startsWith('"') && prompt.endsWith('"')) ||
    (prompt.startsWith('“') && prompt.endsWith('”'))
  ) {
    prompt = prompt.slice(1, -1)
  }

  return prompt.trim()
}
