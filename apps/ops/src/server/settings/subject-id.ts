import { createHash } from 'node:crypto'

/**
 * `activity_event.subjectId` is a uuid and a setting's key is text, so every key maps to a fixed
 * UUID (RFC 9562 version 8, from SHA-256 of the key): the history of one setting is
 * `subjectType = 'settings' AND subjectId = settingSubjectId(key)`, and `field` holds the key.
 */
export function settingSubjectId(key: string): string {
  const b = createHash('sha256').update(`ops.settings_entry:${key}`).digest().subarray(0, 16)
  b[6] = (b[6]! & 0x0f) | 0x80
  b[8] = (b[8]! & 0x3f) | 0x80
  const h = b.toString('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
