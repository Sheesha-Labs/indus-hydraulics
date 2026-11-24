import { damerauLevenshtein, fold } from './homoglyph'
import { domainOf } from './headers'
import { isPublicMailDomain } from './public-domains'

/**
 * Phishing and impostor checks (S05-T03, 08-map-integrations §1.11, board 96 "phishing flagged with why").
 * A flagged message is labelled and never acted on; "It's real" clears it and teaches the domain.
 *
 * (decision) Domain age means "first seen by Ops" (the first message from that domain in mail_message), not a
 * registry lookup: v1 makes no RDAP call. The reason says "first seen 3 days ago".
 */
export type PhishingCode =
  | 'gmail_spam'
  | 'auth_failed'
  | 'display_name_impostor'
  | 'lookalike_domain'
  | 'link_mismatch'
  | 'payment_change_new_sender'
  | 'login_to_view'

export interface KnownDomain {
  domain: string
  companyName: string
  role: 'client' | 'supplier' | 'other'
}

export interface PhishingInput {
  fromAddress: string
  fromName: string | null
  auth: { spf?: string | null; dkim?: string | null; dmarc?: string | null }
  gmailLabels: readonly string[]
  knownDomains: readonly KnownDomain[]
  /** Days since Ops first saw a message from this domain; undefined when never seen before this one. */
  firstSeenDomainDays?: number | undefined
  links: ReadonlyArray<{ text: string; href: string }>
  bodyText: string | null
}

export interface PhishingResult {
  flagged: boolean
  reasons: Array<{ code: PhishingCode; text: string }>
}

const PAYMENT_CHANGE = new RegExp(
  [
    'new bank (account|details)',
    'change (of|in) (our )?bank(ing)? (details|account)',
    'updated? (our )?(iban|bank details|banking details|account details)',
    'new beneficiary',
    'bank details have changed',
    'neue bankverbindung',
    'änderung (der|unserer) bankverbindung',
    'nouvelles coordonnées bancaires',
    'changement de (coordonnées bancaires|rib)',
    'nueva cuenta bancaria',
    'cambio de (datos bancarios|cuenta bancaria)',
    'nuove coordinate bancarie',
    'nova conta bancária',
    'nieuwe bankrekening',
    '新的银行账户',
    '银行账户变更',
    '新しい銀行口座',
    'yeni banka hesabı',
    'новые банковские реквизиты',
    'تغيير (الحساب|البيانات) البنكي',
    'حساب بنكي جديد',
  ].join('|'),
  'i'
)

const LOGIN_TO_VIEW =
  /(log ?in|sign ?in|verify your (account|email)|enter your (password|credentials))[^.\n]{0,80}(to (view|access|download|open)|the (rfq|quotation|document|invoice|po|purchase order))/i

function hostOf(href: string): string | null {
  try {
    return new URL(href).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

function domainInText(text: string): string | null {
  const m = /\b((?:[a-z0-9-]+\.)+[a-z]{2,})\b/i.exec(text)
  return m?.[1]?.toLowerCase().replace(/^www\./, '') ?? null
}

/** The registrable part, crudely: the last two labels (three for a two-letter second level like co.uk). */
function base(domain: string): string {
  const parts = domain.split('.')
  if (
    parts.length >= 3 &&
    parts[parts.length - 2]!.length <= 3 &&
    parts[parts.length - 1]!.length === 2
  ) {
    return parts.slice(-3).join('.')
  }
  return parts.slice(-2).join('.')
}

export function assessPhishing(input: PhishingInput): PhishingResult {
  const reasons: PhishingResult['reasons'] = []
  const domain = domainOf(input.fromAddress)
  const known = input.knownDomains.map((k) => ({ ...k, domain: k.domain.toLowerCase() }))
  const isKnown =
    !!domain && known.some((k) => k.domain === domain || base(k.domain) === base(domain))

  if (input.gmailLabels.includes('SPAM'))
    reasons.push({ code: 'gmail_spam', text: 'Gmail put it in Spam' })

  const failed = (['dmarc', 'spf'] as const).filter(
    (k) => (input.auth[k] ?? '').toLowerCase() === 'fail'
  )
  if (failed.length) {
    reasons.push({
      code: 'auth_failed',
      text: `${failed.map((f) => f.toUpperCase()).join(' and ')} failed for ${domain ?? 'the sender'}`,
    })
  }

  if (domain && !isKnown && !isPublicMailDomain(domain)) {
    const fd = fold(base(domain))
    const near = known.find((k) => {
      // `isKnown` is false, so the domains differ; close after folding means a look-alike.
      const fk = fold(base(k.domain))
      return fk === fd || damerauLevenshtein(fk, fd) <= 2
    })
    if (near) {
      reasons.push({
        code: 'lookalike_domain',
        text: `${domain} looks like ${near.domain} (${near.companyName}) but is not it`,
      })
    }
  }

  if (input.fromName && domain && !isKnown) {
    const name = fold(input.fromName)
    const impersonated = known.find((k) => {
      const company = fold(k.companyName)
      return company.length >= 4 && name.includes(company)
    })
    if (impersonated) {
      reasons.push({
        code: 'display_name_impostor',
        text: `The name says ${impersonated.companyName} but the address is ${domain}, not ${impersonated.domain}`,
      })
    }
  }

  for (const link of input.links) {
    const shown = domainInText(link.text)
    const target = hostOf(link.href)
    if (shown && target && base(shown) !== base(target)) {
      reasons.push({ code: 'link_mismatch', text: `A link shows ${shown} but goes to ${target}` })
      break
    }
  }

  const body = input.bodyText ?? ''
  const newSender = input.firstSeenDomainDays === undefined || input.firstSeenDomainDays <= 30
  if (newSender && PAYMENT_CHANGE.test(body)) {
    const seen =
      input.firstSeenDomainDays === undefined
        ? 'never seen before'
        : `first seen ${input.firstSeenDomainDays} ${input.firstSeenDomainDays === 1 ? 'day' : 'days'} ago`
    reasons.push({
      code: 'payment_change_new_sender',
      text: `Asks to change bank details, from a domain ${seen}`,
    })
  }
  if (LOGIN_TO_VIEW.test(body))
    reasons.push({ code: 'login_to_view', text: 'Asks you to log in to see a document' })

  return { flagged: reasons.length > 0, reasons }
}
