/**
 * Golden-set candidates for Ayush to label (S05-T04). READ-ONLY: recent live and backfilled inbound messages
 * as a CSV (id, mailbox role, sender domain, subject, the first 500 characters of the new text) written to
 * ~/Documents/Indus Ops Console/evals/ — OUTSIDE the repository, because it holds real mail.
 *
 *   (cd apps/ops && bun --preload ./evals/preload.ts evals/scripts/export-golden-candidates.ts --limit 450)
 *
 * Label each row with the expected class (or `unsure`) and, for link cases, the expected record, then save as
 * JSONL in the shape of the synthetic fixtures and upload with scripts/upload-golden.ts.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { opsDb } from '@indus/ops-db'
import { splitQuoted } from '@indus/ops-core'

const OUT_DIR = join(homedir(), 'Documents', 'Indus Ops Console', 'evals')

function csv(v: string): string {
  return `"${v.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
}

async function main(): Promise<void> {
  const i = process.argv.indexOf('--limit')
  const limit = Math.min(Number(i >= 0 ? process.argv[i + 1] : 450) || 450, 2_000)
  const rows = await opsDb.mailMessage.findMany({
    where: { direction: 'inbound', origin: { in: ['live', 'backfill'] }, bodyText: { not: null } },
    orderBy: { sentAt: 'desc' },
    take: limit,
    select: {
      id: true,
      fromAddress: true,
      subject: true,
      bodyText: true,
      mailbox: { select: { role: true } },
    },
  })
  mkdirSync(OUT_DIR, { recursive: true })
  const lines = ['id,mailbox,sender_domain,subject,text,expected_class,expected_link']
  for (const r of rows) {
    const text = splitQuoted(r.bodyText ?? '').fresh.slice(0, 500)
    lines.push(
      [r.id, r.mailbox.role, r.fromAddress.split('@')[1] ?? '', r.subject ?? '', text, '', '']
        .map(csv)
        .join(',')
    )
  }
  const file = join(OUT_DIR, `golden-candidates-${new Date().toISOString().slice(0, 10)}.csv`)
  writeFileSync(file, `${lines.join('\n')}\n`)
  console.log(`${rows.length} candidates → ${file}`)
  await opsDb.$disconnect()
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
