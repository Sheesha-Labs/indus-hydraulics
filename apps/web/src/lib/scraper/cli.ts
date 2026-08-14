#!/usr/bin/env tsx
/**
 * Competitor scraper CLI — sanity-check a target site before wiring it
 * through the admin UI + Inngest.
 *
 * Usage:
 *   pnpm --filter admin scraper:crawl <startUrl>
 *   pnpm --filter admin scraper:crawl <startUrl> --max=10
 *   pnpm --filter admin scraper:crawl <startUrl> --skip-probes
 *
 * Output: JSON to stdout. Errors to stderr. Exit non-zero on failure.
 */

import { discoverAndCrawl } from './crawl'

type Flags = { max?: number; skipProbes: boolean; help: boolean }

function parseArgs(argv: string[]): { startUrl: string | null; flags: Flags } {
  const flags: Flags = { skipProbes: false, help: false }
  let startUrl: string | null = null

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') flags.help = true
    else if (arg === '--skip-probes') flags.skipProbes = true
    else if (arg.startsWith('--max=')) {
      const n = Number(arg.slice('--max='.length))
      if (Number.isFinite(n) && n > 0) flags.max = Math.floor(n)
    } else if (!arg.startsWith('--') && !startUrl) {
      startUrl = arg
    }
  }

  return { startUrl, flags }
}

function printHelp() {
  console.error(`Competitor scraper CLI

Usage:
  pnpm --filter admin scraper:crawl <startUrl> [--max=N] [--skip-probes]

Arguments:
  <startUrl>     Sitemap URL, listing URL, or any page that points the
                 adapter at a catalogue. Required.

Flags:
  --max=N        Stop after N product URLs (default: 500).
  --skip-probes  Skip HEAD probes on candidate images (faster, less safe).
  --help         Show this message.

The CLI does NOT persist anything — it prints a JSON report. Wire the
admin UI in Phase 3 to actually save results to the database.`)
}

async function main() {
  const { startUrl, flags } = parseArgs(process.argv.slice(2))

  if (flags.help || !startUrl) {
    printHelp()
    process.exit(flags.help ? 0 : 1)
  }

  try {
    new URL(startUrl)
  } catch {
    console.error(`Invalid URL: ${startUrl}`)
    process.exit(1)
  }

  const started = Date.now()
  const result = await discoverAndCrawl(startUrl, {
    skipImageProbes: flags.skipProbes,
    maxUrls: flags.max,
    onProgress: ({ parsed, total, lastUrl }) => {
      // Progress to stderr so JSON on stdout is clean.
      process.stderr.write(`[${parsed}/${total}] ${lastUrl}\n`)
    },
  })

  const summary = {
    hostname: result.hostname,
    startUrl: result.startUrl,
    discoveredCount: result.discoveredUrls.length,
    productCount: result.products.length,
    errorCount: result.errors.length,
    elapsedMs: Date.now() - started,
    products: result.products,
    errors: result.errors,
  }

  process.stdout.write(JSON.stringify(summary, null, 2) + '\n')
}

main().catch((err) => {
  console.error('scraper:crawl failed:', err)
  process.exit(1)
})
