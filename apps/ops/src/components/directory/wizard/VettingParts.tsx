'use client'

import { Button, RadioGroup } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import type { Tone } from '@indus/ops-ui/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  addBankAccountAction,
  decideSupplierAction,
  recordCallbackAction,
  saveScreeningAction,
  sendBackAction,
  submitForReviewAction,
} from '../../../app/(console)/suppliers/new/actions/vetting'
import { FIELD } from '../DirectoryEditors'

/**
 * Board 51 parts (S10-T05): the screening checklist (manual, C40: the person opens the official list search pages and
 * records what was searched, the result and an evidence link), bank verification (details as last 4; the Owner's
 * call-back to the registry number), and the decision (Approve · Approve on trial · Reject; the primary follows the
 * radio; Send back for the Owner, Recommend for the Helper).
 */
type Result<T> = { success: true; data: T } | { success: false; error: string }

function useRun() {
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  async function run<T>(fn: () => Promise<Result<T>>, ok: string): Promise<boolean> {
    setBusy(true)
    try {
      const r = await fn()
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return false
      }
      toast({ kind: 'success', title: ok })
      router.refresh()
      return true
    } finally {
      setBusy(false)
    }
  }
  return { busy, run }
}

const RESULT: Record<string, { word: string; tone: Tone }> = {
  clear: { word: 'Clear', tone: 'ok' },
  possible_match: { word: 'Possible match', tone: 'warn' },
  hit: { word: 'Hit', tone: 'bad' },
  open: { word: 'Open', tone: 'warn' },
  error: { word: 'Error', tone: 'bad' },
}

/** Official search pages, opened by the person (no API call). */
const LIST_LINK: Record<string, string> = {
  un: 'https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list',
  ofac: 'https://sanctionssearch.ofac.treas.gov/',
  eu_uk: 'https://www.sanctionsmap.eu/',
  uae: 'https://www.uaeiec.gov.ae/en-us/un-page',
}

export interface ScreeningItem {
  key: string
  label: string
  scope: string
  result: string
  evidenceUrl: string | null
  note: string | null
}

export function ScreeningTable({
  supplierId,
  rows,
  runLabel,
}: {
  supplierId: string
  rows: ScreeningItem[]
  runLabel: string
}) {
  const [v, setV] = useState(rows.map((r) => ({ ...r, evidenceUrl: r.evidenceUrl ?? '' })))
  const [editing, setEditing] = useState(false)
  const { busy, run } = useRun()
  return (
    <section
      aria-label="Screening"
      className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
    >
      <div className="border-io-line text-io-ink-3 grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_120px] gap-3 border-b px-4 py-3 text-[10.5px] font-medium tracking-[0.1em] uppercase">
        <span>Screening · {runLabel}</span>
        <span>Checked</span>
        <span>Result</span>
      </div>
      <ul className="m-0 list-none p-0">
        {v.map((r, i) => {
          const s = RESULT[r.result] ?? { word: r.result, tone: 'n' as Tone }
          return (
            <li
              key={r.key}
              className="border-io-line border-b px-4 py-2.5 text-[12.5px] last:border-b-0"
              data-list={r.key}
            >
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_120px] items-center gap-3">
                <span>
                  {LIST_LINK[r.key] ? (
                    <a
                      href={LIST_LINK[r.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="io-focus rounded-io-tag"
                    >
                      {r.label}
                    </a>
                  ) : (
                    r.label
                  )}
                </span>
                {editing ? (
                  <input
                    className={FIELD}
                    aria-label={`${r.label}: what was checked`}
                    value={r.scope}
                    onChange={(e) =>
                      setV(v.map((x, j) => (j === i ? { ...x, scope: e.target.value } : x)))
                    }
                  />
                ) : (
                  <span className="text-io-ink-3 text-[12px]">
                    {r.note ? `${r.scope} · ${r.note}` : r.scope}
                  </span>
                )}
                {editing ? (
                  <select
                    className={FIELD}
                    aria-label={`${r.label}: result`}
                    value={r.result}
                    onChange={(e) =>
                      setV(v.map((x, j) => (j === i ? { ...x, result: e.target.value } : x)))
                    }
                  >
                    {['open', 'clear', 'possible_match', 'hit'].map((k) => (
                      <option key={k} value={k}>
                        {RESULT[k]!.word}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Chip tone={s.tone} label={s.word} className="w-full" />
                )}
              </div>
              {editing ? (
                <input
                  className={`${FIELD} mt-2`}
                  aria-label={`${r.label}: evidence link`}
                  placeholder="Evidence link (the search result page)"
                  value={r.evidenceUrl}
                  onChange={(e) =>
                    setV(v.map((x, j) => (j === i ? { ...x, evidenceUrl: e.target.value } : x)))
                  }
                />
              ) : null}
            </li>
          )
        })}
      </ul>
      <div className="border-io-line flex items-center justify-between border-t px-4 py-3 text-[12.5px]">
        <span className="text-io-ink-3">
          Re-screened every 90 days and before every PO over USD 50,000
        </span>
        <span className="flex gap-2">
          {editing ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() =>
                void (async () => {
                  const ok = await run(
                    () =>
                      saveScreeningAction({
                        supplierId,
                        rows: v.map((r) => ({
                          key: r.key,
                          result: r.result as 'clear',
                          ...(r.scope.trim() ? { scope: r.scope.trim() } : {}),
                          ...(/^https?:\/\//.test(r.evidenceUrl.trim())
                            ? { evidenceUrl: r.evidenceUrl.trim() }
                            : {}),
                        })),
                      }),
                    'Screening saved'
                  )
                  if (ok) setEditing(false)
                })()
              }
            >
              Save screening
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Record screening
            </Button>
          )}
        </span>
      </div>
    </section>
  )
}

export interface BankItem {
  id: string
  bankName: string
  accountName: string
  currency: string | null
  ibanLast4: string
  swift: string | null
  status: string
  nameMatchesRegistry: boolean | null
  letterMatchesIban: boolean | null
  callback: {
    at: string
    spokeTo: string
    role: string | null
    number: string
    source: string
    by: string | null
  } | null
  coolingOffUntil: string | null
}

export function BankVerification({
  supplierId,
  bank,
  isOwner,
  registryPhone,
}: {
  supplierId: string
  bank: BankItem | null
  isOwner: boolean
  registryPhone: string | null
}) {
  const { busy, run } = useRun()
  const [f, setF] = useState<Record<string, string>>({})
  const [cb, setCb] = useState<Record<string, string>>({
    numberSource: 'registry',
    numberDialled: registryPhone ?? '',
    outcome: 'genuine',
  })
  const set = (k: string) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value })
  const setC = (k: string) => (e: { target: { value: string } }) =>
    setCb({ ...cb, [k]: e.target.value })
  return (
    <section
      aria-label="Bank verification"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
      data-part="bank-verification"
    >
      <h2 className="io-eyebrow m-0 mb-3">Bank verification</h2>
      {bank ? (
        <dl className="m-0 grid grid-cols-[140px_1fr] gap-y-2 text-[12.5px]">
          <dt className="text-io-ink-3">Account name</dt>
          <dd className="m-0">
            {bank.accountName}
            {bank.nameMatchesRegistry ? (
              <span className="text-io-ok"> · matches registry</span>
            ) : null}
          </dd>
          <dt className="text-io-ink-3">Bank</dt>
          <dd className="m-0">{bank.bankName}</dd>
          <dt className="text-io-ink-3">IBAN{bank.currency ? ` (${bank.currency})` : ''}</dt>
          <dd className="m-0">•••• {bank.ibanLast4}</dd>
          <dt className="text-io-ink-3">SWIFT</dt>
          <dd className="m-0">{bank.swift ?? '—'}</dd>
          <dt className="text-io-ink-3">Bank letter</dt>
          <dd className="m-0">
            {bank.letterMatchesIban ? 'Matches the IBAN' : 'Not checked against the IBAN'}
          </dd>
        </dl>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 text-[12.5px]">
          {[
            ['accountName', 'Account name'],
            ['bankName', 'Bank'],
            ['iban', 'IBAN'],
            ['swift', 'SWIFT'],
            ['currency', 'Currency'],
          ].map(([k, l]) => (
            <label key={k} className="flex flex-col gap-1">
              {l}
              <input className={FIELD} value={f[k!] ?? ''} onChange={set(k!)} autoComplete="off" />
            </label>
          ))}
          <label className="flex items-center gap-2 self-end pb-2">
            <input
              type="checkbox"
              checked={f.nameMatches === '1'}
              onChange={(e) => setF({ ...f, nameMatches: e.target.checked ? '1' : '' })}
            />
            Account name matches the registry
          </label>
          <label className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={f.letterMatches === '1'}
              onChange={(e) => setF({ ...f, letterMatches: e.target.checked ? '1' : '' })}
            />
            The bank letter matches the IBAN
          </label>
          <div className="col-span-2 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              disabled={busy || !f.iban?.trim() || !f.bankName?.trim() || !f.accountName?.trim()}
              onClick={() =>
                void run(
                  () =>
                    addBankAccountAction({
                      supplierId,
                      account: {
                        bankName: f.bankName!.trim(),
                        accountName: f.accountName!.trim(),
                        iban: f.iban!.trim(),
                        ...(f.swift?.trim() ? { swift: f.swift.trim() } : {}),
                        ...(f.currency?.trim()
                          ? { currency: f.currency.trim().toUpperCase() }
                          : {}),
                        nameMatchesRegistry: f.nameMatches === '1',
                        letterMatchesIban: f.letterMatches === '1',
                      },
                    }),
                  'Bank details recorded: payments wait for a call-back'
                )
              }
            >
              Save bank details
            </Button>
          </div>
        </div>
      )}

      {bank?.status === 'verified' && bank.callback ? (
        <div
          className="border-io-accent-line bg-io-accent-faint rounded-io-card mt-4 flex items-start justify-between gap-3 border px-4 py-3"
          data-state="callback-verified"
        >
          <div className="text-[12.5px]">
            <p className="m-0 font-medium">Confirmed by phone, {bank.callback.at}</p>
            <p className="text-io-ink-2 m-0 mt-1">
              {bank.callback.spokeTo}
              {bank.callback.role ? `, ${bank.callback.role}` : ''}, called on the{' '}
              {bank.callback.source === 'registry'
                ? 'switchboard number from the registry'
                : 'number from a verified record'}{' '}
              ({bank.callback.number}), not a number from the email.
              {bank.callback.by ? ` Recorded by ${bank.callback.by}.` : ''}
            </p>
            {bank.coolingOffUntil ? (
              <p className="text-io-warn m-0 mt-1">
                Payments blocked · cooling-off until {bank.coolingOffUntil}
              </p>
            ) : null}
          </div>
          <Chip tone="ok" label="Verified" />
        </div>
      ) : bank?.status === 'pending_verification' ? (
        isOwner ? (
          <div
            className="border-io-line mt-4 grid grid-cols-2 gap-2.5 border-t pt-4 text-[12.5px]"
            data-part="callback-form"
          >
            <p className="text-io-ink-2 col-span-2 m-0">
              Call the number on file, not any number in an email. Only Krishan records this.
            </p>
            <label className="flex flex-col gap-1">
              Number source
              <select className={FIELD} value={cb.numberSource} onChange={setC('numberSource')}>
                <option value="registry">Company registry</option>
                <option value="verified_record">A verified record</option>
                <option value="other">Another number</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Number dialled
              <input
                className={FIELD}
                value={cb.numberDialled ?? ''}
                onChange={setC('numberDialled')}
              />
            </label>
            <label className="flex flex-col gap-1">
              Spoke to
              <input className={FIELD} value={cb.spokeTo ?? ''} onChange={setC('spokeTo')} />
            </label>
            <label className="flex flex-col gap-1">
              Their role
              <input
                className={FIELD}
                value={cb.spokeToRole ?? ''}
                onChange={setC('spokeToRole')}
              />
            </label>
            <fieldset className="col-span-2 m-0 flex gap-4 border-0 p-0">
              <legend className="sr-only">Outcome</legend>
              {[
                ['genuine', 'Genuine'],
                ['not_genuine', 'Not genuine'],
              ].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="callback-outcome"
                    value={v}
                    checked={cb.outcome === v}
                    onChange={setC('outcome')}
                  />
                  {l}
                </label>
              ))}
            </fieldset>
            <div className="col-span-2 flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                disabled={busy || !cb.spokeTo?.trim() || !cb.numberDialled?.trim()}
                onClick={() =>
                  void run(
                    () =>
                      recordCallbackAction({
                        supplierId,
                        accountId: bank.id,
                        numberSource: cb.numberSource as 'registry',
                        numberDialled: cb.numberDialled!.trim(),
                        spokeTo: cb.spokeTo!.trim(),
                        ...(cb.spokeToRole?.trim() ? { spokeToRole: cb.spokeToRole.trim() } : {}),
                        outcome: cb.outcome as 'genuine',
                      }),
                    'Call-back recorded'
                  )
                }
              >
                Save call-back
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-io-warn m-0 mt-4 text-[12.5px]">
            Waiting for Krishan to call the registry number and record it.
          </p>
        )
      ) : null}
      <p className="text-io-ink-3 m-0 mt-4 text-[12px]">
        Any later change to bank details puts payments on hold until it is verified the same way.
      </p>
    </section>
  )
}

export function ApprovalDecision({
  supplierId,
  isOwner,
  allowed,
  conditions,
  blocking,
  status,
}: {
  supplierId: string
  isOwner: boolean
  allowed: { approve: boolean; approve_trial: boolean }
  conditions: string[]
  blocking: string[]
  status: string | null
}) {
  const [choice, setChoice] = useState<'approve' | 'approve_trial' | 'reject'>(
    allowed.approve ? 'approve' : 'approve_trial'
  )
  const [reason, setReason] = useState('')
  const [back, setBack] = useState<string | null>(null)
  const { busy, run } = useRun()
  const LABEL = { approve: 'Approve', approve_trial: 'Approve on trial', reject: 'Reject' } as const
  const can = choice === 'reject' ? !!reason.trim() : allowed[choice]
  return (
    <section
      aria-label="Decision"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
      data-part="decision"
    >
      <h2 className="io-eyebrow m-0 mb-3">Decision</h2>
      <RadioGroup
        name="decision"
        legend="Decision"
        hideLegend
        value={choice}
        onValueChange={(v) => setChoice(v as typeof choice)}
        options={[
          {
            value: 'approve',
            label: 'Approve',
            sub: 'Full approval; all categories on the line card',
          },
          {
            value: 'approve_trial',
            label: 'Approve on trial',
            sub: 'First 3 POs, each up to USD 25,000, with TPI at works. Review after the third delivery',
          },
          {
            value: 'reject',
            label: 'Reject',
            sub: 'Recorded with a reason; can be re-proposed after 6 months',
          },
        ]}
      />
      {choice === 'reject' ? (
        <label className="mt-3 flex flex-col gap-1 text-[12.5px]">
          Reason
          <input className={FIELD} value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
      ) : null}
      {blocking.length || conditions.length ? (
        <p
          className="bg-io-warn-tint text-io-banner-warn-ink rounded-io-ctl m-0 mt-3 px-3.5 py-2.5 text-[12.5px]"
          data-part="blocking-note"
        >
          {[...blocking, ...conditions.map((c) => `Trial approval is allowed; ${c}`)].join('. ')}.
        </p>
      ) : null}
      <div className="mt-4 flex justify-end gap-2">
        {isOwner ? (
          <>
            {back !== null ? (
              <input
                className={`${FIELD} max-w-[260px]`}
                aria-label="What is missing"
                placeholder="What is missing"
                value={back}
                onChange={(e) => setBack(e.target.value)}
              />
            ) : null}
            <Button
              variant="secondary"
              disabled={busy || status !== 'under_review' || (back !== null && !back.trim())}
              onClick={() =>
                back === null
                  ? setBack('')
                  : void run(
                      () => sendBackAction({ supplierId, reason: back.trim() }),
                      'Sent back'
                    ).then((ok) => {
                      if (ok) setBack(null)
                    })
              }
            >
              Send back
            </Button>
            <Button
              variant="primary"
              disabled={busy || !can}
              onClick={() =>
                void run(
                  () =>
                    decideSupplierAction({
                      supplierId,
                      decision: choice,
                      ...(choice === 'reject' ? { reason: reason.trim() } : {}),
                    }),
                  choice === 'reject' ? 'Rejected' : `${LABEL[choice]}d`
                )
              }
            >
              {LABEL[choice]}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            disabled={busy || status === 'under_review'}
            onClick={() =>
              void run(() => submitForReviewAction({ supplierId }), 'Recommended to Krishan')
            }
          >
            {status === 'under_review' ? 'Waiting for Krishan' : 'Recommend for approval'}
          </Button>
        )}
      </div>
    </section>
  )
}
