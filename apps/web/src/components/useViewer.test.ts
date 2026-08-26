import { afterEach, describe, expect, it } from 'vitest'
import { mightBeSignedIn } from './useViewer'

/**
 * The gate in front of `/api/me`.
 *
 * The header used to ask on every page load for every visitor — a
 * `force-dynamic` invocation and a database read per pageview, answered
 * "signed out" almost every time. This predicate is what stops that, so both
 * of its answers matter: a false negative hides the account UI from someone who
 * is signed in, and a false positive puts the cost straight back.
 */
describe('mightBeSignedIn', () => {
  // The suite runs in node, where there is no document. Standing one up is
  // more honest than pulling in jsdom for a one-line cookie read.
  const setCookie = (getter: () => string) => {
    Object.defineProperty(globalThis, 'document', {
      value: { get cookie() { return getter() } },
      configurable: true,
    })
  }
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'document')
  })

  it('is false when there is no document at all (server render)', () => {
    expect(mightBeSignedIn()).toBe(false)
  })

  it('is false when no cookies are set at all', () => {
    setCookie(() => '')
    expect(mightBeSignedIn()).toBe(false)
  })

  it('is false when other cookies are present but the hint is not', () => {
    setCookie(() => '_ga=GA1.1.123; other=1')
    expect(mightBeSignedIn()).toBe(false)
  })

  it('is true when the hint is present', () => {
    setCookie(() => 'indus.viewer=1')
    expect(mightBeSignedIn()).toBe(true)
  })

  it('is true when the hint sits among other cookies', () => {
    setCookie(() => '_ga=GA1.1.123; indus.viewer=1; other=1')
    expect(mightBeSignedIn()).toBe(true)
  })

  it('does not match a cookie that merely starts with the same text', () => {
    // `indus.viewer-something` is not the hint, and treating it as one would
    // reintroduce the per-pageview lookup for everybody.
    setCookie(() => 'indus.viewerish=1')
    expect(mightBeSignedIn()).toBe(false)
  })

  it('errs towards asking when the cookie jar cannot be read', () => {
    setCookie(() => {
      throw new Error('blocked')
    })
    // Better one wasted request than a signed-in customer stuck looking
    // signed out.
    expect(mightBeSignedIn()).toBe(true)
  })
})
