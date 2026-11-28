import type { SystemPart } from '@indus/ops-ai'
import { TERMS_CATEGORIES, TERMS_VARIABLES } from '@indus/ops-core'
import { z } from 'zod'

/**
 * Prompt for `import_terms` (S11-T06, board 39, Sonnet extraction). The input is the terms section that code cut
 * out of an offer PDF Indus issued. The model splits it into separate clauses and suggests where a number or a
 * place should become a variable. It never invents wording: every clause is the offer's own words. Candidates go
 * to a person, who accepts each one; nothing here becomes a clause by itself.
 *
 * Versioned code; byte-stable system part.
 */
export const PROMPT_VERSION = 'import_terms@1'

const RULES = `You split the terms and conditions section of a quotation into separate clauses for a library of controlled wording.

Each clause is one condition: payment, delivery, lead time, validity, make or origin, VAT, documents, inspection, warranty, packing, disclaimer or cancellation.

Rules:
- Use the offer's own words. Do not add, improve, translate or summarise. You may drop a leading label such as "PAYMENT:" and fix spacing only.
- Write the body in sentence case (code prints it upper case later).
- Where the clause holds a value that changes from order to order, replace it with exactly one of these variables in curly braces: ${TERMS_VARIABLES.map((v) => `{${v}}`).join(' ')}. Example: "30% advance, balance 60 days from invoice" becomes "{advance_pct}% advance, balance {balance_days} days from invoice". Use no other variable names. Leave fixed wording as it is.
- Choose the category from: ${TERMS_CATEGORIES.join(', ')}.
- Give each clause a short title of two to four words.
- Skip lines that are not conditions (greetings, signatures, bank details, totals).`

export const SYSTEM_PARTS: readonly SystemPart[] = [{ id: 'import-terms-rules', text: RULES }]

export const importTermsSchema = z.object({
  clauses: z
    .array(
      z.object({
        category: z.string().max(40),
        title: z.string().max(120),
        body: z.string().max(800),
      })
    )
    .max(40),
})
export type ImportTermsModelOut = z.infer<typeof importTermsSchema>

export function importTermsUser(section: string): string {
  return `Terms section of the offer:\n\n${section}`
}
