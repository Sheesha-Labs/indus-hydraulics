import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ActivityFeed from './ActivityFeed'
import Diff from './Diff'
import Gantt, { barLabel, ganttSummary, type GanttProps } from './Gantt'
import Timeline from './Timeline'
import WizardSteps from './WizardSteps'

/** Cell texts of every row of the first visually hidden table, header row excluded. */
function hiddenRows(html: string): string[][] {
  const table = /<table class="sr-only">([\s\S]*?)<\/table>/.exec(html)?.[1] ?? ''
  const body = /<tbody>([\s\S]*?)<\/tbody>/.exec(table)?.[1] ?? ''
  return [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
    [...r[1]!.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => c[1]!)
  )
}

const plan: GanttProps = {
  caption: 'Supplier plan',
  axis: ['16 Sep', '23', '30', '7 Oct', '14', '21'],
  today: 2.5,
  rows: [
    {
      key: 'a',
      title: 'Example Valve Co',
      sub: 'INDUS/PO10001',
      bars: [
        { start: 0, end: 2, kind: 'done', label: 'Advance' },
        { start: 2, end: 5, kind: 'slip' },
      ],
      milestones: [{ at: 5, kind: 'warn', label: 'Inspection' }],
    },
    {
      key: 'b',
      title: 'Demo Bearings FZE',
      bars: [
        { start: 1, end: 3, kind: 'plan', label: 'Production' },
        { start: 3, end: 4, kind: 'late' },
      ],
    },
  ],
}

describe('Gantt', () => {
  const html = renderToStaticMarkup(<Gantt {...plan} />)

  it('is one role="img" with a summary label', () => {
    expect(ganttSummary(plan)).toBe(
      'Supplier plan: 2 rows, 16 Sep to 21; 1 slipped, 1 late; today in the week of 30. Details in the table that follows.'
    )
    expect(html).toContain(`role="img" aria-label="${ganttSummary(plan)}"`)
  })

  it('follows the picture with a hidden table of every bar and milestone', () => {
    expect(hiddenRows(html)).toEqual([
      ['Example Valve Co', 'Advance', '16 Sep', '30', 'Done'],
      ['Example Valve Co', 'Slipped', '30', '21', 'Slipped'],
      ['Example Valve Co', 'Inspection', '21', '21', 'Milestone at risk'],
      ['Demo Bearings FZE', 'Production', '23', '7 Oct', 'Planned'],
      ['Demo Bearings FZE', 'Late', '7 Oct', '14', 'Late'],
    ])
  })

  it('slip and late bars always carry a text label', () => {
    expect(barLabel({ start: 0, end: 1, kind: 'slip' })).toBe('Slipped')
    expect(barLabel({ start: 0, end: 1, kind: 'late' })).toBe('Late')
    expect(barLabel({ start: 0, end: 1, kind: 'late', label: 'Production · late 1 wk' })).toBe(
      'Production · late 1 wk'
    )
    expect(barLabel({ start: 0, end: 1, kind: 'plan' })).toBeUndefined()
    const labels = [...html.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1])
    expect(labels).toEqual(['Advance', 'Slipped', 'Production', 'Late'])
  })

  it('hatches the slip bar with a token-coloured pattern, geometry in attributes only', () => {
    expect(html).toMatch(/<pattern id="[\w-]+-slip-0"[^>]*patternTransform="rotate\(45\)"/)
    expect(html).toContain('class="fill-io-warn-tint"')
    expect(html).toMatch(/fill="url\(#[\w-]+-slip-0\)"/)
    expect(html).not.toContain('style=')
  })

  it('marks today with a rule and the matching axis label in accent', () => {
    expect(html).toContain('class="fill-io-bad-solid"')
    expect(html).toMatch(/text-io-accent font-medium[^>]*>30</)
  })
})

describe('Timeline', () => {
  const html = renderToStaticMarkup(
    <Timeline
      aria-label="History"
      items={[
        { key: '1', mark: 'done', date: '14 Sep', dateTime: '2026-09-14', title: 'Received' },
        {
          key: '2',
          mark: 'assistant',
          date: '15 Sep',
          dateTime: '2026-09-15',
          title: 'Drafted',
          by: 'Assistant',
          sub: 'IH-RFQ-2611-P01',
        },
        { key: '3', mark: 'bad', date: '16 Sep', dateTime: '2026-09-16', title: 'Overdue' },
      ]}
    />
  )

  it('is an ordered list with machine-readable dates', () => {
    expect(html).toMatch(/^<ol aria-label="History"/)
    expect(html.match(/<li /g)).toHaveLength(3)
    expect(html).toContain('<time dateTime="2026-09-14"')
  })

  it('says each mark in words, not only colour', () => {
    expect(html).toContain('Done · </span>14 Sep')
    expect(html).toContain('Done by the Assistant · </span>15 Sep')
    expect(html).toContain('Blocked · </span>16 Sep')
  })
})

describe('ActivityFeed', () => {
  it('lists each line with its time and an sr label for the dot', () => {
    const html = renderToStaticMarkup(
      <ActivityFeed
        items={[
          { key: '1', time: '09:12', mark: 'assistant', text: 'Captured an offer' },
          { key: '2', time: '09:40', mark: 'neutral', text: 'Client replied' },
        ]}
      />
    )
    expect(html).toMatch(/^<ol /)
    expect(html).toContain('<time class="text-io-ink-3">09:12</time>')
    expect(html).toContain('Assistant: </span>Captured an offer')
    expect(html).toContain('Client replied')
  })
})

describe('Diff', () => {
  const html = renderToStaticMarkup(
    <Diff
      wasLabel="Quotation R1"
      nowLabel="Revision R2"
      rows={[
        { field: 'Unit price', was: '48.50', now: '46.20' },
        { field: 'Validity', was: '30 days', now: '30 days', same: true },
      ]}
    />
  )

  it('uses del and ins for changes only', () => {
    expect(html).toMatch(/<del [^>]*>48.50<\/del>/)
    expect(html).toMatch(/<ins [^>]*>46.20<\/ins>/)
    expect(html.match(/<del /g)).toHaveLength(1)
    // ink-3, not the kit's ink-4: an unchanged value is still read, and axe fails ink-4 on white (2.8:1).
    expect(html).toContain('<span role="cell" class="text-io-ink-3">30 days</span>')
  })
})

describe('WizardSteps', () => {
  const html = renderToStaticMarkup(
    <WizardSteps steps={['Company', 'Mailboxes', 'History', 'Money']} current={3} />
  )

  it('marks the current step and the done ones', () => {
    expect(html).toMatch(/^<ol aria-label="Steps"/)
    expect(html.match(/aria-current="step"/g)).toHaveLength(1)
    expect(html).toMatch(/data-state="current" aria-current="step"[^>]*>.*?3<\/span>History/)
    expect(html.match(/data-state="done"/g)).toHaveLength(2)
    expect(html.match(/ \(done\)/g)).toHaveLength(2)
    expect(html).toMatch(/data-state="todo"[^>]*>.*?4<\/span>Money/)
  })
})
