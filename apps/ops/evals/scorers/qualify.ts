import type { QualifyInput, QualifyLine, QualifyPath } from '@indus/ops-core'
import type { QualifyGathered } from '../../src/server/enquiry/qualify'

/**
 * Quick-read scorer (S09-T06, qualify_enquiry@1). Each synthetic case is a compact enquiry: the sender facts and
 * line groups, expanded here into the same QualifyGathered the action reads. A case passes when code's final
 * legitimacy equals the expected one and the suggested path is one of the accepted paths. Bars: accuracy ≥ 90 %
 * and every spam case read as spam (a phishing email must never be suggested for quoting).
 */
export interface QualifyCase {
  id: string
  note: string
  sender: Partial<QualifyInput['sender']>
  links?: QualifyInput['links']
  history?: Partial<QualifyInput['history']>
  /** Groups of lines: [trade or null, count, sourced, proprietary, description]. */
  groups: Array<[string | null, number, boolean, boolean, string]>
  value?: QualifyInput['value']
  workingDaysLeft?: number | null
  expect: { legitimacy: 'legitimate' | 'suspicious' | 'spam'; paths: QualifyPath[] }
}

export function gatheredOf(c: QualifyCase): QualifyGathered {
  const lines: QualifyLine[] = []
  const summaries: QualifyGathered['lineSummaries'] = []
  for (const [trade, n, sourced, proprietary, description] of c.groups)
    for (let i = 0; i < n; i++) {
      const no = lines.length + 1
      lines.push({
        no,
        trade,
        tradeSourced: sourced,
        proprietary,
        qty: 2 + (no % 5) * 3,
        uom: 'EA',
      })
      summaries.push({
        no,
        description: `${description} ${no}`,
        qty: `${2 + (no % 5) * 3} EA`,
        trade,
      })
    }
  const input: QualifyInput = {
    sender: {
      email: 'buyer@sample-client.example.test',
      domain: 'sample-client.example.test',
      freeMail: false,
      domainAgeDays: 3000,
      domainRegisteredYear: 2018,
      domainMatchesName: true,
      websiteReachable: true,
      registryFound: true,
      companyName: 'Sample Client LLC',
      ...c.sender,
    },
    links: c.links ?? { suspicious: 0, hosts: [] },
    history: { messages: 0, enquiries: 0, quotations: 0, orders: 0, ...c.history },
    lines,
    value: c.value ?? null,
    workingDaysLeft: c.workingDaysLeft === undefined ? 6 : c.workingDaysLeft,
    deadlineLabel: c.workingDaysLeft === null ? null : 'Thu 3 Dec, 12:00',
    supplierReplyDays: 2,
  }
  return {
    enquiryId: c.id,
    ref: `ENQ-EVAL-${c.id}`,
    stage: 'new',
    input,
    lineSummaries: summaries,
    version: c.id,
  }
}

export interface QualifyScore {
  total: number
  correct: number
  accuracy: number
  spamMissed: number
  wrong: Array<{ id: string; got: string }>
  passes: boolean
}

export const QUALIFY_BARS = { accuracy: 0.9, spamMissed: 0 } as const

export function scoreQualify(
  cases: readonly QualifyCase[],
  got: ReadonlyMap<string, { legitimacy: string; path: string } | null>
): QualifyScore {
  let correct = 0
  let spamMissed = 0
  const wrong: QualifyScore['wrong'] = []
  for (const c of cases) {
    const g = got.get(c.id) ?? null
    const ok =
      !!g && g.legitimacy === c.expect.legitimacy && c.expect.paths.includes(g.path as QualifyPath)
    if (c.expect.legitimacy === 'spam' && g?.legitimacy !== 'spam') spamMissed += 1
    if (ok) correct += 1
    else wrong.push({ id: c.id, got: g ? `${g.legitimacy} · ${g.path}` : 'no answer' })
  }
  const accuracy = cases.length ? correct / cases.length : 1
  return {
    total: cases.length,
    correct,
    accuracy,
    spamMissed,
    wrong,
    passes: accuracy >= QUALIFY_BARS.accuracy && spamMissed === QUALIFY_BARS.spamMissed,
  }
}
