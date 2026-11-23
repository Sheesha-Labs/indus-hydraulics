/**
 * Threading for replies (S04-T06, §1.9): Gmail threads on threadId, In-Reply-To/References AND the subject, so a
 * reply keeps the subject with a single "Re: ". Pure.
 */
const PREFIX = /^\s*((re|aw|sv|fwd?|wg)\s*(\[\d+\])?\s*:\s*)+/i

export function replySubject(original: string | null | undefined): string {
  const base = (original ?? '').replace(PREFIX, '').trim()
  return base ? `Re: ${base}` : 'Re:'
}

/** The References header of a reply: the original's References plus its Message-ID, the last 20. */
export function replyReferences(
  originalReferences: readonly string[],
  originalMessageId: string | null
): string[] {
  const chain = [...originalReferences]
  if (originalMessageId && !chain.includes(originalMessageId)) chain.push(originalMessageId)
  return chain.slice(-20)
}

/** The Message-ID Ops proposes; the real one is read back from Gmail after the send. */
export function proposedMessageId(outboundId: string, domain = 'indushydraulics.me'): string {
  return `<ops.${outboundId}@${domain}>`
}
