import 'server-only'
import { monthKey } from '@indus/ops-ai'
import type { Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access-core'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import { updateSettingInTx } from '../settings/update'

/**
 * Board 101 "Limits" (S07-T04, C14, ADR-08): the monthly budget, what happens when it is reached and the
 * research cap per enquiry, in ONE transaction: the two settings rows (version-checked, audited by the
 * settings service, signed off), the research_cap guardrail the resolver reads, and the current month's
 * ai_budget row, so ops.ai_budget_reserve enforces the new limit and mode on the very next call.
 */
type Tx = Prisma.TransactionClient

export const BUDGET_MODES = ['warn_pause_research', 'hard_stop', 'warn_only'] as const
export type BudgetModeInput = (typeof BUDGET_MODES)[number]

export interface AiLimitsInput {
  monthlyBudgetUsd: number
  mode: BudgetModeInput
  researchCapUsd: number
  budgetVersion: number
  researchVersion: number
}

export interface AiLimitsResult {
  month: string
  budgetVersion: number
  researchVersion: number
  limitUsd: number
  mode: BudgetModeInput
  researchCapUsd: number
}

export async function saveAiLimits(
  tx: Tx,
  input: AiLimitsInput,
  user: OpsUser,
  now = new Date()
): Promise<AiLimitsResult> {
  if (user.role !== 'owner') throw new SafeError(SAFE_MESSAGES.forbidden)
  const research = await tx.settingsEntry.findUnique({
    where: { key: 'research.cap' },
    select: { value: true },
  })
  const allowMoreUsd = Number(
    (research?.value as { allowMoreUsd?: number } | null)?.allowMoreUsd ?? 0
  )
  const b = await updateSettingInTx(
    tx,
    'assistant.budget',
    { monthlyUsd: input.monthlyBudgetUsd, mode: input.mode },
    input.budgetVersion,
    user
  )
  const r = await updateSettingInTx(
    tx,
    'research.cap',
    { perEnquiryUsd: input.researchCapUsd, allowMoreUsd },
    input.researchVersion,
    user
  )
  await tx.settingsEntry.updateMany({
    where: { key: { in: ['assistant.budget', 'research.cap'] } },
    data: { signoffStatus: 'signed_off', signedOffById: user.id, signedOffAt: now },
  })
  await tx.guardrail.updateMany({
    where: { key: 'research_cap' },
    data: {
      params: { perEnquiryUsd: input.researchCapUsd },
      version: { increment: 1 },
      updatedById: user.id,
      signoffStatus: 'signed_off',
      signedOffById: user.id,
      signedOffAt: now,
    },
  })
  const month = monthKey(now)
  await tx.$executeRaw`SELECT ops.ai_budget_ensure_month(${month}::date)`
  await tx.aiBudget.update({
    where: { month: new Date(`${month}T00:00:00Z`) },
    data: {
      limitUsd: input.monthlyBudgetUsd,
      mode: input.mode,
      signoffStatus: 'signed_off',
      updatedAt: now,
      // A raised limit re-arms the notices for the rest of the month.
      notified80At: null,
      notified100At: null,
    },
  })
  return {
    month,
    budgetVersion: b.version,
    researchVersion: r.version,
    limitUsd: input.monthlyBudgetUsd,
    mode: input.mode,
    researchCapUsd: input.researchCapUsd,
  }
}
