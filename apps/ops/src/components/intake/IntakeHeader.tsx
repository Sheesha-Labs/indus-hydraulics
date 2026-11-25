import { Segmented } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'

/** Board 14's header: "Enquiries / Upload enquiry documents" with the Inbox · Intake n switch. */
export default function IntakeHeader({ intakeCount }: { intakeCount: number }) {
  return (
    <PageHeader
      crumb="Enquiries"
      title="Upload enquiry documents"
      segmented={
        <Segmented<'inbox' | 'intake'>
          aria-label="Where enquiries come from"
          value="intake"
          hrefFor={(v) => (v === 'inbox' ? '/mail' : '/enquiries/intake')}
          options={[
            { value: 'inbox', label: 'Inbox' },
            { value: 'intake', label: `Intake ${intakeCount}` },
          ]}
        />
      }
    />
  )
}
