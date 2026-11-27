import type { OpsUser } from '../../../lib/access-core'
import type { SupplierWizard, WizardStep } from '../../../data/supplier-wizard'

/** Steps vetting, bank, approve (S10-T05) and line card (S10-T06). */
export default async function WizardLaterSteps({
  wizard,
  step,
}: {
  wizard: SupplierWizard
  step: WizardStep
  user: OpsUser
}) {
  return <p data-step={step}>{wizard.name}</p>
}
