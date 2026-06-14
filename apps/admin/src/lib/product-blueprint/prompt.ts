import {
  BLUEPRINT_IMAGE_HEIGHT,
  BLUEPRINT_IMAGE_WIDTH,
} from './types'

export type BlueprintProductInput = {
  id: string
  sku: string
  mpn: string | null
  title: string
  descriptionShort: string | null
  brandName: string | null
  categoryName: string | null
  specs: Array<{
    group: string
    label: string
    value: string
    unit: string | null
  }>
}

export type BlueprintPromptResult = {
  prompt: string
  productSnapshot: BlueprintProductInput
}

export function buildProductBlueprintPrompt(
  product: BlueprintProductInput,
  customInstructions: string | null,
  date = new Date(),
): BlueprintPromptResult {
  const specs = product.specs
    .filter((spec) => spec.label.trim() && spec.value.trim())
    .slice(0, 24)

  const verifiedFacts = [
    `PRODUCT TITLE — ${product.title}`,
    `SKU — ${product.sku}`,
    product.mpn ? `MPN / SERIES — ${product.mpn}` : null,
    product.brandName ? `MANUFACTURER / BRAND — ${product.brandName}` : null,
    product.categoryName ? `PRODUCT TYPE — ${product.categoryName}` : null,
    product.descriptionShort ? `PRODUCT SUMMARY — ${product.descriptionShort}` : null,
    ...specs.map(
      (spec) =>
        `${spec.group.toUpperCase()} / ${spec.label.toUpperCase()} — ${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`,
    ),
  ]
    .filter((value): value is string => Boolean(value))
    .join('\n')

  const optionalDirection = customInstructions?.trim()
    ? `\nPRODUCT-SPECIFIC VISUAL DIRECTION FROM THE EDITOR:\n${customInstructions.trim().slice(0, 1500)}\n`
    : ''

  const revisionDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`

  const prompt = `Create a premium landscape technical blueprint-style product illustration for INDUS Hydraulics, composed specifically for a ${BLUEPRINT_IMAGE_WIDTH} x ${BLUEPRINT_IMAGE_HEIGHT} px product-image canvas with a 4:3 aspect ratio.

Use the supplied reference image as the strict visual system for drafting-paper treatment, typography hierarchy, navy accent color, technical callouts, specification icons, border marks, legend, XYZ axis, footer, and bottom-right title block. Adapt that visual system to the wider 4:3 landscape canvas. Create a new illustration of the product below; do not copy the reference product.

VERIFIED PRODUCT FACTS:
${verifiedFacts}
${optionalDirection}
ART DIRECTION:
- Landscape 4:3 technical publication plate, designed for the product-page image container at exactly ${BLUEPRINT_IMAGE_WIDTH} x ${BLUEPRINT_IMAGE_HEIGHT} px.
- Use the additional horizontal space intentionally: keep the large product schematic dominant while distributing callouts, specification icons, legend, and title block without crowding.
- Off-white drafting-paper background with a faint square grid, fine navy border, registration marks, and subtle paper texture.
- One large isometric engineering schematic dominates the page. Use clean technical linework, graphite cross-hatching, restrained realistic shading, and dark navy blue highlights.
- Show the product in the most informative three-quarter or isometric orientation. Add a partial cutaway, exploded section, or transparent section only when it genuinely explains the product construction.
- Use 4 to 6 lettered callouts around the product. Prefer verified construction facts supplied above. General visible component names may be used, but never invent materials, ratings, standards, certifications, dimensions, or performance claims.
- Add up to 3 right-side circular specification icons using only verified performance or dimensional facts supplied above. If fewer verified facts exist, use fewer icons.
- Top-left heading: a short series or product-family identifier on the first line, followed by the product type on the second line.
- Bottom-right title block title: ${product.title.toUpperCase()}
- Title block fields should include SERIES, TYPE, SIZE, WORKING PRESSURE, CONSTRUCTION, DRAWN BY, DATE, REV., and SCALE when verified values exist.
- DRAWN BY — INDUS HYDRAULICS
- DATE — ${revisionDate}
- REV. — 01
- SCALE — NTS
- Include a compact legend box, XYZ axis icon, footer text "INDUS QUALITY. ENGINEERED RELIABILITY.", and a dark navy IH / INDUS logo tile.
- Keep manufacturer identity accurate. If the verified brand is not INDUS, do not print INDUS branding on the physical product itself; INDUS belongs in the publication frame, title block, logo tile, and footer.
- All visible wording must be correctly spelled, technically coherent, and derived from the verified facts. Prefer omitting a field over fabricating a value.
- No people, workshop, environmental scene, photorealistic background, decorative props, watermarks, or unrelated branding.

OUTPUT REQUIREMENTS:
- Produce one polished ${BLUEPRINT_IMAGE_WIDTH} x ${BLUEPRINT_IMAGE_HEIGHT} opaque PNG in a 4:3 landscape aspect ratio.
- The final image must use the full ${BLUEPRINT_IMAGE_WIDTH} x ${BLUEPRINT_IMAGE_HEIGHT} canvas. Do not return a square image, portrait image, crop, padded square, or letterboxed composition.
- Match the reference image's dense but orderly information layout and premium technical-illustration finish.
- Ensure the main product remains immediately recognizable at ecommerce thumbnail size.
- Treat this as a finished catalogue plate, not a loose concept sketch.`

  return {
    prompt,
    productSnapshot: {
      ...product,
      specs,
    },
  }
}
