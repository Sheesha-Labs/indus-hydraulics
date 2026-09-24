import { describe, expect, it } from 'vitest'
import { canonicalHostRedirect } from './canonical-host'

const BASE = 'https://indushydraulics.com'

describe('canonicalHostRedirect', () => {
  it('sends the production alias to the same path on the real domain', () => {
    expect(canonicalHostRedirect('indus-hydraulics.vercel.app', '/p/male-metric-tee', '', BASE)).toBe(
      'https://indushydraulics.com/p/male-metric-tee',
    )
  })

  it('carries the query string across', () => {
    expect(canonicalHostRedirect('indus-hydraulics.vercel.app', '/c/x', '?page=2', BASE)).toBe(
      'https://indushydraulics.com/c/x?page=2',
    )
  })

  it('ignores case and a port', () => {
    expect(canonicalHostRedirect('Indus-Hydraulics.vercel.app:443', '/', '', BASE)).toBe(
      'https://indushydraulics.com/',
    )
  })

  it('leaves the real domain alone', () => {
    expect(canonicalHostRedirect('indushydraulics.com', '/', '', BASE)).toBeNull()
  })

  // A reviewer on a preview must stay on the preview.
  it('leaves per-deployment and per-branch preview hosts alone', () => {
    expect(
      canonicalHostRedirect('indus-hydraulics-k22et2p75-ayushkbhatia-7383s-projects.vercel.app', '/', '', BASE),
    ).toBeNull()
    expect(
      canonicalHostRedirect('indus-hydraulics-git-main-ayushkbhatia-7383s-projects.vercel.app', '/', '', BASE),
    ).toBeNull()
  })

  it('leaves localhost alone', () => {
    expect(canonicalHostRedirect('localhost:3000', '/', '', BASE)).toBeNull()
  })

  it('serves a request with no host header', () => {
    expect(canonicalHostRedirect(null, '/', '', BASE)).toBeNull()
  })
})
