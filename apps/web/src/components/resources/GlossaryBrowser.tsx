'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Input } from '@indus/ui'
import { GLOSSARY, glossaryByLetter, glossaryTerm } from '@indus/domain'

/**
 * The A–Z glossary with a filter box.
 *
 * Renders every term on the server — the filter starts empty — so the whole
 * glossary is in the HTML, each term on its own `#slug` anchor. The filter only
 * hides what does not match; it never fetches.
 *
 * A cross-reference clears the filter before jumping, so following "see also"
 * cannot land on a term the current filter has hidden. A term reached by its
 * anchor is tinted with `:target`, which needs no script at all.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function GlossaryBrowser() {
  const [query, setQuery] = useState('')
  const groups = useMemo(() => glossaryByLetter(), [])
  const q = query.trim().toLowerCase()

  const visible = useMemo(() => {
    if (!q) return groups
    return groups
      .map((g) => ({
        letter: g.letter,
        terms: g.terms.filter(
          (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.terms.length > 0)
  }, [groups, q])

  const present = new Set(visible.map((g) => g.letter))
  const shown = visible.reduce((n, g) => n + g.terms.length, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="border-ih-border bg-ih-surface flex flex-col gap-4 rounded-lg border p-4">
        <label className="flex flex-col gap-1.5">
          <span className="mono text-ih-muted text-[10px] tracking-[0.12em] uppercase">
            Filter terms
          </span>
          <Input
            id="glossary-filter"
            type="search"
            className="h-10 text-[14px]"
            placeholder="Try ‘seat’, ‘crimp’ or ‘ORFS’"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </label>
        <nav aria-label="Glossary letters">
          <ul className="flex flex-wrap gap-1">
            {LETTERS.map((letter) =>
              present.has(letter) ? (
                <li key={letter}>
                  <a
                    href={`#letter-${letter}`}
                    className="mono border-ih-border bg-ih-surface text-ih-ink hover:border-ih-accent hover:text-ih-accent grid h-8 w-8 place-items-center rounded-sm border text-[12px]"
                  >
                    {letter}
                  </a>
                </li>
              ) : (
                <li key={letter}>
                  <span
                    aria-hidden="true"
                    className="mono text-ih-muted-2 grid h-8 w-8 place-items-center rounded-sm text-[12px] opacity-60"
                  >
                    {letter}
                  </span>
                </li>
              )
            )}
          </ul>
        </nav>
        <p
          aria-live="polite"
          className="mono text-ih-muted text-[11px] tracking-[0.08em] uppercase"
        >
          {q ? `${shown} of ${GLOSSARY.length} terms match` : `${GLOSSARY.length} terms`}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="border-ih-border-strong bg-ih-surface text-ih-muted rounded-lg border border-dashed px-5 py-8 text-center text-[14px]">
          No term matches “{query}”. Try a shorter word, or{' '}
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-ih-accent hover:underline"
          >
            clear the filter
          </button>
          .
        </p>
      ) : null}

      <div className="flex flex-col gap-10">
        {visible.map((group) => (
          <section
            key={group.letter}
            id={`letter-${group.letter}`}
            aria-labelledby={`letter-${group.letter}-heading`}
            className="scroll-mt-[124px]"
          >
            <h3
              id={`letter-${group.letter}-heading`}
              className="border-ih-border text-ih-ink border-b pb-2 font-serif text-[30px] leading-none font-normal"
            >
              {group.letter}
            </h3>
            <dl>
              {group.terms.map((term) => (
                <div
                  key={term.slug}
                  id={term.slug}
                  className="border-ih-border target:bg-ih-accent-soft grid scroll-mt-[124px] grid-cols-1 gap-x-8 gap-y-2 border-b py-5 target:px-4 md:grid-cols-[220px_minmax(0,1fr)]"
                >
                  <dt className="text-ih-ink text-[16px] leading-[1.35] font-medium tracking-[-0.01em]">
                    <a href={`#${term.slug}`} className="hover:text-ih-accent">
                      {term.term}
                    </a>
                  </dt>
                  <dd className="m-0">
                    <p className="text-ih-ink-2 max-w-[680px] text-[14.5px] leading-[1.65]">
                      {term.definition}
                    </p>
                    {term.see?.length || term.link ? (
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        {term.see?.length ? (
                          <p className="text-ih-muted flex flex-wrap items-center gap-1.5 text-[12.5px]">
                            <span className="mono text-[10px] tracking-[0.1em] uppercase">See</span>
                            {term.see.map((slug) => {
                              const target = glossaryTerm(slug)
                              return target ? (
                                <a
                                  key={slug}
                                  href={`#${slug}`}
                                  onClick={() => setQuery('')}
                                  className="border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent inline-flex h-6 items-center rounded-full border px-2.5 text-[12px]"
                                >
                                  {target.term}
                                </a>
                              ) : null
                            })}
                          </p>
                        ) : null}
                        {term.link ? (
                          <Link
                            href={term.link.href}
                            className="text-ih-accent text-[12.5px] font-medium hover:underline"
                          >
                            {term.link.label} →
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}
