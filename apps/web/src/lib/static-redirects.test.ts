import { describe, expect, it } from 'vitest'
import { STATIC_STOREFRONT_REDIRECTS, staticRedirectSources } from './static-redirects'
import { STATIC_SITEMAP_PATHS } from './crawl-policy'

describe('static storefront redirects', () => {
  it('never redirects a path the sitemap also submits', () => {
    // The whole point of sharing this list with lib/sitemap-sections. A path
    // in both places is the site telling Google "index this" and "this moved".
    const sources = staticRedirectSources()
    const offenders = STATIC_SITEMAP_PATHS.filter((p) => sources.has(p.path)).map((p) => p.path)
    expect(offenders).toEqual([])
  })

  it('has no chains inside itself — every destination is a final URL', () => {
    // `/c/metallic-ptfe-hoses` pointed at `/c/metallic-hoses`, which was itself
    // redirected on to an intent slug. Two fetches to reach one page.
    const sources = staticRedirectSources()
    const chains = STATIC_STOREFRONT_REDIRECTS.filter((r) => sources.has(r.destination)).map(
      (r) => `${r.source} -> ${r.destination}`,
    )
    expect(chains).toEqual([])
  })

  it('never redirects a path to itself', () => {
    const loops = STATIC_STOREFRONT_REDIRECTS.filter((r) => r.source === r.destination)
    expect(loops).toEqual([])
  })

  it('declares one destination per source', () => {
    const seen = new Set<string>()
    const dupes: string[] = []
    for (const r of STATIC_STOREFRONT_REDIRECTS) {
      if (seen.has(r.source)) dupes.push(r.source)
      seen.add(r.source)
    }
    expect(dupes).toEqual([])
  })

  it('carries only storefront paths — admin redirects stay in next.config.ts', () => {
    const admin = STATIC_STOREFRONT_REDIRECTS.filter((r) => r.source.startsWith('/admin'))
    expect(admin).toEqual([])
  })

  it('skips pattern sources, which match no single sitemap URL', () => {
    expect(staticRedirectSources().has('/admin/cms/blog/:id')).toBe(false)
  })
})
