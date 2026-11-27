import type { SupplierWizard } from '../../../data/supplier-wizard'
import type { OpsUser } from '../../../lib/access-core'

/** Board 52 · Line card & terms (S10-T06). */
export default async function LineCardStep({ wizard }: { wizard: SupplierWizard; user: OpsUser }) {
  return <p data-step="line-card">{wizard.name}</p>
}
