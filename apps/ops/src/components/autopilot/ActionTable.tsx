'use client'

import type { AutopilotLevel } from '@indus/ops-core'
import { cn } from '@indus/ops-ui/lib/cn'
import { useToast } from '@indus/ops-ui/overlay'
import { ChevronRight } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { setLevelAction } from '../../app/(console)/assistant/autopilot/actions/autopilot'
import type { AutopilotRow } from '../../data/autopilot'
import LevelSwitch from './LevelSwitch'
import LevelSwitchConfirm from './LevelSwitchConfirm'

const WORD: Record<AutopilotLevel, string> = {
  off: 'Off',
  suggest: 'Suggest',
  draft_and_ask: 'Draft and ask',
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
  never: 'Never',
}
const RAISES = new Set<AutopilotLevel>(['do_and_tell', 'do_quietly'])

export interface ActionTableProps {
  groups: { key: string; label: string; rows: AutopilotRow[] }[]
  system: AutopilotRow[]
  canEdit: boolean
}

/**
 * Board 98's action table (S07-T02): groups Mail, Enquiries, Sourcing, Quotes, After sending, Orders, Money,
 * then a collapsed "System actions". Each row: the label (opens board 99, `?action=`), the five-level switch,
 * the rule text and the origin board. Raising a row to Do and tell or Do quietly asks first (board 102
 * state 4); lowering saves at once. The Helper sees "<level> · read only".
 */
export default function ActionTable({ groups, system, canEdit }: ActionTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [levels, setLevels] = useState<Record<string, AutopilotLevel>>({})
  const [versions, setVersions] = useState<Record<string, number>>({})
  const [pending, setPending] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ row: AutopilotRow; to: AutopilotLevel } | null>(null)

  async function save(row: AutopilotRow, to: AutopilotLevel) {
    const before = levels[row.key] ?? row.level
    setPending(row.key)
    setLevels((l) => ({ ...l, [row.key]: to }))
    const res = await setLevelAction({
      actionKey: row.key,
      level: to,
      version: versions[row.key] ?? row.version,
    })
    setPending(null)
    setConfirm(null)
    if (!res.success) {
      setLevels((l) => ({ ...l, [row.key]: before }))
      toast({ kind: 'error', title: res.error })
      return
    }
    setVersions((v) => ({ ...v, [row.key]: res.data.version }))
    toast({
      kind: 'success',
      title: `${row.label}: ${WORD[res.data.from]} → ${WORD[res.data.to]}${
        res.data.mode === 'custom' && res.data.modeBefore !== 'custom'
          ? ' · mode is now Custom'
          : ''
      }`,
    })
    router.refresh()
  }

  function change(row: AutopilotRow, to: AutopilotLevel) {
    if (RAISES.has(to)) setConfirm({ row, to })
    else void save(row, to)
  }

  const rowsOf = (rows: AutopilotRow[]) =>
    rows.map((r) => (
      <ActionRow
        key={r.key}
        row={r}
        level={levels[r.key] ?? r.level}
        canEdit={canEdit}
        busy={pending === r.key}
        onChange={(to) => change(r, to)}
      />
    ))

  return (
    <div data-part="action-table" className="flex flex-col gap-[18px]">
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`grp-${g.key}`} className="flex flex-col gap-2.5">
          <h2
            id={`grp-${g.key}`}
            className="m-0 flex items-baseline gap-2.5 text-[12.5px] font-normal"
          >
            <span className="io-eyebrow">{g.label}</span>
            <span className="text-io-ink-3">
              {g.rows.length} {g.rows.length === 1 ? 'action' : 'actions'}
            </span>
          </h2>
          <div className="rounded-io-card border-io-line bg-io-card overflow-hidden border">
            {rowsOf(g.rows)}
          </div>
        </section>
      ))}
      {system.length ? (
        <details data-part="system-actions" className="group flex flex-col gap-2.5">
          <summary className="io-focus flex cursor-pointer list-none items-baseline gap-2.5 text-[12.5px]">
            <ChevronRight
              aria-hidden="true"
              size={13}
              strokeWidth={1.75}
              className="text-io-ink-3 self-center transition-transform group-open:rotate-90"
            />
            <span className="io-eyebrow">System actions</span>
            <span className="text-io-ink-3">
              {system.length} actions · most are fixed or not Autopilot settings
            </span>
          </summary>
          <div className="rounded-io-card border-io-line bg-io-card mt-2.5 overflow-hidden border">
            {rowsOf(system)}
          </div>
        </details>
      ) : null}
      <p className="text-io-ink-3 m-0 text-[12px]">
        Guardrails (board 100) override any level: a guardrail that fires sends the action to
        Review, and the card says which one.
      </p>
      {confirm ? (
        <LevelSwitchConfirm
          open
          onOpenChange={(o) => {
            if (!o) setConfirm(null)
          }}
          label={confirm.row.label}
          to={confirm.to}
          lines={confirm.row.confirm[confirm.to]}
          busy={pending === confirm.row.key}
          onConfirm={() => void save(confirm.row, confirm.to)}
        />
      ) : null}
    </div>
  )
}

function ActionRow({
  row,
  level,
  canEdit,
  busy,
  onChange,
}: {
  row: AutopilotRow
  level: AutopilotLevel
  canEdit: boolean
  busy: boolean
  onChange: (to: AutopilotLevel) => void
}) {
  const editable = canEdit && row.configurable && row.locked === null
  return (
    <div
      data-part="action-row"
      data-action={row.key}
      className="border-io-line flex min-h-[53px] items-center gap-4 border-b px-4 py-2 last:border-b-0"
    >
      <Link
        href={`/assistant/autopilot?action=${row.key}` as Route}
        scroll={false}
        className="io-focus rounded-io-tag text-io-ink w-[310px] flex-none text-[13px] hover:underline"
      >
        {row.label}
      </Link>
      {canEdit || row.locked ? (
        <LevelSwitch
          label={`${row.label} level`}
          value={level}
          allowed={row.allowed}
          locked={row.locked}
          disabled={!editable || busy}
          {...(editable ? { onChange } : {})}
        />
      ) : (
        <span className="text-io-ink-3 w-[400px] flex-none text-[12.5px]">
          {WORD[level]} · read only
        </span>
      )}
      <span className={cn('text-io-ink-3 min-w-0 flex-1 truncate text-[12.5px]')}>
        {row.ruleText ?? row.description ?? ''}
      </span>
      {row.originBoard ? (
        <span className="text-io-ink-3 flex-none text-[11.5px] tabular-nums">
          #{row.originBoard.padStart(2, '0')}
        </span>
      ) : null}
    </div>
  )
}
