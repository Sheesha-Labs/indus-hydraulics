import { OptionGroup } from '@indus/ops-ui/assistant'
import { Stat } from '@indus/ops-ui/card'
import { FxTag } from '@indus/ops-ui/chart'
import { Segmented } from '@indus/ops-ui/controls'
import { formatMoney } from '@indus/ops-ui/format'
import { Chip } from '@indus/ops-ui/status'
import { DataTable, type Column } from '@indus/ops-ui/table'
import { T2Record, T6Compare } from '@indus/ops-ui/templates'
import { COMPARE_SUPPLIERS, FX, KIT_NOW, SAMPLE_COMPARE, type SampleCompare } from '../fixtures'
import { ENQ, specimenHref, specimenRecord } from './shared'

const SLUG = 't6a'

const price = (v: string) => (/^\d/.test(v) ? formatMoney('AED', v).amount : v || '—')
const COLUMNS: Column<SampleCompare>[] = [
  { key: 'line', label: 'Line', type: 'text', value: (r) => r.line, sub: (r) => r.qty },
  ...COMPARE_SUPPLIERS.map((name, i): Column<SampleCompare> => ({
    key: `s${i}`,
    label: name,
    type: 'money',
    value: (r) => price(r.prices[i] ?? ''),
  })),
  {
    key: 'pick',
    label: 'Pick',
    type: 'text',
    value: (r) => (r.pick ? <Chip tone="n" label={r.pick} className="h-io-tag px-[7px]" /> : null),
  },
]

const aed = (v: string) => formatMoney('AED', v).text

/** T6a · Compare grid: landed cost per unit across three suppliers, scenarios in the aside. */
export default function T6ASpecimen() {
  const { header, strip } = specimenRecord({
    slug: SLUG,
    kind: 'enquiry',
    tab: 'compare',
    cta: 'Price the quotation',
    ctaSegment: 'pricing',
    did: 'compared 3 suppliers on landed cost at the locked EUR rate',
    needs: 2,
  })
  return (
    <T2Record header={header} strip={strip}>
      <T6Compare
        toolbar={
          <Segmented
            aria-label="Compare on"
            options={[
              { value: 'landed', label: 'Landed cost' },
              { value: 'price', label: 'Supplier price' },
              { value: 'lead', label: 'Lead time' },
              { value: 'coverage', label: 'Coverage' },
            ]}
            value="landed"
            hrefFor={(v) => specimenHref(SLUG, `on=${v}`)}
          />
        }
        grid={
          <DataTable
            caption={`Compare ${ENQ}: landed cost per unit`}
            gridClass="grid-cols-[minmax(0,1.4fr)_110px_110px_110px_110px]"
            columns={COLUMNS}
            rows={SAMPLE_COMPARE}
            rowKey={(r) => r.key}
            rowKind={(r) => r.kind ?? 'item'}
            groupLabel={(r) => r.line}
            selectedKey="c1"
            foot="Lowest landed cost is suggested; you can override any cell"
          />
        }
        foot={
          <FxTag
            state="locked"
            pair={`EUR → AED ${FX.EUR}`}
            lockedOn={new Date('2026-10-02T08:00:00Z')}
            now={KIT_NOW}
          />
        }
        aside={
          <>
            <OptionGroup
              name="scenario"
              legend="Scenarios"
              className="gap-3.5"
              defaultValue="one"
              items={[
                {
                  value: 'one',
                  title: 'Example for both valve lines',
                  sub: 'Lowest landed cost on 2 of 3 lines, 6 weeks.',
                  suggested: true,
                },
                {
                  value: 'split',
                  title: 'Split: Example line 5, Sample line 6',
                  sub: 'AED 1,283 more, 1 week sooner on line 6.',
                },
              ]}
            />
            <Stat
              rows={[
                { label: 'Supplier cost', value: aed('32428.04') },
                { label: 'Freight', value: aed('2427.13') },
                { label: 'Other', value: aed('299.14') },
                { label: 'Landed', value: aed('35154.31'), total: true },
              ]}
            />
          </>
        }
      />
    </T2Record>
  )
}
