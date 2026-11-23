import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GMAIL_ALLOWLIST } from './client'

/**
 * Gmail stays the record (ADR-06, 08-map-integrations §0 rule 1, §1.11). This guard fails the build if any
 * code under apps/ops/src could delete, trash, archive, import, insert, touch drafts, filters, forwarding or
 * settings, or change a Gmail system label; or reaches Gmail any way but server/gmail/client.ts.
 *
 * It also stands in for a lint rule: no-restricted-imports for googleapis would live in the ROOT .oxlintrc.json,
 * and changing that file marks every workspace affected (a storefront rebuild). Decision S04-T03.
 */
const SRC = join(import.meta.dir, '..', '..')
const SELF = join(import.meta.dir, 'gmail-allowlist.test.ts')
const CLIENT = join(import.meta.dir, 'client.ts')

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : files(path)
    return /\.(ts|tsx)$/.test(name) && path !== SELF ? [path] : []
  })
}

const FORBIDDEN: Array<[RegExp, string]> = [
  [/\.trash\b|\btrash\s*\(/, 'trash'],
  [/\buntrash\b/, 'untrash'],
  [/\bbatchDelete\b/, 'batchDelete'],
  [/\bbatchModify\b/, 'batchModify'],
  [/messages\s*\.\s*delete\b/, 'messages.delete'],
  [/threads\s*\.\s*delete\b/, 'threads.delete'],
  [/threads\s*\.\s*modify\b/, 'threads.modify'],
  [/drafts\s*\.\s*(create|delete|update|send)\b/, 'drafts.*'],
  [/messages\s*\.\s*import\b/, 'messages.import'],
  [/messages\s*\.\s*insert\b/, 'messages.insert'],
  [/settings\s*\.\s*filters\b/, 'settings.filters'],
  [/settings\s*\.\s*forwardingAddresses\b/, 'settings.forwardingAddresses'],
  [/\bupdateVacation\b/, 'settings.updateVacation'],
  [/\bupdateImap\b/, 'settings.updateImap'],
  [/\bupdatePop\b/, 'settings.updatePop'],
  [/\bupdateAutoForwarding\b/, 'settings.updateAutoForwarding'],
  [/settings\s*\.\s*\w+\s*\.\s*(update|patch)\b/, 'users.settings.*.update/patch'],
  [/(fetch|axios[.\w]*)\s*\([^)]*gmail\.googleapis\.com/, 'direct HTTP to gmail.googleapis.com'],
]

const SYSTEM_LABEL_LITERAL =
  /(addLabelIds|removeLabelIds)\s*:\s*\[[^\]]*['"`](INBOX|UNREAD|SPAM|TRASH|IMPORTANT|STARRED|SENT|DRAFT|CHAT|CATEGORY_\w+)['"`]/

/** Findings for one file's text. */
function scan(path: string, text: string): string[] {
  const where = relative(SRC, path)
  const found: string[] = []
  if (
    path !== CLIENT &&
    /from\s+['"](googleapis|@googleapis\/gmail)['"]|require\(\s*['"](googleapis|@googleapis\/gmail)['"]/.test(
      text
    )
  ) {
    found.push(`${where}: imports googleapis outside server/gmail/client.ts`)
  }
  for (const [re, name] of FORBIDDEN) if (re.test(text)) found.push(`${where}: ${name}`)
  if (SYSTEM_LABEL_LITERAL.test(text)) found.push(`${where}: changes a Gmail system label`)
  return found
}

describe('Gmail allow-list (Gmail stays the record)', () => {
  const all = files(SRC)

  it('scans the whole of apps/ops/src', () => {
    expect(all.length).toBeGreaterThan(100)
    expect(all).toContain(CLIENT)
  })

  it('finds no forbidden Gmail call, system-label change or stray googleapis import', () => {
    const findings = all.flatMap((path) => scan(path, readFileSync(path, 'utf8')))
    expect(findings).toEqual([])
  })

  it('the client exposes exactly the allow-list, and no drafts method', () => {
    expect([...GMAIL_ALLOWLIST]).toEqual([
      'history.list',
      'messages.list',
      'messages.get',
      'messages.send',
      'messages.modify',
      'messages.attachments.get',
      'threads.get',
      'labels.list',
      'labels.create',
      'watch',
      'stop',
      'getProfile',
      'settings.sendAs.list',
      'settings.sendAs.get',
    ])
    expect(GMAIL_ALLOWLIST.some((m) => m.startsWith('drafts'))).toBe(false)
  })

  it('bites: each forbidden pattern is caught', () => {
    const probe = join(SRC, 'probe.ts')
    expect(scan(probe, 'export const x = (g: any) => g.users.messages.trash')).not.toEqual([])
    expect(scan(probe, 'await gmail.users.drafts.delete({ id })')).not.toEqual([])
    expect(scan(probe, "await c.messages.modify({ id, removeLabelIds: ['INBOX'] })")).not.toEqual(
      []
    )
    expect(scan(probe, "import { gmail } from '@googleapis/gmail'")).not.toEqual([])
    expect(
      scan(probe, "await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages')")
    ).not.toEqual([])
    expect(scan(probe, 'gmail.users.settings.filters.create(x)')).not.toEqual([])
    expect(scan(probe, 'await c.messages.modify({ id, addLabelIds: [indusId] })')).toEqual([])
  })
})
