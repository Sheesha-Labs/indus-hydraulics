import { describe, expect, it } from 'vitest'
import { MAIL_CLASSES } from '../assistant/schemas/classify'
import { folderFilter, gmailThreadUrl, MAIL_TYPES, rowType, threadTime } from './mail-view'

describe('mail view rules (board 91)', () => {
  it('every stored class but unclassified shows a row type, and unsure always reads Unsure', () => {
    for (const c of MAIL_CLASSES) {
      if (c === 'unclassified') expect(rowType(c, null)).toBeNull()
      else expect(rowType(c, 'sure')).not.toBeNull()
      expect(rowType(c, 'unsure')).toBe('Unsure')
    }
  })

  it('every business class sits in exactly one Type folder', () => {
    const seen = Object.values(MAIL_TYPES).flatMap((t) => t.classes)
    expect(new Set(seen).size).toBe(seen.length)
    for (const c of MAIL_CLASSES.filter((x) => x !== 'unclassified' && x !== 'other'))
      expect(seen).toContain(c)
  })

  it.each([
    ['sales', { mailboxRole: 'client', direction: 'inbound' }],
    ['purchase', { mailboxRole: 'supplier', direction: 'inbound' }],
    ['unsure', { handledState: 'unsure', direction: 'inbound' }],
    ['handled', { handledState: 'handled', direction: 'inbound' }],
    ['sent', { direction: 'outbound' }],
    ['all', { direction: 'inbound' }],
  ] as const)('folder %s', (folder, filter) => {
    expect(folderFilter(folder)).toEqual(filter)
  })

  it('formats thread times like the list', () => {
    const now = new Date('2026-11-24T08:00:00Z') // 12:00 Dubai
    expect(threadTime(new Date('2026-11-24T06:42:00Z'), now)).toBe('10:42')
    expect(threadTime(new Date('2026-11-23T06:00:00Z'), now)).toBe('Yesterday')
    expect(threadTime(new Date('2026-11-20T06:00:00Z'), now)).toBe('Fri')
    expect(threadTime(new Date('2026-09-15T06:00:00Z'), now)).toBe('15 Sep')
  })

  it('opens the thread in the mailbox account', () => {
    expect(gmailThreadUrl('purchase@example.test', '18c0ab')).toBe(
      'https://mail.google.com/mail/u/?authuser=purchase%40example.test#all/18c0ab'
    )
  })
})
