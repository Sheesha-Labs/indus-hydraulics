import { inngest } from './client'
import { scraperJobRun } from './scraperJob'
import { db } from '@indus/db'
import {
  assertTransition,
  scoreEntity,
  signQuoteAccessToken,
  type SeoEntityType,
} from '@indus/domain'
import {
  findRetryableEmailIds,
  renderQuoteExpired,
  renderQuoteExpiryReminder,
  retryFailedEmail,
  sendEmail,
} from '@indus/email'

/**
 * Nightly recompute of `SeoHealthScore` rows. The site-wide health
 * dashboard at /seo/health computes scores live today (live computation
 * is fast at this catalogue size), but persisting nightly snapshots
 * unlocks trend charts (this week vs last week) and avoids the
 * dashboard having to re-score every URL on every page load once the
 * catalogue grows past a few thousand entities.
 *
 * Steps are explicit so a partial run can resume — Inngest retries on
 * step boundaries, not on the whole function.
 */
const SEO_SELECT = {
  id: true,
  slug: true,
  seoTitle: true,
  seoDescription: true,
  focusKeyword: true,
  canonicalUrl: true,
  robotsIndex: true,
  ogImageMediaId: true,
  excludeFromSitemap: true,
} as const

export const recomputeHealthScores = inngest.createFunction(
  { id: 'seo.health.recompute_all', concurrency: 1 },
  { cron: '0 4 * * *' }, // 04:00 every day, server time
  async ({ step }) => {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
      /\/$/,
      '',
    )
    const seoSetting = await step.run('load-seo-setting', () =>
      db.seoSetting.findFirst({ select: { ogDefaultImageId: true } }),
    )
    const defaultOgPresent = !!seoSetting?.ogDefaultImageId

    const products = await step.run('fetch-products', () =>
      db.product.findMany({
        select: { ...SEO_SELECT, title: true, status: true },
      }),
    )
    const categories = await step.run('fetch-categories', () =>
      db.category.findMany({ select: { ...SEO_SELECT, name: true, isPublished: true } }),
    )
    const brands = await step.run('fetch-brands', () =>
      db.brand.findMany({ select: { ...SEO_SELECT, name: true, isPublished: true } }),
    )
    const industries = await step.run('fetch-industries', () =>
      db.industry.findMany({ select: { ...SEO_SELECT, name: true, isPublished: true } }),
    )
    const blogPosts = await step.run('fetch-blog-posts', () =>
      db.blogPost.findMany({ select: { ...SEO_SELECT, title: true, isPublished: true } }),
    )
    const cmsPages = await step.run('fetch-cms-pages', () =>
      db.cmsPage.findMany({ select: { ...SEO_SELECT, title: true, isPublished: true } }),
    )

    const upserts: Array<{ entityType: SeoEntityType; entityId: string; score: number; breakdown: unknown }> = []
    for (const p of products) {
      const r = scoreEntity({
        title: p.seoTitle ?? p.title,
        description: p.seoDescription,
        focusKeyword: p.focusKeyword,
        url: `/${p.slug}`,
        hasStructuredData: true,
        isIndexable: p.robotsIndex && p.status === 'active' && !p.excludeFromSitemap,
        canonicalCorrect: !p.canonicalUrl || p.canonicalUrl === `${baseUrl}/p/${p.slug}`,
        ogComplete: !!p.ogImageMediaId || defaultOgPresent,
      })
      upserts.push({ entityType: 'product', entityId: p.id, score: r.score, breakdown: r.breakdown })
    }
    pushSimpleScores(upserts, categories, 'category', baseUrl, '/c/', defaultOgPresent)
    pushSimpleScores(upserts, brands, 'brand', baseUrl, '/brands/', defaultOgPresent)
    pushSimpleScores(upserts, industries, 'industry', baseUrl, '/industries/', defaultOgPresent)
    pushSimpleScores(upserts, blogPosts, 'blog_post', baseUrl, '/blog/', defaultOgPresent)
    pushSimpleScores(upserts, cmsPages, 'cms_page', baseUrl, '/', defaultOgPresent, false)

    // Chunk to keep individual transactions sane on large catalogues.
    const CHUNK = 500
    for (let i = 0; i < upserts.length; i += CHUNK) {
      const slice = upserts.slice(i, i + CHUNK)
      await step.run(`upsert-${i / CHUNK}`, async () => {
        for (const row of slice) {
          await db.seoHealthScore.upsert({
            where: { entityType_entityId: { entityType: row.entityType, entityId: row.entityId } },
            create: {
              entityType: row.entityType,
              entityId: row.entityId,
              score: row.score,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              breakdown: row.breakdown as any,
              computedAt: new Date(),
            },
            update: {
              score: row.score,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              breakdown: row.breakdown as any,
              computedAt: new Date(),
            },
          })
        }
      })
    }

    return { scored: upserts.length }
  },
)

type SimpleEntity = {
  id: string
  slug: string
  name?: string
  title?: string
  seoTitle: string | null
  seoDescription: string | null
  focusKeyword: string | null
  canonicalUrl: string | null
  robotsIndex: boolean
  ogImageMediaId: string | null
  excludeFromSitemap: boolean
  isPublished: boolean
}

function pushSimpleScores(
  out: Array<{ entityType: SeoEntityType; entityId: string; score: number; breakdown: unknown }>,
  list: SimpleEntity[],
  entityType: SeoEntityType,
  baseUrl: string,
  pathPrefix: string,
  defaultOgPresent: boolean,
  hasStructuredData = true,
) {
  for (const e of list) {
    const r = scoreEntity({
      title: e.seoTitle ?? e.name ?? e.title ?? '',
      description: e.seoDescription,
      focusKeyword: e.focusKeyword,
      url: `/${e.slug}`,
      hasStructuredData,
      isIndexable: e.robotsIndex && e.isPublished && !e.excludeFromSitemap,
      canonicalCorrect: !e.canonicalUrl || e.canonicalUrl === `${baseUrl}${pathPrefix}${e.slug}`,
      ogComplete: !!e.ogImageMediaId || defaultOgPresent,
    })
    out.push({ entityType, entityId: e.id, score: r.score, breakdown: r.breakdown })
  }
}

/**
 * Daily reminder for quotes nearing expiry. Finds Quotes whose `expiresAt`
 * falls within the next REMINDER_WINDOW_DAYS, where the parent RFQ is
 * still in `quote_sent` (not yet accepted, declined, or expired) and we
 * haven't already sent a reminder for the same quote in the last 24 hours.
 *
 * Runs at 08:00 UTC every day. Tunable cron + window if reminder frequency
 * needs to change. Idempotent within the day — re-running will skip quotes
 * that already received a reminder.
 *
 * Steps are explicit so a partial failure can resume — Inngest retries on
 * step boundaries, not on the whole function.
 */
const REMINDER_WINDOW_DAYS = 3
const REMINDER_DEDUPE_HOURS = 24

export const quoteExpiryReminder = inngest.createFunction(
  { id: 'quote.expiry-reminder', concurrency: 1 },
  { cron: '0 8 * * *' },
  async ({ step }) => {
    const now = new Date()
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    const dedupeFrom = new Date(now.getTime() - REMINDER_DEDUPE_HOURS * 60 * 60 * 1000)

    const branding = await step.run('load-branding', () =>
      db.storeSettings.findFirst(),
    )
    const fromEmail = branding?.quoteFromEmail ?? 'sales@indushydraulics.me'
    const fromName = branding?.quoteFromName ?? null
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    )

    const expiring = await step.run('find-expiring-quotes', () =>
      db.quote.findMany({
        where: {
          expiresAt: { gte: now, lte: windowEnd },
          acceptedAt: null,
          declinedAt: null,
          rfq: { status: 'quote_sent' },
        },
        include: {
          rfq: {
            include: {
              submittedBy: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
        orderBy: { expiresAt: 'asc' },
      }),
    )

    let sent = 0
    let skipped = 0
    let unaddressable = 0

    for (const quote of expiring) {
      // step.run JSON-serialises return values, so date fields come back as
      // ISO strings. Re-hydrate before we do any date math.
      const expiresAt = new Date(quote.expiresAt as unknown as string)

      const submittedBy = quote.rfq.submittedBy
      if (!submittedBy?.email) {
        unaddressable++
        continue
      }

      const recentReminder = await step.run(`dedupe-${quote.id}`, () =>
        db.sentEmail.findFirst({
          where: {
            kind: 'quote_expiry_reminder',
            quoteId: quote.id,
            attemptedAt: { gte: dedupeFrom },
          },
          select: { id: true },
        }),
      )
      if (recentReminder) {
        skipped++
        continue
      }

      const customerName =
        `${submittedBy.firstName} ${submittedBy.lastName}`.trim() || submittedBy.email
      const accessToken = signQuoteAccessToken(quote.rfq.code)
      const viewUrl = `${baseUrl}/quote/${quote.rfq.code}?token=${encodeURIComponent(accessToken)}`
      const expiresOnDisplay = expiresAt.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      const daysLeft = Math.max(
        0,
        Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
      )

      const email = renderQuoteExpiryReminder({
        customerName,
        quoteCode: quote.code,
        ...(quote.revision > 1 ? { revisionLabel: `R${quote.revision}` } : {}),
        expiresOnDisplay,
        daysLeft,
        viewUrl,
        branding: {
          legalName: branding?.legalName ?? 'Indus Hydraulic Power Trading LLC',
          vatTrn: branding?.vatTrn ?? null,
          registeredAddressLines:
            (branding?.registeredAddressLines as string[] | null) ?? [],
          signatureName: branding?.signatureName ?? null,
          signatureTitle: branding?.signatureTitle ?? null,
          signaturePhone: branding?.signaturePhone ?? null,
          signatureEmail: branding?.signatureEmail ?? null,
        },
      })

      await step.run(`send-${quote.id}`, () =>
        sendEmail({
          kind: 'quote_expiry_reminder',
          to: [submittedBy.email],
          subject: email.subject,
          html: email.html,
          fromEmail,
          ...(fromName ? { fromName } : {}),
          replyTo: fromEmail,
          quoteId: quote.id,
        }),
      )
      sent++
    }

    return { checked: expiring.length, sent, skipped, unaddressable }
  },
)

/**
 * Hourly job that flips RFQs in `quote_sent` whose latest quote has passed
 * its `expiresAt` to status `expired`. Closes the loop documented in
 * CLAUDE.md §7 ("quote_sent → expired automated, when quote_expires_at
 * passes") — without this job an expired quote stays visible to the
 * engineer queue forever.
 *
 * Race-safety: the per-quote update uses `updateMany` with a compound
 * `where: { rfqId, status: 'quote_sent' }`. If the engineer manually
 * marked the RFQ accepted/declined between the find and the update,
 * `count === 0` and we skip the email + activity log. State machine
 * transition is validated up front so the rule lives in one place.
 *
 * Idempotency: the customer's `quote_expired` notification is deduped
 * against `SentEmail.kind = 'quote_expired'` for the same quote — re-runs
 * skip already-notified expirations even if the cron fires twice.
 */
export const quoteAutoExpiry = inngest.createFunction(
  { id: 'quote.auto-expiry', concurrency: 1 },
  { cron: '0 * * * *' },
  async ({ step }) => {
    const now = new Date()

    const branding = await step.run('load-branding', () =>
      db.storeSettings.findFirst(),
    )
    const fromEmail = branding?.quoteFromEmail ?? 'sales@indushydraulics.me'
    const fromName = branding?.quoteFromName ?? null
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    )

    const expired = await step.run('find-expired-quotes', () =>
      db.quote.findMany({
        where: {
          expiresAt: { lt: now },
          acceptedAt: null,
          declinedAt: null,
          rfq: { status: 'quote_sent' },
        },
        include: {
          rfq: {
            include: {
              submittedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  accountId: true,
                },
              },
            },
          },
        },
      }),
    )

    let transitioned = 0
    let alreadyMoved = 0
    let emailed = 0
    let unaddressable = 0
    let alreadyEmailed = 0

    // assertTransition is a sanity check — if `quote_sent → expired` is
    // ever removed from the state machine this loop fails fast rather
    // than silently advancing RFQs into an invalid state.
    assertTransition('quote_sent', 'expired')

    for (const quote of expired) {
      const result = await step.run(`expire-${quote.id}`, () =>
        db.rfq.updateMany({
          where: { id: quote.rfqId, status: 'quote_sent' },
          data: { status: 'expired' },
        }),
      )

      if (result.count === 0) {
        alreadyMoved++
        continue
      }
      transitioned++

      await step.run(`activity-${quote.id}`, () =>
        db.accountActivity.create({
          data: {
            accountId: quote.rfq.accountId,
            actorType: 'system',
            actorId: 'inngest:quote.auto-expiry',
            verb: 'quote_expired',
            payload: {
              rfqId: quote.rfqId,
              rfqCode: quote.rfq.code,
              quoteId: quote.id,
              quoteCode: quote.code,
              expiresAt: quote.expiresAt,
            },
          },
        }),
      )

      const submittedBy = quote.rfq.submittedBy
      if (!submittedBy?.email) {
        unaddressable++
        continue
      }

      const recentExpired = await step.run(`dedupe-${quote.id}`, () =>
        db.sentEmail.findFirst({
          where: { kind: 'quote_expired', quoteId: quote.id },
          select: { id: true },
        }),
      )
      if (recentExpired) {
        alreadyEmailed++
        continue
      }

      const customerName =
        `${submittedBy.firstName} ${submittedBy.lastName}`.trim() || submittedBy.email
      const accessToken = signQuoteAccessToken(quote.rfq.code)
      const rfqUrl = `${baseUrl}/quote/${quote.rfq.code}?token=${encodeURIComponent(accessToken)}`
      const expiredOnDisplay = new Date(
        quote.expiresAt as unknown as string,
      ).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })

      const email = renderQuoteExpired({
        customerName,
        quoteCode: quote.code,
        ...(quote.revision > 1 ? { revisionLabel: `R${quote.revision}` } : {}),
        expiredOnDisplay,
        rfqUrl,
        branding: {
          legalName: branding?.legalName ?? 'Indus Hydraulic Power Trading LLC',
          vatTrn: branding?.vatTrn ?? null,
          registeredAddressLines:
            (branding?.registeredAddressLines as string[] | null) ?? [],
          signatureName: branding?.signatureName ?? null,
          signatureTitle: branding?.signatureTitle ?? null,
          signaturePhone: branding?.signaturePhone ?? null,
          signatureEmail: branding?.signatureEmail ?? null,
        },
      })

      await step.run(`send-${quote.id}`, () =>
        sendEmail({
          kind: 'quote_expired',
          to: [submittedBy.email],
          subject: email.subject,
          html: email.html,
          fromEmail,
          ...(fromName ? { fromName } : {}),
          replyTo: fromEmail,
          quoteId: quote.id,
        }),
      )
      emailed++
    }

    return {
      checked: expired.length,
      transitioned,
      alreadyMoved,
      emailed,
      unaddressable,
      alreadyEmailed,
    }
  },
)

/**
 * Retry queue for failed transactional emails. Runs every 15 minutes.
 *
 * Each `sendEmail` call stashes a serialisable payload on
 * `SentEmail.payload`; when Resend rejects the send (rate-limit,
 * transient 5xx, DNS blip) the row is left at `status='failed'` and
 * picked up here.
 *
 * Backoff schedule lives in `@indus/email`'s `RETRY_BACKOFF_MS`:
 * 5min → 30min → 3hr, then `dead_letter`. Each row is retried in its
 * own `step.run` so an Inngest retry on a single row can resume the
 * batch without re-attempting earlier successes.
 */
export const retryFailedEmails = inngest.createFunction(
  { id: 'email.retry-failed', concurrency: 1 },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    const ids = await step.run('find-retryable', () => findRetryableEmailIds(50))

    let retried = 0
    let succeeded = 0
    let stillFailing = 0
    let deadLettered = 0
    let skipped = 0

    for (const id of ids) {
      const outcome = await step.run(`retry-${id}`, () => retryFailedEmail(id))
      if (!outcome) {
        skipped++
        continue
      }
      retried++
      if (outcome.ok) {
        succeeded++
      } else if (outcome.status === 'dead_letter') {
        deadLettered++
      } else {
        stillFailing++
      }
    }

    return { checked: ids.length, retried, succeeded, stillFailing, deadLettered, skipped }
  },
)

export const allFunctions = [
  recomputeHealthScores,
  quoteExpiryReminder,
  quoteAutoExpiry,
  retryFailedEmails,
  scraperJobRun,
]
