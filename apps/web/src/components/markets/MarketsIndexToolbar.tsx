'use client'

import { useMemo, useState } from 'react'

/**
 * Jump nav and destination filter for the 126-card grid.
 *
 * NOT IN THE DESIGN, and added deliberately. The handoff calls it out: at 126
 * cards across eleven sections, "find my country" is the dominant task and a
 * jump nav is the first thing a real user will want. The design left both out
 * to keep the reference clean.
 *
 * HOW THE FILTER WORKS, AND WHY IT IS NOT REACT STATE
 *
 * The cards are server-rendered markup — all 126 links are in the HTML, which
 * is the entire point of this page for a crawler. Filtering them through React
 * would mean shipping the card list to the browser and re-rendering it, and
 * hiding cards from the DOM on a mobile-first crawler would hide the link mass
 * this page exists to distribute.
 *
 * So the filter never touches the DOM. It injects one `<style>` rule that
 * hides cards whose `data-mk` haystack does not contain every token typed, and
 * a second listing the regions with no match by id. Cards stay in the
 * document, in the source order, at every viewport; only their painting
 * changes. `display: none` is also what keeps a hidden card out of the tab
 * order without needing `tabindex` bookkeeping.
 *
 * Region emptiness is computed here rather than with `:has()` so the behaviour
 * does not depend on a selector Firefox only shipped in 121.
 */
export default function MarketsIndexToolbar({
  regions,
}: {
  regions: readonly {
    readonly name: string
    readonly anchor: string
    readonly count: number
    /** Lowercased `"{country} {region}"`, one per card in this region. */
    readonly haystacks: readonly string[]
  }[]
}) {
  const [query, setQuery] = useState('')

  /*
    Tokens are stripped to [a-z0-9] before they reach a selector. That is a
    correctness rule, not a nicety: these strings are interpolated into CSS,
    and a stray quote or brace would either break the sheet or let a typed
    string close the rule and open another.
  */
  const tokens = useMemo(
    () =>
      query
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.replace(/[^a-z0-9]/g, ''))
        .filter(Boolean)
        .slice(0, 6),
    [query]
  )

  const matcher = tokens.map((t) => `[data-mk*="${t}"]`).join('')

  const emptyRegions = useMemo(() => {
    if (tokens.length === 0) return []
    return regions.filter((r) => !r.haystacks.some((h) => tokens.every((t) => h.includes(t))))
  }, [regions, tokens])

  const matches = useMemo(() => {
    if (tokens.length === 0) return null
    return regions.reduce(
      (total, r) => total + r.haystacks.filter((h) => tokens.every((t) => h.includes(t))).length,
      0
    )
  }, [regions, tokens])

  return (
    <div
      /*
        107px is the sticky site header: a 34px utility bar over a 72px nav bar
        plus its 1px rule, from SiteHeaderClient. If that header changes height
        this number has to follow it — the failure is cosmetic overlap, not a
        broken page, but it is worth grepping for when the header is touched.

        NOT STICKY ON A PHONE. The bar is two rows tall below `sm`, and 112px
        of a 812px screen is too much rent for something a reader uses once.
        Above `sm` it costs a single row and earns its place across a
        9,000px page.
      */
      className="border-b border-ih-border bg-ih-surface/95 backdrop-blur supports-[backdrop-filter]:bg-ih-surface/85 sm:sticky sm:top-[107px] sm:z-30"
    >
      {matcher && (
        <style>
          {`[data-mk-card]:not(${matcher}){display:none}` +
            (emptyRegions.length > 0
              ? `${emptyRegions.map((r) => `#region-${r.anchor}`).join(',')}{display:none}`
              : '')}
        </style>
      )}

      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-3 sm:px-8 lg:flex-row lg:items-center lg:gap-6 lg:px-12">
        <div className="flex items-center gap-2.5">
          <label htmlFor="mk-filter" className="mono shrink-0 text-[10px] uppercase tracking-[0.13em] text-ih-muted">
            Find a destination
          </label>
          <input
            id="mk-filter"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Country or region"
            autoComplete="off"
            className="h-9 w-full min-w-0 rounded-lg border border-ih-border bg-ih-surface px-2.5 text-[13.5px] text-ih-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ih-muted focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft lg:w-[220px]"
          />
        </div>

        {/* Horizontally scrollable rather than wrapped: eleven region names
            wrap to three lines at 375px and push the grid off the first
            screen. */}
        <nav
          aria-label="Jump to a region"
          className="-mx-5 flex gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-1 lg:flex-wrap lg:overflow-visible lg:px-0"
        >
          {regions.map((region) => (
            <a
              key={region.anchor}
              href={`#region-${region.anchor}`}
              className="mono shrink-0 whitespace-nowrap rounded-sm px-2 py-1.5 text-[10px] uppercase tracking-[0.1em] text-ih-muted transition-colors hover:bg-ih-surface-2 hover:text-ih-accent"
            >
              {region.name} <span className="text-ih-muted-2">{region.count}</span>
            </a>
          ))}
        </nav>

        {/* Announced on change so a screen-reader user learns the grid
            shrank — the visual cue is 100 cards vanishing. */}
        <p role="status" aria-live="polite" className="mono shrink-0 text-[10px] uppercase tracking-[0.1em] text-ih-muted-2">
          {matches === null
            ? ''
            : matches === 0
              ? 'No destination matches — ask below'
              : `${matches} matching`}
        </p>
      </div>
    </div>
  )
}
