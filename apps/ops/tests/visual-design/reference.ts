import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { extname, join, normalize, sep } from 'node:path'
import type { Page } from '@playwright/test'

/**
 * Renders the handoff's .dc.html reference sheets for local design parity.
 *
 * The sheets load their kits with fetch() through ./support.js, which file:// blocks (CORS), so the
 * handoff folder is served over a throwaway loopback HTTP server. Nothing is written anywhere.
 */
export const REF_DIR = process.env.OPS_DESIGN_REF_DIR ?? ''
export const hasReference = (): boolean =>
  Boolean(REF_DIR && existsSync(join(REF_DIR, 'reference')))

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

let server: Server | undefined
let origin = ''

async function referenceOrigin(): Promise<string> {
  if (origin) return origin
  const root = normalize(REF_DIR)
  server = createServer((req, res) => {
    const path = normalize(join(root, decodeURIComponent((req.url ?? '/').split('?')[0]!)))
    if (!path.startsWith(root + sep) || !existsSync(path) || statSync(path).isDirectory()) {
      res.writeHead(404).end()
      return
    }
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
    createReadStream(path)
      .on('error', () => res.destroy())
      .pipe(res)
  })
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  return origin
}

export async function closeReference(): Promise<void> {
  await new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve()))
  server = undefined
  origin = ''
}

/**
 * Open reference/<htmlFile> at 1440 and wait until support.js has resolved every dc-import and the
 * layout has stopped moving (section heights equal on two polls after fonts are ready).
 */
export async function openReference(page: Page, htmlFile: string): Promise<void> {
  await page.goto(`${await referenceOrigin()}/reference/${encodeURIComponent(htmlFile)}`)
  // The sheets load Geist and Instrument Serif from Google Fonts through a helmet stylesheet that
  // arrives after the first fonts.ready; wait until both faces are really in use.
  await page.waitForFunction(
    async () => {
      await document.fonts.ready
      return (
        document.fonts.check('500 13px Geist') && document.fonts.check('40px "Instrument Serif"')
      )
    },
    undefined,
    { timeout: 20_000 }
  )
  let last = ''
  for (let i = 0; i < 40; i++) {
    const now = await page.evaluate(() =>
      [
        document.querySelectorAll('dc-import, x-import').length,
        ...[...document.querySelectorAll('section[id]')].map((s) =>
          Math.round(s.getBoundingClientRect().height)
        ),
      ].join(',')
    )
    if (now === last && now.startsWith('0,')) return
    last = now
    await page.waitForTimeout(400)
  }
  throw new Error(`${htmlFile} did not settle`)
}

/**
 * Screenshot an element without letting the capture resize the page. Playwright grows the viewport to
 * fit an element taller than it, and the sheets re-lay out at the new height, so both sides are first
 * given a viewport tall enough for the whole document (width stays 1440).
 */
export async function captureElement(page: Page, selector: string): Promise<Buffer> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  await page.setViewportSize({ width: 1440, height: Math.min(Math.max(940, height), 16_000) })
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  )
  return page.locator(selector).first().screenshot({ animations: 'disabled', caret: 'hide' })
}

/** PNG of `selector` inside the reference (default: the section's spec card). */
export async function renderReference(
  page: Page,
  htmlFile: string,
  sectionId: string,
  selector = `#${sectionId} > .cv-spec`
): Promise<Buffer> {
  await openReference(page, htmlFile)
  return captureElement(page, selector)
}

/** URL of a board PNG in the handoff (screens/png, templates/png or shell/png). */
export function boardPngPath(boardFile: string): string {
  for (const dir of ['screens/png', 'templates/png', 'shell/png']) {
    const p = join(REF_DIR, dir, boardFile)
    if (existsSync(p)) return p
  }
  throw new Error(`no board PNG named ${boardFile}`)
}
