import { describe, expect, it } from 'vitest'
import { resolveInRow, resolveSpan, resolveSpans, type SpanSource } from './resolve'

const pdf: SpanSource = {
  kind: 'pdf',
  sourceId: '00000000-0000-0000-0000-000000000001',
  hasTextLayer: true,
  pages: [
    {
      page: 1,
      text: 'Closing date: 28 Sep 2026',
      items: [{ start: 0, end: 25, x: 40, y: 50, w: 200, h: 10 }],
    },
    {
      page: 2,
      text: '1 Ball valve TEST-0001 10 NOS',
      items: [
        { start: 0, end: 1, x: 40, y: 100, w: 6, h: 10 },
        { start: 2, end: 12, x: 70, y: 100, w: 80, h: 10 },
        { start: 13, end: 22, x: 330, y: 100, w: 60, h: 10 },
      ],
    },
  ],
}

describe('resolveSpans', () => {
  it('pdf exact on the named page: offsets and the union of item boxes', () => {
    const s = resolveSpan(pdf, { field: 'description', quote: 'Ball valve TEST-0001', page: 2 })
    expect(s).toMatchObject({ resolved: 'exact', page: 2, charStart: 2, charEnd: 22 })
    expect(s.bbox).toEqual({ x: 70, y: 100, w: 320, h: 10 })
  })

  it('pdf falls back to the page before or after the named one', () => {
    expect(resolveSpan(pdf, { field: 'deadline', quote: '28 Sep 2026', page: 2 })).toMatchObject({
      resolved: 'exact',
      page: 1,
    })
  })

  it('pdf fuzzy within 10 %', () => {
    expect(
      resolveSpan(pdf, { field: 'deadline', quote: 'Closing date: 28 Sept 2026', page: 1 }).resolved
    ).toBe('fuzzy')
  })

  it('a quote not in the source is unresolved', () => {
    expect(resolveSpan(pdf, { field: 'qty', quote: '12 sets of gasket', page: 2 }).resolved).toBe(
      'unresolved'
    )
  })

  it('a scanned PDF and an image are page_only', () => {
    expect(
      resolveSpan({ ...pdf, hasTextLayer: false }, { field: 'qty', quote: '10', page: 2 })
    ).toMatchObject({ resolved: 'page_only', page: 2 })
    expect(
      resolveSpan({ kind: 'image', sourceId: pdf.sourceId }, { field: 'qty', quote: '10' }).resolved
    ).toBe('page_only')
  })

  const sheet: SpanSource = {
    kind: 'sheet',
    sourceId: pdf.sourceId,
    sheets: [
      {
        name: 'RFQ',
        rows: [
          {
            r: 5,
            cells: [
              { c: 'B', v: 'Ball valve 2"' },
              { c: 'E', v: '10' },
            ],
          },
        ],
      },
    ],
  }
  it('sheet: the named cell must hold the quote', () => {
    expect(
      resolveSpan(sheet, { field: 'qty', quote: '10', sheet: 'RFQ', cellRef: 'E5' })
    ).toMatchObject({ resolved: 'exact', cellRef: 'E5' })
    expect(
      resolveSpan(sheet, { field: 'qty', quote: '10', sheet: 'RFQ', cellRef: 'B5' }).resolved
    ).toBe('unresolved')
  })
  it('sheet without a cell: the first cell holding it', () => {
    expect(resolveSpan(sheet, { field: 'description', quote: 'ball valve 2"' })).toMatchObject({
      resolved: 'exact',
      cellRef: 'B5',
      sheet: 'RFQ',
    })
  })

  it('docx: offsets and the table cell', () => {
    const text = 'Intro\nT1R2\tC1:1\tC2:Ball valve 2"\tC3:TEST-0001'
    expect(
      resolveSpan(
        { kind: 'docx', sourceId: pdf.sourceId, text },
        { field: 'part', quote: 'TEST-0001' }
      )
    ).toMatchObject({
      resolved: 'exact',
      cellRef: 'T1R2C3',
    })
  })

  it('email keeps the text hash; a changed body no longer resolves', () => {
    const src: SpanSource = {
      kind: 'email',
      sourceId: pdf.sourceId,
      text: 'Please quote 10 nos',
      textHash: 'abc',
    }
    const [s] = resolveSpans(src, [{ field: 'qty', quote: '10 nos' }])
    expect(s).toMatchObject({ resolved: 'exact', textHash: 'abc', charStart: 13 })
    expect(
      resolveSpan(
        { ...src, text: 'Please quote 12 nos', textHash: 'def' },
        { field: 'qty', quote: '10 nos' }
      ).resolved
    ).toBe('unresolved')
  })
})

describe('resolveInRow', () => {
  const page = {
    kind: 'pdf' as const,
    sourceId: '00000000-0000-0000-0000-000000000001',
    hasTextLayer: true,
    pages: [
      {
        page: 1,
        text: 'Date 4 Nov 1 Gate valve TEST-0102 4 NOS',
        items: [
          { start: 0, end: 10, x: 40, y: 20, w: 80, h: 10 },
          { start: 11, end: 12, x: 40, y: 100, w: 6, h: 10 },
          { start: 13, end: 23, x: 70, y: 100, w: 80, h: 10 },
          { start: 24, end: 33, x: 330, y: 100, w: 60, h: 10 },
          { start: 34, end: 35, x: 420, y: 100, w: 6, h: 10 },
          { start: 36, end: 39, x: 460, y: 100, w: 20, h: 10 },
        ],
      },
    ],
  }
  it('a one-character quantity is found on the description row, not in the date above', () => {
    const anchor = resolveSpan(page, { field: 'description', quote: 'Gate valve', page: 1 })
    const s = resolveInRow(page, { field: 'qty', quote: '4', page: 1 }, anchor)
    expect(s).toMatchObject({ resolved: 'exact', charStart: 34, bbox: { x: 420, y: 100 } })
  })
  it('text: the anchor line only', () => {
    const src = {
      kind: 'email' as const,
      sourceId: page.sourceId,
      text: 'On 4 Nov:\n2 | Gate valve | 4 nos',
      textHash: 'h',
    }
    const anchor = resolveSpan(src, { field: 'description', quote: 'Gate valve' })
    expect(resolveInRow(src, { field: 'qty', quote: '4' }, anchor)).toMatchObject({
      resolved: 'exact',
      charStart: 27,
    })
  })
  it('sheet: the anchor row', () => {
    const src = {
      kind: 'sheet' as const,
      sourceId: page.sourceId,
      sheets: [
        {
          name: 'S',
          rows: [
            {
              r: 4,
              cells: [
                { c: 'B', v: 'Gate valve' },
                { c: 'D', v: '4' },
              ],
            },
          ],
        },
      ],
    }
    const anchor = resolveSpan(src, { field: 'description', quote: 'Gate valve' })
    expect(resolveInRow(src, { field: 'qty', quote: '4' }, anchor)).toMatchObject({
      resolved: 'exact',
      cellRef: 'D4',
    })
  })
})
