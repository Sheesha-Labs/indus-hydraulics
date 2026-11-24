import 'server-only'
import { GUARDRAIL_KINDS, parseGuardrailParams, type GuardrailKind } from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import type { AuditEntry } from '../../lib/audit'
import type { OpsUser } from '../../lib/access-core'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import { forgetGuardrails } from '../assistant/guardrail-context'
import { settingSubjectId } from '../settings/subject-id'

/**
 * Board 100 writes (S07-T03, ADR-10, ADR-28). A guardrail's params are validated by its kind's schema, the
 * row is version-checked, the two fixed rules can never be saved, and a save signs the value off. The
 * resolver's 60-second cache is cleared after the commit (the action calls `forgetGuardrails`). Holidays are
 * rows of ops.holiday (UAE public holidays, closures, Ramadan days with their hours).
 */
type Tx = Prisma.TransactionClient

export interface SaveGuardrailResult {
  key: string
  label: string
  before: { enabled: boolean; params: unknown }
  after: { enabled: boolean; params: unknown }
  version: number
}

export async function saveGuardrail(
  tx: Tx,
  input: { key: string; enabled: boolean; params: unknown; version: number },
  user: Pick<OpsUser, 'id' | 'role'>,
  now = new Date()
): Promise<SaveGuardrailResult> {
  if (user.role !== 'owner') throw new SafeError(SAFE_MESSAGES.forbidden)
  const row = await tx.guardrail.findUnique({ where: { key: input.key } })
  if (!row) throw new SafeError(SAFE_MESSAGES.gone)
  if (row.fixed)
    throw new SafeError('Fixed rules are not Autopilot settings and cannot be changed.')
  if (!(GUARDRAIL_KINDS as readonly string[]).includes(row.kind))
    throw new SafeError(SAFE_MESSAGES.gone)
  const parsed = parseGuardrailParams(row.kind as GuardrailKind, input.params)
  if (!parsed.ok) throw new SafeError(parsed.error)
  if (row.version !== input.version) throw new SafeError(SAFE_MESSAGES.conflict)
  const { count } = await tx.guardrail.updateMany({
    where: { key: input.key, version: input.version },
    data: {
      enabled: input.enabled,
      params: parsed.params as Prisma.InputJsonValue,
      version: { increment: 1 },
      updatedById: user.id,
      signoffStatus: 'signed_off',
      signedOffById: user.id,
      signedOffAt: now,
    },
  })
  if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)
  return {
    key: row.key,
    label: row.label,
    before: { enabled: row.enabled, params: row.params },
    after: { enabled: input.enabled, params: parsed.params },
    version: input.version + 1,
  }
}

export function guardrailAudit(out: SaveGuardrailResult, initials: string): AuditEntry {
  return {
    subjectType: 'settings',
    subjectId: settingSubjectId(`guardrail.${out.key}`),
    kind: 'settings',
    field: `guardrail.${out.key}`,
    before: out.before as Prisma.InputJsonValue,
    after: out.after as Prisma.InputJsonValue,
    note: `${initials} changed the guardrail “${out.label}”`,
  }
}

export const HOLIDAY_KINDS = ['public_holiday', 'closure', 'ramadan'] as const
export type HolidayKind = (typeof HOLIDAY_KINDS)[number]

export interface HolidayInput {
  id?: string | undefined
  country: string
  /** YYYY-MM-DD; with `to`, every day of the range (a Ramadan window). */
  date: string
  to?: string | undefined
  name: string
  kind: HolidayKind
  hoursStart?: string | null | undefined
  hoursEnd?: string | null | undefined
}

function days(from: string, to: string | undefined): string[] {
  const out: string[] = []
  const end = new Date(`${to ?? from}T00:00:00Z`)
  for (let d = new Date(`${from}T00:00:00Z`); d <= end; d = new Date(d.getTime() + 86_400_000)) {
    out.push(d.toISOString().slice(0, 10))
    if (out.length > 40) throw new SafeError('A range covers at most 40 days.')
  }
  if (!out.length) throw new SafeError('The range ends before it starts.')
  return out
}

/** Add or edit holiday rows (a range adds one row per day). Owner only; confirmed on save. */
export async function saveHoliday(
  tx: Tx,
  input: HolidayInput,
  user: Pick<OpsUser, 'role'>
): Promise<{ ids: string[]; dates: string[] }> {
  if (user.role !== 'owner') throw new SafeError(SAFE_MESSAGES.forbidden)
  if (input.kind === 'ramadan' && !(input.hoursStart && input.hoursEnd))
    throw new SafeError('Ramadan days need their hours.')
  if (input.id) {
    const row = await tx.holiday.update({
      where: { id: input.id },
      data: {
        date: new Date(`${input.date}T00:00:00Z`),
        name: input.name,
        kind: input.kind,
        hoursStart: input.kind === 'ramadan' ? (input.hoursStart ?? null) : null,
        hoursEnd: input.kind === 'ramadan' ? (input.hoursEnd ?? null) : null,
        signoffStatus: 'signed_off',
      },
      select: { id: true },
    })
    return { ids: [row.id], dates: [input.date] }
  }
  const ids: string[] = []
  const dates = days(input.date, input.to)
  for (const date of dates) {
    const row = await tx.holiday.upsert({
      where: {
        country_date_kind: {
          country: input.country,
          date: new Date(`${date}T00:00:00Z`),
          kind: input.kind,
        },
      },
      create: {
        country: input.country,
        date: new Date(`${date}T00:00:00Z`),
        name: input.name,
        kind: input.kind,
        hoursStart: input.kind === 'ramadan' ? (input.hoursStart ?? null) : null,
        hoursEnd: input.kind === 'ramadan' ? (input.hoursEnd ?? null) : null,
        signoffStatus: 'signed_off',
      },
      update: {
        name: input.name,
        hoursStart: input.kind === 'ramadan' ? (input.hoursStart ?? null) : null,
        hoursEnd: input.kind === 'ramadan' ? (input.hoursEnd ?? null) : null,
        signoffStatus: 'signed_off',
      },
      select: { id: true },
    })
    ids.push(row.id)
  }
  return { ids, dates }
}

export async function deleteHoliday(
  tx: Tx,
  input: { id: string },
  user: Pick<OpsUser, 'role'>
): Promise<{ id: string; date: string; name: string }> {
  if (user.role !== 'owner') throw new SafeError(SAFE_MESSAGES.forbidden)
  const row = await tx.holiday.findUnique({ where: { id: input.id } })
  if (!row) throw new SafeError(SAFE_MESSAGES.gone)
  await tx.holiday.delete({ where: { id: input.id } })
  return { id: row.id, date: row.date.toISOString().slice(0, 10), name: row.name }
}

export { forgetGuardrails }
