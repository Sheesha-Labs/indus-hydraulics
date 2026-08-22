import { describe, it, expect, vi, beforeEach } from 'vitest'

const { recordSlugRedirect } = await import('./slug-redirect')

function makeTx() {
  return {
    redirect: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      upsert: vi.fn().mockResolvedValue({}),
    },
  }
}

let tx: ReturnType<typeof makeTx>

beforeEach(() => {
  tx = makeTx()
})

// The helper takes a Prisma.TransactionClient; the stub above implements the
// three methods it touches.
const run = (opts: Parameters<typeof recordSlugRedirect>[1]) =>
  recordSlugRedirect(tx as unknown as Parameters<typeof recordSlugRedirect>[0], opts)

describe('recordSlugRedirect', () => {
  it('writes a 301 from the old path to the new one', async () => {
    await run({ fromPath: '/c/old', toPath: '/c/new' })

    expect(tx.redirect.upsert).toHaveBeenCalledTimes(1)
    const arg = tx.redirect.upsert.mock.calls[0]![0] as {
      where: { fromPath: string }
      create: { toPath: string; statusCode: number }
    }
    expect(arg.where.fromPath).toBe('/c/old')
    expect(arg.create.toPath).toBe('/c/new')
    expect(arg.create.statusCode).toBe(301)
  })

  it('does nothing when the path did not actually change', async () => {
    await run({ fromPath: '/c/same', toPath: '/c/same' })

    expect(tx.redirect.upsert).not.toHaveBeenCalled()
    expect(tx.redirect.deleteMany).not.toHaveBeenCalled()
    expect(tx.redirect.updateMany).not.toHaveBeenCalled()
  })

  it('treats a trailing slash as the same path', async () => {
    await run({ fromPath: '/c/same/', toPath: '/c/same' })

    expect(tx.redirect.upsert).not.toHaveBeenCalled()
  })

  it('normalises both paths before writing', async () => {
    await run({ fromPath: '/c/old/', toPath: '/c/new/' })

    const arg = tx.redirect.upsert.mock.calls[0]![0] as {
      where: { fromPath: string }
      create: { toPath: string }
    }
    expect(arg.where.fromPath).toBe('/c/old')
    expect(arg.create.toPath).toBe('/c/new')
  })

  it('flattens chains by repointing anything aimed at the old path', async () => {
    await run({ fromPath: '/c/b', toPath: '/c/c' })

    expect(tx.redirect.updateMany).toHaveBeenCalledWith({
      where: { toPath: '/c/b', isActive: true },
      data: { toPath: '/c/c' },
    })
  })

  it('drops a stale redirect leading away from the destination', async () => {
    await run({ fromPath: '/c/old', toPath: '/c/new' })

    expect(tx.redirect.deleteMany).toHaveBeenCalledWith({ where: { fromPath: '/c/new' } })
  })

  it('clears the destination before repointing, so a swap-back cannot self-loop', async () => {
    await run({ fromPath: '/c/b', toPath: '/c/a' })

    const deleteOrder = tx.redirect.deleteMany.mock.invocationCallOrder[0]!
    const updateOrder = tx.redirect.updateMany.mock.invocationCallOrder[0]!
    const upsertOrder = tx.redirect.upsert.mock.invocationCallOrder[0]!
    expect(deleteOrder).toBeLessThan(updateOrder)
    expect(updateOrder).toBeLessThan(upsertOrder)
  })

  it('reactivates and repoints a row that already redirected away from the old path', async () => {
    await run({ fromPath: '/c/old', toPath: '/c/new', notes: 'renamed' })

    const arg = tx.redirect.upsert.mock.calls[0]![0] as {
      update: { toPath: string; isActive: boolean; notes: string | null }
    }
    expect(arg.update.toPath).toBe('/c/new')
    expect(arg.update.isActive).toBe(true)
    expect(arg.update.notes).toBe('renamed')
  })

  it('honours an explicit status code', async () => {
    await run({ fromPath: '/c/old', toPath: '/c/new', statusCode: 302 })

    const arg = tx.redirect.upsert.mock.calls[0]![0] as { create: { statusCode: number } }
    expect(arg.create.statusCode).toBe(302)
  })
})
