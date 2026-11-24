'use client'

import type { AutopilotLevel, RuleField } from '@indus/ops-core'
import { Button, Toggle } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { Drawer, useToast } from '@indus/ops-ui/overlay'
import { Tag } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  acceptSuggestionAction,
  dismissSuggestionAction,
  saveRulesAction,
  setLevelAction,
} from '../../app/(console)/assistant/autopilot/actions/autopilot'
import type { ActionDetail } from '../../data/autopilot'
import LevelSwitchConfirm from './LevelSwitchConfirm'

const WORD: Record<AutopilotLevel, string> = {
  off: 'Off',
  suggest: 'Suggest',
  draft_and_ask: 'Draft and ask',
  do_and_tell: 'Do and tell',
  do_quietly: 'Do quietly',
  never: 'Never',
}
const TAG: Partial<Record<AutopilotLevel, string>> = {
  draft_and_ask: 'Asks you',
  do_and_tell: 'Does it, tells you',
  do_quietly: 'Does it quietly',
}
const RAISES = new Set<AutopilotLevel>(['do_and_tell', 'do_quietly'])
const STATE_WORD: Record<string, string> = {
  proposed: 'Waiting in Review',
  later: 'Later',
  approved: 'Approved',
  edited_approved: 'Approved with edits',
  rejected: 'Rejected',
  queued: 'Queued',
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
  undone: 'Undone',
  reverted: 'Reverted',
  corrected: 'Corrected',
  cancelled: 'Cancelled',
}
const GROUP_WORD: Record<string, string> = {
  mail: 'Mail',
  enquiries: 'Enquiries',
  sourcing: 'Sourcing',
  quotes: 'Quotes',
  after_sending: 'After sending',
  orders: 'Orders',
  money: 'Money',
  system: 'System',
}

export interface ActionDrawerProps {
  detail: ActionDetail
  isOwner: boolean
  /** Nothing decided yet anywhere: the history says so (board 102 state 5). */
  firstDay: boolean
}

/**
 * Board 99 · one Autopilot action (S07-T02), a drawer over board 98 (`?action=<key>`): the earned suggestion
 * when one is open (Not now snoozes 14 days; Accept asks first, board 102 state 4), the level as radio cards
 * with what each means for this action, the rules form generated from the action's schema, the email
 * template it drafts from, and its last 10 runs. Save writes the level (raising asks first) and the rules,
 * each version-checked; Cancel closes without saving.
 */
export default function ActionDrawer({ detail, isOwner, firstDay }: ActionDrawerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { row } = detail
  const [level, setLevel] = useState<AutopilotLevel>(row.level)
  const [rules, setRules] = useState<Record<string, unknown>>(detail.rules)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<'save' | 'accept' | null>(null)
  const [suggestion, setSuggestion] = useState(row.suggestion)

  const close = () => router.push('/assistant/autopilot' as Route, { scroll: false })
  const levelChanged = level !== row.level
  const rulesChanged = JSON.stringify(rules) !== JSON.stringify(detail.rules)

  async function doSave() {
    setBusy(true)
    let version = row.version
    if (levelChanged) {
      const res = await setLevelAction({ actionKey: row.key, level, version })
      if (!res.success) {
        setBusy(false)
        setConfirm(null)
        toast({ kind: 'error', title: res.error })
        return
      }
      version = res.data.version
    }
    if (rulesChanged) {
      const res = await saveRulesAction({ actionKey: row.key, rules, version })
      if (!res.success) {
        setBusy(false)
        setConfirm(null)
        toast({ kind: 'error', title: res.error })
        return
      }
    }
    setBusy(false)
    setConfirm(null)
    toast({ kind: 'success', title: `${row.label} saved` })
    router.refresh()
    close()
  }

  async function doAccept() {
    if (!suggestion) return
    setBusy(true)
    const res = await acceptSuggestionAction({ id: suggestion.id, version: row.version })
    setBusy(false)
    setConfirm(null)
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      return
    }
    toast({ kind: 'success', title: `${row.label}: ${WORD[res.data.from]} → ${WORD[res.data.to]}` })
    router.refresh()
    close()
  }

  async function notNow() {
    if (!suggestion) return
    const res = await dismissSuggestionAction({ id: suggestion.id })
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      return
    }
    setSuggestion(null)
    toast({ kind: 'info', title: 'Suggestion hidden for 14 days' })
    router.refresh()
  }

  const save = () => {
    if (levelChanged && RAISES.has(level)) setConfirm('save')
    else void doSave()
  }
  const editable = detail.canEditLevel || detail.canEditRules

  return (
    <Drawer
      open
      onOpenChange={(o) => {
        if (!o) close()
      }}
      eyebrow={`${GROUP_WORD[row.group] ?? row.group} · Action`}
      title={row.label}
      width={600}
      footer={
        editable ? (
          <>
            <span className="flex-1" />
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary"
              busy={busy && confirm === null}
              disabled={!levelChanged && !rulesChanged}
              onClick={save}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <span className="text-io-ink-3 flex-1 text-[12.5px]">
              You can see Autopilot but not change it.
            </span>
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
          </>
        )
      }
    >
      <div data-part="action-drawer" className="flex flex-col gap-[18px] px-5 py-4">
        {suggestion && isOwner ? (
          <div
            data-part="earned-suggestion"
            className="rounded-io-card bg-io-accent-wash flex items-center gap-3 px-4 py-3"
          >
            <Tag kind="assistant">Assistant</Tag>
            <p className="m-0 flex-1 text-[13px] leading-[1.45]">
              You approved the last {suggestion.streak} {row.label.toLowerCase()} runs without
              edits. Switch to {WORD[suggestion.toLevel]}?
            </p>
            <Button variant="secondary" onClick={() => void notNow()}>
              Not now
            </Button>
            <Button variant="navy" onClick={() => setConfirm('accept')}>
              Accept
            </Button>
          </div>
        ) : null}

        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0" disabled={!detail.canEditLevel}>
          <legend className="io-eyebrow mb-2">Level</legend>
          {detail.levels.map((l) => {
            const on = l.level === level
            const allowed = row.locked ? l.level === row.locked : row.allowed.includes(l.level)
            return (
              <label
                key={l.level}
                data-state={on ? 'on' : 'off'}
                className={cn(
                  'rounded-io-card border-io-line flex cursor-pointer gap-3 border px-4 py-3',
                  on && 'border-io-accent bg-io-accent-faint',
                  !allowed && 'cursor-not-allowed opacity-60'
                )}
              >
                <input
                  type="radio"
                  name="level"
                  value={l.level}
                  checked={on}
                  disabled={!allowed}
                  onChange={() => setLevel(l.level)}
                  className="io-focus mt-0.5 size-4 flex-none"
                />
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-[13.5px] font-medium">
                    {WORD[l.level]}
                    {TAG[l.level] ? <Tag kind="level">{TAG[l.level]}</Tag> : null}
                  </span>
                  <span className="text-io-ink-3 text-[12.5px] leading-[1.45]">
                    {l.consequence}
                  </span>
                </span>
              </label>
            )
          })}
        </fieldset>

        {detail.fields.length ? (
          <RuleForm
            fields={detail.fields}
            rules={rules}
            disabled={!detail.canEditRules}
            onChange={(name, value) => setRules((r) => ({ ...r, [name]: value }))}
          />
        ) : null}

        {detail.template ? (
          <section aria-labelledby="tpl-title" className="flex flex-col gap-2">
            <h3 id="tpl-title" className="io-eyebrow m-0 flex items-center gap-2 font-normal">
              Template
              {detail.template.awaiting ? (
                <span className="text-io-ink-3 tracking-normal normal-case">
                  · wording awaiting sign-off
                </span>
              ) : null}
            </h3>
            <div className="rounded-io-card border-io-line bg-io-paper flex flex-col gap-1.5 border px-4 py-3 text-[12.5px]">
              <span className="font-medium">{detail.template.subject}</span>
              <span className="text-io-ink-2 whitespace-pre-line">{detail.template.body}</span>
            </div>
            <Link
              href={'/settings/templates' as Route}
              className="io-focus rounded-io-tag text-io-accent w-fit text-[12.5px] hover:underline"
            >
              Edit in Email templates
            </Link>
          </section>
        ) : null}

        <section aria-labelledby="hist-title" className="flex flex-col gap-2">
          <h3 id="hist-title" className="io-eyebrow m-0 font-normal">
            History · last 10 runs
          </h3>
          {detail.history.length === 0 ? (
            <p
              data-part="no-history"
              className="rounded-io-card border-io-line text-io-ink-3 m-0 border border-dashed px-4 py-5 text-center text-[12.5px]"
            >
              {firstDay
                ? 'No history yet. The first runs show here as the Assistant reads today’s mail.'
                : 'No runs of this action yet.'}
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {detail.history.map((h) => (
                <li
                  key={h.id}
                  className="border-io-line flex items-center gap-3 border-b py-2 text-[12.5px] last:border-b-0"
                >
                  <Link
                    href={`/assistant/log?open=${h.id}` as Route}
                    className="io-focus rounded-io-tag text-io-ink min-w-0 flex-1 truncate hover:underline"
                  >
                    {h.headline}
                  </Link>
                  <span className="text-io-ink-3 flex-none">
                    {STATE_WORD[h.state] ?? h.state}
                    {h.edited ? ' · edited' : ''}
                  </span>
                  <time dateTime={h.createdAt} className="text-io-ink-3 flex-none tabular-nums">
                    {new Date(h.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      timeZone: 'Asia/Dubai',
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {confirm ? (
        <LevelSwitchConfirm
          open
          onOpenChange={(o) => {
            if (!o) setConfirm(null)
          }}
          label={row.label}
          to={confirm === 'accept' && suggestion ? suggestion.toLevel : level}
          lines={detail.confirm[confirm === 'accept' && suggestion ? suggestion.toLevel : level]}
          busy={busy}
          onConfirm={() => void (confirm === 'accept' ? doAccept() : doSave())}
        />
      ) : null}
    </Drawer>
  )
}

/** Board 99 "Rules": one row per field of the action's schema (ops-core rule-schemas.ts). */
export function RuleForm({
  fields,
  rules,
  disabled,
  onChange,
}: {
  fields: readonly RuleField[]
  rules: Record<string, unknown>
  disabled: boolean
  onChange: (name: string, value: unknown) => void
}) {
  return (
    <section aria-labelledby="rules-title" data-part="rule-form" className="flex flex-col">
      <h3 id="rules-title" className="io-eyebrow m-0 mb-1 font-normal">
        Rules
      </h3>
      {fields.map((f) => (
        <div
          key={f.name}
          className="border-io-line flex min-h-[48px] items-center justify-between gap-3 border-b py-1.5 text-[13px]"
        >
          {f.kind === 'toggle' ? (
            <Toggle
              name={f.name}
              label={f.label}
              checked={rules[f.name] === true}
              disabled={disabled}
              onCheckedChange={(v) => onChange(f.name, v)}
              className="w-full justify-between"
            />
          ) : (
            <>
              <label htmlFor={`rule-${f.name}`}>{f.label}</label>
              {f.kind === 'count' ? (
                <select
                  id={`rule-${f.name}`}
                  value={String(rules[f.name] ?? f.min)}
                  disabled={disabled}
                  onChange={(e) => onChange(f.name, Number(e.target.value))}
                  className="io-focus-field rounded-io-ctl border-io-stroke bg-io-card h-9 border px-2.5 text-[13px]"
                >
                  {Array.from({ length: f.max - f.min + 1 }, (_, i) => f.min + i).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? f.unit : f.units}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`rule-${f.name}`}
                  type="time"
                  value={String(rules[f.name] ?? '')}
                  disabled={disabled}
                  onChange={(e) => onChange(f.name, e.target.value)}
                  className="io-focus-field rounded-io-ctl border-io-stroke bg-io-card h-9 border px-2.5 text-[13px] tabular-nums"
                />
              )}
            </>
          )}
        </div>
      ))}
    </section>
  )
}
