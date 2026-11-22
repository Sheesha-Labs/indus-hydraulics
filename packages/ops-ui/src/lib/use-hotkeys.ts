'use client'

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

/**
 * The console's one keyboard registry (05 §7.7, architecture §6.6). Mounted once by the AppShell's
 * providers; every shortcut is registered here, so the Help panel can list the registry and the
 * documentation cannot drift from what the keys do.
 *
 * Rules, in the order `handle()` applies them:
 * 1. An event something else already handled (`defaultPrevented`, e.g. Radix closing its top-most layer on
 *    Escape) or a held-down repeat is ignored.
 * 2. While focus is in an input, textarea, select or contenteditable, only bindings with `allowInInputs`
 *    run (Escape and ⌘/Ctrl K), and no chord starts.
 * 3. While a modal owns focus (an `aria-modal="true"` dialog or an alertdialog), only bindings with
 *    `allowInModal` run.
 * 4. Chords ("g t") complete within `chordMs` (1 s) of their first key; any other key cancels them.
 * 5. Escape layers: `pushLayer(close)` stacks a close callback; `dismissTop()` closes only the top one.
 *
 * Key syntax: steps separated by a space; a step is `[mod+][alt+][shift+]<key>`. `mod` is ⌘ or Ctrl
 * (either works on every platform). Letters match case-insensitively; a printable symbol (`?`, `[`) matches
 * whatever modifiers produced it, so `?` needs no `shift+`.
 */

export interface Hotkey {
  /** `'mod+k'`, `'escape'`, `'?'`, `'['`, `'n'`, `'g t'`, `'mod+z'`. */
  keys: string
  /** What it does, for the Help panel: "Go to Today". */
  label: string
  /** Help panel heading, e.g. "Go to", "Records". */
  group?: string
  /** Return `false` when the key did nothing here: the event is then left alone (no preventDefault). */
  run: (event: KeyboardEvent) => unknown
  allowInInputs?: boolean
  allowInModal?: boolean
}

/** What the Help panel prints. */
export interface HotkeyListing {
  keys: string
  label: string
  group: string | undefined
}

export interface HotkeyRegistry {
  register: (hotkey: Hotkey) => () => void
  /** Every registered shortcut, in registration order. Stable between changes (useSyncExternalStore). */
  list: () => readonly HotkeyListing[]
  subscribe: (onChange: () => void) => () => void
  /** Run the binding for this keydown, if any. True when one ran (and the event was prevented). */
  handle: (event: KeyboardEvent) => boolean
  /** Stack an Escape layer (a non-Radix surface). Returns the function that removes it. */
  pushLayer: (close: () => void) => () => void
  /** Close the top-most layer. False when there is none. */
  dismissTop: () => boolean
}

export interface HotkeyRegistryOptions {
  /** The chord window, default 1000 ms. */
  chordMs?: number
  /** Injected for tests. Default `Date.now`. */
  now?: () => number
}

interface Step {
  key: string
  mod: boolean
  alt: boolean
  shift: boolean
}

const KEY_NAMES: Readonly<Record<string, string>> = { esc: 'escape', space: ' ' }

function parseStep(text: string): Step {
  const parts = text.toLowerCase().split('+')
  const key = parts.pop() || '+'
  return {
    key: KEY_NAMES[key] ?? key,
    mod: parts.includes('mod'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
  }
}

function stepId(s: Step): string {
  return `${s.mod ? 'mod+' : ''}${s.alt ? 'alt+' : ''}${s.shift ? 'shift+' : ''}${s.key}`
}

/** One canonical spelling per binding, so `'Mod+K'` and `'mod+k'` are the same key. */
export function normaliseKeys(keys: string): string {
  return keys.trim().split(/\s+/).map(parseStep).map(stepId).join(' ')
}

/** A letter or digit: shift changes its meaning only when the binding says so. */
const isAlnum = (key: string) => /^[a-z0-9]$/.test(key)

function eventStep(e: KeyboardEvent): Step {
  const key = e.key.toLowerCase()
  const printable = e.key.length === 1
  return {
    key,
    mod: e.metaKey || e.ctrlKey,
    alt: e.altKey,
    // A symbol such as `?` or `]` already encodes shift in e.key; letters keep it only for `shift+x`.
    shift: printable && !isAlnum(key) ? false : e.shiftKey,
  }
}

function sameStep(binding: Step, event: Step): boolean {
  if (binding.key !== event.key || binding.mod !== event.mod || binding.alt !== event.alt)
    return false
  // A plain letter binding ignores shift (caps lock, shift held from the previous key).
  return binding.shift ? event.shift : isAlnum(binding.key) || !event.shift
}

function elementOf(target: EventTarget | null): Element | null {
  if (!target || typeof Element === 'undefined') return null
  return target instanceof Element ? target : null
}

/** Focus is somewhere typing goes. */
export function isEditableTarget(target: EventTarget | null): boolean {
  const el = elementOf(target)
  if (!el) return false
  if (el.closest('input, textarea, select')) return true
  const editable = el.closest('[contenteditable]')
  return editable !== null && editable.getAttribute('contenteditable') !== 'false'
}

/** A modal dialog owns focus. */
export function isInModal(target: EventTarget | null): boolean {
  const el = elementOf(target)
  return el?.closest('[aria-modal="true"], [role="alertdialog"]') != null
}

interface Entry {
  hotkey: Hotkey
  steps: Step[]
  id: string
}

export function createHotkeyRegistry(options: HotkeyRegistryOptions = {}): HotkeyRegistry {
  const chordMs = options.chordMs ?? 1000
  const now = options.now ?? Date.now
  const entries: Entry[] = []
  const layers: Array<() => void> = []
  const listeners = new Set<() => void>()
  let listing: readonly HotkeyListing[] = []
  let pending: { first: Step; at: number } | null = null

  const changed = () => {
    listing = entries.map(({ hotkey, id }) => ({
      keys: id,
      label: hotkey.label,
      group: hotkey.group,
    }))
    for (const l of listeners) l()
  }

  const allowed = (h: Hotkey, editable: boolean, modal: boolean) =>
    (!editable || h.allowInInputs === true) && (!modal || h.allowInModal === true)

  const fire = (entry: Entry, event: KeyboardEvent): boolean => {
    if (entry.hotkey.run(event) === false) return false
    event.preventDefault()
    return true
  }

  return {
    register(hotkey) {
      const steps = hotkey.keys.trim().split(/\s+/).map(parseStep)
      const entry: Entry = { hotkey, steps, id: steps.map(stepId).join(' ') }
      entries.push(entry)
      changed()
      return () => {
        const i = entries.indexOf(entry)
        if (i >= 0) entries.splice(i, 1)
        changed()
      }
    },
    list: () => listing,
    subscribe(onChange) {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    handle(event) {
      if (event.defaultPrevented || event.repeat || event.isComposing) return false
      if (['shift', 'control', 'alt', 'meta'].includes(event.key.toLowerCase())) return false
      const editable = isEditableTarget(event.target)
      const modal = isInModal(event.target)
      const step = eventStep(event)

      // Second key of a chord.
      const chord = pending
      pending = null
      if (chord && now() - chord.at <= chordMs && !editable) {
        const hit = entries.find(
          (e) =>
            e.steps.length === 2 &&
            sameStep(e.steps[0]!, chord.first) &&
            sameStep(e.steps[1]!, step) &&
            allowed(e.hotkey, editable, modal)
        )
        // Whatever followed the prefix, the chord is spent: the key does not also act on its own.
        return hit ? fire(hit, event) : false
      }

      for (const e of entries) {
        if (e.steps.length !== 1 || !sameStep(e.steps[0]!, step)) continue
        if (!allowed(e.hotkey, editable, modal)) continue
        if (fire(e, event)) return true
      }

      // First key of a chord: remember it (no preventDefault, a lone `g` is harmless).
      if (
        !editable &&
        entries.some(
          (e) =>
            e.steps.length === 2 &&
            sameStep(e.steps[0]!, step) &&
            allowed(e.hotkey, editable, modal)
        )
      )
        pending = { first: step, at: now() }
      return false
    },
    pushLayer(close) {
      layers.push(close)
      return () => {
        const i = layers.lastIndexOf(close)
        if (i >= 0) layers.splice(i, 1)
      }
    },
    dismissTop() {
      const close = layers.pop()
      if (!close) return false
      close()
      return true
    },
  }
}

/** Listen for keydown on `target` (the window) and route it through the registry. */
export function bindHotkeys(
  registry: HotkeyRegistry,
  target: Pick<Window, 'addEventListener' | 'removeEventListener'>
): () => void {
  const onKey = (e: Event) => {
    registry.handle(e as KeyboardEvent)
  }
  target.addEventListener('keydown', onKey)
  return () => target.removeEventListener('keydown', onKey)
}

const MAC_GLYPHS: Readonly<Record<string, string>> = {
  mod: '⌘',
  alt: '⌥',
  shift: '⇧',
}
const PC_NAMES: Readonly<Record<string, string>> = { mod: 'Ctrl', alt: 'Alt', shift: 'Shift' }
const KEY_LABELS: Readonly<Record<string, string>> = {
  escape: 'Esc',
  enter: '↵',
  arrowup: '↑',
  arrowdown: '↓',
  ' ': 'Space',
}

/** How the Help panel prints a binding: `⌘K` / `Ctrl+K`, `G T`, `Esc`, `[`. */
export function formatHotkey(keys: string, mac: boolean): string {
  return normaliseKeys(keys)
    .split(' ')
    .map((step) => {
      const parts = step.split('+')
      const key = parts.pop() || '+'
      const label = KEY_LABELS[key] ?? key.toUpperCase()
      const mods = parts.map((m) => (mac ? MAC_GLYPHS[m] : PC_NAMES[m]) ?? m)
      return mac ? `${mods.join('')}${label}` : [...mods, label].join('+')
    })
    .join(' ')
}

const HotkeysContext = createContext<HotkeyRegistry | null>(null)

export interface HotkeysProviderProps {
  children?: ReactNode
  /** A registry made elsewhere (tests); otherwise the provider makes one. */
  registry?: HotkeyRegistry
}

/** Mount once, high in the console tree: one registry, one window listener. */
export function HotkeysProvider({ children, registry }: HotkeysProviderProps) {
  const [value] = useState(() => registry ?? createHotkeyRegistry())
  useEffect(() => bindHotkeys(value, window), [value])
  return createElement(HotkeysContext.Provider, { value }, children)
}

/** The registry. Throws outside a HotkeysProvider, so a missing provider fails loudly. */
export function useHotkeyRegistry(): HotkeyRegistry {
  const registry = useContext(HotkeysContext)
  if (!registry) throw new Error('useHotkeys() needs a <HotkeysProvider> above it')
  return registry
}

/**
 * Register shortcuts for as long as the component is mounted. Handlers may change on every render; the
 * registration follows only the keys, labels and flags, so a re-render does not re-register.
 */
export function useHotkeys(hotkeys: readonly Hotkey[]): void {
  const registry = useHotkeyRegistry()
  const latest = useRef(hotkeys)
  useLayoutEffect(() => {
    latest.current = hotkeys
  })
  const signature = hotkeys
    .map((h) => `${h.keys}|${h.label}|${h.group ?? ''}|${h.allowInInputs}|${h.allowInModal}`)
    .join('\n')
  useEffect(() => {
    const offs = latest.current.map((h, i) =>
      registry.register({ ...h, run: (e) => latest.current[i]?.run(e) })
    )
    return () => {
      for (const off of offs) off()
    }
    // `signature` stands for the bindings' identity; handlers are read through `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry, signature])
}

const EMPTY: readonly HotkeyListing[] = []

/** The registry's shortcuts, live: the Help panel's list (S06). */
export function useHotkeyList(): readonly HotkeyListing[] {
  const registry = useContext(HotkeysContext)
  return useSyncExternalStore(
    registry?.subscribe ?? (() => () => undefined),
    registry?.list ?? (() => EMPTY),
    () => EMPTY
  )
}

/**
 * While `active`, Escape (when nothing above handled it, e.g. a Radix layer) calls `onEscape`. Layers stack:
 * only the most recently activated one closes. For surfaces that are not Radix overlays.
 */
export function useEscapeLayer(active: boolean, onEscape: () => void): void {
  const registry = useHotkeyRegistry()
  const latest = useRef(onEscape)
  useLayoutEffect(() => {
    latest.current = onEscape
  })
  useEffect(() => {
    if (!active) return
    return registry.pushLayer(() => latest.current())
  }, [active, registry])
}
