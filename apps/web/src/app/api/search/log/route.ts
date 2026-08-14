import { NextResponse } from 'next/server'
import { db } from '@indus/db'
import { normaliseQuery } from '@indus/domain'

/**
 * Search query logger. Receives one of two payload shapes:
 *
 *   { query, resultsCount, usedFallback?, sessionId? }
 *     → fresh search; insert a SearchQueryLog row.
 *
 *   { query, clickedSku, sessionId? }
 *     → result click-through; updates the most recent matching log row
 *       with `clickedSku` + `clickedAt`. We don't insert if there's no
 *       matching row — the click came from somewhere odd (history,
 *       direct link) and we'd rather miss it than fabricate a query log.
 *
 * All writes are best-effort; the response is always 200 unless input
 * validation fails. The page doesn't block on this endpoint.
 */
export const runtime = 'nodejs'

export async function POST(req: Request) {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!raw || typeof raw !== 'object') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const body = raw as Record<string, unknown>
  const query = typeof body.query === 'string' ? body.query.trim() : ''
  if (!query || query.length > 200) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 80) : null

  if (typeof body.clickedSku === 'string' && body.clickedSku.length > 0) {
    const clickedSku = body.clickedSku.slice(0, 64)
    // Only update the most recent matching row in this session — keeps
    // click-through tightly coupled to the query that produced it.
    const recent = await db.searchQueryLog.findFirst({
      where: {
        normalized: normaliseQuery(query),
        sessionId,
        clickedSku: null,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60) }, // last hour
      },
      orderBy: { createdAt: 'desc' },
    })
    if (recent) {
      await db.searchQueryLog.update({
        where: { id: recent.id },
        data: { clickedSku, clickedAt: new Date() },
      })
    }
    return NextResponse.json({ ok: true })
  }

  if (typeof body.resultsCount === 'number') {
    await db.searchQueryLog.create({
      data: {
        query,
        normalized: normaliseQuery(query),
        resultsCount: Math.max(0, Math.floor(body.resultsCount)),
        sessionId,
      },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false }, { status: 400 })
}
