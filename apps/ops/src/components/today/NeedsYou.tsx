import { ButtonLink } from '@indus/ops-ui/controls'
import { Card, NeedsRow } from '@indus/ops-ui/card'
import type { TodayModel } from '../../data/today'
import NeedsCardRow from './NeedsCardRow'

/**
 * Today's "Needs you" (S07-T06, board 178): up to three rows (tag, headline, context, verbs): a plain card
 * approves inline with the server's undo countdown, anything locked or with a choice opens in Review;
 * "See all n" opens Review. Above ten it reads "Needs you · n. Top 3 first" with the rest grouped by
 * record (board 182 "On fire"). The Helper's mail Unsure items are rows that open Mail.
 */
export default function NeedsYou({ needs }: { needs: TodayModel['needs'] }) {
  const onFire = needs.total > 10
  const shown = needs.cards.length + needs.items.length
  return (
    <Card
      eyebrow={onFire ? `Needs you · ${needs.total}. Top 3 first` : `Needs you · ${needs.total}`}
      link={{ label: `See all ${needs.total}`, href: '/review' }}
    >
      <div data-part="needs-you" className="flex flex-col gap-2.5">
        {needs.cards.map((c) => (
          <NeedsCardRow key={c.id} card={c} />
        ))}
        {needs.items.map((i) => (
          <NeedsRow
            key={i.id}
            action={i.tag}
            title={i.title}
            sub={i.sub}
            href={i.href}
            actions={
              <ButtonLink size="sm" href={i.href}>
                Open
              </ButtonLink>
            }
          />
        ))}
        {onFire ? (
          <p className="text-io-ink-3 m-0 text-[12.5px]">
            Then {needs.total - shown} more, grouped by record.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
