/**
 * Is this user agent a crawler? Used to keep crawlers out of Vercel Web
 * Analytics and Speed Insights — client-side, in `beforeSend`.
 *
 * WHY (2026-11-20). Googlebot renders pages with JavaScript, so it runs the
 * analytics script like a visitor: 2,955 `/v1/view` beacons from Googlebot in
 * 30 days, each a request Google spent on this host instead of on a page, and
 * each a "visit" in a dashboard for a site with little human traffic.
 *
 * An explicit list plus the `(compatible; …bot` convention, rather than a bare
 * /bot/ — that also matches real phones (the CUBOT Android range).
 */
const BOT_UA =
  /googlebot|google-inspectiontool|googleother|storebot-google|adsbot|mediapartners-google|apis-google|feedfetcher|bingbot|bingpreview|adidxbot|slurp|duckduckbot|baiduspider|yandex(bot|images|metrika)|applebot|petalbot|ahrefsbot|semrushbot|mj12bot|dotbot|rogerbot|screaming frog|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-user|anthropic-ai|perplexitybot|ccbot|bytespider|amazonbot|facebookexternalhit|meta-externalagent|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|headlesschrome|chrome-lighthouse|crawler|spider|compatible;[^)]*bot/i

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  return Boolean(userAgent) && BOT_UA.test(userAgent as string)
}

/** True in the browser when the page is being driven by a crawler or automation. */
export function isBotClient(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.webdriver === true || isBotUserAgent(navigator.userAgent)
}
