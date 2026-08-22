import Link from 'next/link'
import {
  ArrowRight,
  Boxes,
  FileText,
  Factory,
  Replace,
  Ship,
  Tags,
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
 */
const TILES: { label: string; sub: string; href: string; icon: LucideIcon }[] = [
  {
    label: 'Request a quote',
    sub: 'Add SKUs and quantities, priced within 4 hours',
    href: '/quote',
    icon: FileText,
  },
  {
    label: 'Find a replacement part',
    sub: 'Cross-reference a competitor part number',
    href: '/replacement',
    icon: Replace,
  },
  {
    label: 'Browse the catalogue',
    sub: 'Hoses, fittings, valves, pumps, seals and lubricants',
    href: '/c',
    icon: Boxes,
  },
  {
    label: 'Brands we stock',
    sub: 'Bosch Rexroth, Parker, Atos, Hydac, Molykote and more',
    href: '/brands',
    icon: Tags,
  },
  {
    label: 'Repairs and on-site service',
    sub: 'Cylinder, hose, pump and BOP jobs, written up as cases',
    href: '/services',
    icon: Wrench,
  },
  {
    label: 'Your industry',
    sub: 'Oil and gas, marine, mining, steel, construction',
    href: '/industries',
    icon: Factory,
  },
  {
    label: 'Shipping and lead times',
    sub: 'Incoterms, transit times and export documentation',
    href: '/shipping',
    icon: Ship,
  },
]

export default function HelpGrid() {
  return (
    <section className="border-t border-ih-border bg-ih-surface-2 py-14">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
        <span className="eyebrow">How can we help?</span>
        <h2 className="mt-2 max-w-[24ch] text-balance font-serif text-[clamp(26px,3vw,36px)] font-normal leading-[1.1] tracking-[-0.01em]">
          Some answers don&apos;t need <em className="italic">to wait for us.</em>
        </h2>
        <p className="mt-3 max-w-[58ch] text-[15px] leading-[1.6] text-ih-muted">
          Pick the route that matches your enquiry — or send the message anyway and we&apos;ll point you
          at the right engineer.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group flex items-center gap-4 rounded-lg border border-ih-border bg-ih-surface p-5 transition-colors hover:border-ih-accent"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ih-accent-soft text-ih-accent">
                <tile.icon size={19} strokeWidth={1.6} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">{tile.label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-[1.45] text-ih-muted">{tile.sub}</span>
              </span>
              <ArrowRight
                size={16}
                strokeWidth={1.7}
                aria-hidden
                className="shrink-0 text-ih-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
