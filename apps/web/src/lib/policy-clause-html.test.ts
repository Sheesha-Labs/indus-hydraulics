import { describe, expect, test } from 'vitest'
import { MASTER_PAGES, str } from '@indus/domain'
import { sanitizeBlogProseHtml } from './blog-prose-html'

/**
 * The policy clauses ship as HTML defaults and are sanitised against an
 * allow-list on save.
 *
 * That creates a trap with no other alarm on it: a clause written with a tag
 * the allow-list does not carry renders perfectly from the defaults, and then
 * silently loses that markup the first time an editor presses Save on the
 * page — including if they only changed a comma in a different clause. The
 * damage would be discovered by a reader, not by CI.
 *
 * So: sanitising a shipped clause must be a no-op.
 */
const POLICY_KEYS = ['privacy', 'terms']

function clauses() {
  return MASTER_PAGES.filter((page) => POLICY_KEYS.includes(page.key)).flatMap((page) =>
    page.sections
      .filter((section) => section.fields.some((f) => f.kind === 'richtext'))
      .map((section) => ({
        page: page.key,
        section: section.key,
        html: str(section.defaults, 'body') ?? '',
      })),
  )
}

describe('policy clause HTML', () => {
  test('both policy pages declare clauses', () => {
    const found = clauses()
    expect(found.length).toBeGreaterThanOrEqual(20)
    for (const key of POLICY_KEYS) {
      expect(found.some((c) => c.page === key), `${key} has no rich-text clauses`).toBe(true)
    }
  })

  test('every clause survives the save-time sanitiser unchanged', () => {
    for (const clause of clauses()) {
      expect(
        sanitizeBlogProseHtml(clause.html),
        `${clause.page}/${clause.section} loses markup when saved`,
      ).toBe(clause.html)
    }
  })

  test('no clause is empty, and none carries a stale leading number', () => {
    for (const clause of clauses()) {
      expect(clause.html.length, `${clause.page}/${clause.section} is empty`).toBeGreaterThan(20)
    }
    // The number comes from the clause's POSITION now. One typed into a title
    // would go stale the moment somebody reorders the document.
    for (const page of MASTER_PAGES.filter((p) => POLICY_KEYS.includes(p.key))) {
      for (const section of page.sections) {
        const heading = str(section.defaults, 'heading')
        if (heading) expect(heading, `${page.key}/${section.key}`).not.toMatch(/^\d+\.\s/)
      }
    }
  })
})
