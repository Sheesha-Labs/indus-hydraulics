import { describe, expect, it } from 'vitest'
import {
  LIST_IMPORT_MAX,
  PAIR_MAPPING,
  contactsFromRows,
  csvCell,
  detectColumns,
  isValidListEmail,
  normaliseListEmail,
  parseCsv,
  toCsv,
  toImportPairs,
} from './lists'

// Ported from Bazar (lib/newsletter/lists.test.ts), plus the manual mapping
// and the browser → server pairs Bazar does not have.

describe('parseCsv', () => {
  it('reads quoted fields with delimiters, quotes and line breaks, and a BOM', () => {
    expect(parseCsv('﻿name,email\n"Doe, Jane",jane@x.com\n"A ""B""",b@x.com\r\n')).toEqual([
      ['name', 'email'],
      ['Doe, Jane', 'jane@x.com'],
      ['A "B"', 'b@x.com'],
    ])
  })

  it('detects semicolon and tab delimiters, and skips blank lines', () => {
    expect(parseCsv('name;email\nJane;jane@x.com\n\n')).toEqual([
      ['name', 'email'],
      ['Jane', 'jane@x.com'],
    ])
    expect(parseCsv('email\tname\nj@x.com\tJane')).toEqual([
      ['email', 'name'],
      ['j@x.com', 'Jane'],
    ])
  })

  it('keeps a quoted line break inside one field', () => {
    expect(parseCsv('email,note\na@x.com,"line one\nline two"')).toEqual([
      ['email', 'note'],
      ['a@x.com', 'line one\nline two'],
    ])
  })
})

describe('detectColumns', () => {
  it('reads a header row', () => {
    expect(detectColumns(parseCsv('Full Name,E-mail Address\nJane,j@x.com'))).toEqual({
      email: 1,
      name: 0,
      first: null,
      last: null,
      header: true,
    })
    expect(detectColumns(parseCsv('first name,last name,email\nJane,Doe,j@x.com'))).toMatchObject({
      email: 2,
      name: null,
      first: 0,
      last: 1,
      header: true,
    })
  })

  it('finds the address column when there is no header', () => {
    expect(detectColumns(parseCsv('Jane,j@x.com\nAli,a@x.com'))).toEqual({
      email: 1,
      name: 0,
      first: null,
      last: null,
      header: false,
    })
  })

  it('falls back to the first column when nothing looks like an address', () => {
    expect(detectColumns([['Company', 'Contact'], ['Acme', 'Jane']]).email).toBe(0)
  })
})

describe('contactsFromRows', () => {
  it('lower-cases, dedupes, and reports the unusable lines by file line number', () => {
    const rows = parseCsv(
      'Full Name,E-mail Address\nJane Doe, JANE@Example.com \nNo Address,\nBad,not-an-email\nJane again,jane@example.com\n',
    )
    const r = contactsFromRows(rows, detectColumns(rows))
    expect(r.contacts).toEqual([{ email: 'jane@example.com', name: 'Jane Doe' }])
    expect(r.duplicates).toBe(1)
    expect(r.invalid.map((i) => [i.line, i.reason])).toEqual([
      [3, 'No email address'],
      [4, 'Not an email address'],
    ])
  })

  it('honours a mapping picked by hand over the guess', () => {
    // Headers we do not recognise: "Contact email" is not an email header,
    // so detection cannot find it — the picker can.
    const rows = parseCsv('Company,Contact email,Person\nAcme,a@acme.com,Jane\nBeta,b@beta.com,Ali')
    expect(detectColumns(rows).header).toBe(false)
    const r = contactsFromRows(rows, { email: 1, name: 2, first: null, last: null, header: true })
    expect(r.contacts).toEqual([
      { email: 'a@acme.com', name: 'Jane' },
      { email: 'b@beta.com', name: 'Ali' },
    ])
    expect(r.invalid).toEqual([])
  })

  it('joins first and last names and collapses whitespace', () => {
    const rows = parseCsv('first name,last name,email\n  Jane ,  Doe ,j@x.com')
    expect(contactsFromRows(rows, detectColumns(rows)).contacts[0]).toEqual({ email: 'j@x.com', name: 'Jane Doe' })
  })

  it('stops at the cap and counts what it left', () => {
    const rows = Array.from({ length: LIST_IMPORT_MAX + 3 }, (_, i) => [`p${i}@x.com`])
    const r = contactsFromRows(rows, { email: 0, name: null, first: null, last: null, header: false })
    expect(r.contacts).toHaveLength(LIST_IMPORT_MAX)
    expect(r.truncated).toBe(3)
  })
})

describe('the browser → server pairs', () => {
  it('carry only the raw address and the name, and parse back to the same contacts', () => {
    const rows = parseCsv('first,last,email,phone\nJane,Doe,J@X.com,+971 50\nAli,,bad,+971 55')
    const mapping = { email: 2, name: null, first: 0, last: 1, header: true }
    const pairs = toImportPairs(rows, mapping)
    expect(pairs).toEqual([
      ['J@X.com', 'Jane Doe'],
      ['bad', 'Ali'],
    ])
    // The phone column never leaves the browser.
    expect(JSON.stringify(pairs)).not.toContain('+971')
    const server = contactsFromRows(pairs, PAIR_MAPPING)
    const browser = contactsFromRows(rows, mapping)
    expect(server.contacts).toEqual(browser.contacts)
    expect(server.invalid).toHaveLength(browser.invalid.length)
  })
})

describe('addresses', () => {
  it('normalises and validates', () => {
    expect(normaliseListEmail(' mailto:<Jane@X.COM> ')).toBe('jane@x.com')
    expect(isValidListEmail('a@b.co')).toBe(true)
    expect(isValidListEmail('a@b')).toBe(false)
    expect(isValidListEmail('a b@c.com')).toBe(false)
    expect(isValidListEmail('a@b.c')).toBe(false)
    expect(isValidListEmail(`${'a'.repeat(250)}@b.com`)).toBe(false)
  })
})

describe('CSV out', () => {
  it('quotes commas and defuses spreadsheet formulas', () => {
    expect(csvCell('=HYPERLINK(1), x')).toBe(`"'=HYPERLINK(1), x"`)
    expect(csvCell('+971 50 123')).toBe(`'+971 50 123`)
    expect(csvCell('-1')).toBe(`'-1`)
    expect(csvCell('@SUM(A1)')).toBe(`'@SUM(A1)`)
    expect(csvCell('plain')).toBe('plain')
    expect(toCsv(['email', 'name'], [['a@b.com', 'Doe, Jane']])).toBe('email,name\na@b.com,"Doe, Jane"')
  })
})
