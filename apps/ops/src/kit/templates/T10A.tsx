import { ButtonLink, Choices } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { Banner, BannerAction } from '@indus/ops-ui/status'
import { T10Gantt } from '@indus/ops-ui/templates'
import { Gantt } from '@indus/ops-ui/timeline'
import { GANTT, TEMPLATES } from '../fixtures'
import { specimenHref } from './shared'

const SLUG = 't10a'
const href = (q: string) => specimenHref(SLUG, q)

/** T10a · Gantt: the supplier plan across orders, label column 250, a slip banner under it. */
export default function T10ASpecimen() {
  return (
    <T10Gantt
      header={
        <PageHeader
          crumb="Fulfilment"
          title="Supplier plan"
          actions={<ButtonLink href={href('export=1')}>Export</ButtonLink>}
          filters={
            <Choices
              aria-label="Plan filter"
              options={[
                { value: 'all', label: 'All orders' },
                { value: 'risk', label: 'At risk', count: 2 },
                { value: 'month', label: 'This month' },
              ]}
              value="all"
              hrefFor={(v) => href(`filter=${v}`)}
            />
          }
        />
      }
    >
      <Gantt
        caption="Supplier plan"
        axis={GANTT.axis}
        today={GANTT.today}
        labelHeader="Supplier · PO"
        labelWidth={250}
        rows={GANTT.rows}
      />
      <Banner
        tone="warn"
        title={TEMPLATES.slip.title}
        actions={<BannerAction href={href('options=1')}>See options</BannerAction>}
      >
        {TEMPLATES.slip.text}
      </Banner>
    </T10Gantt>
  )
}
