// Intentionally NOT marked 'server-only' so the CLI (tsx) can import it.
// This module is only ever imported from server actions, the Inngest
// function, and the CLI — never from a client component.
import pThrottle from 'p-throttle'
import robotsParser from 'robots-parser'

/**
 * Throttled, robots-respecting HTTP layer for the competitor scraper.
 *
 * Each `ScraperContext` instance is scoped to one host so the throttler
 * + robots cache stays per-target. Concurrency / pacing defaults:
 *
 *   - 2 requests / second / host (interval-based, not just concurrent cap)
 *   - 15s timeout per HTML fetch
 *   - 30s timeout per image probe
 *   - identifying User-Agent — no browser-spoofing
 *
 * robots.txt is checked once on first request and cached for the lifetime
 * of the context. If the User-Agent is disallowed for a path, the fetch
 * rejects with `RobotsDisallowedError` — the caller (Inngest function)
 * surfaces this to the user as `ScraperJob.errorMessage = 'robots disallow'`.
 */

import type { ScraperContext } from './types'

export const USER_AGENT =
  'IndusHydraulics-Scraper/1.0 (+https://indushydraulics.com; ops@indushydraulics.me)'

export const DEFAULT_REQUESTS_PER_SECOND = 2
export const HTML_TIMEOUT_MS = 15_000
export const PROBE_TIMEOUT_MS = 30_000

export class RobotsDisallowedError extends Error {
  readonly code = 'ROBOTS_DISALLOWED'
  constructor(url: string) {
    super(`robots.txt disallows ${USER_AGENT} for ${url}`)
    this.name = 'RobotsDisallowedError'
  }
}

export class FetchTimeoutError extends Error {
  readonly code = 'TIMEOUT'
  constructor(url: string, timeoutMs: number) {
    super(`fetch ${url} exceeded ${timeoutMs}ms`)
    this.name = 'FetchTimeoutError'
  }
}

/**
 * Build a `ScraperContext` for a single host. Subsequent calls for the
 * same host should reuse the same context — the throttle queue and the
 * robots cache live inside the closure.
 */
export function createScraperContext(opts: {
  hostname: string
  /** Default 2 req/s; raise/lower per adapter if a site is fragile. */
  requestsPerSecond?: number
  /** Replace the global fetch in tests. */
  fetchImpl?: typeof fetch
}): ScraperContext {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch
  const rps = opts.requestsPerSecond ?? DEFAULT_REQUESTS_PER_SECOND
  const throttle = pThrottle({ limit: rps, interval: 1000 })

  let robotsPromise: Promise<ReturnType<typeof robotsParser> | null> | null = null
  function getRobots(forUrl: string) {
    if (!robotsPromise) {
      const robotsUrl = new URL('/robots.txt', forUrl).toString()
      robotsPromise = (async () => {
        try {
          const res = await fetchImpl(robotsUrl, {
            headers: { 'user-agent': USER_AGENT, accept: 'text/plain' },
            redirect: 'follow',
          })
          if (!res.ok) return robotsParser(robotsUrl, '') // no robots = allow all
          const text = await res.text()
          return robotsParser(robotsUrl, text)
        } catch {
          // Network blip fetching robots — fail open to allow.
          return robotsParser(robotsUrl, '')
        }
      })()
    }
    return robotsPromise
  }

  async function assertAllowed(url: string) {
    const robots = await getRobots(url)
    if (!robots) return
    if (robots.isDisallowed(url, USER_AGENT) || robots.isDisallowed(url, '*')) {
      throw new RobotsDisallowedError(url)
    }
  }

  const fetchWithTimeout = async (
    url: string,
    timeoutMs: number,
    init: RequestInit = {},
  ): Promise<Response> => {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), timeoutMs)
    try {
      return await fetchImpl(url, {
        ...init,
        signal: ctl.signal,
        headers: { 'user-agent': USER_AGENT, ...(init.headers ?? {}) },
        redirect: 'follow',
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new FetchTimeoutError(url, timeoutMs)
      }
      throw err
    } finally {
      clearTimeout(t)
    }
  }

  const throttledHtml = throttle(async (url: string) => {
    await assertAllowed(url)
    const res = await fetchWithTimeout(url, HTML_TIMEOUT_MS, {
      headers: { accept: 'text/html,application/xhtml+xml,application/xml;q=0.9' },
    })
    const html = res.status === 200 ? await res.text() : ''
    return { status: res.status, html, finalUrl: res.url || url }
  })

  const throttledProbe = throttle(async (url: string) => {
    await assertAllowed(url)
    // HEAD first; if the server rejects HEAD, fall through to a tiny GET.
    try {
      const head = await fetchWithTimeout(url, PROBE_TIMEOUT_MS, { method: 'HEAD' })
      if (head.status >= 200 && head.status < 400) {
        return {
          ok: true,
          contentType: head.headers.get('content-type') ?? undefined,
          bytes: numericHeader(head.headers.get('content-length')),
        }
      }
    } catch {
      // fall through to GET
    }
    try {
      const get = await fetchWithTimeout(url, PROBE_TIMEOUT_MS, {
        method: 'GET',
        headers: { range: 'bytes=0-1023' },
      })
      return {
        ok: get.status >= 200 && get.status < 400,
        contentType: get.headers.get('content-type') ?? undefined,
        bytes: numericHeader(get.headers.get('content-length')),
      }
    } catch {
      return { ok: false }
    }
  })

  return {
    fetchHtml: async (url) => throttledHtml(url),
    probeImage: async (url) => throttledProbe(url),
  }
}

/**
 * Lightweight XML fetcher for sitemap discovery — same throttler/robots,
 * no DOM parsing.
 */
export async function fetchXml(
  ctx: ScraperContext,
  url: string,
): Promise<{ status: number; xml: string }> {
  // We reuse the throttler indirectly by calling fetchHtml — the Accept
  // header is XML-friendly enough for sitemaps in practice.
  const res = await ctx.fetchHtml(url)
  return { status: res.status, xml: res.html }
}

function numericHeader(v: string | null): number | undefined {
  if (!v) return undefined
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : undefined
}
