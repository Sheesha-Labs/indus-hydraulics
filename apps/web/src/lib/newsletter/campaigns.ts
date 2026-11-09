import 'server-only'
import { db, Prisma } from '@indus/db'
import { sendEmail } from '@indus/email'

import { loadEmailBranding } from '../email-branding'
import { BASE_URL } from '../seo'
import { emptyDesign, normaliseDesign } from './blocks/document'
import {
  campaignProblems,
  campaignRecordRefs,
  countMissingRecords,
  renderCampaign,
  type CampaignContent,
  type CampaignDraft,
  type RecipientKind,
} from './campaign'
import { resolveRecords } from './records'
import { DEFAULT_SENDER_SETTINGS, resolveSender, type NewsletterSender, type NewsletterSenderSettings } from './sender'

/**
 * Campaigns on the server: the sender, the brand, rendering (preview, test,
 * and — in Phase 4 — the real thing), the send gate with the data it needs.
 */

export async function loadSenderSettings(): Promise<NewsletterSenderSettings> {
  const row = await db.newsletterSettings.findUnique({ where: { id: 'default' } })
  return row ? { fromName: row.fromName, fromLocal: row.fromLocal, replyTo: row.replyTo } : DEFAULT_SENDER_SETTINGS
}

export async function loadSender(): Promise<NewsletterSender> {
  return resolveSender(await loadSenderSettings())
}

export async function campaignBrand() {
  const b = await loadEmailBranding()
  return { legalName: b.legalName, addressLines: b.registeredAddressLines, logoUrl: null }
}

/** The send gate with live data: missing records, deleted lists. */
export async function campaignProblemsLive(draft: CampaignDraft): Promise<Record<string, string>> {
  const [records, listsFound] = await Promise.all([
    resolveRecords(campaignRecordRefs(draft)),
    draft.listIds.length ? db.newsletterList.count({ where: { id: { in: draft.listIds } } }) : Promise.resolve(0),
  ])
  return campaignProblems(draft, { missingRecords: countMissingRecords(draft, records), listsFound })
}

/** Render for the composer's preview: live records, a dead unsubscribe link. */
export async function renderPreview(content: CampaignContent, recipient: RecipientKind = 'subscriber') {
  const [records, brand] = await Promise.all([resolveRecords(campaignRecordRefs(content)), campaignBrand()])
  return {
    ...renderCampaign(content, { siteUrl: BASE_URL, brand, records, unsubscribeUrl: null, recipient }),
    missingRecords: countMissingRecords(content, records),
  }
}

export type TestSendOutcome = { ok: true } | { ok: false; error: string }

/**
 * One copy to a member of staff, `[Test]` in front of the subject and the
 * unsubscribe link dead (it would otherwise unsubscribe nobody — or worse,
 * the tester). Sent from the real newsletter sender, so it lands the way the
 * campaign will.
 */
export async function sendTest(campaignId: string, content: CampaignContent, to: string): Promise<TestSendOutcome> {
  const [rendered, sender] = await Promise.all([renderPreview(content), loadSender()])
  const r = await sendEmail({
    kind: 'newsletter_test',
    to: [to],
    fromEmail: sender.fromEmail,
    fromName: sender.fromName,
    replyTo: sender.replyTo,
    subject: `[Test] ${rendered.subject}`,
    html: rendered.html,
    text: rendered.text,
  })
  if (!r.ok) return { ok: false, error: r.error ?? 'The test email could not be sent.' }
  await db.newsletterCampaign.update({ where: { id: campaignId }, data: { testSentAt: new Date() } })
  return { ok: true }
}

/** A draft from a campaign row, in the shape the gate and renderer take. */
export function draftOf(row: {
  subject: string
  preheader: string
  format: string
  design: Prisma.JsonValue | null
  bodyHtml: string
  audience: string
  listIds: string[]
}): CampaignDraft {
  return {
    subject: row.subject,
    preheader: row.preheader,
    format: row.format === 'rich' ? 'rich' : 'blocks',
    design: row.format === 'rich' ? row.design : normaliseDesign(row.design ?? emptyDesign()),
    bodyHtml: row.bodyHtml,
    audience: row.audience === 'none' ? 'none' : 'all',
    listIds: row.listIds,
  }
}

/**
 * How many people a campaign would reach right now, once each, suppressions out.
 *
 * Raw SQL on purpose (CLAUDE.md §5.3): it is a UNION across two tables plus
 * the database's own `newsletter_email_hash()`, the same rule the Phase 4
 * snapshot applies. Done through Prisma it would mean loading every address
 * into Node to hash and de-duplicate them. Parameters are bound, not spliced.
 */
export async function audienceSize(audience: 'all' | 'none', listIds: string[]): Promise<number> {
  const rows = await db.$queryRaw<{ n: bigint }[]>(Prisma.sql`
    WITH people AS (
      SELECT lower(s.email) AS email
        FROM newsletter_subscribers s
       WHERE ${audience} = 'all' AND s.status = 'confirmed'
      UNION
      SELECT c.email
        FROM newsletter_list_contacts c
       WHERE c."listId" = ANY(${listIds}::text[]) AND c.status = 'active'
    )
    SELECT count(*) AS n FROM people p
     WHERE NOT EXISTS (
       SELECT 1 FROM newsletter_suppressions x WHERE x."emailHash" = newsletter_email_hash(p.email)
     )`)
  return Number(rows[0]?.n ?? 0)
}
