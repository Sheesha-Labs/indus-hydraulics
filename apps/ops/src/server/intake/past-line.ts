import 'server-only'
import { SAME_AS_BEFORE, descriptionSimilarity } from '@indus/ops-core'
import { opsDb, Prisma } from '@indus/ops-db'

/**
 * "Same as last order" (S08-T05, board 36): a line that points at an earlier order is resolved to the client's most
 * recent quotation line (else enquiry line) with a matching description. Nothing found — no history before the S20
 * import, or no close description — leaves the line Unsure with the question "Which earlier order?". Read-only
 * lookups: at most two queries per batch, not per line.
 */
export interface PastLine {
  kind: 'quotation' | 'enquiry'
  ref: string
  lineNo: number
  description: string
}

const CLOSE = 0.45

export async function findPastLines(
  companyId: string | null,
  descriptions: readonly string[],
  db: Pick<typeof opsDb, 'quotationLine' | 'enquiryLine'> = opsDb
): Promise<Array<PastLine | null>> {
  if (!companyId || !descriptions.length) return descriptions.map(() => null)
  const quoted = await db.quotationLine.findMany({
    where: { quotation: { clientId: companyId, number: { not: null } } },
    orderBy: { quotation: { createdAt: 'desc' } },
    take: 300,
    select: { lineNo: true, description: true, quotation: { select: { number: true } } },
  })
  const asked = await db.enquiryLine.findMany({
    where: { enquiry: { clientId: companyId } },
    orderBy: { enquiry: { receivedAt: 'desc' } },
    take: 300,
    select: { no: true, description: true, enquiry: { select: { ref: true } } },
  })
  const pool: PastLine[] = [
    ...quoted.map((q) => ({
      kind: 'quotation' as const,
      ref: q.quotation.number!,
      lineNo: q.lineNo,
      description: q.description,
    })),
    ...asked.map((e) => ({
      kind: 'enquiry' as const,
      ref: e.enquiry.ref,
      lineNo: e.no,
      description: e.description,
    })),
  ]
  return descriptions.map((d) => {
    let best: { p: PastLine; s: number } | null = null
    for (const p of pool) {
      const s = descriptionSimilarity(d, p.description)
      // Most recent first: a later hit must be strictly closer to replace an earlier one.
      if (s >= CLOSE && (!best || s > best.s)) best = { p, s }
    }
    return best?.p ?? null
  })
}

/**
 * After an email body is read: each line whose text points at an earlier order gets the reference as a reason, or
 * becomes Unsure with "Which earlier order?". Works on the staged candidates of one file.
 */
export async function annotateSameAsBefore(fileId: string): Promise<number> {
  const f = await opsDb.intakeFile.findUnique({
    where: { id: fileId },
    select: {
      batch: {
        select: { clientCompanyId: true, mailMessage: { select: { bodyText: true } } },
      },
      candidates: {
        where: { decision: 'pending' },
        select: {
          id: true,
          description: true,
          notes: true,
          confidence: true,
          reasons: true,
          fieldSpans: true,
        },
      },
    },
  })
  if (!f) return 0
  const body = f.batch.mailMessage?.bodyText ?? ''
  const spanIds = f.candidates.flatMap((c) => {
    const d = (c.fieldSpans as Record<string, string> | null)?.description
    return d ? [d] : []
  })
  const spans = spanIds.length
    ? await opsDb.sourceSpan.findMany({
        where: { id: { in: spanIds } },
        select: { id: true, charStart: true },
      })
    : []
  const lineAt = (at: number | null) => {
    if (at === null) return ''
    const s = body.lastIndexOf('\n', at - 1) + 1
    const e = body.indexOf('\n', at)
    return body.slice(s, e < 0 ? undefined : e)
  }
  const pointing = f.candidates.filter((c) => {
    const span = spans.find(
      (s) => s.id === (c.fieldSpans as Record<string, string> | null)?.description
    )
    return SAME_AS_BEFORE.test(
      [c.description, c.notes ?? '', lineAt(span?.charStart ?? null)].join(' ')
    )
  })
  if (!pointing.length) return 0
  const past = await findPastLines(
    f.batch.clientCompanyId,
    pointing.map((c) => c.description)
  )
  await opsDb.$transaction(
    pointing.map((c, i) => {
      const hit = past[i]
      const reasons = (c.reasons as string[] | null) ?? []
      return hit
        ? opsDb.intakeLineCandidate.update({
            where: { id: c.id },
            data: {
              reasons: [`“Same as last order” → ${hit.ref} line ${hit.lineNo}`, ...reasons],
              confidence: c.confidence === 'sure' ? 'likely' : c.confidence,
            },
          })
        : opsDb.intakeLineCandidate.update({
            where: { id: c.id },
            data: {
              confidence: 'unsure',
              reasons: ['Points at an earlier order that is not on file', ...reasons],
              unsure: {
                field: 'reference',
                question: 'Which earlier order?',
                options: [],
              } as Prisma.InputJsonValue,
            },
          })
    })
  )
  return pointing.length
}
