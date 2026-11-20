'use client'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'
import { isBotClient } from '../lib/bot-user-agent'

/**
 * Vercel Web Analytics and Speed Insights with crawlers filtered out.
 *
 * A client boundary only because `beforeSend` is a function, which a Server
 * Component cannot pass as a prop. The scripts still load for a crawler (that
 * is decided before any JavaScript runs); what `beforeSend` stops is the
 * beacon — `/v1/view` and the vitals POST — which is the request Googlebot was
 * spending crawl budget on. See `lib/bot-user-agent.ts`.
 */
export default function VercelAnalytics() {
  return <Analytics beforeSend={(event) => (isBotClient() ? null : event)} />
}

export function SpeedInsights() {
  return <VercelSpeedInsights beforeSend={(event) => (isBotClient() ? null : event)} />
}
