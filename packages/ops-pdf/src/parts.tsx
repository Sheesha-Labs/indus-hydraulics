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
}: {
  cell: DocCell
  width: number
  align: 'left' | 'right'
  color: string
  size: number
  subColor: string
  pad: [number, number]
}) {
  return (
    <View
      style={{ width: `${width}%`, paddingVertical: px(pad[0]), paddingHorizontal: px(pad[1]) }}
    >
      {cell.bold ? (
        <Text style={{ fontWeight: 600, fontSize: px(size), color, textAlign: align }}>
          {cell.bold}
        </Text>
      ) : null}
      <Text style={{ fontSize: px(size), color, textAlign: align }}>{cell.v}</Text>
      {cell.sub ? (
        <Text
          style={{ fontSize: px(size - 1.5), color: subColor, textAlign: align, marginTop: px(1) }}
        >
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
 * The running footer, fixed on every page: a rule, Indus's name and the document number, the footer label,
 * and "Page n of N". Each part is its own fixed, absolutely placed element. @react-pdf 4.5 does not draw a
 * `render` Text that has a lineHeight, set or inherited: never give the Page a lineHeight (layouts set it on
 * their content views), and never set one here.
 */
export function Footer({ left, middle }: { left: string; middle?: string }) {
  const base = {
    position: 'absolute' as const,
    bottom: px(18),
    fontFamily: SANS,
    fontSize: px(9.5),
    color: C['io-ink-3'],
  }
  return (
    <>
      <View
        fixed
        style={{
          position: 'absolute',
          bottom: px(36),
          left: px(48),
          right: px(48),
          borderTopWidth: 0.75,
          borderTopColor: C['io-doc-rule'],
        }}
      />
      <Text fixed style={{ ...base, left: px(48) }}>
        {left}
      </Text>
      {middle ? (
        <Text fixed style={{ ...base, left: 0, right: 0, textAlign: 'center' }}>
          {middle}
        </Text>
      ) : null}
      <Text
        fixed
        style={{ ...base, left: px(48), right: px(48), textAlign: 'right' }}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </>
  )
}

/** On pages after the first: the document number (with its revision) in small type, top right. */
export function RunningHeader({ text }: { text: string }) {
  return (
    <Text
      fixed
      style={{
        position: 'absolute',
        top: px(20),
        left: px(48),
        right: px(48),
        textAlign: 'right',
        fontFamily: SANS,
        fontSize: px(9.5),
        color: C['io-ink-3'],
      }}
      render={({ pageNumber }) => (pageNumber > 1 ? text : '')}
    />
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
        fontSize: px(150),
        color: C['io-bad-tint'],
        transform: 'rotate(-30deg)',
      }}
    >
      DRAFT
    </Text>
  )
}
