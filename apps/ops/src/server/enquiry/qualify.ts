import 'server-only'
import {
  domainMatchesName,
  isFreeMail,
  workingDaysBetween,
  suspiciousLinks,
  type CalendarDate,
  type QualifyInput,
  type QualifyLine,
  type WeekendTable,
} from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'
import { holidaysFor } from '../mail-send/slot'
import { getSetting } from '../settings/get'

/**
 * The facts behind the quick read (S09-T06, board 167). Everything is gathered in code; the model only weighs
 * the signals built from them. Nothing here reads, stores or sends the client's country, region or address:
 * the company row is selected field by field and `country`/`city` are never among them (qualify.db.test.ts).
 *
 * Two lookups leave the building, both with only the sender's domain: RDAP (registration date, when the
 * `qualify.rdap_enabled` setting is on and the address is not free mail) and a HEAD request to the website. Each
 * has a 5-second timeout and fails quietly to "not looked up". Tests pass their own probes.
 */

export interface QualifyProbes {
  /** Days since registration and the year, or null when unknown. */
  rdap(domain: string): Promise<{ ageDays: number; year: number } | null>
  /** Whether https://<host> answers a HEAD (any status below 500). */
  head(host: string): Promise<boolean | null>
}

const TIMEOUT_MS = 5_000

export const NETWORK_PROBES: QualifyProbes = {
  async rdap(domain) {
    try {
      const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
        headers: { accept: 'application/rdap+json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'follow',
      })
      if (!res.ok) return null
      const body = (await res.json()) as {
        events?: Array<{ eventAction?: string; eventDate?: string }>
      }
      const reg = body.events?.find((e) => e.eventAction === 'registration')?.eventDate
      const at = reg ? new Date(reg) : null
      if (!at || Number.isNaN(at.getTime())) return null
      return {
        ageDays: Math.floor((Date.now() - at.getTime()) / 86_400_000),
        year: at.getUTCFullYear(),
      }
    } catch {
      return null
    }
  },
  async head(host) {
    try {
      const res = await fetch(`https://${host}/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'follow',
      })
      return res.status < 500
    } catch {
      return false
    }
  },
}

export interface QualifyGathered {
  enquiryId: string
  ref: string
  stage: string
  input: QualifyInput
  /** For the model's user turn: line summaries (description, quantity, category), nothing about the client. */
  lineSummaries: Array<{ no: number; description: string; qty: string; trade: string | null }>
  /** Changes when the lines or the sender change: a new read is a new action. */
  version: string
}

const PROPRIETARY = /\b(oem|proprietary|genuine|original (?:part|spare)s?|no equivalents?)\b/i

function dubaiDate(d: Date): CalendarDate {
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' })
    .format(d)
    .split('-')
    .map(Number)
  return { year: year!, month: month!, day: day! }
}

const DEADLINE = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
function deadlineLabel(d: Date): string {
  const p = Object.fromEntries(DEADLINE.formatToParts(d).map((x) => [x.type, x.value]))
  return `${p.weekday} ${p.day} ${p.month}, ${p.hour}:${p.minute}`
}

const domainOf = (email: string | null) => {
  const d = email?.split('@')[1]?.trim().toLowerCase()
  return d && d.includes('.') ? d : null
}

export async function gatherQualify(
  enquiryId: string,
  probes: QualifyProbes = NETWORK_PROBES,
  now = new Date()
): Promise<QualifyGathered> {
  const e = await opsDb.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    select: {
      id: true,
      ref: true,
      stage: true,
      clientId: true,
      receivedAt: true,
      deadline: true,
      // Field by field: never country, city or address (qualification never reads them).
      client: { select: { name: true, website: true, primaryDomain: true, trn: true } },
      contact: { select: { email: true } },
      lines: {
        where: { status: { not: 'cancelled' } },
        orderBy: { no: 'asc' },
        select: {
          no: true,
          description: true,
          qty: true,
          uom: true,
          partId: true,
          specNotes: true,
          statusReason: true,
          requestedMake: true,
          equivalentsPolicy: true,
          part: { select: { tradeId: true, trade: { select: { id: true, name: true } } } },
          tradeGroup: { select: { trade: { select: { id: true, name: true } } } },
        },
      },
      intakeBatches: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { mailMessage: { select: { id: true, fromAddress: true, bodyText: true } } },
      },
    },
  })
  const message = e.intakeBatches[0]?.mailMessage ?? null
  const email = (e.contact?.email ?? message?.fromAddress ?? null)?.toLowerCase() ?? null

  const [freeMailSetting, rdapSetting, revert, weekends, holidays] = await Promise.all([
    getSetting('qualify.free_mail_domains'),
    getSetting('qualify.rdap_enabled'),
    getSetting('ack.revert_by').catch(() => ({ defaultSupplierReplyDays: 2 })),
    getSetting('calendar.country_weekends') as Promise<WeekendTable>,
    e.deadline ? holidaysFor(['AE'], now, 120) : Promise.resolve([]),
  ])
  const freeMail = isFreeMail(email, freeMailSetting.domains)
  const domain = freeMail ? null : domainOf(email)

  // Trades: the line's group trade, else its part's trade. "Sourced before": a line card or a supplier quote.
  const trades = e.lines.map((l) => l.tradeGroup?.trade ?? l.part?.trade ?? null)
  const tradeIds = [...new Set(trades.filter((t) => !!t).map((t) => t!.id))]
  const partIds = [...new Set(e.lines.map((l) => l.partId).filter((p): p is string => !!p))]
  const [sourced, history, prices] = await Promise.all([
    tradeIds.length
      ? opsDb.$queryRaw<Array<{ tradeId: string }>>(Prisma.sql`
          SELECT DISTINCT "tradeId"::text AS "tradeId" FROM ops.supplier_line_card
           WHERE "tradeId" = ANY(${tradeIds}::uuid[])
          UNION
          SELECT DISTINCT p."tradeId"::text FROM ops.supplier_quote_line q JOIN ops.part p ON p.id = q."partId"
           WHERE p."tradeId" = ANY(${tradeIds}::uuid[])`)
      : Promise.resolve([]),
    opsDb.$queryRaw<
      Array<{ messages: bigint; enquiries: bigint; quotations: bigint; orders: bigint }>
    >(Prisma.sql`
      SELECT
        (SELECT count(*) FROM ops.mail_message m
          WHERE ${email ?? ''} <> '' AND m."sentAt" < ${e.receivedAt}
            AND (CASE WHEN ${!!domain} THEN lower(m."fromAddress") LIKE ${'%@' + (domain ?? '')}
                      ELSE lower(m."fromAddress") = ${email ?? ''} END)) AS messages,
        (SELECT count(*) FROM ops.enquiry x WHERE x."clientId" = ${e.clientId}::uuid AND x.id <> ${e.id}::uuid) AS enquiries,
        (SELECT count(*) FROM ops.quotation q WHERE q."clientId" = ${e.clientId}::uuid) AS quotations,
        (SELECT count(*) FROM ops."order" o WHERE o."clientId" = ${e.clientId}::uuid) AS orders`),
    partIds.length
      ? opsDb.$queryRaw<
          Array<{ partId: string; lo: Prisma.Decimal; hi: Prisma.Decimal }>
        >(Prisma.sql`
          SELECT l."partId"::text AS "partId",
                 min(l."unitPrice" * q."fxRateToAed") AS lo, max(l."unitPrice" * q."fxRateToAed") AS hi
            FROM ops.supplier_quote_line l JOIN ops.supplier_quote q ON q.id = l."quoteId"
           WHERE l."partId" = ANY(${partIds}::uuid[]) AND l."unitPrice" IS NOT NULL AND q."fxRateToAed" IS NOT NULL
           GROUP BY l."partId"`)
      : Promise.resolve([]),
  ])
  const sourcedSet = new Set(sourced.map((s) => s.tradeId))
  const priceOf = new Map(prices.map((p) => [p.partId, p]))

  const lines: QualifyLine[] = e.lines.map((l, i) => {
    const t = trades[i]
    const notes = [l.specNotes, l.statusReason].filter(Boolean).join(' ')
    return {
      no: l.no,
      trade: t?.name ?? null,
      tradeSourced: !!t && sourcedSet.has(t.id),
      proprietary:
        PROPRIETARY.test(notes) || (!!l.requestedMake && l.equivalentsPolicy === 'exact_only'),
      // A quantity, not money: a float is fine for the sanity check.
      qty: Number(l.qty.toString()),
      uom: l.uom,
    }
  })

  // Value: min–max of the last prices on the same parts × the quantity, in AED (computed in code, never by a model).
  let lo = new Prisma.Decimal(0)
  let hi = new Prisma.Decimal(0)
  let priced = 0
  for (const l of e.lines) {
    const p = l.partId ? priceOf.get(l.partId) : undefined
    if (!p) continue
    lo = lo.plus(new Prisma.Decimal(p.lo).times(l.qty))
    hi = hi.plus(new Prisma.Decimal(p.hi).times(l.qty))
    priced += 1
  }

  const host = domain ? (e.client?.website ? hostOf(e.client.website) : domain) : null
  const [age, reachable] = await Promise.all([
    domain && rdapSetting.enabled ? probes.rdap(domain) : Promise.resolve(null),
    host ? probes.head(host) : Promise.resolve(null),
  ])

  const h = history[0]
  const input: QualifyInput = {
    sender: {
      email,
      domain: freeMail ? (domainOf(email) ?? null) : domain,
      freeMail,
      domainAgeDays: age?.ageDays ?? null,
      domainRegisteredYear: age?.year ?? null,
      domainMatchesName: domain ? domainMatchesName(domain, e.client?.name ?? null) : null,
      websiteReachable: reachable,
      registryFound: e.client ? !!e.client.trn : null,
      companyName: e.client?.name ?? null,
    },
    links: suspiciousLinks(message?.bodyText ?? ''),
    history: {
      messages: Number(h?.messages ?? 0),
      enquiries: Number(h?.enquiries ?? 0),
      quotations: Number(h?.quotations ?? 0),
      orders: Number(h?.orders ?? 0),
    },
    lines,
    value: priced
      ? {
          currency: 'AED',
          min: Number(lo.toDecimalPlaces(0).toString()),
          max: Number(hi.toDecimalPlaces(0).toString()),
          lines: priced,
        }
      : null,
    workingDaysLeft: e.deadline
      ? workingDaysBetween(dubaiDate(now), dubaiDate(e.deadline), 'AE', holidays, weekends)
      : null,
    deadlineLabel: e.deadline ? deadlineLabel(e.deadline) : null,
    supplierReplyDays: Number(
      (revert as { defaultSupplierReplyDays?: number }).defaultSupplierReplyDays ?? 2
    ),
  }
  return {
    enquiryId: e.id,
    ref: e.ref,
    stage: e.stage,
    input,
    lineSummaries: e.lines.map((l, i) => ({
      no: l.no,
      description: l.description,
      qty: `${l.qty.toString().replace(/\.0+$/, '')} ${l.uom}`,
      trade: trades[i]?.name ?? null,
    })),
    version: `${e.lines.length}:${e.lines.map((l) => l.no).join(',')}:${email ?? ''}`,
  }
}

function hostOf(website: string): string | null {
  try {
    return new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`).hostname
  } catch {
    return null
  }
}

/** What the record shows from a read (board 167): stored on the enquiry by the action. */
export interface StoredQualification {
  legitimacy: {
    verdict: 'legitimate' | 'suspicious' | 'spam'
    confidence: 'sure' | 'likely' | 'unsure'
    signals: QualifySignalRow[]
  }
  fit: {
    fit: number
    of: number
    confidence: 'sure' | 'likely' | 'unsure'
    signals: QualifySignalRow[]
    regretLineNos: number[]
    askLineNos: number[]
    proprietaryNos: number[]
    outsideNos: number[]
  }
  effort: {
    signals: QualifySignalRow[]
    reasons: string[]
    pathConfidence: 'sure' | 'likely' | 'unsure'
    realBuyerQuestion: boolean
    actionId: string
    readAt: string
  }
}
export interface QualifySignalRow {
  mark: 'ok' | 'warn' | 'bad' | 'none'
  text: string
  sub?: string
  evidence?: string
}
