'use client'

import { pathCards, onChooseText, QUALIFY_PATHS, type QualifyPath } from '@indus/ops-core'
import { ProposalCard, type ProposalActionsInput } from '@indus/ops-ui/assistant'
import { Stat } from '@indus/ops-ui/card'
import { useState, type ReactNode } from 'react'
import LevelSwitch from '../../components/autopilot/LevelSwitch'
import Providers from '../../components/shell/Providers'
import PathChooser from '../../components/enquiry/PathChooser'
import { ReadingBody } from '../../components/enquiry/QualificationCard'
import SpamFiled from '../../components/enquiry/SpamFiled'

/**
 * Board 171b · P15 states (S09-T06/T07): the state sheet drawn from the real parts with neutral fixtures, for the
 * P09 parity spec. States 1–5, 11 and 12 are S09's; 6–10 are boards 169 and 170 (no-source, to follow), which
 * arrive with S16 and are drawn here as that note. No session, no database; the verbs do nothing.
 */
const ok = async () => ({ success: true as const, data: undefined })
const VERBS: ProposalActionsInput = {
  approve: async () => ({ success: true, data: {} }),
  reject: ok,
  later: ok,
}

function Frame({ title, board, children }: { title: string; board: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-4 py-4"
    >
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="io-eyebrow m-0">{title}</h2>
        <span className="text-io-ink-3 text-[11.5px]">{board}</span>
      </header>
      {children}
    </section>
  )
}

function Later({ text }: { text: string }) {
  return <p className="text-io-ink-3 m-0 text-[12.5px] leading-[1.5]">{text}</p>
}

const facts = {
  lineNos: [1, 2, 3, 4],
  regretLineNos: [],
  askLineNos: [],
  proprietaryNos: [],
  outsideNos: [],
  deadline: null,
  suggested: 'ask_client_first' as const,
  pathConfidence: 'unsure' as const,
  realBuyerQuestion: true,
}
const onChoose = Object.fromEntries(
  QUALIFY_PATHS.map((p) => [p, onChooseText(p, facts)])
) as Record<QualifyPath, string>

export default function P15StatesSpecimen() {
  const [at] = useState(() => new Date(Date.now() - 60_000))
  return (
    <Providers>
      <main className="bg-io-paper min-h-screen w-[1440px] px-8 py-7">
        <h1 className="sr-only">P15 states</h1>
        <p className="text-io-ink-2 m-0 mb-5 text-[13px]">
          Edge cases for boards 167–171. Uncertainty follows board 221; failed sends follow board
          222.
        </p>
        <div className="grid grid-cols-4 items-start gap-4">
          <Frame title="Qualification · reading" board="167">
            <ReadingBody />
          </Frame>
          <Frame title="Qualification · not enough to judge" board="167 · 221">
            <PathChooser
              bare
              enquiryId="00000000-0000-7000-8000-000000000171"
              enquiryRef="ENQ-2026-0437"
              version={0}
              cards={pathCards(facts)}
              onChoose={onChoose}
              suggested="ask_client_first"
              lineNos={facts.lineNos}
              defaults={{ regret: [], ask: [] }}
              realBuyer={{
                text: 'Domain registered 3 weeks ago, no website, signature names a company not found in any directory.',
              }}
              failed={false}
            />
          </Frame>
          <Frame title="Qualification · phishing" board="167 · 96">
            <SpamFiled
              bare
              enquiryId="00000000-0000-7000-8000-000000000172"
              text="Filed as Not business. No reply, no record."
              reason="“RFQ documents · view to quote” links to a sign-in page on docs-share.example. Never opened."
            />
          </Frame>
          <Frame title="Regret · sent" board="168">
            <div className="bg-io-navy rounded-io-ctl flex items-center justify-between px-3.5 py-2.5 text-[13px] text-white">
              <span>Regret sent to Sample Cement Co</span>
              <span className="font-medium tabular-nums">Undo 4:58</span>
            </div>
            <p className="text-io-ink m-0 text-[13px] font-medium">
              ENQ-2026-0427 → Regretted · Not our range
            </p>
            <p className="text-io-ink-3 m-0 text-[12.5px]">
              Approved by KB 10:42 · open RFQ withdrawn
            </p>
          </Frame>
          <Frame title="Regret · client replies" board="168">
            <p className="text-io-ink m-0 text-[13px] leading-[1.5]">
              Sample Buyer, 2 Oct: “Can you quote the seals and bearings for the same gearbox
              instead?”
            </p>
            <ProposalCard
              id="A-26-10-02-0004"
              type="New enquiry"
              record={{ label: 'from ENQ-2026-0427', href: '#' }}
              level={{ label: 'Asks you' }}
              createdAt={at}
              headline="Open ENQ-2026-0446, linked to the regretted 0427."
              why={[{ text: 'Reply names new lines in our range.' }]}
              confidence={{ level: 'Likely' }}
              onApproveText={{
                text: '0427 stays Regretted; the new enquiry gets its own quick read.',
              }}
              state="open"
              actions={VERBS}
            />
          </Frame>
          <Frame title="Every line has no source" board="169">
            <Later text="Board 169 (a line nobody can source, four ways out) arrives with S16." />
          </Frame>
          <Frame title="Late price after a line regret" board="169 · 170">
            <Later text="Board 170 (a late supplier price after a line regret) arrives with S16." />
          </Frame>
          <Frame title="To follow · empty" board="170">
            <Later text="Lines left out of a quotation and their clock arrive with S16 (board 170)." />
          </Frame>
          <Frame title="Client PO on a partial quotation" board="170 · 69">
            <Later text="The PO check on a partial quotation arrives with S16 and S23 (boards 69, 170)." />
          </Frame>
          <Frame title="To follow · give-up reached" board="170">
            <Later text="The to-follow give-up clock arrives with S16 (board 170)." />
          </Frame>
          <Frame title="Reports · Regretted" board="168 · 54">
            <p className="text-io-ink m-0 text-[13px] font-medium">Regretted this quarter · 9</p>
            <Stat
              rows={[
                { label: 'Not our range', value: '4' },
                { label: 'No source found', value: '3' },
                { label: 'Deadline too short', value: '1' },
                { label: 'Client unresponsive', value: '1' },
              ]}
            />
            <Later text="Win/loss gains Regretted as a third outcome, whole and line-level. The reason is recorded on every regret from S09; the report is board 54." />
          </Frame>
          <Frame title="Regret · Autopilot" board="168 · 98">
            <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.5]">
              “Regret to client” levels: Off · Suggest · Draft and ask (default).
            </p>
            <LevelSwitch
              label="Regret to client"
              value="draft_and_ask"
              allowed={['off', 'suggest', 'draft_and_ask']}
              locked={null}
              className="w-full"
            />
            <Later text="Do and tell is not offered: a regret ends the client conversation, so the Owner always sees it." />
          </Frame>
        </div>
      </main>
    </Providers>
  )
}
