'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'
import { AdminSectionHead, Button, FormFooter } from '@indus/ui'
import {
  FOOTER_SOCIAL_PLATFORMS,
  FOOTER_SOCIAL_PLATFORM_LABELS,
  FOOTER_LEGAL_YEAR_TOKEN,
  guessFooterSocialPlatform,
  MENU_LINK_TYPES,
  MENU_LINK_TYPE_LABELS,
  type FooterSocialPlatform,
  type MenuLinkType,
} from '@indus/domain'
import LinkTargetPicker, {
  type PickerTarget,
} from '../navigation/[menuSlug]/LinkTargetPicker'
import { saveFooter } from './actions'

/**
 * The whole footer on one screen.
 *
 * One screen and one Save, rather than the per-item dialogs the Navigation
 * editor uses, because the footer is a singleton: there is nothing to navigate
 * between, and a save that covered only part of it would let this page and the
 * live site disagree about something a visitor reads as one object.
 *
 * The shape deliberately matches Bazar's footer editor — sticky save bar,
 * section cards, a drag handle on every reorderable row — since it is the same
 * job on the same surface and an editor who has learnt one should not have to
 * learn the other.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type FooterLinkData = {
  label: string
  linkType: MenuLinkType
  customUrl: string
  categoryId: string | null
  brandId: string | null
  industryId: string | null
  cmsPageId: string | null
  productId: string | null
  target: { label: string; sublabel: string | null } | null
  openInNewTab: boolean
  isVisible: boolean
}

export type FooterColumnData = {
  label: string
  isVisible: boolean
  links: FooterLinkData[]
}

export type FooterSocialData = {
  label: string
  platform: FooterSocialPlatform
  href: string
  isVisible: boolean
}

export type FooterLegalLinkData = {
  label: string
  customUrl: string
  openInNewTab: boolean
  isVisible: boolean
}

export type FooterEditorData = {
  brand: { tagline: string; certificationLine: string }
  contact: {
    contactLocationLabel: string
    contactPhone: string
    contactEmail: string
    contactHours: string
  }
  legal: { footerLegalLine: string; links: FooterLegalLinkData[] }
  columns: FooterColumnData[]
  socials: FooterSocialData[]
}

/**
 * Every reorderable row carries a `uid` that is NOT its database id.
 *
 * Rows are re-created on every save, so an id is not stable across one; and a
 * brand-new row has no id at all. Keying React off the array index instead
 * would collapse two rows into one whenever a drag moved them, losing focus
 * and the caret position mid-typing.
 */
type Uid = { uid: string }
type LocalLink = FooterLinkData & Uid
type LocalColumn = Omit<FooterColumnData, 'links'> & Uid & { links: LocalLink[] }
type LocalSocial = FooterSocialData & Uid
type LocalLegalLink = FooterLegalLinkData & Uid

let uidCounter = 0
function uid(): string {
  uidCounter += 1
  return `row-${uidCounter}`
}

function withUid<T>(row: T): T & Uid {
  return { ...row, uid: uid() }
}

// ─── Shared bits ────────────────────────────────────────────────────────────

const FIELD =
  'h-9 w-full px-3 border border-ih-border bg-ih-bg text-[13px] rounded-sm outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft disabled:opacity-50 disabled:cursor-not-allowed'

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-muted mb-1.5">
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

function DragHandle({ listeners, attributes }: { listeners?: object; attributes?: object }) {
  return (
    <button
      type="button"
      aria-label="Reorder — press space, then arrow keys"
      className="inline-flex h-7 w-5 shrink-0 items-center justify-center text-ih-muted hover:text-ih-ink cursor-grab active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      <GripVertical size={14} />
    </button>
  )
}

/** dnd-kit wiring, identical for every sortable list on this screen. */
function useReorder<T extends Uid>(rows: T[], onChange: (next: T[]) => void) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = rows.findIndex((r) => r.uid === active.id)
    const to = rows.findIndex((r) => r.uid === over.id)
    if (from < 0 || to < 0) return
    onChange(arrayMove(rows, from, to))
  }
  return { sensors, onDragEnd }
}

function SortableRow({
  id,
  children,
  className,
}: {
  id: string
  children: (handle: { listeners?: object; attributes?: object }) => React.ReactNode
  className?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <li
      ref={setNodeRef}
      className={className}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {children({ listeners, attributes })}
    </li>
  )
}

function VisibilityToggle({
  isVisible,
  onChange,
  what,
}: {
  isVisible: boolean
  onChange: (next: boolean) => void
  what: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!isVisible)}
      // Colour is not the only signal: the icon changes too (CLAUDE.md §10.2).
      className={
        isVisible
          ? 'inline-flex h-7 w-7 items-center justify-center rounded-md text-ih-muted hover:text-ih-ink'
          : 'inline-flex h-7 w-7 items-center justify-center rounded-md text-ih-danger-ink'
      }
      aria-pressed={!isVisible}
      aria-label={isVisible ? `Hide ${what}` : `Show ${what}`}
      title={isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
    >
      {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
    </button>
  )
}

function RemoveButton({ onClick, what }: { onClick: () => void; what: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Remove ${what}`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ih-muted hover:text-ih-danger-ink"
    >
      <Trash2 size={14} />
    </button>
  )
}

// ─── The editor ─────────────────────────────────────────────────────────────

export default function FooterEditor({
  data,
  canEditSettings,
  legalFallbackEntity,
}: {
  data: FooterEditorData
  /**
   * Whether this user may write the `store_settings` fields on this screen.
   * The brand, contact and legal-line boxes are not footer-only — the phone
   * number is also /contact's and the Organization JSON-LD's — so they stay
   * SETTINGS_WRITE. A `cms_editor` still edits every link on the page.
   */
  canEditSettings: boolean
  /** What the legal line falls back to when left blank. Shown, not stored. */
  legalFallbackEntity: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const [brand, setBrand] = useState(data.brand)
  const [contact, setContact] = useState(data.contact)
  const [legalLine, setLegalLine] = useState(data.legal.footerLegalLine)
  const [legalLinks, setLegalLinks] = useState<LocalLegalLink[]>(() =>
    data.legal.links.map(withUid),
  )
  const [columns, setColumns] = useState<LocalColumn[]>(() =>
    data.columns.map((c) => withUid({ ...c, links: c.links.map(withUid) })),
  )
  const [socials, setSocials] = useState<LocalSocial[]>(() => data.socials.map(withUid))

  /*
   * The snapshot the dirty check compares against, replaced on a successful
   * save. State rather than a ref: `isDirty` is read during render to disable
   * the Save button, and a ref read during render does not re-render when it
   * changes — so the button would stay enabled after a save until something
   * else happened to re-render the tree.
   *
   * Seeded from `data` rather than from the local state above, which is legal
   * precisely because `toPayload` strips the `uid`s: the two produce the same
   * JSON, and going through `data` keeps the seed out of the state
   * initialisers' evaluation order.
   */
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(
      toPayload(data.brand, data.contact, data.legal.footerLegalLine, data.legal.links, data.columns, data.socials),
    ),
  )
  const payload = useMemo(
    () => toPayload(brand, contact, legalLine, legalLinks, columns, socials),
    [brand, contact, legalLine, legalLinks, columns, socials],
  )
  const isDirty = JSON.stringify(payload) !== baseline

  const columnReorder = useReorder(columns, setColumns)
  const socialReorder = useReorder(socials, setSocials)
  const legalReorder = useReorder(legalLinks, setLegalLinks)

  function patchColumn(uidValue: string, patch: Partial<LocalColumn>) {
    setColumns((prev) => prev.map((c) => (c.uid === uidValue ? { ...c, ...patch } : c)))
  }

  function onSave() {
    setError(null)
    startTransition(async () => {
      const result = await saveFooter(payload)
      if (!result.success) {
        setError(
          result.fieldErrors
            ? `${result.message} — ${Object.entries(result.fieldErrors)
                .map(([path, messages]) => `${path}: ${messages.join(', ')}`)
                .join('; ')}`
            : result.message,
        )
        return
      }
      setBaseline(JSON.stringify(payload))
      setSavedAt(new Date().toLocaleTimeString())
      // Re-fetch so the counts in the page header and any server-resolved
      // target labels catch up with what was just written.
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {!canEditSettings && (
        <p className="rounded-md border border-ih-border bg-ih-bg px-4 py-3 text-[12.5px] text-ih-muted">
          Your role can edit the footer’s link columns, social profiles and legal links. The brand
          blurb, contact details and copyright line are shared with the contact page and the site’s
          structured data, so they need a manager or administrator.
        </p>
      )}

      {/* ── Brand block ── */}
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

      {/* ── Link columns ── */}
      <Card
        title="Link columns"
        description="One column per heading. Drag to reorder columns or the links inside them."
        actions={
          <Button
            type="button"
            size="dense-sm"
            icon={<Plus size={13} />}
            onClick={() =>
              setColumns((prev) => [...prev, withUid({ label: '', isVisible: true, links: [] })])
            }
          >
            Add column
          </Button>
        }
      >
        {columns.length === 0 ? (
          <p className="text-[13px] text-ih-muted">
            No columns. The footer renders the brand and contact blocks alone.
          </p>
        ) : (
          <DndContext
            sensors={columnReorder.sensors}
            collisionDetection={closestCenter}
            onDragEnd={columnReorder.onDragEnd}
          >
            <SortableContext items={columns.map((c) => c.uid)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-4">
                {columns.map((column) => (
                  <SortableRow
                    key={column.uid}
                    id={column.uid}
                    className="rounded-md border border-ih-border bg-ih-bg p-4"
                  >
                    {(handle) => (
                      <ColumnCard
                        column={column}
                        handle={handle}
                        onChange={(patch) => patchColumn(column.uid, patch)}
                        onRemove={() =>
                          setColumns((prev) => prev.filter((c) => c.uid !== column.uid))
                        }
                      />
                    )}
                  </SortableRow>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {/* ── Contact block ── */}
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

      {/* ── Social profiles ── */}
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
                withUid({ label: '', platform: 'other' as FooterSocialPlatform, href: '', isVisible: true }),
              ])
            }
          >
            Add profile
          </Button>
        }
      >
        {socials.length === 0 ? (
          <p className="text-[13px] text-ih-muted">
            None yet. With no profiles the footer draws no social row at all.
          </p>
        ) : (
          <DndContext
            sensors={socialReorder.sensors}
            collisionDetection={closestCenter}
            onDragEnd={socialReorder.onDragEnd}
          >
            <SortableContext items={socials.map((s) => s.uid)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-2">
                {socials.map((social) => (
                  <SortableRow
                    key={social.uid}
                    id={social.uid}
                    className="rounded-md border border-ih-border bg-ih-bg px-2 py-2"
                  >
                    {(handle) => (
                      <div className="flex items-center gap-2">
                        <DragHandle {...handle} />
                        <select
                          aria-label="Platform"
                          value={social.platform}
                          onChange={(e) =>
                            setSocials((prev) =>
                              prev.map((s) =>
                                s.uid === social.uid
                                  ? { ...s, platform: e.target.value as FooterSocialPlatform }
                                  : s,
                              ),
                            )
                          }
                          className={`${FIELD} w-[140px]`}
                        >
                          {FOOTER_SOCIAL_PLATFORMS.map((p) => (
                            <option key={p} value={p}>
                              {FOOTER_SOCIAL_PLATFORM_LABELS[p]}
                            </option>
                          ))}
                        </select>
                        <input
                          aria-label="Name"
                          placeholder="Name"
                          maxLength={40}
                          value={social.label}
                          onChange={(e) =>
                            setSocials((prev) =>
                              prev.map((s) =>
                                s.uid === social.uid ? { ...s, label: e.target.value } : s,
                              ),
                            )
                          }
                          className={`${FIELD} w-[160px]`}
                        />
                        <input
                          aria-label="Profile URL"
                          placeholder="https://…"
                          maxLength={2048}
                          value={social.href}
                          onChange={(e) => {
                            const href = e.target.value
                            setSocials((prev) =>
                              prev.map((s) => {
                                if (s.uid !== social.uid) return s
                                // Only ever a first guess, and only while the
                                // editor has not made a choice of their own —
                                // once the select says LinkedIn, pasting a
                                // shortened link must not silently change it.
                                const guessed = guessFooterSocialPlatform(href)
                                const platform = s.platform === 'other' ? guessed : s.platform
                                const label = s.label || (guessed === 'other' ? '' : FOOTER_SOCIAL_PLATFORM_LABELS[guessed])
                                return { ...s, href, platform, label }
                              }),
                            )
                          }}
                          className={`${FIELD} flex-1`}
                        />
                        <VisibilityToggle
                          isVisible={social.isVisible}
                          what={social.label || 'this profile'}
                          onChange={(next) =>
                            setSocials((prev) =>
                              prev.map((s) => (s.uid === social.uid ? { ...s, isVisible: next } : s)),
                            )
                          }
                        />
                        <RemoveButton
                          what={social.label || 'this profile'}
                          onClick={() => setSocials((prev) => prev.filter((s) => s.uid !== social.uid))}
                        />
                      </div>
                    )}
                  </SortableRow>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {/* ── Bottom bar ── */}
      <Card
        title="Bottom bar"
        description="The copyright line and the small links beside it."
        actions={
          <Button
            type="button"
            size="dense-sm"
            icon={<Plus size={13} />}
            onClick={() =>
              setLegalLinks((prev) => [
                ...prev,
                withUid({ label: '', customUrl: '', openInNewTab: false, isVisible: true }),
              ])
            }
          >
            Add link
          </Button>
        }
      >
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
            Type <code className="font-mono">{FOOTER_LEGAL_YEAR_TOKEN}</code> where the year goes and
            it stays current. Left blank, the footer shows “© {new Date().getFullYear()}{' '}
            {legalFallbackEntity}. All rights reserved.”
          </p>
        </div>

        {legalLinks.length > 0 && (
          <DndContext
            sensors={legalReorder.sensors}
            collisionDetection={closestCenter}
            onDragEnd={legalReorder.onDragEnd}
          >
            <SortableContext
              items={legalLinks.map((l) => l.uid)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-2">
                {legalLinks.map((link) => (
                  <SortableRow
                    key={link.uid}
                    id={link.uid}
                    className="rounded-md border border-ih-border bg-ih-bg px-2 py-2"
                  >
                    {(handle) => (
                      <div className="flex items-center gap-2">
                        <DragHandle {...handle} />
                        <input
                          aria-label="Label"
                          placeholder="Label"
                          maxLength={80}
                          value={link.label}
                          onChange={(e) =>
                            setLegalLinks((prev) =>
                              prev.map((l) =>
                                l.uid === link.uid ? { ...l, label: e.target.value } : l,
                              ),
                            )
                          }
                          className={`${FIELD} w-[200px]`}
                        />
                        <input
                          aria-label="URL"
                          placeholder="/privacy"
                          maxLength={2048}
                          value={link.customUrl}
                          onChange={(e) =>
                            setLegalLinks((prev) =>
                              prev.map((l) =>
                                l.uid === link.uid ? { ...l, customUrl: e.target.value } : l,
                              ),
                            )
                          }
                          className={`${FIELD} flex-1`}
                        />
                        <VisibilityToggle
                          isVisible={link.isVisible}
                          what={link.label || 'this link'}
                          onChange={(next) =>
                            setLegalLinks((prev) =>
                              prev.map((l) => (l.uid === link.uid ? { ...l, isVisible: next } : l)),
                            )
                          }
                        />
                        <RemoveButton
                          what={link.label || 'this link'}
                          onClick={() =>
                            setLegalLinks((prev) => prev.filter((l) => l.uid !== link.uid))
                          }
                        />
                      </div>
                    )}
                  </SortableRow>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {error && (
        <p role="alert" className="rounded-md border border-ih-danger bg-ih-danger-soft px-4 py-3 text-[13px] text-ih-danger-ink">
          {error}
        </p>
      )}

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
  )
}

// ─── One link column ────────────────────────────────────────────────────────

function ColumnCard({
  column,
  handle,
  onChange,
  onRemove,
}: {
  column: LocalColumn
  handle: { listeners?: object; attributes?: object }
  onChange: (patch: Partial<LocalColumn>) => void
  onRemove: () => void
}) {
  const reorder = useReorder(column.links, (links) => onChange({ links }))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <DragHandle {...handle} />
        <input
          aria-label="Column heading"
          placeholder="Column heading"
          maxLength={80}
          value={column.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className={`${FIELD} flex-1 font-medium`}
        />
        <VisibilityToggle
          isVisible={column.isVisible}
          what={column.label || 'this column'}
          onChange={(isVisible) => onChange({ isVisible })}
        />
        <RemoveButton what={column.label || 'this column'} onClick={onRemove} />
      </div>

      <DndContext
        sensors={reorder.sensors}
        collisionDetection={closestCenter}
        onDragEnd={reorder.onDragEnd}
      >
        <SortableContext
          items={column.links.map((l) => l.uid)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2 pl-5">
            {column.links.map((link) => (
              <SortableRow
                key={link.uid}
                id={link.uid}
                className="rounded-md border border-ih-border bg-ih-surface px-2 py-2"
              >
                {(linkHandle) => (
                  <LinkRow
                    link={link}
                    handle={linkHandle}
                    onChange={(next) =>
                      onChange({
                        links: column.links.map((l) => (l.uid === link.uid ? next : l)),
                      })
                    }
                    onRemove={() =>
                      onChange({ links: column.links.filter((l) => l.uid !== link.uid) })
                    }
                  />
                )}
              </SortableRow>
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="pl-5">
        <Button
          type="button"
          size="dense-sm"
          kind="ghost"
          icon={<Plus size={13} />}
          onClick={() =>
            onChange({
              links: [
                ...column.links,
                withUid({
                  label: '',
                  linkType: 'custom_url' as MenuLinkType,
                  customUrl: '',
                  categoryId: null,
                  brandId: null,
                  industryId: null,
                  cmsPageId: null,
                  productId: null,
                  target: null,
                  openInNewTab: false,
                  isVisible: true,
                }),
              ],
            })
          }
        >
          Add link
        </Button>
      </div>
    </div>
  )
}

// ─── One link ───────────────────────────────────────────────────────────────

/**
 * Label, then how it resolves.
 *
 * The link-type select is kept — rather than collapsing every row to a plain
 * href box as Bazar's footer does — because a `category` link resolves through
 * the category's current slug. Flattening these to text would freeze six
 * footer links at whatever the slugs were on the day of the flattening, and a
 * later rename would 404 them silently.
 */
function LinkRow({
  link,
  handle,
  onChange,
  onRemove,
}: {
  link: LocalLink
  handle: { listeners?: object; attributes?: object }
  onChange: (next: LocalLink) => void
  onRemove: () => void
}) {
  const needsPicker =
    link.linkType !== 'none' && link.linkType !== 'custom_url'

  const pickerValue: PickerTarget | null = link.target
    ? { id: currentTargetId(link) ?? '', label: link.target.label, sublabel: link.target.sublabel }
    : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <DragHandle {...handle} />
        <input
          aria-label="Link label"
          placeholder="Label"
          maxLength={80}
          value={link.label}
          onChange={(e) => onChange({ ...link, label: e.target.value })}
          className={`${FIELD} flex-1`}
        />
        <select
          aria-label="Link type"
          value={link.linkType}
          onChange={(e) => {
            const linkType = e.target.value as MenuLinkType
            // Clearing every target on a type change is what keeps a stale
            // categoryId from outliving the switch to Custom URL — the server
            // nulls them too, but doing it here means the row shows the truth
            // before the save rather than after it.
            onChange({
              ...link,
              linkType,
              customUrl: linkType === 'custom_url' ? link.customUrl : '',
              categoryId: null,
              brandId: null,
              industryId: null,
              cmsPageId: null,
              productId: null,
              target: null,
            })
          }}
          className={`${FIELD} w-[150px]`}
        >
          {MENU_LINK_TYPES.map((t) => (
            <option key={t} value={t}>
              {MENU_LINK_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <VisibilityToggle
          isVisible={link.isVisible}
          what={link.label || 'this link'}
          onChange={(isVisible) => onChange({ ...link, isVisible })}
        />
        <RemoveButton what={link.label || 'this link'} onClick={onRemove} />
      </div>

      <div className="pl-7">
        {link.linkType === 'custom_url' ? (
          <input
            aria-label="URL"
            placeholder="/c/hydraulic-pumps or https://…"
            maxLength={2048}
            value={link.customUrl}
            onChange={(e) => onChange({ ...link, customUrl: e.target.value })}
            className={FIELD}
          />
        ) : needsPicker ? (
          <LinkTargetPicker
            linkType={link.linkType}
            value={pickerValue}
            onChange={(target) =>
              onChange({
                ...link,
                ...targetPatch(link.linkType, target?.id ?? null),
                target: target ? { label: target.label, sublabel: target.sublabel } : null,
              })
            }
          />
        ) : (
          <p className="text-[12px] text-ih-muted">Renders as plain text, with no link.</p>
        )}
      </div>
    </div>
  )
}

function currentTargetId(link: LocalLink): string | null {
  switch (link.linkType) {
    case 'category':
      return link.categoryId
    case 'brand':
      return link.brandId
    case 'industry':
      return link.industryId
    case 'cms_page':
      return link.cmsPageId
    case 'product':
      return link.productId
    default:
      return null
  }
}

/** Set the one FK the link type uses, and clear the other four. */
function targetPatch(linkType: MenuLinkType, id: string | null) {
  return {
    categoryId: linkType === 'category' ? id : null,
    brandId: linkType === 'brand' ? id : null,
    industryId: linkType === 'industry' ? id : null,
    cmsPageId: linkType === 'cms_page' ? id : null,
    productId: linkType === 'product' ? id : null,
  }
}

// ─── Local state → server payload ───────────────────────────────────────────

/**
 * Strip the `uid`s and the resolved target labels.
 *
 * Also what the dirty check is computed from, which is why the display-only
 * `target` is dropped here: it is re-resolved by the server on every load, and
 * leaving it in would make a row look changed after a `router.refresh()`
 * merely because a category was renamed elsewhere.
 */
function toPayload(
  brand: FooterEditorData['brand'],
  contact: FooterEditorData['contact'],
  legalLine: string,
  legalLinks: readonly FooterLegalLinkData[],
  columns: readonly FooterColumnData[],
  socials: readonly FooterSocialData[],
) {
  return {
    brand: { tagline: brand.tagline, certificationLine: brand.certificationLine },
    contact: {
      contactLocationLabel: contact.contactLocationLabel,
      contactPhone: contact.contactPhone,
      contactEmail: contact.contactEmail,
      contactHours: contact.contactHours,
    },
    legal: {
      footerLegalLine: legalLine,
      links: legalLinks.map((l) => ({
        label: l.label,
        customUrl: l.customUrl,
        openInNewTab: l.openInNewTab,
        isVisible: l.isVisible,
      })),
    },
    // Fields listed one by one rather than spread-minus-`uid`. The rest
    // element that would remove `uid` also silently carries anything else the
    // local row happens to hold — `target` being the live example — into both
    // the request body and the dirty-check baseline, where a category renamed
    // by someone else reads as an unsaved edit on reload.
    columns: columns.map((c) => ({
      label: c.label,
      isVisible: c.isVisible,
      links: c.links.map((link) => ({
        label: link.label,
        linkType: link.linkType,
        customUrl: link.customUrl,
        categoryId: link.categoryId,
        brandId: link.brandId,
        industryId: link.industryId,
        cmsPageId: link.cmsPageId,
        productId: link.productId,
        openInNewTab: link.openInNewTab,
        isVisible: link.isVisible,
      })),
    })),
    socials: socials.map((s) => ({
      label: s.label,
      platform: s.platform,
      href: s.href,
      isVisible: s.isVisible,
    })),
  }
}
