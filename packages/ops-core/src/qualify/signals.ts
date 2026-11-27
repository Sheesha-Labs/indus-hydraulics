/**
 * The quick read on a new enquiry (S09-T06, board 167; open item P15). Pure. Three lists of signals — legitimacy,
 * fit, effort and value — each a mark and a sentence, from facts gathered in code. The model only weighs them.
 *
 * Qualification NEVER uses the client's country: QualifyInput has no country, region or address field, and a type
 * test plus a payload test hold that (qualify.test.ts).
 */

export type SignalMark = 'ok' | 'warn' | 'bad' | 'none'

export interface Signal {
  mark: SignalMark
  text: string
  sub?: string
  /** What the evidence link opens: 'domain', 'website', 'mail', 'quotes', 'lines', 'groups', 'prices', 'email'. */
  evidence?: string
}

export interface QualifyLine {
  no: number
  /** The trade the line's part belongs to, when matched. */
  trade: string | null
  /** The trade has supplier quotes or line cards on file. */
  tradeSourced: boolean
  /** Extraction notes say the line is an OEM-only part number. */
  proprietary: boolean
  qty: number
  uom: string | null
}

export interface QualifyInput {
  sender: {
    email: string | null
    domain: string | null
    freeMail: boolean
    /** RDAP: days since the domain was registered; null when not looked up or not found. */
    domainAgeDays: number | null
    domainRegisteredYear: number | null
    /** The domain's first label matches the company name (letters only). */
    domainMatchesName: boolean | null
    /** A HEAD request to the domain's website answered. */
    websiteReachable: boolean | null
    /** The company is in the directory with a trade licence or registry reference. */
    registryFound: boolean | null
    companyName: string | null
  }
  /** Links in the email whose text and target differ, or that point at sign-in or "view document" pages. */
  links: { suspicious: number; hosts: string[] }
  history: { messages: number; enquiries: number; quotations: number; orders: number }
  lines: QualifyLine[]
  /** From price history on the same parts: min–max of the enquiry's value, and on how many lines. */
  value: { currency: string; min: number; max: number; lines: number } | null
  /** Working days from today to the client's closing date; null without one. */
  workingDaysLeft: number | null
  deadlineLabel: string | null
  /** Typical supplier reply in working days (the default until five RFQs are on record). */
  supplierReplyDays: number
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** Board 167 "Legitimacy". */
export function legitimacySignals(i: QualifyInput): Signal[] {
  const s = i.sender
  const out: Signal[] = []
  if (s.freeMail)
    out.push({
      mark: 'warn',
      text: 'Sent from a public webmail address',
      sub: 'No company domain to check',
      evidence: 'email',
    })
  else if (s.domain) {
    const age =
      s.domainAgeDays === null
        ? null
        : s.domainAgeDays < 180
          ? 'bad'
          : s.domainAgeDays < 365
            ? 'warn'
            : 'ok'
    out.push({
      mark:
        age === 'bad'
          ? 'bad'
          : age === 'warn' || s.domainMatchesName === false
            ? 'warn'
            : age === 'ok'
              ? 'ok'
              : 'none',
      text:
        s.domainRegisteredYear !== null
          ? `Domain ${s.domain} registered ${s.domainAgeDays !== null && s.domainAgeDays < 365 ? `${Math.max(1, Math.round(s.domainAgeDays / 7))} weeks ago` : s.domainRegisteredYear}${s.domainMatchesName ? ', matches the company name' : s.domainMatchesName === false ? ', does not match the company name' : ''}`
          : `Domain ${s.domain}${s.domainMatchesName ? ' matches the company name' : ''}`,
      ...(s.domainAgeDays === null ? { sub: 'Registration date not looked up' } : {}),
      evidence: 'domain',
    })
  }
  if (s.websiteReachable !== null || s.registryFound !== null) {
    const both = s.websiteReachable && s.registryFound
    const neither = s.websiteReachable === false && !s.registryFound
    out.push({
      mark: both ? 'ok' : neither ? 'bad' : 'warn',
      text: both
        ? 'A real website and a registry entry'
        : s.websiteReachable
          ? 'A website, no registry entry on file'
          : s.registryFound
            ? 'A registry entry, no website answered'
            : 'No website and no registry entry found',
      evidence: 'website',
    })
  }
  const h = i.history
  if (h.enquiries + h.quotations + h.orders + h.messages === 0)
    out.push({
      mark: 'none',
      text: 'No previous history with us',
      sub: 'First email from this sender in either mailbox',
      evidence: 'mail',
    })
  else
    out.push({
      mark: 'ok',
      text: `Known: ${[
        h.enquiries ? plural(h.enquiries, 'enquiry', 'enquiries') : null,
        h.quotations ? plural(h.quotations, 'quotation') : null,
        h.orders ? plural(h.orders, 'order') : null,
        !h.enquiries && !h.quotations && !h.orders ? plural(h.messages, 'earlier email') : null,
      ]
        .filter(Boolean)
        .join(', ')}`,
      evidence: 'mail',
    })
  if (!s.freeMail && s.domain)
    out.push({ mark: 'ok', text: 'Company address, not free mail', evidence: 'email' })
  out.push(
    i.links.suspicious > 0
      ? {
          mark: 'bad',
          text: `${plural(i.links.suspicious, 'link')} to a sign-in or “view document” page`,
          sub: i.links.hosts.length
            ? `On ${i.links.hosts.slice(0, 2).join(', ')}. Never opened.`
            : 'Never opened.',
          evidence: 'email',
        }
      : { mark: 'ok', text: 'No login links or “view document” pages', evidence: 'email' }
  )
  return out
}

/** Board 167 "Fit": lines in trades sourced before, proprietary OEM parts, lines outside the range, quantities. */
export function fitSignals(i: QualifyInput): Signal[] {
  const n = i.lines.length
  const sourced = i.lines.filter((l) => l.tradeSourced)
  const outside = i.lines.filter((l) => !l.trade || !l.tradeSourced)
  const prop = i.lines.filter((l) => l.proprietary)
  const trades = [...new Map(sourced.map((l) => [l.trade!, 0])).keys()]
  const out: Signal[] = [
    {
      mark: n > 0 && sourced.length / n >= 0.7 ? 'ok' : sourced.length > 0 ? 'warn' : 'bad',
      text: `${sourced.length} of ${n} lines in categories sourced before`,
      ...(trades.length
        ? {
            sub: trades
              .map((t) => `${t} (${sourced.filter((l) => l.trade === t).length})`)
              .join(', '),
          }
        : {}),
      evidence: 'quotes',
    },
  ]
  if (prop.length)
    out.push({
      mark: 'warn',
      text: `${plural(prop.length, 'proprietary OEM part')}`,
      sub: `Lines ${prop.map((l) => l.no).join(', ')}: OEM part numbers only. Equivalents may be needed`,
      evidence: 'lines',
    })
  if (outside.length && sourced.length)
    out.push({
      mark: 'bad',
      text: `${plural(outside.length, 'line')} outside our range`,
      sub: `Line${outside.length === 1 ? '' : 's'} ${outside.map((l) => l.no).join(', ')}: never quoted; no supplier on file`,
      evidence: 'lines',
    })
  const qtys = i.lines.map((l) => l.qty).filter((q) => q > 0)
  const odd = i.lines.filter((l) => !(l.qty > 0) || l.qty > 10_000)
  out.push(
    odd.length
      ? {
          mark: 'warn',
          text: `${plural(odd.length, 'quantity', 'quantities')} to check`,
          sub: `Line${odd.length === 1 ? '' : 's'} ${odd.map((l) => l.no).join(', ')}`,
          evidence: 'lines',
        }
      : {
          mark: 'ok',
          text: 'Quantities look normal',
          ...(qtys.length ? { sub: `${Math.min(...qtys)} to ${Math.max(...qtys)} per line` } : {}),
        }
  )
  return out
}

/** Board 167 "Effort and value". */
export function effortSignals(i: QualifyInput): Signal[] {
  const groups = new Set(i.lines.map((l) => l.trade ?? 'Uncategorised'))
  // Suppliers: up to three per trade group (line cards), the estimate a person can check on board 169.
  const suppliers = Math.max(1, groups.size * 2 + (groups.size > 1 ? 1 : 0))
  const out: Signal[] = [
    {
      mark: 'none',
      text: `${plural(i.lines.length, 'line')} · ${plural(groups.size, 'group')} · about ${suppliers} suppliers`,
      sub: [...groups]
        .map((g) => `${g} ${i.lines.filter((l) => (l.trade ?? 'Uncategorised') === g).length}`)
        .join(', '),
      evidence: 'groups',
    },
  ]
  if (i.value)
    out.push({
      mark: 'none',
      text: `About ${i.value.currency} ${compact(i.value.min)}–${compact(i.value.max)} on ${plural(i.value.lines, 'line')}`,
      sub:
        i.value.lines < i.lines.length
          ? `From last prices on the same parts; ${i.lines.length - i.value.lines} lines have no history`
          : 'From last prices on the same parts',
      evidence: 'prices',
    })
  else
    out.push({
      mark: 'none',
      text: 'No price history yet',
      sub: 'None of these parts was quoted before',
      evidence: 'prices',
    })
  out.push(
    i.workingDaysLeft === null
      ? {
          mark: 'none',
          text: 'No closing date given',
          sub: `Typical supplier reply: ${plural(i.supplierReplyDays, 'day')}`,
        }
      : {
          mark: i.workingDaysLeft <= i.supplierReplyDays + 1 ? 'warn' : 'ok',
          text: `Closing ${i.deadlineLabel ?? ''} · ${plural(i.workingDaysLeft, 'working day')}`.trim(),
          sub: `Typical supplier reply: ${plural(i.supplierReplyDays, 'day')}`,
          evidence: 'email',
        }
  )
  return out
}

function compact(n: number): string {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    : n >= 1_000
      ? `${Math.round(n / 1_000)},000`
      : String(Math.round(n))
}

export type Legitimacy = 'legitimate' | 'suspicious' | 'spam'

/** Code's own reading of the legitimacy signals, before the model: any bad link is spam-like. */
export function legitimacyFromSignals(signals: readonly Signal[]): Legitimacy {
  if (signals.some((s) => s.mark === 'bad' && s.evidence === 'email')) return 'spam'
  if (signals.some((s) => s.mark === 'bad')) return 'suspicious'
  if (signals.filter((s) => s.mark === 'warn').length >= 2) return 'suspicious'
  return 'legitimate'
}

/** "Fit 11 of 14" chip. */
export function fitCounts(i: QualifyInput): { fit: number; of: number } {
  return { fit: i.lines.filter((l) => l.tradeSourced).length, of: i.lines.length }
}

const LINK = /https?:\/\/([^\s/"'<>)]+)([^\s"'<>)]*)/gi
const LURE =
  /(log-?in|sign-?in|verify|password|account|docs?-?share|view[-_]?doc|document|secure-?file|onedrive|sharepoint|dropbox)/i
const ANCHOR = /<a\b[^>]*href=["']?(https?:\/\/[^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi

/**
 * Links in an email that lure to a sign-in or "view document" page, or whose visible text names one host while the
 * link goes to another (171b state 3). Hosts only, never the path, are returned for the card.
 */
export function suspiciousLinks(
  text: string,
  html?: string | null
): { suspicious: number; hosts: string[] } {
  const hosts = new Set<string>()
  let n = 0
  const seen = new Set<string>()
  for (const src of [text, html ?? '']) {
    LINK.lastIndex = 0
    for (let m = LINK.exec(src); m; m = LINK.exec(src)) {
      const url = m[0]
      if (seen.has(url)) continue
      seen.add(url)
      if (LURE.test(m[1]!) || LURE.test(m[2]!)) {
        n += 1
        hosts.add(m[1]!.toLowerCase())
      }
    }
  }
  ANCHOR.lastIndex = 0
  for (let m = ANCHOR.exec(html ?? ''); m; m = ANCHOR.exec(html ?? '')) {
    const target = /^https?:\/\/([^/]+)/i.exec(m[1]!)?.[1]?.toLowerCase()
    const shown = /([a-z0-9-]+\.)+[a-z]{2,}/i
      .exec(m[2]!.replace(/<[^>]+>/g, ''))?.[0]
      ?.toLowerCase()
    if (target && shown && !target.endsWith(shown) && !seen.has(`mismatch:${target}`)) {
      seen.add(`mismatch:${target}`)
      n += 1
      hosts.add(target)
    }
  }
  return { suspicious: n, hosts: [...hosts] }
}
