'use client'

import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { Popover, useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import {
  applyMatchAction,
  searchClientsAction,
} from '../../../app/(console)/enquiries/intake/[batchId]/actions/match'
import { revisionIntentAction } from '../../../app/(console)/enquiries/intake/[batchId]/actions/review'
import type { MatchOption, MatchStep } from '../../../server/intake/match'

/**
 * Board 16 · Step 3 of 3 · Match (S09-T04, `#s16`): the client (matched, Unsure between candidates, or unknown
 * and created inline), where the lines go (open lead · new lead · enquiry, the suggestion first chosen), the
 * summary, and the board-17 revision card when one was detected. One primary whose label follows the option.
 */
const PRIMARY: Record<MatchOption, string> = {
  open_lead: 'Fill lead specs',
  new_lead: 'Create lead',
  enquiry: 'Create enquiry',
}

type Client = { companyId: string; name: string; sentence: string } | { newClient: string } | null

const noop = () => () => undefined

export default function MatchWorkspace({ step }: { step: MatchStep }) {
  const router = useRouter()
  const { toast } = useToast()
  const ready = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
  const [client, setClient] = useState<Client>(
    step.company.kind === 'sure'
      ? {
          companyId: step.company.companyId,
          name: step.company.name,
          sentence: step.company.sentence,
        }
      : null
  )
  const leadDefault = step.fromLeadId ?? step.openLeads[0]?.id ?? null
  const [option, setOption] = useState<MatchOption>(
    step.suggested === 'open_lead' && !leadDefault ? 'new_lead' : step.suggested
  )
  const [leadId, setLeadId] = useState<string | null>(leadDefault)
  const [busy, setBusy] = useState(false)
  const [picking, setPicking] = useState(false)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<
    Array<{ id: string; name: string; primaryDomain: string | null }>
  >([])
  const [newName, setNewName] = useState('')
  const [revision, setRevision] = useState(step.revision)

  const n = step.summary.lines
  const leadsShown = client && 'companyId' in client ? step.openLeads : []

  async function search(v: string) {
    setQ(v)
    if (v.trim().length < 2) {
      setHits([])
      return
    }
    const r = await searchClientsAction({ q: v })
    if (r.success) setHits(r.data)
  }

  async function apply() {
    if (!client) {
      toast({ kind: 'error', title: 'Choose the client first.' })
      return
    }
    setBusy(true)
    try {
      const who =
        'companyId' in client ? { companyId: client.companyId } : { newClient: client.newClient }
      const r = await applyMatchAction(
        option === 'open_lead'
          ? { batchId: step.batchId, option, leadId: leadId!, ...who }
          : { batchId: step.batchId, option, ...who }
      )
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({
        kind: 'success',
        title: `${r.data.label} ${r.data.replayed ? 'already made' : r.data.kind === 'enquiry' ? 'created' : 'updated'}`,
      })
      router.push(r.data.href as Route)
    } finally {
      setBusy(false)
    }
  }

  const radio = (value: MatchOption, title: string, sub: string, disabled = false) => {
    const on = option === value
    return (
      <label
        key={value}
        data-option={value}
        data-state={on ? 'on' : 'off'}
        className={`rounded-io-8 flex cursor-pointer gap-3 p-3.5 ${
          on ? 'border-io-ink border-[1.5px]' : 'border-io-line border'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input
          type="radio"
          name="match-option"
          value={value}
          checked={on}
          disabled={disabled}
          onChange={() => setOption(value)}
          className="io-focus accent-io-ink mt-0.5 h-4 w-4 flex-none"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium">{title}</span>
          <span className="text-io-ink-3 text-[12px]">{sub}</span>
        </span>
      </label>
    )
  }

  const openLead = leadsShown.find((l) => l.id === leadId) ?? leadsShown[0]

  return (
    <div
      data-built="intake-match"
      data-ready={ready ? 'true' : undefined}
      className="flex flex-col"
    >
      <div className="flex flex-col gap-4 px-[26px] py-5">
        {client ? (
          <div className="rounded-io-8 bg-io-accent-tint flex items-center justify-between gap-3 px-3.5 py-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-medium">
                {'companyId' in client ? client.name : client.newClient}
              </span>
              <span className="text-io-accent text-[11.5px]">
                {'companyId' in client
                  ? client.sentence
                  : 'New client · created with the sender as its contact'}
              </span>
            </div>
            <ClientPicker
              open={picking}
              onOpenChange={setPicking}
              q={q}
              onSearch={(v) => void search(v)}
              hits={hits}
              newName={newName}
              setNewName={setNewName}
              onPick={(c) => {
                setClient(c)
                setPicking(false)
              }}
              label="Change"
            />
          </div>
        ) : step.company.kind === 'unsure' ? (
          <div
            role="group"
            aria-label="Which client is this?"
            data-part="client-unsure"
            className="rounded-io-8 border-io-warn-solid bg-io-warn-tint flex flex-col gap-2 border px-3.5 py-3"
          >
            <span className="text-[13px] font-medium">
              <span className="bg-io-navy text-io-paper rounded-io-tag mr-2 px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
                Assistant · Unsure
              </span>
              More than one client fits. Which is it?
            </span>
            <div className="flex flex-wrap gap-2">
              {step.company.candidates.map((c) => (
                <Button
                  key={c.companyId}
                  size="sm"
                  onClick={() =>
                    setClient({
                      companyId: c.companyId,
                      name: c.name,
                      sentence: `Chosen · ${c.why}`,
                    })
                  }
                >
                  {c.name}
                </Button>
              ))}
              <ClientPicker
                open={picking}
                onOpenChange={setPicking}
                q={q}
                onSearch={(v) => void search(v)}
                hits={hits}
                newName={newName}
                setNewName={setNewName}
                onPick={(c) => {
                  setClient(c)
                  setPicking(false)
                }}
                label="Something else"
              />
            </div>
          </div>
        ) : (
          <div
            data-part="client-none"
            className="rounded-io-8 border-io-line flex items-center justify-between gap-3 border px-3.5 py-3"
          >
            <div className="flex flex-col">
              <span className="text-[13px] font-medium">No client matched</span>
              <span className="text-io-ink-3 text-[11.5px]">
                {step.sender
                  ? `The sender ${step.sender.email} is not in the directory.`
                  : 'Choose the client or create one.'}
              </span>
            </div>
            <ClientPicker
              open={picking}
              onOpenChange={setPicking}
              q={q}
              onSearch={(v) => void search(v)}
              hits={hits}
              newName={newName}
              setNewName={setNewName}
              onPick={(c) => {
                setClient(c)
                setPicking(false)
              }}
              label="Choose or create client"
              defaultNew={step.issuer?.name ?? step.sender?.name ?? ''}
            />
          </div>
        )}

        {revision ? (
          <div
            data-part="revision"
            className="rounded-io-8 border-io-line bg-io-paper flex flex-col gap-2 border px-3.5 py-3 text-[12.5px]"
          >
            <span className="text-[13px] font-medium">
              Revision detected · {revision.enquiryRef}
              {revision.clientRef ? ` · ${revision.clientRef}` : ''}
            </span>
            <span className="text-io-ink-2">
              {revision.reason === 'client_ref'
                ? 'Same client reference as an open enquiry.'
                : `${revision.matched} of ${revision.total} part numbers are on an open enquiry.`}{' '}
              Applying it as a revision arrives with S23.
            </span>
            <span className="flex gap-2">
              <Button size="sm" disabled title="Arrives with revisions (S23)">
                Apply as revision
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  const r = await revisionIntentAction({ batchId: step.batchId, intent: 'new' })
                  if (r.success) setRevision(null)
                  else toast({ kind: 'error', title: r.error })
                }}
              >
                Treat as new enquiry
              </Button>
            </span>
          </div>
        ) : null}

        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="sr-only">Where should these lines go?</legend>
          {leadsShown.length
            ? radio(
                'open_lead',
                `Add to open lead · ${openLead!.title}`,
                `${openLead!.stage.charAt(0).toUpperCase()}${openLead!.stage.slice(1)} · ${
                  openLead!.lines
                    ? `${openLead!.lines} line${openLead!.lines === 1 ? '' : 's'} on file`
                    : 'lead has no material list yet'
                }`
              )
            : null}
          {leadsShown.length > 1 && option === 'open_lead' ? (
            <label className="text-io-ink-2 ml-7 flex items-center gap-2 text-[12px]">
              Lead
              <select
                className="rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-8 border px-2 text-[12.5px]"
                value={leadId ?? ''}
                onChange={(e) => setLeadId(e.target.value)}
              >
                {leadsShown.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.ref} · {l.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {radio(
            'new_lead',
            'Create a new lead',
            'Use when this is a new requirement from the client'
          )}
          {radio(
            'enquiry',
            'Go straight to an enquiry',
            step.enquiryEvidence ?? 'Use when the client asked for a quotation now'
          )}
        </fieldset>

        <dl className="border-io-line m-0 grid grid-cols-3 gap-2.5 border-t pt-3.5 text-[12px]">
          <div className="flex flex-col">
            <dt className="text-io-ink-3">Lines</dt>
            <dd className="m-0 text-[15px] font-medium">
              {n}{' '}
              {step.summary.merged ? (
                <span className="text-io-ink-3 text-[11.5px] font-normal">
                  {step.summary.merged} duplicate{step.summary.merged === 1 ? '' : 's'} merged
                </span>
              ) : null}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-io-ink-3">Categories</dt>
            <dd className="m-0 text-[13px]">
              {step.summary.categories
                ? step.summary.categories.map((c) => `${c.name} ${c.count}`).join(' · ')
                : 'Categories after the trade list is set up'}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-io-ink-3">Client reference</dt>
            <dd className="m-0 text-[12.5px]">{step.summary.clientRef ?? '—'}</dd>
          </div>
        </dl>
      </div>
      <div className="border-io-line flex items-center justify-between border-t px-[26px] py-3.5">
        <ButtonLink variant="ghost" href={`/enquiries/intake/${step.batchId}`}>
          Back
        </ButtonLink>
        <Button
          variant="primary"
          disabled={busy || !client || (option === 'open_lead' && !leadId)}
          onClick={() => void apply()}
        >
          {PRIMARY[option]}
        </Button>
      </div>
    </div>
  )
}

function ClientPicker({
  open,
  onOpenChange,
  q,
  onSearch,
  hits,
  newName,
  setNewName,
  onPick,
  label,
  defaultNew = '',
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  q: string
  onSearch: (v: string) => void
  hits: Array<{ id: string; name: string; primaryDomain: string | null }>
  newName: string
  setNewName: (v: string) => void
  onPick: (c: Client) => void
  label: string
  defaultNew?: string
}) {
  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o && !newName && defaultNew) setNewName(defaultNew)
      }}
      trigger={
        <button
          type="button"
          className="text-io-accent io-focus rounded-io-tag flex-none text-[12px]"
        >
          {label}
        </button>
      }
      title="Client"
    >
      <div className="flex w-[300px] flex-col gap-2 text-[12.5px]">
        <input
          aria-label="Search clients"
          className="rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-8 border px-2"
          placeholder="Search by name or domain"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
        />
        {hits.length ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {hits.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className="hover:bg-io-row-hover io-focus rounded-io-tag w-full px-2 py-1.5 text-left"
                  onClick={() =>
                    onPick({ companyId: h.id, name: h.name, sentence: 'Chosen by you' })
                  }
                >
                  {h.name}
                  {h.primaryDomain ? (
                    <span className="text-io-ink-3"> · {h.primaryDomain}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="border-io-line flex flex-col gap-1.5 border-t pt-2">
          <label className="flex flex-col gap-1">
            Create client
            <input
              className="rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-8 border px-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Company name"
            />
          </label>
          <Button
            size="sm"
            disabled={newName.trim().length < 2}
            onClick={() => onPick({ newClient: newName.trim() })}
          >
            Create client
          </Button>
        </div>
      </div>
    </Popover>
  )
}
