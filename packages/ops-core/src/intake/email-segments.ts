/**
 * Email body segments for intake (S08-T01, board 36). Unlike Mail's splitQuoted (which hides everything quoted),
 * intake must keep a FORWARDED enquiry: when a colleague forwards a client's RFQ ("Please address"), the forwarded
 * block is the enquiry. Earlier replies ("On … wrote:", "> …", an Outlook reply header) are kept but ignored, and
 * a signature is split off the fresh text. Offsets are into the stored body text, so spans can point at them.
 */
export type SegmentKind = 'fresh' | 'forwarded' | 'quoted_reply' | 'signature'

export interface ForwardHeader {
  from: string | null
  date: string | null
  subject: string | null
  to: string | null
}

export interface EmailSegment {
  kind: SegmentKind
  start: number
  end: number
  /** For a forwarded block: the header fields read from it. */
  header?: ForwardHeader
}

const FORWARD_MARK =
  /^-{2,}\s*(Forwarded message|Weitergeleitete Nachricht|Message transféré|Mensaje reenviado|Messaggio inoltrato)\s*-{2,}\s*$|^Begin forwarded message:\s*$/i
const ORIGINAL_MARK =
  /^-{2,}\s*(Original Message|Ursprüngliche Nachricht|Message d'origine|Mensaje original|Messaggio originale)\s*-{2,}\s*$/i
const ON_WROTE = [
  /^On .{4,200} wrote:\s*$/i,
  /^(Le|El|Il|Am|Op) .{4,200} (a écrit|escribió|ha scritto|schrieb|schreef)\s?:\s*$/i,
  /^在.{2,200}写道[:：]\s*$/,
]
const HEADER_FIELD =
  /^\*?\s*(From|Sent|Date|Subject|To|Cc|De|Von|Envoyé|Gesendet|Objet|Betreff|Para|An|À)\s*\*?\s*:\s*(.*)$/i
const SIGN_OFF =
  /^(best\s+regards|kind\s+regards|warm\s+regards|regards|thanks\s*(&|and)\s*regards|thanks|thank\s+you|many\s+thanks|cheers|sincerely|yours\s+(sincerely|faithfully|truly)|br)[,.!]?\s*$/i

interface Line {
  text: string
  start: number
  end: number
}

function linesOf(body: string): Line[] {
  const out: Line[] = []
  let at = 0
  for (const raw of body.split('\n')) {
    out.push({ text: raw.replace(/\r$/, ''), start: at, end: at + raw.length })
    at += raw.length + 1
  }
  return out
}

/** "From:" followed within three lines by "Sent:"/"Date:" — an Outlook header block. */
function isHeaderBlock(lines: readonly Line[], i: number): boolean {
  const m = HEADER_FIELD.exec(lines[i]!.text.trim())
  if (!m || !/^(from|de|von)$/i.test(m[1]!)) return false
  return lines
    .slice(i + 1, i + 5)
    .some((l) => /^\*?\s*(sent|date|envoyé|gesendet)\s*\*?\s*:/i.test(l.text.trim()))
}

function readHeader(lines: readonly Line[], from: number): { header: ForwardHeader; next: number } {
  const header: ForwardHeader = { from: null, date: null, subject: null, to: null }
  let i = from
  for (; i < lines.length && i < from + 10; i++) {
    const t = lines[i]!.text.trim()
    if (!t) {
      if (header.from) break
      continue
    }
    const m = HEADER_FIELD.exec(t)
    if (!m) break
    const key = m[1]!.toLowerCase()
    const value = m[2]!.trim() || null
    if (['from', 'de', 'von'].includes(key)) header.from = value
    else if (['sent', 'date', 'envoyé', 'gesendet'].includes(key)) header.date = value
    else if (['subject', 'objet', 'betreff'].includes(key)) header.subject = value
    else if (['to', 'para', 'an', 'à'].includes(key)) header.to = value
  }
  return { header, next: i }
}

/**
 * Splits `body` into segments. `isForward` (the subject starts with Fw:/Fwd:) makes the FIRST Outlook header
 * block a forward rather than an earlier reply, because Outlook draws both the same way.
 */
export function segmentEmail(body: string, opts: { isForward?: boolean } = {}): EmailSegment[] {
  const lines = linesOf(body)
  const segs: EmailSegment[] = []
  let kind: SegmentKind = 'fresh'
  let segStart = 0
  let header: ForwardHeader | undefined
  let firstHeaderSeen = false
  const close = (endLine: number) => {
    const end = endLine > 0 ? lines[endLine - 1]!.end : 0
    if (end > segStart) segs.push({ kind, start: segStart, end, ...(header ? { header } : {}) })
  }
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i]!.text.trim()
    let startForward = false
    let startReply = false
    if (FORWARD_MARK.test(t)) startForward = true
    else if (ORIGINAL_MARK.test(t) || ON_WROTE.some((re) => re.test(t))) startReply = true
    else if (isHeaderBlock(lines, i)) {
      // A header block inside a forward or a reply belongs to that block.
      if (opts.isForward && !firstHeaderSeen) startForward = true
      else if (kind === 'fresh' || kind === 'signature') startReply = true
    }
    if (startForward) {
      close(i)
      firstHeaderSeen = true
      const at = FORWARD_MARK.test(t) ? i + 1 : i
      const h = readHeader(lines, at)
      kind = 'forwarded'
      header = h.header
      segStart = lines[i]!.start
      i = Math.max(i, h.next - 1)
      continue
    }
    if (startReply) {
      close(i)
      firstHeaderSeen = true
      kind = 'quoted_reply'
      header = undefined
      segStart = lines[i]!.start
      continue
    }
    if (kind === 'fresh' && t.startsWith('>')) {
      close(i)
      kind = 'quoted_reply'
      header = undefined
      segStart = lines[i]!.start
      continue
    }
    if (kind === 'fresh' && (t === '--' || SIGN_OFF.test(t))) {
      close(i)
      kind = 'signature'
      header = undefined
      segStart = lines[i]!.start
    }
  }
  close(lines.length)
  return segs
}

/** The text of the segments a reader may extract lines from: fresh and forwarded, never replies or signatures. */
export function extractableSegments(segs: readonly EmailSegment[]): EmailSegment[] {
  return segs.filter((s) => s.kind === 'fresh' || s.kind === 'forwarded')
}

/** Fw:/Fwd:/WG:/TR: at the start of a subject. */
export function isForwardSubject(subject: string | null | undefined): boolean {
  return !!subject && /^\s*(fwd?|wg|tr|rv|i)\s*:/i.test(subject)
}
