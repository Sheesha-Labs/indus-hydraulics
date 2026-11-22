import { ButtonLink } from '@indus/ops-ui/controls'
import { Field, FormSection } from '@indus/ops-ui/form'
import { MailFolder } from '@indus/ops-ui/mail'
import { PageHeader } from '@indus/ops-ui/shell'
import { T7Settings } from '@indus/ops-ui/templates'
import { BANK, TEMPLATES } from '../fixtures'
import { specimenHref } from './shared'

const SLUG = 't7a'
const href = (q: string) => specimenHref(SLUG, q)

const CURRENCIES = [
  { value: 'AED', label: 'AED' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

/** T7a · Settings form: Company. The sub-nav is the Mail kit folder row, as the L2 sheet mounts it. */
export default function T7ASpecimen() {
  return (
    <T7Settings
      header={
        <PageHeader
          crumb="Settings"
          title="Company"
          actions={
            <>
              <ButtonLink href={href('cancel=1')}>Cancel</ButtonLink>
              <ButtonLink variant="primary" href={href('save=1')}>
                Save changes
              </ButtonLink>
            </>
          }
        />
      }
      subnav={TEMPLATES.settingsNav.map((label, i) => (
        <MailFolder
          key={label}
          label={label}
          active={i === 0}
          href={href(`section=${encodeURIComponent(label.toLowerCase())}`)}
        />
      ))}
    >
      <FormSection title="Company" description="Printed on every quotation, PO and invoice.">
        <Field
          type="text"
          name="companyName"
          label="Company name"
          required
          defaultValue={TEMPLATES.company}
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
      <FormSection
        title="Documents"
        description="Trade licence, VAT certificate and bank letter. The Assistant warns 30 days before expiry."
      >
        <Field
          type="text"
          name="licenceFile"
          label="Trade licence"
          defaultValue="Uploaded 2 Feb"
          hint="Expires 1 Feb 2027"
        />
        <Field type="text" name="vatFile" label="VAT certificate" defaultValue="Uploaded 2 Feb" />
        <Field type="text" name="bankFile" label="Bank letter" hint="Needed for new suppliers" />
      </FormSection>
    </T7Settings>
  )
}
