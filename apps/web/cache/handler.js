// @ts-check
'use strict'

/**
 * Incremental cache for self-hosted Next.
 *
 * Two problems to solve, and they pull in different directions.
 *
 * 1. Next's own FileSystemCache keeps its tag manifest in a per-process Map and
 *    writes ISR entries inside the build output. Self-hosted that means a purge
 *    from the admin reaches only the instance that served the request, and a
 *    restart resurrects every page anyone purged.
 *
 * 2. A pure Redis handler fixes that but throws away every page prerendered at
 *    build time — Redis is empty on a fresh deploy, so `generateStaticParams`
 *    becomes dead weight and the first visitor to each page pays for a render.
 *
 * So this is composed: Redis in front for shared state, Next's FileSystemCache
 * behind it so build-time prerenders are still read, and a write-through on the
 * first read that promotes a prerendered page into Redis.
 *
 * A cache must never be the reason a page fails. Every Redis call is wrapped:
 * on any error it degrades to the filesystem and the request is served.
 */

const path = require('node:path')
const fs = require('node:fs')

const FileSystemCache =
  require('next/dist/server/lib/incremental-cache/file-system-cache').default

const { cacheNamespace, isStale, tagsFor } = require('./keys.js')

/** Tag purge timestamps, shared by every instance. */
const TAGS_KEY = 'next:tags'
/** How long a cached entry may sit in Redis untouched. Mirrors the 31 days a hosted ISR cache keeps. */
const ENTRY_TTL_SECONDS = 60 * 60 * 24 * 31

let clientPromise = null

/**
 * One lazily-created connection for the process.
 *
 * `lazyConnect` so importing this file cannot block startup, and a bounded
 * retry so a Redis outage degrades to the filesystem instead of hanging every
 * render behind a reconnect loop.
 */
function getClient() {
  if (clientPromise) return clientPromise
  const url = process.env.REDIS_URL
  if (!url) return (clientPromise = Promise.resolve(null))

  clientPromise = (async () => {
    try {
      const Redis = require('ioredis')
      const client = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        connectTimeout: 1000,
        commandTimeout: 1000,
        retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
      })
      // Without a listener, a connection error is an unhandled 'error' event and
      // takes the process down — a cache outage becoming a site outage.
      client.on('error', (err) => {
        if (process.env.NODE_ENV !== 'test') {
          console.warn('[cache] redis error, falling back to filesystem:', err.message)
        }
      })
      await client.connect()
      return client
    } catch (err) {
      console.warn('[cache] redis unavailable, using filesystem only:', err && err.message)
      return null
    }
  })()
  return clientPromise
}

module.exports = class RedisCacheHandler {
  /** @param {any} ctx */
  constructor(ctx) {
    this.ctx = ctx
    this.filesystem = new FileSystemCache(ctx)

    // The namespace decides whether a deploy keeps or drops the cache. Derived
    // from the client build, so a content-only deploy reuses it and a code
    // deploy does not — see the note in lib/cache-keys.ts.
    let manifest = null
    try {
      const dir = ctx && ctx.serverDistDir ? path.join(ctx.serverDistDir, '..') : null
      if (dir) manifest = fs.readFileSync(path.join(dir, 'build-manifest.json'), 'utf8')
    } catch {
      // Falls through to the build id below.
    }
    this.namespace = cacheNamespace(manifest, process.env.NEXT_BUILD_ID || 'dev')
  }

  /** @param {string} key */
  redisKey(key) {
    return `next:${this.namespace}:${key}`
  }

  /**
   * Purge timestamps for the tags on an entry.
   * Returns an empty map on any Redis problem, which reads as "nothing purged" —
   * the same answer a cold cache gives.
   */
  async revalidatedAt(tags) {
    if (tags.length === 0) return {}
    try {
      const client = await getClient()
      if (!client) return {}
      const values = await client.hmget(TAGS_KEY, ...tags)
      /** @type {Record<string, number>} */
      const out = {}
      tags.forEach((tag, i) => {
        const raw = values[i]
        if (raw != null) {
          const n = Number(raw)
          if (Number.isFinite(n)) out[tag] = n
        }
      })
      return out
    } catch {
      return {}
    }
  }

  async get(...args) {
    const [key, ctx] = args
    const client = await getClient().catch(() => null)

    if (client) {
      try {
        const raw = await client.get(this.redisKey(key))
        if (raw) {
          const entry = JSON.parse(raw)
          const tags = tagsFor(entry.value, ctx && ctx.tags, ctx && ctx.softTags)
          if (!isStale(entry.lastModified, tags, await this.revalidatedAt(tags))) {
            return entry
          }
          // Stale by tag. Drop it rather than leaving it to expire — otherwise
          // every later read repeats this lookup for an entry that can never
          // be served.
          await client.del(this.redisKey(key)).catch(() => {})
        }
      } catch {
        // Fall through to the filesystem.
      }
    }

    // Miss, or Redis is unreachable. The build-time prerenders live here.
    const fromDisk = await this.filesystem.get(...args)
    if (fromDisk && client) {
      // Promote it, so the second instance to want this page does not have to
      // read the disk of the first.
      const tags = tagsFor(fromDisk.value, ctx && ctx.tags, ctx && ctx.softTags)
      if (!isStale(fromDisk.lastModified, tags, await this.revalidatedAt(tags))) {
        await this.write(key, fromDisk).catch(() => {})
      } else {
        return null
      }
    }
    return fromDisk
  }

  async write(key, entry) {
    const client = await getClient()
    if (!client) return
    await client.set(this.redisKey(key), JSON.stringify(entry), 'EX', ENTRY_TTL_SECONDS)
  }

  async set(key, data, ctx) {
    // Written to both. The filesystem copy is what a fresh container reads
    // before Redis has warmed, and what keeps this working if Redis is down.
    await this.filesystem.set(key, data, ctx).catch(() => {})
    try {
      await this.write(key, { lastModified: Date.now(), value: data })
    } catch {
      // A cache write failing must not fail the request that triggered it.
    }
  }

  async revalidateTag(tags, durations) {
    const list = Array.isArray(tags) ? tags : [tags]
    if (list.length === 0) return

    // The filesystem handler keeps its own in-process manifest; call it so a
    // single-instance deployment behaves identically with or without Redis.
    await this.filesystem.revalidateTag(tags, durations).catch(() => {})

    try {
      const client = await getClient()
      if (!client) return
      const now = Date.now()
      const pairs = []
      for (const tag of list) pairs.push(tag, String(now))
      await client.hset(TAGS_KEY, ...pairs)
    } catch (err) {
      // Worth a line in the log: a dropped purge is an editor's change that
      // silently does not appear, which is otherwise very hard to diagnose.
      console.warn('[cache] tag purge did not reach redis:', err && err.message)
    }
  }

  resetRequestCache() {
    if (typeof this.filesystem.resetRequestCache === 'function') {
      this.filesystem.resetRequestCache()
    }
  }
}
