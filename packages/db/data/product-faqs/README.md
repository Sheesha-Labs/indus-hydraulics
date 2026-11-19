# Product FAQ payloads

Programme plan and decisions: [`docs/product-faq-plan.md`](../../../../docs/product-faq-plan.md).

One JSON file per product family, grouped by wave (`pilot/`, `wave-1/` …). Each file replaces the
FAQs of every product it lists with 12 answer-first, search-shaped FAQs.

## Loop per family

1. **Dump the facts** (read-only, output stays OUT of the repo — scratch folder):

   ```bash
   pnpm --filter @indus/db exec tsx src/scripts/product-faqs/dump-facts.ts \
     --shelf=<category-slug> [--brand="<brand name>"] --out=<scratch>/<family>.json
   ```

2. **Write the payload** here from the facts. Shape and rules are in the header of
   `src/scripts/product-faqs/load-product-faqs.ts`.

3. **Check** (dry run — this is the review gate):

   ```bash
   pnpm --filter @indus/db exec tsx src/scripts/product-faqs/load-product-faqs.ts \
     --facts=<scratch>/<family>.json --payload=data/product-faqs/<wave>/<family>.json
   ```

   Hard checks: 10–12 FAQs; question names the product and ends in "?"; first sentence answers
   on its own (≤260 chars); every number traceable to the facts or `extraFacts`; no unsupported
   API / NACE / ATEX / certification claims; no supplier names (guard list lives outside the
   repo); every link is a live page and not the page itself; ≤3 products share an answer; the
   commercial FAQ matches the product's stock posture.

4. **Write** — add `--write`, plus `--allow-links` once the FAQ link renderer is deployed.
   Off-peak, not within an hour of a deploy. Then IndexNow the touched URLs.

Re-running the dump after a write shows the new FAQs as `existingFaqs`; payloads are idempotent.
