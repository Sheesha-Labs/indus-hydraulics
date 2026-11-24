'use server'

import { err, ok, type Result } from '@indus/ops-core'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { requireOpsUser } from '../../lib/access'
import { isExpectedRefusal, SAFE_MESSAGES, safeMessage } from '../../lib/safe-message'

/**
 * Read actions behind the shell's client panels (05 §6.3: "data via read actions"). Each checks the session
 * itself and returns `Result<T>`. S02: frames only, so every one answers with nothing; the sprint named on
 * each fills the body.
 */

async function read<T>(run: () => T | Promise<T>): Promise<Result<T>> {
  try {
    await requireOpsUser()
    return ok(await run())
  } catch (e) {
    if (!isExpectedRefusal(e)) Sentry.captureException(e)
    return err(safeMessage(e))
  }
}

// ── Command bar (S01) ─────────────────────────────────────────────────────────────────────────────────

export type CommandGroupKey = 'records' | 'emails' | 'attachments' | 'parts'

export interface CommandHit {
  id: string
  title: string
  sub?: string
  href: string
  /** Text to highlight inside `sub` (the matched reference in an email snippet). */
  mark?: string
}

export interface CommandSearch {
  /** Echoed back so the bar drops a response that arrives after a newer one. */
  seq: number
  groups: Array<{ key: CommandGroupKey; label: string; hits: CommandHit[] }>
}

const searchSchema = z.object({ q: z.string().max(200), seq: z.number().int().nonnegative() })

/**
 * Records, emails, attachments and parts for the command bar (board 208). S02: none. S31 runs FTS over
 * `search_document` plus trigram on parts, with Helper masking applied in the query.
 */
export async function searchCommand(q: string, seq: number): Promise<Result<CommandSearch>> {
  const parsed = searchSchema.safeParse({ q, seq })
  if (!parsed.success) return err(SAFE_MESSAGES.invalid)
  return read(() => ({ seq: parsed.data.seq, groups: [] }))
}

// ── Notifications (S02 surface; S30 fills it) ─────────────────────────────────────────────────────────

export type NotificationTab = 'all' | 'needs-you' | 'done'

export interface NotificationRow {
  id: string
  tone: 'bad' | 'warn' | 'ok' | 'n'
  title: string
  sub: string
  /** "09:02", "Yesterday". */
  time: string
  href: string
  unread: boolean
}

export interface NotificationFeed {
  rows: NotificationRow[]
  counts: Record<NotificationTab, number>
}

/** The bell's panel. S02: empty. S30 reads `notification` rows for the user (two safety events always on). */
export async function getNotifications(): Promise<Result<NotificationFeed>> {
  return read(() => ({ rows: [], counts: { all: 0, 'needs-you': 0, done: 0 } }))
}

// The Assistant panel's read moved to ../assistant-panel.ts (S06-T08).

// ── Help (S06 surface; S35 fills it) ──────────────────────────────────────────────────────────────────

export interface HelpArticleRow {
  slug: string
  title: string
  minutes: number
}

const pathSchema = z.string().startsWith('/').max(300)

/** "On this page" articles for a pathname. S02: none. S35 reads `help_article.page_keys`. */
export async function getHelpForPage(pathname: string): Promise<Result<HelpArticleRow[]>> {
  if (!pathSchema.safeParse(pathname).success) return err(SAFE_MESSAGES.invalid)
  return read(() => [])
}
