import { vatRows } from '@indus/ops-core'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BarList from './BarList'
import FxTag, { fxText } from './FxTag'
import Heatmap, { HEAT_CLASS, heatLevel } from './Heatmap'
import Money from './Money'
import StackedBar from './StackedBar'
import TrendChart from './TrendChart'
import VatBlock, { vatBlockRows } from './VatBlock'

/** Header and body cell texts of the visually hidden table. */
function hiddenTable(html: string): { caption: string; head: string[]; rows: string[][] } {
  const table = /<table class="sr-only">([\s\S]*?)<\/table>/.exec(html)?.[1] ?? ''
  const cells = (s: string) => [...s.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => c[1]!)
  const head = /<thead>([\s\S]*?)<\/thead>/.exec(table)?.[1] ?? ''
  const body = /<tbody>([\s\S]*?)<\/tbody>/.exec(table)?.[1] ?? ''
  return {
    caption: /<caption>([\s\S]*?)<\/caption>/.exec(table)?.[1] ?? '',
    head: cells(head),
    rows: [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) => cells(r[1]!)),
  }
}

describe('every chart is a figure with a caption and a hidden table of its data', () => {
  it('BarList', () => {
    const data = [
      { key: 'a', label: 'Sample Client LLC', value: 300, display: 'USD 300', sub: '2 quotations' },
      { key: 'b', label: 'Demo Bearings FZE', value: 150, display: 'AED 150', tone: 'n' as const },
    ]
    const html = renderToStaticMarkup(<BarList title="Awaiting decision" data={data} />)
    expect(html).toMatch(/^<figure /)
    expect(html).toContain('<figcaption')
    expect(hiddenTable(html)).toEqual({
      caption: 'Awaiting decision',
      head: ['Item', 'Value', 'Note'],
      rows: [
        ['Sample Client LLC', 'USD 300', '2 quotations'],
        ['Demo Bearings FZE', 'AED 150', ''],
      ],
    })
    // Bars scale to the largest value; values print beside the bars.
    expect(html).toMatch(
      /width="100%" height="10" clip-path="url\(#[\w-]+-bar-0\)" class="fill-io-accent"/
    )
    expect(html).toMatch(
      /width="50%" height="10" clip-path="url\(#[\w-]+-bar-1\)" class="fill-io-stroke"/
    )
    expect(html).toContain('USD 300')
  })

  it('StackedBar', () => {
    const segments = [
      { key: 'w', label: 'Won', value: 3, display: '3', tone: 'acc' as const },
      { key: 'l', label: 'Lost', value: 1, display: '1', tone: 'bad' as const },
    ]
    const html = renderToStaticMarkup(<StackedBar title="Outcome" segments={segments} />)
    expect(hiddenTable(html).rows).toEqual([
      ['Won', '3'],
      ['Lost', '1'],
    ])
    expect(html).toMatch(/x="0%" width="75%" height="14" class="fill-io-accent"/)
    expect(html).toMatch(/x="75%" width="25%" height="14" class="fill-io-bad-solid"/)
    expect(html).toContain('Lost<b class="font-medium">1</b>')
  })

  it('TrendChart', () => {
    const html = renderToStaticMarkup(
      <TrendChart
        title="Margin by month"
        x={['May', 'Jun', 'Jul']}
        series={[
          { key: 'm', label: 'Margin %', tone: 'acc', values: [15.4, 14.8, 16.1] },
          { key: 'g', label: 'Guardrail', tone: 'bad', values: [12, 12, 12], dashed: true },
        ]}
        format={(v) => `${v.toFixed(1)}%`}
      />
    )
    expect(hiddenTable(html)).toEqual({
      caption: 'Margin by month',
      head: ['Series', 'May', 'Jun', 'Jul'],
      rows: [
        ['Margin %', '15.4%', '14.8%', '16.1%'],
        ['Guardrail', '12.0%', '12.0%', '12.0%'],
      ],
    })
    expect(html).toContain('viewBox="0 0 600 180"')
    expect(html.match(/<line /g)).toHaveLength(4)
    expect(html.match(/<circle /g)).toHaveLength(3)
    expect(html).toContain('stroke-dasharray="5 4"')
  })

  it('Heatmap', () => {
    const html = renderToStaticMarkup(
      <Heatmap
        title="Overdue"
        columns={['Owner', 'Helper']}
        rows={[
          { key: 'q', label: 'Quotations', values: [3, 0] },
          { key: 'p', label: 'Payments', values: [4, 1] },
        ]}
      />
    )
    expect(hiddenTable(html)).toEqual({
      caption: 'Overdue',
      head: ['', 'Owner', 'Helper'],
      rows: [
        ['Quotations', '3', '0'],
        ['Payments', '4', '1'],
      ],
    })
    expect(html).toContain('grid-cols-[140px_repeat(2,minmax(0,1fr))]')
    expect(html).toMatch(/data-level="none"[^>]*>—</)
    expect(html).toMatch(/data-level="high"[^>]*>4</)
  })
})

describe('Heatmap thresholds', () => {
  it.each([
    [0, 'none'],
    [0.5, 'none'],
    [1, 'low'],
    [1.9, 'low'],
    [2, 'mid'],
    [3, 'mid'],
    [4, 'high'],
    [12, 'high'],
  ] as const)('%d → %s', (v, level) => {
    expect(heatLevel(v)).toBe(level)
  })

  it('maps each level to the kit tones', () => {
    expect(HEAT_CLASS).toEqual({
      high: 'bg-io-bad-solid text-white',
      mid: 'bg-io-bad-tint text-io-bad',
      low: 'bg-io-warn-tint text-io-warn',
      none: 'bg-io-paper text-io-ink-4',
    })
  })
})

describe('Money', () => {
  it('prints the currency code first and the AED equivalent at the rate used', () => {
    const html = renderToStaticMarkup(<Money ccy="EUR" amount="8420.00" aed={{ rate: '3.9789' }} />)
    expect(html).toMatch(/>EUR<\/span><span class="[^"]*text-\[15px\][^"]*">8,420.00</)
    expect(html).toContain('AED 33,502.34</b> at EUR 1 = 3.9789')
  })

  it('brackets negatives in bad and sizes from the closed set', () => {
    const html = renderToStaticMarkup(<Money ccy="AED" amount="-1283" size={20} />)
    expect(html).toMatch(/class="[^"]*text-\[20px\][^"]*text-io-bad[^"]*">\(1,283.00\)</)
    expect(html).not.toContain('≈')
  })

  it('drops decimals in lists when the value is whole, and shows — when empty', () => {
    expect(renderToStaticMarkup(<Money ccy="USD" amount="12400.00" decimals="list" />)).toContain(
      '>12,400<'
    )
    expect(renderToStaticMarkup(<Money ccy="USD" amount="12400.50" decimals="list" />)).toContain(
      '>12,400.50<'
    )
    expect(renderToStaticMarkup(<Money ccy="USD" amount="" />)).toContain('text-io-ink-4')
  })
})

describe('FxTag', () => {
  it('always says which rate it is', () => {
    expect(fxText({ state: 'live', pair: 'USD → AED 3.6725' })).toBe('Live · USD → AED 3.6725')
    expect(
      fxText({
        state: 'locked',
        pair: 'EUR → AED 3.9789',
        lockedOn: new Date('2026-10-02T08:00:00Z'),
      })
    ).toBe('Locked 2 Oct · EUR → AED 3.9789')
    expect(fxText({ state: 'stale', pair: 'GBP → AED 4.6678', ageDays: 3 })).toBe(
      'Rate is 3 days old · GBP → AED 4.6678'
    )
    expect(fxText({ state: 'stale', pair: 'X', ageDays: 1 })).toBe('Rate is 1 day old · X')
    expect(renderToStaticMarkup(<FxTag state="stale" pair="X" />)).toContain(
      'bg-io-warn-tint text-io-warn'
    )
  })
})

describe('VatBlock', () => {
  it('renders the rows vatRows() computes, formatted, and computes nothing itself', () => {
    const rows = vatBlockRows(vatRows('standard', '12400.00', '12400.00', '3.6725', 'USD'))
    expect(rows).toEqual([
      { key: 'subtotal', label: 'Sub total', value: '12,400.00' },
      { key: 'vat', label: 'VAT · standard rate (5%)', value: '620.00' },
      { key: 'total', label: 'Total (USD)', value: '13,020.00', kind: 'total' },
      { key: 'vat_aed', label: 'VAT in AED at 3.6725', value: '2,276.95', kind: 'muted' },
    ])
    const html = renderToStaticMarkup(<VatBlock rows={rows} />)
    expect(html).toMatch(/^<dl /)
    expect(html).toContain('<dt>Total (USD)</dt><dd class="text-[14px]">13,020.00</dd>')
    expect(html).toMatch(/data-kind="muted" class="[^"]*text-io-ink-3/)
  })
})
