import { PageHeader } from '@indus/ops-ui/shell'
import type { Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import CompanyStep from '../../../../../components/directory/wizard/CompanyStep'
import DocumentsStep from '../../../../../components/directory/wizard/DocumentsStep'
import { Foot, TwoPanes } from '../../../../../components/directory/wizard/WizardFrame'
import WizardLaterSteps from '../../../../../components/directory/wizard/WizardLaterSteps'
import {
  getSupplierWizard,
  WIZARD_STEPS,
  type WizardStep,
} from '../../../../../data/supplier-wizard'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { routeParam, wizardSteps } from '../../../../../lib/route-params'

/**
 * Boards 50–52 · New supplier (S10-T04..T06): `/suppliers/new` is the company step for a new draft; once saved the
 * draft id is in the path (`/suppliers/new/<id>/<step>`): company · documents · vetting · bank · line card · approve.
 * The step pills show where the draft is; one primary per step in the foot.
 */
const ORDER: readonly WizardStep[] = WIZARD_STEPS.map(([k]) => k)

export default async function SuppliersNewStepPage({
  params,
}: {
  params: Promise<{ step?: string[] }>
}) {
  const { step } = await params
  const user = await requireOpsUser().catch(
    signInFor(`/suppliers/new${step?.length ? `/${step.join('/')}` : ''}`)
  )
  const parts = routeParam(wizardSteps, step) ?? []
  const [id, raw] = parts
  if (parts.length > 2 || (id && !/^[0-9a-f-]{36}$/.test(id))) notFound()
  if (id && !raw) redirect(`/suppliers/new/${id}/documents` as Route)
  const current = (raw ?? 'company') as WizardStep
  if (!ORDER.includes(current)) notFound()
  const wizard = id ? await getSupplierWizard(id) : null
  if (id && !wizard) notFound()

  const at = ORDER.indexOf(current)
  const steps = WIZARD_STEPS.map(([k, label], i) => ({
    label: `${i + 1} ${label}`,
    state: (i < at ? 'done' : i === at ? 'current' : 'todo') as 'done' | 'current' | 'todo',
  }))
  return (
    <div className="flex min-h-full flex-col" data-built={`supplier-wizard-${current}`}>
      <PageHeader
        crumb="Suppliers / New supplier"
        title={wizard?.name ?? 'New supplier'}
        steps={steps}
      />
      {current === 'company' ? (
        <div className="px-io-page-x max-w-[880px] py-6">
          <CompanyStep wizard={wizard} />
        </div>
      ) : current === 'documents' ? (
        <TwoPanes
          wizard={wizard!}
          foot={
            <Foot wizard={wizard!} next="vetting" nextLabel="Continue to vetting" back="company" />
          }
        >
          <DocumentsStep wizard={wizard!} />
        </TwoPanes>
      ) : (
        <WizardLaterSteps wizard={wizard!} step={current} user={user} />
      )}
    </div>
  )
}
