import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import {
  DEFAULT_FROM_EMAIL,
  DEFAULT_REPLY_TO,
  MAIL_DOMAIN,
  MARKETING_DOMAIN,
  SENDING_DOMAIN,
  WEBSITE_DOMAIN,
  assertMarketingSender,
  isDeliverableAddress,
  isSendableAddress,
  resolveFromEmail,
  resolveReplyTo,
} from './email-domains'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

/**
 * `@indushydraulics.com` has no MX records — every address on it bounces. The
 * site shipped ~25 of them across 12 files, including in the privacy policy
 * and the password-reset page. This test stops them coming back.
 */
const SCAN_ROOTS = [
  path.join(REPO_ROOT, 'apps/web/src'),
  path.join(REPO_ROOT, 'packages/ui/src'),
  path.join(REPO_ROOT, 'packages/email/src'),
  path.join(REPO_ROOT, 'packages/domain/src'),
]

/**
 * The dated batches under packages/db/src/imports/ are historical records of
 * what was imported, carrying DO-NOT-RE-RUN banners. They are deliberately not
 * rewritten — the live copy they produced was corrected in the database
 * instead (migration `fix_bouncing_contact_email_in_catalogue_content`).
 */
const IGNORED_DIRS = new Set(['node_modules', '.next', 'dist', '.turbo', 'imports'])

function sourceFiles(root: string): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir)) {
      if (IGNORED_DIRS.has(entry)) continue
      const full = path.join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full)
    }
  }
  walk(root)
  return out
}

describe('email addresses point at a domain that can receive mail', () => {
  test('no source file contains an @indushydraulics.com address', () => {
    const hits: string[] = []
    for (const root of SCAN_ROOTS) {
      for (const file of sourceFiles(root)) {
        readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            // the address form only — https://indushydraulics.com is correct
            if (/[A-Za-z0-9._%+-]+@indushydraulics\.com\b/.test(line)) {
              hits.push(`${path.relative(REPO_ROOT, file)}:${i + 1}: ${line.trim()}`)
            }
          })
      }
    }
    expect(hits.join('\n')).toBe('')
  })
})

describe('domain constants', () => {
  test('the website and mail domains are different, on purpose', () => {
    expect(WEBSITE_DOMAIN).not.toBe(MAIL_DOMAIN)
  })

  test('marketing sends from the website domain, not the mail domain', () => {
    // Bulk volume must not sit on the domain quotes depend on.
    expect(MARKETING_DOMAIN).not.toBe(MAIL_DOMAIN)
  })

  test('the app sends FROM the website domain, isolating its reputation', () => {
    // Deliberate: app volume must not sit on the domain the sales team uses
    // by hand, so nothing this app does can affect their deliverability.
    expect(DEFAULT_FROM_EMAIL.endsWith(`@${WEBSITE_DOMAIN}`)).toBe(true)
  })

  test('the sending address cannot receive — which is why Reply-To is mandatory', () => {
    expect(isDeliverableAddress(DEFAULT_FROM_EMAIL)).toBe(false)
  })

  test('replies go to an inbox that exists', () => {
    // The whole point. A customer hitting reply on a quote must reach a human.
    expect(isDeliverableAddress(DEFAULT_REPLY_TO)).toBe(true)
  })

  test('From and Reply-To are never the same address', () => {
    expect(DEFAULT_FROM_EMAIL).not.toBe(DEFAULT_REPLY_TO)
  })
})

describe('assertMarketingSender', () => {
  test('accepts a marketing-domain sender', () => {
    expect(() => assertMarketingSender(`campaigns@${MARKETING_DOMAIN}`)).not.toThrow()
  })

  test('refuses the transactional domain — the mistake that breaks quotes', () => {
    expect(() => assertMarketingSender(`campaigns@${MAIL_DOMAIN}`)).toThrow(/must send from/)
  })

  test('refuses an unrelated domain', () => {
    expect(() => assertMarketingSender('campaigns@gmail.com')).toThrow()
    expect(() => assertMarketingSender('not-an-email')).toThrow()
  })
})

describe('isDeliverableAddress', () => {
  test('only the mail domain is deliverable today', () => {
    expect(isDeliverableAddress(`sales@${MAIL_DOMAIN}`)).toBe(true)
    expect(isDeliverableAddress(`sales@${WEBSITE_DOMAIN}`)).toBe(false)
    expect(isDeliverableAddress('onboarding@resend.dev')).toBe(false)
  })
})

describe('every app send sets Reply-To', () => {
  /**
   * The failure this guards against is silent and expensive: mail goes out
   * FROM a domain with no MX, the customer hits reply, and the message
   * disappears. Both sides believe it worked.
   *
   * Several call sites used to pass `replyTo: fromEmail`, which after moving
   * sending to the website domain would have done exactly that.
   */
  const SEND_SITES = [
    'apps/web/src/app/admin/(shell)/rfqs/[code]/actions.ts',
    'apps/web/src/inngest/functions.ts',
    'apps/web/src/app/(storefront)/quote/actions.ts',
    'apps/web/src/actions/auth.ts',
    'apps/web/src/app/(storefront)/account/profile/actions.ts',
  ]

  test('no call site mirrors the From address into Reply-To', () => {
    const offenders: string[] = []
    for (const rel of SEND_SITES) {
      const full = path.join(REPO_ROOT, rel)
      if (!existsSync(full)) {
        offenders.push(`${rel}: MISSING — update SEND_SITES if this moved`)
        continue
      }
      readFileSync(full, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (/replyTo:\s*fromEmail\b/.test(line)) offenders.push(`${rel}:${i + 1}: ${line.trim()}`)
        })
    }
    expect(offenders.join('\n')).toBe('')
  })
})

/**
 * StoreSettings.quoteFromEmail held `sales@indushydraulics.me` — a Google
 * Workspace address with no Resend verification. Every transactional send was
 * rejected with "The indushydraulics.me domain is not verified", one email at
 * a time, while the admin console showed the sender as correctly configured.
 * These are the rules that stop a value in that field breaking sending again.
 */
describe('resolving the configured sender', () => {
  test('the sending domain is the one Resend is set up for', () => {
    expect(SENDING_DOMAIN).toBe(WEBSITE_DOMAIN)
    expect(SENDING_DOMAIN).not.toBe(MAIL_DOMAIN)
  })

  test('an address on the mail domain is not sendable', () => {
    // Precisely the address that was configured in production.
    expect(isSendableAddress(`sales@${MAIL_DOMAIN}`)).toBe(false)
  })

  test('a configured sender on the mail domain is refused, not passed through', () => {
    expect(resolveFromEmail(`sales@${MAIL_DOMAIN}`)).toBe(DEFAULT_FROM_EMAIL)
  })

  test('a configured sender on the sending domain is honoured', () => {
    const custom = `quotes@${SENDING_DOMAIN}`
    expect(resolveFromEmail(custom)).toBe(custom)
  })

  test('null, empty and whitespace all fall back', () => {
    expect(resolveFromEmail(null)).toBe(DEFAULT_FROM_EMAIL)
    expect(resolveFromEmail(undefined)).toBe(DEFAULT_FROM_EMAIL)
    expect(resolveFromEmail('')).toBe(DEFAULT_FROM_EMAIL)
    expect(resolveFromEmail('   ')).toBe(DEFAULT_FROM_EMAIL)
  })

  test('case and surrounding space do not defeat the check', () => {
    expect(resolveFromEmail(` SALES@${SENDING_DOMAIN.toUpperCase()} `)).toBe(
      `SALES@${SENDING_DOMAIN.toUpperCase()}`,
    )
  })

  test('a lookalike domain is not accepted', () => {
    expect(resolveFromEmail('sales@notindushydraulics.com')).toBe(DEFAULT_FROM_EMAIL)
    expect(resolveFromEmail(`sales@${SENDING_DOMAIN}.evil.test`)).toBe(DEFAULT_FROM_EMAIL)
  })
})

describe('resolving the configured reply-to', () => {
  test('a reply-to on the sending domain is refused — it cannot receive', () => {
    // The mirror failure: replies would vanish into a domain with no MX.
    expect(resolveReplyTo(`sales@${SENDING_DOMAIN}`)).toBe(DEFAULT_REPLY_TO)
  })

  test('a reply-to on the mail domain is honoured', () => {
    const custom = `krishan@${MAIL_DOMAIN}`
    expect(resolveReplyTo(custom)).toBe(custom)
  })

  test('null and empty fall back to the monitored inbox', () => {
    expect(resolveReplyTo(null)).toBe(DEFAULT_REPLY_TO)
    expect(resolveReplyTo('')).toBe(DEFAULT_REPLY_TO)
  })

  test('From and Reply-To can never resolve to the same address', () => {
    expect(resolveFromEmail(`sales@${MAIL_DOMAIN}`)).not.toBe(resolveReplyTo(`sales@${SENDING_DOMAIN}`))
  })
})
