'use client'

import { MAX_COMPARE } from '@indus/domain'

/**
 * Client-side store for the compare tray (localStorage-backed).
 *
 * The tray holds the (sku, categoryId, specTemplateId) triples for products
 * the user is staging for side-by-side comparison. We persist categoryId and
 * specTemplateId here — not just the SKU — so the buttons can enforce the
 * "same category + same template" rule synchronously, without a server hop,
 * the moment the user clicks Add.
 *
 * Contract:
 *  - addToTray returns { ok: true, items, alreadyIn } on a successful add (or
 *    a no-op if the product is already in the tray).
 *  - It returns { ok: false, reason: 'mismatch' | 'full' } when the rule
 *    blocks the add. The caller decides whether to prompt the user (mismatch
 *    can be resolved by clearing the tray and re-adding).
 *
 * Cross-tab sync: writes dispatch a synthetic 'compare-tray-change' event so
 * components in the SAME tab refresh; localStorage's native 'storage' event
 * already covers other tabs.
 */

export type CompareTrayItem = {
  sku: string
  categoryId: string
  specTemplateId: string
}

const STORAGE_KEY = 'compare_items'
export const COMPARE_TRAY_EVENT = 'compare-tray-change'

export type AddToTrayResult =
  | { ok: true; items: CompareTrayItem[]; alreadyIn: boolean }
  | { ok: false; reason: 'mismatch'; current: CompareTrayItem[]; incoming: CompareTrayItem }
  | { ok: false; reason: 'full'; max: number }

function safeRead(): CompareTrayItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is CompareTrayItem =>
        i && typeof i.sku === 'string' && typeof i.categoryId === 'string' && typeof i.specTemplateId === 'string',
    )
  } catch {
    return []
  }
}

function safeWrite(items: CompareTrayItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(COMPARE_TRAY_EVENT))
  } catch {
    // localStorage unavailable — silently degrade.
  }
}

export function getTray(): CompareTrayItem[] {
  return safeRead()
}

export function addToTray(item: CompareTrayItem): AddToTrayResult {
  const current = safeRead()

  const existing = current.find((i) => i.sku === item.sku)
  if (existing) return { ok: true, items: current, alreadyIn: true }

  const head = current[0]
  if (head && (head.categoryId !== item.categoryId || head.specTemplateId !== item.specTemplateId)) {
    return { ok: false, reason: 'mismatch', current, incoming: item }
  }

  if (current.length >= MAX_COMPARE) {
    return { ok: false, reason: 'full', max: MAX_COMPARE }
  }

  const next = [...current, item]
  safeWrite(next)
  return { ok: true, items: next, alreadyIn: false }
}

/**
 * Replace the entire tray with a single item. Used after the user confirms
 * a category/template switch in the mismatch dialog.
 */
export function replaceTray(item: CompareTrayItem): CompareTrayItem[] {
  const next = [item]
  safeWrite(next)
  return next
}

export function removeFromTray(sku: string): CompareTrayItem[] {
  const next = safeRead().filter((i) => i.sku !== sku)
  safeWrite(next)
  return next
}

export function clearTray(): void {
  safeWrite([])
}

export function compareUrl(items: CompareTrayItem[] = safeRead()): string {
  if (items.length === 0) return '/compare'
  const skus = items.map((i) => encodeURIComponent(i.sku)).join(',')
  return `/compare?skus=${skus}`
}
