import { describe, expect, it } from 'vitest'
import {
  ENQUIRY_TABS,
  ORDER_TABS,
  recordTabItems,
  TENDER_SECTIONS,
  TENDER_TABS,
  tabsFor,
} from './record-tabs'

const labels = (tabs: readonly { label: string }[]) => tabs.map((t) => t.label)

describe('record tabs', () => {
  it('enquiry: the eleven tabs of C8, Overview on the record page', () => {
    expect(labels(ENQUIRY_TABS)).toEqual([
      'Overview',
      'Lines',
      'Suppliers',
      'RFQs',
      'Questions',
      'Compare',
      'Deviations',
      'Pricing',
      'Quotation',
      'Files',
      'Activity',
    ])
    expect(ENQUIRY_TABS[0].href('ENQ-2026-0001')).toBe('/enquiries/ENQ-2026-0001')
    expect(ENQUIRY_TABS[0].segment).toBe('')
    expect(ENQUIRY_TABS[3].href('ENQ-2026-0001')).toBe('/enquiries/ENQ-2026-0001/rfqs')
  })

  it('order: nine tabs under /orders/[ref] (C11)', () => {
    expect(labels(ORDER_TABS)).toEqual([
      'Confirmation',
      'Advance',
      'Suppliers',
      'Inspection',
      'Freight',
      'Documents',
      'Delivery',
      'Invoices',
      'Profit',
    ])
    expect(ORDER_TABS[4].href('SO-0001')).toBe('/orders/SO-0001/freight')
  })

  it('tender: the five sections first, then the enquiry tabs (C9)', () => {
    expect(labels(TENDER_TABS)).toEqual([
      'Timeline',
      'Requirements',
      'Queries',
      'Vendors',
      'Bid',
      'Lines',
      'Suppliers',
      'RFQs',
      'Compare',
      'Pricing',
      'Files',
      'Activity',
    ])
    TENDER_SECTIONS.forEach((s, i) => {
      expect(TENDER_TABS[i]!.href('ENQ-2026-0001')).toBe(`/enquiries/ENQ-2026-0001/tender/${s}`)
      expect(TENDER_TABS[i]!.segment).toBe(`tender/${s}`)
    })
    expect(TENDER_TABS[5]!.href('ENQ-2026-0001')).toBe('/enquiries/ENQ-2026-0001/lines')
  })

  it('keys and segments are unique within a set', () => {
    for (const kind of ['enquiry', 'order', 'tender'] as const) {
      const tabs = tabsFor(kind)
      expect(new Set(tabs.map((t) => t.key)).size).toBe(tabs.length)
      expect(new Set(tabs.map((t) => t.segment)).size).toBe(tabs.length)
    }
  })

  it('recordTabItems resolves hrefs and attaches counts by key', () => {
    const items = recordTabItems('order', 'SO-0001', { documents: 3 })
    expect(items).toHaveLength(9)
    expect(items[5]).toEqual({
      key: 'documents',
      label: 'Documents',
      segment: 'documents',
      href: '/orders/SO-0001/documents',
      count: 3,
    })
    expect(items[0]).not.toHaveProperty('count')
  })
})
