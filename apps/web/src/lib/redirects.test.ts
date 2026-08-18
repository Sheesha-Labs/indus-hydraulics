import { describe, it, expect, vi, beforeEach } from 'vitest'

const findMany = vi.fn()
const update = vi.fn()

vi.mock('@indus/db', () => ({
  db: {
    redirect: {
      findMany: (...args: unknown[]) => findMany(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}))

const { findRedirect, recordRedirectHit, normalisePath, __resetRedirectCache } = await import(
  './redirects'
)

const ROW = { id: 'r1', fromPath: '/p/old', toPath: '/p/new', statusCode: 301 }

beforeEach(() => {
  findMany.mockReset()
  update.mockReset()
  findMany.mockResolvedValue([ROW])
  update.mockResolvedValue({})
  __resetRedirectCache()
})

describe('normalisePath', () => {
  it('drops query and hash', () => {
    expect(normalisePath('/p/old?utm=x')).toBe('/p/old')
    expect(normalisePath('/p/old#frag')).toBe('/p/old')
  })

  it('drops a trailing slash but never the root', () => {
    expect(normalisePath('/p/old/')).toBe('/p/old')
    expect(normalisePath('/')).toBe('/')
  })
})

describe('findRedirect', () => {
  it('returns null without querying when the path is unusable', async () => {
    expect(await findRedirect(null)).toBeNull()
    expect(await findRedirect('')).toBeNull()
    expect(await findRedirect('https://evil.example.com')).toBeNull()
    expect(findMany).not.toHaveBeenCalled()
  })

  it('loads only active rows', async () => {
    await findRedirect('/p/old')
    expect(findMany.mock.calls[0]?.[0]).toMatchObject({ where: { isActive: true } })
  })

  it('matches a stored redirect', async () => {
    expect(await findRedirect('/p/old')).toEqual({
      id: 'r1',
      toPath: '/p/new',
      statusCode: 301,
    })
  })

  it('matches regardless of trailing slash or query', async () => {
    expect(await findRedirect('/p/old/')).toMatchObject({ toPath: '/p/new' })
    expect(await findRedirect('/p/old?utm=spring')).toMatchObject({ toPath: '/p/new' })
  })

  it('returns null for a path with no row', async () => {
    expect(await findRedirect('/p/unrelated')).toBeNull()
  })

  it('drops a row that points at itself', async () => {
    findMany.mockResolvedValue([{ ...ROW, toPath: '/p/old' }])
    expect(await findRedirect('/p/old')).toBeNull()
  })

  it('drops a self-reference that differs only by trailing slash', async () => {
    findMany.mockResolvedValue([{ ...ROW, toPath: '/p/old/' }])
    expect(await findRedirect('/p/old')).toBeNull()
  })

  it('ignores a row whose fromPath is not rooted', async () => {
    findMany.mockResolvedValue([{ ...ROW, fromPath: 'p/old' }])
    expect(await findRedirect('/p/old')).toBeNull()
  })

  it('caches — a second lookup does not re-query', async () => {
    await findRedirect('/p/old')
    await findRedirect('/p/old')
    expect(findMany).toHaveBeenCalledTimes(1)
  })

  it('collapses concurrent refreshes into one query', async () => {
    await Promise.all([findRedirect('/p/old'), findRedirect('/p/old'), findRedirect('/p/old')])
    expect(findMany).toHaveBeenCalledTimes(1)
  })

  it('survives a database failure rather than breaking every request', async () => {
    findMany.mockRejectedValue(new Error('db down'))
    expect(await findRedirect('/p/old')).toBeNull()
  })
})

describe('recordRedirectHit', () => {
  it('increments the counter and stamps the time', async () => {
    recordRedirectHit('r1')
    await Promise.resolve()
    expect(update.mock.calls[0]?.[0]).toMatchObject({
      where: { id: 'r1' },
      data: { hits: { increment: 1 } },
    })
  })

  it('swallows a failure — counting must never break a working redirect', async () => {
    update.mockRejectedValue(new Error('db down'))
    expect(() => recordRedirectHit('r1')).not.toThrow()
    await Promise.resolve()
  })
})
