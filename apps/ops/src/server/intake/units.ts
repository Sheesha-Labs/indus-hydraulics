import 'server-only'
import type { UomTable } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'

/**
 * The unit table (S08-T02): `ops.uom_unit` and its aliases, as plain data so it crosses Inngest steps, and as the
 * UomTable the normaliser takes. One read with include.
 */
export interface UnitRow {
  code: string
  label: string
  aliases: string[]
}

export async function loadUnits(db: Pick<typeof opsDb, 'uomUnit'> = opsDb): Promise<UnitRow[]> {
  const rows = await db.uomUnit.findMany({
    select: { code: true, label: true, aliases: { select: { alias: true } } },
    orderBy: { code: 'asc' },
  })
  return rows.map((r) => ({
    code: r.code,
    label: r.label,
    aliases: r.aliases.map((a) => a.alias).sort(),
  }))
}

export function uomTableOf(units: readonly UnitRow[]): UomTable {
  return {
    codes: new Set(units.map((u) => u.code)),
    aliases: new Map(
      units.flatMap((u) => u.aliases.map((a) => [a.replace(/\.+$/, ''), u.code] as const))
    ),
  }
}
