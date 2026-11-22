import { DropzoneFrame, Field, Fields, FormSection } from '@indus/ops-ui/form'
import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import type { ReactNode } from 'react'
import { BANK, COMPANIES } from '../fixtures'
import { ActionFormDemo, DropzoneDemo } from './FormDemos'

/** Set to 'built' when S01-T06 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`). `full` rows exist only on /_kit/form; inside the L1 mirror (k09) they are
 * hidden so the card keeps the sheet's height. `column` stacks the row's parts (`.cv-cl`).
 */
function Row({
  name,
  code,
  note,
  full = false,
  column = false,
  children,
}: {
  name: string
  code: string
  note: string
  full?: boolean
  column?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0',
        full && 'in-data-[kit-section=k09]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px] tracking-normal">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent font-sans text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div className={cn('flex gap-3', column ? 'flex-col items-start' : 'flex-wrap items-center')}>
        {children}
      </div>
    </div>
  )
}

/** A fixed-width cell of a spec row (the sheet's `width:220px; flex column; gap 10`). */
function Cell({ w, children }: { w: string; children: ReactNode }) {
  return <div className={cn('flex flex-col gap-2.5', w)}>{children}</div>
}

/** The focus ring drawn at rest, so the specimen shows the kit's "focus" state without a focused control. */
const FOCUS = 'border-io-accent shadow-[0_0_0_3px_var(--io-accent-tint)]'

const DEADLINE = {
  type: 'text',
  label: 'Client deadline',
  defaultValue: '30 Sep 2026',
  hint: 'From the client email, 14 Sep',
} as const

const CURRENCIES = [
  { value: 'AED', label: 'AED' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

const OFFER = {
  title: 'Drop the supplier’s offer here',
  text: 'PDF, Excel or email. The Assistant reads it and maps the lines.',
}

/**
 * Form kit specimen: the L1 k09 mirror (the sheet's rows, parts and widths with neutral samples), then
 * what the sheet does not show (/_kit/form only): date and email types, the Why? link, a 4-column grid,
 * the idle dropzone, and a working ActionForm and Dropzone.
 */
export default function FormSpecimen() {
  return (
    <>
      {/* ---- L1 k09 mirror ---- */}
      <Row
        name="Field · states"
        code={'part="Field" state'}
        note="rest · focus · error · readonly · disabled · assistant"
      >
        <Cell w="w-[220px]">
          <Field {...DEADLINE} name="deadline-rest" />
        </Cell>
        <Cell w="w-[220px]">
          <Field {...DEADLINE} name="deadline-focus" controlClassName={FOCUS} />
        </Cell>
        <Cell w="w-[220px]">
          <Field {...DEADLINE} name="deadline-assistant" state="assistant" />
        </Cell>
        <Cell w="w-[220px]">
          <Field {...DEADLINE} name="deadline-readonly" state="readonly" />
        </Cell>
        <Cell w="w-[220px]">
          <Field {...DEADLINE} name="deadline-disabled" state="disabled" />
        </Cell>
        <Cell w="w-[220px]">
          <Field
            type="money"
            currency="USD"
            name="unitPrice"
            label="Unit price"
            required
            error="Enter a price or mark the line Regret"
          />
        </Cell>
      </Row>

      <Row name="Types" code="type" note="text · money · number · date · select · textarea">
        <Cell w="w-[220px]">
          <Field type="number" name="margin" label="Margin" defaultValue="12" suffix="%" />
        </Cell>
        <Cell w="w-[220px]">
          <Field
            type="select"
            name="incoterm"
            label="Incoterm"
            defaultValue="dap"
            options={[
              { value: 'dap', label: 'DAP site' },
              { value: 'exw', label: 'EXW' },
              { value: 'cif', label: 'CIF' },
            ]}
          />
        </Cell>
        <Cell w="w-[440px]">
          <Field
            type="textarea"
            name="supplierNote"
            label="Note to supplier"
            optional
            defaultValue="Please confirm stock for line 2 and quote an alternative make if not."
          />
        </Cell>
      </Row>

      <Row
        name="Section · Dropzone"
        code={'part="Section|Dropzone"'}
        note="Settings sections; file drop"
        column
      >
        <div className="flex w-[1100px] flex-col gap-2.5">
          <FormSection
            title="Company"
            description="Printed on every quotation, PO and invoice."
            cols={3}
          >
            <Field
              type="text"
              name="companyName"
              label="Company name"
              required
              defaultValue="Example Trading LLC"
            />
            <Field
              type="text"
              name="licence"
              label="Trade licence no."
              required
              hint="Read from the licence PDF"
            />
            <Field type="text" name="trn" label="TRN" required defaultValue={BANK.trn} />
            <Field
              type="select"
              name="bookCurrency"
              label="Book currency"
              required
              defaultValue="AED"
              options={CURRENCIES}
            />
            <Field
              type="select"
              name="quoteCurrency"
              label="Default quotation currency"
              defaultValue="USD"
              options={CURRENCIES}
            />
            <Field
              type="number"
              name="defaultMargin"
              label="Default margin"
              defaultValue="12"
              suffix="%"
              hint="Price guard warns below 5%"
            />
          </FormSection>
          <DropzoneFrame
            look="ready"
            {...OFFER}
            action={
              <Button size="sm" className="px-3">
                Choose files
              </Button>
            }
          />
          <DropzoneFrame
            look="over"
            title="Release to add 3 files"
            text={OFFER.text}
            action={
              <Button size="sm" className="px-3">
                Choose files
              </Button>
            }
          />
        </div>
      </Row>

      {/* ---- /_kit/form only ---- */}
      <Row
        name="More types"
        code="type · assistantSource"
        note="date (native, posts ISO) · email · Why? link on an Assistant value"
        full
      >
        <Cell w="w-[220px]">
          <Field type="date" name="due" label="Delivery date" defaultValue="2026-09-30" />
        </Cell>
        <Cell w="w-[220px]">
          <Field type="email" name="email" label="Contact email" placeholder="name@example.com" />
        </Cell>
        <Cell w="w-[220px]">
          <Field
            {...DEADLINE}
            name="deadline-why"
            state="assistant"
            assistantSource={{ evidenceId: 'ev-0001' }}
          />
        </Cell>
        <Cell w="w-[220px]">
          <Field
            type="money"
            currency="EUR"
            name="freight"
            label="Freight"
            defaultValue="1,250.00"
            hint={`Quoted by ${COMPANIES.supplier}`}
          />
        </Cell>
      </Row>

      <Row name="Fields" code="cols" note="1–4 columns, gap 14 × 16" full>
        <div className="w-[1100px]">
          <Fields cols={4}>
            <Field type="text" name="qty" label="Quantity" defaultValue="40" />
            <Field type="text" name="uom" label="Unit" defaultValue="pcs" />
            <Field type="number" name="lead" label="Lead time" defaultValue="6" suffix="weeks" />
            <Field type="text" name="origin" label="Origin" optional />
          </Fields>
        </div>
      </Row>

      <Row
        name="Dropzone · live"
        code="upload · maxBytes"
        note="idle look; a working dropzone (20 MB limit, accept list, per-file rows)"
        column
        full
      >
        <div className="flex w-[1100px] flex-col gap-2.5">
          <DropzoneFrame
            look="idle"
            {...OFFER}
            action={
              <Button size="sm" className="px-3">
                Choose files
              </Button>
            }
          />
          <DropzoneDemo {...OFFER} />
        </div>
      </Row>

      <Row
        name="ActionForm"
        code="action · fieldErrors"
        note="Submit empty to see the field error; the button is busy while pending"
        full
      >
        <div className="w-[700px]">
          <ActionFormDemo />
        </div>
      </Row>
    </>
  )
}
