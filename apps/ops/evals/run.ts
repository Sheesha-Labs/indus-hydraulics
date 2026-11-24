/**
 * The Assistant eval runner (S05-T04, ADR-25, CLAUDE.md §9.11 and §13.6). A prompt or model change runs this
 * first; the scores and the cost go in the PR.
 *
 *   bun run --filter @indus/ops eval -- --suite classify --set synthetic --model claude-haiku-5-5
 *   bun run --filter @indus/ops eval -- --suite link --set golden
 *
 * It runs the real action code (propose + verify of classify_mail and link_mail) over fixtures, with an
 * in-memory ledger (no database writes) and the Messages API through OPS_ANTHROPIC_API_KEY (use the low-limit
 * dev key). Without a key, only the cases that need no model run, and the rest are reported as skipped.
 *
 * The golden set is private (real mail, labelled by Ayush) and lives only in the ops-evals bucket; golden.ts
 * copies it to $TMPDIR/ops-evals for the run. It is never written into the repository.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  anthropicClient,
  anthropicTransport,
  structuredCall,
  type AiCallRecord,
  type AiLedger,
  type Price,
} from '@indus/ops-ai'
import { runDetectors, type LinkCandidate, type SenderRole } from '@indus/ops-core'
import classifyDef from '../src/server/assistant/actions/classify-mail'
import linkDef from '../src/server/assistant/actions/link-mail'
import type { ActionAi } from '../src/server/assistant/types'
import { headersFromFlags, NEW_TEXT_MAX, type MailInput } from '../src/server/mail/facts'
import { loadGolden } from './golden'
import { scoreClassify, type ClassifyCase } from './scorers/classify'
import { scoreLink, type LinkCase } from './scorers/link'

type Suite = 'classify' | 'link'
type Set = 'synthetic' | 'golden'

export interface ClassifyFixture extends ClassifyCase {
  mailbox: 'client' | 'supplier'
  senderRole: SenderRole
  from: string
  fromName?: string
  subject: string
  body: string
  flags?: Record<string, unknown>
  labels?: string[]
  previousClass?: string | null
}

export interface LinkFixture extends LinkCase {
  subject: string
  body: string
  senderRole: SenderRole
  knownCompanyId: string | null
  candidates: LinkCandidate[]
}

/** The seeded 2026-11-01 prices (ai_runtime migration), for the in-memory ledger. */
const PRICES: Record<string, Price> = {
  'claude-haiku-5-5': {
    inputPerM: '0.1000',
    outputPerM: '0.5000',
    cacheReadPerM: '0.0100',
    cacheWrite5mPerM: '0.1250',
    cacheWrite1hPerM: '0.2000',
    webSearchPerK: '10.0000',
  },
  'claude-sonnet-5-5': {
    inputPerM: '2.0000',
    outputPerM: '10.0000',
    cacheReadPerM: '0.1000',
    cacheWrite5mPerM: '2.5000',
    cacheWrite1hPerM: '4.0000',
    webSearchPerK: '10.0000',
  },
  'claude-opus-5-5': {
    inputPerM: '4.0000',
    outputPerM: '20.0000',
    cacheReadPerM: '0.2000',
    cacheWrite5mPerM: '5.0000',
    cacheWrite1hPerM: '8.0000',
    webSearchPerK: '10.0000',
  },
}

class MemoryLedger implements AiLedger {
  calls: AiCallRecord[] = []
  async prices(model: string): Promise<Price> {
    const p = PRICES[model]
    if (!p) throw new Error(`no price for ${model}`)
    return p
  }
  async reserve(): Promise<string> {
    return `mem-${this.calls.length}`
  }
  async settle(): Promise<void> {}
  async record(call: AiCallRecord): Promise<undefined> {
    this.calls.push(call)
    return undefined
  }
  totalUsd(): string {
    const micro = this.calls.reduce((n, c) => {
      const [w = '0', f = ''] = c.costUsd.split('.')
      return n + BigInt(w) * 1_000_000n + BigInt(f.padEnd(6, '0').slice(0, 6))
    }, 0n)
    return `${micro / 1_000_000n}.${(micro % 1_000_000n).toString().padStart(6, '0')}`
  }
}

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : fallback
}

function loadSynthetic<T>(suite: Suite): T[] {
  const dir = join(import.meta.dir, 'fixtures', 'synthetic', suite)
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as T[])
}

export function mailInputOf(f: ClassifyFixture): MailInput {
  const headers = headersFromFlags(f.flags ?? null)
  const domain = f.from.split('@')[1]?.toLowerCase() ?? null
  const facts = runDetectors(
    {
      fromAddress: f.from,
      fromName: f.fromName ?? null,
      subject: f.subject,
      bodyText: f.body,
      headers,
      gmailLabels: f.labels ?? ['INBOX'],
      auth: { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
    },
    { knownDomains: [], firstSeenDomainDays: 365 }
  )
  return {
    messageId: f.id,
    mailboxId: 'eval',
    mailboxRole: f.mailbox,
    threadId: 'eval',
    origin: 'live',
    rfcMessageId: null,
    inReplyTo: null,
    references: [],
    fromAddress: f.from,
    fromName: f.fromName ?? null,
    senderDomain: domain,
    to: [f.mailbox === 'client' ? 'sales@example.test' : 'purchase@example.test'],
    cc: [],
    subject: f.subject,
    newText: f.body.slice(0, NEW_TEXT_MAX),
    bodyText: f.body,
    bodyTextHash: null,
    attachments: [],
    previousClass: f.previousClass ?? null,
    sender: { companyId: null, companyName: null, role: f.senderRole },
    facts,
    gmailLabelIds: f.labels ?? ['INBOX'],
  }
}

function makeAi(ledger: MemoryLedger, model: string | undefined): ActionAi | null {
  const key = process.env.OPS_ANTHROPIC_API_KEY
  if (!key) return null
  const transport = anthropicTransport(anthropicClient(key))
  return {
    call: (args) =>
      structuredCall({
        ...args,
        ...(model ? { model } : {}),
        ledger,
        transport,
        actionId: null,
        enquiryId: null,
      }),
  }
}

/** A stand-in for the model when there is no key: any call marks the case skipped. */
class NoModel extends Error {}
const noAi: ActionAi = {
  call: async () => {
    throw new NoModel('no model')
  },
}

async function runClassify(cases: ClassifyFixture[], ai: ActionAi | null) {
  const preds: Array<{ id: string; predicted: string | null }> = []
  const skipped: string[] = []
  for (const c of cases) {
    const input = mailInputOf(c)
    try {
      const p = await classifyDef.propose(input, ai ?? noAi)
      if (!p.ok) {
        preds.push({ id: c.id, predicted: null })
        continue
      }
      const v = await classifyDef.verify(p.out, input)
      preds.push({ id: c.id, predicted: v.out.class })
    } catch (e) {
      if (e instanceof NoModel) skipped.push(c.id)
      else throw e
    }
  }
  const scored = cases.filter((c) => !skipped.includes(c.id))
  return { score: scoreClassify(scored, preds), skipped }
}

async function runLink(cases: LinkFixture[], ai: ActionAi | null) {
  const preds: Array<{ id: string; predicted: string | null }> = []
  const skipped: string[] = []
  for (const c of cases) {
    const base = mailInputOf({
      id: c.id,
      expect: '',
      mailbox: 'client',
      senderRole: c.senderRole,
      from: 'someone@example.test',
      subject: c.subject,
      body: c.body,
    })
    const input = {
      ...base,
      sender: { ...base.sender, companyId: c.knownCompanyId },
      candidates: c.candidates,
    }
    try {
      const p = await linkDef.propose(input, ai ?? noAi)
      if (!p.ok) {
        preds.push({ id: c.id, predicted: null })
        continue
      }
      const v = await linkDef.verify(p.out, input)
      preds.push({
        id: c.id,
        predicted: v.out.kind === 'link' ? (v.out.candidate?.key ?? null) : null,
      })
    } catch (e) {
      if (e instanceof NoModel) skipped.push(c.id)
      else throw e
    }
  }
  const scored = cases.filter((c) => !skipped.includes(c.id))
  return { score: scoreLink(scored, preds), skipped }
}

async function main(): Promise<void> {
  const suite = (arg('suite', 'classify') as Suite) ?? 'classify'
  const set = (arg('set', 'synthetic') as Set) ?? 'synthetic'
  const model = arg('model')
  const ledger = new MemoryLedger()
  const ai = makeAi(ledger, model)
  const cases =
    set === 'golden'
      ? await loadGolden<ClassifyFixture & LinkFixture>(suite)
      : loadSynthetic<ClassifyFixture & LinkFixture>(suite)

  console.log(
    `suite ${suite} · set ${set} · ${cases.length} cases · model ${model ?? 'route default'}${ai ? '' : ' · NO KEY: model cases skipped'}`
  )
  const { score, skipped } =
    suite === 'classify' ? await runClassify(cases, ai) : await runLink(cases, ai)
  console.log(JSON.stringify({ ...score, skipped: skipped.length }, null, 2))
  console.log(
    `calls ${ledger.calls.length} · cost USD ${ledger.totalUsd()} · prompt ${suite === 'classify' ? 'classify-mail@1' : 'link-mail@1'}`
  )
  if (!score.passes) process.exitCode = 1
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(2)
  })
}
