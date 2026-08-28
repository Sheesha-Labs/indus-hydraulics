/**
 * Which deployment this is, without asking the hosting platform.
 *
 * `VERCEL_ENV` used to answer this. It has one property that does not survive a
 * move: it is *absent* off Vercel, and the three call sites were written as
 * `!== 'production'`, so absent read as "not production" and turned reviewer
 * diagnostics ON. On a Hetzner box that publishes an internal audit strip to
 * every visitor of all 127 market pages.
 *
 * So the polarity is inverted here: nothing is shown unless something is
 * explicitly set. An unset environment is production, because an unset
 * environment is what a misconfigured server looks like.
 */

/**
 * Reviewer aids — the markets audit strip and anything else that reports
 * internal state — belong on previews and on a developer's machine.
 *
 * `APP_ENV=preview` is the opt-in. `NODE_ENV` alone cannot be the signal: a
 * preview build runs with `NODE_ENV=production`, which is exactly the
 * deployment where someone is reviewing a new market.
 */
export function showsReviewerAids(): boolean {
  if (process.env.APP_ENV === 'preview') return true
  return process.env.NODE_ENV === 'development'
}
