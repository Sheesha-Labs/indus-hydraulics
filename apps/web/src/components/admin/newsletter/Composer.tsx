'use client'

import { Button, Callout, Checkbox, Field, Input, Panel, StatusPill } from '@indus/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import {
  deleteCampaignAction,
  duplicateCampaignAction,
  previewCampaignAction,
  saveAsTemplateAction,
  saveCampaignAction,
  sendTestAction,
} from '../../../app/admin/(shell)/newsletter/campaign-actions'
import { emptyDesign, normaliseDesign } from '../../../lib/newsletter/blocks/document'
import type { Design } from '../../../lib/newsletter/blocks/types'
import type { DeliveryCounts } from '../../../lib/newsletter/send'
import { AUDIENCE_LABELS, MAX_CAMPAIGN_LISTS, type CampaignDraft, type CampaignStatus } from '../../../lib/newsletter/campaign'
import AdminPageShell from '../AdminPageShell'
import RichTextEditor from '../rich-text/RichTextEditor'
import BlockDesigner from './BlockDesigner'
import CampaignSendPanel from './CampaignSendPanel'

type Props = {
  id: string
  initial: CampaignDraft
  status: CampaignStatus
  statusLabel: string
  editable: boolean
  canSend: boolean
  lists: { id: string; name: string }[]
  initialProblems: Record<string, string>
  initialAudienceSize: number
  from: string
  replyTo: string
  testSentAt: string | null
  send: {
    maxPerHour: number
    dryRun: boolean
    scheduledAt: string | null
    startedAt: string | null
    sentAt: string | null
    counts: DeliveryCounts | null
  }
}

const AUTOSAVE_MS = 1500
const PREVIEW_MS = 700

/**
 * The newsletter editor: subject and preview text, who it goes to, the body
 * (blocks or rich text), a live preview, a test send, and the list of what
 * still stops it from being sent. Autosaves; every save returns the server's
 * own verdict on what is missing, so the panel never trusts the browser.
 */
export default function Composer(props: Props) {
  const { id, editable } = props
  const router = useRouter()
  const [draft, setDraft] = useState<CampaignDraft>(() => ({
    ...props.initial,
    design: props.initial.format === 'blocks' ? normaliseDesign(props.initial.design ?? emptyDesign()) : props.initial.design,
  }))
  const [problems, setProblems] = useState(props.initialProblems)
  const [size, setSize] = useState(props.initialAudienceSize)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState<{ html: string; subject: string; missing: number } | null>(null)
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop')
  const [previewFor, setPreviewFor] = useState<'subscriber' | 'list'>('subscriber')
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(draft)
  useEffect(() => {
    latest.current = draft
  }, [draft])

  const update = useCallback((patch: Partial<CampaignDraft>) => {
    // Built from the ref, not an updater, so `latest` changes at once (the
    // save in flight compares against it) and nothing impure runs in render.
    const next = { ...latest.current, ...patch }
    latest.current = next
    setDraft(next)
    setDirty(true)
  }, [])

  const save = useCallback(async () => {
    // What this save carries. An edit made while it is in flight must stay
    // dirty — otherwise it is never saved, the bar says "Saved", and the
    // send panel sends the older row.
    const sent = latest.current
    const r = await saveCampaignAction(id, sent)
    if (r.success) {
      setSavedAt(r.data.savedAt)
      setSaveError(null)
      const current = latest.current === sent
      if (current) {
        setProblems(r.data.problems)
        setSize(r.data.audienceSize)
      }
      setDirty(!current)
      if (r.data.unscheduled) router.refresh()
    } else setSaveError(r.message)
    return r.success
  }, [id, router])

  // Autosave after a pause in typing.
  useEffect(() => {
    if (!editable || !dirty) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void save(), AUTOSAVE_MS)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [draft, dirty, editable, save])

  // Live preview, rendered by the server exactly as the email will be.
  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(async () => {
      const r = await previewCampaignAction(latest.current, previewFor)
      if (r.success) setPreview({ html: r.data.html, subject: r.data.subject, missing: r.data.missingRecords })
    }, PREVIEW_MS)
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current)
    }
  }, [draft, previewFor])

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [dirty])

  function run(task: () => Promise<{ success: boolean; message?: string; data?: { message?: string } }>) {
    setNote(null)
    start(async () => {
      const r = await task()
      if (r.success) setNote({ ok: true, text: r.data?.message ?? 'Done.' })
      else setNote({ ok: false, text: r.message ?? 'Something went wrong.' })
    })
  }

  function switchFormat(format: 'blocks' | 'rich') {
    if (format === draft.format) return
    const hasContent = format === 'rich' ? normaliseDesign(draft.design).blocks.length > 0 : draft.bodyHtml.trim() !== ''
    if (hasContent && !window.confirm('Switching discards what is in the current editor. Continue?')) return
    update(format === 'rich' ? { format, design: null, bodyHtml: '' } : { format, design: emptyDesign(), bodyHtml: '' })
  }

  const problemList = useMemo(() => Object.entries(problems), [problems])
  const ready = problemList.length === 0

  const saveLabel = saveError ? 'Not saved' : dirty ? 'Saving…' : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : 'Saved'

  return (
    <AdminPageShell
      title={draft.subject || 'Untitled newsletter'}
      sub={
        <span className="inline-flex items-center gap-2">
          <StatusPill size="sm">{props.statusLabel}</StatusPill>
          {editable ? <span>{saveLabel}</span> : <span>Read only — this newsletter has gone out.</span>}
        </span>
      }
      actions={
        <>
          <Button asChild kind="ghost" size="dense">
            <Link href="/admin/newsletter">All newsletters</Link>
          </Button>
          <Button type="button" kind="outline" size="dense" disabled={pending} onClick={() => run(() => duplicateCampaignAction(id))}>
            Duplicate
          </Button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          {saveError ? <Callout tone="danger">{saveError}</Callout> : null}
          {props.status === 'scheduled' && !props.canSend ? (
            <Callout tone="warning">A manager scheduled this. Any change you make takes it back to a draft, and they will need to schedule it again.</Callout>
          ) : null}

          <Panel>
            <div className="flex flex-col gap-4">
              <Field label="Subject" error={problems.subject} htmlFor="nl-subject">
                <Input id="nl-subject" value={draft.subject} maxLength={200} disabled={!editable} onChange={(e) => update({ subject: e.target.value })} />
              </Field>
              <Field label="Preview text" hint="The line inboxes show after the subject." error={problems.preheader} htmlFor="nl-preheader">
                <Input id="nl-preheader" value={draft.preheader} maxLength={200} disabled={!editable} onChange={(e) => update({ preheader: e.target.value })} />
              </Field>
              <p className="text-[12.5px] text-ih-muted">
                From <span className="font-mono">{props.from}</span> · replies to <span className="font-mono">{props.replyTo}</span>
                {props.canSend ? (
                  <>
                    {' · '}
                    <Link href="/admin/newsletter/settings" className="underline underline-offset-2">change</Link>
                  </>
                ) : null}
              </p>
            </div>
          </Panel>

          <Panel>
            <fieldset disabled={!editable} className="flex flex-col gap-3">
              <legend className="mb-2 text-[15px] font-medium text-ih-ink">Who receives it</legend>
              <Checkbox
                label={AUDIENCE_LABELS.all}
                checked={draft.audience === 'all'}
                onChange={(e) => update({ audience: e.target.checked ? 'all' : 'none' })}
              />
              {props.lists.length > 0 ? (
                <div className="flex flex-col gap-1.5 pl-1">
                  <p className="text-[12.5px] text-ih-muted">Lists {draft.audience === 'all' ? '(as well)' : ''}</p>
                  {props.lists.map((l) => (
                    <Checkbox
                      key={l.id}
                      label={l.name}
                      checked={draft.listIds.includes(l.id)}
                      disabled={!draft.listIds.includes(l.id) && draft.listIds.length >= MAX_CAMPAIGN_LISTS}
                      onChange={(e) =>
                        update({ listIds: e.target.checked ? [...draft.listIds, l.id] : draft.listIds.filter((x) => x !== l.id) })
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-ih-muted">
                  No lists yet — <Link href="/admin/newsletter/lists" className="underline underline-offset-2">create one</Link> to mail people beyond the subscribers.
                </p>
              )}
              <p className="text-[13px] text-ih-ink-2">
                Reaches <span className="font-mono">{size.toLocaleString('en-US')}</span> {size === 1 ? 'person' : 'people'} right now, once each, leaving out anyone who unsubscribed or bounced.
              </p>
              {problems.audience ? <p role="alert" className="text-[13px] text-ih-danger-ink">{problems.audience}</p> : null}
            </fieldset>
          </Panel>

          <Panel>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[15px] font-medium text-ih-ink">Content</h2>
              {editable ? (
                <div role="group" aria-label="Editor" className="inline-flex rounded-lg border border-ih-border p-0.5">
                  {(['blocks', 'rich'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={draft.format === f}
                      onClick={() => switchFormat(f)}
                      className={`h-7 rounded-md px-2.5 text-[12.8px] ${draft.format === f ? 'bg-ih-navy text-white' : 'text-ih-ink-2 hover:bg-ih-surface-2'}`}
                    >
                      {f === 'blocks' ? 'Blocks' : 'Rich text'}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {problems.body ? <Callout tone="warning" className="mb-3">{problems.body}</Callout> : null}
            {draft.format === 'blocks' ? (
              <BlockDesigner
                design={normaliseDesign(draft.design) as Design}
                onChange={(design) => update({ design })}
                disabled={!editable}
              />
            ) : (
              <RichTextEditor value={draft.bodyHtml} onChange={(bodyHtml) => update({ bodyHtml })} minHeight={420} ariaLabel="Newsletter body" />
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-4 xl:self-start">
          <Panel>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[15px] font-medium text-ih-ink">Preview</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Preview width" className="inline-flex rounded-lg border border-ih-border p-0.5">
                  {(['desktop', 'phone'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={device === d}
                      onClick={() => setDevice(d)}
                      className={`h-7 rounded-md px-2.5 text-[12.8px] ${device === d ? 'bg-ih-navy text-white' : 'text-ih-ink-2 hover:bg-ih-surface-2'}`}
                    >
                      {d === 'desktop' ? 'Desktop' : 'Phone'}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-1.5 text-[12.5px] text-ih-muted">
                  Footer for
                  <select
                    value={previewFor}
                    onChange={(e) => setPreviewFor(e.target.value === 'list' ? 'list' : 'subscriber')}
                    className="h-7 rounded-md border border-ih-border bg-ih-surface px-1.5 text-[12.5px] text-ih-ink"
                  >
                    <option value="subscriber">a subscriber</option>
                    <option value="list">a list contact</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="mb-2 rounded-md border border-ih-border bg-ih-surface-2 px-3 py-2 text-[12.5px]">
              <p className="truncate text-ih-ink">
                <span className="font-medium">{props.from.replace(/ <.*$/, '')}</span> — {preview?.subject || draft.subject || '(no subject)'}
              </p>
              <p className="truncate text-ih-muted">{draft.preheader || 'No preview text — inboxes will show the first words of the email.'}</p>
            </div>
            {preview && preview.missing > 0 ? (
              <Callout tone="warning" className="mb-2">
                {preview.missing} featured item{preview.missing === 1 ? ' is' : 's are'} not published and left out.
              </Callout>
            ) : null}
            <div className="flex justify-center overflow-hidden rounded-md border border-ih-border bg-ih-bg">
              {preview ? (
                <iframe
                  title="Newsletter preview"
                  // No scripts, no same-origin: the email is shown, never run.
                  sandbox=""
                  srcDoc={preview.html}
                  className={`h-[760px] border-0 bg-white ${device === 'phone' ? 'w-[375px]' : 'w-full'}`}
                />
              ) : (
                <p className="p-6 text-[13px] text-ih-muted">Rendering…</p>
              )}
            </div>
          </Panel>

          <Panel>
            <h2 className="mb-2 text-[15px] font-medium text-ih-ink">Before it goes</h2>
            {ready ? (
              <p className="text-[13.5px] text-ih-success-ink">Nothing missing. Send yourself a test before sending it to everyone.</p>
            ) : (
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[13.5px] text-ih-ink-2">
                {problemList.map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                kind="outline"
                size="dense"
                disabled={pending || !draft.subject.trim()}
                onClick={() =>
                  run(async () => {
                    if (dirty) await save()
                    return sendTestAction(id, latest.current)
                  })
                }
              >
                Send me a test
              </Button>
              <SaveTemplate onSave={(name, description) => run(() => saveAsTemplateAction(id, { name, description }))} disabled={pending} />
              {props.status === 'draft' || props.status === 'cancelled' ? (
                <Button
                  type="button"
                  kind="danger"
                  size="dense"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm('Delete this newsletter? This cannot be undone.')) run(() => deleteCampaignAction(id))
                  }}
                >
                  Delete
                </Button>
              ) : null}
            </div>
            {props.testSentAt ? <p className="mt-2 text-[12.5px] text-ih-muted">Last test sent {new Date(props.testSentAt).toLocaleString()}.</p> : null}
            {note ? (
              <p role={note.ok ? 'status' : 'alert'} className={`mt-2 text-[13px] ${note.ok ? 'text-ih-success-ink' : 'text-ih-danger-ink'}`}>
                {note.text}
              </p>
            ) : null}
          </Panel>

          <CampaignSendPanel id={id} status={props.status} canSend={props.canSend} ready={ready && !dirty} audienceSize={size} {...props.send} />
        </div>
      </div>
    </AdminPageShell>
  )
}

function SaveTemplate({ onSave, disabled }: { onSave: (name: string, description: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  if (!open) {
    return (
      <Button type="button" kind="ghost" size="dense" onClick={() => setOpen(true)} disabled={disabled}>
        Save as template
      </Button>
    )
  }
  return (
    <span className="flex w-full flex-wrap items-end gap-2">
      <Field label="Template name" className="min-w-[180px] flex-1">
        <Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field label="Description" className="min-w-[180px] flex-1">
        <Input value={description} maxLength={400} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Button
        type="button"
        kind="outline"
        size="dense"
        disabled={disabled || !name.trim()}
        onClick={() => {
          onSave(name, description)
          setOpen(false)
          setName('')
          setDescription('')
        }}
      >
        Save
      </Button>
      <Button type="button" kind="ghost" size="dense" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </span>
  )
}
