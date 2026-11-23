import { NextResponse, type NextRequest } from 'next/server'
import { AccessError, requireOpsUser } from '../../../../../lib/access'
import { callbackRedirect, finishConnect } from '../../../../../server/gmail/connect'

/**
 * Google's redirect after the mailbox consent screen (S04-T02, board 86 step 3 → 4). An auth route: it may touch
 * the database (unlike the push endpoint). It never puts a token or an email address in the URL it redirects
 * to: only the outcome code, the role and the mailbox id.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const base = request.nextUrl.origin
  let userId: string | null = null
  try {
    userId = (await requireOpsUser()).id
  } catch (error) {
    if (!(error instanceof AccessError)) throw error
    return NextResponse.redirect(new URL('/sign-in?next=%2Fsettings%2Fmailboxes', base), 303)
  }
  const q = request.nextUrl.searchParams
  const result = await finishConnect(
    { code: q.get('code'), state: q.get('state'), error: q.get('error') },
    userId
  )
  const response = NextResponse.redirect(new URL(callbackRedirect(result), base), 303)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
