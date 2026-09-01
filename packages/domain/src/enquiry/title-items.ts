/**
 * Item lists crammed into the Bid Title field.
 *
 * Some portals put no item list in the body at all and instead pack it into the
 * title, delimited by repeated quantity markers:
 *
 *     PUMP SPARES PUMP SPARES GASKET SET QTY = 4 PC SHAFT SEAL QTY = 2 PC
 *
 * Parsing these raised item coverage on the measured corpus from 1,098 to 1,439
 * items across 660 bids. Descriptions recovered this way are messier than
 * body-sourced ones, so every row is tagged `sourceKind: 'title'` and should be
 * shown to a human before it reaches a supplier RFQ.
 */

const QTY_MARKER = /QTY\s*[:=]\s*(\d+(?:\.\d+)?)\s*(PCS?|NOS?|SETS?|EA|UNITS?|MTRS?|M|KG|L)\b/gi

export type TitleItem = {
  index: number
  description: string
  qty: number
  unit: string
  sourceKind: 'title'
}

/**
 * Collapse an exact word-level self-repeat: "PUMP SPARES PUMP SPARES" → "PUMP SPARES".
 *
 * The bid name is repeated before item one in this format. Compares on
 * case-folded words so spacing and case differences do not defeat it.
 */
export function dropSelfRepeat(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length % 2 !== 0) return text.trim()

  const half = words.length / 2
  const a = words.slice(0, half).map(w => w.toLowerCase()).join(' ')
  const b = words.slice(half).map(w => w.toLowerCase()).join(' ')
  return a === b ? words.slice(half).join(' ') : text.trim()
}

/**
 * Extract items from a title that carries its own quantity markers.
 *
 * Returns `[]` when no marker is present, which is the signal that this title
 * is an ordinary title and not a packed list.
 *
 * `titlePrefix` — when the bid name is known separately, pass it and it is
 * stripped from the front of the first description. Self-repeat collapsing runs
 * regardless.
 */
export function splitTitleItems(title: string, opts: { titlePrefix?: string } = {}): TitleItem[] {
  const re = new RegExp(QTY_MARKER.source, 'gi')
  const marks: Array<{ start: number; end: number; qty: number; unit: string }> = []
  let m: RegExpExecArray | null

  while ((m = re.exec(title)) !== null) {
    marks.push({
      start: m.index,
      end: m.index + m[0].length,
      qty: Number(m[1]),
      unit: m[2]!.toUpperCase(),
    })
  }
  if (marks.length === 0) return []

  const items: TitleItem[] = []

  marks.forEach((mark, i) => {
    const from = i === 0 ? 0 : marks[i - 1]!.end
    let description = title.slice(from, mark.start).trim()

    if (i === 0) {
      if (opts.titlePrefix) {
        const prefix = opts.titlePrefix.trim()
        if (prefix && description.toLowerCase().startsWith(prefix.toLowerCase())) {
          description = description.slice(prefix.length).trim()
        }
      }
      description = dropSelfRepeat(description)
    }

    description = description.replace(/^[\s\-–—:;,./|]+/, '').trim()
    if (!description) return

    items.push({
      index: items.length + 1,
      description,
      qty: mark.qty,
      unit: mark.unit,
      sourceKind: 'title',
    })
  })

  return items
}
