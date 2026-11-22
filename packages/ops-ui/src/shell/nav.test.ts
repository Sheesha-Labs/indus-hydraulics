import { describe, expect, it } from 'vitest'
import { OPS_ICON_NAMES } from '../icons/OpsIcon'
import type { AssistantStatus } from '../types'
import {
  activeKeyFromPathname,
  activeKeyFromSegment,
  isSidebarCollapsed,
  NAV_ALIASES,
  NAV_DESTINATIONS,
  NAV_GROUPS,
  SIDEBAR_COOKIE,
  worstAssistantStatus,
} from './nav'

describe('NAV_GROUPS', () => {
  it('lists the five groups and their items in board order, Money in Work after Orders (C10)', () => {
    expect(NAV_GROUPS.map((g) => [g.label, g.items.map((i) => i.label)])).toEqual([
      ['Workspace', ['Today', 'Review', 'Mail']],
      ['Work', ['Enquiries', 'Quotations', 'Orders', 'Money']],
      ['Directory', ['Suppliers', 'Clients', 'Parts']],
      ['Insight', ['Reports']],
      ['Assistant', ['Autopilot', 'Assistant log']],
    ])
    const work = NAV_GROUPS[1]!.items
    expect(work.find((i) => i.key === 'money')).toMatchObject({ href: '/money', icon: 'money' })
  })

  it('has 14 destinations with unique keys and hrefs, Settings last', () => {
    expect(NAV_DESTINATIONS).toHaveLength(14)
    expect(new Set(NAV_DESTINATIONS.map((d) => d.key)).size).toBe(14)
    expect(new Set(NAV_DESTINATIONS.map((d) => d.href)).size).toBe(14)
    expect(NAV_DESTINATIONS.at(-1)).toMatchObject({ key: 'settings', href: '/settings' })
    for (const d of NAV_DESTINATIONS) expect(OPS_ICON_NAMES).toContain(d.icon)
  })

  it('every destination maps back to its own key from its URL', () => {
    for (const d of NAV_DESTINATIONS) expect(activeKeyFromPathname(d.href)).toBe(d.key)
  })
})

describe('activeKeyFromSegment', () => {
  it.each([
    [['today'], 'today'],
    [['money'], 'money'],
    [['enquiries', 'ENQ-2026-0001'], 'enquiries'],
    [['settings', 'team'], 'settings'],
    [['assistant', 'autopilot'], 'autopilot'],
    [['assistant', 'guardrails'], 'autopilot'],
    [['assistant', 'log'], 'assistant-log'],
    [['tasks'], null],
    [['callbacks'], null],
    [['search'], null],
    [['nope'], null],
    [[], null],
  ] as const)('%j → %s', (segments, key) => {
    expect(activeKeyFromSegment(segments[0], segments[1])).toBe(key)
  })

  it('reads a pathname with a query or hash', () => {
    expect(activeKeyFromPathname('/assistant/log?page=2')).toBe('assistant-log')
    expect(activeKeyFromPathname('/reports/overdue#top')).toBe('reports')
    expect(activeKeyFromPathname('/')).toBeNull()
  })
})

describe('NAV_ALIASES', () => {
  it('keeps the legacy alias table, each pointing at a real destination', () => {
    expect(NAV_ALIASES).toMatchObject({
      Dashboard: 'today',
      Leads: 'enquiries',
      Catalogue: 'parts',
    })
    const keys = NAV_DESTINATIONS.map((d) => d.key)
    for (const key of Object.values(NAV_ALIASES)) expect(keys).toContain(key)
  })
})

describe('sidebar cookie', () => {
  it('is ops_sidebar and only "collapsed" collapses', () => {
    expect(SIDEBAR_COOKIE).toBe('ops_sidebar')
    expect(isSidebarCollapsed('collapsed')).toBe(true)
    expect(isSidebarCollapsed('expanded')).toBe(false)
    expect(isSidebarCollapsed(undefined)).toBe(false)
    expect(isSidebarCollapsed('1')).toBe(false)
  })
})

describe('worstAssistantStatus', () => {
  it.each([
    [['running'], 'running'],
    [['running', 'unsure'], 'unsure'],
    [['unsure', 'paused'], 'paused'],
    [['paused', 'disconnected', 'running'], 'disconnected'],
    [['off', 'running'], 'off'],
    [['off', 'unsure'], 'unsure'],
    [[], 'running'],
  ] as const)('%j → %s', (states, worst) => {
    expect(worstAssistantStatus(states as readonly AssistantStatus[])).toBe(worst)
  })

  it('accepts a single status', () => {
    expect(worstAssistantStatus('paused')).toBe('paused')
  })
})
