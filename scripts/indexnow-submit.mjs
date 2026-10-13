#!/usr/bin/env node
/**
 * Bulk IndexNow submission from the live sitemap.
 *
 * The admin pings IndexNow on every save (apps/web/src/lib/indexnow.ts). This
 * covers what the admin does not see: content written by DB scripts and import
 * runners, and the first full submission after the key goes live.
 *
 *   node scripts/indexnow-submit.mjs --dry-run              # count, send nothing
 *   node scripts/indexnow-submit.mjs                        # every sitemap URL
 *   node scripts/indexnow-submit.mjs --since 2026-10-08     # lastmod on/after
 *   node scripts/indexnow-submit.mjs --section products     # one child sitemap
 *
 * Reads the public sitemap, so it needs no database access. Run it after a
 * script batch has gone live (ISR purged), not before — Bing recrawls within
 * hours and should see the new copy.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com'
// Keep in step with INDEXNOW_KEY in apps/web/src/lib/indexnow.ts.
const KEY = 'fbf421913ec69a52272b7edc01c08488'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const BATCH = 10_000

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  return i === -1 ? undefined : args[i + 1]
}
const dryRun = args.includes('--dry-run')
const since = flag('--since') ? new Date(flag('--since')) : null
const section = flag('--section')
if (since && Number.isNaN(since.getTime()))
  throw new Error('--since must be a date, e.g. 2026-10-08')

async function fetchXml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'indus-indexnow-submit' } })
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`)
  return res.text()
}

/** [{loc, lastmod}] for every <url> or <sitemap> entry in the document. */
function entries(xml, tag) {
  const out = []
  for (const m of xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))) {
    const loc = m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1]
    const lastmod = m[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1]
    if (loc)
      out.push({ loc: loc.replace(/&amp;/g, '&'), lastmod: lastmod ? new Date(lastmod) : null })
  }
  return out
}

const host = new URL(BASE_URL).host
const index = await fetchXml(`${BASE_URL}/sitemap.xml`)
let children = entries(index, 'sitemap')
if (section) children = children.filter((c) => c.loc.endsWith(`/${section}.xml`))
if (children.length === 0) children = [{ loc: `${BASE_URL}/sitemap.xml` }]

const urls = new Set()
for (const child of children) {
  const xml = child.loc.endsWith('/sitemap.xml') ? index : await fetchXml(child.loc)
  const rows = entries(xml, 'url').filter((u) => new URL(u.loc).host === host)
  // A URL with no lastmod is kept under --since: we cannot prove it is unchanged.
  const kept = since ? rows.filter((u) => !u.lastmod || u.lastmod >= since) : rows
  kept.forEach((u) => urls.add(u.loc))
  console.log(`${child.loc.replace(BASE_URL, '')}: ${kept.length}/${rows.length}`)
}

const list = [...urls]
console.log(
  `${list.length} URL(s)${since ? ` changed since ${since.toISOString().slice(0, 10)}` : ''}`
)
if (dryRun || list.length === 0) process.exit(0)

for (let i = 0; i < list.length; i += BATCH) {
  const urlList = list.slice(i, i + BATCH)
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${BASE_URL}/${KEY}.txt`, urlList }),
  })
  // 200 accepted; 202 accepted, key validation pending; 403 key file not found.
  console.log(
    `batch ${i / BATCH + 1}: ${urlList.length} URL(s) -> HTTP ${res.status} ${await res.text()}`
  )
  if (!res.ok) process.exitCode = 1
}
