import type { opsDb as OpsDb } from '@indus/ops-db'
import { OPS_BUCKETS } from '../../storage/buckets'
import type { OpsStorage } from '../../storage/storage'

/**
 * Shared fixtures for the send-queue database tests (S04-T06). Neutral data only (example.test addresses).
 * Every row this creates carries the `s04q-` prefix (mailboxes, users) or hangs off one, so cleanup is
 * one delete per table.
 */
export function localDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(raw).hostname) ? raw : undefined
  } catch {
    return undefined
  }
}

/** Each test file passes its own tag, so files running in parallel never touch each other's rows. */
export const salesAddress = (tag: string) => `s04q-${tag}-sales@example.test`
export const purchaseAddress = (tag: string) => `s04q-${tag}-purchase@example.test`
export const CLIENT = 'buyer@client.example.test'
export const SUPPLIER = 'rfq@supplier.example.test'

/** In-memory storage: `objects` holds what exists; openRead streams it. */
export function memoryStorage(objects: Map<string, Uint8Array>): OpsStorage {
  return {
    kind: 'local',
    createSignedUploadUrl: async () => ({ url: 'https://storage.test/u' }),
    createSignedUrl: async () => null,
    openRead: async (bucket, key) => {
      const bytes = objects.get(`${bucket}/${key}`)
      if (!bytes) return null
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(bytes)
          controller.close()
        },
      })
    },
    remove: async (bucket, key) => {
      objects.delete(`${bucket}/${key}`)
    },
    upload: async (bucket, key, bytes) => {
      const k = `${bucket}/${key}`
      if (objects.has(k)) return { existed: true }
      objects.set(k, bytes)
      return { existed: false }
    },
  }
}

export type QueueWorld = {
  salesId: string
  purchaseId: string
  ownerId: string
  helperId: string
}

export async function cleanQueue(db: typeof OpsDb, tag: string): Promise<void> {
  const boxes = await db.mailbox.findMany({
    where: { address: { startsWith: `s04q-${tag}-` } },
    select: { id: true },
  })
  const ids = boxes.map((b) => b.id)
  const users = await db.user.findMany({
    where: { email: { startsWith: `s04q-${tag}-` } },
    select: { id: true },
  })
  const userIds = users.map((u) => u.id)
  const outbound = await db.outboundEmail.findMany({
    where: { OR: [{ mailboxId: { in: ids } }, { idempotencyKey: { startsWith: `s04q:${tag}:` } }] },
    select: { id: true },
  })
  await db.notification.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { dedupeKey: { in: ids.map((id) => `send_cap:${id}`) } },
        ...ids.map((id) => ({ dedupeKey: { startsWith: `send_cap:${id}:` } })),
        { dedupeKey: { in: outbound.map((o) => `outbound_unknown:${o.id}`) } },
      ],
    },
  })
  await db.outboundEmail.deleteMany({ where: { id: { in: outbound.map((o) => o.id) } } })
  // assistant_action and its events are append-only (grants and triggers): test actions stay, each with a
  // unique A-S04Q- ref, and reference users by id without a foreign key. Documents are not deletable by
  // ops_app either; test documents carry an S04Q/ number.
  await db.storedFile.deleteMany({ where: { path: { startsWith: `s04q/${tag}/` } } })
  await db.mailThread.deleteMany({ where: { mailboxId: { in: ids } } })
  await db.mailbox.deleteMany({ where: { id: { in: ids } } })
  await db.user.deleteMany({ where: { id: { in: userIds } } })
}

export async function buildQueueWorld(db: typeof OpsDb, tag: string): Promise<QueueWorld> {
  await cleanQueue(db, tag)
  // One active Owner per database (user_one_active_owner): reuse the local one when it exists.
  const owner =
    (await db.user.findFirst({ where: { role: 'owner', status: 'active' } })) ??
    (await db.user.create({
      data: {
        email: `s04q-${tag}-owner@example.test`,
        name: 'Owner Example',
        initials: 'OE',
        role: 'owner',
        status: 'active',
      },
    }))
  const helper = await db.user.create({
    data: {
      email: `s04q-${tag}-helper@example.test`,
      name: 'Helper Example',
      initials: 'HE',
      role: 'helper',
      status: 'active',
    },
  })
  const sales = await db.mailbox.create({
    data: {
      address: salesAddress(tag),
      displayName: 'Sales Example',
      role: 'client',
      status: 'live',
      canSend: true,
      sendAsAliases: [salesAddress(tag)],
      dailySendCap: 40,
      signatureHtml: '<div>Owner Example<br>Example Trading LLC</div>',
    },
  })
  const purchase = await db.mailbox.create({
    data: {
      address: purchaseAddress(tag),
      displayName: 'Purchase Example',
      role: 'supplier',
      status: 'live',
      canSend: true,
      sendAsAliases: [purchaseAddress(tag)],
      dailySendCap: 80,
    },
  })
  await db.mailboxSyncState.createMany({
    data: [{ mailboxId: sales.id }, { mailboxId: purchase.id }],
  })
  return { salesId: sales.id, purchaseId: purchase.id, ownerId: owner.id, helperId: helper.id }
}

/** A stored file (and its bytes in `objects`) for an attachment. */
export async function storedFile(
  db: typeof OpsDb,
  objects: Map<string, Uint8Array>,
  tag: string,
  name: string,
  bytes = Buffer.from(`%PDF-1.4 ${name}`)
): Promise<string> {
  const path = `s04q/${tag}/${name}`
  objects.set(`${OPS_BUCKETS.documents}/${path}`, bytes)
  const f = await db.storedFile.create({
    data: {
      bucket: OPS_BUCKETS.documents,
      path,
      filename: name,
      mimeType: 'application/pdf',
      sizeBytes: bytes.length,
      sha256: '0'.repeat(64),
      source: 'generated',
    },
  })
  return f.id
}
