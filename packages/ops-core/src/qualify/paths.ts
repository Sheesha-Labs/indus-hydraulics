import type { QualifyPath, ReadConfidence } from './verdict'

/**
 * The path cards on board 167 and 171b state 2 (S09-T06). Pure: the words come from the read's facts, so the
 * card says what each choice does to these lines. A person chooses; nothing is sent on choose.
 */
export interface PathFacts {
  lineNos: readonly number[]
  regretLineNos: readonly number[]
  askLineNos: readonly number[]
  proprietaryNos: readonly number[]
  outsideNos: readonly number[]
  /** "28 Sep", or null without a client deadline. */
  deadline: string | null
  suggested: QualifyPath
  pathConfidence: ReadConfidence
  realBuyerQuestion: boolean
}

export interface PathCard {
  path: QualifyPath
  title: string
  sub: string
  /** "Suggested · Likely" on the suggested card. */
  tag: string | null
}

const CONF: Record<ReadConfidence, string> = { sure: 'Sure', likely: 'Likely', unsure: 'Unsure' }

/** "1–13", "12–13", "3, 5 and 9": runs collapse to ranges. */
export function lineRange(nos: readonly number[]): string {
  const s = [...new Set(nos)].sort((a, b) => a - b)
  const runs: string[] = []
  for (let i = 0; i < s.length;) {
    let j = i
    while (j + 1 < s.length && s[j + 1] === s[j]! + 1) j++
    runs.push(j > i ? `${s[i]}–${s[j]}` : String(s[i]))
    i = j + 1
  }
  return runs.length <= 1 ? (runs[0] ?? '') : `${runs.slice(0, -1).join(', ')} and ${runs.at(-1)}`
}

const lines = (nos: readonly number[]) => `${nos.length === 1 ? 'Line' : 'Lines'} ${lineRange(nos)}`
const isAre = (nos: readonly number[]) => (nos.length === 1 ? 'is' : 'are')

export const PATH_TITLE: Record<QualifyPath, string> = {
  quote_fully: 'Quote fully',
  quote_partial: 'Quote what we can, regret the rest',
  ask_client_first: 'Ask the client first',
  regret: 'Regret politely',
  ignore_spam: 'Ignore (spam)',
}

export function pathCards(f: PathFacts): PathCard[] {
  const n = f.lineNos.length
  const keep = f.lineNos.filter((x) => !f.regretLineNos.includes(x))
  const regret = f.regretLineNos.length ? f.regretLineNos : f.outsideNos
  const prop = f.proprietaryNos.filter((x) => !regret.includes(x))
  const sub: Record<QualifyPath, string> = {
    quote_fully: f.realBuyerQuestion
      ? 'Treat as a normal enquiry'
      : `Ask suppliers for all ${n} line${n === 1 ? '' : 's'}.` +
        (f.outsideNos.length
          ? ` ${lines(f.outsideNos)} ${f.outsideNos.length === 1 ? 'has' : 'have'} no supplier on file${f.deadline ? ' and would stay open past the deadline' : ''}`
          : ''),
    quote_partial: regret.length
      ? `RFQs for ${keep.length === 1 ? 'line' : 'lines'} ${lineRange(keep)} go today. ${lines(regret)} ${isAre(regret)} regretted to the client.` +
        (prop.length && f.deadline
          ? ` ${lines(prop)} go as “to follow” if OEM prices miss ${f.deadline}`
          : '')
      : 'Source the lines that fit and regret the rest, line by line',
    ask_client_first: f.realBuyerQuestion
      ? 'Request company details and a delivery address before sourcing'
      : f.askLineNos.length
        ? `Ask about ${lines(f.askLineNos).toLowerCase()} before sourcing them. Only those lines are held`
        : 'Ask the client before sourcing. The lines wait for the answers',
    regret: 'Decline the whole enquiry with the regret email. The record closes as Regretted',
    ignore_spam: 'File the email as Not business. No reply and no record',
  }
  // 171b state 2 offers two paths and "Something else"; the full list is behind it.
  const order: QualifyPath[] = f.realBuyerQuestion
    ? ['ask_client_first', 'quote_fully', 'quote_partial', 'regret', 'ignore_spam']
    : ['quote_fully', 'quote_partial', 'ask_client_first', 'regret', 'ignore_spam']
  return order.map((path) => ({
    path,
    title: PATH_TITLE[path],
    sub: sub[path],
    tag:
      path === f.suggested && !f.realBuyerQuestion ? `Suggested · ${CONF[f.pathConfidence]}` : null,
  }))
}

/** "On choose · …" under the cards: what the Assistant drafts next. Nothing is sent on choose. */
export function onChooseText(
  path: QualifyPath,
  f: Pick<PathFacts, 'regretLineNos' | 'askLineNos'>
): string {
  switch (path) {
    case 'quote_fully':
      return 'the enquiry moves to Sourcing and the supplier RFQs are drafted for Review. Nothing is sent yet.'
    case 'quote_partial':
      return `the Assistant drafts the regret for ${lines(f.regretLineNos).toLowerCase()} to Review, and the enquiry moves to Sourcing for the rest. Nothing is sent yet.`
    case 'ask_client_first':
      return `the Assistant drafts the questions to the client${f.askLineNos.length ? ` and holds ${lines(f.askLineNos).toLowerCase()}` : ''}, to Review. Nothing is sent yet.`
    case 'regret':
      return 'the Assistant drafts the regret email to Review, with a reason. Nothing is sent yet.'
    case 'ignore_spam':
      return 'the email is filed as Not business and the enquiry closes as spam, with 5 minutes to undo. No reply goes out.'
  }
}
