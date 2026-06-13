# INDUS Product Blueprint Workflow

## Purpose

The product editor can generate square technical blueprint illustrations using the approved INDUS visual reference. Generated images remain drafts until a staff member accepts them.

## Workflow

1. Open a product in Admin and select **Images**.
2. In **Blueprint Studio**, optionally add product-specific visual direction.
3. Select **Generate draft**.
4. Inngest runs the OpenAI request in the background.
5. Review the draft for product geometry, labels, units, manufacturer identity, and invented claims.
6. Choose:
   - **Accept onto product** to create the `Media` and `ProductImage` records.
   - **Refine draft** to continue the same GPT-5.5 image conversation.
   - **Reject** to delete the draft object and retain a rejected audit record.

## Data Sources

The prompt is assembled from:

- Product title, SKU, and MPN
- Brand and category
- Short description
- Up to 24 product specifications
- Optional editor instructions
- The approved INDUS blueprint reference

The prompt explicitly forbids invented numeric values, materials, standards, certifications, or performance claims.

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
