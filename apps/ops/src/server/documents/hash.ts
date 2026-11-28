import { createHash } from 'node:crypto'

export const sha256OfBytes = (b: Uint8Array): string => createHash('sha256').update(b).digest('hex')

/** Count the pages of a PDF from its page objects (our own renderer's output; not a general parser). */
export function pdfPageCount(b: Uint8Array): number {
  const text = Buffer.from(b).toString('latin1')
  return (text.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length
}
