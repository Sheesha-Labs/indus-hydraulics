import { Button } from '@indus/ops-ui/controls'
import { DropzoneFrame, Field, Fields } from '@indus/ops-ui/form'
import { T9Wizard } from '@indus/ops-ui/templates'
import { WizardSteps } from '@indus/ops-ui/timeline'
import { STEPS } from '../fixtures'
import { ProductMark } from './shared'

/**
 * T9a · Wizard: setup step 3, History, in the centred card (no sidebar: the board draws none). Neutral
 * values; the field labels are the board's.
 */
export default function T9ASpecimen() {
  return (
    <T9Wizard
      brand={<ProductMark />}
      progress={<span className="text-io-ink-3 text-[12px]">Step 3 of 5</span>}
      steps={<WizardSteps aria-label="Setup" steps={STEPS} current={3} />}
      title="Bring in your history"
      back={<Button variant="ghost">Back</Button>}
      skip={<Button>Skip for now</Button>}
      next={<Button variant="primary">Start import</Button>}
    >
      <p className="text-io-ink-2 leading-[1.55]">
        The Assistant reads past mail and Zoho Books to learn clients, suppliers and prices. It never
        emails anyone during import.
      </p>
      <Fields cols={2}>
        <Field type="text" name="mailFrom" label="Mail from" defaultValue="1 Jan 2024" />
        <Field
          type="select"
          name="mailboxes"
          label="Mailboxes"
          defaultValue="both"
          options={[
            { value: 'both', label: 'sales@ and purchase@' },
            { value: 'sales', label: 'sales@ only' },
          ]}
        />
        <Field
          type="text"
          name="books"
          label="Zoho Books"
          defaultValue="Connected · read-only"
          state="readonly"
        />
        <Field
          type="text"
          name="oldAdmin"
          label="Old website admin"
          defaultValue="Export file"
          hint="Optional"
        />
      </Fields>
      <DropzoneFrame
        look="ready"
        title="Drop old quotations or price lists"
        text="PDF, Excel or CSV."
        action={
          <Button size="sm" className="px-3">
            Choose files
          </Button>
        }
      />
    </T9Wizard>
  )
}
