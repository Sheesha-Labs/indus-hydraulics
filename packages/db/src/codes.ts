import type { Prisma } from '@prisma/client'

import { db } from './index'

type DbClient = typeof db | Prisma.TransactionClient

const QUOTE_ZOHO_BASE = 26386

async function nextValue(client: DbClient, scope: string, year: number): Promise<number> {
  const row = await client.counter.upsert({
    where: { scope_year: { scope, year } },
    update: { value: { increment: 1 } },
    create: { scope, year, value: 1 },
    select: { value: true },
  })
  return row.value
}

export function formatRfqCode(year: number, value: number): string {
  return `RFQ-${year}-${String(value).padStart(4, '0')}`
}

export function formatAccountCode(year: number, value: number): string {
  return `ACC-${year}-${String(value).padStart(4, '0')}`
}

export function formatQuoteCode(value: number): string {
  return `INDUS/Q${QUOTE_ZOHO_BASE + value}`
}

export async function nextRfqCode(client: DbClient = db, now: Date = new Date()): Promise<string> {
  const year = now.getFullYear()
  const value = await nextValue(client, 'rfq', year)
  return formatRfqCode(year, value)
}

export async function nextAccountCode(
  client: DbClient = db,
  now: Date = new Date(),
): Promise<string> {
  const year = now.getFullYear()
  const value = await nextValue(client, 'account', year)
  return formatAccountCode(year, value)
}

export type NextQuoteCode =
  | { kind: 'new'; code: string; revision: 1 }
  | { kind: 'revision'; code: string; revision: number; ofCode: string }

export async function nextQuoteCodeForRfq(
  rfqId: string,
  client: DbClient = db,
): Promise<NextQuoteCode> {
  const previous = await client.quote.findMany({
    where: { rfqId },
    select: { code: true, revision: true },
    orderBy: { revision: 'desc' },
    take: 1,
  })

  if (previous.length > 0) {
    const last = previous[0]!
    const baseCode = last.code.replace(/-R\d+$/, '')
    const nextRev = last.revision + 1
    return { kind: 'revision', code: `${baseCode}-R${nextRev}`, revision: nextRev, ofCode: last.code }
  }

  const value = await nextValue(client, 'quote', 0)
  return { kind: 'new', code: formatQuoteCode(value), revision: 1 }
}

export function quoteCodeToSlug(code: string): string {
  return code.replace(/[^A-Za-z0-9_-]+/g, '-')
}

export function formatScrapeCode(year: number, value: number): string {
  return `SCRAPE-${year}-${String(value).padStart(4, '0')}`
}

export async function nextScrapeCode(
  client: DbClient = db,
  now: Date = new Date(),
): Promise<string> {
  const year = now.getFullYear()
  const value = await nextValue(client, 'scrape', year)
  return formatScrapeCode(year, value)
}

export const COUNTER_SCOPES = {
  rfq: 'rfq',
  account: 'account',
  quote: 'quote',
  scrape: 'scrape',
} as const

export const QUOTE_CODE_BASE = QUOTE_ZOHO_BASE
