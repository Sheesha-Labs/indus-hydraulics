import { NextResponse } from 'next/server'

/**
 * Liveness: is this process able to answer at all?
 *
 * Deliberately touches nothing. The sibling `/api/health` queries the database,
 * which makes it a *readiness* check and the wrong thing to point a container
 * probe or a deploy gate at — a Supabase blip returns 503, the orchestrator
 * concludes the app is dead, and it restarts a perfectly healthy process. Worse
 * during a deploy: the new release is rejected and rolled back because a remote
 * service hiccuped.
 *
 * Use this one for "has the new release come up yet" and for the restart policy.
 * Use `/api/health` for monitoring and alerting, where a database problem SHOULD
 * show up.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function GET() {
  return NextResponse.json(
    { status: 'ok' },
    { headers: { 'cache-control': 'no-store' } },
  )
}
