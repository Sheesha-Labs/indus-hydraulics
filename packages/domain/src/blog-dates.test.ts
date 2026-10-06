import { describe, expect, it } from 'vitest'
import {
  blogPostModifiedAt,
  parseDateInput,
  resolveReviewedAt,
  shouldShowUpdatedDate,
} from './blog-dates'

const d = (iso: string) => new Date(iso)

describe('blogPostModifiedAt', () => {
  it('takes the newest of every date the post carries', () => {
    expect(
      blogPostModifiedAt({
        publishedAt: d('2026-08-24T10:00:00Z'),
        updatedAt: d('2026-09-03T12:00:00Z'),
        seoUpdatedAt: d('2026-08-30T00:00:00Z'),
        reviewedAt: null,
      }),
    ).toEqual(d('2026-09-03T12:00:00Z'))
  })

  it('counts a body edit, which the sitemap used to ignore', () => {
    // seoUpdatedAt older than the edit: the old `newest(seoUpdatedAt,
    // publishedAt)` reported the SEO save, not the content change.
    expect(
      blogPostModifiedAt({
        publishedAt: d('2026-08-24T00:00:00Z'),
        seoUpdatedAt: d('2026-08-25T00:00:00Z'),
        updatedAt: d('2026-10-01T00:00:00Z'),
      }),
    ).toEqual(d('2026-10-01T00:00:00Z'))
  })

  it('counts a review sign-off', () => {
    expect(
      blogPostModifiedAt({
        publishedAt: d('2026-08-24T00:00:00Z'),
        updatedAt: d('2026-08-24T00:00:00Z'),
        reviewedAt: d('2026-09-15T00:00:00Z'),
      }),
    ).toEqual(d('2026-09-15T00:00:00Z'))
  })

  it('returns null with no usable dates', () => {
    expect(blogPostModifiedAt({})).toBeNull()
    expect(blogPostModifiedAt({ updatedAt: new Date('nope') })).toBeNull()
  })
})

describe('shouldShowUpdatedDate', () => {
  it('hides a same-week change — part of publishing, not an update', () => {
    expect(shouldShowUpdatedDate(d('2026-08-24T00:00:00Z'), d('2026-08-25T11:00:00Z'))).toBe(false)
  })

  it('shows a change made a week or more later', () => {
    expect(shouldShowUpdatedDate(d('2026-08-24T00:00:00Z'), d('2026-08-31T00:00:00Z'))).toBe(true)
    expect(shouldShowUpdatedDate(d('2026-08-24T00:00:00Z'), d('2026-10-01T00:00:00Z'))).toBe(true)
  })

  it('hides it when either date is missing', () => {
    expect(shouldShowUpdatedDate(null, d('2026-10-01T00:00:00Z'))).toBe(false)
    expect(shouldShowUpdatedDate(d('2026-10-01T00:00:00Z'), null)).toBe(false)
  })
})

describe('parseDateInput', () => {
  it('reads a date input as UTC midnight', () => {
    expect(parseDateInput('2026-09-15')).toEqual(new Date('2026-09-15T00:00:00.000Z'))
  })

  it('refuses blanks, junk and impossible dates', () => {
    for (const v of ['', '   ', null, undefined, '15/09/2026', '2026-02-30', '2026-13-01']) {
      expect(parseDateInput(v)).toBeNull()
    }
  })
})

describe('resolveReviewedAt', () => {
  const now = new Date('2026-10-06T00:00:00Z')
  const before = new Date('2026-09-01T00:00:00Z')

  it('clears the date when the reviewer is cleared', () => {
    expect(
      resolveReviewedAt({ reviewerId: null, explicit: before, existing: before, existingReviewerId: 'a', now }),
    ).toBeNull()
  })

  it('uses an explicit date', () => {
    const explicit = new Date('2026-09-20T00:00:00Z')
    expect(
      resolveReviewedAt({ reviewerId: 'a', explicit, existing: before, existingReviewerId: 'a', now }),
    ).toEqual(explicit)
  })

  it('keeps the sign-off when the same reviewer is saved again', () => {
    expect(
      resolveReviewedAt({ reviewerId: 'a', explicit: null, existing: before, existingReviewerId: 'a', now }),
    ).toEqual(before)
  })

  it('stamps today for a new reviewer', () => {
    expect(
      resolveReviewedAt({ reviewerId: 'b', explicit: null, existing: before, existingReviewerId: 'a', now }),
    ).toEqual(now)
    expect(
      resolveReviewedAt({ reviewerId: 'b', explicit: null, existing: null, existingReviewerId: null, now }),
    ).toEqual(now)
  })
})
