import { createServer } from 'node:http'

/**
 * A local stand-in for Inngest's event API, for e2e on a machine without the Inngest dev server: every event
 * is accepted and dropped, so code that must queue background work (a send, a redraft) gets on with the
 * request. Start it, then run `next dev` with INNGEST_DEV=http://localhost:8289.
 *
 *   bun apps/ops/tests/support/inngest-stub.ts
 */
const port = Number(process.env.INNGEST_STUB_PORT ?? 8289)
let seen = 0

createServer((req, res) => {
  let body = ''
  req.on('data', (chunk: Buffer) => {
    body += chunk.toString()
  })
  req.on('end', () => {
    res.setHeader('content-type', 'application/json')
    if (req.method !== 'POST') {
      res.end(JSON.stringify({ ok: true, seen }))
      return
    }
    const n = body.trim().startsWith('[') ? (JSON.parse(body) as unknown[]).length : 1
    seen += n
    res.end(
      JSON.stringify({
        ids: Array.from({ length: n }, (_, i) => `stub-${seen - n + i}`),
        status: 200,
      })
    )
  })
}).listen(port, () => {
  console.log(`inngest stub on :${port}`)
})
