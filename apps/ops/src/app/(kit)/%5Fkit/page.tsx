import type { Route } from 'next'
import Link from 'next/link'
import KitSection from '../../../kit/KitSection'
import { KITS } from '../../../kit/registry'
import Foundations from '../../../kit/sections/Foundations'

/** /_kit: the full specimen, Foundations then every kit with every variant and state. */
export default function KitIndex() {
  return (
    <main>
      <nav
        aria-label="Kit sections"
        className="text-io-meta flex flex-wrap gap-x-4 gap-y-1 px-16 pt-10"
      >
        <Link className="io-focus text-io-accent" href={'/_kit/l0' as Route}>
          L0 Foundations
        </Link>
        <Link className="io-focus text-io-accent" href={'/_kit/l1' as Route}>
          L1 Component Sheet
        </Link>
        {KITS.map((k) => (
          <Link key={k.slug} className="io-focus text-io-accent" href={`/_kit/${k.slug}` as Route}>
            {k.title}
            {k.status === 'pending' ? ' (pending)' : ''}
          </Link>
        ))}
      </nav>
      <Foundations />
      {KITS.map(({ Specimen, ...k }) => (
        <KitSection
          key={k.slug}
          id={k.slug}
          crumb={k.crumb}
          title={k.title}
          text={k.text}
          status={k.status}
        >
          <Specimen />
        </KitSection>
      ))}
    </main>
  )
}
