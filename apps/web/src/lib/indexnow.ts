import 'server-only'
import { after } from 'next/server'
import { BASE_URL } from './seo'

/**
 * IndexNow — tell Bing (and Yandex, Seznam, Naver) that a URL changed.
 *
 * ── Why ──────────────────────────────────────────────────────────────────────
 *
 * ChatGPT search, Copilot and DuckDuckGo answer from Bing's index. Bing finds
 * changes through the sitemap on its own schedule — days to weeks for a deep
 * product URL. An IndexNow ping gets the URL recrawled within hours, so an edit
 * made in the admin reaches the AI answer engines while it still matters.
 *
 * Google does not take part; Search Console and the sitemap still cover it.
 *
 * ── How ──────────────────────────────────────────────────────────────────────
 *
 * The key is public by design: the protocol proves host ownership by fetching
 * `/<key>.txt` from the site and comparing contents. The file lives in
 * `apps/web/public/`. Rotating the key means a new file and a new constant in
 * the same commit — `indexnow.test.ts` fails if they drift apart.
 *
 * The POST runs in `after()`, so it never delays the admin's save, and every
 * failure is swallowed: a missed ping costs nothing but a slower recrawl.
 *
 * Only production builds ping. A preview deployment shares the production
 * database, so its edits change the live site too — but a developer's machine
 * should not report URLs it did not change. Paths are always resolved against
 * BASE_URL, never the request host, because IndexNow rejects URLs whose host
 * does not match the key's.
 *
 * Bulk submission (a whole sitemap, or everything changed since a date by a DB
 * script) lives in `packages/db/scripts/indexnow-submit.mjs`.
 */

export const INDEXNOW_KEY = 'fbf421913ec69a52272b7edc01c08488'

const ENDPOINT = 'https://api.indexnow.org/indexnow'

/** The protocol's per-request ceiling. */
const MAX_URLS = 10_000

/** Absolute, same-host, de-duplicated URLs for the given storefront paths. */
export function indexNowUrls(paths: ReadonlyArray<string | null | undefined>): string[] {
  const urls = new Set<string>()
  for (const path of paths) {
    if (!path || !path.startsWith('/') || path.startsWith('//')) continue
    if (path === '/admin' || path.startsWith('/admin/')) continue
    urls.add(`${BASE_URL}${path}`)
  }
  return [...urls].slice(0, MAX_URLS)
}

/**
 * Queue an IndexNow ping for storefront paths that just changed.
 *
 * Call it beside the `revalidatePath` for the same public path. Unpublished or
 * deleted paths are worth sending too: the recrawl sees the 404 or redirect
 * and drops the stale copy from the index.
 */
export function notifyIndexNow(paths: ReadonlyArray<string | null | undefined>): void {
  if (process.env.NODE_ENV !== 'production') return
  const urlList = indexNowUrls(paths)
  if (urlList.length === 0) return

  after(async () => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: new URL(BASE_URL).host,
          key: INDEXNOW_KEY,
          keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
          urlList,
        }),
        signal: AbortSignal.timeout(5000),
      })
      // 200 and 202 are both success; 202 means the key check is still pending.
      if (!res.ok) console.warn(`[indexnow] ${res.status} for ${urlList.length} url(s)`)
    } catch (error) {
      console.warn('[indexnow] ping failed', error)
    }
  })
}

/**
 * An industry page changed. Built here rather than in the admin action because
 * `/industries` is also an admin section, and `admin-path-prefix.test.ts`
 * rightly flags a bare `/industries/...` literal inside the admin tree.
 */
export function notifyIndustryIndexNow(slug: string): void {
  notifyIndexNow([`/industries/${slug}`])
}
