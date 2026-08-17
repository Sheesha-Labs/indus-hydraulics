import { describe, expect, it } from 'vitest'
import { parseLocalDateTime, resolvePublishedAt } from './blog-publish-date'

const NOW = new Date('2026-08-17T10:00:00.000Z')
const ORIGINAL = new Date('2026-03-01T08:30:00.000Z')
const BACKDATED = new Date('2024-11-05T12:00:00.000Z')

describe('resolvePublishedAt', () => {
  it('stamps now on first publish', () => {
    expect(resolvePublishedAt({ explicit: null, existing: null, publish: true, now: NOW })).toEqual(
      NOW,
    )
  })

  it('leaves an already-published post on its original date when re-published', () => {
    // The regression this exists to prevent: editing a live post used to
    // re-date it to now, resetting its age in every downstream consumer.
    expect(
      resolvePublishedAt({ explicit: null, existing: ORIGINAL, publish: true, now: NOW }),
    ).toEqual(ORIGINAL)
  })

  it('keeps the date when a post is unpublished', () => {
    expect(
      resolvePublishedAt({ explicit: null, existing: ORIGINAL, publish: false, now: NOW }),
    ).toEqual(ORIGINAL)
  })

  it('leaves a never-published draft with no date', () => {
    expect(
      resolvePublishedAt({ explicit: null, existing: null, publish: false, now: NOW }),
    ).toBeNull()
  })

  it('lets an explicit date win over the existing one', () => {
    expect(
      resolvePublishedAt({ explicit: BACKDATED, existing: ORIGINAL, publish: true, now: NOW }),
    ).toEqual(BACKDATED)
  })

  it('lets an explicit date win on an unpublished draft', () => {
    expect(
      resolvePublishedAt({ explicit: BACKDATED, existing: null, publish: false, now: NOW }),
    ).toEqual(BACKDATED)
  })
})

describe('parseLocalDateTime', () => {
  it('parses a datetime-local value', () => {
    const parsed = parseLocalDateTime('2026-08-17T09:30')
    expect(parsed).toBeInstanceOf(Date)
    expect(Number.isNaN(parsed!.getTime())).toBe(false)
  })

  it('returns null for empty or whitespace input', () => {
    expect(parseLocalDateTime('')).toBeNull()
    expect(parseLocalDateTime('   ')).toBeNull()
  })

  it('returns null rather than an Invalid Date for junk', () => {
    expect(parseLocalDateTime('not-a-date')).toBeNull()
  })
})
