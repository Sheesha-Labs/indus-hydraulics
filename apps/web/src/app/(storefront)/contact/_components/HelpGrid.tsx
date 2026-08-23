import Link from 'next/link'
import {
  ArrowRight,
  Boxes,
  FileText,
  Factory,
  Replace,
  Ship,
  Tags,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * "How can we help?" — the tile grid that ends the page.
 *
 * A contact page is where visitors land when they can't find something, so the
 * worst outcome is that it dead-ends in a form. Each tile routes an enquiry to
 * the page that answers it without a human, which also gives the contact page
 * the internal links it previously had almost none of.
 *
 * The tiles are editable under Pages & Blocks · Contact. The ICONS are not
 * free text: an editor picks from a fixed list whose values this map resolves,
 * because a typo'd icon name would otherwise render a blank square with no
 * error anywhere. An unrecognised value falls back to the arrow.
 */
const ICONS: Record<string, LucideIcon> = {
  quote: FileText,
  replacement: Replace,
  catalogue: Boxes,
  brands: Tags,
  service: Wrench,
  industry: Factory,
  shipping: Ship,
  documents: Truck,
}

export type HelpTile = {
  label: string
  sub: string | null
  href: string
  icon: string | null
}

export default function HelpGrid({
  eyebrow,
  heading,
  headingEmphasis,
  body,
  tiles,
}: {
  eyebrow: string | null
  heading: string | null
  headingEmphasis: string | null
  body: string | null
  tiles: HelpTile[]
}) {
  if (tiles.length === 0) return null

  return (
    <section className="border-t border-ih-border bg-ih-surface-2 py-14">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-2 max-w-[24ch] text-balance font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.1] tracking-[-0.01em]">
          {heading} {headingEmphasis ? <em className="italic">{headingEmphasis}</em> : null}
        </h2>
        <p className="mt-3 max-w-[58ch] text-[15px] leading-[1.6] text-ih-muted">{body}</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => {
            const Icon = (tile.icon ? ICONS[tile.icon] : undefined) ?? ArrowRight
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className="group flex items-center gap-4 rounded-lg border border-ih-border bg-ih-surface p-5 transition-colors hover:border-ih-accent"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ih-accent-soft text-ih-accent">
                  <Icon size={19} strokeWidth={1.6} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{tile.label}</span>
                  {tile.sub ? (
                    <span className="mt-0.5 block text-[12.5px] leading-[1.45] text-ih-muted">
                      {tile.sub}
                    </span>
                  ) : null}
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={1.7}
                  aria-hidden
                  className="shrink-0 text-ih-muted transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
