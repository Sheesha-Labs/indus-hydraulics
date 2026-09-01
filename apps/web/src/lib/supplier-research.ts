/**
 * Supplier discovery for one enquiry line.
 *
 * Two Claude calls, deliberately not one:
 *
 *   1. Web search with `web_search_20260209`, returning prose plus citations.
 *   2. Structured extraction over that prose with `output_config.format`.
 *
 * They are split because citations and `output_config.format` do not compose —
 * a document block with citations enabled plus a json_schema format returns a
 * 400. Rather than gamble on whether the same restriction bites for server-tool
 * citations, search and extraction are separate requests. It also means the
 * extraction prompt is a stable cacheable prefix.
 *
 * What this deliberately does NOT do: invent contact addresses. Every candidate
 * must carry an evidenceUrl the model actually saw. Contact resolution against
 * the supplier's own website is a separate, later step — guessing
 * `sales@<domain>` produces hard bounces, and at volume that costs the sending
 * reputation the customer quotes depend on.
 */

import Anthropic from '@anthropic-ai/sdk'

/** Opus 5. Research quality decides what we email a supplier under our name. */
const RESEARCH_MODEL = 'claude-opus-5'

/** USD per million tokens, for cost accounting. */
const PRICE = { input: 5.0, output: 25.0 } as const

const MAX_SEARCHES = 6

/** Hard ceiling per item — the cap the plan promised, enforced here. */
export const MAX_CANDIDATES_PER_ITEM = 10

export type ResearchedCandidate = {
  name: string
  country: string | null
  website: string | null
  domain: string | null
  kind: 'manufacturer' | 'distributor' | 'trader' | 'unknown'
  /** 0-1. How well this supplier matches the item, per the model. */
  fit: number
  certifications: string[]
  /** The URL the model actually read. Mandatory — no evidence, no candidate. */
  evidenceUrl: string
  /** Verbatim snippet supporting the claim. */
  evidenceSnippet: string
}

export type ResearchResult = {
  candidates: ResearchedCandidate[]
  costUsdMicros: number
  searchesUsed: number
  /** Populated when the web-search tool itself errored. */
  toolError: string | null
}

const CANDIDATE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['candidates'],
  properties: {
    candidates: {
      type: 'array',
      maxItems: MAX_CANDIDATES_PER_ITEM,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'country', 'website', 'kind', 'fit', 'certifications', 'evidenceUrl', 'evidenceSnippet'],
        properties: {
          name: { type: 'string' },
          country: { type: ['string', 'null'], description: 'ISO 3166-1 alpha-2, or null' },
          website: { type: ['string', 'null'] },
          kind: { type: 'string', enum: ['manufacturer', 'distributor', 'trader', 'unknown'] },
          fit: { type: 'number', minimum: 0, maximum: 1 },
          certifications: {
            type: 'array',
            items: { type: 'string' },
            description: 'Canonical tokens only, e.g. en10204-3.1, iacs, api, asme',
          },
          evidenceUrl: { type: 'string' },
          evidenceSnippet: { type: 'string' },
        },
      },
    },
  },
} as const

const EXTRACT_SYSTEM = `You convert supplier research notes into structured rows.

Rules, in order of importance:
1. Only include a company that appears in the notes with a real source URL. Never
   add a company you know of but which the notes do not mention.
2. evidenceUrl must be a URL that appears in the notes. evidenceSnippet must be
   text that appears in the notes. If you cannot supply both, omit the company.
3. Only list a certification the notes explicitly attribute to that company.
   An absent certification is not a "no" — it is simply omitted.
4. country is ISO 3166-1 alpha-2, or null when the notes do not say. Do not infer
   a country from the company name.
5. fit is how well the notes show this company matches the requested item:
   1.0 they make or stock exactly this, 0.5 they work in this category,
   0.2 adjacent only. Be conservative.
6. Never invent an email address, phone number or contact name. Those fields do
   not exist in this schema on purpose.`

function getClient(): Anthropic {
  return new Anthropic()
}

function costMicros(usage: { input_tokens?: number; output_tokens?: number } | undefined): number {
  if (!usage) return 0
  const input = ((usage.input_tokens ?? 0) / 1_000_000) * PRICE.input
  const output = ((usage.output_tokens ?? 0) / 1_000_000) * PRICE.output
  return Math.round((input + output) * 1_000_000)
}

/**
 * Read the search transcript out of a response.
 *
 * Server-tool errors do NOT raise. They come back as HTTP 200 with a
 * `web_search_tool_result` block whose `content` is a single error OBJECT
 * rather than the usual ARRAY of results. Branch on that before indexing, or a
 * failed search reads as an empty one.
 */
function readSearchResponse(content: unknown[]): { text: string; searches: number; toolError: string | null } {
  let text = ''
  let searches = 0
  let toolError: string | null = null

  for (const raw of content) {
    const block = raw as { type?: string; text?: string; content?: unknown }
    if (block.type === 'text' && typeof block.text === 'string') {
      text += block.text
      continue
    }
    if (block.type === 'web_search_tool_result') {
      if (Array.isArray(block.content)) {
        searches += 1
      } else if (block.content && typeof block.content === 'object') {
        const err = block.content as { error_code?: string }
        toolError = err.error_code ?? 'web_search_failed'
      }
    }
  }

  return { text, searches, toolError }
}

/**
 * Find candidate suppliers for one item description.
 *
 * Returns an empty candidate list rather than throwing when search yields
 * nothing usable — an item with no findable suppliers is a real outcome that
 * the human needs to see, not an error to retry.
 */
export async function researchSuppliers(input: {
  description: string
  requiredCertifications: string[]
  destinationCountry: string
}): Promise<ResearchResult> {
  const client = getClient()
  let cost = 0

  const certLine =
    input.requiredCertifications.length > 0
      ? `The buyer requires these certifications: ${input.requiredCertifications.join(', ')}. Note explicitly which suppliers can provide them.`
      : 'No specific certification is required.'

  // ── 1. Search ────────────────────────────────────────────────────────────
  const search = await client.messages.create({
    model: RESEARCH_MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium' },
    tools: [
      {
        type: 'web_search_20260209',
        name: 'web_search',
        max_uses: MAX_SEARCHES,
      },
    ] as unknown as Anthropic.Tool[],
    messages: [
      {
        role: 'user',
        content: `Find real companies that manufacture or stock this item, for a distributor in ${input.destinationCountry} sourcing it for a customer.

ITEM: ${input.description}

${certLine}

Search the web and report up to ${MAX_CANDIDATES_PER_ITEM} companies. For each one give the company name, its country, its own website URL, whether it is a manufacturer / distributor / trader, and any certifications the source states.

Only report companies you actually found a source for, and quote the source. Prefer manufacturers and specialist stockists over marketplaces and directories. Do not list Alibaba, IndiaMART, ThomasNet or similar aggregators as suppliers — they are directories, not companies that can quote.

If you cannot find good candidates, say so plainly rather than padding the list.`,
      },
    ],
  })

  cost += costMicros(search.usage)
  const { text, searches, toolError } = readSearchResponse(search.content)

  if (!text.trim()) {
    return { candidates: [], costUsdMicros: cost, searchesUsed: searches, toolError }
  }

  // ── 2. Structured extraction ─────────────────────────────────────────────
  const extract = await client.messages.create({
    model: RESEARCH_MODEL,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: CANDIDATE_SCHEMA },
    },
    system: [
      {
        type: 'text',
        text: EXTRACT_SYSTEM,
        // Stable prefix — only the notes vary between calls.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: `RESEARCH NOTES:\n\n${text}` }],
  })

  cost += costMicros(extract.usage)

  const block = extract.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text',
  )
  if (!block) {
    return { candidates: [], costUsdMicros: cost, searchesUsed: searches, toolError }
  }

  let parsed: { candidates?: unknown }
  try {
    parsed = JSON.parse(block.text) as { candidates?: unknown }
  } catch {
    return { candidates: [], costUsdMicros: cost, searchesUsed: searches, toolError: 'extraction_not_json' }
  }

  const candidates = normaliseCandidates(parsed.candidates)
  return { candidates, costUsdMicros: cost, searchesUsed: searches, toolError }
}

/** Best-effort hostname. Null rather than a guess. */
export function domainOf(website: string | null): string | null {
  if (!website) return null
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`)
    return url.hostname.replace(/^www\./, '').toLowerCase() || null
  } catch {
    return null
  }
}

/**
 * Drop anything that fails the evidence rule.
 *
 * The schema marks evidenceUrl required, but a required string can still be
 * empty, and "the model was told to" is not a guarantee. This is the gate that
 * actually holds.
 */
export function normaliseCandidates(raw: unknown): ResearchedCandidate[] {
  if (!Array.isArray(raw)) return []

  const out: ResearchedCandidate[] = []
  const seen = new Set<string>()

  for (const item of raw) {
    // A null or a bare string in the array must skip, not throw. Model output
    // is untrusted input like any other.
    if (typeof item !== 'object' || item === null) continue
    const c = item as Partial<ResearchedCandidate>
    if (typeof c.name !== 'string' || !c.name.trim()) continue
    if (typeof c.evidenceUrl !== 'string' || !/^https?:\/\//i.test(c.evidenceUrl)) continue
    if (typeof c.evidenceSnippet !== 'string' || !c.evidenceSnippet.trim()) continue

    const website = typeof c.website === 'string' && c.website.trim() ? c.website.trim() : null
    const domain = domainOf(website)
    const dedupeKey = (domain ?? c.name).toLowerCase()
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    const fit = typeof c.fit === 'number' && Number.isFinite(c.fit) ? Math.min(1, Math.max(0, c.fit)) : 0.3

    out.push({
      name: c.name.trim(),
      country: typeof c.country === 'string' && c.country.length === 2 ? c.country.toUpperCase() : null,
      website,
      domain,
      kind:
        c.kind === 'manufacturer' || c.kind === 'distributor' || c.kind === 'trader'
          ? c.kind
          : 'unknown',
      fit,
      certifications: Array.isArray(c.certifications)
        ? c.certifications.filter((s): s is string => typeof s === 'string').map((s) => s.toLowerCase())
        : [],
      evidenceUrl: c.evidenceUrl,
      evidenceSnippet: c.evidenceSnippet.trim().slice(0, 500),
    })

    if (out.length >= MAX_CANDIDATES_PER_ITEM) break
  }

  return out
}
