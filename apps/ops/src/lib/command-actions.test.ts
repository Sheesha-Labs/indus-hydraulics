import { parseReference } from '@indus/ops-core'
import { describe, expect, it } from 'vitest'
import {
  COMMAND_ACTIONS,
  commandActions,
  DEFAULT_ACTION_COUNT,
  looksLikeQuestion,
  referenceHref,
} from './command-actions'
import { shellHotkeys } from './shell-hotkeys'

describe('commandActions', () => {
  it('an empty query shows the board’s three actions for the Owner, in order', () => {
    expect(commandActions('owner', '').map((a) => a.label)).toEqual([
      'New enquiry',
      'Pause Assistant',
      'Go to Review',
    ])
    expect(commandActions('owner', '   ')).toHaveLength(DEFAULT_ACTION_COUNT)
  })

  it('the Helper never sees Pause Assistant (Owner only, C22)', () => {
    expect(commandActions('helper', '').map((a) => a.id)).not.toContain('pause-assistant')
    expect(commandActions('helper', 'pause')).toEqual([])
    expect(commandActions('owner', 'pause').map((a) => a.id)).toEqual(['pause-assistant'])
  })

  it('every word must match the label or a keyword, case-insensitively', () => {
    expect(commandActions('owner', 'GO review').map((a) => a.id)).toEqual(['go-review'])
    expect(commandActions('owner', 'create').map((a) => a.id)).toEqual(['new-enquiry'])
    expect(commandActions('owner', 'open').map((a) => a.id)).toEqual([
      'open-assistant',
      'open-notifications',
    ])
    expect(commandActions('owner', 'nothing like this')).toEqual([])
  })

  it('a shortcut hint is a key the hotkey registry really binds', () => {
    const bound = new Set(
      shellHotkeys({
        go: () => undefined,
        open: () => undefined,
        toggle: () => undefined,
        dismissTop: () => false,
        undo: () => false,
        recordTab: () => undefined,
      }).map((h) => h.keys.toLowerCase())
    )
    for (const a of COMMAND_ACTIONS)
      if (a.keys) expect(bound.has(a.keys.toLowerCase()), `${a.label}: ${a.keys}`).toBe(true)
  })
})

describe('referenceHref', () => {
  const href = (q: string) => referenceHref(parseReference(q)!)
  it('routes enquiries, orders and quotations to their pages', () => {
    expect(href('enq 2026 0001')).toBe('/enquiries/ENQ-2026-0001')
    expect(href('SO-0001-B')).toBe('/orders/SO-0001-B')
    expect(href('INDUS/Q10001-R2')).toBe('/quotations/Q10001-R2')
    expect(href('10001')).toBe('/quotations/Q10001')
  })
  it('sends everything else to search', () => {
    expect(href('INDUS/INV10001')).toBe('/search?q=INDUS%2FINV10001')
    expect(href('EXV-10001')).toBe('/search?q=EXV-10001')
    expect(href('6205 C3')).toBe('/search?q=6205C3')
  })
})

describe('looksLikeQuestion', () => {
  it.each([
    ['who quoted 6205-C3 last', true],
    ['Which suppliers are late', true],
    ['overdue invoices?', true],
    ['INDUS/Q10001', false],
    ['go review', false],
  ])('%s → %s', (q, yes) => expect(looksLikeQuestion(q)).toBe(yes))
})
