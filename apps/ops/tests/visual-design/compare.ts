import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { boardPngPath } from './reference'

/** Where design-parity output goes. Never inside the repository. */
export function evidenceDir(): string {
  const base = process.env.OPS_EVIDENCE_DIR
  if (!base) throw new Error('OPS_EVIDENCE_DIR must be set for design parity output')
  const dir = join(base, 'visual', process.env.OPS_SPRINT ?? 's01')
  mkdirSync(dir, { recursive: true })
  return dir
}

export interface Mask {
  x: number
  y: number
  w: number
  h: number
}

function crop(png: PNG, w: number, h: number, masks: Mask[]): PNG {
  const out = new PNG({ width: w, height: h })
  PNG.bitblt(png, out, 0, 0, w, h, 0, 0)
  for (const m of masks) {
    for (let y = m.y; y < Math.min(h, m.y + m.h); y++) {
      for (let x = m.x; x < Math.min(w, m.x + m.w); x++) {
        const i = (y * w + x) * 4
        out.data[i] = 255
        out.data[i + 1] = 0
        out.data[i + 2] = 255
        out.data[i + 3] = 255
      }
    }
  }
  return out
}

/**
 * Compare our render with the reference. Both are cropped to the common size; a size difference over
 * 2px in either axis fails outright. Writes <name>-{ours,ref,diff}.png to the evidence folder and
 * returns the share of differing pixels.
 */
export function compareToReference(
  ours: Buffer,
  ref: Buffer,
  opts: { name: string; masks?: Mask[]; sizeTolerance?: number }
): { ratio: number; size: string } {
  const a = PNG.sync.read(ours)
  const b = PNG.sync.read(ref)
  const dir = evidenceDir()
  writeFileSync(join(dir, `${opts.name}-ours.png`), ours)
  writeFileSync(join(dir, `${opts.name}-ref.png`), ref)
  const tol = opts.sizeTolerance ?? 2
  const size = `ours ${a.width}×${a.height}, ref ${b.width}×${b.height}`
  if (Math.abs(a.width - b.width) > tol || Math.abs(a.height - b.height) > tol) {
    return { ratio: 1, size }
  }
  const w = Math.min(a.width, b.width)
  const h = Math.min(a.height, b.height)
  const masks = opts.masks ?? []
  const ca = crop(a, w, h, masks)
  const cb = crop(b, w, h, masks)
  const diff = new PNG({ width: w, height: h })
  const changed = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.1 })
  writeFileSync(join(dir, `${opts.name}-diff.png`), PNG.sync.write(diff))
  return { ratio: changed / (w * h), size }
}

/** Full-page 1440 × 940 screenshot against a board PNG from the handoff (later sprints). */
export async function compareToBoardPng(
  page: Page,
  boardFile: string,
  opts: { name?: string; masks?: Mask[] } = {}
): Promise<{ ratio: number; size: string }> {
  const ours = await page.screenshot({ animations: 'disabled', caret: 'hide' })
  const ref = readFileSync(boardPngPath(boardFile))
  return compareToReference(ours, ref, {
    name: opts.name ?? boardFile.replace(/\.png$/, ''),
    ...(opts.masks ? { masks: opts.masks } : {}),
  })
}

/** One row of $OPS_EVIDENCE_DIR/visual/<sprint>/summary.md (S02-T09). */
export interface ParityRow {
  /** "74 sidebar", "T1A", "S04A", "k00 sidebar owner" … */
  board: string
  group:
    | 'Boards 74/75'
    | 'Templates'
    | 'Shell surfaces'
    | 'L1 k00'
    | 'L1 sheet'
    | 'L0 sheet'
    | 'P01 boards'
    | 'P02 boards'
    | 'P03 boards'
    | 'P05 boards'
    | 'P06 boards'
    | 'P04 boards'
    | 'P17 boards'
    | 'P11 documents'
  /** The share of the compared pixels that differ. */
  ratio: number
  /** What was compared: "full frame 1438×938, 7 masks", "drawer (39% of the frame)" … */
  area: string
  limit: number
  /** Masks and their reasons, or why the remainder is acceptable. */
  note: string
}

/**
 * Record a parity result for the summary. Each check is one file under parity/, so a partial run (-g)
 * updates its own rows and keeps the others; summary.ts writes summary.md from all of them.
 */
export function recordParity(row: ParityRow): void {
  const dir = join(evidenceDir(), 'parity')
  mkdirSync(dir, { recursive: true })
  const file = `${row.group}-${row.board}`.replace(/[^A-Za-z0-9._-]+/g, '_')
  writeFileSync(join(dir, `${file}.json`), JSON.stringify({ ...row, at: new Date().toISOString() }))
}
