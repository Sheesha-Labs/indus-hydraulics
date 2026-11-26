import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { opsDb as db, Prisma } from '@indus/ops-db'
import { expect, test } from '../signed-in'
import { runStep } from '../support/steps'

/**
 * S08-T06 · board-92 Create enquiry from email. The local Inngest stub runs no function, so the steps a real run
 * takes are run in a subprocess with the same server code (tests/support/run-step.ts): the router opens the
 * intake for a live client enquiry, the lines a capture would stage are written here, and the create_enquiry run
 * proposes its card with the model's answer from a fixture. The person approves it in Review and lands on the
 * enquiry. The manual path: client, reference and deadline beside "Type lines", then the review.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const OUT = join(process.cwd(), 'test-results', 'create-enquiry')
const tag = `e2e${Date.now()}`
const domain = `${tag}.example.test`
const cleanup: { enquiries: string[]; batches: string[] } = { enquiries: [], batches: [] }

test.afterAll(async () => {
  if (cleanup.enquiries.length)
    await db.enquiry.updateMany({
      where: { id: { in: cleanup.enquiries } },
      data: { closedReason: 'other', closeNote: 'e2e', closedAt: new Date() },
    })
  if (cleanup.batches.length)
    await db.intakeBatch.deleteMany({ where: { id: { in: cleanup.batches }, status: 'open' } })
})

const BODY = [
  'Please address.',
  '',
  '---------- Forwarded message ---------',
  `From: Sample Buyer <buyer@${domain}>`,
  'Date: Thu, 24 Sep 2026 at 08:14',
  'Subject: RFQ SC/MM/26-1203 compressor station spares',
  '',
  'Dear Sir, please quote your best price for the items in the attached RFQ, C&F Kuwait Port. Payment 100% LC/TT. Please list any deviations, otherwise 100% compliance will be assumed. Closing date 28 September.',
].join('\n')

test('board-92: a forwarded client enquiry becomes a card; approving creates the enquiry', async ({
  page,
  signedInAs,
}) => {
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
    new Date()
  )
  const owner = await db.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })
  const seq = await db.numberSequence.findUniqueOrThrow({
    where: { key: 'enquiry' },
    select: { seededAt: true },
  })
  if (!seq.seededAt)
    await db.$executeRaw`SELECT ops.seed_number_sequence('enquiry', 9001, '{"source":"local e2e"}'::jsonb, ${year}, ${owner.id}::uuid)`
  const company = await db.company.create({
    data: { name: `Sample Client LLC ${tag}`, domains: [domain] },
    select: { id: true },
  })
  await db.contact.create({
    data: { companyId: company.id, name: 'Sample Buyer', email: `buyer@${domain}` },
  })
  const mailbox = await db.mailbox.findFirstOrThrow({ select: { id: true, address: true } })
  const thread = await db.mailThread.create({
    data: { mailboxId: mailbox.id, gmailThreadId: `t-${tag}` },
    select: { id: true },
  })
  const msg = await db.mailMessage.create({
    data: {
      mailboxId: mailbox.id,
      threadId: thread.id,
      gmailMessageId: `g-${tag}`,
      direction: 'inbound',
      fromAddress: 'colleague@example.test',
      fromName: 'Owner Example',
      toAddresses: [mailbox.address],
      ccAddresses: [],
      subject: 'Fwd: RFQ SC/MM/26-1203 — compressor station spares',
      bodyText: BODY,
      bodyTextHash: randomUUID(),
      isForward: true,
      sentAt: new Date(),
      labelsApplied: [],
      origin: 'live',
      classification: 'client_enquiry',
    },
    select: { id: true },
  })

  // ops.mail.route: the classified client enquiry opens its intake (as the Assistant, no person).
  runStep('route-classified', msg.id)
  const batch = await db.intakeBatch.findFirstOrThrow({
    where: { mailMessageId: msg.id },
    select: { id: true, createdById: true, files: { select: { id: true, kind: true } } },
  })
  cleanup.batches.push(batch.id)
  expect(batch.createdById).toBeNull()
  const body = batch.files.find((f) => f.kind === 'email')!

  // What extract_lines stages (the stub runs no function): two Sure lines, one Unsure.
  for (const [ord, description, confidence] of [
    [1, 'Ball valve 2" class 300 RF', 'sure'],
    [2, 'Gate valve 4" class 150', 'sure'],
    [3, 'Filter element 10 um', 'unsure'],
  ] as const)
    await db.intakeLineCandidate.create({
      data: {
        batchId: batch.id,
        fileId: body.id,
        ord,
        description,
        qty: new Prisma.Decimal(ord * 2),
        uom: 'EA',
        partNo: `TEST-${ord}0-220`,
        confidence,
        sourceKind: 'email',
        ...(confidence === 'unsure'
          ? {
              unsure: {
                field: 'partNumber',
                question: 'Line 3 · which part number is right?',
                options: [{ value: 'TEST-30-220', label: 'TEST-30-220' }],
              },
            }
          : {}),
      },
    })
  await db.intakeFile.update({ where: { id: body.id }, data: { status: 'ready', linesFound: 3 } })

  // The create_enquiry run, with the model's unpack from a fixture (no network).
  mkdirSync(OUT, { recursive: true })
  const req = join(OUT, `${tag}-request.json`)
  const ans = join(OUT, `${tag}-answer.json`)
  writeFileSync(
    req,
    JSON.stringify({
      actionKey: 'create_enquiry',
      subjectType: 'mail_message',
      subjectId: msg.id,
      trigger: 'intake.settled',
      origin: 'live',
      sourceVersion: batch.id,
    })
  )
  writeFileSync(
    ans,
    JSON.stringify({
      realClient: {
        companyName: 'Sample Client LLC',
        contactName: 'Sample Buyer',
        email: `buyer@${domain}`,
        quote: `From: Sample Buyer <buyer@${domain}>`,
      },
      isForward: true,
      forwardedBy: 'Owner Example',
      clientRef: { value: 'SC/MM/26-1203', quote: 'RFQ SC/MM/26-1203 compressor station spares' },
      quoteDueBy: { value: '28 September', quote: 'Closing date 28 September' },
      goodsNeededBy: { value: '', quote: '' },
      terms: {
        incoterm: { value: 'C&F Kuwait Port', quote: 'C&F Kuwait Port' },
        payment: { value: '100% LC/TT', quote: 'Payment 100% LC/TT' },
        compliance: {
          value: 'List deviations, or 100% compliance is assumed',
          quote: 'Please list any deviations, otherwise 100% compliance will be assumed',
        },
        validity: { value: '', quote: '' },
        partial: { value: '', quote: '' },
      },
      revision: { isRevision: false, earlierRef: '', quote: '' },
      notes: [],
    })
  )
  const run = runStep('action', req, ans)
  expect(run).toMatchObject({ state: 'proposed' })

  await signedInAs('owner')
  await page.goto(`/review?group=flat&card=${String(run.ref)}`)
  const card = page.locator(`#proposal-${String(run.ref)}`)
  await expect(card).toBeVisible({ timeout: 90_000 })
  await expect(card.getByText(/^Create enquiry ENQ-\d{4}-\d+ for Sample Client LLC/)).toBeVisible()
  await expect(card.getByText('Cover-email terms captured')).toBeVisible()
  const axe = await new AxeBuilder({ page }).include(`#proposal-${String(run.ref)}`).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  await card.locator('[data-verb="approve"]').click()
  await expect
    .poll(
      async () => (await db.intakeBatch.findUniqueOrThrow({ where: { id: batch.id } })).enquiryId,
      {
        timeout: 60_000,
      }
    )
    .not.toBeNull()
  const enquiryId = (await db.intakeBatch.findUniqueOrThrow({ where: { id: batch.id } })).enquiryId!
  cleanup.enquiries.push(enquiryId)
  const e = await db.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    include: { lines: { orderBy: { no: 'asc' } } },
  })
  expect(e).toMatchObject({
    clientId: company.id,
    clientRef: 'SC/MM/26-1203',
    receivedVia: 'forwarded_email',
  })
  // The Unsure line is not on the enquiry: it waits as a question.
  expect(e.lines.map((l) => l.description)).toEqual([
    'Ball valve 2" class 300 RF',
    'Gate valve 4" class 150',
  ])

  await page.goto(`/enquiries/${e.ref}`)
  // S09-T03: the Overview (board 05) lists the confirmed lines.
  await expect(page.getByRole('heading', { name: 'Line items · 2' })).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByRole('cell', { name: 'Gate valve 4" class 150' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open thread in Mail ↗' })).toBeVisible()
})

test('board-92 manual: client, reference and deadline beside "Type lines"', async ({
  page,
  signedInAs,
}) => {
  const company = await db.company.findFirstOrThrow({
    where: { name: { startsWith: 'Sample Client LLC e2e' } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true },
  })
  await signedInAs('owner')
  await page.goto('/enquiries/new')
  await expect(page.getByRole('heading', { name: 'New enquiry without an email' })).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByLabel('Choose enquiry files')).toHaveAttribute('data-ready', 'true')
  await page.getByLabel('Client', { exact: true }).selectOption(company.id)
  await expect(page).toHaveURL(/batch=/, { timeout: 30_000 })
  const batchId = new URL(page.url()).searchParams.get('batch')!
  cleanup.batches.push(batchId)
  await page.getByLabel('Client reference').fill('SC-TENDER-0042')
  await page.getByLabel('Client reference').blur()
  await page.getByLabel('Deadline').fill('2026-12-15')
  await expect
    .poll(
      async () =>
        db.intakeBatch.findUniqueOrThrow({
          where: { id: batchId },
          select: { clientCompanyId: true, clientRef: true, deadline: true },
        }),
      { timeout: 30_000 }
    )
    .toMatchObject({
      clientCompanyId: company.id,
      clientRef: 'SC-TENDER-0042',
      deadline: new Date('2026-12-15T14:00:00.000Z'),
    })
  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
  await page.getByRole('button', { name: /Type lines/ }).click()
  await expect(page).toHaveURL(new RegExp(`/enquiries/intake/${batchId}$`), { timeout: 60_000 })
  await expect(page.getByRole('button', { name: '+ Add a line' })).toBeVisible({ timeout: 90_000 })
})
