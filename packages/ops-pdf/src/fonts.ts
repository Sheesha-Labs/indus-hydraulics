import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Font } from '@react-pdf/renderer'

/**
 * The two families every Indus document uses (CLAUDE.md §4.6): Geist 400/500/600 and Instrument Serif 400,
 * from TTFs committed in packages/ops-pdf/fonts (OFL, see the licence files there). No monospace family is
 * registered and no style names the built-in Courier (ops-no-mono.test.ts scans this package).
 *
 * The directory is found relative to this file in source and tests, and relative to the working directory in
 * a traced server build (apps/ops/next.config.ts includes packages/ops-pdf/fonts/**).
 */
export const SANS = 'Geist'
export const SERIF = 'Instrument Serif'

const FILES = [
  'Geist-Regular.ttf',
  'Geist-Medium.ttf',
  'Geist-SemiBold.ttf',
  'InstrumentSerif-Regular.ttf',
]

export function fontsDir(): string {
  const here = (() => {
    try {
      return dirname(fileURLToPath(import.meta.url))
    } catch {
      return ''
    }
  })()
  const candidates = [
    here && join(here, '..', 'fonts'),
    join(process.cwd(), 'packages', 'ops-pdf', 'fonts'),
    join(process.cwd(), '..', '..', 'packages', 'ops-pdf', 'fonts'),
  ].filter(Boolean)
  const dir = candidates.find((d) => FILES.every((f) => existsSync(join(d, f))))
  if (!dir) throw new Error('ops-pdf: the committed fonts were not found next to the package')
  return dir
}

let registered = false

export function registerFonts(): void {
  if (registered) return
  const dir = fontsDir()
  Font.register({
    family: 'Geist',
    fonts: [
      { src: join(dir, 'Geist-Regular.ttf'), fontWeight: 400 },
      { src: join(dir, 'Geist-Medium.ttf'), fontWeight: 500 },
      { src: join(dir, 'Geist-SemiBold.ttf'), fontWeight: 600 },
    ],
  })
  Font.register({
    family: 'Instrument Serif',
    fonts: [{ src: join(dir, 'InstrumentSerif-Regular.ttf'), fontWeight: 400 }],
  })
  // Part numbers ("CVT-3-600") must never be hyphenated across lines.
  Font.registerHyphenationCallback((word) => [word])
  registered = true
}
