import 'server-only'
import { fileTypeFromBuffer } from 'file-type'
import { isOpsBucket } from '../../storage/buckets'
import { getStorage } from '../../storage/storage'
import { parseCsv } from './csv'
import { parseDocx } from './docx'
import { parseImage } from './image'
import { parsePdf } from './pdf'
import type { ParsedDocument } from './types'
import { parseXls } from './xls'
import { parseXlsx } from './xlsx'
import { parseZip } from './zip'

export type { ParsedDocument } from './types'

/**
 * One entry point for every intake file (S08-T01, 08 §3). The type is decided by the file's magic bytes; the
 * name and the browser's MIME header are hints only (text formats such as CSV have no magic bytes, so the
 * extension decides there). No database access: the caller passes the stored file's location.
 */
export type SniffedKind =
  'pdf' | 'xlsx' | 'xls' | 'csv' | 'docx' | 'doc' | 'image' | 'heic' | 'zip' | 'text' | 'other'

const OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]

export async function sniff(
  bytes: Uint8Array,
  filename: string
): Promise<{ kind: SniffedKind; mime: string }> {
  const ext = filename.toLowerCase().split('.').pop() ?? ''
  const ft = await fileTypeFromBuffer(bytes)
  if (ft) {
    if (ft.mime === 'application/pdf') return { kind: 'pdf', mime: ft.mime }
    if (
      ft.ext === 'xlsx' ||
      ft.mime.includes('spreadsheetml') ||
      ft.mime.includes('ms-excel.sheet.macro')
    )
      return { kind: 'xlsx', mime: ft.mime }
    if (ft.ext === 'docx' || ft.mime.includes('wordprocessingml'))
      return { kind: 'docx', mime: ft.mime }
    if (ft.mime === 'image/heic' || ft.mime === 'image/heif') return { kind: 'heic', mime: ft.mime }
    if (['image/png', 'image/jpeg', 'image/webp', 'image/tiff'].includes(ft.mime))
      return { kind: 'image', mime: ft.mime }
    if (ft.mime === 'application/zip') {
      // An OOXML file file-type could not pin down still opens as a zip: trust the extension only here.
      if (ext === 'xlsx' || ext === 'xlsm') return { kind: 'xlsx', mime: ft.mime }
      if (ext === 'docx') return { kind: 'docx', mime: ft.mime }
      return { kind: 'zip', mime: ft.mime }
    }
    if (ft.mime === 'application/x-cfb')
      return ext === 'doc' ? { kind: 'doc', mime: ft.mime } : { kind: 'xls', mime: ft.mime }
    return { kind: 'other', mime: ft.mime }
  }
  if (OLE_MAGIC.every((b, i) => bytes[i] === b))
    return ext === 'doc'
      ? { kind: 'doc', mime: 'application/msword' }
      : { kind: 'xls', mime: 'application/vnd.ms-excel' }
  // No magic bytes: a text format, decided by the extension, and only if it decodes as text.
  const head = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, 4096))
  const printable = head.length > 0 && !/[\u0000-\u0008\u000E-\u001F]/.test(head)
  if (!printable) return { kind: 'other', mime: 'application/octet-stream' }
  if (ext === 'csv' || ext === 'tsv') return { kind: 'csv', mime: 'text/csv' }
  return { kind: 'text', mime: 'text/plain' }
}

/** Parses bytes whose type was sniffed. Plain text (a pasted email) is returned as a one-segment email. */
export async function parseBytes(bytes: Uint8Array, filename: string): Promise<ParsedDocument> {
  const { kind, mime } = await sniff(bytes, filename)
  switch (kind) {
    case 'pdf':
      return parsePdf(bytes)
    case 'xlsx':
      return parseXlsx(bytes)
    case 'xls':
      return parseXls(bytes)
    case 'csv':
      return parseCsv(bytes)
    case 'docx':
      return parseDocx(bytes)
    case 'doc':
      return {
        kind: 'unsupported',
        ask: 'pdf_or_docx',
        detail: 'Old Word (.doc) files are not read: send PDF or DOCX',
      }
    case 'image':
    case 'heic':
      return parseImage(bytes, mime)
    case 'zip':
      return parseZip(bytes)
    case 'text': {
      const text = new TextDecoder('utf-8').decode(bytes)
      return {
        kind: 'email',
        text,
        textHash: null,
        segments: [{ kind: 'fresh', start: 0, end: text.length }],
        forwards: [],
      }
    }
    default:
      return { kind: 'unsupported', ask: 'other', detail: `This file type (${mime}) is not read` }
  }
}

/** Reads a stored file's bytes from Storage. Null when the object is missing. */
export async function readStoredBytes(file: {
  bucket: string
  path: string
}): Promise<Uint8Array | null> {
  if (!isOpsBucket(file.bucket)) throw new Error(`not an Ops bucket: ${file.bucket}`)
  const stream = await getStorage().openRead(file.bucket, file.path)
  if (!stream) return null
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** Loads and parses a stored file. The caller has the `stored_file` row; this function reads no table. */
export async function parseStoredFile(file: {
  bucket: string
  path: string
  filename: string
}): Promise<ParsedDocument> {
  const bytes = await readStoredBytes(file)
  if (!bytes) return { kind: 'unreadable', detail: 'The file is missing from storage' }
  return parseBytes(bytes, file.filename)
}
