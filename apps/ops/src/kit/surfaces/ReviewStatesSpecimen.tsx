'use client'

import type { CorrectionReason } from '@indus/ops-core'
import { ProposalCard, type ProposalActionsInput } from '@indus/ops-ui/assistant'
import { Banner, Tag } from '@indus/ops-ui/status'
import { useState, type ReactNode } from 'react'
import RevertButton from '../../components/history/RevertButton'
import AttentionRow from '../../components/review/AttentionRow'
import ConflictPanel from '../../components/review/ConflictPanel'
import EmailEditor from '../../components/review/EmailEditor'
import ReceiptRow from '../../components/review/ReceiptRow'
import { ReviewEmpty, ReviewSummary, SupersededRow } from '../../components/review/ReviewStates'
import StaleBanner from '../../components/review/StaleBanner'
import Providers from '../../components/shell/Providers'
import ResumeBannerAction from '../../components/shell/ResumeBannerAction'
import { CorrectionFields } from '../../components/undo/CorrectionModal'
import type { ReviewCard } from '../../data/review'
import { DemoProposal } from '../sections/AssistantDemos'
import { ASSISTANT, COMPANIES, REFS } from '../fixtures'

/**
 * Boards 103, 110 and 114 as sheets (S06 parity): each state in the place the board draws it, rendered by
 * the components Review uses, with the kit's neutral fixtures. Nothing here reaches a server: the verbs are
 * stand-ins that wait and succeed.
 */
export type ReviewSheet = '103' | '110' | '114'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const ok = async () => {
  await wait(200)
  return { success: true as const, data: undefined }
}
const VERBS: ProposalActionsInput = {
  approve: async () => ({ success: true, data: {} }),
  reject: ok,
  later: ok,
  undo: ok,
  edit: { href: '#edit' },
}
const ID = '00000000-0000-7000-8000-0000000000a1'
const EMAIL = {
  mailbox: 'purchase@example.test',
  to: ['quotes@examplevalve.example'],
  cc: [],
  subject: `RFQ ${REFS.supplierRfq} — Bearings · 6 lines`,
  body: 'Dear Sales team, please quote for the 6 lines in the attached RFQ, in AED, ex-stock where you can.',
  html: null,
}
/** Just what EmailEditor and StaleBanner read from a Review card. */
const CARD = {
  id: ID,
  ref: 'A-26-11-20-0001',
  version: 1,
  type: ASSISTANT.rfq.type,
  headline: `Send ${REFS.supplierRfq} to 5 suppliers…`,
  age: '12 min',
  email: EMAIL,
  stale: { reason: `${COMPANIES.supplier} replied at 10:02 with a new price list.` },
} as unknown as ReviewCard

/** A card's created time, fixed on first render (the frozen clock in parity runs reads the same age). */
function useAgo(minutes: number): Date {
  const [at] = useState(() => new Date(Date.now() - minutes * 60_000))
  return at
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <h2 className="io-eyebrow m-0">{children}</h2>
}

function Marker({ n, className }: { n: number; className: string }) {
  return (
    <span
      aria-hidden
      className={`bg-io-navy rounded-io-pill absolute grid size-[22px] place-items-center text-[11px] font-semibold text-white ${className}`}
    >
      {n}
    </span>
  )
}

/** Where board 103 puts the eight anatomy markers (literal classes, so Tailwind sees them). */
const MARKER_TOPS = [
  'top-[14px]',
  'top-[46px]',
  'top-[76px]',
  'top-[176px]',
  'top-[340px]',
  'top-[418px]',
  'top-[466px]',
  'top-[560px]',
] as const

const LEGEND: Array<[number, string]> = [
  [1, 'Type chip, record, autonomy badge, author and age'],
  [2, 'Headline: what will happen, in one sentence'],
  [3, 'Why: 2–3 bullets, each with an evidence link that opens the source in a side drawer'],
  [4, 'Preview: email, A4 thumbnail, price table or diff'],
  [5, 'Checks passed and flagged'],
  [6, 'Confidence in words, with a reason below Sure'],
  [7, 'On approve: the consequence'],
  [8, 'Approve · Edit · Reject · Later'],
]

function Board103() {
  const ago12 = useAgo(12)
  return (
    <div className="flex w-[1440px] items-start px-[33px] pt-[30px] pb-10">
      {/* Anatomy */}
      <div className="flex w-[599px] flex-none flex-col gap-3">
        <Eyebrow>Anatomy · default with preview expanded</Eyebrow>
        <div className="relative pl-[34px]">
          {MARKER_TOPS.map((top, i) => (
            <Marker key={top} n={i + 1} className={`left-0 ${top}`} />
          ))}
          <DemoProposal variant="default" />
        </div>
        <ol className="m-0 ml-[34px] grid list-none grid-cols-2 gap-x-6 gap-y-2 p-0 text-[12.5px]">
          {LEGEND.map(([n, t]) => (
            <li key={n} className="flex gap-3">
              <span className="text-io-accent tabular-nums">{n}</span>
              <span className="text-io-ink-2">{t}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="ml-[33px] flex w-[360px] flex-none flex-col gap-[30px]">
        <div className="flex flex-col gap-3">
          <Eyebrow>Editing · inline</Eyebrow>
          <EmailEditor card={CARD} email={EMAIL} cancelHref="#cancel" />
        </div>
        <div className="flex flex-col gap-3">
          <Eyebrow>Approved · receipt with undo</Eyebrow>
          <ReceiptRow
            detailed
            receipt={{
              actionId: ID,
              ref: CARD.ref,
              headline: 'Sent to 5 suppliers',
              state: 'queued',
              detail: `${REFS.supplierRfq} · from purchase@ · approved by OE 09:44`,
              undoRemainingMs: 4 * 60_000 + 58_000,
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Eyebrow>Later</Eyebrow>
          <ul
            role="menu"
            aria-label="Later"
            className="bg-io-card border-io-line rounded-io-card shadow-io-e2 m-0 flex w-[260px] list-none flex-col p-1.5 text-[13px]"
          >
            {['In 1 hour · 10:44', 'Tomorrow 08:30', 'Pick a date and time…'].map((t, i) => (
              <li
                key={t}
                role="menuitem"
                className={`rounded-io-ctl px-3 py-2.5 ${i === 1 ? 'bg-io-fill' : ''}`}
              >
                {t}
              </li>
            ))}
          </ul>
          <p className="text-io-ink-3 m-0 text-[12.5px]">
            The card leaves the queue and comes back at that time. A send that would go stale
            meanwhile is redrafted first.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Eyebrow>Stale</Eyebrow>
          <StaleBanner card={CARD} />
        </div>
      </div>

      <div className="ml-[21px] flex w-[360px] flex-none flex-col gap-[30px]">
        <div className="flex flex-col gap-3">
          <Eyebrow>Edited · learning</Eyebrow>
          <ProposalCard
            id="A-26-11-20-0003"
            type={ASSISTANT.relay.type}
            createdAt={ago12}
            headline={ASSISTANT.relay.headline}
            note="Edited by OE · 09:42 · greeting"
            state="open"
            compact
            readOnly
            actions={VERBS}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Eyebrow>Rejected · reason</Eyebrow>
          <ProposalCard
            id="A-26-11-20-0007"
            type={ASSISTANT.rfq.type}
            createdAt={ago12}
            headline={`Send ${REFS.supplierRfq} to 5 suppliers…`}
            reasonChips={{
              label: 'Why are you rejecting it?',
              options: [
                { value: 'wrong-supplier', label: 'Wrong supplier' },
                { value: 'wrong-price', label: 'Wrong price' },
                { value: 'wrong-client', label: 'Wrong client' },
                { value: 'not-needed', label: 'Not needed' },
                { value: 'other', label: 'Other' },
              ],
              value: 'wrong-supplier',
            }}
            aside={`${COMPANIES.other} is not a bearing house; drop them`}
            state="open"
            compact
            readOnly
            actions={VERBS}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Eyebrow>Failed after approve</Eyebrow>
          <AttentionRow
            isOwner
            item={{
              actionId: ID,
              ref: CARD.ref,
              headline: '2 of 5 emails not sent',
              kind: 'failed',
              reason: 'purchase@ refused the connection at 09:49. The other three were sent.',
              mailbox: 'purchase@example.test',
              verbs: ['retry', 'fix_mailbox'],
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Eyebrow>Markers used on every card</Eyebrow>
          <p className="m-0 flex flex-wrap gap-2">
            <Tag kind="assistant">Assistant</Tag>
            <Tag kind="count">OE</Tag>
            <Tag kind="count">HE</Tag>
            <Tag kind="level">Asks you</Tag>
            <Tag kind="level">Does it, tells you</Tag>
          </p>
        </div>
      </div>
    </div>
  )
}

function Sheet({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="bg-io-card border-io-line rounded-io-card flex flex-col gap-4 border px-[18px] py-5"
    >
      <Eyebrow>{title}</Eyebrow>
      {children}
    </section>
  )
}

const FAMILY_ROWS = [
  {
    family: 'chasers',
    label: 'Supplier chasers',
    count: 12,
    unsure: 0,
    note: 'all Sure',
    batch: true,
  },
  {
    family: 'captured_quotes',
    label: 'Captured quotes to confirm',
    count: 6,
    unsure: 2,
    note: '2 Unsure',
    batch: false,
  },
  {
    family: 'quotations',
    label: 'Quotations',
    count: 3,
    unsure: 0,
    note: 'client prices · one by one',
    batch: false,
  },
  {
    family: 'judgement',
    label: 'Others',
    count: 22,
    unsure: 0,
    note: 'RFQs, relays, judgement',
    batch: false,
  },
] as const

function Board110() {
  const now = useAgo(0)
  return (
    <div className="grid w-[1440px] grid-cols-3 items-start gap-[21px] px-[33px] py-[29px]">
      <Sheet title="All clear">
        <ReviewEmpty bare done={41} next={`a reply on ${REFS.supplierRfq}, due 14:00`} />
      </Sheet>
      <Sheet title="40+ waiting · summary first">
        <ReviewSummary
          bare
          total={43}
          summary={{
            away: 'after 2 days away',
            rows: FAMILY_ROWS.map((r) => ({
              family: r.family as never,
              label: r.label,
              count: r.count,
              unsure: r.unsure,
              note: r.note,
              batch: r.batch
                ? Array.from({ length: r.count }, (_, i) => ({
                    actionId: `${ID.slice(0, -2)}${String(i).padStart(2, '0')}`,
                    version: 0,
                    title: 'Chase',
                    family: r.family as never,
                  }))
                : null,
            })),
          }}
          openHref={() => '#open'}
        />
      </Sheet>
      <Sheet title="Superseded · auto-collapsed">
        <SupersededRow
          headline="Confirm the captured quote: 9 lines, USD, valid 19 Oct."
          supersedes={{
            ref: 'A-26-11-20-0004',
            headline: `Chase ${COMPANIES.supplier} on ${REFS.supplierRfq} · 09:12`,
            reason: `${COMPANIES.supplier} replied`,
            at: '11:40',
            why: [],
          }}
        />
        <ProposalCard
          id="A-26-11-20-0005"
          type="Captured quote"
          record={{ label: REFS.enquiry, href: '#record' }}
          createdAt={now}
          headline="Confirm the captured quote: 9 lines, USD, valid 19 Oct."
          confidence={{ level: 'Sure' }}
          state="open"
          actions={VERBS}
        />
      </Sheet>
      <Sheet title="Changed by the Helper while you were reviewing">
        <ConflictPanel
          reviewHref="#review"
          conflict={{
            actionId: ID,
            ref: REFS.supplierRfq,
            seen: 1,
            version: 2,
            by: 'HE',
            at: '10:22',
            changes: [
              {
                field: 'the recipients',
                added: ['sales@example-bearings.test'],
                removed: ['quotes@examplevalve.example'],
              },
            ],
          }}
        />
      </Sheet>
      <Sheet title="Assistant paused">
        <Banner
          tone="warn"
          icon="warn"
          title="Paused by you at 08:50."
          actions={<ResumeBannerAction />}
        >
          Cards can still be approved; sends queue until you resume.
        </Banner>
        <AttentionRow
          isOwner
          item={{
            actionId: ID,
            ref: CARD.ref,
            headline: `Chase ${COMPANIES.supplier} on ${REFS.supplierRfq}`,
            kind: 'paused',
            reason: 'Approved · queued · sends on resume',
            mailbox: 'purchase@example.test',
            verbs: ['cancel'],
          }}
        />
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          Queued sends are re-checked on resume; anything gone stale comes back as a redraft.
        </p>
      </Sheet>
      <Sheet title="Send failed after approve">
        <AttentionRow
          isOwner
          item={{
            actionId: ID,
            ref: CARD.ref,
            headline: `Chase ${COMPANIES.other} on ${REFS.supplierRfq}`,
            kind: 'failed',
            reason: 'purchase@ is disconnected (password changed 09:30).',
            mailbox: 'purchase@example.test',
            verbs: ['retry', 'fix_mailbox', 'copy'],
          }}
        />
      </Sheet>
    </div>
  )
}

function Numbered({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="bg-io-card border-io-line rounded-io-card flex flex-col gap-4 border px-[18px] py-5"
    >
      <h2 className="io-eyebrow m-0 flex items-center gap-2.5">
        <span className="bg-io-navy rounded-io-pill grid size-[22px] place-items-center text-[11px] font-semibold tracking-normal text-white">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

const REVERTS: Array<{ title: string; was: string; now: string; by: string }> = [
  {
    title: 'Line mapping · supplier quote item 3',
    was: 'client line 4',
    now: 'client line 3',
    by: 'Assistant, 09:52',
  },
  {
    title: `Selected supplier · ${REFS.enquiry} line 1`,
    was: COMPANIES.other,
    now: COMPANIES.supplier,
    by: 'Assistant, 22 Nov',
  },
  {
    title: 'Classification · supplier email 07:58',
    was: 'Client enquiry',
    now: 'Supplier price list',
    by: 'Assistant, 07:59',
  },
]

function Board114() {
  const now = useAgo(0)
  const [reason, setReason] = useState<CorrectionReason>('wrong_price')
  const [note, setNote] = useState('')
  return (
    <div className="grid w-[1440px] grid-cols-2 items-start gap-[21px] px-[33px] py-[29px]">
      <Numbered n={1} title="Within 5 minutes · undo">
        <ReceiptRow
          detailed
          receipt={{
            actionId: ID,
            ref: REFS.quotation,
            headline: `Sent ${REFS.quotation} to ${COMPANIES.client}`,
            state: 'queued',
            detail: 'queued in sales@ · leaves at 10:19',
            undoRemainingMs: 4 * 60_000 + 12_000,
          }}
        />
        <p className="bg-io-paper border-io-line rounded-io-card m-0 flex items-center gap-2 border px-4 py-3 text-[13px]">
          <span aria-hidden>↺</span>
          <span className="font-medium">Undone at 10:15</span>
          <span className="text-io-ink-3">· nothing was sent · back in Review</span>
        </p>
      </Numbered>
      <Numbered n={2} title="After the window · send a correction">
        <CorrectionFields
          target={{ ref: REFS.quotation, at: '10:19' }}
          reason={reason}
          onReason={setReason}
          note={note}
          onNote={setNote}
        />
      </Numbered>
      <Numbered n={3} title="Correction card · in Review">
        <ProposalCard
          id="A-26-11-20-0006"
          type="Correction"
          record={{ label: REFS.quotation, href: '#record' }}
          createdAt={now}
          headline={`RE: corrected quotation ${REFS.quotationRevised}`}
          preview={{
            title: 'Preview · email',
            lines: [
              { key: 'to', kind: 'muted', text: 'To buyer@sample-client.example' },
              {
                key: 'subject',
                kind: 'bold',
                text: `Corrected quotation ${REFS.quotationRevised}`,
              },
              {
                key: 'body',
                text: `Please disregard our quotation ${REFS.quotation} sent this morning. The unit price on line 2 was shown incorrectly. The corrected quotation is attached; all other lines are unchanged.`,
              },
            ],
          }}
          approveLabel="Approve and send"
          state="open"
          actions={VERBS}
        />
      </Numbered>
      <Numbered n={4} title="Internal changes · always revertible">
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {REVERTS.map((r) => (
            <li
              key={r.title}
              className="border-io-line rounded-io-card flex items-center gap-3 border px-3.5 py-3 text-[13px]"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span>{r.title}</span>
                <span className="text-io-ink-3 text-[12.5px]">
                  <del className="rounded-io-3 bg-io-bad-tint text-io-bad px-[3px]">{r.was}</del>
                  {' → '}
                  <ins className="rounded-io-3 bg-io-ok-tint text-io-ok px-[3px] no-underline">
                    {r.now}
                  </ins>
                  {` · ${r.by}`}
                </span>
              </span>
              <RevertButton eventId={ID} field={r.title} />
            </li>
          ))}
        </ul>
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          Reverting writes a new log entry (“Reverted by OE”) and keeps the Assistant’s version in
          History. Nothing is deleted.
        </p>
      </Numbered>
    </div>
  )
}

export default function ReviewStatesSpecimen({ board }: { board: ReviewSheet }) {
  return (
    <Providers>
      <div data-sheet={board} className="bg-io-ground min-h-[940px] w-[1440px]">
        {board === '103' ? <Board103 /> : board === '110' ? <Board110 /> : <Board114 />}
      </div>
    </Providers>
  )
}
