import { z } from 'zod'

/**
 * Why? evidence ids (S06-T05, ADR-12): the path segment after `/why/`. One string names what the drawer
 * explains, so every Why? link in the console is a plain URL that survives a reload or a new tab.
 *
 *   A-26-11-24-0007          the whole action (Reasons tab)
 *   A-26-11-24-0007~r2       reason 2 of that action (Sources tab, at that reason's span)
 *   A-26-11-24-0007~fclass   a field the action set (History tab for that field)
 *   ae_<uuid>                one activity_event row (a history row: a person's or the Assistant's change)
 *   sp_<uuid>                one source_span (S08: an extracted line's value, its page box, cell or text)
 *   <uuid>                   the S04 shell fixture (never resolves in production)
 */
export type EvidenceRef =
  | { kind: 'action'; ref: string }
  | { kind: 'reason'; ref: string; index: number }
  | { kind: 'field'; ref: string; field: string }
  | { kind: 'event'; eventId: string }
  | { kind: 'span'; spanId: string }
  | { kind: 'fixture'; id: string }

const ACTION_REF = /^A-[A-Za-z0-9-]{1,60}$/
const FIELD = /^[A-Za-z][A-Za-z0-9_.]{0,63}$/
const UUID = z.uuid()

export function parseEvidenceId(raw: string): EvidenceRef | null {
  let s: string
  try {
    s = decodeURIComponent(raw)
  } catch {
    return null
  }
  if (s.length > 120) return null
  if (s.startsWith('ae_')) {
    const id = s.slice(3)
    return UUID.safeParse(id).success ? { kind: 'event', eventId: id } : null
  }
  if (s.startsWith('sp_')) {
    const id = s.slice(3)
    return UUID.safeParse(id).success ? { kind: 'span', spanId: id } : null
  }
  if (UUID.safeParse(s).success) return { kind: 'fixture', id: s }
  const [ref, part, ...rest] = s.split('~')
  if (!ref || !ACTION_REF.test(ref) || rest.length > 0) return null
  if (part === undefined) return { kind: 'action', ref }
  const reason = /^r(0|[1-9]\d?)$/.exec(part)
  if (reason) return { kind: 'reason', ref, index: Number(reason[1]) }
  if (part.startsWith('f') && FIELD.test(part.slice(1))) {
    return { kind: 'field', ref, field: part.slice(1) }
  }
  return null
}

export function encodeEvidenceId(e: EvidenceRef): string {
  switch (e.kind) {
    case 'action':
      return e.ref
    case 'reason':
      return `${e.ref}~r${e.index}`
    case 'field':
      return `${e.ref}~f${e.field}`
    case 'event':
      return `ae_${e.eventId}`
    case 'span':
      return `sp_${e.spanId}`
    case 'fixture':
      return e.id
  }
}

/** The route segment schema: a string that parses. */
export const evidenceIdSchema = z
  .string()
  .refine((s) => parseEvidenceId(s) !== null, 'Unknown evidence id')
