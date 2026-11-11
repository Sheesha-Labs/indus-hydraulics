'use client'

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  LayoutTemplate,
  Monitor,
  Save,
  Smartphone,
  Trash2,
} from 'lucide-react'
import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Panel,
  StatusPill,
} from '@indus/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react'

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
  lists: { id: string; name: string; count: number }[]
  /** Confirmed subscribers reachable on their own, suppressions out. */
  subscriberCount: number
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

type Step = 'write' | 'audience' | 'review'
const STEPS: { id: Step; label: string }[] = [
  { id: 'write', label: 'Write' },
  { id: 'audience', label: 'Audience' },
  { id: 'review', label: 'Review & send' },
]

const AUTOSAVE_MS = 1500
const PREVIEW_MS = 600

const DATE_TIME = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/**
 * The newsletter editor, in Bazar's three steps — Write, Audience, Review &
 * send — with the email's live preview beside every step.
 *
 * Write is the subject, the preview line and the body (a stack of blocks, or
 * rich text). Audience is who it goes to. Review is what still stops it, a
 * test to yourself, and then scheduling or sending. Moving between steps
 * saves first; edits also autosave after a pause, and every save returns the
 * server's own verdict on what is missing, so nothing trusts the browser.
 */
export default function Composer(props: Props) {
  const { id, editable } = props
  const router = useRouter()
  const [step, setStep] = useState<Step>(editable ? 'write' : 'review')
  const [draft, setDraft] = useState<CampaignDraft>(() => ({
    ...props.initial,
    design: props.initial.format === 'blocks' ? normaliseDesign(props.initial.design ?? emptyDesign()) : props.initial.design,
  }))
  const [problems, setProblems] = useState(props.initialProblems)
  const [size, setSize] = useState(props.initialAudienceSize)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<{ html: string; text: string; subject: string; missing: number } | null>(null)
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop')
  const [previewFor, setPreviewFor] = useState<'subscriber' | 'list'>('subscriber')
  const [plain, setPlain] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [templateOpen, setTemplateOpen] = useState(false)
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
    setSaving(true)
    const r = await saveCampaignAction(id, sent)
    setSaving(false)
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
      if (r.success) setPreview({ html: r.data.html, text: r.data.text, subject: r.data.subject, missing: r.data.missingRecords })
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

  async function goTo(next: Step) {
    if (next === step) return
    if (editable && dirty) {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      await save()
    }
    setStep(next)
  }

  function switchFormat(format: 'blocks' | 'rich') {
    if (format === draft.format) return
    const hasContent = format === 'rich' ? normaliseDesign(draft.design).blocks.length > 0 : draft.bodyHtml.trim() !== ''
    if (hasContent && !window.confirm('Switching discards what is in the current editor. Continue?')) return
    update(format === 'rich' ? { format, design: null, bodyHtml: '' } : { format, design: emptyDesign(), bodyHtml: '' })
  }

  const problemList = useMemo(() => Object.entries(problems), [problems])
  const ready = problemList.length === 0
  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const fromName = props.from.replace(/ <.*$/, '')

  return (
    <AdminPageShell
      title={draft.subject || 'Untitled newsletter'}
      breadcrumbs={
        <span className="inline-flex min-w-0 items-center gap-1">
          <Link href="/admin/newsletter">Content · Newsletter</Link>
          <ChevronRight size={11} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{draft.subject || 'Untitled newsletter'}</span>
        </span>
      }
      actions={
        <>
          <Button type="button" kind="ghost" size="dense" icon={<Copy size={14} aria-hidden />} disabled={pending} onClick={() => run(() => duplicateCampaignAction(id))}>
            Duplicate
          </Button>
          <StatusPill size="sm">{props.statusLabel}</StatusPill>
        </>
      }
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* The three steps. A done step shows a tick; any can be opened. */}
          <nav aria-label="Newsletter steps" className="flex flex-wrap items-center gap-2">
            {STEPS.map((s, i) => {
              const current = s.id === step
              const done = i < stepIndex
              return (
                <span key={s.id} className="flex items-center gap-2">
                  {i > 0 ? <ChevronRight size={15} aria-hidden="true" className="text-ih-muted" /> : null}
                  <button
                    type="button"
                    aria-current={current ? 'step' : undefined}
                    onClick={() => void goTo(s.id)}
                    className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft ${
                      current
                        ? 'border-ih-navy bg-ih-navy font-medium text-ih-bg'
                        : 'border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-border-strong hover:text-ih-ink'
                    }`}
                  >
                    {done ? (
                      <Check size={14} aria-hidden="true" />
                    ) : (
                      <span className={`tabular-nums text-[12.5px] ${current ? 'text-ih-bg/75' : 'text-ih-muted'}`}>{i + 1}</span>
                    )}
                    {s.label}
                  </button>
                </span>
              )
            })}
          </nav>

          {saveError ? <Callout tone="danger">{saveError}</Callout> : null}
          {props.status === 'scheduled' && !props.canSend ? (
            <Callout tone="warning">A manager scheduled this. Any change you make takes it back to a draft, and they will need to schedule it again.</Callout>
          ) : null}
          {!editable ? <Callout tone="info">This newsletter has gone out. It can be read and duplicated, not changed.</Callout> : null}

          {step === 'write' ? (
            <Panel className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Newsletter</SectionLabel>
                <p className="text-[13px] text-ih-muted">One edition, sent to everyone in the audience you choose next.</p>
              </div>
              <Field label="Subject" error={problems.subject} htmlFor="nl-subject">
                <Input id="nl-subject" value={draft.subject} maxLength={200} disabled={!editable} onChange={(e) => update({ subject: e.target.value })} />
              </Field>
              <Field label="Preview line" hint="The line inboxes show after the subject." error={problems.preheader} htmlFor="nl-preheader">
                <Input id="nl-preheader" value={draft.preheader} maxLength={200} disabled={!editable} onChange={(e) => update({ preheader: e.target.value })} />
              </Field>

              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ih-ink">{draft.format === 'blocks' ? 'Blocks' : 'Body'}</span>
                  {editable ? (
                    <div role="group" aria-label="Editor" className="inline-flex rounded-md border border-ih-border bg-ih-surface p-0.5">
                      {(['blocks', 'rich'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          aria-pressed={draft.format === f}
                          onClick={() => switchFormat(f)}
                          className={`h-7 rounded px-2.5 text-[12.5px] transition-colors ${draft.format === f ? 'bg-ih-navy font-medium text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2'}`}
                        >
                          {f === 'blocks' ? 'Blocks' : 'Rich text'}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {problems.body ? <Callout tone="warning">{problems.body}</Callout> : null}
                {draft.format === 'blocks' ? (
                  <BlockDesigner design={normaliseDesign(draft.design) as Design} onChange={(design) => update({ design })} disabled={!editable} />
                ) : (
                  <RichTextEditor value={draft.bodyHtml} onChange={(bodyHtml) => update({ bodyHtml })} minHeight={420} ariaLabel="Newsletter body" />
                )}
              </div>
            </Panel>
          ) : null}

          {step === 'audience' ? (
            <Panel className="flex flex-col gap-5">
              <fieldset disabled={!editable} className="flex flex-col gap-3">
                <legend className="contents">
                  <SectionLabel>Subscribers</SectionLabel>
                </legend>
                <p className="text-[13px] leading-relaxed text-ih-muted">
                  Only confirmed subscribers — people who clicked the link in their confirmation email. The list is taken the moment it sends, and anyone
                  who unsubscribes before their copy goes out is skipped.
                </p>
                <ChoiceCard
                  type="radio"
                  name="audience"
                  checked={draft.audience === 'all'}
                  onChange={() => update({ audience: 'all' })}
                  label={AUDIENCE_LABELS.all}
                  count={props.subscriberCount}
                />
                <ChoiceCard type="radio" name="audience" checked={draft.audience === 'none'} onChange={() => update({ audience: 'none' })} label={AUDIENCE_LABELS.none} />
                <Link href="/admin/newsletter/subscribers" className="self-start text-[13px] text-ih-ink-2 underline underline-offset-2 hover:text-ih-ink">
                  See the subscribers
                </Link>
              </fieldset>

              <hr className="border-ih-border" />

              <fieldset disabled={!editable} className="flex flex-col gap-3">
                <legend className="contents">
                  <SectionLabel>Custom lists</SectionLabel>
                </legend>
                <p className="text-[13px] leading-relaxed text-ih-muted">
                  Lists your team uploaded. Someone on a list who is also a subscriber, or on two lists, gets one copy; anyone who ever unsubscribed or
                  bounced is left out.
                </p>
                {props.lists.length > 0 ? (
                  props.lists.map((l) => (
                    <ChoiceCard
                      key={l.id}
                      type="checkbox"
                      checked={draft.listIds.includes(l.id)}
                      disabled={!draft.listIds.includes(l.id) && draft.listIds.length >= MAX_CAMPAIGN_LISTS}
                      onChange={(on) => update({ listIds: on ? [...draft.listIds, l.id] : draft.listIds.filter((x) => x !== l.id) })}
                      label={l.name}
                      count={l.count}
                    />
                  ))
                ) : (
                  <p className="text-[13px] text-ih-muted">
                    No lists yet —{' '}
                    <Link href="/admin/newsletter/lists" className="underline underline-offset-2">
                      create one
                    </Link>{' '}
                    to mail people beyond the subscribers.
                  </p>
                )}
                <p className="rounded-md bg-ih-surface-2 px-4 py-3 text-[13.5px] text-ih-ink">
                  Reaches <span className="tabular-nums">{size.toLocaleString('en-US')}</span> {size === 1 ? 'person' : 'people'}, each once.
                </p>
                {problems.audience ? (
                  <p role="alert" className="text-[13px] text-ih-danger-ink">
                    {problems.audience}
                  </p>
                ) : null}
              </fieldset>
            </Panel>
          ) : null}

          {step === 'review' ? (
            <>
              <Panel className="flex flex-col gap-4">
                <SectionLabel>Review</SectionLabel>
                <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[13.5px]">
                  <dt className="text-ih-muted">Subject</dt>
                  <dd className="text-ih-ink">{draft.subject || '—'}</dd>
                  <dt className="text-ih-muted">Preview line</dt>
                  <dd className="text-ih-ink-2">{draft.preheader || '—'}</dd>
                  <dt className="text-ih-muted">Audience</dt>
                  <dd className="text-ih-ink-2">
                    {AUDIENCE_LABELS[draft.audience]}
                    {draft.listIds.length ? ` + ${draft.listIds.length} list${draft.listIds.length === 1 ? '' : 's'}` : ''} ·{' '}
                    <span className="tabular-nums">{size.toLocaleString('en-US')}</span> {size === 1 ? 'person' : 'people'}
                  </dd>
                  <dt className="text-ih-muted">From</dt>
                  <dd className="break-words text-ih-ink-2">
                    {props.from}
                    {props.canSend ? (
                      <>
                        {' · '}
                        <Link href="/admin/newsletter/settings" className="underline underline-offset-2">
                          change
                        </Link>
                      </>
                    ) : null}
                  </dd>
                  <dt className="text-ih-muted">Reply-to</dt>
                  <dd className="break-words text-ih-ink-2">{props.replyTo}</dd>
                </dl>

                {ready ? (
                  <Callout tone="success">Ready. Send yourself a test before sending it to everyone.</Callout>
                ) : (
                  <Callout tone="warning" title="Before it can go">
                    <ul className="flex list-disc flex-col gap-1 pl-5">
                      {problemList.map(([k, v]) => (
                        <li key={k}>{v}</li>
                      ))}
                    </ul>
                  </Callout>
                )}

                <div className="flex flex-wrap items-center gap-2">
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
                  {props.testSentAt ? <span className="text-[12.5px] text-ih-muted">Last test sent {DATE_TIME.format(new Date(props.testSentAt))}.</span> : null}
                </div>
              </Panel>

              <CampaignSendPanel id={id} status={props.status} canSend={props.canSend} ready={ready && !dirty} audienceSize={size} {...props.send} />
            </>
          ) : null}

          {note ? (
            <p role={note.ok ? 'status' : 'alert'} className={`text-[13px] ${note.ok ? 'text-ih-success-ink' : 'text-ih-danger-ink'}`}>
              {note.text}
            </p>
          ) : null}

          {/* Bazar's footer: back, the save state, next, save as template, delete. */}
          {editable ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {stepIndex > 0 ? (
                  <Button type="button" kind="ghost" size="md" icon={<ChevronLeft size={15} aria-hidden />} onClick={() => void goTo(STEPS[stepIndex - 1]!.id)}>
                    Back
                  </Button>
                ) : null}
                <Button
                  type="button"
                  kind="outline"
                  size="md"
                  icon={<Save size={15} aria-hidden />}
                  disabled={!dirty || saving}
                  onClick={() => {
                    if (saveTimer.current) clearTimeout(saveTimer.current)
                    void save()
                  }}
                >
                  {saving ? 'Saving…' : dirty ? 'Save draft' : 'Saved'}
                </Button>
                {stepIndex < STEPS.length - 1 ? (
                  <Button type="button" kind="primary" size="md" iconAfter={<ChevronRight size={15} aria-hidden />} onClick={() => void goTo(STEPS[stepIndex + 1]!.id)}>
                    Next
                  </Button>
                ) : null}
                {draft.format === 'blocks' ? (
                  <Button type="button" kind="outline" size="md" icon={<LayoutTemplate size={15} aria-hidden />} disabled={pending} onClick={() => setTemplateOpen(true)}>
                    Save as template
                  </Button>
                ) : null}
                {props.status === 'draft' || props.status === 'cancelled' ? (
                  <Button
                    type="button"
                    kind="ghost"
                    size="md"
                    className="ml-auto text-ih-muted hover:text-ih-danger-ink"
                    icon={<Trash2 size={14} aria-hidden />}
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm('Delete this draft? This cannot be undone.')) run(() => deleteCampaignAction(id))
                    }}
                  >
                    Delete draft
                  </Button>
                ) : null}
              </div>
              <p className="text-[12.5px] text-ih-muted">
                {saveError ? 'Not saved.' : dirty ? 'You have unsaved changes.' : savedAt ? `Last saved ${DATE_TIME.format(new Date(savedAt))}.` : 'Saved.'}
              </p>
            </div>
          ) : null}
        </div>

        {/* The preview: sticky beside every step. */}
        <div className="min-w-0 xl:sticky xl:top-0">
          <div className="overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
            <div className="flex flex-wrap items-center gap-2 border-b border-ih-border px-3 py-2.5">
              <Segmented
                label="Preview as"
                value={previewFor}
                onChange={(v) => setPreviewFor(v)}
                options={[
                  { value: 'subscriber', label: 'Subscriber' },
                  { value: 'list', label: 'List contact' },
                ]}
              />
              <button
                type="button"
                aria-pressed={plain}
                onClick={() => setPlain((v) => !v)}
                className={`h-8 rounded-md border px-3 text-[12.5px] transition-colors ${
                  plain ? 'border-ih-navy bg-ih-navy text-ih-bg' : 'border-ih-border text-ih-ink-2 hover:border-ih-border-strong'
                }`}
              >
                Plain text
              </button>
              <div role="group" aria-label="Preview width" className="ml-auto inline-flex rounded-md border border-ih-border p-0.5">
                {(
                  [
                    ['desktop', Monitor, 'Desktop'],
                    ['phone', Smartphone, 'Phone'],
                  ] as const
                ).map(([d, Icon, label]) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={device === d}
                    aria-label={label}
                    title={label}
                    onClick={() => setDevice(d)}
                    className={`grid h-7 w-8 place-items-center rounded ${device === d ? 'bg-ih-navy text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2'}`}
                  >
                    <Icon size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-ih-border px-5 py-4">
              <p className="mb-2.5 text-[15px] font-medium text-ih-ink">{preview?.subject || draft.subject || '(no subject)'}</p>
              <dl className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-3 gap-y-1 text-[13px]">
                <dt className="text-ih-muted">From</dt>
                <dd className="truncate text-ih-ink-2">{props.from}</dd>
                <dt className="text-ih-muted">Reply-to</dt>
                <dd className="truncate text-ih-ink-2">{props.replyTo}</dd>
                <dt className="text-ih-muted">To</dt>
                <dd className="truncate text-ih-ink-2">{previewFor === 'list' ? 'contact@example.com' : 'subscriber@example.com'}</dd>
              </dl>
              {!draft.preheader ? <p className="mt-2 text-[12px] text-ih-muted">No preview line — inboxes will show the first words of the email.</p> : null}
            </div>

            {preview && preview.missing > 0 ? (
              <div className="px-4 pt-3">
                <Callout tone="warning">
                  {preview.missing} featured item{preview.missing === 1 ? ' is' : 's are'} not published and left out.
                </Callout>
              </div>
            ) : null}

            <div className="flex justify-center bg-ih-bg p-4">
              {!preview ? (
                <p className="p-6 text-[13px] text-ih-muted">Rendering…</p>
              ) : plain ? (
                <pre className="max-h-[1100px] w-full overflow-auto whitespace-pre-wrap rounded-md border border-ih-border bg-ih-surface p-5 font-sans text-[13px] leading-relaxed text-ih-ink-2">
                  {preview.text}
                </pre>
              ) : (
                <iframe
                  title={`Newsletter preview — ${fromName}`}
                  // No scripts, no same-origin: the email is shown, never run.
                  sandbox=""
                  srcDoc={preview.html}
                  className={`h-[1100px] border-0 bg-white ${device === 'phone' ? 'w-[375px] rounded-md' : 'w-full'}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <SaveTemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        defaultName={draft.subject}
        disabled={pending}
        onSave={(name, description) => {
          setTemplateOpen(false)
          run(() => saveAsTemplateAction(id, { name, description }))
        }}
      />
    </AdminPageShell>
  )
}

/** Small uppercase section label — Bazar's "NEWSLETTER" / "SUBSCRIBERS". Geist, never mono. */
function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-ih-muted">{children}</p>
}

/** A bordered option row: radio or checkbox, label, and a count on the right. */
function ChoiceCard({
  type,
  name,
  checked,
  disabled,
  onChange,
  label,
  count,
}: {
  type: 'radio' | 'checkbox'
  name?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  label: string
  count?: number
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 text-[14px] transition-colors ${
        checked ? 'border-ih-navy bg-ih-surface-2 shadow-[inset_0_0_0_1px_var(--color-ih-navy)]' : 'border-ih-border bg-ih-surface hover:border-ih-border-strong'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-[var(--color-ih-navy)]"
      />
      <span className="flex-1 text-ih-ink">{label}</span>
      {count !== undefined ? <span className="tabular-nums text-[13px] text-ih-muted">{count.toLocaleString('en-US')}</span> : null}
    </label>
  )
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-ih-border p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-7 rounded px-2.5 text-[12.5px] transition-colors ${value === o.value ? 'bg-ih-navy font-medium text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SaveTemplateDialog({
  open,
  onOpenChange,
  defaultName,
  disabled,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultName: string
  disabled: boolean
  onSave: (name: string, description: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) {
          setName(defaultName)
          setDescription('')
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>Saves the blocks, subject and preview line as they are now. New newsletters can start from it.</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Field label="Name" htmlFor="tpl-name">
            <Input id="tpl-name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <Field label="Description" hint="Optional — what it is for." htmlFor="tpl-desc">
            <Input id="tpl-desc" value={description} maxLength={400} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button type="button" kind="ghost" size="dense" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" kind="primary" size="dense" disabled={disabled || !name.trim()} onClick={() => onSave(name.trim(), description.trim())}>
            Save template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
