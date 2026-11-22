import { createHotkeyRegistry, type HotkeyRegistry } from '@indus/ops-ui/lib/use-hotkeys'
import { NAV_DESTINATIONS } from '@indus/ops-ui/shell/nav'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createUndoStack, GO_TO, shellHotkeys, type ShellHotkeyEffects } from './shell-hotkeys'

let clock = 0
let registry: HotkeyRegistry
let fx: { [K in keyof ShellHotkeyEffects]: ReturnType<typeof vi.fn> }
let tabs: { prev?: string; next?: string }

/** A keydown as the registry reads it (no DOM: the target is not an element). */
function press(key: string, init: Partial<KeyboardEvent> = {}): { prevented: boolean } {
  const state = { prevented: false }
  registry.handle({
    key,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
    isComposing: false,
    defaultPrevented: false,
    target: null,
    preventDefault: () => {
      state.prevented = true
    },
    ...init,
  } as unknown as KeyboardEvent)
  return state
}

beforeEach(() => {
  clock = 0
  tabs = {}
  registry = createHotkeyRegistry({ now: () => clock })
  fx = {
    go: vi.fn(),
    open: vi.fn(),
    toggle: vi.fn(),
    dismissTop: vi.fn(() => false),
    undo: vi.fn(() => false),
    recordTab: vi.fn((d: 'prev' | 'next') => tabs[d]),
  }
  for (const h of shellHotkeys(fx as unknown as ShellHotkeyEffects)) registry.register(h)
})

describe('global shortcuts', () => {
  it('G + letter goes to each of the nine destinations', () => {
    for (const [letter, key] of GO_TO) {
      press('g')
      clock += 300
      press(letter)
      clock += 2000
      expect(fx.go).toHaveBeenLastCalledWith(NAV_DESTINATIONS.find((d) => d.key === key)!.href)
    }
    expect(fx.go).toHaveBeenCalledTimes(9)
    expect(fx.go.mock.calls.map((c) => c[0])).toEqual([
      '/today',
      '/review',
      '/mail',
      '/enquiries',
      '/quotations',
      '/orders',
      '/suppliers',
      '/clients',
      '/parts',
    ])
  })

  it('N opens a new enquiry; ? toggles help; ⌘K and Ctrl K open the command bar', () => {
    press('n')
    expect(fx.go).toHaveBeenCalledWith('/enquiries/new')
    press('?', { shiftKey: true })
    expect(fx.toggle).toHaveBeenCalledWith('help')
    press('k', { metaKey: true })
    press('k', { ctrlKey: true })
    expect(fx.open).toHaveBeenCalledTimes(2)
    expect(fx.open).toHaveBeenCalledWith('command')
  })

  it('[ and ] follow the record tabs, and do nothing (unprevented) without them', () => {
    expect(press(']').prevented).toBe(false)
    expect(fx.go).not.toHaveBeenCalled()
    tabs = { prev: '/enquiries/ENQ-2026-0001', next: '/enquiries/ENQ-2026-0001/lines' }
    expect(press(']').prevented).toBe(true)
    expect(fx.go).toHaveBeenLastCalledWith('/enquiries/ENQ-2026-0001/lines')
    press('[')
    expect(fx.go).toHaveBeenLastCalledWith('/enquiries/ENQ-2026-0001')
  })

  it('Escape asks the registry to close the top layer; an unhandled Escape is left alone', () => {
    expect(press('Escape').prevented).toBe(false)
    expect(fx.dismissTop).toHaveBeenCalledTimes(1)
    fx.dismissTop.mockReturnValueOnce(true)
    expect(press('Escape').prevented).toBe(true)
  })

  it('⌘Z runs the undo stack only when something is there', () => {
    expect(press('z', { metaKey: true }).prevented).toBe(false)
    fx.undo.mockReturnValueOnce(true)
    expect(press('z', { metaKey: true }).prevented).toBe(true)
  })

  it('lists every shortcut for the Help panel, grouped', () => {
    const groups = new Set(registry.list().map((h) => h.group))
    expect(groups).toEqual(new Set(['Anywhere', 'Go to', 'Create', 'Records']))
    expect(registry.list()).toHaveLength(4 + 9 + 1 + 2)
  })
})

describe('undo stack', () => {
  it('runs the newest undo whose window is open, once', () => {
    const stack = createUndoStack(() => clock)
    const first = vi.fn()
    const second = vi.fn()
    stack.push(first, 300_000)
    const off = stack.push(second, 1000)
    expect(stack.runLatest()).toBe(true)
    expect(second).toHaveBeenCalledTimes(1)
    off()
    expect(stack.runLatest()).toBe(true)
    expect(first).toHaveBeenCalledTimes(1)
    expect(stack.runLatest()).toBe(false)
  })

  it('skips undos whose window has closed, and forgets unregistered ones', () => {
    const stack = createUndoStack(() => clock)
    const old = vi.fn()
    const closed = vi.fn()
    stack.push(old, 300_000)
    stack.push(closed, 5_000)
    const gone = vi.fn()
    stack.push(gone, 300_000)()
    clock += 6_000
    expect(stack.runLatest()).toBe(true)
    expect(closed).not.toHaveBeenCalled()
    expect(gone).not.toHaveBeenCalled()
    expect(old).toHaveBeenCalledTimes(1)
  })
})
