import type { DocCell, DocTableRow } from '@indus/ops-core'
import { Image, Text, View } from '@react-pdf/renderer'
import { SANS } from './fonts'
import { IO_PDF_COLORS } from './tokens.pdf'

/**
 * Shared parts of the two PDF layouts (S11-T02). Sizes are written in the HTML kit's CSS pixels and converted
 * here (A4 is 794 × 1123 px on screen and 595 × 842 pt on paper, so 1 px = 0.75 pt): the page and the PDF are
 * drawn from the same numbers. Colours come only from tokens.pdf.ts (generated; a guard test scans for others).
 */
export const px = (n: number) => n * 0.75
export const C = IO_PDF_COLORS

/**
 * Font size and line height together, as CSS means them. @react-pdf resolves a unitless lineHeight against the
 * fontSize declared in the same style (18 pt when none is) and hands children the absolute result, so a
 * lineHeight set on a View, or without a fontSize beside it, spaces lines far apart. Every Text here gets both.
 * `lh` is the HTML kit's computed leading (Tailwind's base is 1.5).
 */
export const f = (size: number, lh = 1.5) => ({ fontSize: px(size), lineHeight: lh })

export interface PdfImage {
  data: Uint8Array
  format: 'png' | 'jpg'
}

export interface PdfAssets {
  logo?: PdfImage
  signature?: PdfImage
  stamp?: PdfImage
}

export function Img({ image, height, width }: { image: PdfImage; height: number; width?: number }) {
  return (
    <Image
      src={{ data: Buffer.from(image.data), format: image.format }}
      style={{ height: px(height), ...(width ? { width: px(width) } : {}), objectFit: 'contain' }}
    />
  )
}

/** One table cell: optional bold first line, the value, an optional small line under it. */
export function Cell({
  cell,
  width,
  align,
  color,
  size,
  subColor,
  pad,
  lh,
  subSize,
  subGap = 0,
}: {
  cell: DocCell
  width: number
  align: 'left' | 'right'
  color: string
  size: number
  subColor: string
  pad: [number, number]
  /** The cell's leading (CSS computed). */
  lh: number
  subSize: number
  subGap?: number
}) {
  return (
    <View
      style={{ width: `${width}%`, paddingVertical: px(pad[0]), paddingHorizontal: px(pad[1]) }}
    >
      {cell.bold ? (
        <Text style={{ ...f(size, lh), fontWeight: 600, color, textAlign: align }}>
          {cell.bold}
        </Text>
      ) : null}
      <Text style={{ ...f(size, lh), color, textAlign: align }}>{cell.v}</Text>
      {cell.sub ? (
        <Text style={{ ...f(subSize), color: subColor, textAlign: align, marginTop: px(subGap) }}>
          {cell.sub}
        </Text>
      ) : null}
    </View>
  )
}

/**
 * Column widths in % of the table: the description takes what the others leave. Narrow numeric columns get
 * a share each; "#" is narrow.
 */
export function columnWidths(cols: readonly string[], desc: number): number[] {
  const fixed = cols.map((c, i): number => {
    if (i === desc) return 0
    if (i === 0) return 5
    if (/amount/i.test(c)) return 13
    if (/rate|price|basis/i.test(c)) return 12
    if (/lead|wks|package|tax|uom/i.test(c)) return 8
    return 9
  })
  const rest = 100 - fixed.reduce((a, b) => a + b, 0)
  return fixed.map((w, i) => (i === desc ? Math.max(rest, 20) : w))
}

/** Widths of a row's cells, folding spanned columns together. */
export function rowWidths(row: DocTableRow, widths: number[]): number[] {
  const out: number[] = []
  let col = 0
  for (const cell of row.cells) {
    const span = Math.max(1, cell.span ?? 1)
    out.push(widths.slice(col, col + span).reduce((a, b) => a + b, 0))
    col += span
  }
  return out
}

/**
 * The running footer: a rule, Indus's name and the document number, the footer label, the page label
 * ("Page 1 of 3" on the Estimate, "01 / 03" on the house layout, as on screen). Page numbers come from the
 * shared pagination (paginate in ops-core), so the screen and the PDF number their pages identically.
 */
export function Footer({
  left,
  middle,
  label,
  size,
  bottom,
}: {
  left: string
  middle?: string
  label: string
  /** 10 on the Estimate, 9.5 on the house layout (as on screen). */
  size: number
  /** Distance of the footer text from the page edge, in px. */
  bottom: number
}) {
  const t = { ...f(size), color: C['io-ink-3'] }
  return (
    <View
      fixed
      style={{
        position: 'absolute',
        bottom: px(bottom),
        left: px(48),
        right: px(48),
        borderTopWidth: 0.75,
        borderTopColor: C['io-doc-rule'],
        paddingTop: px(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontFamily: SANS,
      }}
    >
      <Text style={t}>{left}</Text>
      {middle ? <Text style={t}>{middle}</Text> : null}
      <Text style={t}>{label}</Text>
    </View>
  )
}

/** On a continuation page: the document title and number, small, top right. */
export function RunningHeader({ text }: { text: string }) {
  return (
    <View style={{ marginBottom: px(20), alignItems: 'flex-end' }}>
      <Text style={{ ...f(9.5), fontFamily: SANS, color: C['io-ink-3'] }}>{text}</Text>
    </View>
  )
}

/** "DRAFT" across previews only; an issued document never carries it. */
export function Watermark() {
  return (
    <Text
      fixed
      style={{
        position: 'absolute',
        top: px(480),
        left: px(120),
        fontFamily: SANS,
        fontWeight: 600,
        ...f(150, 1),
        color: C['io-bad-tint'],
        transform: 'rotate(-30deg)',
      }}
    >
      DRAFT
    </Text>
  )
}
