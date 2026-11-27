import 'server-only'
import { SCREENING_LISTS, screeningComplete } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { z } from 'zod'
import type { OpsUser } from '../../lib/access-core'
import { writeTracked } from '../assistant/write-tracked'
import { getSettingIn } from '../settings/get'

/**
 * The manual screening checklist (S10-T05, board 51, C40): one screening_check per list with what was searched, the
 * result, who checked and an evidence link. No third-party screening call: the page links to each official list's
 * search page as a plain link the person opens. Saving sets the re-screen date (90 days by default).
 */
export const screeningRowSchema = z.object({
  key: z.enum(SCREENING_LISTS.map((l) => l.key) as [string, ...string[]]),
  scope: z.string().trim().max(200).optional(),
  result: z.enum(['clear', 'possible_match', 'hit', 'open']),
  evidenceUrl: z.url().max(500).optional(),
  note: z.string().trim().max(300).optional(),
})
export type ScreeningInput = z.infer<typeof screeningRowSchema>

export async function recordScreening(
  tx: Prisma.TransactionClient,
  supplierId: string,
  rows: readonly ScreeningInput[],
  user: Pick<OpsUser, 'id'>,
  now = new Date()
): Promise<{ complete: boolean }> {
  const { rescreenDays } = await getSettingIn(tx, 'suppliers.trust')
  for (const r of rows) {
    const list = SCREENING_LISTS.find((l) => l.key === r.key)!
    await tx.screeningCheck.create({
      data: {
        companyId: supplierId,
        kind: list.kind as never,
        listName: list.label,
        scope: r.scope || list.scope,
        result: r.result,
        evidenceUrl: r.evidenceUrl ?? null,
        note: r.note || null,
        checkedById: user.id,
        checkedAt: now,
        triggeredBy: 'manual',
      },
    })
  }
  const all = await tx.screeningCheck.findMany({
    where: { companyId: supplierId, listName: { not: null } },
    orderBy: { checkedAt: 'asc' },
    select: { listName: true, result: true },
  })
  const state = screeningComplete(
    all.map((a) => ({ listName: a.listName!, result: a.result as never }))
  )
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: [
        {
          field: 'screening',
          before: null,
          after: { lists: rows.map((r) => `${r.key}:${r.result}`), complete: state.complete },
          kind: 'supplier',
        },
      ],
    },
    (t) =>
      t.supplierProfile.update({
        where: { companyId: supplierId },
        data: state.complete
          ? {
              lastScreenedAt: now,
              rescreenDueAt: new Date(now.getTime() + rescreenDays * 86_400_000),
            }
          : {},
      })
  )
  return { complete: state.complete }
}

/** The latest result per list, for board 51's table. */
export async function screeningRows(
  supplierId: string,
  db: Pick<Prisma.TransactionClient, 'screeningCheck'> = opsDb
) {
  const rows = await db.screeningCheck.findMany({
    where: { companyId: supplierId, listName: { not: null } },
    orderBy: { checkedAt: 'desc' },
    select: {
      listName: true,
      scope: true,
      result: true,
      evidenceUrl: true,
      note: true,
      checkedAt: true,
      checkedById: true,
    },
  })
  return SCREENING_LISTS.map((l) => {
    const r = rows.find((x) => x.listName === l.label)
    return {
      key: l.key,
      label: l.label,
      scope: r?.scope ?? l.scope,
      result: (r?.result ?? 'open') as string,
      evidenceUrl: r?.evidenceUrl ?? null,
      note: r?.note ?? null,
      checkedAt: r?.checkedAt ?? null,
    }
  })
}
