# INDUS Product Blueprint Workflow

## Purpose

The product editor generates 1600×1200 technical blueprint illustrations using the approved INDUS visual reference. The 4:3 landscape output matches the primary product-image container on every product page. Generated images remain drafts until a staff member accepts them.

## Workflow

1. Open a product in Admin and select **Images**.
2. In **Blueprint Studio**, select **Generate prompt**. The prompt author receives only the product title.
3. Review or edit the complete image prompt shown in the Studio.
4. Select **Generate image draft**. The exact visible prompt is saved to the audit context and sent to the image workflow.
5. Inngest runs the OpenAI image request in the background.
6. Review the draft for product geometry, labels, units, manufacturer identity, and invented claims.
7. Choose:
   - **Accept onto product** to create the `Media` and `ProductImage` records.
   - **Refine draft** to continue the same GPT-5.5 image conversation.
   - **Reject** to delete the draft object and retain a rejected audit record.

## Data Sources

The prompt author receives only the product title. Its code-managed authoring policy carries the
approved composition, cutaway, callout, icon, title-block, legend, axis, footer, branding, and output
requirements. The generated prompt remains editable before image generation.

The authoring policy explicitly forbids invented exact dimensions, pressure or temperature values,
material grades, standards, certifications, model numbers, or performance claims. Familiar product
terminology can be interpreted into technically plausible geometry and qualitative labels.

The image request also includes the approved INDUS blueprint reference.

Every generation request also explicitly requires:

- A 1600×1200 px opaque PNG
- A native 4:3 landscape composition
- No square output, padded square, letterboxing, or portrait crop
- Layout adaptation from the square style reference into the wider product-page canvas

## Storage Layout

- Reference: `product-images/generation-references/indus-technical-blueprint-v1.png`
- Drafts: `product-images/blueprint-drafts/<product-id>/<suggestion-id>-v<attempt>.png`
- Accepted: `product-images/products/<product-id>/<product-slug>-blueprint-<short-id>.png`

Drafts are deleted after acceptance or rejection. Accepted images use the normal product image data model and appear in the existing Images tab.

## Audit Trail

Each run creates an `AiSuggestion` row:

- `field`: `productBlueprint`
- `inputContext`: exact prompt, product snapshot, reference URL, attempts, refinement history, response ID, and Storage metadata
- `output`: draft URL while pending, accepted product URL after approval
- `status`: `pending`, `accepted`, or `rejected`
- `createdById` and `reviewedAt`: operator audit fields

The rows are visible in **SEO → AI Generation → Suggestion log** as part of the existing AI audit system.

## Required Environment

```dotenv
OPENAI_API_KEY="..."
OPENAI_BLUEPRINT_PROMPT_MODEL="gpt-5.5"
OPENAI_BLUEPRINT_ORCHESTRATOR_MODEL="gpt-5.5"
OPENAI_BLUEPRINT_IMAGE_MODEL="gpt-image-2"
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
```

For local development, run Admin on port 3001 and connect the Inngest dev server:

```bash
pnpm --filter admin dev
npx inngest-cli@latest dev
```

## Human QA Standard

Do not accept a draft unless:

- The illustrated product type is recognizable and technically plausible.
- All visible numbers, units, labels, and materials agree with catalogue data.
- Manufacturer identity is accurate.
- No unsupported certification or performance claim appears.
- The composition remains legible as an ecommerce thumbnail.
