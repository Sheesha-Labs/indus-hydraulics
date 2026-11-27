import { Chip } from '@indus/ops-ui/status'
import { companyInitials } from '@indus/ops-core'
import { getVettingData, type SupplierWizard, type WizardStep } from '../../../data/supplier-wizard'
import type { OpsUser } from '../../../lib/access-core'
import LineCardStep from './LineCardStep'
import { ApprovalDecision, BankVerification, ScreeningTable } from './VettingParts'
import { Foot } from './WizardFrame'

/**
 * Boards 51 and 52 (S10-T05/T06): the vetting, bank and approve steps share board 51's page (screening, bank
 * verification by call-back, the checks timeline and the Owner's decision); the line-card step is board 52.
 */
const STATUS_WORD: Record<string, { word: string; tone: 'warn' | 'ok' | 'bad' | 'n' | 'acc' }> = {
  draft: { word: 'Draft', tone: 'n' },
  proposed: { word: 'Proposed', tone: 'acc' },
  under_review: { word: 'Under review', tone: 'warn' },
  approved_trial: { word: 'Approved · trial', tone: 'ok' },
  approved: { word: 'Approved', tone: 'ok' },
  rejected: { word: 'Rejected', tone: 'bad' },
  suspended: { word: 'Suspended', tone: 'bad' },
}
const DT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const D = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'short',
})
const fmt = (d: Date) => DT.format(d).replace('Sept', 'Sep').replace(',', '')
const day = (d: Date) => D.format(d).replace('Sept', 'Sep')

export default async function WizardLaterSteps({
  wizard,
  step,
  user,
}: {
  wizard: SupplierWizard
  step: WizardStep
  user: OpsUser
}) {
  if (step === 'line-card') return <LineCardStep wizard={wizard} user={user} />
  const v = await getVettingData(wizard.id)
  const { screening, bank, facts, timeline, trades } = v
  const status = STATUS_WORD[wizard.onboarding ?? 'draft'] ?? STATUS_WORD.draft!
  const lastRun = v.lastRunAt ? { checkedAt: v.lastRunAt } : null
  const isOwner = user.role === 'owner'
  const steps: Array<{ key: string; at: string; who: string; text: string; done: boolean }> = [
    ...timeline.map((t) => ({
      key: `${t.decision}-${t.decidedAt.toISOString()}`,
      at: day(t.decidedAt),
      who: t.by ? `${t.by.initials} · ${t.by.name}` : 'Indus',
      text:
        t.decision === 'propose'
          ? `Recommends${t.reason ? ` · ${t.reason}` : ''}`
          : t.decision === 'send_back'
            ? `Sent back · ${t.reason ?? ''}`
            : t.decision === 'approve_trial'
              ? 'Approved on trial'
              : t.decision === 'reject'
                ? `Rejected · ${t.reason ?? ''}`
                : t.decision.replace(/_/g, ' '),
      done: true,
    })),
    ...(facts.openDocuments.length === 0
      ? [
          {
            key: 'docs',
            at: '',
            who: 'Documents',
            text: 'Every required document is in',
            done: true,
          },
        ]
      : [
          {
            key: 'docs',
            at: '',
            who: 'Documents',
            text: `${facts.openDocuments.length} still open`,
            done: false,
          },
        ]),
    ...(facts.bankVerified && bank?.callbackAt
      ? [
          {
            key: 'bank',
            at: day(bank.callbackAt),
            who: bank.recordedBy ?? 'Owner',
            text: 'Bank verified by call-back',
            done: true,
          },
        ]
      : [{ key: 'bank', at: '', who: 'Bank', text: 'Waiting for the call-back', done: false }]),
    ...(['approved', 'approved_trial', 'rejected'].includes(wizard.onboarding ?? '')
      ? []
      : [
          {
            key: 'decision',
            at: 'Today',
            who: 'KB · Krishan Bhatia',
            text: 'Decision below',
            done: false,
          },
        ]),
  ]
  const blocking = [
    ...(facts.screening.open.length
      ? [
          `Screening still open: ${facts.screening.open.length} list${facts.screening.open.length === 1 ? '' : 's'}`,
        ]
      : []),
    ...(facts.screening.hits.length ? [`Screening hit on ${facts.screening.hits.join(', ')}`] : []),
    ...(facts.bankVerified ? [] : ['No genuine call-back on the bank details yet']),
    ...(facts.openDocuments.filter((d) => d !== 'code_of_conduct' && d !== 'ownership_declaration')
      .length
      ? ['Documents still open: ' + facts.openDocuments.map((d) => d.replace(/_/g, ' ')).join(', ')]
      : []),
  ]
  const decided = ['approved', 'approved_trial', 'rejected'].includes(wizard.onboarding ?? '')
  return (
    <>
      <div
        className="border-io-line bg-io-card flex items-center justify-between border-b px-7 py-4"
        data-part="vetting-head"
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="bg-io-navy rounded-io-ctl flex size-11 items-center justify-center text-[13px] font-semibold text-white"
          >
            {companyInitials(wizard.name)}
          </span>
          <div>
            <p className="io-display text-io-record m-0 leading-tight">{wizard.name}</p>
            <p className="text-io-ink-3 m-0 text-[12.5px]">
              {[
                wizard.facts.type.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
                wizard.facts.countryWord,
                trades.join(', ') || null,
                wizard.started.replace(/^Started /, 'proposed '),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>
        <Chip tone={status.tone} label={status.word} />
      </div>
      <div
        className="px-io-page-x grid flex-1 grid-cols-[minmax(0,1fr)_520px] gap-5 py-6"
        data-built="supplier-vetting"
      >
        <div className="flex min-w-0 flex-col gap-5">
          <ScreeningTable
            supplierId={wizard.id}
            rows={screening}
            runLabel={lastRun ? `run ${fmt(lastRun.checkedAt)}` : 'not run yet'}
          />
          <BankVerification
            supplierId={wizard.id}
            isOwner={isOwner}
            registryPhone={v.registryPhone}
            bank={
              bank
                ? {
                    id: bank.id,
                    bankName: bank.bankName,
                    accountName: bank.accountName,
                    currency: bank.currency,
                    ibanLast4: bank.ibanLast4,
                    swift: bank.swift,
                    status: bank.status,
                    nameMatchesRegistry: bank.nameMatchesRegistry,
                    letterMatchesIban: bank.letterMatchesIban,
                    callback: bank.callbackAt
                      ? {
                          at: fmt(bank.callbackAt),
                          spokeTo: bank.callbackSpokeTo ?? '',
                          role: bank.callbackSpokeToRole,
                          number: bank.callbackNumber ?? '',
                          source: bank.callbackNumberSource ?? 'registry',
                          by: bank.recordedBy,
                        }
                      : null,
                    coolingOffUntil: v.coolingOffOpen ? fmt(v.coolingOffOpen) : null,
                  }
                : null
            }
          />
        </div>
        <div className="flex flex-col gap-5">
          <section
            aria-label="Checks and decision"
            className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
          >
            <h2 className="io-eyebrow m-0 mb-3">Checks and decision</h2>
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {steps.map((s) => (
                <li key={s.key} className="grid grid-cols-[18px_70px_1fr] gap-3 text-[12.5px]">
                  <span
                    aria-hidden="true"
                    className={`mt-1 size-3 rounded-full ${s.done ? 'bg-io-accent' : 'border-io-warn border-2'}`}
                  />
                  <span className="text-io-ink-3">{s.at}</span>
                  <span className="flex flex-col">
                    <span className="font-medium">{s.who}</span>
                    <span className="text-io-ink-3">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          {decided ? (
            <section
              aria-label="Decision"
              className="bg-io-card border-io-line rounded-io-card border px-5 py-4 text-[13px]"
              data-part="decided"
            >
              <h2 className="io-eyebrow m-0 mb-2">Decision</h2>
              <p className="m-0">{status.word}</p>
            </section>
          ) : (
            <ApprovalDecision
              supplierId={wizard.id}
              isOwner={isOwner}
              status={wizard.onboarding}
              allowed={{
                approve: facts.allowed.approve.allowed,
                approve_trial: facts.allowed.approve_trial.allowed,
              }}
              conditions={facts.allowed.approve_trial.conditions}
              blocking={blocking}
            />
          )}
        </div>
      </div>
      <Foot
        wizard={wizard}
        next={step === 'approve' || decided ? 'line-card' : step === 'vetting' ? 'bank' : 'approve'}
        nextLabel={decided ? 'Continue to line card' : 'Next'}
        back="documents"
        nextPrimary={decided}
      />
    </>
  )
}
