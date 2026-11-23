import type {
  GmailApi,
  GmailHeader,
  GmailHistory,
  GmailLabel,
  GmailMessage,
  GmailMessagePart,
  GmailSendAs,
  MessageFormat,
} from '../client'

/**
 * An in-memory Gmail with the same surface as client.ts (S04-T03). Every S04+ test that touches Gmail uses it:
 * pass `transport: () => fake` to createGmailClient so the allow-list, label policy, quota and backoff in the
 * real client still run. Synthetic data only (example.test addresses, invented subjects).
 *
 * Error injection: `failNext('messages.get', { status: 429 })` makes the next call of that method throw the
 * given error (stack several for several calls). `calls` records every method called, in order.
 */
export type FakeMethod =
  | 'history.list'
  | 'messages.list'
  | 'messages.get'
  | 'messages.send'
  | 'messages.modify'
  | 'messages.attachments.get'
  | 'threads.get'
  | 'labels.list'
  | 'labels.create'
  | 'watch'
  | 'stop'
  | 'getProfile'
  | 'settings.sendAs.list'
  | 'settings.sendAs.get'

export type FakeAttachment = { filename: string; mimeType: string; data: Buffer }

export type FakeMessageInput = {
  from: string
  to: string[]
  cc?: string[]
  subject: string
  text?: string
  html?: string
  attachments?: FakeAttachment[]
  threadId?: string
  labelIds?: string[]
  internalDate?: Date
  headers?: Record<string, string>
  messageIdHeader?: string
  inReplyTo?: string
  references?: string[]
}

type Stored = {
  message: GmailMessage
  raw: string
  attachments: Map<string, Buffer>
}

const SYSTEM: GmailLabel[] = [
  'INBOX',
  'SENT',
  'DRAFT',
  'SPAM',
  'TRASH',
  'UNREAD',
  'IMPORTANT',
  'STARRED',
].map((id) => ({ id, name: id, type: 'system' }))

const b64url = (buf: Buffer) => buf.toString('base64url')

export class FakeGmail implements GmailApi {
  readonly calls: FakeMethod[] = []
  private readonly failures = new Map<FakeMethod, unknown[]>()
  private readonly store = new Map<string, Stored>()
  private readonly historyRecords: Array<{ id: number; record: GmailHistory }> = []
  private readonly labelList: GmailLabel[] = [...SYSTEM]
  private seq = 0
  private historyId = 1000
  /** history.list with a startHistoryId below this answers 404 (Google forgot that far back). */
  historyFloor = 0
  watching: { topicName: string; expiration: string } | null = null
  sendAsList: GmailSendAs[]

  constructor(readonly emailAddress = 'mailbox@example.test') {
    this.sendAsList = [
      {
        sendAsEmail: emailAddress,
        displayName: 'Example Mailbox',
        isDefault: true,
        isPrimary: true,
        verificationStatus: 'accepted',
        signature: '<div>Example Mailbox<br>Example Valve Co</div>',
      },
    ]
  }

  failNext(method: FakeMethod, error: unknown): this {
    const list = this.failures.get(method) ?? []
    list.push(error)
    this.failures.set(method, list)
    return this
  }

  private enter(method: FakeMethod) {
    this.calls.push(method)
    const pending = this.failures.get(method)
    if (pending?.length) throw pending.shift()
  }

  private nextHistory(record: Omit<GmailHistory, 'id'>) {
    this.historyId += 1
    this.historyRecords.push({
      id: this.historyId,
      record: { ...record, id: String(this.historyId) },
    })
    return this.historyId
  }

  get currentHistoryId(): string {
    return String(this.historyId)
  }

  /** Deliver a message into the mailbox (INBOX unless labelIds say otherwise). Returns the Gmail id. */
  deliver(input: FakeMessageInput): string {
    this.seq += 1
    const id = `msg${String(this.seq).padStart(6, '0')}`
    const threadId = input.threadId ?? `thr${String(this.seq).padStart(6, '0')}`
    const date = input.internalDate ?? new Date(Date.UTC(2026, 10, 20, 6, 0, this.seq))
    const rfcId = input.messageIdHeader ?? `<${id}@example.test>`
    const headers: GmailHeader[] = [
      { name: 'From', value: input.from },
      { name: 'To', value: input.to.join(', ') },
      ...(input.cc?.length ? [{ name: 'Cc', value: input.cc.join(', ') }] : []),
      { name: 'Subject', value: input.subject },
      { name: 'Date', value: date.toUTCString() },
      { name: 'Message-ID', value: rfcId },
      ...(input.inReplyTo ? [{ name: 'In-Reply-To', value: input.inReplyTo }] : []),
      ...(input.references?.length
        ? [{ name: 'References', value: input.references.join(' ') }]
        : []),
      ...Object.entries(input.headers ?? {}).map(([name, value]) => ({ name, value })),
    ]
    const attachments = new Map<string, Buffer>()
    const parts: GmailMessagePart[] = []
    const text = input.text ?? ''
    parts.push({
      partId: '0',
      mimeType: 'text/plain',
      headers: [{ name: 'Content-Type', value: 'text/plain; charset=utf-8' }],
      body: { size: Buffer.byteLength(text), data: b64url(Buffer.from(text)) },
    })
    if (input.html) {
      parts.push({
        partId: '1',
        mimeType: 'text/html',
        headers: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }],
        body: { size: Buffer.byteLength(input.html), data: b64url(Buffer.from(input.html)) },
      })
    }
    for (const [i, a] of (input.attachments ?? []).entries()) {
      const attachmentId = `att-${id}-${i}`
      attachments.set(attachmentId, a.data)
      parts.push({
        partId: String(parts.length),
        mimeType: a.mimeType,
        filename: a.filename,
        headers: [
          { name: 'Content-Type', value: `${a.mimeType}; name="${a.filename}"` },
          { name: 'Content-Disposition', value: `attachment; filename="${a.filename}"` },
        ],
        body: { size: a.data.length, attachmentId },
      })
    }
    const labelIds = input.labelIds ?? ['INBOX', 'UNREAD']
    const payload: GmailMessagePart =
      parts.length === 1
        ? { ...parts[0], headers: [...headers, ...(parts[0]?.headers ?? [])] }
        : { mimeType: 'multipart/mixed', headers, parts }
    const rawText = [
      ...headers.map((h) => `${h.name}: ${h.value}`),
      'Content-Type: text/plain; charset=utf-8',
      '',
      text,
    ].join('\r\n')
    const message: GmailMessage = {
      id,
      threadId,
      labelIds,
      snippet: text.slice(0, 100),
      internalDate: String(date.getTime()),
      sizeEstimate: rawText.length,
      payload,
    }
    this.store.set(id, { message, raw: b64url(Buffer.from(rawText)), attachments })
    const historyId = this.nextHistory({ messagesAdded: [{ message: { id, threadId, labelIds } }] })
    message.historyId = String(historyId)
    return id
  }

  /** Gmail-side label change (as if a person did it in Gmail). */
  relabel(id: string, add: string[], remove: string[] = []): void {
    const stored = this.store.get(id)
    if (!stored) throw new Error(`no message ${id}`)
    const labels = new Set(stored.message.labelIds ?? [])
    for (const l of add) labels.add(l)
    for (const l of remove) labels.delete(l)
    stored.message.labelIds = [...labels]
    const ref = { message: { id, threadId: stored.message.threadId ?? null } }
    if (add.length) this.nextHistory({ labelsAdded: [{ ...ref, labelIds: add }] })
    if (remove.length) this.nextHistory({ labelsRemoved: [{ ...ref, labelIds: remove }] })
  }

  message(id: string): GmailMessage | undefined {
    return this.store.get(id)?.message
  }

  allMessages(): GmailMessage[] {
    return [...this.store.values()].map((s) => s.message)
  }

  sent(): GmailMessage[] {
    return this.allMessages().filter((m) => m.labelIds?.includes('SENT'))
  }

  /** The decoded RFC 822 text of a message (sent ones hold exactly what Ops sent). */
  rawText(id: string): string {
    const stored = this.store.get(id)
    return stored ? Buffer.from(stored.raw, 'base64url').toString('utf8') : ''
  }

  // ---- GmailApi ---------------------------------------------------------------------------------------

  history = {
    list: async (p: Parameters<GmailApi['history']['list']>[0]) => {
      this.enter('history.list')
      const start = Number(p.startHistoryId)
      if (start < this.historyFloor)
        throw Object.assign(new Error('Requested entity was not found.'), { status: 404 })
      const pageSize = p.maxResults ?? 500
      const after = this.historyRecords.filter((h) => h.id > start)
      const offset = p.pageToken ? Number(p.pageToken) : 0
      const page = after.slice(offset, offset + pageSize)
      const more = offset + pageSize < after.length
      return {
        history: page.map((h) => h.record),
        historyId: this.currentHistoryId,
        ...(more ? { nextPageToken: String(offset + pageSize) } : {}),
      }
    },
  }

  messages = {
    list: async (p: Parameters<GmailApi['messages']['list']>[0]) => {
      this.enter('messages.list')
      let all = [...this.store.values()].map((s) => s.message)
      const q = p.q ?? ''
      const after = /after:(\d+)/.exec(q)?.[1]
      const before = /before:(\d+)/.exec(q)?.[1]
      if (after) all = all.filter((m) => Number(m.internalDate) >= Number(after) * 1000)
      if (before) all = all.filter((m) => Number(m.internalDate) < Number(before) * 1000)
      if (/in:sent/.test(q)) all = all.filter((m) => m.labelIds?.includes('SENT'))
      if (p.labelIds?.length)
        all = all.filter((m) => p.labelIds?.every((l) => m.labelIds?.includes(l)))
      all.sort((a, b) => Number(b.internalDate) - Number(a.internalDate))
      const size = p.maxResults ?? 100
      const offset = p.pageToken ? Number(p.pageToken) : 0
      const page = all.slice(offset, offset + size)
      return {
        messages: page.map((m): GmailMessage => ({
          id: m.id ?? null,
          threadId: m.threadId ?? null,
        })),
        resultSizeEstimate: all.length,
        ...(offset + size < all.length ? { nextPageToken: String(offset + size) } : {}),
      }
    },
    get: async (p: { id: string; format: MessageFormat; metadataHeaders?: string[] }) => {
      this.enter('messages.get')
      const stored = this.store.get(p.id)
      if (!stored)
        throw Object.assign(new Error('Requested entity was not found.'), { status: 404 })
      const m = stored.message
      const { payload: _payload, ...bare } = m
      if (p.format === 'raw') return { ...bare, raw: stored.raw }
      if (p.format === 'minimal') return bare
      if (p.format === 'metadata') {
        const want = p.metadataHeaders?.map((h) => h.toLowerCase())
        const headers = (m.payload?.headers ?? []).filter(
          (h) => !want || want.includes((h.name ?? '').toLowerCase())
        )
        return { ...m, payload: { mimeType: m.payload?.mimeType ?? null, headers } }
      }
      return structuredClone(m)
    },
    send: async (p: { raw: string; threadId?: string }) => {
      this.enter('messages.send')
      const text = Buffer.from(p.raw, 'base64url').toString('utf8')
      const header = (name: string) =>
        new RegExp(`^${name}:\\s*(.+)$`, 'im')
          .exec(text.split(/\r?\n\r?\n/)[0] ?? '')?.[1]
          ?.trim() ?? ''
      this.seq += 1
      const id = `sent${String(this.seq).padStart(6, '0')}`
      const threadId = p.threadId ?? `thr${String(this.seq).padStart(6, '0')}`
      const headers: GmailHeader[] = [
        'From',
        'To',
        'Cc',
        'Subject',
        'Message-ID',
        'In-Reply-To',
        'References',
        'X-Indus-Outbound',
      ]
        .map((name) => ({ name, value: header(name) }))
        .filter((h) => h.value)
      const message: GmailMessage = {
        id,
        threadId,
        labelIds: ['SENT'],
        internalDate: String(Date.now()),
        payload: { mimeType: 'multipart/alternative', headers },
      }
      this.store.set(id, { message, raw: p.raw, attachments: new Map() })
      message.historyId = String(
        this.nextHistory({ messagesAdded: [{ message: { id, threadId, labelIds: ['SENT'] } }] })
      )
      return { id, threadId, labelIds: ['SENT'] }
    },
    modify: async (p: { id: string; addLabelIds?: string[]; removeLabelIds?: string[] }) => {
      this.enter('messages.modify')
      this.relabel(p.id, p.addLabelIds ?? [], p.removeLabelIds ?? [])
      return structuredClone(this.store.get(p.id)!.message)
    },
    attachments: {
      get: async (p: { messageId: string; id: string }) => {
        this.enter('messages.attachments.get')
        const data = this.store.get(p.messageId)?.attachments.get(p.id)
        if (!data)
          throw Object.assign(new Error('Requested entity was not found.'), { status: 404 })
        return { size: data.length, data: b64url(data) }
      },
    },
  }

  threads = {
    get: async (p: { id: string; format: Exclude<MessageFormat, 'raw'> }) => {
      this.enter('threads.get')
      const messages = [...this.store.values()]
        .map((s) => s.message)
        .filter((m) => m.threadId === p.id)
        .sort((a, b) => Number(a.internalDate) - Number(b.internalDate))
      if (!messages.length)
        throw Object.assign(new Error('Requested entity was not found.'), { status: 404 })
      return { id: p.id, messages: structuredClone(messages) }
    },
  }

  labels = {
    list: async () => {
      this.enter('labels.list')
      return structuredClone(this.labelList)
    },
    create: async (p: { name: string }) => {
      this.enter('labels.create')
      if (this.labelList.some((l) => l.name === p.name)) {
        throw Object.assign(new Error('Label name exists or conflicts'), { status: 409 })
      }
      const label: GmailLabel = {
        id: `Label_${this.labelList.length + 1}`,
        name: p.name,
        type: 'user',
      }
      this.labelList.push(label)
      return { ...label }
    },
  }

  watch = async (p: { topicName: string }) => {
    this.enter('watch')
    const expiration = String(Date.now() + 7 * 24 * 60 * 60 * 1000)
    this.watching = { topicName: p.topicName, expiration }
    return { historyId: this.currentHistoryId, expiration }
  }

  stop = async () => {
    this.enter('stop')
    this.watching = null
  }

  getProfile = async () => {
    this.enter('getProfile')
    return {
      emailAddress: this.emailAddress,
      historyId: this.currentHistoryId,
      messagesTotal: this.store.size,
      threadsTotal: new Set([...this.store.values()].map((s) => s.message.threadId)).size,
    }
  }

  settings = {
    sendAs: {
      list: async () => {
        this.enter('settings.sendAs.list')
        return structuredClone(this.sendAsList)
      },
      get: async (p: { sendAsEmail: string }) => {
        this.enter('settings.sendAs.get')
        const found = this.sendAsList.find((s) => s.sendAsEmail === p.sendAsEmail)
        if (!found)
          throw Object.assign(new Error('Requested entity was not found.'), { status: 404 })
        return structuredClone(found)
      },
    },
  }
}
