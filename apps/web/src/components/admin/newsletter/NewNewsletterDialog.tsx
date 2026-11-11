'use client'

import {
  Award,
  Blocks,
  CalendarDays,
  ChevronLeft,
  Factory,
  FileText,
  LayoutTemplate,
  Loader2,
  Mail,
  Megaphone,
  Newspaper,
  Package,
  Plus,
  Rocket,
  Search,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import { Button, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from '@indus/ui'
import { useEffect, useState, useTransition } from 'react'

import { createCampaignAction, searchRecordsAction } from '../../../app/admin/(shell)/newsletter/campaign-actions'
import { BUILT_IN_TEMPLATES, NEEDS_LABEL, type BuiltInTemplate, type BuiltInTemplateId } from '../../../lib/newsletter/template-catalogue'

const ICONS: Record<BuiltInTemplate['icon'], LucideIcon> = {
  rocket: Rocket,
  award: Award,
  package: Package,
  tag: Tag,
  factory: Factory,
  calendar: CalendarDays,
  megaphone: Megaphone,
  blocks: Blocks,
  file: FileText,
  mail: Mail,
  newspaper: Newspaper,
}

type SavedTemplate = { id: string; name: string; description: string }
type Option = { id: string; label: string; hint: string }

/**
 * "New newsletter" — Bazar's dialog. Built-in templates built from blocks,
 * the team's saved templates, and rich-text starters, each a card. A
 * template built around one record (a product launch, a brand spotlight, an
 * industry focus) asks for that record in a second step; the rest create the
 * draft at once and open it (the action redirects).
 */
export default function NewNewsletterDialog({ saved }: { saved: SavedTemplate[] }) {
  const [open, setOpen] = useState(false)
  const [picking, setPicking] = useState<BuiltInTemplate | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, start] = useTransition()

  function create(key: string, input: Parameters<typeof createCampaignAction>[0]) {
    setBusy(key)
    setError(null)
    start(async () => {
      const r = await createCampaignAction(input)
      // On success the action redirects and this never returns.
      if (r && !r.success) {
        setError(r.message)
        setBusy(null)
      }
    })
  }

  function choose(t: BuiltInTemplate) {
    if (t.needs) setPicking(t)
    else create(t.id, { template: t.id as BuiltInTemplateId })
  }

  const blocks = BUILT_IN_TEMPLATES.filter((t) => t.group === 'blocks')
  const rich = BUILT_IN_TEMPLATES.filter((t) => t.group === 'rich')

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (busy) return
        setOpen(o)
        if (!o) {
          setPicking(null)
          setError(null)
        }
      }}
    >
      <Button type="button" kind="primary" size="dense" icon={<Plus size={14} aria-hidden />} onClick={() => setOpen(true)}>
        New newsletter
      </Button>
      <DialogContent className="max-w-4xl">
        {picking ? (
          <RecordStep template={picking} busy={busy !== null} onBack={() => setPicking(null)} onCreate={(recordId) => create(picking.id, { template: picking.id as BuiltInTemplateId, recordId })} error={error} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>New newsletter</DialogTitle>
              <DialogDescription>
                Build it from blocks — a launch mailer, a brand spotlight, an offer, your own layout — or write it as a page of rich text. Products,
                brands and articles fill in from the live site; everything can be changed in the editor.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto">
              {error ? (
                <p role="alert" className="rounded-md bg-ih-danger-soft px-3 py-2 text-[13px] text-ih-danger-ink">
                  {error}
                </p>
              ) : null}
              <Section title="Built from blocks">
                {blocks.map((t) => (
                  <Card key={t.id} icon={ICONS[t.icon]} title={t.label} text={t.description} busy={busy === t.id} disabled={busy !== null} onClick={() => choose(t)} />
                ))}
              </Section>
              {saved.length ? (
                <Section title="Your templates">
                  {saved.map((t) => (
                    <Card
                      key={t.id}
                      icon={LayoutTemplate}
                      title={t.name}
                      text={t.description || 'A saved template.'}
                      busy={busy === t.id}
                      disabled={busy !== null}
                      onClick={() => create(t.id, { templateId: t.id })}
                    />
                  ))}
                </Section>
              ) : null}
              <Section title="Rich text">
                {rich.map((t) => (
                  <Card key={t.id} icon={ICONS[t.icon]} title={t.label} text={t.description} busy={busy === t.id} disabled={busy !== null} onClick={() => choose(t)} />
                ))}
              </Section>
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-[13.5px] font-medium text-ih-ink">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Card({ icon: Icon, title, text, busy, disabled, onClick }: { icon: LucideIcon; title: string; text: string; busy: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy || undefined}
      className="flex items-start gap-3.5 rounded-lg border border-ih-border bg-ih-surface p-4 text-left transition-[border-color,box-shadow] hover:border-ih-border-strong hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft disabled:cursor-default disabled:opacity-60 disabled:hover:shadow-none"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-ih-border bg-ih-surface-2 text-ih-ink-2">
        {busy ? <Loader2 size={17} className="animate-spin motion-reduce:animate-none" aria-hidden /> : <Icon size={17} strokeWidth={1.7} aria-hidden />}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[14px] font-medium text-ih-ink">{title}</span>
        <span className="text-[12.5px] leading-snug text-ih-muted">{text}</span>
      </span>
    </button>
  )
}

/** Step two for a template built around one record: search, pick, create. */
function RecordStep({
  template,
  busy,
  onBack,
  onCreate,
  error,
}: {
  template: BuiltInTemplate
  busy: boolean
  onBack: () => void
  onCreate: (recordId: string) => void
  error: string | null
}) {
  const kind = template.needs!
  const [q, setQ] = useState('')
  const [options, setOptions] = useState<Option[] | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    const t = setTimeout(async () => {
      const r = await searchRecordsAction(kind, q)
      if (!live) return
      if (r.success) {
        setOptions(r.data)
        setSearchError(null)
      } else {
        setOptions([])
        setSearchError(r.message)
      }
    }, 250)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [kind, q])

  return (
    <>
      <DialogHeader>
        <DialogTitle>{template.label}</DialogTitle>
        <DialogDescription>{NEEDS_LABEL[kind].question} The newsletter takes its photo, words and related products from it.</DialogDescription>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-3">
        <div className="relative">
          <Search size={14} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ih-muted" />
          <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={NEEDS_LABEL[kind].placeholder} aria-label={NEEDS_LABEL[kind].placeholder} className="pl-9" autoFocus />
        </div>
        <div role="radiogroup" aria-label={NEEDS_LABEL[kind].question} className="flex max-h-[45vh] flex-col gap-1.5 overflow-y-auto">
          {options === null ? <p className="text-[13px] text-ih-muted">Loading…</p> : null}
          {options && options.length === 0 && !searchError ? <p className="text-[13px] text-ih-muted">Nothing published matches “{q}”.</p> : null}
          {options?.map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-colors ${
                picked === o.id ? 'border-ih-navy bg-ih-surface-2 shadow-[inset_0_0_0_1px_var(--color-ih-navy)]' : 'border-ih-border hover:border-ih-border-strong'
              }`}
            >
              <input type="radio" name="template-record" checked={picked === o.id} onChange={() => setPicked(o.id)} className="h-4 w-4 accent-[var(--color-ih-navy)]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] text-ih-ink">{o.label}</span>
                {o.hint ? <span className="block truncate text-[12px] text-ih-muted">{o.hint}</span> : null}
              </span>
            </label>
          ))}
        </div>
        {searchError || error ? (
          <p role="alert" className="text-[13px] text-ih-danger-ink">
            {error ?? searchError}
          </p>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button type="button" kind="ghost" size="dense" icon={<ChevronLeft size={14} aria-hidden />} onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button type="button" kind="primary" size="dense" loading={busy} disabled={!picked || busy} onClick={() => picked && onCreate(picked)}>
          Create
        </Button>
      </DialogFooter>
    </>
  )
}
