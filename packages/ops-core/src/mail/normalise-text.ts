/**
 * The exact text Ops extracts from (S04-T05, 08-map-integrations §2.8): Why? offsets point into it, so it is
 * normalised once, stored, and hashed. Pure; the hasher is passed in (ops-core does no I/O and imports nothing
 * from node).
 *
 *   NFKC · smart quotes and dashes → ASCII · CRLF/CR → LF · tabs and runs of spaces → one space (line breaks
 *   kept) · trailing spaces trimmed · more than two blank lines → two · trimmed.
 */
const REPLACEMENTS: Array<[RegExp, string]> = [
  [/[‘’‚‛′]/g, "'"],
  [/[“”„‟″]/g, '"'],
  [/[‐-―−]/g, '-'],
  [/…/g, '...'],
  [/[   ​﻿]/g, ' '],
]

export function normaliseText(input: string): string {
  let text = input.normalize('NFKC')
  for (const [re, to] of REPLACEMENTS) text = text.replace(re, to)
  text = text.replace(/\r\n?/g, '\n')
  text = text.replace(/[ \t\f\v]+/g, ' ')
  text = text
    .split('\n')
    .map((line) => line.replace(/ +$/g, ''))
    .join('\n')
  text = text.replace(/\n{4,}/g, '\n\n\n')
  return text.trim()
}

export function normaliseForExtraction(
  input: string,
  hash: (text: string) => string
): { text: string; sha256Hex: string } {
  const text = normaliseText(input)
  return { text, sha256Hex: hash(text) }
}
