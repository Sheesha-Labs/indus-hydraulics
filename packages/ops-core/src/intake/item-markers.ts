/**
 * Numbered-item detection for procurement enquiry bodies.
 *
 * Line-splitting does not work on this corpus: numbered item lists frequently
 * run together on a single line, e.g.
 *
 *     1. GASKET SET - 4 Nos.2. SHAFT SEAL - 2 Nos.
 *
 * so the "2." that begins item two sits mid-line. The technique that does work
 * is to scan the WHOLE string unanchored for candidate markers and keep only
 * those whose captured integer equals the next expected index (1, 2, 3, ...).
 *
 * That monotonic constraint is what makes the approach safe. It is the reason
 * `1/2 INCH` and `R52.100` are not mistaken for item markers: `1/2` never
 * matches (a slash is not a marker punctuation), and `52.` is rejected because
 * 52 is not the next expected index.
 */

const MARKER = /(\d{1,3})\s*[.)]\s*/g

export type ItemMarker = {
  /** The 1-based item number as written in the body. */
  index: number
  /** Offset of the first character of the marker itself. */
  markerStart: number
  /** Offset of the first character after the marker — where content begins. */
  contentStart: number
}

/**
 * Find the numbered item markers in `text`, in order.
 *
 * Known limitation, accepted deliberately: a stray "1." earlier in the body
 * (in a header or a sentence) can be locked onto as item one. The monotonic
 * constraint bounds the damage — a false start only survives if a matching
 * "2." follows it — but it cannot eliminate it. Callers should treat a single
 * lone marker as weak evidence; see `splitNumberedItems`.
 */
export function walkItemMarkers(text: string): ItemMarker[] {
  const markers: ItemMarker[] = []
  let expected = 1

  // A fresh RegExp per call: MARKER is /g and therefore stateful via lastIndex.
  const re = new RegExp(MARKER.source, 'g')
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (Number(m[1]) !== expected) continue
    markers.push({
      index: expected,
      markerStart: m.index,
      contentStart: m.index + m[0].length,
    })
    expected += 1
  }

  return markers
}

export type NumberedItem = {
  index: number
  /** Verbatim text between this marker and the next. Never trimmed of meaning. */
  text: string
}

/**
 * Split a body into its numbered items.
 *
 * Returns an empty array when fewer than `minItems` markers are found, so a
 * single stray "1." in prose does not manufacture a one-line enquiry. Pass
 * `minItems: 1` when the caller already knows the body is an item list.
 */
export function splitNumberedItems(text: string, opts: { minItems?: number } = {}): NumberedItem[] {
  const minItems = opts.minItems ?? 2
  const markers = walkItemMarkers(text)
  if (markers.length < minItems) return []

  return markers.map((marker, i) => {
    const end = i + 1 < markers.length ? markers[i + 1]!.markerStart : text.length
    return { index: marker.index, text: text.slice(marker.contentStart, end).trim() }
  })
}
