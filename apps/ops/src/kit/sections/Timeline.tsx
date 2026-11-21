import { ActivityFeed, Diff, Gantt, Timeline, WizardSteps } from '@indus/ops-ui/timeline'
import type { ReactNode } from 'react'
import { ACTIVITY, DIFF, GANTT, STEPS, TIMELINE, TIMELINE_MORE } from '../fixtures'

/** Set to 'built' when S01-T08 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/** One L1 sheet spec row (.cv-sr): 200px label column, then the parts. */
function SpecRow({
  name,
  code,
  note,
  children,
}: {
  name: string
  code: string
  note?: string
  children: ReactNode
}) {
  return (
    <div className="border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-[3px]">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      {children}
    </div>
  )
}

/**
 * Timeline kit specimen (L1 section k08): the sheet's rows, parts and widths, with neutral samples.
 * Beyond the sheet: a third column shows the two Timeline marks its sample leaves out (bad, assistant),
 * and the last Gantt row is a late bar so all four bar kinds appear.
 */
export default function TimelineSpecimen() {
  return (
    <>
      <SpecRow
        name="Timeline · Activity"
        code={'part="Timeline|Activity"'}
        note="d done · c current · w waiting · b blocked · a Assistant · o upcoming"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-[460px] flex-col gap-2.5">
            <Timeline aria-label="Enquiry history" items={TIMELINE} />
          </div>
          <div className="flex w-[460px] flex-col gap-2.5">
            <ActivityFeed aria-label="Activity today" items={ACTIVITY} />
          </div>
          <div className="flex w-[170px] flex-col gap-2.5">
            <Timeline aria-label="More timeline marks" items={TIMELINE_MORE} />
          </div>
        </div>
      </SpecRow>
      <SpecRow
        name="Gantt"
        code={'part="Gantt"'}
        note="rows name~sub~bar:start:end:label|ms:at; slip, late, done; today="
      >
        <div className="flex flex-col items-start gap-3">
          {/* The sheet's Gantt renders 909px wide (its runtime sizes the axis to max-content). */}
          <div className="w-[909.33px]">
            <Gantt
              caption="Supplier plan"
              axis={GANTT.axis}
              today={GANTT.today}
              rows={GANTT.rows}
            />
          </div>
        </div>
      </SpecRow>
      <SpecRow name="Diff · Steps" code={'part="Diff|Steps"'}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-[620px] flex-col gap-2.5">
            <Diff wasLabel={DIFF.wasLabel} nowLabel={DIFF.nowLabel} rows={DIFF.rows} />
          </div>
          <div className="flex w-[560px] flex-col gap-2.5">
            <WizardSteps aria-label="Setup" steps={STEPS} current={3} />
          </div>
        </div>
      </SpecRow>
    </>
  )
}
