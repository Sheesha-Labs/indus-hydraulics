import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * S05-T07 · board-96 (out of office, bounce, phishing and not business) and board-97 (mail states: a
 * password-protected file, a file stored but not opened, another language, a huge thread). Fixture mail on
 * example.test, created here and removed at the end; nothing talks to Google and nothing is sent.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const PURCHASE = 'e2e-s05b-purchase@example.test'
const ids: Record<string, string> = {}
const stamp = Date.now().toString(36)

async function blocking(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

async function thread(subject: string, minutesAgo: number): Promise<string> {
  const t = await db.mailThread.create({
    data: {
      mailboxId: ids.purchase!,
      gmailThreadId: `e2e-s05b-${subject.replace(/\W+/g, '-')}-${stamp}`,
      subject,
      lastMessageAt: new Date(Date.now() - minutesAgo * 60_000),
    },
    select: { id: true },
  })
  return t.id
}

async function message(
  threadId: string,
  over: {
    from: string
    fromName: string
    subject: string
    body: string
    minutesAgo: number
    classification: string
    flags?: Record<string, unknown>
    summaryEn?: string
    language?: string
    outOfOfficeUntil?: Date
    attachments?: Array<{ filename: string; extractionStatus: string; extractionNote?: string }>
    key: string
  }
): Promise<string> {
  const at = new Date(Date.now() - over.minutesAgo * 60_000)
  const m = await db.mailMessage.create({
    data: {
      mailboxId: ids.purchase!,
      threadId,
      gmailMessageId: `e2e-s05b-${over.key}-${stamp}`,
      rfcMessageId: `e2e-s05b-${over.key}-${stamp}@example.test`,
      direction: 'inbound',
      fromAddress: over.from,
      fromName: over.fromName,
      toAddresses: [PURCHASE],
      ccAddresses: [],
      subject: over.subject,
      bodyText: over.body,
      sentAt: at,
      receivedAt: at,
      labelsApplied: [],
      origin: 'live',
      classification: over.classification as never,
      confidence: 'sure',
      handledState: 'handled',
      ...(over.flags ? { flags: over.flags as never } : {}),
      ...(over.summaryEn ? { summaryEn: over.summaryEn, language: over.language ?? null } : {}),
      ...(over.outOfOfficeUntil ? { outOfOfficeUntil: over.outOfOfficeUntil } : {}),
      ...(over.attachments
        ? {
            attachments: {
              create: over.attachments.map((a, i) => ({
                gmailAttachmentId: `e2e-s05b-${over.key}-${i}`,
                filename: a.filename,
                extractionStatus: a.extractionStatus as never,
                extractionNote: a.extractionNote ?? null,
              })),
            },
          }
        : {}),
    },
    select: { id: true },
  })
  return m.id
}

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s05b-' } } })
  const purchase = await db.mailbox.create({
    data: {
      address: PURCHASE,
      displayName: 'Purchase Example',
      role: 'supplier',
      status: 'live',
      scopes: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.modify'],
      canRead: true,
      canLabel: true,
      canSend: true,
    },
    select: { id: true },
  })
  ids.purchase = purchase.id

  // Board 96 · out of office, with a stand-in and a waiting resend proposal.
  ids.ooo = await thread('Automatic reply: RE: RFQ ball valves', 5)
  const until = new Date(Date.now() + 10 * 86_400_000)
  ids.oooMsg = await message(ids.ooo, {
    from: 'away@valve-maker.example',
    fromName: 'Away Person',
    subject: 'Automatic reply: RE: RFQ ball valves',
    body: 'I am out of the office. For urgent matters please contact Alex Example, alex@valve-maker.example.',
    minutesAgo: 5,
    classification: 'auto_reply',
    flags: {
      autoReply: { kind: 'out_of_office' },
      ooo: {
        returnDate: until.toISOString().slice(0, 10),
        alternate: { name: 'Alex Example', email: 'alex@valve-maker.example' },
      },
    },
    outOfOfficeUntil: until,
    key: 'ooo',
  })
  ids.resendRef = `A-E2E-S05B-${stamp}`
  await db.assistantAction.create({
    data: {
      ref: ids.resendRef,
      actionKey: 'resend_alternate_contact',
      levelAtTime: 'draft_and_ask',
      guardrails: ['first_contact'],
      subjectType: 'mail_message',
      subjectId: ids.oooMsg,
      headline: 'Send our email to Alex Example, named in the auto-reply?',
      reasons: [],
      state: 'proposed',
      surface: 'review',
      options: [
        { key: 'send', label: 'Send to Alex', consequence: '' },
        { key: 'wait', label: 'Wait for Away', consequence: '' },
      ],
    },
  })

  // Board 96 · a hard bounce.
  ids.bounce = await thread('Delivery Status Notification (Failure)', 10)
  await message(ids.bounce, {
    from: 'mailer-daemon@example.org',
    fromName: 'Mail Delivery Subsystem',
    subject: 'Delivery Status Notification (Failure)',
    body: 'Address not found.',
    minutesAgo: 10,
    classification: 'bounce',
    flags: {
      bounce: {
        hard: true,
        finalRecipient: 'gone@valve-maker.example',
        diagnostic: '550 5.1.1 user unknown',
      },
    },
    key: 'bounce',
  })

  // Board 96 · phishing, plus a newsletter for the not-business counts.
  ids.phish = await thread('New RFQ — log in to view documents', 15)
  await message(ids.phish, {
    from: 'noreply@bid-docs-share.example',
    fromName: 'Procurement Portal',
    subject: 'New RFQ — log in to view documents',
    body: 'Click here and sign in with your email password to view the documents.',
    minutesAgo: 15,
    classification: 'phishing',
    flags: {
      phishing: { reasons: [{ code: 'login_to_view', text: 'asks you to log in to view an RFQ' }] },
    },
    key: 'phish',
  })
  ids.news = await thread('Our November news', 20)
  await message(ids.news, {
    from: 'news@newsletter.example',
    fromName: 'A Newsletter',
    subject: 'Our November news',
    body: 'Read more',
    minutesAgo: 20,
    classification: 'not_business',
    flags: { bulk: { signals: ['list-unsubscribe'] } },
    key: 'news',
  })

  // Board 97 · a password-protected and an oversized file; another language; a huge thread.
  ids.locked = await thread('RFQ list attached', 25)
  await message(ids.locked, {
    from: 'buyer@client-one.example',
    fromName: 'A Buyer',
    subject: 'RFQ list attached',
    body: 'Please see the attached list.',
    minutesAgo: 25,
    classification: 'client_enquiry',
    attachments: [
      { filename: 'RFQ_list.pdf', extractionStatus: 'password_protected' },
      {
        filename: 'drawings.zip',
        extractionStatus: 'unsupported',
        extractionNote: 'Over the zip limit',
      },
    ],
    key: 'locked',
  })
  ids.arabic = await thread('طلب عرض سعر', 30)
  await message(ids.arabic, {
    from: 'buyer@client-two.example',
    fromName: 'Another Buyer',
    subject: 'طلب عرض سعر',
    body: 'يرجى إرسال سعركم لعشرين طقم من أطقم الحشوات للأسطوانات الهيدروليكية، التسليم إلى الميناء',
    minutesAgo: 30,
    classification: 'client_enquiry',
    summaryEn:
      'Please send your price for twenty sets of seal kits for the hydraulic cylinders, delivery to the port.',
    language: 'ar',
    key: 'arabic',
  })
  ids.huge = await thread('RE: spares list', 40)
  for (let i = 0; i < 12; i += 1) {
    await message(ids.huge, {
      from: i % 2 ? 'buyer@client-one.example' : 'purchase@example.test',
      fromName: i % 2 ? 'A Buyer' : 'Purchasing',
      subject: 'RE: spares list',
      body: `Message ${i + 1} of the conversation.`,
      minutesAgo: 600 - i * 30,
      classification: 'client_reply',
      key: `huge-${i}`,
    })
  }
})

test.afterAll(async () => {
  await db.mailThread.deleteMany({ where: { mailboxId: ids.purchase } })
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s05b-' } } })
})

test('board-96: out of office, a bounce, phishing and the not-business counts', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/mail/all/${ids.ooo}?past=1`)
  await expect(page.getByText('Away Person out until')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByText(/^Out of office · until /)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Send to Alex' })).toHaveAttribute(
    'href',
    `/review?action=${ids.resendRef}`
  )
  await expect(page.getByRole('link', { name: 'Wait for Away' })).toBeVisible()
  expect(await blocking(page)).toEqual([])

  await page.goto(`/mail/all/${ids.bounce}?past=1`)
  await expect(page.getByText('Contact marked bad: gone@valve-maker.example')).toBeVisible()
  await expect(page.getByText(/550 5\.1\.1 user unknown/)).toBeVisible()

  await page.goto(`/mail/all/${ids.phish}?past=1`)
  await expect(page.getByText('Flagged: phishing')).toBeVisible()
  await expect(page.getByText('The link was never opened and nothing was acted on.')).toBeVisible()
  const report = page.getByRole('link', { name: 'Report to Google' })
  await expect(report).toHaveAttribute('href', /^https:\/\/mail\.google\.com\//)
  await expect(page.getByText(/^Also not business today · \d+/)).toBeVisible()
  await expect(
    page.getByText('Labelled in Gmail only; never opened, never answered.')
  ).toBeVisible()
  expect(await blocking(page)).toEqual([])

  // It's real: the person's choice, the flag gone.
  await page.getByRole('button', { name: 'It’s real' }).click()
  await page.getByRole('menuitem', { name: 'Supplier quote' }).click()
  await expect(page.locator('[data-part="toast-region"]')).toContainText(/Marked real|Next time/)
  await expect(page.getByText('Flagged: phishing')).toHaveCount(0, { timeout: 30_000 })
})

test('board-97: protected and oversized files, another language, a huge thread', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/mail/all/${ids.locked}?past=1`)
  await expect(page.getByText('RFQ_list.pdf is password-protected.')).toBeVisible({
    timeout: 90_000,
  })
  await expect(
    page.getByRole('button', { name: 'Draft “Ask sender for an open copy”' })
  ).toBeVisible()
  await expect(page.getByText('Stored, not opened: too large to read safely')).toBeVisible()
  expect(await blocking(page)).toEqual([])

  await page.goto(`/mail/all/${ids.arabic}?past=1`)
  const toggle = page.getByRole('radiogroup', { name: 'Show the email' })
  await expect(toggle).toBeVisible()
  await toggle.getByRole('radio', { name: 'English' }).click()
  await expect(page.getByText(/twenty sets of seal kits/)).toBeVisible()
  await expect(page.getByText('Summary in English · translated from Arabic')).toBeVisible()

  await page.goto(`/mail/all/${ids.huge}?past=1`)
  const show = page.getByRole('link', { name: /^6 earlier messages · show$/ })
  await expect(show).toBeVisible()
  await expect(page.locator('article[data-part="mail-message"]')).toHaveCount(6)
  await show.click()
  await expect(page).toHaveURL(/all=1/)
  await expect(page.locator('article[data-part="mail-message"]')).toHaveCount(12)
})
