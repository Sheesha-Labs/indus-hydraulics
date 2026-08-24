'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Plus, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AdminSectionHead, Button, FormFooter } from '@indus/ui'
import {
  diffNavDraft,
  isEmptyDiff,
  FOOTER_LEGAL_YEAR_TOKEN,
  FOOTER_SOCIAL_PLATFORMS,
  FOOTER_SOCIAL_PLATFORM_LABELS,
  guessFooterSocialPlatform,
  NAV_SURFACES,
  type FooterSocialPlatform,
  type NavDraftItem,
} from '@indus/domain'
import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import NavTreeEditor, { useUnsavedGuard } from '../../../../../components/admin/nav/NavTreeEditor'
import { saveFooter } from './actions'

/**
 * The footer, on one screen, under Navigation.
 *
 * The footer is the one navigation surface that is more than a menu: it also
 * carries the brand blurb, the contact block, the social row and the copyright
 * line, none of which are `nav_menu_items`. That is why it gets a screen of
 * its own rather than the generic per-menu one — and why its two menus are not
 * separately editable, since saving half a footer is not a thing an editor
 * should be able to do.
 *
 * The link columns and the bottom-bar links use the same `NavTreeEditor` as
 * the megamenu and the header, so the tree behaves identically everywhere.
 */

export type FooterSocialData = {
  label: string
  platform: FooterSocialPlatform
  href: string
  isVisible: boolean
}

export type FooterScreenData = {
  brand: { tagline: string; certificationLine: string }
  contact: {
    contactLocationLabel: string
    contactPhone: string
    contactEmail: string
    contactHours: string
  }
  legal: { footerLegalLine: string }
  socials: FooterSocialData[]
  columnsMenuId: string
  columns: NavDraftItem[]
  legalMenuId: string
  legalLinks: NavDraftItem[]
}

type LocalSocial = FooterSocialData & { uid: string }

let socialUid = 0
function withUid(row: FooterSocialData): LocalSocial {
  socialUid += 1
  return { ...row, uid: `social-${socialUid}` }
}

/**
 * Drop the row key React needs from the payload the server takes.
 *
 * Written out rather than rest-destructured, so a field added to
 * `FooterSocialData` later has to be added here too instead of arriving in the
 * request body by accident.
 */
function toSocialPayload(rows: LocalSocial[]): FooterSocialData[] {
  return rows.map((row) => ({
    label: row.label,
    platform: row.platform,
    href: row.href,
    isVisible: row.isVisible,
  }))
}

const FIELD =
  'h-9 w-full px-3 border border-ih-border bg-ih-bg text-[13px] rounded-sm outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft disabled:opacity-50 disabled:cursor-not-allowed'

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-muted"
    >
      {children}
    </label>
  )
}

function Card({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-ih-border bg-ih-surface p-6">
      <AdminSectionHead variant="panel" title={title} description={description} actions={actions} />
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

export default function FooterScreen({
  data,
  canEditSettings,
  legalFallbackEntity,
}: {
  data: FooterScreenData
  canEditSettings: boolean
  legalFallbackEntity: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const [brand, setBrand] = useState(data.brand)
  const [contact, setContact] = useState(data.contact)
  const [legalLine, setLegalLine] = useState(data.legal.footerLegalLine)
  const [socials, setSocials] = useState<LocalSocial[]>(() => data.socials.map(withUid))
  const [columns, setColumns] = useState(data.columns)
  const [legalLinks, setLegalLinks] = useState(data.legalLinks)

  const columnsDiff = useMemo(() => diffNavDraft(data.columns, columns), [data.columns, columns])
  const legalDiff = useMemo(
    () => diffNavDraft(data.legalLinks, legalLinks),
    [data.legalLinks, legalLinks],
  )

  const settingsSnapshot = JSON.stringify({ brand, contact, legalLine })
  const socialsSnapshot = JSON.stringify(toSocialPayload(socials))
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({
      settings: JSON.stringify({
        brand: data.brand,
        contact: data.contact,
        legalLine: data.legal.footerLegalLine,
      }),
      socials: JSON.stringify(data.socials),
    }),
  )
  const current = JSON.stringify({ settings: settingsSnapshot, socials: socialsSnapshot })

  const isDirty =
    current !== baseline || !isEmptyDiff(columnsDiff) || !isEmptyDiff(legalDiff)
  useUnsavedGuard(isDirty)

  function onSave() {
    setError(null)
    startTransition(async () => {
      const result = await saveFooter({
        brand,
        contact,
        legal: { footerLegalLine: legalLine },
        socials: toSocialPayload(socials),
        columnsMenuId: data.columnsMenuId,
        columns,
        legalMenuId: data.legalMenuId,
        legalLinks,
      })
      if (!result.success) {
        setError(
          result.fieldErrors
            ? `${result.message} — ${Object.values(result.fieldErrors).flat().join('; ')}`
            : result.message,
        )
        return
      }
      setBaseline(current)
      setSavedAt(new Date().toLocaleTimeString())
      // Re-read so rows created in this save pick up their real ids.
      router.refresh()
    })
  }

  return (
    <AdminPageShell
      title="Footer"
      breadcrumbs={
        <Link href="/admin/navigation" className="hover:text-ih-ink">
          Content · Navigation
        </Link>
      }
      sub="Everything below the page, on every public route."
      actions={
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ih-muted hover:text-ih-ink"
        >
          View on site <ExternalLink size={12} />
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        {!canEditSettings && (
          <p className="rounded-md border border-ih-border bg-ih-bg px-4 py-3 text-[12.5px] text-ih-muted">
            Your role can edit the footer’s link columns, social profiles and bottom-bar links. The
            brand blurb, contact details and copyright line are shared with the contact page and the
            site’s structured data, so they need a manager or administrator.
          </p>
        )}

        <Card
          title="Brand block"
          description="The first column, under the footer logo. Set the logo itself in Settings → Brand."
        >
          <div>
            <FieldLabel htmlFor="footer-tagline">Blurb</FieldLabel>
            <textarea
              id="footer-tagline"
              rows={2}
              maxLength={240}
              disabled={!canEditSettings}
              value={brand.tagline}
              onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
              className={`${FIELD} h-auto py-2 leading-relaxed`}
              placeholder="One sentence on who the company is and where it trades."
            />
          </div>
          <div>
            <FieldLabel htmlFor="footer-certification">Certification line</FieldLabel>
            <input
              id="footer-certification"
              maxLength={120}
              disabled={!canEditSettings}
              value={brand.certificationLine}
              onChange={(e) => setBrand({ ...brand, certificationLine: e.target.value })}
              className={FIELD}
              placeholder="ISO 9001:2015 Certified"
            />
          </div>
        </Card>

        <Card
          title="Link columns"
          description="One column per heading. Drag to reorder columns or the links inside them."
        >
          <NavTreeEditor
            surface={NAV_SURFACES.footer_main}
            items={columns}
            onChange={setColumns}
            emptyHint="No columns. The footer renders the brand and contact blocks alone."
          />
        </Card>

        <Card
          title="Contact block"
          description="The last column. These four fields are also the contact page’s and the site’s structured data — editing them here changes them everywhere."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="footer-location">Location label</FieldLabel>
              <input
                id="footer-location"
                maxLength={80}
                disabled={!canEditSettings}
                value={contact.contactLocationLabel}
                onChange={(e) => setContact({ ...contact, contactLocationLabel: e.target.value })}
                className={FIELD}
                placeholder="Dubai HQ"
              />
            </div>
            <div>
              <FieldLabel htmlFor="footer-hours">Hours</FieldLabel>
              <input
                id="footer-hours"
                maxLength={120}
                disabled={!canEditSettings}
                value={contact.contactHours}
                onChange={(e) => setContact({ ...contact, contactHours: e.target.value })}
                className={FIELD}
                placeholder="Mon–Fri 09:00–18:00 GST"
              />
            </div>
            <div>
              <FieldLabel htmlFor="footer-phone">Phone</FieldLabel>
              <input
                id="footer-phone"
                maxLength={40}
                disabled={!canEditSettings}
                value={contact.contactPhone}
                onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
                className={FIELD}
                placeholder="+971 52 2477942"
              />
            </div>
            <div>
              <FieldLabel htmlFor="footer-email">Email</FieldLabel>
              <input
                id="footer-email"
                type="email"
                maxLength={160}
                disabled={!canEditSettings}
                value={contact.contactEmail}
                onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
                className={FIELD}
                placeholder="sales@indushydraulics.me"
              />
            </div>
          </div>
        </Card>

        <Card
          title="Social profiles"
          description="Drawn as icons under the brand block, and published as the company’s sameAs in the site’s structured data — which is how a search engine connects this site to those accounts."
          actions={
            <Button
              type="button"
              size="dense-sm"
              icon={<Plus size={13} />}
              onClick={() =>
                setSocials((prev) => [
                  ...prev,
                  withUid({ label: '', platform: 'other', href: '', isVisible: true }),
                ])
              }
            >
              Add profile
            </Button>
          }
        >
          <SocialList socials={socials} onChange={setSocials} />
        </Card>

        <Card title="Bottom bar" description="The copyright line and the small links beside it.">
          <div>
            <FieldLabel htmlFor="footer-legal-line">Copyright line</FieldLabel>
            <input
              id="footer-legal-line"
              maxLength={240}
              disabled={!canEditSettings}
              value={legalLine}
              onChange={(e) => setLegalLine(e.target.value)}
              className={FIELD}
              placeholder={`© ${FOOTER_LEGAL_YEAR_TOKEN} ${legalFallbackEntity}. All rights reserved.`}
            />
            <p className="mt-1.5 text-[11.5px] text-ih-muted">
              Type <code className="font-mono">{FOOTER_LEGAL_YEAR_TOKEN}</code> where the year goes
              and it stays current. Left blank, the footer shows “© {new Date().getFullYear()}{' '}
              {legalFallbackEntity}. All rights reserved.”
            </p>
          </div>

          <NavTreeEditor
            surface={NAV_SURFACES.footer_legal}
            items={legalLinks}
            onChange={setLegalLinks}
            emptyHint="No links beside the copyright line."
          />
        </Card>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-ih-danger bg-ih-danger-soft px-4 py-3 text-[13px] text-ih-danger-ink"
          >
            {error}
          </p>
        ) : null}

        <FormFooter
          sticky
          status={
            pending
              ? 'Saving…'
              : isDirty
                ? 'Unsaved changes'
                : savedAt
                  ? `Saved at ${savedAt}`
                  : 'No changes'
          }
        >
          <Button type="button" kind="primary" onClick={onSave} disabled={pending || !isDirty}>
            Save footer
          </Button>
        </FormFooter>
      </div>
    </AdminPageShell>
  )
}

// ─── Social rows ────────────────────────────────────────────────────────────

function SocialList({
  socials,
  onChange,
}: {
  socials: LocalSocial[]
  onChange: (next: LocalSocial[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = socials.findIndex((s) => s.uid === active.id)
    const to = socials.findIndex((s) => s.uid === over.id)
    if (from < 0 || to < 0) return
    onChange(arrayMove(socials, from, to))
  }

  if (socials.length === 0) {
    return (
      <p className="text-[13px] text-ih-muted">
        None yet. With no profiles the footer draws no social row at all.
      </p>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={socials.map((s) => s.uid)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {socials.map((social) => (
            <SocialRow
              key={social.uid}
              social={social}
              onChange={(next) => onChange(socials.map((s) => (s.uid === social.uid ? next : s)))}
              onRemove={() => onChange(socials.filter((s) => s.uid !== social.uid))}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SocialRow({
  social,
  onChange,
  onRemove,
}: {
  social: LocalSocial
  onChange: (next: LocalSocial) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: social.uid,
  })
  return (
    <li
      ref={setNodeRef}
      className="rounded-md border border-ih-border bg-ih-bg px-2 py-2"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Reorder — press space, then arrow keys"
          className="inline-flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-ih-muted hover:text-ih-ink active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVertical size={14} />
        </button>
        <select
          aria-label="Platform"
          value={social.platform}
          onChange={(e) => onChange({ ...social, platform: e.target.value as FooterSocialPlatform })}
          className={`${FIELD} w-[140px]`}
        >
          {FOOTER_SOCIAL_PLATFORMS.map((platform) => (
            <option key={platform} value={platform}>
              {FOOTER_SOCIAL_PLATFORM_LABELS[platform]}
            </option>
          ))}
        </select>
        <input
          aria-label="Name"
          placeholder="Name"
          maxLength={40}
          value={social.label}
          onChange={(e) => onChange({ ...social, label: e.target.value })}
          className={`${FIELD} w-[160px]`}
        />
        <input
          aria-label="Profile URL"
          placeholder="https://…"
          maxLength={2048}
          value={social.href}
          onChange={(e) => {
            const href = e.target.value
            // Only ever a first guess, and only while the editor has not made a
            // choice of their own — once the select says LinkedIn, pasting a
            // shortened link must not silently change it.
            const guessed = guessFooterSocialPlatform(href)
            const platform = social.platform === 'other' ? guessed : social.platform
            const label =
              social.label || (guessed === 'other' ? '' : FOOTER_SOCIAL_PLATFORM_LABELS[guessed])
            onChange({ ...social, href, platform, label })
          }}
          className={`${FIELD} flex-1`}
        />
        <button
          type="button"
          onClick={() => onChange({ ...social, isVisible: !social.isVisible })}
          aria-pressed={!social.isVisible}
          aria-label={
            social.isVisible
              ? `Hide ${social.label || 'this profile'}`
              : `Show ${social.label || 'this profile'}`
          }
          title={social.isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
          className={
            social.isVisible
              ? 'inline-flex h-7 w-7 items-center justify-center rounded-md text-ih-muted hover:text-ih-ink'
              : 'inline-flex h-7 w-7 items-center justify-center rounded-md text-ih-danger-ink'
          }
        >
          {social.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${social.label || 'this profile'}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ih-muted hover:text-ih-danger-ink"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  )
}
