import { afterEach, describe, expect, it } from 'vitest'
import { showsReviewerAids } from './app-env'

/**
 * The polarity is the point.
 *
 * The predecessor read `process.env.VERCEL_ENV !== 'production'`, which is TRUE
 * when the variable is absent — so moving off Vercel would have published an
 * internal audit strip across 127 public market pages. These tests pin the
 * inverted rule: silence unless explicitly asked.
 */
const set = (k: string, v: string | undefined) => {
  if (v === undefined) delete (process.env as Record<string, string | undefined>)[k]
  else (process.env as Record<string, string | undefined>)[k] = v
}
const saved = { APP_ENV: process.env.APP_ENV, NODE_ENV: process.env.NODE_ENV }
afterEach(() => {
  set('APP_ENV', saved.APP_ENV)
  set('NODE_ENV', saved.NODE_ENV)
})

describe('showsReviewerAids', () => {
  it('is false when nothing is set — an unset environment is production', () => {
    // The regression that motivated the whole helper.
    set('APP_ENV', undefined)
    set('NODE_ENV', 'production')
    expect(showsReviewerAids()).toBe(false)
  })

  it('is false on a production host that sets APP_ENV explicitly', () => {
    set('APP_ENV', 'production')
    set('NODE_ENV', 'production')
    expect(showsReviewerAids()).toBe(false)
  })

  it('is true on a preview, which runs with NODE_ENV=production', () => {
    // Why NODE_ENV alone cannot be the signal.
    set('APP_ENV', 'preview')
    set('NODE_ENV', 'production')
    expect(showsReviewerAids()).toBe(true)
  })

  it('is true in local development with nothing set', () => {
    set('APP_ENV', undefined)
    set('NODE_ENV', 'development')
    expect(showsReviewerAids()).toBe(true)
  })

  it('is false for an unrecognised APP_ENV rather than defaulting to visible', () => {
    set('APP_ENV', 'staging-2')
    set('NODE_ENV', 'production')
    expect(showsReviewerAids()).toBe(false)
  })
})
