import Link from 'next/link'
import {
  FileText,
  FolderOpen,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Megaphone,
  Newspaper,
  Package,
  Paperclip,
  Settings,
  Sparkles,
  Tag,
  Trash2,
  Wrench,
} from 'lucide-react'
import {
  MEDIA_FOLDER_LABELS,
  MEDIA_FOLDER_ORDER,
  MEDIA_STATE_HINTS,
  MEDIA_STATE_LABELS,
  type MediaFolder,
  type MediaState,
} from '@indus/domain'
import { cn } from '@indus/ui'

/**
 * The library's filter chrome: folder rail, state tabs, view toggle.
 *
 * All three are plain links, not client state. Every filter lives in the URL,
 * so a filtered view is shareable, survives a reload, and needs no JavaScript —
 * which also keeps the whole of this file a server component.
 */

export type MediaViewMode = 'grid' | 'list'

/** Builds a URL preserving the other params. Callers pass a partial override. */
export type BuildUrl = (overrides: Record<string, string | undefined>) => string

// ── Folder rail ─────────────────────────────────────────────────────────────

const FOLDER_ICONS: Record<MediaFolder, typeof Package> = {
  products: Package,
  categories: FolderOpen,
  brands: Tag,
  industries: Wrench,
  services: Sparkles,
  blog: Newspaper,
  pages: FileText,
  navigation: Megaphone,
  homepage: LayoutGrid,
  site: Settings,
  documents: FileText,
  rfq: Paperclip,
  unused: Trash2,
}

export function FolderRail({
  counts,
  active,
  total,
  trashCount,
  trashed,
  buildUrl,
}: {
  counts: Partial<Record<MediaFolder, number>>
  active: MediaFolder | 'all'
  total: number
  trashCount: number
  trashed: boolean
  buildUrl: BuildUrl
}) {
  // `unused` is a folder in the data model but reads as a state to a user, so
  // it sits below the rule with Trash rather than among the content folders.
  const contentFolders = MEDIA_FOLDER_ORDER.filter((f) => f !== 'unused')

  return (
    <nav aria-label="Media folders" className="w-[220px] flex-shrink-0">
      <ul className="flex flex-col gap-0.5">
        <RailItem
          href={buildUrl({ folder: undefined, trash: undefined, page: undefined })}
          icon={FolderOpen}
          label="All media"
          count={total}
          active={!trashed && active === 'all'}
        />

        <li aria-hidden="true" className="my-1.5 h-px bg-ih-border" />

        {contentFolders.map((folder) => {
          const count = counts[folder] ?? 0
          if (count === 0) return null
          return (
            <RailItem
              key={folder}
              href={buildUrl({ folder, trash: undefined, page: undefined })}
              icon={FOLDER_ICONS[folder]}
              label={MEDIA_FOLDER_LABELS[folder]}
              count={count}
              active={!trashed && active === folder}
            />
          )
        })}

        <li aria-hidden="true" className="my-1.5 h-px bg-ih-border" />

        <RailItem
          href={buildUrl({ folder: 'unused', trash: undefined, page: undefined })}
          icon={Trash2}
          label={MEDIA_FOLDER_LABELS.unused}
          count={counts.unused ?? 0}
          active={!trashed && active === 'unused'}
          muted
        />
        <RailItem
          href={buildUrl({ trash: '1', folder: undefined, state: undefined, page: undefined })}
          icon={Trash2}
          label="Trash"
          count={trashCount}
          active={trashed}
          muted
        />
      </ul>
    </nav>
  )
}

function RailItem({
  href,
  icon: Icon,
  label,
  count,
  active,
  muted = false,
}: {
  href: string
  icon: typeof Package
  label: string
  count: number
  active: boolean
  muted?: boolean
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-2 rounded-sm px-3 py-2 text-[13px] transition-colors',
          active
            ? 'bg-ih-navy font-medium text-ih-bg'
            : muted
              ? 'text-ih-muted hover:bg-ih-surface-2 hover:text-ih-ink-2'
              : 'text-ih-ink-2 hover:bg-ih-surface-2 hover:text-ih-ink'
        )}
      >
        <Icon size={13} strokeWidth={1.6} aria-hidden="true" className="flex-shrink-0" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span
          className={cn(
            'font-mono text-[11px] tabular-nums',
            active ? 'text-white/75' : 'text-ih-muted'
          )}
        >
          {count}
        </span>
      </Link>
    </li>
  )
}

// ── State tabs ──────────────────────────────────────────────────────────────

const STATE_TABS: Array<MediaState | 'all'> = ['all', 'live', 'attached', 'internal', 'unused']

export function StateTabs({
  counts,
  active,
  buildUrl,
}: {
  counts: Record<MediaState | 'all', number>
  active: MediaState | 'all'
  buildUrl: BuildUrl
}) {
  return (
    <div
      role="group"
      aria-label="Filter by usage"
      className="inline-flex rounded-md border border-ih-border bg-ih-bg p-0.5"
    >
      {STATE_TABS.map((state) => {
        const isActive = active === state
        return (
          <Link
            key={state}
            href={buildUrl({ state: state === 'all' ? undefined : state, page: undefined })}
            aria-current={isActive ? 'page' : undefined}
            title={state === 'all' ? 'Every file in this folder' : MEDIA_STATE_HINTS[state]}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-[12px] transition-colors',
              isActive
                ? 'bg-ih-navy font-medium text-ih-bg'
                : 'text-ih-ink-2 hover:text-ih-ink'
            )}
          >
            {state === 'all' ? 'All' : MEDIA_STATE_LABELS[state]}
            <span
              className={cn(
                'font-mono text-[10.5px] tabular-nums',
                isActive ? 'text-ih-bg/75' : 'text-ih-muted'
              )}
            >
              {counts[state]}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

// ── View toggle ─────────────────────────────────────────────────────────────

export function ViewToggle({ active, buildUrl }: { active: MediaViewMode; buildUrl: BuildUrl }) {
  const options: Array<{ mode: MediaViewMode; icon: typeof LayoutGrid; label: string }> = [
    { mode: 'grid', icon: LayoutGrid, label: 'Grid view' },
    { mode: 'list', icon: List, label: 'List view' },
  ]
  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex rounded-md border border-ih-border bg-ih-bg p-0.5"
    >
      {options.map(({ mode, icon: Icon, label }) => {
        const isActive = active === mode
        return (
          <Link
            key={mode}
            // Grid is the default, so it clears the param rather than writing
            // `view=grid` — one canonical URL per view.
            href={buildUrl({ view: mode === 'grid' ? undefined : mode })}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            title={label}
            className={cn(
              'inline-flex h-7 w-8 items-center justify-center rounded-sm transition-colors',
              isActive ? 'bg-ih-navy text-ih-bg' : 'text-ih-muted hover:text-ih-ink'
            )}
          >
            <Icon size={13} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        )
      })}
    </div>
  )
}

// ── Kind chips ──────────────────────────────────────────────────────────────

const KINDS = [
  { value: 'all', label: 'All types' },
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
  { value: 'cad', label: 'CAD' },
] as const

export function KindChips({
  active,
  counts,
  buildUrl,
}: {
  active: string
  counts: Record<string, number>
  buildUrl: BuildUrl
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {KINDS.map(({ value, label }) => {
        const isActive = active === value
        const count = counts[value] ?? 0
        if (value !== 'all' && count === 0) return null
        return (
          <Link
            key={value}
            href={buildUrl({ kind: value === 'all' ? undefined : value, page: undefined })}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-sm border px-2.5 text-[12px] transition-colors',
              isActive
                ? 'border-ih-accent bg-ih-accent-soft text-ih-accent'
                : 'border-ih-border text-ih-muted hover:border-ih-border-strong hover:text-ih-ink-2'
            )}
          >
            {label}
            <span className="font-mono text-[10.5px] tabular-nums opacity-70">{count}</span>
          </Link>
        )
      })}
    </div>
  )
}

// ── Icon re-export ──────────────────────────────────────────────────────────
// The card needs the same glyph vocabulary; exporting from here keeps one map.
export { ImageIcon }
