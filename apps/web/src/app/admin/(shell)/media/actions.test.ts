import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { MediaUsage } from '@indus/domain'
import { buildMediaUsageIndex, emptyMediaUsageIndex } from '@indus/domain'

/**
 * The guard chain on the destructive path.
 *
 * This is the only code in the media library that can lose data, and every
 * rule it enforces is invisible in the happy case — the tests below all
 * describe the moment something has gone slightly wrong and the code has to
 * refuse rather than proceed.
 *
 * Two of them protect against outcomes that have no undo:
 *
 *   - A usage source that failed must never read as "unused". It is the
 *     difference between "nothing references this" and "we could not check",
 *     and only the first should unlock a delete.
 *   - `media.storagePath` is NOT unique — 227 of 665 rows currently share one.
 *     Removing the storage object for one row would 404 every sibling row,
 *     including ones on live products. Bazar, which this feature is modelled
 *     on, has storage_key UNIQUE and so never had to make this check; porting
 *     its delete path unchanged would ship exactly that bug.
 */

const dbMock = vi.hoisted(() => ({
  media: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
}))
const usageMock = vi.hoisted(() => ({ build: vi.fn() }))
const storageMock = vi.hoisted(() => ({ remove: vi.fn() }))
const authMock = vi.hoisted(() => ({ role: 'super_admin' as string | null }))

vi.mock('@indus/db', () => ({ db: dbMock }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('../../../../lib/cache-tags', () => ({ invalidateMediaConsumers: vi.fn() }))
vi.mock('../../../../lib/queries/media-usage', () => ({
  buildMediaUsageIndexFromDb: usageMock.build,
}))
vi.mock('../../../../lib/supabase-admin', () => ({
  removeFromStorageStrict: storageMock.remove,
}))
// `kind` sits on `user`, not on the session root — isStaffPrincipal reads
// `session.user.kind`. Getting this wrong makes every action return
// UNAUTHORIZED, which is how this mock was written the first time.
vi.mock('../../../../lib/admin-auth', () => ({
  auth: async () =>
    authMock.role ? { user: { id: 'u1', role: authMock.role, kind: 'staff' } } : null,
}))

const { bulkTrashMedia, deleteMediaPermanently, restoreMedia, trashMedia } = await import(
  './actions'
)

const ID = '11111111-1111-4111-8111-111111111111'
const OTHER = '22222222-2222-4222-8222-222222222222'
const PATH = 'https://x.supabase.co/storage/v1/object/public/product-images/a.png'

function usage(over: Partial<MediaUsage> = {}): MediaUsage {
  return {
    kind: 'product',
    id: 'p1',
    label: 'Parker hose',
    role: 'Image',
    href: null,
    live: true,
    internal: false,
    ...over,
  }
}

/** An index reporting the given usages for ID, with nothing failed. */
function indexWith(usages: MediaUsage[]) {
  return buildMediaUsageIndex(new Map(usages.length ? [[ID, usages]] : []))
}

beforeEach(() => {
  vi.clearAllMocks()
  authMock.role = 'super_admin'
  storageMock.remove.mockResolvedValue({ ok: true })
  dbMock.media.count.mockResolvedValue(0)
  dbMock.media.updateMany.mockResolvedValue({ count: 1 })
  dbMock.media.delete.mockResolvedValue({})
})

describe('trashMedia', () => {
  test('trashes a file nothing references', async () => {
    dbMock.media.findUnique.mockResolvedValue({
      id: ID,
      storagePath: PATH,
      deletedAt: null,
      originalFilename: 'a.png',
    })
    usageMock.build.mockResolvedValue(emptyMediaUsageIndex())

    const res = await trashMedia({ id: ID })
    expect(res.success).toBe(true)
    expect(dbMock.media.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ID, deletedAt: null } })
    )
  })

  test('refuses a file that is still in use, and says what holds it', async () => {
    dbMock.media.findUnique.mockResolvedValue({
      id: ID,
      storagePath: PATH,
      deletedAt: null,
      originalFilename: 'a.png',
    })
    usageMock.build.mockResolvedValue(indexWith([usage()]))

    const res = await trashMedia({ id: ID })
    expect(res.success).toBe(false)
    if (!res.success) expect(res.message).toMatch(/in use.*1 product/i)
    expect(dbMock.media.updateMany).not.toHaveBeenCalled()
  })

  test('refuses when usage could not be fully checked', async () => {
    // The dangerous case: a source threw, so the file LOOKS unused.
    dbMock.media.findUnique.mockResolvedValue({
      id: ID,
      storagePath: PATH,
      deletedAt: null,
      originalFilename: 'a.png',
    })
    usageMock.build.mockResolvedValue(buildMediaUsageIndex(new Map(), ['blog posts']))

    const res = await trashMedia({ id: ID })
    expect(res.success).toBe(false)
    if (!res.success) expect(res.message).toMatch(/couldn't verify/i)
    expect(dbMock.media.updateMany).not.toHaveBeenCalled()
  })

  test('re-checks usage server-side rather than trusting the client', async () => {
    dbMock.media.findUnique.mockResolvedValue({
      id: ID,
      storagePath: PATH,
      deletedAt: null,
      originalFilename: 'a.png',
    })
    usageMock.build.mockResolvedValue(emptyMediaUsageIndex())
    await trashMedia({ id: ID })
    // The disabled button is a hint; the page may be minutes old.
    expect(usageMock.build).toHaveBeenCalledWith([{ id: ID, storagePath: PATH }])
  })

  test('is idempotent on an already-trashed file', async () => {
    dbMock.media.findUnique.mockResolvedValue({
      id: ID,
      storagePath: PATH,
      deletedAt: new Date(),
      originalFilename: 'a.png',
    })
    const res = await trashMedia({ id: ID })
    expect(res.success).toBe(true)
    expect(usageMock.build).not.toHaveBeenCalled()
  })

  test('rejects a caller without write access', async () => {
    authMock.role = 'sales_rep'
    const res = await trashMedia({ id: ID })
    expect(res.success).toBe(false)
    expect(dbMock.media.findUnique).not.toHaveBeenCalled()
  })
})

describe('restoreMedia', () => {
  test('restores without checking usage — putting a file back breaks nothing', async () => {
    const res = await restoreMedia({ id: ID })
    expect(res.success).toBe(true)
    expect(usageMock.build).not.toHaveBeenCalled()
  })

  test('reports a file that was not in the trash', async () => {
    dbMock.media.updateMany.mockResolvedValue({ count: 0 })
    const res = await restoreMedia({ id: ID })
    expect(res.success).toBe(false)
  })
})

describe('deleteMediaPermanently', () => {
  function trashedAsset() {
    dbMock.media.findUnique.mockResolvedValue({
      id: ID,
      storagePath: PATH,
      deletedAt: new Date(),
      originalFilename: 'a.png',
    })
    usageMock.build.mockResolvedValue(emptyMediaUsageIndex())
  }

  test('removes the storage object when no other row shares the path', async () => {
    trashedAsset()
    dbMock.media.count.mockResolvedValue(0)

    const res = await deleteMediaPermanently({ id: ID })
    expect(res.success).toBe(true)
    expect(storageMock.remove).toHaveBeenCalledWith(PATH)
    expect(dbMock.media.delete).toHaveBeenCalled()
  })

  test('LEAVES the storage object when another row still points at it', async () => {
    // The whole reason canRemoveStorageObject exists. Deleting the object here
    // would break every sibling row, including live product datasheets.
    trashedAsset()
    dbMock.media.count.mockResolvedValue(6)

    const res = await deleteMediaPermanently({ id: ID })
    expect(res.success).toBe(true)
    expect(storageMock.remove).not.toHaveBeenCalled()
    // The row still goes — only the shared object is spared.
    expect(dbMock.media.delete).toHaveBeenCalled()
  })

  test('counts siblings by path, excluding the row being deleted', async () => {
    trashedAsset()
    await deleteMediaPermanently({ id: ID })
    expect(dbMock.media.count).toHaveBeenCalledWith({
      where: { storagePath: PATH, id: { not: ID } },
    })
  })

  test('aborts before touching the row if storage removal fails', async () => {
    trashedAsset()
    storageMock.remove.mockResolvedValue({ ok: false, message: 'network' })

    const res = await deleteMediaPermanently({ id: ID })
    expect(res.success).toBe(false)
    // Object-first ordering only helps if a failure stops the row delete —
    // otherwise it produces the orphan it was meant to avoid.
    expect(dbMock.media.delete).not.toHaveBeenCalled()
  })

  test('refuses a file that is not in the trash', async () => {
    dbMock.media.findUnique.mockResolvedValue({
      id: ID,
      storagePath: PATH,
      deletedAt: null,
      originalFilename: 'a.png',
    })
    const res = await deleteMediaPermanently({ id: ID })
    expect(res.success).toBe(false)
    if (!res.success) expect(res.message).toMatch(/trash first/i)
    expect(storageMock.remove).not.toHaveBeenCalled()
  })

  test('refuses when usage became non-empty while it sat in the trash', async () => {
    dbMock.media.findUnique.mockResolvedValue({
      id: ID,
      storagePath: PATH,
      deletedAt: new Date(),
      originalFilename: 'a.png',
    })
    usageMock.build.mockResolvedValue(indexWith([usage()]))

    const res = await deleteMediaPermanently({ id: ID })
    expect(res.success).toBe(false)
    expect(storageMock.remove).not.toHaveBeenCalled()
    expect(dbMock.media.delete).not.toHaveBeenCalled()
  })

  test('turns a foreign-key refusal into something an operator can act on', async () => {
    trashedAsset()
    dbMock.media.delete.mockRejectedValue({ code: 'P2003' })

    const res = await deleteMediaPermanently({ id: ID })
    expect(res.success).toBe(false)
    if (!res.success) expect(res.message).toMatch(/still references/i)
  })

  test('rejects a caller without delete access', async () => {
    authMock.role = 'cms_editor'
    const res = await deleteMediaPermanently({ id: ID })
    expect(res.success).toBe(false)
    expect(dbMock.media.findUnique).not.toHaveBeenCalled()
  })
})

describe('bulkTrashMedia', () => {
  test('trashes only the files that pass their own check', async () => {
    dbMock.media.findMany.mockResolvedValue([
      { id: ID, storagePath: PATH, originalFilename: 'free.png' },
      { id: OTHER, storagePath: 'b', originalFilename: 'busy.png' },
    ])
    usageMock.build.mockResolvedValue(buildMediaUsageIndex(new Map([[OTHER, [usage()]]])))

    const res = await bulkTrashMedia({ ids: [ID, OTHER] })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.trashed).toBe(1)
      expect(res.data.skipped).toEqual([
        { filename: 'busy.png', reason: expect.stringMatching(/in use/i) },
      ])
    }
    // Only the free one is written.
    expect(dbMock.media.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: [ID] }, deletedAt: null } })
    )
  })

  test('deletes nothing at all when the index is incomplete', async () => {
    dbMock.media.findMany.mockResolvedValue([
      { id: ID, storagePath: PATH, originalFilename: 'a.png' },
    ])
    usageMock.build.mockResolvedValue(buildMediaUsageIndex(new Map(), ['products']))

    const res = await bulkTrashMedia({ ids: [ID] })
    expect(res.success).toBe(false)
    expect(dbMock.media.updateMany).not.toHaveBeenCalled()
  })

  test('resolves usage once for the whole batch, not per file', async () => {
    dbMock.media.findMany.mockResolvedValue([
      { id: ID, storagePath: PATH, originalFilename: 'a.png' },
      { id: OTHER, storagePath: 'b', originalFilename: 'b.png' },
    ])
    usageMock.build.mockResolvedValue(emptyMediaUsageIndex())
    await bulkTrashMedia({ ids: [ID, OTHER] })
    // ~30 queries per index build; per-file would be 1,440 for a page of 48.
    expect(usageMock.build).toHaveBeenCalledTimes(1)
  })

  test('bounds the batch so one request cannot walk the library', async () => {
    const tooMany = Array.from({ length: 201 }, () => ID)
    const res = await bulkTrashMedia({ ids: tooMany })
    expect(res.success).toBe(false)
    expect(dbMock.media.findMany).not.toHaveBeenCalled()
  })
})
