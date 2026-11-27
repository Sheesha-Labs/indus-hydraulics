'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  priceListSlotAction,
  recordPriceListAction,
  saveLineCardAction,
  saveTermsAction,
} from '../../app/(console)/suppliers/new/actions/line-card'
import type { LineCardData } from '../../data/supplier-wizard'
import { FIELD } from './DirectoryEditors'
import { putFile } from './wizard/DocumentsStep'

/**
 * Board 52's line card and commercial terms (S10-T06), the same editor in the wizard and on the profile's Line card
 * tab: categories carried (tick, spec note, brand, authorised with its locator evidence, the documents that cover
 * it; Trial while the supplier is on trial; "not carried" when unticked), then the terms that pre-fill every RFQ and
 * PO, and the price list. Each save of the line card is a new version.
 */
type Row = {
  tradeId: string
  name: string
  carried: boolean
  brand: string
  specNote: string
  authorised: boolean
  evidenceUrl: string
  covered: string[]
  status: string | null
  suspendedReason: string | null
  open: boolean
}

export default function LineCardEditor({
  supplierId,
  data,
}: {
  supplierId: string
  data: LineCardData
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const initial: Row[] = data.cards
    .filter((c) => c.tradeId)
    .map((c) => ({
      tradeId: c.tradeId!,
      name: data.tradeName[c.tradeId!] ?? '—',
      carried: c.status !== 'not_carried',
      brand: c.brand ?? '',
      specNote: c.specNote ?? '',
      authorised: c.authorised,
      evidenceUrl: c.evidenceUrl ?? '',
      covered: c.coveredByDocumentIds,
      status: c.status,
      suspendedReason: c.suspendedReason,
      open: false,
    }))
  const [rows, setRows] = useState<Row[]>(initial)
  const [adding, setAdding] = useState('')
  const [t, setT] = useState(data.terms)
  const options = useMemo(
    () =>
      data.groups.flatMap((g) => [
        { id: g.id, name: g.name, group: true },
        ...g.children.map((c) => ({ id: c.id, name: `${g.name} · ${c.name}`, group: false })),
      ]),
    [data.groups]
  )
  const trial = data.tier === 'trial' || data.onboarding === 'approved_trial'
  const carried = rows.filter((r) => r.carried).length
  const patch = (i: number, p: Partial<Row>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...p } : r)))

  async function run<T>(
    fn: () => Promise<{ success: true; data: T } | { success: false; error: string }>,
    ok: string
  ) {
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

  return (
    <div className="flex flex-col gap-5" data-part="line-card-editor">
      <section aria-label="Categories carried">
        <h2 className="io-eyebrow m-0 mb-3">Categories carried</h2>
        <div className="bg-io-card border-io-line rounded-io-card overflow-hidden border">
          {rows.length ? (
            <ul className="m-0 list-none p-0">
              {rows.map((r, i) => (
                <li
                  key={`${r.tradeId}-${i}`}
                  className="border-io-line border-b px-4 py-3 last:border-b-0"
                  data-trade={r.name}
                >
                  <div className="grid grid-cols-[24px_minmax(0,1fr)_minmax(0,1.6fr)_96px_28px] items-center gap-3 text-[13px]">
                    <input
                      type="checkbox"
                      className="io-focus size-4"
                      aria-label={`${r.name} carried`}
                      checked={r.carried}
                      onChange={(e) => patch(i, { carried: e.target.checked })}
                    />
                    <span className={r.carried ? 'font-medium' : 'text-io-ink-3'}>{r.name}</span>
                    <input
                      className={FIELD}
                      aria-label={`${r.name} spec note`}
                      placeholder="Standards, sizes, notes"
                      value={r.specNote}
                      onChange={(e) => patch(i, { specNote: e.target.value })}
                    />
                    <span className="flex items-center gap-1.5 justify-self-end">
                      {r.status === 'suspended' ? (
                        <Chip tone="bad" label="Suspended" />
                      ) : r.carried ? (
                        (r.status ?? (trial ? 'trial' : 'proposed')) === 'trial' ? (
                          <Chip tone="warn" label="Trial" />
                        ) : (r.status ?? 'proposed') === 'proposed' ? (
                          <Chip tone="n" label="Proposed" />
                        ) : (
                          <Chip tone="ok" label="Active" />
                        )
                      ) : (
                        <span className="text-io-ink-3 text-[12px]">not carried</span>
                      )}
                    </span>
                    <button
                      type="button"
                      className="io-focus rounded-io-tag text-io-ink-3 hover:text-io-ink text-[14px]"
                      aria-expanded={r.open}
                      aria-label={`${r.name} details`}
                      onClick={() => patch(i, { open: !r.open })}
                    >
                      {r.open ? '–' : '+'}
                    </button>
                  </div>
                  {r.carried && r.open ? (
                    <div className="mt-2 grid grid-cols-[24px_150px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 text-[12px]">
                      <span />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          aria-label={`${r.name} authorised`}
                          checked={r.authorised}
                          onChange={(e) => patch(i, { authorised: e.target.checked })}
                        />
                        Authorised
                      </label>
                      <input
                        className={FIELD}
                        aria-label={`${r.name} brand`}
                        placeholder="Brand (optional)"
                        value={r.brand}
                        onChange={(e) => patch(i, { brand: e.target.value })}
                      />
                      <input
                        className={FIELD}
                        aria-label={`${r.name} evidence link`}
                        placeholder="Locator or evidence link"
                        value={r.evidenceUrl}
                        onChange={(e) => patch(i, { evidenceUrl: e.target.value })}
                      />
                      {data.documents.length ? (
                        <>
                          <span />
                          <label className="col-span-3 flex items-center gap-2">
                            Covered by
                            <select
                              className={`${FIELD} max-w-[280px]`}
                              aria-label={`${r.name} covered by`}
                              value={r.covered[0] ?? ''}
                              onChange={(e) =>
                                patch(i, { covered: e.target.value ? [e.target.value] : [] })
                              }
                            >
                              <option value="">No certificate</option>
                              {data.documents.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.title}
                                </option>
                              ))}
                            </select>
                          </label>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                  {r.suspendedReason ? (
                    <p className="text-io-bad m-0 mt-1.5 pl-9 text-[12px]">{r.suspendedReason}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-io-ink-3 m-0 px-4 py-4 text-[12.5px]">
              No categories yet: add the ones the supplier carries.
            </p>
          )}
          <div className="border-io-line bg-io-paper flex items-center gap-2 border-t px-4 py-2.5">
            <select
              className={`${FIELD} max-w-[340px]`}
              aria-label="Add a category"
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
            >
              <option value="">Add a category…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id} disabled={rows.some((r) => r.tradeId === o.id)}>
                  {o.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="ghost"
              disabled={!adding}
              onClick={() => {
                const o = options.find((x) => x.id === adding)!
                setRows([
                  ...rows,
                  {
                    tradeId: o.id,
                    name: o.name.split(' · ').pop()!,
                    carried: true,
                    brand: '',
                    specNote: '',
                    authorised: false,
                    evidenceUrl: '',
                    covered: [],
                    status: null,
                    suspendedReason: null,
                    open: false,
                  },
                ])
                setAdding('')
              }}
            >
              Add
            </Button>
            <span className="text-io-ink-3 ml-auto text-[12px]">
              {carried} categor{carried === 1 ? 'y' : 'ies'} · the supplier appears for lines in
              these categories{trial ? ', marked “Trial”' : ''}
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            disabled={busy || !rows.length}
            onClick={() =>
              void run(
                () =>
                  saveLineCardAction({
                    supplierId,
                    entries: rows.map((r) => ({
                      tradeId: r.tradeId,
                      carried: r.carried,
                      authorised: r.authorised,
                      ...(r.brand.trim() ? { brand: r.brand.trim() } : {}),
                      ...(r.specNote.trim() ? { specNote: r.specNote.trim() } : {}),
                      ...(/^https?:\/\//.test(r.evidenceUrl.trim())
                        ? { evidenceUrl: r.evidenceUrl.trim() }
                        : {}),
                      coveredByDocumentIds: r.covered,
                    })),
                  }),
                'Line card saved'
              )
            }
          >
            Save line card
          </Button>
        </div>
      </section>

      <section
        aria-label="Commercial terms"
        className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
      >
        <h2 className="io-eyebrow m-0 mb-3">Commercial terms</h2>
        <div className="grid grid-cols-3 gap-3 text-[12.5px]">
          <label className="flex flex-col gap-1">
            Default Incoterm
            <span className="flex gap-2">
              <select
                className={`${FIELD} w-24`}
                aria-label="Incoterm"
                value={t.usualIncoterm}
                onChange={(e) => setT({ ...t, usualIncoterm: e.target.value })}
              >
                <option value="">—</option>
                {['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DDP'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <input
                className={FIELD}
                aria-label="Incoterm place"
                placeholder="Place"
                value={t.usualIncotermPlace}
                onChange={(e) => setT({ ...t, usualIncotermPlace: e.target.value })}
              />
            </span>
          </label>
          <label className="flex flex-col gap-1">
            Currency
            <input
              className={FIELD}
              maxLength={3}
              value={t.quotesCurrency}
              onChange={(e) => setT({ ...t, quotesCurrency: e.target.value.toUpperCase() })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Payment
            <input
              className={FIELD}
              placeholder="30% advance, 70% before shipment"
              value={t.defaultPaymentTerms}
              onChange={(e) => setT({ ...t, defaultPaymentTerms: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Quote validity (days)
            <input
              className={FIELD}
              inputMode="numeric"
              value={t.validityDays}
              onChange={(e) => setT({ ...t, validityDays: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Standard lead time
            <input
              className={FIELD}
              placeholder="4–6 weeks"
              value={t.leadTimeText}
              onChange={(e) => setT({ ...t, leadTimeText: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            MOQ
            <input
              className={FIELD}
              value={t.moqText}
              onChange={(e) => setT({ ...t, moqText: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Documents with each PO
            <input
              className={FIELD}
              placeholder="EN 10204 3.1, CoC, CoO"
              value={t.documentsWithPo}
              onChange={(e) => setT({ ...t, documentsWithPo: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Reply time we expect (days)
            <input
              className={FIELD}
              inputMode="numeric"
              value={t.expectedReplyDays}
              onChange={(e) => setT({ ...t, expectedReplyDays: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Price list {t.priceList ? '(uploaded)' : ''}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="io-focus text-[12px]"
              onChange={(e) =>
                void (async () => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBusy(true)
                  const slot = await priceListSlotAction({
                    supplierId,
                    name: file.name,
                    size: file.size,
                  })
                  if (!slot.success || !(await putFile(slot.data.uploadUrl, file))) {
                    setBusy(false)
                    toast({
                      kind: 'error',
                      title: slot.success ? 'Upload failed. Try again.' : slot.error,
                    })
                    return
                  }
                  setBusy(false)
                  await run(
                    () =>
                      recordPriceListAction({
                        supplierId,
                        key: slot.data.key,
                        filename: file.name,
                      }),
                    'Price list uploaded'
                  )
                })()
              }
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              const n = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : undefined)
              const validity = n(t.validityDays)
              const reply = n(t.expectedReplyDays)
              void run(
                () =>
                  saveTermsAction({
                    supplierId,
                    terms: {
                      ...(t.usualIncoterm ? { usualIncoterm: t.usualIncoterm as 'FCA' } : {}),
                      ...(t.usualIncotermPlace.trim()
                        ? { usualIncotermPlace: t.usualIncotermPlace.trim() }
                        : {}),
                      ...(/^[A-Z]{3}$/.test(t.quotesCurrency)
                        ? { quotesCurrency: t.quotesCurrency }
                        : {}),
                      ...(t.defaultPaymentTerms.trim()
                        ? { defaultPaymentTerms: t.defaultPaymentTerms.trim() }
                        : {}),
                      ...(validity ? { validityDays: validity } : {}),
                      ...(t.leadTimeText.trim() ? { leadTimeText: t.leadTimeText.trim() } : {}),
                      ...(t.moqText.trim() ? { moqText: t.moqText.trim() } : {}),
                      documentsWithPo: t.documentsWithPo
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                      ...(reply ? { expectedReplyDays: reply } : {}),
                    },
                  }),
                'Terms saved'
              )
            }}
          >
            Save terms
          </Button>
        </div>
      </section>
    </div>
  )
}
