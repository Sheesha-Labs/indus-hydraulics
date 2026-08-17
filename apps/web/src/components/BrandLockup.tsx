import Image from 'next/image'
import LogoMark from './LogoMark'
import type { LogoStyle } from '../lib/brand-identity'

/**
 * Where the lockup is being drawn. Not a free `size` number, because §2.1 bans
 * inline `style` in apps/web — the geometry has to resolve to real utility
 * classes, so the two surfaces that draw a lockup name themselves and the
 * table below holds their measurements.
 */
type Surface = 'header' | 'footer'

const GEOMETRY: Record<
  Surface,
  { markPx: number; mark: string; lockup: string; name: string }
> = {
  // 34px mark inside the 72px top bar, per 01-design-language.md §5. The
  // standalone lockup gets 44px: it carries the name as artwork, so it is
  // doing the job of the mark *and* the type and deserves the type's height.
  header: {
    markPx: 34,
    mark: 'h-[34px] w-[34px]',
    lockup: 'h-11 min-w-[34px] max-w-[200px]',
    name: 'text-[21px]',
  },
  // The footer's existing mark is 34px next to a 19px serif name; a standalone
  // lockup there is drawn at 40px.
  footer: {
    markPx: 34,
    mark: 'h-[34px] w-[34px]',
    lockup: 'h-10 min-w-[34px] max-w-[240px]',
    name: 'text-[19px] text-white',
  },
}

/**
 * The brand lockup drawn in the top bar and the footer: the CMS-uploaded logo
 * when an operator has set one (/admin/settings?tab=brand), and the built-in
 * `LogoMark` when they have not.
 *
 * One component rather than the branch inlined at both call sites, because the
 * `logo_only` case has to suppress the typeset name *and* its sublabel — and a
 * copy of that rule that drifts shows the brand name twice, which is the exact
 * failure the placement setting exists to prevent.
 */
export default function BrandLockup({
  logoUrl,
  logoStyle,
  name,
  sublabel,
  surface,
}: {
  logoUrl: string | null
  logoStyle: LogoStyle
  /** Store name — the typeset wordmark, and the logo's alt text when alone. */
  name: string
  /** Small caps line under the wordmark. Suppressed with the wordmark. */
  sublabel?: string | null
  surface: Surface
}) {
  const g = GEOMETRY[surface]
  const logoOnly = logoUrl !== null && logoStyle === 'logo_only'

  return (
    <span className="flex shrink-0 items-center gap-[11px]">
      {logoOnly ? (
        /*
         * A lockup's width is whatever its art says, so the height is pinned
         * and the width follows. Explicit width/height are the intrinsic hint
         * next/image needs when the rendered box is not fixed — the classes
         * override both. `max-w` stops an unexpectedly wide export from
         * crowding the nav; `min-w` reserves enough that the row does not jump
         * when the image decodes.
         */
        <Image
          src={logoUrl}
          alt={name}
          width={480}
          height={120}
          sizes="240px"
          className={`w-auto shrink-0 object-contain object-left ${g.lockup}`}
          priority
        />
      ) : logoUrl ? (
        /*
         * Decorative: the name is spelled out beside it, and announcing
         * "Indus Hydraulics" twice is noise for a screen reader.
         */
        <span className={`relative block shrink-0 ${g.mark}`}>
          <Image
            src={logoUrl}
            alt=""
            aria-hidden
            fill
            sizes="88px"
            className="object-contain object-center"
            priority
          />
        </span>
      ) : (
        <LogoMark size={g.markPx} onNavy={surface === 'footer'} />
      )}

      {logoOnly ? null : (
        <span className={`font-serif leading-none tracking-[-0.01em] ${g.name}`}>
          {name}
          {sublabel ? (
            <small className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-ih-muted">
              {sublabel}
            </small>
          ) : null}
        </span>
      )}
    </span>
  )
}
