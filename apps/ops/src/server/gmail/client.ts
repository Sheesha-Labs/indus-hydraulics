import 'server-only'
import { gmail as gmailApi, type gmail_v1 } from '@googleapis/gmail'
import { OAuth2Client } from 'google-auth-library'
import { sendCall, withBackoff } from './backoff'
import { GmailPolicyError, HistoryTooOldError, httpStatusOf } from './errors'
import { bucketFor, UNIT_COST, type GmailBudget, type UnitCostKey } from './quota'

/**
 * The ONLY door to Gmail (S04-T03, ADR-06, 08-map-integrations §0 rule 1 and §1.11). It exposes exactly the
 * methods in GMAIL_ALLOWLIST; gmail-allowlist.test.ts fails the build on any other Gmail call anywhere in
 * apps/ops/src and on any googleapis import outside this file.
 *
 * Gmail stays the record: Ops adds and removes only its own `Indus/*` labels and sends mail. It never deletes,
 * trashes, archives, marks read or unread, imports, inserts, or touches filters, forwarding or settings. No
 * drafts methods either (decision, coverage gap G12): drafts live in Ops only in v1.
 *
 * Every call draws its unit cost from the mailbox's quota bucket BEFORE it is made (quota.ts). Reads and label
 * writes retry with jittered backoff; messages.send is never retried (ADR-07).
 */

export type GmailMessage = gmail_v1.Schema$Message
export type GmailMessagePart = gmail_v1.Schema$MessagePart
export type GmailHeader = gmail_v1.Schema$MessagePartHeader
export type GmailThread = gmail_v1.Schema$Thread
export type GmailLabel = gmail_v1.Schema$Label
export type GmailHistory = gmail_v1.Schema$History
export type GmailHistoryList = gmail_v1.Schema$ListHistoryResponse
export type GmailMessageList = gmail_v1.Schema$ListMessagesResponse
export type GmailAttachment = gmail_v1.Schema$MessagePartBody
export type GmailSendAs = gmail_v1.Schema$SendAs
export type GmailProfile = gmail_v1.Schema$Profile
export type GmailWatch = gmail_v1.Schema$WatchResponse

export type MessageFormat = 'minimal' | 'metadata' | 'full' | 'raw'

/** The surface every transport (Google, or the in-memory fake) provides, and the client re-exposes. */
export interface GmailApi {
  history: {
    list(p: {
      startHistoryId: string
      pageToken?: string
      maxResults?: number
      historyTypes?: Array<'messageAdded' | 'messageDeleted' | 'labelAdded' | 'labelRemoved'>
    }): Promise<GmailHistoryList>
  }
  messages: {
    list(p: {
      q?: string
      pageToken?: string
      maxResults?: number
      labelIds?: string[]
    }): Promise<GmailMessageList>
    get(p: { id: string; format: MessageFormat; metadataHeaders?: string[] }): Promise<GmailMessage>
    send(p: { raw: string; threadId?: string }): Promise<GmailMessage>
    modify(p: {
      id: string
      addLabelIds?: string[]
      removeLabelIds?: string[]
    }): Promise<GmailMessage>
    attachments: { get(p: { messageId: string; id: string }): Promise<GmailAttachment> }
  }
  threads: {
    get(p: {
      id: string
      format: Exclude<MessageFormat, 'raw'>
      metadataHeaders?: string[]
    }): Promise<GmailThread>
  }
  labels: {
    list(): Promise<GmailLabel[]>
    create(p: {
      name: string
      color?: { backgroundColor: string; textColor: string }
    }): Promise<GmailLabel>
  }
  watch(p: { topicName: string }): Promise<GmailWatch>
  stop(): Promise<void>
  getProfile(): Promise<GmailProfile>
  settings: {
    sendAs: {
      list(): Promise<GmailSendAs[]>
      get(p: { sendAsEmail: string }): Promise<GmailSendAs>
    }
  }
}

/** Exactly what the client exposes. gmail-allowlist.test.ts snapshots this list. */
export const GMAIL_ALLOWLIST = [
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
] as const

/** Labels Gmail owns. Ops never adds or removes one (08-map-integrations §1.8). */
export const SYSTEM_LABELS = new Set([
  'INBOX',
  'UNREAD',
  'SPAM',
  'TRASH',
  'IMPORTANT',
  'STARRED',
  'SENT',
  'DRAFT',
  'CHAT',
])

export function isSystemLabel(id: string): boolean {
  return SYSTEM_LABELS.has(id) || id.startsWith('CATEGORY_')
}

export type GmailClientDeps = {
  mailboxId: string
  budget: GmailBudget
  /** A current access token for the mailbox (tokens.getAccessToken). Never logged. */
  accessToken: () => Promise<string>
  /** Gmail ids of this mailbox's `Indus/*` labels (gmail_label rows). messages.modify accepts only these. */
  indusLabelIds: () => Promise<ReadonlySet<string>>
  /** Defaults to Google; tests pass the in-memory fake (testing/fake-gmail.ts). */
  transport?: (accessToken: () => Promise<string>) => GmailApi
  /** Test hook for backoff sleeps. */
  sleep?: (ms: number) => Promise<void>
}

export function createGmailClient(deps: GmailClientDeps): GmailApi {
  const transport = (deps.transport ?? googleTransport)(deps.accessToken)

  async function charge(key: UnitCostKey, budget: GmailBudget = deps.budget) {
    await bucketFor(deps.mailboxId, budget).take(UNIT_COST[key], `${deps.mailboxId}:${budget}`)
  }

  const read = <T>(key: UnitCostKey, fn: () => Promise<T>) =>
    charge(key).then(() =>
      withBackoff<T, () => Promise<T>>(fn, {
        kind: 'read',
        mailboxId: deps.mailboxId,
        ...(deps.sleep ? { sleep: deps.sleep } : {}),
      })
    )

  // Label and modify writes draw from the send bucket (quota.ts) and retry like reads.
  const labelWrite = <T>(key: UnitCostKey, fn: () => Promise<T>) =>
    charge(key, 'send').then(() =>
      withBackoff<T, () => Promise<T>>(fn, {
        kind: 'label',
        mailboxId: deps.mailboxId,
        ...(deps.sleep ? { sleep: deps.sleep } : {}),
      })
    )

  async function checkLabels(add: string[] = [], remove: string[] = []) {
    const all = [...add, ...remove]
    const system = all.filter(isSystemLabel)
    if (system.length) {
      throw new GmailPolicyError(`Ops never changes Gmail's own labels (${system.join(', ')})`)
    }
    if (!all.length) throw new GmailPolicyError('messages.modify needs at least one Indus label')
    const allowed = await deps.indusLabelIds()
    const unknown = all.filter((id) => !allowed.has(id))
    if (unknown.length)
      throw new GmailPolicyError('Only Indus/* labels of this mailbox may be changed')
  }

  return {
    history: {
      list: async (p) => {
        try {
          return await read('history.list', () => transport.history.list(p))
        } catch (error) {
          if (httpStatusOf(error) === 404) throw new HistoryTooOldError()
          throw error
        }
      },
    },
    messages: {
      list: (p) => read('messages.list', () => transport.messages.list(p)),
      get: (p) => read(`messages.get.${p.format}`, () => transport.messages.get(p)),
      // Never retried, never through withBackoff (sendCall brands it so the type checker refuses that).
      send: async (p) => {
        await charge('messages.send', 'send')
        return sendCall(() => transport.messages.send(p))()
      },
      modify: async (p) => {
        await checkLabels(p.addLabelIds, p.removeLabelIds)
        return labelWrite('messages.modify', () => transport.messages.modify(p))
      },
      attachments: {
        get: (p) => read('messages.attachments.get', () => transport.messages.attachments.get(p)),
      },
    },
    threads: { get: (p) => read(`threads.get.${p.format}`, () => transport.threads.get(p)) },
    labels: {
      list: () => read('labels.list', () => transport.labels.list()),
      create: async (p) => {
        if (!p.name.startsWith('Indus/'))
          throw new GmailPolicyError('Ops creates only Indus/* labels')
        return labelWrite('labels.create', () => transport.labels.create(p))
      },
    },
    watch: (p) => read('watch', () => transport.watch(p)),
    stop: () => read('stop', () => transport.stop()),
    getProfile: () => read('getProfile', () => transport.getProfile()),
    settings: {
      sendAs: {
        list: () => read('settings.sendAs.list', () => transport.settings.sendAs.list()),
        get: (p) => read('settings.sendAs.get', () => transport.settings.sendAs.get(p)),
      },
    },
  }
}

/** Google's Gmail API through @googleapis/gmail, one OAuth2 client per call with the current access token. */
function googleTransport(accessToken: () => Promise<string>): GmailApi {
  async function users() {
    const auth = new OAuth2Client()
    auth.setCredentials({ access_token: await accessToken() })
    return gmailApi({ version: 'v1', auth }).users
  }
  const me = 'me'
  return {
    history: {
      list: async (p) =>
        (
          await (
            await users()
          ).history.list({
            userId: me,
            startHistoryId: p.startHistoryId,
            ...(p.pageToken ? { pageToken: p.pageToken } : {}),
            ...(p.maxResults ? { maxResults: p.maxResults } : {}),
            ...(p.historyTypes ? { historyTypes: p.historyTypes } : {}),
          })
        ).data,
    },
    messages: {
      list: async (p) => (await (await users()).messages.list({ userId: me, ...p })).data,
      get: async (p) => (await (await users()).messages.get({ userId: me, ...p })).data,
      send: async (p) =>
        (
          await (
            await users()
          ).messages.send({
            userId: me,
            requestBody: { raw: p.raw, ...(p.threadId ? { threadId: p.threadId } : {}) },
          })
        ).data,
      modify: async (p) =>
        (
          await (
            await users()
          ).messages.modify({
            userId: me,
            id: p.id,
            requestBody: {
              addLabelIds: p.addLabelIds ?? [],
              removeLabelIds: p.removeLabelIds ?? [],
            },
          })
        ).data,
      attachments: {
        get: async (p) =>
          (await (await users()).messages.attachments.get({ userId: me, ...p })).data,
      },
    },
    threads: { get: async (p) => (await (await users()).threads.get({ userId: me, ...p })).data },
    labels: {
      list: async () => (await (await users()).labels.list({ userId: me })).data.labels ?? [],
      create: async (p) =>
        (
          await (
            await users()
          ).labels.create({
            userId: me,
            requestBody: {
              name: p.name,
              labelListVisibility: 'labelShow',
              messageListVisibility: 'show',
              ...(p.color ? { color: p.color } : {}),
            },
          })
        ).data,
    },
    watch: async (p) =>
      (await (await users()).watch({ userId: me, requestBody: { topicName: p.topicName } })).data,
    stop: async () => {
      await (await users()).stop({ userId: me })
    },
    getProfile: async () => (await (await users()).getProfile({ userId: me })).data,
    settings: {
      sendAs: {
        list: async () =>
          (await (await users()).settings.sendAs.list({ userId: me })).data.sendAs ?? [],
        get: async (p) => (await (await users()).settings.sendAs.get({ userId: me, ...p })).data,
      },
    },
  }
}
