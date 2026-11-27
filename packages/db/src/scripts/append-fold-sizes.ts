/**
 * Append sizes to an EXISTING unbranded listing ("fold"), without touching its
 * other rows, specs, FAQs or images. Used when a new source range carries the
 * same product (same type, rating and outside diameter) as a listing we already
 * sell: the source's extra sizes join that listing instead of creating a
 * duplicate page.
 *
 * Input JSON: [{ target: "<SKU>", variants: [{ hoseInch, hoseDn, pressureBar, dimensions }] }]
 * A row is appended only when the target has no row within 2 mm of its hoseDn
 * (63 and 65 are both 2-1/2", depending on the catalogue). The
 * new part number follows the target's own scheme: `<target SKU>-<DN, 3 digits>`.
 *
 * Usage:
 *   tsx src/scripts/append-fold-sizes.ts --folds=<json> [--write]
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Prisma, PrismaClient } from '@prisma/client'

const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')
if (existsSync(WEB_ENV)) {
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
  }
}
const db = new PrismaClient()

type Row = {
  hoseInch: string | null
  hoseDn: number | null
  pressureBar: number | null
  dimensions: Record<string, string | number>
}
type Fold = { target: string; from?: string; variants: Row[] }

async function main() {
  const file = process.argv.find((a) => a.startsWith('--folds='))?.split('=')[1]
  const write = process.argv.includes('--write')
  if (!file) throw new Error('--folds=<json> is required')
  const folds = JSON.parse(readFileSync(file, 'utf8')) as Fold[]
  for (const f of folds) {
    const p = await db.product.findUnique({
      where: { sku: f.target },
      select: {
        id: true,
        variants: { select: { hoseDn: true, partNumber: true, position: true } },
      },
    })
    if (!p) throw new Error(`target ${f.target} not found`)
    const have = p.variants.map((v) => v.hoseDn).filter((d): d is number => d != null)
    const taken = new Set(p.variants.map((v) => v.partNumber))
    let pos = Math.max(-1, ...p.variants.map((v) => v.position)) + 1
    const add = f.variants
      .filter((v) => v.hoseDn != null && !have.some((d) => Math.abs(d - v.hoseDn!) <= 2))
      .map((v) => ({
        productId: p.id,
        partNumber: `${f.target}-${String(v.hoseDn).padStart(3, '0')}`,
        position: pos++,
        hoseInch: v.hoseInch,
        hoseDn: v.hoseDn,
        pressureBar: v.pressureBar,
        dimensions: v.dimensions as Prisma.InputJsonValue,
      }))
      .filter((v) => !taken.has(v.partNumber))
    console.log(
      `${f.target}: has ${p.variants.length} rows; appending ${add.length} (${add.map((a) => a.hoseDn).join(', ')})`
    )
    if (write && add.length > 0) {
      await db.$transaction(
        async (tx) => {
          await tx.productVariant.createMany({ data: add })
        },
        { timeout: 30_000, maxWait: 10_000 }
      )
    }
  }
  if (!write) console.log('dry run — add --write to append')
}
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
