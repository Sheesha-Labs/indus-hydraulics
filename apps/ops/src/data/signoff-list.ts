import 'server-only'
import { opsDb } from '@indus/ops-db'
import { listAwaiting } from '../server/settings/signoff'

/**
 * Settings home "Default · awaiting sign-off" (ADR-28, S03 listAwaiting extended by S07-T07): every default the
 * Owner has not confirmed, by area, each linking to the page and field where it is confirmed. One read
 * transaction for the Autopilot areas plus the settings rows.
 */
export interface AwaitingItem {
  label: string
  href: string
}
export interface AwaitingArea {
  area: string
  count: number
  items: AwaitingItem[]
}

const SECTION_LINK: Record<string, string> = {
  assistant: '/assistant/cost',
  money: '/settings/pricing',
  mail: '/settings/sending',
  documents: '/settings/documents',
}

export async function getAwaitingSignoff(): Promise<AwaitingArea[]> {
  const [settings, [levels, presets, minutes, guardrails, templates]] = await Promise.all([
    listAwaiting(),
    opsDb.$transaction([
      opsDb.autopilotSetting.findMany({
        where: { signoffStatus: 'awaiting' },
        select: { actionKey: true, def: { select: { label: true, position: true } } },
      }),
      opsDb.autopilotActionDef.count({ where: { signoffStatus: 'awaiting', configurable: true } }),
      opsDb.autopilotActionDef.findMany({
        where: { signoffStatus: 'awaiting', minutesSaved: { not: null } },
        select: { key: true, label: true, minutesSaved: true },
        orderBy: { position: 'asc' },
      }),
      opsDb.guardrail.findMany({
        where: { signoffStatus: 'awaiting', fixed: false },
        select: { key: true, label: true },
        orderBy: { key: 'asc' },
      }),
      opsDb.emailTemplate.findMany({
        where: { signoffStatus: 'awaiting', archivedAt: null },
        select: { key: true, label: true },
      }),
    ]),
  ])
  const areas: AwaitingArea[] = []
  if (levels.length)
    areas.push({
      area: 'Autopilot levels',
      count: levels.length,
      items: levels
        .sort((a, b) => a.def.position - b.def.position)
        .slice(0, 12)
        .map((l) => ({ label: l.def.label, href: `/assistant/autopilot?action=${l.actionKey}` })),
    })
  if (presets)
    areas.push({
      area: 'Autopilot presets',
      count: presets,
      items: [{ label: 'Balanced and Hands-off contents (compare modes)', href: '/assistant/autopilot?help=modes' }],
    })
  if (guardrails.length)
    areas.push({
      area: 'Guardrail values',
      count: guardrails.length,
      items: guardrails.map((g) => ({ label: g.label, href: `/assistant/guardrails#${g.key}` })),
    })
  if (minutes.length)
    areas.push({
      area: 'Minutes saved per task',
      count: minutes.length,
      items: minutes.map((m) => ({
        label: `${m.label}: ${Number(m.minutesSaved)} min`,
        href: `/assistant/autopilot?action=${m.key}`,
      })),
    })
  if (templates.length)
    areas.push({
      area: 'Email wording',
      count: templates.length,
      items: templates.map((t) => ({
        label: t.label,
        href: t.key === 'supplier_chaser' ? '/assistant/autopilot?action=chase_suppliers' : '/settings/templates',
      })),
    })
  const bySection = new Map<string, AwaitingItem[]>()
  for (const s of settings) {
    const list = bySection.get(s.section) ?? []
    list.push({ label: s.label, href: SECTION_LINK[s.section] ?? '/settings' })
    bySection.set(s.section, list)
  }
  for (const [section, items] of bySection)
    areas.push({
      area: section === 'assistant' ? 'AI budget and research cap' : `Settings · ${section}`,
      count: items.length,
      items,
    })
  return areas
}
