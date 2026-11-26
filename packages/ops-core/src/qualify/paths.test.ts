import { describe, expect, it } from 'vitest'
import { lineRange, onChooseText, pathCards, type PathFacts } from './paths'

const facts: PathFacts = {
  lineNos: Array.from({ length: 14 }, (_, i) => i + 1),
  regretLineNos: [14],
  askLineNos: [],
  proprietaryNos: [12, 13],
  outsideNos: [14],
  deadline: '28 Sep',
  suggested: 'quote_partial',
  pathConfidence: 'likely',
  realBuyerQuestion: false,
}

describe('path cards (board 167)', () => {
  it('ranges', () => {
    expect(lineRange([1, 2, 3, 4, 5])).toBe('1–5')
    expect(lineRange([12, 13])).toBe('12–13')
    expect(lineRange([3, 5, 9])).toBe('3, 5 and 9')
    expect(lineRange([1, 2, 7])).toBe('1–2 and 7')
    expect(lineRange([])).toBe('')
  })

  it('words each path from the read', () => {
    const c = pathCards(facts)
    expect(c.map((x) => x.path)).toEqual([
      'quote_fully',
      'quote_partial',
      'ask_client_first',
      'regret',
      'ignore_spam',
    ])
    expect(c[0]!.sub).toBe(
      'Ask suppliers for all 14 lines. Line 14 has no supplier on file and would stay open past the deadline'
    )
    expect(c[1]).toMatchObject({
      tag: 'Suggested · Likely',
      sub: 'RFQs for lines 1–13 go today. Line 14 is regretted to the client. Lines 12–13 go as “to follow” if OEM prices miss 28 Sep',
    })
    expect(c.filter((x) => x.tag).length).toBe(1)
    expect(c[2]!.sub).toBe('Ask the client before sourcing. The lines wait for the answers')
    expect(pathCards({ ...facts, askLineNos: [12, 13] })[2]!.sub).toBe(
      'Ask about lines 12–13 before sourcing them. Only those lines are held'
    )
  })

  it('171b state 2: ask first leads, no suggested tag', () => {
    const c = pathCards({ ...facts, realBuyerQuestion: true, suggested: 'ask_client_first' })
    expect(c.slice(0, 2).map((x) => [x.title, x.sub])).toEqual([
      ['Ask the client first', 'Request company details and a delivery address before sourcing'],
      ['Quote fully', 'Treat as a normal enquiry'],
    ])
    expect(c.every((x) => x.tag === null)).toBe(true)
  })

  it('on choose', () => {
    expect(onChooseText('quote_partial', facts)).toContain('regret for line 14')
    expect(onChooseText('ask_client_first', { regretLineNos: [], askLineNos: [12, 13] })).toContain(
      'holds lines 12–13'
    )
    expect(onChooseText('ignore_spam', facts)).toContain('5 minutes to undo')
    expect(onChooseText('quote_fully', facts)).toContain('Nothing is sent yet')
    expect(onChooseText('regret', facts)).toContain('with a reason')
  })
})
