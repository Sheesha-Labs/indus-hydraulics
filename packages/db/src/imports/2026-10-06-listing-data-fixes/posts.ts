/**
 * Two category links in live articles that pointed at the wrong shelf.
 *
 * `/c/hose-clamps-sleeves-ferrules` holds industrial hose clamps — safety,
 * interlocking, sanitary and steam clamps. Two articles linked "clamps" to it
 * from a hydraulic order (fittings, ferrules, adapters), where the clamps meant
 * are tube clamps, which no shelf stocks. The word stays; the link goes. The
 * same link in the desalination and cam-and-groove articles is about
 * industrial hose and stays.
 *
 * `specialty-adapters-couplings` is the cam-and-groove specialties shelf. The
 * article on bridging two thread standards is about hydraulic adapters.
 *
 * The seed files were corrected with this runner, so a re-run of their own
 * importers does not put the links back: `2026-10-06-blog-inline-links/plans.ts`
 * (EN 10204), `2026-10-06-seo-content-fixes/post-links.ts` (certificate of
 * origin) and the africa-fittings wave-1 article (bridging).
 */

export type PostFix =
  | { slug: string; kind: 'unlink'; href: string; text: string }
  | { slug: string; kind: 'tile'; from: string; to: { slug: string; label: string; blurb: string } }
  | { slug: string; kind: 'text'; find: string; replace: string }

export const POST_FIXES: readonly PostFix[] = [
  // The tensioner listings no longer cite API 17J (rules.ts); the comparison
  // table that quoted them follows. Seed: 2026-08-17-blog-articles.
  {
    slug: 'api-7k-16c-16d-which-standard',
    kind: 'text',
    find: 'API 17J / Spec 7K',
    replace: 'API Spec 7K',
  },
  {
    slug: 'material-test-certificate-en-10204',
    kind: 'unlink',
    href: '/c/hose-clamps-sleeves-ferrules',
    text: 'clamps',
  },
  {
    slug: 'certificate-of-origin-gcc-duty',
    kind: 'unlink',
    href: '/c/hose-clamps-sleeves-ferrules',
    text: 'clamps',
  },
  {
    slug: 'bridging-two-thread-standards',
    kind: 'tile',
    from: 'specialty-adapters-couplings',
    to: {
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'JIC, ORFS, BSP, metric, NPT and SAE flange adapters, stocked in Dubai.',
    },
  },
]

/** `<a href="HREF">TEXT</a>` → `TEXT`, every occurrence. */
export function unlinkAnchor(
  html: string,
  href: string,
  text: string
): { html: string; hits: number } {
  const parts = html.split(`<a href="${href}">${text}</a>`)
  return { html: parts.join(text), hits: parts.length - 1 }
}

type Block = Record<string, unknown> & { type?: unknown }

/** Applies one fix to an article's blocks. Returns the new blocks and how many places changed. */
export function applyPostFix(
  blocks: readonly Block[],
  fix: PostFix
): { blocks: Block[]; hits: number } {
  if (fix.kind === 'text') {
    const r = mapStrings(blocks, (s) => {
      const parts = s.split(fix.find)
      return { text: parts.join(fix.replace), hits: parts.length - 1 }
    })
    return { blocks: r.value as Block[], hits: r.hits }
  }
  let hits = 0
  const next = blocks.map((block) => {
    if (fix.kind === 'tile') {
      if (block.type !== 'category_link' || block.slug !== fix.from) return block
      hits++
      return { ...block, slug: fix.to.slug, label: fix.to.label, blurb: fix.to.blurb }
    }
    if (typeof block.html !== 'string') return block
    const r = unlinkAnchor(block.html, fix.href, fix.text)
    if (!r.hits) return block
    hits += r.hits
    return { ...block, html: r.html }
  })
  return { blocks: next, hits }
}

/** Walks every string in a JSON value, applying `fn`; returns the new value and the hit count. */
export function mapStrings(
  value: unknown,
  fn: (s: string) => { text: string; hits: number }
): { value: unknown; hits: number } {
  if (typeof value === 'string') {
    const r = fn(value)
    return { value: r.text, hits: r.hits }
  }
  if (Array.isArray(value)) {
    let hits = 0
    const out = value.map((v) => {
      const r = mapStrings(v, fn)
      hits += r.hits
      return r.value
    })
    return { value: out, hits }
  }
  if (value && typeof value === 'object') {
    let hits = 0
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const r = mapStrings(v, fn)
      hits += r.hits
      out[k] = r.value
    }
    return { value: out, hits }
  }
  return { value, hits: 0 }
}
