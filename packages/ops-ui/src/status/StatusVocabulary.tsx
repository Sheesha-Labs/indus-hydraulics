import { cn } from '../lib/cn'
import {
  KIT_STATUS_FAMILIES,
  STATUS_FAMILY_META,
  STATUS_VOCABULARY,
  type StatusFamily,
  type StatusWord,
} from '../status'
import Chip from './Chip'

export interface StatusVocabularyProps {
  /** Families to show, in order. Default: the Status kit's 12. */
  families?: readonly StatusFamily[]
  className?: string
}

/**
 * Status kit `ks-voc` (specimen only, /_kit): one card per family with every word as a chip and the family's
 * note. Three 350px columns, 14px apart.
 */
export default function StatusVocabulary({
  families = KIT_STATUS_FAMILIES,
  className,
}: StatusVocabularyProps) {
  return (
    <div
      data-part="status-vocabulary"
      className={cn('grid grid-cols-[repeat(3,350px)] gap-3.5', className)}
    >
      {families.map((family) => (
        <section
          key={family}
          aria-labelledby={`voc-${family}`}
          className="bg-io-card border-io-line rounded-io-card flex flex-col gap-2.5 border px-4 py-3.5"
        >
          <h3 id={`voc-${family}`} className="io-eyebrow leading-[1.45]">
            {STATUS_FAMILY_META[family].title}
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {(Object.keys(STATUS_VOCABULARY[family]) as StatusWord<typeof family>[]).map((word) => (
              <li key={word} className="flex">
                <Chip family={family} status={word} />
              </li>
            ))}
          </ul>
          <p className="text-io-ink-3 text-[12px] leading-[1.45]">
            {STATUS_FAMILY_META[family].note}
          </p>
        </section>
      ))}
    </div>
  )
}
