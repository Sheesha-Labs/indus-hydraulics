import type { PageGeometry } from '../../server/intake/span-view'

/**
 * One PDF page drawn from its text layer (S08-T04, board 15, Why?): every text run at its position in PDF units, so
 * a span's box needs no scaling of its own — the SVG viewBox is the page, and fit-width or 100 % is the same
 * drawing at a different size. Boxes are tinted by the line's confidence and numbered. A scanned page has no text
 * to draw: the frame says so and the boxes are not drawn (there are no coordinates).
 */
export type BoxTone = 'ok' | 'warn' | 'bad' | 'info' | 'acc'

export interface PageBox {
  key: string
  ord: number | null
  box: { x: number; y: number; w: number; h: number }
  tone: BoxTone
  active?: boolean
  pin?: boolean
}

const FILL: Record<BoxTone, string> = {
  ok: 'fill-io-ok-tint stroke-io-ok',
  warn: 'fill-io-warn-tint stroke-io-warn',
  bad: 'fill-io-bad-tint stroke-io-bad',
  info: 'fill-io-info-tint stroke-io-info',
  acc: 'fill-io-accent-tint stroke-io-accent',
}
const PIN: Record<BoxTone, string> = {
  ok: 'fill-io-ok-solid',
  warn: 'fill-io-warn-solid',
  bad: 'fill-io-bad-solid',
  info: 'fill-io-info',
  acc: 'fill-io-accent',
}

export default function PageSvg({
  page,
  boxes = [],
  label,
  onBox,
  onHover,
}: {
  page: PageGeometry
  boxes?: readonly PageBox[]
  label: string
  onBox?: (ord: number) => void
  onHover?: (ord: number | null) => void
}) {
  const pad = 4
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`${-pad} ${-pad} ${page.width + pad * 2 + 24} ${page.height + pad * 2}`}
      className="rounded-io-paper block h-auto w-full"
    >
      <rect
        x={0}
        y={0}
        width={page.width}
        height={page.height}
        className="fill-io-card stroke-io-line"
        strokeWidth={0.5}
      />
      {page.scanned ? (
        <text
          x={page.width / 2}
          y={page.height / 2}
          textAnchor="middle"
          fontSize={11}
          className="fill-io-ink-3"
        >
          Scanned page: no text layer to mark
        </text>
      ) : null}
      {page.scanned
        ? null
        : boxes.map((b) => (
            <g
              key={b.key}
              data-ord={b.ord ?? undefined}
              data-active={b.active ? 'true' : undefined}
              onMouseEnter={onHover && b.ord !== null ? () => onHover(b.ord) : undefined}
              onMouseLeave={onHover ? () => onHover(null) : undefined}
              onClick={onBox && b.ord !== null ? () => onBox(b.ord!) : undefined}
              className={onBox ? 'cursor-pointer' : undefined}
            >
              <rect
                x={b.box.x - 3}
                y={b.box.y - 2}
                width={b.box.w + 6}
                height={b.box.h + 4}
                rx={1.5}
                strokeWidth={b.active ? 1.6 : 0.8}
                className={`${FILL[b.tone]}`}
              />
              {b.pin && b.ord !== null ? (
                <>
                  <circle
                    cx={Math.min(page.width + 12, b.box.x + b.box.w + 14)}
                    cy={b.box.y + b.box.h / 2}
                    r={7}
                    className={PIN[b.tone]}
                  />
                  <text
                    x={Math.min(page.width + 12, b.box.x + b.box.w + 14)}
                    y={b.box.y + b.box.h / 2 + 3}
                    textAnchor="middle"
                    fontSize={8}
                    className="fill-io-card"
                  >
                    {b.ord}
                  </text>
                </>
              ) : null}
            </g>
          ))}
      {page.items.map((t, i) =>
        t.str.trim() ? (
          <text
            key={i}
            x={t.x}
            y={t.y + t.h * 0.82}
            fontSize={Math.max(3, t.h * 0.92)}
            className="fill-io-ink pointer-events-none"
          >
            {t.str}
          </text>
        ) : null
      )}
    </svg>
  )
}
