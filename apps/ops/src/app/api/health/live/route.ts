// Liveness only. Touches nothing (no database, no env parse, no Sentry), so a
// database blip never restarts or alerts on a healthy deployment.
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ ok: true, at: new Date().toISOString() })
}
