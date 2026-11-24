/**
 * Password-protected attachments (S05-T03): the extractor cannot read them, so they are marked at fetch and the
 * Assistant asks for an open copy (ask_open_copy) instead of failing quietly. Reads only the first 64 KB.
 *
 *   PDF   an /Encrypt entry (in the trailer, which for a small file is inside the first 64 KB, or in the
 *         first object stream's dictionary)
 *   OOXML (.docx .xlsx .pptx) saved encrypted is an OLE compound file (D0 CF 11 E0 …) holding an
 *         "EncryptionInfo" stream instead of a ZIP
 *   ZIP   a local file header whose general-purpose flag has bit 0 (encrypted) set
 */
export type AttachmentKind = 'pdf' | 'ooxml' | 'ole' | 'zip' | 'other'

export interface AttachmentHeaderResult {
  passwordProtected: boolean
  kind: AttachmentKind
}

const OOXML = /\.(docx|docm|xlsx|xlsm|pptx|pptm)$/i

function startsWith(bytes: Uint8Array, sig: readonly number[]): boolean {
  return sig.every((b, i) => bytes[i] === b)
}

function ascii(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return s
}

/** UTF-16LE "EncryptionInfo", as OLE directory entries store stream names. */
const ENCRYPTION_INFO_UTF16 = 'EncryptionInfo'
  .split('')
  .map((c) => `${c}\u0000`)
  .join('')

export function inspectAttachmentHeader(
  bytes: Uint8Array,
  filename: string,
  mime: string
): AttachmentHeaderResult {
  const head = bytes.subarray(0, 64 * 1024)
  if (startsWith(head, [0x25, 0x50, 0x44, 0x46])) {
    return { kind: 'pdf', passwordProtected: /\/Encrypt\s*(\d+\s+\d+\s+R|<<)/.test(ascii(head)) }
  }
  if (startsWith(head, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    const isOoxml = OOXML.test(filename) || /openxmlformats/i.test(mime)
    return {
      kind: isOoxml ? 'ooxml' : 'ole',
      passwordProtected: isOoxml || ascii(head).includes(ENCRYPTION_INFO_UTF16),
    }
  }
  if (startsWith(head, [0x50, 0x4b, 0x03, 0x04])) {
    const flags = (head[6] ?? 0) | ((head[7] ?? 0) << 8)
    return { kind: OOXML.test(filename) ? 'ooxml' : 'zip', passwordProtected: (flags & 0x1) === 1 }
  }
  return { kind: 'other', passwordProtected: false }
}
