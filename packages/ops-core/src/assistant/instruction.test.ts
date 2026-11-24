import { describe, expect, it } from 'vitest'
import {
  instructionHeadline,
  instructionOutput,
  validateInstruction,
  type InstructionOutput,
} from './instruction'

const now = new Date('2026-11-24T10:00:00+04:00')
const ctx = {
  lines: [
    { no: 1, status: 'open' },
    { no: 4, status: 'sourcing' },
    { no: 5, status: 'held' },
    { no: 6, status: 'cancelled' },
  ],
  requestable: ['chase_suppliers'],
  now,
}
const out = (params: InstructionOutput['params']): InstructionOutput => ({ params, reasons: [] })

describe('instruction output schema', () => {
  it('accepts each intent and refuses numbers that are not params', () => {
    expect(
      instructionOutput.safeParse(
        out({
          intent: 'hold_line',
          lineNo: 4,
          until: 'answer',
          note: 'the client confirms the trim',
        })
      ).success
    ).toBe(true)
    expect(
      instructionOutput.safeParse({
        params: { intent: 'add_note', text: 'x', qty: 5 },
        reasons: [],
      }).success
    ).toBe(false)
    expect(
      instructionOutput.safeParse({ params: { intent: 'set_price', lineNo: 1 }, reasons: [] })
        .success
    ).toBe(false)
  })
})

describe('validateInstruction', () => {
  it.each([
    [out({ intent: 'hold_line', lineNo: 4, until: 'answer', note: 'trim' }), true],
    [out({ intent: 'hold_line', lineNo: 9, until: 'answer', note: 'trim' }), 'There is no line 9'],
    [out({ intent: 'hold_line', lineNo: 5, until: 'answer', note: 'trim' }), 'already held'],
    [out({ intent: 'hold_line', lineNo: 6, until: 'answer', note: 'trim' }), 'is cancelled'],
    [out({ intent: 'hold_line', lineNo: 1, until: 'date', note: 'x' }), 'needs the date'],
    [
      out({ intent: 'hold_line', lineNo: 1, until: 'date', date: '2026-11-01', note: 'x' }),
      'not in the future',
    ],
    [out({ intent: 'hold_line', lineNo: 1, until: 'date', date: '2026-12-01', note: 'x' }), true],
    [out({ intent: 'release_line', lineNo: 5 }), true],
    [out({ intent: 'release_line', lineNo: 4 }), 'is not held'],
    [out({ intent: 'add_task', title: 'Call the buyer', assignee: 'helper' }), true],
    [
      out({ intent: 'add_task', title: 'x', dueOn: '2026-01-01', assignee: 'owner' }),
      'not in the future',
    ],
    [out({ intent: 'add_note', text: 'Client prefers sea freight' }), true],
    [out({ intent: 'set_reminder', at: '2026-11-25T09:00:00+04:00', text: 'chase' }), true],
    [
      out({ intent: 'set_reminder', at: '2026-11-23T09:00:00+04:00', text: 'chase' }),
      'not in the future',
    ],
    [out({ intent: 'request_action', targetKey: 'chase_suppliers' }), true],
    [out({ intent: 'request_action', targetKey: 'send_quotation' }), 'cannot be asked'],
    [out({ intent: 'request_action', targetKey: 'make_coffee' }), 'not an action'],
    [out({ intent: 'unclear', why: 'Which line?' }), 'Which line?'],
  ] as const)('%o → %s', (o, want) => {
    const r = validateInstruction(o, ctx)
    if (want === true) expect(r).toEqual({ ok: true })
    else {
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.problems.join(' ')).toContain(want)
    }
  })
})

describe('instructionHeadline (written by code)', () => {
  it('names the change', () => {
    expect(
      instructionHeadline({
        intent: 'hold_line',
        lineNo: 4,
        until: 'answer',
        note: 'until the client confirms the trim',
      })
    ).toBe('Hold line 4 until the client confirms the trim')
    expect(instructionHeadline({ intent: 'release_line', lineNo: 2 })).toBe('Release line 2')
    expect(
      instructionHeadline(
        { intent: 'request_action', targetKey: 'chase_suppliers' },
        'Chase suppliers'
      )
    ).toBe('Ask the Assistant to Chase suppliers')
    expect(instructionHeadline({ intent: 'unclear', why: 'x' })).toBe(
      'I could not turn this into an action'
    )
  })
})
