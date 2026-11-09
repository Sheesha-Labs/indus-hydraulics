/**
 * Newsletter lists: turning an uploaded sheet into contacts, and contacts
 * back into a CSV.
 *
 * Ported from Bazar (lib/newsletter/lists.ts, origin/main #718) without its
 * language column, and with what Bazar lacks: the column choice is a value
 * the caller can override (`ColumnMapping`), so a sheet whose headers we do
 * not recognise can still be imported by picking the columns by hand.
 *
 * Pure — no I/O. The import screen runs it in the browser for the preview;
 * the import action runs it again on the server over the values it was sent,
 * and that run is the one that counts.
 */

export const LIST_IMPORT_MAX = 20_000

export type ContactInput = { email: string; name: string }

/** Which column holds what. Indexes into a row; null = not in the file. */
export type ColumnMapping = {
  email: number
  name: number | null
  first: number | null
  last: number | null
  /** The first row is a header, not a contact. */
  header: boolean
}

export type ParsedContacts = {
  contacts: ContactInput[]
  invalid: { line: number; value: string; reason: string }[]
  /** Rows whose address was already earlier in the file. */
  duplicates: number
  /** Rows past LIST_IMPORT_MAX, not read. */
  truncated: number
}

const EMAIL = /^[^@\s"'<>,;()[\]\\]+@[^@\s"'<>,;()[\]\\]+\.[a-z]{2,}$/i

/** Trim, drop a `mailto:` or angle brackets, lower-case. */
export function normaliseListEmail(raw: string): string {
  return raw
    .trim()
    .replace(/^mailto:/i, '')
    .replace(/^<|>$/g, '')
    .trim()
    .toLowerCase()
}

export function isValidListEmail(email: string): boolean {
  return email.length <= 254 && EMAIL.test(email)
}

function detectDelimiter(firstLine: string): string {
  const counts = [',', ';', '\t'].map((d) => [d, firstLine.split(d).length] as const)
  return [...counts].sort((a, b) => b[1] - a[1])[0]![0]
}

/** RFC 4180-ish rows: quoted fields may hold the delimiter, doubled quotes and line breaks. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '')
  const firstLine = src.split(/\r?\n/, 1)[0] ?? ''
  const delim = detectDelimiter(firstLine)
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
      continue
    }
    if (ch === '"' && field === '') quoted = true
    else if (ch === delim) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

const HEADERS = {
  email: /^(e-?mail|e-?mail address|email_address|email id|address|mail)$/,
  name: /^(name|full ?name|full_name|contact|contact name|contact person)$/,
  first: /^(first ?name|first_name|given name|firstname|forename)$/,
  last: /^(last ?name|last_name|surname|family name|lastname)$/,
}

/** The width of the widest of the first rows — how many columns to offer. */
export function columnCount(rows: string[][]): number {
  return Math.max(0, ...rows.slice(0, 50).map((r) => r.length))
}

/**
 * Best guess at the columns. A header row is recognised by a column named
 * like an email address; without one, the address column is whichever holds
 * an `@` in most of the first rows, and the name the first other column.
 */
export function detectColumns(rows: string[][]): ColumnMapping {
  const head = (rows[0] ?? []).map((c) => c.trim().toLowerCase())
  const find = (re: RegExp) => {
    const i = head.findIndex((h) => re.test(h))
    return i === -1 ? null : i
  }
  const headerEmail = find(HEADERS.email)
  if (headerEmail !== null) {
    return {
      email: headerEmail,
      name: find(HEADERS.name),
      first: find(HEADERS.first),
      last: find(HEADERS.last),
      header: true,
    }
  }
  const sample = rows.slice(0, 20)
  const width = columnCount(sample)
  let email = 0
  for (let c = 0; c < width; c++) {
    if (sample.filter((r) => (r[c] ?? '').includes('@')).length > sample.length / 2) {
      email = c
      break
    }
  }
  const other = Array.from({ length: width }, (_, c) => c).find((c) => c !== email)
  return { email, name: other ?? null, first: null, last: null, header: false }
}

/** The name a row gives under a mapping: the name column, else first + last. */
export function nameOf(row: string[], mapping: ColumnMapping): string {
  const raw =
    mapping.name !== null
      ? (row[mapping.name] ?? '')
      : [mapping.first !== null ? row[mapping.first] : '', mapping.last !== null ? row[mapping.last] : '']
          .filter(Boolean)
          .join(' ')
  return raw.replace(/\s+/g, ' ').trim().slice(0, 120)
}

/** Rows → contacts under a mapping, with every unusable row and why. */
export function contactsFromRows(rows: string[][], mapping: ColumnMapping): ParsedContacts {
  const body = mapping.header ? rows.slice(1) : rows
  const offset = mapping.header ? 2 : 1
  const seen = new Set<string>()
  const out: ParsedContacts = { contacts: [], invalid: [], duplicates: 0, truncated: 0 }
  body.forEach((r, i) => {
    const line = i + offset
    const raw = r[mapping.email] ?? ''
    const email = normaliseListEmail(raw)
    if (!email) {
      out.invalid.push({ line, value: r.join(', ').slice(0, 80), reason: 'No email address' })
      return
    }
    if (!isValidListEmail(email)) {
      out.invalid.push({ line, value: raw.trim().slice(0, 80), reason: 'Not an email address' })
      return
    }
    if (seen.has(email)) {
      out.duplicates += 1
      return
    }
    if (out.contacts.length >= LIST_IMPORT_MAX) {
      out.truncated += 1
      return
    }
    seen.add(email)
    out.contacts.push({ email, name: nameOf(r, mapping) })
  })
  return out
}

/**
 * What the import screen sends the server: each data row cut down to its raw
 * address and its name, nothing else from the file. The server parses these
 * pairs again with PAIR_MAPPING.
 */
export function toImportPairs(rows: string[][], mapping: ColumnMapping): [string, string][] {
  const body = mapping.header ? rows.slice(1) : rows
  return body.map((r) => [String(r[mapping.email] ?? ''), nameOf(r, mapping)])
}

export const PAIR_MAPPING: ColumnMapping = { email: 0, name: 1, first: null, last: null, header: false }

/** One cell, safe for a spreadsheet: formula-leading text is defused, then CSV-quoted if needed. */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\n\r;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** Rows of cells → CSV text with a header line. */
export function toCsv(header: string[], rows: string[][]): string {
  return [header.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n')
}
