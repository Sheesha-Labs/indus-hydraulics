import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import {
  DEFAULT_FROM_EMAIL,
  MAIL_DOMAIN,
  MARKETING_DOMAIN,
  WEBSITE_DOMAIN,
  assertMarketingSender,
  isDeliverableAddress,
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

  test('the default transactional sender is deliverable', () => {
    expect(isDeliverableAddress(DEFAULT_FROM_EMAIL)).toBe(true)
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
