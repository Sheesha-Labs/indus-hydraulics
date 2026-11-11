'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ExternalLink, ImageIcon } from 'lucide-react'
import { Button, CharCounter, Checkbox, Field, Input, Panel, Select, Textarea } from '@indus/ui'
import EditorSection from '../../../../../components/admin/EditorSection'
import { STATUS_LABEL, STATUS_STYLE } from '../../../../../lib/blog-status'
import { updateServiceCase } from '../actions'

export type ServiceCaseRow = {
  id: string
  status: string
  isFeatured: boolean
  title: string
  titleAccent: string | null
  deck: string
  topicLabel: string
  region: string | null
  caseDateLabel: string | null
  cardOneLiner: string | null
  cardTagLabel: string
  cardTagStyle: string
  cardDurationLabel: string | null
  durationDays: number | null
  savingsAmount: number | null
  seoTitle: string | null
  seoDescription: string | null
  robotsIndex: boolean
}

/** Read-only facts for the rail. None of these are written by this form. */
export type ServiceCaseMeta = {
  slug: string
  caseNumber: string
  categoryLabel: string
  publishedAt: string | null
  updatedAt: string
  heroUrl: string | null
  heroAlt: string | null
  savingsCurrency: string | null
}

const DATE_TIME = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** The save action's hard limits (UpdateServiceCaseSchema in ../actions). */
const SEO_TITLE_MAX = 180
const SEO_DESCRIPTION_MAX = 320

/**
 * Said before Save, not after. Older cases were written by import scripts with
 * no length check, so a description can already be past the limit — and then
 * every save of the case is refused, whichever field you changed.
 */
function tooLong(value: string, max: number): string | undefined {
  return value.length > max
    ? `${value.length} characters — the limit is ${max}, so saving will be refused until this is shortened.`
    : undefined
}

function fmt(iso: string | null): string {
  return iso ? DATE_TIME.format(new Date(iso)) : '—'
}

/**
 * What actually gets edited after a case is written, laid out the way the
 * blog editor is: white section cards on the canvas, sentence-case labels with
 * a hint saying where each field shows on the site, and a sticky publish rail.
 *
 * The article body is not here on purpose: `bodyBlocks` has its own typed
 * schema and deserves the treatment the blog editor got rather than a JSON
 * textarea that can silently produce an unrenderable block. Field names are
 * unchanged — `updateServiceCase` reads the same FormData keys as before.
 */
export default function ServiceCaseForm({ row, meta }: { row: ServiceCaseRow; meta: ServiceCaseMeta }) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState(row.status)
  const [seoTitle, setSeoTitle] = useState(row.seoTitle ?? '')
  const [seoDescription, setSeoDescription] = useState(row.seoDescription ?? '')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await updateServiceCase(formData)
      if (result.success) {
        setMessage(
          formData.get('status') === 'published'
            ? `Saved at ${new Date().toLocaleTimeString()}. The case and the index are live.`
            : `Saved at ${new Date().toLocaleTimeString()}.`,
        )
        router.refresh()
      } else {
        setError(result.message)
      }
    })
  }

  const savedStatus = row.status as keyof typeof STATUS_LABEL

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="id" value={row.id} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <EditorSection title="Hero" description="The top of the case page: title, deck and the pills above them.">
            <Field label={<Required>Title</Required>} htmlFor="sc-title">
              <Input id="sc-title" name="title" defaultValue={row.title} required className="h-10 text-[15px] font-medium" />
            </Field>
            <Field
              label="Title accent"
              htmlFor="sc-titleAccent"
              hint="A phrase from the title to set in the italic accent. Leave blank for none."
            >
              <Input id="sc-titleAccent" name="titleAccent" defaultValue={row.titleAccent ?? ''} />
            </Field>
            <Field label={<Required>Deck</Required>} htmlFor="sc-deck" hint="The serif paragraph under the title.">
              <Textarea id="sc-deck" name="deck" defaultValue={row.deck} rows={3} required />
            </Field>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label={<Required>Topic pill</Required>}
                htmlFor="sc-topicLabel"
                hint="e.g. Cylinders · Hoses · Oilfield"
              >
                <Input id="sc-topicLabel" name="topicLabel" defaultValue={row.topicLabel} required />
              </Field>
              <Field label="Region pill" htmlFor="sc-region" hint="e.g. 🇦🇪 UAE · Jebel Ali">
                <Input id="sc-region" name="region" defaultValue={row.region ?? ''} />
              </Field>
            </div>
            <Field label="Date line" htmlFor="sc-caseDateLabel" hint="The meta line in the hero, e.g. MAR 2026 · BAY 2 / ON-SITE">
              <Input id="sc-caseDateLabel" name="caseDateLabel" defaultValue={row.caseDateLabel ?? ''} />
            </Field>
          </EditorSection>

          <EditorSection title="Index card" description="How the case appears in the grid on /services.">
            <Field label="One-liner" htmlFor="sc-cardOneLiner" hint="Under the card heading. Leave blank to use the deck.">
              <Textarea id="sc-cardOneLiner" name="cardOneLiner" defaultValue={row.cardOneLiner ?? ''} rows={2} />
            </Field>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label={<Required>Tag label</Required>}
                htmlFor="sc-cardTagLabel"
                hint="On the card image, e.g. OILFIELD. Independent of the category."
              >
                <Input id="sc-cardTagLabel" name="cardTagLabel" defaultValue={row.cardTagLabel} required />
              </Field>
              <Field label="Tag style" htmlFor="sc-cardTagStyle" hint="Oil uses the dark oilfield tag.">
                <Select id="sc-cardTagStyle" name="cardTagStyle" defaultValue={row.cardTagStyle}>
                  <option value="standard">Standard</option>
                  <option value="oil">Oil</option>
                </Select>
              </Field>
            </div>
            <Field label="Duration overlay" htmlFor="sc-cardDurationLabel" hint="Over the card image, e.g. 96 H ON BENCH.">
              <Input id="sc-cardDurationLabel" name="cardDurationLabel" defaultValue={row.cardDurationLabel ?? ''} />
            </Field>
          </EditorSection>

          <EditorSection title="Sorting" description="Used by the “fastest turnaround” and “biggest saving” views. Blank sorts last.">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Turnaround (days)" htmlFor="sc-durationDays">
                <Input
                  id="sc-durationDays"
                  name="durationDays"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  defaultValue={row.durationDays?.toString() ?? ''}
                />
              </Field>
              <Field
                label="Savings amount"
                htmlFor="sc-savingsAmount"
                hint={
                  meta.savingsCurrency
                    ? `In ${meta.savingsCurrency} minor units (fils / cents), whole numbers.`
                    : 'In minor units (fils / cents), whole numbers.'
                }
              >
                <Input
                  id="sc-savingsAmount"
                  name="savingsAmount"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  defaultValue={row.savingsAmount?.toString() ?? ''}
                />
              </Field>
            </div>
          </EditorSection>

          <EditorSection title="SEO" description="Search result title and description. Both fall back to the case title and deck.">
            <Field
              label={
                <span className="flex items-center justify-between gap-3">
                  Meta title
                  <CharCounter value={seoTitle} min={30} max={60} />
                </span>
              }
              htmlFor="sc-seoTitle"
              error={tooLong(seoTitle, SEO_TITLE_MAX)}
            >
              <Input id="sc-seoTitle" name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </Field>
            <Field
              label={
                <span className="flex items-center justify-between gap-3">
                  Meta description
                  <CharCounter value={seoDescription} min={70} max={160} />
                </span>
              }
              htmlFor="sc-seoDescription"
              error={tooLong(seoDescription, SEO_DESCRIPTION_MAX)}
            >
              <Textarea
                id="sc-seoDescription"
                name="seoDescription"
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </Field>
            <Checkbox name="robotsIndex" defaultChecked={row.robotsIndex} label="Allow search engines to index this case" />
          </EditorSection>
        </div>

        <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
          <Panel padding="rail" className="flex flex-col gap-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ih-muted">Publish</p>

            <dl className="flex flex-col gap-2 text-[13px]">
              <Row label="Status">
                <span
                  className={`inline-flex h-[22px] items-center rounded-full px-2 text-[11.5px] font-medium ${STATUS_STYLE[savedStatus] ?? ''}`}
                >
                  {STATUS_LABEL[savedStatus] ?? row.status}
                </span>
              </Row>
              <Row label="Case">
                <span className="tabular-nums">{meta.caseNumber}</span>
              </Row>
              <Row label="Category">{meta.categoryLabel}</Row>
              <Row label="First published">{fmt(meta.publishedAt)}</Row>
              <Row label="Last edited">{fmt(meta.updatedAt)}</Row>
            </dl>

            <Field
              label="Set status"
              htmlFor="sc-status"
              hint={
                status === 'published' && !meta.publishedAt
                  ? 'Publishing for the first time stamps today as the published date.'
                  : undefined
              }
            >
              <Select id="sc-status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>

            <div className="flex flex-col gap-1">
              <Checkbox name="isFeatured" defaultChecked={row.isFeatured} label="Case of the week" />
              <p className="pl-[26px] text-[11.5px] text-ih-muted">One slot. Setting this clears whoever holds it.</p>
            </div>

            <Button
              type="submit"
              kind="primary"
              size="md"
              block
              loading={pending}
              icon={pending ? undefined : <CheckCircle2 size={14} strokeWidth={1.8} aria-hidden="true" />}
            >
              {pending ? 'Saving…' : status === 'published' ? 'Save & update live case' : 'Save'}
            </Button>

            {message ? (
              <p role="status" className="text-[12.5px] text-ih-success-ink">
                {message}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="text-[12.5px] text-ih-danger-ink">
                {error}
              </p>
            ) : null}

            {row.status === 'published' ? (
              <a
                href={`/services/${meta.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1 text-[12.5px] text-ih-accent hover:text-ih-navy"
              >
                View on the site
                <ExternalLink size={12} strokeWidth={1.8} aria-hidden="true" />
              </a>
            ) : null}
          </Panel>

          {/* The hero photo shows here so the case is recognisable while you
              edit its words. It is not editable from this screen yet. */}
          <Panel padding="rail" className="flex flex-col gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ih-muted">Hero image</p>
            <div className="grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-md border border-ih-border bg-ih-surface-2">
              {meta.heroUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.heroUrl} alt={meta.heroAlt ?? ''} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} strokeWidth={1.5} aria-hidden="true" className="text-ih-muted" />
              )}
            </div>
            <p className="text-[11.5px] text-ih-muted">
              The hero image, gallery and article body are not editable here yet.
            </p>
          </Panel>
        </aside>
      </div>
    </form>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-ih-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right text-ih-ink-2">{children}</dd>
    </div>
  )
}

/** A required field's label. The marker is quiet; the browser enforces it. */
function Required({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden="true" className="ml-0.5 text-ih-muted">
        *
      </span>
    </>
  )
}
