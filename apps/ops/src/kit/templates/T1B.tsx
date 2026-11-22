import { Card } from '@indus/ops-ui/card'
import { ButtonLink, Choices, SearchInput } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { T1Index } from '@indus/ops-ui/templates'
import { ActivityFeed } from '@indus/ops-ui/timeline'
import { ACTIVITY, REFS, SAMPLE_SUPPLIERS } from '../fixtures'
import { SupplierIndex } from './islands'
import { specimenHref } from './shared'

/** The kit's activity sample, each line short enough to set on one line in the 360 preview. */
const PREVIEW_ACTIVITY = ACTIVITY.map((a) =>
  a.key === 'a1' ? { ...a, text: 'Assistant captured an offer (4 of 5 lines)' } : a
)

const SLUG = 't1b'
const href = (q: string) => specimenHref(SLUG, q)

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'principal', label: 'Principal', count: 6 },
  { value: 'approved', label: 'Approved', count: 41 },
  { value: 'trial', label: 'Trial', count: 9 },
  { value: 'contact', label: 'Contact only', count: 152 },
  { value: 'blocked', label: 'Blocked', count: 6 },
]

const OPEN = SAMPLE_SUPPLIERS[0]!

/** T1b · Index list with preview: Suppliers, the first row open in the 360 preview. */
export default function T1BSpecimen() {
  return (
    <T1Index
      header={
        <PageHeader
          crumb="Directory"
          title="Suppliers · 214"
          actions={
            <>
              <ButtonLink href={href('import=1')}>Import</ButtonLink>
              <ButtonLink variant="primary" href={href('new=supplier')}>
                Add supplier
              </ButtonLink>
            </>
          }
          search={
            <SearchInput
              size="lg"
              aria-label="Search suppliers"
              placeholder="Search suppliers, brands, countries"
            />
          }
          filters={
            <Choices
              aria-label="Supplier filter"
              options={FILTERS}
              value="all"
              hrefFor={(v) => href(`filter=${v}`)}
            />
          }
        />
      }
      previewLabel={`Preview: ${OPEN.name}`}
      preview={
        <>
          <Card
            eyebrow={OPEN.name}
            link={{ label: 'Open ↗', href: `/suppliers/${OPEN.key}` }}
            pairs={[
              { label: 'Type', value: OPEN.type },
              { label: 'Tier', value: OPEN.tier },
              { label: 'Reply time', value: '1.4 days' },
              { label: 'Win rate', value: OPEN.win },
              {
                label: 'Open RFQs',
                value: `2 · ${REFS.enquiry}`,
                emphasis: 'link',
                href: `/enquiries/${REFS.enquiry}`,
              },
              { label: 'Last PO', value: REFS.po, emphasis: 'link', href: '/orders' },
            ]}
          />
          <ActivityFeed aria-label={`Activity with ${OPEN.name}`} items={PREVIEW_ACTIVITY} />
        </>
      }
    >
      <SupplierIndex />
    </T1Index>
  )
}
