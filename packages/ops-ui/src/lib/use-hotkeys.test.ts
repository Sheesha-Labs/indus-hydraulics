/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from './test-dom'
import {
  bindHotkeys,
  createHotkeyRegistry,
  formatHotkey,
  HotkeysProvider,
  isEditableTarget,
  normaliseKeys,
  useEscapeLayer,
  useHotkeyList,
  useHotkeys,
  type HotkeyRegistry,
} from './use-hotkeys'

let clock = 0
let registry: HotkeyRegistry
let unbind: () => void

beforeEach(() => {
  clock = 0
  registry = createHotkeyRegistry({ now: () => clock })
  unbind = bindHotkeys(registry, window)
  document.body.innerHTML = `
    <button id="page">Page</button>
    <input id="field" />
    <textarea id="area"></textarea>
    <select id="pick"><option>a</option></select>
    <div id="rich" contenteditable="true"></div>
    <div role="dialog" aria-modal="true"><button id="in-modal">In modal</button><input id="modal-field" /></div>
    <div role="alertdialog"><button id="in-alert">Confirm</button></div>
  `
})

afterEach(() => {
  unbind()
  cleanup()
  document.body.innerHTML = ''
})

/** Dispatch a keydown from the element with this id (focusing it first) and return the event. */
function press(id: string, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const el = document.getElementById(id)!
  el.focus()
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

describe('chords', () => {
  it('G then T within the window runs the chord, and only once', () => {
    const run = vi.fn()
    registry.register({ keys: 'g t', label: 'Go to Today', run })
    press('page', 'g')
    clock += 400
    const second = press('page', 't')
    expect(run).toHaveBeenCalledTimes(1)
    expect(second.defaultPrevented).toBe(true)
    press('page', 't')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('the window is 1 s: a second key after it does nothing', () => {
    const run = vi.fn()
    registry.register({ keys: 'g t', label: 'Go to Today', run })
    press('page', 'g')
    clock += 1001
    press('page', 't')
    expect(run).not.toHaveBeenCalled()
    press('page', 'g')
    clock += 1000
    press('page', 't')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('a different second key spends the chord without acting on its own', () => {
    const today = vi.fn()
    const newEnquiry = vi.fn()
    registry.register({ keys: 'g t', label: 'Go to Today', run: today })
    registry.register({ keys: 'n', label: 'New enquiry', run: newEnquiry })
    press('page', 'g')
    press('page', 'n')
    expect(today).not.toHaveBeenCalled()
    expect(newEnquiry).not.toHaveBeenCalled()
    press('page', 'n')
    expect(newEnquiry).toHaveBeenCalledTimes(1)
  })

  it('a lone chord prefix is not prevented, and letters match with shift or caps', () => {
    const run = vi.fn()
    registry.register({ keys: 'g r', label: 'Go to Review', run })
    expect(press('page', 'g').defaultPrevented).toBe(false)
    press('page', 'R', { shiftKey: true })
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('a chord never starts while typing', () => {
    const run = vi.fn()
    registry.register({ keys: 'g t', label: 'Go to Today', run })
    press('field', 'g')
    press('page', 't')
    expect(run).not.toHaveBeenCalled()
  })
})

describe('input suppression', () => {
  it('plain keys do nothing in an input, textarea, select or contenteditable', () => {
    const run = vi.fn()
    registry.register({ keys: 'n', label: 'New enquiry', run })
    registry.register({ keys: '?', label: 'Help', run })
    for (const id of ['field', 'area', 'pick', 'rich']) {
      expect(press(id, 'n').defaultPrevented).toBe(false)
      press(id, '?', { shiftKey: true })
    }
    expect(run).not.toHaveBeenCalled()
    press('page', 'n')
    press('page', '?', { shiftKey: true })
    expect(run).toHaveBeenCalledTimes(2)
  })

  it('⌘K and Ctrl K are allowed in inputs; ⌘Z is left to the field', () => {
    const command = vi.fn()
    const undo = vi.fn()
    registry.register({ keys: 'mod+k', label: 'Command bar', run: command, allowInInputs: true })
    registry.register({ keys: 'mod+z', label: 'Undo', run: undo })
    expect(press('field', 'k', { metaKey: true }).defaultPrevented).toBe(true)
    press('area', 'k', { ctrlKey: true })
    expect(command).toHaveBeenCalledTimes(2)
    expect(press('field', 'z', { metaKey: true }).defaultPrevented).toBe(false)
    expect(undo).not.toHaveBeenCalled()
    press('page', 'z', { metaKey: true })
    expect(undo).toHaveBeenCalledTimes(1)
  })

  it('a modifier changes the key: K alone is not ⌘K, ⌘N is not N', () => {
    const command = vi.fn()
    const newEnquiry = vi.fn()
    registry.register({ keys: 'mod+k', label: 'Command bar', run: command, allowInInputs: true })
    registry.register({ keys: 'n', label: 'New enquiry', run: newEnquiry })
    press('page', 'k')
    press('page', 'n', { metaKey: true })
    expect(command).not.toHaveBeenCalled()
    expect(newEnquiry).not.toHaveBeenCalled()
  })

  it('knows contenteditable="false" is not editable', () => {
    const el = document.createElement('div')
    el.setAttribute('contenteditable', 'false')
    expect(isEditableTarget(el)).toBe(false)
    expect(isEditableTarget(document.getElementById('rich'))).toBe(true)
  })
})

describe('modal suppression', () => {
  it('shortcuts stop while a modal or an alertdialog owns focus, except the allowed ones', () => {
    const go = vi.fn()
    const command = vi.fn()
    const escape = vi.fn()
    registry.register({ keys: 'g t', label: 'Go to Today', run: go })
    registry.register({ keys: 'n', label: 'New enquiry', run: go })
    registry.register({
      keys: 'mod+k',
      label: 'Command bar',
      run: command,
      allowInInputs: true,
      allowInModal: true,
    })
    registry.register({
      keys: 'escape',
      label: 'Close',
      run: escape,
      allowInInputs: true,
      allowInModal: true,
    })
    press('in-modal', 'n')
    press('in-modal', 'g')
    press('in-modal', 't')
    press('in-alert', 'n')
    expect(go).not.toHaveBeenCalled()
    press('modal-field', 'k', { metaKey: true })
    press('in-modal', 'Escape')
    expect(command).toHaveBeenCalledTimes(1)
    expect(escape).toHaveBeenCalledTimes(1)
  })
})

describe('handled and repeated events', () => {
  it('skips an event something else already prevented, and key repeats', () => {
    const run = vi.fn()
    registry.register({ keys: ']', label: 'Next tab', run })
    const el = document.getElementById('page')!
    el.addEventListener('keydown', (e) => e.preventDefault(), { once: true })
    press('page', ']')
    press('page', ']', { repeat: true })
    expect(run).not.toHaveBeenCalled()
    press('page', ']')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('a handler returning false leaves the event alone', () => {
    registry.register({ keys: '[', label: 'Previous tab', run: () => false })
    expect(press('page', '[').defaultPrevented).toBe(false)
  })
})

describe('Escape layers', () => {
  it('closes only the top-most layer, then the one under it', () => {
    const order: string[] = []
    registry.register({
      keys: 'escape',
      label: 'Close the top-most layer',
      run: () => registry.dismissTop(),
      allowInInputs: true,
      allowInModal: true,
    })
    registry.pushLayer(() => order.push('panel'))
    const removeDrawer = registry.pushLayer(() => order.push('drawer'))
    registry.pushLayer(() => order.push('help'))
    press('page', 'Escape')
    expect(order).toEqual(['help'])
    removeDrawer()
    press('page', 'Escape')
    expect(order).toEqual(['help', 'panel'])
    expect(press('page', 'Escape').defaultPrevented).toBe(false)
  })
})

describe('listing and formatting', () => {
  it('lists registrations in order with canonical keys, and forgets unregistered ones', () => {
    const off = registry.register({
      keys: 'Mod+K',
      label: 'Command bar',
      group: 'Global',
      run() {},
    })
    registry.register({ keys: 'g  t', label: 'Go to Today', group: 'Go to', run() {} })
    const first = registry.list()
    expect(first).toEqual([
      { keys: 'mod+k', label: 'Command bar', group: 'Global' },
      { keys: 'g t', label: 'Go to Today', group: 'Go to' },
    ])
    expect(registry.list()).toBe(first)
    off()
    expect(registry.list().map((h) => h.label)).toEqual(['Go to Today'])
  })

  it('prints keys for Mac and PC', () => {
    expect(normaliseKeys('Shift+Mod+K')).toBe('mod+shift+k')
    expect(formatHotkey('mod+k', true)).toBe('⌘K')
    expect(formatHotkey('mod+k', false)).toBe('Ctrl+K')
    expect(formatHotkey('g t', true)).toBe('G T')
    expect(formatHotkey('escape', false)).toBe('Esc')
    expect(formatHotkey(']', true)).toBe(']')
  })
})

describe('React bindings', () => {
  it('useHotkeys registers while mounted, follows the latest handler, and the list is live', () => {
    unbind()
    const calls: string[] = []
    function Bindings({ tag }: { tag: string }) {
      useHotkeys([{ keys: 'n', label: 'New enquiry', run: () => void calls.push(tag) }])
      return null
    }
    function List() {
      const list = useHotkeyList()
      return createElement('p', { 'data-testid': 'list' }, list.map((h) => h.label).join(','))
    }
    const shared = createHotkeyRegistry()
    const view = render(
      createElement(
        HotkeysProvider,
        { registry: shared },
        createElement(Bindings, { tag: 'a' }),
        createElement(List)
      )
    )
    expect(screen.getByTestId('list')).toHaveTextContent('New enquiry')
    press('page', 'n')
    view.rerender(
      createElement(
        HotkeysProvider,
        { registry: shared },
        createElement(Bindings, { tag: 'b' }),
        createElement(List)
      )
    )
    press('page', 'n')
    expect(calls).toEqual(['a', 'b'])
    expect(shared.list()).toHaveLength(1)
    view.rerender(createElement(HotkeysProvider, { registry: shared }, createElement(List)))
    expect(screen.getByTestId('list')).toHaveTextContent('')
  })

  it('useEscapeLayer stacks while active', () => {
    unbind()
    const shared = createHotkeyRegistry()
    const closed = vi.fn()
    function Layer({ active }: { active: boolean }) {
      useEscapeLayer(active, closed)
      return null
    }
    const view = render(
      createElement(HotkeysProvider, { registry: shared }, createElement(Layer, { active: true }))
    )
    act(() => {
      expect(shared.dismissTop()).toBe(true)
    })
    expect(closed).toHaveBeenCalledTimes(1)
    view.rerender(
      createElement(HotkeysProvider, { registry: shared }, createElement(Layer, { active: false }))
    )
    expect(shared.dismissTop()).toBe(false)
  })
})
