import type { ParsedReference } from '@indus/ops-core'
import type { OpsRole } from './access-core'
import { NEW_ENQUIRY_HREF, type ShellPanel } from './shell-hotkeys'

/**
 * The command bar's Actions group (05 §7.6, board 208): a typed registry filtered by role. Pure (no React,
 * no router): the CommandBar binds the effects. Shortcuts are the ones the hotkey registry binds
 * (shell-hotkeys.ts), shown as Kbd hints; an action without a shortcut has none.
 */

export type CommandEffect =
  | { type: 'go'; href: string }
  | { type: 'panel'; panel: ShellPanel }
  /** Owner only: pause everything (C22). The pause action itself is wired in S05. */
  | { type: 'pause' }

export interface CommandAction {
  id: string
  label: string
  /** Kbd hint, the same keys the registry binds ("N", "G R"). */
  keys?: string
  roles: readonly OpsRole[]
  effect: CommandEffect
  /** Extra words the filter matches ("create", "stop"). */
  keywords?: readonly string[]
}

const BOTH: readonly OpsRole[] = ['owner', 'helper']

export const COMMAND_ACTIONS: readonly CommandAction[] = [
  {
    id: 'new-enquiry',
    label: 'New enquiry',
    keys: 'N',
    roles: BOTH,
    effect: { type: 'go', href: NEW_ENQUIRY_HREF },
    keywords: ['create', 'add'],
  },
  {
    id: 'pause-assistant',
    label: 'Pause Assistant',
    roles: ['owner'],
    effect: { type: 'pause' },
    keywords: ['stop', 'hold', 'kill'],
  },
  {
    id: 'go-review',
    label: 'Go to Review',
    keys: 'G R',
    roles: ['owner', 'helper'],
    effect: { type: 'go', href: '/review' },
    keywords: ['proposals', 'approve'],
  },
  {
    id: 'open-assistant',
    label: 'Open the Assistant panel',
    roles: BOTH,
    effect: { type: 'panel', panel: 'assistant' },
    keywords: ['doing', 'instruct'],
  },
  {
    id: 'open-notifications',
    label: 'Open notifications',
    roles: BOTH,
    effect: { type: 'panel', panel: 'notifications' },
    keywords: ['bell', 'alerts'],
  },
  {
    id: 'open-help',
    label: 'Help and shortcuts',
    keys: '?',
    roles: BOTH,
    effect: { type: 'panel', panel: 'help' },
    keywords: ['keyboard', 'shortcuts'],
  },
]

/** How many actions show with an empty query (the board shows three). */
export const DEFAULT_ACTION_COUNT = 3

/**
 * The actions this role may run, matching `query` (every word must appear in the label or keywords). An
 * empty query returns the first DEFAULT_ACTION_COUNT.
 */
export function commandActions(role: OpsRole, query: string): CommandAction[] {
  const allowed = COMMAND_ACTIONS.filter((a) => a.roles.includes(role))
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return allowed.slice(0, DEFAULT_ACTION_COUNT)
  return allowed.filter((a) => {
    const hay = [a.label, ...(a.keywords ?? [])].join(' ').toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}

/**
 * Where a recognised reference opens (05 §6.1). Enquiries and orders are routed by their ref; a quotation by
 * its slug (`/quotations/Q10001-R2`, "/" is not URL-safe). Everything else, and every `search` reading,
 * goes to search until its record page exists.
 */
export function referenceHref(ref: ParsedReference): string {
  if (ref.match !== 'search') {
    if (ref.kind === 'enquiry') return `/enquiries/${ref.canonical}`
    if (ref.kind === 'order') return `/orders/${ref.canonical}`
    if (ref.kind === 'quotation') return `/quotations/${ref.canonical.replace(/^INDUS\//, '')}`
  }
  return `/search?q=${encodeURIComponent(ref.canonical)}`
}

/**
 * Question mode (S01b): the text reads as a question to the Assistant rather than a lookup. Answers arrive
 * with search (S31); until then the "Ask the Assistant" row says so.
 */
export function looksLikeQuestion(query: string): boolean {
  const q = query.trim().toLowerCase()
  return /\?$/.test(q) || /^(who|what|which|how|when|where|why|show|list)\b/.test(q)
}
