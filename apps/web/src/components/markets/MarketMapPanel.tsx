import type { MarketMapModel } from '../../lib/market-geometry'

/**
 * The hero map panel — the page's signature, and the only thing on it that
 * cannot be lifted from another page.
 *
 * A pure renderer. Every coordinate, every tick, every suppressed label and
 * the corridor distance are decided in `lib/market-geometry.ts` and arrive
 * here as numbers; nothing below computes anything. That separation is what
 * makes the map testable and what keeps the drawing and its annotations from
 * ever disagreeing.
 *
 * No client JavaScript. The SVG is generated on the server at build time, so
 * the browser receives markup and the ~700 KB of Natural Earth topology never
 * leaves the build.
 *
 * ON THE TRIPLE OUTLINE: the target country is drawn four times — a hatch
 * fill, then three offset strokes at falling weight and opacity. That is the
 * entire "technical sketch" look. It used to be an SVG turbulence filter,
 * which was removed for performance; the offsets alone carry it. Do not
 * reintroduce the filter.
 */
export default function MarketMapPanel({
  model,
  countryName,
  lane,
}: {
  model: MarketMapModel | null
  countryName: string
  lane: string
}) {
  return (
    <figure className="m-0 overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
      <div className="flex items-center justify-between gap-4 border-b border-ih-border bg-ih-surface-2 px-4 py-[11px]">
        <span className="mono text-[10px] uppercase tracking-[0.12em] text-ih-ink-2">
          Fig. 01 · Export lane {lane}
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">
          Mercator · WGS 84
        </span>
      </div>

      {model ? (
        <>
          <div className="px-0 pb-0.5 pt-1.5">
            <MapSvg model={model} />
          </div>
          <figcaption className="flex flex-wrap gap-x-[18px] gap-y-2 border-t border-ih-border px-4 py-3">
            {model.origin && (
              <LegendItem>
                <span aria-hidden="true" className="block h-2 w-2 bg-ih-navy" />
                Origin · {model.originLabel}
              </LegendItem>
            )}
            <LegendItem>
              <span aria-hidden="true" className="block h-2 w-2 rotate-45 border-[1.4px] border-ih-ink" />
              {model.crossingLegend}
            </LegendItem>
            <LegendItem>
              <span aria-hidden="true" className="block h-[7px] w-[7px] rounded-full bg-ih-accent" />
              Delivery city
            </LegendItem>
            <LegendItem>
              <span aria-hidden="true" className="block h-0 w-4 border-t-[1.8px] border-dashed border-ih-accent" />
              {/* When the origin marker is off-frame the legend has to say
                  where the corridor comes from — otherwise the dashed line
                  enters from the edge of the frame unexplained. */}
              {model.primaryMode.toLowerCase()} corridor
              {model.origin ? '' : ` from ${model.originLabel}`}
            </LegendItem>
          </figcaption>
        </>
      ) : (
        /*
          Natural Earth's `properties.name` is not always the trade name, so a
          market can fail to match. A labelled panel is the right failure: the
          reader sees a deliberate gap, not an empty frame, and every fact the
          map would have carried is already in the manifest strip above.
        */
        <div className="grid aspect-[664/524] place-items-center bg-ih-surface-2">
          <span className="mono px-6 text-center text-[10.5px] uppercase tracking-[0.1em] text-ih-muted-2">
            {countryName} — lane map unavailable
          </span>
        </div>
      )}
    </figure>
  )
}

function LegendItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono flex items-center gap-[7px] text-[9.5px] uppercase tracking-[0.08em] text-ih-muted">
      {children}
    </span>
  )
}

function MapSvg({ model }: { model: MarketMapModel }) {
  const { width: w, height: h, pad, uid } = model
  const hatchId = `mk-hatch-${uid}`
  const clipId = `mk-clip-${uid}`
  const arrowId = `mk-arrow-${uid}`

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      className="block h-auto w-full"
      role="img"
      aria-label={model.ariaLabel}
    >
      <defs>
        <pattern
          id={hatchId}
          width="7"
          height="7"
          patternTransform="rotate(38)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-ih-steel)" strokeWidth="1" opacity="0.4" />
        </pattern>
        <clipPath id={clipId}>
          <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} />
        </clipPath>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0.5 L9 5 L0 9.5 Z" fill="var(--color-ih-accent)" />
        </marker>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {model.graticule && (
          <path
            d={model.graticule}
            fill="none"
            stroke="var(--color-ih-border)"
            strokeWidth="1"
            strokeDasharray="1 4"
          />
        )}

        {model.neighbours.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="var(--color-ih-surface-2)"
            stroke="var(--color-ih-border-strong)"
            strokeWidth="0.9"
            strokeOpacity="0.8"
          />
        ))}

        {model.neighbourLabels.map((label) => (
          <text
            key={label.text}
            className="mono"
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            fontSize="8.5"
            letterSpacing="0.14em"
            fill="var(--color-ih-muted-2)"
          >
            {label.text}
          </text>
        ))}

        {/* Hatch fill, then three offset outlines. See the docblock. */}
        <path d={model.target} fill={`url(#${hatchId})`} stroke="none" />
        <g fill="none" stroke="var(--color-ih-ink)">
          <path d={model.target} strokeWidth="2.6" strokeOpacity="0.9" />
          <path d={model.target} strokeWidth="1.1" strokeOpacity="0.5" transform="translate(2.5,3)" />
          <path d={model.target} strokeWidth="0.8" strokeOpacity="0.28" transform="translate(-2,-2.5)" />
        </g>

        {/* Each route twice: a white casing so the line reads over land, then
            the line. The casing is why the corridor stays legible where it
            crosses a neighbour's fill. */}
        {model.routes.map((route, i) => (
          <g key={i}>
            <path d={route.d} fill="none" stroke="#fff" strokeWidth={route.primary ? 6 : 4.5} strokeOpacity="0.85" />
            <path
              d={route.d}
              fill="none"
              stroke={route.primary ? 'var(--color-ih-accent)' : 'var(--color-ih-muted-2)'}
              strokeWidth={route.primary ? 1.9 : 1.2}
              strokeDasharray={route.primary ? '7 5' : '2 4'}
              markerEnd={route.primary ? `url(#${arrowId})` : undefined}
            />
          </g>
        ))}

        <g>
          <rect
            x={model.crossing.x - 4.5}
            y={model.crossing.y - 4.5}
            width="9"
            height="9"
            transform={`rotate(45 ${model.crossing.x} ${model.crossing.y})`}
            fill="#fff"
            stroke="var(--color-ih-ink)"
            strokeWidth="1.4"
          />
          <HaloText label={model.crossing.label} fontSize={8.5} tracking="0.1em" fill="var(--color-ih-ink-2)" />
        </g>

        {model.cities.map((city) => (
          <g key={city.label.text}>
            <circle cx={city.x} cy={city.y} r="7.5" fill="var(--color-ih-accent)" opacity="0.12" />
            <circle cx={city.x} cy={city.y} r="2.8" fill="var(--color-ih-accent)" stroke="#fff" strokeWidth="1.1" />
            <HaloText label={city.label} fontSize={9.5} tracking="0.05em" fill="var(--color-ih-ink)" halo={3.2} />
          </g>
        ))}

        {model.origin && (
          <g>
            <rect x={model.origin.x - 5} y={model.origin.y - 5} width="10" height="10" fill="var(--color-ih-navy)" />
            <rect
              x={model.origin.x - 8.5}
              y={model.origin.y - 8.5}
              width="17"
              height="17"
              fill="none"
              stroke="var(--color-ih-navy)"
              strokeWidth="1"
              strokeOpacity="0.45"
            />
            <HaloText label={model.origin.label} fontSize={9} tracking="0.09em" fill="var(--color-ih-navy)" halo={3.2} />
          </g>
        )}
      </g>

      {/* ── Frame furniture ── */}
      <rect
        x={pad}
        y={pad}
        width={w - pad * 2}
        height={h - pad * 2}
        fill="none"
        stroke="var(--color-ih-border-strong)"
        strokeWidth="1"
      />
      {(
        [
          [pad, pad],
          [w - pad, pad],
          [pad, h - pad],
          [w - pad, h - pad],
        ] as const
      ).map(([x, y]) => (
        <g key={`${x}-${y}`} stroke="var(--color-ih-ink)" strokeWidth="1.2">
          <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
          <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
        </g>
      ))}

      {model.lonTicks.map((tick) => (
        <g key={`lon-${tick.text}-${Math.round(tick.x)}`}>
          <line x1={tick.x} y1={h - pad} x2={tick.x} y2={h - pad + 5} stroke="var(--color-ih-border-strong)" strokeWidth="1" />
          <text className="mono" x={tick.x} y={h - pad + 17} textAnchor="middle" fontSize="8" fill="var(--color-ih-muted-2)">
            {tick.text}
          </text>
        </g>
      ))}
      {model.latTicks.map((tick) => (
        <g key={`lat-${tick.text}-${Math.round(tick.y)}`}>
          <line x1={pad - 5} y1={tick.y} x2={pad} y2={tick.y} stroke="var(--color-ih-border-strong)" strokeWidth="1" />
          <text className="mono" x={pad - 9} y={tick.y + 3} textAnchor="end" fontSize="8" fill="var(--color-ih-muted-2)">
            {tick.text}
          </text>
        </g>
      ))}

      <g transform={`translate(${w - pad - 20},${pad + 16})`}>
        <path d="M0 14 L0 -6 M-4 -1 L0 -7 L4 -1" fill="none" stroke="var(--color-ih-ink-2)" strokeWidth="1.2" />
        <text className="mono" x="0" y="26" textAnchor="middle" fontSize="8.5" letterSpacing="0.1em" fill="var(--color-ih-ink-2)">
          N
        </text>
      </g>

      <g transform={`translate(${pad + 12},${h - pad - 16})`}>
        <line x1="0" y1="0" x2={model.scaleBar.px} y2="0" stroke="var(--color-ih-ink-2)" strokeWidth="1.4" />
        <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="var(--color-ih-ink-2)" strokeWidth="1.4" />
        <line x1={model.scaleBar.px} y1="-3.5" x2={model.scaleBar.px} y2="3.5" stroke="var(--color-ih-ink-2)" strokeWidth="1.4" />
        <text
          className="mono"
          x={model.scaleBar.px / 2}
          y="-7"
          textAnchor="middle"
          fontSize="8.5"
          letterSpacing="0.08em"
          fill="var(--color-ih-ink-2)"
        >
          {model.scaleBar.km} KM
        </text>
      </g>

      <text
        className="mono"
        x={pad + 12}
        y={pad + 20}
        fontSize="9.5"
        letterSpacing="0.09em"
        fill="var(--color-ih-accent)"
        stroke="#fff"
        strokeWidth="3.4"
        paintOrder="stroke"
      >
        {model.corridor}
      </text>
    </svg>
  )
}

/**
 * A label with a painted halo — `paint-order: stroke` draws a white outline
 * behind the glyphs so a place name stays readable over a coastline, a
 * graticule or a route. Without it every label over land is illegible.
 */
function HaloText({
  label,
  fontSize,
  tracking,
  fill,
  halo = 3,
}: {
  label: { x: number; y: number; text: string; anchor: 'start' | 'middle' | 'end' }
  fontSize: number
  tracking: string
  fill: string
  halo?: number
}) {
  return (
    <text
      className="mono"
      x={label.x}
      y={label.y}
      textAnchor={label.anchor}
      fontSize={fontSize}
      letterSpacing={tracking}
      fill={fill}
      stroke="#fff"
      strokeWidth={halo}
      paintOrder="stroke"
    >
      {label.text}
    </text>
  )
}
