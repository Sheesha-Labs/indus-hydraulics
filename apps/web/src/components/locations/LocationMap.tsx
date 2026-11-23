import Link from 'next/link'
import type { LocationMapModel } from '../../lib/location-geometry'

/**
 * The UAE service-area map. A pure renderer: every coordinate arrives from
 * `lib/location-geometry.ts`, so nothing here computes anything.
 *
 * Markers are links. On the hub they are the quickest way into an area; on an
 * area page they are the "other areas" navigation drawn where the areas are.
 * The figure is server-rendered markup with no client JavaScript.
 */
export default function LocationMap({
  model,
  caption,
}: {
  model: LocationMapModel
  caption?: string
}) {
  const { width: w, height: h } = model
  const anyActive = model.markers.some((m) => m.active)

  return (
    <figure className="border-ih-border bg-ih-surface m-0 overflow-hidden rounded-[10px] border">
      <div className="border-ih-border bg-ih-surface-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b px-4 py-[11px]">
        <span className="text-ih-ink-2 text-[10px] font-medium tracking-[0.12em] uppercase">
          United Arab Emirates · on-site service
        </span>
        {model.km != null && model.link && (
          <span className="text-ih-muted text-[10px] tracking-[0.12em] uppercase tabular-nums">
            {model.km} km from the hose bay · straight line
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={model.ariaLabel}
        className="block h-auto w-full"
      >
        <rect width={w} height={h} className="fill-[var(--color-ih-surface-2)]" />
        {model.neighbours.map((d, i) => (
          <path
            key={i}
            d={d}
            className="fill-[var(--color-ih-surface)] stroke-[var(--color-ih-border-strong)]"
            strokeWidth={0.8}
          />
        ))}
        {model.neighbourLabels.map((label) => (
          <text
            key={label.text}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            className="fill-[var(--color-ih-muted)] text-[9px] tracking-[0.16em]"
          >
            {label.text}
          </text>
        ))}

        {/* The UAE: a hatch fill under a doubled outline — the market maps' grammar. */}
        <defs>
          <pattern
            id="uae-hatch"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              className="stroke-[var(--color-ih-accent-soft)]"
              strokeWidth={2.4}
            />
          </pattern>
        </defs>
        <path d={model.uae} fill="url(#uae-hatch)" />
        <path
          d={model.uae}
          fill="none"
          className="stroke-[var(--color-ih-ink-2)]"
          strokeWidth={1.1}
        />
        <path
          d={model.uae}
          fill="none"
          className="stroke-[var(--color-ih-ink-2)]"
          strokeWidth={0.6}
          opacity={0.35}
          transform="translate(1.4 1.1)"
        />

        {model.link && (
          <line
            x1={model.link.x1}
            y1={model.link.y1}
            x2={model.link.x2}
            y2={model.link.y2}
            className="stroke-[var(--color-ih-accent)]"
            strokeWidth={1.6}
            strokeDasharray="5 4"
          />
        )}

        {model.markers.map((m) => (
          <Link key={m.slug} href={`/locations/${m.slug}`} aria-label={`${m.name} service area`}>
            <g className="group">
              {m.leader && (
                <line
                  x1={m.x}
                  y1={m.y}
                  x2={m.labelX + (m.anchor === 'end' ? 3 : -3)}
                  y2={m.labelY - 3}
                  className="stroke-[var(--color-ih-border-strong)]"
                  strokeWidth={0.8}
                />
              )}
              <circle
                cx={m.x}
                cy={m.y}
                r={m.active ? 6 : 4}
                className={
                  m.active
                    ? 'fill-[var(--color-ih-accent)] stroke-white'
                    : anyActive
                      ? 'fill-[var(--color-ih-ink-2)] stroke-white group-hover:fill-[var(--color-ih-accent)]'
                      : 'fill-[var(--color-ih-accent)] stroke-white group-hover:fill-[var(--color-ih-navy)]'
                }
                strokeWidth={1.5}
              />
              <text
                x={m.labelX}
                y={m.labelY}
                textAnchor={m.anchor}
                className={
                  m.active
                    ? 'fill-[var(--color-ih-ink)] text-[12px] font-semibold'
                    : 'fill-[var(--color-ih-ink-2)] text-[11px] font-medium group-hover:fill-[var(--color-ih-accent)]'
                }
              >
                {m.name}
              </text>
            </g>
          </Link>
        ))}

        {/* The one premises. A square, so it never reads as another area. */}
        <rect
          x={model.bay.x - 4.5}
          y={model.bay.y - 4.5}
          width={9}
          height={9}
          className="fill-[var(--color-ih-navy)] stroke-white"
          strokeWidth={1.5}
        />
      </svg>

      <figcaption className="border-ih-border text-ih-muted flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-3 text-[11.5px]">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="bg-ih-navy block h-2 w-2" />
          Dubai hose bay, Al Qusais — our one premises
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="bg-ih-accent block h-2 w-2 rounded-full" />
          Area we service on site
        </span>
        {caption && <span className="text-ih-muted-2">{caption}</span>}
      </figcaption>
    </figure>
  )
}
