import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import Papa from 'papaparse'
import { z } from 'zod'
import { TX_OPTIONS } from '../../lib/tx-options'
import { createLead, type Person } from './create'

/**
 * Board 03 "Import CSV" (S09-T05). The browser previews the file; this re-parses it on the server (the browser's
 * parse is never trusted), maps the headers it knows, validates every row with Zod and creates leads (source
 * import) in transactions of at most 500 rows. A row that fails is skipped with its reason; nothing else stops.
 *
 * Columns (case and spacing ignored): name (required), company, title, email, phone, interest, est value,
 * currency, next action, next action date (YYYY-MM-DD or DD/MM/YYYY), owner (initials), notes.
 */
export const LEAD_CSV_COLUMNS = [
  'name',
  'company',
  'title',
  'email',
  'phone',
  'interest',
  'est value',
  'currency',
  'next action',
  'next action date',
  'owner',
  'notes',
] as const
type Column = (typeof LEAD_CSV_COLUMNS)[number]

const ALIASES: Record<string, Column> = {
  name: 'name',
  contact: 'name',
  'contact name': 'name',
  company: 'company',
  organisation: 'company',
  organization: 'company',
  title: 'title',
  requirement: 'title',
  email: 'email',
  'e-mail': 'email',
  phone: 'phone',
  mobile: 'phone',
  interest: 'interest',
  'est value': 'est value',
  'est. value': 'est value',
  'estimated value': 'est value',
  value: 'est value',
  currency: 'currency',
  'next action': 'next action',
  'next action date': 'next action date',
  'next date': 'next action date',
  owner: 'owner',
  notes: 'notes',
}

export const MAX_ROWS_PER_TX = 500
export const MAX_ROWS = 5000

const row = z.object({
  name: z.string({ error: 'name is empty' }).trim().min(1, 'name is empty').max(160),
  company: z.string().trim().max(160).optional(),
  title: z.string().trim().max(200).optional(),
  email: z.email('email is not an address').optional(),
  phone: z.string().trim().max(40).optional(),
  interest: z.string().trim().max(200).optional(),
  'est value': z
    .string()
    .trim()
    .regex(/^\d{1,14}(\.\d{1,4})?$/, 'est value is not a number')
    .optional(),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'currency is not a 3-letter code')
    .optional(),
  'next action': z.string().trim().max(200).optional(),
  'next action date': z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/, 'next action date is not a date')
    .optional(),
  owner: z.string().trim().max(3).optional(),
  notes: z.string().trim().max(2000).optional(),
})

export interface CsvImportResult {
  created: number
  skipped: Array<{ row: number; reason: string }>
  unknownColumns: string[]
}

function isoDate(s: string): Date {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
  const iso = m ? `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}` : s
  return new Date(`${iso}T06:00:00.000Z`)
}

/** Parse and validate only (no writes): the server's own reading of the file. */
export function parseLeadCsv(text: string): {
  rows: Array<{ row: number; data: z.infer<typeof row> }>
  skipped: CsvImportResult['skipped']
  unknownColumns: string[]
} {
  const parsed = Papa.parse<Record<string, string>>(text.replace(/^﻿/, ''), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, ' '),
  })
  const headers = parsed.meta.fields ?? []
  const unknownColumns = headers.filter((h) => !ALIASES[h])
  if (!headers.some((h) => ALIASES[h] === 'name'))
    return { rows: [], skipped: [{ row: 1, reason: 'no "name" column' }], unknownColumns }
  const rows: Array<{ row: number; data: z.infer<typeof row> }> = []
  const skipped: CsvImportResult['skipped'] = []
  parsed.data.slice(0, MAX_ROWS).forEach((raw, i) => {
    const mapped: Record<string, string> = {}
    for (const [h, v] of Object.entries(raw)) {
      const col = ALIASES[h]
      if (col && typeof v === 'string' && v.trim() !== '') mapped[col] = v
    }
    const r = row.safeParse(mapped)
    if (r.success) rows.push({ row: i + 2, data: r.data })
    else skipped.push({ row: i + 2, reason: r.error.issues.map((x) => x.message).join('; ') })
  })
  if (parsed.data.length > MAX_ROWS)
    skipped.push({ row: MAX_ROWS + 2, reason: `only the first ${MAX_ROWS} rows are imported` })
  return { rows, skipped, unknownColumns }
}

export async function importLeadsCsv(
  text: string,
  by: Person,
  /** Runs one chunk's writes; `rows` is the chunk's size (≤ MAX_ROWS_PER_TX). */
  tx: (fn: (t: Prisma.TransactionClient) => Promise<void>, rows: number) => Promise<void> = (fn) =>
    opsDb.$transaction(fn, { ...TX_OPTIONS, timeout: 60_000 })
): Promise<CsvImportResult> {
  const { rows, skipped, unknownColumns } = parseLeadCsv(text)
  const owners = await opsDb.user.findMany({
    where: { status: 'active' },
    select: { id: true, initials: true },
  })
  const ownerOf = (i?: string) =>
    i ? (owners.find((o) => o.initials.toLowerCase() === i.toLowerCase())?.id ?? null) : null
  let created = 0
  for (let start = 0; start < rows.length; start += MAX_ROWS_PER_TX) {
    const chunk = rows.slice(start, start + MAX_ROWS_PER_TX)
    await tx(async (t) => {
      for (const { data } of chunk) {
        await createLead(
          t,
          {
            name: data.name,
            companyName: data.company ?? null,
            title: data.title ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            interest: data.interest ?? null,
            estValue: data['est value'] ?? null,
            estCurrency: data['est value'] ? (data.currency ?? 'USD') : null,
            nextAction: data['next action'] ?? null,
            nextActionAt: data['next action date'] ? isoDate(data['next action date']) : null,
            ownerId: ownerOf(data.owner) ?? by.id,
            notes: data.notes ?? null,
            source: 'import',
          },
          by
        )
      }
    }, chunk.length)
    created += chunk.length
  }
  return { created, skipped, unknownColumns }
}
