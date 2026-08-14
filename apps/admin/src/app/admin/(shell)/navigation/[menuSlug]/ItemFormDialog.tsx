'use client'

import { useState, useTransition } from 'react'
import {
  ICON_NAMES,
  MENU_LINK_TYPES,
  MENU_LINK_TYPE_LABELS,
  type MenuLinkType,
} from '@indus/domain'
import { upsertItem } from '../actions'
import LinkTargetPicker, { type PickerTarget } from './LinkTargetPicker'

export interface ItemFormInitial {
  menuId: string
  parentId: string | null
  id?: string
  label?: string
  iconName?: string | null
  badge?: string | null
  description?: string | null
  linkType?: MenuLinkType
  customUrl?: string | null
  openInNewTab?: boolean
  isVisible?: boolean
  target?: PickerTarget | null
}

interface Props {
  initial: ItemFormInitial
  onClose: () => void
  onSaved: () => void
}

export default function ItemFormDialog({ initial, onClose, onSaved }: Props) {
  const [label, setLabel] = useState(initial.label ?? '')
  const [linkType, setLinkType] = useState<MenuLinkType>(initial.linkType ?? 'none')
  const [customUrl, setCustomUrl] = useState(initial.customUrl ?? '')
  const [target, setTarget] = useState<PickerTarget | null>(initial.target ?? null)
  const [iconName, setIconName] = useState(initial.iconName ?? '')
  const [badge, setBadge] = useState(initial.badge ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [openInNewTab, setOpenInNewTab] = useState(initial.openInNewTab ?? false)
  const [isVisible, setIsVisible] = useState(initial.isVisible ?? true)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const showTargetPicker = linkType !== 'none' && linkType !== 'custom_url'
  const showCustomUrl = linkType === 'custom_url'

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await upsertItem({
        id: initial.id,
        menuId: initial.menuId,
        parentId: initial.parentId,
        label,
        iconName: iconName || undefined,
        badge: badge || undefined,
        description: description || undefined,
        linkType,
        customUrl: customUrl || undefined,
        openInNewTab,
        isVisible,
        categoryId: linkType === 'category' ? target?.id : undefined,
        brandId: linkType === 'brand' ? target?.id : undefined,
        industryId: linkType === 'industry' ? target?.id : undefined,
        cmsPageId: linkType === 'cms_page' ? target?.id : undefined,
        productId: linkType === 'product' ? target?.id : undefined,
      })
      if (!result.success) {
        setError(result.message)
        return
      }
      onSaved()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-12 px-4 overflow-y-auto">
      <div className="bg-white border border-[var(--color-border)] w-full max-w-lg p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h2 className="text-[18px] font-semibold">{initial.id ? 'Edit item' : 'New item'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <Field label="Label">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
            autoFocus
          />
        </Field>

        <Field label="Link type">
          <select
            value={linkType}
            onChange={(e) => {
              setLinkType(e.target.value as MenuLinkType)
              setTarget(null)
            }}
            className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
          >
            {MENU_LINK_TYPES.map((t) => (
              <option key={t} value={t}>
                {MENU_LINK_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>

        {showTargetPicker ? (
          <Field label="Target">
            <LinkTargetPicker linkType={linkType} value={target} onChange={setTarget} />
          </Field>
        ) : null}

        {showCustomUrl ? (
          <Field label="URL" hint="Must start with / for internal or https:// for external links.">
            <input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="/sale or https://example.com"
              className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px] font-mono"
            />
          </Field>
        ) : null}

        <details className="border-t border-[var(--color-border)] pt-3">
          <summary className="text-[12px] cursor-pointer text-[var(--color-muted)] uppercase tracking-[0.1em] font-mono">
            Optional
          </summary>
          <div className="flex flex-col gap-3 mt-3">
            <Field label="Icon">
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
              >
                <option value="">— None —</option>
                {ICON_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Badge">
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="New, Sale…"
                className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="px-3 py-2 border border-[var(--color-border)] bg-white text-[13px]"
              />
            </Field>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={openInNewTab} onChange={(e) => setOpenInNewTab(e.target.checked)} />
              Open in a new tab
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
              Visible on storefront
            </label>
          </div>
        </details>

        {error ? (
          <p role="alert" className="text-[12px] text-[var(--color-status-danger)]">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-9 px-4 border border-[var(--color-border)] text-[13px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || !label.trim()}
            className="h-9 px-4 bg-[var(--color-accent)] text-white text-[13px] disabled:opacity-50"
          >
            {pending ? 'Saving…' : initial.id ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[12px]">
      <span className="text-[var(--color-muted)]">{label}</span>
      {children}
      {hint ? <span className="text-[11px] text-[var(--color-muted)]">{hint}</span> : null}
    </label>
  )
}
