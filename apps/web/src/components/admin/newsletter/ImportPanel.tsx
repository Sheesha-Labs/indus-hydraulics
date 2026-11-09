'use client'

import { Button, Callout, Checkbox, Field, Select } from '@indus/ui'
import { useMemo, useState, useTransition } from 'react'

import {
  LIST_IMPORT_MAX,
  columnCount,
  contactsFromRows,
  detectColumns,
  toImportPairs,
  type ColumnMapping,
} from '../../../lib/newsletter/lists'
import { LIST_FILE_MAX_BYTES, rowsFromBytes } from '../../../lib/newsletter/spreadsheet'
import type { Result } from '../../../lib/result'

type ImportAction = (input: {
  listId: string
  pairs: [string, string][]
  fileName: string
  consent: boolean
}) => Promise<Result<{ message: string }>>

type Props = {
  listId: string
  action: ImportAction
  /** The statement the uploader ticks, stored verbatim with the import. */
  consentText: string
}

const NONE = ''

function columnLabel(rows: string[][], mapping: ColumnMapping, c: number): string {
  const head = mapping.header ? (rows[0]?.[c] ?? '').trim() : ''
  const sample = (rows[mapping.header ? 1 : 0]?.[c] ?? '').trim()
  const letter = String.fromCharCode(65 + (c % 26))
  return [`Column ${letter}`, head ? `“${head.slice(0, 30)}”` : '', sample ? `e.g. ${sample.slice(0, 30)}` : '']
    .filter(Boolean)
    .join(' · ')
}

/**
 * Upload a CSV or Excel file to a list: read in the browser, columns guessed
 * and adjustable, a preview of what will happen, the consent statement, then
 * only the address and name of each row go to the server, which checks them
 * all again and reports what it actually did.
 */
export default function ImportPanel({ listId, action, consentText }: Props) {
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<string[][] | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [consent, setConsent] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()

  const preview = useMemo(() => (rows && mapping ? contactsFromRows(rows, mapping) : null), [rows, mapping])
  const width = rows ? columnCount(rows) : 0

  async function onFile(file: File | undefined) {
    setRows(null)
    setMapping(null)
    setResult(null)
    setReadError(null)
    setConsent(false)
    if (!file) return
    if (file.size > LIST_FILE_MAX_BYTES) {
      setReadError('That file is over 10 MB. Split it, or save only the name and email columns.')
      return
    }
    try {
      const parsed = await rowsFromBytes(await file.arrayBuffer(), file.name)
      if (parsed.length === 0) {
        setReadError('That file has no rows.')
        return
      }
      setFileName(file.name)
      setRows(parsed)
      setMapping(detectColumns(parsed))
    } catch {
      setReadError('That file could not be read. Save it as CSV (UTF-8) or .xlsx and try again.')
    }
  }

  function set<K extends keyof ColumnMapping>(key: K, value: ColumnMapping[K]) {
    setMapping((m) => (m ? { ...m, [key]: value } : m))
  }

  function columnSelect(key: 'email' | 'name' | 'first' | 'last', label: string, optional: boolean) {
    if (!rows || !mapping) return null
    const value = mapping[key]
    return (
      <Field label={label} className="min-w-[220px]">
        <Select
          value={value === null ? NONE : String(value)}
          onChange={(e) => set(key, e.target.value === NONE ? null : Number(e.target.value))}
        >
          {optional ? <option value={NONE}>— Not in the file —</option> : null}
          {Array.from({ length: width }, (_, c) => (
            <option key={c} value={c}>
              {columnLabel(rows, mapping, c)}
            </option>
          ))}
        </Select>
      </Field>
    )
  }

  function submit() {
    if (!rows || !mapping || !preview) return
    setResult(null)
    start(async () => {
      const r = await action({ listId, pairs: toImportPairs(rows, mapping), fileName, consent })
      setResult(r.success ? { ok: true, text: r.data.message } : { ok: false, text: r.message })
      if (r.success) {
        setRows(null)
        setMapping(null)
        setConsent(false)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Field
        label="CSV or Excel file"
        hint={`One address per row, up to ${LIST_IMPORT_MAX.toLocaleString('en-US')}. A header row is optional — you pick the columns next.`}
      >
        <input
          type="file"
          accept=".csv,.txt,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={(e) => void onFile(e.target.files?.[0])}
          className="block text-[13.5px] text-ih-ink file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border file:border-ih-border-strong file:bg-ih-surface file:px-2.5 file:text-[13.5px] file:font-medium file:text-ih-ink hover:file:border-ih-accent"
        />
      </Field>

      {readError ? <Callout tone="danger">{readError}</Callout> : null}

      {rows && mapping && preview ? (
        <>
          <div className="flex flex-wrap items-end gap-3">
            {columnSelect('email', 'Email column', false)}
            {columnSelect('name', 'Name column', true)}
            {mapping.name === null ? (
              <>
                {columnSelect('first', 'First name', true)}
                {columnSelect('last', 'Last name', true)}
              </>
            ) : null}
            <Checkbox
              label="First row is a header"
              checked={mapping.header}
              onChange={(e) => set('header', e.target.checked)}
            />
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13.5px] sm:grid-cols-4">
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">Addresses</dt>
              <dd className="font-mono text-ih-ink">{preview.contacts.length.toLocaleString('en-US')}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">Not addresses</dt>
              <dd className="font-mono text-ih-ink">{preview.invalid.length.toLocaleString('en-US')}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">Duplicates</dt>
              <dd className="font-mono text-ih-ink">{preview.duplicates.toLocaleString('en-US')}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">Over the limit</dt>
              <dd className="font-mono text-ih-ink">{preview.truncated.toLocaleString('en-US')}</dd>
            </div>
          </dl>
          <p className="text-[13px] text-ih-muted">
            Addresses already on this list, and any that unsubscribed or bounced before, are left out when you import — the
            server checks and reports them.
          </p>

          {preview.contacts.length > 0 ? (
            <div className="overflow-x-auto rounded-[10px] border border-ih-border">
              <table className="w-full text-[13px]">
                <caption className="sr-only">First rows as they will be imported</caption>
                <thead>
                  <tr className="border-b border-ih-border bg-ih-surface-2 text-left font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.contacts.slice(0, 5).map((c) => (
                    <tr key={c.email} className="border-b border-ih-border last:border-0">
                      <td className="px-3 py-1.5 font-mono text-ih-ink">{c.email}</td>
                      <td className="px-3 py-1.5 text-ih-ink-2">{c.name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Callout tone="warning">No addresses in that column. Pick the column that holds the email addresses.</Callout>
          )}

          {preview.invalid.length > 0 ? (
            <details className="text-[13px] text-ih-ink-2">
              <summary className="cursor-pointer">Rows that will be skipped ({preview.invalid.length})</summary>
              <ul className="mt-2 max-h-48 overflow-y-auto font-mono text-[12px]">
                {preview.invalid.slice(0, 200).map((i) => (
                  <li key={i.line}>
                    Row {i.line}: {i.reason}
                    {i.value ? ` — ${i.value}` : ''}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <Checkbox label={consentText} checked={consent} onChange={(e) => setConsent(e.target.checked)} />

          <div>
            <Button
              type="button"
              kind="primary"
              size="dense"
              onClick={submit}
              disabled={pending || !consent || preview.contacts.length === 0}
            >
              {pending ? 'Importing…' : `Import ${preview.contacts.length.toLocaleString('en-US')} addresses`}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <Callout tone={result.ok ? 'success' : 'danger'} role={result.ok ? 'status' : 'alert'}>
          {result.text}
        </Callout>
      ) : null}
    </div>
  )
}
